import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { pathToFileURL } from 'node:url';
const game=await import(pathToFileURL('/tmp/case0451-engine.mjs').href);
const ORIGIN='http://127.0.0.1:4173/';
const saveKey='case0451_save_v3';
const sleep=(ms)=>new Promise(resolve=>setTimeout(resolve,ms));
for(let attempt=0;attempt<40;attempt++){
 try{const r=await fetch(ORIGIN);if(r.ok)break;}catch{}
 if(attempt===39)throw Error('Vite preview did not start');
 await sleep(250);
}
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
let assertions=0;
const check=(predicate,message)=>{assert.ok(predicate,message);assertions++;};
const state=(phase,seed=451)=>{
 const g=game.startAppeal(game.reject(game.createRun(0,seed),'OTHER'));
 return {...g,phase};
};
async function setState(page,run){
 await page.evaluate(([key,value])=>localStorage.setItem(key,value),
   [saveKey,JSON.stringify(run)]);
 await page.reload({waitUntil:'networkidle'});
}
const errors=[];
try{
 const desktop=await browser.newContext({viewport:{width:1280,height:900}});
 const page=await desktop.newPage();
 page.on('pageerror',e=>errors.push('desktop: '+e.message));
 await page.goto(ORIGIN+'#/department',{waitUntil:'networkidle'});
 check((await page.locator('.dm-paper').count())===1,'opening bureaucratic form renders');
 check((await page.locator('.dm-top-links button').count())>=4,'CV-independent navigation is visible');
 await page.locator('.dm-choices button').nth(2).click();
 check((await page.locator('.dm-rejection').count())===1,'OTHER classification receives rejection');
 await page.locator('.dm-reject-actions .dm-appeal').click();
 check((await page.locator('.dm-viewport canvas').count())===1,'appeal enters first-person maze');
 await page.locator('.dm-top-links button').filter({hasText:'CARDS'}).click();
 check((await page.locator('.dm-catalog-entry').count())===128,'all 128 art variants are browsable');
 check((await page.locator('.dm-catalog-entry .dm-card-art').count())===128,'every catalog card has an illustration');
 await page.locator('.dm-catalog-title button').click();
 await page.locator('.dm-top-links button').filter({hasText:'MANUAL'}).click();
 check((await page.locator('.dm-manual').count())===1,'in-game manual can be opened');
 await page.locator('.dm-top-links button').filter({hasText:'WORK'}).click();
 check(page.url().includes('#/portfolio'),'WORK button navigates to actual portfolio hash');
 check((await page.locator('.dm-paper,.dm-viewport').count())===0,'WORK destination is not silently intercepted by game');
 await page.goto(ORIGIN+'#/portfolio',{waitUntil:'networkidle'});
 check((await page.locator('.dm').count())===0,'portfolio deep link loads independently');
 await page.goto(ORIGIN+'#/department',{waitUntil:'networkidle'});
 // Preserve/resume is tested separately. Reset the run to inspect the initial form.
 await page.evaluate(key=>localStorage.removeItem(key),saveKey);
 await page.reload({waitUntil:'networkidle'});
 await page.locator('.dm-language').click();
 check((await page.locator('.dm-paper-head').innerText()).includes('人事登錄表'),'game language toggle uses Traditional Chinese');
 await page.evaluate(()=>localStorage.setItem('eric_language','en'));
 const battle=game.startFight(state('maze',608),'gatekeeper');
 await setState(page,battle);
 check((await page.locator('.dm-encounter-portrait svg').count())===1,'the actual enemy sprite is visible in combat');
 check((await page.locator('.dm-hand .dm-card-art').count())===5,'all five hand cards have semantic artwork');
 check((await page.locator('.dm-evidence-toggle').count())===1,'manual Evidence spending control is available');
 await page.locator('.dm-evidence-toggle').click();
 check((await page.locator('.dm-evidence-toggle').getAttribute('aria-pressed'))==='true','HOLD activates without playing a card');
 await page.reload({waitUntil:'networkidle'});
 check((await page.locator('.dm-evidence-toggle').getAttribute('aria-pressed'))==='true','combat save preserves Evidence HOLD mode');
 let upgrade=state('upgrade',612);upgrade.upgradePending=1;
 await setState(page,upgrade);
 check((await page.locator('.dm-upgrade-cards .dm-card-art').count())>=2,'upgrade station shows two meaningfully different visual choices');
 await page.locator('.dm-upgrade-cards button').first().click();
 check((await page.locator('.dm-console').count())===1,'selecting an upgrade returns to maze');
 let hearing=state('hearing',620);
 hearing.dossiers=['A','H'];hearing.defeated=['gatekeeper','auditor'];
 await setState(page,hearing);
 check((await page.locator('.dm-hearing-exhibits a').count())===2,'hearing exposes the two source project links');
 await page.locator('.dm-hearing .dm-event-actions button').nth(1).click();
 check((await page.locator('.dm-encounter-portrait').count())===1,'defensible objection opens final classification battle');
 check((await page.locator('.dm-encounter-name').innerText()).length>0,'classification engine identity is visible');

 const mobile=await browser.newContext({viewport:{width:375,height:812},isMobile:true,hasTouch:true});
 const phone=await mobile.newPage();
 phone.on('pageerror',e=>errors.push('mobile: '+e.message));
 await phone.goto(ORIGIN+'#/department',{waitUntil:'networkidle'});
 check((await phone.locator('.dm-paper').count())===1,'375px form renders');
 await phone.locator('.dm-choices button').nth(2).click();
 await phone.locator('.dm-reject-actions .dm-appeal').click();
 const pos1=await phone.locator('.dm-viewport-label').innerText();
 await phone.locator('.dm-pad button[aria-label="Forward"]').click();
 const pos2=await phone.locator('.dm-viewport-label').innerText();
 check(pos1!==pos2,'mobile touch forward button moves one tile');
 const mobileWidth=await phone.evaluate(()=>({page:document.documentElement.scrollWidth,window:window.innerWidth}));
 check(mobileWidth.page<=mobileWidth.window+2,'375px layout does not overflow horizontally: '+JSON.stringify(mobileWidth));
 await setState(phone,battle);
 check((await phone.locator('.dm-hand .dm-card-art').count())===5,'mobile cards retain illustrations');
 check((await phone.locator('.dm-encounter-portrait svg').count())===1,'mobile fight retains visible centered enemy sprite');
 const mobileCombatWidth=await phone.evaluate(()=>({page:document.documentElement.scrollWidth,window:window.innerWidth}));
 check(mobileCombatWidth.page<=mobileCombatWidth.window+2,'375px combat has no horizontal document overflow');
 check(errors.length===0,'no browser page errors: '+errors.join('; '));
 await mobile.close();await desktop.close();
 console.log('CASE 0451 Chromium browser QA: '+assertions+' desktop/mobile assertions passed (routing, 128 art, save, battle, hearing, upgrades).');
}finally{await browser.close();}
