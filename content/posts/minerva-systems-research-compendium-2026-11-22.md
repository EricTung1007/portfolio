---
title: "The Local Agent Systems Review: Models, Harnesses, Retrieval and the Evidence Behind the Hype"
date: "2026-11-22"
category: "Minerva's Den"
tags: ["Local LLM", "Agent Engineering", "MLX", "Inference", "Coding Agents", "RAG", "Research"]
stamp: "VERIFIED"
sources:
  - "https://huggingface.co/thinkingmachines/Inkling-2-Mini"
  - "https://huggingface.co/sensenova/SenseNova-Loop-9B"
  - "https://huggingface.co/harness-hub/Qwen3.8-27B-pi-adapted"
  - "https://github.com/ashhart/TensorFold/blob/main/docs/recipes/qwen3.8-27b.md"
  - "https://github.com/earendil-works/pi"
  - "https://github.com/anomalyco/opencode"
  - "https://github.com/Zleap-AI/SAG-Wiki"
---

A great deal of local-AI engineering was compressed into a few weeks of November 2026. Looped transformers challenged the assumption that fewer stored parameters always mean simpler inference. A harness-specific LoRA changed coding-agent benchmark results without changing the underlying model's size. A Rust web scraper promised far lower idle memory than its predecessor. Coding-agent front ends made the same terminal loop accessible through browsers, phones and management dashboards. Meanwhile, no-weight rule engines, a macOS emulator for iPhones and automated paper writers blurred the boundary between a plausible demonstration and a deployable tool.

The interesting question is not which launch announcement has the largest percentage. It is **which measured change survives contact with a 32 GB local workstation, and at what layer of the system it belongs**. This review investigates the substantive models, benchmarks, repositories, client interfaces and research ideas circulating in the November 10–21 discussion period. Related tools are grouped by the engineering decision they affect. Every group ends with a conclusion, and the distinctions between published test results, source documentation, community reports and untested estimates are intentional.

## 1. Local inference: small weights are not automatically cheap computation

### Inkling 2 Mini versus Qwen3.8-27B: the scores that actually matter

[Thinking Machines Lab's Inkling 2 Mini](https://huggingface.co/thinkingmachines/Inkling-2-Mini) is a multimodal, looped Mixture-of-Experts transformer with approximately **26.4 billion total parameters, 3.4 billion active per pass**, and **5.4 billion effective active parameters per token** after accounting for re-executed layers. Its 24 physical decoder layers perform 48 layer applications: the central twelve are run three times. That architecture reduces weight storage relative to a conventional network with 48 independently stored layers, but each pass still performs arithmetic and touches the KV cache.

That is why "5.4B active" cannot be translated into a claim that Inkling will decode as fast as a conventional 5.4B model. The launch card supports Apple silicon with at least 32 GB memory, but it does not promise a specific speed on a base M4 Mac mini.

A useful comparison must use the **same benchmark and harness**. The vendor's own model card supplies several direct Inkling/Qwen3.8-27B comparisons:

| Evaluation and stated setup | Inkling 2 Mini | Qwen3.8-27B | Evidence-based interpretation |
| --- | ---: | ---: | --- |
| DeepSWE v1.1, mini-swe-agent 2.4.6 | 48.2% | 42.2% | Inkling +6.0 percentage points |
| SWE-bench Pro v2 Hard, same mini-swe-agent | 77.9% | 73.8% | Inkling +4.1 points |
| Terminal-Bench 2.1, pi 0.83.0 | 71.6% | 73.0% | Qwen +1.4 points |
| BrowseComp with compaction | 79.0% | 61.6% | Inkling +17.4 points in the supplied configuration |
| AA-Omniscience non-hallucination rate | 63.4% | 71.4% | Qwen +8.0 points; Inkling is not uniformly more reliable |
| Multi-turn factual / instruction use | Not one universal score | Not one universal score | Harness, task and language control matter |

These numbers come from the [Inkling model card's side-by-side table](https://huggingface.co/thinkingmachines/Inkling-2-Mini), not from independent reproductions on one Mac. Different rows explicitly use different harnesses; **one row must not be blended with another to claim a universal agent winner**. The card also warns that Inkling can loop repetitively, follow complex project conventions poorly, mishandle destructive actions and produce less consistent non-English output. For unattended tools, those failure modes can matter more than a coding benchmark lead.

The quantization tradeoff is also measurable. [Unsloth's GGUF quantization table](https://huggingface.co/unsloth/Inkling-2-Mini-GGUF) lists UD-Q2_K_XL at **9.14 GB** with **91.6%** same-top-token agreement against its 8-bit reference, UD-Q4_K_M at **16.61 GB** and **97.9%**, and UD-Q4_K_XL at **17.63 GB** and **98.0%**. These are token-distribution fidelity statistics on Unsloth's evaluation corpus, not pass rates on programming tasks. The roughly 1 GB extra from Q4_K_M to Q4_K_XL buys only 0.1 percentage point of the reported same-top-token statistic, so the larger quantization is not an automatic practical choice.

**Runtime status changed quickly after release.** Inkling is no longer merely a prospective MLX model: the [official Hugging Face release blog](https://huggingface.co/blog/inkling2mini) documents MLX support, the [MLX community 4-bit checkpoint](https://huggingface.co/mlx-community/Inkling-2-Mini-4bit) exists, and [oMLX v0.8.2](https://github.com/jundot/omlx/releases/tag/v0.8.2) lists native Inkling support with text and image input and ready-made [oQ4e MTP](https://huggingface.co/mlx-community/Inkling-2-Mini-oQ4e-mtp) and [oQ3e MTP](https://huggingface.co/mlx-community/Inkling-2-Mini-oQ3e-mtp) packages. The oQ4e and oQ3e packages are listed at approximately **16.9 GB** and **13.7 GB** respectively. This establishes availability, **not** a validated M4 32 GB throughput benchmark.

Community reports should be treated as calibration points rather than universal benchmarks. A November 21 [Reddit report](https://www.reddit.com/r/LocalLLM/comments/1y1ly94/opinions_on_inkling_2_mini/) describes a best result of **14 tokens/s on an M3 with 16 GB**; another [community write-up](https://www.reddit.com/r/LocalLLM/comments/1y1xyqh/inkling_2_mini_memory_and_speed_explained_the/) cites approximately 30 tokens/s on an M5 Pro in a particular quantized configuration. Unsloth's [support thread](https://www.reddit.com/r/unsloth/comments/1y1jnnu/inkling_2_mini_is_now_fully_supported_with_lower/) confirms early loading and context-consumption problems, followed by fixes. Those reports differ in memory capacity, runtime, quantization and context. They are insufficient to promise a 1.5–2.5× speedup over a different MTP-enabled Qwen deployment.

**Verdict:** Inkling is a credible local candidate with stronger vendor-reported performance on some coding and research tasks, and working MLX/oMLX distributions. Qwen still leads on some reliability and terminal tasks. On a 32 GB Mac, choose a quantization only after accounting for the model, runtime buffers, KV cache, OS and concurrent agent tools. The decisive open measurement is **paired M4 tests of Inkling oQ4e-MTP and Qwen oQ4e-MTP with equal context, output lengths, sampling and draft acceptance statistics**.

### SenseNova Loop-9B: 9B stored parameters, 56 layer executions

[SenseNova Loop-9B](https://huggingface.co/sensenova/SenseNova-Loop-9B) uses **32 distinct decoder layers**, but executes the middle 24 twice for **56 layer computations per token**. Its two-stream manifold-constrained hyper-connections and hybrid attention increase representational work without storing separate weights for each repeated layer. The vendor calls it about 9B stored parameters and approximately 14.6B inference-equivalent parameters.

The release card reports that 4-bit weights and an 8-bit KV cache need around **15 GiB at 256K context**, and advertises a 512K maximum context. That is the **publisher's specific deployment configuration**, not a guarantee that all local runtimes can achieve it. Official AWQ and GGUF builds exist, but the loop execution schedule requires a compatible backend; a generic model loader recognizing a configuration file is not proof of correct layer re-use.

Three reported cross-model agent scores explain the hype more accurately than the phrase "beats 27B":

| Benchmark | SenseNova Loop-9B | Qwen3.8-27B | Outcome |
| --- | ---: | ---: | --- |
| AutomationBench | 36.67 | 36.67 | Tie |
| AIDABench | 65.31 | 65.01 | Loop +0.30 |
| NL2Repo | 41.36 | 44.60 | Qwen +3.24 |

The [SenseNova model card](https://huggingface.co/sensenova/SenseNova-Loop-9B/blob/main/README.md) also shows a major improvement over its **own preview**: AutomationBench **14.33 → 36.67**, Terminal-Bench 2.1 **40.45 → 59.55**, and GAIA **37.86 → 69.90**. Those are informative development deltas, but cannot be presented as all-round superiority to Qwen. Reddit users testing quantized runtimes report both promising speed and sharp context-related drops; one [3090 report](https://www.reddit.com/r/LocalLLaMA/comments/1xzf6im/sensenovaloop9b_official_ggufs_and_a_4bit_awq_are/) describes 55 tokens/s falling to 28 tokens/s as context fills. There is no sufficiently matched M4-oMLX result in those reports to establish the same rate on Apple silicon.

**Verdict:** Loop-9B is a useful demonstration that **memory capacity and compute depth can be decoupled**, not evidence that its decode must match a normal 9B. It is a reasonable specialized comparison target; deployment should depend on a verified implementation of its looped architecture and context behavior.

### Maxwell, Bonsai, Saluki, LFM3 and Ornith: five different efficiency claims

The [Maxwell-V1-Flash model card](https://huggingface.co/maxwell-model/Maxwell-V1-Flash) describes a **35B-total / 3B-active** MoE with block-sparse attention. It reports RULER at 256K of **93.35 versus 85.75** for a Qwen3.5-w35a3 *base* comparator. Crucially, this base-versus-base long-context table is **not** a direct Qwen3.8-27B coding-agent head-to-head. Other advertised agent scores may depend on different harnesses, reasoning budgets and test versions. A benchmark table against Qwen3.6-35B-A3B cannot be promoted into an unmeasured claim that Maxwell defeats Qwen3.8-27B. The correct inference is that its sparse attention and compact active expert set make it technically interesting, while its quality and Mac support require runtime-specific evidence.

[Prism ML's Bonsai-27B](https://huggingface.co/prism-ml/Ternary-Bonsai-27B-gguf) takes a more radical route: extreme low-bit or ternary weight storage, with [native MLX two-bit distribution](https://huggingface.co/prism-ml/Ternary-Bonsai-27B-mlx-2bit), and separate one-bit checkpoints. These are **model designs and specialized kernels**, not merely post-hoc quantizations of Qwen. Smaller weight files do not guarantee lower latency when unpacking, matrix multiplication, KV-cache geometry and non-weight operations dominate. The newer [Ternary-Bonsai-2-27B](https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf) further complicates version comparisons: do not compare its results to the original Bonsai as though they were one checkpoint.

[Conway Research's Underdog-Saluki-27B](https://huggingface.co/ConwayResearch/Underdog-Saluki-27B-1.0) has distributed low-bit GGUF builds and an [MTP-enhanced community GGUF](https://huggingface.co/Kujira/Underdog-Saluki-27B-1.0-MTP-GGUF) that attaches a Qwen3.8 multi-token-prediction head for speculative decoding in llama.cpp. That establishes a GGUF/MTP path, **not an official MLX-native Saluki checkpoint**. Against Bonsai, the actual question is whether a specialized 1–2-bit path preserves the task's answer quality at a given memory budget, and whether the runtime has kernels for it. A 7–9 GB artifact by itself is not a fair quality or speed score.

[Liquid AI's LFM3-1.7B](https://huggingface.co/LiquidAI/LFM3-1.7B) is a compact tri-hybrid text backbone for local agents, with model-card benchmarks under vLLM BF16 and a 262,144-token context configuration. [Ornith-1.5-9B](https://huggingface.co/ornith-ai/Ornith-1.5-9B) instead targets coding and agent tasks: its card reports **46.2 on Terminal-Bench 2.1 (Terminus-2)** and **70.6 on SWE-bench Verified**, under specified server and harness settings. These are not matched evaluations of LFM3-1.7B vs Ornith, nor of either against Qwen3.8-27B. LFM3's small footprint makes it a plausible fast router, classifier or extraction assistant; Ornith's larger specialist capacity suits interactive coding tasks where its measured harness performs well. The [Ornith GGUF](https://huggingface.co/ornith-ai/Ornith-1.5-9B-GGUF) provides a documented llama.cpp path. MLX distribution should be checked at the *specific weight repository and runtime version*, not assumed from the architecture.

A small public [consumer-model arena](https://github.com/GuideboardLabs/agon-arena) includes Bonsai and Saluki under its own conditions, but does not remove the need to inspect quantization, evaluation prompts and metric definitions. Treat its scores as one bounded data point, not a universal ordering.

**Verdict:** "Efficient model" is at least four different claims: lower storage, fewer active weights, fewer floating-point operations, and faster verified responses. Maxwell, Bonsai, Saluki, LFM3 and Ornith optimize different coordinates. Select by **verified task success under a specified serving path**, not a parameter count or a quantization suffix.

### Harness adaptation can matter more than a checkpoint launch

The [harness-hub Qwen3.8-27B Pi adapter](https://huggingface.co/harness-hub/Qwen3.8-27B-pi-adapted) is a LoRA trained with reinforcement learning for the **Pi agent's exact tool environment**, rather than a new foundational model. The **updated** model-card results are more informative than early social-media numbers:

| Paired evaluation, same Pi setup and 100-step budget | Base Qwen3.8-27B | Pi-adapted | Delta |
| --- | ---: | ---: | ---: |
| SWE-bench Pro Hard 51, thinking off | 39.2% | 64.7% | +25.5 points |
| Terminal-Bench 2.1, paired 86 tasks | 39.5% | 55.8% | +16.3 points |
| Terminal-Bench 2.1, 68 tasks not used to select checkpoint | 39.7% | 55.9% | +16.2 points |

The [card's evaluation notes](https://huggingface.co/harness-hub/Qwen3.8-27B-pi-adapted/blob/main/README.md) specify one attempt, temperature 0.8, a 100-step agent limit, text-only serving, matched sampling and the same Pi harness. The Hard-51 score is not directly comparable with Qwen's official result on an entire SWE-bench Pro collection using different agent harnesses and thinking levels. With the base model's highest-effort thinking enabled, the card also shows **74.5%** SWE-bench Pro success, so the adapted model's 64.7% without thinking is a different *quality versus compute* tradeoff, not a statement that all thinking has been surpassed.

The card provides [GGUF LoRA weights](https://huggingface.co/harness-hub/Qwen3.8-27B-pi-adapted-GGUF) for llama.cpp. [oMLX v0.8.2](https://github.com/jundot/omlx/releases/tag/v0.8.2) additionally documents loading compatible LoRA adapters on a base model, including Qwen Pi-adapted. However, that release explicitly says DFlash, VLM MTP, ANE prefill, MoE expert offload and its Prefill Accelerator **cannot be combined with the adapter yet**. A throughput estimate for MTP-enabled base Qwen must therefore not be transferred to the adapted serving path without rechecking the active acceleration.

**Verdict:** this is the strongest evidence in the set that **the model–harness interface is an optimization target in its own right**. It supports adapting a model to actual tools, but only when base model, prompt, tool budget and validation tasks are controlled.

### TensorFold, DFlash2 and the arithmetic of speed claims

[TensorFold](https://github.com/ashhart/TensorFold) uses speculative decoding with a small draft model to propose several tokens, followed by a target-model verification pass. A high acceptance rate can amortize the expensive target model's work. A low acceptance rate can erase gains. Throughput also changes with code versus ordinary chat, greedy versus sampling, context length, batching and cache reuse.

The [Qwen3.8-27B recipe](https://github.com/ashhart/TensorFold/blob/main/docs/recipes/qwen3.8-27b.md) includes a specific **48 GB M5 Pro Mac mini**, TensorFold **1.2.1**, an MLX 4-bit checkpoint and a DFlash2 drafter. Its five-repeat, 256-token single-stream medians are:

| Workload | DFlash2 | Serial without drafts | Speed ratio |
| --- | ---: | ---: | ---: |
| Code, sampled | 89.1 tok/s | 17.3 tok/s | 5.15× |
| Chat, sampled | 47.2 tok/s | 17.3 tok/s | 2.73× |
| Code, greedy | 79.3 tok/s | 17.3 tok/s | 4.58× |
| Chat, greedy | 56.4 tok/s | 17.3 tok/s | 3.26× |

The widely repeated **91.90 tok/s** headline is not the exact figure printed for those four current recipe cells; the recipe's **89.1 code-sampled** figure is the auditable one for this machine and release. A separate **64 GB M5 Pro MacBook Pro** dataset in the same recipe reports **62.8 / 45.9 / 61.2 / 56.2 tok/s** across code sampled, chat sampled, code greedy and chat greedy in a different version and workload. It is not correct to splice the best cell from one test into the other's hardware.

The base **M4 Mac mini with 32 GB** is not the M5 Pro with 48 GB. Its GPU capability, memory bandwidth, thermal envelope, allocated cache and usable unified memory differ. Even the apparently simple calculation "my current Qwen achieves 6–15 tok/s; the new runtime is 2–5× faster" fails unless one measurement is a matching **serial baseline** with the **same model, quantization, prompt and MTP settings**. If the existing 6–15 tok/s already includes MTP, multiplying it by DFlash2's raw-serial gain double-counts speculation. 

A useful measurement record therefore names: machine and GPU cores; macOS and engine commit; model and drafter SHA; quantization; context tokens before generation; cache status; output length; temperature and seed; draft acceptance; prefill, time-to-first-token and decoded tokens per second; peak unified memory; and number of simultaneous streams. Without this information, "fast" is a story, not a reproducible comparison.

**Verdict:** the official results demonstrate that speculative decoding can deliver large gains in favorable configurations, and materially different gains across workloads. They **do not** establish a speed ratio for a base M4 or prove Inkling faster than Qwen. Test the exact accelerated path instead of extrapolating from the chip's generation number.


## 2. Agent architecture: a reliable loop is more than a prompt

### Pi, OpenCode, Oh My Pi and Pi Bot are not interchangeable products

A terminal coding agent usually has an LLM decision loop, session state, a tool registry, execution permissions, filesystem access and a feedback path. What differs is the default integration contract and how much of that contract an operator can replace.

[Pi](https://github.com/earendil-works/pi) exposes its agent runtime, CLI, SDK, RPC interfaces and extensions. Its [extension examples](https://github.com/earendil-works/pi/tree/main/packages/coding-agent/examples/extensions) demonstrate registering tools, reacting to events, adding terminal UI and modifying agent behavior. This favors a small, inspectable core with functionality added as needed. The actual "minimal" distribution still has runtime dependencies, so "lightweight" should be evaluated by the memory of a *running instance*, not by the size of a README.

[OpenCode](https://github.com/anomalyco/opencode) takes a more integrated client/server direction, with its own session and permission model, terminal and graphical clients, and a server interface that external UIs can connect to. The choice is not whether only one framework can build custom tools. Both can. Pi makes the extension and custom-loop layer unusually visible; OpenCode supplies more of the multi-client experience out of the box. That distinction changes development work but does not, by itself, measure the success rate of either on an identical coding task.

[Oh My Pi (OMP)](https://github.com/can1357/oh-my-pi) is a **separate, expanded Pi-derived coding runtime**, not merely another name for an official Pi plugin. Its code includes built-in LSP handling, subagents, diagnostics and an SDK that exposes the expanded runtime; see its [SDK documentation](https://github.com/can1357/oh-my-pi/blob/main/docs/sdk.md). The advantage is integrated capability with fewer extensions to assemble. The tradeoff is a larger maintenance and behavior surface, including features and configuration not present in the lean upstream. Tests or memory claims for one version should not be projected to the other.

[luodaoyi/pi-bot](https://github.com/luodaoyi/pi-bot) describes an open-source port of DeepSeek-Bot onto the Pi coding-agent runtime with Respire memory integration. It is a **bot product built on an agent**, not an official Pi mobile client nor the same project as Pi Coding Agent. This matters when comparing installation, identity, long-term memory, permissions and channel-based messaging. A third-party bot can be a capable wrapper yet still depend on the underlying Pi runtime for the model/tool loop.

| Question | Pi | OpenCode | Oh My Pi | Pi Bot |
| --- | --- | --- | --- | --- |
| Primary object | Extensible agent runtime and terminal | Integrated agent with multiple clients/server | Feature-rich Pi-derived coding runtime | Messaging/bot workflow on Pi |
| Customization center | Extensions, tools, SDK, RPC | Server API, plugins/config and clients | Integrated tools plus expanded SDK | Bot transport, state and memory integration |
| Browser/iOS access | Needs a web/remote frontend | Native server path; several clients | Needs frontend or adapter | Depends on bot/channel integration |
| Practical risk | Extension composition and maintenance | Service/client complexity and permissions | Broader feature and dependency surface | Confusing bot transport with runtime capabilities |

These are functional differences, **not a verified RAM ranking**. One cited Pi performance issue reports a bundle-import RSS reduction from **150 MB to 130 MB** in a specific branch, illustrating why even a simple runtime can have substantial Node/TypeScript module overhead. It does not establish steady-state memory of Pi, OpenCode and OMP under matched sessions. A fair measurement would keep the same model endpoint and conversation idle, then sample process trees and peak resident memory with identical extensions and tool outputs.

**Verdict:** choose Pi if changing the agent's lifecycle, context preparation and extensions is the engineering objective; choose OpenCode if the integrated service and multi-client workflow are central; choose OMP when its bundled capabilities are actively needed. Pi Bot answers an altogether different question: how to turn an agent into a persistent messaging service.

### Extensions, Pi Web and piclaw: client convenience is not extra reasoning ability

[agegr/pi-web](https://github.com/agegr/pi-web) is a browser-facing UI built around Pi's sessions, files, project context, UI extensions and terminal interactions. Its [package manifest](https://github.com/agegr/pi-web/blob/main/package.json) shows a Next.js/React server with a substantial UI stack and pinned Pi-related packages. It is therefore unsurprising that a browser dashboard has more server and browser overhead than a plain terminal, even though no matched memory measurement is established by the manifest alone. It does not necessarily require a separate language-model server if the existing local model API is already reachable.

[rcarmo/piclaw](https://github.com/rcarmo/piclaw) goes beyond a pure viewer: its web workbench includes persistence, workflows and Pi-compatible extensions, with container and deployment options. Its [MCP guide](https://github.com/rcarmo/piclaw/blob/main/docs/mcp.md) describes an adapter that prevents every MCP tool from being dumped directly into the base prompt. The UI, tool bridge and lifecycle management can change the working environment; they do **not** make a weak underlying model intrinsically more accurate.

The same caution applies to ready-made Pi bundles, dashboard sidebars and orchestration extensions circulated around this ecosystem. Package names must be tied to an actual maintained repository, version and API contract. A UI plugin that reads session logs is different from an extension that executes child agents; a workflow coordinator that knows about Git worktrees is different from a terminal multiplexer. If a shared social post doesn't preserve a canonical URL, its specific release claims are not independently established.

The [Pi extension documentation](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/examples/extensions/README.md) provides the right conceptual split: a display extension modifies how events are presented, a tool extension extends actions, and an execution extension manages subprocesses or sessions. Start with that distinction before stacking packages. It also makes failure isolation easier: removing an optional frontend should never destroy the underlying task's durable output.

**Verdict:** Pi Web is suitable when a Pi session needs to be viewed or resumed remotely; piclaw is more suitable when the browser becomes the actual persistent workspace. Neither is a free performance upgrade for local inference. Their marginal value should be judged by added lifecycle capabilities and operational costs.

### iOS access: network transport, session state and push are three separate systems

An iPhone client usually does **not** run the same coding-agent process locally. It sends requests to a service running on the computer, shows messages and approvals, and may subscribe to status events. In this architecture, Tailscale solves reachability and private networking, while the agent's HTTP/WebSocket/RPC server owns session semantics. Neither component automatically gives the iPhone **push notifications while the app is suspended**.

[OpenCode Mobile's remote-access guide](https://www.getopencode.app/docs/remote-access/) documents a direct OpenCode 2 server at `127.0.0.1:4096` for local access, with optional Cloud Link service for remote access in some app distributions. The [community OpenCode Mobile connection guide](https://opencode-mobile.github.io/opencode-mobile-docs/connecting/) describes QR, LAN and host/password connection modes. These are **distinct mobile-client projects**; their paid relay, local pairing and push behavior must not be conflated with the upstream OpenCode server. A remote relay is a distribution-specific feature, not a general requirement imposed by OpenCode itself.

A Pi setup can deliver a comparable *remote interaction* model through [Pi Web](https://github.com/agegr/pi-web) exposed on a local interface and reached over Tailscale. A native iOS wrapper or PWA can render that interface. Push, however, requires an additional notification pathway: a standards-based web-push subscription and push-service integration, an APNs-enabled native app, or a messaging bridge (for example, a bot or server that sends through its channel's notification infrastructure). Pi does not gain APNs simply because a web UI opens on an iPhone. Conversely, OpenCode's mobile clients are not necessarily dependent on a vendor relay for LAN or private-VPN access.

The privilege boundary matters: a notification endpoint should carry only a minimal event ("task finished", "permission needed") and a task reference, not raw tool output, code secrets or terminal history. Authentication belongs to the agent server, network tunnel and client; hiding a URL is not authentication. The web UI should show persisted task status after reconnecting, not infer success from a socket simply closing.

**Verdict:** Tailscale + authenticated server is sufficient for privately reaching either Pi or OpenCode. Browser UX is comparatively easy; dependable background notifications need a separate delivery mechanism. Any claim that one framework "has iOS" must identify the particular client and whether it is official, community-built, LAN-only or relay-based.

### Paperclip: a control plane is not automatically a live process monitor

[Paperclip](https://github.com/paperclipai/paperclip) manages agents as tracked workers, with assignments, heartbeats, budgets, approvals, task history and adapters. Its [adapter overview](https://github.com/paperclipai/paperclip/blob/master/docs/adapters/overview.md) and [documentation](https://github.com/paperclipai/paperclip-docs/blob/main/docs/guides/org/adapters.md) describe how specific runtimes are launched or connected. Recent releases include adapters for [Pi and OpenCode](https://github.com/paperclipai/paperclip/blob/master/releases/v0.3.0.md) and a Hermes gateway integration.

An existing group of external subagents cannot be expected to appear with correct status merely because Paperclip is running. For a read-only view, it needs real events or an integration mapping each worker's identity, active task, session, last activity and outcome into Paperclip's data model. A process that has not emitted a heartbeat might be idle, blocked, disconnected or dead; those conditions must not be collapsed into one green status. A control plane may also request new work, and that is a different permission level from observation.

This defines a useful two-stage integration. Stage one is an **event bridge** that consumes existing Pi/OpenCode task lifecycle events and records them with immutable task IDs; it does not launch anything. Stage two, if wanted, adds managed execution, retries, approvals and budgets through a real adapter. The operational cost of Paperclip is worthwhile only if these coordination features solve a real problem. A small JSONL event feed and an ordinary dashboard may suffice when the goal is just to see two local workers.

**Verdict:** Paperclip can be a management and observability surface *after* integration. It is not a zero-configuration mirror of arbitrary pre-existing agent processes. Use it for governance, not as a presumed magical passive viewer.

### Code Mode and the minimum executable harness

[Cloudflare's Code Mode architecture](https://blog.cloudflare.com/code-mode-mcp/) reduces tool-schema overhead by presenting the model with a programmable API surface and letting it compose multiple operations into a single JavaScript execution. The [MCP server guide](https://developers.cloudflare.com/agents/model-context-protocol/guides/build-codemode-mcp-server/) documents executing generated code within an isolated Worker rather than advertising every upstream operation as a separate top-level model tool.

Instead of a model repeatedly selecting `find_file`, `read_file`, `parse`, `search_again`, and `summarize` in separate inference turns, a Code Mode expression can orchestrate several tool invocations with loops and conditions. This can reduce prompt tokens and tool-call round trips, especially where a local model struggles with huge tool schemas. It does **not** reduce the number of external requests or the actual cost of their work by definition. And generated code is dangerous without a scoped sandbox, bounded CPU/memory, tool allowlist, per-action authorization and output limits.

A small Python script with `OpenAI().responses.create()` and `subprocess.run(shell=True)` is indeed a *minimal agent-shaped harness*: ask for a command, approve, execute, return stdout and stderr. It is not, by itself, a robust autonomous agent. The danger is not only that the model makes a bad choice; the shell joins arguments, handles redirection, expands variables and permits arbitrary chained operations in ways a one-command English description cannot constrain. User confirmation helps, but does not transform a command string into a security boundary.

The smallest reasonable evolution uses structured operations instead of raw shell strings:

```python
# Illustrative control boundary, not a full secure sandbox.
ALLOWED = {"git", "rg", "python3"}
argv = proposed_command  # JSON list of literal arguments
if not isinstance(argv, list) or not argv or argv[0] not in ALLOWED:
    raise PermissionError("Unsupported tool")
result = subprocess.run(
    argv, shell=False, cwd=approved_worktree,
    capture_output=True, text=True, timeout=30,
)
```

Even this still needs an allowlist per subcommand, filesystem isolation and policy for destructive effects; `python3` itself can execute arbitrary code. For untrusted tasks, place execution in a real sandbox or a dedicated low-privilege process. A durable harness additionally needs maximum steps, persisted observations, retry/idempotency rules, test validation and a clear stopping condition. Those behaviors exist because language models can loop or overestimate completion, regardless of the elegance of their prompt.

**Verdict:** Code Mode is especially relevant to a local 27B model when many small tool calls would waste context. Put the code interpreter behind a narrow capability boundary. Avoid mistaking one approval prompt in a `shell=True` demo for operational safety.

### Graph, loop and harness engineering describe different design levers

The terms are easy to turn into slogans; the underlying mechanisms are concrete.

**Graph engineering** defines the dependencies and allowable transitions between work items. A research graph might include `discover → fetch → compare → verify → publish`, with branches for missing sources, repeated queries and failed CI. A graph makes cancellation, independent parallel work and partial recovery explicit. The output of one node should be structured, with source IDs and validation state, so downstream nodes do not rely on informal prose alone.

**Loop engineering** determines the local decision cycle inside a node: observe, select action, execute, inspect outcome, retry or stop. It controls context compaction, tool-output clipping, error classification, attempt budgets, model/tool feedback and progress checks. A poorly designed loop can spend thirty turns rewriting the same search query even if the overall graph is correct.

**Harness engineering** defines everything surrounding model inference: tools, permissions, filesystem snapshots, command execution, prompt construction, caching, tests, session persistence, workload routing and results inspection. A harness can constrain a model to produce verifiable artifacts, or squander even a strong model by hiding failures and overloading its context.

These levers are not alternatives. The graph asks **what can happen and in which order**; the loop asks **how to decide the next local action**; the harness asks **what the model can actually observe, execute and verify**. Their common quality measure should be task completion with reproducible evidence, not lines of orchestration code or the size of a tool registry.

For a local agentic-RAG workflow, a pragmatic implementation keeps search query revision in a bounded loop, persists individual evidence objects with URLs and timestamps, and lets the graph revisit only unsupported claims. No extra "CEO agent" is required for that. The evidence-coverage test is more useful than sending the entire research history back to the model each iteration.

**Verdict:** prioritize harness and evidence-verification correctness before adding a large orchestration graph. Add graph structure when a task has genuine branching, parallelism or recovery requirements. Use smaller loops with explicit budgets and stop signals instead of unattended self-repetition.


## 3. Search and RAG: what the index knows, what the page says

### Firecrawl Local cannot replace a metasearch engine

The [Firecrawl Local README](https://github.com/firecrawl/firecrawl/blob/main/apps/local/README.md) distinguishes its Rust-based `scrape`, `crawl`, `map` and batch extraction from its `search` command, which is handed to **Firecrawl Cloud**. The [November 18 release announcement](https://www.firecrawl.dev/changelog/firecrawl-local) describes a **37× scraper speed improvement** and **230× lower idle memory, about 11 MB**, relative to its *previous self-hosted Firecrawl stack*. That is a vendor benchmark against a specific predecessor, not a speed comparison with search engines or an end-to-end agent.

[SearXNG](https://github.com/searxng/searxng), by contrast, aggregates external search results through engine-specific adapters. Its [JSON search API](https://docs.searxng.org/dev/search_api.html) can feed candidates to an agent if enabled in the instance configuration. It does not provide Firecrawl's general single-URL Markdown normalization or full-site crawling API. One is a discovery surface; the other is an extraction surface.

The operational distinction also affects privacy. Firecrawl Local defaults to `FIRECRAWL_CLOUD=auto`, meaning that search, some blocked-page fallback requests and certain data providers can reach the cloud. Set `FIRECRAWL_CLOUD=off` when that is unacceptable, and use its documented `--public-only` protection for untrusted agent-accessible URLs. A binary being installed locally does not mean all remote services are disabled.

A previously published [deep-dive on Firecrawl Local versus SearXNG](#/writing/firecrawl-local-vs-searxng-2026-11-22) examines route coverage, API and private-network safeguards. The system consequence is straightforward: let metasearch propose URLs, let a scraper acquire the selected document, and let the agent explicitly check evidence rather than treating retrieval as an answer.

**Verdict:** Firecrawl Local can improve selected document acquisition and cleaning; it is not a substitute for SearXNG. Do not install it simply to "search Google locally". Install it when verified extraction failures or site-crawling needs justify the extra component.

### SAG2 is embedding-free, not index-free

The [SAG Wiki architecture](https://github.com/Zleap-AI/SAG-Wiki/blob/main/docs-site/content/docs/architecture.en.mdx) and [SAG2 method](https://github.com/Zleap-AI/SAG-Wiki/blob/main/docs-site/content/docs/sag2.en.mdx) use an important alternative to vector indexing. The local application **does create a full-text index**. It does **not** compute embedding vectors or call an LLM to summarize every document during ingestion. At query time, BM25-like lexical retrieval selects passages, and a Joint Evidence Verification (JEV) stage judges whether each passage can support the question. Evidence can supply expansion terms for further retrieval rounds. Original file paths and source locations remain attached to results.

This refutes the common claim that SAG2 "does not preprocess or index documents at all". Index creation, tokenization and statistics still cost time and disk space. The system avoids the *embedding model and offline semantic extraction* stage, which can be a material reduction in ingestion complexity. At the same time, lexical candidate generation can miss evidence with little vocabulary overlap; query expansion and evidence judgment mitigate that risk, but they are not free.

The project's [benchmark reproduction repo](https://github.com/Zleap-AI/SAG-Benchmark) makes an essential distinction between indexing time, retrieval and full agentic answering. The documented local-index benchmark excludes some file import and validation overhead and does not clear OS file caches; comparing its number against an embedding-RAG pipeline with completely different measured phases would overstate the conclusion. The JEV component returns **judgments and ranked passages**, while an external answer model still writes the final response. So "SAG2 replaces RAG" is technically inaccurate: it is one retrieval method usable *inside* a RAG system.

| Phase | Conventional embedding RAG | SAG2 / SAG Wiki |
| --- | --- | --- |
| Ingestion | Chunk, encode vectors, store embeddings | Parse original files, tokenize, build local full-text index |
| Candidate recall | Vector similarity, possibly hybrid | Lexical/BM25-style recall |
| Relevance filtering | Optional reranker or LLM | JEV evidence assessment |
| Multi-hop | Query rewrite, graph or agent loop | Evidence-driven term expansion and repeated retrieval |
| Final prose | Answer LLM | Answer LLM; JEV does not write it |

**Verdict:** SAG2 is compelling when local file collections change frequently and the cost or dependency of vector embedding is undesirable. Its actual advantage should be measured against hybrid lexical/vector retrieval on the same evidence questions, with the complete ingest/search/answer pipeline timed. Keep an explicit no-answer path and source-citation checks either way.

## 4. Research tools are deliverable generators, not guarantees of insight

### PaperOrchestra writes a manuscript; it cannot establish that the science is true

Google Cloud AI Research's [PaperOrchestra](https://github.com/google-research/paper-orchestra) connects an outline agent, literature-review agent, section writers, refinement and plotting into a pipeline that accepts research ideas and experiment logs and produces LaTeX manuscripts. Its repository includes source code, automated review/evaluation scripts, configuration and template integration. This is a real orchestration architecture, not a claim that an LLM discovered a novel result.

Five responsibilities are useful to separate. The outline agent converts raw materials into section requirements; the literature agent searches and prioritizes candidate references; the writing agents draft sections; refinement critiques and rewrites; plotting produces visual artifacts from supplied data. If those agents share one unverified bibliography or hallucinated result, specialization will only propagate the error through more polished text. A PDF compiling successfully is a layout test, not a citation-validity or experimental-reproducibility test.

For an engineering publication, a safe completion contract is stronger: every numeric result links back to the experiment artifact; citations resolve to genuine papers and support the claim made; figures have inspectable input data and generation code; and a reviewer can compare the narrative with logs before publication. PaperOrchestra is best viewed as a manuscript production pipeline fed by verified evidence, not a replacement for study design or literature judgment.

**Verdict:** use multi-agent paper writing when experiments and claims are already trustworthy and converting them into a consistent manuscript is the bottleneck. Adding more writing agents before verifying the underlying evidence produces better typesetting, not better research.

### FastFrames-L: 14B video generation at interactive latency does not mean 14B on a Mac mini

[Apple FastFrames-L](https://huggingface.co/apple/FastFrames-L) is a **14B autoregressive, two-step video diffusion model**, not an LLM, an image encoder for RAG, or a drop-in video processor for agents. It starts from Wan2.1-14B and distills a causal two-step generator, then trains a pixel decoder and KV-refinement network. The companion FastFrames-S is **1.3B**. Both target 480p generation with reduced per-frame latency.

The published [model card](https://huggingface.co/apple/FastFrames-L) gives a concrete 35.4 ms **per-frame component profile for FastFrames-S on one GPU with a full KV cache**: about 16.1 + 16.2 ms for two DiT calls, 2.2 ms for KV refinement and 0.9 ms for pixel decoding. That sums to a theoretical component rate near 28 frames/s; it is not an end-to-end UI video throughput figure, and it is **not a measurement of FastFrames-L**. The sample generation configuration outputs 832×480, 81 frames at 16 fps.

The supported installation environment is specifically **Linux x86-64 with an NVIDIA GPU and a CUDA 12.8-compatible driver**; the documentation's latency command for `ff-l` uses **eight GPUs**. An Apple-authored checkpoint should not be inferred to have a tested Apple Silicon Metal path from its branding. Porting a 14B diffusion architecture and its custom kernels to MLX is a genuine engineering project involving operator coverage, stateful cache and memory profiling, not merely changing an import statement.

**Verdict:** FastFrames is relevant to low-latency generated interactive worlds and video pipelines. It is not currently substantiated as a practical inference workload for a 32 GB base M4 workstation in the original documented implementation. The 35.4 ms statistic belongs to the small variant under specific GPU assumptions.

### PyBot is a controlled argument about code versus learned weights

Hugging Face's [PyBot](https://github.com/huggingface/pybot) is an unusually concrete counterexample to the assumption that every chatbot needs a neural model at runtime. The maintainers report that over **1,000 agents** generated more than **5,000 rule-based revisions**; the resulting program contains approximately **640,000 lines of Python** across **528 source files**, plus around 550,000 lines of tests. It contains pattern matching, knowledge tables, response templates, memory handling and an arbiter that chooses among candidate module replies. No learned model weights are loaded to answer a question.

The published result is a **26% win rate** on the maintainers' **SmolTalkBench** setup, compared by an LLM judge with reference answers, described as similar to SmolLM-360M-Instruct on that evaluation. This does not imply that a rule system has attained 360M-model generalization, nor that an LLM evaluation judge can establish factual or adversarial reliability. PyBot still needs seconds to load its large Python source graph and about a second to answer in the repo's own description. Its apparent lack of model-weight inference is not a complete absence of computation or maintenance costs.

The deeper engineering observation is that agents can *author a fixed behavioral program* rather than merely deliver text. This is promising for narrow, auditable extraction, formatting or decision-routing tasks where explicit rules can be tested. But a million lines of generated branches may become harder to validate than a small classifier and can fail abruptly outside covered patterns.

**Verdict:** PyBot is a useful research artifact for agent-produced software and code-based inference, not evidence that trained language models are obsolete. It is worth examining the actual judge, rules and unseen-task behavior before making a substitution claim.

## 5. Interfaces and experimental detours

### Henge: can macOS boot on an iPhone, and can a person use it?

[Henge](https://github.com/Leviidev/Henge) emulates macOS on iOS/iPadOS. Because ordinary iOS apps lack the virtualization interfaces required for a normal macOS guest, Henge implements an ARM64 JIT, virtual memory-management behavior, virtual hardware and graphics replay. The [architecture notes](https://github.com/Leviidev/Henge/blob/main/docs/architecture.md) explain how macOS images are installed and how its custom engine is packaged into the iOS app. Booting a login screen is a meaningful emulator milestone, but it is not equivalent to interactive workstation usability.

The repository's demos and newer releases show real progress. Independent community issue reports also show the constraints. An [iPhone 14 report](https://github.com/Leviidev/Henge/issues/59) documents an installation terminated around 80% due to resource pressure; an [iPhone 12 Pro Max report](https://github.com/Leviidev/Henge/issues/13) identifies system memory exhaustion; an [M5 iPad Pro test report](https://github.com/Leviidev/Henge/issues/26) discusses graphics, mouse input and browser failures. These are individual hardware/version reports, not a comprehensive FPS survey, but they refute the idea that "macOS boots" implies full compatibility.

A reliable emulator evaluation needs end-to-end task timings: install completion, boot, usable input, Finder interaction, page rendering, crash frequency, swap and memory pressure, and sustained thermal behavior. A 15-second lock-screen demo gives little information about Safari's usability or whether a normal application can finish work.

**Verdict:** Henge is a technically significant emulator experiment and an impressive compatibility boundary, not yet a substantiated replacement for a Mac desktop on an iPhone. It should be assessed on real interactive workloads, not a single boot-time screenshot.

### Umless: the useful part of local dictation is the repair pipeline

[jatinbishla/Umless](https://github.com/jatinbishla/Umless) combines local automatic speech recognition with an optional text-polishing model and system text insertion. The distinction matters: ordinary speech-to-text attempts to transcribe every hesitation and correction; a dictation workflow for writing must preserve *intended meaning* while removing disfluencies. Its [architecture document](https://github.com/jatinbishla/Umless/blob/main/ARCHITECTURE.md) covers ASR, editing and insertion pathways, including platform-specific accessibility/input APIs. Third-party documentation lists approximate bundled model sizes of **678 MB Lite**, **1.9 GB Standard** and **3.5 GB Max** with differing language coverage. The tier sizes are distribution/storage measures, not quality or latency benchmarks.

For a local AI workstation, the important interface is not another enormous LLM; it is whether the recognizer/polisher changes a technical term, code identifier or numerical value incorrectly. The text should remain editable, and a safe app should distinguish transcription from rewritten output. If it reads the focused window for contextual correction, that access is a real privacy capability to document, even when the models run locally. The macOS/Windows/Linux insertion paths have different permission and undo semantics.

**Verdict:** on-device dictation is a valuable local interaction layer when it measurably reduces correction time without corrupting technical language. Published model size alone cannot establish better recognition; the right test corpus includes hesitations, names, mixed Chinese/English vocabulary and code terms.

## 6. A complexity-theory detour: P = NP is not a simulation proof

Nick Bostrom's [simulation argument](https://simulation-argument.com/simulation.pdf) is a conditional trilemma about civilizations reaching posthuman capability, their willingness to run large numbers of ancestor simulations, and the fraction of observers in those simulations. It is not a theorem that advanced computing must produce such civilizations or that a simulated universe must be physically exact at every quantum degree of freedom.

The statement **P = NP**, if true, would imply polynomial-time algorithms for NP-complete *decision* problems under conventional complexity definitions. It does not automatically make every difficult physical simulation cheap. A polynomial can have an impractical exponent or constant; finding a decision witness differs from numerically solving long-time quantum dynamics to arbitrary precision; and many problems involving quantum states, precision, stochastic processes or higher complexity classes are not known to become tractable merely by identifying P and NP. Even polynomial algorithms for some optimizations do not generate energy, stable hardware, enough memory or a civilization's motivation to run simulations.

The popular argument "P = NP, therefore billions of perfect universe simulations, therefore our probability of being simulated approaches one" silently assumes all of the following: efficient physical simulation, a huge number of actual simulated conscious observers, a defensible reference class, and a method to assign probabilities to our observer position. Neither P = NP nor a speculative count establishes those premises. The original simulation argument is valuable for analyzing the conditional, not for calculating a numerical posterior without evidence.

**Verdict:** computational complexity may constrain the affordability of certain simulations, but the P-versus-NP question does not determine whether reality is simulated. The logical gap is an instructive example of why engineering extrapolations require their intermediate assumptions to be explicit.

## 7. The resulting system design

Across all these projects, the strongest conclusion is architectural. A local assistant can be improved by changing its model, its runtime, the tools exposed to it, the workflow around them, or the evidence it collects. Those changes are orthogonal enough that a single "best local agent" ranking is misleading.

A defensible small-workstation baseline is:

1. **Model service:** use a locally measured, compatible oMLX/MLX or llama.cpp endpoint. Record whether MTP, LoRA or a separate speculative drafter is active. A compact model may handle short routing; a larger model is reserved for synthesis and complex tool use.
2. **Agent harness:** use Pi or OpenCode with explicit tool permissions, task IDs, bounded retry loops and per-task work directories. Select the runtime for the lifecycle controls that are needed, not brand familiarity.
3. **Research tools:** SearXNG or another search backend finds sources. A simple fetcher retrieves ordinary pages; Firecrawl Local or a browser is a selective fallback. SAG2 or a tested hybrid index handles reusable local documents. Every final claim carries its evidence location.
4. **Orchestration and UX:** preserve durable task state independently of the chat window. A phone connects through an authenticated network path; notifications are a separate event-delivery problem. Management dashboards consume real events rather than inventing worker states.
5. **Verification:** compare results to the specific required task. Build/code tests are not research verification; benchmark scores are not factual reliability; successful LaTeX and video generation are not evidence of practical application quality.

The key decision table is not a leaderboard but a list of problems and the best evidenced intervention:

| Symptom | First layer to inspect | Evidence to demand |
| --- | --- | --- |
| Slow local answer generation | Runtime, quantization, drafts and cache | Matched token/sec + TTFT + memory at fixed context |
| Repeated or incorrect tool calls | Harness, model/tool adaptation, permissions | Task success, tool traces, retries and regressions |
| Searches miss facts | Discovery queries and retrieval index | Source recall and answer support on labeled cases |
| Web pages lack usable content | Extraction/browser fallback | Page-specific successful content and failure provenance |
| Agent cannot resume from iPhone | Server/auth/session UI and push transport | Reconnect, approval and notification delivery tests |
| Workflow claims done without evidence | Verification and publishing gate | Actual artifacts, CI, deploy SHA and public URL |

There is a second, less comfortable conclusion. Many of the products above share excellent **publisher-reported** results, but much less matched evidence for a base M4 with 32 GB. The answer is not to discard those results or to repeat "more research needed" after every paragraph. Their proper use is to identify a technical mechanism and a conditional choice, then keep the missing cross-hardware inference separate from the established fact.

The practical opportunity for local agents is therefore not simply a faster 27B or a longer list of extensions. It is **verified work under bounded resources**: a system that knows what it searched, what it retrieved, what its model actually did, why a benchmark does or does not apply, and what was successfully delivered. That is the standard by which these tools deserve to be adopted.
