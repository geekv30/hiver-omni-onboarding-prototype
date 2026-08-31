/*
  Indexing your knowledge base — the 30s agent-creation wait, shown as the work
  itself rather than as an illustration of it.

  A crawler really is running for those thirty seconds, so the screen is the
  crawler: URLs resolve one at a time, topics are discovered and counted, three
  figures tick up, and the panel finishes as the agent's knowledge base. Every
  element is an artifact the product would genuinely produce, which is what
  makes the wait read as work rather than as decoration.

  No canvas, no particles. One product surface assembling itself, using the
  journey's own tokens.
*/

const STORAGE_KEY = "hiver-omni-knowledge-onboarding-v2";

const DURATION = 30000;
const END_AT = 33500;

const PANEL_AT = 300;
const CRAWL_AT = 1500;
const ROW_EVERY = 830;
const ROW_RESOLVE = 900;
const TOPICS_AT = 7600;
const CHIP_EVERY = 1500;
const STATS_FROM = 3000;
const STATS_TO = 26800;
const FINISH_AT = 27200;
const READY_AT = 28600;

// Paths a support crawler would actually walk. Rendered against the customer's
// own domain so the feed reads as their site, not a stock list.
const PATHS = [
  "/", "/support", "/support/contact", "/help/getting-started",
  "/support/billing", "/help/account", "/docs/setup", "/support/shipping",
  "/support/returns", "/help/orders", "/docs/troubleshooting", "/faq",
  "/support/warranty", "/help/payments", "/docs/integrations", "/support/privacy",
  "/help/security", "/docs/api", "/support/refunds", "/help/notifications",
  "/docs/webhooks", "/support/status", "/help/billing-cycle", "/docs/limits",
  "/support/cancel", "/help/upgrade", "/docs/sso", "/support/data-export",
];

const TOPICS = [
  ["Billing & payments", 24],
  ["Returns & refunds", 18],
  ["Shipping & delivery", 21],
  ["Account access", 16],
  ["Setup & install", 27],
  ["Troubleshooting", 31],
  ["Warranty & repairs", 12],
  ["Order status", 14],
];

const TOTALS = { pages: 128, articles: 62, topics: TOPICS.length };

const NOTES = [
  [CRAWL_AT, "Reading your website"],
  [9000, "Importing your help center"],
  [15000, "Learning how you answer"],
  [21000, "Grouping common questions"],
  [25200, "Fine-tuning responses"],
];

const panel = document.querySelector("#ix-panel");
const badge = document.querySelector("#ix-badge");
const domainEl = document.querySelector("#ix-domain");
const status = document.querySelector("#ix-status");
const statusText = document.querySelector("#ix-status-text");
const bar = document.querySelector("#ix-bar");
const logList = document.querySelector("#ix-log-list");
const chipsWrap = document.querySelector("#ix-chips");
const note = document.querySelector("#ix-note");
const ready = document.querySelector("#ix-ready");
const readyName = document.querySelector("#ix-ready-name");
const statEls = {
  pages: document.querySelector("#ix-pages"),
  articles: document.querySelector("#ix-articles"),
  topics: document.querySelector("#ix-topics"),
};

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
const host = brand.host || "your-site.com";
domainEl.textContent = host;
readyName.textContent = brand.host ? `${brand.label} Support` : "Your support agent";

const APPLE_MARK =
  "M16.4918 10.7734C15.537 10.7734 14.059 9.68776 12.5025 9.727C10.449 9.75316 8.56559 10.9172 7.50615 12.7614C5.37418 16.463 6.95681 21.9302 9.03646 24.9385C10.0567 26.4034 11.26 28.0515 12.8557 27.9991C14.386 27.9337 14.9615 27.0051 16.8188 27.0051C18.663 27.0051 19.1862 27.9991 20.8081 27.9599C22.4561 27.9337 23.5025 26.4688 24.5096 24.9909C25.6737 23.2905 26.1576 21.6425 26.1838 21.5509C26.1445 21.5379 22.9793 20.3215 22.94 16.6592C22.9139 13.5985 25.4382 12.1336 25.5559 12.0682C24.1172 9.96243 21.9068 9.727 21.1351 9.67469C19.1208 9.51773 17.4335 10.7734 16.4918 10.7734ZM19.8925 7.68659C20.7427 6.66639 21.3051 5.24072 21.1481 3.82812C19.9317 3.88044 18.4668 4.63906 17.5905 5.65927C16.8057 6.56175 16.1256 8.01358 16.3087 9.40001C17.6559 9.50465 19.0423 8.7068 19.8925 7.68659Z";

(function mountLogo() {
  const initial = document.createElement("span");
  initial.className = "ix-badge__initial";
  initial.textContent = (brand.label.charAt(0) || "?").toUpperCase();
  badge.appendChild(initial);

  if (brand.isApple) {
    badge.insertAdjacentHTML("beforeend", `<svg viewBox="0 0 34 34" aria-hidden="true"><path d="${APPLE_MARK}" fill="currentColor"/></svg>`);
    initial.hidden = true;
    return;
  }
  if (!brand.host) return;

  const img = document.createElement("img");
  img.alt = "";
  // The favicon service answers 200 with a generic 16px globe for domains it has
  // never seen, so an error handler alone never fires.
  img.addEventListener("load", () => (img.naturalWidth < 32 ? img.remove() : (initial.hidden = true)));
  img.addEventListener("error", () => img.remove());
  img.src = `https://www.google.com/s2/favicons?domain=${encodeURIComponent(brand.host)}&sz=128`;
  badge.appendChild(img);
})();

/* ------------------------------------------------------------------ build -- */

const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
const easeOut = (k) => 1 - Math.pow(1 - k, 3);

const ROW_H = 28;
const WINDOW_ROWS = 6;

const GLOBE =
  "M2 12h20M2 12c0 5.523 4.477 10 10 10M2 12C2 6.477 6.477 2 12 2m10 10c0 5.523-4.477 10-10 10m10-10c0-5.523-4.477-10-10-10";

function buildRow(path, i) {
  const li = document.createElement("li");
  li.className = "ix-row";
  li.dataset.state = "fetch";
  // A deterministic but uneven page count per URL — a constant would read as a
  // template, and random-per-frame would flicker.
  const pages = 2 + ((i * 7) % 9);
  li.innerHTML = `
    <span class="ix-row__mark" aria-hidden="true">
      <svg class="ix-row__spin" viewBox="0 0 14 14" fill="none">
        <circle cx="7" cy="7" r="5.2" stroke="currentColor" stroke-width="1.5" stroke-opacity="0.25"/>
        <path d="M7 1.8a5.2 5.2 0 0 1 5.2 5.2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      </svg>
      <svg class="ix-row__tick" viewBox="0 0 14 14" fill="none">
        <path d="M2.6 7.3 5.6 10.3 11.4 3.9" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </span>
    <span class="ix-row__url"></span>
    <span class="ix-row__meta">${pages} ${pages === 1 ? "page" : "pages"}</span>
  `;
  li.querySelector(".ix-row__url").textContent = host + path;
  return li;
}

function buildChip([label, n]) {
  const el = document.createElement("span");
  el.className = "ix-chip";
  el.innerHTML = `<span></span><span class="ix-chip__n">${n}</span>`;
  el.firstChild.textContent = label;
  return el;
}

const rows = PATHS.map(buildRow);
const chips = TOPICS.map(buildChip);
logList.append(...rows);
chipsWrap.append(...chips);

/*
  One cue table, built up front. Rows appear, resolve one beat later, and the
  window scrolls once there are more than six — so the feed is always moving
  without the panel ever changing height.
*/
const CUES = [];
CUES.push({ at: PANEL_AT, run: () => (panel.dataset.in = "true") });
CUES.push({ at: 900, run: () => setStatus("run", "Indexing") });

rows.forEach((row, i) => {
  const at = CRAWL_AT + i * ROW_EVERY;
  CUES.push({
    at,
    run: () => {
      row.dataset.in = "true";
      const shift = Math.max(0, i + 1 - WINDOW_ROWS) * ROW_H;
      logList.style.transform = `translateY(${-shift}px)`;
    },
  });
  CUES.push({ at: at + ROW_RESOLVE, run: () => (row.dataset.state = "done") });
});

chips.forEach((chip, i) => {
  CUES.push({ at: TOPICS_AT + i * CHIP_EVERY, run: () => (chip.dataset.in = "true") });
});

NOTES.forEach(([at, text]) => CUES.push({ at, run: () => setNote(text) }));

CUES.push({
  at: FINISH_AT,
  run: () => {
    setStatus("run", "Finishing");
    setNote("Ready to test");
  },
});
CUES.push({
  at: READY_AT,
  run: () => {
    setStatus("done", "Ready");
    ready.dataset.in = "true";
  },
});

CUES.sort((a, b) => a.at - b.at);

function setStatus(state, text) {
  status.dataset.state = state;
  statusText.textContent = text;
}

function setNote(text) {
  if (note.textContent === text) return;
  if (prefersReducedMotion) return void (note.textContent = text);
  note.classList.add("is-swapping");
  window.setTimeout(() => {
    note.textContent = text;
    note.classList.remove("is-swapping");
  }, 220);
}

/* ------------------------------------------------------------------- loop -- */

let clock = 0;
let last = 0;
let fired = 0;

function tick(t) {
  while (fired < CUES.length && t >= CUES[fired].at) CUES[fired++].run();

  // The bar tracks the crawl, not the wall clock, so it can never sit ahead of
  // the feed it is meant to describe.
  const progress = easeOut(clamp01((t - CRAWL_AT) / (FINISH_AT - CRAWL_AT)));
  bar.style.transform = `scaleX(${progress})`;

  const k = easeOut(clamp01((t - STATS_FROM) / (STATS_TO - STATS_FROM)));
  statEls.pages.textContent = Math.round(TOTALS.pages * k);
  statEls.articles.textContent = Math.round(TOTALS.articles * k);
  statEls.topics.textContent = Math.round(TOTALS.topics * k);
}

function reset() {
  clock = 0;
  last = 0;
  fired = 0;
  panel.dataset.in = "false";
  ready.dataset.in = "false";
  logList.style.transform = "translateY(0)";
  setStatus("idle", "Connecting");
  note.textContent = "Reading your website";
  rows.forEach((row) => {
    row.dataset.in = "false";
    row.dataset.state = "fetch";
  });
  chips.forEach((chip) => (chip.dataset.in = "false"));
}

function frame(now) {
  if (!last) last = now;
  clock += Math.min(48, now - last);
  last = now;
  tick(clock);
  if (clock >= END_AT) reset();
  requestAnimationFrame(frame);
}

reset();
requestAnimationFrame(frame);

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") window.location.href = "./index.html";
  if (event.key === " " || event.key.toLowerCase() === "r") {
    event.preventDefault();
    reset();
  }
});
