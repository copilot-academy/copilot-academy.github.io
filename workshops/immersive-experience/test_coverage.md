---
title: "Test Coverage"
description: "Improve test coverage with an agentic GitHub Copilot app session"
sidebar_position: 3
---

# Use Case 2: "We need better test coverage"

> **Scenario:** Your tech lead says: *"Our API test coverage is at 45%. We need to get it above 80% before the release."*
>
> **Time:** ~20 minutes
>
> **Copilot Features:** GitHub Copilot app, test execution, self-healing

**Your Challenge:** Systematically improve test coverage across all API routes.

## Step 1: Start a Focused App Session

1. Open the companion repository in the GitHub Copilot app.
2. Start a new session from the branch that contains your latest workshop changes.
3. Choose **Interactive** mode and leave the model on **Auto**. This task is well bounded, so a higher-reasoning model is only necessary if failures span several layers or the first approach stalls.

Starting a new session keeps unrelated context from earlier activities out of the request while preserving the app workflow used throughout this workshop.

## Step 2: Ask Copilot to Improve Coverage

Enter the following prompt:

```text
Improve API unit-test coverage to at least 80%.

Focus on the product and supplier routes, including success cases, validation
errors, missing records, and database failures. Follow the existing test
patterns and avoid changing production behavior unless a small testability
improvement is necessary.

Run make test-coverage, fix any failures, and iterate until the focused tests
pass and the coverage target is met. Summarize the tests added and any
remaining gaps.
```

## Step 3: Agent Self-Heals Failures

Copilot will:
- Analyze current coverage
- Generate new test cases for product and supplier routes
- **Run tests automatically**
- Fix any failures
- Re-run until tests pass

**Important:** Press `q` when coverage report shows to let agent continue.  Otherwise it will wait indefinitely.

## Step 4: Verify Results Yourself

```bash
make test-coverage
```

Review the coverage report - it should be significantly improved. 

## What You Learned

✅ **Focused Sessions** - Give a bounded task clean context without leaving the app
✅ **Explicit Success Criteria** - State the coverage target, scope, validation command, and non-goals
✅ **Iteration** - Agent iterates to fix failing tests automatically  
✅ **Independent Verification** - Re-run the repository command before accepting the result

**Time Investment:** 20 minutes  
**Value:** Comprehensive test suite that would take days to write manually

## Next Steps

Continue to [Consistent Standards](/workshops/immersive-experience/consistent_standards) to learn how to enforce team standards with Copilot.
