---
title: "Agentic Workflows"
description: "Build intelligent workflows in GitHub Actions with Copilot"
sidebar_position: 13
---

# Use Case 12: "Agentic Workflows"

> **Scenario:** You want to add a review workflow to ensure your site renders appropriately across mobile, tablet, and desktop devices.
>
> **Time:** ~35 minutes
>
> **Copilot Features:** GitHub Actions, Agentic Workflows

**Your Challenge:** Create an agentic workflow in GitHub Actions that reviews and updates your responsive design code based on natural language prompts.

## What Are Agentic Workflows?

Agentic Workflows are AI-powered GitHub Actions workflows that can reason, make decisions, and take actions autonomously. Unlike traditional YAML-based workflows that follow rigid, predefined steps, agentic workflows are written in markdown and use natural language to describe what the agent should accomplish.

The agent interprets the instructions, gathers context, and dynamically determines the best path to achieve the goal - including error handling, retries, and adaptive decision-making. Execution is secured within a sandbox with explicit permissions and safe outputs to ensure security.

## Key Concepts

### Custom Front matter - e.g. Schedule Jittering

Agentic workflow markdown files have custom frontmatter properties that look similar to Actions properties. There are differences though: for example, `schedule: daily` runs at a **random time** each day. This "jittering" prevents multiple workflows from executing simultaneously and overwhelming resources.

```yaml
on:
  schedule: daily  # Runs at a random time each day
```

### Secure Sandbox and Permissions

Agentic workflows run in a **secure sandbox** with minimal default permissions:

- **Network isolation**: Only explicitly allowed domains can be accessed
- **Read-only by default**: Write permissions must be explicitly granted
- **Tool restrictions**: Only specified tools and commands are available
- **Safe outputs**: Only declared outputs can be produced by the agent
- **LLM guardrails**: LLM session is isolated in its own container with limited host access

Example permission block:

```yaml
permissions:
  contents: read
  issues: read
  pull-requests: read
network:
  allowed:
    - node  # Allow npm registry access
```

Refer to the [Security Architecture Documentation](https://github.github.io/gh-aw/introduction/architecture/) for complete details.

### Safe Outputs

Safe outputs are a security feature that restricts what actions the agent can take. Instead of having full write access, agents declare specific outputs they can produce:

```yaml
safe-outputs:
  create-issue:
    title-prefix: "[auto] "  # All created issues must have this prefix
    max: 1                    # Only one issue per run
  assign-to-agent:
    allowed: [copilot]        # Can only assign to Copilot
  noop:                       # Allow "no operation" output
```

The [Safe Outputs documentation](https://github.github.io/gh-aw/reference/safe-outputs/) outlines available output types and how to configure them.

## Step 1: Install GitHub CLI and the Agentic Workflows Extension

* Install the GitHub CLI: [https://cli.github.com/](https://cli.github.com/).  Skip this in Codespaces since it's pre-installed.
* Install the Agentic Workflows extension:
  ```bash
  curl -sL https://raw.githubusercontent.com/github/gh-aw/main/install-gh-aw.sh | bash
  ```
  * Note that outside of Codespaces you can likely just use `gh extension install github/gh-aw` to install.  
* Test the CLI and extension to ensure they respond:
  ```bash
  gh --version
  gh aw version
  ```

## Step 2: Setup - Token Configuration

Before creating agentic workflows, you need to configure tokens with appropriate permissions.  Currently this is 2 tokens: 

- One for allowing Copilot requests in the Actions workflow 
- One to allow Copilot to assign issues to itself (for the "assign-to-agent" output)

Note that this is expected to be simplified in the future with org-level support (so the built-in Actions token can be used rather than needing personal tokens). 

* **COPILOT_GITHUB_TOKEN (Copilot Authentication)** Setup 
  * Go to [Create a fine-grained PAT](https://github.com/settings/personal-access-tokens/new?name=COPILOT_GITHUB_TOKEN&description=GitHub+Agentic+Workflows+-+Copilot+engine+authentication&user_copilot_requests=read).  This link will pre-fill the token name, description, and Copilot Requests permission.  
  * **Resource owner** is your user account (not the organization).  This is because the Copilot seat is owned by you!
  * Set an appropriate expiration 
  * For repos the setting really doesn't matter since we're not giving any repo permissions to the token
  * Permissions - should already be set under Account permissions to 'Copilot Requests:Read'
  * Click 'Generate token' and copy the token value.  
  * Add it to your repository by going to your repository's Settings → Secrets and variables → Actions → New repository secret
    * Name: `COPILOT_GITHUB_TOKEN`
    * Value: the token value you just copied
    * Click 'Add secret' to save it

This token authenticates the Copilot agent to run within GitHub Actions.  The authentication reference is [here](https://github.github.com/gh-aw/reference/auth/).

* **AGENT_ISSUE_TOKEN (Issue Creation and Assignment)** Setup 
  * Go to [Create a fine-grained PAT](https://github.com/settings/personal-access-tokens/new?name=GH_AW_AGENT_TOKEN&description=GitHub+Agentic+Workflows+-+Agent+assignment&actions=write&contents=write&issues=write&pull_requests=write).  This link will pre-fill the token name, description, and necessary permissions for issue creation and assignment.
  * Resource owner should be the organization if these are organization-owned repositories.  Otherwise it can be your user account if they are in your personal namespace.  
  * For repo access, select the specific repository where the agentic workflow will run
  * For repository permissions, set: 
    * Actions: Write
    * Contents: Write
    * Issues: Write
    * Pull requests: Write
  * Click 'Generate token' and copy the token value.  
  * Add it to your repository by going to your repository's Settings → Secrets and variables → Actions → New repository secret
    * Name: `GH_AW_AGENT_TOKEN`
    * Value: the token value you just copied
    * Click 'Add secret' to save it

This token allows the agentic workflow to [assign to Copilot](https://github.github.com/gh-aw/reference/assign-to-copilot/) using safe outputs.  We will use it for a workflow that auto-analyzes build failures.  

## Step 3: Create a New Workflow from Scratch

Here we will use Copilot Coding Agent to create an agentic workflow from scratch.  Note that while you can create this manually it is much easier to just have Copilot do it.  This can take anywhere from 10-30 minutes so we will start here and then focus on other aspects of agentic workflows in the next steps.

1. In your repo in GitHub.com, go to the `Agents` tab
2. Choose 'Claude Opus 4.6' as your model and enter this prompt:
   ```text
   Create a workflow for GitHub Agentic Workflows using https://github.com/github/gh-aw/blob/main/create.md. The purpose of the workflow is to import multi-device resolution tester agentic workflow from github/gh-aw and adapt it to test the website in this repo.  Ensure that the build steps are followed in docs/build.md.  Please create a pull request with these changes and ensure it can be triggered from workflow_dispatch as well as scheduled weekly.  
   ```
3. Click the send button to send the request to Copilot Coding Agent
4. Let Copilot Coding Agent Cook - it will:
   - Fetch the creation guide
   - Create the markdown file describing the intent of the workflow
   - Create the workflow file in `.github/workflows/`
5. While waiting, proceed to the next step

## Step 4: Auto-Analyzing Build Failures

With the addition of Copilot into a GitHub Actions workflow, you can create workflows that automatically analyze build failures and even create issues with findings and recommended fixes.  

1. The workflow `.github/workflows/auto-analyze-failures.md` is already configured.  Open it and review the contents.  Notice the frontmatter shows the trigger (on workflow run completed), permissions, the toolset enabled, safe outputs (create an issue and assign to copilot), as well as network access limitations.  The body of the markdown describes the workflow in natural language, and references `${{ github.xxx }}` context variables to pull in dynamic information about the workflow run and failure.
    1. Note the `auto-analyze-failures.lock.yml` file is auto-generated.  Review it and you will see a typical GitHub Actions workflow. 
2. Enable the `auto-analyze-failures.lock.yml` workflow
    1. Go to the **Actions** tab in your repository 
    2. Select **"Auto Analyze Build Failures"** from the left sidebar.  You might need to click **Show More** to find it. 
    3. Click the **Enable workflow** button
3. Create an intentional failure in the code to trigger the workflow
    1. In your Codespace, hit *Cmd-shift-P* or *Ctrl-shift-P* and select `Tasks: Run Task` and then select `Copilot: Self-healing DevOps`.
    2. Say `Yes` to create a new branch.  
    3. This will create a breaking code change.  The branch should be called `update-branch-route-behavior`
    4. Commit and push this change and create a pull request to trigger the CI workflow, which should fail.
       ```bash
       git add . 
       git commit -m "Update branch route behavior"
       git push --set-upstream origin update-branch-route-behavior
       ## Now create a pull request in GitHub.com from this branch to main to trigger the CI workflow
       ```
4. Wait for the CI build to fail (this should take a few moments)
5. The `auto-analyze-failures` workflow automatically triggers on the failure
6. Inspect the workflow run:
   - The agent reads the failure logs
   - Classifies the failure type (code, test, config, dependency, etc.)
   - Determines if it's transient or requires action
5. If not transient, an issue is automatically created with:
   - Failure analysis summary
   - Remediation plan
   - Links to the failed run
6. For certain failure categories, the issue is automatically assigned to Copilot Coding Agent
7. Open Issues tab to show the newly created issue.  Be aware that the issue is assigned to Copilot and it will work on a fix.  

## Step 5: (Optional) Daily Repo Activity Summary

You can also create agentic workflows that run on a schedule.  For example, you could create a workflow that runs daily and summarizes all PR activity in the repo, identifies stale issues, or surfaces security vulnerabilities.  

1. Navigate to **Actions** tab in GitHub
2. Find the workflow: **"Daily Repo Activity Summary"**
3. Click **"Run workflow"** to trigger manually
   - Note: In production, this runs daily at a random time (jittered)
4. Wait for completion (~2-5 minutes)
5. Check the **Issues** tab for the new summary issue
6. Review the generated content:
   - Issues opened/closed in last 24 hours
   - Pull requests activity
   - Notable high-activity items
   - Direct links to all referenced items
7. Review the `.github/workflows/daily-repo-activity-summary.md`.  Note the `safe-outputs` section restricts the agent to only creating a maximum of 1 issue per run and the `title-prefix` ensures all issues created by this workflow are easily identifiable.  Also note the `network` section only allows access to the GitHub API, preventing any external calls. 

## Step 6: Returning to our original workflow

At this point hopefully the workflow that we created earlier has finished generating.  Check the **Pull requests** tab for a pull request with a title like 'Add Multi-Device Site Tester Agentic Workflow'.  If it's not there, go to the `Agents` tab in your repository and look at the session for the workflow creation.  

1. Review the pull request.  Check the frontmatter (triggers, permissions, tools, safe-outputs).  Review the natural language instructions and notice how it references `${{ github.xxx }}` context variables.  
2. Merge the pull request.   
3. After merging, go to the **Actions** tab and find the new workflow that was created.  It should be called something like "Multi-Device Site Tester".  Click **Run Workflow** to trigger it manually for testing. 
4. Watch the workflow run in real-time to see how the agent executes the instructions, gathers information, and takes actions based on the defined workflow.  This workflow should be testing the responsiveness of your site across different device types and providing a summary of findings in the workflow logs.
5. Once complete, review the issue created by the workflow with the summary of findings.  

## Step 7: Look At Examples

This was a brief overview of agentic workflows. There are a couple key places to find inspiration and examples for agentic workflows:

* [Peli's Agent Factory](https://github.github.com/gh-aw/blog/2026-01-12-welcome-to-pelis-agent-factory/)
* [The Agentics Repo](https://github.com/githubnext/agentics)

## What You Learned

✅ **Agentic Workflows** - Agentic workflows can autonomously gather data, synthesize insights, and create structured reports on a schedule. They can be used for monitoring, reporting, and automating routine tasks with AI-driven insights.

**Time Investment:** 45 minutes  
**Value:** Agentic Workflows provide a way to schedule and trigger automation based on natural language instructions.  This allows you to create powerful automations that can analyze data, generate reports, and even take actions like creating issues or commenting on PRs - all without writing traditional code.  The secure sandbox and safe outputs ensure that these workflows can run safely with limited permissions.

## Next Steps

Proceed to [Wrap Up](/workshops/immersive-experience/wrap_up) for reflection, key takeaways, and next steps.
