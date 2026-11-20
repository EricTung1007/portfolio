import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
const game=await import(pathToFileURL('/tmp/case0451-engine.mjs').href);
const {CARDS,EXTRA_CARD_IDS,EXTRA_EFFECTS,UPGRADE_CHOICES,
 createRun,reject,startAppeal,startFight,play,endTurn,chooseUpgrade}=game;
const checkRange=(value,min,max,message)=>assert.ok(Number.isFinite(value)&&value>=min&&value<=max,
 message+'='+String(value));
const cardIds=Object.keys(CARDS);
const signatures=new Set();
for(const id of EXTRA_CARD_IDS){
 const c=CARDS[id],signature=[c.category,c.cost,JSON.stringify(EXTRA_EFFECTS[id])].join('/');
 assert.ok(!signatures.has(signature),'Duplicate indistinguishable action mechanic: '+id);
 signatures.add(signature);
}
for(let seed=5000;seed<5500;seed++){
 const a=createRun(0,seed),b=createRun(0,seed);
 assert.deepEqual(a,b,'Seed must reproduce all randomized rules and placements');
 assert.ok(a.rng>=0&&a.rng<=0xffffffff,'RNG remains unsigned');
 assert.ok(a.mapVariant>=0&&a.mapVariant<3,'Map variant valid');
}
let effectsChecked=0;
for(const id of cardIds){
 const g0=startFight(startAppeal(reject(createRun(0,9500+effectsChecked),'OTHER')),'gatekeeper');
 let g={...g0,foeHp:1000,foeBlock:11,hp:18,evidence:4,energy:3,hand:[id],
  drawPile:['python','rag','assessment','api'],discard:[],statuses:{wounded:1,bleeding:1,infected:1,ddosed:1}};
 const beforeEnergy=g.energy;
 const result=play(g,0);
 assert.ok(result!==g,'Every one of the 128 cards must actually resolve: '+id);
 assert.equal(result.hand.includes(id),false,'Played card removed from hand: '+id);
 assert.equal(result.phase,'battle','High enemy HP should keep combat active: '+id);
 checkRange(result.hp,0,42,id+' HP');
 checkRange(result.foeHp,0,1000,id+' enemy HP');
 checkRange(result.energy,0,5,id+' Energy');
 checkRange(result.evidence,0,6,id+' Evidence');
 checkRange(result.foeBlock,0,1000,id+' enemy armor');
 checkRange(result.foeExposed,0,5,id+' Exposed');
 checkRange(result.block,0,200,id+' Block');
 for(const [status,stacks] of Object.entries(result.statuses)){
  checkRange(stacks,0,3,id+' player '+status);
 }
 for(const [status,stacks] of Object.entries(result.foeStatuses)){
  checkRange(stacks,0,3,id+' enemy '+status);
 }
 assert.ok(result.energy<=beforeEnergy+1,'Single action must not explode energy: '+id);
 effectsChecked++;
}
for(const [base,variants] of Object.entries(UPGRADE_CHOICES)){
 assert.equal(variants.length,2,'Two valid branches for '+base);
 for(const id of variants){assert.ok(CARDS[id],base+' upgrade has a card');}
}
console.log('CASE 0451 fuzz: '+cardIds.length+' executable card effects, '+EXTRA_CARD_IDS.length+
 ' distinct extra mechanics, 500 seeded case states, upgrade pairs and resource bounds verified.');
