(() => {
  "use strict";

  const STORAGE_KEY = "hiver-living-onboarding-v2";
  const screens = ["channels", "knowledge", "learn", "test", "invite", "ready"];
  const defaults = {
    screen: "channels",
    channels: [],
    knowledgeUrl: "",
    sampleMode: false,
    knowledgeStatus: "idle",
    progress: 0,
    testComplete: false,
    lastQuestion: "",
    invites: [],
    inviteSkipped: false,
    aiSkipped: false
  };

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const state = { ...defaults, ...readState() };
  let processingTimer = null;
  let responseTimer = null;

  const hiverBrandPath = '<rect x="3" y="13" width="4" height="8" rx="1" fill="currentColor" stroke="none"/><rect x="10" y="4" width="4" height="17" rx="1" fill="currentColor" stroke="none"/><rect x="17" y="9" width="4" height="12" rx="1" fill="currentColor" stroke="none"/>';

  // Official free Untitled UI Icons, @untitledui/icons v0.0.22.
  const untitledIcons = {
    lock: { name: "Lock01", path: '<path d="M17 10V8A5 5 0 0 0 7 8v2m5 4.5v2M8.8 21h6.4c1.68 0 2.52 0 3.162-.327a3 3 0 0 0 1.311-1.311C20 18.72 20 17.88 20 16.2v-1.4c0-1.68 0-2.52-.327-3.162a3 3 0 0 0-1.311-1.311C17.72 10 16.88 10 15.2 10H8.8c-1.68 0-2.52 0-3.162.327a3 3 0 0 0-1.311 1.311C4 12.28 4 13.12 4 14.8v1.4c0 1.68 0 2.52.327 3.162a3 3 0 0 0 1.311 1.311C6.28 21 7.12 21 8.8 21Z"/>' },
    mail: { name: "Mail01", path: '<path d="m2 7 8.165 5.715c.661.463.992.695 1.351.784a2 2 0 0 0 .968 0c.36-.09.69-.32 1.351-.784L22 7M6.8 20h10.4c1.68 0 2.52 0 3.162-.327a3 3 0 0 0 1.311-1.311C22 17.72 22 16.88 22 15.2V8.8c0-1.68 0-2.52-.327-3.162a3 3 0 0 0-1.311-1.311C19.72 4 18.88 4 17.2 4H6.8c-1.68 0-2.52 0-3.162.327a3 3 0 0 0-1.311 1.311C2 6.28 2 7.12 2 8.8v6.4c0 1.68 0 2.52.327 3.162a3 3 0 0 0 1.311 1.311C4.28 20 5.12 20 6.8 20Z"/>' },
    message: { name: "MessageSquare01", path: '<path d="M3 7.8c0-1.68 0-2.52.327-3.162a3 3 0 0 1 1.311-1.311C5.28 3 6.12 3 7.8 3h8.4c1.68 0 2.52 0 3.162.327a3 3 0 0 1 1.311 1.311C21 5.28 21 6.12 21 7.8v5.4c0 1.68 0 2.52-.327 3.162a3 3 0 0 1-1.311 1.311C18.72 18 17.88 18 16.2 18H9.684c-.624 0-.936 0-1.235.061a2.997 2.997 0 0 0-.762.267c-.27.14-.514.334-1.002.724L4.3 20.96c-.416.333-.624.5-.8.5a.5.5 0 0 1-.39-.188C3 21.135 3 20.868 3 20.336V7.8Z"/>' },
    hash: { name: "Hash01", path: '<path d="M4 8h16M4 16h16M8 3v18m8-18v18"/>' },
    phone: { name: "Phone", path: '<path d="M8.38 8.853a14.603 14.603 0 0 0 2.847 4.01 14.603 14.603 0 0 0 4.01 2.847c.124.06.187.09.265.112.28.082.625.023.862-.147.067-.048.124-.105.239-.219.35-.35.524-.524.7-.639a2 2 0 0 1 2.18 0c.176.115.35.29.7.64l.195.194c.532.531.797.797.942 1.082a2 2 0 0 1 0 1.806c-.145.285-.41.551-.942 1.082l-.157.158c-.53.53-.795.794-1.155.997-.4.224-1.02.386-1.478.384-.413-.001-.695-.081-1.26-.241a19.038 19.038 0 0 1-8.283-4.874A19.039 19.039 0 0 1 3.17 7.761c-.16-.564-.24-.846-.241-1.26a3.377 3.377 0 0 1 .384-1.477c.202-.36.467-.625.997-1.155l.157-.158c.532-.53.798-.797 1.083-.941a2 2 0 0 1 1.805 0c.286.144.551.41 1.083.942l.195.194c.35.35.524.525.638.7a2 2 0 0 1 0 2.18c-.114.177-.289.352-.638.701a2.037 2.037 0 0 0-.22.238 1.05 1.05 0 0 0-.147.862c.023.08.053.142.113.266Z"/>' },
    help: { name: "HelpCircle", path: '<path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3m.08 4h.01M22 12c0 5.523-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2s10 4.477 10 10Z"/>' },
    check: { name: "Check", path: '<path d="M20 6 9 17l-5-5"/>' },
    "arrow-right": { name: "ArrowRight", path: '<path d="M5 12h14m0 0-7-7m7 7-7 7"/>' },
    "arrow-left": { name: "ArrowLeft", path: '<path d="M19 12H5m0 0 7 7m-7-7 7-7"/>' },
    "arrow-up": { name: "ArrowUp", path: '<path d="M12 19V5m0 0-7 7m7-7 7 7"/>' },
    globe: { name: "Globe01", path: '<path d="M2 12h20M2 12c0 5.523 4.477 10 10 10M2 12C2 6.477 6.477 2 12 2m10 10c0 5.523-4.477 10-10 10m10-10c0-5.523-4.477-10-10-10m0 0a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10m0-20a15.3 15.3 0 0 0-4 10 15.3 15.3 0 0 0 4 10"/>' },
    sparkles: { name: "Stars01", path: '<path d="m6.5 13 .784 1.569c.266.53.399.796.576 1.026a3 3 0 0 0 .545.545c.23.177.495.31 1.026.575L11 17.5l-1.569.785c-.53.265-.796.398-1.026.575a3 3 0 0 0-.545.545c-.177.23-.31.495-.576 1.026L6.5 22l-.784-1.569c-.266-.53-.399-.796-.576-1.026a3 3 0 0 0-.545-.545c-.23-.177-.495-.31-1.026-.575L2 17.5l1.569-.785c.53-.265.796-.398 1.026-.575a3 3 0 0 0 .545-.545c.177-.23.31-.495.576-1.026L6.5 13ZM15 2l1.179 3.064c.282.734.423 1.1.642 1.409a3 3 0 0 0 .706.706c.309.22.675.36 1.409.642L22 9l-3.064 1.179c-.734.282-1.1.423-1.409.642a3 3 0 0 0-.706.706c-.22.309-.36.675-.642 1.409L15 16l-1.179-3.064c-.282-.734-.423-1.1-.642-1.409a3 3 0 0 0-.706-.706c-.309-.22-.675-.36-1.409-.642L8 9l3.064-1.179c.734-.282 1.1-.423 1.409-.642a3 3 0 0 0 .706-.706c.22-.309.36-.675.642-1.409L15 2Z"/>' },
    refresh: { name: "RefreshCw01", path: '<path d="M21 10s-2.005-2.732-3.634-4.362a9 9 0 1 0 2.282 8.862M21 10V4m0 6h-6"/>' },
    "file-search": { name: "FileSearch01", path: '<path d="M20 10.5V6.8c0-1.68 0-2.52-.327-3.162a3 3 0 0 0-1.311-1.311C17.72 2 16.88 2 15.2 2H8.8c-1.68 0-2.52 0-3.162.327a3 3 0 0 0-1.311 1.311C4 4.28 4 5.12 4 6.8v10.4c0 1.68 0 2.52.327 3.162a3 3 0 0 0 1.311 1.311C6.28 22 7.12 22 8.8 22h2.7M22 22l-1.5-1.5m1-2.5a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z"/>' },
    "external-link": { name: "LinkExternal01", path: '<path d="M21 9V3m0 0h-6m6 0-8 8m-3-6H7.8c-1.68 0-2.52 0-3.162.327a3 3 0 0 0-1.311 1.311C3 7.28 3 8.12 3 9.8v6.4c0 1.68 0 2.52.327 3.162a3 3 0 0 0 1.311 1.311C5.28 21 6.12 21 7.8 21h6.4c1.68 0 2.52 0 3.162-.327a3 3 0 0 0 1.311-1.311C19 18.72 19 17.88 19 16.2V14"/>' },
    inbox: { name: "Inbox01", path: '<path d="M2.5 12h3.382c.685 0 1.312.387 1.618 1 .306.613.933 1 1.618 1h5.764c.685 0 1.312-.387 1.618-1 .306-.613.933-1 1.618-1H21.5M8.967 4h6.066c1.077 0 1.616 0 2.091.164a3 3 0 0 1 1.121.693c.36.352.6.833 1.082 1.796l2.166 4.333c.19.378.284.567.35.765.06.177.102.357.128.541.029.207.029.418.029.841V15.2c0 1.68 0 2.52-.327 3.162a3 3 0 0 1-1.311 1.311C19.72 20 18.88 20 17.2 20H6.8c-1.68 0-2.52 0-3.162-.327a3 3 0 0 1-1.311-1.311C2 17.72 2 16.88 2 15.2v-2.067c0-.422 0-.634.029-.84.026-.184.068-.365.128-.541.066-.199.16-.388.35-.766l2.166-4.333c.482-.963.723-1.444 1.082-1.796a3 3 0 0 1 1.12-.693C7.352 4 7.89 4 8.968 4Z"/>' },
    home: { name: "Home01", path: '<path d="M3 10.565c0-.574 0-.861.074-1.126a2 2 0 0 1 .318-.65c.163-.22.39-.397.843-.75l6.783-5.275c.351-.273.527-.41.72-.462a1 1 0 0 1 .523 0c.194.052.37.189.721.462l6.783 5.275c.453.353.68.53.843.75.145.195.252.416.318.65.074.265.074.552.074 1.126V17.8c0 1.12 0 1.68-.218 2.108a2 2 0 0 1-.874.874C19.48 21 18.92 21 17.8 21H6.2c-1.12 0-1.68 0-2.108-.218a2 2 0 0 1-.874-.874C3 19.48 3 18.92 3 17.8v-7.235Z"/>' },
    chart: { name: "BarChart03", path: '<path d="M6 20V4m12 16v-4m-6 4V10"/>' },
    search: { name: "SearchLg", path: '<path d="m21 21-3.5-3.5m2.5-6a8.5 8.5 0 1 1-17 0 8.5 8.5 0 0 1 17 0Z"/>' },
    users: { name: "Users01", path: '<path d="M22 21v-2a4.002 4.002 0 0 0-3-3.874M15.5 3.291a4.001 4.001 0 0 1 0 7.418M17 21c0-1.864 0-2.796-.305-3.53a4 4 0 0 0-2.164-2.165C13.796 15 12.864 15 11 15H8c-1.864 0-2.796 0-3.53.305a4 4 0 0 0-2.166 2.164C2 18.204 2 19.136 2 21M13.5 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z"/>' }
  };

  function renderIcons(root = document) {
    $$('[data-icon]', root).forEach((host) => {
      const isBrand = host.dataset.icon === "hiver";
      const icon = isBrand ? { name: "HiverBrand", path: hiverBrandPath } : untitledIcons[host.dataset.icon];
      if (!icon || host.querySelector("svg")) return;
      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("viewBox", "0 0 24 24");
      svg.setAttribute("aria-hidden", "true");
      svg.setAttribute("focusable", "false");
      svg.dataset.iconSystem = isBrand ? "hiver-brand" : "untitled-ui";
      svg.dataset.iconName = icon.name;
      if (!isBrand) {
        svg.setAttribute("fill", "none");
        svg.setAttribute("stroke", "currentColor");
        svg.setAttribute("stroke-width", "2");
        svg.setAttribute("stroke-linecap", "round");
        svg.setAttribute("stroke-linejoin", "round");
      }
      svg.innerHTML = icon.path;
      host.replaceChildren(svg);
    });
  }

  function readState() {
    try {
      const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      return value && typeof value === "object" ? value : {};
    } catch {
      return {};
    }
  }

  function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function announce(message) {
    const region = $("#live-announcer");
    region.textContent = "";
    window.setTimeout(() => { region.textContent = message; }, 20);
  }

  function showScreen(id, restoring = false) {
    const target = $(`[data-screen="${id}"]`);
    if (!target) return;

    $$('[data-screen]').forEach((screen) => { screen.hidden = screen !== target; });
    document.body.classList.toggle("in-product", id === "home");
    document.body.dataset.activeScreen = id;
    state.screen = id;
    updateDots(id);

    if (id !== "learn") stopProcessing();
    if (id === "learn" && state.knowledgeStatus !== "complete") startProcessing();
    if (id === "learn") renderProcessing();
    if (id === "test") renderTestState();
    if (id === "invite") renderInvites();
    if (id === "ready") renderSummary();
    if (id === "home") renderHome();

    saveState();
    window.scrollTo({ top: 0, behavior: restoring ? "auto" : "smooth" });
    if (!restoring) {
      $("#main").focus({ preventScroll: true });
      announce(`${id} step opened`);
    }
  }

  function updateDots(id) {
    document.documentElement.style.setProperty("--journey-progress", String(Math.max(0, screens.indexOf(id))));
  }

  function syncChannels() {
    $$('input[name="channel"]').forEach((input) => {
      input.checked = state.channels.includes(input.value);
    });
    $$('[data-channel-visual]').forEach((signal) => {
      signal.classList.toggle("is-visible", state.channels.includes(signal.dataset.channelVisual));
    });
  }

  function changeChannel(input) {
    const value = input.value;
    if (value === "Not sure yet" && input.checked) {
      state.channels = [value];
    } else {
      state.channels = state.channels.filter((channel) => channel !== "Not sure yet");
      if (input.checked && !state.channels.includes(value)) state.channels.push(value);
      if (!input.checked) state.channels = state.channels.filter((channel) => channel !== value);
    }
    $("#channel-error").hidden = true;
    syncChannels();
    saveState();
  }

  function normaliseUrl(value) {
    const clean = value.trim();
    if (!clean) return "";
    return /^https?:\/\//i.test(clean) ? clean : `https://${clean}`;
  }

  function isPrivateHost(hostname) {
    const host = hostname.toLowerCase();
    if (host === "localhost" || host.endsWith(".local") || !host.includes(".")) return true;
    if (/^127\./.test(host) || /^10\./.test(host) || /^192\.168\./.test(host)) return true;
    const match = host.match(/^172\.(\d{1,3})\./);
    return Boolean(match && Number(match[1]) >= 16 && Number(match[1]) <= 31);
  }

  function setUrlError(message) {
    const field = $("#url-field");
    const error = $("#url-error");
    error.textContent = message;
    error.hidden = !message;
    field.classList.toggle("is-error", Boolean(message));
    $("#knowledge-url").toggleAttribute("aria-invalid", Boolean(message));
  }

  function acceptKnowledgeUrl() {
    const value = normaliseUrl($("#knowledge-url").value);
    if (!value) {
      setUrlError("Add a public website or help-centre link, or use the sample company.");
      return false;
    }
    try {
      const parsed = new URL(value);
      if (isPrivateHost(parsed.hostname)) {
        setUrlError("That address is private. Add a public website or help-centre link.");
        return false;
      }
      state.knowledgeUrl = parsed.href;
    } catch {
      setUrlError("Enter a complete website address, such as help.yourcompany.com.");
      return false;
    }
    setUrlError("");
    state.sampleMode = false;
    state.aiSkipped = false;
    state.knowledgeStatus = "idle";
    state.progress = 0;
    syncKnowledgeVisual();
    saveState();
    return true;
  }

  function domain() {
    if (state.sampleMode) return "hiver-sample.co";
    try { return new URL(state.knowledgeUrl).hostname.replace(/^www\./, ""); }
    catch { return "your company"; }
  }

  function syncKnowledgeVisual() {
    const value = domain();
    const visualDomain = $("#visual-domain");
    const learningDomain = $("#learning-domain");
    const agentDomain = $("#agent-domain");
    if (visualDomain) visualDomain.textContent = value;
    if (learningDomain) learningDomain.textContent = `Learning from ${value}`;
    if (agentDomain) agentDomain.textContent = value;
  }

  function startProcessing() {
    stopProcessing();
    if (state.progress >= 100) state.progress = 0;
    state.knowledgeStatus = "processing";
    renderProcessing();
    processingTimer = window.setInterval(() => {
      state.progress = Math.min(100, state.progress + 3);
      if (state.progress === 100) {
        state.knowledgeStatus = "complete";
        stopProcessing();
      }
      saveState();
      renderProcessing();
    }, 180);
  }

  function stopProcessing() {
    if (processingTimer) window.clearInterval(processingTimer);
    processingTimer = null;
  }

  function renderProcessing() {
    const progress = Math.max(0, Math.min(100, state.progress || 0));
    const rows = $$(".learning-step");
    const activeIndex = progress < 36 ? 0 : progress < 72 ? 1 : 2;
    const detail = [
      ["Reading public pages", `${Math.max(1, Math.ceil(progress / 9))} useful pages found`],
      ["Organising support topics", "Grouping policies and common questions"],
      ["Preparing test questions", "Building a safe private preview"]
    ];
    $("#processing-label").textContent = state.knowledgeStatus === "complete" ? "Your private AI agent is ready" : detail[activeIndex][0];
    const isComplete = state.knowledgeStatus === "complete";
    $("#processing-detail").textContent = isComplete ? "14 pages, 3 topics, and 3 test questions are ready." : "You can leave while Hiver learns.";
    syncKnowledgeVisual();

    const learningStory = $(".learning-story");
    if (learningStory) learningStory.dataset.learningPhase = isComplete ? "complete" : String(activeIndex);
    const liveLabel = $(".live-label");
    if (liveLabel) liveLabel.textContent = isComplete ? "Ready" : "Working";
    $("#processing-exit").hidden = isComplete;

    rows.forEach((row, index) => {
      const complete = state.knowledgeStatus === "complete" || index < activeIndex;
      const active = state.knowledgeStatus === "processing" && index === activeIndex;
      row.classList.toggle("is-complete", complete);
      row.classList.toggle("is-active", active);
      row.querySelector(":scope > i").textContent = complete ? "Complete" : active ? "Working" : "Waiting";
      const small = row.querySelector("small");
      if (index === 0) small.textContent = complete ? "14 useful pages" : active ? `${Math.max(1, Math.ceil(progress / 9))} useful pages found` : "Waiting";
      if (index === 1) small.textContent = complete ? "3 support topics" : active ? "Grouping company knowledge" : "Waiting";
      if (index === 2) small.textContent = complete ? "3 questions ready" : active ? "Preparing safe examples" : "Waiting";
    });

    $("#open-test").disabled = state.knowledgeStatus !== "complete";
  }

  function setProcessingState(next) {
    const message = $("#process-message");
    stopProcessing();
    message.hidden = false;
    if (next === "slow") {
      state.knowledgeStatus = "slow";
      message.textContent = "This is taking longer than usual. Your work is saved, so you can enter Hiver and return later.";
    } else if (next === "thin") {
      state.knowledgeStatus = "thin";
      message.textContent = "We found limited support content. Try a help-centre link or use the sample company.";
    } else if (next === "error") {
      state.knowledgeStatus = "error";
      message.textContent = "Hiver could not finish reading this source. Your URL is saved; try again when ready.";
    } else {
      message.hidden = true;
      state.knowledgeStatus = "processing";
      startProcessing();
    }
    saveState();
    renderProcessing();
  }

  function resetConversation() {
    window.clearTimeout(responseTimer);
    $("#conversation-body").innerHTML = `
      <div class="agent-intro"><span data-icon="sparkles"></span><p>I’m ready to answer from your company knowledge.</p></div>
      <div class="question-suggestions" id="suggestions">
        <span class="suggestions-label">Start here</span>
        <button data-question="How long do I have to return an order?">How long do I have to return an order?<span data-icon="arrow-right"></span></button>
        <button data-question="Can I change my delivery address?">Can I change my delivery address?<span data-icon="arrow-right"></span></button>
        <button data-question="When will my refund appear?">When will my refund appear?<span data-icon="arrow-right"></span></button>
      </div>`;
    renderIcons($("#conversation-body"));
    $("#evidence-empty").hidden = false;
    $("#evidence-content").hidden = true;
    $("#evidence-empty-title").textContent = "Source will appear here";
    $("#evidence-empty-copy").textContent = "Ask a question to see the page Hiver used.";
    $("#finish-test").disabled = true;
    $("#finish-test > span:first-child").textContent = "Ask a question to continue";
    state.testComplete = false;
    state.lastQuestion = "";
    saveState();
  }

  function renderTestState() {
    $("#source-url").textContent = `${domain()}/help/returns`;
    if (!state.testComplete || !state.lastQuestion) {
      resetConversation();
      return;
    }
    showAnswer(state.lastQuestion, true);
  }

  function showAnswer(question, restoring = false) {
    const body = $("#conversation-body");
    body.innerHTML = `<div class="message-row user"><div class="message-bubble">${escapeHtml(question)}</div></div>${restoring ? "" : '<div class="message-row agent thinking-message"><div class="message-bubble"><span>Checking your knowledge…</span><span class="thinking-dots" aria-hidden="true"><i></i><i></i><i></i></span></div></div>'}`;
    $("#evidence-empty").hidden = false;
    $("#evidence-content").hidden = true;
    $("#evidence-empty-title").textContent = restoring ? "Source will appear here" : "Finding the source…";
    $("#evidence-empty-copy").textContent = restoring ? "Ask a question to see the page Hiver used." : "Hiver is checking the pages it learned.";
    const finish = () => {
      body.querySelector(".thinking-message")?.remove();
      body.insertAdjacentHTML("beforeend", '<div class="message-row agent"><div class="message-bubble"><p>You can return an unused item within <strong>30 days of delivery</strong>, provided it is in its original packaging.</p><p>Once approved, the refund is sent to the original payment method.</p><div class="answer-source-chip"><span data-icon="file-search"></span>Based on Returns and refunds</div></div></div>');
      renderIcons(body);
      $("#evidence-empty").hidden = true;
      $("#evidence-content").hidden = false;
      $("#source-url").textContent = `${domain()}/help/returns`;
      $("#finish-test").disabled = false;
      $("#finish-test > span:first-child").textContent = "Continue";
      state.testComplete = true;
      state.lastQuestion = question;
      saveState();
      body.scrollTop = body.scrollHeight;
    };
    if (restoring) finish();
    else responseTimer = window.setTimeout(finish, 1600);
  }

  function askQuestion(question) {
    const clean = question.trim();
    if (!clean) return;
    window.clearTimeout(responseTimer);
    $("#question-input").value = "";
    showAnswer(clean);
  }

  function escapeHtml(value) {
    return value.replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character]);
  }

  function renderInvites() {
    $("#invite-list").innerHTML = state.invites.map((email) => `<div class="invite-item"><span>${escapeHtml(email)}</span><button type="button" data-remove-invite="${escapeHtml(email)}">Remove</button></div>`).join("");
  }

  function addInvite() {
    const input = $("#invite-input");
    const error = $("#invite-error");
    const email = input.value.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      error.textContent = "Enter a valid work email.";
      error.hidden = false;
      return;
    }
    if (!state.invites.includes(email)) state.invites.push(email);
    input.value = "";
    error.hidden = true;
    state.inviteSkipped = false;
    saveState();
    renderInvites();
  }

  function renderSummary() {
    $("#summary-source").textContent = state.aiSkipped ? "Add after onboarding" : domain();
    $("#summary-test").textContent = state.testComplete ? "One grounded answer tested" : "Ready to test later";
    $("#summary-channels").textContent = state.channels.length ? state.channels.join(", ") : "Choose later";
  }

  function renderHome() {
    const first = state.channels.find((channel) => channel !== "Not sure yet") || "email";
    $("#connect-title").textContent = `Connect ${first.toLowerCase()} first`;
    $("#connect-copy").textContent = `Bring ${first.toLowerCase()} conversations into your unified queue when you are ready.`;
    $("#home-pages").textContent = state.aiSkipped ? "Not added" : "14 pages";
    $("#home-knowledge-status").textContent = state.aiSkipped ? "Add a source when ready" : `Learned from ${domain()}`;
    $("#home-test-status").textContent = state.testComplete ? "1 answer tested" : "Ready to test";
    $("#home-question").textContent = state.lastQuestion || "Your private preview is saved.";
    $("#home-team-status").textContent = state.invites.length ? `${state.invites.length} invited` : "Invite later";
  }

  function bindEvents() {
    $$('input[name="channel"]').forEach((input) => input.addEventListener("change", () => changeChannel(input)));

    $("#continue-channels").addEventListener("click", () => {
      if (!state.channels.length) {
        $("#channel-error").hidden = false;
        return;
      }
      showScreen("knowledge");
    });

    $("#clear-url").addEventListener("click", () => {
      $("#knowledge-url").value = "";
      setUrlError("");
      $("#knowledge-url").focus();
    });
    $("#knowledge-url").addEventListener("input", () => {
      setUrlError("");
      const raw = $("#knowledge-url").value.trim();
      if (!raw) {
        $("#visual-domain").textContent = "yourcompany.com";
        return;
      }
      try {
        const parsed = new URL(normaliseUrl(raw));
        $("#visual-domain").textContent = parsed.hostname.replace(/^www\./, "");
      } catch {
        $("#visual-domain").textContent = raw.replace(/^https?:\/\//, "").split("/")[0] || "yourcompany.com";
      }
    });
    $("#knowledge-form").addEventListener("submit", (event) => {
      event.preventDefault();
      if (acceptKnowledgeUrl()) showScreen("learn");
    });
    $("#continue-knowledge").addEventListener("click", () => {
      if (acceptKnowledgeUrl()) showScreen("learn");
    });
    $("#use-sample").addEventListener("click", () => {
      state.sampleMode = true;
      state.aiSkipped = false;
      state.knowledgeUrl = "https://hiver-sample.co/help";
      state.knowledgeStatus = "idle";
      state.progress = 0;
      $("#knowledge-url").value = "hiver-sample.co/help";
      setUrlError("");
      syncKnowledgeVisual();
      saveState();
      showScreen("learn");
    });

    $$('[data-processing-state]').forEach((button) => button.addEventListener("click", () => setProcessingState(button.dataset.processingState)));
    $("#open-test").addEventListener("click", () => showScreen("test"));
    $("#restart-test").addEventListener("click", resetConversation);
    $("#conversation-body").addEventListener("click", (event) => {
      const button = event.target.closest("[data-question]");
      if (button) askQuestion(button.dataset.question);
    });
    $("#question-form").addEventListener("submit", (event) => {
      event.preventDefault();
      askQuestion($("#question-input").value);
    });
    $("#finish-test").addEventListener("click", () => showScreen("invite"));

    $("#invite-form").addEventListener("submit", (event) => {
      event.preventDefault();
      addInvite();
    });
    $("#invite-list").addEventListener("click", (event) => {
      const button = event.target.closest("[data-remove-invite]");
      if (!button) return;
      state.invites = state.invites.filter((email) => email !== button.dataset.removeInvite);
      saveState();
      renderInvites();
    });
    $("#continue-invite").addEventListener("click", () => showScreen("ready"));
    $("#skip-invite").addEventListener("click", () => {
      state.inviteSkipped = true;
      saveState();
      showScreen("ready");
    });
    $("#enter-omni").addEventListener("click", () => showScreen("home"));

    $$('[data-go]').forEach((button) => button.addEventListener("click", () => showScreen(button.dataset.go)));
    $$('[data-skip-to]').forEach((button) => button.addEventListener("click", () => {
      state.aiSkipped = true;
      saveState();
      showScreen(button.dataset.skipTo);
    }));
    $$('[data-restart-journey]').forEach((button) => button.addEventListener("click", () => {
      localStorage.removeItem(STORAGE_KEY);
      window.location.reload();
    }));
    $(".brand").addEventListener("click", (event) => {
      event.preventDefault();
      showScreen("channels");
    });
  }

  function initialise() {
    renderIcons();
    bindEvents();
    syncChannels();
    $("#knowledge-url").value = state.knowledgeUrl ? state.knowledgeUrl.replace(/^https?:\/\//, "") : "";
    syncKnowledgeVisual();
    const validScreen = [...screens, "home"].includes(state.screen) ? state.screen : "channels";
    showScreen(validScreen, true);
  }

  initialise();
})();
