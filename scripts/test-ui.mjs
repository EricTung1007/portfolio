import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { pathToFileURL } from 'node:url';

const game=await import(pathToFileURL('/tmp/case0451-engine.mjs').href);
const {Department}=await import('../.ci/case0451-component.mjs');
let snapshot=null;
globalThis.localStorage={
  getItem:()=>snapshot,
  setItem:()=>{},
};
const render=(state,language='zh')=>{
  snapshot=JSON.stringify(state);
  return renderToStaticMarkup(React.createElement(Department,{
    language,onNavigate:()=>{},onLanguageChange:()=>{},
  }));
};
const base=game.createRun(0,451);
const denied=game.reject(base,'ENGINEER');
const maze=game.startAppeal(denied);
const battle=game.startFight(maze,'gatekeeper');
const record={...maze,phase:'record',record:'A'};
const reward={...maze,phase:'reward',reward:['rag','api','assessment']};
const upgrade={...maze,phase:'upgrade',upgradePending:1};
const hearing={...maze,phase:'hearing',dossiers:['A','H'],defeated:['gatekeeper','auditor']};
const endings=['dead','clear','settled'].map(phase=>({...maze,phase,ending:'RULE §0451 INVALIDATED'}));
const scenes=[
  ['review',base,'人事登錄表'],['denied',denied,'REJECTED'],
  ['maze',maze,'canvas'],['battle',battle,'dm-card-art'],
  ['record',record,'EXHIBIT'],['reward',reward,'dm-reward-cards'],
  ['upgrade',upgrade,'dm-upgrade-cards'],
  ['hearing',hearing,'兩份已核實的專案'],
  ['dead',endings[0],'申請已終止'],
  ['clear',endings[1],'ERR: FIELD_NOT_FOUND'],
  ['settled',endings[2],'案件歸檔'],
];
for(const [kind,run,marker] of scenes){
  const html=render(run);
  assert.ok(html.includes(marker),kind+' renders phase-specific content');
  assert.ok(html.includes('作品')&&html.includes('CV'),kind+' provides direct portfolio navigation');
  assert.ok(html.includes('卡牌')&&html.includes('手冊'),kind+' retains card archive and manual');
  assert.ok(html.includes('繁中')||html.includes('EN'),kind+' offers language toggle');
}
const english=render(battle,'en');
assert.ok(english.includes('CARE')&&english.includes('CODE'),'combat distinguishes actual action categories');
assert.ok(english.includes('dm-card-art'),'combat shows card artwork with actual effects');
const upgradeMarkup=render(upgrade);
assert.ok(upgradeMarkup.includes('FAST')&&upgradeMarkup.includes('BATCH'),'alternative upgraded card illustrations appear together');
console.log('CASE 0451 SSR UI smoke: '+scenes.length+' phases, bilingual art, upgrades, CV/WORK/navigation all rendered.');
