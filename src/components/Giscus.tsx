import { useEffect, useRef } from 'react';

/** Giscus requires GitHub Discussions enabled on the repository and a valid
 * discussion category. Set these public IDs in .env before deployment. */
const REPO = 'EricTung1007/portfolio';
const REPO_ID = 'R_kgDOVlg8wA';
const CATEGORY_ID = import.meta.env.VITE_GISCUS_CATEGORY_ID as string | undefined;
const CATEGORY = import.meta.env.VITE_GISCUS_CATEGORY || 'Comments';

interface GiscusProps {
  mapping: 'specific' | 'pathname';
  term?: string;
  theme: 'light' | 'dark';
  language?: 'en' | 'zh';
}

export function Giscus({ mapping, term, theme, language = 'en' }: GiscusProps) {
  const ref = useRef<HTMLDivElement>(null);
  const enabled = Boolean(CATEGORY_ID && (! (mapping === 'specific') || term));

  useEffect(() => {
    if (!enabled) return;
    const el = ref.current;
    if (!el) return;
    el.innerHTML = '';
    const script = document.createElement('script');
    script.src = 'https://giscus.app/client.js';
    script.async = true;
    script.crossOrigin = 'anonymous';
    const attrs: Record<string, string> = {
      'data-repo': REPO,
      'data-repo-id': REPO_ID,
      'data-category': CATEGORY,
      'data-category-id': CATEGORY_ID!,
      'data-mapping': mapping,
      'data-strict': '1',
      'data-reactions-enabled': '1',
      'data-emit-metadata': '0',
      'data-input-position': 'top',
      'data-theme': theme === 'dark' ? 'dark_dimmed' : 'light',
      'data-lang': language === 'zh' ? 'zh-TW' : 'en',
    };
    if (mapping === 'specific' && term) attrs['data-term'] = term;
    Object.entries(attrs).forEach(([key, value]) => script.setAttribute(key, value));
    el.appendChild(script);
    return () => { el.innerHTML = ''; };
  }, [enabled, mapping, term, theme, language]);

  if (!enabled) return <p className="comments-unavailable">{language === 'zh' ? '留言功能尚未啟用。請先在 GitHub 開啟 Discussions 並設定 Giscus。' : 'Comments are not configured yet. Enable GitHub Discussions and configure Giscus to activate them.'}</p>;
  return <div ref={ref} />;
}
