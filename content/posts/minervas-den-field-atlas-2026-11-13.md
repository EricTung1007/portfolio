---
title: "AI Agents Are Systems, Not Models: A Field Guide to Local AI"
date: "2026-11-13"
category: "Minerva's Den"
tags: ["Local AI", "Agent Systems", "Open Source", "Research Notes", "Engineering"]
---

The most interesting thing about AI agents in 2026 is no longer that they can call tools. It is how quickly a simple model-and-tool loop has turned into an entire software ecosystem: coding terminals, remote companions, management planes, desktop controllers, memory systems and experimental inference engines.

Behind the product names are a handful of important engineering questions. What really separates a coding agent from a general agent? Does an extra layer of orchestration improve work or just multiply overhead? Can a 32 GB machine run a capable local research assistant without consuming its own resources on coordination? And which of the newest open-source projects actually offers a useful mechanism rather than an attractive demo?

This field guide follows the projects and ideas that matter most to a small, local-first workstation. It is organized by **technical problem**, not by the order in which links appeared online. Each group leads to a concrete design conclusion, because knowing what a repository does is only half as useful as knowing when it is worth adopting.

## An agent is more than its model

### A coding agent is a general agent with a software contract

What separates a coding agent from a general assistant? Less than the product categories suggest. Both run a loop: gather context, ask a language model what to do, invoke a tool, inspect the result, and repeat. Nothing about that loop inherently limits the agent to writing software. The decisive difference is the *environment and completion contract* wrapped around it.

A coding agent starts with a repository, a working directory, a diff, a test runner and a precise definition of success: a patch that builds and passes tests. A general agent starts with a wider collection of connectors, applications, web pages, messages and scheduled activities. It may be able to write code too. Conversely, a coding agent with browser and API tools can perform general tasks. **The boundary is product design and tool configuration, not a different species of intelligence.**

That explains why the same model can feel competent in one harness and lost in another. Context packing, command execution, retry policy, patch strategy and verification determine whether the model's decisions become useful artifacts. In a controlled comparison, model quality should be held constant while those mechanisms change. The meaningful question is whether a harness turns a request into a verified outcome with fewer failures, less time and less human supervision.

The major families make more sense when classified by their *default workflow* rather than claiming an overall winner:

| Family | Examples | Strongest default role |
| --- | --- | --- |
| Terminal-first coding | [Pi Coding Agent](https://github.com/badlogic/pi-mono), [Aider](https://github.com/Aider-AI/aider), [OpenCode](https://github.com/anomalyco/opencode) | Working directly on a repository with relatively little UI machinery |
| Integrated coding | [Codex](https://github.com/openai/codex), [Claude Code](https://github.com/anthropics/claude-code), [Cline](https://github.com/cline/cline), [Roo Code](https://github.com/RooVetGit/Roo-Code) | Reviewable edits, tool permissions and development workflows |
| Broader agent environments | [OpenClaw](https://github.com/openclaw/openclaw), [Goose](https://github.com/block/goose), [OpenHands](https://github.com/All-Hands-AI/OpenHands) | Application tools, automation, sandboxed or multi-purpose work |
| Coordination layers | [Paperclip](https://github.com/paperclipai/paperclip), [DSH Superagent](https://github.com/deepseek-ai/dsh-superagent-prototype) | Assigning, governing and tracking work that agents execute |

Those categories overlap, and each product evolves. But the engineering conclusion is durable: **choose a harness for how its tools execute and verify work, not because its default model happens to win a leaderboard.** For a resource-constrained workstation, a lean coding runtime plus a separate general orchestration layer is easier to reason about than requiring one enormous agent to do everything.

### DSH and Paperclip solve different halves of autonomy

Consider a request to repair a failing build. The model can propose a fix, but a reliable system also needs to know who authorized the job, where changes belong, what happens when it crashes, and when the human should hear about the result. Two projects illustrate complementary answers.

[DeepSeek's DSH Superagent prototype](https://github.com/deepseek-ai/dsh-superagent-prototype) packages a proactive coding workflow around one GitHub repository. Authorized requests become tracked work items, each with its own agent session and working directory. Results return to the originating conversation, potentially with a pull request. Its philosophy is simple: minimize interruptions, speak when a human decision is required or a usable result is ready. The important innovation is not a clever CEO prompt; it is treating an agent task as a durable **work item** rather than an ephemeral chat turn.

[Paperclip](https://github.com/paperclipai/paperclip) operates one level higher. Its Node.js server and React UI manage goals, agents, reporting relationships, budgets, heartbeats, task hierarchies, approvals and run histories. Execution remains in adapters that connect to coding agents, shell processes or other runtimes. Paperclip is closer to an operations control plane than to an individual coding assistant. That is useful once several agents share responsibilities or monetary budgets.

The separation has consequences. Paperclip can coordinate external agents, but it is not an automatic live mirror of every unrelated child process. The agents must send their states through supported adapters or an integration. DSH supplies a concrete work-item pattern, but its published code is a research prototype centered on a particular GitHub workflow, not a universal production supervisor.

The practical choice: **borrow DSH's tracked-work pattern first; add Paperclip when governance across several agents is the problem.** If all that is needed is to see what a few workers are doing, a smaller read-only timeline fed by real tool events will be easier to deploy than an entire artificial company.

### Cindy, Pi and the emerging agent companion

An agent that only exists in a terminal is technically capable but can be inconvenient as a daily companion. [Cindy](https://github.com/makecindy/cindy) approaches the problem as a multi-device product. Its open client is organized around desktop and mobile apps, bringing together Claude Code, Codex and Pi while offering companion identities, memory, skills, routines and remote computer access. Its README distinguishes access to a user's connected computer from the cloud services used for synchronized companions.

That design reveals an increasingly important product layer: **the same underlying coding harness can be presented as a general-purpose assistant** if it receives the right connectors, identity, persistence and mobile UX. Swapping the engine does not automatically preserve every hidden session state, but it can preserve a coherent experience for the human operating it.

[Pi Coding Agent](https://github.com/badlogic/pi-mono) sits at the other end of the spectrum: a lightweight, extensible terminal-first agent. Its agent loop and session interfaces can support wrappers, bots and remote interfaces. Community mobile clients and Pi-based bots may share an engine without being the official app from the same maintainers. The important distinction is between *running the agent on the phone* and *observing an agent running on a computer*. A thin authenticated companion often handles the second job better than a second local model.

That contrast makes the Cindy-versus-Alma-versus-DS Bot discussion useful beyond product rankings. The value of a companion is not the sheer number of skills advertised. It is whether actions, state, permissions and history remain understandable across the desktop and phone.

For a local-first system, the most interesting combination is a **simple, transparent runtime with a polished remote interface**, not a gigantic agent framework chosen just because it happens to include an iOS client.

## Giving agents eyes, hands and a place to work

### Mantis: stop showing an agent the same web page again

Browser automation has an expensive habit: after a click, the agent often receives another giant observation of a page it mostly saw already. [Mantis by Perzian](https://github.com/perzianhq/mantis) attacks exactly that overhead. It turns browser pages into compact numbered text, lets an agent target elements by reference, and returns changes instead of repeatedly dumping an entire page. It can be used as an MCP server or through its CLI.

This is not merely a prettier text scrape. A stable element reference lets the agent say "click control 3"; an incremental response tells it what changed after the click. The model spends less of its context reconstructing the same navigation, cookie banners and unchanged sidebars. Mantis's published long-task results against a Playwright accessibility-tree baseline report, for one model column, median input tokens of **244k versus 345k** and median wall time of **42 versus 66 seconds**. Those are project-run benchmarks under the stated test suite, not universal speed guarantees.

A local research agent that reads documentation, follows links and checks several sources can benefit from that reduction in observation overhead. The limitation is equally concrete: if a task depends on visual layout, images or a custom canvas, numbered text will not expose everything. Stable IDs must also survive dynamic changes or be refreshed safely.

**The takeaway is about interface design:** an agent needs the *difference from the previous observation*, not another copy of the entire world. That principle applies as much to logs, git diffs and desktop tools as to a browser.

### agent-desktop turns accessibility into an API

[Vercel Labs' agent-desktop](https://github.com/vercel-labs/agent-desktop) solves a neighboring problem on the operating-system desktop. Rather than repeatedly asking a vision model to find pixels, it reads application accessibility trees, represents buttons and inputs as structured JSON, and gives actionable elements references. An agent can observe, click a reference, inspect the new state and decide what to do next. The program is a CLI and C library with no built-in model.

The official install uses `npm install -g agent-desktop`; `agent-desktop status` inspects platform readiness, while `agent-desktop permissions --guide` helps with macOS accessibility permissions. macOS, Windows and Linux have their own adapters. The tool's point is that native apps can expose meaningful semantics without requiring the language model to reverse-engineer their appearance.

Mantis and agent-desktop are complementary, not interchangeable. One specializes in web pages and incremental browser observations; the other uses OS-level accessibility information to reach desktop applications. Both work best when an existing interface publishes clear, stable control semantics.

Accessibility access is powerful and must be scoped. A button that can be clicked can also be destructive, and a snapshot may contain private window text. The right agent harness restricts allowed applications, verifies the result after each action and avoids shipping raw desktop traces to unrelated services.

For a Mac-based workstation, **structured desktop control is worth trying before full screenshot-driven automation**, especially for repetitive forms, settings and ordinary application controls. Visual fallback remains necessary when the accessibility tree is inadequate.

### A phone as an endpoint: Poki, Henge and Umless

The mobile projects illustrate three fundamentally different ways to extend a workstation. [Poki](https://github.com/JosssphZhou/poki) exposes an actual iPhone to an AI agent through local integration and an MCP-oriented workflow. It is a way to **operate a phone**, not simply a mobile dashboard. Its documented setup includes device authorization and phone-side configuration, making it particularly interesting for automated iOS UI testing. A sensible use would be to open a website on a real phone, interact with a control and verify the result.

[Henge](https://github.com/Leviidev/Henge) goes further in a different direction: emulating macOS on iOS and iPadOS. It includes its own ARM64 JIT, memory-management emulation and graphics replay through Metal. Its README reports reaching a macOS lock screen on an iPhone 17 Pro in roughly 15 seconds, but installation also involves a large macOS image, JIT requirements and guest memory limits. The impressive result is **technical feasibility**, not proof that a phone has become a practical replacement for an M4 desktop. For heavy local LLM work, remote access to the real Mac remains the sensible default.

[Umless](https://github.com/jatinbishla/umless) represents a third direction: voice as an input device. Its local speech pipeline can transcribe dictation and clean disfluencies before inserting text at the cursor. Speech cleanup is valuable for writing, but when used to command an agent it introduces a subtle risk: rewriting a sentence can alter its intended action. Important operations should show the interpreted command before execution.

Related terminal tools such as [Ghostty](https://github.com/ghostty-org/ghostty) and multi-session agent workspaces solve the *visibility* side of this equation. A fast terminal is not an agent brain; a tiled interface is not proof that child agents are making progress. Genuine run IDs, tool logs and reattachable sessions matter more than animated windows.

The choice is therefore straightforward: **use a remote companion to observe the Mac, Poki when the task truly needs iPhone actions, Henge for emulation experiments, and local dictation for faster human input**. These are four different capabilities, not four replacements for the same app.

## What actually fits inside 32 GB?

### Model size is a resource budget, not a download number

A small computer changes the meaning of a model recommendation. On an M4 Mac mini with 32 GB of unified memory, the model competes with macOS, caches, agent runtimes, retrieval processes and every other active application. A heavily quantized 27B checkpoint might occupy far less disk space than its full-precision weights, but loading the file is not the same as completing useful work.

Consider the layers: **weights** hold model parameters; **KV or recurrent state** grows with architecture and context; **runtime buffers and activations** consume additional memory; and **concurrent requests** can duplicate portions of this footprint. Quantization may reduce weights but not proportionally reduce all the other costs. GGUF and MLX are also not interchangeable backends, and a TurboQuant-related cache optimization must be implemented by the actual inference runtime to matter.

An earlier local Python coding workload used 4,096 prompt tokens and generated 128 tokens. The recorded result was approximately **64 prompt tokens/s, 11.1 generation tokens/s, a 64-second first-token delay and 19.4 GB peak memory**. That latency is an important operational observation: a multi-step agent that repeatedly resubmits long context can feel much slower than its decode rate suggests.

Model announcements for Qwen3.8-27B Turbo, Flash-Next and newer small models are worth following, as are unusual architectures like LFM3. But a download-size headline or theoretical 256K context limit does not answer the main question. An agent needs enough memory to stay alive, sufficient prompt throughput to act repeatedly, and stable tool formatting to finish the job.

**The metric worth optimizing is verified task completion per minute and per GB.** Under that criterion, a smaller model paired with better retrieval and a lean harness may be more useful than an oversized checkpoint that leaves no room for the rest of the system.

### DSpine asks whether drafting is cheaper than waiting

Autoregressive decoding normally generates tokens one after another. Speculative decoding attempts to avoid some of that serial cost: a smaller or specialized **drafter** predicts several tokens, and the target model checks them in a more parallel step. When enough drafts are accepted, output arrives faster without replacing the target's own token distribution.

[Tencent's DSpine](https://github.com/tencent/dspine) is interesting because it drafts positions in parallel while passing predicted features through network depth to preserve causal dependencies. The project documents Qwen-family targets and an Apple Silicon implementation in its own `dspine_mlx` package, with optional SGLang-MLX integration. That provides a concrete route to testing on a Mac rather than relying only on CUDA demonstrations.

But **the cost of the drafter is part of the equation**. It uses compute, possibly its own cache and extra memory. As prompt length grows, acceptance may change; a low acceptance rate can erase the expected speedup. This is why comparisons with DFlash2, MTP heads and Lightning-like approaches should report acceptance length, total latency, memory use and model/backend compatibility, not just tokens per second under a favorable setting.

The useful question is not whether DSpine can beat a baseline in a paper. It is whether its MLX route improves the exact workflow running on an M4 without squeezing other services out of 32 GB. Its MLX implementation should not be assumed compatible with oMLX without an integration path.

**DSpine earns a place on the test bench, not automatic deployment.** A verified gain in end-to-end agent throughput at acceptable peak memory would be the decisive result.

### Quantization and removing refusals are separate quality problems

Model experiments frequently combine two unrelated ideas: compressing a checkpoint to save memory, and modifying a checkpoint to change how often it refuses a prompt. They need different evaluations.

[Unsloth's Dynamic quantization work](https://huggingface.co/unsloth) explores allocating precision selectively rather than treating every weight equally. The benefit should be evaluated at a **matched memory budget**, under the same backend and the same coding or retrieval tasks. A promotional percentage on Terminal Bench is not automatically a gain for an oMLX installation, especially when the release is in GGUF rather than MLX format.

Heretic and *abliteration* experiments seek to alter refusal-associated behavior. A model can become more willing to answer and still become less reliable at reasoning, structured tool calls or following constraints. [ZeroZero, a Qwen3-8B-derived community checkpoint](https://huggingface.co/LastMachine/Qwen3-8B-ZeroZero-Heretic), attracted attention through an enthusiastic report about complex tool use. That is a reason to test it, not evidence that modifying guardrails inherently improves intelligence. The same applies to spectacular claims about tiny DeepSeek–Qwen "hybrids": the model card and training provenance must support the label.

A sensible comparison has **three independent scorecards**: capability on real coding/retrieval tasks; resource use and latency; and response/refusal behavior on clearly specified prompts. One score cannot stand in for the other two. Exact checkpoint IDs, backend revision and tests matter much more than labels such as "Turbo" or "uncensored."

The strongest selection principle is to **retain the unmodified base as the reference**. A candidate that saves memory or refuses less but breaks the tools needed for the actual work is not an improvement.

### Tiny models expose failures that benchmarks often miss

A personal website assistant is a good place to learn why model scores do not equal product quality. A small browser-side model can repeat itself catastrophically, misread the retrieved evidence or confidently invent an answer to a CV question. The failure is immediately visible to visitors, regardless of the model's mathematical benchmark score.

There is a straightforward architecture for factual personal assistance: first retrieve the relevant verified record; if it directly answers the question, render that answer deterministically. Use optional generation only for explanation or synthesis. If the generated stream begins repeating or violates its expected structure, stop the generation and fall back to the verified source. This is more dependable than asking a tiny LFM3 or Qwen variant to reconstruct a biography from its weights.

The same lesson scales to autonomous agents. A model benchmark should be supplemented with task-level tests for valid tool schemas, evidence citations, long-context prefill time, repeated action loops, crash recovery and code that actually passes tests. When swapping a harness or quantization, run the *same tasks* again.

For a web assistant, **correctness and graceful failure outrank raw text fluency**. For a coding agent, the equivalent is a verified patch rather than an eloquent account of work supposedly completed.

## Beyond the vector database

### SAG2 makes the case for lexical retrieval without declaring RAG dead

Embedding-based vector search has become almost synonymous with RAG, but that is a category error. Retrieval-augmented generation means supplying an answer with external evidence. There is no requirement that the evidence must come from a vector database.

[SAG2, as implemented in SAG Wiki](https://sag-wiki.zleap.com/en/docs/sag2), offers a concrete alternative. At indexing time it preserves original text and builds a SQLite FTS5 full-text index without generating embeddings. At query time BM25 finds lexical candidate passages; a JEV evidence-judgment stage evaluates which passages help answer the question; useful passages can yield terms for additional cross-document retrieval. The interesting feature is the **evidence-guided multi-hop search**, not a slogan about the death of RAG.

This architecture is attractive when documents contain precise identifiers, distinctive terminology and references that can be followed through other files. Lexical search is cheap to index, debuggable and capable of returning original source text. Its weakness is the classic vocabulary mismatch: a document can express the same idea without sharing the question's words. A judgment-and-requery stage helps, but semantic retrieval can still be complementary.

The important privacy detail is where each operation runs. Local full-text indexing does not automatically mean the later evidence judgment is entirely offline; a service-based judgment step changes the deployment boundary.

**The sound conclusion is not BM25 versus vectors as a winner-take-all fight.** Start with transparent lexical search for exact evidence, add requerying when connections are missing, and use semantic retrieval where vocabulary gaps demand it. That is a more modular RAG design than treating embeddings as the whole architecture.

### Memorilla compresses knowledge, but not the need for evidence

What if an assistant could absorb hundreds of documents but receive only **16 learned memory tokens** when answering? [Stanford's Memorilla research](https://github.com/snap-stanford/memorilla) explores that possibility. Incoming documents are encoded into reusable representations. A learned memory module examines the question and information store, then produces a small fixed set of query-dependent tokens consumed by a frozen language model.

The reported research results are striking: with a 512-document benchmark, its website reports **0.74 seconds versus 19.9 seconds** for a long-context baseline on one H100, while the model receives very few document tokens. It also reports **84.33% versus 80.43%** against full context on FactKG. These measurements are valuable as research findings, but they describe the authors' evaluated setup, not an Apple Silicon installation.

Memorilla and ordinary RAG preserve different things. RAG can show the exact paragraph containing a date, name or quotation. A compressed latent memory can connect weakly related facts across many documents but may discard a precise detail. Memorilla also needs a memory module trained for the target model, so it is not a drop-in replacement for an arbitrary local checkpoint.

For a personal research workstation, the best conceptual architecture is **compressed memory for continuity, source retrieval for verification**. A research assistant can remember that two papers contradict one another, but when publishing it should reopen the actual papers and cite the passages. The two techniques solve complementary problems.

### From question-answering to an autonomous research desk

A search button answers the question the human already knows to ask. A research agent should also decide **what question deserves to be asked next**. The strongest idea behind agentic RAG is therefore not simply running five search queries instead of one. It is an iterative evidence loop.

Start with a research claim or engineering decision. Break it into testable subquestions; search original source code, documentation and papers; compare contradictory findings; rewrite the next query around the missing fact; and stop when more retrieval no longer changes the decision enough to justify the cost. The system should distinguish an official benchmark from five social posts repeating that benchmark. It should also remember why a hypothesis was rejected, so the next research cycle does not rediscover the same dead end.

A useful example is choosing speculative decoding for a 32GB machine. The agent should not search only "DSpine speedup." It should also ask which runtime supports the target model, how draft caches behave, whether Apple Silicon support matches the active backend, and whether an actual end-to-end result exists. The output should be an engineering decision, not a collage of search snippets.

[Karpathy's autoresearch](https://github.com/karpathy/autoresearch) demonstrates a different but related principle: constrain what an agent may change, give each experiment the same time budget, measure one explicit metric, then keep or discard the modification. Its published single-GPU setup targets NVIDIA hardware, so reproducing that code unchanged on an M4 is not the point. The transferable lesson is **a closed experiment loop with a fixed baseline**. This is also the foundation of the Ouroboros idea of improving local model configurations.

An autonomous research desk becomes valuable when it can say: "Here are the leading options, this is the evidence, this is the trade-off, and this is the next experiment that could change the answer." Anything less is just automated browsing.

## Engineering discipline beats an elaborate org chart

### Superpowers, skills and the value of verification

A large collection of installed skills can make an agent look sophisticated while increasing the amount of irrelevant instruction it has to carry. [Anthropic's Skills](https://github.com/anthropics/skills) and the [Awesome OpenCode catalog](https://github.com/awesome-opencode/awesome-opencode) are useful as discoverable procedure libraries, but the right abstraction is **load a skill when a task needs it**, not paste an entire marketplace into every prompt.

[obra's Superpowers](https://github.com/obra/superpowers) offers a more opinionated engineering method. Its skills include brainstorming, writing plans, systematic debugging, test-driven development, code review and verification before completion. The crucial idea is not that a prompt magically improves code. It is that the agent repeatedly follows a falsifiable workflow: write a failing test, make it pass, inspect the evidence, and only then report completion.

This matters for multi-agent design. Assigning one agent to implementation and another to review can improve independence, but every handoff has latency, context and coordination costs. If a small local model spends more effort summarizing what it did than executing the work, the org chart has become a liability. A practical manager needs compact reports containing files changed, tests run, decisions and blockers, with links to full logs when needed.

Likewise, a recurring task needs an actual scheduler, durable state and idempotent work, not merely a prompt saying "run this every morning." Whether implemented through a harness schedule or macOS launchd, a job should have a stable identity, a last-success record, a lock and a safe retry policy. The failure mode to avoid is an agent confidently announcing it completed work that never reached a repository.

**Discipline outperforms decoration.** A modest agent with precise skills, tests and a trustworthy task ledger is often more useful than a swarm of specialists whose outputs cannot be independently verified.

### FreeLLMAPI and the case for explicit model routing

[FreeLLMAPI](https://github.com/tashfeenahmed/freellmapi) takes a different route to model freedom: put multiple provider accounts and compatible endpoints behind one OpenAI-style `/v1` interface. Its router tracks quotas, selects available endpoints, falls back when a provider hits a limit, and stores upstream keys encrypted. It can also route requests to custom self-hosted endpoints, which makes it a useful bridge between local and cloud inference.

The project offers free and premium catalog-update paths; its documentation distinguishes faster updates for paid users from a delayed catalog feed for free installations. That is a **router feature difference**, not proof of unlimited free compute. An agent still depends on each provider's quota, latency and tool-support quirks. When the highest-priority model runs out of quota, automatic fallback may silently choose a weaker model.

This creates an engineering issue: a coding agent should not resume halfway through a critical task under a different capability level without recording it. Model routing should be observable, budget-aware and sensitive to tool-call compatibility. For low-risk summarization, a weaker fallback can be acceptable. For a patch that must satisfy strict tests, waiting or explicitly selecting a known-capable model may be safer.

The product conclusion is **use a gateway for flexibility, not as a substitute for capacity planning**. Local models deliver predictability and control; a router offers optional reach beyond the hardware budget when that added capability has a clear benefit.

## A personal computer worth exploring

### Astryx and the difference between a design system and a theme

[Meta's Astryx](https://github.com/meta/astryx) offers an instructive example of a design system built for both humans and agents. Its documentation describes accessible React components, themes, templates, a CLI, exported internals and the ability to bring component source into a project for customization. It currently targets React 19+, which matters for teams still running an older React version.

The interesting idea is not to paste Astryx's appearance over every website. A design system encodes **decisions and constraints**: which button variants exist, how focus works, how states are named, which spacing tokens are valid and how components should be composed. Those contracts reduce the number of arbitrary UI decisions a coding agent makes during an edit. They can also make visual regressions easier to detect.

An immersive personal website makes the distinction obvious. A retro desktop, a simulated terminal and an old-fashioned newspaper can all be part of one coherent interface, but only if their navigation and state rules remain consistent. Small details such as a transition that suddenly teleports the visitor, or an achievement that unlocks before the required action, break the illusion because they violate the interaction contract.

A hidden access code such as **0451** is a useful state-machine example: the clue exists, the visitor discovers it, a code is entered and verified, and only then does a collectible change appearance. A normal collectible remains available to everyone. The interesting engineering problem is not the number itself; it is preventing UI state from contradicting what the visitor actually did.

**A successful design system preserves the product's identity while making that identity testable.** For a distinctive portfolio, borrowing Astryx's component discipline is more valuable than replacing the visual language wholesale.

### The architecture I would actually build on a small Mac

After comparing so many repos, the most useful conclusion is not a shopping list. It is that the local AI stack becomes easier to build when each part has a **single job**.

The language model supplies reasoning. A slim harness executes tools. A task ledger records truth about progress. Retrieval locates evidence. A separate interface lets a human inspect and intervene. Optional services expand the machine's reach, but only when their benefit outweighs their operational cost.

A workable Minerva's Den architecture therefore looks like this:

```text
User / Mobile companion / Interactive web interface
                    |
             Task & run ledger
                    |
        General agent orchestrator
             /              \
   Coding harness        Research workflow
   repo, diff, tests     query, retrieve, verify
             \              /
            Model / inference router
              |           |
         Local MLX      Optional API
              |
       Mac mini M4 / 32 GB
```

The first priority is **observability**. Every task should have an identity, current state, timestamp, tool trace and verifiable artifact. The second is **resource discipline**: one expensive local inference process may be better than several competing ones; measure memory pressure and useful completion rather than counting active agents. The third is **evidence discipline**: a research answer cites the original source, and a coding answer points to tests or a diff.

What I would *not* do first is deploy Paperclip, several autonomous supervisors, multiple vector databases and every skill from a catalog just because they are available. The resulting system would be impressive to diagram and frustrating to operate.

The most interesting shift in today's agent landscape is that intelligence is becoming a component, not the whole product. The real work is designing the boundary between models, tools, memory, people and consequences. **A small machine with clear interfaces and measurable results can be a better agent system than a much larger machine surrounded by opaque automation.**

## Further reading

The most useful starting points are the original repositories: [Pi](https://github.com/badlogic/pi-mono), [OpenCode](https://github.com/anomalyco/opencode), [DSH Superagent](https://github.com/deepseek-ai/dsh-superagent-prototype), [Paperclip](https://github.com/paperclipai/paperclip), [Cindy](https://github.com/makecindy/cindy), [Superpowers](https://github.com/obra/superpowers), [Mantis](https://github.com/perzianhq/mantis), [agent-desktop](https://github.com/vercel-labs/agent-desktop), [Poki](https://github.com/JosssphZhou/poki), [Henge](https://github.com/Leviidev/Henge), [Umless](https://github.com/jatinbishla/umless), [DSpine](https://github.com/tencent/dspine), [SAG2](https://sag-wiki.zleap.com/en/docs/sag2), [Memorilla](https://github.com/snap-stanford/memorilla), [Astryx](https://github.com/meta/astryx), [FreeLLMAPI](https://github.com/tashfeenahmed/freellmapi) and [autoresearch](https://github.com/karpathy/autoresearch). For neighboring experiments, see [Swarm Site](https://califa.github.io/swarm-site/), [Awesome OpenCode](https://github.com/awesome-opencode/awesome-opencode), [Unsloth](https://huggingface.co/unsloth), and the community [ZeroZero checkpoint](https://huggingface.co/LastMachine/Qwen3-8B-ZeroZero-Heretic).
