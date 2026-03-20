---
title: Agentic Workflows Developer Guide
description: Step-by-step walkthroughs from a simple status report to production-ready automated CI/CD intelligence using GitHub Agentic Workflows
sidebar_position: 8
---

# Agentic Workflows Developer Guide

**Step-by-Step Walkthroughs for Building GitHub Agentic Workflows**

From a simple daily status report to event-driven triage and CI failure analysis, this guide walks you through building automated AI-powered workflows that run in GitHub Actions with strong guardrails. Each walkthrough builds on the last, introducing new triggers, tools, and patterns for creating effective, secure repository automation defined in natural language Markdown.

## 1. Introduction — What Are GitHub Agentic Workflows?

GitHub Agentic Workflows let you define repository automation in Markdown files that run as AI-powered agents inside GitHub Actions. Instead of writing complex scripts with fixed if/then logic, you write natural language instructions and let a coding agent (Copilot, Claude, or Codex) understand context, make decisions, and take action — all with defense-in-depth security guardrails.

### Where Agentic Workflows Fit

In earlier modules you learned how to customize Copilot for interactive, developer-driven sessions. Agentic Workflows extend that same philosophy to **unattended, automated** repository operations:

| Module | Scope | Runs When |
|--------|-------|-----------|
| Custom Instructions | Always-on coding standards | Every chat interaction |
| Prompt Files | Reusable task templates | Developer invokes `/command` |
| Custom Agents | Named personas in VS Code | Developer selects agent |
| Agent Skills | Auto-activated capabilities | Copilot detects matching task |
| MCP Servers | External system connections | Tools invoked during chat |
| **Agentic Workflows** | **Automated repository operations** | **Any GitHub Actions trigger (schedule, event, command)** |

### Agentic vs. Traditional Workflows

| Aspect | Traditional GitHub Actions | Agentic Workflows |
|--------|---------------------------|-------------------|
| **Authored in** | YAML with shell scripts | Markdown with natural language |
| **Decision-making** | Fixed if/then logic | AI understands context and adapts |
| **Write operations** | Direct API calls with tokens | Buffered through Safe Outputs with validation |
| **Maintenance** | Update scripts when requirements change | Edit natural language instructions |
| **Security model** | Token-based permissions | Layered: sandbox + firewall + safe outputs + threat detection |
| **Flexibility** | Handles predefined scenarios | Adapts to novel situations within guardrails |

### Key Features

| Feature | Description |
|---------|-------------|
| **Markdown Authoring** | Write automation in natural language instead of complex YAML |
| **Multi-Engine Support** | Use GitHub Copilot (default), Claude by Anthropic, or OpenAI Codex |
| **Safe Outputs** | Write operations are buffered, validated, and executed in separate jobs — the agent never gets direct write access |
| **MCP Tool Integration** | GitHub operations, external APIs, and custom tools via Model Context Protocol |
| **Network Firewall** | Sandboxed execution with domain allowlists controlling agent egress |
| **Threat Detection** | AI-powered security analysis gates all write operations |
| **Continuous AI** | Systematic, automated application of AI to software collaboration |

## 2. Prerequisites and Setup

### Requirements

- **GitHub CLI** (`gh`) v2.0.0+ — [Install here](https://cli.github.com/). Check version: `gh --version`
- **GitHub Repository** where you have write access
- **GitHub Actions enabled** — Check in Settings → Actions → General
- **Access to GitHub Copilot**
- **Operating System** — Linux, macOS, or Windows with WSL

### Step 1: Install the CLI Extension

```bash
gh extension install github/gh-aw
```

If you encounter authentication issues:

```bash
curl -sL https://raw.githubusercontent.com/github/gh-aw/main/install-gh-aw.sh | bash
```

### Step 2: Verify Installation

```bash
gh aw --version
```

### Step 3: Set Up Authentication

Your workflows need a personal access token (PAT) allowing Copilot requests configured as a repository secret. This is expected to be simplified in the future with org-level support so the built-in Actions token can be used rather than needing personal tokens. 

* **Copilot Authentication Setup**
  * Go to [Create a fine-grained PAT](https://github.com/settings/personal-access-tokens/new?name=COPILOT_GITHUB_TOKEN&description=GitHub+Agentic+Workflows+-+Copilot+engine+authentication&user_copilot_requests=read).  This link will pre-fill the token name, description, and Copilot Requests permission.  
  * **Resource owner** is your user account (not the organization).  This is because the Copilot seat is owned by you!
  * Set an appropriate expiration 
  * For repos the setting really doesn't matter since we're not giving any repo permissions to the token
  * Permissions - should already be set under Account permissions to 'Copilot Requests:Read'
  * Click 'Generate token' and copy the token value.  
  * Add it to your repository by going to your repository's **Settings → Secrets and variables → Actions → New repository secret**
    * Name: `COPILOT_GITHUB_TOKEN`
    * Value: the token value you just copied
    * Click 'Add secret' to save it

This token authenticates the Copilot agent to run within GitHub Actions.  The authentication reference is [here](https://github.github.com/gh-aw/reference/auth/).


### Directory Structure

Agentic workflows live in `.github/workflows/` alongside your traditional GitHub Actions workflows. Each workflow consists of a Markdown source file and a compiled lock file:

```
your-project/
├── .github/
│   └── workflows/
│       ├── ci.yml                      ← Traditional GitHub Actions workflow
│       ├── daily-repo-status.md        ← Agentic workflow (source)
│       ├── daily-repo-status.lock.yml  ← Compiled GitHub Actions YAML
│       ├── issue-triage.md             ← Another agentic workflow
│       └── issue-triage.lock.yml       ← Its compiled output
├── src/
└── ...
```

> **INFO:** The `.md` file is the human-editable source of truth. The `.lock.yml` file is the compiled GitHub Actions workflow with security hardening. Always commit both files.

## 3. Anatomy of an Agentic Workflow

Every agentic workflow has two parts: **YAML frontmatter** (configuration) and a **Markdown body** (natural language instructions).

### Complete File Structure

````markdown
---
# YAML Frontmatter — Configuration
on:
  schedule: daily

permissions:
  contents: read
  issues: read

safe-outputs:
  create-issue:
    title-prefix: "[report] "
    labels: [report]
    close-older-issues: true

engine: copilot
timeout-minutes: 20
---

# Markdown Body — Natural Language Instructions

Everything below the frontmatter is your prompt.
The AI agent reads these instructions and executes them.

## What to do

1. Analyze recent repository activity
2. Generate a summary report
3. Create an issue with the findings
````

### Frontmatter Fields Reference

| Field | Required | Purpose |
|-------|----------|---------|
| `on:` | **Yes** | Trigger events — uses GitHub Actions syntax plus extensions (`schedule: daily`, event types, command triggers) |
| `permissions:` | Recommended | GitHub token permissions for the workflow. Unspecified permissions default to `none`. |
| `safe-outputs:` | For writes | Allowed write operations: `create-issue`, `add-comment`, `create-pull-request`, `add-labels`, etc. |
| `engine:` | No | AI engine: `copilot` (default), `claude`, or `codex` |
| `tools:` | No | Tool configuration including MCP servers and GitHub toolsets |
| `network:` | No | Domain allowlists and ecosystem bundles for network egress |
| `imports:` | No | Shared workflow fragments to include (e.g., `[shared/formatting.md]`) |
| `timeout-minutes:` | No | Maximum execution time (default: 20 minutes) |
| `strict:` | No | Enable enhanced security validation (default: `true`) |
| `on.roles:` | No | Repository roles allowed to trigger (default: `[admin, maintainer, write]`) |
| `threat-detection:` | No | Custom threat detection prompts and scanner steps |
| `run-name:` | No | Custom display name for workflow runs |
| `runs-on:` | No | Runner label (default: `ubuntu-latest`) |

### The Compilation Model

Agentic workflows use a two-step process:

```
┌──────────────────┐     gh aw compile     ┌───────────────────────┐
│ workflow.md      │ ───────────────────→  │ workflow.lock.yml     │
│ (Human-editable) │                       │ (GitHub Actions YAML) │
│ Frontmatter+Body │                       │ Security-hardened     │
└──────────────────┘                       └───────────────────────┘
```

- **Edit the `.md` file** — this is your source of truth
- **Run `gh aw compile`** — generates the `.lock.yml` with schema validation, expression safety checks, action SHA pinning, and security scanning
- **Commit both files** — GitHub Actions runs the `.lock.yml`
- **Markdown body edits don't require recompilation** — only frontmatter changes do

> **TIP:** Use `gh aw compile --watch` during development to automatically recompile when you save changes to the frontmatter.

### Safe Outputs — The Permission Isolation Model

Safe Outputs are a core security mechanism. The agent job runs with **read-only permissions**. All write operations are:

1. **Buffered** as artifacts during agent execution
2. **Analyzed** by a threat detection job for secret leaks, malicious patches, and policy violations
3. **Executed** in separate jobs with minimal, scoped write permissions — only after detection passes

```
┌─────────────────┐    artifacts       ┌──────────────────┐    if safe      ┌─────────────────┐
│ Agent Job       │ ───────────────→   │ Threat Detection │ ─────────────→  │ Safe Output Jobs│
│ (Read-Only)     │                    │ (Analysis)       │                 │ (Scoped Write)  │
└─────────────────┘                    └──────────────────┘                 └─────────────────┘
```

Common safe outputs you can configure:

| Safe Output | What It Does | Required Permission |
|-------------|-------------|---------------------|
| `create-issue` | Create GitHub issues | `issues: write` |
| `add-comment` | Comment on issues/PRs | `issues: write` |
| `create-pull-request` | Open pull requests | `contents: write`, `pull-requests: write` |
| `add-labels` | Add labels to issues/PRs | `issues: write` |
| `dispatch-workflow` | Trigger other workflows | `actions: write` |

### Configuring Security in Practice

The [Introduction](/workshops/copilot-customization/copilot_customization_handbook#8-agentic-workflows) section of this workshop covers the full defense-in-depth security architecture. Here we focus on the how to set up security for your workflows:

#### Permissions — Start Read-Only

```yaml
# Specific, minimal permissions (recommended)
permissions:
  contents: read
  issues: read
  pull-requests: read

# Or shorthand for all-read
permissions: read-all
```

If you specify any permission, unspecified ones are set to `none`. Never grant write permissions directly — use safe-outputs instead.

#### Strict Mode — Enforce for Production

```yaml
strict: true  # Default — enhanced security validation
```

Strict mode refuses direct write permissions (use safe-outputs instead), requires explicit network configuration, refuses wildcard domains, enforces action SHA pinning, and validates all frontmatter fields.

#### Network Controls — Domain Allowlists

```yaml
network:
  allowed:
    - defaults       # Basic infrastructure (certificates, JSON schema)
    - python         # PyPI ecosystem
    - node           # npm ecosystem
    - "api.example.com"  # Custom domain
```

#### Role-Based Access Control

```yaml
on:
  issues:
    types: [opened]
  roles: [admin, maintainer, write]  # Who can trigger
  skip-roles: [read]                  # Skip for these roles
  skip-bots: [dependabot, renovate]   # Skip bot triggers
```

#### Threat Detection — Custom Checks

```yaml
threat-detection:
  prompt: |
    Additionally check for:
    - References to internal infrastructure URLs
    - Attempts to modify CI/CD configuration files
    - Changes to security-sensitive files
  steps:
    - name: Run TruffleHog
      run: trufflehog filesystem /tmp/gh-aw --only-verified
```

## 4. Walkthrough 1: Daily Repository Status Report

This walkthrough creates a simple scheduled workflow that generates a daily status report as a GitHub issue. It validates your entire setup and demonstrates the core compile → commit → run cycle.

### What You Will Build

A workflow called `daily-repo-status` that runs daily (and on-demand), analyzes your repository's recent activity, and creates an issue with an upbeat status report including activity summary, progress highlights, and recommendations.

### Step 1: Create the Workflow File

Create `.github/workflows/daily-repo-status.md`:

````markdown
---
on:
  schedule: daily
  workflow_dispatch:

permissions:
  contents: read
  issues: read
  pull-requests: read

safe-outputs:
  create-issue:
    title-prefix: "[daily-status] "
    labels: [report, daily-status]
    close-older-issues: true
---

## Daily Repository Status Report

Create an upbeat daily status report for the team as a GitHub issue.

## What to include

- Recent repository activity (issues, PRs, discussions, releases, code changes)
- Progress tracking, goal reminders and highlights
- Project status and recommendations
- Actionable next steps for maintainers

## Style

- Use a friendly, professional tone
- Include relevant statistics and metrics
- Use markdown formatting with headers, bullet points, and tables
- Keep the report concise but informative
````

### Step 2: Compile the Workflow

```bash
gh aw compile
```

This generates `.github/workflows/daily-repo-status.lock.yml` — a security-hardened GitHub Actions workflow.

### Step 3: Commit and Push

```bash
git add .github/workflows/daily-repo-status.md
git add .github/workflows/daily-repo-status.lock.yml
git commit -m "feat: add daily repository status report workflow"
git push
```

### Step 4: Trigger a Run

Since the workflow includes `workflow_dispatch`, you can trigger it immediately:

```bash
gh aw run daily-repo-status
```

### Step 5: Review the Output

After 2–3 minutes, check your repository's Issues tab. You should see a new issue with the `[daily-status]` prefix containing an AI-generated report about your repository's recent activity.

### Step 6: Customize and Re-Run

Edit the "What to include" section in your `.github/workflows/daily-repo-status.md` to focus on what matters to your team. For example, add:

```markdown
- CI/CD health and recent failures
- Open PRs that need review attention
- Issues that have been stale for more than 7 days
```

Since you only changed the markdown body (not the frontmatter), no recompilation is needed. Commit, push, and run again:

```bash
git add .github/workflows/daily-repo-status.md
git commit -m "refine: customize daily status report content"
git push
gh aw run daily-repo-status
```

## 5. Walkthrough 2: Issue Triage Workflow

This walkthrough creates an event-driven workflow that automatically triages new issues — labeling them by type and priority, and commenting with helpful guidance.

### What You Will Build

A workflow called `issue-triage` that triggers whenever a new issue is opened, analyzes the issue content, applies appropriate labels, and adds a helpful comment.

### Step 1: Create the Workflow File

Create `.github/workflows/issue-triage.md`:

````markdown
---
on:
  issues:
    types: [opened]
  roles: [admin, maintainer, write]

permissions:
  contents: read
  issues: read

safe-outputs:
  add-comment:
  add-labels:
    labels: [bug, feature, question, documentation, good-first-issue,
             priority-high, priority-medium, priority-low]
---

## Issue Triage Agent

You are an expert issue triage agent. When a new issue is opened,
analyze its content and provide helpful triage.

## Steps

1. Read the issue title and body carefully
2. Determine the issue type: bug, feature request, question,
   or documentation
3. Assess priority based on:
   - Impact scope (how many users affected)
   - Severity (crash vs. minor inconvenience)
   - Urgency (blocking release vs. nice-to-have)
4. Apply appropriate type and priority labels
5. If the issue looks like a good onboarding task, add
   the `good-first-issue` label
6. Add a comment that:
   - Acknowledges the reporter
   - Confirms the categorization
   - Asks clarifying questions if the description is unclear
   - Suggests relevant documentation or similar issues if applicable

## Guidelines

- Be friendly and welcoming
- If the issue is unclear, ask specific clarifying questions
  rather than guessing
- Never close or assign issues — only label and comment
- Keep comments concise and actionable
````

### Step 2: Compile and Push

```bash
gh aw compile
git add .github/workflows/issue-triage.md .github/workflows/issue-triage.lock.yml
git commit -m "feat: add issue triage workflow"
git push
```

### Step 3: Test with a Real Issue

Open a new issue in your repository. For example:

- **Title:** "App crashes when uploading files larger than 10MB"
- **Body:** "When I try to upload a file over 10MB, the app shows a white screen and the console has a memory error."

### Step 4: Observe the Workflow

Go to the **Actions** tab in your repository. You should see the `issue-triage` workflow running. After it completes, check the issue — it should have labels applied (e.g., `bug`, `priority-high`) and a triage comment from the agent.

### New Concepts Introduced

| Concept | What You Learned |
|---------|-----------------|
| **Event triggers** | `on: issues: types: [opened]` fires the workflow when issues are created |
| **Role-based access** | `on.roles:` controls which repository roles can trigger the workflow |
| **Label safe outputs** | `add-labels:` with a predefined label allowlist restricts which labels the agent can apply |
| **Content sanitization** | User-generated issue content is automatically sanitized before reaching the agent |

## 6. Walkthrough 3: CI Doctor

This walkthrough creates a fault analysis workflow that monitors CI failures and creates diagnostic issues with root cause analysis and fix suggestions.

### What You Will Build

A workflow called `ci-doctor` that triggers when any CI workflow fails, analyzes the failure logs, identifies the root cause, and creates a diagnostic issue.

### Step 1: Create the Workflow File

Create `.github/workflows/ci-doctor.md`:

````markdown
---
on:
  workflow_run:
    workflows: ["*"]
    types: [completed]
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  actions: read
  issues: read

safe-outputs:
  create-issue:
    title-prefix: "[ci-doctor] "
    labels: [ci-failure, needs-attention]
    close-older-issues: true
  add-comment:

tools:
  github:
    toolsets: [issues, pull_requests, code_search, workflow_runs]
---

## CI Doctor — Automated Failure Diagnosis

You are an expert CI/CD diagnostician. When a workflow fails,
investigate the failure and create a diagnostic report.

## Steps

1. Check if the triggering workflow actually failed.
   If it succeeded, do nothing — skip creating any output.

2. Retrieve the failed workflow run details and logs

3. Analyze the failure:
   - Identify the specific step that failed
   - Examine error messages and stack traces
   - Check if this is a flaky test, dependency issue,
     configuration problem, or code bug

4. Research the root cause:
   - Look at recent commits that might have caused the failure
   - Check if similar failures have occurred before
   - Identify the most likely root cause

5. Create a diagnostic issue with:
   - **Summary**: One-line description of the failure
   - **Failed Workflow**: Name, run ID, and link
   - **Root Cause Analysis**: What went wrong and why
   - **Suggested Fix**: Specific steps to resolve the issue
   - **Related Changes**: Recent commits or PRs that may be relevant

## Guidelines

- Be specific and actionable in your diagnosis
- Include relevant log snippets in code blocks
- If the cause is ambiguous, list the top 2-3 most likely causes
- Link to relevant documentation when applicable
- Do NOT create an issue if the workflow succeeded
````

### Step 2: Compile and Push

```bash
gh aw compile
git add .github/workflows/ci-doctor.md .github/workflows/ci-doctor.lock.yml
git commit -m "feat: add CI doctor fault analysis workflow"
git push
```

### Step 3: Test the Workflow

If your repository has CI workflows, you can test by intentionally introducing a build error. Alternatively, since the workflow includes `workflow_dispatch`, you can trigger it manually:

```bash
gh aw run ci-doctor
```

### New Concepts Introduced

| Concept | What You Learned |
|---------|-----------------|
| **`workflow_run` triggers** | Reacting to the completion of other workflows |
| **Tool configuration** | `tools: github: toolsets:` specifies which GitHub MCP capabilities the agent can use |
| **Conditional behavior** | Instructions tell the agent to skip output if the workflow actually succeeded |
| **Multi-source analysis** | The agent correlates workflow logs, recent commits, and issue history |

## 7. Walkthrough 4: Adding a Pre-Built Workflow from the Agentics Collection

Instead of writing every workflow from scratch, you can install pre-built workflows from the [Agentics collection](https://github.com/githubnext/agentics) — a sample pack of 30+ reusable automated agentic workflows maintained by GitHub Next and Microsoft Research.

### What You Will Build

Install a community workflow from the Agentics collection, customize it for your repository, and run it.

### Step 1: Browse the Collection

Visit [github.com/githubnext/agentics](https://github.com/githubnext/agentics) to browse available workflows. They're organized by category:

| Category | Example Workflows |
|----------|-------------------|
| **Maintainer** | Issue Triage, Repo Assist, AI Moderator |
| **Fault Analysis** | CI Doctor, CI Coach |
| **Code Review** | Grumpy Reviewer, PR Nitpick, Contribution Check |
| **Research & Planning** | Weekly Research, Daily Plan, Discussion Task Miner |
| **Code Improvement** | Code Simplifier, Test Improver, Documentation Updater |
| **Security** | Daily Malicious Code Scan |

### Step 2: Add a Workflow with the Wizard

Choose a workflow and install it using the interactive wizard:

```bash
gh aw add-wizard githubnext/agentics/daily-repo-status
```

The wizard walks you through:

1. **Prerequisites check** — Verifies repository permissions
2. **Engine selection** — Choose between Copilot, Claude, or Codex
3. **Secret setup** — Configures the required API key as a repository secret
4. **Workflow installation** — Adds the `.md` and `.lock.yml` files to `.github/workflows/`
5. **Initial run** (optional) — Triggers the workflow immediately

### Step 3: Customize the Installed Workflow

Open the installed `.md` file in `.github/workflows/` and customize the markdown body. For example, if you installed `daily-repo-status`, edit the "What to include" section to focus on your team's priorities.

### Step 4: Recompile (If You Changed Frontmatter)

If you only edited the markdown body, no recompilation is needed. If you changed the frontmatter (triggers, permissions, safe-outputs), recompile:

```bash
gh aw compile
```

### Step 5: Commit and Trigger

```bash
git add .github/workflows/
git commit -m "feat: add and customize agentics workflow"
git push
gh aw run <workflow-name>
```

### New Concepts Introduced

| Concept | What You Learned |
|---------|-----------------|
| **Workflow reuse** | Installing pre-built workflows from external repositories |
| **`gh aw add-wizard`** | Interactive installation flow with guided setup |
| **Customization** | Editing body vs. frontmatter, and when recompilation is needed |
| **Shared fragments** | Community workflows may use `imports:` for reusable building blocks |

> **TIP:** Use `gh aw update` to keep installed actions and agentic workflows up to date. Run `gh extensions upgrade github/gh-aw` to update the CLI extension itself.

## 8. Key Concepts Deep Dive

### Triggers

Agentic workflows support all standard GitHub Actions triggers plus extensions:

| Trigger Type | Example | Use Case |
|-------------|---------|----------|
| **Schedule** | `schedule: daily` | Daily reports, weekly summaries |
| **Issue events** | `issues: types: [opened]` | Triage, moderation |
| **PR events** | `pull_request: types: [opened, synchronize]` | Code review, checks |
| **Push** | `push: branches: [main]` | Documentation updates |
| **Workflow run** | `workflow_run: types: [completed]` | CI failure analysis |
| **Discussion** | `discussion: types: [created]` | Task mining, Q&A |
| **Command** | `/plan`, `/fix`, `/archie` | On-demand ChatOps |
| **Manual** | `workflow_dispatch:` | Testing, ad-hoc runs |

Command triggers let users invoke workflows by commenting on issues or PRs with a `/command`. Only users matching `on.roles:` can trigger these.

### Permissions and Strict Mode

Workflows run with **read-only permissions by default**. The compiler validates that your permissions match your configured tools and safe outputs:

- **Non-strict mode** (default for development): Emits warnings for under-provisioned permissions
- **Strict mode** (`strict: true`, default for compilation): Treats under-provisioned permissions as errors, refuses direct write permissions, requires explicit network configuration

```bash
# Compile with strict validation
gh aw compile --strict

# Compile with additional security scanners
gh aw compile --actionlint --zizmor --poutine
```

### Safe Outputs

Safe outputs are pre-approved write operations the AI can request without direct write permissions. Each safe output type supports configuration options:

```yaml
safe-outputs:
  create-issue:
    title-prefix: "[report] "
    labels: [automated, report]
    close-older-issues: true      # Close previous issues with same prefix
  add-comment:
  create-pull-request:
    title-prefix: "[auto-fix] "
    branch-prefix: "auto/"
    labels: [automated]
  add-labels:
    labels: [bug, feature, question]  # Allowlist of permitted labels
```

### Tools and MCP

Workflows access external capabilities through tools, primarily via the GitHub MCP server:

```yaml
tools:
  github:
    toolsets: [issues, pull_requests, code_search, workflow_runs]
  edit:                    # File editing capability
  bash: ["gh issue comment"]  # Specific CLI commands
```

You can also configure custom MCP servers for accessing external APIs, databases, or other services. See [Using MCPs](https://github.github.com/gh-aw/guides/mcps/) for details.

#### MCP Scripts — Inline Custom Tools

For simple custom tools, define them inline in the frontmatter using `mcp-scripts:` without needing a separate MCP server. See [MCP Scripts](https://github.github.com/gh-aw/reference/mcp-scripts/) for the full specification.

### AI Engines

Configure which AI engine interprets your workflow instructions:

```yaml
engine: copilot   # Default — GitHub Copilot
engine: claude    # Claude by Anthropic
engine: codex     # OpenAI Codex
```

Each engine requires its own authentication secret. See [AI Engines](https://github.github.com/gh-aw/reference/engines/) for model-specific capabilities and configuration.

### Network Controls

The Agent Workflow Firewall (AWF) containerizes the agent and routes all HTTP/HTTPS traffic through a proxy with a domain allowlist:

```yaml
network:
  allowed:
    - defaults       # Basic infrastructure
    - python         # PyPI ecosystem
    - node           # npm ecosystem
    - "api.example.com"  # Custom domain
```

Domains not on the allowlist are blocked. This prevents data exfiltration and restricts compromised agents to permitted domains.

### Shared Workflow Fragments

Reuse common building blocks across workflows with `imports:`:

```yaml
imports:
  - shared/formatting.md   # Standard content structure
  - shared/reporting.md    # Reporting guidelines
```

The [Agentics collection](https://github.com/githubnext/agentics) includes shared fragments for formatting, reporting, MCP servers (arXiv, MarkItDown, Microsoft Docs), and tools (FFmpeg, sq).

### Threat Detection

The threat detection pipeline is a separate job that analyzes all agent outputs before any writes are externalized:

- **AI-powered analysis** using a security-focused prompt
- **Custom detection steps** for integrating external scanners (Semgrep, TruffleHog)
- **Blocking verdict** — writes only proceed if detection passes

Configure custom detection in the frontmatter:

```yaml
threat-detection:
  prompt: |
    Check for references to internal URLs
    and attempts to modify security-sensitive files.
  steps:
    - name: Run Semgrep
      run: semgrep scan /tmp/gh-aw/aw.patch --config=auto
```

## 9. Workflow Examples and Patterns

The [Agentics collection](https://github.com/githubnext/agentics) provides a number of examples that can be used as inspiration for your own workflows or installed directly.  There are many examples including issue triage, CI failure analysis, code review, status reports, planning, code improvement, dependency management, security scanning, formal verification, and more.  

[Peli's Agent Factory blog](https://github.github.com/gh-aw/blog/2026-01-12-welcome-to-pelis-agent-factory/) also includes a number of example workflows and is a great resource for learning how to write your own workflows or exploring new ideas.

### Choosing the Right Pattern

The gh-aw documentation defines several operational patterns. Choose based on your use case:

| Pattern | Trigger | Use Case |
|---------|---------|----------|
| **DailyOps** | `schedule: daily` | Reports, documentation updates, code improvements |
| **IssueOps** | `issues: [opened, edited]` | Triage, moderation, auto-responses |
| **ChatOps** | `/command` comments | On-demand operations triggered by maintainers |
| **LabelOps** | `issues: [labeled]` | React to label changes (e.g., label triggers investigation) |
| **Orchestration** | `workflow_dispatch` + `dispatch-workflow` | Multi-phase workflows where one workflow triggers another |
| **Monitoring** | `schedule` + `workflow_run` | Health checks, CI monitoring, metrics collection |

> **TIP:** Check out the design patters in the [Agentic Workflow Documentation](https://github.github.com/gh-aw/patterns/central-repo-ops/) as there are more than this and they include detailed examples and best practices for each pattern.

## 10. Testing, Debugging, and Iterating

### CLI Commands for Development

| Command | Purpose |
|---------|---------|
| `gh aw compile` | Compile `.md` to `.lock.yml` with validation |
| `gh aw compile --watch` | Auto-recompile on frontmatter changes |
| `gh aw compile --strict` | Enhanced security validation |
| `gh aw compile --actionlint --zizmor --poutine` | Additional security scanners |
| `gh aw run <name>` | Trigger a manual workflow run |
| `gh aw logs` | Download and analyze workflow run logs |
| `gh aw audit <run-id>` | Investigate a specific workflow run |
| `gh aw status` | Check workflow health across the repository |
| `gh aw update` | Update installed workflows from source |
| `gh extensions upgrade github/gh-aw` | Update the CLI extension |

### Debugging Checklist

| Problem | Likely Cause | Solution |
|---------|-------------|----------|
| Workflow doesn't appear in Actions | `.lock.yml` not committed | Run `gh aw compile` and commit both files |
| Workflow never triggers | Wrong trigger configuration | Check `on:` syntax; test with `workflow_dispatch` |
| Workflow triggers but agent does nothing | Missing or misconfigured secrets | Verify secret name matches engine (Settings → Secrets) |
| Agent ignores instructions | Markdown body too long or ambiguous | Simplify instructions; put key rules at the top |
| Safe outputs not applied | Missing safe-output configuration | Add the needed safe-output type in frontmatter |
| Network errors / blocked requests | Domain not in allowlist | Add domain to `network: allowed:` list |
| Workflow fails immediately | Compilation error or schema issue | Run `gh aw compile --strict` and fix reported errors |
| Cost is too high | Long-running agent sessions | Reduce `timeout-minutes`, write more specific instructions |

### Cost Management

Agentic workflows consume premium requests or AI engine tokens. Monitor and control costs:

- **Track usage:** `gh aw logs` shows token usage per run
- **Set timeouts:** `timeout-minutes: 15` (default is 20) — shorter timeouts for simple tasks
- **Write efficient prompts:** Specific, focused instructions use fewer tokens than vague ones
- **Use appropriate schedules:** Daily is usually enough; avoid hourly for most tasks

### Iteration Tips

- **Markdown body changes don't need recompilation** — edit instructions, commit, push, and re-run
- **Frontmatter changes require `gh aw compile`** — triggers, permissions, safe-outputs, tools
- **Test with `workflow_dispatch` first** — add it to every workflow during development, remove later if not needed
- **Review artifacts** — every run saves prompts, outputs, and patches as downloadable artifacts in the Actions run

## 11. Best Practices and Common Pitfalls

### ✅ Do

| Practice | Why |
|----------|-----|
| **Start with read-only permissions** | Safe outputs handle writes with proper isolation. Direct write permissions bypass security layers. |
| **Use `workflow_dispatch` during development** | Lets you manually trigger and test without waiting for events or schedules. |
| **Commit both `.md` and `.lock.yml`** | The `.md` is your source; the `.lock.yml` is what Actions runs. Both are needed. |
| **Write specific, focused instructions** | "Label bugs with `bug` and features with `feature`" is better than "triage the issue appropriately." |
| **Configure network allowlists** | Explicit domain control prevents data exfiltration, even if the agent is compromised. |
| **Enable strict mode for production** | `strict: true` enforces enhanced security validation. Only disable for rapid prototyping. |
| **Start simple and iterate** | Begin with a daily report workflow. Add complexity (event triggers, tools, multi-phase) over time. |
| **Test with real scenarios** | Open actual issues, submit real PRs — the agent adapts to real content better than synthetic tests. |

### ❌ Don't

| Anti-Pattern | Why It Fails |
|--------------|--------------|
| **Granting direct write permissions** | Bypasses safe-output validation and threat detection. The agent should never have direct write access. |
| **Writing vague instructions** | "Be helpful" doesn't guide the agent. "Analyze the issue, apply one type label and one priority label" does. |
| **Skipping threat detection** | For production workflows, threat detection catches secret leaks and malicious patches before writes execute. |
| **Hardcoding secrets in `env:`** | Environment variables in `env:` are visible to the AI model. Use engine-specific secret configuration instead. |
| **Ignoring cost management** | Unbounded `timeout-minutes` with broad instructions can burn tokens. Set limits and write focused prompts. |
| **Running too many workflows** | Each workflow consumes compute and AI tokens. Start with 2–3 high-value workflows and expand based on results. |
| **Skipping compilation** | Editing the `.md` without compiling (when frontmatter changed) means the `.lock.yml` is stale. |

### Security Checklist for Production Workflows

The [Introduction](/workshops/copilot-customization/copilot_customization_handbook#8-agentic-workflows) section of this workshop describes the full defense-in-depth architecture. Use this checklist to ensure you've configured all the practical security controls:

- [ ] `strict: true` — Enhanced validation enabled
- [ ] `permissions` — Minimal read-only; no direct write grants
- [ ] `safe-outputs` — Only the write operations you actually need
- [ ] `network: allowed:` — Explicit domain allowlist configured
- [ ] `on.roles:` — Role-based access control set
- [ ] `on.skip-bots:` — Bot accounts excluded to prevent loops
- [ ] `threat-detection:` — Custom detection prompts for your domain (if needed)
- [ ] Secrets configured via engine-specific settings, never in `env:`
- [ ] `gh aw compile --strict` — Passes with no errors

## 12. Creating Custom Workflows

There are a few different approaches to creating custom workflows.  

### AI-generated workflows

Use GitHub Copilot in the web interface, VS code, CLI, or your favorite IDE.  Use a natural language prompt with `create.md`:

```
Create a workflow for GitHub Agentic Workflows using
https://raw.githubusercontent.com/github/gh-aw/main/create.md

The purpose of the workflow is to review open pull requests
weekly and create a summary report of pending reviews,
stale PRs, and recommended actions.
```

The agent will:
1. Create the workflow `.md` file in `.github/workflows/`
2. Configure appropriate triggers, permissions, and safe outputs
3. Optionally create a pull request with the changes

### Manual writing workflows

1. Create `.github/workflows/<workflow-name>.md` with frontmatter and instructions
2. Compile: `gh aw compile`
3. Commit and push both files

### Initialize Your Repository

If you plan to create multiple workflows, initialize your repository for optimal authoring:

```bash
gh aw init
```

This configures the repository with helpful defaults for agentic workflow development.

## What's Next?

This section guided you through the process of creating a few agentic workflows to gain an understanding of how they work. Review the examples in Agentics repo or Peli's Agent Factory blog for more inspiration.  Think though areas where AI-driven automation could help your repository and you team and start building!

## Appendix A: Resources

| Resource | URL |
|----------|-----|
| GitHub Agentic Workflows Docs | https://github.github.com/gh-aw/ |
| Quick Start Guide | https://github.github.com/gh-aw/setup/quick-start/ |
| Frontmatter Reference | https://github.github.com/gh-aw/reference/frontmatter/ |
| Safe Outputs Reference | https://github.github.com/gh-aw/reference/safe-outputs/ |
| Security Architecture | https://github.github.com/gh-aw/introduction/architecture/ |
| AI Engines Reference | https://github.github.com/gh-aw/reference/engines/ |
| Agentics Sample Collection | https://github.com/githubnext/agentics |
| Peli's Agent Factory Blog | https://github.github.com/gh-aw/blog/2026-01-12-welcome-to-pelis-agent-factory/ |
| GitHub Blog Announcement | https://github.blog/ai-and-ml/automate-repository-tasks-with-github-agentic-workflows/ |
| Community Feedback Discussion | https://github.com/orgs/community/discussions/186451 |
| Workflow Patterns | https://github.github.com/gh-aw/patterns/daily-ops/ |
| Troubleshooting Guide | https://github.github.com/gh-aw/troubleshooting/common-issues/ |
| FAQ | https://github.github.com/gh-aw/reference/faq/ |
