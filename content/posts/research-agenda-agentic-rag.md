---
title: "Beyond Search: Designing an Autonomous Research Agenda"
date: "2026-11-09"
category: "Minerva's Den"
tags: ["Agentic RAG", "Research", "Architecture"]
---

A scheduled web search is not yet an autonomous research system. For Minerva's Den, the missing capability is deciding **what deserves investigation**, what evidence would change the answer, and when another search or experiment is worth the cost.

## Research agenda

I want the system to distinguish durable research questions from daily announcements. Its agenda may cover local inference engines, model quantization, agent harnesses, skills, computer-use tooling, or a newly observed reliability problem.

A research item should record a question, why it matters, competing hypotheses, required evidence, a stopping condition, and follow-up experiments. The system should be able to switch focus when a high-priority finding changes the plan.

## An iterative retrieval loop

1. **Form the question:** Convert a vague interest into testable subquestions.
2. **Plan evidence:** Identify authoritative documentation, code, benchmarks, and community experience.
3. **Search broadly:** Run multiple queries, including alternate terminology and counterarguments.
4. **Assess results:** Separate primary evidence from reposts, estimates, marketing claims, and anecdotes.
5. **Rewrite and requery:** Search again when the evidence is missing, contradictory or too weak.
6. **Synthesize:** State what is known, what remains uncertain, and what should be tested locally.
7. **Store provenance:** Save source URLs, dates, exact configurations, and decisions.

## Outputs and safeguards

An automated report should not claim a benchmark was performed unless the system has an execution record. Comparisons must separate model quality, inference backend, and agent harness. The system should also notice when two sources repeat the same original claim rather than corroborate it independently.

## Status

This describes the intended research workflow, informed by experiments and discussions about schedules, skills, and research-agent design. It is **not a claim that the complete pipeline is already deployed**.

The central challenge is moving from automated collection to evidence-driven investigation.
