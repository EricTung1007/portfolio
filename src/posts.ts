/** Git-backed bilingual publication: English is canonical; Chinese is an optional translation. */
export type PublicationLanguage = 'en' | 'zh';

export interface Post {
  slug: string;
  title: string;
  date: string;
  tags: string[];
  category: string;
  body: string;
  excerpt: string;
  language: PublicationLanguage;
  translated: boolean;
}

interface SourcePost extends Omit<Post, 'translated'> {
  draft: boolean;
}

const enFiles = import.meta.glob('/content/posts/*.md', {
  query: '?raw', import: 'default', eager: true,
}) as Record<string, string>;

const zhFiles = import.meta.glob('/content/posts/zh/*.md', {
  query: '?raw', import: 'default', eager: true,
}) as Record<string, string>;

function plainValue(text: string): string {
  const trimmed = text.trim();
  if ((trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
    return trimmed.slice(1, -1).replace(/\\'/g, "'").replace(/\\"/g, '"');
  }
  return trimmed;
}

function parseFrontmatter(source: string): { meta: Record<string, string | string[]>; body: string } {
  const normalized = source.replace(/\r\n?/g, '\n');
  const match = normalized.match(/^---\n([\s\S]*?)\n---(?:\n|$)([\s\S]*)$/);
  if (!match) return { meta: {}, body: normalized.trim() };
  const meta: Record<string, string | string[]> = {};
  let listField: string | null = null;
  for (const line of match[1].split('\n')) {
    const keyValue = line.match(/^([\w-]+):(?:\s*(.*))?$/);
    if (keyValue) {
      const [, key, raw = ''] = keyValue;
      const value = raw.trim();
      if (!value) { meta[key] = []; listField = key; continue; }
      if (value.startsWith('[') && value.endsWith(']')) {
        meta[key] = value.slice(1, -1).split(',').map(plainValue).filter(Boolean);
      } else meta[key] = plainValue(value);
      listField = null;
    } else if (listField && /^\s+-\s+/.test(line)) {
      const items = meta[listField];
      if (Array.isArray(items)) items.push(plainValue(line.replace(/^\s+-\s+/, '')));
    }
  }
  return { meta, body: match[2].trim() };
}

function excerptOf(body: string): string {
  const first = body.split(/\n\s*\n/).map(s => s.trim()).find(s => s && !s.startsWith('#') && !s.startsWith('!['));
  return first ? first.replace(/\[([^\]]+)\]\([^)]*\)/g, '$1').replace(/[*_`#]/g, '').slice(0, 190) : '';
}

function readFiles(files: Record<string, string>, language: PublicationLanguage): Map<string, SourcePost> {
  const entries = new Map<string, SourcePost>();
  for (const [path, md] of Object.entries(files)) {
    const slug = path.split('/').pop()!.replace(/\.md$/i, '');
    const { meta, body } = parseFrontmatter(md);
    const date = String(meta.date ?? '');
    if (String(meta.draft ?? '').toLowerCase() === 'true' || !/^\d{4}-\d{2}-\d{2}$/.test(date)) continue;
    entries.set(slug, {
      slug, language, title: String(meta.title ?? slug),
      date, tags: Array.isArray(meta.tags) ? meta.tags : [],
      category: String(meta.category ?? 'Journal'), body, excerpt: excerptOf(body),
      draft: false,
    });
  }
  return entries;
}

const english = readFiles(enFiles, 'en');
const chinese = readFiles(zhFiles, 'zh');
const timeline = [...english.values()].sort((a, b) => b.date.localeCompare(a.date));

export function getPosts(language: PublicationLanguage = 'en'): Post[] {
  return timeline.map(en => {
    const zh = language === 'zh' ? chinese.get(en.slug) : undefined;
    const selected = zh ?? en;
    // The English article defines the stable publication section and date.
    // Translations only replace reader-facing text, not taxonomy.
    return { ...selected, category: en.category, date: en.date, tags: en.tags, translated: Boolean(zh) };
  });
}

export function getPost(slug: string, language: PublicationLanguage = 'en'): Post | undefined {
  return getPosts(language).find(post => post.slug === slug);
}

export const posts = getPosts('en');
