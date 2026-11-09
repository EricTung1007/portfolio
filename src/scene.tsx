import { useState } from 'react';
import { getPosts } from './posts.js';
import type { SiteLanguage, VisitorActions } from './retro.js';
import './scene.css';

type DeskAction = 'terminal'|'chat'|'weekly'|'cabinet'|'punch'|'portfolio'|'guestbook';
const copy = (language:SiteLanguage,en:string,zh:string)=>language==='zh'?zh:en;

export function StudyScene({language,visitor,onOpen,terminal}:{
  language:SiteLanguage; visitor:VisitorActions; onOpen:(target:DeskAction)=>void;terminal?:React.ReactNode
}) {
  const [drawer,setDrawer]=useState(false);
  const latest=getPosts(language)[0];
  const act=(target:DeskAction)=>{visitor.visit(target);onOpen(target)};
  return <main className="study-world">
    <div className="study-wall" aria-hidden="true">
      <div className="study-ornamental-stripe"/>
      <div className="study-left-sconce"><i/></div>
      <div className="study-window">
        <div className="study-window-frame">
          <div className="study-sea">
            <div className="study-caustics"/>
            <div className="study-skyline"><i/><i/><i/><i/><i/><i/></div>
            <div className="study-fish fish-one">◆<span>◁</span></div>
            <div className="study-fish fish-two">◆<span>◁</span></div>
            <div className="study-fish fish-three">◆<span>◁</span></div>
            <div className="study-sea-floor"/>
          </div>
        </div>
      </div>
      <div className="study-bookshelf"><i/><i/><i/><i/><i/><i/></div>
    </div>
    <header className="study-intro">
      <span className="study-kicker">ERIC TUNG / PERSONAL RESEARCH BUREAU / EST. MMXXVI</span>
      <h1>{copy(language,"He's stepped out. Make yourself at home.","Eric 暫時不在，請隨意看看。")}</h1>
      <p>{copy(language,"His notes, machines, and unfinished ideas are all here. Feel free to browse or leave a message.","他留下了研究筆記、機器與尚未完成的想法。歡迎翻閱，也可以留下一張訊息卡。")}</p>
    </header>
    <div className="study-desk-stage">
      <div className="study-desk-perspective">
        <div className="study-table-surface">
          <div className="study-surface-inlay" aria-hidden="true"/>
          <button type="button" className="study-object study-paper" onClick={()=>act('weekly')} aria-label={copy(language,"Read EricTung's Weekly","閱讀 EricTung’s Weekly")}>
            <span className="study-paper-top">THE PERSONAL GAZETTE · VOL. I</span>
            <strong>EricTung's<br/><em>Weekly</em></strong>
            <span className="study-paper-rule"/>
            <span className="study-paper-headline">{latest?.title??'Notes from the Workshop'}</span>
            <small>{copy(language,'OPEN THE NEWSPAPER ↗','閱讀報紙 ↗')}</small>
          </button>
          <button type="button" className="study-object study-folder" onClick={()=>act('portfolio')} aria-label={copy(language,'Open resume folder','打開履歷資料夾')}>
            <span className="study-folder-tab">PERSONNEL · 001</span>
            <span className="study-folder-crest">ET</span>
            <strong>ERIC TUNG</strong>
            <span>CURRICULUM VITAE</span>
            <small>{copy(language,'OPEN RESUME ↗','開啟履歷 ↗')}</small>
          </button>
          <button type="button" className="study-object study-punch" onClick={()=>act('punch')} aria-label={copy(language,'Leave a punch-card message','留下打孔卡訊息')}>
            <span className="study-punch-holes" aria-hidden="true">● ● ● ● ● ● ● ●</span>
            <strong>VISITOR MESSAGE</strong>
            <span>{copy(language,'LEAVE YOUR MARK','留下你的訊息')}</span>
            <small>▣ 12 × 40</small>
          </button>
          <button type="button" className="study-object study-intercom" onClick={()=>act('chat')} aria-label={copy(language,'Ask the answering machine','詢問留聲答錄機')}>
            <div className="study-intercom-label">MARK I / INFORMATION RECORDER</div>
            <span className="study-intercom-speaker" aria-hidden="true"/>
            <div className="study-intercom-light"><i/> <span>STANDBY</span></div>
            <strong>{copy(language,'ASK THE MACHINE','詢問答錄機')}</strong>
          </button>
          <button type="button" className="study-object study-terminal" onClick={()=>act('terminal')} aria-label={copy(language,'Power on vintage terminal','啟動復古終端機')}>
            <div className="study-terminal-shell">
              <div className="study-terminal-bezel">
                <div className="study-terminal-screen">
                  <span>MINERVA COMPUTING SYSTEMS</span>
                  <strong>ERIC.EXE</strong>
                  <small>READY TO INITIALIZE_</small>
                </div>
              </div>
              <div className="study-terminal-vents"/>
              <div className="study-terminal-brand"><span>MINERVA / SERIES 0451</span><i/></div>
            </div>
            <div className="study-terminal-keyboard" aria-hidden="true">
              {Array.from({length:27},(_,i)=><i key={i}/>)}
            </div>
            <span className="study-terminal-cta">{copy(language,'POWER ON TERMINAL','啟動終端機')} <span>↵</span></span>
          </button>
        </div>
        <div className="study-table-edge">
          <div className="study-drawer-zone">
            <button type="button" className="study-drawer" aria-expanded={drawer} onClick={()=>setDrawer(p=>!p)}>
              <span className="study-drawer-pull"/>
              {copy(language,'PROJECT ARCHIVES','專案檔案抽屜')}
            </button>
            {drawer && <div className="study-drawer-open">
              <button type="button" onClick={()=>act('cabinet')}>{copy(language,'PROJECTS / RESEARCH / EXPERIMENTS ↗','專案 / 研究 / 實驗 ↗')}</button>
            </div>}
          </div>
          <button type="button" className="study-brass-contact" onClick={()=>act('guestbook')}>
            {copy(language,'LEAVE A NOTE','訪客簽到')} ✦
          </button>
        </div>
        <div className="study-table-leg left" aria-hidden="true"/>
        <div className="study-table-leg right" aria-hidden="true"/>
      </div>
    </div>
    <nav className="study-quicklinks" aria-label={copy(language,'Quick access','快速存取')}>
      <a href={`${import.meta.env.BASE_URL}CV.pdf`} target="_blank" rel="noopener noreferrer">{copy(language,'VIEW CV','查看履歷')} ↗</a>
      <a href={`${import.meta.env.BASE_URL}CV.pdf`} download>{copy(language,'DOWNLOAD CV','下載履歷')} ↓</a>
      <button type="button" onClick={()=>act('cabinet')}>{copy(language,'PROJECTS','專案')} ↗</button>
      <button type="button" onClick={()=>act('weekly')}>{copy(language,'WRITING','文章')} ↗</button>
      <button type="button" onClick={()=>act('punch')}>{copy(language,'LEAVE MESSAGE','留下訊息')} ↗</button>
    </nav>
    <p className="study-stage-note">{copy(language,"An interactive study, not a real computer. Everything on the desk is safe to explore.","這是一間可以探索的書房，並非真正的電腦。桌上物件都可以放心操作。")}</p>
    {terminal}
  </main>;
}
