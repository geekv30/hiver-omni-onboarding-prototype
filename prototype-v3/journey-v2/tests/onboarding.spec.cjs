const assert = require("node:assert/strict");

async function reset(page, baseUrl) {
  await page.goto(baseUrl);
  await page.evaluate(() => localStorage.clear());
  await page.reload();
}

async function runTests({ browser, baseUrl, artifactDir }) {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  page.setDefaultTimeout(3_000);
  await reset(page, baseUrl);

  await page.getByRole("heading", { name: "Where do customers reach you?" }).waitFor();
  const visualAudit = await page.evaluate(() => ({
    heading: getComputedStyle(document.querySelector("#channel-title")).fontSize,
    lineIcons: [...document.querySelectorAll(".channel-option__icon:not(.channel-option__icon--brand)")].map((host) => ({
      system: host.dataset.iconSystem,
      name: host.dataset.iconName,
      color: getComputedStyle(host).color,
      background: getComputedStyle(host).backgroundColor,
    })),
    brandIcons: [...document.querySelectorAll(".channel-option__icon--brand")].map((host) => ({
      system: host.dataset.iconSystem,
      name: host.dataset.iconName,
      hasImg: !!host.querySelector("img[src*='/assets/icons/']"),
    })),
    cardHeights: [...document.querySelectorAll(".channel-option")].map((node) => node.getBoundingClientRect().height),
  }));
  assert.equal(visualAudit.heading, "20px", "The Figma heading is Hanken Grotesk Medium 20/24");
  assert.ok(visualAudit.lineIcons.every((icon) => icon.system === "untitled-ui" && icon.name), "Email/Chat/Voice/unsure glyphs are Untitled UI icons");
  assert.ok(new Set(visualAudit.lineIcons.map((icon) => icon.color)).size === 1, "The line-icon system is monochrome, not color-coded");
  assert.ok(visualAudit.lineIcons.every((icon) => icon.background === "rgba(0, 0, 0, 0)"), "Line icons do not sit in colored tiles");
  assert.equal(visualAudit.brandIcons.length, 2, "Slack and WhatsApp render as brand icons");
  assert.ok(visualAudit.brandIcons.every((icon) => icon.system === "brand" && icon.hasImg), "Slack/WhatsApp use the real exported brand marks, not generic glyphs");
  assert.ok(visualAudit.cardHeights.every((height) => height === 44), "Channel pills match the Figma px-16/py-12 proportion");
  assert.equal(
    await page.getByText("Choose all that apply. Nothing connects yet.", { exact: true }).count(),
    1,
    "The approved Figma copy must be preserved exactly",
  );

  // Fluid frame: fills the viewport rather than a fixed 1440x749 canvas.
  const frame = await page.locator(".onboarding-frame").boundingBox();
  const formPane = await page.locator(".form-pane").boundingBox();
  const landscapePane = await page.locator(".landscape-pane").boundingBox();
  assert.equal(frame.width, 1440, "The frame fills the desktop viewport width");
  assert.ok(formPane.width >= 360 && formPane.width <= 480, "The left pane stays clamped to the Figma 360-480px range");
  assert.equal(landscapePane.x, formPane.width, "The visual pane begins exactly where the form pane ends");
  assert.ok(landscapePane.width > formPane.width, "The visual pane takes the remaining fluid width");
  assert.equal(landscapePane.height, frame.height);

  const imageLoaded = await page.locator(".landscape-image").evaluate((image) => image.complete && image.naturalWidth > 0);
  assert.equal(imageLoaded, true, "The exact landscape asset must load");
  assert.equal(await page.locator(".radial-ring").count(), 2, "The hero uses exactly two radial gradient rings");
  const ringAssetsLoaded = await page.evaluate(() =>
    [...document.querySelectorAll(".radial-ring__spin")].every((img) => img.complete && img.naturalWidth > 0),
  );
  assert.equal(ringAssetsLoaded, true, "The exported Figma gradient-ring assets must load");
  assert.equal(await page.locator(".hiver-core").count(), 1);

  const choices = ["Email", "Chat", "Voice", "Slack", "WhatsApp", "I am not sure yet"];
  for (const choice of choices) {
    assert.equal(await page.getByRole("checkbox", { name: choice }).count(), 1, `${choice} must be selectable`);
  }

  const continueButton = page.getByRole("button", { name: "Continue" });
  assert.equal(await continueButton.isDisabled(), true, "Continue begins disabled");
  await page.getByRole("checkbox", { name: "Email" }).check();
  assert.equal(await continueButton.isEnabled(), true, "A channel selection enables Continue");
  await page.waitForTimeout(220); // let the 160ms checkbox-fill transition settle before reading its resting color
  const checkedFill = await page.evaluate(
    () => getComputedStyle(document.querySelector('input[value="email"] ~ .channel-option__check')).backgroundColor,
  );
  assert.equal(checkedFill, "rgb(23, 23, 23)", "A checked pill renders the near-black Figma checkbox fill, not the old purple");
  await page.getByRole("checkbox", { name: "Chat" }).focus();
  await page.keyboard.press("Space");
  assert.equal(await page.getByRole("checkbox", { name: "Chat" }).isChecked(), true, "Choices work from the keyboard");

  await page.getByRole("checkbox", { name: "I am not sure yet" }).check();
  assert.equal(await page.getByRole("checkbox", { name: "Email" }).isChecked(), false, "Not sure clears channel choices");
  assert.equal(await page.getByRole("checkbox", { name: "Chat" }).isChecked(), false, "Not sure is exclusive");
  await page.getByRole("checkbox", { name: "Voice" }).check();
  assert.equal(await page.getByRole("checkbox", { name: "I am not sure yet" }).isChecked(), false, "A channel clears Not sure");

  const stableContinueButton = page.locator(".continue-button");
  await continueButton.click();
  assert.equal(await stableContinueButton.textContent(), "Saved", "The current-frame Continue action gives visible demo feedback");
  await page.waitForURL(/knowledge\.html$/, { timeout: 2_000 });
  assert.match(page.url(), /knowledge\.html$/, "Continue advances to the Add knowledge step");

  await page.goBack();
  await page.reload();
  assert.equal(await page.getByRole("checkbox", { name: "Voice" }).isChecked(), true, "Selections persist across refreshes");
  assert.equal(await page.getByRole("button", { name: "Continue" }).isEnabled(), true);

  const motionAudit = await page.evaluate(() => ({
    rings: [...document.querySelectorAll(".radial-ring__spin")].map((node) => getComputedStyle(node).animationName),
    image: getComputedStyle(document.querySelector(".landscape-image")).animationName,
  }));
  assert.deepEqual(motionAudit.rings, ["none", "none"], "Reduced motion disables the ring rotation");
  assert.equal(motionAudit.image, "none", "Reduced motion disables ambient landscape movement");

  assert.equal(
    await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth),
    true,
    "The desktop frame must not overflow horizontally",
  );
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.screenshot({ path: `${artifactDir}/channel-desktop.png` });
  await context.close();

  // Responsiveness: the split layout should adapt at tablet and mobile widths, never overflow.
  const responsiveContext = await browser.newContext({ reducedMotion: "reduce" });
  const responsivePage = await responsiveContext.newPage();
  await responsivePage.goto(baseUrl);

  await responsivePage.setViewportSize({ width: 1024, height: 768 });
  const tabletLandscape = await responsivePage.locator(".landscape-pane").boundingBox();
  const tabletForm = await responsivePage.locator(".form-pane").boundingBox();
  assert.ok(tabletLandscape.width > 0, "The visual pane stays visible at tablet width");
  assert.ok(tabletForm.width >= 360 && tabletForm.width <= 480, "The form pane stays clamped at tablet width");
  assert.equal(
    await responsivePage.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth),
    true,
    "No horizontal overflow at tablet width",
  );

  await responsivePage.setViewportSize({ width: 390, height: 844 });
  assert.equal(await responsivePage.locator(".landscape-pane").isVisible(), false, "The visual pane steps aside on mobile");
  const mobileForm = await responsivePage.locator(".form-pane").boundingBox();
  assert.equal(mobileForm.width, 390, "The form pane takes the full mobile width");
  assert.equal(
    await responsivePage.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth),
    true,
    "No horizontal overflow at mobile width",
  );
  assert.equal(await responsivePage.getByRole("checkbox", { name: "Email" }).count(), 1, "Channel options remain reachable on mobile");
  await responsivePage.screenshot({ path: `${artifactDir}/channel-mobile.png` });
  await responsiveContext.close();

  const motionContext = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    reducedMotion: "no-preference",
  });
  const motionPage = await motionContext.newPage();
  await motionPage.goto(baseUrl);
  const ambientMotion = await motionPage.evaluate(() => ({
    rings: [...document.querySelectorAll(".radial-ring__spin")].map((node) => getComputedStyle(node).animationName),
    image: getComputedStyle(document.querySelector(".landscape-image")).animationName,
  }));
  assert.deepEqual(ambientMotion.rings, ["ring-rotate", "ring-rotate"], "The two gradient rings orbit the Hiver logo");
  assert.equal(ambientMotion.image, "landscape-breathe", "The landscape has a nearly imperceptible ambient drift");
  await motionPage.getByRole("checkbox", { name: "Email" }).check();
  await motionPage.getByRole("button", { name: "Continue" }).hover();
  assert.match(
    await motionPage.getByRole("button", { name: "Continue" }).evaluate((node) => getComputedStyle(node).transitionProperty),
    /transform/,
    "The enabled action exposes responsive hover and press feedback",
  );
  await motionContext.close();
}

module.exports = { runTests };
