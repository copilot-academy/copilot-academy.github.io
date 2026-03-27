---
title: "Lab: Agentic Workflows Repo Analyzer"
description: Create a GitHub Agentic Workflow that produces weekly repository health reports with AI-readiness assessments, DORA/SPACE metrics, and trend charts.
sidebar_position: 4
---

# Lab: Agentic Workflows Repo Analyzer

> **Duration:** ~45 minutes | **Level:** Intermediate | **Prerequisites:** GitHub CLI (`gh`) authenticated, a GitHub repository with some PR/issue history

## Objective

In this lab you will create a **GitHub Agentic Workflow** that automatically analyzes a repository's health and produces a comprehensive report as a GitHub issue. By the end, you'll have a workflow that runs weekly and generates insights about AI-agent readiness, CI/CD health, DORA metrics, review efficiency, Copilot adoption, and more.

:::note What are GitHub Agentic Workflows?
[GitHub Agentic Workflows (gh-aw)](https://github.github.io/gh-aw/) let you write GitHub Actions workflows in **Markdown** with natural language instructions. The `gh aw` CLI compiles your Markdown into a secure GitHub Actions `.lock.yml` file that runs an AI agent with carefully scoped permissions, tools, and guardrails. Think of it as "CI/CD for AI agents."
:::

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

## Exercise 1 — Install gh-aw

The `gh aw` CLI is a GitHub CLI extension that compiles Markdown workflows into GitHub Actions.

### 1.1 Verify GitHub CLI

Make sure `gh` is installed and authenticated:

```bash
gh auth status
```

You should see your GitHub username and authentication method. If not, run `gh auth login`.

### 1.2 Install the Extension

The extension requires Linux, macOS, or Windows with WSL.  Install as follows:

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

You should see a version number (e.g., `v0.64.2` or newer).

### ✅ Checkpoint

You have `gh` authenticated and `gh aw` installed. Run `gh aw version` to confirm.

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

:::note Key insight 
The Markdown body is loaded at runtime. You can edit agent instructions directly on GitHub.com and changes take effect on the next run. No recompilation needed!
:::

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
  schedule:
    - cron: '0 6 * * 0' # Every Sunday at 6:00 AM UTC
  workflow_dispatch:

timeout-minutes: 30
```

**Key points:**
- `cron: '0 6 * * 0'` runs every **Sunday at 6:00 AM UTC**. Adjust the hour to match your timezone (e.g., `0 12 * * 0` for 7 AM ET / 4 AM PT during daylight saving time).
- `workflow_dispatch` allows manual triggering at any time.
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
By setting the `TARGET_REPOSITORY` repository variable in your repo's Settings → Variables, you can point the analyzer at any repository you have access to. Note that the built-in GitHub Actions token will only have permissions for the current repository, so cross-repo analysis would require additional setup (e.g., a PAT with broader access).
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
    allowed-repos: all
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

You should have a complete frontmatter block between `---` markers. The closing `---` is important because it separates the frontmatter from the Markdown body.

## Exercise 4 — Write the Agent Instructions

Below the frontmatter, add the Markdown body. This is where you tell the agent what to do in natural language. The agent will follow these instructions step by step.

Add the sections to your markdown body. 

### 4.1 Introduction and Data Collection

```markdown
# Repository Health Analyzer

Analyze repository `${{ env.TARGET_REPOSITORY }}` and produce a comprehensive health report as a GitHub issue. The report should help teams understand their repository's health, AI-agent readiness, and improvement trends over time.

## Data Collection

Use GitHub tools to gather data for the **past 30 days** from `${{ env.TARGET_REPOSITORY }}`:

1. **Repository metadata** — README contents, file tree (top 2 levels), key config files
2. **Pull requests** — All PRs (opened, merged, closed) with authors, reviewers, timestamps, and commit trailers
3. **Issues** — All issues opened and closed with labels and timestamps
4. **Commits** — Recent commits on the default branch with author info and co-author trailers
5. **Workflow runs** — CI/CD workflow run results (success, failure, duration)
6. **Releases/tags** — Recent releases or deployment-tagged events

Collect enough data to compute weekly trends for the past 4 weeks.

---

```

### 4.2 AI Agent Readiness Section

This section is based on the criteria from [Preparing a Repository for AI Agents](/workshops/copilot-customization/prepare_your_repository). Add:

```markdown
## Section 1: AI Agent Readiness Assessment

Evaluate the repository against the criteria below. For each criterion, assign a status:
- ✅ **Present & Good** — criterion is fully met
- ⚠️ **Partial** — exists but incomplete or could be improved
- ❌ **Missing** — not present

### Criteria Checklist

| # | Criterion | What to Check |
|---|-----------|---------------|
| 1 | **Clear README** | README.md exists and includes: project purpose, architecture summary, build steps, test steps, repository layout |
| 2 | **Architecture Documentation** | Presence of `/docs/architecture.md`, `/docs/components.md`, system diagrams, or similar |
| 3 | **Predictable Repo Structure** | Uses clear folder names (`/src`, `/tests`, `/docs`, `/scripts`); avoids ambiguous names (`/misc`, `/stuff`, `/temp`) |
| 4 | **In-Repo Documentation** | Build instructions, test instructions, and contribution guidelines are in markdown files in the repo |
| 5 | **Architecture Decision Records** | Presence of `/docs/adr/` or similar ADR directory |
| 6 | **Scriptable Build/Test** | Makefile, npm scripts, or similar with simple commands (`make build`, `npm test`) |
| 7 | **Test Suite** | Test directory exists, test framework configured, evidence of meaningful test coverage |
| 8 | **Automated CI** | GitHub Actions workflows that run tests, linting, or security scans on PRs |
| 9 | **Linting & Formatting** | Config files present (`.eslintrc*`, `.prettierrc*`, `ruff.toml`, `.editorconfig`, `pyproject.toml` with tool config, etc.) |
| 10 | **Copilot Auto-Review** | Check for Copilot review configuration or evidence of Copilot as a reviewer on PRs |
| 11 | **Custom Instructions** | Presence of `.github/copilot-instructions.md` |
| 12 | **CONTRIBUTING.md** | File exists with meaningful content (coding standards, branch strategy, PR expectations) |

### Output Format

Present the results as a scorecard table with the status emoji, criterion name, and a brief finding. Then compute an overall **AI Agent Readiness Grade**:
- **A (Agent-Ready)**: 10+ criteria met (✅)
- **B (Nearly Ready)**: 7-9 criteria met
- **C (Needs Work)**: 4-6 criteria met
- **D (Not Ready)**: 0-3 criteria met

Follow the scorecard with a **Recommendations** section listing the top 3-5 most impactful improvements to make the repo AI-agent ready, in priority order. Each recommendation should be specific and actionable (e.g., "Create a `.github/copilot-instructions.md` file with project overview, tech stack, and build instructions" rather than "Add custom instructions").

---

```

:::tip Why AI readiness matters
Repositories structured for machine consumption get dramatically better results from AI agents. This assessment gives teams a concrete checklist to improve their agent outcomes.
:::

### 4.3 CI/CD Health Section

This section analyzes the health of the repository's CI/CD pipelines based on GitHub Actions workflow runs. Note if you have another CI/CD system you would need to adjust the data collection and analysis steps accordingly.

```markdown
## Section 2: CI/CD Health

Analyze GitHub Actions workflow runs from the past 30 days:

- **Workflow inventory** — List all workflows with their trigger types
- **Pass/fail rates** — Success rate per workflow (runs that succeeded vs. failed)
- **Average duration** — Mean and median run duration per workflow
- **Failure frequency** — Number of failures per week, trending up or down
- **Flaky detection** — Identify workflows/jobs that alternate between pass and fail on the same branch (potential flakiness)

Present as a summary table:

| Workflow | Runs | Pass Rate | Avg Duration | Trend |
|----------|------|-----------|--------------|-------|

---

```

### 4.4 DORA Metrics Sections

Continue adding instructions for each metrics section. Here's the DORA metrics section as an example:

```markdown
## Section 3: DORA Metrics

Approximate DORA metrics from GitHub data for the past 30 days:

### Deployment Frequency
- Count releases, tags, or deployments per week
- If no formal releases, count merges to default branch as a proxy
- Classify: **Elite** (multiple/day), **High** (weekly), **Medium** (monthly), **Low** (less)

### Lead Time for Changes
- Median time from **first commit on a branch** to **PR merge** into default branch
- Classify: **Elite** (<1 day), **High** (<1 week), **Medium** (<1 month), **Low** (>1 month)

### Change Failure Rate
- Identify reverted PRs (commits with "revert" in message), hotfix branches, or issues labeled as bug/regression opened shortly after a merge
- Calculate as percentage of total merged PRs
- Classify: **Elite** (0-5%), **High** (5-10%), **Medium** (10-15%), **Low** (>15%)

### Mean Time to Recovery (MTTR)
- For issues labeled `bug`, `incident`, or `regression` — time from opened to closed
- Classify: **Elite** (<1 hour), **High** (<1 day), **Medium** (<1 week), **Low** (>1 week)

Present a summary table with metric, value, classification, and week-over-week trend arrow.

---

```

### 4.5 SPACE Metrics Section

Add instructions for the SPACE metrics section:

```markdown
## Section 4: SPACE Metrics

Compute proxy indicators for SPACE framework dimensions:

### Satisfaction & Well-being
- **Contributor retention**: How many unique contributors from 30-60 days ago are still active in the last 30 days?
- **New contributors**: Count of first-time contributors in the past 30 days

### Performance
- **PR merge rate**: Percentage of opened PRs that got merged (vs. closed without merge)
- **CI pass rate**: Overall CI success rate across all workflows

### Activity
- **Commits per week** on default branch
- **PRs opened/merged per week**
- **Issues opened/closed per week**
- Present as a 4-week activity trend table

### Communication & Collaboration
- **Review comments per PR** (average)
- **Discussion activity**: Count of discussion posts if discussions are enabled
- **PR review participation**: Average number of reviewers per PR

### Efficiency
- **PR cycle time**: Median time from PR open to merge
- **Review turnaround**: Median time from PR open to first review
- **Code review load**: Average open review requests per reviewer

---

```

### 4.6 Review Efficiency Section

Add instructions for the review efficiency section:

```markdown
## Section 5: Review Efficiency

Deep-dive into the code review process:

- **Time to first review** — Median time from PR creation to first review (comment, approval, or request changes)
- **Review to merge** — Median time from first review to merge
- **Total review cycle** — Median time from PR open to merge
- **Review throughput** — Number of reviews completed per reviewer per week
- **Review backlog** — Count of PRs currently open and awaiting review (no reviews yet)
- **Stale PRs** — PRs open for more than 7 days with no activity

Present a summary table and highlight any bottlenecks.

---

```

### 4.7 PR Lead Times Section

Add instructions for the PR lead times section:

```markdown
## Section 6: PR Lead Times

Detailed PR lifecycle analysis:

- **Open → First Review** — time distribution
- **First Review → Merge** — time distribution
- **Open → Merge** — total lead time distribution
- **By PR size**: Categorize PRs as Small (<50 lines), Medium (50-250 lines), Large (>250 lines) and show median lead times per size category

### Chart: PR Lead Time Distribution

Write a Python script to create a chart:
- Horizontal grouped bar chart showing median lead time for each phase (open→review, review→merge) by PR size category
- Save as `/tmp/charts/pr_lead_times.png` at 300 DPI, 12×7 inches
- Use seaborn style with a clear, professional palette
- Use `matplotlib.use('Agg')` for headless rendering

Run the script via bash and verify the file exists.

---

```

### 4.8 Copilot Adoption Section

Add instructions for the GitHub Copilot adoption section:

```markdown
## Section 7: GitHub Copilot Adoption

Measure GitHub Copilot's contribution to the repository:

### Detection Method
- Search commit messages and PR descriptions for `Co-authored-by:` trailers containing "Copilot" or "copilot"
- Check for PRs authored by GitHub Copilot bots
- Look for Copilot code review activity on PRs

### Metrics
- **Copilot-assisted commits**: Count of commits with Copilot co-author trailers per week
- **Copilot-assisted PRs**: Count of PRs with Copilot co-author trailers or authored by Copilot
- **Copilot reviews**: Count of PR reviews by Copilot
- **Adoption rate**: Percentage of total commits/PRs that involve Copilot
- **Trend**: Week-over-week change in Copilot adoption

### Chart: Copilot Adoption Trend

Write a Python script to create a chart:
- Dual-axis line chart: Copilot-assisted commits (left axis), adoption rate % (right axis) over 4 weeks
- Save as `/tmp/charts/copilot_adoption.png` at 300 DPI, 12×7 inches
- Use seaborn style
- Use `matplotlib.use('Agg')` for headless rendering

Run the script via bash and verify the file exists.

---

```

### 4.9 Trends & Recommendations Section

Finally, add instructions for the trends and recommendations section:

````markdown
## Section 8: Activity Trends & Recommendations

### Weekly Activity Chart

Write a Python script to create a combined activity trend chart:
- Stacked or grouped bar chart showing per-week: PRs opened, PRs merged, issues opened, issues closed
- Overlay line for total commits per week
- Cover 4 weeks of data
- Save as `/tmp/charts/activity_trends.png` at 300 DPI, 12×7 inches
- Use seaborn whitegrid style
- Use `matplotlib.use('Agg')` for headless rendering

Run the script via bash and verify the file exists.

### Week-over-Week Summary Table

| Metric | This Week | Last Week | Trend |
|--------|-----------|-----------|-------|
| PRs Opened | X | X | ↑/↓/→ |
| PRs Merged | X | X | ↑/↓/→ |
| Issues Opened | X | X | ↑/↓/→ |
| Issues Closed | X | X | ↑/↓/→ |
| Commits | X | X | ↑/↓/→ |
| Avg PR Lead Time | X days | X days | ↑/↓/→ |
| CI Pass Rate | X% | X% | ↑/↓/→ |
| Copilot Adoption | X% | X% | ↑/↓/→ |

### Top Recommendations

Based on all analysis, provide 5-7 prioritized, actionable recommendations for improving:
- Repository health and AI-agent readiness
- Development velocity and review efficiency
- CI/CD reliability
- Copilot adoption and AI-assisted development

Each recommendation should include:
- **What**: Clear action to take
- **Why**: Which metric it will improve
- **Impact**: Expected benefit (High/Medium/Low)

---

## Chart Generation Notes

For all Python chart scripts:
- Use `matplotlib.use('Agg')` at the top before any other matplotlib imports
- Use `pandas` for data manipulation and datetime handling
- Use `seaborn` whitegrid style for consistent look
- Apply `plt.tight_layout()` before saving
- Handle sparse data gracefully — if fewer than 4 data points, use bar charts instead of lines
- Handle zero-data scenarios — generate placeholder charts with a "No data available" message
- Set DPI to 300 and figure size to 12×7 inches
- Save all charts to `/tmp/charts/`

## Upload Charts

After generating all charts, upload each using the `upload-asset` safe output tool. Collect the returned URLs.

## Create the Report Issue

Create a single comprehensive GitHub issue with the title format:
**Repository Health Report — YYYY-MM-DD**

### Issue Structure

```markdown
## 📊 Repository Health Report

**Repository**: `{repo_name}`
**Report Date**: {date}
**Analysis Period**: Past 30 days

---

### 🤖 AI Agent Readiness

{Section 1 content — scorecard table, grade, recommendations}

---

### 🔧 CI/CD Health

{Section 2 content — workflow table, highlights}

---

### 📈 DORA Metrics

{Section 3 content — metrics table with classifications}

---

### 🧭 SPACE Metrics

{Section 4 content — dimension tables}

---

### 👀 Review Efficiency

{Section 5 content — review metrics, bottlenecks}

---

### ⏱️ PR Lead Times

{Section 6 content — lead time table, chart}
![PR Lead Times]({chart_url})

---

### 🤝 GitHub Copilot Adoption

{Section 7 content — adoption metrics, chart}
![Copilot Adoption]({chart_url})

---

### 📉 Activity Trends

{Section 8 content — activity chart, week-over-week table}
![Activity Trends]({chart_url})

---

### 💡 Top Recommendations

{Prioritized recommendations list}

---

<details>
<summary><b>📋 Report Metadata</b></summary>

- Workflow: `repo-health-analyzer`
- Run: ${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}
- Analysis period: 30 days
- Data collected: {timestamp}

</details>
```

## Important Notes

- Be thorough but handle missing data gracefully — if a metric can't be computed, explain why and skip it
- Use ↑ ↓ → arrows for trend indicators
- Use emoji sparingly but consistently for section headers
- Keep tables aligned and readable
- If the repository has very little activity, produce a shorter report noting the limited data
- Always create the issue even if some sections have incomplete data

````


### 4.10 The Complete File

For the complete file, see  [`repo-health-analyzer.md`](https://github.com/copilot-academy/copilot-academy.github.io/blob/main/.github/workflows/repo-health-analyzer.md) in this repository.

It is a best practice to use the Copilot to author agentic workflows. Here's the example of the prompt I started with to generate the above content:

```text
Create a workflow for GitHub Agentic Workflows using https://github.com/github/gh-aw/blob/main/create.md. The purpose of the workflow is to analyze a repository to understand it's health. Review the content in workshops/copilot-customization/prepare_your_repository.md for some of the content we'd like to review. I'd like a section in the generated report that tells me if the repo is ready of AI agents and recommendations if not. Also review examples from https://github.com/githubnext/agentics and https://github.github.io/gh-aw/blog/2026-01-12-welcome-to-pelis-agent-factory/ for ideas. For other metrics about repo health I'm interested in CI/CD details, DORA and SPACE metrics, Review times, PR lead times, number of PRs (or commits) reviewed and written by GitHub Copilot, as well as any other metrics that would help my team understand improvement over time using AI agents. The Agentic workflow created should be triggered from workflow_dispatch as well as scheduled every Sunday at 06:00 AM UTC.
```

### ✅ Checkpoint

You have a complete `.md` file with YAML frontmatter and natural language instructions covering all 8 report sections.

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

Take a look at what was generated at the file that was created (`.github/workflows/repo-health-analyzer.lock.yml`).

The lock file is a standard GitHub Actions YAML workflow — but you'll see it includes security guardrails, environment setup, and the agent runner infrastructure that `gh aw` manages for you.

:::warning Don't edit the lock file!
Always edit the `.md` source file and recompile. Direct edits to `.lock.yml` will be overwritten on the next compile.
:::

### ✅ Checkpoint

You have three files ready to commit:
- `.github/workflows/repo-health-analyzer.md` (your source)
- `.github/workflows/repo-health-analyzer.lock.yml` (compiled workflow)
- `.gitattributes` (merge strategy for lock files)

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

### 6.2 Setup Authentication and Trigger a Manual Run

Before running agentic workflows, you need to configure a personal access token (PAT) with appropriate permissions to allow Copilot requests.  This is expected to be simplified in the near future with org-level support (so the built-in Actions token can be used rather than needing personal access tokens). 

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

The authentication reference is [here](https://github.github.com/gh-aw/reference/auth/).

Now navigate to your repository on GitHub, then:

1. Go to **Actions** tab
2. Find **"repo-health-analyzer"** in the left sidebar
3. Click **"Run workflow"** → Select branch → **"Run workflow"**

Alternatively, use the CLI:

```bash
gh workflow run repo-health-analyzer
```

### 6.3 Monitor the Run

Watch the workflow execution in the Actions tab in your browser or via CLI:

```bash
gh run watch
```

The run typically takes 5-15 minutes depending on the repository's size and activity.

### 6.4 Review the Report

Once the run completes, go to the issues tab in your repository to find the generated issue.  Review the full report with charts, scorecard, metrics tables, and recommendations. You could also look via CLI:

```bash
gh issue list --label repo-health
```

This report isn't going to be interesting for a new or very small repository, but for an active repository it should provide valuable insights and a baseline for improvement.  Try against some of your existing repositories to see real data!  

### ✅ Checkpoint

Your workflow has run successfully and created a GitHub issue with the health report. Browse the issue to see the AI readiness scorecard, DORA metrics, review efficiency analysis, and recommendations.

## Exercise 7 — Customize and Extend

Now that you have a working workflow, here are ways to customize it.

### 7.1 Analyze a Different Repository

This workflow would ideally run within the repo it's analyzing. It is possible to set a repository variable to point the analyzer at any repo you have read access to.  For example, run a health check against the `facebook/react` repository: 

* Add it to your repository by going to your repository's Settings → Secrets and variables → Actions → Variables → New repository variable
  * Name: `TARGET_REPOSITORY`
  * Value: `facebook/react`
  * Click 'Add variable' to save it
* Alternatively, set it via CLI:
  ```bash
  gh variable set TARGET_REPOSITORY --body "octocat/hello-world"
  ```
* Go back to your Actions tab and trigger another run of the workflow.  The generated report will now analyze the `facebook/react` repository instead of your current repository.  Note that if it was a private repo it would need credentials with access to that repo, but since it's public the built-in GitHub Actions token can access it without additional setup.


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

### 7.3 Explore More Agentic Workflows

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
3. **Flexible scheduling** — Use cron expressions for precise timing or fuzzy scheduling for load distribution
4. **Runtime-editable** — Markdown body changes take effect without recompilation
5. **Composable** — Start simple, add MCP servers and tools as needs grow

### What's Next?

- **Run it weekly** and track how your team's metrics improve over time
- **Act on the AI readiness recommendations** to prepare your repo for AI agents
- **Explore [githubnext/agentics](https://github.com/githubnext/agentics)** for more workflows to add
- **Read [Peli's Agent Factory blog](https://github.github.io/gh-aw/blog/2026-01-12-welcome-to-pelis-agent-factory/)** for deep dives on workflow patterns

## Related Resources

- [GitHub Agentic Workflows Documentation](https://github.github.io/gh-aw/)
- [gh-aw Quick Start](https://github.github.com/gh-aw/setup/quick-start/)
- [githubnext/agentics — Example Workflows](https://github.com/githubnext/agentics)
- [Preparing a Repository for AI Agents](/workshops/copilot-customization/prepare_your_repository)
