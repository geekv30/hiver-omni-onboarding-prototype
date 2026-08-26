# Hiver AI Onboarding Core Screens Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a production-quality interactive review prototype for the five core Hiver Omni AI-onboarding screens.

**Architecture:** A dependency-free browser application separates semantic markup, visual tokens/layout, and flow state. The prototype simulates only unavailable backend processing; all navigation, persistence, validation, failure recovery, keyboard behaviour, responsive layout, and reduced-motion behaviour are functional.

**Tech Stack:** Semantic HTML, modern CSS, vanilla JavaScript, inline SVG, Playwright, Node.js.

**Spec:** `hiver-ai-onboarding-plan.md`

## Global Constraints

- Hiver Omni only.
- Full-screen adaptive split layout; no modal shell.
- Channels are selected during onboarding but connected only after product entry.
- SLAs, automations, tags, views, routing, and handover are advertised but never configured or required.
- Yellow represents human decisions/actions; purple represents AI activity.
- Realistic success, partial, empty, error, skip, and delayed-processing states are required.
- Onboarding never contacts customers or publishes an AI agent.
- WCAG 2.2 AA intent, complete keyboard access, visible focus, and reduced-motion equivalent are required.

---

### Task 1: Application shell and visual system

**Files:**
- Create: `prototype/index.html`
- Create: `prototype/styles.css`
- Create: `prototype/app.js`

**Interfaces:**
- Produces: `[data-screen]` screen regions, `goToScreen(id)`, shared design tokens, progress navigation, and local progress storage.

- [ ] **Step 1:** Create semantic landmarks, skip link, progress header, live announcement region, five screen containers, and stable action footer.
- [ ] **Step 2:** Define colour, typography, spacing, depth, focus, responsive, and reduced-motion tokens in `styles.css`.
- [ ] **Step 3:** Implement `goToScreen(id)` and `saveState()` in `app.js`, restoring the latest completed screen without losing inputs.
- [ ] **Step 4:** Open at 1440×1000, 1024×768, and 390×844 and confirm that the interface recomposes without horizontal page scrolling.

### Task 2: Channel and knowledge input screens

**Files:**
- Modify: `prototype/index.html`
- Modify: `prototype/styles.css`
- Modify: `prototype/app.js`

**Interfaces:**
- Produces: `selectedChannels: string[]`, `knowledgeUrl: string`, inline validation, and retry/skip routes.

- [ ] **Step 1:** Build the channel-selection input with Email, Chat, Slack, Voice, and Not sure yet; selection must never initiate a connection.
- [ ] **Step 2:** Build the product-native right-side illustration where selected channels join one support stream.
- [ ] **Step 3:** Build URL input, example content, source-quality explanation, and accessible invalid/private/insufficient-content messages.
- [ ] **Step 4:** Add working recovery actions: edit URL, use sample, and skip to product.

### Task 3: Knowledge processing and capability preview

**Files:**
- Modify: `prototype/index.html`
- Modify: `prototype/styles.css`
- Modify: `prototype/app.js`

**Interfaces:**
- Consumes: `knowledgeUrl`, `selectedChannels`.
- Produces: `knowledgeStatus`, discovered topics, suggested questions, delayed/failure actions.

- [ ] **Step 1:** Implement honest staged progress with page count, discovered topics, and a visible current activity.
- [ ] **Step 2:** Add a quiet capability rail for human handover, SLAs, automations, tags, views, and routing without configuration controls.
- [ ] **Step 3:** Implement success, delayed, insufficient-content, and technical-failure paths; every path retains entered work.
- [ ] **Step 4:** Ensure the transition remains usable with `prefers-reduced-motion: reduce` and never depends on animation completion.

### Task 4: Inspectable AI test workspace

**Files:**
- Modify: `prototype/index.html`
- Modify: `prototype/styles.css`
- Modify: `prototype/app.js`

**Interfaces:**
- Consumes: discovered topics and suggested questions.
- Produces: `testConversation`, grounded-answer state, source expansion, uncertainty state, and human-handoff state.

- [ ] **Step 1:** Morph the split layout into a larger test workspace with conversation on the left and evidence on the right.
- [ ] **Step 2:** Implement three suggested questions, custom question input, answer streaming, source highlight, and expandable source excerpt.
- [ ] **Step 3:** Add working good-answer, partial-answer, no-answer, technical-failure, retry, and human-handoff scenarios.
- [ ] **Step 4:** Preserve the conversation in local state and keep controls operable throughout the response motion.

### Task 5: Invitation, completion, and non-empty Omni landing

**Files:**
- Modify: `prototype/index.html`
- Modify: `prototype/styles.css`
- Modify: `prototype/app.js`

**Interfaces:**
- Consumes: selected channels, knowledge status, test conversation.
- Produces: invitation status, completion summary, and personalised Omni Setup Home.

- [ ] **Step 1:** Build an optional invitation step with multiple emails, inline per-email validation, skip, and simulated retry.
- [ ] **Step 2:** Build a concise ready summary that distinguishes created, tested, skipped, and incomplete work.
- [ ] **Step 3:** Build the non-empty Omni Setup Home with saved knowledge, test conversation, and a recommended channel-connection action.
- [ ] **Step 4:** Ensure skipped and failed AI paths never claim that a company-specific agent exists.

### Task 6: Automated and visual quality checks

**Files:**
- Create: `prototype/tests/onboarding.spec.js`
- Create: `prototype/tests/run-tests.mjs`

**Interfaces:**
- Consumes: local prototype URL.
- Produces: automated flow, keyboard, persistence, responsive, and reduced-motion verification.

- [ ] **Step 1:** Write Playwright tests that select channels, validate a bad URL, use a valid source, complete an AI test, skip invitation, and reach Setup Home.
- [ ] **Step 2:** Add tests for refresh persistence, keyboard-only completion, delayed/error recovery, and reduced motion.
- [ ] **Step 3:** Run the tests and fix every failure.
- [ ] **Step 4:** Capture desktop and mobile screenshots, inspect hierarchy and clipping, and remove at least one decorative element that does not serve the flow.
- [ ] **Step 5:** Verify there are no dead controls, vague errors, accidental mandatory setup steps, or false AI-success claims.
