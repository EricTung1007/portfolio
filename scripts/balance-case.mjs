import { pathToFileURL } from 'node:url';
const game=await import(pathToFileURL('/tmp/case0451-engine.mjs').href);
const {MAP,DIRS,CARDS,EXTRA_EFFECTS,createRun,reject,startAppeal,move,recordFile,resolveEvent,play,endTurn,chooseReward,intentFor,resolveHearing}=game;
const N=120;
function shortestPath(){
  const start=[1,1], goal='4,3';
  const k=([x,y])=>x+','+y;
  const queue=[start], parent=new Map([[k(start),null]]);
  for(let i=0;i<queue.length;i++){
    const [x,y]=queue[i];if(k([x,y])===goal)break;
    for(const [dx,dy] of DIRS){
      const next=[x+dx,y+dy], key=k(next);
      if(MAP[next[1]]?.[next[0]] && MAP[next[1]][next[0]]!=='#'&&!parent.has(key)){
        parent.set(key,[x,y]);queue.push(next);
      }
    }
  }
  if(!parent.has(goal))throw Error('No route to central door');
  const result=[];let cursor=[4,3];
  while(cursor){result.push(cursor);cursor=parent.get(k(cursor));}
  return result.reverse();
}
const route=shortestPath();
if(route.length!==82)throw Error('Unexpected map route length: '+route.length);
function score(g,id){
 const card=CARDS[id],next=intentFor(g.foe,g.turn,g.variants[g.foe]);
 const danger=next.kind==='attack'?Math.max(0,next.amount-(g.riskScreened?4:0)-g.block):0;
 const e=g.evidence,armor=g.foeBlock,status=g.statuses;
 const base={
  triage:danger?30:2,assessment:danger?19:13,handoff:danger?26:5,chart:g.misfiled?36:e<3?20:6,
  stabilize:g.maxHp-g.hp>=6?31:3,rag:e<3?29:6,research:e<4?30:6,
  sql:armor>2?28:15,api:armor>=5?33:19,abap:armor>=4?34:15,
  debug:g.foeExposed>0&&next.kind==='attack'?40:9,llm:e>0?35:2,
  automation:g.lastCard&&CARDS[g.lastCard].category==='code'?30:20,
  python:g.lastCard&&CARDS[g.lastCard].category==='code'?26:20,
  maui:danger?24:15,risk:next.kind==='attack'?21:12
 }[id];
 if(base!==undefined)return base;
 const effects=EXTRA_EFFECTS[id]??[];
 let s=0;
 for(const fx of effects){
  if(fx.kind==='damage')s+=fx.amount*2;
  if(fx.kind==='pierce')s+=fx.amount*(armor?3:2);
  if(fx.kind==='block')s+=danger?Math.min(danger,fx.amount)*2:0;
  if(fx.kind==='evidence')s+=e<4?fx.amount*6:1;
  if(fx.kind==='expose')s+=g.foeExposed<2?fx.amount*5:1;
  if(fx.kind==='draw')s+=fx.amount*5;
  if(fx.kind==='heal')s+=Math.min(g.maxHp-g.hp,fx.amount)*2;
  if(fx.kind==='strip')s+=Math.min(armor,fx.amount)*2;
  if(fx.kind==='cleanse')s+=(status.bleeding+status.infected+status.wounded+status.ddosed+g.misfiled)?fx.amount*6:0;
  if(fx.kind==='wounded')s+=next.kind==='attack'?fx.amount*9:1;
  if(fx.kind==='bleeding'||fx.kind==='infected')s+=fx.amount*4;
  if(fx.kind==='ddosed')s+=next.kind==='attack'?0:fx.amount*8;
  if(fx.kind==='carry')s+=fx.amount;
  if(fx.kind==='energy')s+=fx.amount*6;
 }
 return s-Math.max(0,card.cost-1)*4;
}
function pickReward(g,planned){
 const order=['research','llm','prompt_eval','med_reconciliation','rag','stabilize','api','maui'];
 const choice=planned?order.find(x=>g.reward.includes(x))||g.reward.reduce((a,b)=>score(g,a)>score(g,b)?a:b):g.reward[0];
 return chooseReward(g,choice??null);
}
function resolveCaseEvent(g,planned){
 const id=g.event;
 let choice=0;
 if(planned){
  if(id==='reference')choice=g.hp<22?1:0;
  else if(id==='printer')choice=g.deck.filter(x=>x==='python').length>1?1:0;
  else if(id==='rest')choice=g.hp<27?0:1;
 }
 return resolveEvent(g,choice);
}
function simulate(seed,role,planned){
 let g=startAppeal(reject(createRun(0,seed),role)),turns=0,foes=0;
 for(let i=1;i<route.length;i++){
  const [x,y]=route[i],dir=DIRS.findIndex(([dx,dy])=>g.x+dx===x&&g.y+dy===y);
  if(dir<0)throw Error('Invalid path');
  for(let k=0;g.dir!==dir && k<4;k++)g=move(g,'right');
  g=move(g,'forward');
  if(g.phase==='event')g=resolveCaseEvent(g,planned);
  if(g.phase==='hearing')g=resolveHearing(g,planned?1:2);
  if(g.phase==='record')g=recordFile(g);
  if(g.phase==='battle'){
   let maxTurns=30;
   while(g.phase==='battle'&&maxTurns-->0){
    let actions=0;
    while(g.phase==='battle'&&actions++<20){
     const options=g.hand.map((id,index)=>({id,index,score:score(g,id)}))
       .filter(x=>CARDS[x.id].cost<=g.energy&&(CARDS[x.id].cost!==0||g.freePlayed<2));
     if(!options.length)break;
     if(planned)options.sort((a,b)=>b.score-a.score);
     g=play(g,options[0].index);
    }
    if(g.phase==='battle')g=endTurn(g);
   }
   turns+=g.turn;
   if(g.phase==='battle'||g.phase==='dead')return {win:false,foes,turns,hp:g.hp,seed,role};
   foes++;
  }
  if(g.phase==='reward')g=pickReward(g,planned);
  if(g.phase==='dead')return {win:false,foes,turns,hp:g.hp,seed,role};
 }
 return {win:g.phase==='clear',foes,turns,hp:g.hp,seed,role,ending:g.ending};
}
console.log('CASE 0451 route-aware simulation: '+(route.length-1)+' steps, rewards/events resolved at actual coordinates.');
for(const role of ['ENGINEER','NURSE','OTHER']){
 for(const planned of [false,true]){
  const data=Array.from({length:N},(_,i)=>simulate(10000+i,role,planned));
  const wins=data.filter(x=>x.win).length;
  const avg=data.reduce((n,g)=>n+g.turns,0)/N;
  const avgFoes=data.reduce((n,g)=>n+g.foes,0)/N;
  console.log(role+' '+(planned?'PLANNED':'NAIVE')+': wins='+wins+'/'+N+' ('+Math.round(wins/N*100)+'%), defeated='+avgFoes.toFixed(2)+'/3, turns='+avg.toFixed(1));
 }
}
