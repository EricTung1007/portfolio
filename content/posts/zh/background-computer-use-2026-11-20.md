---
title: "一台 Mac，兩個操作者：背景 Computer Use 的工程原理"
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

## 桌面正成為可以共用的資源

背景 Computer Use 改變了 Agent 能如何融入日常工作。作業系統對視窗和控制元件的了解，本來就遠比一張截圖豐富。Cua Driver、computer-use-mcp、OpenComputerUse 和 computer-harness 正在把這些資訊轉成語言模型可重用的介面。

比較可靠的設計，不會聲稱自己能點擊所有東西，而是清楚定義哪些操作可以安全地在背景執行、如何隔離並行 Session、如何辨識過期畫面，以及如何驗證結果。Cua Driver 適合廣泛整合；computer-use-mcp 的並行控制設計尤其值得學習；OpenComputerUse 把 Session Ownership 做得明確；computer-harness 則展示在理解信任邊界的前提下，實作可以多麼精簡。

真正有意思的目標，是讓**人與 Agent 都成為同一台電腦上的合法操作者**，各自清楚掌握自己的工作。要達到這件事，需要的不是更華麗的游標動畫，而是更紮實的作業系統工程。
