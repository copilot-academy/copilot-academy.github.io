---
title: "Code Review"
description: "Speed up code reviews with the Code Review Agent"
sidebar_position: 6
---

# Use Case 5: "PRs take forever to review"

> **Scenario:** Your team has a backlog of 15 PRs. Reviews are shallow because reviewers are overwhelmed.
>
> **Time:** ~15 minutes
>
> **Copilot Features:** Code Review Agent

**Your Challenge:** Use agentic AI-assisted code review to catch issues faster and more consistently.

## Step 1: Assign Code Review Agent

1. In your repo, find the pull request `Feature: Add ToS Download` and open it.  
2. Assign **Copilot** as a reviewer 
3. Scroll down to the bottom of the pull request and you should see a message that you requested a review from Copilot.

## Step 2: Review Runs in GitHub Actions

1. Navigate to **Actions → Copilot Code Review**
2. Notice it runs:
   - **CodeQL** security analysis
   - **ESLint** code quality checks
3. For awareness, Code Review agent has access to the **Code Graph** to analyze broader context.  Meaning it not only sees the PR changes, but also related files and dependencies.
4. Review runs independently - no blocking your workflow

## Step 3: Review Enhanced Feedback

Once the Actions run has completed, go back to the pull request.  You should see Copilot's review (typically starting with a 'Pull Request Overview' section).  The review includes:

- **Security findings** from CodeQL scan
- **Code quality issues** from ESLint
- **Best practices** violations such as missing swagger docs and not using React Query as per team standards
- **Additional context** from Code Graph (not just PR changes)
- **Instructions-based feedback** (checks against your `.github/instructions/`)

## Step 4: Implement Suggestions Automatically

Don't like manual fixes? Click **"Implement Suggestions"** to hand feedback back to Coding Agent for automatic fixes.  This will open a new pull request that merges into your existing PR with all suggested fixes applied.

Alternatively you can open a new comment:
<div className="prompt-block">

```text
@Copilot implement all your review suggestions
```

</div>

## Step 5: Grouped Changes (Optional)

### Copilot Group Changes in PRs

Copilot is not able to group changes in existing pull requests created by humans. (Not yet on AI generated PRs).  This is intended to help reviewers better understand large PRs by breaking them into logical sections.

1. Switch to the `feature-add-cart-page` branch and click the **Contribute** button to open a pull request against the `main` branch.
2. Create a description for the pull request.  (Click the Copilot icon to have Copilot help you write this!)
3. Click **Create pull request** to complete this process.  
4. Navigate to the `Files changed` tab of the PR.
5. On the top right, notice how Copilot grouped changes into logical sections, making it easier to review and understand the modifications.

## What You Learned

✅ **Enhanced Code Review** - Security scanning built-in  
✅ **Actions Integration** - Reviews run independently and are auditable  
✅ **Automatic Implementation** - Hand fixes back to agent  

**Time Investment:** 15 minutes  
**Value:** Thorough reviews in less time, higher quality feedback

## Next Steps

Continue to [Security](/workshops/immersive-experience/security) to learn how to fix vulnerabilities faster with Copilot.
