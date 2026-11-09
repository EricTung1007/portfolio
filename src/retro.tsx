import { useEffect, useRef, useState } from 'react';
import { getPosts } from './posts.js';
import { terminalRecord, type TerminalFile } from './terminal-files.js';
import { isDrawerUnlocked, unlockDrawer, drawerNote } from './secret.js';
import { readTableCard, saveTableCard, guestbookUrl, siteQrSvg } from './visitor-card.js';
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
  ['golden-card','The Golden Card','金色打孔卡','Discover the 0451 special card'],
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
      ...(next.commands.includes('0451') ? ['golden-card'] : []),
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
const TERMINAL_COMMANDS = [
  'help','resume','cv','download cv','projects','portfolio','weekly','paper','archive','cabinet',
  'research','timeline','experiments','publications','ask','about','contact','message','leave message',
  'punchcard','guestbook','achievements','editorial','theme dark','theme light','lang en','lang zh',
  '0451','would you kindly','open 0451','whoami','ls','clear','xyzzy','bioshock','make coffee','sudo hire-eric',
] as const;

export function TerminalWindow({language,visitor,navigate,onTheme,onLanguage,onClose}:TerminalProps) {
  const [entry,setEntry]=useState('');
  const [history,setHistory]=useState<{input:string;output:string}[]>([
    {input:'',output:labels(language,'ERIC TERMINAL / USER SESSION READY\nThe owner is away. Browse his files or leave a message.','ERIC 終端機 / 訪客連線就緒\n主人暫時不在。你可以翻閱資料，或留下訊息。')}]);
  const [booting,setBooting]=useState(()=>sessionStorage.getItem('eric_terminal_booted')!=='1');
  const [bootStep,setBootStep]=useState(0);
  const [secret,setSecret]=useState(()=>localStorage.getItem('eric_0451_unlocked')==='1');
  const [selected,setSelected]=useState(0);
  const inputRef=useRef<HTMLInputElement>(null);
  const outputRef=useRef<HTMLDivElement>(null);
  const choices = TERMINAL_COMMANDS.filter(cmd=>!entry.trim()||cmd.startsWith(entry.trim().toLowerCase()))
    .filter(cmd=>!['0451','would you kindly','open 0451','xyzzy','bioshock','sudo hire-eric'].includes(cmd))
    .slice(0,entry.trim()?6:7);
  const finishBoot=()=>{
    try{sessionStorage.setItem('eric_terminal_booted','1');}catch{/* storage disabled */}
    setBooting(false);
  };
  useEffect(()=>{
    if(!booting){inputRef.current?.focus();return;}
    if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){finishBoot();return;}
    const timer=window.setInterval(()=>setBootStep(x=>Math.min(x+1,5)),260);
    return ()=>window.clearInterval(timer);
  },[booting]);
  useEffect(()=>{
    if(!booting || bootStep<5)return;
    const timer=window.setTimeout(finishBoot,560);
    return ()=>window.clearTimeout(timer);
  },[booting,bootStep]);
  useEffect(()=>{outputRef.current?.scrollTo({top:outputRef.current.scrollHeight,behavior:'smooth'});},[history]);
  const run=(raw:string)=>{
    const cmd=raw.trim().toLowerCase().replace(/\s+/g,' ').replace(/[?？。！!]+$/g,'');
    if(!cmd)return;
    setEntry('');setSelected(0);
    visitor.command(cmd);
    const go=(target:DeskTarget,message:string)=>{navigate(target);return message;};
    const cvUrl=`${import.meta.env.BASE_URL}CV.pdf`;
    const actions:Record<string,()=>string>={
      help:()=>labels(language,
        'FILES: resume / cv, projects, weekly / paper, archive, research, publications, timeline, experiments.\nMACHINES: ask, message / punchcard, contact, guestbook.\nSYSTEM: theme dark/light, lang en/zh, achievements, clear, ls, whoami.\nSelect any suggestion or press TAB to autocomplete.',
        '檔案：resume / cv、projects、weekly / paper、archive、research、publications、timeline、experiments。\n機器：ask、message / punchcard、contact、guestbook。\n系統：theme dark/light、lang en/zh、achievements、clear、ls、whoami。\n可點選指令建議，或按 Tab 自動補全。'),
      whoami:()=> 'ERIC TUNG / Software Engineering / Nursing / AI',
      ls:()=> 'resume.pdf   weekly/   projects/   archive/   research/   messages/',
      resume:()=>{window.open(cvUrl,'_blank','noopener,noreferrer');return labels(language,'Opening Eric’s public CV.pdf in a new tab.','已在新分頁開啟 Eric 的 CV.pdf。');},
      cv:()=>actions.resume(),
      'download cv':()=>{const a=document.createElement('a');a.href=cvUrl;a.download='Eric-Tung-CV.pdf';a.click();return 'Downloading CV.pdf...';},
      projects:()=>go('cabinet','Opening project archives...'),
      portfolio:()=>go('portfolio','Opening work history...'),
      weekly:()=>go('weekly','Opening newspaper...'),
      paper:()=>actions.weekly(),
      archive:()=>go('cabinet','Opening filing cabinet...'),
      cabinet:()=>actions.archive(),
      research:()=>go('cabinet','Opening research records...'),
      timeline:()=>go('timeline','Opening project timeline...'),
      experiments:()=>go('experiments','Opening experiment ledger...'),
      publications:()=>go('portfolio','Opening published record...'),
      ask:()=>go('chat','Connecting to the MARK I answering machine...'),
      about:()=>go('chat','Connecting to the information recorder...'),
      contact:()=>{window.location.href='mailto:erictung911007@gmail.com';return 'Preparing a message for Eric...';},
      message:()=>go('punch','Opening the visitor message-card machine...'),
      'leave message':()=>actions.message(),
      punchcard:()=>actions.message(),
      guestbook:()=>go('guestbook','Opening public visitor guestbook...'),
      achievements:()=>go('achievements','Opening the visitor stamp ledger...'),
      editorial:()=>go('editorial','Opening editorial desk...'),
      'theme dark':()=>{onTheme('dark');return 'Night lighting enabled.';},
      'theme light':()=>{onTheme('light');return 'Day lighting enabled.';},
      'lang en':()=>{onLanguage('en');return 'Language: English.';},
      'lang zh':()=>{onLanguage('zh');return '語言已切換為繁體中文。';},
      '0451':()=>{try{localStorage.setItem('eric_0451_unlocked','1');}catch{/* storage disabled */}setSecret(true);
        return labels(language,'ACCESS CODE 0451 ACCEPTED.\nA personal note and a gold visitor punch card are now unlocked below.','已接受存取碼 0451。\n秘密文字與金色訪客打孔卡已解鎖，請查看下方。');},
      'would you kindly':()=> 'A man chooses, a slave obeys. The choice is yours here. Try 0451.',
      'open 0451':()=>actions['0451'](),
      xyzzy:()=> 'Nothing happens. Or does it?',
      bioshock:()=> 'Welcome to the quiet study beneath the sea.',
      'make coffee':()=> 'Error 418: the kettle is a teapot.',
      'sudo hire-eric':()=> 'Access denied. Try the contact card instead.',
    };
    if(cmd==='clear'){setHistory([]);return;}
    const reply=actions[cmd]?.()??labels(language,'Command not recognized. Type help or select a suggestion.','找不到指令。請輸入 help 或點選建議指令。');
    setHistory(p=>[...p,{input:raw,output:reply}].slice(-80));
  };
  const doAutocomplete=()=>{
    if(choices.length){setEntry(choices[Math.min(selected,choices.length-1)]);setSelected(0);}
  };
  return <div className="terminal-modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)onClose();}}>
    <section className="terminal-machine" role="dialog" aria-modal="true" aria-label={labels(language,'Vintage terminal','復古終端機')}>
      <div className="terminal-machine-head"><span>MINERVA COMPUTING SYSTEMS · MARK I / 0451</span>
        <button type="button" onClick={onClose} aria-label={labels(language,'Close terminal','關閉終端機')}>×</button></div>
      <div className="terminal-crt-frame">
        {booting ? <div className="terminal-boot" aria-live="polite">
          <span>ERIC.EXE / MINERVA NODE · INITIALIZING</span>
          <h2>ERIC.EXE</h2>
          {['POWERING VACUUM TUBES','MOUNTING PERSONNEL RECORDS','INDEXING ERICTUNG’S WEEKLY','CONNECTING TO MARK I RECORDER','MESSAGE SLOT READY','SYSTEM ONLINE'].slice(0,bootStep+1).map((line,i)=>
            <p key={line}>{line}<b>{i===5?'READY':'OK'}</b></p>)}
          <button type="button" onClick={finishBoot}>{labels(language,'SKIP BOOT / ENTER ↵','略過開機 / 進入 ↵')}</button>
          {bootStep===5&&<button type="button" onClick={finishBoot}>{labels(language,'OPEN CONSOLE','開啟主控台')}</button>}
        </div> : <>
          <div className="retro-terminal-output" ref={outputRef} role="log" aria-live="polite">
            {history.map((h,i)=><div key={i}>{h.input&&<p><span>visitor@minerva:~ %</span> {h.input}</p>}<pre>{h.output}</pre></div>)}
          </div>
          {secret && <div className="terminal-classified" role="status">
            <strong>0451 · CLASSIFIED / PERSONAL NOTE</strong>
            <p>{labels(language,
              'You came looking for Eric, but found a room full of unfinished work. Curiosity is not trespassing here. Every experiment, page, and loose wire tells part of the story. If you leave a mark, make it one worth keeping.',
              '你原本是來找 Eric 的，卻只找到滿室尚未完成的工作。在這裡，好奇不是擅闖。每一項實驗、每一頁筆記，都記錄著一段故事。若要留下痕跡，就留下一個值得收藏的吧。')}</p>
            <button type="button" onClick={()=>navigate('punch')}>{labels(language,'CLAIM GOLDEN MESSAGE CARD →','領取金色留言打孔卡 →')}</button>
          </div>}
          <div className="terminal-suggestions" aria-label={labels(language,'Suggested commands','建議指令')}>
            {choices.map((cmd,i)=><button key={cmd} type="button" className={i===selected?'selected':''}
              onClick={()=>run(cmd)}>{cmd}</button>)}
          </div>
          <form className="retro-terminal-prompt terminal-input-line" onSubmit={e=>{e.preventDefault();run(entry);}}>
            <label htmlFor="retro-input">visitor@minerva:~ %</label>
            <input id="retro-input" ref={inputRef} value={entry}
              onChange={e=>{setEntry(e.target.value);setSelected(0);}}
              onKeyDown={e=>{
                if(e.key==='Tab'&&choices.length){e.preventDefault();doAutocomplete();}
                if(e.key==='ArrowDown'&&choices.length){e.preventDefault();setSelected(x=>(x+1)%choices.length);}
                if(e.key==='ArrowUp'&&choices.length){e.preventDefault();setSelected(x=>(x+choices.length-1)%choices.length);}
                if(e.key==='Escape')onClose();
              }}
              autoComplete="off" spellCheck={false} aria-label={labels(language,'Terminal command','終端機指令')}
              placeholder={labels(language,'Type help or choose a command','輸入 help 或點選指令')}/>
            <button type="submit">↵</button>
          </form>
        </>}
      </div>
      <footer className="terminal-machine-footer"><span>MINERVA / PERSONAL WORKSTATION</span>
        <span>{labels(language,'SAFE SIMULATED COMMANDS · TAB TO COMPLETE','安全模擬指令 · TAB 自動補全')}</span></footer>
    </section>
  </div>;
}
export function AchievementPanel({language,visitor,onClose}:{language:SiteLanguage;visitor:VisitorActions;onClose:()=>void}) {
  return <section className="retro-ledger"><div className="retro-panel-head"><span>VISITOR ACHIEVEMENT LEDGER</span><button onClick={onClose}>×</button></div>
    <h2>{labels(language,'Your collection','你的成就收藏')}</h2><p>{visitor.data.achievements.length} / {definedAchievements.length} {labels(language,'stamps collected','個印章已蒐集')}</p>
    <div className="retro-badge-grid">{definedAchievements.map(([id,en,zh,detail])=><div key={id} className={'retro-badge '+(visitor.data.achievements.includes(id)?'unlocked':'locked')}><span aria-hidden="true">{visitor.data.achievements.includes(id)?'✷':'○'}</span><strong>{labels(language,en,zh)}</strong><small>{detail}</small></div>)}</div>
    <p className="retro-ledger-note">{labels(language,'Progress is stored only in your browser.','成就進度只儲存在你的瀏覽器。')}</p>
  </section>;
}
const ROWS=['12','11','0','1','2','3','4','5','6','7','8','9'];
const cardBits=(visitor:VisitorData,alias:string,role:string,interest:string,message='')=>{
  const payload=JSON.stringify({alias,role,interest,message,visited:visitor.visited.slice().sort(),posts:visitor.posts.slice().sort(),achievements:visitor.achievements.slice().sort()});
  const bytes=new TextEncoder().encode(payload);
  let h=2166136261;for(const b of bytes){h^=b;h=Math.imul(h,16777619);}
  return Array.from({length:40},(_,i)=>{let x=(h^(Math.imul(i+1,2654435761)))>>>0;x^=x>>>16;x=Math.imul(x,2246822507);return (x>>>0)%ROWS.length;});
};
export function punchSvg(visitor:VisitorData,alias:string,role:string,interest:string,message='',golden=false) {
 const encode=(s:string)=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
 const positions=cardBits(visitor,alias,role,interest,message);
 const holes=positions.map((row,col)=>`<rect x="${119+col*23}" y="${148+row*22}" width="12" height="14" rx="2" fill="#f8f4e8" stroke="#aa9a7d" stroke-width="0.6"/>`).join('');
 const grid=ROWS.map((r,i)=>`<text x="41" y="${158+i*22}" font-size="12" font-family="monospace" fill="#604f3a">${r}</text><line x1="100" x2="1050" y1="${160+i*22}" y2="${160+i*22}" stroke="#c6b799" stroke-width=".7"/>`).join('');
 const cols=Array.from({length:40},(_,i)=>`<text x="${124+i*23}" y="132" text-anchor="middle" font-size="9" fill="#6d604c" font-family="monospace">${String(i+1).padStart(2,'0')}</text>`).join('');
 const fill=golden?'#d3a44e':'#efe0bf';
 const edge=golden?'#74541e':'#6b573d';
 const subtitle=golden?'GOLDEN VISITOR CARD · ACCESS CODE 0451':'VISITOR MESSAGE / PUNCH CARD';
 const messageLine=encode(message.replace(/\s+/g,' ').slice(0,66));
 const qr=siteQrSvg(902,451,4);
 return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1100 650" width="1100" height="650"><rect width="1100" height="650" fill="${fill}"/><rect x="14" y="14" width="1072" height="622" rx="8" fill="none" stroke="${edge}" stroke-width="4"/><text x="40" y="62" font-size="30" font-weight="bold" font-family="Georgia,serif" fill="#473522">MINERVA'S DEN / ${subtitle}</text><text x="42" y="88" font-size="14" font-family="monospace" fill="#604f3a">ERIC.EXE · PERSONAL WORKSTATION · 12 ROWS / 40 COLUMNS</text><text x="42" y="112" font-size="13" font-family="monospace" fill="#604f3a">ALIAS: ${encode(alias.slice(0,28))} / CLASS: ${encode(role)} / INTEREST: ${encode(interest)}</text>${grid}${cols}${holes}<line x1="40" x2="1060" y1="421" y2="421" stroke="#887358"/><text x="42" y="448" font-size="16" font-family="Georgia,serif" fill="#45311d">MESSAGE: ${messageLine}</text><text x="43" y="490" font-size="15" font-family="monospace" fill="#604f3a">SCAN TO RETURN TO THE DESK</text><text x="43" y="514" font-size="13" font-family="monospace" fill="#604f3a">erictung1007.github.io</text>${qr}<line x1="40" x2="1060" y1="616" y2="616" stroke="#887358"/><text x="42" y="638" font-size="12" font-family="monospace" fill="#604f3a">ARCHIVE VISIT ${String(visitor.achievements.length).padStart(2,'0')} STAMPS · ${String(visitor.posts.length).padStart(2,'0')} ARTICLES · LOCAL KEEPSAKE</text></svg>`;
}
export function PunchCard({language,visitor,onClose}:{language:SiteLanguage;visitor:VisitorActions;onClose:()=>void}) {
  const [initial] = useState(readTableCard);
  const [alias,setAlias]=useState(initial?.alias ?? 'VISITOR');
  const [role,setRole]=useState(initial?.role ?? 'RESEARCHER');
  const [interest,setInterest]=useState(initial?.interest ?? 'AI');
  const [message,setMessage]=useState(initial?.message ?? '');
  const [saved,setSaved]=useState(Boolean(initial));
  const [golden]=useState(isDrawerUnlocked);
  const svg=punchSvg(visitor.data,alias,role,interest,message,golden);
  const save=()=>{
    const ok=saveTableCard({alias:alias.trim()||'VISITOR',role,interest,message:message.trim(),golden,createdAt:initial?.createdAt||new Date().toISOString()});
    if(ok){visitor.punch();setSaved(true);}
    return ok;
  };
  const download=()=>{
    save();
    const blob=new Blob([svg],{type:'image/svg+xml;charset=utf-8'});
    const url=URL.createObjectURL(blob);
    const a=document.createElement('a');a.href=url;a.download=golden?'minervas-den-golden-0451-card.svg':'eric-visitor-message-card.svg';document.body.appendChild(a);a.click();a.remove();window.setTimeout(()=>URL.revokeObjectURL(url),1000);
  };
  return <section className="retro-card-machine"><div className="retro-panel-head"><span>MINERVA CARD PUNCH / UNIT 12</span><button onClick={onClose}>×</button></div>
    <h2>{labels(language,'Punch your visitor card','製作你的訪客打孔卡')}</h2><p>{labels(language,'A 12-row collectible encoded from your local visit. Not an identity or access credential.','依照你本機的探索紀錄製作 12 列紀念打孔卡，並非身分或通行證。')}</p>
    {golden && <div className="punch-golden-banner">✦ FILE 0451 UNLOCKED · GOLDEN MESSAGE CARD ✦</div>}
    <div className="retro-card-fields"><label>{labels(language,'Alias','暱稱')}<input maxLength={28} value={alias} onChange={e=>{setAlias(e.target.value.replace(/[<>]/g,''));setSaved(false);}}/></label>
      <label>{labels(language,'Visitor class','訪客類別')}<select value={role} onChange={e=>{setRole(e.target.value);setSaved(false);}}><option>VISITOR</option><option>RESEARCHER</option><option>OPERATOR</option><option>ARCHIVIST</option></select></label>
      <label>{labels(language,'Interest','興趣')}<select value={interest} onChange={e=>{setInterest(e.target.value);setSaved(false);}}><option>AI</option><option>AGENTS</option><option>DESIGN</option><option>RESEARCH</option><option>SYSTEMS</option></select></label></div>
    <label className="retro-message-label">{labels(language,'Message for Eric (up to 66 characters printed on the card)','留給 Eric 的訊息（卡面最多顯示 66 字）')}<textarea maxLength={600} rows={3} value={message} onChange={e=>{setMessage(e.target.value);setSaved(false);}} placeholder={labels(language,'Eric was away, so I left this note...','Eric 不在，所以我留下這張紙條…')}/></label>
    <div className="retro-card-preview" role="img" aria-label="Personal 12-row punch card" dangerouslySetInnerHTML={{__html:svg}}/>
    <div className="retro-card-actions">
      <button type="button" onClick={save}>{labels(language,saved?'UPDATE CARD ON DESK':'LEAVE CARD ON DESK',saved?'更新桌上的卡片':'將卡片留在桌上')}</button>
      <button type="button" onClick={download}>{labels(language,'DOWNLOAD QR SVG','下載 QR SVG')}</button>
      <button type="button" onClick={()=>window.print()}>{labels(language,'PRINT CARD','列印卡片')}</button>
      <button type="button" disabled={!message.trim()} onClick={()=>{
        if(!message.trim())return;
        save();
        window.open(guestbookUrl({alias,interest,message}), '_blank', 'noopener,noreferrer');
      }}>{labels(language,'PUBLISH MESSAGE VIA GITHUB ↗','前往 GitHub 發布留言 ↗')}</button>
    </div>
    {saved && <p role="status" className="retro-card-saved">{labels(language,'Your card is on the desk in this browser.','你的卡片已留在這台瀏覽器的桌上。')}</p>}
    <small>{labels(language,'Your card is saved locally. To let Eric see your message, open the prefilled GitHub Issue and click Submit new issue after signing in. GitHub will publicly show the alias and your account. QR links to the public website. Punch holes are thematic, not Hollerith encoding.','卡片保存在此瀏覽器。若要讓 Eric 真正看到留言，請登入 GitHub 並在已填好的 Issue 頁面按提交。留言及 GitHub 帳號公開可見。QR 可掃回本網站，孔位為主題編碼。')}</small>
  </section>;
}
export function BadgeToast({name,language,onDismiss}:{name:string;language:SiteLanguage;onDismiss:()=>void}) {
 const item=definedAchievements.find(a=>a[0]===name);
 useEffect(()=>{if(!name)return;const t=window.setTimeout(onDismiss,3800);return()=>window.clearTimeout(t);},[name,onDismiss]);
 if(!item)return null;
 return <div className="retro-toast" role="status"><span>✷</span><div><small>ACHIEVEMENT UNLOCKED</small><strong>{labels(language,item[1],item[2])}</strong></div><button onClick={onDismiss} aria-label="Dismiss">×</button></div>;
}
