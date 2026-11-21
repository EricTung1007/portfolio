"""Generate one-page English and Traditional Chinese CV PDFs for GitHub Pages."""
from pathlib import Path
from tempfile import TemporaryDirectory
from subprocess import run as subprocess_run
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_TAB_ALIGNMENT
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.opc.constants import RELATIONSHIP_TYPE as RT

OUT = Path(__file__).resolve().parents[1] / 'public'
NAVY, TEAL, SLATE, LIGHT, BLACK = '173247', '14708A', '526477', 'D9E3E8', '243745'

def color(code):
    return RGBColor.from_string(code)

def run(p, text, size=9.6, bold=False, color_=BLACK, font='Lato'):
    r = p.add_run(text); r.bold=bold; r.font.size=Pt(size)
    r.font.name=font; r.font.color.rgb=color(color_)
    rp=r._element.get_or_add_rPr(); rf=rp.rFonts
    if rf is None:
        rf=OxmlElement('w:rFonts'); rp.insert(0,rf)
    rf.set(qn('w:eastAsia'), 'Noto Sans CJK TC')
    return r

def link(p, text, url, size=9):
    rid=p.part.relate_to(url, RT.HYPERLINK, is_external=True)
    a=OxmlElement('w:hyperlink'); a.set(qn('r:id'),rid)
    r=OxmlElement('w:r'); props=OxmlElement('w:rPr')
    c=OxmlElement('w:color'); c.set(qn('w:val'),TEAL); props.append(c)
    sz=OxmlElement('w:sz'); sz.set(qn('w:val'),str(int(size*2))); props.append(sz)
    f=OxmlElement('w:rFonts'); f.set(qn('w:ascii'),'Lato')
    f.set(qn('w:hAnsi'),'Lato'); f.set(qn('w:eastAsia'),'Noto Sans CJK TC'); props.append(f)
    r.append(props); t=OxmlElement('w:t'); t.text=text; r.append(t); a.append(r); p._p.append(a)

def para(d, before=0, after=0, line=1.13, keep=False):
    p=d.add_paragraph(); pf=p.paragraph_format
    pf.space_before=Pt(before); pf.space_after=Pt(after)
    pf.line_spacing=line; pf.keep_with_next=keep
    return p

def rule(p):
    pr=p._p.get_or_add_pPr(); b=OxmlElement('w:pBdr')
    x=OxmlElement('w:bottom')
    for k,v in {'val':'single','sz':'5','color':LIGHT,'space':'4'}.items():
        x.set(qn('w:'+k),v)
    b.append(x); pr.append(b)

def section(d,title,zh=False):
    p=para(d, before=9.5 if zh else 11, after=5.8 if zh else 6.8, line=1,keep=True)
    run(p,title,size=10.1 if zh else 9.3,bold=True,color_=TEAL,font='Noto Sans CJK TC' if zh else 'Lato')
    rule(p)

def bullet(d,text,zh=False):
    p=para(d,after=2.4 if zh else 2.9,line=1.15)
    p.paragraph_format.left_indent=Inches(.14)
    p.paragraph_format.first_line_indent=Inches(-.12)
    run(p,'•  ',9.3 if zh else 9.2,color_=TEAL)
    run(p,text,9.6,font='Noto Sans CJK TC' if zh else 'Lato')

def job(d,title,date,notes,zh=False):
    p=para(d,before=4.1 if zh else 5.1,after=2.5,line=1.06,keep=True)
    p.paragraph_format.tab_stops.add_tab_stop(Inches(6.9),WD_TAB_ALIGNMENT.RIGHT)
    run(p,title,9.65 if zh else 9.7,True,NAVY,'Noto Sans CJK TC' if zh else 'Lato')
    run(p,'\t'+date,8.6,color_=SLATE)
    for note in notes: bullet(d,note,zh)

def project(d,title,date,notes,url,zh=False):
    job(d,title,date,notes,zh)
    p=para(d,before=1,after=3,line=1)
    p.paragraph_format.left_indent=Inches(.14)
    run(p,'程式碼  ' if zh else 'Code  ',8.4,color_=SLATE)
    link(p,url.replace('https://github.com/','github.com/'),url,8.4)

def make(zh):
    d=Document(); sec=d.sections[0]
    sec.page_width=Inches(8.2677); sec.page_height=Inches(11.6929)
    sec.top_margin=Inches(.59); sec.bottom_margin=Inches(.54)
    sec.left_margin=Inches(.68); sec.right_margin=Inches(.68)
    sec.header_distance=Inches(.22); sec.footer_distance=Inches(.25)
    normal=d.styles['Normal']
    normal.font.name='Noto Sans CJK TC' if zh else 'Lato'
    normal.font.size=Pt(9.45 if zh else 9.2); normal.font.color.rgb=color(BLACK)
    normal.paragraph_format.space_after=Pt(0)
    p=para(d,after=2.3,line=1.05)
    run(p,'董哲豪  CHE-HAO TUNG' if zh else 'CHE-HAO TUNG',19.5 if zh else 22,True,NAVY,'Noto Sans CJK TC' if zh else 'Lato')
    p=para(d,after=6,line=1.08)
    run(p,'軟體工程師  /  後端與 AI 應用開發  /  護理師' if zh else 'SOFTWARE ENGINEER  /  BACKEND & AI  /  REGISTERED NURSE',9.55 if zh else 9.25,True,TEAL,'Noto Sans CJK TC' if zh else 'Lato')
    p=para(d,after=4.4,line=1.1)
    run(p,'臺灣臺北  ·  ' if zh else 'Taipei, Taiwan  ·  ',9,color_=SLATE)
    link(p,'erictung911007@gmail.com','mailto:erictung911007@gmail.com')
    run(p,'  ·  ',9,color_=SLATE)
    link(p,'GitHub','https://github.com/EricTung1007')
    run(p,'  ·  ',9,color_=SLATE)
    link(p,'LinkedIn','https://www.linkedin.com/in/erictung1007')
    rule(p)
    section(d,'個人簡介' if zh else 'PROFILE',zh)
    p=para(d,line=1.16 if zh else 1.17)
    run(p,'具護理師資格的軟體工程師，擁有企業 AI、後端開發、資料處理與臨床流程經驗。曾參與本地大型語言模型（LLM）推論、檢索增強生成（RAG）、企業資源規劃（ERP）及醫療資訊系統相關專案。' if zh else 'Software engineer and registered nurse (BSN, RN) combining enterprise AI, backend development and clinical workflow expertise. Experience with local LLMs, RAG, ERP systems and healthcare software.',9.45 if zh else 9.5,font='Noto Sans CJK TC' if zh else 'Lato')
    section(d,'技術能力' if zh else 'TECHNICAL SKILLS',zh)
    skills=[
      ('程式語言','Python、SQL；具 JavaScript、C#、SAP ABAP、HTML/CSS 基礎實務能力'),
      ('後端與資料','REST API、MySQL、SQLite、預存程序、JWT 驗證；Node.js / Express 維護'),
      ('AI 與工具','本地 LLM 推論、RAG、FAISS、Core ML、LM Studio、模型評估、Docker、Git、.NET MAUI')
    ] if zh else [
      ('Languages','Python, SQL; JavaScript, C#, SAP ABAP, HTML/CSS (working familiarity)'),
      ('Backend / data','REST APIs, MySQL, SQLite, stored procedures, JWT; Node.js / Express maintenance'),
      ('AI / tools','Local LLM inference, RAG, FAISS, Core ML, LM Studio, model evaluation, Docker, Git, .NET MAUI')]
    for title,detail in skills:
        p=para(d,after=2.4,line=1.14)
        run(p,title+':  ',9.4 if zh else 9.5,True,NAVY,'Noto Sans CJK TC' if zh else 'Lato')
        run(p,detail,9.6,font='Noto Sans CJK TC' if zh else 'Lato')
    section(d,'軟體工程經歷' if zh else 'ENGINEERING EXPERIENCE',zh)
    jobs=[
      ('華厚股份有限公司  |  軟體工程師','2026 - 至今',['開發與部署 Genesys 互動式語音應答（IVR）流程，支援企業客服中心解決方案。']),
      ('國泰金控 數位數據暨科技發展中心（DDT）  |  AI 工程實習生','2026.02 - 2026.06',['優化本地 LLM 推論流程，建立提示詞與模型評估工作流程，參與企業 AI 管線開發。','開發 AI Coach（LLM + RAG）平台的英、中、越三語宣傳網站。']),
      ('明基逐鹿（BenQ Guru）  |  軟體研發實習生','2024.06 - 2025.03',['維護 .NET MAUI 跨平台應用程式與 JavaScript / HTML 前端，參與程式碼審查及敏捷開發規劃。']),
      ('勤業眾信（Deloitte）  |  SAP ABAP 開發實習生','2024.02 - 2024.06',['以 SAP ABAP 客製化 ERP 流程，撰寫 MySQL 預存程序及技術文件。'])
    ] if zh else [
      ('Hualiteq International Corporation  |  Software Engineer','2026 - Present',['Develop and deploy Genesys IVR workflows for enterprise contact-center solutions.']),
      ('Cathay Holdings DDT  |  AI Engineering Intern','Feb - Jun 2026',['Optimized local LLM inference and built prompt / evaluation workflows for enterprise AI pipelines.','Developed a multilingual (EN/ZH/VI) website for an LLM + RAG-powered AI Coach platform.']),
      ('BenQ Guru  |  Software R&D Intern','Jun 2024 - Mar 2025',['Maintained a .NET MAUI application and JavaScript / HTML frontend; joined code reviews and sprint planning.']),
      ('Deloitte Consulting  |  SAP ABAP Developer Intern','Feb - Jun 2024',['Customized ERP workflows with SAP ABAP, implemented MySQL stored procedures and wrote technical documentation.'])]
    for j in jobs: job(d,*j,zh=zh)
    section(d,'精選專案' if zh else 'SELECTED PROJECTS',zh)
    projects=[
      ('AI 驅動的孕期衛教聊天機器人','2024 - 2025',['以本地 Gemma 3 4B、FAISS、Flask 與 LINE 建置中英雙語 RAG 衛教機器人。','依據政府與專業機構衛教資料設計知識內容，降低生成錯誤資訊的風險。'],'https://github.com/EricTung1007/NTU-Nursing-Line-Bot'),
      ('低成本長期照護健康資訊系統','2026',['維護 Node.js / Express 與 SQLite 原型，涵蓋給藥紀錄、生命徵象、跌倒與壓傷風險評估、護理紀錄及 JWT 身分驗證。'],'https://github.com/EricTung1007/HIS')
    ] if zh else [
      ('AI-Driven Prenatal Education Chatbot','2024 - 2025',['Built a bilingual RAG chatbot using local Gemma 3 4B, FAISS, Flask and LINE.','Grounded responses in official maternal-health content to reduce hallucination risk.'],'https://github.com/EricTung1007/NTU-Nursing-Line-Bot'),
      ('Low-Cost Long-Term Care Health Information System','2026',['Maintained a Node.js / Express + SQLite prototype supporting medication records, vital signs, fall / pressure-injury assessments, clinical notes and JWT authentication.'],'https://github.com/EricTung1007/HIS')]
    # Independently published iOS application; keep the App Store URL clickable.
    p=para(d,before=4.1 if zh else 5.1,after=2.5,line=1.06,keep=True)
    p.paragraph_format.tab_stops.add_tab_stop(Inches(6.9),WD_TAB_ALIGNMENT.RIGHT)
    run(p,'八號球（Eight Ball）｜iOS 決策 App' if zh else 'Eight Ball | iOS Decision App',9.65 if zh else 9.7,True,NAVY,'Noto Sans CJK TC' if zh else 'Lato')
    run(p,'  ',8.4)
    link(p,'App Store','https://apps.apple.com/tw/app/%E5%85%AB%E8%99%9F%E7%90%83/id6827388818?l=en-GB',8.4)
    run(p,'\\t2026',8.6,color_=SLATE)
    bullet(d,'獨立開發並上架 iOS App，結合經典魔法八號球、Core ML 裝置端選項比較及決策日誌。' if zh else 'Independently developed and shipped an iOS app combining a classic Magic 8 Ball, Core ML on-device option comparison and decision journaling.',zh)
    for pr in projects: project(d,*pr,zh=zh)
    section(d,'研究論文' if zh else 'RESEARCH PUBLICATION',zh)
    p=para(d,after=1.8,line=1.12)
    run(p,"Enhancing Students' Critical Evaluation of AI Versus Human-Generated Literature Reviews: Deliberative Pedagogy",9 if zh else 9.15,True,NAVY)
    p=para(d,line=1.13 if zh else 1.1)
    run(p,'Kuo, W.-C., Pecanac, K. E., ',8.7,color_=SLATE)
    run(p,'Tung, C.-H.',8.7,True,SLATE)
    run(p,', Charles, P., Chen, H.-H., & Lauver, D. R.  |  Journal of Nursing Education (online)  |  ',8.7,color_=SLATE)
    link(p,'DOI','https://doi.org/10.3928/01484834-20261009-02',8.7)
    section(d,'學歷、臨床背景與獲獎紀錄' if zh else 'EDUCATION, CLINICAL BACKGROUND & RECOGNITION',zh)
    details=[
      ('國立臺灣大學  |  ','護理學系學士、護理師；修習 12 學分程式設計、資料分析及機器學習相關課程。'),
      ('國立臺灣大學醫學院附設醫院  |  ','2023-2026 年臨床實習與護理實務；2026 年 7 至 9 月任大腸直腸外科護理師。'),
      ('2026 Global Health Innovation Grand Challenge：','全球 48 組中入選 8 組總決賽團隊之一。'),
      ('2025 臺大護理國際論壇：','孕期 AI 衛教海報發表。  TOEIC 925；全民英檢中高級。')
    ] if zh else [
      ('National Taiwan University  |  ','B.S. Nursing (BSN), Registered Nurse  |  12 credits in programming, data analysis & machine learning'),
      ('National Taiwan University Hospital  |  ','Clinical rotations (2023-2026); RN practice in colorectal surgery (Jul-Sep 2026)'),
      ('2026 Global Health Innovation Grand Challenge: ','1 of 8 grand finalist teams (48 submissions).'),
      ('2025 NTU Nursing International Forum: ','Prenatal AI chatbot poster.  TOEIC 925; GEPT High-Intermediate.')]
    for n,(label,value) in enumerate(details):
        p=para(d,after=2 if n<2 else 0,line=1.12 if n<3 else 1.15)
        run(p,label,9.2 if n<2 else 9.05,True,NAVY,'Noto Sans CJK TC' if zh else 'Lato')
        run(p,value,9.4 if zh and n<2 else 9.1 if n<2 else 9.2 if zh else 9.05,font='Noto Sans CJK TC' if zh else 'Lato')
    return d

if __name__=='__main__':
    OUT.mkdir(parents=True, exist_ok=True)
    with TemporaryDirectory() as temp:
        for code,zh in [('EN',False),('zh_TW',True)]:
            docx=Path(temp)/f'CV_{code}.docx'
            make(zh).save(docx)
            result=subprocess_run(['libreoffice','-env:UserInstallation=file:///tmp/lo_portfolio_cv','--headless','--convert-to','pdf','--outdir',str(OUT),str(docx)],capture_output=True,text=True,timeout=120)
            output=OUT/f'CV_{code}.pdf'
            if result.returncode or not output.exists() or output.stat().st_size<1000:
                raise RuntimeError(f'PDF conversion failed for {code}: {result.stdout} {result.stderr}')
            output.rename(OUT/('CV_zh_TW.pdf' if zh else 'CV.pdf'))
            print('Created', 'CV_zh_TW.pdf' if zh else 'CV.pdf')
