window.addEventListener("unhandledrejection", (event) => {
  if (event.reason && String(event.reason.message).includes("Transition was skipped")) {
    event.preventDefault();
  }
});

const WEBSITE_KEY = "hiver-omni-knowledge-onboarding-v2";
const AGENT_NAME_KEY = "hiver-omni-agent-name-v2";

const nameInput = document.querySelector("#agent-name-input");
const trainedDomain = document.querySelector("#agent-trained-domain");
const backButton = document.querySelector("#back-button");
const form = document.querySelector("#agent-form");
const continueButton = document.querySelector("#continue-button");

const widget = document.querySelector("#chat-widget");
const brandName = document.querySelector("#chat-brand-name");
const typingCollapse = document.querySelector("#chat-typing-collapse");
const messageCollapse = document.querySelector("#chat-message-collapse");
const bubble1 = document.querySelector("#chat-bubble-1");
const bubble2 = document.querySelector("#chat-bubble-2");
const suggestion1 = document.querySelector("#suggestion-1");
const suggestion2 = document.querySelector("#suggestion-2");
const sentCollapse = document.querySelector("#chat-sent-collapse");
const replyTypingCollapse = document.querySelector("#chat-reply-typing-collapse");
const replyCollapse = document.querySelector("#chat-reply-collapse");
const reply1 = document.querySelector("#chat-reply-1");
const reply2 = document.querySelector("#chat-reply-2");
const composerPlaceholder = document.querySelector("#chat-composer-placeholder");
const sourcesCard = document.querySelector("#agent-sources-card");
const chatBody = document.querySelector("#chat-body");
const sentBubble = document.querySelector("#chat-sent-bubble");
const sourceLinks = document.querySelectorAll("#agent-sources-card .agent-sources-card__link span");

function scrollChatToBottom() {
  chatBody.scrollTop = chatBody.scrollHeight;
}

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function deriveBrand(rawDomain) {
  const value = (rawDomain || "").trim();
  if (!value) return { label: "your business", host: "" };
  let host = value.replace(/^[a-z]+:\/\//i, "").split("/")[0];
  host = host.replace(/^www\./i, "");
  const parts = host.split(".").filter(Boolean);
  const key = parts.length >= 2 ? parts[parts.length - 2] : parts[0] || value;
  const label = key.charAt(0).toUpperCase() + key.slice(1);
  return { label, host: host || value };
}

const domain = (localStorage.getItem(WEBSITE_KEY) || "").trim();
const brand = deriveBrand(domain);
brandName.textContent = `${brand.label} Support`;

nameInput.value = localStorage.getItem(AGENT_NAME_KEY) || "";
nameInput.addEventListener("input", () => {
  localStorage.setItem(AGENT_NAME_KEY, nameInput.value);
});

trainedDomain.textContent = brand.host || "your site";

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

function runWidgetSequence() {
  const t = prefersReducedMotion
    ? { frame: 60, header: 200, typing: 340, messages: 840, bubble2: 1140, composer: 1440, suggestions: 1700 }
    : { frame: 150, header: 620, typing: 1150, messages: 2650, bubble2: 3300, composer: 3850, suggestions: 4400 };

  window.setTimeout(() => { widget.dataset.visible = "true"; }, t.frame);
  window.setTimeout(() => { widget.dataset.header = "true"; }, t.header);
  window.setTimeout(() => { setCollapse(typingCollapse, true); }, t.typing);

  window.setTimeout(() => {
    setCollapse(typingCollapse, false);
    setCollapse(messageCollapse, true);
    bubble1.dataset.visible = "true";
    window.setTimeout(scrollChatToBottom, 650);
  }, t.messages);

  window.setTimeout(() => {
    bubble2.dataset.visible = "true";
    window.setTimeout(scrollChatToBottom, 350);
  }, t.bubble2);

  window.setTimeout(() => {
    widget.dataset.composer = "true";
  }, t.composer);

  window.setTimeout(() => {
    suggestion1.dataset.visible = "true";
    suggestion2.dataset.visible = "true";
  }, t.suggestions);
}

const QUESTIONS = {
  [suggestion1.id]: {
    reply1: "Try restarting your iPhone, then go to Settings &gt; Battery and check which apps are using the most power. Disable Background App Refresh for any you don&rsquo;t need.",
    reply2: "If the issue persists, don&rsquo;t hesitate to reach out. I&rsquo;m always here to help!",
    sources: [
      "https://apple.com/",
      "https://apple.com/help-article/regular-battery-drain",
    ],
  },
  [suggestion2.id]: {
    reply1: "The iPhone 16 Pro Max steps up to a 48MP Ultra Wide camera and adds a 5x telephoto lens, both exclusive to the Pro line. Low-light photos and 4K video stabilization are noticeably sharper too.",
    reply2: "Both phones support Night mode and Cinematic mode, but the 16 Pro Max adds macro photography and a longer zoom range.",
    sources: [
      "https://apple.com/iphone-16-pro/",
      "https://apple.com/iphone-16-pro/cameras/",
    ],
  },
};

let askedAlready = false;

function askQuestion(suggestion) {
  if (askedAlready) return;
  askedAlready = true;

  const question = QUESTIONS[suggestion.id];
  const other = suggestion === suggestion1 ? suggestion2 : suggestion1;

  sentBubble.textContent = suggestion.textContent;
  reply1.innerHTML = question.reply1;
  reply2.innerHTML = question.reply2;
  sourceLinks[0].textContent = question.sources[0];
  sourceLinks[1].textContent = question.sources[1];

  // A deliberate pause before the typing indicator appears, so the reply
  // reads as the agent taking a beat to think rather than an instant echo.
  const t = prefersReducedMotion
    ? { sent: 0, replyTyping: 460, reply1: 1060, reply2: 1460, sources: 1860 }
    : { sent: 0, replyTyping: 1200, reply1: 2900, reply2: 3500, sources: 4200 };

  window.setTimeout(() => {
    suggestion.dataset.sent = "true";
    other.dataset.hidden = "true";
    setCollapse(sentCollapse, true);
    window.setTimeout(scrollChatToBottom, 650);
  }, t.sent);

  window.setTimeout(() => {
    setCollapse(replyTypingCollapse, true);
    window.setTimeout(scrollChatToBottom, 650);
  }, t.replyTyping);

  window.setTimeout(() => {
    setCollapse(replyTypingCollapse, false);
    setCollapse(replyCollapse, true);
    reply1.dataset.visible = "true";
    composerPlaceholder.textContent = "Ask a followup";
    window.setTimeout(scrollChatToBottom, 650);
  }, t.reply1);

  window.setTimeout(() => {
    reply2.dataset.visible = "true";
    window.setTimeout(scrollChatToBottom, 350);
  }, t.reply2);

  window.setTimeout(() => {
    widget.dataset.shift = "true";
    sourcesCard.dataset.visible = "true";
  }, t.sources);
}

runWidgetSequence();
suggestion1.addEventListener("click", () => askQuestion(suggestion1));
suggestion2.addEventListener("click", () => askQuestion(suggestion2));

backButton.addEventListener("click", () => {
  window.location.href = "./index.html";
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  localStorage.setItem(AGENT_NAME_KEY, nameInput.value);
  pulse(continueButton);
  window.setTimeout(() => {
    window.location.href = "./invite.html";
  }, prefersReducedMotion ? 80 : 200);
});

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") window.location.href = "./index.html";
});
