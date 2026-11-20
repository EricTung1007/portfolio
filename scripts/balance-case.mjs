import { pathToFileURL } from 'node:url';
const game = await import(pathToFileURL('/tmp/case0451-engine.mjs').href);
const { CARDS, createRun, reject, startAppeal, startFight, play, endTurn, chooseReward, intentFor } = game;
const ROLE='OTHER';
function score(g,id){
  const c=CARDS[id],i=intentFor(g.foe,g.turn);
  const danger=i.kind==='attack'?Math.max(0,i.amount-(g.riskScreened?4:0)-g.block):0;
  const evidence=g.evidence,armor=g.foeBlock;
  switch(id){
    case 'triage':return danger?10+Math.min(12,danger):0;
    case 'assessment':return (danger?7:1)+(evidence<2?13:2);
    case 'handoff':return danger?14:5;
    case 'chart':return (g.misfiled?36:0)+(danger?4:0)+(evidence<3?13:3);
    case 'risk':return i.kind==='attack'?15:10;
    case 'stabilize':return g.maxHp-g.hp>=6?24:danger?8:-10;
    case 'rag':return evidence<2?27:10;
    case 'research':return evidence<3?29:9;
    case 'sql':return armor>2?26:11;
    case 'api':return armor>=5?30:15;
    case 'abap':return armor>=5?32:12;
    case 'debug':return g.foeExposed>0&&i.kind==='attack'?38:12;
    case 'llm':return evidence>0?34:1;
    case 'automation':return g.lastCard&&CARDS[g.lastCard].category==='code'?28:19;
    case 'python':return g.lastCard&&CARDS[g.lastCard].category==='code'?25:20;
    case 'maui':return danger?18:15;
    default:return 1;
  }
}
const rewardRank=['research','llm','maui','stabilize','automation','abap','debug','risk','rag','chart','api','assessment'];
function simulate(seed,planned){
  let g=startAppeal(reject(createRun(0,seed),ROLE));
  let turns=0,foes=0;
  for(const foe of ['gatekeeper','auditor','engine']){
    g=startFight(g,foe);
    while(g.phase==='battle'&&g.turn<=25){
      let count=0;
      while(g.phase==='battle'&&count++<12){
        const options=g.hand.map((id,index)=>({id,index,rank:score(g,id)}))
          .filter(p=>CARDS[p.id].cost<=g.energy);
        if(!options.length)break;
        if(planned)options.sort((a,b)=>b.rank-a.rank);
        const pick=options[0];
        g=play(g,pick.index);
      }
      if(g.phase==='battle')g=endTurn(g);
    }
    if(g.phase==='dead'||g.phase==='battle')return {win:false,foes,turns,health:g.hp};
    foes++;turns+=g.turn;
    if(g.phase==='clear')return {win:true,foes,turns,health:g.hp};
    if(g.phase==='reward'){
      const choice=planned?rewardRank.find(id=>g.reward.includes(id))??g.reward[0]:g.reward[0];
      g=chooseReward(g,choice);
    }
    // This simulates reachable pre-boss side rooms with health-rest choices.
    if(foe==='gatekeeper')g.hp=Math.min(g.maxHp,g.hp+8);
    if(foe==='auditor')g.hp=Math.min(g.maxHp,g.hp+12);
  }
  return {win:false,foes,turns,health:g.hp};
}
const n=120;
for(const planned of [false,true]){
  const data=Array.from({length:n},(_,i)=>simulate(10000+i,planned));
  const victories=data.filter(x=>x.win);
  const avgTurns=Math.round(data.reduce((s,x)=>s+x.turns,0)/n*10)/10;
  const avgFoes=Math.round(data.reduce((s,x)=>s+x.foes,0)/n*100)/100;
  console.log((planned?'PLANNED':'NAIVE')+' '+n+' seeds: wins='+victories.length+' ('+Math.round(100*victories.length/n)+'%), average defeated='+avgFoes+'/3, total turns='+avgTurns+'.');
}
