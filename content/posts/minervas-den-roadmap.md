---
title: "Minerva's Den Roadmap: From Local Chat to a Verifiable Research Workstation"
date: "2026-11-09"
category: "Minerva's Den"
tags: ["Roadmap", "System Design", "Reliability"]
---

Minerva's Den is an evolving experiment, not a product with all its proposed features already delivered. The roadmap below separates observed use, active transitions, and ideas requiring validation.

## Foundations with practical history

- A Mac mini M4 with 32 GB unified memory is the target machine.
- Local LLM inference and oMLX-related performance or memory investigations have produced measurements and operational questions.
- Hermes has been used for general-purpose agent work, including Telegram interaction and scheduling.
- OpenCode has been part of coding-agent workflows and evaluation.

These points establish a working laboratory. They do **not** certify that every proposed integration is stable.

## Transition in progress

- Move general agent orchestration toward OpenClaw.
- Reconcile older Hermes schedules and delegated jobs without silently losing state.
- Choose maintainable skills and clear purposes for agents.
- Make active task steps, subagent progress and failures visible.

## Architecture to validate

**Inference:** Predictable model load/unload behavior, memory budgets, quantization evaluation and context limits.

**Research:** Agenda selection, multi-query retrieval, iterative requerying, source attribution and evidence-based reports.

**Engineering:** Specialized coding, review and QA roles, with explicit handoffs and test-based completion.

**Operations:** Durable task history, restart recovery, resource isolation, monitoring and auditability.

**Publishing:** Convert verified results and meaningful design decisions into bilingual public field notes.

## Acceptance criteria

A successful research run must show which sources it checked and why its conclusion follows. A successful coding run must show tests or review evidence. A recovered agent must demonstrate which steps were resumed versus repeated. Model improvements need same-workload measurements.

## What comes next

The immediate priority is observability and dependable task execution. More agent complexity should wait until the simpler workflow has a measured baseline.

This article is a snapshot of intentions and known observations as of November 9, 2026. The engineering journal will record what actually changes.
