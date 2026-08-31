// A view transition interrupted by the next navigation rejects with "Transition
// was skipped". Benign — the navigation still happens — but it surfaces as an
// uncaught error, so it is swallowed the same way the other steps do.
window.addEventListener("unhandledrejection", (event) => {
  if (event.reason && String(event.reason.message).includes("Transition was skipped")) {
    event.preventDefault();
  }
});

const STORAGE_KEY = "hiver-omni-knowledge-onboarding-v2";

const chip = document.querySelector("#source-chip");
const chipIcon = document.querySelector("#source-chip-icon");
const chipText = document.querySelector("#source-chip-text");
const stage = document.querySelector("#learning-stage");
const stepsCollapse = document.querySelector("#learning-caption-collapse");
const steps = document.querySelector("#learning-steps");
const stepsList = document.querySelector("#learning-steps-list");
const brandIcon = document.querySelector("#learning-brand-icon");
const brandIconResolved = document.querySelector("#learning-brand-icon-resolved");
const brandName = document.querySelector("#learning-brand-name");
const headingBuilding = document.querySelector("#learning-heading-building");
const headingReady = document.querySelector("#learning-heading-ready");

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Opt-in review mode (the /animation-0 route). Off by default, so the journey
// itself is untouched: this screen still advances to agent.html as it always has.
const REVIEW_LOOP = new URLSearchParams(window.location.search).get("loop") === "1";

/*
  The step chain replaces a single caption line that swapped six times. That
  version made the earlier work unrecoverable — by step 4 there was no way to
  see what step 1 had been. Every step is now on screen for the whole sequence.

  `detail` swaps in once, roughly mid-step, and is never persisted: the row
  snaps back to its canonical label the moment it completes. That doubles the
  number of "something just happened" beats across the wait, which is what
  makes a long wait read as work rather than as a stall.

  No result metrics: a number beside each row put the evidence in a column of
  its own, far from the label it belonged to, and two of the six steps had
  nothing countable to report anyway — the asymmetry made the real numbers
  look like filler. The detail line does that job instead, in place.

  Durations are hand-authored and uneven on purpose, including one short step.
  A metronome reads as a fake progress animation, which is exactly how the
  previous fixed 3700ms caption interval read.
*/
const STEPS = [
  { label: "Analyzing your site", detail: "Crawling {domain}", ms: 3400 },
  { label: "Importing your assets", detail: "Reading docs and PDFs", ms: 2200 },
  { label: "Learning your brand’s voice", detail: "Matching tone and phrasing", ms: 4200 },
  { label: "Mapping your help center", detail: "Grouping articles by topic", ms: 3300 },
  { label: "Grouping common questions", detail: "Finding repeat themes", ms: 4000 },
  { label: "Fine-tuning responses", detail: "Testing sample replies", ms: 2800 },
];

/*
  A repeat pass through the journey must not hold the user for another ~30s. The
  honest-span argument applies to the first viewing; the second time you are
  editing your answers, not learning what the product does, and with Back now
  landing on index.html a re-submit is a normal thing to do.

  Every beat is scaled by the same factor rather than clamped, so the uneven
  rhythm that makes this read as real work survives intact at a third of the
  length. The review route (/animation-0) is exempt in both directions: it
  reloads on purpose and must always show the full-length piece.
*/
const CHAIN_SEEN_KEY = "hiver-omni-learning-seen-v2";
let chainSeen = false;
try { chainSeen = sessionStorage.getItem(CHAIN_SEEN_KEY) === "1"; } catch {}
const PACE = chainSeen && !REVIEW_LOOP ? 0.45 : 1;
const paced = (ms) => Math.round(ms * PACE);
const STEP_MS = STEPS.map((step) => paced(step.ms));

// A breath between a step finishing and the next starting, so each completion
// lands instead of being rushed off the screen by the next row lighting up.
const BEAT = paced(prefersReducedMotion ? 200 : 420);
const DETAIL_AT = 0.48;
// Text swap — the label crossfading to its mid-step detail and back.
const SWAP_MS = 150;

/*
  Reduced motion drops the sweeps, shimmers and blurs (see styles.css) but does
  NOT compress the step durations on a first viewing: the honest span of visible
  work is the point of this screen, not the motion layered on top. Only the
  pre-roll shortens, since the chip no longer travels and there is nothing to
  watch during it. A repeat pass is scaled by PACE above, independently of this.
*/
const RAW_T = prefersReducedMotion
  ? { bob: 300, stageIn: 700, resolve: 1100, steps: 1500, firstStep: 2100, stagger: 0, readyIn: 400, hold: 1000 }
  : { bob: 1000, stageIn: 2200, resolve: 3000, steps: 3800, firstStep: 4600, stagger: 40, readyIn: 700, hold: 1300 };

// `stagger` is a per-item offset, not a beat in the arc — 6 rows x 40ms keeps
// the whole reveal inside ~240ms, so the last row never feels late. It is the
// one value here that must not scale with the pace.
const T = Object.fromEntries(
  Object.entries(RAW_T).map(([key, value]) => [key, key === "stagger" ? value : paced(value)]),
);

const CHECK_PATH = "M1.5 6.3 4.6 9.4 10.5 2.6";

function deriveBrand(rawDomain) {
  const value = (rawDomain || "").trim();
  if (!value) return { label: "your business", host: "", isApple: false };

  let host = value.replace(/^[a-z]+:\/\//i, "").split("/")[0];
  host = host.replace(/^www\./i, "");
  const parts = host.split(".").filter(Boolean);
  const key = parts.length >= 2 ? parts[parts.length - 2] : parts[0] || value;
  const label = key.charAt(0).toUpperCase() + key.slice(1);

  return { label, host: host || value, isApple: key.toLowerCase() === "apple" };
}

const domain = (localStorage.getItem(STORAGE_KEY) || "").trim();
if (domain) {
  chipText.textContent = domain;
  chipIcon.hidden = false;
  chip.dataset.state = "filled";
}

const brand = deriveBrand(domain);
brandName.textContent = brand.label;

function resolveDetail(detail) {
  return detail.replace("{domain}", brand.host || "your site");
}

function resolveBrandIcon() {
  if (brand.isApple) {
    const img = document.createElement("img");
    img.src = "./assets/favicon/apple-white.svg";
    img.alt = "";
    brandIconResolved.appendChild(img);
  } else {
    const initial = document.createElement("span");
    initial.className = "learning-brand-icon__initial";
    initial.textContent = brand.label.charAt(0) || "?";
    brandIconResolved.appendChild(initial);
  }
  brandIcon.dataset.resolved = "true";
}

// textContent and data-text move together so the shimmer's ::after copy can
// never drift from the line it is highlighting.
function setLabelText(el, value) {
  el.textContent = value;
  el.dataset.text = value;
}

function buildStep(step, index) {
  const row = document.createElement("li");
  row.className = "learning-step";
  row.dataset.state = "pending";
  row.style.setProperty("--stagger", `${index * T.stagger}ms`);
  row.style.setProperty("--step-duration", `${STEP_MS[index]}ms`);

  const marker = document.createElement("span");
  marker.className = "learning-step__marker";
  marker.setAttribute("aria-hidden", "true");
  marker.innerHTML = `
    <span class="learning-step__pending"></span>
    <span class="learning-step__live">
      <svg class="learning-step__ring" viewBox="0 0 16 16">
        <circle class="learning-step__ring-track" cx="8" cy="8" r="6.2" />
        <circle class="learning-step__ring-fill" cx="8" cy="8" r="6.2" />
      </svg>
      <span class="learning-step__core"></span>
    </span>
    <span class="learning-step__check">
      <svg viewBox="0 0 12 12">
        <path d="${CHECK_PATH}" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </span>
  `;

  const label = document.createElement("span");
  label.className = "learning-step__label";
  const labelText = document.createElement("span");
  labelText.className = "learning-step__label-text";
  setLabelText(labelText, step.label);
  label.appendChild(labelText);

  row.append(marker, label);
  return row;
}

const rows = STEPS.map(buildStep);
stepsList.append(...rows);

// Measured rather than guessed — too short and the stroke pre-reveals, too long
// and it appears to draw past its own end. Has to run after the rows are in the
// document: getTotalLength() is unreliable on a detached SVG.
rows.forEach((row) => {
  const path = row.querySelector(".learning-step__check path");
  const length = Math.ceil(path.getTotalLength()) + 1;
  path.style.strokeDasharray = String(length);
  row.style.setProperty("--check-length", String(length));
});

/*
  Pin the label column to the widest string it will ever hold — labels and
  mid-step details alike. Without this the column is sized by whatever text is
  currently in it, so a longer detail swapping in would shift the row's width
  and re-center the whole (fit-content) chain sideways mid-sequence.
*/
function sizeLabelColumn() {
  const sample = rows[0].querySelector(".learning-step__label-text");
  const cs = window.getComputedStyle(sample);
  const probe = document.createElement("span");
  probe.style.cssText = "position:absolute;visibility:hidden;white-space:nowrap";
  probe.style.fontFamily = cs.fontFamily;
  probe.style.fontSize = cs.fontSize;
  probe.style.fontWeight = cs.fontWeight;
  probe.style.letterSpacing = cs.letterSpacing;
  document.body.appendChild(probe);

  const widest = STEPS.reduce((max, step) => {
    for (const value of [step.label, resolveDetail(step.detail)]) {
      probe.textContent = value;
      max = Math.max(max, probe.getBoundingClientRect().width);
    }
    return max;
  }, 0);

  probe.remove();
  // +8px absorbs sub-pixel probe drift and keeps a little air between the
  // longest label and its result.
  steps.style.setProperty("--label-col", `${Math.ceil(widest) + 8}px`);
}

// Measured twice on purpose: the first pass runs against the fallback font
// (Hanken Grotesk is font-display: swap), which measures ~20px narrow and would
// leave the result column overlapping the longest label. The rows are not
// revealed until 3.8s, so the corrected pass is never visible.
sizeLabelColumn();
if (document.fonts && document.fonts.ready) {
  document.fonts.ready.then(sizeLabelColumn);
}

function swapLabel(row, value) {
  const el = row.querySelector(".learning-step__label-text");
  if (el.textContent === value) return;
  if (prefersReducedMotion) {
    setLabelText(el, value);
    return;
  }
  el.classList.add("is-swapping");
  window.setTimeout(() => {
    setLabelText(el, value);
    el.classList.remove("is-swapping");
  }, SWAP_MS);
}

/*
  How long the detail line is actually readable once it has finished swapping in
  and before it starts swapping back. Below about 400ms it registers as a flicker
  rather than as a second beat, which is worse than not showing it — so on a
  compressed pass the shortest steps keep their label and simply run.
*/
const MIN_DETAIL_LEGIBLE_MS = 400;
const detailIsLegible = (ms) => ms * (1 - DETAIL_AT) - SWAP_MS >= MIN_DETAIL_LEGIBLE_MS;

function activate(index) {
  const step = STEPS[index];
  const row = rows[index];
  const ms = STEP_MS[index];
  row.dataset.state = "active";

  if (detailIsLegible(ms)) {
    window.setTimeout(() => swapLabel(row, resolveDetail(step.detail)), Math.round(ms * DETAIL_AT));
  }
  window.setTimeout(() => complete(index), ms);
}

function complete(index) {
  const row = rows[index];
  swapLabel(row, STEPS[index].label);
  row.dataset.state = "done";
  // Draw the link on to the next step: the chain always terminates at the last
  // thing actually finished, which is what makes it a progress read as well as
  // a history — and why there is no separate bar or percentage anywhere.
  row.dataset.linked = "true";

  if (index + 1 < STEPS.length) {
    window.setTimeout(() => activate(index + 1), BEAT);
    return;
  }
  window.setTimeout(finish, T.readyIn);
}

function finish() {
  headingBuilding.dataset.active = "false";
  headingReady.dataset.active = "true";

  // Only a run that reached the end counts as seen, so leaving mid-chain still
  // replays it at full length.
  if (!REVIEW_LOOP) {
    try { sessionStorage.setItem(CHAIN_SEEN_KEY, "1"); } catch {}
  }

  /*
    The list is deliberately NOT collapsed here. A fully-checked chain sitting
    under "your agent is ready" is the payoff the whole wait was building
    toward, and throwing it away at that exact moment discards the evidence
    right when it is most persuasive. The cross-document view transition on
    .learning-heading carries it off screen, so there is no second exit
    animation competing with the navigation.
  */
  window.setTimeout(() => {
    // A full reload rather than an in-place reset: this file is a live journey
    // step, and replaying it by hand would mean unwinding row states, labels,
    // links, the chip and the heading — a lot of surface to get subtly wrong for
    // a review-only convenience.
    if (REVIEW_LOOP) return window.location.reload();
    /*
      replace(), not href: this screen is an interstitial, and leaving it in the
      history stack made Back from agent.html land here, replay the whole 30s
      chain, and then force the user forward to agent.html again — a trap with no
      way out but waiting it out. Replacing our own entry means Back from
      agent.html goes where the user expects, to index.html.
    */
    window.location.replace("./agent.html");
  }, T.hold);
}

function runSequence() {
  window.setTimeout(() => {
    chip.dataset.position = "up";
  }, T.bob);

  window.setTimeout(() => {
    chip.dataset.position = "hidden";
    stage.dataset.phase = "building";
  }, T.stageIn);

  window.setTimeout(resolveBrandIcon, T.resolve);

  // The container's own growth supplies the vertical motion; the rows only
  // fade and de-blur, staggered, so nothing travels twice.
  window.setTimeout(() => {
    stepsCollapse.dataset.visible = "true";
    rows.forEach((row) => {
      row.dataset.enter = "true";
    });
  }, T.steps);

  window.setTimeout(() => activate(0), T.firstStep);
}

runSequence();

// Backward moves replace rather than push, so retreating through the journey
// never grows the history stack — Back stays a reliable "one step back" instead
// of walking a lengthening chain of screens the user already left.
window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") window.location.replace("./index.html");
});
