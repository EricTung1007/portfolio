---
title: "Two Operators, One Mac: The Engineering of Background Computer Use"
date: "2026-11-20"
category: "Minerva's Den"
tags: ["Computer Use", "macOS", "Agent Systems", "Accessibility", "Open Source"]
---

An AI assistant that can edit a document is useful. An assistant that can edit it **while its owner continues working in another application** is a more interesting kind of computer interface.

Most demonstrations of computer-use agents show a cursor clicking around a desktop. That makes for a compelling video, but it is also a terrible collaboration model: the agent and the human compete for the same mouse, keyboard focus, active window and sometimes even the clipboard. An accidental click can land in the wrong application. A long-running task effectively takes possession of the computer.

A growing collection of open-source projects attacks this problem at the operating-system level. Their central claim is that a graphical application can often be observed and controlled *without bringing it to the foreground*. This issue examines the mechanisms behind that claim, the repositories implementing it, and where the illusion of two independent operators breaks down.

## Why a mouse is the wrong abstraction

A traditional desktop automation script moves the system pointer to coordinates, clicks and types. It implicitly assumes the automation owns the active desktop. That assumption works for a dedicated testing machine but fails when a person wants to use the computer simultaneously.

macOS provides several interfaces beneath the visible pointer. The **Accessibility API** exposes semantic controls, including buttons, text fields, roles, values and supported actions. Calling an accessibility action such as `AXPress` can activate a control directly. Setting an accessibility value can update a text field without synthesizing ordinary keystrokes. **ScreenCaptureKit** can capture the contents of a particular window, even when another window covers it. CoreGraphics and lower-level event delivery offer additional ways to direct input toward a process or window.

These are distinct operations. Capturing a background window is not proof that clicking its contents will work. Reading a button's label does not mean that a canvas or custom control publishes a useful accessibility action. Sending a key to a process may still depend on that application's internal focus state.

The robust pattern is therefore a ladder: inspect a window, identify a semantic element, try its accessibility action, fall back to a window- or process-directed event when appropriate, and use the real system cursor only when the earlier methods cannot perform the task. After acting, inspect the result again. **Background-safe** is a property of a particular action on a particular app, not a universal promise attached to an agent.

## Five repositories, five different contracts

The leading projects share a goal but expose very different interfaces. That difference matters more than their screenshots.

| Project | Architecture | Best fit | Main trade-off |
| --- | --- | --- | --- |
| [Cua Driver](https://github.com/trycua/cua/tree/main/libs/cua-driver) | Rust native runtime, MCP/CLI and generated Python/TypeScript SDKs | Cross-platform agent integration and broader testing | Larger system and platform-specific action boundaries |
| [computer-use-mcp](https://github.com/minghinmatthewlam/computer-use-mcp) | Signed Swift executable, shared daemon and per-app leases | macOS-only background control with concurrent clients | Pre-1.0; global fallback must remain controlled |
| [OpenComputerUse](https://github.com/IAmJSD/OpenComputerUse) | Session-oriented MCP server and desktop app, with platform adapters | App-specific sessions, recipes and optional device control | More features and dependencies than a minimal driver |
| [computer-harness](https://github.com/huytieu/computer-harness) | Python CLI/daemon over public macOS APIs | Small, inspectable local automation scripts | Arbitrary Python execution and a broad local permission boundary |
| [agent-desktop](https://github.com/vercel-labs/agent-desktop) | Accessibility-first desktop CLI/library | Structured control of accessible UI elements | Not every application exposes sufficient semantics |

### Cua Driver: a driver rather than another agent

[Cua Driver](https://github.com/trycua/cua) is part of a larger ecosystem that also includes sandboxes, benchmarks and the [Lume](https://github.com/trycua/cua/tree/main/libs/lume) virtualization tool. The distinction is important: the driver provides the computer's eyes and hands, while Claude Code, Codex, OpenCode or another harness decides what to do. The driver itself does not need to call a language-model API.

Its native Rust runtime can be reached through a standard Model Context Protocol (MCP) server, through CLI calls, or through generated SDK bindings. MCP is the protocol that lets a model-powered client discover and invoke external tools. For Claude Code, the repository documents:

```bash
claude mcp add --transport stdio cua-driver -- cua-driver mcp
```

The driver also supports explicit permission modes. A bounded mode restricts tools and resources according to a reviewed capability manifest. That is more meaningful than merely asking the model to be careful: the boundary exists in the tool runtime. Its optional perception extension can identify visual regions, but that extension has a different licensing boundary from the MIT-licensed core, and screenshot-derived actions use capture identifiers to prevent stale observations from authorizing new clicks.

The surrounding Cua ecosystem is especially interesting for repeatable experiments. A separate VM or sandbox can give an agent its own desktop entirely. That avoids interference more completely than background event delivery, although a macOS guest consumes additional storage and memory. On a 32 GB Mac, an extra macOS VM and a large local model may be an expensive combination.

**When to choose it:** start here when the same computer-use interface must work across several agent harnesses or operating systems, or when sandboxing and benchmark infrastructure are part of the project. Use the standalone driver before adopting the entire Spaces environment unless the latter's virtual desktops are actually needed.

### computer-use-mcp: concurrency becomes a systems problem

The [computer-use-mcp](https://github.com/minghinmatthewlam/computer-use-mcp) project is an unusually explicit attempt to make macOS automation coexist with human work. It uses Swift and exposes a standard MCP server. Multiple MCP clients connect through thin stdio shims to a shared engine daemon, which owns screen capture, accessibility, event delivery and a separately drawn agent cursor.

The interesting part is the **per-app lease**. Suppose two agents both decide to change the same spreadsheet. Even if neither steals the human's pointer, their actions can still interleave and corrupt one another's work. The daemon serializes access to a target application for short operations. This is concurrency control, not a user-interface trick.

Its input ladder is documented in order: accessibility action, per-window event, per-process event, and finally an explicitly allowed global-cursor fallback. Each mutation is followed by a new observation. Element identifiers are associated with a snapshot generation; stale references fail rather than silently clicking a control that moved.

The repository's README identifies the software as pre-1.0 and notes that mutating actions pause when the Mac locks. It also explains why a stable signed app identity matters: macOS ties Accessibility and Screen Recording permission to an application identity. Rebuilding an unsigned helper repeatedly can make permission handling painful.

A source build is straightforward for a Swift-capable macOS development environment:

```bash
git clone https://github.com/minghinmatthewlam/computer-use-mcp.git
cd computer-use-mcp
swift build -c release
.build/release/computer-use-mcp doctor
```

**When to choose it:** this is a compelling design reference for concurrent, background-only macOS automation. The per-app lease and explicit fallback policy are ideas worth copying even if the repository itself is not deployed.

### OpenComputerUse: a session is the unit of control

[OpenComputerUse](https://github.com/IAmJSD/OpenComputerUse) makes a different design choice. Its MCP client begins by calling `start_session` for an application, receives a session ID, operates through that ID, and calls `end_session` when finished. On macOS, an application process owns the permissions and sessions; the MCP server is a thin client. This gives each run an identifiable target rather than an ambient ability to click anywhere.

It offers screenshots, accessibility trees, element-based actions, text entry, file-picker handling and a visible agent cursor. A particularly interesting feature is `run_recipe`: a straight-line list of actions can be executed with a smaller decision model choosing among current UI elements. The calling general-purpose model need not re-enter the loop for every elementary step. A recipe stops when a step cannot be grounded; it does not invent a successful result.

OpenComputerUse also documents optional structured extraction through Cloudflare's Clairic and recipe decision models through external services. These features have an important privacy implication: **the core desktop driver and the optional model-assisted extraction do not necessarily have the same data boundary**. An offline automation setup should leave cloud-dependent functions disabled unless they are required.

On macOS, the README documents installation via a third-party Homebrew tap or release package. It also describes adapters for Linux and Windows, and optional mobile-device and simulator sessions. Those capabilities make it broader than a minimal macOS accessibility wrapper.

**When to choose it:** prefer the session-oriented design when task isolation, visible running sessions, app-specific automation and repeatable recipes matter. The optional device integrations are useful only for workflows that genuinely need them.

### computer-harness: minimalism with a sharp security edge

[huytieu/computer-harness](https://github.com/huytieu/computer-harness) exposes a much smaller interface. A Python CLI submits a script to a local daemon. The script can inspect an app's state, perform an accessibility action or set a field directly:

```python
st = get_app_state("Notes")
click("Notes", element_index=4)
set_value("Notes", 7, "hello")
```

Its default tier avoids moving the real pointer; an explicit foreground tier provides coordinate clicks, typing and dragging when needed. The author reports verifying background capture, accessibility clicks and direct field updates in the project's own end-to-end tests.

The simplicity has a significant consequence. The CLI executes arbitrary Python as the current user, and its local daemon holds powerful Accessibility and Screen Recording permissions. A same-user process that can reach its socket may be able to use that authority. The README also notes that screenshots are written to local files without automatic pruning.

**When to choose it:** a small, auditable local script runner is attractive for experiments and trusted single-user environments. It is a poor default for exposing untrusted agent-generated Python or running unattended automation with broad filesystem and desktop access.

### agent-desktop: use semantics before pixels

[Vercel Labs' agent-desktop](https://github.com/vercel-labs/agent-desktop) belongs in this comparison as an accessibility-first desktop interface. It makes semantic desktop controls available to a calling agent without embedding a language model. The underlying idea is sound: an agent should prefer an element with a role, name and supported action over guessing a coordinate from an image.

The trade-off is coverage. Native dialogs and standard controls often provide useful accessibility data; custom graphics, games and some embedded web surfaces may not. A screenshot-based fallback is therefore still valuable. The key architectural lesson is to keep the **observation method** separate from the **action method** and to verify the action on the live application state.

## The harder problem: two agents, one application

Keeping the human cursor untouched solves only one collision. Imagine a person editing a document while an agent edits another section of the *same* document. Both may preserve the system pointer, yet the application has shared selection state, undo history, modal dialogs, clipboard state and autosave behavior. A background text insertion can still land in the wrong location.

A reliable computer-use service needs at least three boundaries:

1. **Target ownership.** Every action belongs to an identified application, window or session. Actions should not silently switch to whichever app happens to be active.
2. **Concurrency control.** Two agents must not interleave state-changing operations against the same target. Per-app or per-document leases are useful, but they do not replace application-level conflict handling.
3. **Verification.** A successful API call is not proof of a successful UI change. After clicking Save, inspect the resulting document, status or filesystem artifact.

These requirements also explain why a virtual desktop can be the better answer. When an application fundamentally assumes a single foreground user, give the agent a separate environment instead of trying to defeat that assumption. For browser work, a separate browser profile or automation context is often cheaper than a whole VM. For a destructive desktop workflow, an isolated VM may justify its memory cost.

An effective scheduler should also know the difference between *waiting for a human* and *waiting for the UI*. A locked Mac, an unexpected permission dialog and a stale element ID are different failure modes. Retrying the same click indefinitely is not resilience.

## A practical architecture for a 32 GB workstation

A local agent does not need to run a second language model inside its desktop driver. In the simplest design, one model and one harness issue MCP calls to a driver, which returns compact observations. The operating system performs the action. This is why computer-use support can be added to a coding agent without replacing its reasoning engine.

```text
Local model / optional remote model
                |
       Coding or general harness
                |
             MCP client
                |
       Desktop driver service
          /            \
 Accessibility      Window capture
          \            /
       Target application
                |
       Observe and verify
```

On a Mac mini M4 with 32 GB unified memory, this separation is practical. The desktop driver itself is not a second 27B model, although screenshots, OCR and optional perception models can add cost. Running a full guest macOS instance, on the other hand, competes directly with the inference runtime for memory.

A sensible first deployment uses a single local model process, one MCP desktop driver, and app-scoped sessions. It records each requested action, target, result and verification, and requires explicit approval before allowing a fallback that moves the real pointer or performs an irreversible operation. If background delivery fails for a particular app, the system should report that limitation rather than quietly stealing focus.

The next useful experiment is not another screenshot demo. It is a collision test: while a person continuously types in one app, the agent edits a different app, opens a dialog, saves an artifact and verifies the saved content. Repeat with the target window obscured, with the screen locked, and with two agent sessions targeting the same app. Measure successful completion and human interruption, not merely whether the tool returned `ok`.

## The desktop is becoming a shared resource

Background computer use is a genuine change in how agents can fit into daily work. The operating system already knows far more about its windows and controls than a screenshot alone can reveal. Projects such as Cua Driver, computer-use-mcp, OpenComputerUse and computer-harness are turning that information into reusable interfaces for language-model agents.

The strongest designs are not those that promise to click absolutely anything. They define exactly which actions are background-safe, isolate concurrent sessions, recognize stale observations and verify effects. Cua Driver is the broad integration platform; computer-use-mcp provides an especially instructive concurrency design; OpenComputerUse makes session ownership explicit; computer-harness demonstrates how small the implementation can be when the trust boundary is understood.

The real destination is a computer on which **human and agent are both legitimate operators**, each with clear control of their own work. That requires less theatrical cursor movement and more operating-system engineering.
