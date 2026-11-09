---
title: "The 32 GB Experiment: What a Local LLM Benchmark Actually Tells Us"
date: "2026-11-09"
category: "Minerva's Den"
tags: ["Inference", "Benchmark", "Apple Silicon"]
---

A Mac mini M4 with 32 GB of unified memory is the hardware boundary for Minerva's Den. It is not a fixed model benchmark: the aim is to understand what useful work remains possible once inference, context, retrieval, and agent processes share one memory pool.

## One recorded measurement

On November 5, 2026, I recorded the following **single-request** measurements in a Python coding context. The prompt was 4,096 tokens and generation was 128 tokens.

| Metric | Recorded result |
| --- | --- |
| Prompt-processing rate | 64.0 tokens/s |
| Generation rate | 11.1 tokens/s |
| Time to first token | 64,035.1 ms |
| Time per output token | 91.0 ms |
| End-to-end runtime | 75.6 s |
| Peak memory | 19.4 GB |

These figures are historical observations, **not a reproducible comparison across models or backends**. The record does not contain enough version, quantization, and runtime metadata to attribute the outcome to one particular model.

## What the figures suggest

An approximately 64-second first-token delay is substantial for an interactive agent. If an agent makes many sequential tool calls, total task latency can be dominated by repeated prompting rather than the visible output tokens. Peak process memory also leaves less room for concurrent agents and growing KV caches.

It would be misleading to subtract 19.4 GB from 32 GB and treat the remainder as fully available model headroom. macOS, other processes, runtime buffers, memory pressure, and context length all matter.

## Next experiments

1. Fix an exact model ID, weight format, quantization and backend revision.
2. Repeat identical prefill and decode workloads at several context lengths.
3. Record memory pressure and throughput under one versus multiple concurrent requests.
4. Separate cold model loading, prompt prefill, and decode timing.
5. Evaluate **task success per minute and per GB**, not just output tokens per second.

The goal is to establish a resource budget that makes agent workflows predictable, not to publish an isolated impressive number.
