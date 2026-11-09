import { useEffect, useState } from 'react';
import { ChatPanel } from './components/ChatPanel.js';
import JawAnimation from './components/JawAnimation.js';
import { Giscus } from './components/Giscus.js';
import { knowledge } from './data.js';
import { posts, getPost } from './posts.js';
import { renderMarkdown } from './markdown.js';
import './motion.js';
import './index.css';

type View = 'chat' | 'portfolio' | `post:${string}`;
type Language = 'en' | 'zh';

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

function Hero({ setView, language }: { setView: (v: View) => void; language: Language }) {
  return (
    <header className="hero">
      <div className="hero-rail">
        <img className="profile-avatar" src={`${import.meta.env.BASE_URL}avatar.png`} alt="Illustrated portrait of Eric" />
        <h1>
          {language === 'en' ? 'I build software' : '我打造'}
          <br />
          {language === 'en' ? <>that <span className="hl">holds up</span>.</> : <><span className="hl">可靠的軟體系統</span>。</>}
        </h1>
        <p className="hero-sub">
          {language === 'en'
            ? 'Software engineer, focused on backend, AI, and the systems that keep them running. I build things that work, not just demos.'
            : '軟體工程師，專注後端、AI 與系統可靠性。我的目標是開發真正可用，而不只是展示的產品。'}
        </p>
        <div className="hero-actions">
          <button className="btn btn-primary" onClick={() => setView('chat')}>{language === 'en' ? 'Ask the desk' : '詢問資訊台'}</button>
          <a className="btn btn-ghost" href="#/portfolio" onClick={(e) => { e.preventDefault(); setView("portfolio"); document.getElementById("work")?.scrollIntoView({ behavior: "smooth" }); }}>{language === 'en' ? 'See my work' : '查看作品'}</a>
        </div>
      </div>
    </header>
  );
}

function BlogList({ setView, language }: { setView: (v: View) => void; language: Language }) {
  return (
    <section className="section">
      <h2>{language === 'en' ? 'Writing' : '文章與開發紀錄'}</h2>
      <ul className="post-list">
        {posts.map((p) => (
          <li key={p.slug}>
            <a className="post-link" href={`#/writing/${encodeURIComponent(p.slug)}`} onClick={(e) => { e.preventDefault(); setView(`post:${p.slug}`); }}>
              <div className="post-title">{p.title}</div>
              <div className="post-meta">{p.date}{p.tags.length ? ` · ${p.tags.join(" · ")}` : ""}</div>
              <div className="post-excerpt">{p.excerpt}</div>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

function BlogPost({ slug, theme, setView, language }: { slug: string; theme: string; setView: (v: View) => void; language: Language }) {
  const post = getPost(slug);
  if (!post) return <section className="section"><h2>{language === 'en' ? 'Not found' : '找不到文章'}</h2></section>;
  return (
    <article className="section">
      <a className="back-link" href="#/portfolio" onClick={(e) => { e.preventDefault(); setView('portfolio'); }}>{language === 'en' ? '← All writing' : '← 返回文章列表'}</a>
      <h2>{post.title}</h2>
      <div className="post-date">{post.date}{post.tags.length ? ` · ${post.tags.join(" · ")}` : ""}</div>
      <div className="post-body" dangerouslySetInnerHTML={{ __html: renderMarkdown(post.body) }} />
      <div className="giscus-wrap">
        <h3>{language === 'en' ? 'Comments' : '留言'}</h3>
        <Giscus mapping="specific" term={`writing/${slug}`} theme={theme as 'light' | 'dark'} />
      </div>
    </article>
  );
}

function Portfolio({ theme, setView, language }: { theme: string; setView: (v: View) => void; language: Language }) {
  const { profile, experience, projects, education, skills, publications } = knowledge;
  return (
    <main>
      {/* about */}
      <section className="section">
        <h2>{language === 'en' ? 'About' : '關於我'}</h2>
        <p className="lede">{language === 'en'
          ? "I'm a software engineer with a nursing background. Clinical experience informs how I design reliable, privacy-conscious systems for real users."
          : '我是一名具有護理背景的軟體工程師。臨床經驗讓我重視系統可靠性、資料隱私，以及實際使用者的需求。'}</p>
        <dl className="facts">
          <div className="fact"><dt>{language === 'en' ? 'Education' : '教育背景'}</dt><dd>{education.map((e) => `${e.institution}, ${e.degree}`).join(' · ')}</dd></div>
          <div className="fact"><dt>{language === 'en' ? 'Publications' : '學術發表'}</dt><dd>{(publications ?? []).map((p) => `${p.journal} ${p.year}`).join(' · ')}</dd></div>
          <div className="fact"><dt>{language === 'en' ? 'Focus' : '技術方向'}</dt><dd>{(skills.ai_tools ?? []).slice(0, 5).join(', ')}</dd></div>
          <div className="fact"><dt>{language === 'en' ? 'Download' : '下載'}</dt><dd><a href={`${import.meta.env.BASE_URL}CV.pdf`} download>CV (PDF)</a></dd></div>
        </dl>
      </section>

      {/* work */}
      <section className="section" id="work">
        <h2>{language === 'en' ? 'Work' : '工作經歷'}</h2>
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
        <h2 style={{ marginTop: 56 }}>{language === 'en' ? 'Projects' : '專案作品'}</h2>
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
      <BlogList setView={setView} language={language} />

      {/* cta */}
      <section className="cta">
        <h2>{language === 'en' ? "Let's build something that works." : '一起打造真正可用的系統。'}</h2>
        <div className="cta-actions">
          <a className="btn btn-primary" href={LINKS.email}>{language === 'en' ? 'Email me' : '聯絡我'}</a>
          <a className="btn btn-ghost" href="CV.pdf" download>{language === 'en' ? 'Download CV' : '下載履歷'}</a>
        </div>
      </section>
    </main>
  );
}

export default function App() {
  const viewFromHash = (): View => {
    const hash = window.location.hash;
    if (hash === '#/chat') return 'chat';
    if (hash.startsWith('#/writing/')) {
      try { return `post:${decodeURIComponent(hash.slice('#/writing/'.length))}`; }
      catch { return 'portfolio'; }
    }
    return 'portfolio';
  };
  const [view, setViewRaw] = useState<View>(viewFromHash);
  useEffect(() => {
    const onHashChange = () => setViewRaw(viewFromHash());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);
  const [language, setLanguage] = useState<Language>(() => localStorage.getItem('eric_language') === 'zh' ? 'zh' : 'en');
  useEffect(() => { localStorage.setItem('eric_language', language); document.documentElement.lang = language === 'zh' ? 'zh-Hant' : 'en'; }, [language]);
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
    const hash = v.startsWith('post:') ? `#/writing/${encodeURIComponent(v.slice(5))}` : `#/${v}`;
    if (window.location.hash !== hash) window.location.hash = hash;
    window.scrollTo({ top: 0 });
  };

  const isChat = view === 'chat';
  const isPost = view.startsWith('post:');

  return (
    <>
      <div className="topbar">
        <a className="wordmark" href="#/portfolio" onClick={(e) => { e.preventDefault(); setView('portfolio'); }}>eric.exe</a>
        <div className="topbar-actions">
          <div className="language-switch" role="group" aria-label="Language">
            <button type="button" className={language === 'en' ? 'selected' : ''} onClick={() => setLanguage('en')} aria-pressed={language === 'en'}>EN</button>
            <button type="button" className={language === 'zh' ? 'selected' : ''} onClick={() => setLanguage('zh')} aria-pressed={language === 'zh'}>繁中</button>
          </div>
          <button className="theme-toggle" onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} aria-label="Toggle theme">
            {theme === 'light' ? '◐' : '◑'}
          </button>
        </div>
      </div>

      {isChat ? (
        <div className="chat-layout">
          <div className="chat-desk">
            <JawAnimation running={false} />
            <p>{language === 'en' ? 'Local WebGPU inference. Your questions stay in the browser.' : '透過瀏覽器 WebGPU 本地推論，提問內容不傳送至伺服器。'}</p>
          </div>
          <div className="chat-main">

            <ChatPanel language={language} onGenerationStart={() => {}} onGenerationEnd={() => {}} />
          </div>
        </div>
      ) : (
        <>
          <Hero setView={setView} language={language} />
          {isPost ? (
            <BlogPost slug={view.slice(5)} theme={theme} setView={setView} language={language} />
          ) : (
            <Portfolio theme={theme} setView={setView} language={language} />
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
