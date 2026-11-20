---
title: "超越滑鼠游標：打造真正能完成工作的 Agent"
date: "2026-11-20"
category: "Minerva's Den"
tags: ["Computer Use", "macOS", "Agent Systems", "Accessibility", "Open Source"]
---

讓 AI 助手修改文件已經很實用。如果它修改文件時，人還能在同一台電腦上繼續操作另一個 App，這就不只是自動化，而是一種不同的人機協作介面。

多數 Computer Use 展示都讓 Agent 控制螢幕上的游標，點擊、輸入、切換視窗。影片很好看，實際共用電腦卻很麻煩：人與 Agent 爭奪同一個滑鼠、鍵盤焦點、前景視窗，有時甚至是剪貼簿。只要人稍微碰一下電腦，Agent 的下一次點擊就可能落在錯誤的 App。長任務等於暫時徵用了整台機器。

一批開源專案正在作業系統層級解決這個問題。它們的核心技術是讓 Agent 在**不把目標視窗帶到最前面**的情況下，觀察並操作 App。這篇文章比較幾種實作，拆解它們如何做到背景操作，以及「一台電腦、兩個操作者」在哪些情況下仍會失敗。

## 為什麼不應把滑鼠當成唯一的操作介面？

傳統桌面自動化把游標移到座標，點擊，再輸入文字。這個流程暗中假設自動化程式擁有整個桌面的控制權。在專用測試機上問題不大；在人也要同時使用的電腦上，這個假設就不成立。

macOS 在可見的滑鼠游標底下，還提供好幾種不同介面。**Accessibility API** 能暴露按鈕、文字欄位、元件角色、數值與支援的操作。程式可以呼叫 `AXPress` 直接按下控制元件，或透過 Accessibility Value 設定文字，而不必真的模擬鍵盤輸入。**ScreenCaptureKit** 能擷取指定視窗的畫面，即使它被其他視窗遮住。CoreGraphics 與其他事件傳送機制，則能嘗試把輸入送往特定 Process 或 Window。

但這些能力不能混為一談。能擷取背景視窗，不代表一定能在背景點擊。讀得到按鈕名稱，不代表自繪 Canvas 也提供可用的 Accessibility Action。把按鍵事件送給某個 Process，也不保證該 App 內部的 Focus 狀態正確。

因此，可靠的實作通常會有一個逐級退回的操作流程：先觀察視窗、找到語義元件、嘗試 Accessibility Action；必要時改用 Window 或 Process 導向事件；只有前面的方法都不適用，才考慮真的移動系統游標。每次操作後都重新觀察結果。所謂 **Background-safe** 應該是對特定 App、特定操作的保證，不能當成所有 GUI 操作都通用的標籤。

## 五個開源專案，五種操作契約

這些專案想解決的問題相近，但它們對 Agent 暴露的介面差異很大。

| 專案 | 架構 | 適合的情境 | 主要取捨 |
| --- | --- | --- | --- |
| [Cua Driver](https://github.com/trycua/cua/tree/main/libs/cua-driver) | Rust Runtime、MCP／CLI、Python／TypeScript SDK | 跨平台整合、測試與 Sandbox | 系統較完整，各平台操作能力仍有差異 |
| [computer-use-mcp](https://github.com/minghinmatthewlam/computer-use-mcp) | Swift、共用 Daemon、Per-app Lease | macOS 背景控制與多 Client 並行 | 尚未達 1.0，須嚴格控制全域操作 |
| [OpenComputerUse](https://github.com/IAmJSD/OpenComputerUse) | Session-based MCP、桌面 App、跨平台 Adapter | 指定 App Session、Recipe、裝置操作 | 功能較多，系統也較複雜 |
| [computer-harness](https://github.com/huytieu/computer-harness) | Python CLI／Daemon、macOS 公開 API | 精簡、可閱讀的本機自動化 | 可執行任意 Python，權限邊界較寬 |
| [agent-desktop](https://github.com/vercel-labs/agent-desktop) | Accessibility-first CLI／Library | 具語義結構的桌面 UI | 自繪介面未必提供足夠 Accessibility 資料 |

### Cua Driver：它是驅動程式，不是另一個 Agent

[Cua Driver](https://github.com/trycua/cua) 屬於更大的 Cua 生態，還包含 Sandbox、Benchmark 與 [Lume](https://github.com/trycua/cua/tree/main/libs/lume) 虛擬化工具。這個區分很重要：Driver 提供操作電腦的眼睛與雙手，Claude Code、Codex、OpenCode 或其他 Harness 才負責判斷要做什麼。Driver 本身不需要呼叫語言模型 API。

底層以 Rust 實作，可以透過 Model Context Protocol（MCP）、CLI 或產生的 SDK Binding 使用。MCP 是讓 Agent Client 發現並呼叫外部工具的通訊協定。以 Claude Code 為例，官方提供的註冊指令是：

```bash
claude mcp add --transport stdio cua-driver -- cua-driver mcp
```

Cua Driver 也提供權限模式。Bounded Mode 會依照經審核的 Capability Manifest 限制工具與資源。這比在 Prompt 裡要求模型「小心一點」更可靠，因為限制實際存在於 Runtime。可選的 Perception Extension 能辨識截圖上的區域，但它和 MIT 授權的核心程式有不同的授權條件；透過截圖辨識出的點擊，也會使用 Capture ID 避免過期畫面被拿來授權新操作。

Cua 生態的另一個優勢是可重現實驗。獨立 VM 或 Sandbox 能直接給 Agent 一個自己的桌面，比背景事件傳送更徹底地避免干擾。不過完整 macOS VM 需要額外儲存空間與記憶體。對 32GB 的 Mac，同時運行 Guest macOS 與大型本地模型，成本不低。

**適用判斷：** 如果希望同一套 Computer Use 工具接上多種 Harness、跨作業系統使用，或需要 Sandbox 和 Benchmark，Cua Driver 是合理起點。若只需要操作現有桌面，先採用獨立 Driver，不必一開始就部署整套 Spaces。

### computer-use-mcp：多個 Agent 會帶來並行控制問題

[computer-use-mcp](https://github.com/minghinmatthewlam/computer-use-mcp) 特別重視 macOS 自動化如何與人類同時工作。它以 Swift 實作，透過標準 MCP 提供服務。不同 MCP Client 使用精簡的 stdio Shim 連線到同一個 Engine Daemon，由 Daemon 統一負責螢幕擷取、Accessibility、事件傳送，以及另外繪製的 Agent Cursor。

其中很值得注意的是 **Per-app Lease**。假設兩個 Agent 同時修改同一份試算表，即使它們都沒有搶走人的滑鼠，彼此的操作仍可能交錯，導致資料錯亂。Daemon 透過短時間的 App Lease 避免兩個 Session 在同一 App 內同時執行互相干擾的動作。這是 Concurrency Control（並行控制），不是視覺特效。

它的操作順序也寫得很清楚：Accessibility Action、Per-window Event、Per-process Event，最後才是需要明確允許的 Global Cursor Fallback。每次修改後重新取得畫面和狀態。Element ID 會對應到特定 Snapshot Generation；如果元件已經失效，操作應回報錯誤，而不是猜測新位置。

README 將專案標為 Pre-1.0，並說明 Mac 鎖定時，會暫停修改類操作。它也解釋了穩定簽章的重要性：macOS 的 Accessibility 和 Screen Recording 權限與 App 身分有關。若每次重編譯都讓系統認為是不同程式，授權管理就會變得非常麻煩。

使用 Swift 開發環境可從原始碼建置：

```bash
git clone https://github.com/minghinmatthewlam/computer-use-mcp.git
cd computer-use-mcp
swift build -c release
.build/release/computer-use-mcp doctor
```

**適用判斷：** 如果主要目標是 macOS 背景操作，而且可能有多個 Agent Client 同時執行，這個專案很值得研究。即使不直接部署，它的 Per-app Lease 與明確 Fallback Policy 也值得借鑑。

### OpenComputerUse：用 Session 定義操作範圍

[OpenComputerUse](https://github.com/IAmJSD/OpenComputerUse) 選擇另一種設計。MCP Client 先針對 App 呼叫 `start_session`，取得 Session ID，再用這個 ID 操作，最後呼叫 `end_session`。在 macOS 上，由桌面 App 持有權限與 Session，MCP Server 只是精簡 Client。如此一來，每次工作都有明確目標，不再是「隨時可以點整台電腦」的模糊能力。

它提供截圖、Accessibility Tree、Element Action、文字輸入、檔案選擇器處理，以及可見的 Agent Cursor。特別有意思的是 `run_recipe`：一組直線式的操作步驟，可以交給較小的 Decision Model 在目前 UI 元件中選擇動作，不需要每一步都重新呼叫上層通用模型。當某個步驟找不到可靠對應元件時，Recipe 會停止並回傳狀態，不會憑空宣布成功。

OpenComputerUse 也支援可選的結構化資料擷取，例如透過 Cloudflare Clairic，以及其他外部服務提供的 Recipe Decision Model。這帶來一個實際的資料邊界問題：**本機 Desktop Driver 與可選的模型擷取功能，不一定都完全離線。** 如果目標是純本地自動化，就應停用不需要的雲端功能。

官方 README 提供 macOS 第三方 Homebrew Tap 與 Release 安裝方式，也介紹 Linux、Windows Adapter，以及可選的手機、模擬器 Session。這使它比單純的 macOS Accessibility Wrapper 更廣泛。

**適用判斷：** 如果需要明確 Session 管理、可視化工作狀態、App 專用自動化與可重複 Recipe，OpenComputerUse 的架構很合適。手機整合則只在工作真的需要操作手機時才有意義。

### computer-harness：極簡設計，也有很明確的安全代價

[huytieu/computer-harness](https://github.com/huytieu/computer-harness) 提供更小的操作介面。Python CLI 把一段程式交給本地 Daemon，程式可以讀取 App 狀態、執行 Accessibility Action，或直接設定欄位：

```python
st = get_app_state("Notes")
click("Notes", element_index=4)
set_value("Notes", 7, "hello")
```

預設模式不移動真正的游標；需要座標點擊、打字、拖曳時，則可明確啟用前景模式。專案作者在 README 中記錄了背景視窗擷取、Accessibility 點擊和直接更新欄位的端到端驗證。

簡單的代價也很清楚。CLI 會以目前使用者身分執行任意 Python，而 Daemon 持有強大的 Accessibility 與 Screen Recording 權限。只要同一使用者的其他 Process 能連上 Socket，就可能借用這些能力。README 也指出截圖儲存在本機檔案中，沒有自動清除機制。

**適用判斷：** 對可信任的單人環境、實驗和可審查的本地腳本，這種精簡設計很有吸引力。但不適合直接執行不可信任的 Agent 生成 Python，也不宜毫無限制地交給長時間無人監督的工作。

### agent-desktop：優先使用 UI 語義，而不是猜像素

[Vercel Labs 的 agent-desktop](https://github.com/vercel-labs/agent-desktop) 也屬於這類工具，它優先透過 Accessibility 讓上層 Agent 操作桌面元件，本身不需要內建語言模型。其基本設計很合理：如果一個 Button 已經有名稱、角色和支援的 Action，Agent 就應優先使用這些資訊，而不是從截圖猜它的座標。

代價是涵蓋率。標準原生對話框通常有良好的 Accessibility 資料，自繪圖形、遊戲及部分內嵌網頁元件卻可能不足。因此仍需要視覺備援。架構上最重要的區分，是把**如何觀察 UI**與**如何對 UI 執行動作**分開，然後驗證實際狀態。

## 更難的問題：兩個 Agent 操作同一個 App

不搶人類游標，只解決了第一層衝突。想像一個人正在編輯文件，而 Agent 同時修改同份文件的另一段。即使兩者都沒有移動系統游標，App 仍可能共用 Selection、Undo History、Modal Dialog、Clipboard 和 Autosave 狀態。背景輸入依然可能落在錯誤位置。

可靠的 Computer Use Service 至少需要三種邊界：

1. **Target Ownership：** 每次操作必須綁定特定 App、Window 或 Session，不能悄悄改成操作當前前景視窗。
2. **Concurrency Control：** 兩個 Agent 不能任意交錯修改同一目標。Per-app 或 Per-document Lease 很有幫助，但還不能取代 App 本身的衝突處理。
3. **Verification：** API 回傳成功，不代表 UI 已完成操作。按下 Save 後，還應檢查文件內容、狀態或實際檔案。

這也說明為何有時候 VM 反而是更好的方案。若 App 根本假設只有一個前景操作者，與其強行突破，不如給 Agent 獨立環境。對瀏覽器工作，獨立 Browser Profile 或 Automation Context 通常比完整 VM 便宜；對可能破壞資料的桌面工作，獨立 VM 的記憶體成本可能值得。

排程系統也要分辨「等待人類」和「等待 UI」。Mac 鎖定、權限對話框突然出現、Element ID 過期，都是不同失敗類型。無限重試同一個 Click，不等於具備恢復能力。

## 在 32GB 工作站上如何組合？

本地 Agent 不需要在 Desktop Driver 裡再跑一個語言模型。最簡單的架構是：單一模型與 Harness 透過 MCP 呼叫 Driver，Driver 回傳精簡的 UI 觀察，由作業系統實際執行操作。因此，Coding Agent 可以新增 Computer Use 能力，而不必更換原本的推理引擎。

```text
本地模型 / 可選的遠端模型
             |
      Coding / General Harness
             |
          MCP Client
             |
       Desktop Driver
        /          \
 Accessibility   Window Capture
        \          /
         Target App
             |
        Observe / Verify
```

對 32GB 統一記憶體的 Mac mini M4，這種分層很實用。Driver 本身不是第二個 27B 模型，但截圖、OCR 與可選 Perception Model 仍可能增加成本。完整 macOS Guest 則會直接和推論 Runtime 競爭記憶體。

我會從單一本地模型程序、一個 MCP Desktop Driver、以 App 為範圍的 Session 開始。每次操作記錄目標、結果與驗證；當工具必須移動真正游標或執行不可逆動作時，要求明確授權。若特定 App 無法背景操作，應直接回報限制，不能偷偷搶走焦點。

下一個值得做的實驗不是再拍一段 Agent 點擊影片，而是**碰撞測試**：人持續在某個 App 打字，Agent 同時操作另一個 App、開啟對話框、儲存成果並確認內容。接著把 Agent 的目標視窗遮住、鎖定螢幕、再讓兩個 Agent 同時操作同一 App。量測完成率與人類受到的干擾，而不只是工具是否回傳 `ok`。

## 從桌面驅動程式到可靠的 Agent

桌面操作只是執行系統中的一種能力。Coding Agent 與通用 Agent 的基本迴圈其實相同：觀察狀態、選擇動作、呼叫工具、檢查結果。兩者可靠性的差異，主要來自包覆這個迴圈的工作環境。

Coding Agent 通常有結構化的專案目錄、版本控制、語言伺服器、Shell、測試與 Diff，因此能以具體檔案檢驗修改。一般桌面 Agent 則面對語義模糊的控制元件、不可見的應用程式狀態，以及難以回復的操作。替 Coding Agent 接上桌面 MCP，並不代表 GUI 工作也自動獲得相同的驗證能力。

比較可靠的架構單位是**有明確範圍的任務交易**：指定目標、允許的操作、預期產物，以及獨立的完成證據。

```text
任務要求
  -> 界定資源與權限
  -> 觀察目前狀態
  -> 規劃有限的下一步
  -> 檢查衝突後執行
  -> 驗證實際產物
  -> 確認完成或分類失敗
```

迴圈應有明確的終止狀態，例如 `completed`、`blocked_on_permission`、`conflict`、`verification_failed` 與 `cancelled`。否則 Agent 可能把工具失敗誤判成進展，無限重試同一動作。這就是**隱式狀態機**的工程問題：即使程式沒有明確命名狀態，這些狀態仍然存在於實際行為中。

### Graph、Loop 與 Hook 各有職責

Graph 描述工作單位的依賴關係；Loop 處理單一工作內的不確定進展；Hook 在生命週期邊界執行共同規則。把它們混在一起會產生不必要的複雜度。例如，某個 Hook 偷偷恢復未完成任務，可能與已將任務取消的 Scheduler 衝突；反過來說，擁有數十個節點的 Graph 也無法彌補缺少結果驗證的問題。

| 機制 | 適合處理 | 不適合處理 |
| --- | --- | --- |
| Dependency Graph | 獨立子任務、平行執行、前置依賴 | 每一次簡單工具呼叫 |
| Observe-act-verify Loop | 不確定介面、漸進式工作 | 無限重試永久性失敗 |
| Lifecycle Hook | 權限檢查、紀錄、必要驗證 | 隱藏的任務規劃與狀態轉換 |
| Checkpoint | 中斷後持續執行 | 取代最終產物驗證 |
| Resource Lease | 避免同一目標遭並行修改 | 保證修改在語義上正確 |

關鍵並非移除 Graph 或 Hook，而是讓每次狀態轉換可以觀察，並由明確的元件負責判定完成。

## 本地推論改變的是瓶頸，不是可靠性的標準

32GB 統一記憶體的 Mac 能在本機運行有實用價值的量化模型，但 Agent 的端到端可靠性無法單靠參數量或 Token 速度判斷。聊天時的錯誤可以在下一輪修正；無人監督的長任務中，一次錯誤的檔案修改、過期的 UI 參照或無限重試，就可能污染整份成果。

必須分開衡量三件事：**模型能力**、**實際機器上的推論效能**，以及**真實工具與權限設定下的任務完成率**。廠商 Benchmark 主要是第一項的證據；每秒 Token 數衡量第二項的一部分；兩者都無法直接證明第三項。

[MLX](https://github.com/ml-explore/mlx) 提供 Apple Silicon 的陣列運算框架，[MLX LM](https://github.com/ml-explore/mlx-lm) 則提供語言模型推論與微調工具。量化能降低權重儲存需求，但記憶體尖峰還包括 KV Cache、Activation、Runtime Buffer 與其他應用程式。模型啟動時放得下，不代表上下文成長後仍然放得下。因此，Context Length 是實際容量限制，不只是設定檔中的數字。

[TurboQuant 相關研究](https://arxiv.org/search/?query=TurboQuant&searchtype=all) 值得關注，因為 KV Cache 壓縮可能改變長上下文的記憶體成本。但論文中的壓縮率或準確率，不能直接證明特定 oMLX 版本已支援，或某台 32GB Mac 能穩定執行指定長度的上下文。必須確認整合路徑、Kernel 支援與實測尖峰記憶體，才能形成部署結論。

對無人監督的本地 Agent，應優先衡量**單位運算成本下經驗證的任務完成率**，而非單純生成速度。較慢但能一次產生正確 Patch、通過測試的模型，可能比需要不斷人工修正的快速模型更省資源。評估時應一併記錄失敗類型、工具呼叫次數、耗時與記憶體尖峰。沒有這些資料，Dense 與 MoE 的比較很容易淪為替代指標的推測。

## 工具設計同時是成本問題

雲端 Agent 還面臨另一種限制：每次觀察、截圖與工具回應都會消耗 Context 或計費 Token。大量完整桌面截圖，往往比精簡的 Accessibility Tree 或針對性的 Diff 更昂貴。合理的最佳化方向是**減少不必要的觀察，同時保留驗證所需的證據**。

模型路由可以把簡單分類與短文字擷取交給較便宜的模型，把模糊規劃、困難除錯與最終審查留給能力較強的模型。不過，路由本身也會增加延遲與新的失敗點。若小模型無法可靠辨識正確 UI 元件，重試與復原成本可能完全抵銷便宜的 Token 單價。

Skill 也不是獨立的智慧體。它封裝指示，有時附帶腳本或工具慣例；Hook 能強制驗證；MCP Server 能暴露能力；Scheduler 能恢復工作；Model Router 能選擇推論服務。任何一項都不能單獨保證自主性。只有當職責明確、產物可驗證時，這些機制才真正有效。

因此，最佳化的合理順序是：縮減無關工具輸出、安全地重用穩定觀察、把確定性工作交給程式碼、只在品質足夠時進行模型路由，並保留獨立的完成檢查。省掉最後驗證所節省的 Token，可能換來更昂貴的錯誤。

## 一台可靠的個人 Agent 工作站應該如何運作？

綜合上述架構，可以得到一組具體原則：

1. 每項任務都有獨立工作範圍、資源所有權與可檢查的成果。
2. 檔案系統或應用程式 API 能完成的操作，優先於 GUI 自動化。
3. 優先使用 Accessibility 的語義操作，再考慮座標點擊，並嚴格限制前景操作備援。
4. 對共用 App 或文件的修改進行序列化，辨識過期觀察。
5. 透過測試、檔案檢查或 App 狀態驗證成果，不接受 Agent 自行宣稱成功。
6. 持久化 Checkpoint，將阻礙分類，而非永遠重試。
7. 在同一套評估中記錄完成率、對人的干擾與資源使用。

這也界定了**自動化**與**工作委派**的差異。自動化能執行既定步驟；工作委派則要求系統辨識現實何時偏離原計畫，在授權範圍內恢復，並提供可檢查的成果。

## 結論：自主性是工程系統的性質

Computer Use Driver 讓 Agent 得以操作原本缺乏 API 的應用程式；本地模型能降低對雲端推論的依賴；Skills、Hooks 與 Graph 能組織執行流程。但可靠的自主性，必須建立在這些元件對狀態、所有權、失敗與證據有一致理解的前提上。

最好的工作站 Agent，未必擁有最多工具或最快模型。它必須能完成有意義的工作、證明自己改變了什麼，並在整個過程中讓人繼續正常使用電腦。
