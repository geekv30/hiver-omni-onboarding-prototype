# Hiver Omni onboarding: research and conclusions

Scope: current Hiver timing, competitor journey maps, and conclusions only. No redesigned journey yet. The proposed AI onboarding is for **Hiver Omni only**.

## 1. How long does onboarding take today?

Amplitude period checked: 1 July–24 August 2026. Internal/test domains were removed.

| Current path | What Amplitude can measure | Typical active time (median) | Same-session average | Same-session completion |
|---|---|---:|---:|---:|
| Email | Inbox setup screen → connection successful | **2m 22s** | **4m 54s** | 114 of 304 |
| Chat | Chat selected → chat setup hub | **31s** | **44s** | 45 of 51 |
| Slack | No dependable completion event | Not available | Not available | Not available |
| Voice | No dependable completion event | Not available | Not available | Not available |

### Plain answer

- We **do not have one trustworthy number** for complete signup → fully onboarded today.
- For users who finish Email setup in one visit, the typical measurable part takes **2m 22s**. The same-session average is **4m 54s**.
- The earlier 65-minute figure came from allowing completion at any point within 24 hours. It included people who left and returned much later. It was elapsed delay, not active onboarding work, and should not be used as the onboarding-time headline.
- With a 24-hour window, 128 of 304 users completed Email setup. In the same session, 114 completed. A small number of delayed returns distorted the average dramatically.
- Chat is much faster: its same-session measurable setup segment is typically **31 seconds**.
- From the code and number of screens, a successful same-session Email journey is roughly **5–10 minutes end to end**. Treat this only as an approximation, not a confirmed Amplitude result.
- The missing signup, Slack, and Voice timing events need to be fixed before the A/B test. Otherwise, we cannot compare true entry-to-product time across both onboarding versions.

## 2. Competitor journey maps

Notes:

- “Steps” below means meaningful user actions, not every click or OAuth permission screen.
- Exact first-run screens are not public for every product. Those journeys are marked as approximations rather than presented as facts.

### Zendesk — direct benchmark

**Structure:** Linear. **10 meaningful steps.** Step 8 contains optional tasks; connecting Email happens near the end.

`1 Start trial → 2 Work email → 3 Company questions + password → 4 Verify email → 5 Enter company website → 6 Wait while Zendesk creates the setup → 7 Inspect generated AI agent, views and fields → 8 Explore sample ticket and test the agent → 9 Optional: invite team, change name/tone, expand knowledge → 10 Connect support email and launch`

**Takeaway:** This is extremely close to Hiver’s proposed idea. Zendesk proves that website → generated setup → AI test can work before the main channel is connected. Hiver must make its version shorter and more delightful. [Official journey](https://support.zendesk.com/hc/en-us/articles/9748832324634-Zendesk-Suite-trial-Using-AI-to-automatically-set-up-your-Zendesk-account)

### Intercom Fin — direct benchmark

**Structure:** Guided linear setup with optional branches. The official Chat deployment itself has **10 steps**, after knowledge and testing are prepared.

`1 Choose support topics and success measure → 2 Add articles, documents or public URLs → 3 Add brand guidance → 4 Optional attributes/escalation/procedures → 5 Test answers → 6 Choose a small internal audience → 7 Choose channels → 8 Set introduction and handover → 9 Set closing and CSAT behaviour → 10 Preview → 11 Set live → 12 Expand gradually`

**Skippable:** Attributes, procedures, advanced routing, auto-close, and CSAT. Channel installation is required before live deployment.

**Takeaway:** Intercom gives strong control, testing, and safety, but its path is configuration-heavy. Hiver should demonstrate value before exposing this depth. [Official Fin setup](https://www.intercom.com/help/en/articles/8286630-deploy-fin-ai-agent-over-chat) · [Official knowledge sources](https://www.intercom.com/help/en/articles/9440354-knowledge-sources-to-power-ai-agents-and-self-serve-support)

### Pylon — direct benchmark

**Structure:** Setup hub with parallel workstreams, not one short linear onboarding.

`1 Sign in with Slack → 2 Allow Slack access → 3 Connect customer channels → 4 Connect CRM → 5 Connect issue tracker → 6 Configure views, teams, fields and workflows`

AI setup is a second path:

`1 Start with default persona → 2 Add website/files/knowledge → 3 Add runbooks → 4 Set assignment → 5 Set greeting, resolution and escalation behaviour`

**Takeaway:** Pylon signals channel strength immediately, but asks for connections early. Hiver can signal the same breadth with a simple channel question without creating setup work. [Official quick start](https://docs.usepylon.com/pylon-docs/getting-started/publish-your-docs) · [Official AI agent builder](https://docs.usepylon.com/pylon-docs/ai-agents/build)

### Decagon — direct AI benchmark

**Structure:** Enterprise-assisted, not self-serve. **6 stages over roughly 6 weeks.** Several workstreams run in parallel.

`1 Discovery and sandbox → 2 Define pilot and operating procedures → 3 Configure agent and routing → 4 Internal and integration testing → 5 Finalise, compliance and team training → 6 Controlled launch and monitoring`

**Takeaway:** Decagon sells trust, testing, safe handover, and gradual rollout—not instant setup. Hiver’s onboarding can show an instant, safe preview while positioning deeper controls as the next stage. [Official setup guide](https://decagon.ai/blog/ai-customer-support-setup) · [Official testing](https://decagon.ai/modules/testing)

### Sarvam AI — AI interaction benchmark

**Structure:** Linear learning journey. **5 steps.** The useful AI interaction comes first.

`1 Sign in and run a task immediately → 2 Turn the useful task into an agent → 3 Test it in the playground → 4 Connect a tool with OAuth → 5 Schedule it`

**Skippable:** Agent creation, tool connection, and scheduling are optional after the first result.

**Takeaway:** Sarvam delays configuration until after the user experiences AI value. Its Builder ↔ Playground loop is especially relevant to Hiver’s proposed AI test. [Official quick start](https://docs.sarvam.ai/work-agents/quickstart)

### Attio — interaction and polish benchmark

**Structure:** Progressive product setup; the exact signup screens are not publicly documented.

`1 Create workspace → 2 Connect Google/Microsoft mailbox → 3 Contacts and companies appear automatically → 4 Import or create records → 5 Invite teammates → 6 Build lists, views and workflows`

**Takeaway:** Attio turns a connection into visible populated data, then teaches the data model progressively. The important lesson is immediate proof of value, not its mailbox-first order. [Official first setup](https://attio.com/help/academy/introduction/email-sync-people-companies) · [Official import flow](https://attio.com/help/reference/attio-101/introduction-to-data-importing)

### Linear — interaction and polish benchmark

**Structure:** Short core entry followed by optional setup paths; exact signup screens are not publicly documented.

`1 Work email → 2 Create or join workspace → 3 Enter the product with a default team → 4 Create first issue/project → 5 Optional import → 6 Optional invite`

**Takeaway:** Linear lets users understand and use the core product before completing migration or team setup. Imports and invitations remain available without blocking entry. [Official start guide](https://linear.app/docs/start-guide) · [Official importer](https://linear.app/docs/import-issues)

### Notion — interaction and flexibility benchmark

**Structure:** Short entry with branching choices; exact signup screens are not publicly documented.

`1 Sign in → 2 Join or create workspace → 3 Choose personal/team context → 4 Land in a usable workspace/template → 5 Optional import → 6 Optional invite`

**Takeaway:** Notion makes importing and inviting available without making them prerequisites. Users can begin with useful content and structure already present. [Official workspace guide](https://www.notion.com/help/guides/how-to-set-up-your-notion-workspace-for-your-team) · [Official import flow](https://www.notion.com/help/import-data-into-notion)

### Figma — interaction and collaboration benchmark

**Structure:** Short entry into a working canvas; team setup can happen later. Exact signup screens vary by plan.

`1 Sign in → 2 Create/join team or continue in Drafts → 3 Create a file or choose a template → 4 Enter the working canvas → 5 Optional invite/share`

**Takeaway:** Figma’s first value is the product itself—the editable canvas—not an explanation of every capability. Collaboration is always visible but does not block solo exploration. [Official file creation](https://help.figma.com/hc/en-us/articles/360038511153-Create-a-new-file) · [Official invitations](https://help.figma.com/hc/en-us/articles/360039481034-Invite-members-to-a-team)

### Miro — interaction and template benchmark

**Structure:** Short linear entry with a branch to join or create a team.

`1 Register → 2 Join an existing team or create one → 3 Optional invite teammates → 4 Enter an automatically created first board → 5 Start blank or use a template`

**Takeaway:** Miro removes the empty-state problem by creating “My First Board” automatically. Hiver should similarly avoid dropping users into an empty product after onboarding. [Official team creation](https://help.miro.com/hc/en-us/articles/360034217373-How-to-create-a-team-in-Miro) · [Official first board](https://help.miro.com/hc/en-us/articles/360017571974-Create-a-Miro-board)

### Plane — interaction benchmark

**Structure:** Short core setup followed by optional migration and collaboration work. Exact signup screens are not publicly documented.

`1 Sign in → 2 Create workspace → 3 Create first project → 4 Enter usable project → 5 Optional import from another tool → 6 Optional invite and integrations`

**Takeaway:** Plane keeps workspace and project creation central, while migration and integrations remain separate follow-up jobs. [Official product documentation](https://docs.plane.so/)

### CRED — delight benchmark, not a direct product benchmark

**Structure:** Linear, eligibility-led mobile journey. Public sources reveal the meaningful stages, not every app screen.

`1 Name + Indian mobile number → 2 OTP/contact verification → 3 Consent to credit check → 4 Eligibility decision → 5 Enter the member experience and rewards`

**Takeaway:** CRED makes progress feel premium and turns the result into a reward. We should borrow its confidence, motion and sense of reveal—not its financial eligibility mechanics. [Official membership explanation](https://cred.club/about)

### Cursor — AI-led activation benchmark

**Structure:** Familiarity setup followed immediately by a real codebase task.

`1 Install and sign in → 2 Import editor preferences → 3 Open a real folder → 4 Automatic background indexing → 5 Ask Cursor to explain the codebase → 6 Request one safe change → 7 Review the diff and checks`

**Public time:** Cursor describes its quickstart as **5 minutes**. Codebase indexing can continue in the background.

**Wow moment:** Cursor understands an unfamiliar repository and produces a reviewable, useful change without requiring the user to manually explain the entire codebase.

**Takeaway:** Reduce switching anxiety first, learn context in the background, then prove value on the user’s own material. [Official installation](https://docs.cursor.com/get-started/installation) · [Official quickstart](https://prod.cursor.com/docs/get-started/quickstart)

### Codex — AI-led work benchmark

**Structure:** Minimal setup followed by a real task and a reviewable result.

`1 Install/open app and sign in → 2 Select a local project or folder → 3 Describe a goal → 4 Codex reads the project and works → 5 Review output, diff and checks → 6 Continue or approve next actions`

**Public time:** No dependable single onboarding duration is published; task time varies with the work.

**Wow moment:** A goal becomes completed, inspectable work—not merely a chat response. Existing project context and settings carry over between Codex surfaces.

**Takeaway:** The result, evidence, and ability to steer are the onboarding. Advanced configuration is available later. [Official Codex app](https://openai.com/index/introducing-the-codex-app/) · [Official quickstart](https://learn.chatgpt.com/docs/quickstart)

### Claude and Claude Code — AI-led trust benchmark

**Structure:** Claude Chat is prompt-first. Claude Code adds project access and explicit edit approval.

`Claude: 1 Sign in → 2 Ask naturally → 3 Receive response or working Artifact → 4 Iterate`

`Claude Code: 1 Install → 2 Sign in → 3 Open a project → 4 Ask what the project does → 5 Request a small change → 6 Review and approve → 7 Test or commit`

**Public time:** Claude Code says the quickstart gets users working “in a few minutes”; no exact measured duration is published.

**Wow moment:** Claude turns a plain-language request into a useful answer or editable Artifact. Claude Code reads project context without manual upload and asks before changing files.

**Takeaway:** Strong AI onboarding combines immediate usefulness with visible human control. [Official Claude start](https://support.claude.com/en/articles/8114491-get-started-with-claude) · [Official Claude Code quickstart](https://code.claude.com/docs/en/quickstart) · [Official Artifacts guide](https://support.claude.com/en/articles/9487310-what-are-artifacts-and-how-do-i-use-them)

### Replit Agent — prompt-to-product benchmark

**Structure:** Linear creation loop with optional planning.

`1 Sign in → 2 Describe an app → 3 Optional review of plan → 4 Watch Agent build → 5 Use the live preview → 6 Ask Agent to fix issues → 7 Publish to a shareable URL`

**Public time:** Replit’s guided first application is estimated at **10 minutes**.

**Wow moment:** A description becomes a functioning application the user can click, test, and share.

**Takeaway:** The best AI reveal is interactive and verifiable. A loading animation or generated text alone is weaker. [Official first-app guide](https://docs.replit.com/build/your-first-app)

### Lovable — prompt-to-preview benchmark

**Structure:** Very short prompt-first entry; backend and publishing come later.

`1 Create account → 2 Describe the idea → 3 Watch the application build → 4 Interact with preview → 5 Refine through prompts/visual edits → 6 Optional backend and GitHub → 7 Publish`

**Public time:** No exact onboarding duration is published; Lovable frames it as four steps from sign-in to a working application.

**Wow moment:** The user sees a working, visual application generated from one prompt.

**Takeaway:** Ask for the minimum input capable of producing a visible result. Defer infrastructure until the result creates motivation. [Official quickstart](https://docs.lovable.dev/introduction/getting-started) · [Official four-step explanation](https://lovable.dev/meta-lp)

### Ramp — complex and regulated setup benchmark

**Structure:** Application/verification followed by a persistent setup guide. Tasks are completed over time rather than blocking first product access.

`1 Apply and verify business → 2 Enter the product → 3 Verify bank accounts → 4 Configure expense policy and approvals → 5 Invite team → 6 Issue cards → 7 Connect accounting → 8 Migrate spend and add integrations`

**Public time:** Ramp frames complete administrator setup as work for the **first week**, not a five-minute onboarding.

**Wow moment:** The value appears when the first controlled card, policy, or automated transaction workflow works—not when every finance setting is finished.

**Takeaway:** Complex products should distinguish “entered and saw value” from “fully configured.” [Official administrator guide](https://support.ramp.com/getting-started-as-an-admin)

### Salesforce Starter — complex CRM benchmark

**Structure:** Enter a usable, preconfigured CRM first; keep setup guidance persistently available.

`1 Start trial with email → 2 Enter preconfigured Starter workspace → 3 See recommended Spotlight Cards → 4 Create first record or import data → 5 Connect email → 6 Invite users → 7 Continue setup through Guidance Center`

**Public time:** Salesforce’s introductory Starter learning unit is about **15 minutes**; complete business setup varies.

**Wow moment:** The product already contains sensible sales, service, marketing, reports and guided next actions instead of an empty CRM shell.

**Takeaway:** Do not confuse onboarding completion with implementation completion. [Official Starter guide](https://trailhead.salesforce.com/content/learn/modules/salesforce-easy-quick-look/get-started-with-salesforce-easy)

### HubSpot — complex CRM benchmark

**Structure:** Product entry followed by separate setup and data workstreams; exact first-run screens and total time are not publicly documented.

`1 Create account → 2 Choose business goals/tools → 3 Enter CRM → 4 Create or import contacts → 5 Connect email/integrations → 6 Invite users → 7 Build pipelines, properties and automation over time`

**Wow moment:** Existing contacts become usable CRM records with associations and activity, allowing the team to begin working before every system is configured.

**Takeaway:** Migration, permissions, and automation are implementation work. They should remain visible and guided without blocking the first product experience. [Official import overview](https://knowledge.hubspot.com/import-and-export/understand-the-import-tool) · [Official quick contact import](https://knowledge.hubspot.com/import-and-export/import-contacts-quick-import)

## 3. Conclusions to lock before designing

### A. Keep channel selection early

The user’s reasoning is correct. Someone moving from Zendesk, Intercom, or Pylon needs immediate confidence that Hiver covers their current channels.

- Keep it within the first few product questions.
- Make it a simple multi-select: Email, Chat, Slack, and Voice—the current Omni-supported set confirmed in code.
- Do not request permissions or open any channel setup from this step.
- Its job is reassurance and personalisation, not configuration.

### B. Channel connection belongs after onboarding

Agreed. Connecting a channel inside this AI journey would recreate the setup-heavy problem we are trying to remove.

- The AI onboarding ends with the user entering Hiver Omni.
- Hiver then recommends the most relevant channel connection based on their earlier selection.
- This is also consistent with Zendesk’s new AI-led setup, which leaves support-email connection until the final setup stage.

### C. Start website learning immediately after the early channel signal

Website/help-centre input should appear very early so processing can begin quickly. While Hiver learns from the source, it can ask only lightweight questions instead of showing a long loading screen.

### D. The wow moment must be a company-specific answer

“AI is available” is not enough. The user must see that Hiver understood their own business.

In simple terms, the success event means:

> The user asks a realistic customer question and receives a useful answer based on their company website or help centre.

That is what “complete the first company-specific AI conversation” meant. It does **not** mean handling a real customer yet.

### E. Invite teammates after the AI proof

Invitation should remain in the journey, but the stronger placement is after the user sees the AI answer.

Reason: “Invite your team to try this” is more motivating after Hiver has demonstrated something worth sharing. It should remain skippable.

### F. Advertise advanced setup; never require it

Show that Hiver supports SLAs, automations, tags, views, routing, and human handover. Do not ask users to configure any of them during AI onboarding.

### G. Challenges to the current idea

The direction is promising, but it has important weaknesses:

- **It is not unique.** Zendesk already creates an AI setup from a company website and lets users test it before connecting support Email.
- **A homepage may be poor knowledge.** Many company websites contain marketing copy, not accurate support answers. A weak first answer would create distrust instead of delight.
- **Source visibility is not unique either.** Intercom already lets users inspect which content and guidance produced an answer during testing.
- **Channel selection can overpromise.** Selecting Email, Chat, Slack, or Voice must not imply that the AI agent works identically across every channel unless the product truly supports it.
- **A long generation wait will kill the moment.** Website processing must happen in the background, with honest progress and a useful fallback.
- **Forcing invitation would punish solo evaluators.** The invitation should be motivated by value and remain skippable.

### H. Hiver’s stronger opportunity

Hiver should not position this as merely “we generated an AI agent.” The stronger opportunity is an **evidence-first AI evaluation**:

- **Breadth proof:** Hiver visibly understands the customer’s current communication channels.
- **Knowledge proof:** Hiver learns something recognisable from the customer’s own source.
- **Answer proof:** The user receives a useful company-specific answer.
- **Evidence proof:** The answer shows where it came from and clearly admits uncertainty.
- **Human-control proof:** The experience explains that AI assists the team and hands complex work to people.
- **Continuation proof:** The user enters Hiver Omni with the generated knowledge/agent preserved and a clear next action—without facing an empty product.

Cursor, Claude Code, Codex, Replit, and Lovable all make the first result inspectable: a diff, approval, preview, test, or working application. Hiver’s wow moment should likewise be something the user can question and verify, not a theatrical animation followed by generic text.

### I. What can genuinely differentiate Hiver

- Faster time from website input to first credible answer than direct support competitors.
- Early omnichannel reassurance without forcing channel setup.
- A visible human + AI partnership rather than “AI replaces your team.”
- Suggested real questions derived from the customer’s content, plus freedom to ask anything.
- Clear source evidence and an honest “I don’t know” state.
- A polished reveal that becomes a saved, usable Hiver Omni asset—not a disposable demo.
- A personalised post-onboarding setup guide, similar to Ramp or Salesforce, instead of putting all implementation work in the onboarding gate.

### J. Measurement required for the A/B test

Before sending 20% of new Omni users through AI onboarding, both versions need the same measurable start and end points:

- signup started;
- account verified;
- onboarding version assigned;
- each onboarding step viewed and completed;
- website learning started, succeeded, or failed;
- first AI question asked;
- first AI answer shown;
- invite sent or skipped;
- entered Hiver Omni;
- first channel connected after onboarding.

This completes research and conclusions only. The redesigned journey should be the next separate step.
