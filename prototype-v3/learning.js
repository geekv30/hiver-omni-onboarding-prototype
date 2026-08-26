const STORAGE_KEY = "hiver-omni-knowledge-onboarding-v3";

const chip = document.querySelector("#source-chip");
const chipIcon = document.querySelector("#source-chip-icon");
const chipText = document.querySelector("#source-chip-text");
const stage = document.querySelector("#learning-stage");
const spinnerCollapse = document.querySelector("#learning-spinner-collapse");
const captionCollapse = document.querySelector("#learning-caption-collapse");
const caption = document.querySelector("#learning-caption");
const brandIcon = document.querySelector("#learning-brand-icon");
const brandIconResolved = document.querySelector("#learning-brand-icon-resolved");
const brandName = document.querySelector("#learning-brand-name");
const headingBuilding = document.querySelector("#learning-heading-building");
const headingReady = document.querySelector("#learning-heading-ready");

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const CAPTIONS = ["Analyzing your site…", "Importing Assets…", "Learning your brand's voice…"];

function deriveBrand(rawDomain) {
  const value = (rawDomain || "").trim();
  if (!value) return { label: "your business", isApple: false };

  let host = value.replace(/^[a-z]+:\/\//i, "").split("/")[0];
  host = host.replace(/^www\./i, "");
  const parts = host.split(".").filter(Boolean);
  const key = parts.length >= 2 ? parts[parts.length - 2] : parts[0] || value;
  const label = key.charAt(0).toUpperCase() + key.slice(1);

  return { label, isApple: key.toLowerCase() === "apple" };
}

const domain = (localStorage.getItem(STORAGE_KEY) || "").trim();
if (domain) {
  chipText.textContent = domain;
  chipIcon.hidden = false;
  chip.dataset.state = "filled";
}

const brand = deriveBrand(domain);
brandName.textContent = brand.label;

function resolveBrandIcon() {
  if (brand.isApple) {
    const img = document.createElement("img");
    img.src = "./assets/favicon/apple.svg";
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

function setCollapse(el, visible) {
  el.dataset.visible = visible ? "true" : "false";
}

function swapCaption(text) {
  if (prefersReducedMotion) {
    caption.textContent = text;
    return;
  }
  caption.classList.add("is-swapping");
  window.setTimeout(() => {
    caption.textContent = text;
    caption.classList.remove("is-swapping");
  }, 260);
}

function crossfadeHeading(toReady) {
  headingBuilding.dataset.active = toReady ? "false" : "true";
  headingReady.dataset.active = toReady ? "true" : "false";
}

let captionTimer;
function startCaptionCycle() {
  let index = 0;
  swapCaption(CAPTIONS[index]);
  captionTimer = window.setInterval(() => {
    index += 1;
    if (index >= CAPTIONS.length) {
      window.clearInterval(captionTimer);
      return;
    }
    swapCaption(CAPTIONS[index]);
  }, prefersReducedMotion ? 700 : 1900);
}

function runSequence() {
  const t = prefersReducedMotion
    ? { bob: 100, stageIn: 260, resolve: 460, spinner: 640, caption: 820, ready: 820 + 3 * 700 + 300 }
    : { bob: 900, stageIn: 1900, resolve: 2700, spinner: 3600, caption: 4600, ready: 4600 + 3 * 1900 + 700 };

  window.setTimeout(() => {
    chip.dataset.position = "up";
  }, t.bob);

  window.setTimeout(() => {
    chip.dataset.position = "hidden";
    stage.dataset.phase = "building";
  }, t.stageIn);

  window.setTimeout(resolveBrandIcon, t.resolve);

  window.setTimeout(() => {
    setCollapse(spinnerCollapse, true);
  }, t.spinner);

  window.setTimeout(() => {
    setCollapse(captionCollapse, true);
    startCaptionCycle();
  }, t.caption);

  window.setTimeout(() => {
    window.clearInterval(captionTimer);
    setCollapse(captionCollapse, false);
    crossfadeHeading(true);
  }, t.ready);

  window.setTimeout(() => {
    window.location.href = "./try.html";
  }, t.ready + (prefersReducedMotion ? 500 : 1700));
}

runSequence();

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") window.location.href = "./knowledge.html";
});
