---
title: "Lab: Getting Work Done with GitHub Copilot App"
description: Assess product launch readiness as a project manager — build a launch brief, trackers, a live dashboard, and recurring status automation with the GitHub Copilot app.
sidebar_position: 3
---

# Lab: Getting Work Done with GitHub Copilot App

> **Duration:** ~75–90 minutes (core path) | **Level:** Beginner — no coding or terminal required | **Prerequisites:** Active [GitHub Copilot subscription](https://github.com/features/copilot/plans), [Git installed](https://git-scm.com/downloads), and the [GitHub Copilot app](https://github.com/features/ai/github-app) installed and signed in

## Objective

In this lab, you are the project manager responsible for determining whether a fictional product called **Pulse Analytics** is ready to launch. Using the **GitHub Copilot app**, you'll turn scattered cross-functional updates into a launch-readiness brief, an action tracker, a risk register, a stakeholder update, an executive go/no-go presentation, a live readiness dashboard, and a recurring weekly status report.

You are not expected to write code, open a terminal, or know what a repository is before you start. Where a term like "branch" or "pull request" matters, this lab explains it in plain language the first time it comes up.

:::note The GitHub Copilot app is evolving fast
Menu labels, panel names, and feature availability change frequently. If something on your screen looks different from what's described here, use the closest matching option — the underlying workflow stays the same. Check the [official docs](https://docs.github.com/en/copilot/how-tos/github-copilot-app) if you get stuck.
:::

---

## What You'll Create

By the end of this lab, your fictional project will have:

- A one-page **launch-readiness brief** turned into a shareable artifact
- A **living plan** with parallel workstreams and to-do items
- An **action tracker** and a **risk register**
- A **stakeholder update** and an **executive presentation**
- An optional **issue backlog** (if you connect a GitHub repository)
- An interactive **launch-readiness dashboard canvas** you design yourself
- A **recurring weekly status automation** that runs on its own

## Starter Launch-Readiness Notes

Every exercise builds on the same starting point: rough, unstructured notes from a cross-functional launch-readiness meeting. Copy the block below — you'll paste it into the app in Exercise 2.

```text
Product: Pulse Analytics
Project manager: Maya Patel
Executive sponsor: Elena Rodriguez (VP, Product)
Target launch: October 15

Launch goal:
- Release Pulse Analytics to all Business and Enterprise customers
- Give customer teams a real-time view of adoption, usage trends, and risk signals
- Reach 40% activation among eligible accounts within 60 days
- Keep launch-week support volume below 150 product-related tickets

Current status by team:
- Product says the core experience is complete, but two launch requirements are
  still marked "needs decision"
- Engineering has three open defects: one severity 1 dashboard-loading issue and
  two severity 2 export issues
- Marketing drafted the announcement, landing page, and customer email, but final
  screenshots are blocked on the release candidate
- Sales enablement has a draft pitch deck; training for account teams is not scheduled
- Support has named launch coverage, but troubleshooting guidance is incomplete
- Legal approved the product name but has not approved the data-retention language
- Security review is complete with one medium-severity follow-up due before launch
- Finance approved pricing, but the billing-system configuration is not validated

Readiness milestones:
- Release candidate available: September 25
- Internal dogfood complete: September 30
- Sales and support training: October 3-7
- Go/no-go review: October 10
- Production launch: October 15
- Executive launch review: October 22

Known risks and open questions:
- Can the severity 1 loading defect be fixed and retested before go/no-go?
- Who owns final approval of the data-retention language?
- Billing validation has no confirmed owner
- Support needs the troubleshooting guide at least five business days before launch
- Customer email timing conflicts with another major product announcement
- No rollback communication template exists yet

Notes from the readiness meeting:
- Elena wants a simple red/yellow/green view, not a 20-page status deck
- Engineering believes October 15 is achievable if scope does not change
- Marketing needs a firm screenshot date by Friday
- Sales leadership wants confirmation that demo accounts will be ready for training
- The team has not agreed on the exact go/no-go criteria
```

:::tip Make it your own
Feel free to substitute your own real (or realistic) project notes instead. Every exercise below still applies — just swap in your project's names, dates, and risks.
:::

## Exercise 1 — Install, Sign In, and Add Your Project

### 1.1 Install and sign in

:::tip Start with the onboarding guide
For the complete account, environment, and installation flow, follow the [Copilot onboarding guide](/onboarding). Return here once the GitHub Copilot app is installed and you're signed in.
:::

1. Visit the [GitHub Copilot app download page](https://github.com/features/ai/github-app) and install the app for your platform.
2. Open the app and click **Sign in to GitHub**.
3. If prompted, choose a Copilot plan (or configure your own model provider) and complete onboarding.

### 1.2 Add a project folder

The app organizes work around **projects**. A project can be a GitHub repository, a repository from another Git host, or simply a local folder on your computer — you do not need an existing codebase to follow this lab.

1. Click the **+** button in the sidebar next to **Sessions**.
2. Under **Add project from**, choose **Local folder or repository** (or the closest matching option in your version).
3. In the folder picker, create a new empty folder:
   - **macOS:** Navigate to Documents, click **New Folder**, name it `product-launch-readiness`, and click **Open**.
   - **Windows:** Navigate to Documents, click **New folder**, name it `product-launch-readiness`, select it, and click **Select Folder**.
4. Confirm that `product-launch-readiness` appears as a project in the app sidebar.

:::note Repository, in plain language
A **repository** is just a tracked folder — GitHub remembers every version of every file inside it, plus who changed what and when. You don't need one to complete the core exercises in this lab; a plain local folder works fine.
:::

### ✅ Checkpoint

You're signed in and have a project connected — a local folder is enough to continue.

## Exercise 2 — Kick Off Your First Session, Then Tour the App

The fastest way to learn this app is to start an agent working immediately, then explore the interface while it's busy — you are never just staring at a blank screen.

### 2.1 Start a launch-readiness brief session

1. Click **+** next to **Sessions** to start a new session in your project.
2. If a run-location dropdown appears under the prompt box, choose **Local repository** (or **Local** for a plain folder). This core session must work in the `product-launch-readiness` folder so every artifact remains available later in the lab.
3. From the mode dropdown below the prompt box, choose **Interactive**. You'll compare all three modes in Exercise 3.
4. Leave the model set to **Auto**. This is a routine summarization task, so the app can select an appropriate model.
5. Paste the following prompt, followed by the full launch-readiness notes block from above. Paste both together as one message; use **Shift+Enter** for a new line and **Enter** to send.

```text
Act as a project manager preparing for a go/no-go review. Turn these rough
launch notes into a concise, one-page readiness brief with sections for Launch
Goal, Success Measures, Readiness by Team, Milestones, Open Decisions, and Top
Risks. Include an overall Red, Yellow, or Green status with a short rationale.
Save it as launch-readiness-brief.md in this project.

<paste your launch-readiness notes here>
```

6. Send the prompt. The agent starts working right away — leave it running. If it proposes a plan instead, approve the plan so it can create the file.

### 2.2 Tour the interface while it works

While the session runs in the background, explore the sidebar:

- **Sessions** — every active or past agent session, grouped by project. A session can work in your local folder, in a separate working tree, or in a cloud sandbox, depending on the run location you choose.
- **Chats** — a conversation-only mode with no dedicated workspace behind it. Good for brainstorming or asking quick questions before you commit to a task.
- **My work** (sometimes labeled **Needs Your Attention**) — an account-wide view of issues and pull requests from your GitHub repositories. You may see unrelated work here even if this lab uses only a local folder.
- **Automations** — recurring or scheduled tasks you set up once and run again and again (you'll build one in Exercise 10).
- **Customize** — where you manage skills, MCP servers, plugins, custom agents, and canvases (you'll tour this in Exercise 9).

Click back into your running session and open the side panel. Depending on the task, you may see the **plan**, a running **to-do list**, a **file tree**, and a summary of **changes** the agent is making — all live, updating as the agent works.

:::note What's a worktree?
When an agent works inside a connected GitHub repository, it can use an isolated copy called a **worktree**, tied to its own **branch** (a parallel line of changes). That is useful for independent work you want to review before combining. For the core path in this lab, you selected the local run location so each exercise can keep using the same files in `product-launch-readiness`.
:::

:::warning Can't find a file from an earlier exercise?
Check the session's run location. If the agent says it cannot find `launch-readiness-brief.md`, return to the project and start or reopen a session that runs in **Local repository** (or **Local**) rather than a separate working tree.
:::

### ✅ Checkpoint

Your first session produced a `launch-readiness-brief.md` file, and you've located Sessions, Chats, My work / Needs Your Attention, Automations, and Customize in the sidebar.

## Exercise 3 — Chat vs. Session, and Session Modes

### 3.1 Compare Chat and Session

Open **Chats** and start a new chat with this self-contained prompt:

```text
Pulse Analytics targets an October 15 launch. A severity 1 defect is still open,
legal language is awaiting approval, billing validation has no owner, and
support documentation is incomplete. What's the single biggest threat to a
successful launch? Talk it through with me without creating files.
```

Notice that a chat is conversational — no plan, no file changes, and no dedicated workspace containing `launch-readiness-brief.md`. That is why the prompt includes the facts it needs. Use a session when the agent must read or update project files.

### 3.2 Choose a session mode

Every session runs in one of three modes, selectable from a dropdown near the prompt box:

| Mode | What happens |
|------|---------------|
| **Interactive** | You and the agent work together — it proposes changes and waits for your input before proceeding. |
| **Plan** | The agent drafts a plan first. You review and approve it before any work happens. |
| **Autopilot** | The agent works fully on its own — including running tools and iterating — without waiting for your input at each step. |

For project-coordination work like this lab, **Plan** mode is usually the sweet spot: you stay in control of direction without approving every small step.

### 3.3 Choose a model intentionally

The model picker is separate from the session mode:

| Task | Recommended model |
|------|-------------------|
| Summaries, trackers, short updates, and issue drafts | **Auto** |
| Complex planning, custom canvas creation, or several connected deliverables | **Claude Opus** (latest available) or **GPT-5.6 Sol** |

Use **Auto** unless the task clearly needs deeper reasoning. For the larger tasks in this lab, select Claude Opus or GPT-5.6 Sol and choose **High** reasoning effort if that control is available.

:::note Model availability
Available models depend on your Copilot plan and organization policy. If Claude Opus or GPT-5.6 Sol is not listed, use **Auto** and continue.
:::

### ✅ Checkpoint

You can explain the difference between a chat and a session, what each session mode does, and when to use Auto versus a higher-capability model.

## Exercise 4 — Plan the Launch as Parallel Workstreams

### 4.1 Start a Plan-mode session

Start a **new session** for the `product-launch-readiness` project:

1. Choose **Local repository** (or **Local**) as the run location so it can read `launch-readiness-brief.md`.
2. Set the mode to **Plan**.
3. Select **Claude Opus** (latest available) or **GPT-5.6 Sol**, with **High** reasoning effort if available.
4. Use this prompt:

```text
Using launch-readiness-brief.md, organize the work required before the go/no-go
review into parallel readiness workstreams. Include Product and Engineering,
Marketing and Sales, Support and Enablement, and Legal, Security, and Billing.
For each workstream, list the owner, exit criteria, unresolved decisions, and
concrete deliverable. Propose a plan before doing anything else.
```

### 4.2 Review the living plan

The agent proposes a plan with steps and, usually, a running to-do list. This list is **live** — as work happens, items update from pending to in-progress to done, right in the side panel.

Review the proposed workstreams (for example: action tracker, risk register, stakeholder update, executive summary), or ask the agent to adjust the plan:

```text
Combine "stakeholder communication" into a single workstream instead of two
separate ones, then show me the updated plan.
```

For this lab, the Plan session produces a reusable handoff instead of implementing the work itself:

1. Choose the option to exit Plan mode without implementation.
2. Switch the same session to **Interactive**.
3. Use this prompt:

```text
Save the reviewed plan as launch-readiness-plan.md. Preserve the workstreams,
owners, exit criteria, dependencies, open decisions, and deliverables.
Do not create the deliverables yet.
```

:::note Why separate planning from execution?
You could continue in the same session in your own work. This lab starts a new session in Exercise 5 to demonstrate a common project-manager handoff: one session creates an agreed plan, and another executes from the saved brief and plan without losing context.
:::

### ✅ Checkpoint

You have a reviewed plan saved as `launch-readiness-plan.md`. The planning session also remains available in the sidebar for reference.

## Exercise 5 — Produce Your First Artifacts

Different pieces of a project call for different formats. Ask for documents, spreadsheets, or slide-style outputs directly — if your app version includes built-in document, spreadsheet, or presentation work surfaces, the agent opens the artifact right there for you to review and edit alongside it.

### 5.1 Start a new Interactive session

Start a **new session** for `product-launch-readiness`, choose **Local repository** (or **Local**) as the run location, set the mode to **Interactive**, and leave the model on **Auto**. This session can read both `launch-readiness-brief.md` and `launch-readiness-plan.md`, demonstrating a clean handoff from planning to execution.

### 5.2 Create an action tracker

```text
Create a launch-readiness action tracker with columns: Readiness Area, Action,
Owner, Due Date, Status, Blocker, and Go/No-Go Impact. Populate it from
launch-readiness-brief.md and launch-readiness-plan.md, then save the reusable
source as action-tracker.csv. If an editable spreadsheet surface is available
in the app, open the same tracker there too.
```

:::tip Spreadsheet not available?
If your app doesn't yet support an in-app spreadsheet surface, a plain `.csv` file opens fine in any spreadsheet program and works just as well for this lab.
:::

### 5.3 Create an executive presentation

```text
Draft a five-slide executive go/no-go presentation for Pulse Analytics:
launch goal and success measures, readiness by team, critical path, top risks,
and decisions or asks for the executive sponsor. Save the reusable source as
executive-summary.md with one heading per slide. If an editable presentation
surface is available in the app, open the same content there too.
```

Use the side panel's **file tree** to open either file. You can also reveal the `product-launch-readiness` folder in Finder or File Explorer from the project's menu.

### ✅ Checkpoint

You have an action tracker and an executive summary, in whichever format your app supports — spreadsheet and slides if available, CSV and markdown if not.

## Exercise 6 — Build a Custom Project Dashboard Canvas

A **canvas** is a shared, interactive surface both you and the agent can work in — not just a chat reply. Canvases can represent a plan, a kanban board, a markdown document, a spreadsheet, a dashboard, and more. Once created, a canvas opens in the app's side panel and stays there for you to keep using.

### 6.1 Create the canvas

1. Start a **new Interactive session** for `product-launch-readiness`.
2. Choose **Local repository** (or **Local**) as the run location.
3. Select **Claude Opus** (latest available) or **GPT-5.6 Sol**, with **High** reasoning effort if available. Building a canvas is a larger task because the agent creates an interface and its actions.
4. Use the `/create-canvas` skill:

```text
/create-canvas Create a Pulse Analytics launch-readiness dashboard for a
project manager. Show an overall Red, Yellow, or Green status at the top and
readiness cards for Product and Engineering, Marketing and Sales, Support and
Enablement, and Legal, Security, and Billing. Each card should show its owner,
status, exit criteria, and blockers. Add sections for top risks and open
go/no-go decisions. Give me controls to change a readiness status, add a risk,
and record a decision, plus matching agent actions so you can update the same
data when I ask you to.
```

5. When prompted, choose a scope for the canvas:
   - **Project scope** (`.github/extensions`) — shared with your team, saved in the project.
   - **User scope** (`~/.copilot/extensions`) — personal, stored only on your machine.

   For a solo run of this lab, user scope is simplest.

:::note If canvas creation is unavailable
Ask the agent to create `launch-readiness-dashboard.md` with the same overall status, readiness-area table, risks, and open decisions. Continue the lab with that file, and omit references to the dashboard canvas from later prompts.
:::

### 6.2 Iterate on the canvas

Once the canvas opens, try a control directly (for example, change **Support and Enablement** to Yellow), then ask the agent to react to your change:

```text
I changed "Support and Enablement" to Yellow on the dashboard. Update
action-tracker.csv with the missing troubleshooting-guide action, and add a
high-impact risk for support documentation not being ready five business days
before launch.
```

Ask for one more revision to see how canvases evolve over time:

```text
Add a count showing how many readiness areas are Green, Yellow, and Red, and
make the unresolved go/no-go decisions visually prominent.
```

:::note Canvases are bidirectional
You can click controls on the canvas and the agent picks up the change; the agent can update the canvas while it works and you'll see it happen live. That's what makes a canvas different from a static document — it's a shared surface, not a one-way report.
:::

### ✅ Checkpoint

You have either a working launch-readiness dashboard canvas with human and agent controls, or a `launch-readiness-dashboard.md` fallback that keeps the rest of the lab unblocked.

## Exercise 7 — Produce the Remaining Artifacts (and Try Fleet)

Real launches need several documents moving at once. Complete the reliable local path first, then try Fleet if your app and project support it.

### 7.1 Complete the local-first path

Start a **new session** for `product-launch-readiness`, choose **Local repository** (or **Local**) as the run location, and set the mode to **Autopilot**. Select **Claude Opus** (latest available) or **GPT-5.6 Sol**, with **High** reasoning effort if available, because this task coordinates several connected artifacts. Then use:

```text
Using launch-readiness-brief.md, launch-readiness-plan.md, and the files already
in this project:
1. Create risk-register.csv with Risk, Likelihood, Impact, Owner, Mitigation,
   Trigger, and Go/No-Go Impact.
2. Create stakeholder-update.md addressed to Elena Rodriguez, covering the
   overall readiness status, progress since the readiness meeting, decisions
   needed, and risks requiring executive attention.
3. Refresh executive-summary.md with a clear current recommendation: Go,
   Conditional Go, or No-Go.
4. Update the dashboard canvas, or launch-readiness-dashboard.md if the canvas
   was unavailable.

Keep every reusable source file in the root of the product-launch-readiness project.
```

Open the new files from the side panel's file tree and review them.

### 7.2 Optional: see parallel execution with Fleet

Fleet creates multiple agent sessions for separate workstreams. It is easiest to demonstrate with a Git-backed project because each session can use its own working tree and branch.

1. Check **Settings > Experimental Flags** for **Agent tools / Fleet mode**, if your app still places Fleet behind a flag.
2. Start or open an active session for a Git-backed practice project.
3. Select **Claude Opus** (latest available) or **GPT-5.6 Sol** for the orchestrating session.
4. In Plan mode, approve the plan with **Approve and implement with Fleet** if that option appears. You can also type `/fleet` inside the active session:

```text
/fleet Review the project launch materials and produce independent drafts for:
an action-tracker quality review, a risk challenge, a stakeholder-message
critique, and an executive-summary critique.
```

Watch the sessions appear in the sidebar and switch between them to inspect progress. These drafts are an optional demonstration; the canonical files used by the rest of the lab remain in your local project from Exercise 7.1.

### ✅ Checkpoint

You have a risk register, a stakeholder update, and a refreshed executive summary in the local project. If Fleet was available, you also observed several isolated agents working in parallel.

## Exercise 8 — Review Outputs and Connect to GitHub (Optional)

### 8.1 Review from My work / Needs Your Attention

Open **My work** (or **Needs Your Attention**) in the sidebar. This is an account-wide view of issues, pull requests, and review requests from repositories you can access.

You may see unrelated items from other repositories. If this lab uses only a plain local folder, it will not add anything new here, and that's fine — your outputs already live as files and canvases in the project.

### 8.2 Optional: connect a GitHub repository for issues and pull requests

:::important Prerequisites for this step
This part requires a GitHub repository (not just a local folder) that you have write access to. If you don't have one handy, skip to the fallback below — it produces an equivalent artifact without GitHub.
:::

If you do have a repository connected:

Start a new **Interactive session** for that repository, leave the model on **Auto**, then use:

```text
Create one GitHub issue per launch-readiness action that is blocked or does
not have an owner assigned, using the repository's default issue template if
one exists. Include the readiness area and go/no-go impact in each issue.
```

Open **My work** again to see the new issues, and click one to start a session directly from it.

**Local fallback (no GitHub repository required):**

Start a new **Interactive session** for `product-launch-readiness`, choose **Local repository** (or **Local**), leave the model on **Auto**, then use:

```text
Create an issue-backlog.md file listing every blocked or unowned
launch-readiness action as a checklist item. Include a title, readiness area,
short description, go/no-go impact, and suggested owner.
```

### ✅ Checkpoint

You've reviewed pending work through My work / Needs Your Attention, and you have either a set of GitHub issues or a local issue-backlog.md — both represent the same underlying idea.

## Exercise 9 — Tour Customize

Click **Customize** in the sidebar. This is where you discover and manage everything that extends the app:

- **Skills** — folders of instructions and resources the agent loads for specialized tasks (like `/create-canvas`, which you already used).
- **MCP servers** — connections to external tools and data sources (for example, a project-tracking or calendar tool).
- **Plugins** — bundles that can include skills, MCP servers, and canvases together.
- **Custom agents** — specialized agent configurations tailored to specific kinds of work, selectable from the agent picker or with `/agent`.
- **Canvas** — featured canvases you can install, plus an **Installed** view showing the dashboard canvas you built in Exercise 6.

Click through each tab briefly. You don't need to install anything new to finish this lab — this exercise is about knowing where to come back when you need a specialized tool later.

### ✅ Checkpoint

You've located Skills, MCP servers, Plugins, Custom agents, and your installed canvas under Customize.

## Exercise 10 — Automate a Weekly Project Status

**Automations** let you save a recurring agent task and have it run on a schedule or on demand, without you starting it by hand each time. They're separate from your project's actual files and separate from GitHub Actions or other CI-style workflows — an automation is simply a saved prompt with a trigger attached.

### 10.1 Create the automation

1. Open **Automations** in the sidebar and click **New automation**.
2. Name it `Weekly Pulse Analytics Launch Readiness`.
3. Set the trigger to **Weekly** and choose a day and time.
4. Leave the model on **Auto**. The recurring report is focused and should not require the most expensive model.
5. In the prompt box, enter:

```text
Review the launch-readiness brief, action tracker, risk register, executive
summary, stakeholder update, and readiness dashboard in this project, whatever
formats they use. Write a project-manager weekly update with: overall Red,
Yellow, or Green status; changes since the last update; readiness by team;
critical risks; decisions needed; and actions due before the go/no-go review.
Save it as weekly-status.md in the root of the product-launch-readiness project,
overwriting the previous version.
```

6. Leave **Run in the cloud** off for the core path and select the same local `product-launch-readiness` project used in the earlier exercises.
7. Open the dropdown next to **Create** and choose **Create and run** so you see a result immediately instead of waiting for next week.

### 10.2 Inspect and refine the output

Open `weekly-status.md` from the side panel's file tree, or reveal the `product-launch-readiness` folder in Finder or File Explorer. If the tone or structure isn't right, open the saved automation for editing and append these constraints to its prompt:

```text
Make the weekly status shorter — no more than 150 words — and always start
with the overall readiness status: Green, Yellow, or Red. End with the most
important decision required before the go/no-go review.
```

Save the automation, then click the **play** button on its card to confirm the refined version.

### ✅ Checkpoint

You have a saved weekly automation that has already produced one `weekly-status.md`, and you've refined its prompt at least once.

## Exercise 11 — Optional: Cloud Automation for a Connected Repository

:::important Prerequisites
Cloud automations require: a private or internal GitHub repository (not a plain local folder), write access to that repository, the Copilot cloud agent enabled for it, and your organization allowing cloud agent automations. If any of these aren't in place, stay with the local automation from Exercise 10 — it covers the same core skill.
:::

If your project is a connected repository that meets the prerequisites above, you can let the same kind of automation run in the cloud instead of on your machine:

1. Open your automation (or create a new one) and enable **Run in the cloud**.
2. Choose only the tools the task actually needs, following least privilege — for a status report, read access is usually enough; avoid granting write or pull-request tools unless the automation needs to create something.
3. Save and run it once to confirm the result.

:::warning Know what you're turning on
A cloud automation keeps running even when your computer is off, and each run consumes **Actions minutes** and **AI credits** billed to you or your organization. Session logs are visible to other collaborators with access to the repository. Review these costs and visibility implications with your team before enabling cloud automations broadly.
:::

### ✅ Checkpoint (optional)

If you completed this exercise, you have a cloud-run version of your weekly status automation. If you skipped it, your local automation from Exercise 10 already satisfies the core lab.

## Exercise 12 — Safety, Approvals, and Session Management

A few habits keep multi-session, multi-artifact work under control:

- **Review before you approve.** In Plan mode, read the proposed plan before approving it — this is your main safety checkpoint before an agent starts making changes.
- **Scope automations narrowly.** Grant only the tools an automation needs, especially for cloud automations that can run unattended.
- **Use Manage sessions.** Search, filter, and archive sessions and chats you're done with, so your sidebar stays readable as a project grows.
- **Archive, don't delete, when in doubt.** Archiving a chat or session keeps its history available if you need to reference it later.
- **Understand what is shared.** A project-scoped canvas can be committed with the repository. An automation is private to its creator, but cloud automation sessions and logs are visible to collaborators who can access the repository.

### ✅ Final Checkpoint

You've run an entire product launch-readiness workflow as a project manager — scattered team updates to a readiness brief, coordinated plan, decision artifacts, dashboard, GitHub-aware follow-up, and recurring executive status automation — without writing code.

---

## Quick Reference

### Sidebar Areas

| Area | What it's for |
|------|----------------|
| Sessions | Persistent agent workspaces; choose local, working-tree, or cloud execution |
| Chats | Conversation-only, no dedicated workspace |
| My work / Needs Your Attention | Account-wide issues and pull requests that may need your attention |
| Automations | Saved recurring or on-demand agent tasks |
| Customize | Skills, MCP servers, plugins, custom agents, canvases |

### Session Modes

| Mode | Autonomy |
|------|----------|
| Interactive | Agent proposes, waits for your input at each step |
| Plan | Agent proposes a full plan first; you approve before it runs |
| Autopilot | Agent works fully on its own until done |

### Model Selection

| Task size | Model |
|-----------|-------|
| Routine, focused task | Auto |
| Complex plan, canvas, or multi-artifact task | Claude Opus (latest available) or GPT-5.6 Sol |

### Canvas Scopes

| Scope | Location | Visibility |
|-------|----------|------------|
| Project | `.github/extensions` | Shared with your team, saved in the project |
| User | `~/.copilot/extensions` | Personal, this machine only |

### Automation Triggers

| Trigger | Runs when |
|---------|-----------|
| Manual | You start it yourself |
| Hourly / Daily / Weekly | On a schedule you choose |
| CRON (local only) | A custom schedule expression |
| Issue / Pull request (cloud only) | A matching repository event occurs |

### Useful Prompts

| Goal | Prompt starter |
|------|-----------------|
| Turn updates into a readiness brief | "Turn these team updates into a one-page launch-readiness brief with..." |
| Build a readiness dashboard | `/create-canvas Create a launch-readiness dashboard for...` |
| Parallelize work | `/fleet Review these materials and produce ... in parallel` |
| Recurring report | "Review [files] and write a short weekly status update..." |

## Related Resources

- [About the GitHub Copilot app](https://docs.github.com/en/copilot/concepts/agents/github-copilot-app)
- [Getting started with the GitHub Copilot app](https://docs.github.com/en/copilot/how-tos/github-copilot-app/getting-started)
- [Working with agent sessions in the GitHub Copilot app](https://docs.github.com/en/copilot/how-tos/github-copilot-app/agent-sessions)
- [Working with canvas extensions in the GitHub Copilot app](https://docs.github.com/en/copilot/how-tos/github-copilot-app/working-with-canvas-extensions)
- [Managing issues and pull requests with the GitHub Copilot app](https://docs.github.com/en/copilot/how-tos/github-copilot-app/managing-issues-and-pull-requests)
- [Using automations in the GitHub Copilot app](https://docs.github.com/en/copilot/how-tos/github-copilot-app/using-automations)
- [Customizing the GitHub Copilot app](https://docs.github.com/en/copilot/how-tos/github-copilot-app/customize-github-copilot-app)
