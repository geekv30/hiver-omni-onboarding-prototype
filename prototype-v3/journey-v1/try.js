window.addEventListener("unhandledrejection", (event) => {
  if (event.reason && String(event.reason.message).includes("Transition was skipped")) {
    event.preventDefault();
  }
});

const STORAGE_KEY = "hiver-omni-knowledge-onboarding-v3";

const widget = document.querySelector("#chat-widget");
const closeButton = document.querySelector("#chat-close");
const backButton = document.querySelector("#back-button");
const continueButton = document.querySelector("#continue-button");
const form = document.querySelector("#try-form");
const brandName = document.querySelector("#chat-brand-name");
const typingCollapse = document.querySelector("#chat-typing-collapse");
const messageCollapse = document.querySelector("#chat-message-collapse");
const bubble1 = document.querySelector("#chat-bubble-1");
const bubble2 = document.querySelector("#chat-bubble-2");

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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

function setCollapse(el, visible) {
  el.dataset.visible = visible ? "true" : "false";
}

function pulse(el) {
  if (prefersReducedMotion) return;
  el.animate(
    [{ transform: "scale(0.96)" }, { transform: "scale(1.02)" }, { transform: "scale(1)" }],
    { duration: 240, easing: "cubic-bezier(0.23, 1, 0.32, 1)" },
  );
}

function constructWidget() {
  const t = prefersReducedMotion
    ? { frame: 60, header: 200, close: 220, typing: 340, messages: 840, bubble2: 1140, composer: 1440 }
    : { frame: 150, header: 620, close: 500, typing: 1150, messages: 2650, bubble2: 3300, composer: 3850 };

  window.setTimeout(() => { widget.dataset.visible = "true"; }, t.frame);
  window.setTimeout(() => { widget.dataset.header = "true"; }, t.header);
  window.setTimeout(() => { closeButton.dataset.visible = "true"; }, t.close);
  window.setTimeout(() => { setCollapse(typingCollapse, true); }, t.typing);

  window.setTimeout(() => {
    setCollapse(typingCollapse, false);
    setCollapse(messageCollapse, true);
    bubble1.dataset.visible = "true";
  }, t.messages);

  window.setTimeout(() => {
    bubble2.dataset.visible = "true";
  }, t.bubble2);

  window.setTimeout(() => {
    widget.dataset.composer = "true";
  }, t.composer);
}

constructWidget();

closeButton.addEventListener("click", () => {
  widget.dataset.visible = "false";
  closeButton.dataset.visible = "false";
});

backButton.addEventListener("click", () => {
  window.location.href = "./knowledge.html";
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  pulse(continueButton);
  window.setTimeout(() => {
    window.location.href = "./invite.html";
  }, prefersReducedMotion ? 80 : 200);
});

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    widget.dataset.visible = "false";
    closeButton.dataset.visible = "false";
  }
});
