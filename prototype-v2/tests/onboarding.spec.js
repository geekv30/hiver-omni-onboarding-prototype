const assert = require("node:assert/strict");

async function reset(page, baseUrl) {
  await page.goto(baseUrl);
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.waitForTimeout(220);
}

async function assertUntitledIconSystem(page) {
  const audit = await page.evaluate(() => [...document.querySelectorAll('[data-icon]:not([data-icon="hiver"])')].map((host) => {
    const svg = host.querySelector("svg");
    return {
      icon: host.dataset.icon,
      system: svg?.dataset.iconSystem || "",
      sourceName: svg?.dataset.iconName || "",
      strokeWidth: svg?.getAttribute("stroke-width") || "",
      linecap: svg?.getAttribute("stroke-linecap") || "",
      linejoin: svg?.getAttribute("stroke-linejoin") || ""
    };
  }));
  assert.ok(audit.length > 0, "The interface must render functional icons");
  const inconsistent = audit.filter((icon) => icon.system !== "untitled-ui" || !icon.sourceName || icon.strokeWidth !== "2" || icon.linecap !== "round" || icon.linejoin !== "round");
  assert.deepEqual(inconsistent, [], `Every functional icon must render from Untitled UI: ${JSON.stringify(inconsistent)}`);
}

async function assertNoOverflow(page) {
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth), true, "The active view must not overflow horizontally");
}

async function assertUsEnglish(page) {
  const copy = await page.evaluate(() => {
    const attributes = [...document.querySelectorAll("[placeholder], [aria-label], [alt]")]
      .flatMap((node) => [node.getAttribute("placeholder"), node.getAttribute("aria-label"), node.getAttribute("alt")])
      .filter(Boolean);
    return `${document.body.textContent} ${attributes.join(" ")}`;
  });
  assert.doesNotMatch(copy, /\b(centre|organising|personalise|colour)\b/i, "The onboarding must use U.S. English throughout");
}

async function assertReadableArtwork(page) {
  const audit = await page.evaluate(() => {
    const images = [...document.querySelectorAll(".auth-art, .story-art")].map((image) => ({
      src: image.getAttribute("src"),
      loaded: image.naturalWidth > 0
    }));
    const overlays = [document.querySelector(".auth-atmosphere"), ...document.querySelectorAll(".story-tint")].map((node) => {
      const styles = getComputedStyle(node);
      return styles.backdropFilter || styles.webkitBackdropFilter || "none";
    });
    return { images, overlays };
  });
  assert.equal(audit.images.length, 5, "Every onboarding scene must have an artwork asset");
  assert.equal(audit.images.every((image) => image.loaded), true, "Every onboarding artwork asset must load");
  assert.equal(audit.images.every((image) => /-glass-v2\.png$/.test(image.src)), true, "V2 must use the refined frosted artwork assets");
  assert.equal(audit.overlays.every((value) => value.includes("blur")), true, "Every artwork must have a subtle readability blur layer");
}

async function completeGoogleSignup(page, artifactDir) {
  await page.getByRole("button", { name: "Continue with Google" }).click();
  await page.getByRole("dialog", { name: "Continue with Google" }).waitFor();
  assert.equal(await page.getByRole("heading", { name: "Choose an account" }).count(), 1, "Google signup must include the account chooser");
  await page.screenshot({ path: `${artifactDir}/desktop-auth-account.png` });
  await page.getByRole("button", { name: /Varun at Hiver/ }).click();
  assert.equal(await page.getByRole("heading", { name: "Allow Hiver Omni" }).count(), 1, "A new Google signup must include consent");
  assert.equal(await page.getByText("See your name and work email", { exact: true }).count(), 1, "Consent must explain the requested profile information");
  await page.screenshot({ path: `${artifactDir}/desktop-auth-consent.png` });
  await page.getByRole("button", { name: "Allow and continue" }).click();
}

async function runTests({ browser, baseUrl, artifactDir }) {
  const context = await browser.newContext({ viewport: { width: 1117, height: 863 }, reducedMotion: "reduce" });
  const page = await context.newPage();
  await reset(page, baseUrl);

  assert.equal(await page.locator('[data-screen="auth"]:visible').count(), 1, "The complete journey must begin with signup");
  assert.equal(await page.getByRole("button", { name: "Continue with Google" }).count(), 1);
  assert.equal(await page.getByRole("button", { name: "Continue with Microsoft" }).count(), 1);
  assert.equal(await page.getByRole("button", { name: "Continue with work email" }).count(), 1);
  assert.match(await page.locator("#auth-title").textContent(), /Meet your AI support agent/);
  await assertUsEnglish(page);
  await assertReadableArtwork(page);
  await page.screenshot({ path: `${artifactDir}/desktop-auth.png` });
  await assertNoOverflow(page);
  await assertUntitledIconSystem(page);

  await completeGoogleSignup(page, artifactDir);
  await page.locator('[data-screen="channels"]:visible').waitFor();
  assert.deepEqual(await page.locator(".journey-rail li").allTextContents(), ["Channels", "AI agent", "Invite", "Ready"], "The visible journey must read as four coherent stages");
  const headerAudit = await page.locator(".global-header").evaluate((node) => {
    const styles = getComputedStyle(node);
    const background = styles.backgroundColor.match(/[\d.]+/g)?.map(Number) || [];
    return { position: styles.position, alpha: background.length === 4 ? background[3] : 1, border: styles.borderBottomWidth };
  });
  assert.equal(headerAudit.position, "sticky", "Progress must live in its own layout row instead of floating across the artwork");
  assert.equal(headerAudit.alpha, 1, "The progress bar must have an opaque surface so artwork cannot collide with it");
  assert.notEqual(headerAudit.border, "0px", "The progress row needs a clear boundary from the screen below");
  const headerRect = await page.locator(".global-header").evaluate((node) => ({ top: node.getBoundingClientRect().top, height: node.getBoundingClientRect().height }));
  assert.equal(headerRect.top, 0, "The progress row must remain fully visible at the top of the viewport");
  assert.equal(headerRect.height, 74);
  assert.ok(await page.locator(".channel-story .story-art").evaluate((image) => image.naturalWidth > 0), "The shared onboarding artwork must load in V2");
  assert.equal(await page.locator(".onboarding-screen[data-screen=knowledge], .onboarding-screen[data-screen=learn], .onboarding-screen[data-screen=test]").count(), 0, "Knowledge, learning, and testing must not remain separate screens");
  await page.locator("label.channel-option", { hasText: "Email" }).click();
  await page.locator("label.channel-option", { hasText: "Chat" }).click();
  await page.screenshot({ path: `${artifactDir}/desktop-channels.png` });
  await page.getByRole("button", { name: /^Continue/ }).click();

  await page.locator('[data-screen="agent"]:visible').waitFor();
  assert.equal(await page.locator("#agent-title").textContent(), "Build your AI support agent.");
  assert.equal(await page.locator(".agent-studio").getAttribute("data-agent-state"), "empty", "The agent must begin visibly dormant");
  assert.equal(await page.locator("#agent-question").isDisabled(), true, "The playground must stay visible but unavailable before knowledge is added");
  assert.match(await page.locator(".agent-state-copy").textContent(), /Add your website to start/);
  assert.equal(await page.locator(".agent-orb").count(), 1, "The AI agent needs a distinct living identity");
  assert.equal(await page.locator(".agent-phase").count(), 0, "The agent screen must progressively disclose one state instead of stacking three substeps");
  assert.equal(await page.locator("#continue-agent").isHidden(), true, "A disabled continue button must not compete with the source task");
  assert.equal(await page.locator("#agent-ready-guidance").isHidden(), true);
  await page.screenshot({ path: `${artifactDir}/desktop-agent-empty.png` });

  await page.locator("#knowledge-url").fill("localhost/private");
  await page.locator("#build-agent").click();
  await page.getByText("That address is private", { exact: false }).waitFor();
  await page.locator("#knowledge-url").fill("help.acme.test/support");
  await page.locator("#build-agent").click();
  assert.equal(await page.locator('[data-screen="agent"]:visible').count(), 1, "Building knowledge must not navigate away from the agent workspace");
  assert.equal(await page.locator(".agent-studio").getAttribute("data-agent-state"), "learning");
  assert.equal(await page.locator(".agent-orb").getAttribute("data-live"), "true", "The agent identity must visibly come alive while learning");
  assert.equal(await page.locator("#agent-source-form").isHidden(), true, "Learning must replace the source form rather than stack beneath it");
  assert.equal(await page.locator("#agent-progress").isVisible(), true);
  assert.equal(await page.getByText("Reading public pages", { exact: true }).count(), 1);
  await assertUsEnglish(page);
  await page.screenshot({ path: `${artifactDir}/desktop-agent-learning.png` });

  await page.waitForFunction(() => document.querySelector(".agent-studio")?.dataset.agentState === "ready", null, { timeout: 12000 });
  assert.equal(await page.locator("#agent-question").isEnabled(), true, "The same playground must become interactive when learning finishes");
  assert.equal(await page.getByText("Your agent is ready", { exact: true }).count(), 1);
  assert.equal(await page.locator("#agent-ready-guidance").isVisible(), true, "The left side must clearly point the user to the playground");
  assert.equal(await page.locator("#continue-agent").isHidden(), true, "Continue must stay absent until the user has tested the agent");
  assert.equal(await page.locator(".question-suggestions button").count(), 3);
  await page.screenshot({ path: `${artifactDir}/desktop-agent-ready.png` });

  await page.getByRole("button", { name: "How long do I have to return an order?" }).click();
  assert.equal(await page.getByText("Checking your content…", { exact: true }).count(), 1);
  await page.waitForTimeout(650);
  assert.equal(await page.getByText("30 days from delivery", { exact: true }).count(), 0, "The answer must not appear unrealistically fast");
  await page.getByText("30 days from delivery", { exact: true }).waitFor();
  assert.equal(await page.locator(".agent-studio").getAttribute("data-agent-state"), "tested");
  assert.equal(await page.getByText("Source used", { exact: true }).count(), 1);
  assert.equal(await page.getByText("This answer came from this page.", { exact: true }).count(), 1);
  assert.equal(await page.getByText("Source confirmed · Not live", { exact: true }).count(), 1);
  assert.match(await page.locator("#continue-agent").textContent(), /Continue/);
  assert.equal(await page.locator("#continue-agent").isVisible(), true);
  await page.screenshot({ path: `${artifactDir}/desktop-agent-tested.png` });
  await page.locator("#continue-agent").click();

  await page.locator('[data-screen="invite"]:visible').waitFor();
  await page.getByLabel("Work email").fill("person@acme.test");
  await page.getByRole("button", { name: "Add" }).click();
  assert.equal(await page.getByText("person@acme.test", { exact: true }).count(), 1);
  await page.screenshot({ path: `${artifactDir}/desktop-invite.png` });
  await page.locator("#continue-invite").click();

  await page.locator('[data-screen="ready"]:visible').waitFor();
  assert.equal(await page.getByText("SLAs", { exact: true }).count(), 1, "Ready must advertise later setup without making it mandatory");
  assert.equal(await page.getByText("Automations", { exact: true }).count(), 1);
  assert.equal(await page.getByText("Tags", { exact: true }).count(), 1);
  assert.equal(await page.getByText("Routing", { exact: true }).count(), 1);
  assert.match(await page.locator("#ready-title").textContent(), /Your AI agent is ready/);
  await assertUsEnglish(page);
  const agentPaints = await page.locator(".agent-presence").evaluateAll((nodes) => nodes.map((node) => getComputedStyle(node).backgroundImage));
  assert.equal(new Set(agentPaints).size, 1, "Every agent avatar must reuse one visual identity across onboarding and the product handoff");
  await page.screenshot({ path: `${artifactDir}/desktop-ready.png` });
  await page.getByRole("button", { name: /Enter Hiver Omni/ }).click();
  await page.getByRole("heading", { name: /Good morning/ }).waitFor();
  await page.screenshot({ path: `${artifactDir}/desktop-setup-home.png` });

  await page.reload();
  await page.getByRole("heading", { name: /Good morning/ }).waitFor();
  await page.getByRole("button", { name: "Restart journey" }).click();
  await page.locator('[data-screen="auth"]:visible').waitFor();
  const resetState = await page.evaluate(() => JSON.parse(localStorage.getItem("hiver-ai-onboarding-v3") || "{}"));
  assert.equal(resetState.screen, "auth");
  await context.close();

  const emailContext = await browser.newContext({ viewport: { width: 1117, height: 863 }, reducedMotion: "reduce" });
  const emailPage = await emailContext.newPage();
  await reset(emailPage, baseUrl);
  await emailPage.getByRole("button", { name: "Continue with work email" }).click();
  await emailPage.getByLabel("Work email address").fill("varun@hiverhq.com");
  await emailPage.getByRole("button", { name: "Send verification code" }).click();
  assert.equal(await emailPage.getByRole("heading", { name: "Check your email" }).count(), 1, "Email signup must represent verification");
  await emailPage.getByLabel("Six-digit verification code").fill("246810");
  await emailPage.getByRole("button", { name: "Verify and continue" }).click();
  await emailPage.locator('[data-screen="channels"]:visible').waitFor();
  await emailContext.close();

  const mobileContext = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: "reduce" });
  const mobile = await mobileContext.newPage();
  await reset(mobile, baseUrl);
  await mobile.screenshot({ path: `${artifactDir}/mobile-auth.png`, fullPage: true });
  await assertNoOverflow(mobile);
  await mobile.getByRole("button", { name: "Continue with Google" }).click();
  await mobile.getByRole("button", { name: /Varun at Hiver/ }).click();
  await mobile.getByRole("button", { name: "Allow and continue" }).click();
  await mobile.locator("label.channel-option", { hasText: "Email" }).click();
  await mobile.getByRole("button", { name: /^Continue/ }).click();
  await mobile.screenshot({ path: `${artifactDir}/mobile-agent-empty.png`, fullPage: true });
  await assertNoOverflow(mobile);
  assert.ok(Number.parseFloat(await mobile.locator("#agent-title").evaluate((node) => getComputedStyle(node).fontSize)) >= 38, "Mobile agent title must keep strong hierarchy");
  await mobileContext.close();
}

module.exports = { runTests };
