---
title: "Minerva's Den: Building a Local AI Research System"
date: "2026-11-09"
tags: [Minerva's Den, Local AI, Architecture]
---

Minerva's Den is my ongoing attempt to build a capable, local-first AI research and automation system on a small computer. The name comes from the central computing facility in BioShock 2's *Minerva's Den*.

## The machine

The target hardware is a **Mac mini M4 with 32 GB of unified memory**. That constraint matters: every large model, long context, background process, and tool competes for the same memory.

## The system I want

- **Local inference:** Run the main language model locally, experimenting with oMLX, quantization, and efficient memory use.
- **Agentic RAG:** Search, retrieve, reconsider the results, rewrite searches, and query again when evidence is insufficient.
- **Agent workflows:** Give agents focused responsibilities rather than placing every skill and tool in one enormous prompt.
- **Useful outputs:** Turn research into inspectable reports, files, charts, and concrete changes to code.
- **Human control:** Automate routine decisions while reserving significant or irreversible choices for review.

## The central trade-off

The goal is not to pretend a 32 GB Mac mini is a datacenter. It is to make a constrained local system reliable enough to do meaningful work. Model quality is only one part of the problem; the harness, context management, tools, retrieval, and observability all affect the outcome.

## Current status

This is a work in progress, not a finished product. I am iterating on the model backend, agent harness, research workflow, and how to make autonomous activity visible. I'll use this site to record decisions, benchmarks, failures, and changes of direction.
