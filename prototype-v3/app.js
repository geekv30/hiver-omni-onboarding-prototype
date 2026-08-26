const STORAGE_KEY = "hiver-omni-channel-onboarding-v3";
const unsureValue = "unsure";

const form = document.querySelector("#channel-form");
const choices = [...form.querySelectorAll('input[name="channel"]')];
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

function readSelection() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

function selectedValues() {
  return choices.filter((choice) => choice.checked).map((choice) => choice.value);
}

function render() {
  const hasSelection = selectedValues().length > 0;
  const isActivating = continueButton.disabled && hasSelection;
  continueButton.disabled = !hasSelection;
  if (isActivating) pulse(continueButton);
}

function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(selectedValues()));
}

function applyExclusivity(changed) {
  if (!changed.checked) return;

  if (changed.value === unsureValue) {
    choices.forEach((choice) => {
      if (choice !== changed) choice.checked = false;
    });
    return;
  }

  const unsure = choices.find((choice) => choice.value === unsureValue);
  unsure.checked = false;
}

const savedSelection = new Set(readSelection());
choices.forEach((choice) => {
  choice.checked = savedSelection.has(choice.value);
  choice.addEventListener("change", () => {
    applyExclusivity(choice);
    persist();
    render();
  });
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  persist();
  status.textContent = "Channel choices saved.";
  document.body.dataset.saved = "true";
  continueButton.textContent = "Saved";
  continueButton.dataset.state = "saved";
  pulse(continueButton);
  window.clearTimeout(savedTimer);
  savedTimer = window.setTimeout(() => {
    window.location.href = "./knowledge.html";
  }, 550);
});

render();
