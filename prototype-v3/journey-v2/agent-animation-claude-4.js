/*
  Kinetic headline study — the 30s agent-creation wait as one standing sentence
  that keeps being rewritten, with the crawler's real output underneath.

  Theme chosen from research, not taste. The most-copied B2B SaaS pattern of 2026
  is showing the product actually working (Linear's hero runs a Codex agent on a
  real issue; Attio runs "Ask Attio" live), and the dominant visual language on
  the award sites is kinetic typography — Linear's headline swaps words in and
  out of a standing sentence. This is those two things at once.

  The motion is not hand-rolled. GSAP went 100% free in 2025, plugins included,
  so the decode is ScrambleTextPlugin and the finale is SplitText. The work here
  is tuning them to the brand: our easing, our accent, our tracking, and a
  character set that reads as text being resolved rather than as a hacker movie.
*/

const STORAGE_KEY = "hiver-omni-knowledge-onboarding-v2";

const stem = document.querySelector("#kt-stem");
const subject = document.querySelector("#kt-subject");
const eyebrow = document.querySelector("#kt-eyebrow");
const urlEl = document.querySelector("#kt-url");
const evidence = document.querySelector("#kt-evidence");
const barFill = document.querySelector("#kt-bar");
const finale = document.querySelector("#kt-finale");
const badge = document.querySelector("#kt-badge");
const readyName = document.querySelector("#kt-ready-name");
const counts = {
  pages: document.querySelector("#kt-pages"),
  articles: document.querySelector("#kt-articles"),
  topics: document.querySelector("#kt-topics"),
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
readyName.textContent = brand.host ? `${brand.label} Support` : "Your support agent";

const APPLE_MARK =
  "M16.4918 10.7734C15.537 10.7734 14.059 9.68776 12.5025 9.727C10.449 9.75316 8.56559 10.9172 7.50615 12.7614C5.37418 16.463 6.95681 21.9302 9.03646 24.9385C10.0567 26.4034 11.26 28.0515 12.8557 27.9991C14.386 27.9337 14.9615 27.0051 16.8188 27.0051C18.663 27.0051 19.1862 27.9991 20.8081 27.9599C22.4561 27.9337 23.5025 26.4688 24.5096 24.9909C25.6737 23.2905 26.1576 21.6425 26.1838 21.5509C26.1445 21.5379 22.9793 20.3215 22.94 16.6592C22.9139 13.5985 25.4382 12.1336 25.5559 12.0682C24.1172 9.96243 21.9068 9.727 21.1351 9.67469C19.1208 9.51773 17.4335 10.7734 16.4918 10.7734ZM19.8925 7.68659C20.7427 6.66639 21.3051 5.24072 21.1481 3.82812C19.9317 3.88044 18.4668 4.63906 17.5905 5.65927C16.8057 6.56175 16.1256 8.01358 16.3087 9.40001C17.6559 9.50465 19.0423 8.7068 19.8925 7.68659Z";

(function mountLogo() {
  const initial = document.createElement("span");
  initial.className = "kt__badge-initial";
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

/* ------------------------------------------------------------- the script -- */

const PATHS = [
  "/support", "/help/getting-started", "/support/billing", "/docs/setup",
  "/support/returns", "/help/account", "/docs/troubleshooting", "/support/shipping",
  "/faq", "/help/orders", "/support/warranty", "/docs/integrations",
  "/help/payments", "/support/refunds", "/docs/api", "/help/security",
];

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

const TOTALS = { pages: 128, articles: 62, topics: 8 };
const DURATION = 30;
const FINALE_AT = 28.4;

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

function build() {
  if (tl) tl.kill();
  gsap.set([evidence, finale], { opacity: 0 });
  gsap.set(finale, { y: 10 });
  gsap.set(barFill, { scaleX: 0 });
  gsap.set(stem, { opacity: 0.62, y: 0, filter: "blur(0px)" });
  eyebrow.dataset.done = "false";
  stem.textContent = "Connecting to";
  subject.textContent = "";
  counts.pages.textContent = "0";
  counts.articles.textContent = "0";
  counts.topics.textContent = "0";

  tl = gsap.timeline({ onComplete: () => tl.restart(true) });

  tl.from(eyebrow, { duration: 0.7, opacity: 0, y: 10, ease: "power3.out" }, 0.15);
  tl.from(".kt__head", { duration: 0.8, opacity: 0, y: 14, filter: "blur(6px)", ease: "power3.out" }, 0.3);
  tl.to(evidence, { duration: 0.6, opacity: 1, ease: "power2.out" }, 3.2);

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

  // The URL strip ticks faster than the headline so the two read as different
  // rates of the same job, rather than one caption in two sizes.
  PATHS.forEach((path, i) => {
    tl.add(() => (urlEl.textContent = `${host}${path}`), 3.4 + i * 1.45);
  });

  const counter = { pages: 0, articles: 0, topics: 0 };
  tl.to(counter, {
    duration: 22,
    ease: "power1.out",
    pages: TOTALS.pages,
    articles: TOTALS.articles,
    topics: TOTALS.topics,
    onUpdate: () => {
      counts.pages.textContent = Math.round(counter.pages);
      counts.articles.textContent = Math.round(counter.articles);
      counts.topics.textContent = Math.round(counter.topics);
    },
  }, 3.4);

  tl.to(barFill, { duration: DURATION - 1.2, scaleX: 1, ease: "power1.inOut" }, 0.8);

  tl.add(() => {
    eyebrow.dataset.done = "true";
    setStem("Your agent is trained on");
    gsap.delayedCall(0.42, () => setSubject(host, true));
    urlEl.textContent = "";
  }, FINALE_AT);

  tl.to(finale, { duration: 0.7, opacity: 1, y: 0, ease: "power3.out" }, FINALE_AT + 0.3);

  // SplitText earns its place on the one line that should land as a statement.
  if (window.SplitText && !prefersReducedMotion) {
    const split = new SplitText(readyName, { type: "chars" });
    tl.from(split.chars, { duration: 0.5, opacity: 0, y: 12, stagger: 0.02, ease: "power3.out" }, FINALE_AT + 0.45);
  }

  tl.to({}, { duration: 1.4 }, DURATION);
}

function fallback() {
  // If the CDN is unreachable the page must still narrate the wait rather than
  // sitting on a single frozen sentence.
  evidence.style.opacity = "1";
  let i = 0;
  stem.textContent = BEATS[0].stem;
  subject.textContent = BEATS[0].subject;
  window.setInterval(() => {
    i = (i + 1) % BEATS.length;
    stem.textContent = BEATS[i].stem;
    subject.textContent = BEATS[i].subject;
    subject.dataset.accent = BEATS[i].accent ? "true" : "false";
    urlEl.textContent = `${host}${PATHS[i % PATHS.length]}`;
  }, 2800);
  counts.pages.textContent = TOTALS.pages;
  counts.articles.textContent = TOTALS.articles;
  counts.topics.textContent = TOTALS.topics;
}

if (hasGsap) build();
else fallback();

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") window.location.href = "./index.html";
  if (event.key === " " || event.key.toLowerCase() === "r") {
    event.preventDefault();
    if (tl) tl.restart(true);
  }
});
