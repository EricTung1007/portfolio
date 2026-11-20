import { useEffect, useState, type ReactNode } from 'react';
import { readTableCard, clearTableCard, type TableCard } from './visitor-card.js';
import { getPosts } from './posts.js';
import type { SiteLanguage, VisitorActions } from './retro.js';
import './scene.css';

type DeskAction = 'terminal'|'chat'|'weekly'|'cabinet'|'punch'|'portfolio'|'guestbook'|'department';
const copy = (language:SiteLanguage,en:string,zh:string)=>language==='zh'?zh:en;

export function StudyScene({language,visitor,onOpen,terminal}:{
  language:SiteLanguage; visitor:VisitorActions; onOpen:(target:DeskAction)=>void;terminal?:ReactNode
}) {
  const [drawer,setDrawer]=useState(false);
  const [cvViewed,setCvViewed]=useState(()=>{try{return sessionStorage.getItem('eric_cv_examined')==='1';}catch{return false;}});
  const [tableCard,setTableCard]=useState<TableCard|null>(readTableCard);
  useEffect(()=>{
    const refresh=()=>setTableCard(readTableCard());
    window.addEventListener('eric-card-updated',refresh);
    window.addEventListener('storage',refresh);
    window.addEventListener('focus',refresh);
    return ()=>{window.removeEventListener('eric-card-updated',refresh);window.removeEventListener('storage',refresh);window.removeEventListener('focus',refresh);};
  },[]);
  const latest=getPosts(language)[0];
  const markCvViewed=()=>{visitor.visit('cv');setCvViewed(true);try{sessionStorage.setItem('eric_cv_examined','1');}catch{/* optional session */}};
  const act=(target:DeskAction)=>{if(target!=='department') visitor.visit(target);onOpen(target)};
  return <main className="study-world">
    <div className="study-wall" aria-hidden="true">
      <div className="study-ornamental-stripe"/>
      <div className="study-left-sconce"><i/></div>
      <div className="study-window">
        <div className="study-window-frame">
          <div className="study-sea">
            <div className="study-caustics"/>
            <div className="study-skyline"><i/><i/><i/><i/><i/><i/></div>
            <div className="study-fish fish-one"><i/></div>
            <div className="study-fish fish-two"><i/></div>
            <div className="study-fish fish-three"><i/></div>
            <div className="study-sea-floor"/>
          </div>
        </div>
      </div>
      <div className="study-bookshelf"><i/><i/><i/><i/><i/><i/></div>
    </div>
    <header className="study-intro">
      <h1>{copy(language,"Eric is currently out of office.","Eric 目前不在辦公室。")}</h1>
    </header>
    <div className="study-desk-stage">
      <div className="study-desk-perspective">
        <div className="study-table-surface">
          <div className="study-surface-inlay" aria-hidden="true"/>
          <button type="button" className="study-object study-paper" onClick={()=>act('weekly')} aria-label={copy(language,"Read EricTung's Weekly","閱讀 EricTung’s Weekly")}>
            <strong>EricTung's<br/><em>Weekly</em></strong>
            <span className="study-paper-rule"/>
            <span className="study-paper-headline">{latest?.title??'Notes from the Workshop'}</span>
          </button>
          <a className="study-object study-docket" href="#/department"
            onClick={e=>{e.preventDefault();onOpen('department');}}
            aria-label={copy(language,'Enter Case 0451 classification game','進入案件 0451 分類遊戲')}>
            <span className="study-docket-number">D.O.C. / NO. 0451</span>
            <strong>CASE 0451</strong>
            <span className="study-docket-stamp">FILE APPEAL ▸</span>
          </a>
          <a className="study-object study-folder" href={`${import.meta.env.BASE_URL}cv.html?lang=${language}`} target="_blank" rel="noopener noreferrer" onClick={markCvViewed} aria-label={copy(language,'Open resume','開啟履歷')}>
            <span className="study-folder-tab">PERSONNEL FILE</span>
            <span className="study-folder-crest">ET</span>
            <strong>ERIC TUNG</strong>
            <span>CV</span>
          </a>
          {cvViewed&&<div className="study-cv-clue" aria-label={copy(language,'Handwritten personnel file note','人事檔案手寫備註')}>
            <strong>0451</strong>
            <span>{copy(language,'DRAWER','抽屜')}</span>
          </div>}
          <button type="button" className={`study-object study-punch ${tableCard?'study-punch-saved':''} ${tableCard?.golden?'study-punch-golden':''}`}
            onClick={()=>act('punch')} aria-label={copy(language,'Open visitor punch card','開啟訪客打孔卡')}>
            <span className="study-punch-holes" aria-hidden="true">● ● ● ● ● ● ● ●</span>
            <strong>{tableCard?(tableCard.golden?'GOLDEN CARD':'VISITOR CARD'):copy(language,'LEAVE A MESSAGE','留下訊息')}</strong>
            {tableCard&&<span>{tableCard.alias}</span>}
            {tableCard?.message.trim()&&<small>{tableCard.message.trim().slice(0,48)}</small>}
          </button>
          {tableCard&&<button type="button" className="study-card-clear" onClick={()=>clearTableCard()} aria-label={copy(language,'Remove saved visitor card from desk','移除桌上訪客卡片')}>
            {copy(language,'CLEAR CARD ×','移除卡片 ×')}
          </button>}
          <button type="button" className="study-object study-intercom" onClick={()=>act('chat')} aria-label={copy(language,'Ask the answering machine','詢問留聲答錄機')}>
            <div className="study-intercom-label">MARK I</div>
            <span className="study-intercom-speaker" aria-hidden="true"/>
            <div className="study-intercom-light" aria-hidden="true"><i/></div>
            <strong>{copy(language,'ASK ERIC','詢問 Eric')}</strong>
          </button>
          <button type="button" className="study-object study-terminal" onClick={()=>act('terminal')} aria-label={copy(language,'Power on vintage terminal','啟動復古終端機')}>
            <div className="study-terminal-shell">
              <div className="study-terminal-bezel">
                <div className="study-terminal-screen">
                  <strong>ERIC.EXE</strong>
                </div>
              </div>
              <div className="study-terminal-vents"/>
              <div className="study-terminal-brand" aria-hidden="true"><i/></div>
            </div>
            <div className="study-terminal-keyboard" aria-hidden="true">
              {Array.from({length:27},(_,i)=><i key={i}/>)}
            </div>
            <span className="study-terminal-cta">{copy(language,'START','啟動')} <span>↵</span></span>
          </button>
        </div>
        <div className="study-table-edge">
          <div className="study-drawer-zone">
            <button type="button" className="study-drawer" aria-expanded={drawer} onClick={()=>setDrawer(p=>!p)}>
              <span className="study-drawer-pull"/>
              {copy(language,'ARCHIVE','檔案庫')}
            </button>
            {drawer && <div className="study-drawer-open">
              <button type="button" onClick={()=>act('cabinet')}>{copy(language,'OPEN FILES ↗','開啟檔案 ↗')}</button>
            </div>}
          </div>
          <button type="button" className="study-brass-contact" onClick={()=>act('guestbook')}>
            {copy(language,'GUESTBOOK','訪客簿')} ✦
          </button>
        </div>
        <div className="study-table-leg left" aria-hidden="true"/>
        <div className="study-table-leg right" aria-hidden="true"/>
      </div>
    </div>
    {terminal}
  </main>;
}
