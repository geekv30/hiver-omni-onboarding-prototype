window.addEventListener("unhandledrejection", (event) => {
  if (event.reason && String(event.reason.message).includes("Transition was skipped")) {
    event.preventDefault();
  }
});

const backButton = document.querySelector("#back-button");
const form = document.querySelector("#invite-form");
const continueButton = form.querySelector(".continue-button");

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function pulse(el) {
  if (prefersReducedMotion) return;
  el.animate(
    [{ transform: "scale(0.96)" }, { transform: "scale(1.02)" }, { transform: "scale(1)" }],
    { duration: 240, easing: "cubic-bezier(0.23, 1, 0.32, 1)" },
  );
}

backButton.addEventListener("click", () => {
  window.location.href = "./agent.html";
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  // Invite is the last built V2 step for now; no next screen to navigate to yet.
  pulse(continueButton);
});

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") window.location.href = "./agent.html";
});
