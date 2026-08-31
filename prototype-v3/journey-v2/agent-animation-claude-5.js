/*
  Agent creation, as a ~30s five-act piece — variant 5.

  Byte-identical to agent-animation-claude.js today: this variant differs only
  in its ground, which is CSS. It is a copy rather than a shared file so that
  tuning one study can never silently retime another.

  The wait is real and unavoidable, so the animation has to earn it rather than
  fill it. The metaphor is literal: the company's knowledge arrives as scattered
  motes, finds itself, organises into clusters, then collapses into the agent.
  Five acts with different tempos — still, gathering, busiest, contracting, one
  exhale — because a single looping texture, however pretty, stops being
  interesting at about eight seconds.

    ARRIVE    0.0 –  3.2s   near-empty field, one point of light
    GATHER    3.2 – 12.6s   motes stream in and settle into a loose halo
    CONNECT  12.6 – 20.4s   links form, clusters emerge, attention sweeps them
    CONVERGE 20.4 – 26.2s   clusters contract toward the core
    BLOOM    26.2 – 30.6s   collapse, one soft ring, the agent resolves
*/

const STORAGE_KEY = "hiver-omni-knowledge-onboarding-v2";

const TAU = Math.PI * 2;
const DURATION = 30600;

const ACT = {
  gatherIn: [3200, 10200],
  cluster: [12600, 19200],
  converge: [20400, 26200],
  collapse: [26200, 28600],
  ring: [28200, 30400],
};

const NARRATION = [
  [600, "Connecting to {domain}"],
  [4200, "Reading your website"],
  [9000, "Importing your help center"],
  [14000, "Learning how you answer"],
  [18800, "Finding the patterns"],
  [23400, "Shaping your agent’s voice"],
];

// The company's mark is the seed the whole piece grows from, so it lands in the
// first act rather than arriving late — it answers "whose agent is this?" before
// anything else happens.
const BADGE_AT = 1400;
const FINALE_AT = 27400;

const MOTES = 148;

/*
  Vertical centre of the whole composition — the core, the halo it draws, the
  narration line and the finale all hang off this one number.

  It was 0.46 while an eyebrow sat at top: 44px: the label was absolutely
  positioned and so never part of the centred mass, but it filled the space the
  high placement left. With the eyebrow gone, measuring the ink at 1440x900 gave
  a 72px top gap against a 168px bottom one. 0.51 balances them at ~120 each.

  MUST stay in step with --bld-centre in the stylesheet: the badge is a DOM
  element positioned by CSS while its glow is painted by the canvas, and the
  piece only works because they sit on exactly the same point.
*/
const CENTRE = 0.51;

/*
  Four unequal clusters at irregular angles, not evenly-spaced ones. Even
  spacing reads as a diagram of an atom — the symmetry is the first thing the
  eye finds and it makes the piece look formula-generated. Angular gaps here are
  1.30 / 1.70 / 1.70 / 1.85 rad, and no two share a radius. Four rather than
  three because ~30 motes per cluster is the most that stays airy.
*/
const CLUSTERS = [
  { at: -0.55, r: 1.0, share: 0.3 },
  { at: 0.75, r: 0.71, share: 0.22 },
  { at: 2.45, r: 0.94, share: 0.27 },
  { at: 4.15, r: 0.81, share: 0.21 },
];

// A quarter of the motes never join a cluster. They stay out in the halo and
// bridge across it, which is what stops the graph looking like tidy islands.
const FREE_SHARE = 0.24;

const canvas = document.querySelector("#bld-canvas");
const ctx = canvas.getContext("2d", { alpha: true });
const grain = document.querySelector("#bld-grain");
const core = document.querySelector("#bld-core");
const coreBadge = document.querySelector("#bld-core-badge");
const line = document.querySelector("#bld-line");
const finale = document.querySelector("#bld-finale");
const subtitle = document.querySelector("#bld-subtitle");

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const params = new URLSearchParams(window.location.search);
const shouldAdvance = params.get("next") === "agent";

/* ---------------------------------------------------------------- brand ---- */

function deriveBrand(raw) {
  const value = (raw || "").trim();
  if (!value) return { label: "your business", host: "", isApple: false };
  let host = value.replace(/^[a-z]+:\/\//i, "").split("/")[0].replace(/^www\./i, "");
  const parts = host.split(".").filter(Boolean);
  const key = parts.length >= 2 ? parts[parts.length - 2] : parts[0] || value;
  return {
    label: key.charAt(0).toUpperCase() + key.slice(1),
    host: host || value,
    isApple: key.toLowerCase() === "apple",
  };
}

const brand = deriveBrand(localStorage.getItem(STORAGE_KEY));

// The mark sitting directly above this line is what turns the finale from a
// status message into the agent's identity. With no domain on record there is
// no name to give it, so it stays generic rather than reading "your business
// Support".
document.querySelector("#bld-agent-name").textContent = brand.host
  ? `${brand.label} Support`
  : "Your support agent";
subtitle.textContent = brand.host
  ? `Your AI agent, trained on ${brand.host}`
  : "Your AI agent is ready";

/*
  Logo resolution, best source first:
    1. a bundled mark, so the Apple demo needs no network at all
    2. the domain's own favicon, so any company typed on step 1 shows its real
       logo — worth it because a stakeholder demo lives or dies on that
    3. the initial on a tile, if both fail
  Every step degrades silently; the tile is always in the DOM underneath.
*/
function mountLogo() {
  const initial = document.createElement("span");
  initial.className = "bld__core-initial";
  initial.textContent = (brand.label.charAt(0) || "?").toUpperCase();
  coreBadge.appendChild(initial);

  const show = (src, minSize) => {
    const img = document.createElement("img");
    img.alt = "";
    img.addEventListener("load", () => {
      /*
        The favicon service answers 200 with a generic 16px globe for domains it
        has never seen, so an error handler alone never fires and every unknown
        company gets a blurry world icon. We asked for 128; anything that comes
        back small is that placeholder, and the initial tile is the better
        answer.
      */
      if (minSize && img.naturalWidth < minSize) {
        img.remove();
        return;
      }
      initial.hidden = true;
      coreBadge.dataset.logo = "true";
    });
    img.addEventListener("error", () => img.remove());
    img.src = src;
    coreBadge.appendChild(img);
  };

  if (brand.isApple) {
    show("./assets/favicon/apple-white.svg");
  } else if (brand.host) {
    show(`https://www.google.com/s2/favicons?domain=${encodeURIComponent(brand.host)}&sz=128`, 32);
  }
}

mountLogo();

/* ----------------------------------------------------------------- maths ---- */

const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
const phase = (t, a, b) => clamp01((t - a) / (b - a));
const lerp = (a, b, k) => a + (b - a) * k;
const easeOutCubic = (k) => 1 - Math.pow(1 - k, 3);
const easeOutQuint = (k) => 1 - Math.pow(1 - k, 5);
const easeInOut = (k) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);

// Cheap divergence-ish flow field. Real curl noise is lovely and unnecessary
// here: at these speeds the eye reads "organic drift", not the field's pedigree.
function flow(x, y, t) {
  const s = 0.0042;
  return [
    Math.sin(x * s + t * 0.00031) + Math.cos(y * s * 1.19 - t * 0.00024),
    Math.cos(x * s * 0.87 - t * 0.00027) + Math.sin(y * s + t * 0.00033),
  ];
}

/* ---------------------------------------------------------------- sprites --- */

// One pre-rendered radial sprite blitted per mote, rather than a per-frame
// createRadialGradient or ctx.shadowBlur. Both of those cost roughly an order
// of magnitude more for a result nobody can tell apart.
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

const moteGlow = makeGlow(64, "196, 222, 255");
const coreGlow = makeGlow(128, "150, 205, 255");

// The bloom drawn as a scaled shell sprite rather than ctx.stroke(): a stroked
// circle whose lineWidth shrinks as it grows reads as a hard geometric outline,
// where a gradient band scales its own softness with the radius and reads as
// light leaving the core.
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

const shell = makeShell(256);

function paintGrain(size = 128) {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const g = c.getContext("2d");
  const img = g.createImageData(size, size);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = 128 + (Math.random() - 0.5) * 210;
    img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
    img.data[i + 3] = 255;
  }
  g.putImageData(img, 0, 0);
  grain.style.backgroundImage = `url(${c.toDataURL()})`;
  grain.style.backgroundSize = `${size}px ${size}px`;
}

paintGrain();

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
  canvas.width = Math.round(w * dpr);
  canvas.height = Math.round(h * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  cx = w / 2;
  cy = h * CENTRE;
  // Composition is authored against a 1440x900 frame; scale the whole geometry
  // rather than letting the halo run off the edge of a laptop window.
  fit = Math.min(1, Math.min(w / 1180, h / 760));
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

const rand = (seed) => {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
};

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

    // Spiral bias: tying angle to radius gives the halo a faint organised
    // sweep instead of a uniformly random scatter.
    const haloR = 172 + r4 * 176;

    motes.push({
      cluster: pickCluster(r5),
      haloA: r2 * TAU + haloR * 0.0042,
      haloR,
      offA: r5 * TAU,
      offK: Math.sqrt(0.16 + r1 * 0.84),
      spin: (r2 - 0.5) * 0.5,
      z,
      core: 0.5 + z * 1.5,
      glow: 5 + z * 15,
      // Front motes arrive first: the field reads as filling toward the viewer.
      spawnAt: lerp(ACT.gatherIn[0], ACT.gatherIn[1], Math.pow(r3, 0.75)),
      x: Math.cos(entryA) * 900,
      y: Math.sin(entryA) * 900,
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
  return [Math.cos(a) * 226 * c.r * fit, Math.sin(a) * 226 * c.r * fit];
}

function targetFor(m, t, clusterP, convergeP, collapseP) {
  const haloA = m.haloA + t * 0.00006;
  const haloR = m.haloR * fit;
  let tx = Math.cos(haloA) * haloR;
  let ty = Math.sin(haloA) * haloR;

  if (clusterP > 0 && m.cluster >= 0) {
    const [ccx, ccy] = clusterCentre(m.cluster, t);
    /*
      104, not 62. Thirty additively-blended motes inside a 62px radius sum to
      flat white however low each one's alpha is — the only real fix is area.
      offK is sqrt-distributed so members spread evenly across the disc instead
      of crowding its centre.
    */
    const jitter = 104 * fit * m.offK;
    const ca = m.offA + t * 0.00013;
    const px = ccx + Math.cos(ca) * jitter;
    const py = ccy + Math.sin(ca) * jitter;
    const k = easeInOut(clusterP);
    tx = lerp(tx, px, k);
    ty = lerp(ty, py, k);
  }

  /*
    Convergence as a spiral inflow, not as three shrinking blobs. Contracting
    intact clusters piles every mote into the same few pixels, which additive
    blending renders as a flat white splat. Sending each mote down its own
    curved path, with a staggered departure, keeps them spread along the way in
    — and reads as knowledge being drawn into the agent rather than as groups
    getting smaller.
  */
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

// Sweeps a soft highlight from cluster to cluster during CONNECT, so the eye is
// given somewhere to go instead of scanning a uniformly busy field.
function attention(t) {
  const a = new Array(CLUSTERS.length + 1).fill(1);
  if (t < ACT.cluster[0] || t > ACT.converge[1]) return a;
  const span = 1900;
  const i = Math.floor((t - ACT.cluster[0]) / span) % CLUSTERS.length;
  const local = ((t - ACT.cluster[0]) % span) / span;
  a[i] = 1 + Math.sin(local * Math.PI) * 0.85;
  return a;
}

// Unclustered motes index past the end of the attention array.
const attnOf = (attn, cluster) => (cluster < 0 ? attn[attn.length - 1] : attn[cluster]);

/* ------------------------------------------------------------------ paint --- */

const ALPHA_BUCKETS = 6;

function draw(t) {
  const clusterP = phase(t, ACT.cluster[0], ACT.cluster[1]);
  const convergeP = phase(t, ACT.converge[0], ACT.converge[1]);
  const collapseP = phase(t, ACT.collapse[0], ACT.collapse[1]);
  const attn = attention(t);

  const camScale = prefersReducedMotion ? 1 : 1 + 0.055 * easeInOut(clamp01(t / DURATION));
  const camX = prefersReducedMotion ? 0 : Math.sin(t * 0.00007) * 10;
  const camY = prefersReducedMotion ? 0 : Math.cos(t * 0.00005) * 7;

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

  /* --- links ---------------------------------------------------------- */
  // No edge bookkeeping: proximity IS the edge, so the web forms and dissolves
  // for free as the motes move. Alpha is bucketed so the whole graph costs six
  // stroke calls instead of one per pair.
  // Reach opens from 8.6s so the halo already carries faint structure rather
  // than sitting as unstructured dots for four seconds.
  const linkReach = lerp(0, 132, easeOutCubic(phase(t, 8600, 14600))) * fit;

  /*
    Additive blending punishes density: as motes gather into clusters, every
    glow and every link inside one sums toward flat white and all structure is
    lost. Rather than measure local density per frame, back both off on the same
    curves that concentrate them.
  */
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
        const bucket = Math.min(ALPHA_BUCKETS - 1, Math.floor(strength * ALPHA_BUCKETS * 1.35));
        const p = paths[bucket];
        p.moveTo(a.px, a.py);
        p.lineTo(b.px, b.py);
      }
    }

    ctx.lineWidth = 1;
    for (let b = 0; b < ALPHA_BUCKETS; b += 1) {
      // Iteration 1 ran these at 0.018-0.118 and the web simply was not there.
      ctx.globalAlpha = 0.05 + (b / ALPHA_BUCKETS) * 0.34;
      ctx.strokeStyle = "rgb(163, 203, 255)";
      ctx.stroke(paths[b]);
    }
  }

  /* --- core ----------------------------------------------------------- */
  // The core is the agent — the point of the whole piece — so it has to stay the
  // brightest thing on screen even while three clusters are at their busiest.
  const coreLift = 0.2 + arrivedK * 0.34 + clusterP * 0.3 + absorbedK * 0.5 + Math.pow(collapseP, 1.4) * 1.1;
  const coreSize = (32 + arrivedK * 22 + absorbedK * 34 + Math.pow(collapseP, 1.3) * 88) * fit * camScale;
  ctx.globalAlpha = Math.min(1, coreLift);
  ctx.drawImage(coreGlow, cx - coreSize, cy - coreSize, coreSize * 2, coreSize * 2);

  const hot = coreSize * 0.32;
  ctx.globalAlpha = Math.min(1, 0.34 + clusterP * 0.2 + collapseP * 0.6);
  ctx.drawImage(coreGlow, cx - hot, cy - hot, hot * 2, hot * 2);

  /* --- motes ---------------------------------------------------------- */
  for (const m of motes) {
    if (m.alpha < 0.01) continue;
    const brightness = m.alpha * (0.5 + m.z * 0.5) * attnOf(attn, m.cluster) * densityGuard;
    // Shrink the halo too, not just its opacity: overlapping glows are what
    // actually saturates a cluster.
    const g = m.glow * fit * camScale * (1 - 0.3 * clusterP);
    ctx.globalAlpha = Math.min(1, brightness * 0.34);
    ctx.drawImage(moteGlow, m.px - g, m.py - g, g * 2, g * 2);
  }

  ctx.fillStyle = "rgb(232, 242, 255)";
  for (const m of motes) {
    if (m.alpha < 0.01) continue;
    ctx.globalAlpha = Math.min(1, m.alpha * (0.35 + m.z * 0.65) * densityGuard);
    const r = m.core * fit * camScale;
    ctx.beginPath();
    ctx.arc(m.px, m.py, r, 0, TAU);
    ctx.fill();
  }

  /* --- bloom ring ------------------------------------------------------ */
  // Two shells a few hundred ms apart: one alone reads as a shockwave, a pair
  // reads as light leaving the core.
  for (const offset of [0, 520]) {
    const ringP = phase(t, ACT.ring[0] + offset, ACT.ring[1] + offset);
    if (ringP <= 0 || ringP >= 1) continue;
    const r = Math.max(1, easeOutQuint(ringP) * Math.max(w, h) * 0.5);
    ctx.globalAlpha = Math.pow(1 - ringP, 1.7) * (offset ? 0.3 : 0.5);
    ctx.drawImage(shell, cx - r, cy - r, r * 2, r * 2);
  }

  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = "source-over";
}

/* ------------------------------------------------------------------- sim --- */

function step(t, dt) {
  const clusterP = phase(t, ACT.cluster[0], ACT.cluster[1]);
  const convergeP = phase(t, ACT.converge[0], ACT.converge[1]);
  const collapseP = phase(t, ACT.collapse[0], ACT.collapse[1]);

  // Spring stiffens as the piece contracts, so the collapse has real intent
  // while the earlier drift stays weightless.
  const k = lerp(0.0022, 0.014, Math.max(convergeP, collapseP));
  const damp = Math.pow(0.86, dt / 16.67);
  const drift = (1 - collapseP) * (1 - convergeP * 0.6);

  for (const m of motes) {
    const born = t >= m.spawnAt;
    m.shown = clamp01(m.shown + (born ? dt / 1100 : 0));
    // Dissolve on arrival. Without this the motes pile up at the centre and the
    // finale is a splat instead of an absorption.
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

/* ------------------------------------------------------------ narration --- */

let narrationIndex = -1;

function setLine(text) {
  const value = text.replace("{domain}", brand.host || "your site");
  if (line.textContent === value) return;
  if (prefersReducedMotion) {
    line.textContent = value;
    line.dataset.text = value;
    return;
  }
  line.classList.add("is-swapping");
  window.setTimeout(() => {
    line.textContent = value;
    line.dataset.text = value;
    line.classList.remove("is-swapping");
  }, 300);
}

let finaleShown = false;

function cues(t) {
  core.dataset.visible = t >= BADGE_AT ? "true" : "false";

  let next = -1;
  for (let i = 0; i < NARRATION.length; i += 1) {
    if (t >= NARRATION[i][0]) next = i;
  }
  if (next !== narrationIndex && next >= 0 && t < FINALE_AT) {
    narrationIndex = next;
    setLine(NARRATION[next][1]);
  }

  if (t >= FINALE_AT && !finaleShown) {
    finaleShown = true;
    finale.dataset.visible = "true";
    line.classList.add("is-swapping");
  }
}

/* ------------------------------------------------------------------ loop --- */

let clock = 0;
let last = 0;
let running = false;

function reset() {
  clock = 0;
  last = 0;
  narrationIndex = -1;
  finaleShown = false;
  finale.dataset.visible = "false";
  line.classList.remove("is-swapping");
  line.textContent = "";
  line.dataset.text = "";
  seedMotes();
}

function frame(now) {
  if (!running) return;
  if (!last) last = now;
  // Clamp so a backgrounded tab resumes instead of teleporting the whole field.
  const dt = Math.min(48, now - last);
  last = now;
  clock += dt;

  step(clock, dt);
  cues(clock);
  draw(clock);

  if (clock >= DURATION + 3200) {
    if (shouldAdvance) {
      window.location.href = "./agent.html";
      return;
    }
    reset();
  }
  requestAnimationFrame(frame);
}

/*
  Reduced motion gets the same 30s of narrated acts, but the field is repainted
  only when a cue changes — seven still compositions rather than a continuously
  drifting one. The act structure survives; the vestibular load does not.
*/
function renderStatic(t) {
  const clusterP = phase(t, ACT.cluster[0], ACT.cluster[1]);
  const convergeP = phase(t, ACT.converge[0], ACT.converge[1]);
  const collapseP = phase(t, ACT.collapse[0], ACT.collapse[1]);
  for (const m of motes) {
    const born = t >= m.spawnAt;
    m.shown = born ? 1 : 0;
    m.alpha = born ? 1 - Math.pow(collapseP, 2.2) : 0;
    const [tx, ty] = targetFor(m, t, clusterP, convergeP, collapseP);
    m.x = tx;
    m.y = ty;
  }
  draw(t);
}

function runStatic() {
  const marks = [0, ...NARRATION.map(([at]) => at), BADGE_AT, FINALE_AT, DURATION]
    .sort((a, b) => a - b)
    .filter((v, i, arr) => i === 0 || v !== arr[i - 1]);

  marks.forEach((at) => {
    window.setTimeout(() => {
      clock = at;
      cues(at);
      renderStatic(at);
    }, at);
  });

  if (shouldAdvance) {
    window.setTimeout(() => {
      window.location.href = "./agent.html";
    }, DURATION + 1800);
  }
}

if (prefersReducedMotion) {
  runStatic();
} else {
  running = true;
  requestAnimationFrame(frame);
}

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") window.location.href = "./index.html";
  // Handy while reviewing: replay without a reload.
  if (event.key === " " || event.key.toLowerCase() === "r") {
    event.preventDefault();
    reset();
    if (prefersReducedMotion) renderStatic(0);
  }
});
