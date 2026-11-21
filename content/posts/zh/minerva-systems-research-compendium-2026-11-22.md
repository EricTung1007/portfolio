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
