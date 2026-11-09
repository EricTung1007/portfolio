import { useMemo, useState } from 'react';
import { getPosts, type Post } from './posts.js';
import { knowledge } from './data.js';

type Lang = 'en' | 'zh';
export type ArchiveView = 'cabinet' | 'timeline' | 'experiments' | 'editorial' | 'guestbook';
type Props = { view:ArchiveView; language:Lang; openArticle:(slug:string)=>void; navigate:(view:ArchiveView)=>void };
const t=(language:Lang,en:string,zh:string)=>language==='zh'?zh:en;

const experiment = [{
  label:'Local inference / Qwen-class model',
  date:'2026-11-05',
  source:'Single local benchmark shared in the development notes',
  profile:'Mac mini M4 / 32 GB unified memory',
  prefill:4096, generated:128, promptTps:64.0, generationTps:11.1, ttftMs:64035.1, peakGB:19.4,
}];

export function ArchiveRoom({view,language,openArticle,navigate}:Props) {
  const all=getPosts(language);
  const [filter,setFilter]=useState('All');
  const [selected,setSelected]=useState<string|null>(null);
  const grouped=useMemo(()=>[...new Set(all.map(x=>x.category))].sort(),[all]);
  const byCategory=(category:string)=>all.filter(p=>category==='All'||p.category===category);
  const articles=byCategory(filter);
  return <main className="archive-room">
    <header className="archive-room-title">
      <span>MINERVA'S DEN · ERIC.EXE ARCHIVAL BUREAU</span>
      <h1>{view==='cabinet'?t(language,'The Filing Cabinet','實體檔案櫃'):
        view==='timeline'?t(language,'Project Chronicle','專案年表'):
        view==='experiments'?t(language,'Experiment Ledger','實驗紀錄簿'):
        view==='editorial'?t(language,'Editorial Workbench','編輯工作台'):
        t(language,'Guestbook','訪客簽到簿')}</h1>
      <p>{t(language,'Every drawer contains a real document or useful action.','每個抽屜都對應真實文件與可操作功能。')}</p>
    </header>
    <nav className="archive-tabs" aria-label={t(language,'Archive rooms','檔案室')}>
      {([
        ['cabinet','▤',t(language,'Cabinet','檔案櫃')],
        ['timeline','◷',t(language,'Timeline','年表')],
        ['experiments','▦',t(language,'Benchmarks','效能測試')],
        ['editorial','✎',t(language,'Editorial','編輯室')],
        ['guestbook','✉',t(language,'Guestbook','簽到簿')],
      ] as const).map(([id,icon,label])=><button type="button" key={id} aria-current={view===id?'page':undefined}
      onClick={()=>navigate(id)}><span>{icon}</span> {label}</button>)}
    </nav>
    {view==='cabinet' && <>
      <p className="archive-note">{t(language,'Choose a drawer, then open a folder to read its contents.','先選擇抽屜，再打開檔案夾閱讀。')}</p>
      <div className="archive-drawers">
        {['All',...grouped].map(cat=><button type="button" key={cat} className={filter===cat?'active':''}
          onClick={()=>{setFilter(cat);setSelected(null);}}>
          <span className="archive-drawer-handle" aria-hidden="true"></span>
          <strong>{cat==='All'?t(language,'ALL RECORDS','全部文件'):cat}</strong>
          <small>{byCategory(cat).length} {t(language,'FILES','份')}</small>
        </button>)}
      </div>
      <div className="archive-folders">{articles.map(p=><article className="archive-folder" key={p.slug}>
        <button type="button" aria-expanded={selected===p.slug} onClick={()=>setSelected(selected===p.slug?null:p.slug)}>
          <span className="archive-folder-tab">{p.category}</span><strong>{p.title}</strong>
          <small>{p.date} · {p.tags.join(' / ')}</small>
        </button>
        {selected===p.slug&&<div className="archive-file-preview"><p>{p.excerpt}</p>
          <button type="button" onClick={()=>openArticle(p.slug)}>{t(language,'READ DOCUMENT →','閱讀文件 →')}</button></div>}
      </article>)}</div>
    </>}
    {view==='timeline'&&<div className="archive-timeline">
      {all.slice().sort((a,b)=>b.date.localeCompare(a.date)).map((p,index)=><article key={p.slug}>
        <time dateTime={p.date}>{p.date}</time>
        <div><span>{String(index+1).padStart(2,'0')} / {p.category}</span>
          <h2>{p.title}</h2><p>{p.excerpt}</p>
          <button type="button" onClick={()=>openArticle(p.slug)}>{t(language,'OPEN ORIGINAL →','開啟原文 →')}</button>
        </div>
      </article>)}
      <p className="archive-note">{t(language,'Chronology is generated from published articles, not inferred private development events.','此年表依已發布文章日期產生，不猜測未公開的開發事件。')}</p>
    </div>}
    {view==='experiments'&&<section className="archive-experiments">
      <h2>{t(language,'Local model experiments','本地模型實驗')}</h2>
      <p>{t(language,'Measured values are from a single shared run, not claims of general hardware performance.','以下數值來自單次已分享的測試，不代表硬體普遍效能。')}</p>
      {experiment.map(e=><article key={e.label}>
        <div className="archive-ledger-header"><strong>{e.label}</strong><time dateTime={e.date}>{e.date}</time></div>
        <p>{e.profile} · PP {e.prefill} / TG {e.generated}</p>
        <div className="archive-metric-grid">
          {[[t(language,'Prompt tok/s','提示詞 tok/s'),e.promptTps],[t(language,'Generation tok/s','生成 tok/s'),e.generationTps],['TTFT (ms)',e.ttftMs],['Peak memory (GB)',e.peakGB]].map(([label,value])=><div key={label}><small>{label}</small><strong>{value}</strong></div>)}
        </div>
        <small>{t(language,'Evidence: local benchmark reported on Nov 5; configuration-specific.','來源：11 月 5 日的本地測試，僅適用於當次配置。')}</small>
      </article>)}
      <h2>{t(language,'Experiments still to document','等待整理的實驗')}</h2>
      <p>{t(language,'Use the Editorial Workbench to publish reproducible methodology, hardware settings, raw results, and limitations.','可透過編輯工作台發布可重現的方法、硬體設定、原始數值與限制。')}</p>
      <button type="button" className="archive-action" onClick={()=>navigate('editorial')}>{t(language,'OPEN EDITORIAL WORKBENCH →','前往編輯工作台 →')}</button>
    </section>}
    {view==='editorial'&&<section className="archive-editorial">
      <h2>{t(language,'The editor’s desk','編輯室工作台')}</h2>
      <p>{t(language,'Write English or Traditional Chinese, save drafts, upload images, and publish directly to the repository. No public visitor can edit without repository access.','可以編輯英文與繁體中文、保存草稿、上傳圖片及發布。只有具備 Repository 權限者可以編輯。')}</p>
      <div className="archive-editorial-actions">
        <a href={`${import.meta.env.BASE_URL}admin/`} target="_blank" rel="noopener noreferrer">{t(language,'OPEN PRIVATE BACKSTAGE','開啟管理後台')} ↗</a>
        <a href="https://github.com/EricTung1007/portfolio/commits/main/content/posts" target="_blank" rel="noopener noreferrer">{t(language,'ARTICLE REVISION HISTORY','文章修訂紀錄')} ↗</a>
        <a href="https://github.com/EricTung1007/portfolio/actions/workflows/deploy.yml" target="_blank" rel="noopener noreferrer">{t(language,'PUBLICATION STATUS','發布工作流程')} ↗</a>
      </div>
      <p className="archive-note">{t(language,'Git commits preserve revisions. Drafts are private only if the repository itself is private: in this public repository, drafts are not listed on the website but remain readable on GitHub.','Git Commit 會保留修訂紀錄。此 Repository 是公開的，草稿雖不顯示於網站，仍可在 GitHub 被讀取，請勿放入機密資訊。')}</p>
    </section>}
    {view==='guestbook'&&<section className="archive-guestbook">
      <h2>{t(language,'Sign the visitor ledger','留下你的訪客紀錄')}</h2>
      <p>{t(language,'Leave a public note through GitHub Issues. The entry remains on GitHub, where Eric can moderate or close it. GitHub sign-in is required.','透過 GitHub Issues 留下公開訊息，Eric 可以在 GitHub 管理與關閉留言，需登入 GitHub。')}</p>
      <a className="archive-action" href="https://github.com/EricTung1007/portfolio/issues/new?template=guestbook.yml" target="_blank" rel="noopener noreferrer">{t(language,'SIGN THE GUESTBOOK ↗','簽署訪客簿 ↗')}</a>
      <a className="archive-secondary" href="https://github.com/EricTung1007/portfolio/issues?q=is%3Aissue+label%3Aguestbook" target="_blank" rel="noopener noreferrer">{t(language,'READ THE VISITOR LEDGER ↗','閱讀訪客留言 ↗')}</a>
      <p className="archive-note">{t(language,'No names, emails, or messages are stored locally by this website. Never share sensitive information in a public issue.','此網站不會自行儲存訪客姓名、電子郵件或留言。GitHub Issue 是公開內容，請勿提交敏感資料。')}</p>
    </section>}
    <footer className="archive-room-footer">ERIC.EXE / ARCHIVAL SYSTEM · EST. 2026</footer>
  </main>;
}
export function getEvidenceLink(question:string):{label:string;href:string}|null {
  const q=question.toLowerCase();
  if(/cv|resume|履歷|education|nursing|experience|工作|學歷|護理|任職/.test(q))
    return {label:'CV.pdf',href:`${import.meta.env.BASE_URL}CV.pdf`};
  if(/project|agent|rag|模型|專案|研究|ai|llm|architecture|系統/.test(q)){
    const p=getPosts().find(p=>/minerva/i.test(p.title))??getPosts()[0];
    if(p) return {label:p.title,href:`#/writing/${encodeURIComponent(p.slug)}`};
  }
  if(/skill|技術|github|code|程式/.test(q))
    return {label:'GitHub portfolio',href:knowledge.profile.contact.github};
  return null;
}
