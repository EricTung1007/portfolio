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
}

export function Giscus({ mapping, term, theme }: GiscusProps) {
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
      'data-lang': 'en',
    };
    if (mapping === 'specific' && term) attrs['data-term'] = term;
    Object.entries(attrs).forEach(([key, value]) => script.setAttribute(key, value));
    el.appendChild(script);
    return () => { el.innerHTML = ''; };
  }, [enabled, mapping, term, theme]);

  if (!enabled) return <p className="comments-unavailable">Comments are temporarily unavailable.</p>;
  return <div ref={ref} />;
}
