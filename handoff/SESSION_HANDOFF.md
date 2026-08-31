# Session Handoff

**Next Claude: read this, then `../prototype-v3/`.** Geeky's name is Geeky. Replies: short flowing prose.

## Standing rules — do not repeat these mistakes
1. Figma is ground truth: `get_screenshot` the exact node at native res before building a spatially-precise screen, and re-pull `get_design_context` whenever Geeky says "match Figma" — its JSX beats any prior verbal ask, and it can resolve icon-swap components to the wrong asset (verify with `download_assets`).
2. Match the register before investing effort. This is a professional B2B support tool: cosmic / particle / orb pieces get rejected outright however well crafted. Show real product artifacts — URLs, counts, topics, actual surfaces — not abstract beauty.
3. Never dim the brand's own hero visual (the wave video) to make your marks legible. Change the marks: dark marks on a `mix-blend-mode: multiply` layer read over both the white field and the blue fold.
4. Give each screen its own class/modifier — never touch a class an unreworked screen still uses (`try.html` still renders against `.learning-stage__collapse`). Declare a modifier after its base rule or source order silently wins.
5. Never rely on `currentColor` for an SVG loaded via `<img src>` — inline the markup. The bundled Apple mark is filled white and vanishes on a white surface.
6. Push after *every* verified change — Geeky checks the live URL between requests. Leave the local dev server running (`:8743`, cwd = `journey-v2`, so it serves that folder at `/`).
7. Check for a ready-made library before hand-rolling motion. GSAP has been 100% free including SplitText/ScrambleText since 2025. Verify the CDN URL resolves *and* that the plugin registers at runtime (`gsap.plugins`) — a paywalled or missing plugin silently no-ops.
8. Right-pane content: reuse a sibling step's asset wholesale (default — ask before custom-building) or float a layer over the shared backdrop; never fuse content into the backdrop. Pixel-measure against a sibling step before calling it done.

## Where the context lives
| What | Where |
|---|---|
| Prototype source | `../prototype-v3/` — hub `index.html` → `journey-v1/` (frozen) and `journey-v2/` (all active work, own `styles.css`, localStorage suffix `-v2`) |
| Figma | screens `R4i5UtHqLLvyb6s83QUiLg`; components `I2ayU7umG0p9OKTqvLAxme` (authoritative ProgressBar/Header) |
| V2 flow | `index.html` → `learning.html` → `agent.html` → `invite.html`, then **stops** — invite's Continue is a no-op pulse |
| Animation studies | `journey-v2/agent-animation-claude{,-2,-3,-4}.*` — full-bleed constellation, in-frame two-pane, crawler panel, kinetic headline. All standalone; none wired into the journey |
| Routes | `/animation-0`…`/animation-4` via `prototype-v3/vercel.json` **redirects** (not rewrites — relative asset paths would 404, and `<base>` would break local dev). `/animation-0` → `learning.html?loop=1`, which replays instead of advancing; without the param the journey is unchanged |
| Design tokens for animation | the orb behind the chat avatar, `assets/widget/orb-base.svg`: `#FAE8BF #C2D6E0 #8CC7E0 #6B9EBD #386B8F #26526B` |
| Chat widget research | `../docs/chat-widget-interaction-refinements.md` — ARIA live-region items explicitly declined by Geeky |
| Live / deploy | https://hiver-omni-onboarding.vercel.app · github.com/geekv30/hiver-omni-onboarding-prototype, branch `codex/onboarding-next-iteration`, Vercel root dir `prototype-v3` |

## Session log
### 2026-08-31 (pm) · step chain, then four animation studies published as routes
**Did:** Replaced `learning.html`'s single swapping caption with a persistent step chain (all six steps on screen, determinate per-step ring, mid-step detail line, links drawn between markers) — Geeky kept it. Then four standalone studies of the 30s agent-creation wait, all live at `/animation-0`…`/animation-4` and listed on the hub. `/animation-4` is the strongest brief-fit: research showed the most-copied B2B pattern of 2026 is *showing the product working* (Linear, Attio) and the dominant visual language is kinetic typography, so it is one standing sentence rewriting its own subject, decoded with GSAP ScrambleText.
**Mistakes:** Built a luminous orb with orbiting particles — rejected as "are we a planetarium company," deleted whole. Before that, darkened the wave to near-black so white particles would read, burying the brand's hero visual. Also boxed an animation inside the two-pane layout when a standalone full-bleed piece was wanted. Now rules 2 and 3.
**Open / next:** `learning.html` still shows its right-side metrics column — Geeky asked for it removed and the steps aligned to the header; done in the studies, **not** in the shipping screen. Geeky has not picked a winner among the five routes.

### 2026-08-31 (am) · invite.html right-pane
**Did:** `invite.html`'s right pane is now byte-for-byte `index.html`'s video + `hero-copy`/logo-wall block (Geeky's call — custom mockup dropped entirely). Deleted the unused `team-hero.png`/`team-mockup.png` and their CSS.
**Mistakes:** Flattened a Figma mockup into the pane's background, breaking the shared-backdrop contract; then diagnosed the resulting crop bug as a border-radius bug and guessed twice before pixel-measuring. Never asked "does Geeky just want step 1's asset here" until told. Now rule 8.
**Open / next:** Nothing open.

### Earlier
- **2026-08-29** — Split `prototype-v3` into hub + `journey-v1`/`journey-v2`; built `invite.html`; full chat-widget interaction rework and copy pass.
- **2026-08-28** — Built V2 step 1 (`index.html`) and step 2 (`agent.html`) against fresh Figma pulls.
- **2026-08-26** — Built prototype-v3 (6-screen V1 journey, Emil-style motion) and deployed it live.
