/* CASE 0451: eight authored base-action cards with two mutually exclusive
 * upgrades each. The upgrade ID replaces one chosen copy in the deck. */
import type { ExtraCard, CardEffect } from './case-roguelite-cards.js';
export type UpgradeBranch='A'|'B';
type UpgradeEntry={base:string;branch:UpgradeBranch;card:ExtraCard;effects:CardEffect[]};
const specs:UpgradeEntry[]=[];
function add(base:string,category:ExtraCard['category'],source:string,
  a:[string,string,number,string,string,string],b:[string,string,number,string,string,string]){
 for(const [branch,part] of [['A',a],['B',b]] as const){
  const [label,zh,cost,enText,zhText,rules]=part;
  const id=base+'_'+(branch==='A'?'a':'b');
  const dict:Record<string,CardEffect['kind']>={d:'damage',p:'pierce',b:'block',e:'evidence',x:'expose',
    t:'draw',h:'heal',s:'strip',k:'carry',q:'energy',c:'cleanse'};
  specs.push({base,branch,card:{id,name:[label,zh],category,cost,
    text:[enText,zhText],origin:[source,source]},
    effects:rules?rules.split(',').map(item=>{
      const m=/^([a-z])(\d+)$/.exec(item);
      if(!m||!dict[m[1]])throw Error('Invalid upgrade '+id);
      return {kind:dict[m[1]],amount:+m[2]};
    }):[]});
 }
}
add('python','code','Python / scripting',
 ['QUICK SCRIPT','快速腳本',0,'4 damage; +2 after CODE.','造成 4 傷害；接在 CODE 後再 +2。',''],
 ['BATCH SCRIPT','批次腳本',1,'7 damage; +4 after CODE.','造成 7 傷害；接在 CODE 後再 +4。','']);
add('sql','code','SQL / databases',
 ['FORENSIC SQL','鑑識查詢',1,'Strip 8 armor, deal 3 damage, add 3 Exposed.','削除 8 護甲、造成 3 傷害、揭露 3 弱點。','s8,d3,x3'],
 ['RECURSIVE QUERY','遞迴查詢',1,'Strip 4 armor, deal 2 damage, add 2 Exposed; draw 1.','削除 4 護甲、造成 2 傷害、揭露 2 弱點；抽 1。','s4,d2,x2,t1']);
add('rag','hybrid','RAG / retrieval',
 ['PRECISE RETRIEVAL','精準檢索',1,'Gain 3 Evidence; draw 1.','獲得 3 證據；抽 1。','e3,t1'],
 ['BROAD RETRIEVAL','廣域檢索',1,'Gain 1 Evidence; draw 2.','獲得 1 證據；抽 2。','e1,t2']);
add('assessment','care','Clinical assessment',
 ['DEEP ASSESSMENT','深度評估',1,'Gain 5 Block and 2 Evidence.','獲得 5 護盾及 2 證據。','b5,e2'],
 ['RAPID ASSESSMENT','快速評估',0,'Gain 3 Block and 1 Evidence.','獲得 3 護盾及 1 證據。','b3,e1']);
add('triage','care','Clinical triage',
 ['PRIORITY TRIAGE','優先檢傷',1,'6 Block, +8 when next intent ATTACK.','6 護盾；敵方預告攻擊時再 +8。',''],
 ['FIELD TRIAGE','現場檢傷',0,'4 Block, +3 when next intent ATTACK.','4 護盾；敵方預告攻擊時再 +3。','']);
add('handoff','care','Nursing handoff',
 ['CONTINUITY PLAN','照護延續計畫',1,'8 Block and carry 6 to next turn.','8 護盾，延續 6 護盾至下回合。','b8,k6'],
 ['SHIFT SUMMARY','交班摘要',1,'5 Block, carry 4 and draw one extra next turn.','5 護盾，延續 4 護盾，下回合多抽 1。','b5,k4']);
add('api','code','REST API / backend',
 ['AUTHENTICATED REQUEST','權限驗證請求',1,'Deal 9 damage through armor.','造成 9 穿甲傷害。','p9'],
 ['PROTOCOL NEGOTIATION','協定協商',1,'Deal 5 piercing damage and add 1 Exposed.','造成 5 穿甲傷害並揭露 1 弱點。','p5,x1']);
add('llm','code','Local LLM / evaluated inference',
 ['GROUNDED INFERENCE','有據推論',2,'Spend 1 Evidence for 18 damage; else deal 4.','消耗 1 證據造成 18 傷害；否則造成 4。',''],
 ['EFFICIENT INFERENCE','精簡推論',1,'Spend 1 Evidence for 10 damage; else deal 4.','消耗 1 證據造成 10 傷害；否則造成 4。','']);
export const UPGRADE_CARDS:Record<string,ExtraCard>=Object.fromEntries(specs.map(s=>[s.card.id,s.card]));
export const UPGRADE_EFFECTS:Record<string,CardEffect[]>=Object.fromEntries(specs.map(s=>[s.card.id,s.effects]));
export const UPGRADE_CHOICES:Record<string,[string,string]>=Object.fromEntries(
 [...new Set(specs.map(s=>s.base))].map(base=>[base,[base+'_a',base+'_b']])
);
export const UPGRADE_BASE:Record<string,string>=Object.fromEntries(specs.map(s=>[s.card.id,s.base]));
export const UPGRADE_COUNT=specs.length;
if(UPGRADE_COUNT!==16)throw Error('Expected 16 upgrade variants');
