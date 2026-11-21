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
