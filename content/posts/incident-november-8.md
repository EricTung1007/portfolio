---
title: "A Night of Autonomous Agents and an Unexplained Restart"
date: "2026-11-09"
category: "Minerva's Den"
tags: ["Postmortem", "Reliability", "Agent Operations"]
---

On November 8, 2026, I checked a Mac mini after leaving OpenCode and OpenClaw working overnight. The computer had restarted. The logs available in my investigation support a timeline, but **not a confirmed root cause**.

## Recorded timeline (Taiwan time)

| Time | Observation |
| --- | --- |
| 03:53–03:54 | An OpenClaw desktop process was reported unresponsive for approximately 17 seconds. |
| 04:41–04:45 | OpenClaw was inspecting Hermes schedules and migration-related scripts. |
| 04:43 | An OpenCode conversation summarization task was interrupted. |
| 11:22 | macOS was recorded as having restarted. |
| After reboot | Attempts to resume encountered oMLX memory-limit errors. |

The hang and the memory-limit error are real observations from the available account of the investigation. Neither establishes that an out-of-memory event caused the restart. I do not have sufficient evidence to assign causation to any single process.

## Why this incident matters

Agent systems should be designed for interruption. Long-running research, code edits, schedules and child-agent calls need more than a live chat transcript. They need durable identities, checkpoints, resource budgets, and evidence of which steps actually completed.

## Operational improvements to investigate

1. Capture a persistent task ID and structured logs for each agent and child.
2. Save checkpoints before expensive or irreversible operations.
3. Put limits around concurrent model sessions and memory usage.
4. Distinguish **requested**, **started**, **finished**, and **verified** work.
5. Record system diagnostics alongside agent traces without assuming correlation is causation.
6. Test crash and restart recovery intentionally.

## Open questions

Was the restart a system event, power interruption, resource-pressure failure, or something else? That remains unknown. Was either agent's intended job completed before the restart? The surviving record did not establish completion.

This is a reliability problem to investigate, not a dramatic story about agents crashing a computer.
