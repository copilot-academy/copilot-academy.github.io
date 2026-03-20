---
title: "Test Coverage"
description: "Improve test coverage using Prompt Files and Self-Healing capabilities"
sidebar_position: 3
---

# Use Case 2: "We need better test coverage"

> **Scenario:** Your tech lead says: *"Our API test coverage is at 45%. We need to get it above 80% before the release."*
>
> **Time:** ~20 minutes
>
> **Copilot Features:** Prompt Files, Self-Healing

**Your Challenge:** Systematically improve test coverage across all API routes.

## Step 1: Use a Reusable Prompt File

Manually prompting for test coverage improvements can work.  However, it also means that the process may be inconsistent between developers and you never learn from mistakes. Instead, (have Copilot) create a documented prompt file checked into your repository.  Utilize this and enhance it over time based on responses where Copilot struggled.  Here we have provided a starting point (well, Copilot has)!

1. If you haven't already, click the `+` button in the Copilot Chat panel to clear your history.  This is a best practice when switching between use cases or activities to avoid sending unrelated context.
2. Review `.github/prompts/demo-unit-test-coverage.prompt.md`
3. Notice it defines:
   - Objective and routes to focus on
   - Testing patterns to follow (examples)
   - Success Criteria
   - Links to relevant documentation
4. Notice the prompt does not say the percentage desired is greater than 80%.  If that was important it could be added here.

## Step 2: Execute the Prompt

1. Switch to `Agent` mode, select the `Claude Sonnet 4.6` model
2. Run the prompt:
   - **Option A:** Click the play button when the prompt file is open
   - **Option B:** Type `/demo-unit-test-coverage` in chat.  The prompt name automatically becomes a slash command.

## Step 3: Agent Self-Heals Failures

Agent will:
- Analyze current coverage
- Generate new test cases for product and supplier routes
- **Run tests automatically**
- Fix any failures
- Re-run until tests pass

**Important:** Press `q` when coverage report shows to let agent continue.  Otherwise it will wait indefinitely.

## Step 4: Verify Results Yourself

```bash
npm run test:coverage --workspace=api
```

Review the coverage report - it should be significantly improved. 

## What You Learned

✅ **Prompt Files** - Reusable, documented workflows  
✅ **Iteration** - Agent iterates to fix failing tests automatically  
✅ **CodeQL Integration** - Agent runs security scans after changes

**Time Investment:** 20 minutes  
**Value:** Comprehensive test suite that would take days to write manually

## Next Steps

Continue to [Consistent Standards](/workshops/immersive-experience/consistent_standards) to learn how to enforce team standards with Copilot.
