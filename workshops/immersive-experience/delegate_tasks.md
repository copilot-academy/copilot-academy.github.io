---
title: "Delegate Tasks"
description: "Delegate tasks using Coding Agent, Mission Control, and Custom Agents"
sidebar_position: 5
---

# Use Case 4: "I have too many tasks"

> **Scenario:** You have 5 tickets in your sprint: bug fixes, new features, tech debt. You can't do them all synchronously.
>
> **Time:** ~30 minutes
>
> **Copilot Features:** Coding Agent, Mission Control, Custom Agents

**Your Challenge:** Delegate work to Coding Agent while you focus on high-value tasks.

## Step 1: Use Custom Agents for Specialized Work

**Scenario:** You need BDD tests for the cart feature.

1. Go to your GitHub repository
2. Click **Agents Panel** (top right icon next to Copilot...)
3. Select the main branch for working (should be preselected)
4. Choose **BDD Specialist** agent
5. Prompt:
   ```text
   Add comprehensive BDD tests for the Cart page feature
   ```
6. Click the **Start Task** button
7. Agent starts working - **you can close the tab and do other work**

> If interested, you can look at `.github/agents/bdd-specialist.agent.md` to see how this custom agent is defined.  You can create your own custom agents for your team as well!

## Step 2: Assign Issues to Coding Agent

1. In your IDE, open `.github/prompts/demo-cart-page.prompt.md`
2. The GitHub MCP server should already be started (from Use Case 3).  If not, start it now by hitting Cmd/Ctrl + Shift + P and selecting **MCP: List Servers**, selecting `github-remote`, and clicking `Start Server`.
3. In the Copilot Chat panel, clear your history, ensure you are in agent mode and select a base model like `GPT-5 mini`.  Have Copilot open an issue for you.  Prompt:
   ```text
   Create a GitHub issue with the title "Implement Recommendations Feature" using the contents in the demo-cart-page.prompt.md file as the body.
   ```
4. Click Allow to let Copilot execute the create issue command.  It should return with a new issue URL.  
5. Have Copilot assign the issue to the Coding Agent.  Prompt:
   ```text
   Assign this issue to the Copilot coding agent.
   ```
   Note an alternative approach is do this directly in GitHub by manually creating the issue and then assigning it to `Copilot`.
6. Open the issue in GitHub and you should see the 👀 indicator showing that Copilot saw the issue.  It should also have a link to a work in progress pull request shortly after.

## Step 3: Monitor from Mission Control

1. Navigate to [https://github.com/copilot/agents](https://github.com/copilot/agents)
2. See all your active agent sessions (in this case you should have the BDD Specialist session we started first and the cart feature coding session we started second)
3. Click on the BDD session that should be in progress:
   - Note you can view real-time progress and see commands executed
   - Also see the pull request contents
4. **Steer mid-session by prompting Copilot:**
   ```text
   While you're at it, add error handling for network failures
   ```

## Step 4: Use API Specialist for Backend Work

1. Go back to your repository and open the agents panel like we did for the **BDD Specialist**.  This time select **API Specialist**
2. Prompt with the following and click to **Start Task**:
   ```text
   Create CRUD endpoints for user profiles: 
   GET /api/profiles/:id
   POST /api/profiles
   PUT /api/profiles/:id
   DELETE /api/profiles/:id
   ```
3. Copilot Coding Agent will spin up another environment and implement the endpoint with proper error handling, validation, and Swagger docs

## What You Learned

✅ **Custom Agents** - Specialized tools for specific domains  
✅ **Mission Control** - Manage multiple agents like a project manager  
✅ **Async Workflows** - Delegate and move on, check back later  
✅ **Mid-Session Steering** - Guide agents as they work

**Time Investment:** 30 minutes setup, agents work asynchronously  
**Value:** 3-5 tickets completed while you focus on architecture/design

## Next Steps

Continue to [Code Review](/workshops/immersive-experience/code_review) to learn how to speed up code reviews with Copilot.
