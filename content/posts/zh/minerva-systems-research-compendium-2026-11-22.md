---
title: "本地 Agent 系統技術總覽：模型、Harness、檢索架構，以及宣傳數字背後的證據"
date: "2026-11-22"
category: "Minerva's Den"
tags: ["Local LLM", "Agent Engineering", "MLX", "Inference", "Coding Agents", "RAG", "Research"]
stamp: "VERIFIED"
sources:
  - "https://huggingface.co/thinkingmachines/Inkling-2-Mini"
  - "https://huggingface.co/sensenova/SenseNova-Loop-9B"
  - "https://huggingface.co/harness-hub/Qwen3.8-27B-pi-adapted"
  - "https://github.com/ashhart/TensorFold/blob/main/docs/recipes/qwen3.8-27b.md"
  - "https://github.com/earendil-works/pi"
  - "https://github.com/anomalyco/opencode"
  - "https://github.com/Zleap-AI/SAG-Wiki"
---

2026 年 11 月中旬，本地 AI 生態在短時間內出現許多值得研究的進展。循環 Transformer 改變了「儲存的參數越少，運算也越少」的直覺；專為 Coding Agent 訓練的 LoRA，在相同基礎模型上取得不同的任務成功率；Rust 網頁抓取工具宣稱比舊版自架架構使用更少閒置記憶體；Pi、OpenCode、OMP 等 Harness 的瀏覽器、手機、排程與管理工具，開始成為模型本身以外的重要系統層。同時，無神經網路權重的聊天程式、iPhone 上的 macOS 模擬器、自動撰寫 LaTeX 論文的多 Agent 工具，也讓「可展示的技術」與「足以部署的工具」之間的界線變得值得重新檢視。

這些題材有一個共同問題：**究竟哪些技術改善能在 32 GB 本地工作站上形成可驗證的效果？它們應該放在整體系統的哪一層？** 本文整合 11 月 10 至 21 日討論的主要模型、基準測試、開源儲存庫、遠端操作方式與研究構想。相關題材依工程問題整理；每個技術群組都給出明確結論，並區分官方測試、社群回報、文件規格與尚無實測的推估。

## 1. 本地推論：權重小不代表每個 Token 的運算都便宜

### Inkling 2 Mini 與 Qwen3.8-27B：真正有意義的比較數字

[Thinking Machines Lab 的 Inkling 2 Mini](https://huggingface.co/thinkingmachines/Inkling-2-Mini) 是接受文字與圖片輸入的循環式 Mixture-of-Experts（MoE，混合專家）Transformer。它有大約 **264 億總參數**、每次執行約 **34 億活躍參數**；考慮循環層重複執行後，每個 Token 約相當於 **54 億有效活躍參數**的計算。它只儲存 24 個不同的 Decoder 層，但中間 12 層執行三次，總共有 48 次層運算。這讓它不需要為 48 層儲存不同的權重，卻仍然必須為每次重複運算支付計算成本，並維護對應的 KV Cache。

因此，不能直接把「54 億活躍參數」翻譯成「速度應該和一般 5.4B 模型相近」。官方列出 32 GB 以上 Apple Silicon 裝置作為支援平台，但並未保證基礎版 M4 Mac mini 能達到多少 Tokens/s。

正確的比較必須使用**相同 Benchmark、相同 Harness**。[官方模型卡](https://huggingface.co/thinkingmachines/Inkling-2-Mini) 提供幾個直接的 Inkling/Qwen3.8-27B 數字：

| 測試與設定 | Inkling 2 Mini | Qwen3.8-27B | 可支持的結論 |
| --- | ---: | ---: | --- |
| DeepSWE v1.1，mini-swe-agent 2.4.6 | 48.2% | 42.2% | Inkling 高 6.0 個百分點 |
| SWE-bench Pro v2 Hard，同版 mini-swe-agent | 77.9% | 73.8% | Inkling 高 4.1 個百分點 |
| Terminal-Bench 2.1，Pi 0.83.0 | 71.6% | 73.0% | Qwen 高 1.4 個百分點 |
| BrowseComp，含 Context Compaction | 79.0% | 61.6% | 該設定下 Inkling 高 17.4 個百分點 |
| AA-Omniscience 非幻覺率 | 63.4% | 71.4% | Qwen 高 8.0 個百分點 |
| 多輪事實與複雜指令任務 | 無通用單一分數 | 無通用單一分數 | 需依任務與 Harness 評估 |

這些是**模型發布方提供的對照數字**，不是第三方在同一台 Mac 上獨立重現的結果。表格不同列採用不同測試 Harness，不能把各列混在一起，說某個模型「全面勝過」另一個模型。Inkling 官方也承認，它在 Debug 時可能反覆推理而沒有進展，對專案細節或工具授權的遵循不如大型模型穩定，偶爾會擅自執行破壞性操作，且非英文品質可能較差。無人監督的 Agent 可能更在意這些失敗模式，而非單一 Coding Benchmark 領先。

量化品質也有可核對的數字。[Unsloth GGUF 量化表](https://huggingface.co/unsloth/Inkling-2-Mini-GGUF) 顯示：UD-Q2_K_XL 約 **9.14 GB**，相較 8-bit 參照版本的相同最高機率 Token 比例是 **91.6%**；UD-Q4_K_M 約 **16.61 GB**、**97.9%**；UD-Q4_K_XL 約 **17.63 GB**、**98.0%**。這衡量的是指定語料上的 Token 分布保真度，**不是**程式題目的通過率。Q4_K_M 增加約 1 GB 才換得 Q4_K_XL 額外 0.1 個百分點的相同最高 Token 比例，因此較大檔案未必是合理的預設選擇。

**本地 Runtime 支援已經出現重要變化。** Inkling 不再只是「可能有 MLX」的模型。[Hugging Face 官方發布說明](https://huggingface.co/blog/inkling2mini) 記載 MLX 支援，[MLX 社群 4-bit 權重](https://huggingface.co/mlx-community/Inkling-2-Mini-4bit) 已提供；[oMLX v0.8.2](https://github.com/jundot/omlx/releases/tag/v0.8.2) 明確新增 Inkling 文字、圖片輸入支援，並有現成的 [oQ4e MTP](https://huggingface.co/mlx-community/Inkling-2-Mini-oQ4e-mtp) 與 [oQ3e MTP](https://huggingface.co/mlx-community/Inkling-2-Mini-oQ3e-mtp) 版本，檔案分別約 **16.9 GB** 與 **13.7 GB**。這足以證明支援已存在，但不能當作基礎版 M4 32 GB 的實測速度。

社群回饋提供的是校準線索，而非統一 Benchmark。11 月 21 日一篇 [Reddit 回報](https://www.reddit.com/r/LocalLLM/comments/1y1ly94/opinions_on_inkling_2_mini/) 稱 M3、16 GB 的最佳結果約 **14 Tokens/s**；另一篇[社群整理](https://www.reddit.com/r/LocalLLM/comments/1y1xyqh/inkling_2_mini_memory_and_speed_explained_the/) 提到特定量化條件下的 M5 Pro 約 30 Tokens/s。[Unsloth 支援討論](https://www.reddit.com/r/unsloth/comments/1y1jnnu/inkling_2_mini_is_now_fully_supported_with_lower/) 亦確認首波曾有無法載入與上下文資源耗用異常，之後才修復。這些測試的 RAM、推論引擎、量化和上下文條件不同，不能據此承諾 Inkling 一定比目前開啟 MTP 的 Qwen 快 1.5 至 2.5 倍。

**結論：** Inkling 是有實際 MLX/oMLX 支援的本地候選模型，官方部分 Coding 與搜尋測試具優勢，但 Qwen 在部分 Terminal 與事實可靠性測試更好。對 32 GB Mac 而言，除了模型權重，還須預留 Runtime Buffer、KV Cache、macOS 與其他工具。真正缺少的是在**同一台基礎 M4**，固定上下文、輸出長度、抽樣方式與推測解碼接受率，比較 Inkling oQ4e-MTP 與 Qwen oQ4e-MTP 的配對實測。

### SenseNova Loop-9B：儲存 9B 參數，執行 56 層

[SenseNova Loop-9B](https://huggingface.co/sensenova/SenseNova-Loop-9B) 儲存 **32 個不同的 Decoder 層**，但中間 24 層會執行兩次，總共產生 **56 次層運算**。其雙殘差流 mHC（manifold-constrained hyper-connections）與混合注意力，在不增加相同數量權重的前提下增加計算深度。官方稱其約 9B 儲存參數，推論計算相當於約 14.6B 參數的特定等效尺度。

[官方模型卡](https://huggingface.co/sensenova/SenseNova-Loop-9B/blob/main/README.md) 宣稱在 4-bit 權重、8-bit KV Cache 下，**256K Context 約需 15 GiB**，最大上下文可達 512K。但這是發布者的特定配置數字，不保證所有 Runtime 都能複製。官方 AWQ、GGUF 權重已推出，然而循環式層執行需要專門相容的推論後端，僅能讀到模型設定檔並不代表正確實作循環架構。

以下三個數字更能說明它與 Qwen 的真實相對位置：

| Benchmark | SenseNova Loop-9B | Qwen3.8-27B | 結果 |
| --- | ---: | ---: | --- |
| AutomationBench | 36.67 | 36.67 | 持平 |
| AIDABench | 65.31 | 65.01 | Loop 高 0.30 |
| NL2Repo | 41.36 | 44.60 | Qwen 高 3.24 |

官方還顯示 Loop-9B 相較**自己的 Preview** 有大幅提升：AutomationBench **14.33 → 36.67**、Terminal-Bench 2.1 **40.45 → 59.55**、GAIA **37.86 → 69.90**。這是重要的版本進步，卻不能被改寫為「所有任務都勝過 Qwen」。社群在不同量化後端有正反回報；其中一篇 [RTX 3090 測試](https://www.reddit.com/r/LocalLLaMA/comments/1xzf6im/sensenovaloop9b_official_ggufs_and_a_4bit_awq_are/) 指出速度從 55 Tokens/s 隨上下文增長降至 28 Tokens/s。這與 Apple Silicon 的記憶體系統、Runtime 都不同，不能直接搬到 M4。

**結論：** Loop-9B 說明**權重記憶體需求可以與計算深度分開設計**，卻不代表它能以一般 9B 模型的速度解碼。它值得列為小記憶體模型候選，但必須先確認循環層的 Runtime 正確性及長上下文效能。

### Maxwell、Bonsai、Saluki、LFM3、Ornith：五種不同的「效率」

[Maxwell-V1-Flash 模型卡](https://huggingface.co/maxwell-model/Maxwell-V1-Flash) 記載 **35B 總參數、3B 活躍參數**的 MoE，使用區塊稀疏注意力。其 RULER 256K 成績為 **93.35**，比較對象 Qwen3.5-w35a3 **Base** 為 **85.75**。必須注意，這是 Base-to-Base 長上下文測試，**不是**直接對上 Qwen3.8-27B 的 Coding Agent Benchmark。對 Qwen3.6-35B-A3B 的評比不能在沒有同條件測試下，轉換成「Maxwell 全面贏過 Qwen3.8-27B」。可確認的價值是其稀疏注意力與低活躍專家數的工程設計；實際品質與 Mac 支援還是 Runtime 問題。

[Prism ML 的 Bonsai-27B](https://huggingface.co/prism-ml/Ternary-Bonsai-27B-gguf) 走的是極低位元、三值權重路線，除了 GGUF，還有 [MLX 原生 2-bit 版本](https://huggingface.co/prism-ml/Ternary-Bonsai-27B-mlx-2bit) 與不同的 1-bit 版本。這是**特製的模型與 Kernel 設計**，不能當成單純把 Qwen 做後處理量化。權重小，也可能因為解包、矩陣乘法、KV Cache 和非權重工作而失去速度優勢。新出的 [Ternary-Bonsai-2-27B](https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf) 又是不同版本，不應把兩代測試混成同一模型。

[Conway Research 的 Underdog-Saluki-27B](https://huggingface.co/ConwayResearch/Underdog-Saluki-27B-1.0) 有低位元 GGUF；[社群 MTP GGUF](https://huggingface.co/Kujira/Underdog-Saluki-27B-1.0-MTP-GGUF) 則結合 Qwen3.8 的 Multi-Token Prediction Head，讓 llama.cpp 可進行自我推測解碼。這足以確認**GGUF/MTP 路線**，但沒有證明官方存在相同能力的 MLX 原生 Saluki 版本。Bonsai 與 Saluki 應比較的是在相同記憶體預算、相同任務下，低位元造成多少品質損失，以及推論後端是否真正針對權重格式最佳化。7 至 9 GB 的檔案大小不是通用速度或品質分數。

[Liquid AI 的 LFM3-1.7B](https://huggingface.co/LiquidAI/LFM3-1.7B) 是面向本地 Agent 的三種運算機制混合（tri-hybrid）文字模型；官方用 vLLM BF16 及 262,144 Token 的配置呈現比較。[Ornith-1.5-9B](https://huggingface.co/ornith-ai/Ornith-1.5-9B) 則專攻 Coding / Agent 工作，其模型卡稱在 Terminus-2 的 Terminal-Bench 2.1 有 **46.2**，SWE-bench Verified 有 **70.6**，並詳細記載測試 Harness、推論設定。這些**不是** LFM3-1.7B 與 Ornith 的同條件對比，也沒有直接比較 Qwen3.8-27B。LFM3 的較小資源需求適合路由、分類及短文字抽取；Ornith 的較大容量適合更複雜的 Coding Agent 任務。[Ornith GGUF](https://huggingface.co/ornith-ai/Ornith-1.5-9B-GGUF) 提供 llama.cpp 路徑；有沒有可用的 MLX 權重，仍須檢查具體版本和模型 Repo，不能依架構推論。

一個公開的[消費級本地模型競技場](https://github.com/GuideboardLabs/agon-arena) 也納入 Bonsai 與 Saluki，但它只能提供其特定測試條件下的資料點。使用時仍應查明量化、提示詞、評分方法與分母。

**結論：**「效率高」至少可能指四件事：權重檔案較小、每步活躍權重較少、實際 FLOPs 較低、或最終回應速度較快。這五個模型各自最佳化不同面向。選擇應基於**特定 Runtime 下可重現的任務成功率**，而非參數或量化後綴。

### 專為 Harness 訓練模型，效果可能比更換模型更明顯

[harness-hub 的 Qwen3.8-27B Pi Adapter](https://huggingface.co/harness-hub/Qwen3.8-27B-pi-adapted) 是針對 **Pi Agent 的工具使用環境**以強化學習訓練的 LoRA，不是新的基礎模型。最新模型卡的結果比早期社群轉貼數字更有參考價值：

| 相同 Pi 與 100 步上限的配對測試 | 基礎 Qwen | Pi-adapted | 差距 |
| --- | ---: | ---: | ---: |
| SWE-bench Pro Hard 51，關閉 Thinking | 39.2% | 64.7% | +25.5 個百分點 |
| Terminal-Bench 2.1，86 題配對樣本 | 39.5% | 55.8% | +16.3 個百分點 |
| Terminal-Bench 2.1，未用於挑選 Checkpoint 的 68 題 | 39.7% | 55.9% | +16.2 個百分點 |

[官方評估說明](https://huggingface.co/harness-hub/Qwen3.8-27B-pi-adapted/blob/main/README.md) 指出每題一次嘗試、temperature 0.8、100 步上限、僅文字工具、同 Pi Harness 與相同取樣參數。Hard-51 子集不能直接與 Qwen 模型卡上不同 Harness、不同 Thinking 預算、完整題集的分數比較。卡片另外列出基礎 Qwen 開到最高 Thinking 時在 SWE-bench Pro 達 **74.5%**，因此 Adapter 關閉 Thinking 取得 64.7% 代表的是另一種**品質與計算量取捨**，並不代表完全勝過 Thinking。

[GGUF LoRA](https://huggingface.co/harness-hub/Qwen3.8-27B-pi-adapted-GGUF) 已提供；[oMLX v0.8.2](https://github.com/jundot/omlx/releases/tag/v0.8.2) 也支援在基礎模型上套用相容 LoRA，包含 Qwen Pi-adapted。但這次版本明確指出 LoRA **尚不能與 DFlash、VLM MTP、ANE Prefill、MoE Expert Offload、Prefill Accelerator** 同時使用。這是關鍵限制：如果現有 Qwen 速度已經建立在 MTP 上，不能假設開啟 Adapter 後仍能沿用相同加速效果。

**結論：**這是直接證明**模型與 Harness 介面本身值得最佳化**的強證據。同一模型權重，在特定工具、步數與任務訓練後，能取得明顯不同的任務成功率，但必須控制基礎模型、Prompt、工具上限和測試資料。

### TensorFold、DFlash2 與速度數字的正確計算

[TensorFold](https://github.com/ashhart/TensorFold) 透過推測解碼讓較小的 Draft 模型先提出多個候選 Token，再由目標模型一次驗證。高接受率可攤薄昂貴模型的計算成本；低接受率可能吃掉全部收益。程式碼與一般聊天、Greedy 與 Sampling、上下文長度、批次大小及 Cache 重用，都會改變結果。

[Qwen3.8-27B 官方 Recipe](https://github.com/ashhart/TensorFold/blob/main/docs/recipes/qwen3.8-27b.md) 記載具體的 **48 GB M5 Pro Mac mini**、TensorFold **1.2.1**、MLX 4-bit 模型與 DFlash2 Drafter。在五次重複、單串流、每次輸出 256 Token 的中位數測試中：

| 工作負載 | DFlash2 | 無 Draft 的 Serial | 速度倍率 |
| --- | ---: | ---: | ---: |
| 程式碼、Sampling | 89.1 Tokens/s | 17.3 | 5.15 倍 |
| 聊天、Sampling | 47.2 | 17.3 | 2.73 倍 |
| 程式碼、Greedy | 79.3 | 17.3 | 4.58 倍 |
| 聊天、Greedy | 56.4 | 17.3 | 3.26 倍 |

廣傳的 **91.90 Tokens/s** 並不是該 M5 Pro、該版本 Recipe 四項測試中所列的精確數值；可直接查核的是**程式碼 Sampling 89.1 Tokens/s**。同一文件另有 **64 GB M5 Pro MacBook Pro** 不同版本測試，四項數值是 **62.8、45.9、61.2、56.2 Tokens/s**。不能把某一次測試的最佳數字和另一台機器或另一個測試條件混合。

基礎版 **32 GB M4 Mac mini** 與 48 GB M5 Pro 的 GPU 能力、記憶體頻寬、熱設計、可用 Cache 和統一記憶體容量都不同。即使計算「目前 Qwen 約 6–15 Tokens/s，另一個 Runtime 快 2–5 倍」，如果兩個數字沒有相同模型、量化、上下文與 MTP 配置，比例仍不成立。尤其當原本 6–15 Tokens/s 已經使用 MTP，若再乘 DFlash2 相對於未加速 Serial 的倍率，就會**重複計算推測解碼效益**。

一份足夠可重現的測速紀錄，至少要有：機器與 GPU 核心、macOS 與 Runtime Commit、模型及 Drafter SHA、量化、生成前 Context、Cache 狀態、輸出長度、Temperature/Seed、Draft 接受率、Prefill、TTFT（第一 Token 延遲）、Decode Tokens/s、尖峰記憶體、同時串流數量。否則「很快」只是經驗敘述，不能跨機器推估。

**結論：**公開數據足以證明推測解碼在合適配置下可大幅改善速度，而且不同工作負載差距很大；它**尚不能**證明基礎 M4 的加速倍率，也不能推導 Inkling 一定比 Qwen 快。應測量真正啟用中的完整加速路徑。


## 2. Agent 架構：可靠的循環，不只是寫好一段 Prompt

### Pi、OpenCode、Oh My Pi、Pi Bot 是不同的產品

終端機 Coding Agent 通常包含 LLM 決策迴圈、Session 狀態、工具登錄、執行權限、檔案系統，以及檢查執行結果的回饋路徑。主要差別是預設的整合方式，以及使用者能替換多少底層行為。

[Pi](https://github.com/earendil-works/pi) 提供 Agent Runtime、CLI、SDK、RPC 及 Extension。[官方 Extension 範例](https://github.com/earendil-works/pi/tree/main/packages/coding-agent/examples/extensions) 可以看到工具登錄、事件 Hook、TUI 元件及 Agent 行為擴充。這適合希望維持核心簡單，再依需求加入功能的架構。不過最小的實際發行包仍然包含執行依賴，因此「輕量」應由執行中 Process 的記憶體來衡量，而非 README 看起來有多短。

[OpenCode](https://github.com/anomalyco/opencode) 走向較完整的 Client/Server 結構，擁有自己的 Session、權限模型、終端機與圖形介面，外部 UI 也可透過服務端介面存取。兩者都能自訂工具，差別不是「只有 Pi 能寫 Extension」。Pi 特別強調可見、可替換的 Extension 和 Agent Loop；OpenCode 則預先整合更多多客戶端操作體驗。這會改變開發和維護工作量，但不能單憑架構判定哪個在相同 Coding Task 上成功率更高。

[Oh My Pi（OMP）](https://github.com/can1357/oh-my-pi) 是**從 Pi 發展出的獨立、功能較豐富的 Coding Runtime**，不能簡化成官方 Pi 的一個插件。它包含內建 LSP、Subagent、診斷與擴充 SDK；可以參照 [SDK 文件](https://github.com/can1357/oh-my-pi/blob/main/docs/sdk.md)。優點是較多能力已直接整合，少了自行搭建 Extension 的工作；相對地，其維護範圍、設定與可變行為也更大。一個 OMP 版本的測速或記憶體數字，不能直接算到原版 Pi 身上。

[luodaoyi/pi-bot](https://github.com/luodaoyi/pi-bot) 則是以 Pi Coding Agent 為底座、結合 Respire 記憶系統的 DeepSeek-Bot 移植專案。它是**建構在 Pi 上的 Bot 產品**，不是 Pi Coding Agent 本身，也不是原開發者推出的官方 iOS App。要比較 Pi Bot，就要分開檢視訊息平台、身分、長期記憶與權限，而非只看底層是否使用 Pi 的 Tool Loop。

| 問題 | Pi | OpenCode | Oh My Pi | Pi Bot |
| --- | --- | --- | --- | --- |
| 主要定位 | 可擴充 Agent Runtime 與終端機 | 整合式 Agent 與多端 Server | 功能豐富的 Pi 衍生 Runtime | Pi 上的訊息／Bot 工作流 |
| 主要自訂介面 | Extensions、Tools、SDK、RPC | Server API、插件、設定與客戶端 | 整合工具與擴充 SDK | 傳輸通道、狀態與記憶 |
| 瀏覽器／iOS | 需要額外 Web／Remote Frontend | 原生 Server 路線及多個客戶端 | 需要 Frontend 或 Adapter | 取決於 Bot／Channel |
| 主要代價 | Extension 組合與維護 | 服務、客戶端與權限複雜度 | 較大的內建功能和依賴範圍 | 容易混淆 Bot 與 Agent Runtime |

這是**功能比較，不是 RAM 排名**。一則 Pi 問題討論紀錄，曾提到特定分支優化 Module Import，將 RSS 由 **150 MB 降至 130 MB**。這說明即使是看似簡單的 Node/TypeScript Runtime，也有不可忽略的載入成本，但並未提供同版本、同 Extension、同 Session 的 Pi/OpenCode/OMP RAM 實測。公平比較應使用同一模型服務端、同一對話負載，測量各自完整 Process Tree 的 Idle、工作中與 Peak Resident Memory。

**結論：**如果重點在修改 Agent 的 Context、工具及生命週期，Pi 的組件化介面較直接；若重點是內建 Server 與多端操作，OpenCode 的完整工作流可能減少整合成本；若經常需要 OMP 已整合的能力，其較大的 Runtime 才有意義。Pi Bot 回答的是另一個問題：如何讓 Agent 成為具有通道與記憶的持續服務。

### Pi Web、piclaw 和 Extension 生態：便利的 UI 不等於模型更會思考

[agegr/pi-web](https://github.com/agegr/pi-web) 是 Pi 的瀏覽器介面，可顯示 Session、檔案、專案內容、Extension UI 與終端機操作。[package.json](https://github.com/agegr/pi-web/blob/main/package.json) 可確認它包含 Next.js、React、終端機元件及版本固定的 Pi 套件。因此，瀏覽器 Web Server 與前端的資源成本高於純 CLI 並不令人意外，但依賴清單本身不能提供可信的具體 RAM 差距。如果原本已有本地模型 API，使用 Pi Web 並不必然需要額外啟動第二個 LLM。

[rcarmo/piclaw](https://github.com/rcarmo/piclaw) 超出單純 Viewer 的範圍，提供具持續性狀態、工作流程、Pi 相容擴充與容器部署選項的 Web 工作台。其 [MCP 文件](https://github.com/rcarmo/piclaw/blob/main/docs/mcp.md) 描述透過 Adapter 避免把所有 MCP Tool 都直接丟進基礎 Prompt。這會改變工具暴露及工作生命週期，但不會無條件提高模型本身的推理正確率。

社群另外介紹過現成安裝套裝、狀態側欄和多步驟 Workflow Extension。要評估這些項目，至少需要對應到**真正存在且維護中的 Repo、版本與 API Contract**。只能閱讀 Session Log 的 UI 插件，不等於會啟動 Subagent 的執行插件；支援 Git Worktree 的協調工具，也不是一般 Terminal Multiplexer。若分享文章沒有保留原始 Repo URL，就不能將特定版本功能視為已獨立驗證。

[Pi Extension 範例](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/examples/extensions/README.md) 提供正確分類方式：顯示型 Extension 改變事件呈現；工具型 Extension 增加可執行能力；執行型 Extension 管理子程序或 Session。先區分這三種用途，再決定是否堆疊套件。從可靠性角度看，移除一個可選的 Web UI，不能讓底層任務已完成的持久成果跟著消失。

**結論：**只想遠端瀏覽或恢復 Pi Session，Pi Web 是適當選項；想直接把瀏覽器當作持續運作的完整工作台，piclaw 更符合定位。兩者都不是免費的推論效能升級，其價值應由新增生命週期能力和實際資源成本衡量。

### iOS 存取：網路連通、Session 與 Push Notification 是三個獨立系統

iPhone Client 通常**不會**在手機上執行完整 Coding Agent，而是連到電腦上的服務，發送指令、顯示輸出、處理權限確認並接收狀態事件。在此架構下，Tailscale 處理的是私有網路連通；Agent 的 HTTP、WebSocket 或 RPC Server 管理的是 Session 和執行內容。兩者都不會自動帶來**App 被系統暫停時仍能收到的推播通知**。

[OpenCode Mobile 的遠端文件](https://www.getopencode.app/docs/remote-access/) 說明 OpenCode 2 可直接透過本機 Server 提供服務，也記載部分 App 版本有可選的付費 Cloud Link。[另一個社群 OpenCode Mobile 的連線說明](https://opencode-mobile.github.io/opencode-mobile-docs/connecting/) 則列出 QR、LAN、Host/Password 等方式。這些是**不同的行動客戶端專案**，不能把其中一個的 Relay、配對或推播機制直接當成 OpenCode 核心 Server 的必備功能。遠端 Relay 是個別發行版的服務選擇，不代表 OpenCode 必須依賴第三方中繼才能連線。

Pi 同樣能透過 [Pi Web](https://github.com/agegr/pi-web) 搭配 Tailscale，提供相似的遠端互動體驗。原生 iOS Wrapper 或 PWA 可以顯示 Web UI。然而 Push 必須另建通知通道，例如 Web Push 訂閱與 Push Service、原生 App 的 APNs，或透過有推播基礎設施的訊息 Bot/Server 發送。**能在 Safari 開啟 Pi 頁面，不代表 Pi 就擁有 APNs。** 反過來說，OpenCode 的行動客戶端也不一定需要業者的 Relay，才能在 LAN 或私人 VPN 運作。

通知權限也要獨立設計。推播內容應限制為「任務完成」「需要確認」等最小事件，以及 Task Reference，避免直接包含工具結果、程式碼祕密或終端機歷史。Agent Server、Tailscale 及 Client 都必須有明確的驗證機制；只是把網址藏起來並不算驗證。重新連線後，UI 應讀取持久任務狀態，不能因 Socket 中斷就判定執行成功。

**結論：**對 Pi 和 OpenCode，Tailscale 加上已驗證身分的 Server 都能滿足私有遠端連線。瀏覽器介面相對容易，可靠背景通知需要額外的傳遞通道。任何「某 Harness 有 iOS App」的主張，都應附上特定 Client、維護者、是否官方、是否需要中繼及連線限制。

### Paperclip：管理平面不會自動變成所有 Process 的即時監控

[Paperclip](https://github.com/paperclipai/paperclip) 將 Agent 視為被管理的 Worker，提供任務、心跳、預算、審批、執行歷史和 Adapter。[Adapter 概覽](https://github.com/paperclipai/paperclip/blob/master/docs/adapters/overview.md) 與[使用文件](https://github.com/paperclipai/paperclip-docs/blob/main/docs/guides/org/adapters.md) 說明特定 Agent Runtime 是如何啟動或接入。[近期 Release](https://github.com/paperclipai/paperclip/blob/master/releases/v0.3.0.md) 也包含 Pi、OpenCode 的 Adapter，以及 Hermes Gateway 整合方向。

若系統已經在外部啟動數個 Subagent，不能假定只要開啟 Paperclip，所有 Subagent 就會以正確狀態出現在 Dashboard。純讀取整合仍需要真實事件或轉接器，把每個 Worker 的 ID、Task、Session、最後活動、執行結果映射到 Paperclip 的資料模型。沒有心跳的 Process 可能是閒置、等待、斷線或已死亡，不能全部標成正常運作。管理平面還可能**要求 Agent 執行新任務**，這個權限與只讀監控不同。

適當的整合可以分兩階段。第一階段建立**事件橋接器**，消費 Pi/OpenCode 既有的 Task Lifecycle Event，並以不可混淆的 Task ID 持續記錄，但不啟動任何工作。第二階段若確實需要，再透過 Adapter 加上工作派發、重試、審批與預算管理。如果只想看兩個本地 Worker 的狀態，簡單的 JSONL Event Feed 和普通 Dashboard 可能更便宜也更容易維護。

**結論：**Paperclip 在完成整合後可以成為 Agent 管理和監控介面，但不是任意現存 Process 的零設定即時鏡像。應為真正的協調與治理需求使用它，而不是把它誤認為自動讀取一切的旁觀工具。

### Code Mode 與最小可執行 Harness

[Cloudflare 的 Code Mode](https://blog.cloudflare.com/code-mode-mcp/) 透過可程式化 API，讓模型在一次 JavaScript 執行中組合多個工具呼叫，藉此減少大型工具 Schema 直接佔據 Context 的成本。[MCP 指南](https://developers.cloudflare.com/agents/model-context-protocol/guides/build-codemode-mcp-server/) 記載在隔離 Worker 中執行生成的程式碼，而非將每個外部服務操作都變成獨立的模型 Tool。

傳統方式可能讓模型連續選擇「搜尋檔案、讀檔、解析、再搜尋、摘要」並在每次 Tool Call 之後重新推論。Code Mode 可以把這些流程寫成含迴圈與條件判斷的程式，減少提示詞 Token 和模型、工具之間的往返。對 Local 27B 而言，這尤其可能減少處理大量工具描述所需的上下文。但它**不代表**外部 API 的實際呼叫量必然減少，也不保證自動得到更正確答案。生成程式碼必須限制執行環境、CPU/記憶體、允許的工具、每種操作授權和輸出大小。

如果只用 Python 的 `OpenAI().responses.create()` 產生一條 Shell Command，再交給 `subprocess.run(shell=True)` 執行，確實可以形成**最小的 Agent 形狀**：請模型提議動作、由人核准、執行、收集 stdout/stderr。但它還不是可靠的自主 Agent。危險不只在模型選錯命令，還在 Shell 會處理變數展開、重新導向、連接多條命令等效果，而自然語言中的「一條命令」不能形成真正的限制。使用者按下確認固然有幫助，卻不會讓任意 Shell String 成為安全邊界。

較合理的最小改善，是將命令改成結構化參數：

```python
# 示意性控制邊界，還不是完整沙盒。
ALLOWED = {"git", "rg", "python3"}
argv = proposed_command  # JSON 陣列，每個元素是字面參數
if not isinstance(argv, list) or not argv or argv[0] not in ALLOWED:
    raise PermissionError("Unsupported tool")
result = subprocess.run(
    argv, shell=False, cwd=approved_worktree,
    capture_output=True, text=True, timeout=30,
)
```

即使這樣，也仍須細分每個子命令、隔離檔案系統、規範破壞性操作。光是允許 `python3`，其實就可能執行任意程式。處理不可信任務時，應在真正的 Sandbox 或低權限 Process 中執行。可靠 Harness 還要有最大步數、持久化 Observation、重試的 Idempotency、測試驗證與明確停止條件。這是因為模型無論多強，都可能反覆循環或高估自己已經完成工作。

**結論：**如果本地模型需要呼叫大量小工具，Code Mode 的確值得研究，因為它能減少 Context 和 Tool Round Trip。但程式解譯器必須位於受限 Capability Boundary 後面。不能把簡單 `shell=True` Demo 的人工確認視為正式環境的安全機制。

### Graph、Loop、Harness Engineering：三個術語對應三個真正不同的控制面

這些名詞很容易被寫成口號，但實際上對應的都是具體軟體機制。

**Graph Engineering（圖式工程）** 定義任務依賴與合法狀態轉移。例如一個研究流程可以是「發現來源 → 擷取 → 比較 → 驗證 → 發布」，並對來源不足、重查與 CI 失敗設立不同分支。Graph 讓取消、平行工作與局部恢復變得明確。每個節點應輸出結構化內容，包括 Source ID 與驗證狀態，而非完全依賴自然語言。

**Loop Engineering（迴圈工程）** 決定一個節點內如何「觀察 → 選動作 → 執行 → 檢查 → 重試或停止」，包含 Context Compaction、Tool Output 截斷、錯誤分類、次數預算、模型回饋與進度查核。如果 Loop 設計不好，即使外層 Graph 正確，Agent 也可能浪費三十回合重新改寫同一個搜尋問題。

**Harness Engineering（執行框架工程）** 定義模型推論周圍的一切：工具、權限、檔案 Snapshot、Shell 執行、Prompt 建立、Cache、測試、Session 持久化、工作負載路由與結果檢查。Harness 可以讓一個中等模型產生可驗證成果，也可能讓很強的模型因 Context 混亂與工具回饋不足而失敗。

三者不是互斥的架構流派。Graph 問的是**哪些事情可以發生、順序為何**；Loop 問的是**如何決定當前的下一個動作**；Harness 問的是**模型實際能看見、執行和驗證什麼**。共同品質指標應是有證據、能重現的任務完成率，而非 Workflow 節點數或 Tool Registry 大小。

對本地 Agentic RAG 而言，務實做法是把 Query Rewrite 放在有步數限制的 Loop，個別保存帶 URL 與時間戳的 Evidence Object，並只讓 Graph 回到缺乏證據支持的主張。這並不需要額外建立一個「CEO Agent」。檢查證據覆蓋率，通常比每輪把整段研究對話重新送進模型更有用。

**結論：**先讓 Harness 與證據驗證正確，再增加大型 Graph。只有當任務有真正的分支、平行執行或復原需求，Graph 才能帶來明確價值。短而有停止條件的 Loop，通常比長時間無人監督的自我重複更可靠。


## 3. 搜尋與 RAG：索引知道什麼，網頁又實際說了什麼？

### Firecrawl Local 無法取代元搜尋引擎

[Firecrawl Local 的 README](https://github.com/firecrawl/firecrawl/blob/main/apps/local/README.md) 清楚區分 Rust 本地版的 `scrape`、`crawl`、`map`、批次內容擷取，與必須交給 **Firecrawl Cloud** 的 `search` 功能。[11 月 18 日發布公告](https://www.firecrawl.dev/changelog/firecrawl-local) 宣稱擷取速度改善 **37 倍**，閒置記憶體減少 **230 倍，約 11 MB**。比較基準是**舊版 Firecrawl Self-hosted 架構**，這不是對搜尋引擎的測速，也不是完整研究 Agent 的端到端效能。

[SearXNG](https://github.com/searxng/searxng) 則透過搜尋引擎專用 Adapter 整合外部搜尋結果。[JSON 搜尋 API](https://docs.searxng.org/dev/search_api.html) 若經管理員啟用，可直接供 Agent 取得候選網頁；但它沒有 Firecrawl 的通用網頁 Markdown 正規化與完整網站 Crawl API。兩者一個是來源發現層，一個是內容擷取層。

營運與隱私上也不同。Firecrawl Local 預設 `FIRECRAWL_CLOUD=auto`，搜尋、某些遭封鎖網頁的備援擷取，以及特定資料供應商可能連向 Cloud。不允許這類行為時，應設定 `FIRECRAWL_CLOUD=off`，並對不可信來源使用官方提供的 `--public-only` 私有位址保護。執行檔安裝在本地，不代表它不會呼叫雲端服務。

先前已刊登一篇獨立的 [Firecrawl Local 與 SearXNG 深入比較](#/writing/firecrawl-local-vs-searxng-2026-11-22)，涵蓋 API 路由與內網保護。這裡的系統結論是：搜尋層負責提出 URL，擷取層讀取選定文件，最後由 Agent 明確檢查證據，不能把找到資料誤認為已經得到答案。

**結論：**Firecrawl Local 可以改善特定文件的擷取和清理，卻不能取代 SearXNG。不要只因想「在本地搜尋 Google」就部署 Firecrawl。當網站遍歷、PDF、JavaScript 渲染或已確認的內容擷取失敗確實需要額外能力時，再引入它。

### SAG2 不使用 Embedding，但仍然建立索引

[SAG Wiki 架構說明](https://github.com/Zleap-AI/SAG-Wiki/blob/main/docs-site/content/docs/architecture.en.mdx) 與 [SAG2 方法文件](https://github.com/Zleap-AI/SAG-Wiki/blob/main/docs-site/content/docs/sag2.en.mdx) 提供了向量索引以外的檢索方式。它在本地**確實建立全文索引**，但匯入時**不計算 Embedding 向量，也不要求 LLM 先逐份文件建立語意摘要或關係圖**。查詢時先以類 BM25 的詞彙檢索選出候選段落，再透過 JEV（Joint Evidence Verification）判斷段落是否能支持問題；已取得的證據可提供擴充關鍵詞，進入下一輪檢索。結果保留原始檔案路徑與來源位置。

因此，「SAG2 完全不用預處理和建立索引」是錯誤敘述。索引建立、斷詞與統計仍需要時間及磁碟；它節省的是**Embedding 模型與離線語意抽取階段**。但純詞彙召回也可能找不到用不同字詞表述的證據。Query Expansion 和 Evidence Judgment 可以緩解這個限制，卻仍有實際運算成本。

[官方 Benchmark 重現專案](https://github.com/Zleap-AI/SAG-Benchmark) 也區分索引建立、檢索與完整 Agent 問答。其本地索引速度測試排除部分檔案匯入和驗證工作，且未清除作業系統檔案快取。因此不能把這組數字直接拿來與量測不同階段的向量 RAG 系統比較。JEV 只給出**證據判斷與段落排序**，最終回答依然由其他 LLM 生成。所以「SAG2 取代 RAG」在架構上也不成立；SAG2 是能放進 RAG 的一種檢索演算法。

| 階段 | 一般 Embedding RAG | SAG2／SAG Wiki |
| --- | --- | --- |
| 匯入 | 切塊、計算向量、儲存 Embedding | 解析原始檔、斷詞、建立全文索引 |
| 候選召回 | 向量相似度，可搭配混合檢索 | 詞彙／BM25 風格召回 |
| 證據判斷 | 可選的 Reranker 或 LLM | JEV 證據評估 |
| 多跳搜尋 | Query Rewrite、Graph 或 Agent Loop | 依證據擴充詞彙與重複搜尋 |
| 最終文字 | Answer LLM | Answer LLM；JEV 不負責寫答案 |

**結論：**若本地文件經常更動，希望避免 Embedding 成本與依賴，SAG2 值得研究。但要證明它比 Hybrid Lexical/Vector Retrieval 好，仍需在相同證據問題下量測完整的匯入、搜尋、回答流程。不論使用哪種檢索方式，都要有明確的無答案出口及來源檢查。

## 4. 研究工具能產出文件，卻不能保證研究成立

### PaperOrchestra 可以寫出 LaTeX，不能替實驗保證真實性

Google Cloud AI Research 的 [PaperOrchestra](https://github.com/google-research/paper-orchestra) 把論文大綱、文獻研究、章節寫作、修改與繪圖拆給不同 Agent，再從構想與實驗紀錄產出 LaTeX 論文。Repo 有實際程式碼、自動評審／評估腳本、設定與模板整合，而非只是一張 Agent 流程圖。它展現的是內容製作工程，不等於宣稱 LLM 能無中生有發現新的科學成果。

五個角色各自有明確工作。大綱 Agent 把原始材料整理成章節需求；文獻 Agent 搜尋及挑選參考資料；寫作 Agent 產生初稿；修改 Agent 審閱和重寫；繪圖 Agent 把提供的資料轉成視覺化內容。若所有 Agent 共用一份錯誤引用或虛構實驗結果，專業分工只會讓錯誤以更完整、漂亮的形式傳播。PDF 能編譯成功，只證明格式和部分 LaTeX 語法可用，不代表引用正確或實驗可重現。

技術刊物所需要的完成標準應更嚴格：每項數據能追溯到原始實驗 Artifact；引文真實存在且真的支持相關敘述；圖表的原始資料和繪製程式可檢查；發布前有人或獨立驗證流程能將文字與 Log 對照。PaperOrchestra 最適合接受已經驗證的證據，再自動化其稿件製作，而非取代研究設計與文獻判斷。

**結論：**當實驗本身可信、真正的瓶頸是產出格式一致的論文時，多 Agent 寫作工具有價值。若根本沒有先驗證資料，增加寫作 Agent 只會改善排版，不會改善科學品質。

### FastFrames-L：14B 互動式影片生成，不等於能在 Mac mini 上執行

[Apple FastFrames-L](https://huggingface.co/apple/FastFrames-L) 是 **14B 自迴歸、兩步驟 Video Diffusion 模型**，不是一般文字 LLM、RAG 的圖片編碼器，也不是能直接拿來處理 Agent 影片的普通 API。它先將 Wan2.1-14B 蒸餾成兩步驟的 Causal Generator，再訓練 Pixel Decoder 與 KV Refinement Network。小版本 FastFrames-S 則是 **1.3B**，兩者目標都是讓 480p 影片生成延遲降低。

[官方模型卡](https://huggingface.co/apple/FastFrames-L) 提供 FastFrames-S 在**單張 GPU、KV Cache 已填滿**時的每幀元件計時：兩次 DiT 約 **16.1 + 16.2 ms**、KV Refinement **2.2 ms**、Pixel Decoder **0.9 ms**，總共 **35.4 ms**。若只看元件總時間，理論上相當於每秒約 28 幀；這不是包含介面及影片編碼的端到端 FPS，更**不是 FastFrames-L 的測試結果**。範例生成 832×480、81 幀、16 FPS 的影片。

原始專案的安裝條件明確指定 **Linux x86-64、NVIDIA GPU、CUDA 12.8 相容 Driver**，而 `ff-l` 的延遲量測指令使用 **8 張 GPU**。不能因作者是 Apple，就假設已具備 Apple Silicon Metal 版本。若要把 14B Video Diffusion 的特製 Operator、狀態快取與記憶體管理搬到 MLX，實際上是一項完整的移植工程，不是把 PyTorch Import 改掉即可。

**結論：**FastFrames 對低延遲互動世界與影片生成有研究價值，但原始文件不足以支持「32 GB 基礎 M4 可以實用執行」的說法。35.4 ms 只屬於小版本的特定 GPU 元件測試。

### PyBot：用程式碼而非模型權重執行聊天行為

Hugging Face 的 [PyBot](https://github.com/huggingface/pybot) 是「聊天機器人是否一定需要神經網路推論？」的一個實際對照。官方說明超過 **1,000 個 Agent** 產生 **5,000 個以上規則系統版本**；最後約有 **64 萬行 Python、528 個原始碼檔案**，另外有約 **55 萬行測試**。其核心由 Pattern Matching、知識表、回應模板、記憶機制與負責選擇候選回應的 Arbiter 組成，回答使用者問題時不載入神經網路權重。

[Repo README](https://github.com/huggingface/pybot) 報告它在 **SmolTalkBench** 的 **26% Win Rate**，由 LLM Judge 將輸出和參照答案比較，並稱在該設定下與 SmolLM-360M-Instruct 接近。這不代表規則系統已經擁有 360M 語言模型的泛化能力，也不能只靠 LLM Judge 確定其事實可靠性與對抗樣本表現。README 本身還說明：由於需載入龐大的 Python 原始碼，啟動需要數秒，回答約一秒。因此「沒有模型權重」不代表「沒有運算和維護成本」。

真正值得注意的是，Agent 可以**產生一套固定、可執行的行為程式**，而不只是生成文字。對範圍明確、可測試的抽取、格式轉換、路由與規則判斷，這種設計很有啟發性。但數十萬行自動生成的分支，也可能比小型分類模型更難驗證，並在未涵蓋的輸入模式上突然失效。

**結論：**PyBot 是研究 Agent 產生程式碼與規則式推論的重要 Artifact，並非「語言模型已不需要訓練」的證據。是否值得取代模型，必須先檢查實際測試集、評分方式、規則可維護性及未知輸入行為。

## 5. 介面與旁支技術實驗

### Henge：iPhone 能啟動 macOS，就代表可以實際使用嗎？

[Henge](https://github.com/Leviidev/Henge) 是在 iOS/iPadOS 上模擬 macOS 的專案。一般 iOS App 沒有執行完整 macOS Guest 所需的虛擬化能力，因此 Henge 自己實作 ARM64 JIT、虛擬記憶體管理、虛擬裝置與圖形重播。[架構文件](https://github.com/Leviidev/Henge/blob/main/docs/architecture.md) 說明 macOS Image 如何安裝，以及自製引擎如何與 iOS App 整合。成功看到登入畫面是重要的模擬器進展，但與能用它完成工作仍有很大距離。

Repo 展示與新版本確實有持續進展，也有不同裝置的實測問題。[iPhone 14 的 Issue](https://github.com/Leviidev/Henge/issues/59) 記錄安裝至約 80% 時因資源壓力被終止；[iPhone 12 Pro Max 的 Issue](https://github.com/Leviidev/Henge/issues/13) 記錄系統記憶體耗盡；[M5 iPad Pro 測試](https://github.com/Leviidev/Henge/issues/26) 提到圖形、滑鼠輸入及瀏覽器故障。這些是特定裝置與版本的個別報告，不能直接當成全部裝置的 FPS 統計，但足以反駁「可以 Boot 就等於完全可用」。

實用性評估應測量完整工作流程：安裝是否完成、開機、觸控／滑鼠輸入、Finder 操作、網頁渲染、當機率、Swap、記憶體壓力和持續運作的熱限制。一段 15 秒進入鎖定畫面的 Demo，無法說明 Safari 或日常 App 是否能完成正常工作。

**結論：**Henge 是具有明確技術突破的模擬器實驗，但尚缺足夠證據把它視為 iPhone 上可取代 Mac Desktop 的實用方案。應以真正的互動任務評估，而不是只看能否開機。

### Umless：本地語音輸入真正值得關注的是文字修正流程

[jatinbishla/Umless](https://github.com/jatinbishla/Umless) 將本地 ASR（Automatic Speech Recognition，語音辨識）、可選文字整理模型，以及系統文字插入組合成一套 Dictation Workflow。這三者的區別很重要：一般 ASR 嘗試轉錄每個停頓與口誤，但寫作型語音輸入需要在保留**原本意圖**的前提下，移除不必要的語助詞與自我修正。[架構文件](https://github.com/jatinbishla/Umless/blob/main/ARCHITECTURE.md) 記載 ASR、編輯、插入步驟，以及不同平台使用的 Accessibility 或輸入介面。第三方整理列出套件大約 **Lite 678 MB**、**Standard 1.9 GB**、**Max 3.5 GB**，語言支援不同。這些是安裝體積，不是品質與延遲的測試數字。

對本地工作站來說，真正的產品品質問題是：辨識和整理是否錯改技術名詞、程式識別字或數字。文字應能再編輯，也應讓使用者分辨原始辨識內容與整理後內容。如果為了上下文修正而讀取目前視窗，這就是需要明確說明的隱私權限，即使模型完全在本機執行也一樣。macOS、Windows、Linux 的輸入注入和 Undo 行為也不完全相同。

**結論：**如果本地語音輸入確實減少人工修正時間，又不破壞專業名詞，它就有實際價值。但套件大小不足以證明辨識更準；合理測試語料應包含停頓、專有名詞、中英混用與程式詞彙。

## 6. 複雜度理論延伸：P = NP 並不能證明我們活在模擬之中

哲學家 Nick Bostrom 的[模擬論證](https://simulation-argument.com/simulation.pdf) 是有條件的三難論證：文明是否能達到後人類能力、是否願意大量執行祖先模擬，以及模擬觀察者在人口中的相對比例。它沒有證明高級文明必然存在，也沒有證明模擬宇宙必須精確計算所有量子自由度。

假設 **P = NP** 成立，代表在傳統計算複雜度定義下，NP-complete 的**決策問題**存在多項式時間演算法。這不會自動讓所有物理模擬都變得便宜。多項式仍可能有不實用的高次方或巨大常數；判斷問題是否有解與將長時間量子動力學以任意精度數值模擬，是不同難題；許多涉及量子態、精度、隨機過程或更高複雜度類別的問題，也無法僅憑 P 與 NP 的關係就判定能高效率處理。就算某些最佳化可在多項式時間求解，也不會憑空產生能源、穩定硬體、足夠記憶體，或讓文明願意大量製造模擬。

「P = NP，因此可以大量且廉價地模擬完美宇宙，因此我們幾乎必然處於模擬中」至少跳過了四個前提：物理模擬確實有效率、真的存在大量具有意識的模擬觀察者、觀察者參照類別如何定義，以及如何合理計算我們的觀察者位置機率。單靠 P = NP 或想像中的模擬數量都無法證明這些條件。模擬論證值得討論的是條件式推理，而非在沒有實證時宣告精確機率。

**結論：**計算複雜度會影響某些模擬的成本，但 P vs NP 並不能決定世界是否被模擬。這是另一個提醒：從技術可能性推出巨大結論時，不能省略中間的假設。

## 7. 對本地 Agent 系統的整體結論

這些工具最值得學習的共同點，是整體系統有不同、可相對獨立改良的層次：模型、推論引擎、工具介面、工作流程，以及證據品質。若把所有差異壓成單一「最強本地 Agent」排行榜，反而無法做出合理工程判斷。

對資源有限的工作站，一個可驗證的基礎架構可以是：

1. **模型服務：**使用已確認相容、在本機量測過的 oMLX/MLX 或 llama.cpp。記錄 MTP、LoRA、Speculative Drafter 是否真正啟用。小模型可處理分類或路由，較大模型負責需要複雜推理的工具操作和整合。
2. **Agent Harness：**以 Pi 或 OpenCode 提供明確工具權限、Task ID、有限次數重試及每任務獨立工作目錄。選擇理由應是其具備的生命週期控制，而非品牌名稱。
3. **研究工具：**SearXNG 或其他 Search Backend 發現來源；簡單 Fetcher 處理一般網頁；Firecrawl Local 或 Browser 僅在必要時接手。SAG2 或實際測試過的混合索引處理可重複使用的本地文件。每個最終主張保留可檢查的 Evidence Location。
4. **Orchestration 與 UX：**持久 Task 狀態應獨立於聊天視窗。手機透過驗證的私有連線讀取狀態；Push 另行處理。管理 Dashboard 必須消費真實事件，不能虛構 Worker 的健康狀態。
5. **驗證：**依任務性質設立完成標準。程式可 Build 不代表研究結論正確；Benchmark 領先不代表事實可靠；LaTeX 或影片成功產出，也不等於實際應用品質好。

最後的工程選擇不應只用模型排行榜，而要從失敗症狀找出適當處理層次：

| 觀察到的問題 | 最先檢查哪一層 | 需要的證據 |
| --- | --- | --- |
| 本地生成太慢 | Runtime、量化、Draft 與 Cache | 相同 Context 下的 Tokens/s、TTFT、記憶體 |
| Tool Call 重複或錯誤 | Harness、模型／工具適配、權限 | 任務成功率、Tool Trace、重試與退化 |
| 搜尋找不到事實 | 查詢策略、檢索索引 | 標註資料下的來源召回與答案支持程度 |
| 網頁缺乏可用內容 | 擷取器、Browser 備援 | 單頁擷取成功證據與失敗來源 |
| 手機無法恢復 Agent 工作 | Server／Auth／Session UI／Push | 重新連線、權限確認、通知傳遞測試 |
| Agent 宣稱完成卻沒有成果 | 驗證與發布守門 | 實際 Artifact、CI、Deployment SHA、公開網址 |

還有一個比較不討喜、卻重要的觀察：許多工具提供了非常亮眼的**官方測試**，但真正與 32 GB 基礎 M4 同條件的資料少得多。這不代表所有新工具都不可信，也不代表每一節都只能說「還需要更多研究」。更合理的做法是先確認技術機制與可支持的條件式判斷，把缺少的跨平台推論與已證實的結果分開。

本地 Agent 下一階段真正值得追求的，不只是更快的 27B 或更多 Extension，而是**在有限資源下產出經過驗證的工作**：系統知道搜尋過什麼、取得了哪些證據、模型實際執行了什麼、為何某個 Benchmark 能或不能套用，以及最後有哪些成果真的完成交付。這才是採用上述工具時應該使用的判準。
