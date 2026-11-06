import { useState } from 'react';
import type { Knowledge, Project, FAQ, Experience } from './types.js';

interface PortfolioProps {
  onBack: () => void;
  data: Knowledge;
}

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24">
      <h3 className="section-title text-xl font-medium mb-10">{title}</h3>
      {children}
    </section>
  );
}

export default function Portfolio({ onBack, data }: PortfolioProps) {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="space-y-[120px]">
      <button onClick={onBack} className="text-sm text-[var(--muted)] hover:text-[var(--ink)] transition-colors">
        ← Back to chat
      </button>

      {/* ABOUT — statement paragraph, three short facts */}
      <Section id="about" title="About">
        <div className="grid md:grid-cols-12 gap-8">
          <div className="md:col-span-8">
            <p className="text-[clamp(1.5rem,2.4vw,2.375rem)] leading-[1.25] max-w-2xl" data-reveal style={{ fontFamily: "'Erode', system-ui, sans-serif" }}>
              {data.profile.tagline}
            </p>
          </div>
          <div className="md:col-span-4 flex md:flex-col gap-6 pt-2" data-reveal>
            <Fact label="Based in" value="Taipei, Taiwan" />
            <Fact label="Role" value="Backend / AI" />
            <Fact label="GitHub" value="EricTung1007" href={data.profile.contact.github} />
            <Fact label="ORCID" value="0009-0001-6245-4935" href={data.profile.contact.orcid} />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-5 mt-16">
          {data.experience.map((ex: Experience, i: number) => (
            <article key={i} className="card space-y-2" data-reveal data-stagger>
              <div className="flex flex-wrap items-baseline gap-2">
                <h4 className="font-medium text-[var(--ink)]">{ex.company}</h4>
                <span className="text-sm text-[var(--muted)]">{ex.role} · {ex.period}</span>
              </div>
              <ul className="space-y-1">
                {(ex.achievements ?? []).map((a: string, j: number) => (
                  <li key={j} className="text-sm text-[var(--muted)]">{a}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </Section>

      {/* WORK — each project as a quiet exhibit */}
      <Section id="projects" title="Selected work">
        <div className="space-y-5">
          {data.projects.map((p: Project, i: number) => (
            <article key={i} className="card space-y-3" data-reveal data-stagger>
              <div className="flex flex-wrap items-baseline gap-3">
                <h4 className="text-lg font-medium text-[var(--ink)]">{p.title}</h4>
                {p.year && <span className="text-sm text-[var(--muted)]">{p.year}</span>}
              </div>
              <p className="text-sm text-[var(--muted)]">{p.role}</p>
              <ul className="space-y-1">
                {(p.description ?? []).map((d: string, j: number) => (
                  <li key={j} className="text-sm text-[var(--muted)]">{d}</li>
                ))}
              </ul>
              <div className="flex flex-wrap gap-2">
                {(p.stack ?? []).map((s: string) => (
                  <span key={s} className="text-xs text-[var(--muted)] border border-[var(--line-strong)] rounded-full px-2.5 py-1">{s}</span>
                ))}
              </div>
              <a href={p.link} target="_blank" rel="noopener noreferrer" className="inline-block text-sm text-[var(--accent)] hover:opacity-70 transition-opacity">
                View on GitHub →
              </a>
            </article>
          ))}
        </div>
      </Section>

      {/* PUBLICATIONS */}
      {data.publications && data.publications.length > 0 && (
        <Section id="publications" title="Publications">
          <div className="space-y-4 max-w-2xl">
            {data.publications.map((pub, i) => (
              <div key={i} className="flex items-baseline gap-3" data-reveal data-stagger>
                <span className="text-sm text-[var(--muted)] shrink-0">{pub.year}</span>
                <div>
                  <a href={pub.doi} target="_blank" rel="noopener noreferrer" className="text-[var(--ink)] hover:text-[var(--accent)] transition-colors">
                    {pub.title}
                  </a>
                  <span className="text-sm text-[var(--muted)]"> · {pub.journal}</span>
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* FAQ — accordion */}
      <Section id="faq" title="Frequently asked">
        <div className="space-y-3 max-w-2xl">
          {data.faqs.map((f: FAQ, i: number) => (
            <details key={i} open={openFaq === i} onChange={(e) => setOpenFaq(e.currentTarget.open ? i : null)} className="border-l pl-4" data-reveal style={{ borderColor: 'var(--line-strong)' }}>
              <summary className="flex cursor-pointer items-center justify-between gap-3 font-medium text-[var(--ink)] list-none">
                <span>{f.q}</span>
                <span className="text-[var(--accent)] text-xl leading-none">{openFaq === i ? '−' : '+'}</span>
              </summary>
              <div className="mt-3 space-y-2 text-sm">
                <p className="text-[var(--muted)]">{f.a_en}</p>
                {f.a_zh && <p className="text-sm text-[var(--muted)]/70">{f.a_zh}</p>}
              </div>
            </details>
          ))}
        </div>
      </Section>
    </div>
  );
}

function Fact({ label, value, href }: { label: string; value: string; href?: string }) {
  const inner = (
    <span>
      <span className="block text-xs uppercase tracking-wide text-[var(--muted)]">{label}</span>
      <span className="text-sm text-[var(--ink)]">{value}</span>
    </span>
  );
  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className="text-sm text-[var(--ink)] hover:opacity-70 transition-opacity">{inner}</a>
    );
  }
  return <span className="text-sm text-[var(--ink)]">{inner}</span>;
}
