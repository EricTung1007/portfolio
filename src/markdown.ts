/** Lightweight, dependency-free Markdown renderer for trusted repository content.
 * HTML is escaped and all generated URLs are restricted to safe protocols. */
const escapeHtml = (value: string) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const safeUrl = (value: string) => {
  const url = value.trim();
  return /^(https?:\/\/|mailto:|\/|#|\.\/|\.\.\/)/i.test(url) ? escapeHtml(url) : '#';
};
function inline(value: string): string {
  let text = escapeHtml(value);
  const code: string[] = [];
  text = text.replace(/`([^`]+)`/g, (_, body: string) => {
    code.push('<code>' + body + '</code>');
    return '%%CODE' + (code.length - 1) + '%%';
  });
  text = text.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_, alt: string, src: string) =>
    '<img src="' + safeUrl(src) + '" alt="' + alt + '" loading="lazy" />');
  text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, label: string, href: string) =>
    '<a href="' + safeUrl(href) + '" target="_blank" rel="noopener noreferrer">' + label + '</a>');
  text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>');
  return text.replace(/%%CODE(\d+)%%/g, (_, n: string) => code[Number(n)]);
}
export function renderMarkdown(md: string): string {
  const lines = md.replace(/\r\n?/g, '\n').split('\n');
  const result: string[] = [];
  let paragraph: string[] = [];
  let list: 'ul' | 'ol' | null = null;
  let code: string[] | null = null;
  let quote: string[] = [];
  const flushParagraph = () => {
    if (paragraph.length) { result.push('<p>' + inline(paragraph.join(' ')) + '</p>'); paragraph = []; }
  };
  const closeList = () => { if (list) { result.push('</' + list + '>'); list = null; } };
  const flushQuote = () => {
    if (quote.length) { result.push('<blockquote><p>' + inline(quote.join(' ')) + '</p></blockquote>'); quote = []; }
  };
  const splitCells = (line: string) => line.replace(/^\||\|$/g, '').split('|').map((cell) => cell.trim());
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith('```')) {
      flushParagraph(); closeList(); flushQuote();
      if (code) { result.push('<pre><code>' + escapeHtml(code.join('\n')) + '</code></pre>'); code = null; }
      else code = [];
      continue;
    }
    if (code) { code.push(line); continue; }
    if (!line.trim()) { flushParagraph(); closeList(); flushQuote(); continue; }
    if (/^\s*\|?\s*:?-{3,}:?\s*\|/.test(lines[i + 1] ?? '') && line.includes('|')) {
      flushParagraph(); closeList(); flushQuote();
      const headers = splitCells(line);
      i++;
      const rows: string[][] = [];
      while (i + 1 < lines.length && lines[i + 1].trim() && lines[i + 1].includes('|')) rows.push(splitCells(lines[++i]));
      result.push('<div class="post-table-wrap"><table><thead><tr>' + headers.map((c) => '<th>' + inline(c) + '</th>').join('') + '</tr></thead><tbody>' +
        rows.map((cells) => '<tr>' + headers.map((_, j) => '<td>' + inline(cells[j] ?? '') + '</td>').join('') + '</tr>').join('') + '</tbody></table></div>');
      continue;
    }
    const heading = line.match(/^(#{1,6})\s+(.+)$/);
    if (heading) { flushParagraph(); closeList(); flushQuote(); const n = heading[1].length; result.push('<h' + n + '>' + inline(heading[2]) + '</h' + n + '>'); continue; }
    if (/^\s*---+\s*$/.test(line)) { flushParagraph(); closeList(); flushQuote(); result.push('<hr />'); continue; }
    if (/^>\s?/.test(line)) { flushParagraph(); closeList(); quote.push(line.replace(/^>\s?/, '')); continue; }
    flushQuote();
    const ul = line.match(/^\s*[-*+]\s+(.+)$/);
    const ol = line.match(/^\s*\d+\.\s+(.+)$/);
    if (ul || ol) {
      flushParagraph(); const type = ul ? 'ul' : 'ol';
      if (list !== type) { closeList(); result.push('<' + type + '>'); list = type; }
      result.push('<li>' + inline((ul || ol)![1]) + '</li>'); continue;
    }
    closeList(); paragraph.push(line.trim());
  }
  if (code) result.push('<pre><code>' + escapeHtml(code.join('\n')) + '</code></pre>');
  flushParagraph(); closeList(); flushQuote();
  return result.join('\n');
}
