const STORAGE_KEY = "hiver-omni-knowledge-onboarding-v2";

const form = document.querySelector("#knowledge-form");
const domainInput = document.querySelector("#domain-input");
const backButton = document.querySelector("#back-button");
const continueButton = form.querySelector(".continue-button");
const status = document.querySelector("#save-status");
const chip = document.querySelector("#source-chip");
const chipIcon = document.querySelector("#source-chip-icon");
const chipText = document.querySelector("#source-chip-text");
let savedTimer;

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function pulse(el) {
  if (prefersReducedMotion) return;
  el.animate(
    [{ transform: "scale(0.94)" }, { transform: "scale(1.03)" }, { transform: "scale(1)" }],
    { duration: 260, easing: "cubic-bezier(0.23, 1, 0.32, 1)" },
  );
}

function renderChip() {
  const value = domainInput.value.trim();
  if (value) {
    chipText.textContent = value;
    chipIcon.hidden = false;
    chip.dataset.state = "filled";
  } else {
    chipText.textContent = "waiting for sources";
    chipIcon.hidden = true;
    delete chip.dataset.state;
  }
}

function persist() {
  localStorage.setItem(STORAGE_KEY, domainInput.value);
}

const saved = localStorage.getItem(STORAGE_KEY);
if (saved) domainInput.value = saved;
renderChip();

domainInput.addEventListener("input", () => {
  renderChip();
  persist();
});

backButton.addEventListener("click", () => {
  window.location.href = "./index.html";
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  persist();
  status.textContent = "Knowledge source saved.";
  continueButton.textContent = "Saved";
  continueButton.dataset.state = "saved";
  pulse(continueButton);
  window.clearTimeout(savedTimer);
  savedTimer = window.setTimeout(() => {
    window.location.href = "./learning.html";
  }, 550);
});
