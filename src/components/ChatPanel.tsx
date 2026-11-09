import { useEffect, useRef, useState } from 'react';
import { useWebLLM } from '../hooks.js';
import type { ChatLanguage } from '../chat-engine.js';

interface MessageItem { role: 'user' | 'assistant'; content: string; }

const COPY = {
  en: {
    desk: 'INFORMATION DESK', title: 'Speak with the archivist',
    intro: "Welcome, traveler. Explore Eric's work, research, and experience. Choose a topic or ask a question.",
    init: 'AWAKEN THE ARCHIVIST', loading: 'Awakening the local model', ready: 'ARCHIVIST ONLINE', idle: 'DORMANT',
    resume: 'VIEW RESUME', model: 'Qwen2.5-Coder 1.5B · Browser WebGPU',
    note: 'Answers are grounded in the CV text extracted at build time plus maintained profile data. Updating CV.pdf and rebuilding refreshes the reference.',
    placeholder: 'Ask the archivist...', send: 'SEND', retry: 'TRY AGAIN',
    topics: ['Who is Eric?', 'What AI projects has Eric built?', 'What is his experience?', 'What can he build?'],
    unknown: 'No published evidence is available for that detail.',
    copy: 'STAMP & COPY', copied: 'COPIED TO CLIPBOARD',
  },
  zh: {
    desk: '個人資訊台', title: '與檔案管理員交談',
    intro: '歡迎，旅人。你可以探索 Eric 的作品、研究與經歷，選擇主題或直接提問。',
    init: '喚醒檔案管理員', loading: '正在啟動本地模型', ready: '檔案管理員已上線', idle: '尚未啟動',
    resume: '查看履歷', model: 'Qwen2.5-Coder 1.5B · 瀏覽器 WebGPU',
    note: '回答依據建置時從 CV.pdf 擷取的文字及個人資料，更新履歷並重新建置後即可同步。',
    placeholder: '向檔案管理員提問…', send: '送出', retry: '重試',
    topics: ['Eric 是誰？', 'Eric 做過哪些 AI 專案？', 'Eric 有哪些工作經歷？', 'Eric 能開發什麼？'],
    unknown: '公開資料中沒有這項資訊。',
    copy: '蓋章並複製', copied: '已複製至剪貼簿',
  },
} as const;

export function ChatPanel({ onGenerationStart, onGenerationEnd, language }: {
  onGenerationStart: () => void; onGenerationEnd: () => void; language: ChatLanguage;
}) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [copied, setCopied] = useState(false);
  const { status, progress, progressText, error, initialize, generate } = useWebLLM();
  const scrollRef = useRef<HTMLDivElement>(null);
  const busy = status === 'generating';
  const active = status === 'ready' || busy;
  const t = COPY[language];
  const latestAnswer = [...messages].reverse().find((m) => m.role === 'assistant' && m.content)?.content ?? '';
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const handleInit = () => { void initialize('Qwen2.5-Coder-1.5B-Instruct-q4f16_1-MLC'); };
  const handleSend = async (question = input) => {
    const q = question.trim();
    if (!q || !active || busy) { if (q) setInput(q); return; }
    setInput('');
    setCopied(false);
    setMessages((items) => [...items, { role: 'user', content: q }, { role: 'assistant', content: '' }]);
    onGenerationStart();
    try {
      await generate(q, (token) => {
        setMessages((items) => {
          const updated = [...items];
          const index = updated.length - 1;
          if (updated[index]?.role === 'assistant') updated[index] = { role: 'assistant', content: updated[index].content + token };
          return updated;
        });
      }, language);
    } catch {
      setMessages((items) => {
        const updated = [...items];
        const index = updated.length - 1;
        if (updated[index]?.role === 'assistant' && !updated[index].content) updated[index] = { role: 'assistant', content: t.unknown };
        return updated;
      });
    } finally { onGenerationEnd(); }
  };

  return (
    <section className="rpg-panel" aria-label={t.desk}>
      <div className="rpg-panel-header">
        <span className="rpg-kicker">◈ {t.desk} / ERIC.EXE</span>
        <span className="rpg-status">{active ? t.ready : t.idle}</span>
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
            <button type="button" className="rpg-primary" onClick={handleInit}>{status === 'error' ? t.retry : t.init}</button>
          )}
          {status === 'error' && <p role="alert">{error}</p>}
          <small>{t.model}</small>
        </div>
      )}
      <div className="rpg-actions">
        {t.topics.map((topic, i) => (
          <button className="rpg-choice" type="button" key={topic}
            onClick={() => { if (active) void handleSend(topic); else setInput(topic); }}
            disabled={busy}>
            <span>{String(i + 1).padStart(2, '0')}</span> {topic}
          </button>
        ))}
      </div>
      <form className="rpg-input" onSubmit={(e) => { e.preventDefault(); void handleSend(); }}>
        <input value={input} onChange={(e) => setInput(e.target.value)} placeholder={t.placeholder} aria-label={t.placeholder} disabled={busy} />
        <button type="submit" disabled={!input.trim() || busy || !active}>{t.send}</button>
      </form>
      <div className="rpg-foot">
        <a href={`${import.meta.env.BASE_URL}CV.pdf`} target="_blank" rel="noreferrer">{t.resume} ↗</a>
        <span>{t.note}</span>
      </div>
    </section>
  );
}
