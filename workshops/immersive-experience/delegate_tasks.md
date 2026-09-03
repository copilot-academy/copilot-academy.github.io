---
title: "Delegate Tasks"
description: "Delegate parallel work with the GitHub Copilot app, custom agents, and Copilot cloud agent"
sidebar_position: 5
---

# Use Case 4: "I have too many tasks"

> **Scenario:** You have five tickets in your sprint: bug fixes, new features, and technical debt. You cannot complete them all synchronously.
>
> **Time:** ~30 minutes
>
> **Copilot Features:** GitHub Copilot app, My work, custom agents, Copilot cloud agent

**Your Challenge:** Direct several isolated agent sessions while you stay focused on prioritization, architecture, and review.

## Table of Contents

- [Step 1: Triage Work in the Copilot App](#step-1-triage-work-in-the-copilot-app)
- [Step 2: Start an Issue-Scoped Session](#step-2-start-an-issue-scoped-session)
- [Step 3: Delegate to a Repository Custom Agent](#step-3-delegate-to-a-repository-custom-agent)
- [Step 4: Direct Concurrent Sessions](#step-4-direct-concurrent-sessions)
- [Step 5: Review the Resulting Pull Requests](#step-5-review-the-resulting-pull-requests)
- [Optional: Use Mission Control on the Web](#optional-use-mission-control-on-the-web)
- [What You Learned](#what-you-learned)
- [Next Steps](#next-steps)

## Step 1: Triage Work in the Copilot App

1. Open the GitHub Copilot app.
2. Select **My work** in the sidebar.
3. Find the `Improve test coverage for API` issue for your workshop repository.
4. Open the issue and review its description, labels, assignees, and repository context.

If the issue does not exist, create it with the title `Improve test coverage for API`. Ask for coverage of the API routes, error paths, and database failures, with `make test-coverage` as the validation command. Return to **My work** after creating it.

:::tip
Use sections and filters in **My work** to separate active issues, review requests, and completed work. This gives you one queue for issue and pull request work across repositories.
:::

## Step 2: Start an Issue-Scoped Session

1. From the issue details, click **New session**. The session starts with the issue context already attached.
2. Select the repository and `main` as the base branch if the app prompts you, then choose a **new worktree** for the session.
3. Keep the model set to **Auto**. Increase reasoning only when the task requires deeper architectural analysis.
4. Choose **Plan** mode, then prompt:

   ```text
   Implement this issue. First confirm the acceptance criteria and propose a concise plan. Run make test-coverage and open a pull request when validation passes.
   ```

5. Review the proposed plan and approve it only when the scope matches the issue.
6. Follow the session as the agent explores the repository, changes files, and runs validation.

:::note
A session in a new worktree uses its own branch and isolated checkout. If your organization enables cloud-based sessions, you can instead delegate the task to Copilot cloud agent in a GitHub-hosted environment.
:::

## Step 3: Delegate to a Repository Custom Agent

Start a second session for specialized test work:

1. Open the relevant cart-testing issue in **My work**, or create a small issue that asks for behavior-driven development (BDD) coverage of the cart.
2. Click **New session**.
3. Select the branch from the cart pull request created in Feature Development. If that pull request has already merged, select the updated default branch instead.
4. Select the repository-provided **BDD Specialist** custom agent.
5. Keep the model set to **Auto**, and prompt:

   ```text
   Add comprehensive BDD tests for the Cart page feature. Follow the issue acceptance criteria, run the focused test suite, and open a pull request when the tests pass.
   ```

6. Start the session.

The custom agent definition in `.github/agents/bdd-specialist.agent.md` provides repository-specific instructions and tools. Teams can add other custom agents for areas such as APIs, documentation, or security.

## Step 4: Direct Concurrent Sessions

Keep both sessions running so you can practice directing parallel workstreams:

1. Switch between the sessions in the app sidebar.
2. In each session, review:
   - Current progress and completed steps
   - Commands and validation results
   - Changed files
   - The session branch or worktree
3. Steer the API coverage session with a follow-up:

   ```text
   Also cover database connection failures and malformed request parameters.
   ```

4. Confirm that the agent incorporates the new instruction without expanding beyond the issue's intent.

Because each session is isolated, the agents can work concurrently without overwriting one another's uncommitted changes.

:::important
Parallel work still needs coordination. Avoid assigning overlapping files or contradictory requirements to separate sessions unless you plan to reconcile the changes.
:::

## Step 5: Review the Resulting Pull Requests

When a session finishes:

1. Review its summary, changed files, and validation results.
2. Ask the agent to correct incomplete work before creating a pull request.
3. Open or create the pull request from the session.
4. Return to **My work** and open the resulting pull request.
5. Confirm that the pull request links to the correct issue and that its description explains the changes and validation.

Do not merge yet. You will review the pull request in the next use case.

## Optional: Use Mission Control on the Web

If you prefer a browser, open [Mission Control](https://github.com/copilot/agents) to monitor and steer Copilot cloud agent sessions. Mission Control is a useful web alternative, but the GitHub Copilot app remains the primary workflow for this exercise.

## What You Learned

✅ **My work** - Triage issues and pull requests in one place

✅ **Issue-Scoped Sessions** - Start with repository and issue context already attached

✅ **Custom Agents** - Apply specialized repository instructions and tools

✅ **Isolated Worktrees** - Run concurrent sessions without sharing uncommitted changes

✅ **Steering and Progress** - Review activity, changed files, and validation while work is in progress

✅ **Pull Request Handoff** - Turn validated session work into reviewable pull requests

**Time Investment:** 30 minutes to delegate, steer, and review agent work

**Value:** Advance several independent tickets while retaining human direction and review

## Next Steps

Continue to [Code Review](/workshops/immersive-experience/code_review) to learn how to review pull requests and resolve feedback with Copilot.
