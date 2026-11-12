import { CreateMLCEngine, MLCEngine, prebuiltAppConfig } from '@mlc-ai/web-llm';
import { knowledge } from './data.js';
import { resumeText } from './resume.generated.js';

export type ChatLanguage = 'en' | 'zh';
type AppState = 'not-initialized' | 'downloading' | 'loading' | 'ready' | 'generating' | 'error';

/** A small browser model has a 4K-token context, not room for the entire portfolio.
 * Keep canonical records compact and rank the additional evidence by question.
 */
function selectResumeEvidence(question: string): string[] {
  const keywords = question.toLowerCase().match(/[a-z0-9]{3,}|[\u4e00-\u9fff]{2,}/g) ?? [];
  if (!keywords.length) return [];
  return resumeText.split(/\r?\n/).map(s => s.trim()).filter(Boolean)
    .map((line, index) => ({
      line: line.slice(0, 180),
      index,
      score: keywords.filter(term => line.toLowerCase().includes(term)).length,
    }))
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .slice(0, 5).sort((a, b) => a.index - b.index)
    .map(item => item.line);
}

function relevantRecords(question: string): string[] {
  const k = knowledge;
  const candidates = [
    ...k.projects.map(p => p.title + ' / ' + p.role + ' / ' + p.description.slice(0, 2).join(' / ')),
    ...k.experience.map(e => e.company + ' / ' + e.role + ' / ' + e.period),
    ...(k.publications ?? []).map(p => p.title + ' / ' + p.journal + ' / ' + p.year),
    ...k.faqs.map(f => f.q + ': ' + f.a_en),
  ];
  const keywords = question.toLowerCase().match(/[a-z0-9]{3,}|[\u4e00-\u9fff]{2,}/g) ?? [];
  return candidates.map((record, index) => ({
    record, index,
    score: keywords.filter(term => record.toLowerCase().includes(term)).length,
  })).filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .slice(0, 4).map(item => item.record.slice(0, 320));
}

function buildSystemPrompt(language: ChatLanguage, question: string): string {
  const k = knowledge;
  const lines = [
    'You operate the MARK I information recorder. You are not Eric; speak about Eric in third person.',
    'Answer with 1–3 concise sentences using ONLY verified source facts below.',
    'If no source supports the question, state that the information is not in the published record. Do not speculate.',
    'Never invent family, identity, education, employment, dates, quotations or project claims.',
    language === 'zh'
      ? 'You MUST answer in Traditional Chinese (繁體中文), not English or Simplified Chinese.'
      : 'You MUST answer in English.',
    'Do not repeat a sentence, phrase or bullet. Give the answer once, then stop.',
    'PROFILE: ' + k.profile.name + ' / ' + k.profile.tagline,
    'EDUCATION: ' + k.education.map(e => e.institution + ' / ' + e.degree).join('; ').slice(0, 400),
    'CONTACT: ' + k.profile.contact.email + ' / ' + k.profile.contact.github,
    'RELEVANT VERIFIED RECORDS:',
    ...relevantRecords(question),
    'RELEVANT CV EXCERPTS:',
    ...selectResumeEvidence(question),
  ];
  // Keep plenty of tokens available for the response and the user's question.
  return lines.join('\n').slice(0, 2900);
}

/** Detect exact repeating segments before they become a runaway stream.
 * This is a final line of defense, not a substitute for model sampling.
 */
export function isRepeatingResponse(text: string): boolean {
  const tail = text.toLowerCase().replace(/\s+/g, ' ').slice(-720).trim();
  if (tail.length < 36) return false;
  const limit = Math.min(160, Math.floor(tail.length / 2));
  for (let size = 8; size <= limit; size++) {
    const repeated = tail.slice(-size);
    if (size * 3 <= tail.length &&
        tail.slice(-size * 2, -size) === repeated &&
        tail.slice(-size * 3, -size * 2) === repeated) return true;
    if (size >= 45 &&
        tail.slice(-size * 2, -size) === repeated) return true;
  }
  return false;
}

export class ChatEngine {
  private engine: MLCEngine | null = null;
  private state: AppState = 'not-initialized';
  private cancelled = false;
  constructor(private modelId: string) {}

  async initialize(onProgress?: (p: number, text: string) => void): Promise<void> {
    this.cancelled = false;
    this.state = 'downloading';
    const supported = prebuiltAppConfig.model_list.map(m => m.model_id);
    if (!supported.includes(this.modelId)) {
      this.state = 'error';
      throw new Error('Selected model is unavailable in this browser runtime; no larger model will be loaded.');
    }
    this.engine = await CreateMLCEngine(this.modelId, {
      initProgressCallback: (info) => {
        if (this.cancelled) return;
        onProgress?.(Math.round((info.progress ?? 0) * 100), info.text ?? '');
      },
    });
    this.state = 'ready';
  }

  async generate(question: string, onToken: (t: string) => void, language: ChatLanguage = 'en'): Promise<void> {
    if (!this.engine) throw new Error('Not initialized');
    if (/\b(gender|sex|pronouns?|male|female|man|woman|boy|girl|birthday|birth date|how old|married|marital status)\b|性別|男女|男生|女生|幾歲|年齡|生日|出生日期|婚姻|代名詞/i.test(question)) {
      onToken(language === 'zh'
        ? '目前公開的個人資料沒有相關資訊，因此無法確認。請查看 Eric 的履歷或直接聯絡本人。'
        : "Eric's published records do not verify that detail. Please check his CV or contact him.");
      return;
    }
    this.state = 'generating';
    let output = '';
    try {
      const stream = await this.engine.chat.completions.create({
        model: this.modelId,
        messages: [
          { role: 'system', content: buildSystemPrompt(language, question) },
          { role: 'user', content: question },
        ],
        stream: true,
        extra_body: { enable_thinking: false },
        temperature: 0.9,
        top_p: 0.95,
        presence_penalty: 1.4,
        repetition_penalty: 1.05,
        max_tokens: 160,
      });
      for await (const chunk of stream) {
        if (this.cancelled) {
          await this.engine.interruptGenerate();
          break;
        }
        const token = chunk.choices?.[0]?.delta?.content ?? '';
        if (!token) continue;
        const next = output + token;
        if (next.length > 1100 || isRepeatingResponse(next)) {
          await this.engine.interruptGenerate();
          onToken(language === 'zh'
            ? '\n[已中止重複輸出，請換個方式提問。]'
            : '\n[Repetitive output stopped. Try rephrasing the question.]');
          break;
        }
        output = next;
        onToken(token);
      }
    } finally {
      this.state = this.cancelled ? 'not-initialized' : 'ready';
    }
  }

  cancel(): void {
    this.cancelled = true;
    void this.engine?.interruptGenerate();
    this.state = 'not-initialized';
  }
  getState(): AppState { return this.state; }
}
