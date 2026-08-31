/*
  Agent creation, version 2 — the same ~30s of work, staged inside the journey's
  own two-pane frame instead of as a full-screen cutscene.

  Left pane carries the narration as real product UI: the house H1, a step chain
  aligned to the same 78px gutter as the heading and the Continue button, and a
  Continue that is disabled for the whole wait and lights up at the end, so the
  pause resolves into an action rather than a redirect.

  Right pane keeps the media card every other step shows — same video, same
  22px radius, same inset — with the constellation composited over it. The card
  already owns the `hero-media` view-transition name, so it carries in and out
  of the wait without a cut.

    ARRIVE    0.0 –  3.2s   the card the user was already looking at, one light
    GATHER    3.2 – 12.6s   motes stream in and settle into a loose halo
    CONNECT  12.6 – 20.4s   links form, clusters emerge, attention sweeps them
    CONVERGE 20.4 – 26.2s   spiral inflow; the chain finishes as it lands
    BLOOM    26.2 – 30.4s   collapse, two soft shells, the agent is named
*/

const STORAGE_KEY = "hiver-omni-knowledge-onboarding-v2";
const AGENT_NAME_KEY = "hiver-omni-agent-name-v2";

const TAU = Math.PI * 2;

const ACT = {
  gatherIn: [3200, 10200],
  cluster: [12600, 19200],
  converge: [20400, 26200],
  collapse: [26200, 28600],
  ring: [28200, 30400],
};

const BADGE_AT = 1400;
const LOCKUP_AT = 28800;
const READY_AT = 29200;
const END_AT = 33000;

/*
  No result metrics. A number beside each row put the evidence in a column of
  its own, far from the label it belonged to, and two of the six steps had
  nothing countable to report anyway — the asymmetry made the real numbers look
  like filler. The detail line does that job instead, in place.
*/
const STEPS = [
  { label: "Analyzing your site", detail: "Crawling {domain}", ms: 3500 },
  { label: "Importing your assets", detail: "Reading docs and PDFs", ms: 2700 },
  { label: "Learning your brand’s voice", detail: "Matching tone and phrasing", ms: 4400 },
  { label: "Mapping your help center", detail: "Grouping articles by topic", ms: 3400 },
  { label: "Grouping common questions", detail: "Finding repeat themes", ms: 4200 },
  { label: "Fine-tuning responses", detail: "Testing sample replies", ms: 2900 },
];

const CHAIN_START = 3000;
const BEAT = 420;
const DETAIL_AT = 0.48;
const SWAP_MS = 220;
const STAGGER = 55;

const MOTES = 112;

const CLUSTERS = [
  { at: -0.55, r: 1.0, share: 0.3 },
  { at: 0.75, r: 0.71, share: 0.22 },
  { at: 2.45, r: 0.94, share: 0.27 },
  { at: 4.15, r: 0.81, share: 0.21 },
];

const FREE_SHARE = 0.24;
const CHECK_PATH = "M1.5 6.3 4.6 9.4 10.5 2.6";

const canvas = document.querySelector("#aac2-canvas");
const ctx = canvas.getContext("2d", { alpha: true });
const list = document.querySelector("#aac2-steps");
const core = document.querySelector("#aac2-core");
const coreBadge = document.querySelector("#aac2-core-badge");
const lockup = document.querySelector("#aac2-lockup");
const agentName = document.querySelector("#aac2-agent-name");
const agentMeta = document.querySelector("#aac2-agent-meta");
const sourceLabel = document.querySelector("#aac2-source-label");
const form = document.querySelector("#aac2-form");
const continueButton = document.querySelector("#aac2-continue");

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const shouldAdvance = new URLSearchParams(window.location.search).get("next") === "agent";

/* ---------------------------------------------------------------- brand ---- */

function deriveBrand(raw) {
  const value = (raw || "").trim();
  if (!value) return { label: "your business", host: "", isApple: false };
  const host = value.replace(/^[a-z]+:\/\//i, "").split("/")[0].replace(/^www\./i, "");
  const parts = host.split(".").filter(Boolean);
  const key = parts.length >= 2 ? parts[parts.length - 2] : parts[0] || value;
  return {
    label: key.charAt(0).toUpperCase() + key.slice(1),
    host: host || value,
    isApple: key.toLowerCase() === "apple",
  };
}

const brand = deriveBrand(localStorage.getItem(STORAGE_KEY));

sourceLabel.textContent = brand.host ? `Learning from ${brand.host}` : "Learning from your website";
agentName.textContent = brand.host ? `${brand.label} Support` : "Your support agent";
agentMeta.textContent = "is ready to test";

// The badge is white here (it echoes the sources card on step 2), which is also
// the background every favicon in the wild is drawn for. The bundled Apple mark
// ships filled white, so it is inlined and recoloured rather than loaded through
// <img> — an <img> cannot inherit the badge's colour and would be invisible.
const APPLE_MARK =
  "M16.4918 10.7734C15.537 10.7734 14.059 9.68776 12.5025 9.727C10.449 9.75316 8.56559 10.9172 7.50615 12.7614C5.37418 16.463 6.95681 21.9302 9.03646 24.9385C10.0567 26.4034 11.26 28.0515 12.8557 27.9991C14.386 27.9337 14.9615 27.0051 16.8188 27.0051C18.663 27.0051 19.1862 27.9991 20.8081 27.9599C22.4561 27.9337 23.5025 26.4688 24.5096 24.9909C25.6737 23.2905 26.1576 21.6425 26.1838 21.5509C26.1445 21.5379 22.9793 20.3215 22.94 16.6592C22.9139 13.5985 25.4382 12.1336 25.5559 12.0682C24.1172 9.96243 21.9068 9.727 21.1351 9.67469C19.1208 9.51773 17.4335 10.7734 16.4918 10.7734ZM19.8925 7.68659C20.7427 6.66639 21.3051 5.24072 21.1481 3.82812C19.9317 3.88044 18.4668 4.63906 17.5905 5.65927C16.8057 6.56175 16.1256 8.01358 16.3087 9.40001C17.6559 9.50465 19.0423 8.7068 19.8925 7.68659Z";

function mountLogo() {
  const initial = document.createElement("span");
  initial.className = "aac2-core__initial";
  initial.textContent = (brand.label.charAt(0) || "?").toUpperCase();
  coreBadge.appendChild(initial);

  if (brand.isApple) {
    coreBadge.insertAdjacentHTML(
      "beforeend",
      `<svg viewBox="0 0 34 34" aria-hidden="true"><path d="${APPLE_MARK}" fill="currentColor" /></svg>`,
    );
    initial.hidden = true;
    return;
  }

  if (!brand.host) return;

  const img = document.createElement("img");
  img.alt = "";
  img.addEventListener("load", () => {
    // The favicon service answers 200 with a generic 16px globe for domains it
    // has never seen, so an error handler alone never fires.
    if (img.naturalWidth < 32) return img.remove();
    initial.hidden = true;
  });
  img.addEventListener("error", () => img.remove());
  img.src = `https://www.google.com/s2/favicons?domain=${encodeURIComponent(brand.host)}&sz=128`;
  coreBadge.appendChild(img);
}

mountLogo();

/* ----------------------------------------------------------------- maths ---- */

const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
const phase = (t, a, b) => clamp01((t - a) / (b - a));
const lerp = (a, b, k) => a + (b - a) * k;
const easeOutCubic = (k) => 1 - Math.pow(1 - k, 3);
const easeOutQuint = (k) => 1 - Math.pow(1 - k, 5);
const easeInOut = (k) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);
const rand = (seed) => {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
};

function flow(x, y, t) {
  const s = 0.0042;
  return [
    Math.sin(x * s + t * 0.00031) + Math.cos(y * s * 1.19 - t * 0.00024),
    Math.cos(x * s * 0.87 - t * 0.00027) + Math.sin(y * s + t * 0.00033),
  ];
}

/* ---------------------------------------------------------------- sprites --- */

function makeGlow(radius, rgb) {
  const c = document.createElement("canvas");
  c.width = c.height = radius * 2;
  const g = c.getContext("2d");
  const grad = g.createRadialGradient(radius, radius, 0, radius, radius, radius);
  grad.addColorStop(0, `rgba(${rgb},1)`);
  grad.addColorStop(0.16, `rgba(${rgb},0.5)`);
  grad.addColorStop(0.42, `rgba(${rgb},0.13)`);
  grad.addColorStop(1, `rgba(${rgb},0)`);
  g.fillStyle = grad;
  g.fillRect(0, 0, radius * 2, radius * 2);
  return c;
}

function makeShell(radius) {
  const c = document.createElement("canvas");
  c.width = c.height = radius * 2;
  const g = c.getContext("2d");
  const grad = g.createRadialGradient(radius, radius, 0, radius, radius, radius);
  grad.addColorStop(0, "rgba(168, 212, 255, 0)");
  grad.addColorStop(0.58, "rgba(168, 212, 255, 0)");
  grad.addColorStop(0.79, "rgba(168, 212, 255, 0.5)");
  grad.addColorStop(0.88, "rgba(190, 226, 255, 0.9)");
  grad.addColorStop(0.95, "rgba(168, 212, 255, 0.22)");
  grad.addColorStop(1, "rgba(168, 212, 255, 0)");
  g.fillStyle = grad;
  g.fillRect(0, 0, radius * 2, radius * 2);
  return c;
}

const moteGlow = makeGlow(64, "196, 222, 255");
const coreGlow = makeGlow(128, "150, 205, 255");
const shell = makeShell(256);

/* ------------------------------------------------------------------ field --- */

let w = 0;
let h = 0;
let cx = 0;
let cy = 0;
let fit = 1;

function resize() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  w = canvas.clientWidth;
  h = canvas.clientHeight;
  if (!w || !h) return;
  canvas.width = Math.round(w * dpr);
  canvas.height = Math.round(h * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  cx = w / 2;
  cy = h * 0.46;
  // The card is portrait-ish and much smaller than a full viewport, so the
  // composition scales off whichever axis is tighter.
  fit = Math.min(1, Math.min(w / 640, h / 700));
}

function pickCluster(roll) {
  if (roll < FREE_SHARE) return -1;
  let acc = FREE_SHARE;
  for (let i = 0; i < CLUSTERS.length; i += 1) {
    acc += CLUSTERS[i].share * (1 - FREE_SHARE);
    if (roll < acc) return i;
  }
  return CLUSTERS.length - 1;
}

let motes = [];

function seedMotes() {
  motes = [];
  for (let i = 0; i < MOTES; i += 1) {
    const s = i + 1;
    const r1 = rand(s * 1.7);
    const r2 = rand(s * 3.1);
    const r3 = rand(s * 5.9);
    const r4 = rand(s * 7.3);
    const r5 = rand(s * 11.1);

    const entryA = r1 * TAU;
    const z = 0.18 + r3 * 0.82;
    const haloR = 138 + r4 * 150;

    motes.push({
      cluster: pickCluster(r5),
      haloA: r2 * TAU + haloR * 0.0042,
      haloR,
      offA: r5 * TAU,
      offK: Math.sqrt(0.16 + r1 * 0.84),
      spin: (r2 - 0.5) * 0.5,
      z,
      core: 0.5 + z * 1.4,
      glow: 5 + z * 13,
      spawnAt: lerp(ACT.gatherIn[0], ACT.gatherIn[1], Math.pow(r3, 0.75)),
      x: Math.cos(entryA) * 800,
      y: Math.sin(entryA) * 800,
      vx: 0,
      vy: 0,
      alpha: 0,
      px: 0,
      py: 0,
      shown: 0,
    });
  }
}

resize();
seedMotes();
window.addEventListener("resize", () => {
  resize();
  if (prefersReducedMotion) renderStatic(clock);
});

/* --------------------------------------------------------------- geometry --- */

function clusterCentre(index, t) {
  const c = CLUSTERS[index];
  const a = c.at + t * 0.00007;
  return [Math.cos(a) * 188 * c.r * fit, Math.sin(a) * 188 * c.r * fit];
}

function targetFor(m, t, clusterP, convergeP, collapseP) {
  const haloA = m.haloA + t * 0.00006;
  const haloR = m.haloR * fit;
  let tx = Math.cos(haloA) * haloR;
  let ty = Math.sin(haloA) * haloR;

  if (clusterP > 0 && m.cluster >= 0) {
    const [ccx, ccy] = clusterCentre(m.cluster, t);
    const jitter = 88 * fit * m.offK;
    const ca = m.offA + t * 0.00013;
    const k = easeInOut(clusterP);
    tx = lerp(tx, ccx + Math.cos(ca) * jitter, k);
    ty = lerp(ty, ccy + Math.sin(ca) * jitter, k);
  }

  // Spiral inflow with a staggered departure, rather than clusters contracting
  // in place — contracting them piles every mote into the same few pixels,
  // which additive blending renders as a flat white splat.
  if (convergeP > 0) {
    const start = m.offK * 0.42;
    const travel = easeInOut(clamp01((convergeP - start) / (1 - start)));
    const ang = Math.atan2(ty, tx) + travel * 1.35 + m.spin;
    const rad = Math.hypot(tx, ty) * (1 - travel);
    tx = Math.cos(ang) * rad;
    ty = Math.sin(ang) * rad;
  }

  if (collapseP > 0) {
    const k = Math.pow(collapseP, 1.5);
    tx = lerp(tx, 0, k);
    ty = lerp(ty, 0, k);
  }

  return [tx, ty];
}

function attention(t) {
  const a = new Array(CLUSTERS.length + 1).fill(1);
  if (t < ACT.cluster[0] || t > ACT.converge[1]) return a;
  const span = 1900;
  const i = Math.floor((t - ACT.cluster[0]) / span) % CLUSTERS.length;
  a[i] = 1 + Math.sin((((t - ACT.cluster[0]) % span) / span) * Math.PI) * 0.85;
  return a;
}

const attnOf = (attn, cluster) => (cluster < 0 ? attn[attn.length - 1] : attn[cluster]);

/* ------------------------------------------------------------------ paint --- */

const ALPHA_BUCKETS = 6;

function draw(t) {
  if (!w || !h) return;
  const clusterP = phase(t, ACT.cluster[0], ACT.cluster[1]);
  const convergeP = phase(t, ACT.converge[0], ACT.converge[1]);
  const collapseP = phase(t, ACT.collapse[0], ACT.collapse[1]);
  const attn = attention(t);

  const camScale = prefersReducedMotion ? 1 : 1 + 0.05 * easeInOut(clamp01(t / END_AT));
  const camX = prefersReducedMotion ? 0 : Math.sin(t * 0.00007) * 8;
  const camY = prefersReducedMotion ? 0 : Math.cos(t * 0.00005) * 6;

  ctx.clearRect(0, 0, w, h);

  let arrived = 0;
  let absorbed = 0;
  for (const m of motes) {
    if (t >= m.spawnAt) arrived += 1;
    if (t >= m.spawnAt && Math.hypot(m.x, m.y) / fit < 96) absorbed += 1;
    m.px = cx + m.x * camScale + camX * (0.4 + m.z);
    m.py = cy + m.y * camScale + camY * (0.4 + m.z);
  }
  const arrivedK = arrived / MOTES;
  const absorbedK = absorbed / MOTES;

  ctx.globalCompositeOperation = "lighter";

  // Proximity IS the edge, so the web forms and dissolves for free as the motes
  // move. Alpha is bucketed so the whole graph costs six stroke calls.
  const linkReach = lerp(0, 118, easeOutCubic(phase(t, 8600, 14600))) * fit;
  const densityGuard = 1 - 0.3 * clusterP - 0.3 * easeInOut(convergeP);

  if (linkReach > 1 && collapseP < 0.92) {
    const paths = [];
    for (let b = 0; b < ALPHA_BUCKETS; b += 1) paths.push(new Path2D());
    const reach2 = linkReach * linkReach;
    const fade = (1 - collapseP) * densityGuard;

    for (let i = 0; i < MOTES; i += 1) {
      const a = motes[i];
      if (a.alpha < 0.04) continue;
      for (let j = i + 1; j < MOTES; j += 1) {
        const b = motes[j];
        if (b.alpha < 0.04) continue;
        const dx = a.px - b.px;
        const dy = a.py - b.py;
        const d2 = dx * dx + dy * dy;
        if (d2 > reach2) continue;
        const closeness = 1 - Math.sqrt(d2) / linkReach;
        const strength =
          Math.pow(closeness, 1.5) * Math.min(a.z, b.z) * Math.min(a.alpha, b.alpha) *
          Math.max(attnOf(attn, a.cluster), attnOf(attn, b.cluster)) * fade;
        if (strength < 0.02) continue;
        const p = paths[Math.min(ALPHA_BUCKETS - 1, Math.floor(strength * ALPHA_BUCKETS * 1.35))];
        p.moveTo(a.px, a.py);
        p.lineTo(b.px, b.py);
      }
    }

    ctx.lineWidth = 1;
    ctx.strokeStyle = "rgb(163, 203, 255)";
    for (let b = 0; b < ALPHA_BUCKETS; b += 1) {
      ctx.globalAlpha = 0.05 + (b / ALPHA_BUCKETS) * 0.34;
      ctx.stroke(paths[b]);
    }
  }

  const coreLift = 0.2 + arrivedK * 0.34 + clusterP * 0.3 + absorbedK * 0.5 + Math.pow(collapseP, 1.4) * 1.1;
  const coreSize = (30 + arrivedK * 20 + absorbedK * 30 + Math.pow(collapseP, 1.3) * 82) * fit * camScale;
  ctx.globalAlpha = Math.min(1, coreLift);
  ctx.drawImage(coreGlow, cx - coreSize, cy - coreSize, coreSize * 2, coreSize * 2);

  const hot = coreSize * 0.32;
  ctx.globalAlpha = Math.min(1, 0.34 + clusterP * 0.2 + collapseP * 0.6);
  ctx.drawImage(coreGlow, cx - hot, cy - hot, hot * 2, hot * 2);

  for (const m of motes) {
    if (m.alpha < 0.01) continue;
    const brightness = m.alpha * (0.5 + m.z * 0.5) * attnOf(attn, m.cluster) * densityGuard;
    const g = m.glow * fit * camScale * (1 - 0.3 * clusterP);
    ctx.globalAlpha = Math.min(1, brightness * 0.34);
    ctx.drawImage(moteGlow, m.px - g, m.py - g, g * 2, g * 2);
  }

  ctx.fillStyle = "rgb(232, 242, 255)";
  for (const m of motes) {
    if (m.alpha < 0.01) continue;
    ctx.globalAlpha = Math.min(1, m.alpha * (0.35 + m.z * 0.65) * densityGuard);
    ctx.beginPath();
    ctx.arc(m.px, m.py, m.core * fit * camScale, 0, TAU);
    ctx.fill();
  }

  for (const offset of [0, 520]) {
    const ringP = phase(t, ACT.ring[0] + offset, ACT.ring[1] + offset);
    if (ringP <= 0 || ringP >= 1) continue;
    const r = Math.max(1, easeOutQuint(ringP) * Math.max(w, h) * 0.55);
    ctx.globalAlpha = Math.pow(1 - ringP, 1.7) * (offset ? 0.3 : 0.5);
    ctx.drawImage(shell, cx - r, cy - r, r * 2, r * 2);
  }

  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = "source-over";
}

function step(t, dt) {
  const clusterP = phase(t, ACT.cluster[0], ACT.cluster[1]);
  const convergeP = phase(t, ACT.converge[0], ACT.converge[1]);
  const collapseP = phase(t, ACT.collapse[0], ACT.collapse[1]);

  const k = lerp(0.0022, 0.014, Math.max(convergeP, collapseP));
  const damp = Math.pow(0.86, dt / 16.67);
  const drift = (1 - collapseP) * (1 - convergeP * 0.6);

  for (const m of motes) {
    const born = t >= m.spawnAt;
    m.shown = clamp01(m.shown + (born ? dt / 1100 : 0));
    // Dissolve on arrival, so the core absorbs them instead of stacking them.
    const near = clamp01((Math.hypot(m.x, m.y) / fit - 24) / 72);
    m.alpha = easeOutCubic(m.shown) * (1 - Math.pow(collapseP, 2.2)) * near;
    if (!born) continue;

    const [tx, ty] = targetFor(m, t, clusterP, convergeP, collapseP);
    m.vx += (tx - m.x) * k;
    m.vy += (ty - m.y) * k;

    if (drift > 0.01) {
      const [fx, fy] = flow(m.x, m.y, t);
      m.vx += fx * 0.021 * drift * (0.5 + m.z);
      m.vy += fy * 0.021 * drift * (0.5 + m.z);
    }

    m.vx *= damp;
    m.vy *= damp;
    m.x += m.vx * (dt / 16.67);
    m.y += m.vy * (dt / 16.67);
  }
}

/* ------------------------------------------------------------- step chain --- */

function setLabelText(el, value) {
  el.textContent = value;
  el.dataset.text = value;
}

const resolveDetail = (d) => d.replace("{domain}", brand.host || "your site");

function buildStep(s, index) {
  const row = document.createElement("li");
  row.className = "aac2-step";
  row.dataset.state = "pending";
  row.style.setProperty("--stagger", `${index * (prefersReducedMotion ? 0 : STAGGER)}ms`);
  row.style.setProperty("--step-duration", `${s.ms}ms`);

  const marker = document.createElement("span");
  marker.className = "aac2-step__marker";
  marker.setAttribute("aria-hidden", "true");
  marker.innerHTML = `
    <span class="aac2-step__pending"></span>
    <span class="aac2-step__live">
      <svg class="aac2-step__ring" viewBox="0 0 16 16">
        <circle class="aac2-step__ring-track" cx="8" cy="8" r="6.2" />
        <circle class="aac2-step__ring-fill" cx="8" cy="8" r="6.2" />
      </svg>
      <span class="aac2-step__core"></span>
    </span>
    <span class="aac2-step__check">
      <svg viewBox="0 0 12 12">
        <path d="${CHECK_PATH}" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </span>
  `;

  const label = document.createElement("span");
  label.className = "aac2-step__label";
  const text = document.createElement("span");
  text.className = "aac2-step__label-text";
  setLabelText(text, s.label);
  label.appendChild(text);

  row.append(marker, label);
  return row;
}

const rows = STEPS.map(buildStep);
list.append(...rows);

// Measured after mounting: getTotalLength() is unreliable on a detached SVG.
rows.forEach((row) => {
  const path = row.querySelector(".aac2-step__check path");
  const length = Math.ceil(path.getTotalLength()) + 1;
  path.style.strokeDasharray = String(length);
  row.style.setProperty("--check-length", String(length));
});

function swapLabel(row, value) {
  const el = row.querySelector(".aac2-step__label-text");
  if (el.textContent === value) return;
  if (prefersReducedMotion) return setLabelText(el, value);
  el.classList.add("is-swapping");
  window.setTimeout(() => {
    setLabelText(el, value);
    el.classList.remove("is-swapping");
  }, SWAP_MS);
}

/*
  Cue table, built once from the authored durations so the chain and the canvas
  run off one clock and cannot drift.
*/
const CUES = [];
let cursor = CHAIN_START;
STEPS.forEach((s, i) => {
  CUES.push({ at: cursor, kind: "activate", index: i });
  CUES.push({ at: cursor + Math.round(s.ms * DETAIL_AT), kind: "detail", index: i });
  cursor += s.ms;
  CUES.push({ at: cursor, kind: "complete", index: i });
  cursor += BEAT;
});

let fired = 0;

function runCues(t) {
  core.dataset.visible = t >= BADGE_AT ? "true" : "false";

  while (fired < CUES.length && t >= CUES[fired].at) {
    const cue = CUES[fired];
    const row = rows[cue.index];
    if (cue.kind === "activate") row.dataset.state = "active";
    if (cue.kind === "detail") swapLabel(row, resolveDetail(STEPS[cue.index].detail));
    if (cue.kind === "complete") {
      swapLabel(row, STEPS[cue.index].label);
      row.dataset.state = "done";
      row.dataset.linked = "true";
    }
    fired += 1;
  }

  lockup.dataset.visible = t >= LOCKUP_AT ? "true" : "false";
  // The wait resolves into an action rather than a redirect.
  if (t >= READY_AT) continueButton.disabled = false;
}

/* ------------------------------------------------------------------ loop --- */

let clock = 0;
let last = 0;

function reset() {
  clock = 0;
  last = 0;
  fired = 0;
  continueButton.disabled = true;
  lockup.dataset.visible = "false";
  rows.forEach((row, i) => {
    row.dataset.state = "pending";
    delete row.dataset.linked;
    setLabelText(row.querySelector(".aac2-step__label-text"), STEPS[i].label);
  });
  seedMotes();
}

function frame(now) {
  if (!last) last = now;
  const dt = Math.min(48, now - last);
  last = now;
  clock += dt;

  step(clock, dt);
  runCues(clock);
  draw(clock);

  if (clock >= END_AT) {
    if (shouldAdvance) return void (window.location.href = "./agent.html");
    reset();
  }
  requestAnimationFrame(frame);
}

/*
  Reduced motion keeps the full duration and every cue, but repaints the field
  only when a cue changes — still compositions rather than a drifting one. The
  act structure survives; the vestibular load does not.
*/
function renderStatic(t) {
  const clusterP = phase(t, ACT.cluster[0], ACT.cluster[1]);
  const convergeP = phase(t, ACT.converge[0], ACT.converge[1]);
  const collapseP = phase(t, ACT.collapse[0], ACT.collapse[1]);
  for (const m of motes) {
    const born = t >= m.spawnAt;
    m.shown = born ? 1 : 0;
    const [tx, ty] = targetFor(m, t, clusterP, convergeP, collapseP);
    m.x = tx;
    m.y = ty;
    m.alpha = born ? (1 - Math.pow(collapseP, 2.2)) * clamp01((Math.hypot(tx, ty) / fit - 24) / 72) : 0;
  }
  draw(t);
}

function runStatic() {
  const marks = [0, BADGE_AT, ...CUES.map((c) => c.at), LOCKUP_AT, READY_AT]
    .sort((a, b) => a - b)
    .filter((v, i, arr) => i === 0 || v !== arr[i - 1]);

  marks.forEach((at) => {
    window.setTimeout(() => {
      clock = at;
      runCues(at);
      renderStatic(at);
    }, at);
  });
}

// The rows enter with the journey's standard opacity + rise + de-blur, staggered.
requestAnimationFrame(() => {
  rows.forEach((row) => {
    row.dataset.enter = "true";
  });
});

if (prefersReducedMotion) {
  runStatic();
} else {
  requestAnimationFrame(frame);
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  if (continueButton.disabled) return;
  localStorage.setItem(AGENT_NAME_KEY, localStorage.getItem(AGENT_NAME_KEY) || "");
  window.location.href = "./agent.html";
});

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") window.location.href = "./index.html";
  if (event.key === " " || event.key.toLowerCase() === "r") {
    event.preventDefault();
    reset();
    if (prefersReducedMotion) renderStatic(0);
  }
});
