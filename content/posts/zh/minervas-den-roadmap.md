---
title: "Minerva’s Den 路線圖：從本地對話到可驗證的研究工作站"
date: "2026-11-09"
category: "Minerva's Den"
tags: ["Roadmap", "System Design", "Reliability"]
---

Minerva’s Den 是持續演進的工程實驗，不是所有功能都已完成的產品。以下清楚區分已有使用紀錄、正在遷移，以及仍待驗證的方向。

## 已有實際使用紀錄

- 主要硬體為 Mac mini M4、32GB 統一記憶體。
- 已進行本地模型推論及 oMLX 相關性能、記憶體觀察。
- 曾使用 Hermes Agent 處理通用代理任務，包括 Telegram 與排程。
- OpenCode 已納入程式開發代理的評估與工作流程。

這些是實際探索的基礎，不代表所有整合均已穩定。

## 遷移中

- 逐步把通用 Agent 工作轉向 OpenClaw。
- 盤點 Hermes 既有排程與委派工作。
- 選擇可維護的 Agent Skills 與工作目的。
- 改善子代理進度、工具呼叫與失敗狀態的可視性。

## 待驗證架構

**Inference：** 模型載入與卸載、記憶體預算、量化與上下文限制。

**Research：** 自動議程、多查詢搜尋、重新檢索、來源追蹤、研究報告。

**Engineering：** 專業化 Coding、Review 與 QA Agent，以及可查核的交接機制。

**Operations：** 持久任務日誌、重啟恢復、資源隔離與監控。

**Publishing：** 將可驗證結果與工程決策整理成雙語公開紀錄。

## 完成標準

研究必須列出來源與推論依據。程式開發需要測試或審查證據。恢復工作要區分重做與接續步驟。模型優化必須用相同負載比較。

截至 2026 年 11 月 9 日，優先項目是可觀察性與可靠任務執行，而不是盲目增加 Agent 數量。
