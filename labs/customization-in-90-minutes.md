---
title: "Lab: Customization in 90 Minutes"
description: Build an SDLC multi-agent framework with skills, custom agents, orchestration, model optimization, and plugin packaging — all in 90 minutes.
sidebar_position: 3
---

# Lab: Customization in 90 Minutes

> **Duration:** ~90 minutes | **Level:** Intermediate | **Prerequisites:** [GitHub Copilot subscription](https://github.com/features/copilot/plans) with Copilot CLI or VS Code, .NET 8, Node 24, and a copy of the [dotnet-react-starter-demo repo](https://github.com/copilot-academy/dotnet-react-starter-demo) for testing

## Objective

In this lab you will build **DevFlow** — a multi-agent framework for the software development lifecycle. DevFlow covers plan → code → test → review → ship using custom skills, specialized agents, and a lightweight orchestrator.

Along the way you'll discover and install community skills, use the **skill-creator** meta-skill to build your own, construct custom agents, choose the right model per task, compare token costs across customization approaches (including MCP servers), and package everything as a shareable plugin.

:::note Copilot Customization is evolving fast
Features and commands change frequently. Check the [official docs](https://docs.github.com/copilot/concepts/agents/copilot-cli/comparing-cli-features) if something looks different from what you see here.
:::

## Prerequisites

Create a copy of the [dotnet-react-starter-demo repo](https://github.com/copilot-academy/dotnet-react-starter-demo) for testing. This is a template that you can copy and then clone locally for use in this lab.

Clone that repo and open in the terminal or in VS Code.  

You will also need Node 24 and .NET 8 installed locally to run the skill scripts and tests that will be generated in this lab.

* Install .NET 8
```bash
brew install dotnet@8

# Temporarily set environment variables to use dotnet 8 for this session
export DOTNET_ROOT="/opt/homebrew/opt/dotnet@8/libexec"
export PATH="/opt/homebrew/opt/dotnet@8/bin:$PATH"

# Also make it permanent (optional but recommended)
echo 'export DOTNET_ROOT="/opt/homebrew/opt/dotnet@8/libexec"' >> ~/.zshrc
echo 'export PATH="/opt/homebrew/opt/dotnet@8/bin:$PATH"' >> ~/.zshrc
```

* Install Node 24 via NVM
```bash
# Get the latest version of NVM at https://github.com/nvm-sh/nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.4/install.sh | bash

nvm install 24
nvm use 24
```

* In one terminal, build and run the backend
```bash
cd backend
dotnet restore
dotnet build
ASPNETCORE_ENVIRONMENT=Development dotnet run --project src/Api
```

* In another terminal, run the frontend
```bash 
cd frontend
npm install
npm run dev
```

* Navigate to both http://localhost:5000 (API) and http://localhost:5173 (UI) to verify both are running

## What You'll Build

```
                         ┌───────────────────────┐
                         │     @dev-flow         │
                         │  Main Orchestrator    │
                         │  (coordinates SDLC    │
                         │   pipeline stages)    │
                         └───────────┬───────────┘
                                     │
         ┌──────────────────────┬────┴────┬──────────────────────┐
         │                      │         │                      │
  ┌──────▼───────┐     ┌───────▼───────┐  │               ┌──────▼───────┐
  │ @planner     │     │  (you, the    │  │               │ @reviewer    │
  │ Agent        │     │   developer)  │  │               │ Agent        │
  │              │     │               │  │               │              │
  │ Skills:      │     │               │  │               │ Skills:      │
  │ /breakdown   │     │               │  │               │ /code-review │
  └──────────────┘     └───────────────┘  │               └──────────────┘
                                          │
                                   ┌──────▼───────┐
                                   │ @tester      │
                                   │ Agent        │
                                   │              │
                                   │ Skills:      │
                                   │ /test-gen    │
                                   └──────────────┘

  Community skills (installed via gh skill):
    /documentation-writer   /naming-checker (custom)   /task-breakdown (custom)
```

By the end of the 90 minutes you will have:

- ✅ **Community skills** — discovered, previewed, and installed `documentation-writer` via `gh skill` CLI
- ✅ **2 custom skills** — built with the skill-creator (`task-breakdown`, `naming-checker`)
- ✅ **3 custom agents** — specialized personas (`planner`, `tester`, `reviewer`)
- ✅ **1 orchestrator** — a `dev-flow` agent that coordinates the others
- ✅ **Per-agent model selection** — right-sized models for each task type
- ✅ **A shareable plugin** — `plugin.json` packaging for your team or organization

## Part 1: Why Customize?

Before building anything, let's understand *why* teams invest in customization. These are the top challenges enterprises report:

| Challenge | Symptom | Customization Solution |
|-----------|---------|----------------------|
| **Generic responses** | Copilot ignores your frameworks and coding standards | Custom Instructions |
| **Repetitive prompting** | Developers retype the same context every session | Prompt Files |
| **Inconsistent quality** | Different team members get different results | Skills with standardized workflows |
| **Context window waste** | Large instruction files loaded for every task | Skills (on-demand) vs Instructions (always-on) |
| **No institutional knowledge** | Copilot doesn't know your team conventions | Custom Agents encoding expertise |
| **Tool sprawl** | Context-switching between Copilot and external tools | MCP Servers bringing tools into Copilot |
| **No automation** | Manual, repetitive repository maintenance | Agentic Workflows in GitHub Actions |
| **Can't share customizations** | Each developer reinvents the wheel | Plugins or APM for packaging and distribution |
| **Cost/performance concerns** | Using premium models for simple tasks | Per-agent model selection + Auto mode |

### 1.1 The Customization Landscape

Here's your map of every customization option and when to use each:

| Feature | Purpose | When Loaded | Location | Token Impact |
|---------|---------|-------------|----------|--------------|
| **Instructions** | Always-on project context | Every request (automatic) | `.github/copilot-instructions.md` | ⚠️ Always loaded — keep concise |
| **Prompt Files** | Reusable task templates | On-demand via `/command` | `.github/prompts/*.prompt.md` | ✅ Only when invoked |
| **Skills** | Specialized task capabilities | Auto-detected or `/skill` | `.github/skills/*/SKILL.md` | ✅ Only when relevant |
| **Custom Agents** | Named personas with tool control | Selected or inferred | `.github/agents/*.agent.md` | ✅ Separate context window |
| **MCP Servers** | External system integration | Tools invoked during tasks | `.vscode/mcp.json` | ⚠️ Tool results consume tokens |
| **Hooks** | Lifecycle event scripts | Triggered by events | `.github/hooks/*.json` | ✅ Zero LLM tokens |
| **Plugins** | Packaged bundles | Installed by user | `plugin.json` + components | Same as constituent parts |
| **Agent Package MAnager (APM)** | Standardized packaging and distribution | Installed by user | `apm.yaml` + components | Same as constituent parts |
| **Agentic Workflows** | Automated repo operations | GitHub Actions triggers | `.github/workflows/` | ✅ Separate agent session |

### 1.2 Token Optimization Mental Model

Not everything should be a custom instruction. Understanding *where* tokens are consumed is the key to efficient customization:

```
Token Impact by Customization Type
──────────────────────────────────────────────────────────────

  Hooks            │████                     Zero LLM tokens
                   │                         (shell scripts only)
                   │
  Skills           │████████                 On-demand — loaded
                   │                         only when relevant
                   │
  Custom Agents    │████████████             Separate context window
                   │                         (subagent isolation)
                   │
  MCP Servers      │████████████████         Tool results injected
                   │                         into context (variable size)
                   │
  Instructions     │████████████████████     ALWAYS loaded — every
                   │                         single request
──────────────────────────────────────────────────────────────
                   Low ◄──────────► High  (context window cost)
```

### What a System Prompt Actually Looks Like

Every request to Copilot assembles a system prompt from layers.  Below is an example of the number of tokens each layer can consume. The base system prompt and tool definitions are fixed costs. Instructions, agent definitions, and skills are variable based on your customizations. Conversation history and editor context grow as you work:

```
System Prompt Anatomy (assembled fresh on every request)
═══════════════════════════════════════════════════════════════════════

  ┌──────────────────────────────────────────────────────────────┐
  │ 1. BASE SYSTEM PROMPT                          [always]      │
  │    Copilot's built-in behavior, safety rules,                │
  │    tool-use instructions                      ~500 tokens    │
  ├──────────────────────────────────────────────────────────────┤
  │ 2. TOOL DEFINITIONS                            [always]      │
  │    Built-in tools (read, search, edit…)                      │
  │    + MCP server tools if configured                          │
  │    → 10 tools  ≈  500–1,000 tokens            variable       │
  │    → 100+ tools ≈ 5,000–10,000+ tokens ⚠️                    │
  ├──────────────────────────────────────────────────────────────┤
  │ 3. INSTRUCTIONS FILE                           [always]      │
  │    .github/copilot-instructions.md                           │
  │    Loaded on every single request             ~300–2,000     │
  ├──────────────────────────────────────────────────────────────┤
  │ 4. AGENT DEFINITION                    [if agent is active]  │
  │    .github/agents/my-agent.agent.md                          │
  │    Loaded when agent is selected or invoked   ~200–500       │
  ├──────────────────────────────────────────────────────────────┤
  │ 5. SKILL FRONTMATTER              [always — enables matching]│
  │    name + description for every skill in scope               │
  │    Copilot reads these to decide what to trigger  ~100/skill │
  │                                                              │
  │    SKILL BODY                          [only when triggered] │
  │    Full SKILL.md instructions + bundled scripts              │
  │    Loaded only when description matches the prompt ~400–600  │
  ├──────────────────────────────────────────────────────────────┤
  │ 6. CONVERSATION HISTORY                        [always]      │
  │    Prior messages in this session                            │
  │    Grows until /compact or auto-compaction    variable       │
  ├──────────────────────────────────────────────────────────────┤
  │ 7. EDITOR CONTEXT                              [always]      │
  │    Current file, selection, open tabs         ~200–2,000     │
  ├──────────────────────────────────────────────────────────────┤
  │ 8. YOUR MESSAGE                                [always]      │
  │    The actual prompt you typed                variable       │
  └──────────────────────────────────────────────────────────────┘

  Layers 1–3 are the fixed tax on every request.
  Layers 4–5 are opt-in and only appear when relevant.
  Layers 6–7 grow as you work and are the main source of bloat.
```

Layers 1–3 are why a bloated instructions file hurts — you're paying for it on *every* request. Skills (layer 5) are surgical: minimal cost when not triggered.

:::tip The Rule of Thumb
| If it applies to... | Use this | Why |
|---------------------|----------|-----|
| **Every task** | Instruction | Always-on context (but keep it lean) |
| **A type of task** | Skill | Loaded on-demand, minimal cost when not needed |
| **Who Copilot "is"** | Agent | Can get its own context window as a subagent (isolation) |
| **External data/systems** | MCP Server | Brings APIs/databases into Copilot — but results consume tokens |
| **Automation without a human** | Agentic Workflow | Runs in a separate agent session |
:::

### 1.3 Choosing the Right Model

Different tasks have different complexity. Using premium models for simple tasks wastes premium requests:

| Task Complexity | Recommended Model | Premium Multiplier | Example Tasks |
|----------------|-------------------|-------------------|---------------|
| **Simple** | Haiku / GPT-5.4 mini | 0.33x | Scaffolding, test generation, formatting |
| **Balanced** | Sonnet / GPT-5.4 | 1x | Code review, refactoring, documentation |
| **Complex** | Opus / GPT-5.5 | 3x - 7.5x | Architecture, orchestration, multi-step reasoning |
| **Let Copilot decide** | Auto | Varies (10% discount) | When complexity is unpredictable |

You'll apply this throughout the lab — each agent you build will specify the right model for its job.

## Part 2: Discover & Reuse Community Skills

Before building skills from scratch, **always check what already exists**. The GitHub CLI includes `gh skill` commands for discovering and installing skills from across the community — and there are 200+ pre-built skills ready to use.

:::important
Don't see `gh skill`?  This was announced in [this blog post](https://github.blog/changelog/2026-04-16-manage-agent-skills-with-github-cli/) on April 16 2026.  Update your CLI to version 2.90.0 or greater. 
:::

### 2.1 Search for Existing Skills

```bash
# Search for skills related to your use case - Don't install yet!
gh skill search "task breakdown"

# Try other topics
gh skill search "code review"
gh skill search "naming conventions"
```

The search covers published skills from GitHub's community repositories and any repo with the `agent-skills` topic.

### 2.2 Preview Before Installing

This renders the SKILL.md content in your terminal without installing anything. Run interactively (without specifying a skill name) to browse available skills:

```bash
# See a skill's full content without installing it
gh skill preview github/awesome-copilot documentation-writer
```

Note you can do this interactively with `gh skill preview github/awesome-copilot`.

### 2.3 Install a Community Skill

Install the `documentation-writer` skill to your project. We will use this skill in the upcoming exercises.

```bash
# Install directly
gh skill install github/awesome-copilot documentation-writer
```
This can also be done interactively with `gh skill install github/awesome-copilot`

During installation, you'll choose:
- **Agent host**: Copilot, Claude Code, Cursor, or 30+ other agents
- **Scope**: Project-level (`.github/skills/`) or user-level (`~/.copilot/skills/`)

:::tip Always Search First
The [awesome-copilot](https://github.com/github/awesome-copilot) repository contains **200+ community skills** covering code review, testing, documentation, cloud providers, security, and more. Browse the full gallery at [awesome-copilot.github.com/skills/](https://awesome-copilot.github.com/skills/). It's always more efficient to use — or adapt — an existing skill than to write one from scratch.
:::

### 2.4 Manage Installed Skills

```bash
# Update all installed skills to latest versions
gh skill update --all

# Update a specific skill
gh skill update github/awesome-copilot documentation-writer

# Publish your own skill to your repo (validates against the Agent Skills spec)
gh skill publish --dry-run
```

## Part 3: Building Skills with the Skill Creator

When no existing skill fits your needs, you don't have to write one manually line by line. Anthropic publishes a meta-skill called **skill-creator** — a skill that teaches your AI agent how to build other skills, with best practices baked in.

### 3.1 Install the Skill Creator

```bash
# Option A: Via gh skill (recommended)
gh skill install anthropics/skills skill-creator

# Option B: Manual copy
git clone https://github.com/anthropics/skills.git /tmp/anthropic-skills
cp -r /tmp/anthropic-skills/skills/skill-creator .github/skills/skill-creator
```

Verify it loaded.  In the CLI you can just use `/skills`.  Alternatively prompt to get an answer:

```
What skills do you have?
```

You should see `skill-creator` in the list.

### 3.2 Create Your First Skill: Task Breakdown

Use the skill-creator to build a task decomposition skill. Prompt in CLI or VSCode Chat with the following:

```
Create a new skill called "task-breakdown" that breaks down feature requests and user stories into implementable sub-tasks with T-shirt size estimates.

It should trigger when I ask to "break down", "decompose", or "plan implementation" for a feature.

The output should be a structured table with: task title, component, T-shirt size (XS through XL), dependencies, and acceptance criteria. Include a risk assessment step for tasks touching shared code paths or requiring database migrations.
```

The skill-creator may engage you in a conversation, but will likely plan and then create your skill. This includes the SKILL.md frontmatter and body as well as scripts and tests. Feel free to run the tests to evaluate the skill and ensure it is functioning. If it hasn't prompted you do do this, just move on.  

After the skill-creator generates your skill, open `.agents/skills/task-breakdown/SKILL.md` and review what was created

| Part | Purpose | What to Look For |
|------|---------|-----------------|
| **YAML frontmatter** | Metadata: `name`, `description` | The `description` controls auto-activation.  It's the "trigger" |
| **Markdown body** | Instructions Copilot follows when skill activates | Step-by-step process, output format template |

The key principle from the skill-creator is that the **"Description is the trigger."** All information about "when to use" the skill belongs in the `description` frontmatter, not the body. The body only loads *after* triggering. The frontmatter is loaded in the system prompt and used by Copilot to decide when to activate the skill. This is how skills stay lightweight and only load when relevant.

### 3.4 Test the Task Breakdown Skill

```
Break down this feature: "Add user authentication with JWT tokens, including login, logout, and token refresh endpoints"
```

Copilot should automatically activate your `task-breakdown` skill and produce structured output following the template. Here we've used an example feature that we've manually typed, but this same skill could be used to take work items from GitHub Issues, Jira, Azure Boards, or other work tracking solutions.

:::info Token Optimization in Action
A skill has two parts: the **frontmatter** (`name` + `description`, ~100 tokens) which loads in the system prompt on *every* request so Copilot knows the skill exists, and the **body** (~400 tokens) which loads *only* when the description matches your prompt. Compare that to `copilot-instructions.md`, where all content load on every request." That's the core of token optimization: **put detailed guidance in skills, not instructions**. This pattern is called *progressive disclosure*.
:::

### 3.5 Create a Skill with Scripts: Naming Checker

Skills aren't just instructions. They can include **executable scripts** that Copilot runs as capabilities. This can give a level of determinism to your skills. Use the skill-creator again:

```
Create a new skill called "naming-checker" that validates file and variable naming conventions against project standards. It should:

- Include a bash script that scans for camelCase files that should be kebab-case (excluding .agent.md and .test. files)
- Pre-approve the shell tool (use allowed-tools: shell in the frontmatter)
- Check naming conventions for files, variables, constants, and types
- Output findings as a table with severity and suggested fixes
```

The skill-creator will generate:
1. `SKILL.md` with `allowed-tools: shell` in the frontmatter
2. `scripts/check-names.sh` (or similar) with automated checking logic

Feel free to run the tests again if prompted. 

### 3.6 Review: Skills as Capabilities

After generation, examine what was created:

```bash
find .agents/skills/naming-checker -type f
```

You should see a structure like:

```
.agents/skills/naming-checker/
├── SKILL.md              # Instructions + allowed-tools: shell
└── scripts/
    └── check-names.sh    # Executable validation script
```

The `allowed-tools: shell` frontmatter pre-approves terminal access so Copilot can run the script without asking permission each time. This is a typical pattern where instructions  are combined with executable scripts that allow the skill to take actions.

### 3.7 Test the Naming Checker

Prompt to test your naming checker.

```
Check naming conventions in the frontend/src directory
```

Review the results. You can skip making changes at this time... 

:::tip Skill Creator Best Practices
The skill-creator follows key principles as follows:
- **Concise is key:** Challenge each piece: "Does this justify its token cost?"
- **Description is the trigger:** All "when to use" info goes in the frontmatter description, not the body
- **Test scripts by running them:** Never ship untested code in a skill
- **Delete what you don't need:** Extra template files add clutter and waste tokens
- **Progressive disclosure:** Metadata (~100 tokens) always in context; SKILL.md body loads on trigger; bundled resources load as needed
:::

## Part 4: Your First Agent

Custom agents are **named personas** with their own tool access, model selection, and their own **context window** when run as subagents. When Copilot delegates to a custom agent, it allows the ability to spins up a subagent with a fresh context. This is a major token optimization: the agent's context isn't polluted with your earlier conversation. It could also be a drawback if the agent needs all the context of the main session. This is why it's important to design your agent's instructions and tools around the fact that it gets a clean slate.

### 4.1 Create the Agent

```bash
mkdir -p .github/agents
```

Create `.github/agents/reviewer.agent.md`:

```markdown
---
name: "Code Reviewer"
description: "Review code changes for bugs, security issues, and standards compliance. Use when asked to review code, check a PR, or audit changes."
tools: [read, search, agent]
model: Claude Sonnet 4.6 (copilot)
---

You are a senior code reviewer. Your job is to review code changes 
thoroughly but efficiently, focusing on what matters most.

## Review Priority (in order)

1. **🔴 Bugs** — Logic errors, null pointer risks, race conditions,
   off-by-one errors
2. **🟠 Security** — SQL injection, XSS, credential exposure,
   insecure deserialization
3. **🟡 Performance** — N+1 queries, unnecessary re-renders,
   missing indexes, memory leaks
4. **🔵 Maintainability** — Code duplication, unclear naming,
   missing error handling

## What You Do NOT Review
- Formatting and style (leave that to linters)
- Import ordering
- Comment style preferences

## Review Process
1. Read the changed files to understand the diff
2. Search for related code to understand impact
3. Check for the priority items above
4. Present findings in a structured table

## Output Format

### Review Summary
| Category | Findings | Severity |
|----------|----------|----------|
| Bugs | [count] | 🔴 |
| Security | [count] | 🟠 |
| Performance | [count] | 🟡 |
| Maintainability | [count] | 🔵 |

### Detailed Findings
For each finding:
- **File**: path/to/file.ts:line
- **Severity**: 🔴/🟠/🟡/🔵
- **Issue**: What's wrong
- **Fix**: Recommended change
```

:::note Creating an Agent with AI
A skill doesn't currently exist for creating custom agents, but that would be a good use case. As an alternative you can just prompt to create a skill. VS Code has the `/create-agent` command which may assist.
:::

### 4.2 Understand the Agent Anatomy

| Frontmatter Field | Purpose | Your Choice |
|-------------------|---------|-------------|
| `name` | Display name and `@mention` trigger | `"Code Reviewer"` |
| `description` | When Copilot auto-selects this agent | Review-related triggers |
| `tools` | Permitted tools (restricts what the agent can do) | `read`, `search`, `agent` only. No `edit` |
| `model` | Which LLM to use for this agent | `Claude Sonnet 4.6` |
| `handoffs` | Orchestrating multi-agent workflows | None in this reviewer agent |

### 4.3 Model Selection

Why Sonnet for Code Review? This is **model selection optimization** in action. You set the `model` field per agent based on task complexity:

```
                          ┌────────────────────────────────────────┐
  Task Complexity         │            Model Selection             │
  ────────────────        │                                        │
                          │  ┌────────┐                            │
  Simple tasks ──────────►│  │ Haiku  │ 0.33x multiplier           │
  (scaffolding, tests)    │  └────────┘                            │
                          │  ┌────────┐                            │
  Balanced tasks ────────►│  │ Sonnet │ 1x multiplier     ◄── YOU  │
  (review, refactoring)   │  └────────┘                       ARE  │
                          │  ┌────────┐                       HERE │
  Complex tasks ─────────►│  │  Opus  │ 3x or 7.5x multiplier      │
  (architecture, orchestr)│  └────────┘                            │
                          │  ┌────────┐                            │
  Unknown complexity ────►│  │  Auto  │ Varies (10% discount)      │
                          │  └────────┘                            │
                          └────────────────────────────────────────┘
```

Code review is a **balanced task**. It requires understanding code context and identifying patterns, but doesn't need the deep multi-step reasoning of architectural planning. Sonnet provides high quality at lower cost than Opus.

:::info Auto Model Selection = 10% Discount
Setting `model: auto` lets Copilot choose the best available model based on system health and task characteristics. Auto selection gets a **10% multiplier discount** on your premium request usage.  That is a free optimization just for trusting the system to pick.
:::

### 4.4 Subagent Context Isolation

When you invoke this agent (or Copilot auto-selects it), it runs as a **subagent** with its own context window:

```
┌─────────────────────────────────────────────┐
│  Your Main Session                          │
│                                             │
│  "I've been working on the auth module      │
│   for the past 30 minutes..."               │
│                                             │
│  Context: 60% full with conversation        │
│                                             │
│  ┌───────────────────────────────────┐      │
│  │  Code Reviewer (Subagent)         │      │
│  │                                   │      │
│  │  Fresh context window!            │      │
│  │  Only review-relevant info        │      │
│  │  Not polluted by earlier work     │      │
│  │                                   │      │
│  │  Context: 5% used                 │      │
│  └───────────────────────────────────┘      │
└─────────────────────────────────────────────┘
```

This is a fundamental token optimization: **subagents don't inherit your conversation history**. They get a clean slate focused on their specific task.

### 4.5 Test the Agent

In the CLI, use `/agent` and select your `Code Reviewer` agent. In VS Code you can select the agent from the dropdown. 

Prompt as follows: 

```
Review the most recently changed files in this repository
```

Note a better prompt might be to review staged commits or something like that.  However, since you just cloned the repo you should have a number of 'recently changed files' to review without needing to stage anything.

## Part 5: Multi-Agent Orchestration

Now you'll wire multiple agents together with an **orchestrator** — a main agent that delegates to specialized sub-agents at each SDLC stage. 

### 5.1 Create the Planner Agent

Create `.github/agents/planner.agent.md`:

```markdown
---
name: "Planner"
description: "Break down features and issues into implementation plans. Use when asked to plan, decompose, or create tasks for a feature."
tools: [read, search, agent, todo]
model: auto
---

You are a technical planning specialist. You create clear, actionable 
implementation plans from feature requests and issues.

## Your Process
1. Analyze the request to understand scope and requirements
2. Search the codebase to understand current architecture
3. Use the /task-breakdown skill for structured decomposition
4. Create a prioritized plan with dependencies

## Constraints
- Each task should be completable in under 1 day
- Always identify risks and unknowns
- Include testing tasks alongside implementation tasks
- Flag tasks that need external input or decisions
```

Notice `model: auto` — planning complexity varies widely, so let Copilot choose the right model and get the 10% discount.

:::tip Customize the built-in planning agent 
Do you want to see Copilot's planning agent?  In VSCode, go to the agents selector and click `Configure Custom Agents`.  Click `Plan` and it will open the markdown of the planning agent!
:::

### 5.2 Create the Tester Agent

Create `.github/agents/tester.agent.md`:

```markdown
---
name: "Tester"
description: "Generate and improve tests. Use when asked to write tests, improve coverage, or validate test quality."
tools: [read, search, edit, execute]
model: claude-haiku-4.5
---

You are a testing specialist focused on writing effective, 
maintainable tests.

## Approach
1. Read the source code to understand what needs testing
2. Identify untested paths, edge cases, and error conditions
3. Write tests following the project's existing test patterns
4. Run tests to verify they pass

## Constraints
- Match the project's existing test framework and patterns
- Write descriptive test names that explain the scenario
- Include both happy path and error case tests
- Never modify production code unless specifically asked
```

Notice `model: claude-haiku-4.5` — test generation is a focused, well-defined task. Haiku handles it efficiently at **0.33x** the premium multiplier cost.

### 5.3 Create the DevFlow Orchestrator

This is the centerpiece. Create `.github/agents/dev-flow.agent.md`:

```markdown
---
name: "DevFlow"
description: "SDLC orchestration agent. Coordinates planning, coding, testing, and review through specialized sub-agents. Use for end-to-end feature development, when asked to 'build a feature', or when multiple development phases are needed."
tools: [read, search, edit, execute, agent, todo, web]
agents: ["Planner", "Code Reviewer", "Tester"]
model: auto
argument-hint: "Describe the feature or task to work on"
---

You are **DevFlow**, an SDLC orchestration agent. You coordinate 
end-to-end software development by delegating to specialized 
sub-agents at each stage.

## Available Sub-Agents

| Agent | Role | Model | When to Delegate |
|-------|------|-------|-----------------|
| **Planner** | Break down features into tasks | Auto | Start of any new feature |
| **Code Reviewer** | Review changes for quality | Sonnet | After implementation |
| **Tester** | Generate and validate tests | Haiku | After implementation |

## Available Skills

| Skill | Purpose | Source |
|-------|---------|--------|
| `/task-breakdown` | Structured task decomposition | Built with skill-creator |
| `/naming-checker` | Naming convention validation | Built with skill-creator |
| `/documentation-writer` | Generate project documentation | Installed from community |

## Workflow Stages

### Stage 1: Planning
**Delegate to:** Planner agent
- Understand the feature request
- Decompose into implementable tasks
- Identify risks and dependencies
- Present plan for user confirmation

**Checkpoint:** ✋ Wait for user approval before proceeding.

### Stage 2: Implementation
- Work through planned tasks in dependency order
- Follow project conventions
- Use /naming-checker to validate naming
- Commit progress incrementally

### Stage 3: Testing
**Delegate to:** Tester agent
- Generate tests for new code
- Run existing tests for regressions
- Report coverage metrics

### Stage 4: Review
**Delegate to:** Code Reviewer agent
- Review all changes for bugs, security, performance
- Present findings
- Apply fixes for critical issues

### Stage 5: Ship Preparation
- Use /documentation-writer to generate or update docs for the changes
- Use /naming-checker to validate naming conventions one final time
- Generate a summary of all changes
- Present final summary to user

## Orchestration Rules
1. **Never skip stages** — each stage adds value
2. **Always checkpoint** — ask user before moving between stages
3. **Delegate, don't do** — use sub-agents for specialized work
4. **Summarize handoffs** — pass summaries between agents, not raw content
5. **Fail fast** — if a stage fails, present options to the user
```

### 5.4 Understand the Key Patterns

**The `agents:` array** — This declares which sub-agents DevFlow can invoke. Copilot enforces this boundary: the orchestrator can only delegate to named agents.

**Stage gates** — The `✋ Wait for user approval` checkpoints ensure you stay in control. The orchestrator won't automatically proceed from planning to coding without your confirmation.

**Model strategy across agents:**

| Agent | Model | Why |
|-------|-------|-----|
| `dev-flow` | `auto` | Orchestration complexity varies; 10% discount |
| `planner` | `auto` | Planning complexity varies; 10% discount |
| `reviewer` | `Claude Sonnet 4.6` | Balanced task, consistent quality needed |
| `tester` | `claude-haiku-4.5` | Focused task, speed matters, 0.33x cost |

### 5.5 Test the Orchestrator

As we did previously, in the CLI, use `/agent` and select your `DevFlow` agent. In VS Code you can select the agent from the dropdown. 

```
Build a user preferences feature that lets users save their display theme (light/dark) and notification settings
```

Watch how DevFlow delegates to the Planner for task breakdown, then pauses for your approval before proceeding. You can prompt with `proceed with implementation` or similar to move to the next stage, at which it will run in parallel where possible. Note it will invoke skills such as the naming-checker as it executes. When complete it will ask to invoke the testing and code review stages. 

:::important Reviewing background tasks 
The testing and code review agents are run as background tasks. You can use `/tasks` to review their progress. 
:::

Once complete, you will need to restart the backend to load the updates: 

```bash
ASPNETCORE_ENVIRONMENT=Development dotnet run --project src/Api
```

You should now be able to migrate to preferences and update your theme and notification settings.

:::tip The orchestrator→sub-agent→skill Pattern
DevFlow uses a main orchestrator with sub-agents for everyday development: plan, code, test, review, and ship. This is useful for any project with any tech stack.
:::

## Part 6: Token Optimization & Model Strategy

You've been building with token optimization in mind. Now let's make it concrete.

### 6.1 Check Your Context Usage

Run this in your Copilot session. This can be done even while the agents are running.

```
/context
```

You'll see a breakdown like:

```
Context window usage:
  System/Tools:  15%  ████░░░░░░░░░░░░░░░░
  Messages:      40%  ████████░░░░░░░░░░░░
  Free Space:    35%  ███████░░░░░░░░░░░░░
  Buffer:        10%  ██░░░░░░░░░░░░░░░░░░
```

When context approaches ~95% of the token limit, Copilot automatically **compacts** the conversation history in the background without interrupting your workflow. You can also manually compact at any time:

```
/compact
```

### 6.2 Token Impact: Instructions vs Skills vs Agents vs MCP

This is the key comparison. Each customization approach has a different impact on your context window.  Below is an example of potential token costs for a moderately detailed instructions file, a skill with a 500-token body, and an MCP server with 30 tools:

| Approach | Token Cost | When Loaded | Context Impact |
|----------|-----------|-------------|----------------|
| **Instructions** | ~2000 tokens | Every request | ⚠️ Always occupying context even for unrelated tasks |
| **Skills** | Frontmatter ~100 tokens/skill (always) + body ~400–500 tokens (triggered) | Frontmatter always; body only when relevant | ✅ Body cost only when activated, but frontmatter accumulates with skill count |
| **Custom Agents** | 0 in main context | Separate subagent window | ✅ Complete isolation — agents get their own context |
| **MCP Servers** | Variable (can be large) | When tools are called | ⚠️ Tool call results injected into context — can be substantial |

**What this means in practice:**

```
Scenario: You have 2000 tokens of coding guidelines

Option A: All in copilot-instructions.md
  → 2000 tokens consumed on EVERY request
  → Even "fix this typo" burns 2000 tokens of context
  → Caching helps reduce cost after the first request, but still a heavy load

Option B: 300 tokens in instructions + 1 skill (500 each)
  → 300 tokens base + ~500 per skill that activates
  → Best case: ~800 tokens if only 1 skill triggers (60% less than Option A)
  → Savings depend on how many skills trigger per average request
  
Option C: Same as B + agent delegation
  → ~300 tokens base in main context window
  → Agents run in separate context windows — main context stays lean
  → BUT: agents can't see your conversation history, so they re-read
    files and re-fetch context via tool calls — total cost across all
    windows may be higher than it appears
  → Best when tasks are self-contained and don't depend on prior conversation

Option D: MCP Server for external data
  → Tool definitions loaded when server is configured
  → Each tool call result adds to context (API responses, DB results)
  → Best for external data, but be aware of response sizes
```

### 6.3 MCP Servers: Powerful but Token-Aware

MCP (Model Context Protocol) servers bring external tools into Copilot — databases, APIs, issue trackers, monitoring systems. They're powerful but have a token footprint you should understand:

```
MCP Server Token Flow
─────────────────────

  1. Tool definitions loaded into context on every request
     → Each tool = name + description + parameter schema
     → A server with 10 tools: ~500–1000 tokens (fixed, always loaded)
     → A server with 100+ tools: ~5000–10000 tokens (always loaded!)
  2. Copilot decides to call a tool
  3. Tool executes externally (no token cost)
  4. Tool result returned → injected into context (variable cost!)

  Example: Jira MCP Server (assuming 30 exposed tools)
  ┌──────────────────────────────────────────────┐
  │ Tool definitions (30 tools × ~50 tokens ea.) │  ~1500 tokens (always)
  │ Tool call: jira.getIssue("PROJ-123")         │  ~20 tokens
  │ Tool result: { title, description, comments, │
  │   subtasks, labels, assignee, status... }    │  ~800 tokens
  └──────────────────────────────────────────────┘

  Optimization: Limit which tools are exposed (not all servers support
  this). Request only the fields you need — many MCP servers support
  field filtering to reduce response size.
```

:::tip When to Use MCP vs Other Options
- Need to **read/write external data** at task time → MCP Server
- Need to **enforce a process** → Skill (lower token cost, no external dependency)
- Consider a skill if the external system has a mature **CLI or API** as it may optimize context usage with progressive disclosure
- Need a **specialized persona** with external access → Agent + MCP Server (agent provides persona, MCP provides data)
:::

### 6.4 When to Use What: The Decision Matrix

| I need to... | Best Choice | Why Not the Others? |
|-------------|------------|-------------------|
| Set coding standards for the whole project | **Instructions** | Skills load/unload; agents are overkill for global rules; optimize by pointing to docs stored in repo |
| Define how to handle a specific task | **Skill** | Instructions would waste tokens on every request |
| Create a specialized AI persona | **Agent** | Skills don't change who Copilot "is"; instructions too broad |
| Connect to Jira, Slack, or a database | **MCP Server** | Other options can't access external systems, but consider skill + API/CLI |
| Run a script at session start/end | **Hook** | Other options require LLM invocation (hooks are free) |
| Use a specific model per task | **Agent `model` field** | Instructions and skills inherit the session model |

### 6.5 Model Strategy Recap

Your DevFlow framework demonstrates the model selection best practices:

| Principle | Implementation | Benefit |
|-----------|---------------|---------|
| **Match model to task complexity** | Haiku for tests, Sonnet for review, Opus for architecture | Avoid extra cost on simple tasks |
| **Use Auto when unsure** | Planner and orchestrator use `model: auto` | 10% discount + system-optimized selection |
| **Subagent model isolation** | Each agent specifies its own model | Different models in the same workflow |

Using agents allows to pre-set the model to ensure the right level of reasoning and capability for each stage of the SDLC, while also optimizing costs.

## Part 7: Share & Collaborate

You've built a powerful framework and now you want to share it with your team. There are a number of options to package and share content.  These include: 

* **Plugins** — Package agents and skills together for easy sharing and installation
* **Agent Package Manager (APM)** - A way to package agents and distribute
* **.github-private Organization Repo** - A way to push to all members of an organization

### 7.1 Plugins 

Agent plugins are packaged customizations that you can discover and install.  A single plugin can provide any combination of slash commands, agent skills, custom agents, hooks, and MCP servers. Multiple plugins can be added to a marketplace for broader distribution.

#### Step 1: Create a repo structure and manifests

* Create a new blank repo in GitHub called `plugin-marketplace`. This will host all of your customizations for sharing
* Create the following directory structure in the root of the repo to hold the agents and skills you want to share:

```bash
mkdir -p .github/plugin
mkdir -p plugins/dev-flow
#mkdir agents
#mkdir skills
```

:::tip Customization Locations
The customizations that we create can live in folders like agents and skills to be installed independently. In this example we will package them all in the plugin as it will be a single deployed unit. 
:::

* Copy the existing customizations we've created into your plugins folder. The end result should be the following structure.  Note the skills should have the additional content (not just top level directory).

```bash
plugins/dev-flow/agents/dev-flow.agent.md
plugins/dev-flow/agents/planner.agent.md
plugins/dev-flow/agents/reviewer.agent.md
plugins/dev-flow/agents/tester.agent.md
plugins/dev-flow/skills/documentation-writer
plugins/dev-flow/skills/naming-checker
plugins/dev-flow/skills/task-breakdown
```

:::note Public Content
The `documentation-writer` and `skill-creator` skills were pre-existing public skills. In this lab we will skip `skill-creator` as it is a dev dependency. I've decided to package `documentation-writer` in our own marketplace for maintenance and versioning. 
:::

* Next create a plugin README (`plugins/dev-flow/README.md`) that describes the plugin, its contents, and how to use it. This is important for discoverability and usability when sharing with others.


````markdown
# dev-flow

> SDLC orchestration framework for GitHub Copilot — coordinating planning, coding, testing, and review through specialized agents and skills.

## What's Included

### Agents

| Agent | File | Model | Purpose |
|-------|------|-------|---------|
| **DevFlow** | `agents/dev-flow.agent.md` | Auto | Orchestrator — coordinates the full SDLC pipeline |
| **Planner** | `agents/planner.agent.md` | Auto | Breaks features into implementable tasks |
| **Code Reviewer** | `agents/reviewer.agent.md` | Claude Sonnet 4.6 | Reviews code for bugs, security, and quality |
| **Tester** | `agents/tester.agent.md` | Claude Haiku 4.5 | Generates and validates tests |

### Skills

| Skill | Directory | Purpose |
|-------|-----------|---------|
| **task-breakdown** | `skills/task-breakdown/` | Decomposes feature requests into T-shirt sized tasks with acceptance criteria |
| **naming-checker** | `skills/naming-checker/` | Validates file and variable naming conventions with automated scanning |
| **documentation-writer** | `skills/documentation-writer/` | Generates project documentation (from [github/awesome-copilot](https://github.com/github/awesome-copilot)) |

## Installation

```bash
# Install via plugin
/plugin install dev-flow@plugin-marketplace
```

## Usage

### Run the full SDLC pipeline

Select the **DevFlow** agent from the agent picker, then describe your feature:

```
Build a user authentication feature with login, logout, and JWT token refresh
```

DevFlow will guide you through each stage — planning, implementation, testing, and review — pausing for your approval before advancing.

### Use individual agents

| Goal | How |
|------|-----|
| Plan a feature | Select **Planner** agent → describe the feature |
| Review code changes | Select **Code Reviewer** agent → ask it to review recent changes |
| Generate tests | Select **Tester** agent → ask it to write tests for a file or module |

### Use individual skills

Skills activate automatically when your prompt matches, or invoke explicitly:

```
Break down this feature: "Add notification preferences to user settings"
Check naming conventions in the src directory
Write documentation for the authentication module
```

## Model Strategy

Each agent is right-sized for its task:

| Agent | Model | Rationale |
|-------|-------|-----------|
| DevFlow | Auto (10% discount) | Orchestration complexity varies |
| Planner | Auto (10% discount) | Planning complexity varies |
| Code Reviewer | Claude Sonnet 4.6 | Balanced task — quality matters |
| Tester | Claude Haiku 4.5 | Focused task — speed and cost efficiency (0.33x) |

## License

MIT
````

* (Optional) Create a LICENSE.md file to specify the license for your plugin. This is important for open source sharing and clarifies how others can use and contribute to your plugin.
* Now create the plugin manifest

The plugin manifest is a `plugin.json` file that describes the plugin. Create `plugins/dev-flow/plugin.json` in the root directory of the plugin as shown below (updating your repo name): 

Create `plugin.json` in that directory with the following content (updating your repo name):

```json
{
  "name": "dev-flow",
  "description": "SDLC orchestration framework — planning, coding, testing, and review with specialized agents and skills",
  "version": "1.0.0",
  "author": {
    "name": "Your Name"
  },
  "repository": "https://github.com/your-org/plugin-marketplace",
  "license": "MIT",
  "keywords": ["sdlc", "planning", "testing", "code-review"],
  "agents": [ 
    "./agents" 
  ],
  "skills": [ 
    "./skills/documentation-writer",
    "./skills/naming-checker",
    "./skills/task-breakdown"
  ]
}
```

* Finally create the plugin marketplace metadata file. 

```bash
# Create this at the root of the repository
mkdir -p .github/plugin
```

Create `.github/plugin/marketplace.json` with the following content:

```json
{
  "name": "plugin-marketplace",
  "metadata": {
    "description": "My company's collection of GitHub Copilot plugins, agents, prompts, and skills",
    "version": "1.0.0",
    "pluginRoot": "./plugins"
  },
  "owner": {
    "name": "My Name",
    "email": "my-email@example.com"
  },
  "plugins": [
    {
      "name": "dev-flow",
      "source": "dev-flow",
      "description": "A comprehensive SDLC orchestration framework for GitHub Copilot, coordinating planning, coding, testing, and review through specialized agents and skills.",
      "version": "1.0.0",
      "author": {
        "name": "Your Name"
      }
    }
  ]
}
```

* Commit and push all these changes to your GitHub repository. This will be the source for your plugin installation.

```bash
git add .
git commit -m "Add DevFlow plugin with agents and skills"
git push origin main
```

#### Step 2: Verify Your Plugin Marketplace and Plugin

Create a new directory outside of your repo to test the plugin installation. Run these commands:

```bash
copilot 

# List and setup your plugin marketplace
/plugin marketplace list
/plugin marketplace add your-org/plugin-marketplace 
/plugin marketplace browse plugin-marketplace
/plugin install dev-flow@plugin-marketplace
/plugin list
/skills list 
/agent
```

At this point the plugin and associated customizations are installed and ready to use in any session on your machine.

#### Step 3: 7.3 Distribution Options

| Method | Scope | How |
|--------|-------|-----|
| **Git repository** | Anyone who clones | Commit `.github/agents/` and `.github/skills/` to your repo |
| **Local plugin install** | Single developer | `copilot plugin install ./path` |
| **Plugin marketplace** | Organization or community | Create a marketplace repo and publish |
| **GitHub CLI** | Community skills | `gh skill install owner/repo` |

#### Step 4: Sharing Across Your Organization

Customizations live at three levels:

```
┌───────────────────────────────────────────────────┐
│  Personal    ~/.copilot/agents/                   │
│              ~/.copilot/skills/                   │
│              Your customizations, your machine    │
├───────────────────────────────────────────────────┤
│  Project     .github/agents/                      │
│              .github/skills/                      │
│              Shared via git — everyone on the     │
│              project gets these automatically     │
├───────────────────────────────────────────────────┤
│  Organization                                     │
│              Shared plugin repositories           │
│              Install: /plugin install      │
│                https://github.com/org/customs     │
└───────────────────────────────────────────────────┘
```

**Best practice today:** Commit agents and skills to a shared "customization" repository where teams can collaborate allowing anyone to contribute and use. This is the most straightforward way to share customizations across an organization. You can structure the repo with directories for different teams, projects, or types of customizations.

### 7.2 Agent Package Manager (APM)

APM is an open-source dependency manager for AI agent configuration — think `package.json`, `requirements.txt`, or `Cargo.toml`, but for agents. Where plugins bundle and install customizations on demand, APM adds **reproducibility**: declare your agent dependencies once in `apm.yml`, commit it to the repo, and every developer who clones gets a fully configured agent setup in seconds — with version locking, transitive dependency resolution, and built-in security scanning.

| | Plugins | APM |
|---|---|---|
| **Primary use** | Bundle & distribute customizations | Declarative dependency management for teams |
| **Configuration** | `plugin.json` + `marketplace.json` | `apm.yml` + `apm.lock.yaml` |
| **Reproducibility** | `/plugin install` | `apm install` after `git clone` |
| **Lockfile** | Semver constraints in `plugin.json`; no consumer-side lockfile | `apm.lock.yaml` pins exact resolved commits |
| **Security scanning** | None | Built-in hidden Unicode / tampering scan |
| **Transitive deps** | Yes. Dependencies defined in plugin.json | Yes. Packages can depend on packages |
| **Architecture** | Centralized repository | Repo per package |

Think of plugins as "bundles you install once" and APM as "npm for your team's agent setup that reproduces on every clone."

#### Step 1: Install APM

```bash
# macOS / Linux
curl -sSL https://aka.ms/apm-unix | sh

# Windows (PowerShell)
irm https://aka.ms/apm-windows | iex

# Verify
apm --version
```

#### Step 2: Convert Your Plugin-Marketplace Repo to an APM Package

APM uses a `.apm/` directory as the **source of truth** for your own primitives (agents, skills, instructions). Running `apm install` deploys them to `.github/agents/`, `.github/skills/`, etc.

Navigate to the `plugin-marketplace` repo from section 7.1 and initialize an APM manifest:

```bash
cd plugin-marketplace
apm init --yes
```

This creates a minimal `apm.yml`:

```yaml
name: plugin-marketplace
version: 1.0.0
dependencies:
  apm: []
```

Now scaffold the `.apm/` source tree and copy the dev-flow content into it:

```bash
mkdir -p .apm/agents .apm/skills

# Copy agents
cp plugins/dev-flow/agents/*.agent.md .apm/agents/

# Copy skills (each with their full directory structure)
cp -r plugins/dev-flow/skills/documentation-writer .apm/skills/
cp -r plugins/dev-flow/skills/naming-checker .apm/skills/
cp -r plugins/dev-flow/skills/task-breakdown .apm/skills/
```

:::note Referencing Directly
Instead of copying skill folders into `.apm/`, you could use symlinks and continue to host both APM and a plugin marketplace. However, more likely you would choose one or the other as your primary distribution method as the plugin marketplace is centralized while APM is decentralized.
:::

Update `apm.yml` with a description and author:

```yaml
name: plugin-marketplace
version: 1.0.0
description: "Agent Package Management Repository for shared GitHub Copilot agents and skills"
author: "Your Name"
dependencies:
  apm: []
  mcp: []
includes: auto
scripts: {}
```

The `plugin-marketplace` repo is a *source and distribution* repo. You develop and maintain your agents and skills in `.apm/`, then commit both the source and the deployed content to the repo. This way, other teams can install from the APM manifest and also see the actual agent files in the repo for reference.

```bash
echo "apm_modules/" >> .gitignore    # like node_modules — never commit
git add .apm/ apm.yml .gitignore
git commit -m "Add APM manifest and .apm source content"
git push origin main
```

The source structure you're publishing looks like this:

```
plugin-marketplace/
├── .apm/                     ← source APM deploys from
│   ├── agents/
│   │   ├── dev-flow.agent.md
│   │   ├── planner.agent.md
│   │   ├── reviewer.agent.md
│   │   └── tester.agent.md
│   └── skills/
│       ├── documentation-writer/
│       ├── naming-checker/
│       └── task-breakdown/
├── apm.yml
└── plugins/                  ← existing plugin structure from 7.1
    └── dev-flow/
```

#### Step 3: Install from APM in Another Project

Now simulate what a new team member does. Move to a separate project directory (or create a fresh test directory) and install from your published package:

```bash
# In your actual project, or a test directory:
cd ../your-project
apm install your-org/plugin-marketplace
```

APM downloads the package, resolves its `.apm/` content, and deploys everything into the consuming project's runtime directories:

```
✓ your-org/plugin-marketplace
  ├─ 4 agents integrated → .github/agents/
  └─ 3 skill(s) integrated → .github/skills/
```

Your project's auto-generated `apm.yml` now tracks the dependency:

```yaml
name: your-project
version: 1.0.0
dependencies:
  apm:
    - your-org/plugin-marketplace
```

And `apm.lock.yaml` pins the exact commit so every developer gets identical configuration.

#### Step 4: Team Reproducibility Workflow

Pinning dependencies and ensuring consistent versions is the key advantage over plugins. Just commit the manifest, lockfile, and deployed files to your project... You can **skip actually doing this** as we won't save this folder, but in a real project you would commit the deployed agents and skills so that they are visible and usable immediately on clone:

```bash
git add apm.yml apm.lock.yaml .github/agents/ .github/skills/
git commit -m "Add dev-flow agent configuration via APM"
git push
```

What to commit and what to ignore:

| File / Folder | Commit? | Why |
|---------------|---------|-----|
| `apm.yml` | ✅ Yes | Declares your agent dependencies |
| `apm.lock.yaml` | ✅ Yes | Pins exact versions for reproducibility |
| `.github/agents/` | ✅ Yes | Copilot picks these up immediately on clone, before `apm install` |
| `.github/skills/` | ✅ Yes | Same — committed files give instant context |
| `apm_modules/` | ❌ `.gitignore` | Rebuilt from the lockfile by `apm install` |

A new developer who clones the repo gets the agents and skills immediately because the files are committed. `apm install` is run when you want to **refresh** from the manifest — for example after a colleague updates `apm.yml` to point to a newer version of the package:

```bash
# After pulling changes to apm.yml or apm.lock.yaml:
apm install   # re-deploys from the updated lockfile, then commit the changed .github/ files
```

#### APM Key Commands

| Command | Purpose |
|---------|---------|
| `apm init` | Scaffold `apm.yml` in the current directory |
| `apm install <pkg>` | Add a package, download, and deploy |
| `apm install` | Install all packages from `apm.yml` |
| `apm deps list` | Show installed packages and primitive counts |
| `apm deps update` | Pull latest versions of all dependencies |
| `apm outdated` | Check which dependencies have updates available |
| `apm audit` | Scan packages for hidden Unicode and tampering |
| `apm pack --format plugin` | Export as a standalone plugin bundle |

:::tip APM vs `gh skill`
APM and `gh skill` complement each other. Use `gh skill install` for quick one-off community skill installs. Use APM when you need a **reproducible, version-locked setup** that the whole team shares. This is especially important when your project depends on multiple agents, skills, and MCP servers and requires everyone to have identical agent configuration.
:::

:::info Security by Default
`apm install` scans every package for **hidden Unicode characters** — invisible characters that can be embedded in prompt files to hijack agent behavior. This runs automatically on every install; use `apm audit` to run the same check on demand or in CI.
:::


### 7.3 .github-private Organization Repo

`.github-private` is a special repository that can be used to share content across an entire GitHub organization. Initially it allows sharing agents across the entire organization. Think of this as a "push" distribution model where plugins and APM are "pull".

There is active work to enable sharing of skills and instructions via `.github-private` as well. This will allow teams to maintain a single repository of customizations that are automatically distributed to everyone in the organization without needing to install a plugin or APM package.

As this is still being developed, the best way to share across an organization today is to maintain a shared repository (like our `plugin-marketplace`) and have teams install from it via plugin or APM.

## Recap: What You Built

In 90 minutes you created a complete SDLC customization framework:

| Component | File | Purpose |
|-----------|------|---------|
| **Skill** (community) | `.github/skills/documentation-writer/SKILL.md` | Installed via `gh skill install` |
| **Skill** (custom) | `.github/skills/task-breakdown/SKILL.md` | Structured feature decomposition |
| **Skill** (custom) | `.github/skills/naming-checker/SKILL.md` | Convention validation with scripts |
| **Agent** | `.github/agents/reviewer.agent.md` | Code review (Sonnet) |
| **Agent** | `.github/agents/planner.agent.md` | Task planning (Auto) |
| **Agent** | `.github/agents/tester.agent.md` | Test generation (Haiku) |
| **Orchestrator** | `.github/agents/dev-flow.agent.md` | SDLC pipeline coordination (Auto) |
| **Plugin** | `plugin.json` | Packaged for sharing |
| **APM Manifest** | `apm.yml` | Alternative for reproducible team distribution |

## Next Steps

Want to go deeper? Consider **Adding more skills**! Build `code-scaffold`, `test-generator`, `pr-description`, and `changelog-entry` skills to complete the DevFlow framework! 

To go deeper on customization, check out the [Copilot Customization Workshop](/workshops/copilot-customization) which has multiple modules. 

## Additional Resources

- [github/awesome-copilot - Community-curated agents and skills](https://github.com/github/awesome-copilot)
- [agentskills/agentskills - Open standard specification for skills](https://github.com/agentskills/agentskills)
- [Creating a Plugin for Copilot CLI](https://docs.github.com/en/copilot/how-tos/copilot-cli/customize-copilot/plugins-creating)
- [Create a Plugin Marketplace for Copilot CLI](https://docs.github.com/en/enterprise-cloud@latest/copilot/how-tos/copilot-cli/customize-copilot/plugins-marketplace)
- [CLI Plugin Reference](https://docs.github.com/en/copilot/reference/copilot-cli-reference/cli-plugin-reference)
- [Agent Package Manager (APM) - Microsoft’s tool for packaging and sharing agents](https://microsoft.github.io/apm/)
- [APM GitHub Repo](https://github.com/microsoft/apm)
