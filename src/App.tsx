import { useState, useEffect } from 'react';
import AvatarAnimation, { ChatPanel } from './components/index.js';
import Portfolio from './Portfolio.js';

/* Data */
const data = (await import('./data.js')).knowledge;

function gotoPortfolio(setView: (v: 'chat' | 'portfolio') => void) {
  setView('portfolio');
  setTimeout(() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' }), 0);
}

type Theme = 'light' | 'dark';

export default function App() {
  const [running, setRunning] = useState(false);
  const [view, setView] = useState<'chat' | 'portfolio'>('chat');
  const [theme, setTheme] = useState<Theme>(() =>
    (localStorage.getItem('eric_theme') as Theme) ||
    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
  );

  useEffect(() => {
    const saved = localStorage.getItem('eric_view');
    if (saved === 'portfolio') setView('portfolio');
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('eric_theme', theme);
  }, [theme]);

  const setAndPersist = (v: 'chat' | 'portfolio') => {
    setView(v);
    localStorage.setItem('eric_view', v);
  };

  const contact = data.profile.contact;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--ink)', overflowX: 'hidden' }}>

      {/* ── TOP BAR ── */}
      <div className="wrap" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '1.25rem', paddingBottom: '1rem' }}>
        <span style={{ fontFamily: "'Erode', system-ui, sans-serif", fontWeight: 600, letterSpacing: '-0.02em', fontSize: '1rem' }}>
          Eric.exe
        </span>
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          className="btn-ghost"
          style={{ width: '2.25rem', height: '2.25rem', padding: 0, fontSize: '1rem' }}
        >
          {theme === 'dark' ? '☀' : '☾'}
        </button>
      </div>

      {/* ── HERO ── the page is Eric himself; the desk only lives in the chat view ── */}
      <header className="wrap" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2.5rem', paddingTop: '2rem', paddingBottom: '3.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <img
            data-hero-move
            src="/avatar.png"
            alt="Eric — hand-drawn portrait"
            width="1400"
            height="700"
            style={{ width: 'min(80vw, 560px)', height: 'auto', display: 'block', borderRadius: '14px', border: '1px solid var(--line-strong)' }}
          />
        </div>

        <div style={{ textAlign: 'center', maxWidth: '56ch', margin: '0 auto' }}>
          <h1 style={{
            fontFamily: "'Erode', system-ui, sans-serif",
            fontSize: 'clamp(2.25rem, 5vw, 3.75rem)',
            lineHeight: 1.02,
            letterSpacing: '-0.03em',
            margin: '0 0 1rem',
            color: 'var(--ink)',
          }}>
            Hi, I'm Eric.
          </h1>

          <p style={{
            fontFamily: "'Erode', system-ui, sans-serif",
            fontSize: 'clamp(1.0625rem, 1.4vw, 1.25rem)',
            letterSpacing: '-0.01em',
            lineHeight: 1.45,
            color: 'var(--muted)',
            margin: '0 0 2.25rem',
          }}>
            Backend &amp; AI developer, formerly a nurse.
            This site is my digital twin — ask the desk, or read what's below.
          </p>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => {
                setAndPersist('chat');
                setTimeout(() => document.getElementById('chat-panel')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
              }}
              className="btn-primary"
              style={{ fontSize: '0.9375rem', padding: '0.7rem 1.5rem' }}
            >
              Ask the desk
            </button>
            <button
              onClick={() => gotoPortfolio(setView)}
              className="btn-ghost"
              style={{ fontSize: '0.9375rem', padding: '0.7rem 1.5rem' }}
            >
              See my work
            </button>
          </div>
        </div>
      </header>

      {/* ── BODY ── */}
      <main className="wrap" style={{ paddingTop: '1rem', paddingBottom: '4rem' }}>
        {view === 'chat' ? (
          <>
            <div id="chat-panel" className="scroll-mt-24" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '2rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <h2 className="section-title" style={{ fontSize: 'clamp(1.25rem, 1.8vw, 1.5rem)', margin: 0 }}>
                Talk to Eric
              </h2>
              <p style={{ fontSize: '0.875rem', color: 'var(--muted)', margin: 0 }}>
                Local AI · WebGPU · No server
              </p>
            </div>
            <div className="chat-layout">
              <aside className="chat-aside">
                <AvatarAnimation running={running} />
                <p style={{ fontSize: '0.9375rem', color: 'var(--muted)', marginTop: '1rem', lineHeight: 1.6 }}>
                  This desk is my digital twin — a local LLM that answers as me.
                </p>
                <p style={{ fontSize: '1rem', color: 'var(--ink)', marginTop: '0.75rem', lineHeight: 1.55 }}>
                  Ask about nursing training, AI work, or how the two meet.
                </p>
              </aside>

              <section>
                <ChatPanel
                  onGenerationStart={() => setRunning(true)}
                  onGenerationEnd={() => setRunning(false)}
                />
                <p style={{ fontSize: '0.9375rem', color: 'var(--muted)', marginTop: '1rem', lineHeight: 1.6, maxWidth: '48ch' }}>
                  The model runs entirely on your device — no data leaves your browser.
                  Ask about nursing, AI projects, or the transition between the two.
                </p>
              </section>
            </div>
          </>
        ) : (
          <Portfolio onBack={() => setAndPersist('chat')} data={data} />
        )}
      </main>

      {/* ── FOOTER ── */}
      <footer style={{
        paddingInline: 'var(--margin)',
        paddingTop: '3rem',
        paddingBottom: '2.5rem',
        borderTop: '1px solid var(--line)',
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '2rem', alignItems: 'end' }}>
          <div>
            <h2
              data-wordmark
              style={{ fontFamily: "'Erode', system-ui, sans-serif", fontSize: '1.875rem', fontWeight: 500, marginBottom: '0.4rem', color: 'var(--ink)' }}
            >
              Eric.exe
            </h2>
            <p style={{ fontSize: '0.8125rem', color: 'var(--muted)', maxWidth: '30ch', lineHeight: 1.6 }}>
              A static site. All AI runs locally in your browser via WebGPU.
            </p>
          </div>
          <nav style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', fontSize: '0.875rem' }}>
            {[
              { label: 'About',  href: '#about',    onClick: () => gotoPortfolio(setView) },
              { label: 'Work',   href: '#projects', onClick: () => gotoPortfolio(setView) },
              { label: 'GitHub', href: contact.github,        target: '_blank' },
              { label: 'Email',  href: `mailto:${contact.email}` },
            ].map(({ label, href, onClick, target }) => (
              <a
                key={label}
                href={href}
                onClick={onClick}
                target={target as '_blank' | undefined}
                rel={target === '_blank' ? 'noopener noreferrer' : undefined}
                style={{ color: 'var(--ink)', textDecoration: 'none' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--ink)')}
              >
                {label}
              </a>
            ))}
          </nav>
        </div>
      </footer>
    </div>
  );
}
