import { SYSTEM_BRAND_UPPER } from './browser-capability.js';
import { knowledge } from './data.js';
import { getPosts } from './posts.js';

export type TerminalFile = 'home'|'resume'|'work'|'weekly'|'archive'|'research'|'timeline'|'experiments'|'contact'|'messages'|'help';
export type TerminalRecord = { heading:string; caption:string; lines:string[]; links?:{label:string;url:string;action?:string}[] };
const cvUrl = `${import.meta.env.BASE_URL}CV.pdf`;
export function terminalRecord(file:TerminalFile,lang:'en'|'zh'):TerminalRecord {
 const zh=lang==='zh';
 const l=(en:string,cn:string)=>zh?cn:en;
 const posts=getPosts(lang);
 const cvLink={label:l('VIEW ORIGINAL CV PDF','查看原始履歷 PDF'),url:cvUrl};
 switch(file){
  case 'resume': return {
   heading:'PERSONNEL FILE / ERIC TUNG',
   caption:l('PERSONNEL RECORD · OPENED IN TERMINAL','人事檔案 · 終端機內已開啟'),
   lines:[
    l('FIELD / SOFTWARE ENGINEERING · BACKEND · AI','領域 / 軟體工程 · 後端 · 人工智慧'),
    l('BACKGROUND / NURSING · NATIONAL TAIWAN UNIVERSITY','背景 / 護理 · 國立臺灣大學'),
    '',
    l('Handwritten note tucked beneath this dossier:', '這份檔案底下藏有一行手寫備註：'),
    'BUREAU DRAWER / SECURITY REFERENCE: 0451',
    l('The brass drawer will ask for this code.','黃銅鎖抽屜需要這組密碼。'),
   ],links:[cvLink]
  };
  case 'work': return {
   heading:l('WORK & EXPERIENCE','工作與經歷'),caption:'WORK/INDEX',
   lines:knowledge.experience.map(e=>`${e.role} / ${e.company} / ${e.period}`),
   links:[{label:l('OPEN FULL PORTFOLIO','開啟完整作品頁'),url:'#/portfolio',action:'portfolio'},{...cvLink}]
  };
  case 'weekly': return {heading:"ERICTUNG'S WEEKLY",caption:'PRESS/INDEX',
   lines:posts.slice(0,9).map((p,i)=>`${String(i+1).padStart(2,'0')}  ${p.date}  [${p.category}]  ${p.title}`),
   links:[{label:l('OPEN THE NEWSPAPER','翻開報紙'),url:'#/weekly',action:'weekly'}]
  };
  case 'archive': return {heading:l('PROJECT ARCHIVE','專案檔案庫'),caption:'ARCHIVE/INDEX',
   lines:knowledge.projects.map(p=>`${p.title} / ${p.role}`),
   links:[{label:l('OPEN FILE CABINET','打開檔案櫃'),url:'#/cabinet',action:'cabinet'}]
  };
  case 'research': return {heading:l('RESEARCH / PUBLICATIONS','研究與學術發表'),caption:'RESEARCH/INDEX',
   lines:(knowledge.publications??[]).map(p=>`${p.title} (${p.year})`),
   links:[{label:l('OPEN RESEARCH FILES','開啟研究紀錄'),url:'#/cabinet',action:'cabinet'}]
  };
  case 'timeline':return {heading:l('CHRONICLE','專案年表'),caption:'CHRONICLE/INDEX',
   lines:posts.slice(0,8).map(p=>`${p.date} / ${p.title}`),
   links:[{label:l('OPEN TIMELINE','開啟完整年表'),url:'#/timeline',action:'timeline'}]
  };
  case 'experiments':return {heading:l('EXPERIMENT LEDGER','實驗紀錄簿'),caption:'EXPERIMENTS/INDEX',
   lines:[l('Local 32 GB inference test / 2026-11-05','32 GB 本地推論測試 / 2026-11-05'),
    'PP 4096 / TG 128','Prompt 64.0 tok/s / Generation 11.1 tok/s','Peak memory 19.4 GB',
    l('Single measurement, not a general benchmark.','僅為單次測量，不代表普遍效能。')],
   links:[{label:l('OPEN EXPERIMENT LEDGER','開啟完整紀錄簿'),url:'#/experiments',action:'experiments'}]
  };
  case 'contact':return {heading:l('CONTACT / LEAVE A NOTE','聯絡資料 / 留言'),caption:'CONTACT/CARD',
   lines:[`EMAIL  ${knowledge.profile.contact.email}`,`GITHUB  ${knowledge.profile.contact.github}`,`LINKEDIN  ${knowledge.profile.contact.linkedin}`],
   links:[{label:l('OPEN MAIL PROGRAM','開啟郵件程式'),url:`mailto:${knowledge.profile.contact.email}`},
   {label:l('LEAVE A PUNCH-CARD MESSAGE','留下打孔卡訊息'),url:'#/punch',action:'punch'}]
  };
  case 'messages':return {heading:l('VISITOR MESSAGE SLOT','訪客留言槽'),caption:'MESSAGE/QUEUE',
    lines:[l('The owner is currently away. Your message may be saved as a punch card.',
      '主人暫時不在。你可以將留言留在打孔卡上。'),
      l('To let Eric see it, publish the message to GitHub Issues.','若想讓 Eric 收到，還需要將留言發布到 GitHub Issues。')],
    links:[{label:l('INSERT MESSAGE CARD','插入留言卡'),url:'#/punch',action:'punch'},
      {label:l('READ PUBLIC GUESTBOOK','閱讀公開訪客簿'),url:'#/guestbook',action:'guestbook'}]
  };
  case 'help':return {heading:l('OPERATOR MANUAL','操作手冊'),caption:'SYSTEM/HELP',
   lines:[
   'work / resume / weekly / archive / research',
   'timeline / experiments / contact / message',
   'help / clear / theme dark / theme light',
   '',
   l('The locked drawer needs a four-digit code.','鎖上的抽屜需要四位數密碼。')]}
  ;
  default:return {heading:SYSTEM_BRAND_UPPER,caption:'SYSTEM/READY',
   lines:[l('Personnel files, articles and messages are available.','人事檔案、文章與訪客留言都已開放。')]}
 }
}
