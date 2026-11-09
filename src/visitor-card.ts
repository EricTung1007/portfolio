/** One personal card per browser, stored locally until the visitor removes it. */
export const VISITOR_CARD_STORAGE_KEY = 'eric_table_card_v1';
export const SITE_URL = 'https://erictung1007.github.io/';
export type TableCard = {
  alias: string;
  role: string;
  interest: string;
  message: string;
  golden: boolean;
  createdAt: string;
};
export function readTableCard(): TableCard | null {
  try {
    const value = JSON.parse(localStorage.getItem(VISITOR_CARD_STORAGE_KEY) || 'null');
    if (!value || typeof value !== 'object' || typeof value.alias !== 'string' ||
        typeof value.message !== 'string' || typeof value.golden !== 'boolean') return null;
    return {
      alias: value.alias.slice(0,28), role: String(value.role || 'VISITOR').slice(0,24),
      interest: String(value.interest || 'AI').slice(0,24),
      message: value.message.slice(0,600), golden: value.golden,
      createdAt: String(value.createdAt || ''),
    };
  } catch { return null; }
}
export function saveTableCard(card:TableCard): boolean {
  try {
    localStorage.setItem(VISITOR_CARD_STORAGE_KEY,JSON.stringify(card));
    window.dispatchEvent(new Event('eric-card-updated'));
    return true;
  } catch { return false; }
}
export function clearTableCard(): void {
  try { localStorage.removeItem(VISITOR_CARD_STORAGE_KEY); } catch { /* storage disabled */ }
  window.dispatchEvent(new Event('eric-card-updated'));
}
/** Prefills the existing GitHub Issue Form using its exact field IDs.
 * The visitor must log in, review the public submission and explicitly submit.
 * No message is sent from this static website without that final action. */
export function guestbookUrl(card: Pick<TableCard,'alias'|'message'|'interest'>): string {
  const params = new URLSearchParams({
    template: 'guestbook.yml',
    title: '[Guestbook] ' + (card.alias.trim() || 'Visitor').slice(0,28),
    visitor: (card.alias.trim() || 'Visitor').slice(0,28),
    note: card.message.trim().slice(0,600),
  });
  return 'https://github.com/EricTung1007/portfolio/issues/new?' + params.toString();
}
/** A tested, fixed QR matrix, including a 4-module quiet zone, encoding SITE_URL.
 * No remote QR service, runtime dependency or external image request. */
const QR_ROWS = [
'0000000000000000000000000000000000000',
'0000000000000000000000000000000000000',
'0000000000000000000000000000000000000',
'0000000000000000000000000000000000000',
'0000111111100110001001110011111110000',
'0000100000101110010001011010000010000',
'0000101110100100100100010010111010000',
'0000101110100011110010110010111010000',
'0000101110101110010010010010111010000',
'0000100000100110001111110010000010000',
'0000111111101010101010101011111110000',
'0000000000000000100101001000000000000',
'0000101010100001000011011000100100000',
'0000010111011101110110000010010010000',
'0000101110110100101110100111001110000',
'0000010001011001011011001101000100000',
'0000100000100001001101000110010110000',
'0000100010010010001101100010010010000',
'0000110001101100010000001111110110000',
'0000111010011110100101110001110100000',
'0000000000100111100011000110010110000',
'0000001000010110110111000110011010000',
'0000101001101010101111101100000110000',
'0000010000000100111011010111010100000',
'0000100110111110101111101111100000000',
'0000000000001100001100001000101110000',
'0000111111100011110001011010110110000',
'0000100000100011000011011000110010000',
'0000101110101010100111001111100100000',
'0000101110100111000000000000101000000',
'0000101110101101111000101001110010000',
'0000100000100110111011101000000100000',
'0000111111101000011111001101100110000',
'0000000000000000000000000000000000000',
'0000000000000000000000000000000000000',
'0000000000000000000000000000000000000',
'0000000000000000000000000000000000000',
];
export function siteQrSvg(x=900,y=450,moduleSize=4): string {
  const squares:string[]=[];
  QR_ROWS.forEach((line,row)=>{
    for (let col=0;col<line.length;col++) if (line[col]==='1') {
      squares.push(`<rect x="${col*moduleSize}" y="${row*moduleSize}" width="${moduleSize}" height="${moduleSize}"/>`);
    }
  });
  return `<g transform="translate(${x} ${y})"><rect width="${QR_ROWS.length*moduleSize}" height="${QR_ROWS.length*moduleSize}" fill="#fff" stroke="#fff" stroke-width="2"/><g fill="#161616">${squares.join('')}</g></g>`;
}
