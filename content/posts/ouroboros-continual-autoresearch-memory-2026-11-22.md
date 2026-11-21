---
title: "Does Agent Memory Improve Research? Faster Starts, Uneven Results"
date: "2026-11-22"
category: "Ouroboros"
tags: ["Autonomous Research", "Agent Memory", "AutoResearch", "Evaluation", "Continual Learning"]
stamp: "VERIFIED"
sources:
  - "https://arxiv.org/abs/2611.05108"
  - "https://github.com/karpathy/autoresearch"
---

A research agent can carry a transcript, reusable code and experimental lessons from one task into the next. That sounds like accumulated expertise. But does the history improve the **final model**, or merely help the agent start its next experiment faster?

A November 3, 2026 preprint, [*From AutoResearch to Continual AutoResearch: Do Agents Learn Across Tasks?*](https://arxiv.org/abs/2611.05108) by Qin and colleagues, provides an unusually useful controlled test. Its conclusion is narrower than the promise of permanent agent memory: **persistent sessions consistently accelerate early research, but do not reliably produce better final answers**.

## A matched test of transfer, not a model-weight update

The original [Karpathy autoresearch](https://github.com/karpathy/autoresearch) loop gives an agent an editable `train.py`, a fixed evaluation harness and a five-minute training budget. It keeps promising changes according to validation bits per byte (`val_bpb`). The original repo assumes an NVIDIA GPU, tested on H100; it is not a ready-to-run Mac MPS or MLX optimization suite.

Continual AutoResearch asks a different question: what happens when an agent solves a **stream of related research tasks**? The authors compare persistent sessions with fresh sessions using the same agent, ordered tasks, data and budget. The study spans nine task families: synthetic AutoML, symbolic regression, time-series forecasting and tabular AutoML. Typical per-task budget is **30 minutes**; each model has **32 transfer-eligible tasks** in the aggregate result. It measures the quality of the first valid solution, progress across the time budget and final hidden-test performance. No model weights are updated to retain the experience. "Learning" here means reusing execution state, instructions, artifacts and strategies.

Five model-and-harness combinations were tested through their native CLI environments. That design enables a matched persistent-versus-reset comparison **within** each agent, but differences **between** models can reflect the harness as well as the model.

## The numbers separate search speed from solution quality

The paper's [Table 2](https://arxiv.org/abs/2611.05108) reports stateful-minus-reset gains in *normalized reward points*. The time-convergence metric rewards finding good candidates earlier within a fixed budget; it is **not** tokens per second or a percentage speedup.

| Model and native harness | Time-convergence gain | Final outcome gain |
| --- | ---: | ---: |
| Kimi K3 / OpenCode | +21.3 | +0.4 |
| Sonnet 4.6 / Claude Code | +20.9 | +7.6 |
| Opus 5 / Claude Code | +7.5 | -0.9 |
| GPT-5.6-Sol / Codex | +6.1 | -0.8 |
| GPT-5.4 / Codex | +3.0 | +0.2 |

Every tested agent improves the time-convergence measure. Only Sonnet shows a substantial mean **final** gain. The authors report that stateful agents reach a first valid solution sooner, with the largest time reductions of **9.2 minutes for Kimi K3** and **8.6 minutes for Sonnet 4.6**. Reset agents often catch up. At 25% of task budget the mean stateful advantage is +24.0 reward points; at the deadline it is +1.2.

A particularly revealing control subtracts the advantage of each run's first valid solution. Under that stricter comparison, **none of the five agents retains an optimization advantage**. Persistence mainly helps initialization and early candidate quality; it has not been shown to improve the subsequent search process in general.

These are the paper authors' experimental results, not an independent reproduction. Most model comparisons used one matched run pair; only the GPT-5.6-Sol condition received three matched repetitions. The tested streams are short, with three to five tasks per family.

## Relevance matters, but a memory card can still mislead

The researchers also reset the sessions and selectively gave them "insight cards" from previous experiments. Each card recorded a claim, evidence, confidence, scope and failure conditions. Three conditions were compared: cards from the same task stream, cards shuffled from an unrelated stream, and no cards.

The ablation covers only the **four transfer-eligible tasks in the Energy-systems stream**, so its results should not be treated as universal. Matched cards improved initial reward over shuffled cards for Opus 5 (+2.6 points), GPT-5.4 (+5.9) and GPT-5.6-Sol (+3.9), yet **reduced time-convergence** for those three (-15.5, -0.9 and -27.3 respectively). Sonnet reversed the pattern. The same study documents agents overgeneralizing earlier modeling assumptions and replacing better candidates after misleading development feedback.

The engineering implication is precise. More retained text is not automatically more useful memory. A research system needs a mechanism that can **reject or revise** old insights when the data distribution, objective or compute environment changes.

## What an autonomous experiment harness should retain

A lightweight design can store concise, reviewable experimental records rather than an unlimited transcript. A record might contain:

```yaml
hypothesis: "Seasonality features may help hourly demand forecasts"
evidence: "experiment-id; validation split; baseline delta"
scope: "hourly energy series with repeated daily patterns"
countercheck: "compare against a nonseasonal baseline"
status: "candidate insight, not general rule"
```

This is a proposed engineering pattern, **not** a measured result of the study or an Ouroboros implementation. Each new experiment should retrieve only relevant records, verify their applicability on the current training/development data, and preserve an untouched held-out evaluation for selection. Compare a fresh-session baseline to a persistent-session condition under equal compute budgets. Measure *time to first valid artifact*, *best candidate over time*, and *selected final result* separately. Otherwise an agent can appear to "learn" merely because it remembers working code.

**Conclusion:** persistent state is justified when research runs have tight time budgets or expensive setup, because the evidence shows faster useful starts. It does not justify assuming a higher-quality final model. For an experimental self-improvement project, the first durable asset should be **auditable experiments with scoped, revisable insights and held-out selection**, not a permanently growing conversation. The next claim worth testing is whether selective, provenance-aware memory outperforms both unrestricted persistence and a clean reset on the same local workload.