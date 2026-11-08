import { useEffect, useState } from 'react';
import { ChatPanel } from './components/ChatPanel.js';
import JawAnimation from './components/JawAnimation.js';
import { Giscus } from './components/Giscus.js';
import { knowledge } from './data.js';
import { posts, getPost } from './posts.js';
import './motion.js';
import './index.css';

type View = 'chat' | 'portfolio' | `post:${string}`;

const LINKS = {
  github: knowledge.profile.contact.github,
  linkedin: knowledge.profile.contact.linkedin,
  orcid: knowledge.profile.contact.orcid,
  email: `mailto:${knowledge.profile.contact.email}`,
};

function SocialButtons() {
  return (
    <div className="social-row">
      <a className="social-btn" href={LINKS.linkedin} target="_blank" rel="noreferrer">
        <svg viewBox="0 0 24 24"><path d="M4.98 3.5C4.98 4.88 3.87 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5zM.2 8h4.6v14H.2zM8.2 8h4.4v1.9h.06c.6-1.1 2.1-2.3 4.3-2.3 4.6 0 5.4 3 5.4 6.9V22h-4.6v-6.6c0-1.6 0-3.6-2.2-3.6s-2.6 1.7-2.6 3.5V22H8.2z"/></svg>
        LinkedIn
      </a>
      <a className="social-btn" href={LINKS.orcid} target="_blank" rel="noreferrer">
        <svg viewBox="0 0 24 24"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.6 0 12 0zM8.1 17.6H6.4V7.4h1.7v10.2zM7.2 6.2c-.6 0-1-.4-1-1s.4-1 1-1 1 .4 1 1-.4 1-1 1zm9.4 11.4h-1.7v-4.9c0-1.3-.5-2.2-1.7-2.2-1 0-1.5.7-1.8 1.3-.1.2-.1.5-.1.8v5h-1.7V7.4h1.7v1.5c.2-.4.8-1.7 2.5-1.7 1.8 0 3.3 1.2 3.3 3.8v6.6z"/></svg>
        ORCID
      </a>
      <a className="social-btn" href={LINKS.github} target="_blank" rel="noreferrer">
        <svg viewBox="0 0 24 24"><path d="M12 .5C5.7.5.5 5.7.5 12c0 5.1 3.3 9.4 7.9 10.9.6.1.8-.2.8-.5v-2c-3.2.7-3.9-1.4-3.9-1.4-.5-1.3-1.3-1.7-1.3-1.7-1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.7 1.3 3.4 1 .1-.8.4-1.3.7-1.6-2.6-.3-5.3-1.3-5.3-5.7 0-1.3.4-2.3 1.2-3.1-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0C17.3 4.7 18.3 5 18.3 5c.6 1.6.2 2.8.1 3.1.8.8 1.2 1.8 1.2 3.1 0 4.4-2.7 5.4-5.3 5.7.4.4.8 1.1.8 2.2v3.2c0 .3.2.6.8.5 4.6-1.5 7.9-5.8 7.9-10.9C23.5 5.7 18.3.5 12 .5z"/></svg>
        GitHub
      </a>
    </div>
  );
}

function Hero({ view, setView }: { view: View; setView: (v: View) => void }) {
  return (
    <header className="hero">
      <div className="hero-rail">
        <h1>
          I build software
          <br />
          that <span className="hl">holds up</span>.
        </h1>
        <p className="hero-sub">
          Software engineer — backend, AI, and the systems that keep them running.
          I ship things that work, not things that demo.
        </p>
        <div className="hero-actions">
          <button className="btn btn-primary" onClick={() => setView('chat')}>Ask the desk</button>
          <a className="btn btn-ghost" href="#work">See my work</a>
        </div>
      </div>
    </header>
  );
}

function BlogList({ setView }: { setView: (v: View) => void }) {
  return (
    <section className="section">
      <h2>Writing</h2>
      <ul className="post-list">
        {posts.map((p) => (
          <li key={p.slug}>
            <a className="post-link" href="#" onClick={(e) => { e.preventDefault(); setView(`post:${p.slug}`); }}>
              <div className="post-title">{p.title}</div>
              <div className="post-meta">{p.date}</div>
              <div className="post-excerpt">{p.excerpt}</div>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

function BlogPost({ slug, theme, setView }: { slug: string; theme: string; setView: (v: View) => void }) {
  const post = getPost(slug);
  if (!post) return <section className="section"><h2>Not found</h2></section>;
  return (
    <article className="section">
      <a className="back-link" href="#" onClick={(e) => { e.preventDefault(); setView('portfolio'); }}>← All writing</a>
      <h2>{post.title}</h2>
      <div className="post-date">{post.date}</div>
      <div className="post-body" dangerouslySetInnerHTML={{ __html: renderMarkdown(post.body) }} />
      <div className="giscus-wrap">
        <h3>Comments</h3>
        <Giscus mapping="specific" theme={theme as 'light' | 'dark'} />
      </div>
    </article>
  );
}

/* Minimal Markdown → HTML (paragraphs, h2, lists, code, links). Good enough for two posts. */
function renderMarkdown(md: string): string {
  const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const inline = (s: string) =>
    esc(s)
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer">$1</a>');
  const lines = md.split('\n');
  let html = '';
  let inList = false;
  let inCode = false;
  for (const line of lines) {
    if (line.startsWith('```')) {
      if (inCode) { html += '</code></pre>'; inCode = false; }
      else { html += '<pre><code>'; inCode = true; }
      continue;
    }
    if (inCode) { html += esc(line) + '\n'; continue; }
    if (line.startsWith('## ')) {
      if (inList) { html += '</ul>'; inList = false; }
      html += `<h2>${inline(line.slice(3))}</h2>`;
    } else if (line.startsWith('- ')) {
      if (!inList) { html += '<ul>'; inList = true; }
      html += `<li>${inline(line.slice(2))}</li>`;
    } else if (line.trim() === '') {
      if (inList) { html += '</ul>'; inList = false; }
    } else {
      if (inList) { html += '</ul>'; inList = false; }
      html += `<p>${inline(line)}</p>`;
    }
  }
  if (inList) html += '</ul>';
  if (inCode) html += '</code></pre>';
  return html;
}

function Portfolio({ theme, setView }: { theme: string; setView: (v: View) => void }) {
  const { profile, experience, projects, education, skills, publications } = knowledge;
  return (
    <main>
      {/* about */}
      <section className="section">
        <h2>About</h2>
        <p className="lede">
          I'm a software engineer with a <span className="hl">nursing background</span> — I spent
          four years at NTU learning how clinical systems actually work before I started building
          them. That background shapes everything I do: <span className="hl">data privacy is a
          default, not a feature</span>, and I design for the people on the other side of the
          screen, not the other way around.
        </p>
        <dl className="facts">
          <div className="fact"><dt>Education</dt><dd>{education.map((e) => `${e.institution}, ${e.degree}`).join(' · ')}</dd></div>
          <div className="fact"><dt>Publications</dt><dd>{(publications ?? []).map((p) => `${p.journal} ${p.year}`).join(' · ')}</dd></div>
          <div className="fact"><dt>Focus</dt><dd>{(skills.ai_tools ?? []).slice(0, 5).join(', ')}</dd></div>
          <div className="fact"><dt>Download</dt><dd><a href="CV.pdf" download>CV (PDF)</a></dd></div>
        </dl>
      </section>

      {/* work */}
      <section className="section">
        <h2>Work</h2>
        <ul className="ledger">
          {experience.map((e) => (
            <li className="ledger-item" key={e.company}>
              <div>
                <div className="ledger-role">{e.role}</div>
                <div className="ledger-company">{e.company}</div>
              </div>
              <div className="ledger-period">{e.period}</div>
              <div className="ledger-notes">{(e.achievements ?? []).slice(0, 2).join(' ')}</div>
            </li>
          ))}
        </ul>
        <h2 style={{ marginTop: 56 }}>Projects</h2>
        <ul className="ledger">
          {projects.map((p) => (
            <li className="ledger-item" key={p.title}>
              <div className="ledger-role">{p.title}</div>
              <div className="ledger-notes">{p.description.join(' ')}</div>
            </li>
          ))}
        </ul>
      </section>

      {/* writing */}
      <BlogList setView={setView} />

      {/* cta */}
      <section className="cta">
        <h2>Let's build something that works.</h2>
        <div className="cta-actions">
          <a className="btn btn-primary" href={LINKS.email}>Email me</a>
          <a className="btn btn-ghost" href="CV.pdf" download>Download CV</a>
        </div>
      </section>
    </main>
  );
}

export default function App() {
  const [view, setViewRaw] = useState<View>(() => {
    const saved = localStorage.getItem('eric_view');
    return saved === 'chat' || saved === 'portfolio' ? saved : 'portfolio';
  });
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('eric_theme') as 'light' | 'dark' | null;
    if (saved) return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('eric_theme', theme);
  }, [theme]);

  const setView = (v: View) => {
    setViewRaw(v);
    localStorage.setItem('eric_view', v.startsWith('post:') ? 'portfolio' : v);
    window.scrollTo({ top: 0 });
  };

  const isChat = view === 'chat';
  const isPost = view.startsWith('post:');

  return (
    <>
      <div className="topbar">
        <a className="wordmark" href="#" onClick={(e) => { e.preventDefault(); setView('portfolio'); }}>eric.exe</a>
        <div className="topbar-actions">
          <button className="theme-toggle" onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} aria-label="Toggle theme">
            {theme === 'light' ? '◐' : '◑'}
          </button>
        </div>
      </div>

      {isChat ? (
        <div className="chat-layout">
          <ChatPanel onGenerationStart={() => {}} onGenerationEnd={() => {}} />
          <aside className="chat-aside">
            <JawAnimation running={false} />
            <p>Runs entirely on your GPU. Nothing you type leaves this page.</p>
          </aside>
        </div>
      ) : (
        <>
          <Hero view={view} setView={setView} />
          {isPost ? (
            <BlogPost slug={view.slice(5)} theme={theme} setView={setView} />
          ) : (
            <Portfolio theme={theme} setView={setView} />
          )}
          <footer className="footer">
            <p>© 2026 Eric Tung · Built with React, WebGPU, and a lot of coffee.</p>
            <SocialButtons />
          </footer>
        </>
      )}
    </>
  );
}
