import { useState, useRef, useEffect } from 'react';
import { useWebLLM } from '../hooks.js';

interface MessageItem { role: 'user' | 'assistant'; content: string; }

const SUGGESTED = [
  'Tell me about your nursing background.',
  'What AI projects have you worked on?',
  'How did you transition from nursing to AI?',
  'What is your experience with Python and ML?',
];

function Message({ role, content }: { role: 'user' | 'assistant'; content: string }) {
  return (
    <div className={`flex msg-in ${role === 'user' ? 'justify-end' : 'justify-start'}`}>
      <div
        className="max-w-[85%] text-sm leading-relaxed"
        style={
          role === 'user'
            ? { background: 'var(--bubble-user)', color: 'var(--bubble-user-ink)', borderRadius: '16px 16px 4px 16px', padding: '8px 14px' }
            : { background: 'var(--surface)', color: 'var(--ink)', borderRadius: '16px 16px 16px 4px', padding: '8px 14px', border: '1px solid var(--line)' }
        }
      >
        {content}
      </div>
    </div>
  );
}

interface ChatPanelProps {
  onGenerationStart: () => void;
  onGenerationEnd: () => void;
}

export function ChatPanel({ onGenerationStart, onGenerationEnd }: ChatPanelProps) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const { status, progress, progressText, error, initialize, generate } = useWebLLM();
  const scrollRef = useRef<HTMLDivElement>(null);

  // auto-scroll to latest message
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  const handleInit = async () => {
    await initialize('Qwen2.5-Coder-1.5B-Instruct-q4f16_1-MLC');
  };

  const handleSend = async () => {
    if (!input.trim() || (status !== 'ready' && status !== 'generating')) return;
    const q = input.trim();
    setInput('');
    setMessages((m) => [...m, { role: 'user', content: q }]);
    onGenerationStart();

    // add a placeholder assistant message immediately
    setMessages((m) => [...m, { role: 'assistant', content: '' }]);

    try {
      await generate(q, (token: string) => {
        setMessages((m) => {
          const copy = [...m];
          const last = copy[copy.length - 1];
          if (last?.role === 'assistant') {
            copy[copy.length - 1] = { role: 'assistant', content: last.content + token };
          }
          return copy;
        });
      });
    } catch {
      // error handled in hook
    } finally {
      onGenerationEnd();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const isActive = status === 'ready' || status === 'generating';

  return (
    <div className="card flex flex-col" style={{ minHeight: '300px' }}>
      <p className="mb-3" style={{ color: 'var(--muted)', fontSize: '0.9375rem' }}>Chat with Eric</p>

      {/* ── not initialized ── */}
      {status === 'not-initialized' && (
        <div className="flex-1 flex flex-col items-center justify-center text-center gap-3 px-4">
          <p className="max-w-[28ch] text-[0.9375rem]" style={{ color: 'var(--muted)', lineHeight: 1.6 }}>
            Local AI — runs entirely in your browser via WebGPU. Nothing is sent to any server.
          </p>
          <button onClick={handleInit} className="btn-primary px-5 py-2.5 text-sm">
            Load model <span style={{ color: 'rgba(127,120,110,0.7)', fontSize: '0.75rem' }}>(~500 MB)</span>
          </button>
          <p style={{ color: 'var(--muted)', fontSize: '0.875rem' }}>
            Qwen2.5-Coder-1.5B · MLC-LLM
          </p>
        </div>
      )}

      {/* ── downloading ── */}
      {status === 'downloading' && (
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <p className="text-sm" style={{ color: 'var(--muted)' }}>
            {progressText || 'Downloading model…'} {progress > 0 && progress < 100 ? `${progress}%` : ''}
          </p>
          <div className="w-full rounded-full overflow-hidden" style={{ height: '3px', background: 'var(--line)' }}>
            <div
              className="h-full transition-all duration-300"
              style={{ width: `${progress}%`, background: 'var(--accent)' }}
            />
          </div>
        </div>
      )}

      {/* ── error ── */}
      {status === 'error' && (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center">
          <p className="text-sm max-w-xs" style={{ color: 'var(--accent)' }}>{error}</p>
          <button onClick={handleInit} className="btn-primary px-4 py-2 text-sm">Retry</button>
        </div>
      )}

      {/* ── ready / generating — both show the message list ── */}
      {isActive && (
        <>
          <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-3 pr-1">
            {messages.length === 0 && (
              <p className="text-[0.9375rem]" style={{ color: 'var(--muted)' }}>
                Ask anything about Eric's education, skills, or projects.
              </p>
            )}
            {messages.map((m, i) => (
              <Message key={i} role={m.role} content={m.content} />
            ))}
            {status === 'generating' && messages[messages.length - 1]?.role === 'assistant' && messages[messages.length - 1]?.content === '' && (
              <div className="flex justify-start">
                <span className="flex gap-1.5 items-center px-3 py-2" style={{ color: 'var(--muted)' }}>
                  <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: 'var(--accent)', animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: 'var(--accent)', animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: 'var(--accent)', animationDelay: '300ms' }} />
                </span>
              </div>
            )}
          </div>

          <div className="mt-3 space-y-2.5">
            {messages.length === 0 && (
              <div className="flex flex-wrap gap-1.5">
                {SUGGESTED.map((s) => (
                  <button
                    key={s}
                    onClick={() => setInput(s)}
                    className="text-xs px-2.5 py-1 rounded-full transition-colors"
                    style={{ border: '1px solid var(--line-strong)', color: 'var(--muted)', background: 'transparent' }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--ink)'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--accent)'; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--muted)'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--line-strong)'; }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about Eric…"
                disabled={status === 'generating'}
                className="field"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || status === 'generating'}
                className="btn-primary px-4 py-2 text-sm"
              >
                Send
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
