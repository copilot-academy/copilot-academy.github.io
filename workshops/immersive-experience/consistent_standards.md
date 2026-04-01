---
title: "Consistent Standards"
description: "Enforce team standards using Custom Instructions, Handoffs, and Copilot Spaces"
sidebar_position: 4
---

# Use Case 3: "We have standards and Copilot needs to understand and follow them"

> **Scenario:** You use an internal observability framework (TAO). New developers keep forgetting to add proper logging/metrics. Beyond that, they continue to miss compliance requirements which delay releases.
>
> **Time:** ~30 minutes
>
> **Copilot Features:** Custom Instructions, Handoffs, Agent Skills

**Your Challenge:** Encode team standards so Copilot enforces them automatically.

One of the most powerful features of Copilot is **Custom Instructions**.  These allow you to define rules that Copilot applies automatically based on file path, type, or other criteria.  This allows you to tune Copilot to your specific needs.  As an example, it's one thing to be an expert in Java.  Another to be an expert in *your team's Java standards*.  Custom instructions bridge that gap.

## Step 1: Review Current Standards

1. Open `.github/copilot-instructions.md`
2. See existing standards for the project.  Note you can reference other files, links, etc.
   - Formatting is just markdown.  Be concise as this takes up context space.  
   - You can reference other files or links for more detail.  
   - For your projects, the more documentation you have in repo the better, as Copilot agent mode can reference it directly.

**Important:** Don't have a `copilot-instructions.md` file yet?  Click the gear icon at the top of the Copilot Chat panel, then **"Generate Chat Instructions"** to generate a starter file from your workspace.  Alternatively, check out [awesome-copilot instructions](https://github.com/github/awesome-copilot/tree/main/instructions) for inspiration. 

## Step 2: Add Custom Instructions

Add this section to `copilot-instructions.md`:

```markdown
## REST API Guidelines

For all REST API endpoints:

* Use descriptive naming following RESTful conventions
* Add Swagger/OpenAPI documentation
* Implement TAO observability (logging, metrics, tracing)
  - Assume TAO package is already installed
  - Follow patterns in existing routes
```

TAO is a fictitious observability framework for this workshop.  You can read about it in `docs/tao.md`.  It is used to show that you can encode your own internal standards that Copilot can reference.

## Step 3: Test the Instructions

1. Clear chat history, switch to `Agent` mode.  Choose any model (Claude Sonnet 4.6 recommended)
2. Prompt:
   ```text
   Add observability to the Supplier route using our internal standards
   ```
3. Notice Copilot:
   - Adds TAO logging
   - Includes metrics
   - Adds tracing
   - **Doesn't try to install TAO** (respects your instruction)

4. Click 'Undo' to revert all changes.  We don't want to keep these changes as TAO is fictitious and it will break our app! 

## Step 4: Create a Handoff

Sometimes you need to pass context to a teammate, a new chat session, or an agent.  Custom prompts can help with this.  Lets create a plan and then use a **handoff** to generate a summary document.

1. Clear chat, switch to `Plan` mode.  Again, consider switching to `Gemini 3.1 Pro` or `Claude Opus 4.6` for planning use cases.
2. Prompt:
   ```text
   Create a plan for a user profile page with edit capability and picture upload
   ```
3. Switch to `Agent` mode and then run the handoff command:
   ```text
   /handoff
   ```
   **NOT** the `/handoff-to-copilot-coding-agent` unless you want to have an agent to implement it right away.  We'll cover that later...
4. Review generated `handoff.md` - contains:
   - Requirements summary
   - Implementation plan
   - Key decisions/assumptions
   - Next steps

The steps are just defined in `.github/prompts/handoff.prompt.md`.  You can of course customize this.  For example, you might want it to automatically create a file in your workspace or create a GitHub issue.  You could always ask a follow up question to do that too. 

## Step 5: Add external documentation as context with Copilot Spaces

Copilot instructions is great for driving behavior in your current repo/workspace. But what about shared context across multiple repos?  For example, your team may have a shared design system, style guide, or architecture principles. You can use an agent skill that is automatically invoked to provide context. Agent skills are a capability that combine a markdown prompt with the ability to reference other resources or run packaged scripts. In this lab we have an agent skill that contains the documentation directly. However, you could also build this to pull data from remote sources.

1. Check out the `feature-add-tos-download` branch.
   `git checkout feature-add-tos-download` (you may need to `git stash` first)
2. Review the agent skill and example octocat compliance documentation available at [copilot-academy/od-octocat-supply-compliance-docs](https://github.com/copilot-academy/od-octocat-supply-compliance-docs).  This is a fictitious example meant to show how you can provide additional context to Copilot for compliance-related use cases.
3. Install this skill in your local copy of your repository. You could git clone the repo and move the relevant files. However, we will use [skills.sh](https://skills.sh/) for this.  Run the following command from the root of your repository:

    ```bash
    npx skills add https://github.com/copilot-academy/od-octocat-supply-compliance-docs -a github-copilot -y
    ```

     This will pull down the relevant files in `.agents/skills/compliance`.
4. Clear your chat history in Copilot Chat and switch to `Agent` mode, using the `Claude Sonnet 4.6` model. 
5. Enter the following prompt:

    ```txt
    Please analyze my current changes in the PR: Did we include all the necessary languages for the Terms of Service download?
    ```

    This will consult the skill and review its contents before analyzing your code changes and providing feedback.  You should see it reference the relevant compliance documentation in its response.

6. Additional prompts at your disposal:

    ```text
    Check if we have all the necessary legal disclaimers included in our Privacy Policy update.
    ```

    ```text
    We need to implement a Cookie Banner. Implement it according to the compliance requirements we have in our Copilot Space `OD OctoCAT Supply Compliance Docs`.
    ```

The compliance skill provided additional compliance context for Copilot to reference when analyzing your code changes.  

## What You Learned

✅ **Custom Instructions** - Team standards encoded once, applied everywhere  
✅ **Path-Specific Instructions** - Different rules for different file types  
✅ **Handoff Files** - Transfer context between sessions or developers  
✅ **Agent Skills** - Providing curated, shared context for use with GitHub Copilot

**Time Investment:** 30 minutes  
**Value:** Consistent code quality, faster onboarding, less review friction

## Next Steps

Continue to [Delegate Tasks](/workshops/immersive-experience/delegate_tasks) to learn how to delegate work to coding agents.
