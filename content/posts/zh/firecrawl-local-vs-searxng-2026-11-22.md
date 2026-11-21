---
title: "搜尋不等於擷取：Firecrawl Local 與 SearXNG 在 Agentic RAG 中的真正分工"
date: "2026-11-22"
category: "Minerva's Den"
tags: ["Agentic RAG", "Web Search", "Firecrawl", "SearXNG", "Local-first"]
stamp: "VERIFIED"
sources:
  - "https://www.firecrawl.dev/changelog/firecrawl-local"
  - "https://github.com/firecrawl/firecrawl/blob/main/apps/local/README.md"
  - "https://docs.searxng.org/dev/search_api.html"
  - "https://docs.searxng.org/dev/engines/engine_overview.html"
---

本地研究 Agent 需要解決兩個不同問題：**哪些網頁可能包含答案？**以及**選定的網頁實際寫了什麼？**混淆這兩個問題，很容易裝上多餘的服務。這也正是為何 2026 年 11 月 18 日發布的 [Firecrawl Local](https://github.com/firecrawl/firecrawl/tree/main/apps/local)，經常被拿來與 [SearXNG](https://github.com/searxng/searxng) 比較。

**先給結論：**SearXNG 適合負責搜尋與發現來源；Firecrawl Local 可以在網址確定後，選擇性地擔任內容擷取層。它既不能直接取代聯邦式搜尋，也不是每一個 RAG 系統都需要。這是兩者 API 與官方文件可直接確認的功能界線。

## 從 API 就能看出分工

SearXNG 是「元搜尋引擎」（metasearch engine），透過各搜尋來源的轉接器送出查詢，再彙整結果。Agent 可以向自架實例要求 JSON：

    curl 'http://localhost:8080/search?q=site%3Agithub.com+agentic+rag&format=json'

上述主機與埠號只是示例。[官方搜尋 API](https://docs.searxng.org/dev/search_api.html) 在 `/` 和 `/search` 支援 GET/POST、必要的 `q` 查詢參數，以及類別、語言、分頁與選用的 JSON/CSV/RSS 輸出。但 **JSON 不保證可用**：管理員必須在 `settings.yml` 啟用，許多公開實例會關閉它。查詢語法也會送往外部引擎，因此 Google 支援的運算子不保證其他引擎有相同行為。SearXNG 負責找出候選來源，並沒有通用的「把任意網頁整理成乾淨 Markdown」介面。

Firecrawl Local 的工作剛好位於下一層。[官方 README](https://github.com/firecrawl/firecrawl/blob/main/apps/local/README.md) 記載了一個 Rust 執行檔，提供本地 `scrape`、`crawl`、`map`、批次擷取，以及透過 `127.0.0.1:3002` 對外提供部分 Firecrawl v2 API 或 MCP 介面。

| Agent 要解決的問題 | SearXNG | Firecrawl Local |
| --- | --- | --- |
| 從多個搜尋服務找到相關頁面 | 整合外部搜尋結果 | `search` 會轉交 Firecrawl Cloud |
| 取得選定網址的完整內容 | 沒有通用 Markdown 擷取 API | 本地輸出清理後的 Markdown、HTML、原始 HTML 或連結 |
| 找出文件網站的頁面 | 可能由一般搜尋找到部分網址 | `map` 讀 sitemap 與入口頁；`crawl` 沿連結爬取 |
| 處理需要 JavaScript 的網頁 | 搜尋結果無法取代渲染 | 可呼叫已安裝的 Chrome/Chromium 本地渲染 |
| 正規化 PDF 或 Office 文件 | 並非通用文件解析器 | 支援本地文件解析 |
| 使用雲端等級的結構化 JSON、截圖或瀏覽器操作 | 不提供 | 本地版功能有限，部分屬於 Cloud |

這是依據 [Firecrawl Local 文件](https://github.com/firecrawl/firecrawl/blob/main/apps/local/README.md) 與 [SearXNG 引擎架構](https://docs.searxng.org/dev/engines/engine_overview.html) 整理的**功能比較**，不是速度測試。網站 sitemap 也不等於全網搜尋索引；知道單一網域有哪些 URL，不代表知道應該先查哪個網域。

## 「本地」究竟保證了什麼？

[11 月 18 日的發布公告](https://www.firecrawl.dev/changelog/firecrawl-local) 宣稱，新 Rust 版本相較舊 Firecrawl self-hosted 架構，**擷取速度快 37 倍**、**閒置記憶體少 230 倍**，新原語閒置約 **11 MB**。這些是官方宣稱，而且基準是舊 Firecrawl 自架服務。它們**不是**和 SearXNG 的對照測試，不是整套研究 Agent 的端到端延遲，也不表示開啟 Chromium 處理動態網頁時只需要 11 MB。目前公告沒有提供可據此確認的獨立、同條件 Mac mini 重現測試。

隱私方面也有一條容易忽略的界線。README 明確指出，Firecrawl Local 的搜尋會交給 Firecrawl Cloud，並沒有在本地維護網頁搜尋索引。預設 `FIRECRAWL_CLOUD=auto` 下，本機無法取得的單頁內容可能送交 Firecrawl Cloud 重新抓取；回傳會標記 `"source": "firecrawl-cloud"`。Alexandria 資料供應商同樣是雲端服務。因此，**安裝在本機並不代表所有網址與內容請求都留在本機**。

需要嚴格關閉 Cloud 時：

    cargo install firecrawl-local
    FIRECRAWL_CLOUD=off firecrawl-local serve

之後 Firecrawl SDK 可連接 `http://localhost:3002`；本地服務提供 `POST /v2/scrape`、`/v2/map`、`/v2/crawl` 和批次擷取。它不提供舊版 v0/v1 路由。Crawl 與批次工作存放在記憶體，約一小時後到期，不是能跨程序復原的持久任務佇列。本地 `json`、`summary` 擷取格式會略過並提出警告。

MCP 模式透過 `firecrawl-local mcp` 啟動；README 記載它使用 `npx` 啟動 `firecrawl-mcp` 套件，因此該模式需要 Node.js 22 以上。這不表示單純的 Rust CLI 擷取也必須透過 Node 執行。

## 安全邊界與效能同樣重要

[README 安全章節](https://github.com/firecrawl/firecrawl/blob/main/apps/local/README.md#security) 有一個重要差別：直接執行 `scrape`、`crawl`、`map`、`mcp` 時，預設可能存取 localhost 與私有網路；`serve` 則預設綁定 loopback，且禁止對私有位址發出請求，除非明確開放。如果 Agent 從不可信網頁取得下一個要打開的 URL，這會直接影響內部服務是否可能被碰觸。

對不可信網站執行 MCP 時，官方提供：

    firecrawl-local mcp --public-only

這項限制並不能讓網頁文字自動變成可信指令。擷取結果應視為資料，不能直接授權 Agent 開啟內網網址、執行 shell 指令或修改應用程式。README 也記載對 link-local、雲端 metadata 位址及瀏覽器代理的限制。動態渲染依然需要實際瀏覽器資源，且會受到目標網站存取條件影響。

SearXNG 面臨的風險不同：外部搜尋引擎可能變更頁面格式、限制流量、要求驗證或直接拒絕。它的[引擎架構](https://docs.searxng.org/dev/engines/engine_overview.html) 本來就依賴來源專用的轉接器，而[限流文件](https://docs.searxng.org/admin/searx.limiter) 也記載實例端的機器人過濾。自架搜尋介面能增加配置控制，但無法保證上游引擎永遠提供結果。

## 對 Agentic RAG 的實際架構建議

對會改寫查詢、重複搜尋並交叉查證的 Agent，適當分工如下：

1. **搜尋：**將改寫後的查詢送往已開啟 JSON 輸出的 SearXNG，整理、去重並選出候選 URL。
2. **擷取：**對挑選出的權威來源，先使用系統現有、最簡單且可靠的 HTTP 抓取與 HTML 轉文字方法。只有在連結探索、JavaScript 渲染、PDF 或清理品質確實需要時，才升級使用 Firecrawl Local。
3. **驗證：**記錄原始網址、取得時間、頁面標題，以及有沒有使用瀏覽器或雲端備援。擷取失敗或遭封鎖的頁面不能假裝已提供證據。
4. **檢索與合成：**有重複使用價值的文件再切塊或建立索引，保留引用來源，證據不足才重新搜尋。搜尋器與爬蟲都不會自行完成 Agentic RAG 的查證迴圈。

Firecrawl [主儲存庫](https://github.com/firecrawl/firecrawl) 也清楚區分輕量 Local 與包含資料庫、Worker、Queue 的完整自架版。只為抓取少數頁面而部署整個重型服務，工程成本完全不同。

**工程結論：**需要發現資料來源就保留 SearXNG；只有當現有 Fetcher 確實遺漏內容，或需要網站遍歷、文件正規化時，才加上 Firecrawl Local。需要完全本地資料邊界就設定 `FIRECRAWL_CLOUD=off` 並檢查警告，不應把官方 37 倍宣傳當成已測得的整套 Agent 加速。如果一般 HTTP 抓取已能提供乾淨、足夠的文字，沒有必要再額外部署 Firecrawl。