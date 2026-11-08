import { useEffect, useRef } from 'react';

const REPO = 'EricTung1007/portfolio';
const REPO_ID = 'R_kgDOFqJg'; // TODO: replace with real repo_id after first giscus render

interface GiscusProps {
  mapping: string; // e.g. "pathname"
  theme: 'light' | 'dark';
}

export function Giscus({ mapping, theme }: GiscusProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.innerHTML = '';
    const script = document.createElement('script');
    script.src = 'https://giscus.app/client.js';
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.setAttribute('data-repo', REPO);
    script.setAttribute('data-repo-id', REPO_ID);
    script.setAttribute('data-category', 'Comments');
    script.setAttribute('data-category-id', 'DIC_kwDOFqJg4c4'); // TODO: replace with real category id
    script.setAttribute('data-mapping', mapping);
    script.setAttribute('data-strict', '1');
    script.setAttribute('data-reactions-enabled', '1');
    script.setAttribute('data-emit-metadata', '0');
    script.setAttribute('data-input-position', 'top');
    script.setAttribute('data-theme', theme === 'dark' ? 'dark_dimmed' : 'light');
    script.setAttribute('data-lang', 'en');
    el.appendChild(script);
    return () => { el.innerHTML = ''; };
  }, [mapping, theme]);

  return <div ref={ref} />;
}
