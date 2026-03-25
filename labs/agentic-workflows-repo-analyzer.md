---
title: "Lab: Agentic Workflows Repo Analyzer"
description: Create a GitHub Agentic Workflow that produces weekly repository health reports with AI-readiness assessments, DORA/SPACE metrics, and trend charts.
sidebar_position: 4
---

# Lab: Agentic Workflows Repo Analyzer

> **Duration:** ~45 minutes | **Level:** Intermediate | **Prerequisites:** GitHub CLI (`gh`) authenticated, a GitHub repository with some PR/issue history

## Objective

In this lab you will create a **GitHub Agentic Workflow** — an AI-powered GitHub Actions workflow written in natural language — that automatically analyzes a repository's health and produces a comprehensive report as a GitHub issue. By the end, you'll have a workflow that runs weekly and generates insights about AI-agent readiness, CI/CD health, DORA metrics, review efficiency, Copilot adoption, and more.

:::note What are GitHub Agentic Workflows?
[GitHub Agentic Workflows (gh-aw)](https://github.github.io/gh-aw/) let you write GitHub Actions workflows in **Markdown** with natural language instructions. The `gh aw` CLI compiles your Markdown into a secure GitHub Actions `.lock.yml` file that runs an AI agent with carefully scoped permissions, tools, and guardrails. Think of it as "CI/CD for AI agents."
:::

---

## What You'll Build

A **Repository Health Analyzer** workflow that:

- Runs on a **weekly schedule** and on-demand via `workflow_dispatch`
- Reads repository data through the GitHub MCP server (issues, PRs, commits, workflow runs)
- Generates **Python charts** (matplotlib/seaborn) for trend visualization
- Produces a GitHub issue with 8 report sections:

| Section | What It Covers |
|---------|---------------|
| 🤖 AI Agent Readiness | Scorecard assessing if the repo is ready for AI agents |
| 🔧 CI/CD Health | Workflow pass rates, durations, flaky test detection |
| 📈 DORA Metrics | Deployment frequency, lead time, change failure rate, MTTR |
| 🧭 SPACE Metrics | Activity, performance, efficiency, collaboration proxies |
| 👀 Review Efficiency | Time to first review, review-to-merge, reviewer throughput |
| ⏱️ PR Lead Times | Open→review→merge lifecycle by PR size |
| 🤝 Copilot Adoption | Copilot-assisted PRs, commits, reviews, and adoption trends |
| 📉 Trends & Recommendations | Week-over-week comparison and prioritized action items |

---

## What You'll Learn

| Skill | Where You'll Use It |
|-------|-------------------|
| Install and use the `gh aw` CLI | [Exercise 1](#exercise-1--install-gh-aw) |
| Understand agentic workflow structure | [Exercise 2](#exercise-2--understand-the-anatomy) |
| Write workflow frontmatter (triggers, permissions, tools) | [Exercise 3](#exercise-3--write-the-frontmatter) |
| Write natural language agent instructions | [Exercise 4](#exercise-4--write-the-agent-instructions) |
| Compile and validate workflows | [Exercise 5](#exercise-5--compile-and-validate) |
| Deploy and trigger your first run | [Exercise 6](#exercise-6--deploy-and-run) |
| Customize and extend workflows | [Exercise 7](#exercise-7--customize-and-extend) |

---

## Exercise 1 — Install gh-aw

The `gh aw` CLI is a GitHub CLI extension that compiles Markdown workflows into GitHub Actions.

### 1.1 Verify GitHub CLI

Make sure `gh` is installed and authenticated:

```bash
gh auth status
```

You should see your GitHub username and authentication method. If not, run `gh auth login`.

### 1.2 Install the Extension

```bash
curl -sL https://raw.githubusercontent.com/github/gh-aw/main/install-gh-aw.sh | bash
```

If you already have it installed, upgrade to the latest version:

```bash
gh extension upgrade aw
```

### 1.3 Verify Installation

```bash
gh aw version
```

You should see a version number (e.g., `v0.62.5` or newer).

### ✅ Checkpoint

You have `gh` authenticated and `gh aw` installed. Run `gh aw version` to confirm.

---

## Exercise 2 — Understand the Anatomy

Before writing your own workflow, let's understand the structure of an agentic workflow.

### 2.1 The Two-Part File

Every agentic workflow is a single `.md` file in `.github/workflows/` with two parts:

```
┌─────────────────────────────────────────┐
│  YAML Frontmatter (between --- markers) │  ← Configuration
│  - Triggers (on:)                       │    Requires recompilation
│  - Permissions                          │    when changed
│  - Tools & MCP servers                  │
│  - Safe outputs                         │
│  - Setup steps                          │
├─────────────────────────────────────────┤
│  Markdown Body                          │  ← Agent Instructions
│  - What the agent should do             │    Can be edited without
│  - How to process data                  │    recompilation!
│  - Output formatting                    │
│  - Step-by-step guidance                │
└─────────────────────────────────────────┘
```

**Key insight:** The Markdown body is loaded at runtime. You can edit agent instructions directly on GitHub.com and changes take effect on the next run — no recompilation needed!

### 2.2 Security Model

Agentic workflows follow a **read-only agent** model:

- The agent job has **read-only permissions** for all scopes
- All write operations (creating issues, adding comments) go through the **`safe-outputs`** system
- Safe outputs enforce validation, rate limiting, and audit trails
- This prevents a runaway or compromised AI agent from causing damage

```yaml
# ✅ Correct: Read-only agent, writes via safe-outputs
permissions:
  contents: read
  issues: read
safe-outputs:
  create-issue:
    max: 3

# ❌ Wrong: Never give write permissions directly
permissions:
  issues: write   # This bypasses safety controls!
```

### 2.3 The Compilation Step

After writing your `.md` file, you compile it:

```bash
gh aw compile <workflow-name>
```

This generates a `.lock.yml` file — a standard GitHub Actions workflow with all the security guardrails baked in. The `.lock.yml` is what GitHub Actions actually runs.

### ✅ Checkpoint

You understand the two-part structure (frontmatter + body), the read-only security model, and the compile step.

---

## Exercise 3 — Write the Frontmatter

Now let's build the workflow. Create the file:

```bash
mkdir -p .github/workflows
touch .github/workflows/repo-health-analyzer.md
```

Open it in your editor and add the YAML frontmatter.

### 3.1 Description and Triggers

Start with the description and triggers:

```yaml
---
description: |
  Weekly repository health analyzer that assesses AI-agent readiness,
  CI/CD health, DORA/SPACE metrics, review efficiency, PR lead times,
  and GitHub Copilot adoption. Produces a comprehensive report as a GitHub issue
  with trend charts and actionable recommendations.

on:
  schedule: weekly
  workflow_dispatch:

timeout-minutes: 30
```

**Key points:**
- `schedule: weekly` uses **fuzzy scheduling** — the compiler automatically picks a random time to avoid load spikes. It also auto-adds `workflow_dispatch` for manual triggering.
- `timeout-minutes: 30` gives the agent enough time to collect data, generate charts, and create the report.

### 3.2 Permissions and Environment

Add read-only permissions and a configurable target repository:

```yaml
permissions:
  contents: read
  issues: read
  pull-requests: read
  actions: read

env:
  TARGET_REPOSITORY: ${{ vars.TARGET_REPOSITORY || github.repository }}
```

:::tip Analyzing a different repo
By setting the `TARGET_REPOSITORY` repository variable in your repo's Settings → Variables, you can point the analyzer at any repository you have access to.
:::

### 3.3 Network and Tools

Configure network access and tools:

```yaml
network:
  allowed:
    - defaults
    - python
    - node

tools:
  edit:
  bash:
    - "*"
  github:
    lockdown: false
    min-integrity: none
    toolsets: [default]
    repos: all
```

**What each tool does:**
- `edit` — Allows the agent to create/edit files (for Python scripts)
- `bash` — Allows running commands (for executing Python scripts)
- `github` — The GitHub MCP server, providing access to issues, PRs, commits, workflow runs, etc.
- `network: python` — Allows pip to download packages from PyPI

### 3.4 Safe Outputs and Setup Steps

Add the output configuration and Python setup:

```yaml
safe-outputs:
  mentions: false
  allowed-github-references: []
  upload-asset:
  create-issue:
    title-prefix: "[Repo Health] "
    labels: [report, repo-health, weekly]
    close-older-issues: true

steps:
  - name: Setup Python environment
    run: |
      mkdir -p /tmp/charts /tmp/data
      pip install --user --quiet numpy pandas matplotlib seaborn scipy
      python3 -c "import pandas, matplotlib, seaborn; print('Python environment ready')"
---
```

**What this configures:**
- `upload-asset` — Lets the agent upload chart images
- `create-issue` — Lets the agent create the report issue with `[Repo Health]` prefix and auto-close older reports
- `mentions: false` — Prevents the agent from @-mentioning people
- `steps` — Pre-installs Python data science libraries before the agent runs

### ✅ Checkpoint

You should have a complete frontmatter block between `---` markers. The closing `---` is important — it separates the frontmatter from the Markdown body.

---

## Exercise 4 — Write the Agent Instructions

Below the frontmatter, add the Markdown body. This is where you tell the agent what to do in natural language. The agent will follow these instructions step by step.

### 4.1 Introduction and Data Collection

```markdown
# Repository Health Analyzer

Analyze repository `${{ env.TARGET_REPOSITORY }}` and produce a comprehensive
health report as a GitHub issue. The report should help teams understand their
repository's health, AI-agent readiness, and improvement trends over time.

## Data Collection

Use GitHub tools to gather data for the **past 30 days**:

1. **Repository metadata** — README contents, file tree (top 2 levels), key config files
2. **Pull requests** — All PRs (opened, merged, closed) with authors, reviewers, timestamps
3. **Issues** — All issues opened and closed with labels and timestamps
4. **Commits** — Recent commits on default branch with author info and co-author trailers
5. **Workflow runs** — CI/CD workflow run results (success, failure, duration)
6. **Releases/tags** — Recent releases or deployment-tagged events

Collect enough data to compute weekly trends for the past 4 weeks.
```

### 4.2 AI Agent Readiness Section

This section is based on the criteria from [Preparing a Repository for AI Agents](/workshops/copilot-customization/prepare_your_repository). Add:

```markdown
## Section 1: AI Agent Readiness Assessment

Evaluate the repository against the criteria below. For each criterion, assign:
- ✅ **Present & Good** — criterion is fully met
- ⚠️ **Partial** — exists but incomplete
- ❌ **Missing** — not present

### Criteria Checklist

| # | Criterion | What to Check |
|---|-----------|---------------|
| 1 | **Clear README** | Includes project purpose, architecture, build steps, test steps, layout |
| 2 | **Architecture Docs** | `/docs/architecture.md` or similar documentation exists |
| 3 | **Predictable Structure** | Clear folders (`/src`, `/tests`, `/docs`); no `/misc` or `/stuff` |
| 4 | **In-Repo Documentation** | Build, test, and contribution instructions in markdown |
| 5 | **ADRs** | Architecture Decision Records in `/docs/adr/` |
| 6 | **Scriptable Build/Test** | Makefile, npm scripts, or similar with simple commands |
| 7 | **Test Suite** | Test directory exists, framework configured, meaningful coverage |
| 8 | **Automated CI** | GitHub Actions running tests, linting, or scans on PRs |
| 9 | **Linting & Formatting** | Config files (`.eslintrc*`, `.prettierrc*`, `ruff.toml`, etc.) |
| 10 | **Copilot Auto-Review** | Copilot review configuration or Copilot reviewer activity |
| 11 | **Custom Instructions** | `.github/copilot-instructions.md` exists |
| 12 | **CONTRIBUTING.md** | Has coding standards, branch strategy, PR expectations |

Grade the repo: **A** (10+✅), **B** (7-9), **C** (4-6), **D** (0-3).
Provide top 3-5 specific, actionable recommendations.
```

:::tip Why AI readiness matters
Repositories structured for machine consumption get dramatically better results from AI agents. This assessment gives teams a concrete checklist to improve their agent outcomes.
:::

### 4.3 Metrics Sections

Continue adding instructions for each metrics section. Here's the DORA metrics section as an example:

```markdown
## Section 3: DORA Metrics

Approximate DORA metrics from GitHub data for the past 30 days:

### Deployment Frequency
- Count releases, tags, or deployments per week
- If no releases, count merges to default branch as proxy
- Classify: **Elite** (multiple/day), **High** (weekly), **Medium** (monthly), **Low** (less)

### Lead Time for Changes
- Median time from first commit on a branch to PR merge
- Classify: **Elite** (<1 day), **High** (<1 week), **Medium** (<1 month), **Low** (>1 month)

### Change Failure Rate
- Identify reverted PRs, hotfix branches, or bugs opened after merges
- Calculate as percentage of total merged PRs
- Classify: **Elite** (0-5%), **High** (5-10%), **Medium** (10-15%), **Low** (>15%)

### Mean Time to Recovery (MTTR)
- For bug/incident/regression issues: time from opened to closed
- Classify: **Elite** (<1hr), **High** (<1 day), **Medium** (<1 week), **Low** (>1 week)
```

### 4.4 Charts and Final Report

Add instructions for chart generation and the final issue creation:

```markdown
## Chart Generation

Write Python scripts to create trend charts. For all scripts:
- Use `matplotlib.use('Agg')` for headless rendering
- Use seaborn whitegrid style
- Save to `/tmp/charts/` at 300 DPI, 12×7 inches
- Handle sparse data gracefully

### Charts to Generate
1. **PR Lead Times** — Grouped bar chart by PR size category
2. **Copilot Adoption** — Line chart of adoption rate over 4 weeks
3. **Activity Trends** — Stacked bars (PRs, issues) with commit overlay line

Upload all charts using `upload-asset` and embed in the report.

## Create the Report Issue

Create a GitHub issue titled "Repository Health Report — YYYY-MM-DD" containing
all sections with embedded charts, trend tables, and recommendations.
```

### 4.5 The Complete File

For a complete reference implementation of the full workflow (all 8 sections with detailed instructions), see the [`repo-health-analyzer.md` in this repository](https://github.com/copilot-academy/copilot-academy.github.io/blob/main/.github/workflows/repo-health-analyzer.md).

You can also use the Copilot CLI to help you write the remaining sections. In your terminal:

```bash
copilot
```

Then prompt:

<div className="prompt-block">

```text
I'm writing a GitHub Agentic Workflow at .github/workflows/repo-health-analyzer.md.
I've written the frontmatter and the first few sections. Review the file and help me
complete the remaining sections for: CI/CD Health, SPACE Metrics, Review Efficiency,
PR Lead Times, Copilot Adoption tracking, and a Trends & Recommendations summary.
Follow the same style and detail level as the existing sections.
```

</div>

### ✅ Checkpoint

You have a complete `.md` file with YAML frontmatter and natural language instructions covering all 8 report sections.

---

## Exercise 5 — Compile and Validate

### 5.1 Compile the Workflow

```bash
gh aw compile repo-health-analyzer
```

You should see output like:

```text
✓ .github/workflows/repo-health-analyzer.md (58.3 KB)
✓ Compiled 1 workflow(s): 0 error(s), 0 warning(s)
```

This creates `.github/workflows/repo-health-analyzer.lock.yml` — the compiled GitHub Actions workflow.

### 5.2 Check .gitattributes

The compiler may have created or updated `.gitattributes`. Verify it contains:

```bash
cat .gitattributes
```

Expected content:

```text
.github/workflows/*.lock.yml linguist-generated=true merge=ours
```

This marks lock files as generated (hidden in GitHub diffs by default) and uses "ours" merge strategy to avoid conflicts.

### 5.3 Inspect the Lock File

Take a look at what was generated:

```bash
wc -l .github/workflows/repo-health-analyzer.lock.yml
head -50 .github/workflows/repo-health-analyzer.lock.yml
```

The lock file is a standard GitHub Actions YAML workflow — but you'll see it includes security guardrails, environment setup, and the agent runner infrastructure that `gh aw` manages for you.

:::warning Don't edit the lock file!
Always edit the `.md` source file and recompile. Direct edits to `.lock.yml` will be overwritten on the next compile.
:::

### ✅ Checkpoint

You have three files ready to commit:
- `.github/workflows/repo-health-analyzer.md` (your source)
- `.github/workflows/repo-health-analyzer.lock.yml` (compiled workflow)
- `.gitattributes` (merge strategy for lock files)

---

## Exercise 6 — Deploy and Run

### 6.1 Commit and Push

```bash
git add .gitattributes \
       .github/workflows/repo-health-analyzer.md \
       .github/workflows/repo-health-analyzer.lock.yml

git commit -m "Add repo-health-analyzer agentic workflow

Weekly repository health analysis covering AI readiness,
CI/CD health, DORA/SPACE metrics, review efficiency,
PR lead times, and Copilot adoption tracking."

git push
```

:::note Branch protection
If your default branch has branch protection rules, create a feature branch and open a pull request instead:
```bash
git checkout -b add-repo-health-analyzer
git push -u origin add-repo-health-analyzer
gh pr create --title "Add repo-health-analyzer agentic workflow" --fill
```
:::

### 6.2 Trigger a Manual Run

Navigate to your repository on GitHub, then:

1. Go to **Actions** tab
2. Find **"repo-health-analyzer"** in the left sidebar
3. Click **"Run workflow"** → Select branch → **"Run workflow"**

Alternatively, use the CLI:

```bash
gh workflow run repo-health-analyzer
```

### 6.3 Monitor the Run

Watch the workflow execution:

```bash
gh run watch
```

Or monitor from the Actions tab in your browser. The run typically takes 5-15 minutes depending on the repository's size and activity.

### 6.4 Review the Report

Once the run completes, find the generated issue:

```bash
gh issue list --label repo-health
```

Open it in your browser to see the full report with charts, scorecard, metrics tables, and recommendations.

### ✅ Checkpoint

Your workflow has run successfully and created a GitHub issue with the health report. Browse the issue to see the AI readiness scorecard, DORA metrics, review efficiency analysis, and recommendations.

---

## Exercise 7 — Customize and Extend

Now that you have a working workflow, here are ways to customize it.

### 7.1 Analyze a Different Repository

Set a repository variable to point the analyzer at any repo you have read access to:

```bash
gh variable set TARGET_REPOSITORY --body "octocat/hello-world"
```

Then trigger another run — the report will analyze the target repository instead.

### 7.2 Edit Instructions Without Recompiling

Remember: the Markdown body is loaded at runtime. Try editing the agent instructions directly on GitHub.com:

1. Navigate to `.github/workflows/repo-health-analyzer.md` on GitHub
2. Click the pencil icon to edit
3. Add a new section or modify existing instructions
4. Commit directly — no recompile needed!

For example, add a section for security analysis:

```markdown
## Section 9: Security Posture

Check for:
- Dependabot alerts enabled
- Code scanning (CodeQL) configured
- Secret scanning enabled
- Branch protection rules on the default branch
- Required reviews on PRs
```

### 7.3 Add a Slack Notification

To notify your team when a new report is generated, you can add an MCP server for Slack. This **does** require a frontmatter change and recompilation:

```yaml
mcp-servers:
  slack:
    url: https://mcp.slack.com/sse
    headers:
      Authorization: "Bearer ${{ secrets.SLACK_BOT_TOKEN }}"
```

Then add to the Markdown body:

```markdown
## Notify Team

After creating the report issue, post a summary to the #engineering Slack channel
with a link to the full report.
```

Recompile:

```bash
gh aw compile repo-health-analyzer
```

### 7.4 Explore More Agentic Workflows

The [githubnext/agentics](https://github.com/githubnext/agentics) repository contains dozens of ready-to-use agentic workflows you can add to your repository:

| Workflow | What It Does |
|----------|-------------|
| 🏷️ Issue Triage | Auto-label and triage incoming issues |
| 🏥 CI Doctor | Investigate CI failures automatically |
| 📚 Weekly Research | Collect research updates and industry trends |
| 🔍 Grumpy Reviewer | On-demand opinionated code review |
| 📖 Documentation Updater | Keep docs in sync with code changes |
| 🔬 Lean Squad | Apply formal verification to your codebase |

Browse the full catalog for more ideas: [Peli's Agent Factory](https://github.github.io/gh-aw/blog/2026-01-12-welcome-to-pelis-agent-factory/)

### ✅ Checkpoint

You've customized the workflow, explored extension options, and know where to find more workflows.

---

## Wrap-Up

### What You Built

- A complete **GitHub Agentic Workflow** that analyzes repository health across 8 dimensions
- **AI Agent Readiness scorecard** based on concrete, actionable criteria
- **DORA and SPACE metric approximations** from GitHub API data
- **Trend charts** generated with Python for visual insights
- A workflow that runs automatically on a weekly schedule

### Key Takeaways

1. **Agentic workflows are Markdown** — Write natural language instructions, compile to secure GitHub Actions
2. **Read-only agents + safe outputs** — The security model keeps AI agents constrained and auditable
3. **Fuzzy scheduling** — Let the compiler distribute workflow times to avoid load spikes
4. **Runtime-editable** — Markdown body changes take effect without recompilation
5. **Composable** — Start simple, add MCP servers and tools as needs grow

### What's Next?

- **Run it weekly** and track how your team's metrics improve over time
- **Act on the AI readiness recommendations** to prepare your repo for AI agents
- **Explore [githubnext/agentics](https://github.com/githubnext/agentics)** for more workflows to add
- **Read [Peli's Agent Factory blog](https://github.github.io/gh-aw/blog/2026-01-12-welcome-to-pelis-agent-factory/)** for deep dives on workflow patterns

---

## Related Resources

- [GitHub Agentic Workflows Documentation](https://github.github.io/gh-aw/)
- [gh-aw Quick Start](https://github.github.com/gh-aw/setup/quick-start/)
- [githubnext/agentics — Example Workflows](https://github.com/githubnext/agentics)
- [Preparing a Repository for AI Agents](/workshops/copilot-customization/prepare_your_repository)
- [Agent Orchestration Lab](/labs/agent-orchestration)
