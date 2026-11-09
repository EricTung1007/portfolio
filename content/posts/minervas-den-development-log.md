---
title: "Minerva's Den: Development Notes and Open Problems"
date: "2026-11-09"
tags: [Minerva's Den, Devlog, Agents]
---

This is a running account of the questions shaping Minerva's Den, not a claim that all of the components below are complete.

## Local inference under a memory budget

My test environment is a Mac mini M4 with 32 GB of unified memory. A previous 4,096-token prefill / 128-token generation benchmark recorded about **64 prompt tokens per second**, **11.1 generated tokens per second**, and **19.4 GB peak memory** for one configuration. These are measurements from one experiment, not universal performance claims.

I am exploring what model size, quantization, context length, and inference settings are actually useful in practice.

## Rethinking the agent harness

I have explored Hermes and moved toward OpenClaw for general agent work, while also evaluating OpenCode for coding workflows. The recurring requirement is simple: I want to see what delegated agents are doing, not merely be told that delegation happened.

A good system should expose active tasks, tool usage, failures, and outcomes, especially when I am monitoring it through Telegram.

## Making research autonomous without making it aimless

An automated research agent needs more than scheduled searches. It needs an agenda: the ability to select a useful topic, form questions, follow evidence, compare alternatives, and decide what warrants another experiment.

This is where agentic retrieval matters. Search should be iterative, sources should be checked, and the system should be able to report uncertainty rather than present every finding as a conclusion.

## Problems still open

- Reliable resource limits and model unloading when multiple agents share the machine
- Visible delegation and execution history
- Research focus selection and evidence-based reporting
- Effective separation of planning, implementation, review, and QA
- Repeatable measurements that distinguish model improvements from harness improvements

I'll update these notes as the architecture becomes more concrete.
