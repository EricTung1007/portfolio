# Handover — Eric.exe (Portfolio Website)

**To:** Designer
**From:** Backend/AI engineer (Eric Zhang)
**Status:** Production-ready build, source is clean and type-checked.

---

## What this project IS

A **browser-native AI portfolio** for me (Eric Tung, or Che-Hao,Tung — backend/AI developer with a nursing background).

The hook: instead of a static "Contact / FAQ" section, the site features an **interactive chatbot that *is* Eric** — a visitor asks about his nursing background, AI projects, skills, and projects, and it answers in-character.

The cool part: the AI runs **entirely locally in the browser via WebGPU** — no backend, no API keys sent anywhere. A quantized model (`Qwen2.5-Coder-1.5B`, ~500 MB, downloaded once) runs directly in the visitor's browser. The data it "knows" comes from a local `knowledge.json`.

It is **not** a marketing landing page. It's an experience — the chat IS the portfolio.

---

## How to run it (already set up)

```bash
npm install      # dependencies — already done
npm run dev      # starts the site at http://localhost:5173/
npm run build    # production bundle -> dist/
```

The site builds and type-checks cleanly (`tsc` + `vite build`). Dev server runs at **http://localhost:5173/**.

---

## Tech stack (so you know what to build against)

- **React 18** + **TypeScript**, bundled with **Vite 6**.
- **Tailwind CSS** — dark theme, anchored on `#0b1120` (very deep navy/blue).
- **`@mlc-ai/web-llm`** — the local model. This is why the build bundle is ~6 MB (expected; that chunk only downloads when a user clicks "Initialize Local AI").

No CSS framework beyond Tailwind. Styles ride on Tailwind utility classes plus a handful of `.btn-primary`, `.card` components defined in `src/index.css`.

---

## File map (what to touch)

**App shell — `src/App.tsx`**
Switches between two views: **chat view** (avatar + chat panel) and **portfolio view**. Header nav buttons ("Chat" / "Portfolio") drive this. This is where the layout skeleton lives.

**`src/Portfolio.tsx`** (NEW — I built this)
Renders everything the nav anchors to: Skills grouped by category, Experience timeline, Featured Projects (with stack tags + GitHub links), and a Frequently-Asked section. Each pulls directly from the data file below.

**Data — `src/data/knowledge.json`** (via `src/data.ts`)
The single source of truth for ALL content: profile, contact info, education, 4 experience entries, skills (grouped), 2 featured projects, and 6 FAQs (English + Chinese). **If you change wording here, it flows into both the chat model and the portfolio sections.**

**Components — `src/components/`**
- `ChatPanel.tsx` — the chat UI (message list, suggestions, send box). This is the star.
- `JawAnimation.tsx` — Eric's animated avatar; mouth moves while the AI "thinks," pauses when done. Respects reduced-motion settings.
- `Message.tsx`, `QuestionChip.tsx` — inline UI (each message bubble + suggested-question pill).

**Styling — `src/index.css`**
Tailwind directives + custom `.btn-primary`, `.card`, dark background. This is where the visual theme is defined.

---

## What I'm asking from you — a full UI/UX revamp

I've kept the content correct and code building. What's missing is **feel** — it currently reads as a functional internal tool, not something I'd be proud to send a recruiter.

Specifically, I'd love a redesign that makes it feel **stylish and intentional**:

1. **Visual identity** — the current `#0b1120` navy + flat indigo buttons are safe and generic. Give it a distinct personality (color grading, gradients, depth, or a subtle motion language that fits "AI + nursing").
2. **Layout & hierarchy** — the two-panel split (avatar | chat) feels utilitarian. Reimagine how the portfolio content is presented — cards, spacing, typography scale, scroll rhythm.
3. **The chat experience** — this is the centerpiece. Make message bubbles, suggestion chips, and the "thinking" state feel alive and premium. The jaw-animation is a nice touch; it should feel like part of the design, not an aftereffect.
4. **Portfolio view** — turn the Skills/Experience/Projects sections into something visual and engaging rather than lists. Stack tags, timeline, project cards — all opportunities for design.
5. **Responsive & motion** — works on desktop/mobile; smooth, tasteful transitions (respecting `prefers-reduced-motion`).

**Constraints:**
- Keep React + Tailwind. Avoid adding heavy UI libraries — prefer hand-crafted utility classes so it stays lean.
- The AI model is a 500 MB one-time local download; the UI around "Initialize Local AI" (download progress, ready state, error/retry) should feel polished.
- Content lives in `src/data/knowledge.json` — the redesign doesn't need to touch that, just restyle what's there.

**Deliverable I expect:** a redesigned `src/index.css` (Tailwind theme + component classes) and updated markup in `App.tsx` / `Portfolio.tsx` / the components — building cleanly with `npm run build`.

---

## Quick start for you

```bash
cd "/Users/erictung/Documents/portfolio website"
npm run dev
```

Then open **http://localhost:5173/** and poke around both the chat and portfolio views. The content is solid — I'm handing you a blank canvas on top of it.

Questions? Ping me and I'll clarify anything about the code or data flow.
