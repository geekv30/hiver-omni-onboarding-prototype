# Session Handoff

**Next Claude: read this, then `../prototype-v3/`.** Geeky's name is Geeky. Replies: short flowing prose.

## Standing rules — do not repeat these mistakes
1. Figma is ground truth: `get_screenshot` the exact node at native res before building a spatially-precise screen, and re-pull `get_design_context` whenever Geeky says "match Figma" — its JSX beats any prior verbal ask, and it can resolve icon-swap components to the wrong asset (verify with `download_assets`).
2. Match the register before investing effort. This is a professional B2B support tool: cosmic / particle / orb pieces get rejected outright however well crafted. Show real product artifacts — URLs, counts, topics, actual surfaces — not abstract beauty.
3. Never dim the hero wave video to make marks legible, and don't reach for `text-shadow` either: it buys ~0.1 of contrast, and any wide pass on an element with `overflow: hidden` merges across glyphs and gets clipped into a visible dark slab (tight ≤2px only). The answer is dark marks on a `mix-blend-mode: multiply` layer, which read over both the white field and the blue fold.
4. Give each screen its own class/modifier — never touch a class an unreworked screen still uses (`try.html` → `.learning-stage__collapse`; `learning-card.html` → `.learning-video-bg__video`). Declare a modifier after its base rule or source order silently wins.
5. Gate a replay/snap on **how the user arrived** (`performance.getEntriesByType("navigation")[0].type`), never on a "seen" flag — a flag cannot tell a reload from a return, and reload is how Geeky reviews a screen. Verify any back/forward fix by pressing the *browser's* Back after using the *in-UI* Back.
6. Push after *every* verified change — Geeky checks the live URL between requests. Leave the local dev server running (`:8743`, cwd = `journey-v2`, so it serves that folder at `/`).
7. Check for a ready-made library before hand-rolling motion (GSAP is fully free incl. SplitText/ScrambleText since 2025 — verify the CDN URL resolves *and* the plugin registers at runtime, a missing one silently no-ops). Never rely on `currentColor` for an SVG loaded via `<img src>`; inline the markup.
8. Right-pane content: reuse a sibling step's asset wholesale (default — ask before custom-building) or float a layer over the shared backdrop; never fuse content into the backdrop. Pixel-measure against a sibling step before calling it done.

## Where the context lives
| What | Where |
|---|---|
| Prototype source | `../prototype-v3/` — hub `index.html` → `journey-v1/` (frozen) and `journey-v2/` (all active work, own `styles.css`, localStorage suffix `-v2`) |
| Figma | screens `R4i5UtHqLLvyb6s83QUiLg`; components `I2ayU7umG0p9OKTqvLAxme` (authoritative ProgressBar/Header) |
| V2 flow | `index.html` → `learning.html` → `agent.html` → `invite.html`, then **stops** — invite's Continue is a no-op pulse. `learning.html` is an interstitial: it `location.replace()`s itself out of history |
| Backdrop video | one clip, `assets/video/company-backdrop.mp4`, 720x1280 portrait, seamless 30s loop. `journey-v2/backdrop.js` carries `currentTime` across navigations so it reads as one take. Poster = its own frame 0 |
| Animation studies | `journey-v2/agent-animation-claude{,-2,-3,-4,-5}.*` — full-bleed constellation, in-frame two-pane, crawler panel, kinetic headline, then `-5`. The base study now stands on the journey's rotated wave with the constellation inverted to deep ink on a `multiply` canvas; `-5` is the same piece with the marks left white and additive over learning.html's scrim unchanged. All standalone; none wired into the journey |
| Routes | `/animation-0`…`/animation-5` via `prototype-v3/vercel.json` **redirects** (not rewrites — relative asset paths would 404, and `<base>` would break local dev). `/animation-0` → `learning.html?loop=1`, which replays instead of advancing; without the param the journey is unchanged |
| Design tokens for animation | the orb behind the chat avatar, `assets/widget/orb-base.svg`: `#FAE8BF #C2D6E0 #8CC7E0 #6B9EBD #386B8F #26526B` |
| Chat widget research | `../docs/chat-widget-interaction-refinements.md` — ARIA live-region items explicitly declined by Geeky |
| Live / deploy | https://hiver-omni-onboarding.vercel.app · github.com/geekv30/hiver-omni-onboarding-prototype, branch `codex/onboarding-next-iteration`, Vercel root dir `prototype-v3` |

## Session log
### 2026-08-31 (evening) · motion + production-readiness pass on the V2 journey
**Did:** Nine pushes, each Playwright-verified before the next. Killed a real back-trap: `learning.html` auto-advanced with `location.href`, so Back from `agent.html` landed on it, replayed the whole 30s chain and force-forwarded you again — now `location.replace()`, with in-UI Back buttons doing a real `history.back()` and `pageshow`/`persisted` resets for bfcache. `backdrop.js` makes the wave continuous (it restarted at 0:00 on every navigation, measured 2.46s → 0.35s one step later). Font preloads — the two 13KB faces were queued behind the 1.6MB video — plus a 14KB poster. Six `:focus-visible` rules where the whole stylesheet had three. `.chat-collapse` (agent-only) given 400/350ms open/close asymmetry with the 80ms delay off the close. Backdrop rotated a quarter turn, Geeky's call: 1.25x upscale using 90% of the frame against 2.0x using 35%, scoped to `.learning-video-bg--bleed`.
**The finding that matters:** the backdrop looks soft because the source is a 720x1280 **portrait** clip used as a landscape full-bleed — there is no higher-res master in the repo, so rotation is the only free win. Separately, frame timing was already clean (p95 ~14ms, zero frames >33ms, CLS 0), so the perceived roughness was never jank — it was navigation, replays and restarts. Don't go hunting for dropped frames here.
**Mistakes:** Both now rules 3 and 5. Gated the widget reveal on a sessionStorage "seen" flag, which silently killed the chat assembly animation on every reload — the review path — and Geeky had to point it out. Then shipped layered `text-shadow`s that clipped into a dark slab behind every label, after my own measurement had already shown they bought ~0.1 of contrast. Reverted. Also used `replace()` for the in-UI Back buttons first, leaving a duplicate history entry that made the browser's Back appear to do nothing.
**Open / next:** (a) `learning.html`'s marks fail WCAG over the moving backdrop and did before this session too — worst case 2.78:1 classic, 2.18:1 rotated, against a 3:1 bar for the 24px/500 heading. Reads fine by eye, so it is a compliance gap, not a visible break; the fix is rule 3's multiply treatment, which turns the white type dark, so put it to Geeky rather than shipping it. (b) Geeky still has not picked a winner among the five `/animation-*` routes.

### 2026-08-31 (later) · removed learning.html's step-chain result column
**Did:** Dropped `result` from `STEPS` and the third grid column/`.learning-step__result` rule in the shipping `learning.html`, matching what the studies already did. The fit-content chain recenters under the heading on its own once the lopsided column is gone — verified at the active-step and all-done states.

### Earlier
- **2026-08-31 (pm)** — Replaced `learning.html`'s swapping caption with the persistent six-step chain Geeky kept; built four standalone studies of the 30s wait, live at `/animation-1`…`/animation-4`.
- **2026-08-31 (am)** — Made `invite.html`'s right pane byte-for-byte `index.html`'s video + logo-wall block; deleted the unused team mockups.
- **2026-08-29** — Split `prototype-v3` into hub + `journey-v1`/`journey-v2`; built `invite.html`; full chat-widget interaction rework and copy pass.
- **2026-08-28** — Built V2 step 1 (`index.html`) and step 2 (`agent.html`) against fresh Figma pulls.
- **2026-08-26** — Built prototype-v3 (6-screen V1 journey, Emil-style motion) and deployed it live.
