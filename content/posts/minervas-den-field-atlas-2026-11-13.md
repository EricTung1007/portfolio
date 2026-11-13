---
title: "Minerva's Den Field Atlas: The Unpublished Tools, Models, and Ideas"
date: "2026-11-13"
category: "Minerva's Den"
tags: ["Research Notes", "Agents", "Local AI", "Repository Spotlight", "Field Atlas"]
---

This is **one comprehensive research issue**, assembled from previously underrepresented discussions, links and technical ideas in the Minerva's Den project. It does not require that a linked repository was installed or a suggested technique was tested. Instead, each lead is treated as a distinct subject with its own mechanism, limitations, original source and relevance to the Mac mini M4 with 32GB unified memory.

The website already published twelve English posts about the system architecture, development log, model budget, Hermes transition, agentic RAG, coding-agent roles, a restart incident, Ouroboros, browser inference and other foundations. Rather than duplicating those articles, this issue records the additional tools, engineering constraints and debates that they did not sufficiently cover.

**Evidence rule:** official documentation was reviewed for several repositories, but a forwarded benchmark or Reddit claim is not automatically a locally reproduced result. Some original posts and screenshots were available only through discussion summaries or shortened links. This issue records the accessible material, not a guarantee of an exhaustive export of every historical conversation.

## In this issue

Agent harnesses and oversight; Pi, Cindy, DSH and Paperclip; scheduling, skills and gateways; Qwen and the 32GB model frontier; DSpine, MTP, quantization and Heretic experiments; evaluation; SAG2, Memorilla and agentic retrieval; desktop and iPhone automation; website UX, 0451, punch cards; autonomy, recovery and the next measurable experiments.

---

## Agent harnesses, delegation and operations

### 01. The coding-agent harness comparison

The long-form research brief named Codex CLI/App, Claude Code, OpenCode, Pi Coding Agent, Aider, Cline, Roo Code, Goose, OpenHands, Gemini and other agent systems. Its central demand was to evaluate the **harness**, not merely the model it ships with. Compatible APIs and proxies allow many of these tools to share a model. Architecture, tool execution, context compaction, permission handling, patch mechanics, isolation, extensibility and execution history remain different.

A controlled benchmark would fix the model, task set, repository, available tools and scoring criteria. It would report task success, code tests, wall time, peak memory, tokens, tool-call errors, human corrections and restart recovery. A smaller CLI may be leaner without being better at autonomous completion; a larger workspace may add safety at a real resource cost. No such complete same-model comparison has yet been published here.

Sources and original discussion links: [1](https://github.com/awesome-opencode/awesome-opencode)

### 02. Hermes, OpenClaw and the missing worker timeline

The practical frustration with Hermes was not a proven failure to delegate. It was the absence of a useful view into individual workers when the main agent said a task was running. Telegram was the preferred access point, yet even the GUI did not expose the full delegated process in the desired way. The resulting move toward OpenClaw and experiments with OpenCode were motivated by usability and operational control, not by a rigorous performance victory.

An agent system needs durable task IDs, parent-child links, timestamps, current tool actions, evidence of completion, error states and artifacts. **Requested, delegated, started, finished and verified** are separate states. A message saying "done" is not proof of a successful task. The original harness-transition and November 8 reliability stories already appear on this site; the new requirement is per-agent observability.

Sources and original discussion links: [1](https://erictung1007.github.io/portfolio/#/writing/hermes-to-openclaw) · [2](https://erictung1007.github.io/portfolio/#/writing/incident-november-8)

### 03. Cindy, Alma and DS Bot: convenience versus control

A shared migration account positioned DS Bot as work-oriented, Alma as a powerful but awkward toolbox, and Cindy as a promising personal agent interface. The discussions emphasized multi-role support, memory isolation, mobile access, transparent subagent work and how much of each product is truly open source.

Cindy's public client repository describes integration with Pi, Codex and Claude Code, desktop and mobile clients, automations, teams and local skip-sign-in operation. It separately identifies capabilities that require backend services. **An open client does not automatically mean that every backend feature is self-hostable.** The relevant evaluation is offline behavior, account requirements, role-specific memory separation, background task visibility and cloud dependence. The user's preference to inspect vendor trust boundaries is legitimate but not evidence that a vendor is malicious.

Sources and original discussion links: [1](https://github.com/makecindy/cindy)

### 04. Pi Coding Agent, Pi Bot and iOS companions

The user asked whether Pi Bot and the Pi Coding Agent are the same thing, who maintains them and whether an official iOS app exists. A terminal coding agent, a bot powered by that agent and a mobile client are not identical products merely because their names share "Pi." Check maintainers and the actual code before treating them as related.

The Pi ecosystem has experimental, unofficial mobile projects, including companions that use a small Mac-side service to read session history and communicate over RPC, and attempts at on-device Pi execution. For Minerva's Den, the actual requirement is to **observe and steer the Mac's live sessions from iOS**, not necessarily to run a second coding agent on the phone. A viewer with clear authentication, read-only default permissions and inspectable logs is a stronger first milestone than duplicating the execution runtime.

Sources and original discussion links: [1](https://www.reddit.com/r/PiCodingAgent/s/fTRepTV23F) · [2](https://github.com/badlogic/pi-mono) · [3](https://github.com/MRL-00/pi-mobile) · [4](https://github.com/dannote/pi-ios)

### 05. DSH Superagent and tracked work items

The DSH Superagent prototype from DeepSeek is a research implementation, not a production-ready autonomous company. It takes authorized repository tasks, opens a work item, performs changes in its own session and directory, and reports results back to the original conversation, potentially as a pull request. Some higher-level ideas in the associated research are not implemented in the public prototype.

This suggests a concrete pattern: **request → task ledger → bounded execution → test evidence → deliverable**. Supervisors should own approvals, retries, idempotency, worktree isolation and escalation rules. A prompt instructing an agent to be autonomous cannot substitute for these mechanisms. For a 32GB workstation, worker concurrency must be controlled by actual inference memory rather than by an elaborate org chart.

Sources and original discussion links: [1](https://github.com/deepseek-ai/dsh-superagent-prototype)

### 06. Paperclip as manager, not automatically a passive viewer

Paperclip's public feature set includes goals, org charts, task threads, heartbeats, budgets, approvals, schedules and history. The user asked whether it could be used **only as a display** for subagents already running under another harness. The answer depends on integration: Paperclip needs task events or an agent adapter. It cannot infer the real state of unrelated Hermes or OpenCode child processes simply from their existence.

The trade-off is between a powerful governance layer and more services, storage and configuration. If the primary requirement is to see a delegated worker's current tool, recent output and result, a small event-stream viewer could be lighter. Before adopting Paperclip, verify that start, progress, cancel, failure, restart and completion events faithfully map to the actual executions.

Sources and original discussion links: [1](https://github.com/paperclipai/paperclip)

### 07. Agent Office, Swarm and real delegation evidence

Animated agent offices and Swarm Site are appealing because they make parallel agents visible. The user repeatedly clarified that they did not need separate conversations with every child; they wanted to **see children work just as they see the main agent**, including from Telegram. An animation moving a fictional agent between rooms should not count as proof.

The system should expose parent task, worker ID, current action, tool event, diff or artifact, timestamp and error state through structured event records. A web UI can then present timelines or a playful office, while Telegram links to the same underlying run IDs. Show progress from genuine events first and add decoration second.

Sources and original discussion links: [1](https://califa.github.io/swarm-site/)

### 08. Specialist agents, CEO summaries and context budgets

The multi-agent proposal called for planning, implementation, design, independent code review and QA roles under a manager. The concern was that two supervisors could report back to a CEO and exceed the model's usable context. The correct response is **structured handoff**, not unlimited transcript concatenation. A worker report should contain changed files, decisions, tests, blockers, references to full logs and a bounded executive summary.

Multi-agent structures are not automatically better for small local models. Each handoff adds prompt costs, waiting time and opportunities for misunderstandings. The useful benchmark compares a single well-equipped coding agent with role-based collaboration using identical tasks, tests and memory limits. The existing specialized-agent article covers the initial design; this field note adds the bounded aggregation contract.

Sources and original discussion links: [1](https://erictung1007.github.io/portfolio/#/writing/specialized-coding-agents)

### 09. Three cron jobs and OpenCode execution continuity

The migration plan kept exactly three Hermes jobs: Feza job search, Eric job search and a Minerva's Den technology scout. Duplicates were to be discarded. The user asked OpenCode to run those jobs itself and questioned whether a native /schedule feature existed. The proposed approach in the discussion involved macOS launchd calling headless OpenCode, but no surviving evidence demonstrated that the three migrated jobs had all completed successfully.

Scheduling and execution are separate concerns. A dependable system keeps explicit job IDs, last attempted and last successful run, exit status, artifacts and retry policy. Version-specific native scheduling must be checked against the installed OpenCode release rather than guessed. Concurrent model runs need memory limits and locks to prevent overnight resource pressure.

### 10. Anthropic Skills, Superpowers, Karpathy and Awesome OpenCode

The shared skill ecosystem included Anthropic-style agent skills, obra's Superpowers, Karpathy's autoresearch, Awesome OpenCode Agents and the Awesome OpenCode catalog. A skill packages procedures and context; a separate worker agent has its own execution state and possibly permissions. These are different abstractions. Superpowers focuses on disciplined planning, debugging, review and verification rather than granting a model extra intelligence.

The user once requested a broad downloadable skill list while explicitly excluding Tavily. Installing every interesting skill can flood small-model context and increase maintenance obligations. The better strategy is versioned, task-triggered loading with measured effects on errors, tokens and iteration count. Karpathy's automatic experimentation ideas should be compared with the separate Ouroboros model modification proposal.

Sources and original discussion links: [1](https://github.com/obra/superpowers) · [2](https://github.com/awesome-opencode/awesome-opencode) · [3](https://github.com/karpathy/autoresearch)

### 11. FreeLLMAPI and shared cloud fallback

FreeLLMAPI was discussed through its v0.16.20 release, including differences between free and paid access. It is a self-hosted OpenAI-compatible routing gateway for external providers, with rate limits, failover, model selection and integration tools for common coding agents. It is **not** a local foundation model. One gateway key cannot make upstream providers free, unlimited or offline.

For Minerva's Den, it could provide controlled cloud fallback for tasks the local Mac mini cannot complete reliably. The engineering question is whether a fallback improves successful outcomes enough to justify extra credentials, infrastructure, service restrictions and latency. Pricing and catalog availability should be checked against the current release rather than copied from old posts.

Sources and original discussion links: [1](https://github.com/tashfeenahmed/freellmapi/releases/tag/v0.16.20) · [2](https://github.com/tashfeenahmed/freellmapi)


## Local models, acceleration and evaluation

### 12. Qwen3.8 27B Turbo, weights and actual RAM

Shared model announcements mentioned a Qwen3.8-27B Turbo file around 11.67 GB, 256K context and permissive access. These were claims under review, **not measurements of the Mac mini**. A checkpoint's disk size is only one component of runtime resource use. Cache, activations, runtime buffers, OS overhead, workload length and concurrent jobs compete for the same 32GB unified memory.

A model that loads is not necessarily usable for autonomous work. The relevant quantities are reliable prefill latency, sustained decoding speed, structured tool output, context capacity before memory pressure and task completion time. The earlier 4,096-input / 128-output measurement on this site recorded 64.0 input tokens/s, 11.1 generated tokens/s and 19.4GB peak memory for one configuration only. It cannot validate every Qwen variant or a 256K workload.

Sources and original discussion links: [1](https://erictung1007.github.io/portfolio/#/writing/local-inference-32gb)

### 13. oMLX, TurboQuant, MLX and GGUF are different layers

Minerva's Den targets local inference on oMLX with TurboQuant, and the research compared MLX and GGUF weight builds. These are not interchangeable labels. A model architecture, serialized weights, quantization method, cache representation and inference backend each have distinct compatibility requirements. Smaller model files can still trigger high runtime allocations and long first-token delays.

The model matrix should record exact checkpoint, quantization, backend revision, supported attention and cache path, tested context lengths, tokens/s, memory and tool-call correctness. Evaluate **task success per GB per minute**, not a download-size contest. A theoretically possible maximum context is irrelevant if the workload stalls or fails to produce valid structured actions.

### 14. DSpine, DFlash2, MTP and the cost of a drafter

DSpine's repository describes parallel speculative drafting and now documents MLX/Apple Silicon support, alongside Qwen3.8-27B-related paths. It is more relevant than CUDA-only techniques, but **support in DSpine's own MLX package is not proof that it integrates unchanged with oMLX**. Speculative decoding saves time only when accepted drafts offset the cost of drafting and verification.

The earlier discussion compared DFlash and Lightning/MTP-like approaches, asking whether a draft model's own KV or state cache consumes too much of the memory budget. The answer depends on draft architecture, accepted sequence length, verification batch, prompt length and runtime implementation. A claimed maximum multi-fold speedup is not a predicted M4 result.

Test end-to-end task latency and peak memory against ordinary decoding under identical prompts and output lengths, including failure and cache-growth cases.

Sources and original discussion links: [1](https://github.com/tencent/dspine)

### 15. Unsloth Dynamic V3.1 and benchmark percentages

A forwarded message advertised newer dynamic GGUFs for Qwen3.8-Flash-Next and an accuracy improvement above 15% on Terminal Bench or code-agent evaluations. Such a figure is meaningful only with a precise baseline, quantization, hardware configuration, dataset and scoring procedure. Different tasks may respond differently to aggressive bit allocation.

A GGUF benchmark is not automatically transferable to an MLX/oMLX stack. A useful A/B test should fix model checkpoint, quantization family, context, parser, tool permissions and evaluation data. The claim remains an interesting lead until its source and methodology are fully checked, not a confirmed gain in Minerva's Den.

Sources and original discussion links: [1](https://huggingface.co/unsloth)

### 16. Heretic, abliteration and the cost of changing refusal behavior

The user repeatedly asked for five or more modified Qwen 27B candidates compared directly with the original: less unhelpful refusal without "lobotomizing" reasoning, coding or tool calling. That is an empirical requirement rather than a preference for a marketing label such as "uncensored."

Removing or altering refusal-associated behavior can also change calibration and instruction-following. A good evaluation pairs an unmodified baseline with exact modified checkpoint IDs, matching backend and context, benign requests, code tests, tool schemas, multi-step planning and hallucination checks. Track regressions and not just refusal counts. The site's earlier model-freedom article covered the principle; the missing deliverable is reproducible same-workload evidence.

Sources and original discussion links: [1](https://erictung1007.github.io/portfolio/#/writing/models-quantization-freedom)

### 17. ZeroZero, Heretic2 and the extraordinary hybrid-model post

A Reddit account described Qwen3-8B ZeroZero after Heretic2 changes, claiming striking improvements in complex tool calls on a 32GB Mac and a custom harness. A separate viral paragraph claimed a small DeepSeek/Qwen hybrid with exceptional refusal statistics. Both are discoverable hypotheses, not independently reproduced facts.

Outcomes can come from weights, prompts, tool parsers, harness retries or test selection. A hybrid name does not establish weight provenance, lawful training data or preserved competence. Verify the model card, base model, modification method and independent evaluations, then run a paired local benchmark before allowing real tool privileges. A lower refusal rate cannot stand in for intelligence or reliability.

Sources and original discussion links: [1](https://huggingface.co/LastMachine/Qwen3-8B-ZeroZero-Heretic) · [2](https://www.reddit.com/r/LocalLLM/s/wWaEATHZ9Y)

### 18. Tiny models, LFM3 and a catastrophic repetition failure

The portfolio's browser-side assistant exposed a concrete product problem: very small models can enter severe repetitive generation and deliver confident but useless responses. The site later explored newer tiny Qwen variants, shorter retrieved context, non-thinking sampling and a streaming repetition guard. The Mac mini's local oMLX workloads and the browser's WebGPU chatbot are distinct deployment targets.

The LFM3 1.7B versus much larger Qwen question belongs to a benchmark specific to the assistant: factual answers from the CV, grounded retrieval, valid structured actions, repetition rate, first-token delay and device compatibility. Where a known answer is in a verified local knowledge record, deterministic retrieval is better than trusting an unreliable generator. A model fallback should never invent biographical facts.

Sources and original discussion links: [1](https://github.com/EricTung1007/portfolio)

### 19. Evals need task evidence, not impressive screenshots

The evaluation explainer in our discussions defined repeatable tests as the antidote to fluent but inconsistent model software. Minerva's Den needs datasets for retrieval with known sources, structured tool calls, coding patches scored by tests, delegated tasks, timeout and restart recovery, and prompt-injection resistance. Each run should preserve model, harness, quantization, task input, expected outcome, trace and resource use.

Track pass rate with uncertainty, failure categories, wall time, prompt cost, peak memory, tool-call errors and human interventions. A change that looks faster in one output sample may be worse under repeated autonomous work. For the 32GB Mac, successful useful work per minute and per GB is more meaningful than headline parameters.


## Retrieval and knowledge infrastructure

### 20. SAG2, SAG Wiki and the meaning of embedding-free

The shared SAG2 promotion said "RAG is dead" because it can search local documents without preprocessing embeddings. SAG Wiki's official technical documentation is more precise: original text is split and indexed with SQLite FTS5, BM25 finds candidates, a JEV evidence-judgment step scores passages, and strong evidence supplies terms for later retrieval hops.

This is still **retrieval-augmented** work. It changes retrieval mechanics, not the reason to retrieve evidence. No embedding at index time does not imply no index, no model work or no external calls; the documentation describes JEV as a service call. A real benchmark should compare BM25, SAG2-style multi-hop retrieval and hybrid RAG on the same local corpus, scoring evidence recall, citations, update cost, latency and offline boundaries.

Sources and original discussion links: [1](https://sag-wiki.zleap.com/en/docs/sag2) · [2](https://zleap.ai/en/technology/sag2)

### 21. Memorilla, compressed memory and lost provenance

The Memorilla discussion highlighted work on compressing large document collections into extremely small memories for an otherwise frozen LLM. It raises a distinct question from ordinary RAG: can a learned memory preserve the facts needed by future prompts without retrieving full passages each time?

The danger is provenance. A compressed representation may improve recall but provide no direct source location for a date, quotation or contested claim. Research implementations may also depend on CUDA/Linux rather than the Mac's MLX stack. The next test should compare answer accuracy, multi-hop reasoning, source traceability, incremental updates and resource cost against a conventional grounded retrieval baseline.

Sources and original discussion links: [1](https://github.com/snap-stanford/memorilla) · [2](https://www.reddit.com/r/singularity/s/2nvPi5AEpt)

### 22. Agentic RAG: rewrite, requery and know when to stop

Minerva's Den explicitly requires repeated search, question rewriting and multiple queries. The missing piece is a decision loop: detect low-quality sources, contradictory facts, wrong entity matches, outdated results or insufficient primary evidence, then choose whether a new search is justified. More searches are not automatically better answers.

A robust loop maintains a question, competing hypotheses, source list, evidence ledger, query-rewrite lineage and stopping budget. It must distinguish several reposts of the same original claim from independent corroboration. The previously published agentic RAG article already covers the ambition; the missing technical specification is **when to ask again and what evidence would change the conclusion**.

Sources and original discussion links: [1](https://erictung1007.github.io/portfolio/#/writing/research-agenda-agentic-rag)

### 23. Mantis and incremental page observation

A forwarded browser-agent description used the name Mantis and emphasized numbered text elements and returning only changed content after an action. That would reduce repetitive observation tokens during long browser sessions. The original precise repository URL was not included in the available paragraph. Multiple unrelated tools also use the name Mantis, so assigning a random GitHub repo to this lead would be inaccurate.

The important mechanism is stable element references and incremental DOM or accessibility-state updates. Compare successful actions per observed token, stale-ref failures, dynamic-page handling, visual-only elements and permission boundaries. Text-only views are efficient when semantic structure exists but can miss information conveyed only through layout or images.


## Computer use and developer utilities

### 24. Vercel agent-desktop and accessibility-based computer use

Vercel Labs' agent-desktop is a CLI/library rather than a model or standalone agent. It queries the operating system's accessibility tree, gives actionable UI elements references, and lets the calling agent observe, act and verify. Its public project documents macOS, Windows and Linux support. Compared with screenshot coordinate guessing, a semantic action surface may reduce wasted context and improve action targeting.

But accessibility permission is powerful, some apps expose incomplete trees, and snapshots can contain private text. A harness should restrict authorized apps and actions, check the UI again after acting, and redact sensitive trace content. An identical-task comparison against screenshot-first automation should report latency, successful operations and failure modes.

Sources and original discussion links: [1](https://github.com/vercel-labs/agent-desktop)

### 25. Poki: actual iPhone automation versus remote agent viewing

Poki's published instructions describe operating an iPhone with a Mac-side installation and device setup. That expands a tool-using agent's action surface to a phone. It is **not** the same as an iOS companion that merely displays the Mac's terminal-agent progress.

The useful experiment is a narrow iPhone regression test of the portfolio: open a page, identify a control, perform an action, verify the resulting state and capture evidence. Device authorization, OS permissions, networking, logs and recovery are new operational burdens. Successful phone automation should not be mistaken for unrestricted unattended operation.

Sources and original discussion links: [1](https://github.com/JosssphZhou/poki) · [2](https://poki.bot/docs/install)

### 26. Henge and the gap between booting and usefulness

The Henge link triggered a direct performance question: is macOS emulation on iOS usable or merely a technical demonstration? The project attempts to run macOS on iPhone/iPad with a compatibility layer and emulator components. Booting is a far weaker milestone than reliably running a set of applications for hours.

Practical measurement needs startup time, input latency, application compatibility, browser responsiveness, memory use, heat, battery drain and crash behavior. Even a functioning phone-hosted macOS does not create the Mac mini's unified-memory capacity for local inference. For operating Minerva's Den remotely, a thin authenticated viewer into the real Mac is likely a more efficient architecture than duplicating the workstation on a phone.

Sources and original discussion links: [1](https://github.com/Leviidev/Henge) · [2](https://www.kocpc.com.tw/archives/702552)

### 27. Umless and local speech cleanup

Umless was shared as an open-source dictation tool that cleans up spoken hesitation and revisions before inserting text at the cursor. The local pipeline combines speech recognition with a separate language-model cleanup stage. Tier sizes and language support differ; the reported 678 MB Lite tier focuses on English.

For Minerva's Den, voice input could become an optional local interface for research requests or agent instructions. The crucial boundary is that cleaned-up dictation is not an authorized tool command. Verify recognition error rate, intent preservation, rewrite latency, microphone permissions and idle memory. An aggressive cleanup model might alter a command's meaning, so consequential agent actions still need clear review.

Sources and original discussion links: [1](https://github.com/jatinbishla/umless)

### 28. Ghostty, Herdr, Orca and multi-agent terminal interfaces

The Ghostty discussion and the comparison with Herdr, Orca and T3-style terminals were ultimately about **workflow visibility**. A fast terminal emulator does not provide agent planning or delegation. A multi-pane agent UI may expose sessions, statuses and diffs, yet the benefit is only real if it maps to actual running processes.

Evaluate how quickly an operator can find a blocked agent, identify its owner, inspect its latest tool and patch, reattach after a restart and avoid changing unrelated sessions. A terminal stack should preserve the feeling of working in a terminal rather than abruptly snapping into unrelated page transitions.

### 29. Meta Astryx and agent-friendly design systems

Meta's Astryx is an open-source React design system oriented toward both people and agents, with components, theming, accessible patterns and customization. The question is not whether Minerva's Den should replace its existing retro aesthetic with a component catalog. It is whether a design system can help coding agents preserve intent during iterative changes.

Study exported component internals, token consistency, accessibility and migration cost. A suitable experiment would ask an agent to build the same dialog with and without strong component rules, then compare visual regressions, duplicate CSS, keyboard accessibility and review effort. The portfolio's newspaper and desk should retain their own distinct identity.

Sources and original discussion links: [1](https://github.com/meta/astryx)


## The portfolio, product ideas and operating philosophy

### 30. The six-feature ERIC.EXE workstation

The portfolio discussion selected six coherent features: interactive desktop, short skippable boot, useful simulated terminal, upgraded newspaper, visitor achievements and a 12-row punch card. These should share one fictional personal workstation rather than exist as disconnected gimmicks. The desktop is navigation, the CV desk is grounded information, the terminal routes safe commands, the newspaper carries published research and the punch card becomes a collectible artifact.

The implementation uses a Vite/React website with Git-backed bilingual Markdown posts, while visitor progress can stay in browser storage. The success criterion is **real interaction with real information**. Every decorative object should reveal something substantive, and accessibility plus predictable navigation take precedence over elaborate animations.

Sources and original discussion links: [1](https://github.com/EricTung1007/portfolio)

### 31. 0451, the locked drawer and two punch-card tiers

A key UX correction was that a golden punch card must not appear before the visitor enters the secret code. The desired immersive-sim sequence is to discover a subtle clue while reading the CV, find a locked drawer, machine password or sudo-style gate, enter **0451**, and only then unlock a golden collectible. Visitors who never find it must still receive a normal punch card.

The system needs explicit states: hidden clue, discovered clue, unverified code, verified secret and unlocked card. A test must start with fresh storage, verify the regular card is available, reveal the clue, enter the code and confirm gold appears only after successful verification. A false "gold unlocked" toast ruins both the game and the correctness of the implementation.

### 32. CV duplicates, snapping navigation and truthful AI answers

The user objected to CV and Resume links pointing to the same file, harsh page snapping while operating a terminal, and a tiny model that repeated itself catastrophically. These are related product principles: remove redundant actions, preserve interaction continuity, and do not present an unreliable generative answer as a factual personal record.

The public-facing CV assistant runs in a visitor's browser, unlike the Mac mini's server-side/local oMLX experiments. Known biography questions should use verified structured information, and optional LLM synthesis should fall back to that evidence on failure. The terminal can show state transitions inside its own interface rather than making the visitor feel teleported between unrelated pages.

### 33. One comprehensive newspaper issue, not one shallow tool per week

The first portfolio batch covered architecture, memory, the Hermes transition, agentic RAG, coding roles, the reboot incident and Ouroboros. It omitted many shared repos, pasted paragraphs, model rumors and original ideas. The user's later editorial correction defined a different policy: **all substantively unpublished material is the input, and exactly one coherent, chaptered article is the output**.

That means an editorial inventory and per-topic deduplication rather than selecting just the latest exciting link. Each subject retains its original URL, mechanism, relevance, limitations and open questions. A shared repo does not need to have been installed to merit a technical spotlight. Every new long-form issue becomes part of the publication ledger against which later Friday editions are compared.

### 34. Least privilege matters more than model nationality

A recurring discussion separated a model's text predictions from the harness and tools that can perform external actions. An isolated chat model with no shell or write permissions has a much smaller direct action surface than an agent granted filesystem, browser, email or deployment access. That is an important **capability distinction**, not proof that all model outputs are harmless.

The correct security design is least privilege, separate read/write authorization, approvals for consequential actions, redaction in logs and treating retrieved text as untrusted data. Vendor origin alone cannot establish maliciousness; evaluate observable permissions, telemetry, update paths and actual behavior. A model's competence still matters because an unreliable agent can misuse legitimately granted capabilities.

### 35. Open local models as a product strategy

The user argued that freely accessible local models may be "good enough" for people who mainly need web search, answers and simple automation, reducing dependence on subscriptions. This is a plausible product hypothesis and preference for user control, not verified evidence of any model publisher's motives. Offline operation, privacy, predictable marginal cost and freedom to customize can be meaningful advantages even when a local model trails frontier benchmarks.

Owning the harness also lets users design their own workflows within the law and permissions of external services. It does not make bypassing another provider's access controls acceptable. Minerva's Den can combine local freedom with explicit tool budgets, truthful evaluation and user-defined approval thresholds.

### 36. Ouroboros and autonomous experiments without self-deception

Project Ouroboros asked whether an AI could search for better local model configurations or bounded weight modifications, potentially with a stronger planning model guiding experiments. The current article on the site already records the proposal, so this edition only adds its operational acceptance criteria: immutable baselines, pinned evaluation tasks, compute budgets, reproducible experiment logs, regression tests, rollback and human review for significant changes.

An impressive score on a tiny selected benchmark may hide loss of general competence. An agent should propose falsifiable tests, not certify its own improvement by changing the goalposts. The first useful output is an automated evaluation and provenance pipeline, not an unrestricted self-rewriting model.

Sources and original discussion links: [1](https://erictung1007.github.io/portfolio/#/writing/ouroboros-auto-experimentation)

### 37. The overnight restart as a recovery test

On November 8, OpenCode and OpenClaw work was interrupted around a Mac restart. The existing post records the observed short hang, interrupted tasks and an oMLX memory-limit error after reboot, without a confirmed root cause. Repeating speculation about which app caused the restart is less useful than improving recoverability.

Tasks need durable IDs, checkpoints, resource accounting, last completed actions, retries and idempotent writes. The missing Hermes run history that the user encountered illustrates how difficult it can be even to confirm whether an agent executed a scheduled job. A deliberate fault-injection test should restart the agent mid-task, verify a single continuation and produce a readable timeline from mobile.

Sources and original discussion links: [1](https://erictung1007.github.io/portfolio/#/writing/incident-november-8)

### 38. The next five measurements that would settle the arguments

The remaining debates can be turned into five reproducible studies. **First:** same-model harness comparison, separating model ability from orchestration. **Second:** the M4/32GB inference frontier across quantization, context length and concurrency. **Third:** retrieval quality comparing BM25, multi-hop lexical search and hybrid RAG. **Fourth:** child-agent telemetry inspected from Telegram or iOS. **Fifth:** website regression tests for CV grounding, terminal continuity, the 0451 code, ordinary and golden punch cards, mobile reading and generation repetition.

Each study needs a recorded original question, exact implementation, hypothesis, source evidence, command or workflow, result, resource use and an honest decision. "Not tested" is a valid result label. The point of Minerva's Den is not a wall of agent logos but a small, auditable workstation whose capabilities can actually be tested.

---

## Editorial ledger

This single bilingual edition contains **38 numbered topics** across five chapters. Their original links appear under the relevant notes. The twelve existing English articles remain untouched. Future Friday issues should compare both these individual topic headings and their original source links against new discussions before publishing another consolidated issue. This edition describes exploration and investigation, not a claim that every tool is installed, approved or tested.
