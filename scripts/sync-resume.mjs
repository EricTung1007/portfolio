import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';

const input = resolve('public/CV.pdf');
const output = resolve('src/resume.generated.ts');
if (!existsSync(input)) throw new Error('CV.pdf is missing: cannot build the resume-grounded desk.');
let text = '';
try {
  text = execFileSync('pdftotext', ['-layout', input, '-'], { encoding: 'utf8', maxBuffer: 2 * 1024 * 1024 }).trim();
} catch (error) {
  throw new Error('Install poppler (pdftotext) to build: brew install poppler on macOS, apt install poppler-utils on Ubuntu.', { cause: error });
}
if (text.length < 100) throw new Error('The current CV.pdf did not yield sufficient text. Build stopped rather than silently use stale resume data.');
mkdirSync(dirname(output), { recursive: true });
writeFileSync(output, '// Generated from public/CV.pdf by scripts/sync-resume.mjs. Do not edit manually.\nexport const resumeText: string = ' + JSON.stringify(text) + ';\n');
console.log('Resume extracted:', text.length, 'characters.');
