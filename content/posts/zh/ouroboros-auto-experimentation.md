---
title: "Project Ouroboros：AI 能否改善自己的本地模型？"
date: "2026-11-09"
category: "Minerva's Den"
tags: ["Ouroboros", "AutoResearch", "Exploration"]
---

Project Ouroboros 是與 Minerva’s Den 研究方向相連、但應獨立看待的實驗構想：能否讓自動化流程在固定硬體預算下，搜尋更合適的本地模型？

## 構想來源

這個想法結合 Karpathy 的 [autoresearch](https://github.com/karpathy/autoresearch) 自動實驗流程，以及權重空間編輯與模型修改方面的研究。強大的外部推理模型可負責規劃實驗，而本地候選模型則接受固定工作負載的評估。

## 真正需要的條件

自動搜尋必須定義可修改範圍、可重現的測試集、候選生成方式、計算與 API 成本，以及停止條件。也必須避免模型只為 Benchmark 最佳化，反而失去一般能力。

讓 LLM 提出模型修改方案，**不等於能以任意大小直接生成強大的模型**。權重操作、實驗成本與評估品質仍是限制。

## 第一階段

先建立可靠的本地評估 Harness，固定模型與版本，記錄測試結果、記憶體、速度與實驗日誌，再考慮受控的權重修改。

目前 Ouroboros 是**研究提案**，並非已完成的模型自動最佳化系統。
