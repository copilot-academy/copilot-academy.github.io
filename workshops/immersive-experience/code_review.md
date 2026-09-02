---
title: "Code Review"
description: "Review pull requests and resolve feedback with the GitHub Copilot app and Copilot code review"
sidebar_position: 6
---

# Use Case 5: "PRs take forever to review"

> **Scenario:** Your team has a backlog of 15 pull requests. Reviews are shallow because reviewers are overwhelmed.
>
> **Time:** ~15 minutes
>
> **Copilot Features:** GitHub Copilot app, PR-scoped sessions, Copilot code review, Copilot cloud agent

**Your Challenge:** Combine human judgment with agentic review and remediation to catch issues and move a pull request through CI.

## Table of Contents

- [Step 1: Open the Pull Request Overview](#step-1-open-the-pull-request-overview)
- [Step 2: Review the Changed Files](#step-2-review-the-changed-files)
- [Step 3: Start a PR-Scoped Review Session](#step-3-start-a-pr-scoped-review-session)
- [Step 4: Retain Copilot Code Review on GitHub.com](#step-4-retain-copilot-code-review-on-githubcom)
- [Step 5: Resolve Comments and Failing Checks](#step-5-resolve-comments-and-failing-checks)
- [Optional: Enable Agent Merge](#optional-enable-agent-merge)
- [What You Learned](#what-you-learned)
- [Next Steps](#next-steps)

## Step 1: Open the Pull Request Overview

1. Open the GitHub Copilot app.
2. Select **My work**.
3. Find and open the cart pull request you created in Feature Development.
4. Review the pull request overview:
   - Summary and linked issue
   - Review activity
   - CI check status
   - Merge blockers

:::important
Treat the overview as a starting point, not an approval. You remain responsible for understanding the change and deciding whether it is safe to merge.
:::

## Step 2: Review the Changed Files

1. Open the **Files changed** tab.
2. Read the diff and verify that it matches the pull request description.
3. Pay particular attention to:
   - Cart state and navigation behavior
   - Quantity, shipping, and total calculations
   - Accessibility and the supplied design
   - Tests and error handling
   - Unexpected or unrelated changes
4. Leave review comments on any lines that need clarification or correction.

## Step 3: Start a PR-Scoped Review Session

1. From the pull request, click **New session**.
2. Keep the model set to **Auto**.
3. Ask Copilot to inspect the pull request:

   ```text
   Review this pull request for correctness, missing tests, compliance gaps, and unintended changes. Prioritize concrete issues that could block merging, and explain each finding with file references.
   ```

4. Compare the agent's findings with your own review of **Files changed**.
5. Ask follow-up questions or steer the session when a finding needs more evidence.
6. Return to the pull request and click **Review** when you are ready to submit your comments.

The PR-scoped session keeps the conversation, diff, and pull request lifecycle together. It can help investigate a concern, draft a review comment, or make an approved fix.

## Step 4: Retain Copilot Code Review on GitHub.com

Copilot code review on GitHub.com remains useful when you want an independent, agentic review in the standard pull request workflow:

1. Open the same pull request on GitHub.com.
2. Under **Reviewers**, request a review from **Copilot**.
3. Wait for Copilot to add its pull request overview and inline review comments.
4. Validate each finding before applying a suggested change.

Copilot code review can use repository context and custom instructions, including path-specific instructions in `.github/instructions/`. Its comments behave like human review comments: reviewers can reply, react, hide, or resolve them.

:::note
By default, Copilot submits a comment review rather than an approval or request for changes. It does not replace required human review unless your organization explicitly configures Copilot approvals.
:::

## Step 5: Resolve Comments and Failing Checks

Return to the pull request in the GitHub Copilot app:

1. Scroll to a review comment that requires a code change.
2. Click **Fix** to start or direct a Copilot session with the comment context.
3. Review the proposed edit and focused validation before accepting it.
4. At the bottom of the pull request overview, inspect the latest CI results.
5. If a check fails, open its logs to understand the failure, then click **Fix failing checks**.
6. Review the resulting commits and **Files changed** again.
7. Re-run or wait for CI, then confirm that required checks pass and review threads are resolved.

Copilot cloud agent can implement fixes in an isolated environment and push commits to the pull request branch. Human reviewers should still verify the final diff and test results.

## Optional: Enable Agent Merge

If agent merge is available and your facilitator approves its use, you can enable **agent merge** at the top of the app. The workspace's Copilot session will monitor the pull request, attempt to fix blockers, and merge only when GitHub allows.

:::caution
Enable agent merge only after a human reviews the diff, workflow changes, and CI results. Agent merge does not bypass branch protection, required checks, required approvals, or organization policies. A Copilot-authored pull request may still require approval from another eligible reviewer.
:::

You can leave agent merge disabled and complete the merge manually. It is not required for this exercise.

Before End-to-End Tests, either merge the cart pull request or keep its branch available. The E2E exercise must start from code that includes the cart feature.

## What You Learned

✅ **Pull Request Overview** - See review activity, CI status, and merge blockers together

✅ **Files Changed** - Validate the actual diff before approving changes

✅ **PR-Scoped Sessions** - Investigate findings and direct fixes with pull request context

✅ **Copilot Code Review** - Add agentic feedback to the GitHub.com review workflow

✅ **Targeted Remediation** - Use Copilot to address comments and failing checks

✅ **Human-Controlled Merge** - Preserve approvals, required checks, and repository policies

**Time Investment:** 15 minutes

**Value:** Faster review cycles without giving up human accountability

## Next Steps

Continue to [Security](/workshops/immersive-experience/security) to learn how to fix vulnerabilities faster with Copilot.
