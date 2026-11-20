/* 112 distinct action concepts + 16 upgrade concepts.  Each card is mapped by
 * hand to a skill-appropriate pixel scene; the right-hand symbols are derived
 * from the *actual* resolved effects, never randomly assigned decoration. */
import type { ReactNode } from 'react';
import { EXTRA_EFFECTS, type CardEffect, type EffectKind } from './case-roguelite-cards.js';
import { UPGRADE_EFFECTS } from './case-upgrades.js';

const CARD_ART_SOURCE="python|terminal|RUN\nsql|database|QUERY\napi|router|REST\ndebug|bug|STOP\nrag|search|RAG\nautomation|pipeline|CI\nabap|document|ABAP\nmaui|devices|MAUI\nllm|chip|LLM\ntriage|pulse|TRIAGE\nassessment|clipboard|OBSERVE\nhandoff|handoff|SHIFT\nchart|document|SOAP\nstabilize|bandage|CARE\nresearch|microscope|PEER\nrisk|shield|RISK\nsyntax_guard|terminal|SYNTAX\nbatch_job|pipeline|BATCH\ntrace_logger|chart|LOG\nhotfix|wrench|PATCH\nexception_handler|shield|CATCH\ncode_review|document|REVIEW\ntest_harness|test|FAULT\nrefactor|git|REFACTOR\nindex_scan|database|INDEX\nquery_plan|chart|PLAN\ndata_join|network|JOIN\nschema_migration|database|SCHEMA\ntransaction_lock|lock|LOCK\nrollback|git|UNDO\ndeduplication|database|UNIQUE\naudit_query|search|AUDIT\nauthenticated_call|lock|AUTH\nrate_limit|queue|RATE\napi_gateway|router|GATEWAY\nendpoint_probe|radar|PROBE\npayload_validation|document|VALID\njwt_guard|lock|JWT\nretry_policy|clock|RETRY\nservice_adapter|network|ADAPT\npipeline_cache|pipeline|CACHE\nci_matrix|test|MATRIX\ngit_bisect|git|BISECT\ngit_revert|git|REVERT\ndocker_isolation|container|DOCKER\nstaged_release|pipeline|STAGED\nregression_suite|test|REGRESS\npipeline_repair|wrench|REPAIR\nsource_lookup|search|SOURCE\ncitation_chain|document|CITE\nvector_search|radar|VECTOR\nretrieval_filter|filter|FILTER\ncontext_window|document|CONTEXT\ndocument_chunking|document|CHUNKS\nsource_attribution|document|AUTHOR\nrag_recheck|search|RECHECK\nprompt_eval|test|PROMPT\nhallucination_check|search|VERIFY\nlocal_inference|chip|LOCAL\nmodel_benchmark|chart|BENCH\neval_harness|test|EVAL\nanswer_verification|document|CHECK\nprompt_revision|document|REVISE\nsafety_filter|shield|SAFETY\nvital_monitor|pulse|VITAL\npriority_assessment|clipboard|PRIORITY\nshift_triage|handoff|SHIFT\nsymptom_review|stethoscope|SYMPTOM\nclinical_observation|clipboard|OBS\nrapid_response|pulse|RAPID\nsafety_check|shield|SAFE\ncare_prioritization|clipboard|ORDER\nsoap_revision|document|SOAP\ndar_record|document|DAR\ncare_plan|clipboard|PLAN\nhandoff_report|handoff|REPORT\nmar_check|clipboard|MAR\nchart_reconciliation|document|CHART\nehr_audit|database|EHR\nclinical_summary|clipboard|SUMMARY\nfall_risk_assessment|shield|FALL\nskin_integrity|bandage|SKIN\ninfection_control|shield|CONTROL\nwound_care|bandage|WOUND\npatient_education|book|TEACH\nmed_reconciliation|clipboard|MED\nrecovery_round|pulse|RECOVER\npreventive_round|shield|PREVENT\npeer_replication|microscope|REPEAT\ncritical_appraisal|document|CRITIQUE\nconfounder_scan|radar|CONFOUND\nbias_assessment|microscope|BIAS\nevidence_table|chart|EVIDENCE\nhypothesis_test|microscope|TEST\nmethods_review|document|METHOD\nreproducibility|git|REPRO\nclinical_data_bridge|network|BRIDGE\nhealth_api|router|HEALTH\ncare_automation|pipeline|CARE\nworkflow_mapping|workflow|MAP\nprivacy_review|lock|PRIVATE\ninterface_testing|devices|INTERFACE\nhuman_in_loop|handoff|HUMAN\nintegration_patch|wrench|INTEGRATE\npolicy_diff|document|DIFF\nform_validator|document|FORM\nbureaucracy_probe|radar|BUREAU\nqueue_throttle|queue|THROTTLE\naudit_override|terminal|OVERRIDE\nincident_response|pulse|INCIDENT\nnetwork_quarantine|container|ISOLATE\nddos_mitigation|shield|DDOS\npython_a|terminal|FAST\npython_b|pipeline|BATCH\nsql_a|database|FORENSIC\nsql_b|network|RECURSE\nrag_a|search|PRECISE\nrag_b|radar|BROAD\nassessment_a|clipboard|DEEP\nassessment_b|pulse|RAPID\ntriage_a|pulse|PRIORITY\ntriage_b|shield|FIELD\nhandoff_a|handoff|CONTINUITY\nhandoff_b|document|SUMMARY\napi_a|lock|AUTH\napi_b|router|NEGOTIATE\nllm_a|chip|GROUNDED\nllm_b|clock|EFFICIENT";
type Motif='terminal'|'database'|'router'|'bug'|'search'|'pipeline'|'document'|'devices'|'chip'|
 'pulse'|'clipboard'|'handoff'|'bandage'|'microscope'|'shield'|'chart'|'wrench'|'test'|'git'|
 'network'|'lock'|'queue'|'radar'|'clock'|'container'|'filter'|'stethoscope'|'book'|'workflow';
export type ArtSpec={motif:Motif;label:string};
const registry:Record<string,ArtSpec>={};
for(const line of CARD_ART_SOURCE.trim().split('\n')){
 const [id,motif,label]=line.split('|');
 if(!id||!motif||!label||registry[id])throw Error('Missing/duplicate card art spec: '+id);
 registry[id]={motif:motif as Motif,label};
}
export const CARD_ART:Readonly<Record<string,ArtSpec>>=registry;
export const CARD_ART_COUNT=Object.keys(CARD_ART).length;
if(CARD_ART_COUNT!==128)throw Error('Expected 128 semantic card illustration specs, got '+CARD_ART_COUNT);

const CORE_FX:Record<string,EffectKind[]>={
 python:['damage'],sql:['strip','expose'],api:['pierce'],debug:['damage','expose'],
 rag:['evidence','draw'],automation:['damage','damage'],abap:['strip','damage'],
 maui:['block','damage'],llm:['damage','evidence'],triage:['block'],
 assessment:['block','evidence'],handoff:['block','carry'],chart:['evidence','cleanse'],
 stabilize:['heal','block'],research:['evidence','draw'],risk:['block'],
 python_a:['damage'],python_b:['damage'],
 triage_a:['block'],triage_b:['block'],llm_a:['damage'],llm_b:['damage'],
};
const COLORS:Record<EffectKind,string>={
 damage:'#e68b73',pierce:'#e9a77c',block:'#8abda1',evidence:'#e0ca8e',
 expose:'#9fd7d4',draw:'#a5c9e2',heal:'#b7dc9e',strip:'#ebae81',
 carry:'#8abda1',energy:'#e7cb82',bleeding:'#c97065',
 infected:'#b18ec5',ddosed:'#7ec1e2',wounded:'#d89068',cleanse:'#bbd8a3'
};
const GLYPHS:Record<EffectKind,string>={
 damage:'!',pierce:'>',block:'+',evidence:'E',expose:'?',draw:'D',heal:'H',
 strip:'-',carry:'↗',energy:'⚡',bleeding:'B',infected:'I',ddosed:'X',
 wounded:'W',cleanse:'C'
};
export function artEffects(id:string):EffectKind[]{
 const fx:CardEffect[]|undefined=EXTRA_EFFECTS[id]??UPGRADE_EFFECTS[id];
 return fx?fx.map(effect=>effect.kind):CORE_FX[id]??[];
}
const STROKE='#1e2927';
function MotifDrawing({type}:{type:Motif}):ReactNode {
 switch(type){
 case 'terminal':return <><rect x="16" y="12" width="60" height="43" fill="#1d3e37" stroke={STROKE} strokeWidth="5"/><path d="M23 23h9l7 6-7 6h-9M43 37h15" stroke="#9bcab0" strokeWidth="4" fill="none"/><rect x="40" y="56" width="14" height="5" fill={STROKE}/><rect x="30" y="62" width="34" height="5" fill={STROKE}/></>;
 case 'database':return <><ellipse cx="46" cy="17" rx="29" ry="10" fill="#b4d1c5" stroke={STROKE} strokeWidth="4"/><path d="M17 17v36q29 23 58 0V17M17 30q29 20 58 0M17 42q29 20 58 0" fill="none" stroke={STROKE} strokeWidth="4"/><rect x="53" y="44" width="8" height="6" fill="#f7dc9d"/></>;
 case 'router':return <><rect x="20" y="28" width="48" height="27" fill="#abc5b4" stroke={STROKE} strokeWidth="4"/><path d="M33 24V13h29M33 24l-7-7M33 24l7-7M53 58v10" stroke={STROKE} strokeWidth="4" fill="none"/><rect x="28" y="37" width="7" height="6" fill="#c98b69"/><rect x="41" y="37" width="7" height="6" fill="#c98b69"/></>;
 case 'bug':return <><rect x="32" y="23" width="30" height="33" rx="3" fill="#a7836e" stroke={STROKE} strokeWidth="4"/><path d="M37 22v-9M57 22v-9M24 31H12M24 43H12M70 31h13M70 43h13M36 33h20" stroke={STROKE} strokeWidth="4"/><rect x="38" y="40" width="6" height="6" fill={STROKE}/><rect x="51" y="40" width="6" height="6" fill={STROKE}/></>;
 case 'search':return <><rect x="14" y="11" width="50" height="51" fill="#f0e2b8" stroke={STROKE} strokeWidth="4"/><path d="M23 24h26M23 32h19M23 43h15" stroke="#7d8278" strokeWidth="3"/><circle cx="59" cy="48" r="15" fill="none" stroke="#5e8f89" strokeWidth="6"/><path d="M70 60l13 10" stroke={STROKE} strokeWidth="6"/></>;
 case 'pipeline':return <><rect x="13" y="29" width="19" height="21" fill="#bed3b1" stroke={STROKE} strokeWidth="3"/><rect x="41" y="18" width="19" height="21" fill="#d2b993" stroke={STROKE} strokeWidth="3"/><rect x="69" y="29" width="16" height="21" fill="#b8d2dd" stroke={STROKE} strokeWidth="3"/><path d="M31 39h11M59 39h11" stroke="#d77d60" strokeWidth="5"/></>;
 case 'document':return <><path d="M21 10h42l12 12v43H21z" fill="#ede0b8" stroke={STROKE} strokeWidth="4"/><path d="M63 10v13h12M29 31h30M29 39h23M29 47h30" stroke="#858777" strokeWidth="3" fill="none"/><rect x="45" y="52" width="25" height="8" fill="#ba5d50"/></>;
 case 'devices':return <><rect x="12" y="16" width="61" height="42" fill="#25463d" stroke={STROKE} strokeWidth="4"/><rect x="19" y="23" width="45" height="26" fill="#80b5b0"/><rect x="57" y="37" width="25" height="38" fill="#e2ceb1" stroke={STROKE} strokeWidth="4"/><rect x="64" y="45" width="10" height="17" fill="#83b3b1"/></>;
 case 'chip':return <><rect x="27" y="18" width="39" height="37" fill="#49695b" stroke={STROKE} strokeWidth="5"/><rect x="38" y="29" width="17" height="15" fill="#d1be88"/><path d="M20 24H12M20 37H12M20 50H12M73 24h8M73 37h8M73 50h8M35 12V5M48 12V5M61 12V5" stroke={STROKE} strokeWidth="4"/></>;
 case 'pulse':return <><rect x="12" y="16" width="70" height="47" fill="#26483e" stroke={STROKE} strokeWidth="4"/><path d="M16 40h13l7-10 8 23 9-30 7 17h17" stroke="#bce6ba" strokeWidth="4" fill="none"/><rect x="24" y="20" width="10" height="3" fill="#e4a991"/></>;
 case 'clipboard':return <><rect x="20" y="13" width="53" height="55" fill="#e3d8b5" stroke={STROKE} strokeWidth="4"/><rect x="33" y="7" width="26" height="10" fill="#94a998" stroke={STROKE} strokeWidth="3"/><path d="M30 29h34M30 40h28M30 51h34" stroke="#657a6e" strokeWidth="3"/><rect x="29" y="55" width="7" height="6" fill="#b97167"/></>;
 case 'handoff':return <><path d="M12 27h40l-9-9M52 27l-9 9M80 50H40l9-9M40 50l9 9" fill="none" stroke={STROKE} strokeWidth="6"/><rect x="23" y="42" width="17" height="24" fill="#e7d4a2" stroke={STROKE} strokeWidth="3"/><rect x="55" y="13" width="16" height="24" fill="#a6c1ae" stroke={STROKE} strokeWidth="3"/></>;
 case 'bandage':return <><path d="M25 23l42 40M25 63l42-40" stroke="#e3c8a6" strokeWidth="15"/><path d="M25 23l42 40M25 63l42-40" stroke={STROKE} strokeWidth="3"/><rect x="41" y="36" width="14" height="14" fill="#ab8570"/><rect x="46" y="39" width="4" height="8" fill="#e6d6bd"/></>;
 case 'microscope':return <><path d="M40 12l16 9-12 24-16-9z" fill="#a6b9b2" stroke={STROKE} strokeWidth="4"/><path d="M53 35q15 4 7 21M26 55h44M19 65h61" stroke={STROKE} strokeWidth="6" fill="none"/><circle cx="46" cy="46" r="7" fill="#d3c79d"/></>;
 case 'shield':return <><path d="M45 10L75 19V38Q70 56 45 67Q20 56 15 38V19z" fill="#9fc4af" stroke={STROKE} strokeWidth="5"/><path d="M45 24V54M31 39h28" stroke="#3d7167" strokeWidth="7"/></>;
 case 'chart':return <><rect x="13" y="12" width="67" height="56" fill="#e5ddb8" stroke={STROKE} strokeWidth="4"/><path d="M23 58V27M37 58V39M51 58V20M65 58V33" stroke="#6f9891" strokeWidth="9"/><path d="M20 61h52" stroke={STROKE} strokeWidth="3"/></>;
 case 'wrench':return <><path d="M55 13q-20-7-26 15l11 9-8 10-11-9q-3 24 22 22l27-27-13-13z" fill="#b4bab1" stroke={STROKE} strokeWidth="4"/><path d="M21 64l14-15" stroke="#a96b5a" strokeWidth="8"/></>;
 case 'test':return <><rect x="18" y="14" width="59" height="50" fill="#d4c9aa" stroke={STROKE} strokeWidth="4"/><path d="M26 27l6 6 10-14M47 27h20M26 44l6 6 10-14M47 44h20" stroke="#568f83" strokeWidth="4" fill="none"/></>;
 case 'git':return <><path d="M31 15v46M31 32Q60 32 60 48" stroke={STROKE} strokeWidth="5" fill="none"/><circle cx="31" cy="15" r="9" fill="#e5c898" stroke={STROKE} strokeWidth="4"/><circle cx="31" cy="61" r="9" fill="#9ccaba" stroke={STROKE} strokeWidth="4"/><circle cx="60" cy="48" r="9" fill="#c17d68" stroke={STROKE} strokeWidth="4"/></>;
 case 'network':return <><path d="M25 20L67 26L48 58L25 20" stroke={STROKE} strokeWidth="5" fill="none"/><rect x="15" y="10" width="20" height="20" fill="#b0bfc1" stroke={STROKE} strokeWidth="3"/><rect x="57" y="16" width="20" height="20" fill="#a6c49c" stroke={STROKE} strokeWidth="3"/><rect x="38" y="48" width="20" height="20" fill="#d7b68c" stroke={STROKE} strokeWidth="3"/></>;
 case 'lock':return <><path d="M30 35V25Q30 9 45 9Q60 9 60 25V35" stroke={STROKE} strokeWidth="8" fill="none"/><rect x="22" y="32" width="46" height="35" fill="#c9b888" stroke={STROKE} strokeWidth="5"/><rect x="42" y="42" width="7" height="17" fill="#596a5c"/></>;
 case 'queue':return <><rect x="18" y="17" width="15" height="15" fill="#e4cf9b" stroke={STROKE} strokeWidth="3"/><rect x="39" y="17" width="15" height="15" fill="#acbfaf" stroke={STROKE} strokeWidth="3"/><rect x="60" y="17" width="15" height="15" fill="#d88a6e" stroke={STROKE} strokeWidth="3"/><path d="M21 48h49M62 40l9 8-9 8M22 63h32" fill="none" stroke={STROKE} strokeWidth="4"/></>;
 case 'radar':return <><circle cx="46" cy="38" r="31" fill="#2a5147" stroke={STROKE} strokeWidth="4"/><circle cx="46" cy="38" r="16" fill="none" stroke="#74a39c" strokeWidth="3"/><path d="M46 38L69 13M15 38h61M46 7v62" stroke="#c0d9a9" strokeWidth="3"/><rect x="60" y="27" width="7" height="7" fill="#e6a18a"/></>;
 case 'clock':return <><circle cx="46" cy="39" r="30" fill="#ded2aa" stroke={STROKE} strokeWidth="5"/><path d="M46 17v24l17 11" fill="none" stroke="#506b62" strokeWidth="6"/><rect x="40" y="5" width="12" height="5" fill={STROKE}/></>;
 case 'container':return <><path d="M17 21L52 10L82 22V56L52 69L17 56z" fill="#89aea5" stroke={STROKE} strokeWidth="4"/><path d="M17 21l35 15 30-14M52 36v33" stroke={STROKE} strokeWidth="4" fill="none"/><rect x="27" y="35" width="10" height="14" fill="#d5d9c0"/></>;
 case 'filter':return <><path d="M15 14H78L55 41V63L35 54V41z" fill="#bac7b2" stroke={STROKE} strokeWidth="5"/><rect x="19" y="20" width="56" height="6" fill="#829c90"/><path d="M41 48h10" stroke="#ba6556" strokeWidth="4"/></>;
 case 'stethoscope':return <><path d="M23 15v23q1 19 21 19Q63 57 63 39V23" fill="none" stroke={STROKE} strokeWidth="6"/><circle cx="63" cy="32" r="10" fill="#acc7b1" stroke={STROKE} strokeWidth="4"/><path d="M23 15h9M63 23h9M44 57v11" stroke={STROKE} strokeWidth="4"/></>;
 case 'book':return <><path d="M17 18q18-8 30 4q13-12 31-4v45q-19-7-31 5q-14-12-30-5z" fill="#e6d6b1" stroke={STROKE} strokeWidth="4"/><path d="M47 22v44M23 33h17M23 42h17M53 33h17M53 42h17" stroke="#698779" strokeWidth="3"/></>;
 case 'workflow':return <><path d="M43 9L77 38L43 69L9 38z" fill="#c2cba8" stroke={STROKE} strokeWidth="4"/><path d="M20 38h46M43 15v46" stroke="#6e998e" strokeWidth="4"/><rect x="38" y="33" width="10" height="10" fill="#be715c"/></>;
 }
}
const MAX_EFFECTS=3;
export function CardArt({id}:{id:string}){
 const spec=CARD_ART[id];
 if(!spec)return null;
 const effects=artEffects(id).slice(0,MAX_EFFECTS);
 const primary=effects[0]??'evidence';
 const safeLabel=spec.label.slice(0,11);
 return <svg className="dm-card-art" viewBox="0 0 160 86" role="img"
   aria-label={'Pixel illustration of '+spec.label.toLowerCase()+' with '+effects.join(', ')+' effects'}
   xmlns="http://www.w3.org/2000/svg">
   <title>{spec.label+' · '+effects.join(' / ')}</title>
   <rect width="160" height="86" fill="#273b35"/>
   <path d="M0 9H160M0 77H160" stroke="#819b80" strokeWidth="2"/>
   <path d="M8 12V74M153 12V74" stroke="#596f60" strokeWidth="2"/>
   <rect x="8" y="7" width="79" height="65" fill="#6b887b" opacity=".47"/>
   <MotifDrawing type={spec.motif}/>
   <rect x="91" y="8" width="61" height="69" fill="#1e2e2a" stroke="#7b9881" strokeWidth="2"/>
   <rect x="96" y="13" width="51" height="14" fill={COLORS[primary]}/>
   <text x="121" y="23" textAnchor="middle" fill="#1a2925" fontSize="9" fontWeight="bold" fontFamily="monospace">{safeLabel}</text>
   {effects.map((effect,index)=><g key={effect+'-'+index} transform={'translate(99 '+(32+index*14)+')'}>
     <rect width="46" height="12" fill="#2e483c" stroke={COLORS[effect]} strokeWidth="1"/>
     <rect x="2" y="2" width="9" height="8" fill={COLORS[effect]}/>
     <text x="6.5" y="9" textAnchor="middle" fontSize="7" fontWeight="bold" fill="#202820">{GLYPHS[effect]}</text>
     <text x="14" y="9" fill="#e2dec4" fontSize="6.4" fontWeight="bold" fontFamily="monospace">{effect.slice(0,6).toUpperCase()}</text>
   </g>)}
   <rect x="5" y="73" width="65" height="8" fill="#23352c"/>
   <text x="9" y="79" fontSize="5.8" fill="#d8cba5" fontFamily="monospace">{id.slice(0,16).replaceAll('_',' ').toUpperCase()}</text>
 </svg>;
}
