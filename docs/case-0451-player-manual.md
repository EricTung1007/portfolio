# CASE 0451 · Visitor Procedure / 玩家操作手冊
**Development build:** v3 experimental branch `feat/case-0451-v3-roguelite`. This manual describes implemented rules in that branch, not the deployed website.

## 1. Your file is being closed / 案件即將歸檔
The Department of Occupational Classification allows one occupation per person. The file lists a nursing degree, engineering work and AI projects. The form cannot accept all three; the office's procedure is to archive contradictory records at the end of the shift. File an appeal to challenge the rule. This is fictional bureaucratic satire. The real CV and project links are always accessible.

職業分類局規定每個人僅能填入一個職業。人事檔案同時包含護理學位、工程經歷與 AI 作品，導致分類系統無法處理，並預定於下班時歸檔。你可以提出異議，進入局內調查。這是虛構的制度諷刺，與真實履歷的存取無關。

## 2. How to play / 如何操作
- **Opening / 開場：** Select ENGINEER, NURSE or OTHER. All are denied for different bureaucratic reasons. FILE APPEAL starts the run. CLOSE FILE gives up, producing an alternate ending without blocking the portfolio.
- **Movement / 移動：** W / ↑ advance; S / ↓ step back; A / ← turn left; D / → turn right; M toggles the fog-of-war map. Touch directional buttons are provided.
- **In battle / 戰鬥：** Read the next named enemy intent. Click a card or press 1–8 to use it; Enter ends the turn. You normally start with 3 Energy and draw five cards. You may use at most two 0-Energy cards in one turn. Cards are *your actions*, not summoned units.
- **Win condition / 通關條件：** Register two *real* project dossiers (A and H), defeat the Degree Gatekeeper and Compliance Auditor, then reach the central X terminal. Compare the two real projects with the classification rule at the final hearing and defeat the Classification Engine. Each dossier and each of the first two victories now also offers a three-card procedure draft or a skip. This expands the opportunities to construct a deck.
- **Optional information / 補充資訊：** MANUAL in the header explains rules; CARDS opens the complete 112-card searchable action archive.

## 3. Combat resources / 戰鬥資源

| Resource | Effect / 效果 |
|---|---|
| HP | Persists across fights. Nursing Training restores up to 5 HP after a victory. 跨場延續，勝利後最高恢復 5。 |
| Energy | Normally 3 each turn; MISFILED reduces the next turn's Energy, minimum 1. 原則每回合 3，誤分類會降低下一回合可用量。 |
| Block | Reduces incoming ATTACK damage and normally expires at turn end. 護盾吸收攻擊，通常回合結束歸零。 |
| Carry | Handoff sets block for the next turn. 交班可延續下回合護盾。 |
| Evidence | Maximum 6. CARE, research and retrieval create Evidence. Typical CODE attacks automatically spend up to 2 for +2 damage per Evidence. 證據最多 6，程式攻擊通常自動消耗最多 2 點，每點增加 2 傷害。 |
| Exposed | CODE hits can consume it for bonus damage; Breakpoint can interrupt exposed opponents. 弱點揭露可增傷，並支援中斷。 |
| Enemy Armor | Blocks normal damage; REST and piercing attacks bypass it. 敵方護甲抵銷普通傷害，穿甲攻擊可忽略。 |
| MISFILED | Reduces future Energy; SOAP Note and selected cleansing cards can correct it. 誤分類降低下回合行動力，可透過修正卡解除。 |
| Risk Screened | Reduces the next two actual enemy ATTACKs by 4 each. 預防性風險評估減少敵方接下來兩次攻擊各 4 傷害。 |

## 4. Status effects / 狀態異常
Statuses stack to a maximum of **three**. Player ailments can persist between battles, but victories clear bleeding/DDOSED and reduce wounded/infected by one. Their icon labels and stack counts are shown in the battle HUD. Fictional statuses do not describe harm to real patients.

| Ailment | On the player / 玩家受到 | On the enemy / 敵方受到 |
|---|---|---|
| **WOUNDED / 創傷** | New Block gained from a card decreases by 2 per stack. 卡片新增護盾每層減少 2。 | Attack damage decreases by 2 per stack; decays after attacking. 攻擊每層減傷 2，攻擊後消退。 |
| **BLEEDING / 流血** | Lose 2 HP per stack at turn end, then lose one stack. 每回合結束每層失去 2 HP，並減少一層。 | Lose 1 HP per stack at turn end, then decay. 每回合結束每層失去 1 HP 並遞減。 |
| **INFECTED / 感染** | Lose 1 HP per stack at turn end; healing loses effectiveness by 1 per stack. 每回合結束每層失去 1 HP，治療每層減 1。 | Lose 2 HP per stack at turn end. 每回合結束每層失去 2 HP。 |
| **DDOSED / 遭阻斷** | Next-turn draws decrease by one per stack (minimum two drawn); stack decays after drawing. 下回合每層少抽 1 張牌，至少抽 2 張，觸發後遞減。 | Cancels one non-ATTACK enemy intent, consuming a stack. 取消一次非攻擊行動，消耗一層。 |

The attacks of variant officers may apply ailments if their attacks inflict HP damage. Some cards add ailments to officers, while cleansing cards clear player ailments. For clarity, enemy actions still have a fully visible intent line; there are no random hidden attack rolls.

## 5. Randomized case rules / 隨機案件規則
Each seed determines multiple independent variations:
1. One of three hand-authored maze layouts with optional shortcut openings. The mandatory goals remain accessible in all variants. The game does not yet generate arbitrary corridors.
2. One of four case directives: Degree Priority (enemies start armored), Evidence First (extra starting Evidence), Audit Overload (every fourth enemy turn adds MISFILED), or Night Shift (combat healing reduced).
3. Each officer's standard or status-bearing attack variant, fully telegraphed.
4. Three story-event assignments, shuffled among the pre-authored event sites.
5. Three optional **C**abinets in dead-end rooms, containing a randomized assignment of one extra three-card draft, one HP recovery and one ailment repair. Each is single-use; optional rooms reward exploration rather than blocking the main route.
6. Card draw/shuffle order and rewards (rewards try to offer CODE, CARE and CROSS choices).

You can restart to obtain a different case. All three layout variations are handcrafted; this is intentionally not an arbitrary procedural dungeon.

## 6. Deckbuilding / 行動卡構築
The archive contains **112 base actions plus 16 authored upgrade variants**: 16 original cards and 96 additional cards based on Python, SQL, APIs, Git/Docker, RAG, local inference and evaluation, clinical assessment, nursing documentation, risk prevention, health-information systems and research. These are fictional actions inspired by **skills mentioned in the real CV**; cards do not assert new employment achievements.

Each non-final officer victory, each registered dossier and the optional draft cabinet present up to three random options. Each dossier draft is followed by a **single-copy two-way amendment**: choose one eligible base card and select its A or B upgrade, or decline. Upgrading Python, SQL, REST, RAG, Assessment, Triage, Handoff or Local LLM only changes the chosen instance. You may take exactly one or skip. Event decisions may also award cards, remove one basic Python, or restore HP. The entire card library can be searched in the game; not all cards appear in one run.

**Practical tips / 操作建議**
- Build Evidence with CARE or research, then spend it on CODE to take down procedural shields.
- SQL exposes vulnerabilities, Breakpoint interrupts an Exposed opponent, and REST bypasses Armor.
- Preventing WOUNDED / INFECTED matters across fights; healing may be weakened by infection.
- A 0-cost draw card is useful, but only two free cards can be played each turn.
- Taking a new card is optional. Avoid diluting a coherent deck.

## 7. The endings / 分歧結局
- **True ending: RULE §0451 INVALIDATED / 分類規則撤銷.** At the final hearing, correctly cite the contradiction between the two verified cross-domain projects and the compulsory one-category rule, then defeat the Engine. Other findings provide battle advantage, but are not a hidden mandatory quota.
- **Standard ending: EXCEPTION GRANTED / 核准特例.** Defeat the Engine after relying on the degree or requesting only a personal exception, rather than contesting the invalid classification rule. The applicant wins but the regulation survives.
- **Withdrawn ending: FILE CLOSED / 案件歸檔.** Choose CLOSE FILE after the opening rejection. This is a voluntary bureaucratic compromise.
- **Failure ending: APPLICATION TERMINATED / 申訴駁回.** HP reaches zero. You can restart; real project links remain accessible.

## 8. Portfolio access / 真實作品入口
**WORK**, **CV**, **WRITING** and **MARK I** in the top navigation are available from the start and remain available without completing the game. The dossiers reference the real projects [Prenatal RAG Chatbot](https://github.com/EricTung1007/NTU-Nursing-Line-Bot) and [Long-Term Care HIS](https://github.com/EricTung1007/HIS). The bureau, statuses and combat are fictional.

## 9. Accessibility & known limitations / 無障礙與限制
The game uses a pixelated 320×200 raycast corridor, readable HTML text, keyboard/touch controls, descriptive ARIA labels and reduced-motion CSS. Saves are browser-local. Full playthrough, 375px mobile layout, screen-reader testing, reload recovery and human card balance testing are required before merging. CI success is not evidence of a fun human experience. The PR and this v3 branch are **not production**.

## 10. Why each card looks the way it does / 卡面語意
Every action is illustrated with a hand-assigned pixel-art subject associated with its real skill domain (for example, SQL database rows, a patient-monitor waveform for VITAL MONITOR, a clipboard for SOAP, network nodes for API and a debugger symbol for BREAKPOINT). The colored glyphs on the right are drawn from the card's **actual mechanics**, not decorative category tags. The archive renders all 112 actions and 16 upgrade variants. Each art subject and effect correspondence is checked by automated rendering assertions.
每張牌都對應具體的技能主題像素圖，旁邊的符號依照實際卡牌效果產生。卡牌不能只有名稱與數值不同，卻搭配無關畫面；所有 128 種牌面皆納入自動化圖像資料檢查。
