---
title: "Choosing a Local Model: Quantization, Capability, and Guardrails"
date: "2026-11-09"
category: "Minerva's Den"
tags: ["Models", "Quantization", "Evaluation"]
---

Selecting a model for Minerva's Den is not a leaderboard contest. The relevant question is what model can actually complete research and coding work under a strict memory budget.

## Beyond parameter count

A model weight file is only part of runtime memory. Quantized weights, KV cache, activation buffers, inference overhead and concurrent background processes all contribute. A headline context-window length is not the same thing as the context length that is practical on a 32 GB machine.

I have explored MLX variants, oMLX inference, different quantization levels, speculative-decoding techniques such as MTP-related approaches, and candidate Qwen-family models. Many options remain research leads rather than verified improvements in this environment.

## Capability versus refusal behavior

I have also investigated Heretic and abliterated model variants that aim to change refusal behavior. Reducing refusal rates is not automatically an increase in reasoning, coding accuracy or tool-calling reliability. A model can become more willing to answer while becoming worse at following instructions or verifying claims.

For evaluation, these should be separate axes: task success, hallucination rate, tool-schema validity, coding test pass rate, latency, memory consumption, and refusal behavior for clearly defined benign requests.

## A better selection process

1. Define representative local tasks before choosing candidate models.
2. Test an unmodified baseline and each altered variant on the same dataset.
3. Compare quantizations at the same context and backend settings.
4. Record failed tool calls and malformed outputs, not only successful demos.
5. Assess cold starts, sustained work, unloading behavior, and resource contention.

## Current position

I am not presenting any candidate as the definitively best local model. An attractive benchmark or download count is insufficient evidence for the performance I need.

The model should be selected for the workflow, not the workflow designed around a fashionable model name.
