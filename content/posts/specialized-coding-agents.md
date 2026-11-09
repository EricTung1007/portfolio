---
title: "Should One Coding Agent Do Everything? The Case for Specialized Roles"
date: "2026-11-09"
category: "Minerva's Den"
tags: ["Coding Agents", "OpenCode", "Orchestration"]
---

One of the design questions in Minerva's Den is whether a coding agent should carry every skill, tool and instruction, or whether specialized agents should divide the work.

## The proposed division

A manager receives the user goal, identifies non-negotiable constraints, and coordinates planning, implementation, design, code review, and QA. Specialists receive only the files, interfaces, and evidence needed for their task. The manager then reconciles their outputs and reports material decisions back to the user.

This reflects a practical preference: describe the desired outcome once, let routine implementation proceed, and ask for confirmation only when an important principle or consequential choice is at stake.

## Why splitting work may help

- Smaller role-specific instructions can reduce irrelevant prompt context.
- Review and QA can challenge implementation rather than merely restate its reasoning.
- Specialized tools and permissions can limit the blast radius of mistakes.
- Structured handoffs make work easier to audit.

## Why splitting work may hurt

Every handoff can introduce latency, duplicated context, divergent assumptions and additional inference requests. Running several local models simultaneously also competes for the same 32 GB unified-memory budget.

A chain of agents does not magically turn a weak model into a strong one. The interesting measurement is whether independent review improves correctness more than coordination reduces throughput.

## What to measure

Use an identical coding task for a single-agent baseline and a role-based workflow. Compare correctness against tests, number of iterations, elapsed time, model tokens, peak memory, redundant tool calls, and required human corrections.

## Status

The role split is a **design objective under investigation**. I have evaluated OpenCode and related agent configurations, but I am not publishing a verified end-to-end multi-agent benchmark here.

The architecture should earn its complexity through measured reliability, not through an elaborate org chart.
