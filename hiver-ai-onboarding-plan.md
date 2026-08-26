# Hiver AI onboarding plan

**Scope:** New administrators joining **Hiver Omni only**. The AI journey is tested against the current onboarding. Channels and advanced settings are configured after onboarding.

## Recommended journey

| Step | User journey | Required or skippable? | If it fails | Result and next step |
|---|---|---|---|---|
| **1. Create account** | Sign up with Google, Microsoft, or work email. Complete verification and permission screens. | **Required** | Explain the exact issue. Allow retry or another sign-in method. Preserve entered details. | Verify the account and permanently assign the user to legacy or AI onboarding. |
| **2. Welcome** | Explain the promise: Hiver combines human support with AI assistance. The preview is safe and will not contact customers. | **Skippable** through **Set up later** | Not applicable. A skip is not a failure. | Continue to channel selection, or enter Omni if skipped. |
| **3. Select current channels** | Ask: **Where do customers reach you today?** Choose Email, Chat, Slack, Voice, or **Not sure yet**. | **Required**, but “Not sure yet” is valid | Keep selections and retry saving in the background. | Reassure users that Hiver supports their work and personalise later setup. **Do not connect channels here.** |
| **4. Add knowledge** | Enter a company website or public help-centre link. A second link may be added if needed. | Required for a company-specific AI preview; **skippable for product entry** | Offer another link, pasted FAQs if technically supported, a clearly labelled Hiver sample, or product entry. Never create a confident agent from poor content. | Start creating the company-specific AI preview. |
| **5. Hiver learns** | Show honest progress: reading pages, finding support topics, preparing test questions. Briefly advertise handover, SLAs, automations, tags, views, and routing without asking users to configure them. | **Skippable**; processing can continue | Offer retry, another source, sample mode, or product entry. Keep the user in the AI test group. | Open the AI test when ready. If it takes too long, let the user enter Omni and notify them later. |
| **6. Test the AI agent** | Show three suggested questions and allow a custom question. Display the answer, exact source, uncertainty when needed, and the path to a human teammate. | Needed for the intended wow moment, but **skippable** through **Explore Hiver instead** | Preserve the question. Retry or allow product entry. Never invent an answer. | Success is the first useful, company-specific, source-backed answer. Preserve this test for the product. |
| **7. Invite teammates** | Invite teammates to try what Hiver learned. Ask only for work email and necessary role information. | **Skippable** | Keep valid emails. Mark invalid or existing users individually. Save failed invitations for retry inside Omni. | Continue to the ready summary. |
| **8. Ready summary** | Show knowledge status, AI test status, selected channels, teammate status, and what can be completed later. | No further setup required | If any item is incomplete, label it honestly and provide a later action. | Primary action: **Enter Hiver Omni**. |
| **9. Enter Hiver Omni** | Land on a personalised **Omni Setup Home**, not an empty Inbox. | — | If generated work was not saved, keep it visible, mark it unsaved, and retry. Never show false success. | Continue setup inside the product without blocking access. |

## What appears on Omni Setup Home

1. Created knowledge source and its status.
2. AI-agent draft or preview.
3. Saved onboarding test conversation.
4. One recommended action based on Step 3: **Connect your first channel**.
5. A persistent setup guide.

If AI creation was skipped or failed, show **Finish creating your AI preview** as optional. Do not claim that a company-specific agent exists.

## Post-onboarding setup guide

These actions happen inside Hiver Omni and never block entry:

1. Connect selected channels.
2. Import or learn from resolved conversations where supported.
3. Invite teammates if skipped.
4. Review AI knowledge and behaviour.
5. Configure human handover and routing.
6. Configure SLAs.
7. Configure automations.
8. Create tags and views.

## Invited teammate journey

1. Accept invitation and sign in.
2. See a short welcome suited to their role.
3. Understand how humans and AI work together in Hiver.
4. Enter the relevant Omni workspace.

They do not repeat the administrator setup.

## Rules for every state

1. Refresh, close, and back navigation preserve completed work and inputs.
2. Optional steps clearly explain that they can be finished later.
3. Failure and voluntary skip are recorded separately.
4. An AI-onboarding failure never silently moves a user to legacy onboarding.
5. Sample content is always labelled as sample content.
6. Onboarding never contacts customers or publishes an agent automatically.
7. Channel connection, SLAs, automations, tags, views, and routing are never mandatory during onboarding.

## Measurement

Track account verification, experiment assignment, every step viewed/completed/skipped/failed, knowledge quality and processing result, first suggested/custom question, first grounded answer, product entry, teammate invite, and first post-onboarding channel connection.

Measure **active completion time** separately from **elapsed time**, so users returning hours later do not make onboarding appear to take an hour.

## Conclusion

The right journey is:

**Account → channel reassurance → company knowledge → visible AI learning → source-backed AI answer → optional team invite → non-empty Hiver Omni.**

Hiver should not compete only on “we can build an AI agent from a website”—other products already do that. The stronger position is proving, within minutes, that Hiver can answer from the customer’s real knowledge, show its evidence, admit uncertainty, hand complex work to humans, and preserve everything inside an omnichannel support workspace.

**Main success:** A new administrator sees one useful, company-specific, source-backed answer and enters Hiver Omni with that work already available.

## Approved visual direction

- Use a full-screen, adaptive split layout rather than a modal.
- Begin with focused inputs on the left and meaningful product proof on the right.
- Expand the AI test into a larger workspace where the answer, source, uncertainty, and human handover are inspectable.
- Use one visual system: customer channels become knowledge, knowledge becomes a grounded answer, and complex questions move to a human.
- Use Hiver yellow for human decisions and primary actions, purple for AI activity, and semantic colours only for real status.
- Motion explains state and progress. It never hides content, fakes processing, or blocks interaction.
- The review prototype must include realistic content, responsive layouts, keyboard access, reduced motion, persistence, and complete skip/error/success states.
