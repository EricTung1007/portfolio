import { useCallback, useEffect, useRef, useState } from 'react';
import {
  CARDS, DIR_NAMES, DIRS, DOSSIERS, ENEMIES, EVENT_TEXT, EVENTS, MAP, 
  chooseReward, createRun, endTurn, intentFor, move, name, play, progress,
  reclassify, recordFile, reject, resolveEvent, startAppeal,
  type CardId, type Language, type Run,
} from './case-engine.js';
import { EnemySprite } from './case-sprites.js';
import { renderCorridor, orientation } from './case-raycast.js';
import './department.css';

const RESUME=import.meta.env.BASE_URL+'CV.pdf';
const RESUME_ZH=import.meta.env.BASE_URL+'CV_zh_TW.pdf';
const STORAGE='case0451_save_v2';
function copy(language:Language,en:string,zh:string){return language==='en'?en:zh;}
function load():Run {
  try{
    const cached=localStorage.getItem(STORAGE);
    if(cached){
      const data=JSON.parse(cached) as Run;
      if(data && typeof data.seed==='number' && Array.isArray(data.deck) &&
        Array.isArray(data.visited) && Array.isArray(data.defeated) &&
        ['review','denied','maze','battle','reward','record','event','dead','clear'].includes(data.phase))return data;
    }
  }catch{/* untrusted or unavailable local storage */}
  return createRun();
}
function MiniMap({run,language}:{run:Run;language:Language}){
  const nearby=(x:number,y:number)=>run.visited.some(item=>{
    const [vx,vy]=item.split(',').map(Number);
    return Math.abs(vx-x)+Math.abs(vy-y)<=2;
  });
  return <div className="dm-minimap" role="img" aria-label={copy(language,'Explored maze map. Current location marked by compass heading.','已探索迷宮地圖，以方向字母標記目前位置。')}>
    {MAP.map((row,y)=><div className="dm-maprow" key={y}>
      {[...row].map((cell,x)=>{
        const visible=nearby(x,y),here=run.x===x&&run.y===y;
        const marker=EVENTS[x+','+y];
        const symbol=cell==='E'?'!':cell==='X'?'X':cell==='A'||cell==='H'?'F':marker&&!run.events.includes(marker)?'?':'';
        return <span key={x} className={'dm-mapcell '+(here?'you':!visible?'fog':cell==='#'?'wall':cell==='X'?'exit':'floor')}>
          {here?DIR_NAMES[run.dir]:visible&&cell!=='#'?symbol:''}
        </span>;
      })}
    </div>)}
  </div>;
}
function CardButton({id,index,language,disabled,onClick}:{id:CardId;index?:number;language:Language;disabled?:boolean;onClick:()=>void}){
  const card=CARDS[id];
  return <button type="button" onClick={onClick} disabled={disabled} className={'dm-card dm-card-'+(card.category==='care'?'defense':card.category==='hybrid'?'utility':'attack')} title={name(language,card.origin)}>
    <span className="dm-card-cost">{card.cost}</span>
    {index!=null&&<span className="dm-card-hotkey">{index+1}</span>}
    <strong>{name(language,card.name)}</strong>
    <small>{card.category==='code'?'CODE':card.category==='care'?'CARE':'CROSS'}</small>
    <p>{name(language,card.text)}</p>
    <span className="dm-card-origin">{name(language,card.origin)}</span>
  </button>;
}
export function Department({language,onNavigate}:{language:Language;onNavigate:(target:'portfolio'|'weekly'|'chat')=>void}){
  const [run,setRun]=useState<Run>(load);
  const [showMap,setShowMap]=useState(false);
  const [showRules,setShowRules]=useState(false);
  const canvas=useRef<HTMLCanvasElement>(null);
  const change=useCallback((action:'left'|'right'|'forward'|'back')=>setRun(g=>move(g,action)),[]);
  useEffect(()=>{try{localStorage.setItem(STORAGE,JSON.stringify(run));}catch{/* optional save */}},[run]);
  useEffect(()=>{
    if(canvas.current && ['maze','battle','reward','record','event'].includes(run.phase))renderCorridor(canvas.current,run);
  },[run]);
  useEffect(()=>{
    const handle=(event:KeyboardEvent)=>{
      if(event.ctrlKey||event.metaKey||event.altKey ||
        event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement ||
        event.target instanceof HTMLButtonElement || event.target instanceof HTMLAnchorElement)return;
      const controls:Record<string,'left'|'right'|'forward'|'back'>={
        ArrowLeft:'left',a:'left',A:'left',ArrowRight:'right',d:'right',D:'right',
        ArrowUp:'forward',w:'forward',W:'forward',ArrowDown:'back',s:'back',S:'back',
      };
      if(run.phase==='maze'){
        if(controls[event.key]){event.preventDefault();change(controls[event.key]);}
        if(event.key.toLowerCase()==='m'){event.preventDefault();setShowMap(v=>!v);}
      }
      if(run.phase==='battle'){
        if(/^[1-8]$/.test(event.key)){event.preventDefault();setRun(g=>play(g,Number(event.key)-1));}
        if(event.key==='Enter'){event.preventDefault();setRun(endTurn);}
      }
    };
    window.addEventListener('keydown',handle);
    return ()=>window.removeEventListener('keydown',handle);
  },[run.phase,change]);
  const restart=()=>{setRun(g=>createRun(g.runs+1));setShowMap(false);setShowRules(false);};
  const currentFoe=run.foe?ENEMIES[run.foe]:null;
  const currentIntent=run.foe?intentFor(run.foe,run.turn):null;
  const inDungeon=['maze','battle','reward','record','event'].includes(run.phase);
  const document=run.record==='A'?DOSSIERS.A:DOSSIERS.H;
  const canMove=run.phase==='maze';

  return <main className="dm" id="department">
    <div className={'dm-frame dm-progress-'+Math.min(5,progress(run))}>
      <header className="dm-top">
        <button className="dm-logo" onClick={()=>{if(window.confirm(copy(language,'Start a new application? Current run will be lost.','重新申請？目前遊戲進度將被清除。')))restart();}}>D.O.C. <span>§0451</span></button>
        <div className="dm-top-links">
          <button type="button" onClick={()=>onNavigate('portfolio')}>{copy(language,'WORK','作品')}</button>
          <a href={language==='en'?RESUME:RESUME_ZH} target="_blank" rel="noreferrer">CV</a>
          <button type="button" onClick={()=>onNavigate('weekly')}>{copy(language,'WRITING','文章')}</button>
          <button type="button" onClick={()=>onNavigate('chat')}>MARK I</button>
          <button type="button" onClick={()=>setShowRules(v=>!v)} aria-expanded={showRules}>{copy(language,'RULES','規則')}</button>
        </div>
      </header>
      {showRules&&<section className="dm-manual">
        <strong>DOC 0451 / {copy(language,'VISITOR PROCEDURE','訪客操作守則')}</strong>
        <p>{copy(language,'Find two project records, defeat two inspectors, then appeal at the central door. Use WASD/arrows to move; M opens the map. 1-8 play cards; Enter ends turn.','找齊兩份專案資料，通過兩名審查員，最後前往中央大門申訴。WASD 或方向鍵移動，M 開啟地圖。1 至 8 使用卡牌，Enter 結束回合。')}</p>
        <p>{copy(language,'Care cards protect you and generate EVIDENCE. Code cards consume up to 2 EVIDENCE for +2 damage each. Enemy actions are announced before they happen.','護理牌提供防護並產生「證據」。程式攻擊每次最多消耗 2 證據，每點增加 2 傷害。敵人會提前公布下回合行動。')}</p>
      </section>}
      {(run.phase==='review'||run.phase==='denied')&&<div className="dm-paper-stage">
        <div className="dm-counter"><span>{copy(language,'CLASSIFICATION OFFICE','職業分類局')}</span><span>DAY 001 · 08:00</span></div>
        <div className="dm-paper">
          <div className="dm-paper-corner">№ 0000451</div>
          <div className="dm-seal"><span>DOC</span><small>APPROVED?</small></div>
          <div className="dm-paper-head">{copy(language,'PERSONNEL RECORD','人事登錄表')}</div>
          <div className="dm-divider"/>
          <div className="dm-fields">
            <div><small>{copy(language,'SUBJECT','受審者')}</small><strong>ERIC TUNG</strong></div>
            <div><small>{copy(language,'ACADEMIC RECORD','學歷')}</small><strong>NTU · B.S. NURSING</strong></div>
            <div><small>{copy(language,'OCCUPATION','職業')}</small><strong>SOFTWARE ENGINEER</strong></div>
            <div><small>{copy(language,'SPECIALIZATION','專長')}</small><strong>BACKEND / AI / CLINICAL</strong></div>
          </div>
          <div className="dm-divider"/>
          <div className="dm-prompt">{copy(language,'SELECT ONE CLASSIFICATION','請選擇一項分類')}</div>
          <div className="dm-choices">
            <button type="button" onClick={()=>setRun(g=>reject(g,'ENGINEER'))}>{copy(language,'ENGINEER','工程師')}</button>
            <button type="button" onClick={()=>setRun(g=>reject(g,'NURSE'))}>{copy(language,'NURSE','護理師')}</button>
            <button type="button" onClick={()=>setRun(g=>reject(g,'OTHER'))}>{copy(language,'OTHER','其他')}</button>
          </div>
          {run.phase==='denied'&&<div className="dm-rejection" role="status">
            <div className="dm-stamp">REJECTED</div>
            <p>{run.role==='ENGINEER'?copy(language,'DEGREE DOES NOT MATCH OCCUPATION.','學位與職業不相符。'):
            run.role==='NURSE'?copy(language,'EMPLOYMENT RECORDS CONTAIN UNAUTHORIZED SOFTWARE.','就業紀錄包含未經授權的軟體工程。'):
            copy(language,'OTHER IS NOT A RECOGNIZED CLASSIFICATION.','「其他」不是合法的職業類別。')}</p>
            <div className="dm-reject-actions">
              <button type="button" onClick={()=>setRun(reclassify)}>{copy(language,'RECLASSIFY','重新分類')}</button>
              <button type="button" className="dm-appeal" onClick={()=>setRun(startAppeal)}>{copy(language,'FILE APPEAL','提出申訴')} ▸</button>
            </div>
          </div>}
          <div className="dm-paper-foot">FORM 17-C · {copy(language,'ALL FIELDS MANDATORY','所有欄位均需填寫')}</div>
        </div>
        <div className="dm-desk-bottom"><span>MINISTRY OF APPROPRIATE TITLES</span><span>EST. 19██</span></div>
      </div>}
      {inDungeon&&<div className="dm-play-area">
        <div className="dm-status">
          <div><span className="dm-tag">CASE 0451</span><span>FLOOR 01</span><span>{orientation(run)}</span></div>
          <span>{run.dossiers.length}/2 {copy(language,'FILES','檔案')} · {run.defeated.length}/3 {copy(language,'RULINGS','判決')}</span>
        </div>
        <div className={'dm-viewport '+(run.phase==='battle'?'dm-viewport-combat':'')}>
          <canvas ref={canvas} width={320} height={200} role="img" aria-label={copy(language,'Low-resolution first-person maze.','低解析度第一人稱迷宮。')}/>
          {run.phase==='battle'&&currentFoe&&currentIntent&&<div className="dm-encounter" role="group" aria-label={name(language,currentFoe.name)}>
            <div className="dm-encounter-top">
              <span className="dm-encounter-name">{name(language,currentFoe.name)}</span>
              <span className="dm-encounter-hp">HP {run.foeHp}/{currentFoe.hp}</span>
            </div>
            <div className="dm-encounter-portrait" key={run.foe+'-'+run.foeHp+'-'+run.foeBlock}>
              <EnemySprite id={run.foe as 'gatekeeper'|'auditor'|'engine'} language={language}/>
            </div>
            <div className="dm-encounter-intent">
              <span>{copy(language,'NEXT','下一步')} ▸ {name(language,currentIntent.name)}</span>
              <strong>{currentIntent.kind==='attack'?'-'+currentIntent.amount+' HP':currentIntent.kind==='guard'?'+'+currentIntent.amount+' ARMOR':'MISFILED +1'}</strong>
              {run.foeInterrupted&&<small>INTERRUPTED / 已中斷</small>}
            </div>
          </div>}
          <div className="dm-viewport-label">{orientation(run)}</div>
          <div className="dm-viewport-flag">{run.dossiers.length}/2 · DOC</div>
        </div>
        <div className="dm-hud">
          <div className="dm-vitals">
            <div className="dm-vitals-top"><strong>ERIC</strong><span>HP {run.hp}/{run.maxHp}</span></div>
            <div className="dm-meter"><span style={{width:run.hp/run.maxHp*100+'%'}}/></div>
            <div className="dm-passive">{copy(language,'NURSING TRAINING · RECOVER +5 HP AFTER VICTORY','護理訓練 · 戰鬥勝利後恢復 5 HP')}</div>
          </div>
          {canMove&&<div className="dm-transport">
            <div className="dm-pad">
              <span/><button type="button" onClick={()=>change('forward')} aria-label="Forward">▲</button><span/>
              <button type="button" onClick={()=>change('left')} aria-label="Turn left">◀</button>
              <button type="button" onClick={()=>change('back')} aria-label="Back">▼</button>
              <button type="button" onClick={()=>change('right')} aria-label="Turn right">▶</button>
            </div>
            <div className="dm-controls-text">
              <p>WASD / ↑↓←→</p>
              <button type="button" onClick={()=>setShowMap(v=>!v)}>{copy(language,showMap?'HIDE MAP [M]':'MAP [M]',showMap?'關閉地圖 [M]':'地圖 [M]')}</button>
            </div>
          </div>}
        </div>
        {showMap&&canMove&&<MiniMap run={run} language={language}/>}
        {run.phase==='maze'&&<div className="dm-console" role="status"><span>▸</span> {run.message||copy(language,'FIND EVIDENCE · CHALLENGE THE OFFICE','尋找證據，挑戰審查局。')}</div>}
        {run.phase==='battle'&&currentFoe&&currentIntent&&<section className="dm-battle" aria-label={copy(language,'Card combat','卡牌戰鬥')}>
          <div className="dm-fight-dialogue">{name(language,currentFoe.intro)}</div>
          <div className="dm-battle-resources">
            <span>{copy(language,'ENERGY','行動力')} {'■'.repeat(run.energy)}{'□'.repeat(3-run.energy)}</span>
            <span>{copy(language,'EVIDENCE','證據')} <strong>{run.evidence}/6</strong></span>
            <span>{copy(language,'BLOCK','護盾')} {run.block}</span>
            <span>{copy(language,'ENEMY ARMOR','敵方護甲')} {run.foeBlock}</span>
            {run.foeExposed>0&&<span>{copy(language,'EXPOSED','弱點')} {run.foeExposed}</span>}
            {run.riskScreened>0&&<span>{copy(language,'RISK SCREEN','風險控管')} {run.riskScreened}</span>}
            {run.misfiled>0&&<span className="dm-misfiled">MISFILED {run.misfiled}</span>}
          </div>
          <div className="dm-combo-guide">{copy(language,'CARE → EVIDENCE → CODE: EACH EVIDENCE ADDS +2 TO A CODE HIT','護理 → 證據 → 程式攻擊：每點證據可讓程式攻擊 +2 傷害')}</div>
          <div className="dm-hand">
            {run.hand.map((id,i)=><CardButton key={id+'-'+i} id={id} index={i} language={language} disabled={CARDS[id].cost>run.energy} onClick={()=>setRun(g=>play(g,i))}/>)}
          </div>
          <div className="dm-battle-bottom">
            <span aria-live="polite">{run.message||copy(language,'CHOOSE AN ACTION','選擇行動')}</span>
            <button type="button" onClick={()=>setRun(endTurn)}>{copy(language,'END TURN [ENTER]','結束回合 [ENTER]')} ▸</button>
          </div>
        </section>}
        {run.phase==='reward'&&<section className="dm-result">
          <div className="dm-result-stamp">INSPECTION PASSED</div>
          <p>{copy(language,'NURSING PASSIVE: +5 HP. SELECT A NEW PROCEDURE.','護理被動：恢復 5 HP。選擇一個新行動。')}</p>
          <div className="dm-reward-cards">
            {run.reward.map(id=><CardButton key={id} id={id} language={language} onClick={()=>setRun(g=>chooseReward(g,id))}/>)}
          </div>
          <div className="dm-skip"><button type="button" onClick={()=>setRun(g=>chooseReward(g,null))}>{copy(language,'KEEP DECK AS IS','維持現有牌組')}</button></div>
        </section>}
        {run.phase==='record'&&<section className="dm-record">
          <div className="dm-record-head"><span>EXHIBIT {run.record==='A'?'01':'02'}</span><span>VERIFIED</span></div>
          <h2>{document.title}</h2>
          <p>{document.description[0]}</p>
          <div className="dm-stack">{document.stack.slice(0,6).join(' / ')}</div>
          <div className="dm-record-buttons">
            <a href={document.link} target="_blank" rel="noreferrer">{copy(language,'VIEW SOURCE','查看原始碼')} ↗</a>
            <button type="button" onClick={()=>setRun(recordFile)}>{copy(language,'FILE EVIDENCE','提交證據')} ▸</button>
          </div>
        </section>}
        {run.phase==='event'&&<section className="dm-event">
          <div className="dm-record-head"><span>DEPARTMENT MEMO</span><span>№ {String(progress(run)+1).padStart(3,'0')}</span></div>
          <h2>{name(language,EVENT_TEXT[run.event].name)}</h2>
          <p>{name(language,EVENT_TEXT[run.event].story)}</p>
          <div className="dm-event-actions">
            {EVENT_TEXT[run.event].options.map((item,i)=><button key={i} type="button" onClick={()=>setRun(g=>resolveEvent(g,i as 0|1))}>{name(language,item)}</button>)}
          </div>
        </section>}
        <footer className="dm-maze-footer"><span>DEPARTMENT OF OCCUPATIONAL CLASSIFICATION</span><span>{copy(language,'SAVED LOCALLY · NO LOGIN','本機自動存檔 · 無須登入')}</span></footer>
      </div>}
      {(run.phase==='dead'||run.phase==='clear')&&<div className="dm-ending">
        <div className="dm-end-code">{run.phase==='clear'?'ERR_409':'ERR_404'}</div>
        <h1>{run.phase==='clear'?copy(language,'UNCLASSIFIABLE','無法分類'):copy(language,'APPLICATION TERMINATED','申請已終止')}</h1>
        <div className="dm-end-seal">{run.phase==='clear'?'APPROVED':'REJECTED'}</div>
        {run.phase==='clear'&&<div className="dm-broken-form" aria-label={copy(language,'Classification field erased','職業分類欄位已被刪除')}>
          <div><span>PERSONNEL RECORD / ERIC TUNG</span><span>FILE 0451</span></div>
          <p>{copy(language,'OCCUPATION','職業類別')}: <s>ONE CATEGORY REQUIRED</s></p>
          <strong>ERR: FIELD_NOT_FOUND</strong>
        </div>}
        <p>{run.phase==='clear'?copy(language,'Section 0451 has been invalidated. The occupation field has been removed.','第 0451 條已被撤銷。「職業類別」欄位已自系統移除。'):
          copy(language,'Appeals may be refiled. All records remain public.','可以重新提出申訴。所有作品紀錄仍可查閱。')}</p>
        <div className="dm-end-actions">
          <button type="button" onClick={restart}>{copy(language,'NEW APPLICATION','重新申請')}</button>
          <button type="button" onClick={()=>onNavigate('portfolio')}>{copy(language,'VIEW PROJECTS','查看作品')}</button>
          <a href={language==='en'?RESUME:RESUME_ZH} target="_blank" rel="noreferrer">CV ↗</a>
        </div>
      </div>}
      <div className="dm-bottom"><span>ERIC TUNG</span><span>BACKEND · AI · NURSING</span><span>© 2026</span></div>
    </div>
  </main>;
}