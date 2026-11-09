import { CreateMLCEngine, MLCEngine, prebuiltAppConfig } from '@mlc-ai/web-llm';
import { knowledge } from './data.js';
import { resumeText } from './resume.generated.js';

export type ChatLanguage = 'en' | 'zh';

type AppState = 'not-initialized' | 'downloading' | 'loading' | 'ready' | 'generating' | 'error';

/* Ground the generic model in Eric's actual data — without this the model
   answers like a generic coder, not like Eric. */
function buildSystemPrompt(language: ChatLanguage, question: string): string {
  const k = knowledge;
  const lines: string[] = [
    "You are the AI information desk of Eric Tung (eric.exe). You are NOT Eric himself. Explain information about Eric using third-person language, never pretend to be Eric.",
    "Use only grounded evidence given below. Do not invent relatives, family, credentials, institutions, or personal details. Say 'Not verified in the published record' when unsure.",
    language === 'zh' ? 'Respond exclusively in Traditional Chinese, even if evidence is English.' : 'Respond exclusively in English.',
    "",
    "CURRENT RESUME (canonical PDF for readers):",
    "https://github.com/EricTung1007/portfolio/raw/refs/heads/main/public/CV.pdf",
    resumeText ? "CV text extracted from the checked-in PDF at build time follows." : "No extractable resume text available in this build; do not claim to have read the PDF.",
    // Keep the relevant CV snippets within a small browser-model context budget.
    ...selectResumeEvidence(question),
    "",
    "PROFILE:",
    `${k.profile.name} — ${k.profile.tagline}`,
    `Contact: ${k.profile.contact.email} · ${k.profile.contact.github} · ${k.profile.contact.linkedin} · ORCID: ${k.profile.contact.orcid ?? ''}`,
    "",
    "EDUCATION:",
    ...k.education.flatMap((e) => [
      `${e.institution} — ${e.degree}${e.location ? ` (${e.location})` : ''}`,
      ...(e.details ?? []).map((d) => `  - ${d}`),
    ]),
    "",
    "EXPERIENCE:",
    ...k.experience.flatMap((e) => [
      `${e.company} — ${e.role} (${e.period})`,
      ...(e.achievements ?? []).map((a) => `  - ${a}`),
    ]),
    "",
    "SKILLS:",
    `Core: ${k.skills.core?.join(', ')}`,
    `Backend/data: ${k.skills.backend_data?.join(', ')}`,
    `AI/tools: ${k.skills.ai_tools?.join(', ')}`,
    `Working familiarity: ${k.skills.working_familiarity?.join(', ')}`,
    "",
    "PROJECTS:",
    ...k.projects.flatMap((p) => [
      `${p.title} (${p.role}${p.year ? `, ${p.year}` : ''})`,
      ...p.description.map((d) => `  - ${d}`),
      `  Stack: ${p.stack.join(', ')}`,
      `  Link: ${p.link}`,
    ]),
    "",
    ...(k.publications?.length ? [
      "PUBLICATIONS:",
      ...k.publications.map((p) => `${p.year} — ${p.title}, ${p.journal} (DOI: ${p.doi})`),
      "",
    ] : []),
    "FAQS (approved answers, reuse them when asked similarly):",
    ...k.faqs.flatMap((f) => [`Q: ${f.q}`, `A: ${f.a_en}`]),
  ];
  return lines.join('\n');
}

function selectResumeEvidence(question: string): string[] {
  const terms = question.toLowerCase().split(/[^a-z0-9\u4e00-\u9fff]+/).filter(t => t.length > 2);
  const lines = resumeText.split(/\n/).map(x => x.trim()).filter(Boolean);
  const ranked = lines.map((line, index) => ({
    line, index, score: terms.reduce((score, term) => score + (line.toLowerCase().includes(term) ? 1 : 0), 0),
  })).sort((a,b) => b.score-a.score || a.index-b.index);
  return ranked.slice(0, 13).sort((a,b) => a.index-b.index).map(v => v.line.slice(0,180));
}

export class ChatEngine {
  private engine: MLCEngine | null = null;
  private state: AppState = 'not-initialized';
  private cancelled = false;

  constructor(private modelId: string) {}

  async initialize(onProgress?: (p: number, text: string) => void): Promise<void> {
    this.state = 'downloading';
    const supported = prebuiltAppConfig.model_list.map(m => m.model_id);
    const actualModel = supported.includes(this.modelId) ? this.modelId : undefined;
    if (!actualModel) throw new Error('The selected lightweight model is not included in this WebLLM build. No larger model will be downloaded automatically.');
    this.modelId = actualModel;
    this.engine = await CreateMLCEngine(this.modelId, {
      initProgressCallback: (info) => {
        if (this.cancelled) return;
        this.state = 'downloading';
        onProgress?.(Math.round((info.progress ?? 0) * 100), info.text ?? '');
      },
    });

    if (this.cancelled) return;
    this.state = 'ready';
  }

  async generate(question: string, onToken: (t: string) => void, language: ChatLanguage = 'en'): Promise<void> {
    if (!this.engine) throw new Error('Not initialized');

    // Sensitive facts are not present in the maintained profile: never delegate these to a generative model.
    if (/\b(gender|sex|pronouns?|male|female|man|woman|boy|girl|birthday|birth date|how old|married|marital status)\b|性別|男女|男生|女生|幾歲|年齡|生日|出生日期|婚姻|代名詞/i.test(question)) {
      onToken(language === 'zh'
        ? '目前公開的個人資料未記載這項資訊，因此我不能替 Eric 推測。請參考履歷或直接聯絡本人確認。'
        : "Eric's published profile does not specify that information, so I won't guess. Please check his CV or contact him directly.");
      return;
    }
    const stream = await this.engine.chat.completions.create({
      model: this.modelId,
      messages: [
        { role: 'system', content: buildSystemPrompt(language, question) },
        { role: 'user', content: question },
      ],
      stream: true,
      temperature: 0.1,
      top_p: 0.75,
      max_tokens: 240,
    });

    for await (const chunk of stream) {
      const token = chunk.choices?.[0]?.delta?.content ?? '';
      if (token) onToken(token);
    }

    if (this.cancelled) {
      this.state = 'not-initialized';
      return;
    }

    this.state = 'ready';
  }

  cancel(): void {
    this.cancelled = true;
    this.state = 'not-initialized';
  }

  getState(): AppState { return this.state; }
}
