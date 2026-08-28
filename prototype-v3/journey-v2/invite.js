window.addEventListener("unhandledrejection", (event) => {
  if (event.reason && String(event.reason.message).includes("Transition was skipped")) {
    event.preventDefault();
  }
});

const STORAGE_KEY = "hiver-omni-knowledge-onboarding-v2";

const graph = document.querySelector("#invite-graph");
const pane = document.querySelector(".landscape-pane");
const backButton = document.querySelector("#back-button");
const form = document.querySelector("#invite-form");
const continueButton = form.querySelector(".continue-button");
const domainText = document.querySelector("#invite-domain-text");

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function updateGraphFit() {
  const rect = pane.getBoundingClientRect();
  if (!rect.width || !rect.height) return;
  const scale = Math.min(1, rect.width / 960, rect.height / 749);
  graph.style.setProperty("--fit", scale.toFixed(4));
}

updateGraphFit();
window.addEventListener("resize", updateGraphFit);

function deriveDomainLabel(rawDomain) {
  const value = (rawDomain || "").trim();
  if (!value) return "help.yourcompany.com";
  let host = value.replace(/^[a-z]+:\/\//i, "").split("/")[0];
  host = host.replace(/^www\./i, "");
  return host || "help.yourcompany.com";
}

domainText.textContent = deriveDomainLabel(localStorage.getItem(STORAGE_KEY));

window.requestAnimationFrame(() => {
  window.setTimeout(() => {
    graph.dataset.visible = "true";
  }, prefersReducedMotion ? 40 : 220);
});

function pulse(el) {
  if (prefersReducedMotion) return;
  el.animate(
    [{ transform: "scale(0.96)" }, { transform: "scale(1.02)" }, { transform: "scale(1)" }],
    { duration: 240, easing: "cubic-bezier(0.23, 1, 0.32, 1)" },
  );
}

backButton.addEventListener("click", () => {
  window.location.href = "./try.html";
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  pulse(continueButton);
  window.setTimeout(() => {
    window.location.href = "./summary.html";
  }, prefersReducedMotion ? 80 : 200);
});
