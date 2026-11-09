import { useEffect, useRef, useState } from 'react';
import { useWebLLM } from '../hooks.js';
import type { ChatLanguage } from '../chat-engine.js';
import { answerFromVerifiedProfile, unknownDeskAnswer } from '../desk-answers.js';
import { getEvidenceLink } from '../archive.js';
import { inspectBrowserCapability, chooseBrowserModel, getSystemBrand, type BrowserCapability, type BrowserModelTier } from '../browser-capability.js';

interface MessageItem { role: 'user' | 'assistant'; content: string; related?: { label:string; href:string } | null; }

const COPY = {
  en: {
    desk: 'INFORMATION DESK', title: 'Speak with the archivist',
    intro: "The desk answers verified facts instantly. Extended local AI is optional for unusual questions.",
    init: 'ENABLE EXTENDED AI (OPTIONAL)', loading: 'Awakening the local model', ready: 'ARCHIVIST ONLINE', idle: 'DORMANT',
    resume: 'VIEW RESUME', model: 'Optional SmolLM2 360M · Browser WebGPU',
    note: 'Answers are grounded in the CV text extracted at build time plus maintained profile data. Updating CV.pdf and rebuilding refreshes the reference.',
    placeholder: 'Ask the archivist...', send: 'SEND', retry: 'TRY AGAIN',
    topics: ['Background', 'Engineering', 'Research', 'Contact'],
    branches: [['Who is Eric?', 'What is his education?', 'What is his experience?'],['What AI projects has Eric built?', 'What can he build?', 'What skills does he have?'],['What has he published?', 'What is Minerva’s Den?', 'What is RAG?'],['How can I contact Eric?', 'Where is Eric’s CV?', 'Where is his GitHub?']],
    unknown: 'No published evidence is available for that detail.',
    copy: 'STAMP & COPY', copied: 'COPIED TO CLIPBOARD',
  },
  zh: {
    desk: '個人資訊台', title: '與檔案管理員交談',
    intro: '資訊台會立即回答已確認的履歷內容，延伸本地 AI 為選用功能。',
    init: '啟用延伸 AI（選用）', loading: '正在啟動本地模型', ready: '檔案管理員已上線', idle: '尚未啟動',
    resume: '查看履歷', model: '可選用 SmolLM2 360M · 瀏覽器 WebGPU',
    note: '回答依據建置時從 CV.pdf 擷取的文字及個人資料，更新履歷並重新建置後即可同步。',
    placeholder: '向檔案管理員提問…', send: '送出', retry: '重試',
    topics: ['個人背景', '工程專案', '研究成果', '聯絡方式'],
    branches: [['Eric 是誰？', 'Eric 的學歷？', 'Eric 有哪些工作經歷？'],['Eric 做過哪些 AI 專案？', 'Eric 能開發什麼？', 'Eric 有哪些技術能力？'],['Eric 發表過哪些論文？', '什麼是 Minerva’s Den？', '什麼是 RAG？'],['如何聯絡 Eric？', 'Eric 的履歷在哪裡？', 'Eric 的 GitHub？']],
    unknown: '公開資料中沒有這項資訊。',
    copy: '蓋章並複製', copied: '已複製至剪貼簿',
  },
} as const;

export function ChatPanel({ onGenerationStart, onGenerationEnd, onAnswer, language }: {
  onGenerationStart: () => void; onGenerationEnd: () => void; onAnswer?: (answer:string) => void; language: ChatLanguage;
}) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [copied, setCopied] = useState(false);
  const [topicBranch, setTopicBranch] = useState<number|null>(null);
  const [tier, setTier] = useState<BrowserModelTier>('small');
  const [capability, setCapability] = useState<BrowserCapability | null>(null);
  const { status, progress, progressText, error, initialize, generate } = useWebLLM();
  const scrollRef = useRef<HTMLDivElement>(null);
  const busy = status === 'generating';
  const active = status === 'ready' || busy;
  const t = COPY[language];
  const latestAnswer = [...messages].reverse().find((m) => m.role === 'assistant' && m.content)?.content ?? '';
  useEffect(() => {
    void inspectBrowserCapability().then(setCapability);
  }, []);
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const handleInit = () => {
    if (!capability) return;
    const modelId = chooseBrowserModel(tier, capability);
    if (!modelId) return;
    void initialize(modelId);
  };
  const handleSend = async (question = input) => {
    const q = question.trim();
    if (!q || busy) return;
    const verified = answerFromVerifiedProfile(q, language);
    if (verified || !active) {
      setInput('');
      setCopied(false);
      const response = verified ?? unknownDeskAnswer(language);
      onAnswer?.(response);
      setMessages(items => [...items, { role: 'user', content: q },
        { role: 'assistant', content: response, related: verified ? getEvidenceLink(q) : null }]);
      return;
    }
    setInput('');
    setCopied(false);
    setMessages(items => [...items, { role: 'user', content: q }, { role: 'assistant', content: '' }]);
    onGenerationStart();
    try {
      let complete = '';
      await generate(q, token => {
        complete += token;
        setMessages(items => {
          const updated = [...items], index = updated.length - 1;
          if (updated[index]?.role === 'assistant')
            updated[index] = { role: 'assistant', content: updated[index].content + token };
          return updated;
        });
      }, language);
      if (complete) onAnswer?.(complete);
    } catch {
      setMessages(items => {
        const updated = [...items], index = updated.length - 1;
        if (updated[index]?.role === 'assistant' && !updated[index].content)
          updated[index] = { role: 'assistant', content: unknownDeskAnswer(language) };
        return updated;
      });
    } finally { onGenerationEnd(); }
  };

  return (
    <section className="rpg-panel" aria-label={t.desk}>
      <div className="rpg-panel-header">
        <span className="rpg-kicker">◈ {t.desk} / {getSystemBrand().toUpperCase()}</span>
        <span className="rpg-status">{busy ? (language === 'zh' ? '正在查詢' : 'RESEARCHING') : (language === 'zh' ? '資訊台已開放' : 'DESK OPEN')}</span>
      </div>
      <div className="rpg-npc">
        <img src={`${import.meta.env.BASE_URL}avatar.png`} alt="Eric's illustrated portrait" className="rpg-npc-avatar" />
        <div><div className="rpg-npc-label">THE ARCHIVIST</div><h2>{t.title}</h2><p>{t.intro}</p></div>
      </div>
      <div className="rpg-conversation" ref={scrollRef} aria-live="polite">
        {messages.map((item, index) => (
          <div className={`rpg-message ${item.role}`} key={index}>
            <span className="rpg-speaker">{item.role === 'user' ? (language === 'en' ? 'VISITOR' : '訪客') : (language === 'en' ? 'ARCHIVIST' : '檔案管理員')}</span>
            <p>{item.content || (busy && index === messages.length - 1 ? '…' : '')}</p>
            {item.related && <a className="rpg-evidence" href={item.related.href} target="_blank" rel="noopener noreferrer">{language==='en'?'RELATED RECORD':'相關文件'} · {item.related.label} ↗</a>}
          </div>
        ))}
      </div>
      {latestAnswer && <div className="rpg-stamp-row"><button type="button" className={`rpg-stamp ${copied ? 'impressed' : ''}`} onClick={() => { if (navigator.clipboard?.writeText) void navigator.clipboard.writeText(latestAnswer).then(() => setCopied(true)).catch(() => setCopied(false)); }} aria-label={t.copy}>{copied ? t.copied : t.copy}</button></div>}
      {!active && (
        <div className="rpg-init">
          {status === 'downloading' ? (
            <><p>{progressText || t.loading} {progress ? `${progress}%` : ''}</p>
              <div className="rpg-progress"><span style={{ width: `${progress}%` }} /></div></>
          ) : (
            <>
              <div className="rpg-model-selection">
                <label htmlFor="desk-model-tier">{language === 'zh' ? '延伸 AI 模型（選用）' : 'Optional AI model'}</label>
                <select id="desk-model-tier" value={tier} onChange={e => setTier(e.target.value as BrowserModelTier)}>
                  <option value="small">SmolLM2 360M · {language === 'zh' ? '約 376 MB VRAM' : '~376 MB VRAM'}</option>
                  <option value="enhanced">SmolLM2 1.7B · {language === 'zh' ? '約 1.77 GB VRAM' : '~1.77 GB VRAM'}</option>
                </select>
              </div>
              <button type="button" className="rpg-primary" onClick={handleInit}
                disabled={!capability?.gpuAvailable || (tier === 'enhanced' && !capability.supportsF16)}>
                {status === 'error' ? t.retry : t.init}
              </button>
            </>
          )}
          {status === 'error' && <p role="alert">{error}</p>}
          <small>{language === 'zh'
            ? (!capability ? '正在檢查 WebGPU…' : !capability.gpuAvailable ? '此瀏覽器未提供 WebGPU，仍可使用履歷問答。' : tier === 'enhanced' && !capability.supportsF16 ? '這個裝置缺少大型模型需要的 shader-f16。' : '無法可靠測量可用 VRAM，載入失敗時請選輕量模式。')
            : (!capability ? 'Checking WebGPU…' : !capability.gpuAvailable ? 'WebGPU unavailable. Verified profile Q&A still works.' : tier === 'enhanced' && !capability.supportsF16 ? 'Enhanced model requires shader-f16.' : 'Available VRAM cannot be reliably measured. Use the small model if loading fails.')}</small>
        </div>
      )}
      {topicBranch !== null && <button type="button" className="rpg-branch-back" onClick={()=>setTopicBranch(null)}>{language==='en'?'← BACK TO TOPICS':'← 返回主題'}</button>}
      <div className="rpg-actions">
        {topicBranch===null ? t.topics.map((topic, i) => (
          <button className="rpg-choice" type="button" key={topic}
            onClick={() => setTopicBranch(i)} disabled={busy}>
            <span>{String(i + 1).padStart(2, '0')}</span> {topic}
          </button>
        )) : t.branches[topicBranch].map((topic,i)=>(
          <button className="rpg-choice" type="button" key={topic} disabled={busy}
            onClick={()=>{void handleSend(topic);}}>
            <span>{String(i + 1).padStart(2,'0')}</span> {topic}
          </button>
        ))}
      </div>
      <form className="rpg-input" onSubmit={(e) => { e.preventDefault(); void handleSend(); }}>
        <input value={input} onChange={(e) => setInput(e.target.value)} placeholder={t.placeholder} aria-label={t.placeholder} disabled={busy} />
        <button type="submit" disabled={!input.trim() || busy}>{t.send}</button>
      </form>
      <div className="rpg-foot">
        <a href={`${import.meta.env.BASE_URL}CV.pdf`} target="_blank" rel="noreferrer">{t.resume} ↗</a>
        <span>{t.note}</span>
      </div>
    </section>
  );
}
