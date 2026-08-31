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
const suggestionsRow = document.querySelector("#chat-suggestions");
const composerInput = document.querySelector("#chat-composer-input");
const sendButton = document.querySelector("#chat-send-button");
const sourcesCard = document.querySelector("#agent-sources-card");
const chatBody = document.querySelector("#chat-body");
const sourceLinks = document.querySelectorAll("#agent-sources-card .agent-sources-card__link span");

function isNearBottom() {
  return chatBody.scrollHeight - chatBody.scrollTop - chatBody.clientHeight < 24;
}

// Only a genuine user scroll should be able to set this — our own
// script-driven scrolling below is guarded so it never trips this flag,
// otherwise the widget's own animated growth looks identical to "the user
// scrolled up" and auto-scroll breaks itself.
let userScrolledUp = false;
let programmaticScroll = false;

chatBody.addEventListener("scroll", () => {
  if (programmaticScroll) return;
  userScrolledUp = !isNearBottom();
});

function scrollChatToBottom(force = false) {
  if (!force && userScrolledUp) return;
  programmaticScroll = true;
  chatBody.scrollTop = chatBody.scrollHeight;
  requestAnimationFrame(() => { programmaticScroll = false; });
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

/*
  The intro is a one-time reveal, not a gate. Replaying its ~4.4s every time the
  user steps back to index.html and forward again made the screen feel broken —
  you could see the widget you had already met being assembled a second time,
  with nothing clickable until it finished. Session-scoped, so a fresh demo run
  still gets the full reveal.
*/
const INTRO_SEEN_KEY = "hiver-omni-agent-intro-seen-v2";

function restWidgetState() {
  widget.dataset.visible = "true";
  widget.dataset.header = "true";
  setCollapse(typingCollapse, false);
  setCollapse(messageCollapse, true);
  bubble1.dataset.visible = "true";
  bubble2.dataset.visible = "true";
  widget.dataset.composer = "true";
  suggestion1.dataset.visible = "true";
  suggestion2.dataset.visible = "true";
}

function snapWidgetToRest() {
  // data-instant suppresses every transition inside the widget while the rest
  // state is committed, then hands motion back so the exchange still animates.
  widget.dataset.instant = "true";
  restWidgetState();
  scrollChatToBottom(true);
  // Two frames: one to paint the committed state with motion off, one before
  // re-enabling, so nothing back-animates from the values we just skipped past.
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      delete widget.dataset.instant;
    });
  });
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
    window.setTimeout(() => scrollChatToBottom(true), 650);
  }, t.messages);

  window.setTimeout(() => {
    bubble2.dataset.visible = "true";
    window.setTimeout(() => scrollChatToBottom(true), 350);
  }, t.bubble2);

  window.setTimeout(() => {
    widget.dataset.composer = "true";
  }, t.composer);

  window.setTimeout(() => {
    suggestion1.dataset.visible = "true";
    suggestion2.dataset.visible = "true";
    // Only a sequence that actually finished counts as seen — leaving mid-intro
    // should still replay it.
    try { sessionStorage.setItem(INTRO_SEEN_KEY, "1"); } catch {}
  }, t.suggestions);
}

function startWidget() {
  let seen = false;
  try { seen = sessionStorage.getItem(INTRO_SEEN_KEY) === "1"; } catch {}
  if (seen) return snapWidgetToRest();
  runWidgetSequence();
}

const QUESTIONS = {
  [suggestion1.id]: {
    match: ["battery"],
    reply1: "Try restarting your iPhone. Then go to Settings &gt; Battery and check which apps are using the most power. Disable Background App Refresh for any you don&rsquo;t need.",
    reply2: "If the issue persists, don&rsquo;t hesitate to reach out. I&rsquo;m always here to help!",
    sources: [
      "https://apple.com/",
      "https://apple.com/help-article/regular-battery-drain",
    ],
  },
  [suggestion2.id]: {
    match: ["camera"],
    reply1: "The iPhone 16 Pro Max steps up to a 48MP Ultra Wide camera and adds a 5x telephoto lens, both exclusive to the Pro line. Low-light photos and 4K video stabilization are noticeably better too.",
    reply2: "Both phones support Night mode and Cinematic mode, but the 16 Pro Max adds macro photography and a longer zoom range.",
    sources: [
      "https://apple.com/iphone-16-pro/",
      "https://apple.com/iphone-16-pro/cameras/",
    ],
  },
};

const FALLBACK_REPLY = "I&rsquo;m still learning &mdash; try one of the questions above, or ask about battery life or camera specs.";

function matchQuestionKey(text) {
  const lower = text.toLowerCase();
  for (const [key, question] of Object.entries(QUESTIONS)) {
    if (question.match.some((word) => lower.includes(word))) return key;
  }
  return null;
}

function buildCollapse(innerHtml) {
  const wrap = document.createElement("div");
  wrap.className = "chat-collapse";
  const inner = document.createElement("div");
  inner.className = "chat-collapse-inner";
  inner.innerHTML = innerHtml;
  wrap.appendChild(inner);
  return wrap;
}

let chatBusy = false;

function setComposerBusy(busy) {
  chatBusy = busy;
  composerInput.disabled = busy;
  sendButton.disabled = busy || composerInput.value.trim() === "";
  suggestionsRow.dataset.hidden = busy ? "true" : "false";
}

function runExchange(questionText, key) {
  if (chatBusy) return;
  setComposerBusy(true);

  const question = QUESTIONS[key] || null;
  const reply1Html = question ? question.reply1 : FALLBACK_REPLY;
  const reply2Html = question ? question.reply2 : "";
  const sources = question ? question.sources : null;

  const exchange = document.createElement("div");
  exchange.className = "chat-widget__exchange";

  const sentRow = buildCollapse(`
    <div class="chat-widget__row chat-widget__row--user">
      <div class="chat-widget__bubbles chat-widget__bubbles--user">
        <p class="chat-widget__bubble chat-widget__bubble--user" data-visible="true"></p>
      </div>
    </div>
  `);
  sentRow.querySelector(".chat-widget__bubble--user").textContent = questionText;

  const typingRow = buildCollapse(`
    <div class="chat-widget__row">
      <img class="chat-widget__avatar" src="./assets/widget/orb-static.svg" alt="" />
      <div class="chat-widget__bubbles">
        <div class="chat-widget__bubble" data-visible="true">
          <span class="chat-widget__typing-dots" aria-hidden="true"><span></span><span></span><span></span></span>
        </div>
      </div>
    </div>
  `);

  const replyRow = buildCollapse(`
    <div class="chat-widget__row">
      <img class="chat-widget__avatar" src="./assets/widget/orb-static.svg" alt="" />
      <div class="chat-widget__bubbles">
        <p class="chat-widget__bubble" data-reply="1"></p>
        ${reply2Html ? '<p class="chat-widget__bubble" data-reply="2"></p>' : ""}
      </div>
    </div>
  `);
  replyRow.querySelector('[data-reply="1"]').innerHTML = reply1Html;
  if (reply2Html) replyRow.querySelector('[data-reply="2"]').innerHTML = reply2Html;

  exchange.append(sentRow, typingRow, replyRow);
  chatBody.insertBefore(exchange, suggestionsRow);

  const reply1El = replyRow.querySelector('[data-reply="1"]');
  const reply2El = reply2Html ? replyRow.querySelector('[data-reply="2"]') : null;

  // A short, deliberate pause before the typing indicator appears, so the
  // reply reads as the agent taking a beat to think rather than an instant echo.
  const t = prefersReducedMotion
    ? { sent: 0, replyTyping: 150, reply1: 750, reply2: 1150, sources: 1550 }
    : { sent: 0, replyTyping: 250, reply1: 1950, reply2: 2550, sources: 3250 };

  window.setTimeout(() => {
    setCollapse(sentRow, true);
    window.setTimeout(() => scrollChatToBottom(true), 650);
  }, t.sent);

  window.setTimeout(() => {
    setCollapse(typingRow, true);
    window.setTimeout(() => scrollChatToBottom(), 650);
  }, t.replyTyping);

  window.setTimeout(() => {
    setCollapse(typingRow, false);
    setCollapse(replyRow, true);
    reply1El.dataset.visible = "true";
    window.setTimeout(() => scrollChatToBottom(), 650);
  }, t.reply1);

  if (reply2El) {
    window.setTimeout(() => {
      reply2El.dataset.visible = "true";
      window.setTimeout(() => scrollChatToBottom(), 350);
    }, t.reply2);
  }

  window.setTimeout(() => {
    if (sources) {
      sourceLinks[0].textContent = sources[0];
      if (sources[1]) sourceLinks[1].textContent = sources[1];
      widget.dataset.shift = "true";
      sourcesCard.dataset.visible = "true";
    }
    window.setTimeout(() => scrollChatToBottom(), 350);
    setComposerBusy(false);
  }, t.sources);
}

function handleSuggestionClick(suggestion) {
  if (chatBusy || suggestion.dataset.sent === "true") return;
  suggestion.dataset.sent = "true";
  runExchange(suggestion.textContent, suggestion.id);
}

function autoResizeComposer() {
  composerInput.style.height = "auto";
  composerInput.style.height = `${composerInput.scrollHeight}px`;
}

function submitComposer() {
  const text = composerInput.value.trim();
  if (!text || chatBusy) return;
  composerInput.value = "";
  autoResizeComposer();
  runExchange(text, matchQuestionKey(text));
}

startWidget();
suggestion1.addEventListener("click", () => handleSuggestionClick(suggestion1));
suggestion2.addEventListener("click", () => handleSuggestionClick(suggestion2));

composerInput.addEventListener("input", () => {
  autoResizeComposer();
  if (!chatBusy) sendButton.disabled = composerInput.value.trim() === "";
});

composerInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !event.shiftKey && !event.isComposing) {
    event.preventDefault();
    submitComposer();
  }
});

sendButton.addEventListener("click", submitComposer);

// Backward moves replace rather than push, so retreating never grows the
// history stack — Back stays a reliable "one step back".
backButton.addEventListener("click", () => {
  window.location.replace("./index.html");
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
  if (event.key === "Escape") window.location.replace("./index.html");
});
