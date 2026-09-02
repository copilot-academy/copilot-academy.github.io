---
title: "Automations and Agentic Workflows"
description: "Choose between personal Copilot app automations and version-controlled GitHub Agentic Workflows"
sidebar_position: 13
---

# Use Case 12: "Automate recurring repository work"

> **Scenario:** Pull requests repeatedly arrive without enough unit-test coverage, and build failures require the same initial investigation each time.
>
> **Time:** ~40 minutes
>
> **Copilot Features:** GitHub Copilot app automations, Copilot cloud agent, GitHub Agentic Workflows, GitHub Actions
>
> **Availability:** GitHub Agentic Workflows are in public preview.

**Your Challenge:** Choose the right automation surface, create a personal pull request coverage reviewer, and inspect a repository-owned workflow that analyzes build failures.

## Table of Contents

- [Choose the Right Automation Surface](#choose-the-right-automation-surface)
- [Repository-Level Agentic Workflows](#repository-level-agentic-workflows)
- [Key Concepts](#key-concepts)
- [Exercise 1: Create a Pull Request Coverage Automation](#exercise-1-create-a-pull-request-coverage-automation)
- [Exercise 2: Inspect the Build-Failure Agentic Workflow](#exercise-2-inspect-the-build-failure-agentic-workflow)
- [What You Learned](#what-you-learned)
- [Resources](#resources)
- [Next Steps](#next-steps)

## Choose the Right Automation Surface

Copilot app automations and GitHub Agentic Workflows both repeat agent tasks, but they solve different ownership and operational needs.

| Area | Copilot app automation | Repository-level agentic workflow |
|------|------------------------|-----------------------------------|
| **Ownership** | Personal to its creator and stored outside Git. Other repository users cannot view or edit the automation, although they can see the sessions it starts. | Owned with the repository. The Markdown source and compiled workflow are versioned, reviewed, and maintained through pull requests. |
| **Runtime** | Runs locally in the GitHub Copilot app or as a Copilot cloud agent session. Local runs require your computer and project workspace; cloud runs continue when your computer is off. | Runs in a firewalled GitHub Actions environment using the configured coding agent. |
| **Triggers** | Manual; hourly, daily, weekly, or local CRON schedules; issue creation; pull request open; or pull request synchronization when new commits arrive. | Supports GitHub Actions triggers, including manual dispatch, schedules, issues, pull requests, and completed workflow runs. |
| **Best fit** | A recurring task that you own, want to configure quickly, or want to run against a project without adding repository files. | Team-owned, auditable automation that must be stored as code, reviewed, reused across maintainers, or guarded with explicit permissions and safe outputs. |

Use a **local automation** for an on-demand or scheduled task that needs your local checkout and tools. Use a **cloud automation** for unattended schedules and repository events. Choose a **repository-level agentic workflow** when the automation itself is part of the repository's operating model.

> [!IMPORTANT]
> Copilot cloud automations require a private or internal repository, write access, and organization policies that enable both Copilot cloud agent and automations. If your workshop copy is public, keep **Run in the cloud** disabled, use a **Manual** trigger, and run the automation locally from the app.

## Repository-Level Agentic Workflows

GitHub Agentic Workflows are AI-powered GitHub Actions workflows that can reason, make decisions, and take actions autonomously. Unlike traditional YAML-based workflows that follow rigid, predefined steps, agentic workflows are written in Markdown and use natural language to describe what the agent should accomplish.

The agent interprets the instructions, gathers context, and dynamically determines the best path to achieve the goal - including error handling, retries, and adaptive decision-making. Execution is secured within a sandbox with explicit permissions and safe outputs to ensure security.

## Key Concepts

### Custom Frontmatter and Schedule Jittering

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

## Exercise 1: Create a Pull Request Coverage Automation

Create an app automation that reviews unit-test coverage whenever a pull request opens or receives new commits. It reports gaps for human review but does not modify code.

### Step 1: Define the Runtime and Triggers

1. Open **Automations** in the GitHub Copilot app.
2. Select **New automation**.
3. Name it `PR unit-test coverage review`.
4. If your repository is private or internal, add these **Pull request** triggers:
   - **When a pull request is opened**
   - **When a pull request is synchronized**
5. If your repository is public, use a **Manual** trigger instead.
6. Add a changed-file filter if you only want to review application or test code.
7. For a private or internal repository, enable **Run in the cloud** so Copilot cloud agent can respond when your computer is off.

This exercise uses pull request events, but the same editor also supports **Manual**, scheduled (**Hourly**, **Daily**, and **Weekly**), **Issue**, and local **CRON** triggers. Start with a manual trigger while refining a prompt, then add an unattended trigger after the output is reliable.

### Step 2: Apply Least Privilege

In **Tools**, grant only the capabilities required to:

- Read the repository and triggering pull request.
- Run the repository's focused unit-test and coverage commands.
- Add a comment to the triggering pull request.

Do not grant tools for pushing changes, merging pull requests, updating issues, or creating new pull requests. Those actions are outside this reviewer's responsibility.

> [!WARNING]
> Automation prompts and the resulting Copilot cloud agent session logs are visible to people who can access the repository. Never place credentials or other sensitive values in the prompt.

### Step 3: Add the Review Prompt

Use this prompt:

```text
Review the pull request that triggered this automation for unit-test coverage.

1. Read the repository instructions and identify the supported focused test and coverage commands.
2. Inspect the changed production code and the tests changed or added with it.
3. Run only the focused tests and coverage checks needed to validate the affected behavior.
4. Identify meaningful behavior, branches, error paths, or regressions that are not covered.
5. Add one concise pull request comment with:
   - the commands run and their results,
   - the most important coverage gaps, with file references,
   - specific tests the author should add, and
   - a clear statement when no material gaps are found.

Do not change files, push commits, create another pull request, or duplicate existing review comments.
Prioritize behavioral coverage over reaching an arbitrary percentage.
```

If you are using the public-repository manual path, replace the first line with:

```text
Review this pull request for unit-test coverage: <paste the pull request URL>
```

The prompt defines a narrow objective, a bounded output, and explicit non-goals. This makes the selected tools easier to audit.

### Step 4: Select the Model, Reasoning, Agent, and Project

1. Keep the model set to **Auto**. This is the recommended default for learner exercises and avoids a stale dependency on a fixed model.
2. Keep the default reasoning level for a focused review. Increase reasoning only while authoring or revising a complex automation, then return to the default for routine runs.
3. Use the default agent unless the selected repository provides a testing custom agent with instructions and tools that match this task.
4. Click **Select project**, then choose the project and repository that contain the pull requests to review.
5. Select **Create and run** to test the automation immediately.

> [!TIP]
> The automation inherits repository custom instructions, agent skills, firewall rules, secrets, and variables. Keep general testing conventions in repository instructions instead of repeating them in every automation prompt.

### Step 5: Verify and Refine

1. Open the session started by the test run. This is a local app session for the public-repository manual path and a Copilot cloud agent session when **Run in the cloud** is enabled.
2. Confirm that it used only the tools you selected.
3. Review the test commands, evidence, and pull request comment.
4. Tighten the prompt or remove tools if the run exceeded its scope.
5. Keep the automation enabled only after its manual test produces a useful, non-duplicative review.

The automation remains private to you. Cloud sessions, logs, comments, and attribution are visible to people with repository access; local run details remain in your app, while any pull request comments remain visible in the repository.

## Exercise 2: Inspect the Build-Failure Agentic Workflow

The existing build-failure workflow is the repository-level counterpart to your personal app automation. Repository maintainers can review its source and guardrails through Git.

### Step 1: Install GitHub CLI and the Agentic Workflows Extension

- Install [GitHub CLI](https://cli.github.com/). Skip this in Codespaces, where it is preinstalled.
- Install and verify the Agentic Workflows extension:

  ```bash
  gh extension install github/gh-aw
  gh --version
  gh aw version
  ```

If the extension install is unavailable in your environment, use the installation command from the [GitHub Agentic Workflows documentation](https://github.github.io/gh-aw/).

### Step 2: Review Authentication and Guardrails

Open `.github/workflows/auto-analyze-failures.md` and its generated `.github/workflows/auto-analyze-failures.lock.yml`.

Review how the Markdown source defines:

- A completed workflow-run trigger that checks the conclusion before acting.
- Read permissions for repository, issue, pull request, and workflow context.
- The minimum toolset needed to inspect the failed run.
- Safe outputs that bound issue creation and assignment.
- Network access limited to required services.

The `.md` file is the human-maintained source. The `.lock.yml` file is the hardened GitHub Actions workflow generated by `gh aw compile`; commit both when the repository workflow changes.

> [!NOTE]
> For organization-owned repositories with Copilot enabled, prefer the built-in `GITHUB_TOKEN` and declare `copilot-requests: write` in workflow permissions. Use a dedicated `COPILOT_GITHUB_TOKEN` secret only when the organization policy does not provide Copilot access to the Actions token. Any separate token used by a safe-output job should be fine-grained, repository-scoped, and limited to the required operation.

### Step 3: Enable and Trigger the Workflow

1. Open the repository's **Actions** tab.
2. Select **Auto Analyze Build Failures** and enable it if necessary.
3. Select **Test Auto-Analysis (Intentional Failure)** and choose **Run workflow**.
4. Select a failure type such as `compilation_error` or `test_failure`, then start the run.
5. Wait for the intentional workflow to fail. Its completed failure triggers **Auto Analyze Build Failures** without changing a learner branch or pull request.

### Step 4: Review the Agentic Result

After CI fails, open the **Auto Analyze Build Failures** run and verify that the agent:

- Reads the failed run and relevant logs.
- Classifies the failure as code, test, configuration, dependency, infrastructure, or transient.
- Avoids creating an issue for a transient failure.
- Creates at most the safe-output limit for actionable failures.
- Includes a failure summary, remediation plan, and link to the failed run.
- Assigns eligible work to Copilot cloud agent only when the workflow's safe-output policy allows it.

Open the resulting issue and confirm that the proposed next step is specific and reviewable.

## What You Learned

- ✅ **Automation selection** - Personal app automations and repository workflows have different owners, runtimes, triggers, and use cases
- ✅ **Local and cloud execution** - Local automations use your environment; cloud automations run unattended with Copilot cloud agent
- ✅ **Trigger design** - Manual, scheduled, issue, pull request, and workflow-run triggers fit different operating needs
- ✅ **Least privilege** - Tools, permissions, network access, and safe outputs should match one narrow responsibility
- ✅ **Model and agent selection** - Auto and the default agent are strong defaults; higher reasoning and custom agents should serve a specific need
- ✅ **Automation as code** - Agentic workflow source and compiled Actions workflows provide team review and version history

**Time Investment:** 40 minutes

**Value:** Automate repetitive repository work while choosing the ownership model and guardrails that match the task.

## Resources

- [Using automations in the GitHub Copilot app](https://docs.github.com/en/copilot/how-tos/github-copilot-app/using-automations)
- [About Copilot automations](https://docs.github.com/en/copilot/concepts/agents/cloud-agent/about-automations)
- [About GitHub Agentic Workflows](https://docs.github.com/en/copilot/concepts/agents/about-github-agentic-workflows)
- [GitHub Agentic Workflows documentation](https://github.github.io/gh-aw/)
- [Agentic Workflows security architecture](https://github.github.io/gh-aw/introduction/architecture/)
- [Safe Outputs reference](https://github.github.io/gh-aw/reference/safe-outputs/)

## Next Steps

Proceed to [Wrap Up](/workshops/immersive-experience/wrap_up) for reflection, key takeaways, and next steps.
