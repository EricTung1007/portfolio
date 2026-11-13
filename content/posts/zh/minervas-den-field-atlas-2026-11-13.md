---
title: "AI Agent 是系統，不只是模型：本地 AI 技術與開源工具圖鑑"
date: "2026-11-13"
category: "Minerva's Den"
tags: ["Local AI", "Agent Systems", "Open Source", "Research Notes", "Engineering"]
---

2026 年 AI Agent 最值得研究的事情，已經不只是「模型會呼叫工具」。一個看似簡單的模型加工具迴圈，正快速演變成完整軟體生態：Coding Terminal、跨裝置 Companion、Agent 管理平面、桌面操作工具、記憶系統，以及新型本地推論引擎。

這些產品名稱背後，其實藏著幾個很值得回答的工程問題。Coding Agent 和通用 Agent 到底有多大差別？增加一層 Orchestration 能改善工作，還是只會增加開銷？32GB 的小電腦能不能跑出有用的本地研究助理，又不被自己的協調系統吃光資源？新冒出的開源專案，哪些提供真正有價值的技術機制，哪些只是一個好看的 Demo？

這份技術圖鑑以小型、Local-first 工作站的角度整理值得研究的工具與構想。文章依**技術問題**編排，不按連結出現的時間排列。每個主題都盡量形成可操作的結論，因為知道 Repo 是什麼，只完成了一半；知道什麼時候值得採用，才真正有幫助。

## Agent 的能力不只來自模型

### Coding Agent 本質上是擅長軟體工程的通用 Agent

Coding Agent 和通用 AI 助手究竟差在哪裡？答案可能比產品名稱暗示的還少。兩者基本上都在執行相同的迴圈：蒐集上下文、請模型決定下一步、呼叫工具、觀察結果，然後繼續。這個迴圈並沒有規定只能寫程式。真正造成差異的是包在模型外面的**執行環境與完成標準**。

Coding Agent 預設擁有 Repository、工作目錄、Diff、測試工具，以及明確的成功定義：修改必須能建置、通過測試。通用 Agent 則從瀏覽器、檔案、訊息、排程與各種 Connector 出發。它也能寫程式；Coding Agent 加上 Browser 和 API Tool，也能執行一般任務。**這是工具組與產品定位的差異，不是兩種完全不同的 AI 智力。**

同一模型放進不同 Harness，表現可能截然不同。上下文如何整理、命令如何執行、出錯時如何重試、Patch 如何產生、成果如何驗證，都會影響任務完成率。因此，公平比較應固定模型，改變 Harness，觀察哪個環境能以較少錯誤、較短時間與較少人工干預完成同一任務。

各類工具可以依預設用途理解：

| 類型 | 代表工具 | 主要價值 |
| --- | --- | --- |
| 終端導向 Coding | [Pi Coding Agent](https://github.com/badlogic/pi-mono)、[Aider](https://github.com/Aider-AI/aider)、[OpenCode](https://github.com/anomalyco/opencode) | 直接操作 Repo，介面相對精簡 |
| 整合式 Coding | [Codex](https://github.com/openai/codex)、[Claude Code](https://github.com/anthropics/claude-code)、[Cline](https://github.com/cline/cline)、[Roo Code](https://github.com/RooVetGit/Roo-Code) | 程式碼修改、審查、權限與開發流程 |
| 通用 Agent 環境 | [OpenClaw](https://github.com/openclaw/openclaw)、[Goose](https://github.com/block/goose)、[OpenHands](https://github.com/All-Hands-AI/OpenHands) | 跨應用工具、自動化及更廣泛的任務 |
| 協調與治理層 | [Paperclip](https://github.com/paperclipai/paperclip)、[DSH Superagent](https://github.com/deepseek-ai/dsh-superagent-prototype) | 分派、追蹤、管控 Agent 的工作 |

這些分類會互相重疊，但判斷原則很清楚：**挑 Harness 要看工具如何執行與驗收工作，而不是看它預設搭載哪個排行榜冠軍模型。** 在記憶體有限的機器上，以精簡 Coding Runtime 搭配通用協調層，通常比一個包辦所有任務的巨大 Agent 更容易維護。

### DSH 與 Paperclip 解決自主工作流程的不同半邊

假設要求 Agent 修復一個失敗的 Build。模型可能知道怎麼改，但可靠系統還得知道誰授權工作、修改該放在哪裡、中途崩潰怎麼恢復、何時才值得通知人。兩個開源專案分別處理了不同層次的問題。

[DeepSeek 的 DSH Superagent 原型](https://github.com/deepseek-ai/dsh-superagent-prototype) 以單一 GitHub Repo 為核心，把授權請求建立成 Work Item，分配獨立的 Agent Session 和工作目錄，完成後將成果送回原本的對話，例如 Pull Request。它的設計重點是盡量減少不必要的人工打斷，只在需要決策或成果已可使用時回報。真正值得學習的不是一段 CEO Prompt，而是把工作當成**有身分、可持續追蹤的任務**，而非轉瞬即逝的聊天回合。

[Paperclip](https://github.com/paperclipai/paperclip) 則位於更上一層。它以 Node.js Server 與 React UI 管理目標、Agent、匯報階層、預算、Heartbeat、Task Hierarchy、審核與執行歷史。實際工作由外部 Adapter 連接 Coding Agent、Shell 或其他 Runtime 執行。當多個 Agent 需要協同與預算治理時，Paperclip 更像一個營運控制平面。

兩者的分界很重要。Paperclip 雖能管理外部 Agent，卻不會自動讀懂任何不相關子程序；Worker 必須透過 Adapter 或整合提供真實狀態。DSH 則示範了 Work Item 架構，但公開程式是以特定 GitHub 流程為主的研究原型。

我的選型結論是：**先借鑑 DSH 的可追蹤工作流程；當多代理治理真的成為瓶頸，再導入 Paperclip。** 若只是想看幾個 Worker 正在做什麼，接上真實 Tool Event 的唯讀時間線，會比建立一間完整的 AI 公司更合理。

### Cindy、Pi 與跨裝置 Agent Companion 的新方向

只存在 Terminal 裡的 Agent 可能很有能力，卻不一定適合每天使用。[Cindy](https://github.com/makecindy/cindy) 從跨裝置產品的角度處理這件事。其公開客戶端涵蓋桌面與手機，整合 Claude Code、Codex 和 Pi，並提供不同 Companion、記憶、Skills、Routines 與遠端電腦操作。官方 README 也區分了連回使用者電腦的功能，以及需要雲端同步服務的 Companion 功能。

這反映 Agent 產品的一個新層次：**同一個 Coding Harness，只要接上適當 Connector、身分、持久化與手機 UX，就能以通用助理的方式提供服務。** 替換底層引擎不會神奇地保留所有隱藏 Session State，但可以讓人維持相對一致的操作體驗。

[Pi Coding Agent](https://github.com/badlogic/pi-mono) 則位於另一端：精簡、可擴充、以終端為主。其 Agent Loop 與 Session 介面可讓外部工具建立 Wrapper、Bot 或遠端介面。社群推出的 Pi 手機客戶端或 Bot 即使使用相同引擎，也不一定是原維護者的官方產品。真正需要區分的是「在手機執行 Agent」和「從手機查看電腦上的 Agent」。後者往往用具認證的輕量 Companion 就能做好，不需要再執行一套本地模型。

Cindy、Alma、DS Bot 的比較，真正值得帶走的不是誰的功能清單最長。好的 Companion 必須讓桌面與手機之間的動作、狀態、權限和歷史都容易理解。

對 Local-first 系統，我更傾向**透明、精簡的 Runtime 加上好的遠端介面**，而不是單純因為某個大型 Agent Framework 有 iOS App 就全部遷移。

## 讓 Agent 看得見、動得了

### Mantis：不要讓 Agent 每次都重新閱讀整張網頁

瀏覽器自動化有個昂貴習慣：Agent 點完一個按鈕，常常又收到整頁大量文字，但其中大多數內容上一回合已看過。[Perzian 的 Mantis](https://github.com/perzianhq/mantis) 正是針對這個浪費設計的。它把瀏覽器內容轉成精簡的編號文字，讓 Agent 依 Reference 操作元素，點擊後只回傳變化，而非每次都塞入整頁。工具同時提供 MCP Server 與 CLI 介面。

這不只是把網頁轉成文字。穩定的 Element Reference 讓 Agent 可以指定「點擊第 3 個控制元件」，增量回應則告訴它點擊後變了什麼。於是模型不必每次重新理解導航列、Cookie Banner 和完全沒有變動的內容。Mantis 官方的長任務測試，在其中一組模型配置下，對照 Playwright Accessibility Tree，報告的輸入 Token 中位數是 **244k 對 345k**，耗時中位數是 **42 秒對 66 秒**。這是專案在特定測試集上的結果，不是所有任務都會得到相同加速。

對持續閱讀文件、跟連結、交叉查證的 Research Agent 而言，減少重複觀察非常有吸引力。缺點也很明確：需要視覺排版、圖片或自訂 Canvas 的任務，純文字可能無法呈現全部資訊；動態頁面變更時，也必須安全更新 Element ID。

**最重要的概念是增量觀察。** Agent 需要知道「和上一個狀態相比改變了什麼」，而不是不斷收到整個世界的副本。這個思路同樣適用於 Log、Git Diff 和桌面操作工具。

### agent-desktop：讓桌面 Accessibility Tree 成為操作 API

[Vercel Labs 的 agent-desktop](https://github.com/vercel-labs/agent-desktop) 處理的是相鄰的問題，只是操作範圍從網頁延伸到作業系統桌面。它不是每一步都讓 Vision Model 看截圖猜像素，而是讀取 App 的 Accessibility Tree，把按鈕、輸入框等元素表示成 JSON，並提供可操作的 Reference。Agent 能先觀察、點擊指定 Reference、讀取新狀態，再決定下一步。它本身是 CLI 與 C Library，**沒有內建模型**。

官方安裝方式是 `npm install -g agent-desktop`；`agent-desktop status` 用來檢查平台狀態，`agent-desktop permissions --guide` 則協助設定 macOS Accessibility 權限。macOS、Windows、Linux 都有各自的 Adapter。核心價值是讓原生 App 已經具備的語義結構，直接成為 Agent 可使用的工具，而不必從畫面外觀重新猜測。

Mantis 與 agent-desktop 不是互相取代，而是互補。前者針對瀏覽器及網頁狀態差異，後者使用 OS Accessibility 介面接觸桌面 App。兩者都仰賴介面有清楚且穩定的控制元件語義。

Accessibility 權限很強，必須限制。能點擊按鈕，也代表可能執行破壞性操作；Snapshot 甚至可能包含私人視窗文字。因此 Harness 應限制可操作程式、每次操作後驗證結果，並避免隨意將桌面日誌傳送到外部服務。

對 Mac 本地工作站而言，**結構化桌面控制值得優先於全截圖式自動化嘗試**，尤其是一般表單、設定與重複 UI 操作。當 Accessibility Tree 不足時，再退回視覺方法。

### 手機作為操作端點：Poki、Henge 與 Umless

手機端工具其實代表三條非常不同的路線。[Poki](https://github.com/JosssphZhou/poki) 讓 AI Agent 透過本地整合與 MCP 類型工作流程操作真正的 iPhone。它是**操作手機的工具**，不是單純顯示 Mac Agent 狀態的 Dashboard。官方安裝涉及裝置授權和手機端設定，因此非常適合用來研究 iOS UI 自動化。例如在真機開啟網站、點擊控制元件，再檢查結果是否正確。

[Henge](https://github.com/Leviidev/Henge) 選擇另一個方向：直接在 iOS／iPadOS 上模擬 macOS。它自行實作 ARM64 JIT、記憶體管理模擬，並透過 Metal 重播圖形命令。官方 README 報告在 iPhone 17 Pro 上約 15 秒抵達 macOS 鎖定畫面，但安裝需要大型 macOS 映像檔、JIT 條件，而且 Guest Memory 有上限。這證明的是**技術可行性**，不是手機已能取代 M4 桌面電腦。對重型本地 LLM，遠端連線到真正的 Mac 仍比較合理。

[Umless](https://github.com/jatinbishla/umless) 則把語音當成輸入設備。它在本地轉錄語音，清理停頓、口頭禪和改口，再把整理後的文字輸入游標。對寫作很有用，但如果拿來對 Agent 下命令，句子被整理時也可能改變操作意圖。重要行動應先顯示整理後的命令，讓人確認。

[Ghostty](https://github.com/ghostty-org/ghostty) 以及多 Session 的 Agent Terminal 解決的是另一面：如何清楚顯示執行狀態。快速 Terminal 並不是 Agent 的大腦；切成很多 Pane 也不代表子代理真的有進度。真實 Run ID、Tool Log 與中斷後可重連的 Session，比視窗動畫更重要。

所以選擇其實很清楚：**要查看 Mac 工作狀態，用 Remote Companion；真的要控制 iPhone，用 Poki；想研究模擬系統，用 Henge；想提高人類輸入效率，用本地語音。** 這四種能力不能混為一談。

## 32GB 裡真正裝得下什麼？

### 模型大小是資源預算，不是下載數字

小型電腦讓「推薦模型」這件事有不同意義。Mac mini M4 的 32GB 統一記憶體，不只供模型使用；macOS、KV Cache、Agent Runtime、檢索服務和其他 App 都會競爭同一資源。高度量化的 27B Checkpoint 可能比原始精度的權重小很多，但**能載入權重，不等於能完成有用工作**。

至少要分開四個層次：**Weights** 儲存參數；**KV 或循環狀態**與架構及上下文有關；**Runtime Buffer、Activation** 額外使用記憶體；**並行請求**又可能複製部分成本。量化可以縮小權重，卻不一定同比例縮小其他開銷。GGUF 與 MLX 也不是互相通用的 Backend；TurboQuant 類 Cache 最佳化若 Runtime 沒有實作，也不會憑空生效。

過去一筆 Python Coding 工作負載，輸入 4,096 Token、生成 128 Token，記錄約 **64 Prompt tokens/s、11.1 Generation tokens/s、64 秒首 Token 延遲、19.4GB 峰值記憶體**。這組數字真正值得注意的是延遲：如果 Agent 每一步都重新提交長上下文，多回合工作會比表面上的生成速度慢得多。

Qwen3.8-27B Turbo、Flash-Next、新一代小型模型，以及 LFM3 等不同架構都值得追蹤。但下載檔案大小和理論 256K Context，都沒有回答「整套 Agent 到底能否正常完成工作」。系統需要留出其他服務的記憶體、足夠的 Prompt 處理速度，以及穩定的工具格式。

**最值得優化的指標是每分鐘、每 GB 記憶體完成多少已驗證任務。** 按這個標準，更小的模型搭配好的 Retrieval 與精簡 Harness，可能比把記憶體塞滿的大模型更有用。

### DSpine：先打草稿，真的比直接等待更划算嗎？

一般自回歸解碼是逐 Token 生成。Speculative Decoding 嘗試減少這個序列成本：由較小或專門設計的 **Drafter** 先預測一段 Token，再由 Target Model 以較平行的方式驗證。當足夠多的 Draft 被接受，就可能加快輸出，同時保留 Target Model 所決定的結果分布。

[騰訊的 DSpine](https://github.com/tencent/dspine) 特別之處，在於多個位置平行 Draft，並沿網路深度傳遞預測特徵，以保留因果依賴。專案文件列出 Qwen 類 Target，還提供自己的 `dspine_mlx` Apple Silicon 實作與可選的 SGLang-MLX 整合。這至少讓 Mac 使用者有實際測試路徑，而不只能看 CUDA 展示。

然而，**Drafter 本身也要付成本**。它需要運算、可能有自己的 Cache，還要吃額外記憶體。Prompt 越長，接受率可能改變；如果大多數 Draft 被拒絕，預期加速就可能消失。因此與 DFlash2、MTP Head、Lightning 類方法比較時，應看接受長度、總耗時、記憶體與 Backend 相容性，而不只看某個漂亮設定下的 tokens/s。

對 M4 真正的問題是：DSpine 的 MLX 路徑，能否在不擠掉其他服務的前提下，改善 Agent 整體工作速度？它有自己的 MLX 實作，**不代表能直接套進 oMLX**。

**DSpine 值得列入測試，而不是直接成為預設配置。** 若能證明它在可接受峰值記憶體下提升端到端任務吞吐，才有正式採用的理由。

### 量化與移除拒答，是兩種不同的品質問題

模型改造常把兩件不相干的事混在一起：一是壓縮 Checkpoint 節省記憶體，二是修改模型降低拒答傾向。這兩種改造需要不同評估。

[Unsloth 的 Dynamic Quantization](https://huggingface.co/unsloth) 研究如何對不同權重分配不同精度，而非全部一視同仁。效益應在**相同記憶體預算**下、相同 Backend 和 Coding／Retrieval 任務中比較。宣傳中 Terminal Bench 改善多少百分比，不會自動成為 oMLX 的實測收益，尤其當發布的是 GGUF 而非 MLX 格式。

Heretic 與 *Abliteration* 類改造，則試圖改變和拒答相關的行為。模型可能變得更願意回答，卻同時降低推理、結構化 Tool Call 或遵守限制的可靠性。[ZeroZero 是基於 Qwen3-8B 的社群修改版本](https://huggingface.co/LastMachine/Qwen3-8B-ZeroZero-Heretic)，因有人宣稱它在複雜 Tool Use 表現極好而受到注意。這值得測試，但不能證明「解除護欄必然讓模型變聰明」。宣稱把 DeepSeek 和 Qwen 混成極小模型的消息也一樣，必須先查 Model Card 與訓練來源。

因此應有**三份獨立成績單**：真實 Coding／檢索任務的能力、記憶體與延遲、在特定 Prompt 下的回應和拒答行為。一份成績不能代表另外兩項。Checkpoint ID、Backend 版本與測試案例，比「Turbo」「Uncensored」這些名稱重要得多。

我認為最穩健的原則是：**保留原版模型作為比較基準**。如果候選模型雖然省記憶體、拒答變少，卻破壞工作必需的 Tool Calling，它就不是進步。

### 微型模型暴露了 Benchmark 容易忽略的失敗

個人網站的 AI 助手，很適合用來理解為何模型分數不等於產品品質。瀏覽器小模型可能嚴重重複輸出、讀錯檢索證據，或對 CV 問題自信地編出不存在的內容。訪客看到的是失敗，不會因為模型數學 Benchmark 很高就覺得它比較好。

對需要回答個人事實的助手，有一個直接且可靠的架構：先檢索已驗證資料；若資料直接回答問題，就以 Deterministic 方式顯示答案。只有需要解釋與整理時才使用可選的生成。若輸出開始無意義重複或破壞預期格式，就停止生成，改用可信來源。這比要求一個微型 LFM3 或 Qwen 從權重自行重建個人履歷可靠得多。

同樣道理也適用於自主 Agent。模型 Benchmark 還應補上真實任務測試：Tool Schema 是否合法、引用是否正確、長 Context Prefill 耗時、是否陷入重複行動、Crash 後能否恢復，以及程式碼是否通過測試。每次替換 Harness 或量化方式，都要用**同一組任務**再測。

對網頁助手而言，**正確與合理處理失敗，比文字生成流暢更重要**。對 Coding Agent，對應的標準就是已驗證的 Patch，而非流暢描述「應該已經完成的工作」。

## 超越向量資料庫的知識系統

### SAG2 讓字詞檢索重新受到重視，但沒有殺死 RAG

向量搜尋幾乎成為 RAG 的代名詞，但這其實是分類錯誤。Retrieval-Augmented Generation 的意思是讓回答取得外部證據，並沒有規定證據一定要來自 Vector Database。

[SAG Wiki 採用的 SAG2](https://sag-wiki.zleap.com/en/docs/sag2) 就提供了具體替代方案。建立索引時保留原始文字，用 SQLite FTS5 建立全文索引，不必先生成 Embedding；查詢時由 BM25 找字詞候選段落，再透過 JEV Evidence Judgment 判斷哪些內容有助回答，並從有效段落提取線索，跨文件繼續搜尋。真正值得關注的是**由證據驅動的多跳檢索**，而不是「RAG 已死」這種口號。

這種架構適合含有精確代碼、專有術語、文件互相引用的知識庫。Lexical Search 建索引成本較低、容易除錯，也能回傳原始文字。弱點則是 Vocabulary Mismatch：文件明明講同一件事，卻沒有使用提問中的關鍵字。Judge 與 Requery 可以改善，但語義檢索仍可能互補。

部署時也要分清每個步驟在哪裡執行。本機建立全文索引，不等於後續 Evidence Judgment 必然完全離線；如果判斷階段需要 Service Call，資料路徑就不同。

**合理結論不是 BM25 和 Vector Search 必須決一死戰。** 精確證據先用透明的字詞檢索，缺少跨文件連結時重新查詢，遇到詞彙落差再加上語義搜尋。這比把 Embedding 視為整個 RAG 系統更有彈性。

### Memorilla 壓縮知識，卻不能取代可查證的證據

如果助手讀過幾百份文件，回答時卻只需要**16 個學習式 Memory Token**，會怎樣？[Stanford 的 Memorilla 研究](https://github.com/snap-stanford/memorilla) 就在探索這件事。新文件先由 Encoder 轉成可重用表示；受訓練的 Memory Module 再根據問題與資料庫，生成固定數量、與問題相關的 Memory Token，交給凍結的語言模型。

研究者公開的數據相當有意思：在 512 份文件的設定下，官方網站報告相較長 Context Baseline，耗時約 **0.74 秒對 19.9 秒**，測試使用單張 H100；在 FactKG 上報告 **84.33% 對 80.43%** 的準確率。這些能說明研究方向的潛力，但它們是論文指定環境的結果，不是 Apple Silicon 實測。

Memorilla 和一般 RAG 保留的是不同資訊。RAG 可以直接指出某個日期、名稱或引句來自哪一段原文；壓縮的 Latent Memory 則可能把很多弱相關資訊連結起來，卻遺失精確細節。Memorilla 也需要針對目標模型訓練記憶模組，不能隨便塞進任何本地 Checkpoint。

對個人研究工作站，我認為最有價值的組合是：**壓縮記憶負責長期連續性，來源檢索負責正式查證。** Research Agent 可以記得兩篇論文曾互相矛盾，但真正發表文章時，仍應重新打開原始論文，引用能核對的段落。兩種技術不是對手。

### 從問答到真正的自主研究工作台

搜尋按鈕只能回答人已經想到要問的問題。真正的 Research Agent 還應判斷：**接下來什麼問題值得問？** 所以 Agentic RAG 的核心不只是把一次搜尋變成五次，而是建立會依證據調整方向的迴圈。

從研究主張或工程決策出發，拆成可檢驗的子問題，搜尋原始碼、官方文件與論文，比較互相矛盾的結果，針對缺少的事實改寫下一次查詢；當再查也不足以改變決策時，就應停止。系統還得分辨一份官方 Benchmark 和五篇轉貼同一數據的社群文章，並記得某個假設為何被排除，避免下次重新走進死胡同。

例如研究 32GB 電腦是否適合 DSpine，不能只查「DSpine 加速多少」。還應追問：目標模型的 Runtime 是否支援？Draft Cache 需要多少記憶體？Apple Silicon 的支援和現有 Backend 是否相容？有沒有真正的端到端數據？最後應產出工程決策，而不是一堆搜尋片段。

[Karpathy 的 autoresearch](https://github.com/karpathy/autoresearch) 展示了相關但不同的原則：限制 Agent 可修改的程式範圍，給每次實驗相同的時間預算，量測明確指標，再決定保留或捨棄。官方單 GPU 實作以 NVIDIA 為主，重點不是原封不動搬到 M4，而是**固定 Baseline、形成閉環的實驗設計**。這也是 Ouroboros 自動改善本地模型配置的基礎。

自主研究桌真正有價值的輸出應是：「目前有哪些選項、證據是什麼、取捨在哪裡、做哪個實驗可能改變結論。」少了這一層，它就只是自動瀏覽器。

## 工程紀律比華麗的代理組織圖重要

### Superpowers、Skills 與完成前驗證的價值

裝了大量 Skills 的 Agent 看起來可能很厲害，實際卻讓模型背負更多無關指令。[Anthropic Skills](https://github.com/anthropics/skills) 與 [Awesome OpenCode](https://github.com/awesome-opencode/awesome-opencode) 很適合用來發現可重用的工作程序，但合理的抽象應是**任務需要時才載入**，而不是把整個 Marketplace 塞進每次 Prompt。

[obra 的 Superpowers](https://github.com/obra/superpowers) 則提供更有主張的工程方法，包含 Brainstorming、Writing Plans、Systematic Debugging、Test-driven Development、Code Review 與 Verification Before Completion。關鍵不是 Prompt 能神奇地改善程式，而是讓 Agent 遵循可證偽流程：先寫會失敗的測試、讓它通過、檢查證據，最後才宣告完成。

多代理分工也是同一道理。實作與 Review 分成不同 Agent，可能帶來獨立觀點，但每次交接都需要時間、上下文與協調成本。小模型如果花在回報的資源比真正工作的還多，組織圖反而變成負擔。Manager 應接收精簡交接資料：修改了哪些檔案、跑了哪些測試、做了什麼決策、還有哪些阻礙，需要時再打開完整日誌。

定期任務也不能只靠一段「每天早上自動執行」的 Prompt，還需要真正的 Scheduler、持久狀態與冪等操作。無論使用 Harness 內建排程還是 macOS launchd，都應有固定 Job ID、最後成功紀錄、Lock 和安全重試政策。最應避免的是 Agent 自信宣稱完成，但成果根本沒有寫到 Repo。

**工程紀律比裝飾更有價值。** 一個具備清楚 Skill、測試與可靠 Task Ledger 的普通 Agent，通常比一群無法獨立驗證成果的華麗專家團隊更實用。

### FreeLLMAPI：模型路由可以靈活，但能力不可悄悄降級

[FreeLLMAPI](https://github.com/tashfeenahmed/freellmapi) 從另一個角度處理模型自由：把多個 Provider 帳號及相容 Endpoint 放在同一個 OpenAI 風格的 `/v1` 介面後面。Router 追蹤 Quota、選擇可用 Endpoint，遇到速率限制時 Fallback，並加密保存上游 Key。它也能導向自架 Endpoint，因此可成為本地與雲端推論之間的橋樑。

專案提供 Free 與 Premium 的 Catalog 更新方式，官方文件說明付費方案能較快取得新模型目錄，免費安裝則會延後。這是**模型路由器的功能差異**，不是取得無限免費算力。Agent 依然受每個 Provider 的額度、延遲與 Tool Calling 相容性影響。當首選模型額度耗盡，Fallback 也可能悄悄換成能力更弱的模型。

這會帶來實際工程問題：Coding Agent 不應在重要工作做到一半時，毫無紀錄地切換到另一個能力等級。模型路由必須可觀察、能遵守預算，而且考慮工具格式相容性。低風險摘要可以接受較弱的 Fallback；需要嚴格通過測試的 Patch，可能更適合等待或指定已知可用模型。

結論是：**Gateway 提供彈性，不能取代容量規劃。** 本地模型提供較可預測的控制，Router 則讓系統在真正需要時，有機會突破硬體的能力邊界。

## 值得探索的個人電腦

### Astryx：Design System 不是換一套視覺主題

[Meta 的 Astryx](https://github.com/meta/astryx) 提供了一個值得研究的例子：同時考量人類與 Agent 的 Design System。官方文件介紹了具無障礙設計的 React 元件、Theme、Template、CLI、可匯出的內部元件，以及把元件原始碼帶進專案進行客製的能力。它目前以 React 19+ 為目標，對仍使用舊版 React 的專案是重要相容條件。

值得學習的不是把 Astryx 的外觀貼到每個網站上。Design System 真正保存的是**決策與約束**：Button 有哪些 Variant、Focus 怎麼運作、State 怎麼命名、可使用哪些 Spacing Token、元件應如何組合。這些契約減少 Coding Agent 每次修改時任意做出的設計決策，也更容易找出視覺回歸。

具有 Immersive Sim 風格的個人網站，最能凸顯這個差異。復古桌面、模擬 Terminal、老式報紙可以共存於一個世界觀，但導航與狀態規則必須一致。突然把訪客傳送到完全不同畫面的轉場，或某個成就在必要動作前就提前解鎖，都會因為違反互動契約而破壞沉浸感。

例如隱藏密碼 **0451**，真正的技術問題是狀態機：線索存在、訪客發現、輸入並驗證密碼，成功後紀念卡才改變外觀；普通紀念卡則始終對所有人開放。有趣的不是數字本身，而是避免 UI 狀態與訪客實際行為互相矛盾。

**好的 Design System 不是抹去產品個性，而是讓個性可以被一致地實作與測試。** 對有鮮明視覺風格的 Portfolio，借用 Astryx 的元件紀律，比直接換掉整套設計更有價值。

### 如果只有一台小 Mac，我會怎麼組這套系統

研究這麼多 Repo 之後，我認為最有價值的結論不是列出一長串要安裝的工具，而是讓本地 AI Stack 的每個部分**只負責一件清楚的事**。

語言模型負責推理；精簡 Harness 執行工具；Task Ledger 保存真實進度；Retrieval 找到證據；獨立介面讓人能監督與介入；可選的外部服務則在真正值得時擴充硬體能力。

因此，Minerva’s Den 可以用這樣的架構理解：

```text
使用者 / 手機 Companion / 互動網站
                  |
             Task / Run Ledger
                  |
          通用 Agent Orchestrator
             /              \
       Coding Harness     Research Workflow
       Repo/Diff/Test     Query/Retrieve/Verify
             \              /
           Model / Inference Router
              |           |
           Local MLX    Optional API
              |
         Mac mini M4 / 32GB
```

第一優先是**可觀察性**：每個 Task 都應有身分、目前狀態、時間、Tool Trace 和可驗證成果。第二是**資源紀律**：單一昂貴的本地推論程序，可能比幾個互相競爭記憶體的程序更有效；要量測 Memory Pressure 和真正完成的工作，而不是統計活躍 Agent 數量。第三是**證據紀律**：研究回答要能指向原始來源，Coding 回答要能指向測試或 Diff。

我不會在第一天就把 Paperclip、多層 Supervisor、數個 Vector Database，以及目錄裡全部的 Skills 一口氣裝上去。那樣的系統在架構圖上很壯觀，實際使用卻可能痛苦。

今天 Agent 發展最值得關注的變化是：模型智力逐漸成為系統的一個元件，而非完整產品。真正的工程問題，是如何設計模型、工具、記憶、人與實際後果之間的界線。**介面清楚、成果可量測的小電腦，有機會比強大卻不透明的自動化系統更有價值。**

## 延伸閱讀

最值得直接閱讀的是原始專案：[Pi](https://github.com/badlogic/pi-mono)、[OpenCode](https://github.com/anomalyco/opencode)、[DSH Superagent](https://github.com/deepseek-ai/dsh-superagent-prototype)、[Paperclip](https://github.com/paperclipai/paperclip)、[Cindy](https://github.com/makecindy/cindy)、[Superpowers](https://github.com/obra/superpowers)、[Mantis](https://github.com/perzianhq/mantis)、[agent-desktop](https://github.com/vercel-labs/agent-desktop)、[Poki](https://github.com/JosssphZhou/poki)、[Henge](https://github.com/Leviidev/Henge)、[Umless](https://github.com/jatinbishla/umless)、[DSpine](https://github.com/tencent/dspine)、[SAG2](https://sag-wiki.zleap.com/en/docs/sag2)、[Memorilla](https://github.com/snap-stanford/memorilla)、[Astryx](https://github.com/meta/astryx)、[FreeLLMAPI](https://github.com/tashfeenahmed/freellmapi) 與 [autoresearch](https://github.com/karpathy/autoresearch)。其他值得探索的相關計畫包含 [Swarm Site](https://califa.github.io/swarm-site/)、[Awesome OpenCode](https://github.com/awesome-opencode/awesome-opencode)、[Unsloth](https://huggingface.co/unsloth) 和社群的 [ZeroZero Checkpoint](https://huggingface.co/LastMachine/Qwen3-8B-ZeroZero-Heretic)。
