import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';

const game = await import(pathToFileURL('/tmp/case0451-engine.mjs').href);
const {
  BASE_DECK,CARDS,ENEMIES,MAP,EVENTS,
  createRun,reject,startAppeal,reclassify,move,recordFile,resolveEvent,
  intentFor,startFight,play,endTurn,chooseReward,
} = game;
let checks=0;
function expect(condition,message) {assert.ok(condition,message);checks++;}
function eq(actual,expected,label) {assert.deepEqual(actual,expected,label);checks++;}
function atHand(run,...cards){return {...run,hand:cards,drawPile:[],discard:[],energy:3};}

{
  const start=createRun(0,451);
  eq(start.phase,'review','begins on inspection form');
  eq(start.deck.length,BASE_DECK.length,'starter deck count');
  eq(Object.keys(CARDS).length,16,'CV-grounded card count');
  expect(Object.values(CARDS).every(c=>c.name.length===2&&c.text.length===2&&c.origin.length===2),'cards are bilingual and CV-sourced');
  const rejected=reject(start,'ENGINEER');
  eq(rejected.phase,'denied','classification refused');
  eq(reclassify(rejected).phase,'review','reclassification supported');
  const appeal=startAppeal(rejected);
  eq(appeal.phase,'maze','appeal enters maze');
  expect(appeal.deck.includes('debug'),'Engineer starting card granted');
  expect(startAppeal(reject(start,'NURSE')).deck.includes('stabilize'),'Nurse starting card granted');
  expect(startAppeal(reject(start,'OTHER')).deck.includes('maui'),'Other starting card granted');
}
{
  const visited=new Set(['1,1']);
  const q=[[1,1]];
  while(q.length){
    const [x,y]=q.shift();
    for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){
      const nx=x+dx,ny=y+dy,k=nx+','+ny;
      if(MAP[ny]?.[nx] && MAP[ny][nx]!=='#' && !visited.has(k)){
        visited.add(k);q.push([nx,ny]);
      }
    }
  }
  for(const point of ['1,11','7,1','6,13','10,3','4,3',...Object.keys(EVENTS)])
    expect(visited.has(point),'important location reachable: '+point);
}
{
  let g=startFight(startAppeal(reject(createRun(0,100),'OTHER')),'gatekeeper');
  eq(g.phase,'battle','encounter begins battle');
  eq(g.hand.length,5,'draw five starting cards');
  eq(g.foeHp,ENEMIES.gatekeeper.hp,'correct enemy HP');
  eq(intentFor('gatekeeper',1).amount,7,'telegraphed attack');
  g=atHand(g,'assessment','api');
  g=play(g,0);
  eq(g.evidence,1,'assessment creates evidence');
  eq(g.block,5,'assessment creates clinical protection');
  g=play(g,0);
  eq(g.evidence,0,'REST consumes evidence');
  eq(g.foeHp,ENEMIES.gatekeeper.hp-(7+2),'REST pierces armor plus evidence damage');
}
{
  let g=startFight(startAppeal(reject(createRun(0,101),'ENGINEER')),'gatekeeper');
  g=atHand(g,'sql');
  g.foeBlock=9;
  g=play(g,0);
  eq(g.foeBlock,0,'SQL strips enemy armor and the attack hits remainder');
  eq(g.foeExposed,2,'SQL exposes assumptions');
  g=atHand(g,'debug');
  const hp=g.hp;g=play(g,0);
  expect(g.foeInterrupted,'breakpoint interrupts an exposed enemy');
  g=endTurn(g);
  eq(g.hp,hp,'interrupted enemy causes zero damage');
  eq(g.turn,2,'turn advances even when interrupted');
}
{
  let g=startFight(startAppeal(reject(createRun(0,102),'NURSE')),'gatekeeper');
  g=atHand(g,'triage');
  g=play(g,0);
  eq(g.block,11,'triage rewards knowledge of incoming attack');
  const hp=g.hp;
  g=endTurn(g);
  eq(g.hp,hp,'triage blocks gatekeeper attack');
  g=atHand(g,'handoff');g=play(g,0);
  eq(g.carry,4,'handoff preserves 4 protection');
  g=endTurn(g);
  eq(g.block,4,'handoff carries protection forward');
}
{
  let g=startFight(startAppeal(reject(createRun(0,202),'NURSE')),'gatekeeper');
  g=atHand(g,'risk');g=play(g,0);
  eq(g.riskScreened,2,'risk screening protects against two future attacks');
  const hp=g.hp;g=endTurn(g);
  eq(g.hp,hp,'first screened attack is mitigated by block and prevention');
  eq(g.riskScreened,1,'one attack prevention charge remains');
  g=atHand(g);g=endTurn(g); // enemy guards, should not consume a screening charge
  eq(g.riskScreened,1,'risk screen persists through non-attacking intent');
  g=atHand(g);const hp2=g.hp;g=endTurn(g); // 11 damage reduced to 7
  eq(g.hp,hp2-7,'second screened attack reduces its damage by four');
  eq(g.riskScreened,0,'risk screen consumed after two actual attacks');
}
{
  let g=startFight(startAppeal(reject(createRun(0,103),'NURSE')),'auditor');
  g=atHand(g,'chart');g.misfiled=2;
  g=play(g,0);
  eq(g.misfiled,0,'SOAP correction removes inaccurate classification');
  eq(g.evidence,2,'SOAP adds documented evidence');
}
{
  let g=startFight(startAppeal(reject(createRun(0,104),'OTHER')),'auditor');
  g=atHand(g,'api');g.foeHp=4;g.hp=20;
  g=play(g,0);
  eq(g.phase,'reward','non-final victory offers deck choices');
  eq(g.hp,25,'passive heals exactly five HP');
  eq(g.reward.length,3,'three draft options');
  const reward=g.reward[0],before=g.deck.length;
  g=chooseReward(g,reward);
  eq(g.phase,'maze','rewards return to the dungeon');
  eq(g.deck.length,before+1,'chosen card added to deck');
}
{
  let g=startAppeal(reject(createRun(0,105),'OTHER'));
  g.x=4;g.y=5;g.dir=1;g=move(g,'forward');
  eq(g.phase,'event','story encounter triggered on map tile');
  eq(g.event,'reference','correct reference room');
  g=resolveEvent(g,0);
  expect(g.deck.includes('research'),'paper choice adds research card');
  expect(g.events.includes('reference'),'event cannot be farmed repeatedly');
  g=move({...g,x:4,y:5,dir:1},'forward');
  eq(g.phase,'maze','resolved event no longer blocks movement');
}
{
  let g=startAppeal(reject(createRun(0,106),'NURSE'));
  g.x=5;g.y=13;g.dir=1;g=move(g,'forward');
  eq(g.phase,'record','project file appears in dungeon');
  eq(g.record,'A','RAG project evidence');
  g=recordFile(g);
  expect(g.dossiers.includes('A'),'record registered');
  g={...g,x:3,y:3,dir:1};
  g=move(g,'forward');
  eq(g.phase,'maze','central door rejects incomplete evidence');
  g={...g,x:3,y:3,dir:1,dossiers:['A','H'],defeated:['gatekeeper','auditor']};
  g=move(g,'forward');
  eq(g.phase,'battle','complete dossier unlocks final boss');
  eq(g.foe,'engine','actual classification engine encounter');
  g=atHand(g,'api');g.foeHp=3;g=play(g,0);
  eq(g.phase,'clear','defeating final boss wins the appeal');
}
{
  let g=startFight(startAppeal(reject(createRun(0,107),'OTHER')),'gatekeeper');
  g.hp=1;g.block=0;
  g=endTurn(g);
  eq(g.phase,'dead','lethal damage ends run');
}
console.log('CASE 0451: '+checks+' gameplay assertions passed.');
