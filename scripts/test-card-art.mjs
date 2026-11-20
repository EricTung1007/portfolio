import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

const game=await import(pathToFileURL('/tmp/case0451-engine.mjs').href);
const artwork=await import(pathToFileURL('/tmp/case0451-card-art.mjs').href);
const {CARDS,CARD_COUNT,CARD_UPGRADE_COUNT}=game;
const {CARD_ART,CARD_ART_COUNT,CardArt,artEffects}=artwork;
assert.equal(CARD_COUNT,112,'112 distinct non-upgraded action cards');
assert.equal(CARD_UPGRADE_COUNT,16,'16 designed branch upgrades');
assert.equal(CARD_ART_COUNT,128,'Every base card and upgrade has authored thematic art');
const ids=Object.keys(CARDS);
assert.equal(ids.length,128,'card definitions and visual variants agree');
assert.deepEqual(ids.slice().sort(),Object.keys(CARD_ART).sort(),'No card may lack an explicit art brief, and no orphan visuals');
let totalEffects=0;
const seen=new Set(),sceneTypes=new Set();
for(const id of ids){
 const card=CARDS[id],scene=CARD_ART[id],effects=artEffects(id);
 assert.ok(card.name[0]&&card.name[1]&&card.origin[0],id+' has localized semantic name and genuine skill-domain source');
 assert.ok(scene.label&&scene.motif,id+' must have an illustrated subject');
 assert.ok(Array.isArray(effects)&&effects.length,id+' art must represent at least one actual effect');
 totalEffects+=effects.length;
 sceneTypes.add(scene.motif);
 const signature=[scene.motif,scene.label,effects.join(',')].join('|');
 assert.ok(!seen.has(signature),'Non-distinct artwork composition: '+id+' ('+signature+')');
 seen.add(signature);
 const markup=renderToStaticMarkup(React.createElement(CardArt,{id}));
 assert.match(markup,/<svg/,id+' has SVG art');
 assert.match(markup,/role="img"/,id+' art is accessible');
 assert.match(markup,/aria-label="/,id+' scene describes itself');
 assert.match(markup,/shape-rendering|viewBox/,id+' is pixel-rendered');
 assert.ok(markup.includes(scene.label.slice(0,11)),id+' art represents its documented action');
 for(const effect of effects.slice(0,3)){
   assert.ok(markup.includes(effect.slice(0,6).toUpperCase()),id+' effect icon matches the game rule '+effect);
 }
}
assert.ok(sceneTypes.size>=24,'visuals must include more than a handful of generic illustrations');
console.log('CASE 0451 card-art QA: '+ids.length+' card faces, '+sceneTypes.size+
 ' source-specific motifs, '+totalEffects+' visualized effect associations; all passed.');
