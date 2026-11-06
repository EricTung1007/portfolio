import { useState, useRef } from 'react';

export function useReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function useWebLLM() {
  const [status, setStatus] = useState<'not-initialized' | 'downloading' | 'ready' | 'error' | 'generating'>('not-initialized');
  const [progress, setProgress] = useState<number>(0);
  const [progressText, setProgressText] = useState<string>('');
  const [errMsg, setErrMsg] = useState<string | null>(null);

  const engineRef = useRef<import('./chat-engine.js').ChatEngine | null>(null);

  const initialize = async (modelId: string) => {
    setStatus('downloading');
    setProgress(0);
    setProgressText('');
    setErrMsg(null);

    const engine = new (await import('./chat-engine.js')).ChatEngine(modelId);
    try {
      await engine.initialize((p, text) => {
        setProgress(p);
        setProgressText(text);
      });
      setStatus('ready');
      setProgress(100);
    } catch (e: unknown) {
      setStatus('error');
      setErrMsg(e instanceof Error ? e.message : String(e));
    }

    engineRef.current = engine;
  };

  const generate = async (question: string, onToken: (t: string) => void): Promise<void> => {
    const engine = engineRef.current;
    if (!engine) throw new Error('Not initialized');

    setStatus('generating');
    try {
      await engine.generate(question, onToken);
      setStatus('ready');
    } catch (e: unknown) {
      setStatus('error');
      setErrMsg(e instanceof Error ? e.message : String(e));
    }
  };

  return { status, error: errMsg, progress, progressText, initialize, generate };
}
