# CASE 0451: The Department of Occupational Classification
Game design document, v2.0 · 2026-11-20

## Product intent
A short, deliberately strange *playable portfolio*. A visitor is asked to place Eric Tung into exactly one occupation. Every valid answer is rejected. The visitor appeals by walking through an old-fashioned first-person bureau, presenting evidence of actual work, and fighting the institution's assumptions using *actions drawn from Eric's CV*.

A recruiter should understand “software engineer, backend/AI, nursing background” within 30 seconds without playing the game. The game is optional, not an obstacle to reaching Work, CV, Writing, or MARK I. A curious visitor should have a complete 8–12-minute game to explore.

This is an original take on document inspection and first-person dungeon crawling, not a recreation of any one game's story, assets, UI, or card roster.

## Audience / success criteria
- Recruiter: finds CV and real project links in <= 2 deliberate actions; sees truthful skills, not invented achievements.
- Curious visitor: understands movement and battle in the first encounter; can complete without external instructions.
- Game enthusiast: finds at least two viable paths through the action deck and is rewarded for combining abilities in an intelligible order.
- Returning visitor: local save survives reload; short session, restart possible.
- Accessibility: keyboard and touch controls, no action that requires rapid timing, clear intent labels, reduced-motion handling, readable text outside the 320×200 viewport.

## Creative pillars
1. **Bureaucracy is the antagonist.** The monsters are “degree gatekeeping,” “compliance audit,” and “mandatory categorization.” Their actions resemble their institutional behavior.
2. **Card effects are causally tied to real skills.** SQL exposes hidden assumptions; RAG retrieves citations; patient assessment produces documented evidence; handoff preserves protection; REST API bypasses a barrier.
3. **A career intersection is a combo engine.** The strongest play uses care/observation to collect evidence, then engineering to make a powerful, grounded argument.
4. **Old hardware; new interactions.** The whole playable section is low-resolution pixel art with flat textured walls and large enemy sprites. No 3D geometry, camera smoothing, loot boxes, or summoned creatures.
5. **Meaningful choices, minimal friction.** Every fight telegraphs its next action. After each battle the visitor can add a new card or decline it. Three story encounters offer contextual decisions.

## First 30 seconds
0–8s: the visitor sees the personnel record and can read NTU Nursing, Software Engineer, Backend/AI/Clinical.
8–15s: they select Engineer, Nurse, or Other. The department finds a contradictory reason to reject it.
15–25s: FILE APPEAL opens the dungeon with a visible compass, health, quick movement directions and available RULES.
25–30s: exploration reveals the first file marker, enemy, or '?' encounter. The CV and Work buttons remain available throughout.

## Core loop
Choose occupation → rejected → file appeal → orient in the first-person maze → inspect an artifact / choose a story action / confront an inspector → read enemy intent → play 0–3 energy-cost action cards → produce evidence and spend it strategically → win → heal through the “Nursing Training” passive → add or skip a card → locate two real projects and overcome two officers → central door → defeat mandatory-classification engine → classification rule is void.

### Loss / recovery
- Run HP hits 0: application terminated, restart offered. Project links remain available at all times.
- Reload: browser local storage restores the in-progress run. Reset explicitly asks permission.
- No paid items, analytics-based difficulty, real personal data, or server-side saves.

## Core resources
| Resource | Starting | Rules | Theme |
|---|---:|---|---|
| HP | 42 | Persists across encounters. +5 after every win (Nursing Training); healing cannot exceed max. | Care under pressure |
| Energy | 3 each turn | Spend to play cards. MISFILED can reduce next-turn energy, minimum 1. | Finite attention |
| Block | 0 | Absorbs telegraphed attack and normally expires at turn end. | Safety controls |
| Carry | 0 | HANDOFF transfers 4 block into next turn. | Continuity of care |
| Evidence | 0, max 6 | Care/research/RAG builds it; most CODE hits spend up to 2, adding +2 damage per evidence. LOCAL LLM spends one to enter its grounded mode. | Verifiable claims |
| Exposed | 0 | SQL reveals structural weakness. CODE attacks deal +2 and consume a stack; BREAKPOINT can instead cancel the current enemy action. | Debugging from data |
| Enemy armor | 0 | Reduces ordinary attacks; REST bypasses; ABAP removes/retools; SQL strips. | Procedural shielding |
| MISFILED | 0 | Auditor or Engine applies this energy-reduction status. SOAP NOTE clears it. | Wrong record classification |
| Risk Screened | 0 | Next two enemy ATTACK intents deal 4 less damage; guard/misfile turns do not consume it. | Preventive risk assessment |

**Intent is announced** before the enemy acts. Guard, attack, and MISFILED actions are all legible. If an intended action is interrupted, it does nothing. There are no surprise random damage rolls.

## Cards: exactly what each action does
All cards are *actions*, not summons, hero cards, or unit placement. Numbered keys 1–8 and clicking are equivalent.

| Category | Card (CV anchor) | Cost | Mechanic | Semantic reason |
|---|---|---:|---|---|
| CODE | Python Script (Python) | 1 | 6 damage; +3 if previous card was CODE | Scripts become more useful in workflows |
| CODE | SQL Query (SQL/data) | 1 | 3 damage, strip 6 armor, Expose +2 | Data inspection reveals and corrects a false premise |
| CODE | REST Request (APIs) | 1 | 7 armor-piercing damage | Interfaces bridge guarded systems |
| CODE | Breakpoint (debugging) | 2 | 4 damage; if already Exposed, interrupt current enemy action; otherwise Expose +1 | Pinpoint a bug before stopping it |
| CROSS | RAG Retrieval (FAISS/RAG) | 1 | Evidence +2; draw 1 | Retrieve trusted source documents, then act |
| CODE | CI Pipeline (automation) | 2 | 4 damage x2; x3 when following a CODE card | Reproducible automated sequences |
| CODE | SAP ABAP (Deloitte) | 1 | Remove up to 7 enemy armor and convert the amount into additional damage, plus 3 | Modify rigid enterprise processes instead of just hitting them |
| CROSS | .NET MAUI (BenQ) | 1 | Block 5 and deal 4 | Maintain one system on multiple surfaces |
| CODE | Local LLM (local inference) | 2 | Spend 1 evidence for 14 damage; otherwise 4 | Grounded output is much more reliable |
| CARE | Triage (clinical assessment) | 1 | Block 5, +6 if incoming intent is ATTACK | Respond to the risk actually approaching |
| CARE | Assessment (NTUH training) | 1 | Block 5, evidence +1 | Observe and document before intervening |
| CARE | Handoff (hospital practice) | 1 | Block 7; carry 4 to next turn | Safety and information persist across shifts |
| CARE | SOAP Note (clinical charting/HIS) | 1 | Block 3, evidence +2, clear MISFILED | Documentation corrects the record |
| CARE | Stabilize (vital signs) | 2 | Heal 6, block 4 | Therapeutic intervention restores function |
| CROSS | Peer Review (2026 paper) | 1 | Evidence +3, draw 1 | Claims are strengthened by external verification |
| CARE | Risk Screen (Morse/Braden) | 1 | Block 4; next two enemy attacks deal 4 less damage each | Prevent an identifiable future risk |

This is intentionally not a literal claim that technical or nursing skills “cause damage” in real life. The effects express each skill's *problem-solving behavior in a fictional adversarial bureaucracy*.

## Enemy encounters & illustrations
The enemy is always a large, front-facing, original pixel sprite in the **center of the first-person dungeon viewport** while battling. Not a small icon beside a health bar. Enemy name, HP, planned action and damage/armor/status are shown in the viewport; card hand and player resources are below.

### 1. Degree Gatekeeper
A stamped-uniform clerk with a huge REJECTED seal. “No CS degree: application invalid.” 34 HP. Action cycle: 7 attack, 7 armor, 11 attack. Learning goal: SQL exposes and strips bureaucratic protection; REST bypasses it.

### 2. Compliance Auditor
A faceless clerk behind a ledger and redaction stamps. “Clinical work is irrelevant to engineering.” 43 HP. Cycle: 9 armor, 9 attack, MISFILED +1, 12 attack. Learning goal: use SOAP Note to correct MISFILED; triage/assessment preserve HP, then return grounded evidence as damage.

### 3. Classification Engine
An enormous machine with a singular scanning eye and a compulsory category slot. 62 HP. Cycle: 12 attack, MISFILED +1, 11 armor, 16 attack. Learning goal: combine care + code, interrupt devastating attacks, manage the deck. The ending is unlocked by **actual project dossiers**, not only abstract enemy kills.

## Maze and pacing
Current vertical slice deliberately uses one hand-authored 15×15 navigable floor. This is *dungeon crawling with roguelite deck evolution*, not yet a procedural roguelike; random cards and event decisions create variation. A procedurally generated multi-floor run should only be added once session length and combat balance justify it.

- Spawn: (1,1), facing south.
- Degree Gatekeeper: (1,11).
- Compliance Auditor: (7,1).
- Dossier A: (6,13), real GitHub prenatal education RAG chatbot.
- Dossier H: (10,3), real GitHub long-term care health information system.
- Three '?' events: reference desk, jammed printer, night shift.
- Central X: (4,3). Once both dossiers and both inspectors are resolved, entering X triggers the final Engine.
- All required encounters, dossiers and exit are reachable on the map. Minimap is fog-of-war and optional; no unwarned dead ends.

### Story events
- Reference desk: cite a peer-reviewed paper and gain PEER REVIEW, or take a restorative rewrite break (+8 HP).
- Jammed printer: file concrete technical work (+.NET MAUI card), or thin the deck by removing one basic Python Script.
- Night shift: take a coffee break (+12 HP) or gain RISK SCREEN by reading the handoff.

Events do not misrepresent CV facts: the publication and technical experiences exist; the bureaucracy/dialogue is fictional.

## Deckbuilding, progression and fairness
- Initial deck: 10 cards, balanced between CODE, CARE and CROSS.
- Occupation selection determines one extra starting card, not a permanent classification: ENGINEER receives Breakpoint; NURSE receives Stabilize; OTHER receives .NET MAUI.
- Each non-final victory presents 3 options drawn from the eligible card pool; skipping is allowed to prevent deck bloat.
- Three story events offer card/health/deck-thinning decisions. Healing is limited; careless aggression can lose a run.
- The nursing passive is always active: recover 5 HP after each successful fight.
- The same generated seed and sequence of decisions should reproduce reward ordering.
- Difficulty is communicated through enemy intents, not hidden unavoidable damage.
- No mandatory game play to view actual portfolio content.

## Distinct strategic lines to support
1. **Clinical evidence engine**: Assessment → SOAP Note or RAG → Local LLM / Python. Takes turns to prepare a large, grounded result.
2. **Break-the-rules control**: SQL → Breakpoint to cancel enemy attack, REST to bypass armor.
3. **Sustained survival**: Triage against visible attacks, Handoff to protect the next turn, Stabilize during dangerous turns.
4. **Workflow acceleration**: Python → Python or CODE → CI Pipeline for repeatable steps; visit printer to thin the deck.

Balance should be tuned against these paths, not simply by comparing raw damage-per-energy.

## Tone / narrative guidelines
- Deadpan, understated, and serious about obviously ridiculous regulations.
- Dialogue should sound like real government office language: terse notices, invalid fields, contradictions, required supporting evidence.
- No generic motivational taglines or explanatory subtitle on the opening screen.
- No factual statements about the author's qualifications beyond the repository's public CV/knowledge file.
- The ending treats the **classification rule** as erroneous. The player wins by proving the assumption invalid.

## Presentation
- Deliberately limited palette: dark green, beige paper, dull ochre, red rejection marks.
- Fixed low-resolution first-person view with nearest-neighbor scaling and texture walls. Sprite opponents use hard-edged blocks and no smooth 3D models.
- Large readable enemy silhouettes; two-tone damage feedback. No visually overwhelming particles.
- Modal choices remain readable in normal web text; pixel feel should not make cards unreadable.
- Touch control pad and keyboard movement. Descriptive ARIA for enemies and map, reduced-motion CSS.
- World/viewport should show a monster from the moment battle begins.

## Acceptance checklist
- [x] Opening is an 8-bit personnel classification form with contradictory responses.
- [x] Direct CV/Work/Writing access regardless of game state.
- [x] Fixed 320×200 first-person corridor with flat tile textures and map.
- [x] Large unique enemy portraits inside viewport, not generic icons.
- [x] Telegraphed intent, enemy defense and status feedback.
- [x] 16 context-specific action cards with meaningful combos and origin explanations.
- [x] CARE → Evidence → CODE interaction.
- [x] Three distinct opponent behaviors, including a final boss.
- [x] Two CV-grounded project records and direct GitHub links.
- [x] Three branching events, reward/skip decisions, multiple opening builds.
- [x] Auto-save/resume, restart, mouse/keyboard/mobile controls.
- [ ] Browser-playthrough across desktop/mobile, low-health and resume edge cases.
- [x] Initial deterministic balance simulation: 120 seeds for each of two heuristic policies; see note below. Human playtesting remains necessary.
- [ ] Procedural maps / more floors, if a later playtest demonstrates value.
- [ ] Audio/FX polish without hurting accessibility.
- [ ] Localized flavor dialogue expansion informed by actual playtest feedback.

## Initial balance result (scripted policies, not player research)
GitHub Actions ran the rule engine against 120 fixed seeds per policy. Both simulations assume two reachable healing-event choices totaling up to 20 HP and sample the same three bosses in sequence; they omit maze travel and do not model real human decision-making.

- Naïve policy: plays the first affordable card, wins 84/120 (70%), averages 2.7 bosses defeated and 18.5 total turns.
- Planned policy: reads intent, builds evidence, uses defensive skills at the right time, wins 119/120 (99%), averages 2.99 bosses defeated and 13.4 total turns.
- **Interpretation**: working with the system has observable mechanical payoff. The expert policy may be too reliable; adjust only after testing real visitors. This simulator is a sanity check, not a valid estimate of real users' win rates.

## Production / QA gates
1. **Build**: TypeScript/Vite CI passes.
2. **Rule tests**: verify damage accounting, evidence cap, armor bypass, interrupted attack, turn order, carry, MISFILED-cleansing, final door conditions and reward selection.
3. **Playability**: new run can reach both records, both inspectors and the final door, restart and browser reload work.
4. **Visual**: monster is visible on first frame of every battle at desktop and 375px touch width. Intent labels not obstructed by HUD. 8-bit scaling is crisp.
5. **Recruiter**: a visitor can get to projects/CV immediately. CV document details map to the public knowledge file.
6. **Rollout**: merge only after the above are checked. Production stays on the existing version until release.

### Visual/gameplay references
- *Papers, Please*: bureaucratic inspection premise and paperwork interactions, not borrowed assets or copied screen arrangement. Official press kit: https://papersplea.se/presskit/
- *Shin Megami Tensei* (1992): first-person dungeon-crawler lineage and visible enemy battles. Background: https://shmuplations.com/smt/
- *Slay the Spire*: readable enemy intent and card-resource tradeoffs as reference only; no monsters-as-cards or identical deck. Cornell course case study: https://www.cs.cornell.edu/courses/cs5152/2026sp/lectures/lecture14/slides-14.pdf

## Source of truth
- Repo data: src/data/knowledge.json (projects, skills, work history, educational record, publication).
- Core rules: src/case-engine.ts.
- First-person renderer: src/case-raycast.ts.
- Sprite art: src/case-sprites.tsx.
- Scene/UI: src/department.tsx and src/department.css.
