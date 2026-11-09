---
title: "From Hermes to OpenClaw: Observability Is Part of Agent Performance"
date: "2026-11-09"
category: "Minerva's Den"
tags: ["Agent Harness", "OpenClaw", "Hermes"]
---

Minerva's Den began with an interest in local models and evolved into a question about their working environment: **what makes an AI agent usable when it runs for hours and delegates work?**

## The problem I encountered

I used Hermes Agent through Telegram and occasionally its graphical interface. Delegation could be reported by the main agent without giving me a satisfactory way to watch individual child tasks progress. That is not proof that the delegation failed, but it creates an operational blind spot.

I also want an agent that can perform routine decisions independently without seeking approval for every small implementation detail. For that to be safe, it needs visible task state, clear permissions, an audit trail, and understandable failure reporting.

## Why I started migrating

In November 2026 I began migrating general-purpose agent work toward OpenClaw, while continuing to explore OpenCode for coding-oriented workflows. This was driven primarily by operational needs and interface experience rather than a controlled benchmark proving one harness faster.

The comparison I care about includes:

- **Visibility:** Can I identify every running delegated task and its current step?
- **Resource cost:** How much context, inference, and memory does orchestration add?
- **Extensibility:** Can I add and maintain specialized skills without overloading prompts?
- **Recoverability:** What survives application restarts or machine reboots?
- **Control:** Can important actions require approval while routine work remains autonomous?

## The distinction that matters

A model, an inference backend, and an agent harness are separate layers. A new harness may improve task management while leaving model reasoning unchanged. A faster model may make a poorly instrumented harness feel snappier without making its actions more transparent.

## Status and next test

The migration has begun; a completed feature-by-feature and same-model performance comparison has **not** been established. The next useful experiment is to give Hermes and OpenClaw identical tasks and track completion, wall time, tool calls, resource use, recoverability, and quality of the execution trace.

The best agent is not simply the one that says it delegated work. It is the one whose work I can verify.
