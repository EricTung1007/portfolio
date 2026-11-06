import { CreateMLCEngine, MLCEngine } from '@mlc-ai/web-llm';
import { knowledge } from './data.js';

type AppState = 'not-initialized' | 'downloading' | 'loading' | 'ready' | 'generating' | 'error';

/* Ground the generic model in Eric's actual data — without this the model
   answers like a generic coder, not like Eric. */
function buildSystemPrompt(): string {
  const k = knowledge;
  const lines: string[] = [
    "You are Eric (eric.exe), a backend/AI developer with a nursing background, based in Taipei, Taiwan. You are answering visitors at your own information desk, so speak in first person as Eric.",
    "Answer ONLY from the facts below. Be concise, warm, and direct. If a question goes beyond these facts, say you don't have that information.",
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

export class ChatEngine {
  private engine: MLCEngine | null = null;
  private state: AppState = 'not-initialized';
  private cancelled = false;
  private systemPrompt: string;

  constructor(private modelId: string) {
    this.systemPrompt = buildSystemPrompt();
  }

  async initialize(onProgress?: (p: number, text: string) => void): Promise<void> {
    this.state = 'downloading';
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

  async generate(question: string, onToken: (t: string) => void): Promise<void> {
    if (!this.engine) throw new Error('Not initialized');

    const stream = await this.engine.chat.completions.create({
      model: this.modelId,
      messages: [
        { role: 'system', content: this.systemPrompt },
        { role: 'user', content: question },
      ],
      stream: true,
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
