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
> **Copilot Features:** Custom Instructions, Handoffs, Copilot Spaces

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
   <div className="prompt-block">
   ```text
   Add observability to the Supplier route using our internal standards
   ```
   </div>
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
   <div className="prompt-block">
   ```text
   Create a plan for a user profile page with edit capability and picture upload
   ```
   </div>
3. Run the handoff command:
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

Copilot instructions is great for driving behavior in your current repo/workspace.  But what about shared context across multiple repos?  For example, your team may have a shared design system, style guide, or architecture principles.  You can use **Copilot Spaces** to provide this shared context.

Here we will use GitHub's remote Model Context Protocol (MCP) server to retrieve documentation from a shared Copilot Space and use that to check compliance.

1. Start the GitHub Remote Copilot Space 
   - Open the Command Palette (Cmd/Ctrl + Shift + P)
     - Alternatively you can navigate to `.vscode/mcp.json` and click the start button next to the `github-remote` server definition.
   - Select "MCP: List Servers"
   - Select the `github-remote` server
   - Click "Start Server"
   - This will say "The MCP Server Definition 'github-remote' wants to authenticate to GitHub." Click "Allow" to continue
   - You will be redirected to an OAUTH flow.  Click 'Continue' on the account you are using.  
   - If the organization for your repo requires SSO, you may need to authenticate that as well.  If not you can just click 'Continue' again.
2. Check out the `feature-add-tos-download` branch.
   `git checkout feature-add-tos-download` (you may need to `git stash` first)
3. Clear your chat history in Copilot Chat and switch to `Agent` mode, using the `Claude Sonnet 4.6` model.
4. Click on the 'Tools' icon next to the model selector.  You should see `github-remote` checked at the bottom.  You can uncheck things like `Azure MCP Server`, `Bicep`, and `playwright` if they are selected.  Click `OK` to save. 
5. Enter the following prompt:

    <div className="prompt-block">

    ```txt
    Get the contents of the Copilot Space `OD OctoCAT Supply Compliance Docs`. Once you have those, please analyze my current changes in the PR: Did we include all the necessary languages for the Terms of Service download?
    ```

    </div>

5. Additional prompts at your disposal:

    <div className="prompt-block">

    ```txt
    Check if we have all the necessary legal disclaimers included in our Privacy Policy update.
    ```

    </div>

    <div className="prompt-block">

    ```txt
    We need to implement a Cookie Banner. Implement it according to the compliance requirements we have in our Copilot Space `OD OctoCAT Supply Compliance Docs`.
    ```

    </div>

Spaces provided additional compliance context for Copilot to reference when analyzing your code changes.  However, you could also access them directly as a chat bot at https://github.com/copilot/spaces if you just want to ask questions about the content.  

## What You Learned

✅ **Custom Instructions** - Team standards encoded once, applied everywhere  
✅ **Path-Specific Instructions** - Different rules for different file types  
✅ **Handoff Files** - Transfer context between sessions or developers  
✅ **Copilot Spaces** - Providing curated, shared context for use with GitHub Copilot

**Time Investment:** 30 minutes  
**Value:** Consistent code quality, faster onboarding, less review friction

## Next Steps

Continue to [Delegate Tasks](/workshops/immersive-experience/delegate_tasks) to learn how to delegate work to coding agents.
