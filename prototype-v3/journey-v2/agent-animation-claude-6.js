/*
  Study 6 — study 4's kinetic headline running inside study 2's journey frame.

  The motion is study 4's, unchanged in kind: one standing sentence whose subject
  keeps being rewritten while the crawler's real output runs underneath. What
  changes is where each half lives. In study 4 the evidence was a caption under
  the type; here the frame gives it a pane of its own, so the numbers become the
  screen's actual report and the headline is free to be the one big gesture.

  Nothing here is hand-rolled. GSAP went 100% free in 2025 including the plugins
  that used to be paid, so the decode is ScrambleTextPlugin and the finale is
  SplitText — both tuned to the brand rather than invented.
*/

const STORAGE_KEY = "hiver-omni-knowledge-onboarding-v2";
const AGENT_NAME_KEY = "hiver-omni-agent-name-v2";

const stem = document.querySelector("#aac6-stem");
const subject = document.querySelector("#aac6-subject");
const finale = document.querySelector("#aac6-finale");
const badge = document.querySelector("#aac6-badge");
const readyName = document.querySelector("#aac6-ready-name");
const sourceLabel = document.querySelector("#aac6-source-label");
const list = document.querySelector("#aac6-steps");
const form = document.querySelector("#aac6-form");
const continueButton = document.querySelector("#aac6-continue");

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
const host = brand.host || "your-site.com";

sourceLabel.textContent = brand.host ? `Learning from ${brand.host}` : "Learning from your website";
readyName.textContent = brand.host ? `${brand.label} Support` : "Your support agent";

// The badge is white (it echoes the sources card on step 2), which is also the
// background every favicon in the wild is drawn for. The bundled Apple mark
// ships filled white, so it is inlined and recoloured rather than loaded through
// <img> — an <img> cannot inherit the badge's colour and would be invisible.
const APPLE_MARK =
  "M16.4918 10.7734C15.537 10.7734 14.059 9.68776 12.5025 9.727C10.449 9.75316 8.56559 10.9172 7.50615 12.7614C5.37418 16.463 6.95681 21.9302 9.03646 24.9385C10.0567 26.4034 11.26 28.0515 12.8557 27.9991C14.386 27.9337 14.9615 27.0051 16.8188 27.0051C18.663 27.0051 19.1862 27.9991 20.8081 27.9599C22.4561 27.9337 23.5025 26.4688 24.5096 24.9909C25.6737 23.2905 26.1576 21.6425 26.1838 21.5509C26.1445 21.5379 22.9793 20.3215 22.94 16.6592C22.9139 13.5985 25.4382 12.1336 25.5559 12.0682C24.1172 9.96243 21.9068 9.727 21.1351 9.67469C19.1208 9.51773 17.4335 10.7734 16.4918 10.7734ZM19.8925 7.68659C20.7427 6.66639 21.3051 5.24072 21.1481 3.82812C19.9317 3.88044 18.4668 4.63906 17.5905 5.65927C16.8057 6.56175 16.1256 8.01358 16.3087 9.40001C17.6559 9.50465 19.0423 8.7068 19.8925 7.68659Z";

(function mountLogo() {
  const initial = document.createElement("span");
  initial.className = "aac6-finale__badge-initial";
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

/* ------------------------------------------------------------- the chain --- */

/*
  Study 2's chain, kept as it was: same six steps, same authored durations, same
  detail swap at 48% of each step. It is the coarsest of the three rates on this
  pane — the phase the build is in, where the URL is the page it is on right now
  and the counts are the running total.
*/
const STEPS = [
  { label: "Analyzing your site", detail: "Crawling {domain}", ms: 3500 },
  { label: "Importing your assets", detail: "Reading docs and PDFs", ms: 2700 },
  { label: "Learning your brand\u2019s voice", detail: "Matching tone and phrasing", ms: 4400 },
  { label: "Mapping your help center", detail: "Grouping articles by topic", ms: 3400 },
  { label: "Grouping common questions", detail: "Finding repeat themes", ms: 4200 },
  { label: "Fine-tuning responses", detail: "Testing sample replies", ms: 2900 },
];

const CHAIN_START = 3;
const BEAT = 0.42;
const DETAIL_AT = 0.48;
const SWAP_MS = 220;
const STAGGER = 55;
const CHECK_PATH = "M1.5 6.3 4.6 9.4 10.5 2.6";

const resolveDetail = (d) => d.replace("{domain}", brand.host || "your site");

function setLabelText(el, value) {
  el.textContent = value;
  el.dataset.text = value;
}

function buildStep(s, index) {
  const row = document.createElement("li");
  row.className = "aac6-step";
  row.dataset.state = "pending";
  row.style.setProperty("--stagger", `${index * (prefersReducedMotion ? 0 : STAGGER)}ms`);
  row.style.setProperty("--step-duration", `${s.ms}ms`);

  const marker = document.createElement("span");
  marker.className = "aac6-step__marker";
  marker.setAttribute("aria-hidden", "true");
  marker.innerHTML = `
    <span class="aac6-step__pending"></span>
    <span class="aac6-step__live">
      <svg class="aac6-step__ring" viewBox="0 0 16 16">
        <circle class="aac6-step__ring-track" cx="8" cy="8" r="6.2" />
        <circle class="aac6-step__ring-fill" cx="8" cy="8" r="6.2" />
      </svg>
      <span class="aac6-step__core"></span>
    </span>
    <span class="aac6-step__check">
      <svg viewBox="0 0 12 12">
        <path d="${CHECK_PATH}" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </span>
  `;

  const label = document.createElement("span");
  label.className = "aac6-step__label";
  const text = document.createElement("span");
  text.className = "aac6-step__label-text";
  setLabelText(text, s.label);
  label.appendChild(text);

  row.append(marker, label);
  return row;
}

const rows = STEPS.map(buildStep);
list.append(...rows);

// Measured after mounting: getTotalLength() is unreliable on a detached SVG.
rows.forEach((row) => {
  const path = row.querySelector(".aac6-step__check path");
  const length = Math.ceil(path.getTotalLength()) + 1;
  path.style.strokeDasharray = String(length);
  row.style.setProperty("--check-length", String(length));
});

let swapTimer = 0;

function swapLabel(row, value) {
  const el = row.querySelector(".aac6-step__label-text");
  if (el.textContent === value) return;
  if (prefersReducedMotion) return setLabelText(el, value);
  el.classList.add("is-swapping");
  swapTimer = window.setTimeout(() => {
    setLabelText(el, value);
    el.classList.remove("is-swapping");
  }, SWAP_MS);
}

// The rows enter with the journey's standard opacity + rise + de-blur, staggered.
requestAnimationFrame(() => {
  rows.forEach((row) => {
    row.dataset.enter = "true";
  });
});

/* ------------------------------------------------------------- the script -- */

/*
  Beats, in order. `stem` is the standing half; `subject` is the half that gets
  rewritten. Holding one stem across several subjects is what makes it read as a
  sentence being edited rather than a slideshow of captions.
*/
const BEATS = [
  { at: 0.8, stem: "Connecting to", subject: host, accent: true },
  { at: 4.2, stem: "Reading every page on", subject: host, accent: true },
  { at: 7.4, stem: "Reading", subject: "product documentation", accent: false },
  { at: 10.2, stem: "Reading", subject: "your help center", accent: false },
  { at: 13.0, stem: "Learning how you answer", subject: "billing questions", accent: true },
  { at: 15.8, stem: "Learning how you answer", subject: "refund requests", accent: true },
  { at: 18.4, stem: "Learning how you answer", subject: "shipping delays", accent: true },
  { at: 21.0, stem: "Learning how you answer", subject: "account access", accent: true },
  { at: 23.6, stem: "Drafting replies in", subject: "your brand voice", accent: false },
  { at: 26.4, stem: "Testing answers against", subject: "62 help articles", accent: false },
];

const DURATION = 30;
const FINALE_AT = 28.4;
const READY_AT = 29.2;

const hasGsap = typeof window.gsap !== "undefined";
if (hasGsap) {
  // ScrambleTextPlugin and SplitText are the paid-era plugins, free since 2025.
  gsap.registerPlugin(...[window.ScrambleTextPlugin, window.SplitText].filter(Boolean));
}

/*
  Lowercase letters only, no symbols. The plugin's default set throws in glyphs
  that read as a terminal being hacked; restricted to the alphabet it reads as a
  word resolving, which is the register this product wants.
*/
const CHARS = "abcdefghijklmnopqrstuvwxyz";

function setSubject(text, accent) {
  subject.dataset.accent = accent ? "true" : "false";
  if (!hasGsap || !window.ScrambleTextPlugin || prefersReducedMotion) {
    subject.textContent = text;
    return;
  }
  // Shorter than the plugin's comfortable default: at 0.9s with a long reveal
  // delay the word spends most of its beat unreadable, and this line is the one
  // carrying the meaning.
  gsap.to(subject, {
    duration: 0.72,
    ease: "none",
    scrambleText: { text, chars: CHARS, speed: 0.62, revealDelay: 0.1, tweenLength: false },
  });
}

function setStem(text) {
  if (stem.textContent === text) return;
  if (!hasGsap || prefersReducedMotion) {
    stem.textContent = text;
    return;
  }
  // The stem crossfades rather than scrambling — two lines decoding at once is
  // noise, and the stem is the half that is meant to feel stable.
  gsap.timeline()
    .to(stem, { duration: 0.22, opacity: 0, y: -8, filter: "blur(4px)", ease: "power2.out" })
    .add(() => (stem.textContent = text))
    .fromTo(stem, { opacity: 0, y: 8, filter: "blur(4px)" }, { duration: 0.34, opacity: 0.62, y: 0, filter: "blur(0px)", ease: "power2.out" });
}

/* ------------------------------------------------------------------ build -- */

let tl = null;

/*
  Everything the finale leaves behind. The counters, the dot and the button are
  set by callbacks rather than by tweens, so a restart does not rewind them —
  without this the next cycle opens on 128 pages, a green dot and an unlocked
  Continue, and only corrects itself 3.4s in.
*/
function resetState() {
  gsap.set(finale, { opacity: 0, y: 10 });
  gsap.set(stem, { opacity: 0.62, y: 0, filter: "blur(0px)" });
  stem.textContent = "Connecting to";
  subject.textContent = "";
  continueButton.disabled = true;

  window.clearTimeout(swapTimer);
  rows.forEach((row, i) => {
    row.dataset.state = "pending";
    delete row.dataset.linked;
    const el = row.querySelector(".aac6-step__label-text");
    el.classList.remove("is-swapping");
    setLabelText(el, STEPS[i].label);
  });
}

function build() {
  if (tl) tl.kill();
  resetState();

  tl = gsap.timeline({
    onComplete: () => {
      if (shouldAdvance) return void (window.location.href = "./agent.html");
      resetState();
      tl.restart(true);
    },
  });

  // The journey's one entrance gesture: opacity + rise + de-blur on --ease-out.
  // Aimed at the inner span, never .aac6-head — that box owns the centring
  // translate(-50%, -50%), and a tween on it bakes the percentage to pixels at
  // the height it happens to have on frame one.
  tl.from(".aac6-head__inner", { duration: 0.8, opacity: 0, y: 14, filter: "blur(6px)", ease: "power3.out" }, 0.3);

  /*
    The stem crossfade and the subject scramble must not overlap. Fired together
    there is a moment where the stem has faded out and the subject is still a
    run of random letters, so the whole headline is unreadable — which is the
    one thing a sentence-based piece cannot afford. When the stem actually
    changes the subject waits for it; when it does not, the subject goes at once.
  */
  BEATS.forEach((beat) => {
    tl.add(() => {
      const stemChanged = stem.textContent !== beat.stem;
      setStem(beat.stem);
      if (stemChanged && !prefersReducedMotion) {
        gsap.delayedCall(0.42, () => setSubject(beat.subject, beat.accent));
      } else {
        setSubject(beat.subject, beat.accent);
      }
    }, beat.at);
  });

  /*
    The chain runs on this same timeline rather than its own clock, so the phase
    on the left and the sentence on the right cannot drift apart over 30s. Cues
    are built from the authored durations, exactly as study 2 built them.
  */
  let cursor = CHAIN_START;
  STEPS.forEach((s, i) => {
    const row = rows[i];
    const at = cursor;
    tl.add(() => (row.dataset.state = "active"), at);
    tl.add(() => swapLabel(row, resolveDetail(s.detail)), at + s.ms * DETAIL_AT / 1000);
    cursor += s.ms / 1000;
    tl.add(() => {
      swapLabel(row, s.label);
      row.dataset.state = "done";
      row.dataset.linked = "true";
    }, cursor);
    cursor += BEAT;
  });

  tl.add(() => {
    setStem("Your agent is trained on");
    gsap.delayedCall(0.42, () => setSubject(host, true));
  }, FINALE_AT);

  tl.to(finale, { duration: 0.7, opacity: 1, y: 0, ease: "power3.out" }, FINALE_AT + 0.3);

  // SplitText earns its place on the one line that should land as a statement.
  if (window.SplitText && !prefersReducedMotion) {
    const split = new SplitText(readyName, { type: "chars" });
    tl.from(split.chars, { duration: 0.5, opacity: 0, y: 12, stagger: 0.02, ease: "power3.out" }, FINALE_AT + 0.45);
  }

  // The wait resolves into an action rather than a redirect.
  tl.add(() => (continueButton.disabled = false), READY_AT);

  tl.to({}, { duration: 1.4 }, DURATION);
}

function fallback() {
  // If the CDN is unreachable the page must still narrate the wait rather than
  // sitting on a single frozen sentence.
  let i = 0;
  const apply = () => {
    stem.textContent = BEATS[i].stem;
    subject.textContent = BEATS[i].subject;
    subject.dataset.accent = BEATS[i].accent ? "true" : "false";
  };
  apply();
  window.setInterval(() => {
    i = (i + 1) % BEATS.length;
    apply();
  }, 2800);
  rows.forEach((row) => {
    row.dataset.state = "done";
    row.dataset.linked = "true";
  });
  finale.style.opacity = "1";
  finale.style.transform = "translate(-50%, 0)";
  continueButton.disabled = false;
}

if (hasGsap) build();
else fallback();

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
    if (!tl) return;
    resetState();
    tl.restart(true);
  }
});
