// A view transition interrupted by the next navigation rejects with "Transition
// was skipped". It is benign — the navigation still happens — but it surfaces as
// an uncaught error, so it is swallowed here the same way agent.js and invite.js
// already do.
window.addEventListener("unhandledrejection", (event) => {
  if (event.reason && String(event.reason.message).includes("Transition was skipped")) {
    event.preventDefault();
  }
});

const NAME_KEY = "hiver-omni-company-name-v2";
const WEBSITE_KEY = "hiver-omni-knowledge-onboarding-v2";

const form = document.querySelector("#company-form");
const nameInput = document.querySelector("#company-name-input");
const websiteInput = document.querySelector("#company-website-input");
const continueButton = form.querySelector(".continue-button");
const status = document.querySelector("#save-status");
let savedTimer;

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function pulse(el) {
  if (prefersReducedMotion) return;
  el.animate(
    [{ transform: "scale(0.94)" }, { transform: "scale(1.03)" }, { transform: "scale(1)" }],
    { duration: 260, easing: "cubic-bezier(0.23, 1, 0.32, 1)" },
  );
}

function persist() {
  localStorage.setItem(NAME_KEY, nameInput.value);
  localStorage.setItem(WEBSITE_KEY, websiteInput.value);
}

nameInput.value = localStorage.getItem(NAME_KEY) || "";
websiteInput.value = localStorage.getItem(WEBSITE_KEY) || "";

nameInput.addEventListener("input", persist);
websiteInput.addEventListener("input", persist);

form.addEventListener("submit", (event) => {
  event.preventDefault();
  persist();
  status.textContent = "Company details saved.";
  continueButton.textContent = "Saved";
  continueButton.dataset.state = "saved";
  pulse(continueButton);
  window.clearTimeout(savedTimer);
  savedTimer = window.setTimeout(() => {
    window.location.href = "./learning.html";
  }, 550);
});
