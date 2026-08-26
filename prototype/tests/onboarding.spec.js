const assert = require("node:assert/strict");

async function reset(page, baseUrl) {
  await page.goto(baseUrl);
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.waitForTimeout(280);
}

async function assertCraftedShell(page, { mobile = false } = {}) {
  const layout = await page.evaluate(() => {
    const stage = document.querySelector(".onboarding-screen:not([hidden])");
    const shell = stage?.querySelector(".experience-shell");
    const task = stage?.querySelector(".task-pane");
    const story = stage?.querySelector(".story-pane");
    const title = task?.querySelector("h1");
    const firstControl = task?.querySelector(".choice-grid, .field-stack, .learning-status, .invite-panel, .completion-summary");
    const taskRect = task?.getBoundingClientRect();
    const storyRect = story?.getBoundingClientRect();
    const titleRect = title?.getBoundingClientRect();
    const controlRect = firstControl?.getBoundingClientRect();
    return {
      hasShell: Boolean(shell),
      viewportWidth: innerWidth,
      task: taskRect && { left: taskRect.left, right: taskRect.right, width: taskRect.width, top: taskRect.top },
      story: storyRect && { left: storyRect.left, right: storyRect.right, width: storyRect.width, top: storyRect.top },
      titleSize: title ? Number.parseFloat(getComputedStyle(title).fontSize) : 0,
      titleLeft: titleRect?.left || 0,
      controlLeft: controlRect?.left || 0,
      legacyDots: document.querySelectorAll(".step-dots").length,
      artLoaded: [...document.querySelectorAll(".story-pane img")].some((image) => image.complete && image.naturalWidth > 0)
    };
  });
  assert.equal(layout.hasShell, true, "Every onboarding step must use the same full-screen experience shell");
  assert.equal(layout.legacyDots, 0, "The rejected floating progress dots must not return");
  assert.equal(layout.artLoaded, true, "The story pane must contain a real, loaded visual asset");
  assert.ok(Math.abs(layout.titleLeft - layout.controlLeft) <= 1, "The title and the first task control must share one exact left edge");

  if (mobile) {
    assert.ok(layout.task.width <= layout.viewportWidth, "The mobile task pane must fit the viewport");
    assert.ok(layout.story.width <= layout.viewportWidth, "The mobile story pane must fit the viewport");
    assert.ok(layout.story.top < layout.task.top, "The compact story should introduce the task on mobile");
    assert.ok(layout.titleSize >= 38, `Mobile title has insufficient hierarchy: ${layout.titleSize}px`);
  } else {
    assert.ok(layout.task.left < layout.story.left, "The task pane must sit to the left of the visual story");
    assert.ok(layout.story.width > layout.task.width, "The visual story must receive the larger share of the canvas");
    assert.ok(layout.task.width >= 430 && layout.task.width <= 580, `Task pane width is uncontrolled: ${layout.task.width}px`);
    assert.ok(layout.story.right <= layout.viewportWidth, "The visual story must stay inside the viewport");
    assert.ok(layout.titleSize >= 46 && layout.titleSize <= 68, `Desktop title hierarchy is wrong: ${layout.titleSize}px`);
  }

  const missingIcons = await page.evaluate(() => [...document.querySelectorAll("[data-icon]")].filter((node) => !node.querySelector("svg")).map((node) => node.getAttribute("data-icon")));
  assert.deepEqual(missingIcons, [], `Every functional icon must use the same rendered icon system: ${missingIcons.join(", ")}`);
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
  assert.deepEqual(inconsistent, [], `Every functional icon must render from the Untitled UI system: ${JSON.stringify(inconsistent)}`);
}

async function runTests({ browser, baseUrl, artifactDir }) {
  const context = await browser.newContext({ viewport: { width: 1117, height: 863 }, reducedMotion: "reduce" });
  const page = await context.newPage();
  await reset(page, baseUrl);

  await assertCraftedShell(page);
  await assertUntitledIconSystem(page);
  const storyArt = await page.evaluate(() => Object.fromEntries(
    [...document.querySelectorAll(".onboarding-screen")].map((screen) => {
      const image = screen.querySelector(".story-art");
      return [screen.dataset.screen, {
        src: image?.getAttribute("src") || "",
        alt: image?.getAttribute("alt") || "",
        loaded: Boolean(image?.complete && image?.naturalWidth > 0)
      }];
    })
  ));
  assert.ok(Object.values(storyArt).every((art) => art.loaded), "Every onboarding illustration must load before the journey begins");
  assert.ok(Object.values(storyArt).every((art) => art.alt.trim().length > 0), "Every onboarding illustration must describe its meaning");
  assert.ok(new Set(Object.values(storyArt).map((art) => art.src)).size >= 4, "The onboarding must use a varied illustration sequence instead of repeating one background");
  assert.equal(Object.values(storyArt).some((art) => /outlook-knowledge-tree\.png$/.test(art.src)), false, "The rejected centre-tree illustration must not appear anywhere in onboarding");
  assert.match(storyArt.channels.src, /outlook-river-convergence\.png$/, "Channels must open with the convergence illustration");
  assert.match(storyArt.knowledge.src, /knowledge-landscape\.webp$/, "Knowledge creation must use the established knowledge landscape");
  assert.equal(storyArt.learn.src, storyArt.knowledge.src, "Knowledge creation and learning must remain one continuous visual chapter");
  assert.match(storyArt.test.src, /outlook-human-ai-handoff\.png$/, "The AI test must introduce the human and AI handoff illustration");
  assert.equal(storyArt.invite.src, storyArt.test.src, "Testing and inviting the team must remain one continuous human and AI chapter");
  assert.match(storyArt.ready.src, /outlook-workspace-ready\.png$/, "The final step must end with the ready-workspace illustration");
  assert.equal(await page.locator(".onboarding-screen .stage-copy > .stage-kicker").count(), 0, "Every onboarding step must use the same three-level hierarchy: step label, title, description");
  assert.equal(await page.locator("#channels-title").textContent(), "Where do customers reach you?", "The first decision must use one concise question");
  assert.equal(await page.locator(".channel-option small").count(), 0, "Channel choices must not carry secondary descriptions");
  const storyHeadingColor = await page.locator(".channel-story .story-heading").evaluate((heading) => getComputedStyle(heading).color);
  assert.notEqual(storyHeadingColor, "rgb(255, 255, 255)", "The story heading must not blend into the light illustration");
  const integratedStoryElements = await page.evaluate(() => [".hiver-destination", ".agent-core"].map((selector) => {
    const style = getComputedStyle(document.querySelector(selector));
    return { selector, backdrop: style.backdropFilter || style.webkitBackdropFilter };
  }));
  assert.ok(integratedStoryElements.every((element) => element.backdrop === "none"), `Story elements must use the illustration's paper language instead of glass cards: ${JSON.stringify(integratedStoryElements)}`);
  await page.locator("label.channel-option", { hasText: "Email" }).click();
  await page.locator("label.channel-option", { hasText: "Chat" }).click();
  assert.equal(await page.locator(".channel-signal.is-visible").count(), 2, "The visual story must respond to selected channels");
  const channelSignalCraft = await page.locator(".channel-signal.is-visible").evaluateAll((signals) => signals.map((signal) => {
    const style = getComputedStyle(signal);
    return { backdrop: style.backdropFilter || style.webkitBackdropFilter, radius: style.borderRadius };
  }));
  assert.ok(channelSignalCraft.every((signal) => signal.backdrop === "none"), `Channel signals must be paper elements, not glass chips: ${JSON.stringify(channelSignalCraft)}`);
  assert.ok(channelSignalCraft.every((signal) => new Set(signal.radius.split(" ")).size > 1), `Channel signals must use the illustration's irregular paper shape: ${JSON.stringify(channelSignalCraft)}`);
  await page.screenshot({ path: `${artifactDir}/desktop-channels.png` });
  await page.getByRole("button", { name: /^Continue/ }).click();
  const knowledgeActions = await page.evaluate(() => {
    const stage = document.querySelector('[data-screen="knowledge"]');
    const primary = stage.querySelector(".primary-button").getBoundingClientRect();
    const skip = stage.querySelector(".text-button").getBoundingClientRect();
    const back = stage.querySelector(".back-button").getBoundingClientRect();
    return { primaryTop: primary.top, primaryBottom: primary.bottom, skipTop: skip.top, backTop: back.top };
  });
  assert.ok(Math.abs(knowledgeActions.primaryTop - knowledgeActions.skipTop) <= 8, "Primary and skip actions must form one clear decision row");
  assert.ok(knowledgeActions.backTop >= knowledgeActions.primaryBottom, "Back must sit on a separate row below the forward actions");

  await page.locator("#knowledge-url").fill("localhost/private");
  await page.locator("#continue-knowledge").click();
  await page.getByText("That address is private", { exact: false }).waitFor();
  await page.locator("#knowledge-url").fill("help.acme.test/support");
  await page.screenshot({ path: `${artifactDir}/desktop-knowledge.png` });
  await page.locator("#continue-knowledge").click();

  assert.equal(await page.locator('[data-screen="learn"]:visible .back-button').count(), 1, "The learning step must let users return to the knowledge source");

  await page.waitForFunction(() => !document.querySelector("#open-test").disabled, null, { timeout: 12000 });
  assert.equal(await page.locator(".live-label").textContent(), "Ready", "Completed learning must not continue to claim it is working");
  assert.equal(await page.getByRole("button", { name: "Enter Hiver while this runs" }).isVisible(), false, "The background-processing exit must disappear once the agent is ready");
  const learningType = await page.evaluate(() => ({
    title: Number.parseFloat(getComputedStyle(document.querySelector(".learning-step b")).fontSize),
    detail: Number.parseFloat(getComputedStyle(document.querySelector(".learning-step small")).fontSize),
    state: Number.parseFloat(getComputedStyle(document.querySelector(".learning-step > i")).fontSize)
  }));
  assert.ok(Object.values(learningType).every((size) => size >= 11), `Learning details must remain readable: ${JSON.stringify(learningType)}`);
  const processingVisual = await page.evaluate(() => ({
    fakePercentage: document.querySelectorAll("#progress-value, .progress-track").length,
    rows: document.querySelectorAll(".learning-step").length,
    rowLefts: [...document.querySelectorAll(".learning-step")].map((row) => row.getBoundingClientRect().left),
    sourceSheets: document.querySelectorAll(".source-sheet").length
  }));
  assert.equal(processingVisual.fakePercentage, 0, "The learning state must not show a made-up percentage");
  assert.equal(processingVisual.rows, 3);
  assert.ok(processingVisual.rowLefts.every((left) => Math.abs(left - processingVisual.rowLefts[0]) <= 1));
  assert.ok(processingVisual.sourceSheets >= 5, "The learning visual must show company pages becoming knowledge");
  assert.equal(await page.locator(".question-preview-stack > p").count(), 3, "Learning must visibly produce all three prepared test questions");
  const learningOverlap = await page.evaluate(() => {
    const stack = document.querySelector(".question-preview-stack").getBoundingClientRect();
    return [...document.querySelectorAll(".learning-visual .source-sheet")].some((sheet) => {
      const rect = sheet.getBoundingClientRect();
      return rect.left < stack.right && rect.right > stack.left && rect.top < stack.bottom && rect.bottom > stack.top;
    });
  });
  assert.equal(learningOverlap, false, "Prepared questions must not float over another illustration card");
  await page.screenshot({ path: `${artifactDir}/desktop-learning.png` });
  await page.getByRole("button", { name: /Test my AI agent/ }).click();

  assert.equal(await page.locator("#test-title").textContent(), "Try your AI agent.", "The test screen must state one clear action");
  assert.match(await page.locator("#test-instruction").textContent(), /Choose a question in the preview.*Continue unlocks after Hiver answers\./, "The test screen must explain both the action and the locked button");
  assert.equal(await page.getByText("Start here", { exact: true }).count(), 1, "The interactive preview must visibly mark where to begin");
  assert.equal(await page.locator('[data-screen="test"]:visible .back-button').count(), 1, "The test step must let users return to learning");
  assert.equal(await page.locator("#finish-test").textContent().then((text) => text.trim().replace(/\s+/g, " ")), "Ask a question to continue", "The disabled action must explain how it unlocks");
  assert.equal(await page.locator(".test-guidance").count(), 0, "The test screen must not repeat instructions in a separate guidance block");
  const agentHeaderAlignment = await page.evaluate(() => {
    const avatar = document.querySelector(".agent-avatar").getBoundingClientRect();
    const icon = document.querySelector(".agent-avatar svg").getBoundingClientRect();
    return Math.abs((avatar.left + avatar.width / 2) - (icon.left + icon.width / 2)) + Math.abs((avatar.top + avatar.height / 2) - (icon.top + icon.height / 2));
  });
  assert.ok(agentHeaderAlignment <= 2, `The agent icon must be optically centred in its header: ${agentHeaderAlignment}px`);

  await page.getByRole("button", { name: "How long do I have to return an order?" }).click();
  assert.equal(await page.getByText("Checking your knowledge…", { exact: true }).count(), 1, "A visible thinking state must bridge the question and answer");
  await page.screenshot({ path: `${artifactDir}/desktop-ai-thinking.png` });
  await page.waitForTimeout(700);
  assert.equal(await page.getByText("30 days of delivery", { exact: true }).count(), 0, "The grounded answer must not appear unrealistically fast");
  await page.getByText("30 days of delivery", { exact: true }).waitFor();
  assert.equal(await page.getByText("Source used", { exact: true }).count(), 1, "The supporting page must use plain-language source framing");
  assert.equal(await page.getByText("Answer evidence", { exact: true }).count(), 0, "The unclear evidence label must be removed");
  assert.equal(await page.getByText("High confidence", { exact: true }).count(), 0, "Confidence jargon must not compete with the source itself");
  assert.match(await page.locator("#finish-test").textContent(), /Continue/, "The action must become Continue after Hiver answers");
  await page.screenshot({ path: `${artifactDir}/desktop-ai-test.png` });
  await page.getByRole("button", { name: /^Continue/ }).click();

  await page.getByLabel("Work email").fill("person@acme.test");
  await page.getByRole("button", { name: "Add" }).click();
  assert.equal(await page.getByText("person@acme.test", { exact: true }).count(), 1);
  await page.screenshot({ path: `${artifactDir}/desktop-invite.png` });
  await page.locator("#continue-invite").click();

  await page.locator("#ready-title").waitFor();
  await page.waitForTimeout(120);
  assert.equal(await page.locator("[data-screen=ready]:visible .completion-summary > div").count(), 3);
  const summaryType = await page.evaluate(() => ({
    label: Number.parseFloat(getComputedStyle(document.querySelector(".completion-summary small")).fontSize),
    value: Number.parseFloat(getComputedStyle(document.querySelector(".completion-summary b")).fontSize),
    state: Number.parseFloat(getComputedStyle(document.querySelector(".completion-summary em")).fontSize)
  }));
  assert.ok(Object.values(summaryType).every((size) => size >= 11), `Final summary text must remain readable: ${JSON.stringify(summaryType)}`);
  await page.screenshot({ path: `${artifactDir}/desktop-ready.png` });
  await page.getByRole("button", { name: /Enter Hiver Omni/ }).click();
  await page.getByRole("heading", { name: /Good morning/ }).waitFor();
  await page.screenshot({ path: `${artifactDir}/desktop-setup-home.png` });

  await page.reload();
  await page.getByRole("heading", { name: /Good morning/ }).waitFor();
  assert.equal(await page.getByText("Connect email first", { exact: false }).count(), 1);

  const restartJourney = page.getByRole("button", { name: "Restart journey" });
  assert.equal(await restartJourney.count(), 1, "The saved journey must always offer an explicit restart action");
  await restartJourney.click();
  await page.locator('[data-screen="channels"]:visible').waitFor();
  assert.equal(await page.locator('input[name="channel"]:checked').count(), 0, "Restarting must clear every saved channel choice");
  const resetState = await page.evaluate(() => JSON.parse(localStorage.getItem("hiver-living-onboarding-v2") || "{}"));
  assert.deepEqual(resetState.channels, [], "Restarting must clear persisted progress, not only navigate back");
  assert.equal(resetState.screen, "channels");
  await context.close();

  const mobileContext = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: "reduce" });
  const mobile = await mobileContext.newPage();
  await reset(mobile, baseUrl);
  await mobile.locator("label.channel-option", { hasText: "Email" }).click();
  await mobile.screenshot({ path: `${artifactDir}/mobile-channels.png`, fullPage: true });
  assert.equal(await mobile.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth), true);
  await assertCraftedShell(mobile, { mobile: true });
  await mobileContext.close();
}

module.exports = { runTests };
