import { knowledge } from './data.js';

export type DeskLanguage = 'en' | 'zh';

const unknown = {
  en: "That detail isn't verified in Eric's published profile or CV. I won't guess. You can check the resume or contact Eric directly.",
  zh: 'Eric 公開的履歷與個人資料沒有經過確認的相關資訊，我不會猜測。你可以查看履歷或直接向本人確認。',
};

const short = (value: string) => value.replace(/\s+/g, ' ').trim();
const normalize = (value: string) => short(value).toLowerCase().replace(/[？?！!.,，。:：]/g, ' ').replace(/\s+/g, ' ').trim();
const has = (q: string, keywords: string[]) => keywords.some(x => q.includes(x));

export function answerFromVerifiedProfile(question: string, language: DeskLanguage): string | null {
  const q = normalize(question);
  if (!q) return null;
  const zh = language === 'zh';
  const name = 'Eric Tung';

  // A deterministic abstention for facts that are absent. Do not send to the LLM.
  if (has(q, ['gender','sex','pronoun','male','female','boy','girl','man or woman','how old','age','birthday','birth date','born','father','mother','parent','family','sibling','married','wife','husband','children','性別','男生','女生','是男','是女','年齡','幾歲','生日','出生','父親','母親','爸爸','媽媽','家人','家庭','婚姻','結婚','老婆','老公','孩子','兄弟姊妹'])) return unknown[language];

  if (has(q,['hello','hi there','hey','嗨','你好','您好','哈囉'])) {
    return zh ? '歡迎來到 Eric 的資訊台。你可以詢問他的背景、專案、經歷、技術與學術發表，也能打開檔案抽屜查看履歷。' :
      'Welcome to Eric’s information desk. Ask about his background, projects, experience, skills or publications, or open the file drawer to see his CV.';
  }
  if (has(q,['who is','who are','about eric','tell me about eric','introduce','eric 是誰','介紹 eric','關於 eric','你是誰','你是什麼'])) {
    return zh
      ? 'Eric Tung 是具有國立臺灣大學護理背景的後端與 AI 開發者，專注本地 LLM 推論、RAG 與臨床流程相關軟體。他將護理實務經驗結合程式開發，設計兼顧隱私、可靠性與使用者需求的系統。'
      : 'Eric Tung is a backend and AI developer with a nursing background from National Taiwan University. His work includes local LLM inference, retrieval-augmented generation, and healthcare software designed around real clinical workflows.';
  }
  if (has(q,['ai project','projects','project','portfolio','built','build','work on','專案','作品','做過哪些','做過什麼','做過甚麼','開發什麼','可以做什麼','建造'])) {
    const items = knowledge.projects.map(p => `• ${p.title}: ${p.description[0]}`).join('\n');
    return zh
      ? '公開資料列出的主要專案如下：\n' + knowledge.projects.map(p => `• ${p.title}：${p.role}。相關內容可在網站作品區與 GitHub 查看。`).join('\n')
      : 'Eric’s published projects include:\n' + items;
  }
  if (has(q,['experience','career','intern','job','worked','employment','employer','company','經歷','實習','工作','職涯','任職'])) {
    return (zh ? '公開履歷中的經歷：\n' : 'Experience listed in Eric’s profile:\n') + knowledge.experience.map(e => `• ${e.role}, ${e.company} (${e.period})`).join('\n');
  }
  if (has(q,['skill','stack','tech','language','python','tools','technology','能力','技能','技術','程式語言','工具'])) {
    const s = knowledge.skills;
    return (zh ? '目前列出的技術能力：\n' : 'Published technical skills:\n') +
      [s.core?.join(', '), s.backend_data?.join(', '), s.ai_tools?.join(', ')].filter(Boolean).join('\n');
  }
  if (has(q,['education','university','degree','nursing','school','study','academic background','教育','學歷','大學','護理','學校','畢業'])) {
    return (zh ? '教育背景：\n' : 'Education:\n') +
      knowledge.education.map(e => `• ${e.institution}, ${e.degree}.`).join('\n');
  }
  if (has(q,['publication','paper','research article','journal','doi','論文','期刊','發表','出版'])) {
    return (zh ? '公開資料中的學術發表：\n' : 'Published research:\n') +
      (knowledge.publications ?? []).map(p => `• ${p.title} (${p.journal}, ${p.year}) ${p.doi ?? ''}`).join('\n');
  }
  if (has(q,['contact','email','github','linkedin','reach','聯絡','信箱','郵件','電子郵件','社群'])) {
    const c = knowledge.profile.contact;
    return (zh ? '你可以透過以下方式聯絡 Eric：\n' : 'You can reach Eric at:\n') +
      `• Email: ${c.email}\n• GitHub: ${c.github}\n• LinkedIn: ${c.linkedin}`;
  }
  if (has(q,['resume','cv','履歷','簡歷'])) {
    return zh ? '網站的「檔案抽屜」內有可下載的最新公開履歷（CV.pdf）。資訊台的資料會在網站重新建置時由該檔案同步。' :
      'Open the file drawer to view Eric’s public CV.pdf. The site refreshes its extracted resume text when rebuilt.';
  }
  return null;
}

export function unknownDeskAnswer(language: DeskLanguage): string { return unknown[language]; }
