import { useEffect, useState } from 'react';
import { ChatPanel } from './components/ChatPanel.js';
import JawAnimation from './components/JawAnimation.js';
import { Giscus } from './components/Giscus.js';
import { knowledge } from './data.js';
import { getPosts, getPost } from './posts.js';
import { renderMarkdown } from './markdown.js';
import { getSystemBrand } from './browser-capability.js';
import { ArchiveRoom, type ArchiveView } from './archive.js';
import { TerminalWindow, AchievementPanel, PunchCard, BadgeToast, useVisitor } from './retro.js';
import { StudyScene } from './scene.js';
import './motion.js';
import './index.css';
import './terminal-v2.css';

type View = 'desktop' | 'terminal' | 'achievements' | 'punch' | 'chat' | 'portfolio' | 'weekly' | ArchiveView | `post:${string}`;
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
          <a className="btn btn-ghost" href="#/portfolio" onClick={(e) => { e.preventDefault(); setView("portfolio"); requestAnimationFrame(() => document.getElementById("work")?.scrollIntoView({ behavior: "smooth" })); }}>{language === 'en' ? 'See my work' : '查看作品'}</a>
        </div>
      </div>
    </header>
  );
}

function WeeklyMasthead({ language }: { language: Language }) {
  return (
    <header className="weekly-masthead">
      <div className="weekly-ornament">✦ &nbsp; INDEPENDENT NOTES & OBSERVATIONS &nbsp; ✦</div>
      <h1>EricTung's <em>Weekly</em></h1>
      <div className="weekly-rule" aria-hidden="true"><span>EST. 2026</span><span>{language === 'en' ? 'IDEAS · TECHNOLOGY · LIFE' : '思想 · 科技 · 生活'}</span><span>VOL. 001</span></div>
      <p>{language === 'en'
        ? 'A small newspaper of ideas, experiments, field notes and everything worth writing down.'
        : '一份記錄想法、實驗、研究筆記，以及日常值得留下之事的小報。'}</p>
    </header>
  );
}

function BlogList({ setView, language }: { setView: (v: View) => void; language: Language }) {
  const featured = getPosts(language)[0];
  return (
    <section className="section weekly-teaser" id="writing">
      <div className="weekly-teaser-kicker">{language === 'en' ? 'FROM THE EDITORIAL DESK' : '編輯室來信'}</div>
      <h2>EricTung's Weekly</h2>
      <p>{language === 'en' ? 'Ideas, research, experiments, and notes from beyond the code.' : '程式以外，關於研究、實驗、生活與想法的記錄。'}</p>
      {featured && <a className="weekly-teaser-feature" href={`#/writing/${encodeURIComponent(featured.slug)}`} onClick={e => { e.preventDefault(); setView(`post:${featured.slug}`); }}>
        <span>{language === 'en' ? 'LATEST EDITION' : '最新刊載'} · {featured.date}</span>
        <strong>{featured.title}</strong>
      </a>}
      <a className="weekly-read-more" href="#/weekly" onClick={e => { e.preventDefault(); setView('weekly'); }}>
        {language === 'en' ? 'OPEN THE NEWSPAPER →' : '展開週刊 →'}
      </a>
    </section>
  );
}

function WeeklyPage({ setView, language }: { setView: (v: View) => void; language: Language }) {
  const entries = getPosts(language);
  const [section, setSection] = useState('All');
  const [archiveYear,setArchiveYear]=useState('All');
  const [page,setPage]=useState(0);
  const [expandedIssue,setExpandedIssue]=useState(false);
  const years=['All',...new Set(entries.map(p=>p.date.slice(0,4)))];
  const sections = ['All', ...new Set(entries.map(p => p.category))];
  const selected = entries.filter(p => (section === 'All' || p.category===section) && (archiveYear==='All'||p.date.startsWith(archiveYear)));
  const pageSize=expandedIssue?selected.length||1:3;
  const totalPages=Math.max(1,Math.ceil(selected.length/pageSize));
  const currentPage=Math.min(page,totalPages-1);
  const visible=selected.slice(currentPage*pageSize,(currentPage+1)*pageSize);
  const lead=visible[0];
  return (
    <main className="weekly-paper">
      <WeeklyMasthead language={language} />
      <nav className="weekly-sections" aria-label={language === 'en' ? 'Newspaper sections' : '報紙欄目'}>
        {sections.map(cat => <button type="button" key={cat} aria-pressed={cat === section} className={cat === section ? 'active' : ''}
          onClick={() => { setSection(cat); setPage(0); }}>{cat === 'All' ? (language === 'en' ? 'ALL STORIES' : '全部文章') : cat}</button>)}
      </nav>
      <div className="retro-weekly-index"><span>ARCHIVE / {entries.length} STORIES · {years.length-1} YEARS</span><label>{language === 'en' ? 'EDITION YEAR' : '發行年份'} <select value={archiveYear} onChange={e=>{setArchiveYear(e.target.value);setPage(0);}}>{years.map(y=><option key={y} value={y}>{y==='All'?(language==='en'?'All years':'所有年份'):y}</option>)}</select></label></div>
      {lead && <div className="retro-weekly-no">{language==='en'?'FRONT PAGE / FEATURED STORY':'頭版焦點'} · {lead.date}</div>}
      {selected.length === 0 ? <p className="weekly-empty">{language === 'en' ? 'No stories in this section yet.' : '這個欄目暫時沒有文章。'}</p> :
        <div className="weekly-grid">
          {visible.map((post, i) => (
            <article className={`weekly-story ${i === 0 ? 'weekly-lead' : ''}`} key={post.slug}>
              <div className="weekly-story-top"><span>{post.category} · <span className="weekly-ink-stamp">{post.stamp}</span></span><time dateTime={post.date}>{post.date}</time></div>
              <a href={`#/writing/${encodeURIComponent(post.slug)}`} onClick={e => { e.preventDefault(); setView(`post:${post.slug}`); }}>
                <h2>{post.title}</h2>
                <p>{post.excerpt}</p>
                <span className="weekly-story-read">{language === 'en' ? 'CONTINUE READING →' : '繼續閱讀 →'}</span>
              </a>
              <div className="weekly-story-tags">{post.tags.join(' · ')}</div>
              {language === 'zh' && !post.translated && <div className="weekly-original-note">EN ORIGINAL · {language === 'zh' ? '尚無繁中譯稿' : ''}</div>}
            </article>
          ))}
        </div>}
      <nav className="weekly-pagination" aria-label={language==='en'?'Newspaper pages':'報紙頁面'}>
        <button type="button" disabled={currentPage===0||expandedIssue} onClick={()=>{setPage(Math.max(0,currentPage-1));window.scrollTo({top:0,behavior:'smooth'});}}>{language==='en'?'← PREVIOUS PAGE':'← 上一頁'}</button>
        <span>VOL. 001 · {language==='en'?'PAGE':'第'} {currentPage+1} / {totalPages} {language==='zh'?'頁':''}</span>
        <button type="button" onClick={()=>{setExpandedIssue(v=>!v);setPage(0);}}>{expandedIssue?(language==='en'?'FOLD EDITION':'摺回報紙'):(language==='en'?'UNFOLD ALL':'展開全部')}</button>
        <button type="button" disabled={currentPage===totalPages-1||expandedIssue} onClick={()=>{setPage(Math.min(totalPages-1,currentPage+1));window.scrollTo({top:0,behavior:'smooth'});}}>{language==='en'?'NEXT PAGE →':'下一頁 →'}</button>
      </nav>
      <footer className="weekly-colophon">{language === 'en' ? 'Composed and published from Eric’s own editorial desk.' : '由 Eric 的個人編輯室編排發行。'}</footer>
    </main>
  );
}

function BlogPost({ slug, theme, setView, language }: { slug: string; theme: string; setView: (v: View) => void; language: Language }) {
  const post = getPost(slug, language);
  if (!post) return <main className="weekly-paper"><WeeklyMasthead language={language} /><p className="weekly-empty">{language === 'en' ? 'Article not found.' : '找不到文章。'}</p></main>;
  return (
    <main className="weekly-paper weekly-reading">
      <WeeklyMasthead language={language} />
      <article className="weekly-article">
        <a className="weekly-back" href="#/weekly" onClick={e => { e.preventDefault(); setView('weekly'); }}>{language === 'en' ? '← BACK TO THE EDITION' : '← 返回週刊'}</a>
        <div className="weekly-article-category">{post.category} / {post.date} <span className="weekly-ink-stamp">{post.stamp}</span></div>
        <h2>{post.title}</h2>
        {language === 'zh' && !post.translated && <p className="weekly-original-note">此文目前只有英文版本，以下顯示英文原文。</p>}
        <div className="weekly-article-deck">{post.tags.join(' · ')}</div>
        <div className="post-body weekly-article-body" dangerouslySetInnerHTML={{ __html: renderMarkdown(post.body) }} />
        {post.sources.length > 0 && <aside className="weekly-sources"><h3>{language==='en'?'Documented sources':'參考來源'}</h3>{post.sources.map((url,i)=><a key={url} href={url} target="_blank" rel="noopener noreferrer">{String(i+1).padStart(2,'0')} · {url}</a>)}</aside>}
        <div className="giscus-wrap"><h3>{language === 'en' ? 'Letters to the editor' : '讀者來信'}</h3>
          <Giscus mapping="specific" term={`writing/${slug}`} theme={theme as 'light' | 'dark'} language={language} />
        </div>
      </article>
    </main>
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
    if (hash === '#/terminal') return 'terminal';
    if (hash === '#/achievements') return 'achievements';
    if (hash === '#/punch') return 'punch';
    if (hash === '#/desktop') return 'desktop';
    if (hash === '#/weekly') return 'weekly';
    if (['cabinet','timeline','experiments','editorial','guestbook'].some(x => hash === '#/' + x)) return hash.slice(2) as ArchiveView;
    if (hash.startsWith('#/writing/')) {
      try { return `post:${decodeURIComponent(hash.slice('#/writing/'.length))}`; }
      catch { return 'portfolio'; }
    }
    return 'desktop';
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

  const [systemBrand] = useState(getSystemBrand);
  const visitor=useVisitor();
  useEffect(()=>{visitor.visit('site');},[]);
  useEffect(()=>{if(view.startsWith('post:'))visitor.read(view.slice(5));},[view]);
  const [deskBusy, setDeskBusy] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const isChat = view === 'chat';
  const isDesktop=view==='desktop'||view==='terminal';
  const isUtility=view==='achievements'||view==='punch';
  const isPost = view.startsWith('post:');

  return (
    <>
      <div className="topbar">
        <a className="wordmark" href="#/desktop" onClick={(e) => { e.preventDefault(); setView('desktop'); }} title="OS-inspired name, not an installer">{systemBrand}</a>
        <div className="topbar-actions"><a className="topbar-direct-cv" href={`${import.meta.env.BASE_URL}CV.pdf`} target="_blank" rel="noopener noreferrer">{language==='en'?'CV / RESUME':'履歷 PDF'} ↗</a><button className="retro-nav" type="button" onClick={()=>setView('desktop')}>{language==='en'?'DESKTOP':'桌面'}</button>
          <a className="topbar-weekly" href="#/weekly" onClick={e => { e.preventDefault(); setView('weekly'); }}>{language === 'en' ? 'THE WEEKLY' : '個人週刊'}</a>
          <div className="language-switch" role="group" aria-label="Language">
            <button type="button" className={language === 'en' ? 'selected' : ''} onClick={() => setLanguage('en')} aria-pressed={language === 'en'}>EN</button>
            <button type="button" className={language === 'zh' ? 'selected' : ''} onClick={() => setLanguage('zh')} aria-pressed={language === 'zh'}>繁中</button>
          </div>
          <button className="theme-toggle" onClick={() => {const next=theme==='light'?'dark':'light';setTheme(next);if(next==='dark')visitor.night();}} aria-label="Toggle theme">
            {theme === 'light' ? '◐' : '◑'}
          </button>
        </div>
      </div>

      <BadgeToast name={visitor.newBadge} language={language} onDismiss={visitor.clearBadge} />
      {isDesktop ? <StudyScene language={language} visitor={visitor} onOpen={target=>setView(target)}
        terminal={view==='terminal' ? <TerminalWindow language={language} visitor={visitor}
          navigate={target=>setView(target)} onTheme={t=>{setTheme(t);if(t==='dark')visitor.night();}}
          onLanguage={setLanguage} onClose={()=>setView('desktop')} /> : null} /> : isUtility ? (
        view==='achievements' ? <AchievementPanel language={language} visitor={visitor} onClose={()=>setView('desktop')} /> :
        <PunchCard language={language} visitor={visitor} onClose={()=>setView('desktop')} />
      ) : (['cabinet','timeline','experiments','editorial','guestbook'] as string[]).includes(view) ? (
        <ArchiveRoom view={view as ArchiveView} language={language}
          openArticle={slug=>setView(`post:${slug}`)}
          navigate={target=>setView(target)} />
      ) : isChat ? (
        <main className="chat-layout desk-first-layout">
          <section className="desk-cabinet desk-workstation" aria-label={language === 'en' ? 'Eric’s information desk' : 'Eric 的資訊台'}>
            <div className="desk-cabinet-top">
              <span className="desk-cabinet-label">EST. 2026 · {systemBrand.toUpperCase()} · INFORMATION BUREAU</span>
              <span className={`desk-pilot ${deskBusy ? 'working' : ''}`} aria-label={deskBusy ? 'Working' : 'Ready'} />
            </div>
            <div className="desk-work-surface">
              <div className="desk-display">
                <JawAnimation running={deskBusy} />
                <div className="desk-nameplate">{language === 'en' ? 'THE INFORMATION DESK' : '個人資訊台'}</div>
                <button className="desk-drawer-handle" type="button" aria-expanded={drawerOpen}
                  aria-controls="desk-file-drawer" onClick={() => setDrawerOpen(v => !v)}>
                  <span aria-hidden="true">▤</span> {language === 'en' ? (drawerOpen ? 'CLOSE THE DRAWER' : 'OPEN THE DRAWER') : (drawerOpen ? '收起檔案抽屜' : '打開檔案抽屜')}
                </button>
                <span className="desk-desk-caption">{language === 'en' ? 'AUTHENTIC RECORDS · NO INVENTED BIOGRAPHY' : '真實檔案 · 不虛構個人資料'}</span>
              </div>
              <div className="chat-main">
                <ChatPanel language={language} onGenerationStart={() => setDeskBusy(true)} onGenerationEnd={() => setDeskBusy(false)} />
              </div>
            </div>
            {drawerOpen && (
              <div className="desk-file-drawer desk-records" id="desk-file-drawer">
                <div className="desk-file-title">{language === 'en' ? 'RECORD CABINET / 001' : '檔案櫃 / 001'}</div>
                <a href={`${import.meta.env.BASE_URL}CV.pdf`} target="_blank" rel="noopener noreferrer">{language === 'en' ? '01 · Curriculum vitae' : '01 · 個人履歷'} ↗</a>
                <a href="#/portfolio" onClick={e => { e.preventDefault(); setView('portfolio'); requestAnimationFrame(() => document.getElementById('work')?.scrollIntoView({ behavior: 'smooth' })); }}>{language === 'en' ? '02 · Project ledger' : '02 · 專案紀錄'} ↗</a>
                <a href="#/weekly" onClick={e => { e.preventDefault(); setView('weekly'); }}>{language === 'en' ? '03 · Weekly newspaper' : '03 · 個人週刊'} ↗</a>
                <button type="button" onClick={() => { void navigator.clipboard?.writeText(knowledge.profile.contact.email); }}>{language === 'en' ? '04 · Copy contact card' : '04 · 複製聯絡信箱'}</button>
              </div>
            )}
          </section>
          <p className="desk-privacy-note">{language === 'en' ? 'Verified questions are answered from published records without loading an AI model. Optional WebGPU processing stays in your browser.' : '已確認的履歷問題直接從公開資料回答，不必載入 AI 模型。可選的 WebGPU 推論留在瀏覽器內。'}</p>
        </main>
      ) : (
        <>
          {view === 'portfolio' && <Hero setView={setView} language={language} />}
          {isPost ? (
            <BlogPost slug={view.slice(5)} theme={theme} setView={setView} language={language} />
          ) : view === 'weekly' ? (
            <WeeklyPage setView={setView} language={language} />
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
