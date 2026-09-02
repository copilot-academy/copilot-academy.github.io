---
title: "Consistent Standards"
description: "Enforce team standards using Custom Instructions, Handoffs, and Agent Skills"
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

## Where to Find Your Customizations

Before you start adding standards, it helps to know where they all live. The **Customize** surface in the GitHub Copilot app is the single place to discover, install, and manage everything that shapes Copilot's behavior:

| Customization | What it does | Typical location |
| --- | --- | --- |
| **Custom instructions** | Always-on standards applied to every request | `.github/copilot-instructions.md`, plus global instructions for all repos |
| **Custom agents** | Task-specific personas with their own tools and context | `.github/agents/*.agent.md` |
| **Agent skills** | Auto-loaded instructions, scripts, and reference material | `.github/skills/*/SKILL.md` |
| **Plugins** | Bundles that ship skills, agents, and commands together | Installed from the Customize surface |
| **MCP servers** | Connections to external tools, data, and APIs | Installed from the Customize surface |

Open **Customize** to browse what's featured, filter by type, and review what you already have installed. Availability follows the customization's scope, and some configuration changes require a session restart.

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

1. Start a focused app session in **Interactive** mode and leave the model on **Auto**. In VS Code, use **Agent** mode.
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

1. Start a new session in **Plan** mode. **Auto** is a good default; if the plan comes back shallow, escalate to a higher-reasoning model.
2. Prompt:
   ```text
   Create a plan for a user profile page with edit capability and picture upload
   ```
3. Approve the plan or switch to **Interactive** mode, then run the handoff command:
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

## Step 5: Add external documentation as context with Agent Skills

Copilot instructions is great for driving behavior in your current repo/workspace. But what about shared context across multiple repos?  For example, your team may have a shared design system, style guide, or architecture principles. You can use an agent skill that is automatically invoked to provide context. Agent skills are a capability that combine a markdown prompt with the ability to reference other resources or run packaged scripts. In this lab we have an agent skill that contains the documentation directly. However, you could also build this to pull data from remote sources.

1. Start a new app session from the companion repository's Terms of Service download exercise branch. In the current academy repository this is `feature-add-tos-download`; if your refreshed demo uses a different branch name, select the branch containing the Terms of Service download changes.
2. Review the agent skill and example octocat compliance documentation available at [copilot-academy/od-octocat-supply-compliance-docs](https://github.com/copilot-academy/od-octocat-supply-compliance-docs).  This is a fictitious example meant to show how you can provide additional context to Copilot for compliance-related use cases.
3. Install this skill in your local copy of your repository. You could git clone the repo and move the relevant files. However, we will use [skills.sh](https://skills.sh/) for this.  Run the following command from the root of your repository:

    ```bash
    npx skills add https://github.com/copilot-academy/od-octocat-supply-compliance-docs -a github-copilot -y
    ```

     This will pull down the relevant files in `.agents/skills/compliance`.
4. Use **Interactive** mode in the app, with the model set to **Auto**. In VS Code, use **Agent** mode.
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
    We need to implement a Cookie Banner. Implement it according to the compliance requirements in our compliance documentation.
    ```

The compliance skill provided additional compliance context for Copilot to reference when analyzing your code changes.  

**Optional alternative — Copilot Spaces.** If your team prefers a browser-based, hosted bundle of context, the same compliance documentation can be published as a **Copilot Space** and referenced by name in your prompts. Spaces are useful for sharing curated context with people who aren't working in the repository. For this workshop, the agent skill is the recommended path: it travels with the repo, works across VS Code, the CLI, and the Copilot cloud agent, and loads automatically when relevant.

## What You Learned

✅ **Custom Instructions** - Team standards encoded once, applied everywhere  
✅ **Path-Specific Instructions** - Different rules for different file types  
✅ **Handoff Files** - Transfer context between sessions or developers  
✅ **Agent Skills** - Providing curated, shared context for use with GitHub Copilot
✅ **Customize surface** - One place to discover and manage instructions, agents, skills, plugins, and MCP servers

**Time Investment:** 30 minutes  
**Value:** Consistent code quality, faster onboarding, less review friction

## Next Steps

Continue to [Delegate Tasks](/workshops/immersive-experience/delegate_tasks) to learn how to direct parallel sessions and delegate work to Copilot cloud agent.
