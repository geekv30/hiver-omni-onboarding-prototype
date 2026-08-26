# Hiver Omni onboarding: detailed competitive evidence

Last refreshed: 24 August 2026

Purpose: retain the detailed evidence behind the short journey maps and product conclusions. This is the reference layer; `onboarding-research-and-conclusions.md` remains the concise decision layer.

## Evidence rules

- Hiver product behaviour: code is the source of truth.
- Hiver behaviour data: Amplitude is the source of truth.
- Competitor journeys: official product documentation and help centres are preferred.
- A published quickstart is not automatically the exact first-run UI. When exact screens are unavailable, the journey is labelled an approximation.
- No onboarding duration is invented. Time is marked as measured, officially stated, guide estimate, or unknown.
- “Wow moment” is an analytical observation based on the first visible product-specific value, not a competitor claim.

## Hiver timing evidence

### Data scope

- Amplitude project: Hiver Omni, project `723390`.
- Period: 1 July–24 August 2026.
- Excluded domains on the entry event: values containing `hiver`, `grexit`, `hot-demo`, or `gmail`.
- Amplitude project session timeout: 30 minutes.
- Email entry event: `OnboardingCreateInboxScreenViewed`.
- Email completion event: `OnboardingConnectionEstablishedConfirmationScreenViewed`.
- Chat entry event: `Onboarding_SetupChatFirst`.
- Chat completion event: `ChatSandboxViewed`.
- Current Omni event names are also present in the Hiver UI code. Amplitude supplies timing; code supplies the intended meaning of each event.

### Re-checked timing

| Path | Window | Entered | Completed | Completion | Median | Average | Interpretation |
|---|---|---:|---:|---:|---:|---:|---|
| Email | Same session | 304 | 114 | 37.5% | 2m 22s | 4m 54s | Best current representation of active setup effort |
| Email | Within 30 minutes | 304 | 115 | 37.8% | 2m 24s | 4m 54s | Nearly identical to same-session result |
| Email | Within 24 hours | 304 | 128 | 42.1% | 3m 00s | 64m 17s | Includes long periods away from the product |
| Chat | Same session | 51 | 45 | 88.2% | 31s | 44s | Best current representation of active Chat setup |
| Chat | Within 24 hours | 51 | 47 | 92.2% | 33s | 5m 05s | Two delayed completions inflate the average |

### Why the one-hour Email average appeared

Amplitude’s normal Email funnel allowed users to complete up to 24 hours after entering the setup screen. A user could begin, close the tab, wait for an administrator, take a meeting, or return later. All of that elapsed time entered the average.

The evidence is clear:

- Same-session Email average: 4m 54s.
- 24-hour Email average: 64m 17s.
- The 24-hour window adds only 14 completions, from 114 to 128.
- Those few late returns pull the average upward by almost an hour.

Conclusion: 64 minutes is an abandonment/return-delay signal. It is not active onboarding time and should not be presented as such.

### Remaining timing gaps

- Signup start and account verification are not consistently connected to the Omni onboarding events.
- Slack and Voice lack dependable completion events.
- “Entered Hiver Omni” is not yet one consistent end event across paths.
- There is no single event chain covering signup → authentication/permissions → onboarding → product entry.
- Code can show screens and branches, but it cannot measure how long humans spend on OAuth, waiting, reading, or returning.

### Working timing interpretation

- Current Email configuration itself is usually a 2–5 minute task for same-session completers.
- A full same-session Email journey is still best treated as a rough 5–10 minute estimate because signup and every intermediate permission step are not measured together.
- Chat configuration is very short once selected.
- Current data is sufficient to understand relative friction, but not to claim one exact total onboarding time.

## Direct customer-support benchmarks

### Zendesk Suite trial

**Category:** Direct customer-support and AI-agent competitor.

**How it works:** Zendesk provides a multichannel service platform. Its new trial wizard uses the company website to generate an AI agent, custom ticket views, custom fields, sample customer content, and knowledge articles.

**Documented journey:**

1. Select free trial.
2. Enter work email.
3. Answer company questions and create password.
4. Verify account by email.
5. Enter corporate website.
6. Wait a few minutes while automatic setup runs.
7. Inspect the generated AI agent, custom views, and fields.
8. Enter Agent Home and inspect a generated sample ticket.
9. Open the sample customer page and test the AI agent.
10. Optionally invite team members.
11. Optionally adjust agent name and tone.
12. Optionally test more questions and expand generated knowledge.
13. Connect support Email.
14. Launch the AI agent.

**Structure:** Mostly linear core, followed by optional setup tasks. Email connection is deliberately late.

**Time evidence:** Website setup is officially described as taking “a few minutes.” Total signup-to-launch time is not published.

**Wow moment:** A generic trial becomes visibly specific to the user’s company: agent answers, ticket content, views, fields, and knowledge are generated from the website.

**Strengths:** Strong company-specific reveal; generated sample ticket prevents an empty product; channel connection is deferred.

**Weaknesses:** The core concept is no longer novel. Website quality determines output quality. The journey generates several things at once, which may make the central value less focused.

**Hiver implication:** Website → AI test is validated, but it cannot be Hiver’s only differentiation. Hiver needs a faster, clearer, more human-centred proof.

**Evidence confidence:** High; official step-by-step journey. [Source](https://support.zendesk.com/hc/en-us/articles/9748832324634-Zendesk-Suite-trial-Using-AI-to-automatically-set-up-your-Zendesk-account)

### Intercom Fin

**Category:** Direct customer-support and AI-agent competitor.

**How it works:** Fin uses Help Centre articles, documents, snippets, public URLs, guidance, attributes, procedures, and data connectors to answer and resolve customer questions across channels.

**Documented preparation journey:**

1. Select the audience/topics Fin should handle and define a success measure.
2. Enable public articles, documents, snippets, or public URLs.
3. Add brand and policy guidance.
4. Optionally add attributes, escalation guidance, procedures, and connectors.
5. Generate questions from past conversations, upload questions, or enter them manually.
6. Review answers as good/poor and inspect the content/guidance/personality used.
7. Test with an internal or limited live audience.

**Official Chat deployment journey:**

1. Choose audience.
2. Choose connected channels.
3. Configure Fin’s introduction.
4. Review enabled content.
5. Review guidance.
6. Set unresolved-conversation handover.
7. Set auto-close behaviour.
8. Optionally request CSAT.
9. Preview the full chat.
10. Review and set live.

**Structure:** Guided linear deployment with optional advanced branches.

**Time evidence:** No official total duration. The number of decisions makes this a configuration journey rather than instant activation.

**Wow moment:** Fin answers real or generated historical questions and exposes why it answered that way.

**Strengths:** Strong test/feedback loop, source provenance, safe rollout, human handover, and production controls.

**Weaknesses:** Considerable setup depth before production value; requires content and installed channels.

**Hiver implication:** Source visibility is not unique. Hiver can differentiate by exposing evidence earlier and more simply, without requiring full production configuration.

**Evidence confidence:** High; official training, testing, and ten-step deployment documentation. [Deployment](https://www.intercom.com/help/en/articles/8286630-deploy-fin-ai-agent-over-chat) · [Knowledge](https://www.intercom.com/help/en/articles/9440354-knowledge-sources-to-power-ai-agents-and-self-serve-support)

### Pylon

**Category:** B2B omnichannel support competitor.

**How it works:** Pylon tracks B2B customer issues across Slack Connect, Email, Microsoft Teams, Chat, forms, and other channels. It connects support work with CRM, issue trackers, workflows, and AI agents.

**Documented quick-start workstreams:**

1. Sign in with Slack and allow access.
2. Connect Slack and other customer channels.
3. Connect CRM.
4. Connect issue tracker.
5. Set up views, teams, custom fields, triggers, macros, and portal.

**Documented AI-agent path:**

1. Start with a default persona.
2. Add knowledge resources such as website pages, files, or Pylon knowledge.
3. Add runbooks for actions.
4. Configure assignment.
5. Configure greeting.
6. Configure resolution.
7. Configure escalation.

**Structure:** Setup hub with parallel workstreams rather than one short wizard.

**Time evidence:** Not publicly stated.

**Wow moment:** Conversations from Slack and other B2B channels become tracked support issues in one system; the AI agent can use company knowledge and runbooks.

**Strengths:** Immediate B2B channel relevance, especially Slack; clear integration with existing systems.

**Weaknesses:** High connection and configuration burden before the complete value is visible.

**Hiver implication:** Early channel reassurance is strategically useful, but Hiver can provide it without forcing immediate connection.

**Evidence confidence:** High for documented setup; exact signup screens unknown. [Quick start](https://docs.usepylon.com/pylon-docs/getting-started/publish-your-docs) · [AI builder](https://docs.usepylon.com/pylon-docs/ai-agents/build)

### Decagon

**Category:** Enterprise AI customer-experience competitor.

**How it works:** Decagon combines knowledge, Agent Operating Procedures, integrations, simulations, testing, guardrails, human escalation, monitoring, and experimentation for enterprise support automation.

**Documented implementation journey:**

1. Week 1: technical discovery, sandbox, and workflow documentation.
2. Week 2: pilot definition, success criteria, and operating procedures.
3. Weeks 3–4: configuration, internal testing, integration testing, and parallel refinement.
4. Week 5: finalisation, compliance, and team training.
5. Week 6: controlled launch and monitoring.
6. Post-launch: continued monitoring and procedure refinement.

**Structure:** White-glove, parallel enterprise implementation.

**Time evidence:** Roughly six weeks, officially described.

**Wow moment:** High-confidence simulations and successful resolution of complex real workflows, not instant self-serve generation.

**Strengths:** Trust, governance, testing, enterprise integration, and controlled rollout.

**Weaknesses:** Not a self-serve or rapid first-value benchmark.

**Hiver implication:** Hiver’s trial should demonstrate safe potential quickly, while honestly positioning deeper production readiness as later work.

**Evidence confidence:** High; official implementation description. [Setup](https://decagon.ai/blog/ai-customer-support-setup) · [Testing](https://decagon.ai/modules/testing)

## AI-led creation and work benchmarks

### Sarvam AI Work Agents

**How it works:** Users can run ad-hoc AI tasks, turn recurring work into agents, attach knowledge, connect tools, test in a playground, and schedule work.

**Documented journey:**

1. Sign in and land on a prompt-led home.
2. Run a useful task immediately.
3. Turn the task into a reusable agent.
4. Add instructions, files, connectors, skills, or knowledge.
5. Switch to Playground and test.
6. Return to Builder and refine.
7. Optionally connect Gmail/Calendar through OAuth.
8. Optionally schedule the task.

**Time evidence:** Not stated.

**Wow moment:** The first task runs before agent or connector setup. The user can then convert demonstrated value into a reusable system.

**Hiver implication:** Experience value before configuration. Builder ↔ Playground is a useful model for AI setup and testing.

**Evidence confidence:** High; official quickstart. [Source](https://docs.sarvam.ai/work-agents/quickstart)

### Cursor

**How it works:** Cursor is an AI code editor that imports familiar editor preferences, indexes a real codebase automatically, explains it, edits it, runs checks, and exposes reviewable diffs.

**Documented journey:**

1. Download and install.
2. Choose shortcuts, theme, and terminal preference.
3. Optionally import VS Code settings.
4. Sign in to unlock AI.
5. Open an existing project or example project.
6. Allow automatic background indexing.
7. Ask Cursor to explain the codebase.
8. Request one small, safe improvement.
9. Review the diff and run checks.
10. Use Plan Mode for larger work.

**Time evidence:** Official quickstart says five minutes. Older installation guidance says indexing can take 1–15 minutes depending on project size and happens automatically.

**Wow moment:** Cursor understands the user’s own unfamiliar codebase and makes a useful, reviewable change.

**Strengths:** Familiarity reduces switching cost; personal context is learned automatically; the result is inspectable.

**Weaknesses:** Large repository indexing can delay full context; first output quality depends on repository health and the task.

**Hiver implication:** Learn in the background, preserve user familiarity, start with one safe proof, and make the result reviewable.

**Evidence confidence:** High; official installation and quickstart. [Installation](https://docs.cursor.com/get-started/installation) · [Quickstart](https://prod.cursor.com/docs/get-started/quickstart)

### OpenAI Codex

**How it works:** Codex works across app, CLI, IDE, and cloud. It reads a selected project, performs tasks, runs checks, presents diffs and outputs, and lets the user comment or continue.

**Documented journey:**

1. Install/open the application and sign in.
2. Select Codex as the work surface.
3. Open a folder/project or use an existing project context.
4. Describe the goal.
5. Codex reads relevant files and works.
6. Review progress, output, diff, and verification.
7. Comment, approve, or continue iterating.
8. Optional later setup: environments, skills, plugins, automation, and team configuration.

**Time evidence:** No single onboarding time. Older cloud-task guidance describes task completion as generally 1–30 minutes depending on complexity; that is task duration, not onboarding duration.

**Wow moment:** A goal becomes completed, inspectable work with evidence. The user can steer the work rather than only consume generated text.

**Strengths:** Uses real project context; review and verification are first-class; advanced capability does not block the first task.

**Weaknesses:** The product can appear complex because it spans many surfaces, permission modes, tools, and workflows.

**Hiver implication:** The first outcome, its evidence, and the ability to steer should teach the product. Advanced power can remain discoverable after activation.

**Evidence confidence:** High for current product model and quickstart; exact app first-run screens can change. [Codex app](https://openai.com/index/introducing-the-codex-app/) · [Quickstart](https://learn.chatgpt.com/docs/quickstart)

### Claude and Claude Code

**How it works:** Claude Chat begins with natural conversation and can create reusable interactive Artifacts. Claude Code reads a project, proposes and applies changes with permission, runs commands, and supports review workflows.

**Claude Chat journey:**

1. Sign in.
2. Enter a natural-language request.
3. Receive a conversational result or Artifact.
4. Iterate in chat or directly on the Artifact.
5. Optional later setup: projects, knowledge, instructions, connectors, sharing.

**Claude Code journey:**

1. Install.
2. Launch and authenticate.
3. Open Claude inside an existing project directory.
4. Ask what the project does.
5. Request a small code change.
6. Review the proposed change and approve.
7. Ask Claude to test, inspect Git, or commit.
8. Add persistent project context later through `CLAUDE.md` or extensions.

**Time evidence:** Claude Code states that its quickstart reaches useful assistance “in a few minutes”; no exact measured duration.

**Wow moment:** Claude produces substantial, editable content from a conversation. Claude Code understands the project without manual file-by-file context and asks before editing.

**Strengths:** Low barrier to first interaction; visible human control; Artifact output makes results tangible.

**Weaknesses:** The difference between chat, projects, Artifacts, Cowork, and Code can increase mental-model complexity.

**Hiver implication:** Pair immediate AI value with explicit control and a durable saved result.

**Evidence confidence:** High; official quickstarts. [Claude](https://support.claude.com/en/articles/8114491-get-started-with-claude) · [Claude Code](https://code.claude.com/docs/en/quickstart) · [Artifacts](https://support.claude.com/en/articles/9487310-what-are-artifacts-and-how-do-i-use-them)

### Replit Agent

**How it works:** Replit turns a natural-language product description into a working application, provides a live preview, fixes issues conversationally, and publishes to a URL.

**Documented journey:**

1. Create account.
2. Start a new application.
3. Enter a structured prompt.
4. Optionally review a generated plan.
5. Watch Agent build for a few minutes.
6. Test the application in Preview.
7. Describe any failure; Agent fixes it.
8. Publish to a shareable URL.

**Time evidence:** Official guide estimates ten minutes from start to published first app.

**Wow moment:** The user can click and use a working application generated from their idea.

**Strengths:** Visible progress; interactive proof; complete creation loop; shareable result.

**Weaknesses:** A broad or unclear prompt can create an impressive but unsuitable result; generated output still needs testing.

**Hiver implication:** A credible interaction is stronger than passive animation. Let users test the generated capability directly.

**Evidence confidence:** High; official ten-minute guide. [Source](https://docs.replit.com/build/your-first-app)

### Lovable

**How it works:** Lovable creates full-stack web applications from natural language or visual references, presents a live preview, supports iterative visual/chat edits, and connects backend/GitHub/publishing later.

**Documented journey:**

1. Sign in.
2. Describe an idea or use a template/screenshot.
3. Watch the application build.
4. Interact with preview.
5. Refine by prompt, direct visual editing, or selection.
6. Optionally connect backend, GitHub, payments, or email.
7. Publish.

**Time evidence:** No exact onboarding duration; official marketing presents four simple stages from sign-in to iteration/shipping.

**Wow moment:** A plain-language idea becomes a working visual product.

**Strengths:** Prompt is central; infrastructure is deferred; visual result is immediate and editable.

**Weaknesses:** The apparent simplicity can hide product-definition, data, security, and production complexity.

**Hiver implication:** Ask only for inputs required to create the first useful proof; defer implementation machinery.

**Evidence confidence:** High for product flow; exact first-run details may change. [Quickstart](https://docs.lovable.dev/introduction/getting-started) · [Four-stage flow](https://lovable.dev/meta-lp)

## Complex business-product benchmarks

### Ramp

**How it works:** Ramp combines regulated business application/verification, corporate cards, policies, expense automation, reimbursements, accounting, bank connections, and integrations.

**Documented administrator journey:**

1. Apply and complete business verification.
2. Enter Ramp after approval.
3. Verify bank accounts.
4. Configure expense policy and approvals.
5. Invite users.
6. Issue cards.
7. Connect accounting and configure fields/rules.
8. Configure reimbursements.
9. Add communication and Slack integration.
10. Migrate spend over time.

**Structure:** Persistent Setup Guide shown for the first 90 days. Some tasks can be skipped/dismissed; many clear only after actual setup is complete.

**Time evidence:** Ramp says complete administrator setup is best handled during the first week.

**Wow moment:** The first controlled card, policy, or automatically coded transaction works. Full implementation is not required for first product access.

**Strengths:** Honest long-running setup model; persistent guidance; task completion tied to real system state.

**Weaknesses:** Regulated verification and accounting integration create unavoidable time and coordination.

**Hiver implication:** Separate activation from full implementation. Keep a post-onboarding guide for channel connection and advanced configuration.

**Evidence confidence:** High. [Source](https://support.ramp.com/getting-started-as-an-admin)

### Salesforce Starter

**How it works:** Starter Suite provides preconfigured sales, service, marketing, commerce, reports, and guidance inside one simplified CRM.

**Documented product-entry pattern:**

1. Start free trial with email.
2. Enter a preconfigured Starter environment.
3. Use Home and recommended Spotlight Cards.
4. Open Guidance Center for setup and data tasks.
5. Create first record or import data.
6. Connect email/accounts as relevant.
7. Invite users.
8. Continue configuration without leaving the core product.

**Time evidence:** Official introductory learning unit: about 15 minutes. Complete CRM setup is variable and not represented by that learning estimate.

**Wow moment:** A broad CRM feels usable because core objects, recommendations, reports, and guidance already exist.

**Strengths:** Preconfigured sensible defaults; setup help stays available; avoids one enormous blocking wizard.

**Weaknesses:** The underlying Salesforce mental model remains complex; implementation can expand quickly.

**Hiver implication:** Enter a useful product early and keep implementation guidance persistent.

**Evidence confidence:** Medium-high; official product guidance, but exact signup screens are not fully published. [Source](https://trailhead.salesforce.com/content/learn/modules/salesforce-easy-quick-look/get-started-with-salesforce-easy)

### HubSpot

**How it works:** HubSpot provides CRM records, marketing, sales, service, automation, data management, and integrations. Product activation depends heavily on bringing in real customer data.

**Publicly supported journey approximation:**

1. Create account and choose relevant business context/tools.
2. Enter CRM.
3. Create records manually or import contacts/companies/deals.
4. Review automatic mappings and correct data.
5. Connect email and integrations.
6. Invite users and assign access.
7. Build pipelines, properties, workflows, and reports over time.

**Time evidence:** No defensible public first-run total. Import duration and implementation depend on data and product scope.

**Wow moment:** Existing business data becomes connected CRM records that a team can act on.

**Strengths:** Strong migration/import tooling; progressively configurable; real data creates relevance.

**Weaknesses:** Data cleanup, object mapping, permissions, and process design can dominate implementation.

**Hiver implication:** Import/setup work must not masquerade as a short onboarding. Show value early, then support longer implementation.

**Evidence confidence:** Medium; exact first-run UI is not public, but official import path is clear. [Import overview](https://knowledge.hubspot.com/import-and-export/understand-the-import-tool) · [Quick contact import](https://knowledge.hubspot.com/import-and-export/import-contacts-quick-import)

### Attio

**How it works:** Attio is a flexible CRM that syncs email/calendar, automatically creates enriched people/company records, supports CSV migration, and lets users build lists, views, attributes, and workflows.

**Journey approximation:**

1. Create workspace.
2. Connect Google or Microsoft mailbox.
3. Wait while people, companies, and interaction history populate.
4. Inspect automatically created records.
5. Import additional CRM data if needed.
6. Invite team.
7. Build lists, views, and workflows progressively.

**Time evidence:** No exact first-run duration. Attio says mailbox history can populate in minutes; its full Academy introduction is much longer and is not onboarding time.

**Wow moment:** A blank CRM becomes populated with recognisable contacts and companies automatically.

**Hiver implication:** Automatically generated, recognisable data is more persuasive than describing capability.

**Evidence confidence:** Medium-high; exact signup screens unavailable. [First setup](https://attio.com/help/academy/introduction/email-sync-people-companies) · [Import](https://attio.com/help/reference/attio-101/introduction-to-data-importing)

## Interaction and delight references

### Linear

**Journey approximation:** Work email → create/join workspace → default team → create first issue/project → optional import → optional invite.

**Wow moment:** Immediate speed and a clean working system with strong defaults; the user can create real work before migration.

**Hiver implication:** Migration and invitation should remain available without blocking product comprehension.

**Time evidence:** Not published. **Confidence:** Medium. [Start guide](https://linear.app/docs/start-guide)

### Notion

**Journey approximation:** Sign in → join/create workspace → choose context → land in usable workspace/template → optional import → optional invite.

**Wow moment:** A template or first page is immediately editable; value grows without forcing complete workspace architecture.

**Hiver implication:** Use a helpful starting state and make configuration reversible. **Time evidence:** Unknown. **Confidence:** Medium. [Workspace guide](https://www.notion.com/help/guides/how-to-set-up-your-notion-workspace-for-your-team)

### Figma

**Journey approximation:** Sign in → use Drafts or create/join team → create file/template → enter canvas → optional share/invite.

**Wow moment:** The editable canvas is the product; collaboration is visible but does not block solo use.

**Hiver implication:** Let users experience the core interaction, not a slideshow about it. **Time evidence:** Unknown. **Confidence:** Medium-high. [Create file](https://help.figma.com/hc/en-us/articles/360038511153-Create-a-new-file)

### Miro

**Documented pattern:** Register → join/create team → optional invite → automatic “My First Board” → use blank board or template.

**Wow moment:** The product creates the first working space automatically and avoids a blank dashboard.

**Hiver implication:** Preserve the generated AI asset and land the user somewhere populated. **Time evidence:** Unknown. **Confidence:** High. [First board](https://help.miro.com/hc/en-us/articles/360017571974-Create-a-Miro-board)

### Plane

**Journey approximation:** Sign in → create workspace → create first project → enter usable project → optional import/invite/integrations.

**Wow moment:** Immediate work-item creation in a clean, fast product.

**Hiver implication:** Keep migration and integration distinct from product entry. **Time evidence:** Unknown. **Confidence:** Medium. [Documentation](https://docs.plane.so/)

### CRED

**Documented meaningful stages:** Name/mobile number → OTP/contact verification → consent to credit check → eligibility result → member experience and rewards.

**Wow moment:** Eligibility is presented as a premium reveal, and actions lead to visible rewards.

**Hiver implication:** Borrow confidence, pacing, motion, and reward—not exclusion mechanics or visual excess. **Time evidence:** Unknown. **Confidence:** Medium. [Membership](https://cred.club/about)

## Cross-product patterns

### Pattern 1: The best AI onboarding uses the customer’s own context

Cursor/Codex/Claude Code use a real repository. Zendesk uses a real website. Attio uses a real mailbox. Replit/Lovable use a real idea. The result feels valuable because it is recognisably the user’s.

### Pattern 2: Configuration moves after first proof

Sarvam runs a task before connectors. Replit and Lovable show preview before backend/publishing. Cursor makes a small change before rules and MCP. Salesforce/Ramp keep a persistent setup guide after product entry.

### Pattern 3: The wow moment is inspectable

- Cursor/Codex/Claude Code: diff, approval, checks.
- Replit/Lovable: live interactive preview.
- Intercom: answer evaluation and provenance.
- Zendesk: sample ticket and AI test.

A generic AI response is weaker because the user cannot tell whether it is grounded or reusable.

### Pattern 4: Complex implementation remains complex

Ramp, Salesforce, HubSpot, Intercom, and Decagon do not eliminate permissions, data, policy, integration, or governance work. Strong onboarding separates first value from complete implementation.

### Pattern 5: Progress is useful when it reflects real work

Automatic indexing, ingestion messages, build progress, tests, and setup guides explain what the system is doing. Decorative progress without a meaningful result will not create trust.

## Critical implications for Hiver

1. Website-led AI creation is directionally correct but not unique.
2. A company homepage may not contain enough support knowledge; the design needs a quality check and fallback.
3. Channel selection should reassure, not imply identical AI capability on every selected channel.
4. Website processing should begin early and continue in the background.
5. The AI result must be company-specific, source-backed, testable, and saved.
6. The AI should demonstrate uncertainty and human handoff, not fake confidence.
7. Invitation is stronger after proof and must stay skippable.
8. Channel connection, SLAs, automations, tags, views, routing, and policies belong in persistent post-onboarding setup.
9. The first Hiver Omni landing state must retain the created knowledge/agent and show one clear next action.
10. The A/B test must separately measure active time, elapsed time, first proof, product entry, and later implementation.

## Unresolved evidence questions

- How long does Hiver’s current website/help-centre ingestion take across small, medium, and large sites?
- What percentage of submitted homepages contain enough support content for a credible first answer?
- Which AI-agent capabilities are truly available for Email versus Chat, and what is available for Slack and Voice?
- Can the generated onboarding knowledge source be persisted into the user’s actual Hiver Omni account without duplication?
- What safe fallback should appear when crawling fails, content is too thin, or the answer has low confidence?

These need product/code validation before the redesigned journey is locked.
