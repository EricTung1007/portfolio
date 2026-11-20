import { knowledge } from './data.js';
import { EXTRA_CARDS, EXTRA_EFFECTS, EXTRA_CARD_IDS } from './case-roguelite-cards.js';

export type Language = 'en' | 'zh';
export type Direction = 0 | 1 | 2 | 3;
export type Phase = 'review' | 'denied' | 'maze' | 'battle' | 'reward' | 'record' | 'event' | 'dead' | 'clear' | 'settled';
export type CardCategory = 'code' | 'care' | 'hybrid';
export type CardId = string;
export type Ailment = 'wounded'|'bleeding'|'infected'|'ddosed';
export type AilmentSet = Record<Ailment,number>;
export type Directive = 'degree_priority'|'evidence_first'|'audit_overload'|'night_shift';
export const DIRECTIVES:Record<Directive,[string,string,string,string]> = {
  degree_priority:['DEGREE PRIORITY','學歷優先令','Opponents begin with 5 armor.','敵方開戰獲得 5 護甲。'],
  evidence_first:['EVIDENCE FIRST','證據先行令','Start each fight with 1 evidence.','每場戰鬥開始獲得 1 證據。'],
  audit_overload:['AUDIT OVERLOAD','稽核超載令','Every fourth enemy turn adds 1 MISFILED.','敵方每四回合附加 1 層誤分類。'],
  night_shift:['NIGHT SHIFT','深夜值班令','Healing actions restore 2 fewer HP.','戰鬥中的治療減少 2 HP。'],
};
export const emptyAilments=():AilmentSet=>({wounded:0,bleeding:0,infected:0,ddosed:0});
export type Card = { id: CardId; name: [string,string]; text: [string,string]; cost: number; category: CardCategory; origin: [string,string] };
export type EnemyId = 'gatekeeper'|'auditor'|'engine';
export type Intent = { kind: 'attack'|'guard'|'misfile'; amount: number; name: [string,string]; status?:Ailment };
export type EventId = 'reference' | 'printer' | 'rest';
export type Run = {
  phase: Phase; role: string; denials: number; seed: number; rng: number; runs: number;
  directive:Directive; variants:Record<EnemyId,number>; eventSites:Record<string,EventId>;
  statuses:AilmentSet; foeStatuses:AilmentSet; findings:number; freePlayed:number;
  x: number; y: number; dir: Direction; visited: string[]; steps: number;
  hp: number; maxHp: number; block: number; carry: number; energy: number; evidence: number;
  deck: CardId[]; drawPile: CardId[]; discard: CardId[]; hand: CardId[]; turn: number;
  foe: EnemyId | ''; foeHp: number; foeBlock: number; foeExposed: number; foeInterrupted: boolean; riskScreened: number; misfiled: number; lastCard: CardId | '';
  defeated: EnemyId[]; dossiers: ('A'|'H')[]; record: 'A'|'H'; events: EventId[]; event: EventId; reward: CardId[];
  message: string; history: string[]; ending: string;
};
export const MAP = [
  '###############',
  '#S#....E......#',
  '#.#.#########.#',
  '#.#.X.#...H...#',
  '#.#####.#####.#',
  '#.....#...#...#',
  '#####.#.#.#####',
  '#...#.#.#.....#',
  '#.#.#.#.#####.#',
  '#.#.#.#.....#.#',
  '#.#.#.#####.#.#',
  '#E#...#...#.#.#',
  '#.#####.#.###.#',
  '#.....A.#.....#',
  '###############',
] as const;
export const DIRS: Array<[number, number]> = [[0,-1],[1,0],[0,1],[-1,0]];
export const DIR_NAMES = ['N','E','S','W'];
export const DOSSIERS = { A: knowledge.projects[0], H: knowledge.projects[1] };
export const ENEMIES: Record<EnemyId,{name:[string,string]; hp:number; intro:[string,string]; description:[string,string]}> = {
  gatekeeper: {
    name:['THE DEGREE GATEKEEPER','學歷守門員'],hp:34,
    intro:['NO COMPUTER SCIENCE DEGREE. APPLICATION INVALID.','非資訊工程學位。申請無效。'],
    description:['Discards real work because the diploma is not labeled CS.','僅憑學位名稱否定實際作品。'],
  },
  auditor: {
    name:['THE COMPLIANCE AUDITOR','程序稽核官'],hp:43,
    intro:['CLINICAL EXPERIENCE IS NOT A RECOGNIZED TECHNICAL SKILL.','臨床經驗不屬於技術技能。'],
    description:['Protects bad assumptions with endless paperwork.','以無止盡的公文保護錯誤假設。'],
  },
  engine: {
    name:['THE CLASSIFICATION ENGINE','終極分類引擎'],hp:62,
    intro:['ONE PERSON. ONE OCCUPATION. NO EXCEPTIONS.','一個人。一個職業。不准例外。'],
    description:['The final rule: every person must fit exactly one box.','最終規則：每個人必須被放進唯一一個格子。'],
  },
};
const BASE_CARDS: Record<CardId,Card> = {
  python:{id:'python',name:['PYTHON SCRIPT','Python 腳本'],text:['6 DMG. +3 if the previous card was CODE.','造成 6 傷害；上一張是程式卡時 +3。'],cost:1,category:'code',origin:['Python: scripting and automation','Python：自動化與腳本']},
  sql:{id:'sql',name:['SQL QUERY','SQL 查詢'],text:['3 DMG. Strip 6 armor. Expose 2.','造成 3 傷害；削除 6 護甲，揭露弱點 2。'],cost:1,category:'code',origin:['SQL: inspecting stored data','SQL：檢索資料庫與查找錯誤']},
  api:{id:'api',name:['REST REQUEST','REST API 請求'],text:['7 DMG ignoring enemy armor.','造成無視護甲的 7 傷害。'],cost:1,category:'code',origin:['REST API: crossing system boundaries','REST API：跨越系統邊界']},
  debug:{id:'debug',name:['BREAKPOINT','中斷點'],text:['4 DMG. If Exposed: interrupt this intent. Otherwise Expose 1.','造成 4 傷害；已揭露弱點時中斷敵方行動，否則揭露 1。'],cost:2,category:'code',origin:['Debugging: isolate and halt a fault','除錯：定位並中斷異常流程']},
  rag:{id:'rag',name:['RAG RETRIEVAL','RAG 檢索'],text:['Gain 2 evidence. Draw 1.','獲得 2 證據，抽 1 張牌。'],cost:1,category:'hybrid',origin:['FAISS/RAG: grounding answers in documents','FAISS／RAG：以來源文件支持回答']},
  automation:{id:'automation',name:['CI PIPELINE','自動化管線'],text:['Deal 4 DMG twice. One extra hit if last card was CODE.','連續造成 2 次 4 傷害；上一張為程式卡再多 1 次。'],cost:2,category:'code',origin:['Automation: repeated, reproducible work','自動化：可重複執行的流程']},
  abap:{id:'abap',name:['SAP ABAP','SAP ABAP'],text:['Convert 7 enemy armor into damage. Deal 3 more.','轉換最多 7 點敵方護甲為傷害，再造成 3。'],cost:1,category:'code',origin:['Deloitte: adapting legacy business workflows','勤業眾信：維護與客製企業流程']},
  maui:{id:'maui',name:['.NET MAUI','.NET MAUI'],text:['Gain 5 block and deal 4 DMG.','獲得 5 護盾，同時造成 4 傷害。'],cost:1,category:'hybrid',origin:['BenQ: supporting multiple platforms','明基：維護跨平台應用程式']},
  llm:{id:'llm',name:['LOCAL LLM','本地 LLM'],text:['Spend 1 evidence: 14 DMG. Without evidence: only 4.','消耗 1 證據造成 14 傷害；無證據時只有 4。'],cost:2,category:'code',origin:['Local AI: grounded inference matters','本地 AI：可信來源影響推論品質']},
  triage:{id:'triage',name:['TRIAGE','檢傷分類'],text:['Gain 5 block. If incoming ATTACK, gain 6 more.','獲得 5 護盾；敵方準備攻擊則再獲得 6。'],cost:1,category:'care',origin:['Clinical triage: prioritize imminent risk','檢傷分類：優先處理迫切風險']},
  assessment:{id:'assessment',name:['ASSESSMENT','護理評估'],text:['Gain 5 block and 1 evidence.','獲得 5 護盾與 1 證據。'],cost:1,category:'care',origin:['Nursing assessment: observe before acting','護理評估：觀察後再採取行動']},
  handoff:{id:'handoff',name:['HANDOFF','護理交班'],text:['Gain 7 block. Carry 4 block into next turn.','獲得 7 護盾；4 點護盾延續至下回合。'],cost:1,category:'care',origin:['Handoff: preserve critical information','護理交班：讓保護措施持續生效']},
  chart:{id:'chart',name:['SOAP NOTE','SOAP 紀錄'],text:['Gain 3 block, 2 evidence. Clear MISFILED.','獲得 3 護盾、2 證據，清除誤分類。'],cost:1,category:'care',origin:['Clinical charting: documented observations','護理紀錄：留下可查核的事實']},
  stabilize:{id:'stabilize',name:['STABILIZE','穩定生命徵象'],text:['Heal 6 HP; gain 4 block.','恢復 6 HP，獲得 4 護盾。'],cost:2,category:'care',origin:['Vital signs: intervention and recovery','生命徵象：採取干預與恢復']},
  research:{id:'research',name:['PEER REVIEW','同儕審查'],text:['Gain 3 evidence; draw 1.','獲得 3 證據，抽 1 張。'],cost:1,category:'hybrid',origin:['Published research: reproducible evidence','學術研究：重視可驗證的證據']},
  risk:{id:'risk',name:['RISK SCREEN','風險評估'],text:['Gain 4 block. Next 2 enemy attacks deal 4 less.','獲得 4 護盾；敵人接下來 2 次攻擊減少 4 傷害。'],cost:1,category:'care',origin:['Morse / Braden: anticipate preventable harm','Morse／Braden：事前評估與預防傷害']},
};
export const CARDS:Record<CardId,Card> = {...BASE_CARDS,...EXTRA_CARDS};
export const CARD_COUNT=Object.keys(CARDS).length;
export const BASE_DECK: CardId[] = ['python','python','sql','api','rag','triage','triage','assessment','handoff','chart'];
const REWARD_POOL: CardId[] = ['automation','abap','maui','llm','stabilize','research','risk','debug','rag','api','assessment','chart',...EXTRA_CARD_IDS];
export const EVENTS: Record<string,EventId> = {'5,5':'reference','11,7':'printer','3,9':'rest'};
export const EVENT_TEXT: Record<EventId,{name:[string,string];story:[string,string];options:[[string,string],[string,string]]}> = {
  reference:{
    name:['THE REFERENCE DESK','參考資料室'],
    story:['The clerk refuses a recommendation letter. A DOI is stamped in red beneath the rejection.','承辦員拒絕推薦信。退件理由下方卻蓋著一個 DOI。'],
    options:[['CITE THE PAPER: ADD PEER REVIEW','引用論文：獲得「同儕審查」'],['REWRITE THE ABSTRACT: HEAL 8','重寫摘要：恢復 8 HP']],
  },
  printer:{
    name:['THE JAMMED PRINTER','卡紙的影印機'],
    story:['Three drafts are identical. One contains an extra sentence: "Built a working system."','三份履歷看起來完全相同，只有一份多了一句：「實際做出可用系統。」'],
    options:[['SUBMIT EVIDENCE: ADD .NET MAUI','提交成果：獲得「.NET MAUI」'],['SHRED A BASIC CARD: REMOVE 1 PYTHON','碎紙機：移除 1 張 Python']],
  },
  rest:{
    name:['THE NIGHT SHIFT','深夜值班室'],
    story:['The building is empty. There is coffee and a folded clinical handoff note.','整棟大樓空無一人，桌上只有咖啡與摺好的交班紀錄。'],
    options:[['TAKE THE BREAK: HEAL 12','短暫休息：恢復 12 HP'],['READ THE HANDOFF: ADD RISK SCREEN','閱讀交班：獲得「風險評估」']],
  },
};
export function loc(x:number,y:number){return x+','+y;}
export function wall(x:number,y:number){return MAP[y]?.[x] === '#' || MAP[y]?.[x] == null;}
export function name(language:Language, values:[string,string]){return values[language==='en'?0:1];}
function rand(state:Run,max:number):number {
  state.rng = (Math.imul(state.rng,1664525)+1013904223)>>>0;
  return Math.floor(state.rng / 4294967296 * max);
}
function shuffle(state:Run,items:CardId[]):CardId[] {
  const out=[...items];
  for(let i=out.length-1;i>0;i--){const j=rand(state,i+1);[out[i],out[j]]=[out[j],out[i]];}
  return out;
}
export function createRun(runs=0,seed=((Date.now()+runs*101)|0)):Run {
  const g:Run={
    phase:'review', role:'',denials:0,seed,rng:seed>>>0,runs,
    directive:'degree_priority',variants:{gatekeeper:0,auditor:0,engine:0},eventSites:{...EVENTS},
    statuses:emptyAilments(),foeStatuses:emptyAilments(),findings:0,freePlayed:0,
    x:1,y:1,dir:2,visited:['1,1'],steps:0,
    hp:42,maxHp:42,block:0,carry:0,energy:3,evidence:0,
    deck:[...BASE_DECK],drawPile:[],discard:[],hand:[],turn:1,
    foe:'',foeHp:0,foeBlock:0,foeExposed:0,foeInterrupted:false,riskScreened:0,misfiled:0,lastCard:'',
    defeated:[],dossiers:[],record:'A',events:[],event:'reference',reward:[],
    message:'',history:[],ending:'',
  };
  const directives=Object.keys(DIRECTIVES) as Directive[];
  g.directive=directives[rand(g,directives.length)];
  g.variants={gatekeeper:rand(g,2),auditor:rand(g,2),engine:rand(g,2)};
  const sites=Object.keys(EVENTS),variants=shuffle(g,Object.values(EVENTS));
  g.eventSites=Object.fromEntries(sites.map((site,i)=>[site,variants[i]])) as Record<string,EventId>;
  return g;
}
function clone(g:Run):Run {
  return {...g,deck:[...g.deck],drawPile:[...g.drawPile],discard:[...g.discard],
    hand:[...g.hand],visited:[...g.visited],defeated:[...g.defeated],dossiers:[...g.dossiers],
    events:[...g.events],reward:[...g.reward],history:[...g.history],
    statuses:{...g.statuses},foeStatuses:{...g.foeStatuses},
    variants:{...g.variants},eventSites:{...g.eventSites}};
}
function pushMessage(g:Run,text:string) {g.message=text;g.history=[...g.history.slice(-3),text];}
function draw(g:Run,count:number) {
  for(let i=0;i<count;i++){
    if(g.hand.length>=8) break;
    if(g.drawPile.length===0){g.drawPile=shuffle(g,g.discard);g.discard=[];}
    if(g.drawPile.length===0)break;
    g.hand.push(g.drawPile.pop()!);
  }
}
export function reject(run:Run,role:string):Run {
  const g=clone(run);g.role=role;g.denials++;g.phase='denied';return g;
}
export function reclassify(run:Run):Run {return {...run,phase:'review'};}
export function acceptClassification(run:Run):Run {
  const g=clone(run);if(g.phase!=='denied')return run;
  g.phase='settled';g.ending='EXCEPTION FILED WITHOUT APPEAL';
  pushMessage(g,'CASE CLOSED · DEPARTMENT RETAINS FINAL AUTHORITY');return g;
}
export function startAppeal(run:Run):Run {
  const g=clone(run);g.phase='maze';g.hp=g.maxHp;
  if(g.role==='ENGINEER'){g.deck.push('debug');}
  if(g.role==='NURSE'){g.deck.push('stabilize');}
  if(g.role==='OTHER'){g.deck.push('maui');}
  pushMessage(g,'APPEAL ACCEPTED · FIND 2 DOSSIERS · CHALLENGE 3 RULINGS');
  return g;
}
export function intentFor(foe:EnemyId,turn:number,variant=0):Intent {
  const pattern = {
    gatekeeper:[{kind:'attack',amount:7,name:['REJECT STAMP','退件印章']},{kind:'guard',amount:7,name:['DIPLOMA SHIELD','學歷盾牌']},{kind:'attack',amount:11,name:['INVALIDATE','資格撤銷']}],
    auditor:[{kind:'guard',amount:9,name:['AUDIT TRAIL','稽核護甲']},{kind:'attack',amount:9,name:['REDACTION','遮蔽紀錄']},{kind:'misfile',amount:1,name:['MISFILE RECORD','誤分類紀錄']},{kind:'attack',amount:12,name:['SANCTION','程序處分']}],
    engine:[{kind:'attack',amount:12,name:['FORCED CLASSIFICATION','強制分類']},{kind:'misfile',amount:1,name:['ERASE CATEGORY','抹除類別']},{kind:'guard',amount:11,name:['SYSTEM POLICY','制度防護']},{kind:'attack',amount:16,name:['FINAL VERDICT','最終裁決']}],
  } as Record<EnemyId, Intent[]>;
  const original=pattern[foe][(turn-1)%pattern[foe].length];
  if(!variant)return original;
  const status:Partial<Record<EnemyId,Ailment>>={gatekeeper:'wounded',auditor:'bleeding',engine:'infected'};
  // Familiar, fully telegraphed damage patterns; randomized versions add legible ailments.
  return original.kind==='attack'?{...original,status:status[foe]}:original;
}
export function startFight(run:Run,foe:EnemyId):Run {
  const g=clone(run);g.phase='battle';g.foe=foe;g.foeHp=ENEMIES[foe].hp;
  g.foeBlock=0;g.foeExposed=0;g.foeInterrupted=false;g.riskScreened=0;g.misfiled=0;g.turn=1;
  g.energy=3;g.evidence=(g.role==='ENGINEER'?1:0)+(g.directive==='evidence_first'?1:0);
  g.block=0;g.carry=0;g.lastCard='';g.freePlayed=0;g.foeStatuses=emptyAilments();
  if(g.directive==='degree_priority')g.foeBlock=5;
  g.hand=[];g.discard=[];g.drawPile=shuffle(g,g.deck);draw(g,5);
  pushMessage(g,'INSPECTION BEGINS · '+ENEMIES[foe].name[0]);
  return g;
}
function challengeFinal(g:Run):boolean {
  return g.dossiers.includes('A')&&g.dossiers.includes('H')&&
    g.defeated.includes('gatekeeper')&&g.defeated.includes('auditor');
}
export function move(run:Run,command:'left'|'right'|'forward'|'back'):Run {
  if(run.phase!=='maze')return run;
  const g=clone(run);
  if(command==='left'){g.dir=((g.dir+3)%4) as Direction;return g;}
  if(command==='right'){g.dir=((g.dir+1)%4) as Direction;return g;}
  const [dx,dy]=DIRS[g.dir];const dir=command==='back'?-1:1;
  const nx=g.x+dx*dir, ny=g.y+dy*dir;
  if(wall(nx,ny)){pushMessage(g,'NO ENTRY · WALL');return g;}
  g.x=nx;g.y=ny;g.steps++;
  const k=loc(nx,ny);if(!g.visited.includes(k))g.visited.push(k);
  const cell=MAP[ny][nx];
  if(cell==='E'){
    const foe:EnemyId=k==='1,11'?'gatekeeper':'auditor';
    if(!g.defeated.includes(foe))return startFight(g,foe);
  }
  if((cell==='A'||cell==='H')&&!g.dossiers.includes(cell)){g.phase='record';g.record=cell;return g;}
  if(cell==='X'){
    if(challengeFinal(g))return startFight(g,'engine');
    pushMessage(g,'FINAL DOOR LOCKED · 2 DOSSIERS + 2 INSPECTORS');
  }
  const ev=g.eventSites[k];
  if(ev&&!g.events.includes(ev)){g.phase='event';g.event=ev;return g;}
  g.message='';return g;
}
export function recordFile(run:Run):Run {
  if(run.phase!=='record')return run;
  const g=clone(run);g.dossiers.push(g.record);g.phase='reward';
  prepareReward(g);
  pushMessage(g,'PROJECT VERIFIED · SELECT A PROCEDURE · '+g.dossiers.length+'/2');
  return g;
}
export function resolveEvent(run:Run,choice:0|1):Run {
  if(run.phase!=='event'||run.events.includes(run.event))return run;
  const g=clone(run);
  g.events.push(g.event);g.phase='maze';
  if(g.event==='reference'){
    if(choice===0){g.deck.push('research');g.findings++;}
    else g.hp=Math.min(g.maxHp,g.hp+8);
  } else if(g.event==='printer'){
    if(choice===0){g.deck.push('maui');g.findings++;}
    else {const i=g.deck.indexOf('python');if(i!==-1)g.deck.splice(i,1);}
  } else if(g.event==='rest'){
    if(choice===0)g.hp=Math.min(g.maxHp,g.hp+12);
    else {g.deck.push('risk');g.findings++;}
  }
  pushMessage(g,'ADMINISTRATIVE DECISION ACCEPTED');
  return g;
}
function heal(g:Run,amount:number){const penalty=g.statuses.infected+(g.directive==='night_shift'?2:0);g.hp=Math.min(g.maxHp,g.hp+Math.max(0,amount-penalty));}
function cleanse(g:Run,amount:number){
  for(const key of ['bleeding','infected','wounded','ddosed'] as Ailment[]){
    const used=Math.min(amount,g.statuses[key]);g.statuses[key]-=used;amount-=used;
  }
  if(amount>0)g.misfiled=Math.max(0,g.misfiled-amount);
}
function deal(g:Run,base:number,ignoreArmor=false,code=true) {
  let amount=base;
  if(code && g.evidence>0){
    const used=Math.min(2,g.evidence);g.evidence-=used;amount+=2*used;
  }
  if(code && g.foeExposed>0){amount+=2;g.foeExposed--;}
  if(g.foeStatuses.wounded>0)amount+=g.foeStatuses.wounded;
  if(ignoreArmor){g.foeHp=Math.max(0,g.foeHp-amount);return amount;}
  const blocked=Math.min(amount,g.foeBlock);g.foeBlock-=blocked;
  g.foeHp=Math.max(0,g.foeHp-amount+blocked);
  return amount-blocked;
}
function prepareReward(g:Run){
  const fresh=shuffle(g,REWARD_POOL.filter(id=>!g.deck.includes(id)));
  const categories:['code','care','hybrid']=['code','care','hybrid'];
  const picks:CardId[]=[];
  for(const category of shuffle(g,categories)){
    const found=fresh.find(id=>CARDS[id].category===category&&!picks.includes(id));
    if(found)picks.push(found);
  }
  g.reward=[...picks,...fresh.filter(id=>!picks.includes(id))].slice(0,3);
}
function finishFight(g:Run){
  g.defeated.push(g.foe as EnemyId);
  g.hp=Math.min(g.maxHp,g.hp+5); // Nursing passive: recovery after every successful case.
  g.statuses.bleeding=0;g.statuses.ddosed=0;
  g.statuses.wounded=Math.max(0,g.statuses.wounded-1);
  g.statuses.infected=Math.max(0,g.statuses.infected-1);
  if(g.foe==='engine'){
    g.phase='clear';g.ending=g.findings>=2?'RULE §0451 INVALIDATED':'EXCEPTION GRANTED';g.reward=[];
    pushMessage(g,'CLASSIFICATION ENGINE OVERRIDDEN');
    return;
  }
  g.phase='reward';
  prepareReward(g);
  pushMessage(g,'INSPECTION PASSED · NURSING PASSIVE: +5 HP');
}
export function play(run:Run,index:number):Run {
  if(run.phase!=='battle'||index<0||index>=run.hand.length)return run;
  const id=run.hand[index], card=CARDS[id];
  if(card.cost>run.energy||(card.cost===0&&run.freePlayed>=2))return run;
  const g=clone(run),previous=g.lastCard;
  g.energy-=card.cost;g.hand.splice(index,1);g.discard.push(id);
  if(card.cost===0)g.freePlayed++;
  const beforeBlock=g.block;
  const next=intentFor(g.foe as EnemyId,g.turn,g.variants[g.foe as EnemyId]);
  let outcome='';
  if(EXTRA_EFFECTS[id]){
    for(const effect of EXTRA_EFFECTS[id]){
      const n=effect.amount;
      switch(effect.kind){
        case 'damage':deal(g,n,false,card.category==='code');break;
        case 'pierce':deal(g,n,true,card.category==='code');break;
        case 'block':g.block+=n;break;
        case 'evidence':g.evidence=Math.min(6,g.evidence+n);break;
        case 'expose':g.foeExposed=Math.min(5,g.foeExposed+n);break;
        case 'draw':draw(g,n);break;
        case 'heal':heal(g,n);break;
        case 'strip':g.foeBlock=Math.max(0,g.foeBlock-n);break;
        case 'carry':g.carry=Math.max(g.carry,n);break;
        case 'energy':g.energy=Math.min(5,g.energy+n);break;
        case 'cleanse':cleanse(g,n);break;
        case 'bleeding':case 'infected':case 'ddosed':case 'wounded':
          g.foeStatuses[effect.kind]=Math.min(3,g.foeStatuses[effect.kind]+n);break;
      }
    }
    outcome=card.name[0]+' EXECUTED';
  }else switch(id){
    case 'python':deal(g,6+(previous&&CARDS[previous].category==='code'?3:0));outcome='SCRIPT EXECUTED';break;
    case 'sql':{
      const stripped=Math.min(6,g.foeBlock);g.foeBlock-=stripped;deal(g,3);
      g.foeExposed=Math.min(5,g.foeExposed+2);outcome='QUERY RETURNS: EXPOSED +2';break;}
    case 'api':deal(g,7,true);outcome='ARMOR BYPASSED';break;
    case 'debug':{
      const hasExposure=g.foeExposed>0;
      deal(g,4);
      if(hasExposure){g.foeInterrupted=true;g.foeExposed=Math.max(0,g.foeExposed-1);outcome='BREAKPOINT HIT · ACTION CANCELLED';}
      else {g.foeExposed++;outcome='FAULT IDENTIFIED · EXPOSED +1';}
      break;
    }
    case 'rag':g.evidence=Math.min(6,g.evidence+2);draw(g,1);outcome='2 CITATIONS RETRIEVED';break;
    case 'automation':{
      const hits=previous&&CARDS[previous].category==='code'?3:2;
      for(let i=0;i<hits&&g.foeHp>0;i++)deal(g,4);
      outcome='PIPELINE RAN '+hits+' JOBS';break;
    }
    case 'abap':{
      const converted=Math.min(7,g.foeBlock);g.foeBlock-=converted;
      deal(g,3+converted);outcome='WORKFLOW PATCH APPLIED';break;}
    case 'maui':g.block+=5;deal(g,4,false,false);outcome='MULTIPLATFORM SUPPORT';break;
    case 'llm':{
      if(g.evidence>0){g.evidence--;deal(g,14,false,false);outcome='GROUNDED INFERENCE';}
      else {deal(g,4,false,false);outcome='UNVERIFIED OUTPUT';}
      break;
    }
    case 'triage':g.block+=5+(next.kind==='attack'?6:0);outcome='RISK PRIORITIZED';break;
    case 'assessment':g.block+=5;g.evidence=Math.min(6,g.evidence+1);outcome='OBSERVATION DOCUMENTED';break;
    case 'handoff':g.block+=7;g.carry= Math.max(g.carry,4);outcome='SAFE HANDOFF';break;
    case 'chart':g.block+=3;g.evidence=Math.min(6,g.evidence+2);g.misfiled=0;outcome='RECORD CORRECTED';break;
    case 'stabilize':heal(g,6);g.block+=4;outcome='PATIENT STABILIZED';break;
    case 'research':g.evidence=Math.min(6,g.evidence+3);draw(g,1);outcome='CLAIM PEER REVIEWED';break;
    case 'risk':g.block+=4;g.riskScreened=Math.min(2,g.riskScreened+2);outcome='FUTURE ATTACK RISK REDUCED';break;
  }
  if(g.block>beforeBlock&&g.statuses.wounded>0)g.block=Math.max(beforeBlock,g.block-g.statuses.wounded*2);
  g.lastCard=id;
  pushMessage(g,outcome);
  if(g.foeHp<=0)finishFight(g);
  return g;
}
export function endTurn(run:Run):Run {
  if(run.phase!=='battle')return run;
  const g=clone(run),foe=g.foe as EnemyId,intent=intentFor(foe,g.turn,g.variants[foe]);
  g.discard.push(...g.hand);g.hand=[];
  // Resolve visible bureaucratic bleeding/infection before the advertised action.
  g.foeHp=Math.max(0,g.foeHp-g.foeStatuses.bleeding-g.foeStatuses.infected*2);
  g.foeStatuses.bleeding=Math.max(0,g.foeStatuses.bleeding-1);
  if(g.foeHp<=0){finishFight(g);return g;}
  if(intent.kind!=='attack'&&g.foeStatuses.ddosed>0){
    g.foeInterrupted=true;g.foeStatuses.ddosed--;
  }
  let damage=0;
  if(!g.foeInterrupted){
    if(intent.kind==='attack'){
      const mitigated=Math.max(0,intent.amount-(g.riskScreened>0?4:0)-g.foeStatuses.wounded*2);
      if(g.riskScreened>0)g.riskScreened--;
      damage=Math.max(0,mitigated-g.block);
      g.hp=Math.max(0,g.hp-damage);
      if(damage>0&&intent.status)g.statuses[intent.status]=Math.min(3,g.statuses[intent.status]+1);
      g.foeStatuses.wounded=Math.max(0,g.foeStatuses.wounded-1);
    }else if(intent.kind==='guard')g.foeBlock+=intent.amount;
    else if(intent.kind==='misfile')g.misfiled+=intent.amount;
  }
  g.hp=Math.max(0,g.hp-g.statuses.bleeding*2-g.statuses.infected);
  g.statuses.bleeding=Math.max(0,g.statuses.bleeding-1);
  if(g.directive==='audit_overload'&&g.turn%4===0)g.misfiled++;
  if(g.hp<=0){g.phase='dead';pushMessage(g,'APPLICATION TERMINATED · RETRY AVAILABLE');return g;}
  const interrupted=g.foeInterrupted;
  g.foeInterrupted=false;g.turn++;
  g.block=g.carry;g.carry=0;g.energy=Math.max(1,3-Math.min(2,g.misfiled));
  g.lastCard='';g.freePlayed=0;
  draw(g,Math.max(2,5-g.statuses.ddosed));
  g.statuses.ddosed=Math.max(0,g.statuses.ddosed-1);
  pushMessage(g,interrupted?'PROCEDURE INTERRUPTED':damage?'HP -'+damage:
    intent.kind==='guard'?'ENEMY ARMOR +'+intent.amount:
    intent.kind==='misfile'?'MISFILED · ENERGY -1 PER STACK':'ATTACK BLOCKED');
  return g;
}
export function chooseReward(run:Run,id:CardId|null):Run {
  if(run.phase!=='reward'||(id!==null&&!run.reward.includes(id)))return run;
  const g=clone(run);if(id)g.deck.push(id);
  g.phase='maze';g.hand=[];g.discard=[];g.drawPile=[];g.block=0;g.carry=0;g.evidence=0;
  pushMessage(g,id?'NEW PROCEDURE FILED · '+CARDS[id].name[0]:'REWARD DECLINED');
  return g;
}
export function progress(g:Run):number {
  return g.dossiers.length + g.defeated.length;
}
