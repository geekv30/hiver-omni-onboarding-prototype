# Session Handoff

**Next Claude: read this, then `../prototype-v3/`.** Geeky's name is Geeky. Replies: short flowing prose.

## Standing rules — do not repeat these mistakes
1. Before building a spatially-precise Figma screen, call `get_screenshot` on the exact node at native res first — don't eyeball `get_design_context`'s JSX alone.
2. Fixed-px decorative compositions need a JS `--fit` responsive scale from the start, not just centering, or they clip below the Figma export size.
3. Give each V2 screen its own CSS class/modifier (`.onboarding-frame--company`) — never touch a class an unreworked screen still uses. Verify by reloading that other screen too.
4. `get_design_context` JSX is ground truth over any prior verbal ask or visually-similar screen — re-pull it whenever Geeky says "match Figma," even after several rounds of verbal-instruction changes. It can also resolve an icon to the wrong unrelated asset (icon-swap components); verify a suspicious icon with `get_screenshot` + `download_assets` on that exact node before trusting it.
5. Never rely on `currentColor` for an SVG loaded via `<img src>` — inline the `<svg>` markup instead.
6. A modifier class (`.x--variant`) must be declared after its base rule in the stylesheet or source order silently wins.
7. A copy-only fix still has to fit existing fixed-width UI (e.g. a chat suggestion chip) — check rendered length, don't just improve the grammar.
8. Push after *every* verified change, not in a batch — Geeky checks the live URL between requests, and unpushed local fixes read as "you didn't do anything." Leave the local dev server running between checks.
9. Right-pane content is either (a) a sibling step's asset reused wholesale (video + `hero-copy`/logo-wall, or `.chat-widget`) — default to this, ask before custom-building from Figma — or (b) a smaller layer floated over the one SHARED full-bleed backdrop (`landscape-image`, `cover`-fit, md5-identical to `assets/agent/backdrop.png`). Never fuse new content into the backdrop itself. Before calling any such fix done, crop browser chrome and pixel-measure your screenshot against a sibling step's at the same viewport width — don't eyeball, don't guess the cause from theory (this session misdiagnosed a proportions/crop bug as a border-radius bug, twice).

## Where the context lives
| What | Where |
|---|---|
| Prototype source | `../prototype-v3/` — now a **hub page** (`index.html`) linking to `journey-v1/` (frozen pre-V2 snapshot, untouched) and `journey-v2/` (all active work: index/learning/agent/invite `.html`+`.js`, own `styles.css`, own localStorage key suffix `-v2`) |
| Figma source (screens) | file key `R4i5UtHqLLvyb6s83QUiLg` ("Omni-onboarding") |
| Figma source (components) | file key `I2ayU7umG0p9OKTqvLAxme` ("onboarding-ui-improvements") — authoritative ProgressBar/Header defs |
| V2 flow (built, in order) | `index.html` → `learning.html` → `agent.html` → `invite.html`, then **stops** — invite's Continue is a no-op pulse, no next screen exists yet |
| Chat widget research | `../docs/chat-widget-interaction-refinements.md` — cited punch list (shadcn/AI Elements/Vercel AI SDK/WCAG/Intercom). Composer, scroll, chip-reuse, and motion items applied; ARIA live-region items explicitly declined by Geeky |
| transitions-dev/transitions-polish skills | installed via `npx skills add Jakubantalik/transitions.dev`, but only under the **main checkout** `/Users/varunkelkar/Documents/o-onboarding/.agents/skills/` — not visible from this worktree's own directory |
| Live deployment | https://hiver-omni-onboarding.vercel.app — in sync with every commit below |
| Deploy repo | github.com/geekv30/hiver-omni-onboarding-prototype, branch `codex/onboarding-next-iteration`, Vercel root dir `prototype-v3` |
| localStorage keys | journey-v2: `hiver-omni-knowledge-onboarding-v2`, `hiver-omni-company-name-v2`, `hiver-omni-agent-name-v2`. journey-v1 keeps the old `-v3` suffix — no collision |

## Session log
### 2026-08-31 · invite.html right-pane: three wrong attempts, then reuse step 1's asset
**Did:** Ended on: `invite.html`'s right pane is now byte-for-byte the same video + `hero-copy`/logo-wall block as `index.html` (Geeky's final call — drop the custom mockup entirely). Deleted the now-unused `team-hero.png`/`team-mockup.png` and their CSS.
**Mistakes:** (1) Geeky updated the Figma invite mockup (ticket+chat card); flattened the whole thing into one image and dropped it in as the pane's background — broke the shared full-bleed backdrop contract, made corners/proportions wrong on THAT step only. (2) When told "no rounded corners," diagnosed it as a CSS radius bug and guessed twice (checked live site at 5 viewport widths, all looked fine to me) before actually pixel-measuring Geeky's real screenshot vs. a sibling step's — the real bug was `object-fit:cover` slicing through the fused image's internal seams. (3) Fixed that by exporting the ticket/chat/dropdown as separate transparent layers and template-matching them back together (real fix, kept), but then sized the floated result like agent.html's small `.chat-widget` (min 480px) instead of measuring Figma's own ~87%/91% fill — Geeky had to catch that too. (4) Never asked "does Geeky just want step 1's existing asset here" until told directly — would have skipped attempts 1–3 entirely.
**Open/next:** Nothing open. Journey still stops after `invite.html` (unchanged, intentional).

### 2026-08-29 · Journey V1/V2 hub split, invite.html built, chat-widget rework, copy pass
**Did:** Split `prototype-v3/` into a hub + `journey-v1`/`journey-v2` (see table). Fixed logo-wall contrast (Mobbin-researched), removed dead Hiver-mark/animated-sparkle. Full chat-widget interaction rework per `docs/chat-widget-interaction-refinements.md` (real composer, stick-to-bottom scroll, reusable chips). Rebuilt chat-widget colors to exact Figma spec (node `501:35968`) after an early band-aid (invented borders/shadows) got called out. Built `invite.html`/`invite.js` from Figma node `530:37874`. Motion pass: replaced fixed-`max-height` row reveals with CSS grid `0fr→1fr` (auto-fits any content height, was clipping/leaving dead space). Full copy/grammar pass across the three built steps.
**Mistakes:** Went several rounds without pushing while Geeky checked the live URL — read as "nothing was applied." Guessed suggestion-chip layout (horizontal scroll) from a verbal ask instead of Figma; had to revert to Figma's real vertical stack. Added inline source chips and CSS borders/shadows with no basis in Figma — reverted both once flagged.
**Open/next:** No screen exists after `invite.html` yet (intentional). Lower-priority items in the chat-widget research doc (hover message actions, avatar dedup) are unclaimed if asked for.

### Earlier
- **2026-08-28** — Built V2 step 1 (`index.html`, video hero, logo wall) and step 2 (`agent.html`, chat widget) against fresh Figma pulls.
- **2026-08-26** — Built prototype-v3 (6-screen V1 journey, Emil-style motion) and deployed it live; see git history.
