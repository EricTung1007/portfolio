import type { EnemyId, Language } from './case-engine.js';

const C={outline:'#161c1a',suit:'#464d47',suitLight:'#677368',paper:'#d9c8a0',shade:'#a59c7e',rust:'#9b4d41',red:'#e18b71',steel:'#768c87',light:'#b5c4a5',dark:'#26342f'};
export function EnemySprite({id,language}:{id:EnemyId;language:Language}) {
  const props={viewBox:'0 0 96 96',shapeRendering:'crispEdges' as const,role:'img' as const,style:{imageRendering:'pixelated' as const}};
  const desc=id==='gatekeeper'?['Blocky uniformed diploma gatekeeper holding a rejection stamp','手持退件章的像素學歷守門員']:
    id==='auditor'?['Faceless compliance auditor buried in files','埋在公文裡的無臉稽核官']:
    ['Enormous one-eyed classification machine','巨大的獨眼分類機器'];
  return <svg {...props} aria-label={desc[language==='en'?0:1]}>
    {id==='gatekeeper' && <>
      <rect x="24" y="12" width="48" height="9" fill={C.outline}/><rect x="29" y="6" width="37" height="7" fill={C.suit}/><rect x="36" y="2" width="24" height="5" fill={C.suitLight}/>
      <rect x="28" y="21" width="40" height="28" fill={C.outline}/><rect x="33" y="24" width="30" height="23" fill={C.shade}/>
      <rect x="37" y="33" width="9" height="4" fill={C.rust}/><rect x="51" y="33" width="9" height="4" fill={C.rust}/>
      <rect x="45" y="40" width="7" height="5" fill={C.outline}/>
      <rect x="21" y="51" width="54" height="39" fill={C.outline}/><rect x="27" y="55" width="42" height="31" fill={C.suit}/>
      <rect x="45" y="53" width="8" height="33" fill={C.paper}/><rect x="45" y="60" width="8" height="8" fill={C.rust}/>
      <rect x="10" y="62" width="19" height="12" fill={C.outline}/><rect x="7" y="59" width="9" height="26" fill={C.shade}/>
      <rect x="4" y="77" width="23" height="12" fill={C.rust}/><rect x="7" y="80" width="17" height="6" fill={C.red}/>
      <rect x="68" y="61" width="18" height="18" fill={C.paper}/><rect x="71" y="64" width="12" height="2" fill={C.shade}/>
      <rect x="71" y="69" width="12" height="2" fill={C.shade}/><rect x="71" y="74" width="9" height="2" fill={C.rust}/>
      <rect x="31" y="88" width="14" height="7" fill={C.outline}/><rect x="54" y="88" width="14" height="7" fill={C.outline}/>
    </>}
    {id==='auditor' && <>
      <rect x="16" y="4" width="64" height="16" fill={C.outline}/><rect x="23" y="0" width="50" height="8" fill={C.suit}/>
      <rect x="22" y="20" width="52" height="32" fill={C.outline}/><rect x="27" y="25" width="42" height="23" fill={C.shade}/>
      <rect x="30" y="31" width="17" height="9" fill={C.outline}/><rect x="50" y="31" width="17" height="9" fill={C.outline}/>
      <rect x="34" y="34" width="9" height="3" fill={C.red}/><rect x="54" y="34" width="9" height="3" fill={C.red}/>
      <rect x="47" y="33" width="4" height="3" fill={C.outline}/><rect x="44" y="43" width="12" height="3" fill={C.outline}/>
      <rect x="15" y="53" width="66" height="36" fill={C.outline}/><rect x="20" y="56" width="56" height="28" fill={C.suitLight}/>
      <rect x="30" y="52" width="38" height="42" fill={C.paper}/><rect x="34" y="56" width="30" height="34" fill={C.shade}/>
      <rect x="38" y="60" width="22" height="3" fill={C.outline}/><rect x="38" y="66" width="20" height="2" fill={C.outline}/>
      <rect x="38" y="71" width="23" height="2" fill={C.outline}/><rect x="38" y="77" width="14" height="2" fill={C.outline}/>
      <rect x="43" y="81" width="15" height="6" fill={C.rust}/>
      <rect x="3" y="68" width="24" height="15" fill={C.paper}/><rect x="6" y="71" width="18" height="3" fill={C.shade}/>
      <rect x="74" y="66" width="19" height="21" fill={C.paper}/><rect x="77" y="69" width="12" height="3" fill={C.rust}/>
    </>}
    {id==='engine' && <>
      <rect x="27" y="1" width="44" height="8" fill={C.outline}/><rect x="42" y="0" width="14" height="3" fill={C.red}/>
      <rect x="12" y="10" width="72" height="14" fill={C.outline}/><rect x="16" y="14" width="64" height="8" fill={C.steel}/>
      <rect x="8" y="25" width="80" height="49" fill={C.outline}/><rect x="13" y="29" width="70" height="41" fill={C.steel}/>
      <rect x="17" y="33" width="62" height="32" fill={C.dark}/>
      <rect x="30" y="37" width="36" height="23" fill={C.red}/>
      <rect x="37" y="39" width="22" height="19" fill={C.rust}/>
      <rect x="42" y="44" width="12" height="10" fill={C.outline}/>
      <rect x="45" y="46" width="6" height="6" fill={C.light}/>
      <rect x="18" y="37" width="8" height="23" fill={C.rust}/><rect x="70" y="37" width="8" height="23" fill={C.rust}/>
      <rect x="3" y="37" width="6" height="26" fill={C.suitLight}/><rect x="87" y="37" width="6" height="26" fill={C.suitLight}/>
      <rect x="0" y="60" width="18" height="12" fill={C.outline}/><rect x="78" y="60" width="18" height="12" fill={C.outline}/>
      <rect x="17" y="74" width="62" height="19" fill={C.outline}/><rect x="22" y="78" width="52" height="11" fill={C.suit}/>
      {Array.from({length:5},(_,i)=><rect key={i} x={26+i*10} y="82" width="6" height="5" fill={i===2?C.red:C.steel}/>)}
      <rect x="26" y="91" width="14" height="5" fill={C.outline}/><rect x="57" y="91" width="14" height="5" fill={C.outline}/>
    </>}
  </svg>;
}