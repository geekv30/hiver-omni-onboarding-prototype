window.addEventListener("unhandledrejection", (event) => {
  if (event.reason && String(event.reason.message).includes("Transition was skipped")) {
    event.preventDefault();
  }
});

const STORAGE_KEY = "hiver-omni-knowledge-onboarding-v3";

const collage = document.querySelector("#summary-collage");
const pane = document.querySelector(".landscape-pane");
const backButton = document.querySelector("#back-button");
const form = document.querySelector("#summary-form");
const continueButton = document.querySelector("#continue-button");
const brandName = document.querySelector("#summary-brand-name");

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function updateCollageFit() {
  const rect = pane.getBoundingClientRect();
  if (!rect.width || !rect.height) return;
  const scale = Math.min(1, rect.width / 960, rect.height / 749);
  collage.style.setProperty("--fit", scale.toFixed(4));
}

updateCollageFit();
window.addEventListener("resize", updateCollageFit);

function deriveBrandLabel(rawDomain) {
  const value = (rawDomain || "").trim();
  if (!value) return "your business";
  let host = value.replace(/^[a-z]+:\/\//i, "").split("/")[0];
  host = host.replace(/^www\./i, "");
  const parts = host.split(".").filter(Boolean);
  const key = parts.length >= 2 ? parts[parts.length - 2] : parts[0] || value;
  return key.charAt(0).toUpperCase() + key.slice(1);
}

brandName.textContent = deriveBrandLabel(localStorage.getItem(STORAGE_KEY));

window.requestAnimationFrame(() => {
  window.setTimeout(() => {
    collage.dataset.visible = "true";
  }, prefersReducedMotion ? 40 : 220);
});

backButton.addEventListener("click", () => {
  window.location.href = "./invite.html";
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  continueButton.dataset.state = "saved";
  continueButton.textContent = "You're all set";
  continueButton.disabled = true;
});
