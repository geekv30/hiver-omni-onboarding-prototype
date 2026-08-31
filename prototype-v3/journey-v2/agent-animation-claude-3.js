/*
  Agent-creation animation — theme studio.

  Standalone and full-bleed: the animation IS the screen. The wave stays exactly
  as the sibling steps show it; the marks are dark and multiply onto it rather
  than the ground being darkened to suit light marks, which is what buried it
  last time.

  Palette is the design system's own AI motif, lifted from the orb behind the
  chat avatar (assets/widget/orb-base.svg): sand, haze, sky, blue, deep, ink.
  Nothing invented.

  Four studies, switched with ?theme=:
    orb      the product's own orb is born, ringed by orbits knowledge rides in on
    ink      knowledge stains the silk — drops bloom, merge, then settle
    contour  organic contour lines accumulate into a map, then contract
    cards    the product's own surfaces drift in and stack into the agent

  All four run the same five acts and the same 30s clock, so only the language
  differs. ?t=0.5 halves the speed for inspection.
*/

const STORAGE_KEY = "hiver-omni-knowledge-onboarding-v2";
const TAU = Math.PI * 2;
const DURATION = 30000;

const ACT = {
  gather: [3200, 12600],
  connect: [12600, 20400],
  converge: [20400, 26200],
  bloom: [26200, 30000],
};

const NARRATION = [
  [600, "Connecting to {domain}"],
  [4200, "Reading your website"],
  [9000, "Importing your help center"],
  [14000, "Learning how you answer"],
  [18800, "Finding the patterns"],
  [23400, "Shaping your agent’s voice"],
];

const FINALE_AT = 27600;
const END_AT = 33000;

const PALETTE = {
  sand: [250, 232, 191],
  haze: [194, 214, 224],
  sky: [140, 199, 224],
  blue: [107, 158, 189],
  deep: [56, 107, 143],
  ink: [38, 82, 107],
};
const rgb = (c, a) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;

const params = new URLSearchParams(window.location.search);
const THEME = params.get("theme") || "orb";
const RATE = Math.max(0.1, Math.min(2, parseFloat(params.get("t")) || 1));

const inkCanvas = document.querySelector("#aac3-ink");
const litCanvas = document.querySelector("#aac3-lit");
const ink = inkCanvas.getContext("2d");
const lit = litCanvas.getContext("2d");
const coreBadge = document.querySelector("#aac3-core-badge");
const narration = document.querySelector("#aac3-narration");
const line = document.querySelector("#aac3-line");
const finale = document.querySelector("#aac3-finale");
const tag = document.querySelector("#aac3-tag");

tag.textContent = THEME;

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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
document.querySelector("#aac3-agent-name").textContent = brand.host ? `${brand.label} Support` : "Your support agent";
document.querySelector("#aac3-agent-meta").textContent = "is ready to test";

const APPLE_MARK =
  "M16.4918 10.7734C15.537 10.7734 14.059 9.68776 12.5025 9.727C10.449 9.75316 8.56559 10.9172 7.50615 12.7614C5.37418 16.463 6.95681 21.9302 9.03646 24.9385C10.0567 26.4034 11.26 28.0515 12.8557 27.9991C14.386 27.9337 14.9615 27.0051 16.8188 27.0051C18.663 27.0051 19.1862 27.9991 20.8081 27.9599C22.4561 27.9337 23.5025 26.4688 24.5096 24.9909C25.6737 23.2905 26.1576 21.6425 26.1838 21.5509C26.1445 21.5379 22.9793 20.3215 22.94 16.6592C22.9139 13.5985 25.4382 12.1336 25.5559 12.0682C24.1172 9.96243 21.9068 9.727 21.1351 9.67469C19.1208 9.51773 17.4335 10.7734 16.4918 10.7734ZM19.8925 7.68659C20.7427 6.66639 21.3051 5.24072 21.1481 3.82812C19.9317 3.88044 18.4668 4.63906 17.5905 5.65927C16.8057 6.56175 16.1256 8.01358 16.3087 9.40001C17.6559 9.50465 19.0423 8.7068 19.8925 7.68659Z";

(function mountLogo() {
  const initial = document.createElement("span");
  initial.className = "aac3-core__initial";
  initial.textContent = (brand.label.charAt(0) || "?").toUpperCase();
  coreBadge.appendChild(initial);

  if (brand.isApple) {
    coreBadge.insertAdjacentHTML("beforeend", `<svg viewBox="0 0 34 34" aria-hidden="true"><path d="${APPLE_MARK}" fill="currentColor"/></svg>`);
    initial.hidden = true;
    return;
  }
  if (!brand.host) return;

  const img = document.createElement("img");
  img.alt = "";
  // The favicon service answers 200 with a generic 16px globe for unknown
  // domains, so an error handler alone never fires.
  img.addEventListener("load", () => (img.naturalWidth < 32 ? img.remove() : (initial.hidden = true)));
  img.addEventListener("error", () => img.remove());
  img.src = `https://www.google.com/s2/favicons?domain=${encodeURIComponent(brand.host)}&sz=128`;
  coreBadge.appendChild(img);
})();

/* ----------------------------------------------------------------- maths ---- */

const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
const phase = (t, a, b) => clamp01((t - a) / (b - a));
const lerp = (a, b, k) => a + (b - a) * k;
const easeOutCubic = (k) => 1 - Math.pow(1 - k, 3);
const easeOutQuint = (k) => 1 - Math.pow(1 - k, 5);
const easeInOut = (k) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);
const rnd = (s) => {
  const x = Math.sin(s * 12.9898) * 43758.5453;
  return x - Math.floor(x);
};

const env = { w: 0, h: 0, cx: 0, cy: 0, fit: 1, dpr: 1 };

function resize() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const w = inkCanvas.clientWidth;
  const h = inkCanvas.clientHeight;
  if (!w || !h) return;
  for (const [c, x] of [[inkCanvas, ink], [litCanvas, lit]]) {
    c.width = Math.round(w * dpr);
    c.height = Math.round(h * dpr);
    x.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  env.w = w;
  env.h = h;
  env.cx = w / 2;
  env.cy = h / 2;
  env.dpr = dpr;
  // Authored against 1440x900; scale the whole composition rather than letting
  // it run off a smaller window.
  env.fit = Math.min(1.15, Math.min(w / 1280, h / 820));
  THEMES[THEME].seed();
}

/* ----------------------------------------------------------- theme: orb ---- */
/*
  The product already has an AI avatar — the orb behind every chat message. This
  study grows that same orb to hero scale: it is the agent, forming. Orbit rings
  are drawn on the ink layer so they stain the silk; knowledge rides in along
  them and is swallowed.
*/

let orbSprite = null;

function makeOrb(radius) {
  const c = document.createElement("canvas");
  c.width = c.height = radius * 2;
  const g = c.getContext("2d");
  // Off-centre highlight, exactly like orb-base.svg's gradientTransform.
  const grad = g.createRadialGradient(radius * 0.62, radius * 0.56, radius * 0.04, radius, radius, radius);
  grad.addColorStop(0, rgb(PALETTE.sand, 1));
  grad.addColorStop(0.24, rgb(PALETTE.haze, 1));
  grad.addColorStop(0.52, rgb(PALETTE.blue, 1));
  grad.addColorStop(0.8, rgb(PALETTE.deep, 1));
  // The rim feathers out instead of ending on a hard edge — a fully opaque
  // circle reads as a marble sitting on the wave rather than something forming
  // out of it.
  grad.addColorStop(0.94, rgb(PALETTE.ink, 0.88));
  grad.addColorStop(1, rgb(PALETTE.ink, 0));
  g.fillStyle = grad;
  g.beginPath();
  g.arc(radius, radius, radius, 0, TAU);
  g.fill();
  return c;
}

const orbState = { motes: [], frags: [] };

const themeOrb = {
  seed() {
    if (!orbSprite) orbSprite = makeOrb(320);
    orbState.motes = Array.from({ length: 54 }, (_, i) => {
      const s = i + 1;
      return {
        ring: i % 2,
        a: rnd(s * 1.7) * TAU,
        speed: (0.00016 + rnd(s * 2.3) * 0.00012) * (rnd(s * 5.1) > 0.5 ? 1 : -1),
        born: lerp(ACT.gather[0], ACT.gather[1], Math.pow(rnd(s * 3.7), 0.8)),
        r: 0.86 + rnd(s * 4.3) * 0.3,
        size: 1.5 + rnd(s * 6.1) * 1.7,
      };
    });

    /*
      Knowledge arrives as fragments of the product's own surfaces — the same
      white, 12px-radius, softly-shadowed cards the sources panel and the chat
      bubbles use. The abstract-particle studies were pretty but said nothing;
      these say "your pages and articles" without a word of copy, and they are
      opaque, so they read over both the white field and the blue fold.
    */
    orbState.frags = Array.from({ length: 36 }, (_, i) => {
      const s = i + 100;
      return {
        // Kept arriving well into the convergence, so the orb is still visibly
        // being fed rather than sitting alone for the last four seconds.
        born: lerp(2000, ACT.converge[0] + 1600, Math.pow(rnd(s * 1.3), 0.8)),
        travel: 4200 + rnd(s * 2.1) * 2600,
        a: rnd(s * 3.3) * TAU,
        // A tighter start band: from the far corners they read as stray UI
        // rather than as a stream heading somewhere.
        from: 0.46 + rnd(s * 4.1) * 0.3,
        rot: (rnd(s * 5.7) - 0.5) * 0.5,
        wide: rnd(s * 6.9) > 0.45,
        z: 0.5 + rnd(s * 8.1) * 0.5,
        lines: 2 + Math.floor(rnd(s * 9.3) * 2),
      };
    });
  },

  draw(t) {
    const { cx, cy, w, h, fit } = env;
    const base = Math.min(w, h);
    // Under reduced motion nothing travels or drifts: the orb still grows and
    // the narration still runs, but the orbiting motes and the incoming
    // fragments are dropped rather than merely slowed.
    const still = prefersReducedMotion;
    // Grown across almost the whole piece rather than reaching full size by
    // second four — the orb getting bigger IS the progress read.
    const grow = easeOutCubic(phase(t, 1000, 16000));
    const swell = easeOutCubic(phase(t, ACT.converge[0], ACT.bloom[1]));
    const radius = (30 + 116 * grow + 40 * swell) * fit;

    // A soft contact shadow on the ink layer grounds the orb in the silk.
    const halo = radius * 1.9;
    const hg = ink.createRadialGradient(cx, cy, radius * 0.7, cx, cy, halo);
    hg.addColorStop(0, rgb(PALETTE.deep, 0.16));
    hg.addColorStop(1, rgb(PALETTE.deep, 0));
    ink.fillStyle = hg;
    ink.fillRect(cx - halo, cy - halo, halo * 2, halo * 2);

    const rings = [
      { rx: 2.15, ry: 0.6, tilt: -0.34, from: 2400 },
      { rx: 1.82, ry: 1.14, tilt: 0.78, from: 7200 },
    ];

    ink.lineCap = "round";
    rings.forEach((ring, i) => {
      const drawn = easeInOut(phase(t, ring.from, ring.from + 3600));
      if (drawn <= 0) return;
      const fade = 1 - 0.42 * easeInOut(phase(t, ACT.converge[0], ACT.bloom[1]));
      ink.save();
      ink.translate(cx, cy);
      ink.rotate(ring.tilt + (still ? 0 : t * 0.000018 * (i % 2 ? -1 : 1)));
      ink.scale(radius * ring.rx, radius * ring.ry);
      ink.beginPath();
      ink.arc(0, 0, 1, -Math.PI / 2, -Math.PI / 2 + TAU * drawn);
      ink.restore();
      ink.strokeStyle = rgb(PALETTE.ink, 0.34 * fade);
      ink.lineWidth = 1.2;
      ink.stroke();
    });

    const pull = easeInOut(phase(t, ACT.converge[0], ACT.converge[1]));
    for (const m of orbState.motes) {
      if (still || t < m.born) continue;
      const ring = rings[m.ring];
      const appear = easeOutCubic(clamp01((t - m.born) / 900));
      const a = m.a + t * m.speed;
      const rr = radius * m.r * (1 - pull * 0.94);
      const x = Math.cos(a) * rr * ring.rx;
      const y = Math.sin(a) * rr * ring.ry;
      const rot = ring.tilt + t * 0.000018 * (m.ring % 2 ? -1 : 1);
      ink.globalAlpha = appear * (1 - pull * 0.85);
      ink.fillStyle = rgb(PALETTE.ink, 0.8);
      ink.beginPath();
      ink.arc(cx + x * Math.cos(rot) - y * Math.sin(rot), cy + x * Math.sin(rot) + y * Math.cos(rot), m.size * fit, 0, TAU);
      ink.fill();
    }
    ink.globalAlpha = 1;

    // Fragments travel in and are swallowed — they shrink and fade as they
    // reach the rim rather than sliding under the orb.
    for (const f of orbState.frags) {
      if (still || t < f.born) continue;
      const k = easeInOut(clamp01((t - f.born) / f.travel));
      const dist = lerp(base * f.from, radius * 0.42, k);
      const a = f.a + k * 0.9 + t * 0.00002;
      const x = cx + Math.cos(a) * dist;
      const y = cy + Math.sin(a) * dist * 0.82;
      const eaten = clamp01((dist - radius * 0.4) / (radius * 0.75));
      const appear = easeOutCubic(clamp01((t - f.born) / 900));
      const alpha = appear * eaten * (1 - swell * 0.4);
      if (alpha <= 0.015) continue;
      const scale = f.z * fit * lerp(1, 0.42, k);
      const cw = (f.wide ? 132 : 92) * scale;
      const ch = (f.wide ? 62 : 74) * scale;

      lit.save();
      lit.globalAlpha = alpha * (0.72 + f.z * 0.28);
      lit.translate(x, y);
      lit.rotate(f.rot * (1 - k * 0.6));
      lit.shadowColor = `rgba(38, 82, 107, ${0.26 * f.z})`;
      lit.shadowBlur = 30 * scale;
      lit.shadowOffsetY = 12 * scale;
      lit.fillStyle = "rgba(255,255,255,0.93)";
      roundRect(lit, -cw / 2, -ch / 2, cw, ch, 11 * scale);
      lit.fill();
      lit.shadowColor = "transparent";
      lit.fillStyle = rgb(PALETTE.sky, 0.75);
      roundRect(lit, -cw / 2 + 10 * scale, -ch / 2 + 10 * scale, 12 * scale, 12 * scale, 3.5 * scale);
      lit.fill();
      lit.fillStyle = rgb(PALETTE.haze, 0.95);
      for (let i = 0; i < f.lines; i += 1) {
        const lw = cw - 20 * scale - (i === f.lines - 1 ? 26 * scale : 0);
        roundRect(lit, -cw / 2 + 10 * scale, -ch / 2 + (30 + i * 12) * scale, lw, 4.5 * scale, 2 * scale);
        lit.fill();
      }
      lit.restore();
    }

    lit.save();
    lit.globalAlpha = easeOutCubic(phase(t, 700, 4200));
    lit.filter = `blur(${Math.max(0, 12 - 12 * easeOutCubic(phase(t, 700, 5200))).toFixed(2)}px)`;
    lit.drawImage(orbSprite, cx - radius, cy - radius, radius * 2, radius * 2);
    lit.restore();

    // The same three drifting blobs the chat orb carries.
    lit.save();
    lit.beginPath();
    lit.arc(cx, cy, radius * 0.97, 0, TAU);
    lit.clip();
    lit.globalCompositeOperation = "lighter";
    [[PALETTE.sand, 0.5, 0.00021], [PALETTE.sky, 0.4, -0.00017], [PALETTE.haze, 0.3, 0.00013]].forEach(([c, k, sp], i) => {
      const a = (still ? 6000 : t) * sp + i * 2.1;
      const bx = cx + Math.cos(a) * radius * 0.32;
      const by = cy + Math.sin(a * 1.3) * radius * 0.28;
      const br = radius * (0.46 + 0.08 * Math.sin((still ? 6000 : t) * 0.0004 + i));
      const g = lit.createRadialGradient(bx, by, 0, bx, by, br);
      g.addColorStop(0, rgb(c, k * 0.6));
      g.addColorStop(1, rgb(c, 0));
      lit.fillStyle = g;
      lit.fillRect(cx - radius, cy - radius, radius * 2, radius * 2);
    });
    lit.restore();

    const ringP = phase(t, 27200, 30000);
    if (ringP > 0 && ringP < 1) {
      const r = radius + easeOutQuint(ringP) * Math.max(w, h) * 0.4;
      ink.strokeStyle = rgb(PALETTE.deep, Math.pow(1 - ringP, 2) * 0.22);
      ink.lineWidth = 2 + (1 - ringP) * 24;
      ink.beginPath();
      ink.arc(cx, cy, r, 0, TAU);
      ink.stroke();
    }
  },
};

/* ----------------------------------------------------------- theme: ink ---- */
/*
  Knowledge as pigment dropped into the silk. Each source blooms where it lands,
  spreads, and drifts; as the piece progresses the drops land closer to centre
  until the stains overlap into one dense mass that resolves into the agent.
*/

const inkState = { drops: [] };

const themeInk = {
  seed() {
    inkState.drops = Array.from({ length: 46 }, (_, i) => {
      const s = i + 1;
      const born = lerp(1200, ACT.converge[0], Math.pow(rnd(s * 1.3), 0.9));
      // Later drops land closer in, so the field concentrates on its own.
      const spread = 1 - phase(born, 1200, ACT.converge[0]) * 0.62;
      return {
        born,
        a: rnd(s * 2.7) * TAU,
        d: (0.16 + rnd(s * 3.9) * 0.72) * spread,
        grow: 2600 + rnd(s * 5.3) * 2600,
        max: 0.1 + rnd(s * 7.1) * 0.16,
        drift: (rnd(s * 8.3) - 0.5) * 0.35,
        tone: rnd(s * 9.7),
      };
    });
  },

  draw(t) {
    const { cx, cy, w, h, fit } = env;
    const base = Math.min(w, h);
    const pull = easeInOut(phase(t, ACT.converge[0], ACT.converge[1]));
    const settle = easeInOut(phase(t, ACT.bloom[0], ACT.bloom[1]));

    for (const d of inkState.drops) {
      if (t < d.born) continue;
      const age = (t - d.born) / d.grow;
      const spread = easeOutCubic(clamp01(age));
      const dist = base * d.d * (1 - pull * 0.86) * (1 - settle * 0.5);
      const a = d.a + age * d.drift + t * 0.00002;
      const x = cx + Math.cos(a) * dist;
      const y = cy + Math.sin(a) * dist * 0.86;
      const r = base * d.max * (0.35 + spread * 0.65) * fit;
      // Stains fade slowly rather than vanishing — pigment does not un-spread.
      const alpha = clamp01(age * 2.4) * (1 - clamp01((age - 1.6) / 2.6)) * (1 - settle * 0.35);
      if (alpha <= 0.01) continue;

      const tone = d.tone < 0.62 ? PALETTE.deep : d.tone < 0.88 ? PALETTE.ink : PALETTE.blue;
      const g = ink.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, rgb(tone, 0.3 * alpha));
      g.addColorStop(0.42, rgb(tone, 0.13 * alpha));
      g.addColorStop(1, rgb(tone, 0));
      ink.fillStyle = g;
      ink.fillRect(x - r, y - r, r * 2, r * 2);
    }

    // The mass the drops resolve into.
    const massP = easeOutCubic(phase(t, ACT.converge[0], 29000));
    if (massP > 0) {
      const r = 190 * fit * (0.4 + massP * 0.6);
      const g = ink.createRadialGradient(cx, cy, 0, cx, cy, r);
      g.addColorStop(0, rgb(PALETTE.ink, 0.34 * massP));
      g.addColorStop(0.5, rgb(PALETTE.deep, 0.16 * massP));
      g.addColorStop(1, rgb(PALETTE.deep, 0));
      ink.fillStyle = g;
      ink.fillRect(cx - r, cy - r, r * 2, r * 2);
    }
  },
};

/* ------------------------------------------------------- theme: contour ---- */
/*
  A map being surveyed. Organic contour lines accumulate around the centre —
  each one a pass over the knowledge — until the field is dense, then they
  contract into a tight, calm set of rings around the agent.
*/

const contourState = { rings: [] };

const themeContour = {
  seed() {
    contourState.rings = Array.from({ length: 26 }, (_, i) => {
      const s = i + 1;
      return {
        born: lerp(1000, ACT.converge[0] - 800, i / 26),
        base: 0.06 + i * 0.032,
        wob: 0.05 + rnd(s * 2.1) * 0.1,
        lobes: 3 + Math.floor(rnd(s * 3.3) * 4),
        ph: rnd(s * 4.7) * TAU,
        spin: (rnd(s * 5.9) - 0.5) * 0.00004,
      };
    });
  },

  draw(t) {
    const { cx, cy, w, h, fit } = env;
    const base = Math.min(w, h) * 0.94 * fit;
    const pull = easeInOut(phase(t, ACT.converge[0], ACT.converge[1]));
    const settle = easeInOut(phase(t, ACT.bloom[0], ACT.bloom[1]));

    ink.lineWidth = 1;
    for (const ring of contourState.rings) {
      const on = easeOutCubic(phase(t, ring.born, ring.born + 1500));
      if (on <= 0) continue;
      const rad = base * ring.base * (1 - pull * 0.62) * (1 - settle * 0.22);
      const wob = ring.wob * (1 - pull * 0.75);
      const ph = ring.ph + t * ring.spin;

      ink.beginPath();
      for (let i = 0; i <= 96; i += 1) {
        const a = (i / 96) * TAU;
        // Two harmonics keep the line organic without ever self-intersecting.
        const k = 1 + Math.sin(a * ring.lobes + ph) * wob + Math.sin(a * (ring.lobes + 3) - ph * 0.7) * wob * 0.4;
        const x = cx + Math.cos(a) * rad * k;
        const y = cy + Math.sin(a) * rad * k * 0.9;
        if (i === 0) ink.moveTo(x, y);
        else ink.lineTo(x, y);
      }
      ink.closePath();
      ink.strokeStyle = rgb(PALETTE.ink, 0.2 * on * (1 - settle * 0.4));
      ink.stroke();
    }

    const glowP = easeOutCubic(phase(t, ACT.converge[0], 29200));
    if (glowP > 0) {
      const r = 150 * fit * glowP;
      const g = ink.createRadialGradient(cx, cy, 0, cx, cy, r);
      g.addColorStop(0, rgb(PALETTE.ink, 0.26 * glowP));
      g.addColorStop(1, rgb(PALETTE.ink, 0));
      ink.fillStyle = g;
      ink.fillRect(cx - r, cy - r, r * 2, r * 2);
    }
  },
};

/* --------------------------------------------------------- theme: cards ---- */
/*
  The most literal reading: the product's own surfaces — the sources card, chat
  bubbles, help articles — drift in from depth and stack into the agent. Uses
  the real component treatment (white, 16px radius, layered shadow) so it is
  unmistakably this product rather than generic motion design.
*/

const cardState = { cards: [] };

const themeCards = {
  seed() {
    cardState.cards = Array.from({ length: 22 }, (_, i) => {
      const s = i + 1;
      return {
        born: lerp(1400, ACT.connect[1], Math.pow(rnd(s * 1.9), 0.85)),
        a: rnd(s * 2.9) * TAU,
        d: 0.42 + rnd(s * 3.7) * 0.5,
        z: 0.34 + rnd(s * 4.9) * 0.66,
        rot: (rnd(s * 6.1) - 0.5) * 0.34,
        wide: rnd(s * 7.3) > 0.42,
        lines: 2 + Math.floor(rnd(s * 8.9) * 3),
      };
    });
  },

  draw(t) {
    const { cx, cy, w, h, fit } = env;
    const base = Math.min(w, h);
    const pull = easeInOut(phase(t, ACT.converge[0], ACT.converge[1]));
    const gone = easeInOut(phase(t, ACT.bloom[0], 29200));

    const sorted = [...cardState.cards].sort((a, b) => a.z - b.z);
    for (const c of sorted) {
      if (t < c.born) continue;
      const inP = easeOutCubic(clamp01((t - c.born) / 1800));
      const dist = base * c.d * (1 - pull * 0.9);
      const a = c.a + t * 0.000024;
      const x = cx + Math.cos(a) * dist;
      const y = cy + Math.sin(a) * dist * 0.78;
      const scale = c.z * fit * (0.6 + inP * 0.4) * (1 - gone * 0.5);
      const cw = (c.wide ? 168 : 116) * scale;
      const ch = (c.wide ? 78 : 96) * scale;
      const alpha = inP * (1 - gone);
      if (alpha <= 0.01) continue;

      lit.save();
      lit.globalAlpha = alpha * (0.5 + c.z * 0.5);
      lit.translate(x, y);
      lit.rotate(c.rot * (1 - pull));
      lit.shadowColor = `rgba(38, 82, 107, ${0.24 * c.z})`;
      lit.shadowBlur = 34 * scale;
      lit.shadowOffsetY = 14 * scale;
      lit.fillStyle = `rgba(255,255,255,${0.9})`;
      roundRect(lit, -cw / 2, -ch / 2, cw, ch, 12 * scale);
      lit.fill();
      lit.shadowColor = "transparent";

      // Content: a mark chip plus a few text rules, so each card reads as a
      // document rather than a blank rectangle.
      lit.fillStyle = rgb(PALETTE.sky, 0.7);
      roundRect(lit, -cw / 2 + 12 * scale, -ch / 2 + 12 * scale, 14 * scale, 14 * scale, 4 * scale);
      lit.fill();
      lit.fillStyle = rgb(PALETTE.haze, 0.95);
      for (let i = 0; i < c.lines; i += 1) {
        const lw = cw - 24 * scale - (i === c.lines - 1 ? 34 * scale : 0);
        roundRect(lit, -cw / 2 + 12 * scale, -ch / 2 + (34 + i * 13) * scale, lw, 5 * scale, 2.5 * scale);
        lit.fill();
      }
      lit.restore();
    }

    const glowP = easeOutCubic(phase(t, ACT.converge[0], 29200));
    if (glowP > 0) {
      const r = 170 * fit * glowP;
      const g = ink.createRadialGradient(cx, cy, 0, cx, cy, r);
      g.addColorStop(0, rgb(PALETTE.ink, 0.24 * glowP));
      g.addColorStop(1, rgb(PALETTE.ink, 0));
      ink.fillStyle = g;
      ink.fillRect(cx - r, cy - r, r * 2, r * 2);
    }
  },
};

function roundRect(c, x, y, w, h, r) {
  c.beginPath();
  c.moveTo(x + r, y);
  c.arcTo(x + w, y, x + w, y + h, r);
  c.arcTo(x + w, y + h, x, y + h, r);
  c.arcTo(x, y + h, x, y, r);
  c.arcTo(x, y, x + w, y, r);
  c.closePath();
}

const THEMES = { orb: themeOrb, ink: themeInk, contour: themeContour, cards: themeCards };
if (!THEMES[THEME]) throw new Error(`unknown theme: ${THEME}`);

/* ------------------------------------------------------------- narration --- */

let cueIndex = -1;
let finaleShown = false;

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

function cues(t) {
  let next = -1;
  for (let i = 0; i < NARRATION.length; i += 1) if (t >= NARRATION[i][0]) next = i;
  if (next !== cueIndex && next >= 0 && t < FINALE_AT) {
    cueIndex = next;
    setLine(NARRATION[next][1]);
  }

  if (t >= FINALE_AT && !finaleShown) {
    finaleShown = true;
    finale.dataset.visible = "true";
    narration.dataset.visible = "false";
  }
}

/* ------------------------------------------------------------------ loop --- */

let clock = 0;
let last = 0;

function reset() {
  clock = 0;
  last = 0;
  cueIndex = -1;
  finaleShown = false;
  finale.dataset.visible = "false";
  narration.dataset.visible = "true";
  line.textContent = "";
  line.dataset.text = "";
  THEMES[THEME].seed();
}

function frame(now) {
  if (!last) last = now;
  const dt = Math.min(48, now - last) * RATE;
  last = now;
  clock += dt;

  if (env.w) {
    ink.clearRect(0, 0, env.w, env.h);
    lit.clearRect(0, 0, env.w, env.h);
    THEMES[THEME].draw(clock);
  }
  cues(clock);

  if (clock >= END_AT) reset();
  requestAnimationFrame(frame);
}

resize();
window.addEventListener("resize", resize);
requestAnimationFrame(frame);

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") window.location.href = "./index.html";
  if (event.key === " " || event.key.toLowerCase() === "r") {
    event.preventDefault();
    reset();
  }
});
