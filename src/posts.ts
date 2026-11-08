/* Blog posts: import all Markdown files from content/posts/ via Vite's
   import.meta.glob, parse frontmatter (title/date/tags) and the body. */

export interface Post {
  slug: string;
  title: string;
  date: string;
  tags: string[];
  body: string;
  excerpt: string;
}

const raw = import.meta.glob('/content/posts/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

function parseFrontmatter(md: string): { meta: Record<string, string | string[]>; body: string } {
  const match = md.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return { meta: {}, body: md };
  const meta: Record<string, string | string[]> = {};
  for (const line of match[1].split('\n')) {
    const idx = line.indexOf(':');
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    let value = line.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
    if (value.startsWith('[')) {
      meta[key] = value.slice(1, -1).split(',').map((s) => s.trim().replace(/^["']|["']$/g, ''));
    } else {
      meta[key] = value;
    }
  }
  return { meta, body: match[2].trim() };
}

function excerptOf(body: string): string {
  const firstPara = body.split(/\n\n/).find((p) => !p.startsWith('#'));
  return firstPara ? firstPara.slice(0, 180) : '';
}

export const posts: Post[] = Object.entries(raw)
  .map(([path, md]) => {
    const slug = path.split('/').pop()!.replace('.md', '');
    const { meta, body } = parseFrontmatter(md);
    return {
      slug,
      title: (meta.title as string) ?? slug,
      date: (meta.date as string) ?? '',
      tags: (meta.tags as string[]) ?? [],
      body,
      excerpt: excerptOf(body),
    };
  })
  .sort((a, b) => (a.date < b.date ? 1 : -1));

export function getPost(slug: string): Post | undefined {
  return posts.find((p) => p.slug === slug);
}
