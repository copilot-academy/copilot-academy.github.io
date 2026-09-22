---
title: "Feature Development"
description: "Build a shopping cart feature using Plan mode, Vision, and a pull request"
sidebar_position: 2
---

# Use Case 1: "I'm asked to add a new feature"

> **Scenario:** Your PM says: *"We need a shopping cart. Users should be able to add products, see a count in the nav bar, and view their cart on a dedicated page."*
>
> **Time:** ~30 minutes
>
> **Copilot Features:** Plan mode, Vision, Sessions, Pull requests

**Your Challenge:** Build this feature end-to-end, matching a provided design.

## Step 1: Start a session

1. In the GitHub Copilot app, open your copy of the demo repository and start a **new session** in a new worktree.
2. Leave the model on **Auto**.
3. Switch the session to **Plan** mode.

The session runs in its own isolated worktree and branch, so this exercise won't collide with anything else you try later.

> **Using an IDE instead?** Open Copilot Chat, create a branch for this exercise, and use **Plan** mode where available or **Agent** mode otherwise. The prompts below are the same.

## Step 2: Plan the feature

Plan mode exists to clarify requirements before any code is written. It improves the quality of your prompt, and therefore the output.

1. Open `docs/design/cart.png` and have a look at the target design.
2. Attach `docs/design/cart.png` to the session — Copilot reads the image and designs against it.
3. Prompt:
   ```text
   I need to implement a shopping cart feature in this application matching this image, including routing, a navbar badge with item count, state management, and add/remove interactions.
   ```
4. Copilot will ask clarifying questions such as:
   - Should the cart persist across sessions?
   - What data should be stored?
   - Any constraints on UI/UX?
5. Answer them, or reply "Use standard e-commerce patterns" to accept sensible defaults.
6. Read the plan it produces. Iterate until you agree with the approach — this is the cheapest place to catch a wrong turn.

> **Tip:** If the plan is thin or the feature spans more files than you expected, this is the one moment worth switching to a higher-reasoning model. Switch back to **Auto** for the implementation.

## Step 3: Approve the plan and implement

1. **Approve the plan.** The session moves into implementation.
2. Watch the file list and task list as Copilot works. It will:
   - Create the Cart component and page
   - Add routing
   - Implement state management (Context/Provider)
   - Add the NavBar badge
   - Wire up add/remove functionality
3. If it finishes without running the app, ask it to:
   ```text
   Start the application and verify the cart works as expected.
   ```

## Step 4: Verify it yourself

Where your environment gives Copilot a terminal and browser, it can do much of this itself — but confirm the result with your own eyes.

1. Run the application:
   ```bash
   make dev
   ```
2. Open port **5137** in a browser (in Codespaces, use the **Ports** tab):
   - Go to the **Products** page or click **Explore Products**
   - Increment a product quantity and add it to the cart
   - Verify the badge updates with a count next to the cart icon
   - Click the cart icon to view the cart page
3. If something is off, describe the symptom rather than the fix:
   ```text
   The badge doesn't update when I add items. Investigate and fix this.
   ```

## Step 5: Open a pull request and review it

1. Ask Copilot to summarize the completed work and confirm the build and tests are passing:
   ```text
   Summarize the completed cart feature and confirm the build and tests are passing.
   ```
2. Open **Changes**, review the diff, then click **Create PR** and check the generated description before submitting it.
3. Open the pull request and read the diff yourself. You're looking for scope creep, missing edge cases, and anything that doesn't match the design.
4. Request a **Copilot code review** on the pull request and work through its comments.

You'll go deeper on reviews in [Code Review](/workshops/immersive-experience/code_review) — for now, get comfortable with the loop: plan, build, verify, review.

## Optional: Sharpen the request before you build

Real feature requests rarely arrive as well-formed as the prompt above. If you want to practice the step *before* planning, try turning a vague request into an issue that's ready to hand off.

- **With a canvas extension:** if the companion repository ships an issue-readiness canvas, open it from the app and use it to interrogate the request — acceptance criteria, edge cases, out-of-scope items — before you start a session.
- **Without one (works anywhere):** start a **Chat** and prompt:
  ```text
  Act as a skeptical tech lead. Here's a feature request: "We need a shopping cart."
  Ask me the questions you'd need answered before this is ready to implement, then
  draft it as a GitHub issue with acceptance criteria and explicit out-of-scope items.
  ```

Either path produces the same thing: a request precise enough that Plan mode has something real to work with.

> **Note:** Canvas extensions are provided by the companion repository, which is refreshed separately from this workshop. If you don't see one, use the chat fallback — nothing later in the workshop depends on it. See the [canvas extensions documentation](https://docs.github.com/en/copilot/how-tos/github-copilot-app/working-with-canvas-extensions) to learn more.

## What You Learned

✅ **Plan Mode** - Clarify ambiguous requirements before writing code
✅ **Vision** - Copilot designs against a UI mockup
✅ **Sessions** - Isolated worktrees keep parallel work clean
✅ **Self-correction** - The agent runs, tests, and fixes its own work
✅ **Pull requests** - Finish the loop with a reviewable change

**Time Investment:** 30 minutes  
**Value:** A complete feature that would normally take 2-3 hours

## Next Steps

Continue to [Test Coverage](/workshops/immersive-experience/test_coverage) to learn how to improve test coverage with Copilot.
