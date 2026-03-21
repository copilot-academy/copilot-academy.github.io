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

permissions:
  contents: read
  issues: read
  pull-requests: read
  actions: read

env:
  TARGET_REPOSITORY: ${{ vars.TARGET_REPOSITORY || github.repository }}

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
