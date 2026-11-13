---
title: "Minerva’s Den 研究圖鑑：尚未刊登的工具、模型與構想"
date: "2026-11-13"
category: "Minerva's Den"
tags: ["Research Notes", "Agents", "Local AI", "Repository Spotlight", "Field Atlas"]
---

這是 **一篇完整的綜合研究特刊**，從 Minerva’s Den 專案先前未充分刊登的討論、連結與技術想法整理而成。它不要求某個 Repo 已被安裝，或技術已完成實驗。相反，每個線索都是獨立題材，保留技術機制、限制、原始來源，以及與 Mac mini M4、32GB 統一記憶體之間的關係。

網站已經有十二篇英文文章，涵蓋系統架構、開發紀錄、模型預算、Hermes 遷移、Agentic RAG、Coding Agent 分工、重啟事件、Ouroboros、瀏覽器本地推論等基礎。本期不整篇重寫它們，而是補錄尚未充分涉及的工具、工程限制與討論。

**證據規則：**本文查閱了部分 Repo 的官方文件，但轉貼的 Benchmark 或 Reddit 主張不會自動被視為本機實驗。部分原始貼文與截圖只能透過討論摘要或短網址追溯。本期記錄的是目前可取得的素材，並不宣稱已完整匯出每一段歷史對話。

## 本期內容

Agent Harness 與監督、Pi／Cindy／DSH／Paperclip、排程／Skills／Gateway、Qwen 與 32GB 模型邊界、DSpine／MTP／量化／Heretic、Evals、SAG2／Memorilla／Agentic RAG、電腦與手機自動化、網站 UX／0451／打孔卡，以及自主性、故障恢復與下一階段測試。

---

## Agent Harness、委派與營運

### 01. Coding Agent Harness 全面比較

研究範圍包含 Codex CLI/App、Claude Code、OpenCode、Pi Coding Agent、Aider、Cline、Roo Code、Goose、OpenHands、Gemini 等。核心要求是**比較 Harness 本身**，而非各工具預設使用的 LLM。即使透過相容 API 或 Proxy 接同一模型，工具呼叫、上下文壓縮、權限、Patch、沙盒、擴充與執行紀錄仍會不同。

正確的對照要固定模型、測試題、Repo、工具權限和評分標準，紀錄完成率、測試、耗時、峰值記憶體、Token、工具錯誤、人工修正與重啟恢復。輕量 CLI 可能省資源，但不代表自主完成率更高；大型工作空間可能較安全，但有額外成本。本站尚未完成整套相同模型的實測排行。

來源與原始討論連結: [1](https://github.com/awesome-opencode/awesome-opencode)

### 02. Hermes、OpenClaw 與消失的子代理時間線

Hermes 的真正痛點不是已證明委派失敗，而是主代理說子任務正在執行時，無法清楚看到 Worker 的當前動作。主要操作入口是 Telegram，GUI 也未滿足完整可觀察性的需求。因此開始研究 OpenClaw 與 OpenCode，主因是操作體驗，不是已用同一模型證明哪個較快。

系統應保存持久 Task ID、Parent 關係、時間、目前工具、錯誤、完成證據與成果。**已請求、已委派、已啟動、已完成、已驗證**必須分開。主代理回答「完成」不等於真的成功。網站已刊登 Harness 遷移和 11 月 8 日事件文章；這裡新增的是每個子代理都必須可追蹤的監控需求。

來源與原始討論連結: [1](https://erictung1007.github.io/portfolio/#/writing/hermes-to-openclaw) · [2](https://erictung1007.github.io/portfolio/#/writing/incident-november-8)

### 03. Cindy、Alma 與 DS Bot：便利性和控制能力

分享的遷移心得把 DS Bot 定位為偏工作場景的工具，Alma 是功能很強卻有 UX 問題的工具箱，Cindy 則偏向較完整的個人 Agent 體驗。討論聚焦多角色、記憶隔離、手機介面、子代理可視性及真正開源的範圍。

Cindy 公開客戶端 Repo 提到 Pi、Codex、Claude Code 整合、桌面與手機版本、排程、多代理及本機免登入模式，也區分需要伺服器服務的能力。**客戶端開源不等於整個後端都可自架。** 評估應確認離線功能、帳號需求、不同角色的記憶隔離、背景工作可見性與雲端依賴。對廠商信任邊界保持審慎是合理偏好，但不是惡意證據。

來源與原始討論連結: [1](https://github.com/makecindy/cindy)

### 04. Pi Coding Agent、Pi Bot 與 iOS Companion

你曾問 Pi Bot 與 Pi Coding Agent 是否同一套工具、維護者是否相同，以及有沒有官方 iOS App。終端 Coding Agent、建立在其上的 Bot、手機客戶端，不會因為都叫 Pi 就成為同一產品，必須確認作者和實際程式。

Pi 生態有非官方的手機 Companion，也有人研究 iPhone 本機執行。前者通常由 Mac 上的小型服務讀取 Session 並透過 RPC 互動。對 Minerva’s Den，真正需求是**在 iOS 查看與控制 Mac 上正在工作的 Session**，不一定需要手機再執行一套 Coding Agent。具認證、預設唯讀、可檢視日誌的 Viewer 更符合當前需求。

來源與原始討論連結: [1](https://www.reddit.com/r/PiCodingAgent/s/fTRepTV23F) · [2](https://github.com/badlogic/pi-mono) · [3](https://github.com/MRL-00/pi-mobile) · [4](https://github.com/dannote/pi-ios)

### 05. DSH Superagent 與可追蹤的工作單

DeepSeek 的 DSH Superagent 是研究原型，不是已成熟的自主企業系統。它接收獲授權的 Repo 工作，建立 Work Item，在獨立 Session 與目錄執行，再把結果回報原對話，可能是一個 PR。官方也提醒研究論文中的部分高階構想未必已在公開原型實作。

值得借鑑的是**請求 → 任務日誌 → 受限執行 → 測試證據 → 交付成果**。Supervisor 必須負責審核、重試、冪等性、Worktree 隔離與升級決策。只靠 Prompt 寫「自主工作」無法取代這些機制。32GB 機器上的 Worker 並行數，也應由記憶體預算決定，而不是組織圖。

來源與原始討論連結: [1](https://github.com/deepseek-ai/dsh-superagent-prototype)

### 06. Paperclip 是管理層，不是自動讀取其他子代理的 Viewer

Paperclip 官方功能包含目標、組織圖、Task Thread、Heartbeat、預算、審核、排程與執行歷史。你問過能否**只用它當 Viewer**，看見已在其他 Harness 執行的子代理。這取決於事件整合：Paperclip 需要任務事件或 Agent Adapter，不能僅憑 Hermes 或 OpenCode 有子程序就讀懂它的狀態。

代價是更完整的管理層，外加服務、儲存與設定成本。若原需求只是觀看子代理目前使用的工具、最新輸出與結果，簡單的事件串流 Viewer 可能更省資源。正式採用前必須確認啟動、進度、取消、失敗、恢復與完成事件都能對應真實執行。

來源與原始討論連結: [1](https://github.com/paperclipai/paperclip)

### 07. Agent Office、Swarm 與真實委派證據

Agent Office 與 Swarm Site 讓多代理看起來更容易理解，但你反覆強調並不需要和每個子代理聊天，而是要**像看主代理一樣看它工作**，甚至能從 Telegram 觀察。虛構的辦公室角色走動，不能當成執行證據。

系統應保存 Parent Task、Worker ID、目前動作、Tool Event、Diff 或 Artifact、時間與錯誤狀態，再由網頁或 Telegram 呈現相同的執行紀錄。先做到真實事件流，再考慮遊戲式展示。

來源與原始討論連結: [1](https://califa.github.io/swarm-site/)

### 08. 專業 Agent、CEO 彙報與上下文預算

你希望將 Planning、Implementation、Design、獨立 Review 和 QA 分工，由 Manager 統籌。但也問過兩位 Overseer 向 CEO 回報時，若總上下文超過模型容量怎麼辦。正確解法是**結構化交接**，不是把所有逐字稿無限制拼接。Worker 應回報修改檔案、決策、測試、障礙、完整日誌索引與有界摘要。

小型本地模型使用多代理不一定比較好，因為每次交接都增加 Prompt、等待與誤解風險。應在相同任務、測試與記憶體限制下，比較單一 Coding Agent 和角色協作。原有專文已談分工，這裡補上有界摘要與彙報規格。

來源與原始討論連結: [1](https://erictung1007.github.io/portfolio/#/writing/specialized-coding-agents)

### 09. 三項 Cron Job 與 OpenCode 執行連續性

遷移計畫明確只保留 Hermes 的三個任務：Feza 求職、Eric 求職、Minerva’s Den 技術偵察，其餘重複排程不搬。你要求 OpenCode 自己執行，也詢問是否存在原生 /schedule。當時討論的方案是 macOS launchd 呼叫 Headless OpenCode，但現存紀錄不能證明三個工作都完成遷移。

排程與實際執行是兩個問題。可靠系統需有 Job ID、最後嘗試與成功時間、Exit Status、成果與重試政策。原生排程功能要依已安裝版本確認，不能猜測。並行模型任務則要使用記憶體限制與互斥 Lock。

### 10. Anthropic Skills、Superpowers、Karpathy 與 Awesome OpenCode

研究的 Skill 生態包含 Anthropic 式 Skills、obra Superpowers、Karpathy autoresearch、Awesome OpenCode Agents 和 Awesome OpenCode 目錄。Skill 是工作程序與參考內容封裝；另一個 Worker Agent 則有自己的執行狀態與權限，兩者不同。Superpowers 重點是規劃、除錯、Review 與完成前驗證，不是直接讓模型變聰明。

你曾要求大量推薦下載，也明確排除 Tavily。一次安裝所有熱門 Skills 可能造成小模型上下文負擔與維護成本。更好的方式是有版本、按任務載入並量測錯誤率、Token 和修正輪數。Karpathy 的自動實驗流程，應與 Ouroboros 模型修改構想區分。

來源與原始討論連結: [1](https://github.com/obra/superpowers) · [2](https://github.com/awesome-opencode/awesome-opencode) · [3](https://github.com/karpathy/autoresearch)

### 11. FreeLLMAPI 與共享雲端備援

你研究過 FreeLLMAPI v0.16.20 的免費與付費差別。它是可自架的 OpenAI 相容 Provider Gateway，提供速率限制、Fallback、模型路由與 Coding Agent 整合工具，**不是**本地基礎模型。單一 Gateway Key 不會讓所有上游服務變成免費、無限或離線。

對 Minerva’s Den，它可作為本地模型處理不了的任務之雲端備援。真正要測的是 Fallback 是否讓完成率提升到足以抵銷憑證、服務維護、供應商限制與額外延遲。付費和模型清單應以目前版本為準。

來源與原始討論連結: [1](https://github.com/tashfeenahmed/freellmapi/releases/tag/v0.16.20) · [2](https://github.com/tashfeenahmed/freellmapi)


## 本地模型、加速與評估

### 12. Qwen3.8 27B Turbo、權重大小與實際記憶體

轉貼消息宣稱 Qwen3.8-27B Turbo 檔案約 11.67GB、256K 上下文和寬鬆存取，但這些是**待核對的宣傳主張**，不是 Mac mini 實測。模型檔案大小只是 Runtime 佔用的一部分；Cache、Activations、Buffer、OS、工作長度與並行任務都會競爭 32GB 統一記憶體。

「能載入」不等於「能穩定執行自主工作」。應量測 Prefill 延遲、持續生成、Tool Schema、記憶體壓力出現前的上下文與完成任務耗時。網站早前一筆 4,096 輸入、128 輸出測試記錄 64.0 Prompt tokens/s、11.1 生成 tokens/s、峰值 19.4GB，但只適用那次配置，不能推到所有 Qwen 版本或 256K 上下文。

來源與原始討論連結: [1](https://erictung1007.github.io/portfolio/#/writing/local-inference-32gb)

### 13. oMLX、TurboQuant、MLX 與 GGUF 是不同層次

Minerva’s Den 的核心規格是 oMLX 搭配 TurboQuant，也比較過 MLX 與 GGUF 權重。這些不是可互換的名稱：模型架構、序列化權重、量化方式、Cache 表示與推論後端都有不同的相容性要求。較小的模型檔案仍可能造成很高的運行記憶體與首 Token 延遲。

評估矩陣應記錄 Checkpoint、量化、Runtime 版本、Attention／Cache 路徑、實測上下文、速度、記憶體及 Tool Call 正確性。真正要優化的是**每 GB、每分鐘的任務成功率**，而非比下載大小。若任務卡住或無法輸出合法工具格式，理論最大上下文沒有實用價值。

### 14. DSpine、DFlash2、MTP 與 Draft 成本

DSpine Repo 描述平行 Speculative Draft，並提供 MLX／Apple Silicon 支援與 Qwen3.8-27B 相關路徑，因而比僅限 CUDA 的方案更貼近這台機器。但**DSpine 自身 MLX 套件支援，不代表 oMLX 可直接相容**。Draft 的接受結果必須足以抵銷 Draft 與驗證成本，才會加速。

你曾比較 DFlash 和 Lightning／MTP 類方法，關心 Draft 自己的 KV 或狀態 Cache 是否吃掉過多記憶體。這取決於架構、接受長度、驗證 Batch、Prompt 與 Runtime。官方最高倍數不能直接套到 M4。

應在相同輸入輸出下比較普通 Decoding 與推測解碼的端到端耗時和峰值記憶體，包含 Cache 成長與失敗情況。

來源與原始討論連結: [1](https://github.com/tencent/dspine)

### 15. Unsloth Dynamic V3.1 與 Benchmark 百分比

一則消息宣稱 Qwen3.8-Flash-Next 的 Unsloth Dynamic GGUF，在 Terminal Bench 等程式代理測試提高超過 15%。這類百分比必須有精確 Baseline、量化、硬體、資料集與評分方法才能解讀。不同工作負載對量化位元配置的反應也可能不同。

GGUF 的成績不能直接搬到 MLX／oMLX。對照應固定 Checkpoint、量化類型、上下文、工具 Parser、權限和測試集。在原始方法尚未完整核查前，這是研究線索，不是 Minerva’s Den 已得到的加速或準確率。

來源與原始討論連結: [1](https://huggingface.co/unsloth)

### 16. Heretic、Abliteration 與修改拒答行為的代價

你多次要求找五個以上 Qwen 27B 的 Heretic／Abliterated 候選，直接對照原版，目標是減少不必要拒答，同時不能「切掉」推理、Coding 與 Tool Calling。這是實證需求，不是追求「無審查」宣傳標籤。

修改拒答相關行為，也可能改變校準或指令遵循。應用精確 Checkpoint、相同 Backend 和上下文，測良性請求、Coding、Tool Schema、多步計畫與幻覺，並公開退步案例，而不只統計拒答率。網站既有模型自由文章已談原則，欠缺的是可重現的同負載比較。

來源與原始討論連結: [1](https://erictung1007.github.io/portfolio/#/writing/models-quantization-freedom)

### 17. ZeroZero、Heretic2 與誇張的混血模型傳聞

Reddit 貼文描述以 Heretic2 修改 Qwen3-8B 得到的 ZeroZero，在 32GB Mac 與自製 Harness 的複雜 Tool Call 表現驚人。另一篇流傳消息則宣稱有極小型 DeepSeek/Qwen「混血」模型，並有驚人拒答統計。兩者都應視為值得追查的假設，**不是已獨立重現的事實**。

表現可能來自權重、Prompt、Tool Parser、Harness 重試或測試集挑選。「混血」名稱無法證明權重來源、訓練方法或保留完整能力。要先查 Model Card、Base Model、修改方式與獨立評估，再做本地對照，不能只因拒答率下降就賦予真實工具權限。

來源與原始討論連結: [1](https://huggingface.co/LastMachine/Qwen3-8B-ZeroZero-Heretic) · [2](https://www.reddit.com/r/LocalLLM/s/wWaEATHZ9Y)

### 18. 小模型、LFM3 與嚴重重複輸出故障

網站瀏覽器本地助手曾有嚴重重複生成問題，輸出看似自信卻無法回答。後來研究新的微型 Qwen、縮短檢索上下文、Non-thinking 取樣和串流重複保護。Mac mini 的 oMLX 工作與網站 WebGPU 聊天室是兩種不同部署。

你問過 LFM3 1.7B 與大得多的 Qwen 表現差距；對網站而言應測 CV 事實回答、Grounding、結構化工具格式、重複率、首 Token 延遲與裝置支援。已知答案存在可信資料時，直接檢索比依賴不穩定生成更好。Fallback 絕不能虛構履歷。

來源與原始討論連結: [1](https://github.com/EricTung1007/portfolio)

### 19. Evals 需要任務證據，不是精彩截圖

你分享的 Eval 解說強調模型軟體會產生流暢卻不一致的結果，因此需要可重複測試。Minerva’s Den 的測試集應包括有已知證據的檢索、合法 Tool Call、以 Test 評分的程式修改、長時間委派、Timeout／重啟恢復與 Prompt Injection。每輪保存模型、Harness、量化、輸入、標準答案、Trace 和資源占用。

記錄含不確定性的通過率、錯誤分類、耗時、Prompt 成本、峰值記憶體、工具錯誤與人工介入。單次 Demo 看起來快不代表長時間自主工作更可靠。對 32GB Mac 而言，每分鐘、每 GB 完成的有效任務更值得追求。


## 檢索與知識基礎架構

### 20. SAG2、SAG Wiki 與無 Embedding 的真正意義

SAG2 的宣傳稱「RAG 死了」，因為不需先為本地文件計算 Embedding。官方技術文件的描述更具體：原始文字切段，以 SQLite FTS5 索引；BM25 找候選；JEV 判斷證據價值；高分段落再提供字詞做多跳檢索。

這仍是**檢索增強**工作，只是改變 Retrieval 機制，不是取消 RAG。建立索引不用 Embedding，不代表沒有索引、沒有模型成本或完全沒有外部呼叫；官方說明指出 JEV 有 Service Call。應在同一文件庫比較 BM25、SAG2 類多跳及 Hybrid RAG，量測證據 Recall、引用、更新成本、延遲與離線邊界。

來源與原始討論連結: [1](https://sag-wiki.zleap.com/en/docs/sag2) · [2](https://zleap.ai/en/technology/sag2)

### 21. Memorilla、壓縮記憶與來源可追溯性

Memorilla 討論的是將大量文件壓縮成極少量記憶，提供給凍結的 LLM。它與一般 RAG 不同，核心問題是：可否透過學習式壓縮，在未來問答時保留有用事實，而不必每次檢索完整段落？

問題在於來源可追溯性。壓縮表示可能幫助記住內容，卻難以指出日期、引句或爭議主張的原文位置。研究實作也可能依賴 Linux／CUDA，而非 Mac 的 MLX。應與一般來源檢索比較正確率、多跳推論、引用、增量更新與資源成本。

來源與原始討論連結: [1](https://github.com/snap-stanford/memorilla) · [2](https://www.reddit.com/r/singularity/s/2nvPi5AEpt)

### 22. Agentic RAG：改寫、重查與停止條件

Minerva’s Den 明確需要多次搜尋、改寫問題與 Multiple Queries。欠缺的是判斷迴圈：發現來源不佳、資料矛盾、匹配錯誤、過時或缺乏原始證據時，才決定是否重新搜尋。查更多次不保證答案更好。

可靠流程要保存問題、競爭假設、來源、Evidence Ledger、Query Rewrite 歷史與停止預算，也要區分同一原始說法的多次轉載與真正獨立查證。先前的 Agentic RAG 專文已談願景，這裡補充**何時應重查、什麼證據足以改變結論**。

來源與原始討論連結: [1](https://erictung1007.github.io/portfolio/#/writing/research-agenda-agentic-rag)

### 23. Mantis 與增量網頁觀察

你轉貼的瀏覽器 Agent 說明稱其為 Mantis，特點是將頁面轉成帶編號元素，操作後只回傳變更部分，減少長時間網頁工作的重複觀察 Token。當時提供的段落沒有精確 Repo 網址，而 GitHub 存在數個完全不同的同名 Mantis，不能隨便指向其中一個。

值得研究的機制是穩定 Element Reference 與增量 DOM／Accessibility State。可量測每次成功操作的觀察 Token、Reference 過期錯誤、動態頁面、純視覺元素及權限限制。文字視圖在有語義結構時很有效，但可能漏掉以畫面表達的資訊。


## 電腦操作與開發工具

### 24. Vercel agent-desktop 與 Accessibility Computer Use

Vercel Labs 的 agent-desktop 是 CLI／函式庫，不是模型或獨立 Agent。它讀作業系統的 Accessibility Tree，提供可操作元素的 Reference，讓上層 Agent 執行 Observe、Act、Verify。官方文件列出 macOS、Windows、Linux 支援。相較截圖猜座標，語義式操作可能減少上下文浪費並提高命中率。

但 Accessibility 權限強大、部分 App 的樹不完整，而且 Snapshot 可能包含私人文字。Harness 應限制可操作 App 和動作、操作後再觀察，並遮蔽敏感 Trace。仍應用相同任務與截圖式方案比較速度、成功率與錯誤型態。

來源與原始討論連結: [1](https://github.com/vercel-labs/agent-desktop)

### 25. Poki：操作真實 iPhone 與遠端查看 Agent 的差別

Poki 官方文件描述利用 Mac 端設定與裝置準備，使 Agent 操作真正的 iPhone。這是擴大 Tool Action Surface，**不是**只在手機查看 Mac 上 Terminal Agent 的進度。

最有價值的實驗是狹窄的 iPhone 網站迴歸測試：打開頁面、找控制元件、操作、驗證結果並保留證據。裝置授權、OS 權限、網路、日誌與故障恢復都會增加成本。手機操作成功也不能直接推論適合無人值守。

來源與原始討論連結: [1](https://github.com/JosssphZhou/poki) · [2](https://poki.bot/docs/install)

### 26. Henge 與能啟動、能實用之間的差距

你看完 Henge 消息後問的是很實際的問題：在 iOS 上跑 macOS，是勉強能用還是只是技術展示？Henge 嘗試以相容層與 Emulator 元件在 iPhone／iPad 上執行 macOS。但能成功啟動，和能連續幾小時跑需要的 App，是不同等級。

應量測開機、輸入延遲、App 相容、瀏覽器反應、記憶體、發熱、電量及 Crash。即使手機能執行 macOS，也不會自動有 Mac mini 的統一記憶體容量。要遠端操作 Minerva’s Den，具認證的薄型 Viewer 很可能比把完整工作站複製到手機更有效率。

來源與原始討論連結: [1](https://github.com/Leviidev/Henge) · [2](https://www.kocpc.com.tw/archives/702552)

### 27. Umless 與本地語音整理

你分享了 Umless 的本機口述工具，它會整理停頓、口頭禪與改口，再把文字輸入目前游標。其流程將 Speech Recognition 與 LLM Cleanup 分開，各等級的模型容量與語言支援不同；轉貼中的 678MB Lite 以英文為主。

對 Minerva’s Den，口述可以成為本地研究或下達 Agent 指令的入口。但整理過的轉錄文字**不等於已授權的工具命令**。應測辨識錯誤、意圖保留、整理延遲、麥克風權限與閒置記憶體。過度積極的 Cleanup 可能改變命令意思，重要操作仍須確認。

來源與原始討論連結: [1](https://github.com/jatinbishla/umless)

### 28. Ghostty、Herdr、Orca 與多代理終端

Ghostty 以及與 Herdr、Orca、T3 類終端的比較，最後回到**工作流程可視性**。快速 Terminal Emulator 不會自己新增 Agent Planning 或 Delegation。多 Pane 介面能顯示 Session、狀態和 Diff，但必須對應真實程序才有價值。

可以評估使用者找到卡住 Agent 的速度、確認 Owner、查看工具與 Patch、重啟後重連，以及避免誤改其他 Session 的能力。介面應保留在 Terminal 工作的感覺，不應突然跳到無關頁面破壞沉浸感。

### 29. Meta Astryx 與適合 Agent 的 Design System

Meta 的 Astryx 是面向人與 Agent 共同開發的開源 React Design System，提供元件、主題、無障礙模式與自訂機制。問題不是要把 Minerva’s Den 已有的復古設計全部換成元件庫，而是能否藉此幫助 Coding Agent 在反覆修改時維持設計意圖。

值得研究元件內部可組合性、Token 一致性、Accessibility 與遷移成本。可讓 Agent 在有與沒有元件規範下做同一個 Dialog，比較視覺退步、重複 CSS、鍵盤操作與 Review 成本。網站的報紙及桌面仍應保留自身風格。

來源與原始討論連結: [1](https://github.com/meta/astryx)


## 網站、產品構想與工程理念

### 30. ERIC.EXE 六項互動工作站功能

網站討論選定六項有關聯的功能：互動桌面、短而可跳過的 Boot、可用的模擬 Terminal、升級的報紙、訪客成就和 12 列打孔卡。它們應該屬於同一個虛構個人工作站，而不是互不相干的 Gimmicks。桌面負責導覽、CV 資訊台提供可信內容、Terminal 路由安全命令、報紙刊登研究、打孔卡產生紀念品。

現有網站使用 Vite／React 與 Git-backed 雙語 Markdown，訪客進度可留在 Browser Storage。成功標準是**真正的互動與真實資訊**。每個裝飾物件都要連到實質內容，Accessibility 與可預期導航比華麗動畫優先。

來源與原始討論連結: [1](https://github.com/EricTung1007/portfolio)

### 31. 0451、上鎖抽屜與普通／金色打孔卡

你指出最重要的 UX 錯誤之一：訪客還沒輸入密碼，竟然就出現金色打孔卡。理想流程是閱讀 CV 時發現細微提示，再找到上鎖抽屜、電腦密碼或 sudo 式入口，輸入 **0451** 後才解鎖金卡。沒有找到彩蛋的人仍可獲得普通卡。

系統要有明確狀態：隱藏線索、發現線索、尚未驗證密碼、驗證成功、金卡解鎖。測試從乾淨 Storage 開始，確認普通卡可取得，然後發現提示、輸入密碼、驗證金卡只在成功後出現。錯誤的「已解鎖金卡」提示會同時破壞遊戲性與正確性。

### 32. CV 重複入口、跳頁感與可信 AI 回答

你指出 CV 與 Resume 兩個入口指向同一檔案沒有意義，使用 Terminal 時突然跳頁很突兀，而且小模型曾嚴重重複輸出。三者反映同一產品原則：消除重複操作、保持互動連續性，不要把不可靠的生成文字當成真實個人資料。

網站的 CV 助手是在訪客瀏覽器推論，和 Mac mini 的本地 oMLX 工作不同。已知履歷問題應用已驗證的結構化資料回答，LLM 整理失敗時回到可信證據。Terminal 應在原有介面呈現狀態變化，而不是讓訪客突然被傳送到另一個頁面。

### 33. 每期一篇完整綜合特刊，不是每週一個簡短工具介紹

第一批網站文章涵蓋架構、記憶體、Hermes 遷移、Agentic RAG、Coding 分工、重啟事件與 Ouroboros，卻漏掉大量你分享的 Repo、轉貼文章、模型傳聞和想法。後來你修正編輯政策：**所有尚未實質刊登的素材是輸入，每次只產出一篇有章節的完整綜合文章**。

這需要逐主題盤點和去重，而不是只挑最新、最吸睛的一條連結。每個題目都要保留原始網址、技術機制、適用性、限制與問題。即使你沒安裝某 Repo，也可以做技術介紹。每期長文都成為下一個星期五的去重紀錄。

### 34. 最小權限比模型國籍更重要

討論中反覆區分模型輸出文字，與 Harness、工具能執行的外部操作。沒有 Shell 或寫入權限的聊天模型，直接產生外部效果的能力遠小於擁有檔案、瀏覽器、Email 或部署權限的 Agent。這是重要的**能力區分**，但不代表所有模型文字都不會造成誤導。

安全設計應採最小權限、讀寫授權分離、重大操作審核、日誌遮蔽及把檢索文字當成不可信資料。不能只憑廠商來源推定惡意；應檢查權限、Telemetry、更新路徑與實際行為。模型可靠性仍重要，因為低品質代理可能誤用合法授予的能力。

### 35. 開放本地模型作為產品與市場策略

你提出免費本地模型可能已足以滿足一般使用者的網路搜尋、問答與簡單自動化，降低對訂閱服務的依賴。這是合理的產品假說與使用者自主偏好，**不是任何模型供應商動機已被證實的結論**。離線、隱私、邊際成本與可修改性，即使 Benchmark 不領先，仍可能有重要價值。

自架 Harness 讓人能在法律與外部服務已授權範圍內設計工作流程，但不表示可以繞過其他服務的存取控制。Minerva’s Den 可將模型自由、工具預算、真實評估與使用者自訂確認門檻結合。

### 36. Ouroboros 與不自欺的自主實驗

Ouroboros 的構想是讓 AI 搜尋更好的本地模型配置，或執行受限的權重修改，也可能由較強的規劃模型設計實驗。網站已刊登願景，因此這期補上驗收標準：不可變的 Baseline、固定測試題、運算預算、可重現日誌、Regression Tests、Rollback 與重大修改的人工審查。

小型特選 Benchmark 上的高分可能掩蓋一般能力退化。Agent 應提出可證偽的測試，不能自己改變標準後宣布變聰明。第一階段成果應是自動 Eval 與證據管線，而非不受限制的自我改寫模型。

來源與原始討論連結: [1](https://erictung1007.github.io/portfolio/#/writing/ouroboros-auto-experimentation)

### 37. 夜間重啟事件應轉化為恢復測試

11 月 8 日，OpenCode 與 OpenClaw 的工作在 Mac 重啟前後被中斷。既有文章已記錄程式短暫無回應、任務中斷與重啟後 oMLX 記憶體限制錯誤，並未確認根因。與其猜是哪個 App 造成重啟，不如改善恢復能力。

任務需要持久 ID、Checkpoint、資源紀錄、最後完成動作、重試與冪等寫入。你曾查詢 Hermes 排程卻沒有執行歷史，也說明連「到底有沒有執行」都不容易確認。可主動在任務中重啟代理，驗證只恢復一次，並能從手機看到完整時間線。

來源與原始討論連結: [1](https://erictung1007.github.io/portfolio/#/writing/incident-november-8)

### 38. 五項最值得優先做的實驗

剩餘問題可以轉為五項可重現研究。**一：**相同模型的 Harness 比較，分離模型與 Orchestration。**二：**M4／32GB 在不同量化、上下文與並行時的推論邊界。**三：**比較 BM25、多跳 Lexical 與 Hybrid RAG 的證據品質。**四：**從 Telegram 或 iOS 檢查子代理 Telemetry。**五：**測試網站 CV 可信回答、Terminal 連續性、0451、普通與金色打孔卡、手機閱讀與模型重複輸出。

每項都要保存原始問題、配置、假設、來源、執行方式、結果、資源與決策。「尚未測試」是可以接受的狀態。Minerva’s Den 的價值不在收集 Agent Logo，而是在小電腦上建立真正可查核、可量測的 AI 工作站。

---

## 編輯紀錄

本期是一篇附完整繁體中文譯稿的雙語特刊，共收錄 **38 個編號主題**、五大章，並在相應段落保留原始來源。網站原有十二篇英文文章保持不變。往後每週五發刊時，應逐項比對本期題目與來源連結，避免重複或遺漏。這是研究紀錄，不代表所有工具已安裝、已完成驗證或正式採用。
