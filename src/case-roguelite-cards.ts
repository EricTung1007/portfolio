/* CASE 0451 v3. 96 new skill-grounded actions, authored by design domain.
   Fictional status effects concern the character and bureaucratic machines, not patients. */
export type ExtraCategory='code'|'care'|'hybrid';
export type EffectKind='damage'|'pierce'|'block'|'evidence'|'expose'|'draw'|'heal'|'strip'|'carry'|'energy'|'bleeding'|'infected'|'ddosed'|'wounded'|'cleanse';
export type CardEffect={kind:EffectKind;amount:number};
export type ExtraCard={id:string;name:[string,string];text:[string,string];cost:number;category:ExtraCategory;origin:[string,string]};
const TOKENS:Record<string,EffectKind>={d:'damage',p:'pierce',b:'block',e:'evidence',x:'expose',t:'draw',h:'heal',s:'strip',k:'carry',q:'energy',l:'bleeding',i:'infected',o:'ddosed',w:'wounded',c:'cleanse'};
const WORDS:Record<EffectKind,[string,string]>={
damage:['DMG','傷害'],pierce:['piercing DMG','穿甲傷害'],block:['block','護盾'],
evidence:['evidence','證據'],expose:['exposed','弱點'],draw:['draw','抽牌'],
heal:['heal HP','恢復生命'],strip:['strip armor','削除護甲'],carry:['carry block','延續護盾'],
energy:['energy','行動力'],bleeding:['inflict BLEEDING','施加流血'],
infected:['inflict INFECTED','施加感染'],ddosed:['inflict DDOSED','施加阻斷'],
wounded:['inflict WOUNDED','施加創傷'],cleanse:['cleanse ailments','清除負面狀態']};
const VALUES:Record<string,{card:ExtraCard;effects:CardEffect[]}>=Object.create(null);
function register(category:ExtraCategory,origin:string,entries:string){
 for(const line of entries.trim().split('\n')){
  const [id,en,zh,costText,fx]=line.split('|');
  if(!id||!fx||VALUES[id])throw Error('Invalid/duplicate card: '+id);
  const effects:CardEffect[]=fx.split(',').map(pair=>{
   const found=/^([a-z])(\d+)$/.exec(pair);
   if(!found||!TOKENS[found[1]])throw Error('Unknown effect: '+pair);
   return {kind:TOKENS[found[1]],amount:Number(found[2])};
  });
  VALUES[id]={card:{id,name:[en,zh],category,cost:Number(costText),
   text:[effects.map(e=>e.amount+' '+WORDS[e.kind][0]).join('; ')+'.',
         effects.map(e=>WORDS[e.kind][1]+' '+e.amount).join('；')+'。'],
   origin:[origin,origin]},effects};
 }
}
register('code',"Python / scripting","syntax_guard|SYNTAX GUARD|語法檢查|0|d3,x1\nbatch_job|BATCH JOB|批次任務|2|d10,t1\ntrace_logger|TRACE LOGGER|追蹤紀錄|1|d3,e1,x1\nhotfix|HOTFIX|緊急修補|1|d5,c1\nexception_handler|EXCEPTION HANDLER|例外處理|1|b7,c1\ncode_review|CODE REVIEW|程式碼審查|1|e2,t1\ntest_harness|TEST HARNESS|測試框架|1|d4,x2\nrefactor|REFACTOR|重構|1|d5,b5");
register('code',"SQL / databases","index_scan|INDEX SCAN|索引掃描|1|d5,t1\nquery_plan|QUERY PLAN|查詢計畫|0|e1,x1\ndata_join|DATA JOIN|資料關聯|1|e2,x2\nschema_migration|SCHEMA MIGRATION|結構遷移|2|d8,s8\ntransaction_lock|TRANSACTION LOCK|交易鎖定|1|b6,o1\nrollback|ROLLBACK|交易回復|1|c2,b4\ndeduplication|DEDUPLICATION|資料去重|1|d4,s5,t1\naudit_query|AUDIT QUERY|稽核查詢|1|e2,w1");
register('code',"REST / backend / security","authenticated_call|AUTHENTICATED CALL|身分驗證請求|1|p6,b3\nrate_limit|RATE LIMIT|流量限制|1|b6,o1\napi_gateway|API GATEWAY|介面閘道|1|p7\nendpoint_probe|ENDPOINT PROBE|端點探測|0|d2,x1\npayload_validation|PAYLOAD VALIDATION|酬載驗證|1|b6,c1\njwt_guard|JWT GUARD|權杖防護|1|b7,e1\nretry_policy|RETRY POLICY|重試策略|1|d4,t2\nservice_adapter|SERVICE ADAPTER|服務轉接|2|p8,e2");
register('code',"automation / Git / Docker","pipeline_cache|PIPELINE CACHE|管線快取|0|q1,d2\nci_matrix|CI MATRIX|矩陣測試|2|d6,d6\ngit_bisect|GIT BISECT|版本二分|1|x3,d3\ngit_revert|GIT REVERT|版本回復|1|c3,t1\ndocker_isolation|DOCKER ISOLATION|容器隔離|1|b7,o1\nstaged_release|STAGED RELEASE|分段上線|1|b5,k4\nregression_suite|REGRESSION SUITE|回歸測試|1|d4,e2\npipeline_repair|PIPELINE REPAIR|管線修復|2|d9,c2");
register('hybrid',"RAG / retrieval / documentation","source_lookup|SOURCE LOOKUP|來源查詢|0|e1,t1\ncitation_chain|CITATION CHAIN|引用鏈結|1|e3\nvector_search|VECTOR SEARCH|向量搜尋|1|e2,x1\nretrieval_filter|RETRIEVAL FILTER|檢索過濾|1|e2,c1\ncontext_window|CONTEXT WINDOW|脈絡視窗|2|e3,t2\ndocument_chunking|DOCUMENT CHUNKING|文件切塊|1|e1,t2\nsource_attribution|SOURCE ATTRIBUTION|來源標註|1|e2,w1\nrag_recheck|RAG RECHECK|重新檢索|1|e2,b4");
register('hybrid',"local LLM / evaluation","prompt_eval|PROMPT EVALUATION|提示詞評測|1|e2,x1\nhallucination_check|HALLUCINATION CHECK|幻覺檢查|1|c2,e2\nlocal_inference|LOCAL INFERENCE|本地推論|2|d11\nmodel_benchmark|MODEL BENCHMARK|模型基準測試|1|e2,t1\neval_harness|EVALUATION HARNESS|評測框架|1|e2,d4\nanswer_verification|ANSWER VERIFICATION|答案查證|1|e3,b3\nprompt_revision|PROMPT REVISION|提示詞修訂|0|t1,x1\nsafety_filter|SAFETY FILTER|安全過濾|1|b8,c1");
register('care',"clinical assessment / triage","vital_monitor|VITAL MONITOR|生命徵象監測|1|b5,t1\npriority_assessment|PRIORITY ASSESSMENT|優先評估|1|b7,e1\nshift_triage|SHIFT TRIAGE|交班檢傷|0|b3,e1\nsymptom_review|SYMPTOM REVIEW|症狀檢視|1|b4,x2\nclinical_observation|CLINICAL OBSERVATION|臨床觀察|1|e2,b5\nrapid_response|RAPID RESPONSE|快速應變|2|b12,c2\nsafety_check|SAFETY CHECK|安全確認|1|b5,e1,c1\ncare_prioritization|CARE PRIORITIZATION|照護優先排序|1|b6,t1");
register('care',"documentation / HIS","soap_revision|SOAP REVISION|SOAP 修訂|1|b4,e2,c1\ndar_record|DAR RECORD|DAR 紀錄|1|e2,b4\ncare_plan|CARE PLAN|照護計畫|1|b7,k3\nhandoff_report|HANDOFF REPORT|交班報告|1|k5,b4\nmar_check|MAR CHECK|給藥紀錄核對|1|b5,c2\nchart_reconciliation|CHART RECONCILIATION|病歷資料對帳|1|e2,c2\nehr_audit|EHR AUDIT|電子病歷稽核|1|e1,x2,b3\nclinical_summary|CLINICAL SUMMARY|臨床摘要|2|e3,t2,b3");
register('care',"clinical prevention / recovery","fall_risk_assessment|FALL RISK ASSESSMENT|跌倒風險評估|1|b8\nskin_integrity|SKIN INTEGRITY|皮膚完整性檢查|1|b6,h2\ninfection_control|INFECTION CONTROL|感染管制|1|b5,c3\nwound_care|WOUND CARE|傷口照護|2|h7,c1\npatient_education|PATIENT EDUCATION|病人衛教|1|e2,b2\nmed_reconciliation|MED RECONCILIATION|用藥核對|1|c3,e1,b4\nrecovery_round|RECOVERY ROUND|恢復巡視|2|h9,b2\npreventive_round|PREVENTIVE ROUND|預防性巡視|1|b5,k3,c1");
register('hybrid',"research / critical appraisal","peer_replication|PEER REPLICATION|同儕複驗|1|e2,t1\ncritical_appraisal|CRITICAL APPRAISAL|批判性評讀|1|e2,x1\nconfounder_scan|CONFOUNDER SCAN|混雜因子檢視|1|x3,e1\nbias_assessment|BIAS ASSESSMENT|偏差評估|1|e2,w1\nevidence_table|EVIDENCE TABLE|證據表格|0|e1,t1\nhypothesis_test|HYPOTHESIS TEST|假設檢定|2|d9,x2\nmethods_review|METHODS REVIEW|方法審查|1|e2,c1\nreproducibility|REPRODUCIBILITY|可重現性檢查|1|e2,b4,t1");
register('hybrid',"cross-domain systems / health IT","clinical_data_bridge|CLINICAL DATA BRIDGE|臨床資料橋接|1|s5,e2\nhealth_api|HEALTH API|醫療資訊介面|1|p6,b3\ncare_automation|CARE AUTOMATION|照護流程自動化|2|d8,b7\nworkflow_mapping|WORKFLOW MAPPING|流程對照|1|x2,e1,b3\nprivacy_review|PRIVACY REVIEW|隱私檢查|1|b7,c1\ninterface_testing|INTERFACE TESTING|介面測試|1|d5,t1\nhuman_in_loop|HUMAN IN THE LOOP|人工覆核|1|e2,c2\nintegration_patch|INTEGRATION PATCH|整合修補|2|p8,k4");
register('code',"institutional workaround / technical audit","policy_diff|POLICY DIFF|規範差異比對|1|x2,s4\nform_validator|FORM VALIDATOR|表單驗證|0|e1,x1\nbureaucracy_probe|BUREAUCRACY PROBE|行政規則探測|1|d3,x2\nqueue_throttle|QUEUE THROTTLE|佇列節流|1|o1,b4\naudit_override|AUDIT OVERRIDE|稽核覆寫|2|p9,s5\nincident_response|INCIDENT RESPONSE|事件應變|2|d7,c2,b4\nnetwork_quarantine|NETWORK QUARANTINE|網路隔離|1|i2,b3\nddos_mitigation|DDOS MITIGATION|DDoS 緩解|1|c3,b8");

export const EXTRA_CARDS:Record<string,ExtraCard>=Object.fromEntries(Object.entries(VALUES).map(([id,v])=>[id,v.card]));
export const EXTRA_EFFECTS:Record<string,CardEffect[]>=Object.fromEntries(Object.entries(VALUES).map(([id,v])=>[id,v.effects]));
export const EXTRA_CARD_IDS=Object.keys(EXTRA_CARDS);
export const EXTRA_CARD_COUNT=EXTRA_CARD_IDS.length;
if(EXTRA_CARD_COUNT!==96)throw Error('Expected 96 expansion cards; got '+EXTRA_CARD_COUNT);
