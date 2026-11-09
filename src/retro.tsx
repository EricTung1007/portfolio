import { useEffect, useRef, useState } from 'react';
import { getPosts } from './posts.js';
import './retro.css';

export type SiteLanguage = 'en' | 'zh';
export type VisitorData = { visited: string[]; posts: string[]; commands: string[]; achievements: string[]; punched: boolean };
const KEY = 'eric_visitor_v1';
const EMPTY: VisitorData = { visited: [], posts: [], commands: [], achievements: [], punched: false };
const unique = (values: string[]) => [...new Set(values)];
const definedAchievements = [
  ['first-contact','First Contact','初次連線','Open the workstation'],
  ['desk-inspector','Desk Inspector','桌面調查員','Explore three desk objects'],
  ['archive-diver','Archive Diver','檔案潛水員','Read three different articles'],
  ['night-reader','Night Reader','夜間讀者','Switch to dark mode'],
  ['command-line','Command Line Tourist','命令列旅客','Use the terminal'],
  ['operator','Operator','操作員','Try five commands'],
  ['easter-hunter','Easter Hunter','彩蛋獵人','Find a secret command'],
  ['systems-thinker','Systems Thinker','系統思考者','Read a Minerva\'s Den article'],
  ['benchmarker','Benchmarker','效能測試員','Read the local inference experiment'],
  ['stamped-in','Stamped In','正式登錄','Generate a visitor punch card'],
  ['kindly-request','Would You Kindly','請問你願意嗎','Discover the hidden directive'],
] as const;
export function useVisitor() {
  const [data,setData] = useState<VisitorData>(() => {
    try { const saved = JSON.parse(localStorage.getItem(KEY) || '{}');
      return { ...EMPTY, visited: Array.isArray(saved.visited) ? saved.visited : [], posts: Array.isArray(saved.posts) ? saved.posts : [], commands: Array.isArray(saved.commands) ? saved.commands : [], achievements: Array.isArray(saved.achievements) ? saved.achievements : [], punched: saved.punched === true };
    } catch { return EMPTY; }
  });
  const [newBadge,setNewBadge] = useState('');
  const previousBadges=useRef<string[]>(data.achievements);
  useEffect(()=>{
    const gained=data.achievements.find(id=>!previousBadges.current.includes(id));
    previousBadges.current=data.achievements;
    if(gained)setNewBadge(gained);
  },[data.achievements]);
  const update = (mutate: (old: VisitorData)=>VisitorData) => setData(old => {
    const next=mutate(old);
    const unlocked = unique([
      ...(next.visited.length ? ['first-contact'] : []),
      ...(next.visited.length >= 3 ? ['desk-inspector'] : []),
      ...(next.posts.length >= 3 ? ['archive-diver'] : []),
      ...(next.commands.length ? ['command-line'] : []),
      ...(next.commands.length >= 5 ? ['operator'] : []),
      ...(next.commands.some(c=>['xyzzy','bioshock','sudo hire-eric','make coffee','would you kindly'].includes(c)) ? ['easter-hunter'] : []),
      ...(next.posts.some(s=>getPosts().find(p=>p.slug===s)?.category==="Minerva's Den") ? ['systems-thinker'] : []),
      ...(next.posts.includes('local-inference-32gb') ? ['benchmarker'] : []),
      ...(next.punched ? ['stamped-in'] : []),
      ...(next.commands.includes('would you kindly') ? ['kindly-request'] : []),
      ...next.achievements,
    ]);
    const out={...next,achievements:unlocked};
    try{localStorage.setItem(KEY,JSON.stringify(out));}catch{/* private storage */}
    return out;
  });
  const visit=(name:string)=>update(p=>({...p,visited:unique([...p.visited,name])}));
  const read=(slug:string)=>update(p=>({...p,posts:unique([...p.posts,slug])}));
  const command=(text:string)=>update(p=>({...p,commands:unique([...p.commands,text])}));
  const punch=()=>update(p=>({...p,punched:true}));
  const night=()=>update(p=>({...p,achievements:unique([...p.achievements,'night-reader'])}));
  return {data,visit,read,command,punch,night,newBadge,clearBadge:()=>setNewBadge('')};
}
export type VisitorActions = ReturnType<typeof useVisitor>;
const labels=(language:SiteLanguage,en:string,zh:string)=>language==='zh'?zh:en;

export function BootSequence({onDone,language}:{onDone:()=>void;language:SiteLanguage}) {
  const [step,setStep]=useState(0);
  useEffect(()=>{ if(window.matchMedia('(prefers-reduced-motion: reduce)').matches) { onDone(); return; }
    const id=window.setInterval(()=>setStep(p=>Math.min(p+1,4)),260);
    return ()=>window.clearInterval(id);
  },[onDone]);
  return <div className="retro-boot" role="dialog" aria-modal="true" aria-label="ERIC.EXE boot sequence" onKeyDown={e=>{if(e.key==='Escape'||e.key==='Enter')onDone();}}>
    <div className="retro-boot-screen"><span>ERIC.EXE / SYSTEM INITIALIZATION</span><h1>ERIC.EXE</h1>
      {['INITIALIZING WORKSPACE','MOUNTING PROJECT ARCHIVE','LOADING MINERVA NODE','STARTING INFORMATION DESK','VISITOR SESSION READY'].slice(0,step+1).map((s,i)=><p key={s}>{s}<b>{i===4?'READY':'OK'}</b></p>)}
      <button type="button" onClick={onDone}>{labels(language,'SKIP / ENTER WORKSTATION','略過／進入工作站')} ↵</button>
    </div>
  </div>;
}

type DeskTarget='chat'|'portfolio'|'weekly'|'terminal'|'achievements'|'punch'|'cabinet'|'timeline'|'experiments'|'editorial'|'guestbook';
export function InteractiveDesk({language,onOpen,visitor}:{language:SiteLanguage;onOpen:(target:DeskTarget)=>void;visitor:VisitorActions}) {
  const items:{id:DeskTarget;icon:string;en:string;zh:string;detail:string}[]=[
    {id:'chat',icon:'▣',en:'INFORMATION DESK',zh:'資訊台',detail:'ASK ERIC'},
    {id:'weekly',icon:'▤',en:'THE WEEKLY',zh:'個人週刊',detail:'LATEST EDITION'},
    {id:'terminal',icon:'>_',en:'TERMINAL',zh:'終端機',detail:'ERIC.EXE'},
    {id:'portfolio',icon:'▥',en:'FILE CABINET',zh:'檔案櫃',detail:'PROJECTS / CV'},
    {id:'achievements',icon:'✦',en:'STAMPS',zh:'成就簿',detail:'VISITOR LEDGER'},
    {id:'punch',icon:'▦',en:'CARD PUNCH',zh:'打孔卡機',detail:'12-ROW CARD'},
    {id:'cabinet',icon:'▤',en:'ARCHIVE CABINET',zh:'實體檔案櫃',detail:'FILES / DRAWERS'},
    {id:'timeline',icon:'◷',en:'CHRONICLE',zh:'專案年表',detail:'PROJECT HISTORY'},
    {id:'experiments',icon:'▦',en:'EXPERIMENT LEDGER',zh:'實驗紀錄簿',detail:'VERIFIED METRICS'},
    {id:'editorial',icon:'✎',en:'EDITORIAL DESK',zh:'編輯工作台',detail:'WRITE / REVISE'},
    {id:'guestbook',icon:'✉',en:'GUESTBOOK',zh:'訪客簽到簿',detail:'SIGNED ENTRIES'},
  ];
  return <section className="retro-desktop" aria-label="Interactive workstation desktop">
    <div className="retro-desk-header"><span>ERIC.EXE / PERSONAL WORKSTATION</span><span>MINERVA NODE 001 · 32GB</span></div>
    <div className="retro-desk-intro"><p>EST. 2026 / THE CENTRAL BUREAU</p><h2>{labels(language,'Welcome to the desk.','歡迎來到資訊台。')}</h2><span>{labels(language,'Select an object to explore the workstation.','選擇桌上的物件，探索這個工作站。')}</span></div>
    <div className="retro-desk-surface">{items.map(item=><button key={item.id} className={'retro-object retro-object-'+item.id} onClick={()=>{visitor.visit(item.id);onOpen(item.id);}}>
      <span className="retro-object-icon" aria-hidden="true">{item.icon}</span><span className="retro-object-label">{labels(language,item.en,item.zh)}</span><small>{item.detail}</small></button>)}</div>
    <div className="retro-desk-footer"><span>{labels(language,'LOCAL-FIRST · EXPLORE THE OBJECTS','本地優先 · 探索桌面物件')}</span><span>{visitor.data.achievements.length} / {definedAchievements.length} STAMPS</span></div>
  </section>;
}
type TerminalProps={language:SiteLanguage;visitor:VisitorActions;navigate:(target:DeskTarget)=>void;onTheme:(theme:'dark'|'light')=>void;onLanguage:(language:SiteLanguage)=>void;onClose:()=>void};
export function TerminalWindow({language,visitor,navigate,onTheme,onLanguage,onClose}:TerminalProps) {
  const [entry,setEntry]=useState('');
  const [history,setHistory]=useState<{input:string;output:string}[]>([{input:'',output:'ERIC.EXE TERMINAL v1.0\nType help for available commands.'}]);
  const [secret,setSecret]=useState(false);
  const inputRef=useRef<HTMLInputElement>(null);
  const outputRef=useRef<HTMLDivElement>(null);
  useEffect(()=>{outputRef.current?.scrollTo({top:outputRef.current.scrollHeight,behavior:'smooth'});},[history]);
  const run=(raw:string)=>{
    const cmd=raw.trim().toLowerCase().replace(/\s+/g,' ').replace(/[?？。！!]+$/g,'');
    setEntry(''); if(!cmd)return;
    visitor.command(cmd);
    const text=labels(language,'Commands: help, whoami, ls, projects, weekly, cabinet, timeline, experiments, editorial, guestbook, resume, contact, achievements, punchcard, open minerva, open desk, theme dark/light, lang en/zh, clear','指令：help、whoami、ls、projects、weekly、cabinet、timeline、experiments、editorial、guestbook、resume、contact、achievements、punchcard、open minerva、open desk、theme dark/light、lang en/zh、clear');
    const actions:Record<string,()=>string>={
      help:()=>text,whoami:()=> 'Eric Tung / Software · AI · Research',
      ls:()=> 'portfolio/  weekly/  minervas-den/  cabinet/  timeline/  experiments/  editorial/  guestbook/  achievements/  punchcard/',
      cabinet:()=>{navigate('cabinet');return 'Opening filing cabinet...'},
      timeline:()=>{navigate('timeline');return 'Opening project chronicle...'},
      experiments:()=>{navigate('experiments');return 'Opening benchmark ledger...'},
      editorial:()=>{navigate('editorial');return 'Opening editorial desk...'},
      guestbook:()=>{navigate('guestbook');return 'Opening guestbook...'},
      projects:()=>{navigate('portfolio');return 'Opening project ledger...'},
      resume:()=>{navigate('portfolio');return 'Opening portfolio...'},
      weekly:()=>{navigate('weekly');return 'Opening newspaper...'},
      'open weekly':()=>{navigate('weekly');return 'Opening newspaper...'},
      'open minerva':()=>{navigate('weekly');return 'Minerva’s Den articles are filed in the Weekly.'},
      'open desk':()=>{navigate('chat');return 'Opening information desk...'},
      achievements:()=>{navigate('achievements');return 'Opening achievement ledger...'},
      punchcard:()=>{navigate('punch');return 'Starting punch-card machine...'},
      contact:()=> 'GitHub: github.com/EricTung1007',
      'theme dark':()=>{onTheme('dark');return 'Dark mode enabled.'},
      'theme light':()=>{onTheme('light');return 'Light mode enabled.'},
      'lang en':()=>{onLanguage('en');return 'Language set to English.'},
      'lang zh':()=>{onLanguage('zh');return '語言已切換為繁體中文。'},
      xyzzy:()=> 'Nothing happens. Or does it?',
      bioshock:()=> 'Welcome to Rapture. Would you kindly explore the archives?',
      'would you kindly':()=>{setSecret(true);return labels(language,'CODE PHRASE RECOGNIZED. Directive overridden. You are free to choose. Classified drawer 0451 is now available below.','已識別隱藏口令。指令已解除，你仍保有選擇權。機密抽屜 0451 已在下方開啟。');},
      'open 0451':()=>{navigate('cabinet');return 'Opening drawer 0451...'},
      'sudo hire-eric':()=> 'Permission granted. Please contact Eric.',
      'make coffee':()=> 'Error 418: I am a teapot.',
    };
    if(cmd==='clear'){setHistory([]);return;}
    setHistory(p=>[...p,{input:raw,output:actions[cmd]?.()??'Command not found. Type help.'}].slice(-70));
  };
  return <section className="retro-window" aria-label="ERIC.EXE terminal"><div className="retro-window-bar"><strong>▣ ERIC.EXE TERMINAL</strong><button onClick={onClose} aria-label="Close terminal">×</button></div>
    <div className="retro-terminal-output" ref={outputRef} role="log" aria-live="polite">{history.map((h,i)=><div key={i}>{h.input&&<p><span>eric@minerva:~ %</span> {h.input}</p>}<pre>{h.output}</pre></div>)}</div>
    <form className="retro-terminal-prompt" onSubmit={e=>{e.preventDefault();run(entry);}}><label htmlFor="retro-input">eric@minerva:~ %</label><input id="retro-input" ref={inputRef} value={entry} onChange={e=>setEntry(e.target.value)} autoComplete="off" spellCheck={false} aria-label="Terminal command"/><button type="submit">↵</button></form>
    {secret && <div className="retro-secret" role="status"><strong>FILE 0451 · CLASSIFIED</strong><p>{labels(language,'The most important command is one you choose yourself.','最重要的指令，是你自己決定要執行的指令。')}</p><button type="button" onClick={()=>navigate('cabinet')}>{labels(language,'OPEN SECRET ARCHIVES →','開啟秘密檔案 →')}</button></div>}
    <p className="retro-terminal-note">{labels(language,'Safe simulated commands; no shell access.','安全的模擬命令，不提供真實 Shell 權限。')}</p>
  </section>;
}
export function AchievementPanel({language,visitor,onClose}:{language:SiteLanguage;visitor:VisitorActions;onClose:()=>void}) {
  return <section className="retro-ledger"><div className="retro-panel-head"><span>VISITOR ACHIEVEMENT LEDGER</span><button onClick={onClose}>×</button></div>
    <h2>{labels(language,'Your collection','你的成就收藏')}</h2><p>{visitor.data.achievements.length} / {definedAchievements.length} {labels(language,'stamps collected','個印章已蒐集')}</p>
    <div className="retro-badge-grid">{definedAchievements.map(([id,en,zh,detail])=><div key={id} className={'retro-badge '+(visitor.data.achievements.includes(id)?'unlocked':'locked')}><span aria-hidden="true">{visitor.data.achievements.includes(id)?'✷':'○'}</span><strong>{labels(language,en,zh)}</strong><small>{detail}</small></div>)}</div>
    <p className="retro-ledger-note">{labels(language,'Progress is stored only in your browser.','成就進度只儲存在你的瀏覽器。')}</p>
  </section>;
}
const ROWS=['12','11','0','1','2','3','4','5','6','7','8','9'];
const cardBits=(visitor:VisitorData,alias:string,role:string,interest:string)=>{
  const payload=JSON.stringify({alias,role,interest,visited:visitor.visited.slice().sort(),posts:visitor.posts.slice().sort(),achievements:visitor.achievements.slice().sort()});
  const bytes=new TextEncoder().encode(payload);
  let h=2166136261;for(const b of bytes){h^=b;h=Math.imul(h,16777619);}
  return Array.from({length:40},(_,i)=>{let x=(h^(Math.imul(i+1,2654435761)))>>>0;x^=x>>>16;x=Math.imul(x,2246822507);return (x>>>0)%ROWS.length;});
};
export function punchSvg(visitor:VisitorData,alias:string,role:string,interest:string) {
 const encode=(s:string)=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
 const positions=cardBits(visitor,alias,role,interest);
 const holes=positions.map((row,col)=>`<rect x="${119+col*23}" y="${148+row*22}" width="12" height="14" rx="2" fill="#f8f4e8" stroke="#aa9a7d" stroke-width="0.6"/>`).join('');
 const grid=ROWS.map((r,i)=>`<text x="41" y="${158+i*22}" font-size="12" font-family="monospace" fill="#604f3a">${r}</text><line x1="100" x2="1050" y1="${160+i*22}" y2="${160+i*22}" stroke="#c6b799" stroke-width=".7"/>`).join('');
 const cols=Array.from({length:40},(_,i)=>`<text x="${124+i*23}" y="132" text-anchor="middle" font-size="9" fill="#6d604c" font-family="monospace">${String(i+1).padStart(2,'0')}</text>`).join('');
 return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1100 490" width="1100" height="490"><rect width="1100" height="490" fill="#efe0bf"/><rect x="14" y="14" width="1072" height="462" rx="8" fill="none" stroke="#6b573d" stroke-width="2"/><text x="40" y="62" font-size="30" font-weight="bold" font-family="Georgia,serif" fill="#473522">MINERVA'S DEN / VISITOR PUNCH CARD</text><text x="42" y="88" font-size="14" font-family="monospace" fill="#604f3a">ERIC.EXE · PERSONAL WORKSTATION · 12 ROWS / 40 COLUMNS</text><text x="42" y="112" font-size="13" font-family="monospace" fill="#604f3a">ALIAS: ${encode(alias.slice(0,28))}  /  CLASS: ${encode(role)}  /  INTEREST: ${encode(interest)}</text>${grid}${cols}${holes}<line x1="40" x2="1060" y1="426" y2="426" stroke="#887358"/><text x="42" y="453" font-size="13" font-family="monospace" fill="#604f3a">ACHIEVEMENTS ${String(visitor.achievements.length).padStart(2,'0')}  ·  ARTICLES ${String(visitor.posts.length).padStart(2,'0')}  ·  PERSONAL LOCAL RECORD</text><text x="1044" y="453" text-anchor="end" font-size="13" font-family="monospace" fill="#604f3a">NOT A REAL ACCESS CREDENTIAL</text></svg>`;
}
export function PunchCard({language,visitor,onClose}:{language:SiteLanguage;visitor:VisitorActions;onClose:()=>void}) {
  const [alias,setAlias]=useState('VISITOR');
  const [role,setRole]=useState('RESEARCHER');
  const [interest,setInterest]=useState('AI');
  const svg=punchSvg(visitor.data,alias,role,interest);
  const download=()=>{
    visitor.punch();
    const blob=new Blob([svg],{type:'image/svg+xml;charset=utf-8'});
    const url=URL.createObjectURL(blob);
    const a=document.createElement('a');a.href=url;a.download='minervas-den-visitor-card.svg';document.body.appendChild(a);a.click();a.remove();window.setTimeout(()=>URL.revokeObjectURL(url),1000);
  };
  return <section className="retro-card-machine"><div className="retro-panel-head"><span>MINERVA CARD PUNCH / UNIT 12</span><button onClick={onClose}>×</button></div>
    <h2>{labels(language,'Punch your visitor card','製作你的訪客打孔卡')}</h2><p>{labels(language,'A 12-row collectible encoded from your local visit. Not an identity or access credential.','依照你本機的探索紀錄製作 12 列紀念打孔卡，並非身分或通行證。')}</p>
    <div className="retro-card-fields"><label>{labels(language,'Alias','暱稱')}<input maxLength={28} value={alias} onChange={e=>setAlias(e.target.value.replace(/[<>]/g,''))}/></label>
      <label>{labels(language,'Visitor class','訪客類別')}<select value={role} onChange={e=>setRole(e.target.value)}><option>VISITOR</option><option>RESEARCHER</option><option>OPERATOR</option><option>ARCHIVIST</option></select></label>
      <label>{labels(language,'Interest','興趣')}<select value={interest} onChange={e=>setInterest(e.target.value)}><option>AI</option><option>AGENTS</option><option>DESIGN</option><option>RESEARCH</option><option>SYSTEMS</option></select></label></div>
    <div className="retro-card-preview" role="img" aria-label="Personal 12-row punch card" dangerouslySetInnerHTML={{__html:svg}}/>
    <div className="retro-card-actions"><button onClick={download}>{labels(language,'PUNCH & SAVE SVG','打孔並儲存 SVG')}</button><button onClick={()=>window.print()}>{labels(language,'PRINT CARD','列印卡片')}</button></div>
    <small>{labels(language,'Holes use a deterministic thematic encoding, not historical Hollerith text encoding.','孔位使用固定的主題編碼，而非傳統 Hollerith 文字編碼。')}</small>
  </section>;
}
export function BadgeToast({name,language,onDismiss}:{name:string;language:SiteLanguage;onDismiss:()=>void}) {
 const item=definedAchievements.find(a=>a[0]===name);
 useEffect(()=>{if(!name)return;const t=window.setTimeout(onDismiss,3800);return()=>window.clearTimeout(t);},[name,onDismiss]);
 if(!item)return null;
 return <div className="retro-toast" role="status"><span>✷</span><div><small>ACHIEVEMENT UNLOCKED</small><strong>{labels(language,item[1],item[2])}</strong></div><button onClick={onDismiss} aria-label="Dismiss">×</button></div>;
}
