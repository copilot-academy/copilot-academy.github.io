---
title: GitHub Copilot Customization Handbook
description: Instructions, Prompts, Agents, and Skills — a comprehensive guide to tailoring GitHub Copilot to your team's workflows
sidebar_position: 1
---

# GitHub Copilot Customization Handbook

This handbook provides a comprehensive overview of the various customization mechanisms available for GitHub Copilot, including Custom Instructions, Prompt Files, Custom Agents, and Agent Skills. Each section explains what the feature is, how it works, when to use it, and best practices for implementation. By understanding these tools, you can tailor GitHub Copilot to fit your team's unique workflows and coding standards, maximizing productivity and consistency across your projects.

## 1. Understanding the Customization Landscape

GitHub Copilot offers several distinct customization mechanisms, each designed to solve a different problem. Understanding the differences between them, and knowing when to reach for each one, is the key to building a productive, consistent AI-assisted development workflow across your team.

| Feature | Purpose | Activation | Location |
|---------|---------|------------|----------|
| Instructions | Always-on project context and coding standards | Automatic (every request) | `.github/copilot-instructions.md` or `*.instructions.md` |
| Prompt Files | Reusable task templates for common workflows | On-demand via `/command` | `.github/prompts/*.prompt.md` |
| Custom Agents | Named personas with specific tools and rules | User selects agent in chat | `.github/agents/*.agent.md` |
| Agent Skills | Portable specialized capabilities with resources | Auto-activated by prompt matching | `.github/skills/*/SKILL.md` |
| MCP Servers | Connection to external systems, APIs, and databases | Invoked via tools | `.vscode/mcp.json` or `~/.copilot/mcp-config.json` |
| Hooks | Custom scripts that run at specific points in the workflow | Triggered by events | `.github/hooks/*.json` or `~/.copilot/hooks` |
| Plugins | Extend Copilot functionality with additional features | Installed and configured by user | `.github/plugins/*.plugin.md` |
| Agentic Workflows | Repository Automation with strong guardrails | Any GitHub Actions Trigger | `.github/workflows/*.md` |

:::info 
All customization files are Markdown-based with YAML frontmatter. They can be committed to your repository and shared with your entire team through version control. Exceptions are MCP servers and hooks which are JSON.  
:::

## 2. Custom Instructions

Custom instructions are the foundation of Copilot customization. They define the always-on context that Copilot automatically includes in every chat interaction. Think of them as setting the ground rules: your project's coding conventions, architectural patterns, preferred libraries, and team standards.

### What They Are

Custom instructions are Markdown files that provide background context to Copilot. Unlike prompt files or agents that you trigger explicitly, instructions are injected into the context of every single chat request automatically. They ensure Copilot consistently understands your project's norms without you having to repeat yourself in every prompt.

### Types of Instruction Files

#### 1. Project-Wide Instructions — `copilot-instructions.md`

The primary instructions file lives at `.github/copilot-instructions.md` in your repository root. Its contents are automatically included in all chat interactions for anyone working in that workspace. This is the single most important customization file you can create.

```markdown
# Project Guidelines

## Architecture
- This is a React 18 + TypeScript monorepo
- Use the Repository pattern for data access
- All API calls go through the /services layer

## Code Style
- Use arrow functions for React components
- Prefer const over let; never use var
- Always include TypeScript type annotations
- Use descriptive variable names (no abbreviations)

## References
- [Architecture](../ARCHITECTURE.md)
- [Contributing Guide](../CONTRIBUTING.md)
```

#### 2. File-Targeted Instructions — `*.instructions.md`

For more granular control, you can create instruction files that apply only to specific file types or paths. These use the `applyTo` frontmatter field with glob patterns to target their scope. Store them anywhere in your workspace or in the `.github/instructions/` directory.

```markdown
---
applyTo: "**/*.tsx"
---
# React Component Standards

- Use functional components with hooks
- Export components as named exports
- Co-locate tests in __tests__ directories
- Use CSS Modules for styling
```

#### 3. User-Level Instructions

Personal instructions that apply across all your workspaces. Configure these in VS Code settings under `github.copilot.chat.codeGeneration.instructions` or through the Settings UI. These are useful for personal preferences like response format or tone.

### When to Use Instructions

Instructions are the right choice when you need:

- Project-wide coding standards that should apply to every interaction
- Architectural context that helps Copilot understand your codebase structure
- Technology-specific guidance (framework versions, library preferences)
- Language or file-type specific rules (e.g., different styles for `.tsx` vs `.py` files)
- Team conventions that every developer should follow consistently

:::tip
To generate a `copilot-instructions.md` file tailored to your project, click the **Configure Chat** gear icon in the Chat view and select **Generate Chat Instructions**. Review the generated file and make any necessary edits to match your team's standards.
:::

:::note
Custom instructions do NOT affect inline suggestions as you type in the editor. They only apply to chat interactions (Ask, Plan, Agent, and custom modes).
:::

### Agentic Memory

While custom instructions provide a powerful way to set context, they must be predefined and are relatively static.  GitHub has recently shipped **Agentic Memory**, a dynamic, evolving context that can be updated by agents during a session.  Each memory Copilot generates is stored with citations, references to specific code locations that support the memory.  When Copilot finds a memory that is relevant, it will validate the information is accurate and then use it.  Memories are automatically deleted after 28 days to avoid outdated information.  

Agentic Memory can be enabled at the enterprise or organization level today.  The memories stored are visible in the settings page of the repository under **Copilot > Memories**.

We will not cover Agentic Memory in detail in this workshop as there is no customization from the user's perspective.  However, over time it will likely be enabled by default and improve Copilot's understanding of your codebase and standards.  To learn more about Agentic Memory, go [here](https://docs.github.com/en/enterprise-cloud@latest/copilot/concepts/agents/copilot-memory).

## 3. Prompt Files

Prompt files are reusable, on-demand task templates that you invoke explicitly in chat. While instructions set the background context, prompt files define specific workflows: generating a component, performing a code review, scaffolding a new feature, or running a migration. They are the recipes in your team's cookbook.

### What They Are

Prompt files are Markdown files with the `.prompt.md` extension. They contain a YAML frontmatter header with metadata (description, model, tools, agent) and a body with the actual prompt instructions. Unlike instructions that apply everywhere, prompt files are triggered on-demand when you type `/prompt-name` in the chat input field.

### File Structure

```markdown
---
description: 'Generate a new React form component'
agent: 'agent'
model: Claude Sonnet 4
tools: ['githubRepo', 'search/codebase']
---

Your goal is to generate a new React form component.
Ask for the form name and fields if not provided.

Requirements:
* Use form design system components:
  [design-system/Form.md](../docs/design-system/Form.md)
* Use `react-hook-form` for state management
* Use `yup` for validation
* Always define TypeScript types for form data
```

### Scopes

**Workspace prompt files** live in `.github/prompts/` and are available only within that workspace. They can be committed to version control and shared with your team.

**User prompt files** are stored in your VS Code profile and are available across all workspaces. Useful for personal productivity workflows that aren't project-specific.

### Key Frontmatter Fields

| Field | Purpose | Example |
|-------|---------|---------|
| `description` | Shown in the `/` command picker | `'Generate a React form'` |
| `agent` | Which agent to run the prompt in | `'agent'` or `'ask'` |
| `model` | Preferred LLM model | `'Claude Sonnet 4'` |
| `tools` | Tools available during execution | `['search/codebase', 'fetch']` |

### How to Run Prompt Files

- Type `/prompt-name` in the chat input field and optionally add extra context
- Run **Chat: Run Prompt** from the Command Palette and select a prompt
- Open the `.prompt.md` file in the editor and press the play button in the title bar

### When to Use Prompt Files

- Repeatable workflows you run frequently (component generation, code reviews, migrations)
- Tasks that need specific tools and model configurations each time
- Team-standard workflows that all developers should follow consistently
- Complex multi-step tasks that benefit from detailed, pre-written instructions

:::tip
Prompt files can reference custom instructions via Markdown links, avoiding duplication. For example: `[coding standards](../docs/standards.md)`
:::

## 4. Custom Agents

Custom agents (formerly called "custom chat modes") define how Copilot Chat operates. They are named personas that set the boundaries for an entire conversation session: which tools are available, what instructions to follow, how to interact with the codebase, and even which language model to use. When you select a custom agent, every prompt in that session runs within its defined rules.

### What They Are

Custom agents are `.agent.md` files stored in `.github/agents/`. Each agent defines a specific operational context: a Planner agent that only creates implementation plans without making code edits, a Reviewer agent that focuses on code quality analysis, or a Feature Builder agent that has access to specific tools and follows particular architectural patterns.

### File Structure

```markdown
---
description: Generate an implementation plan for new features
name: Planner
tools: ['fetch', 'githubRepo', 'search', 'usages']
model: ['Claude Opus 4.5', 'GPT-5.2']
handoffs:
  - label: Implement Plan
    agent: agent
    prompt: Implement the plan outlined above.
    send: false
---

# Planning Instructions

You are in planning mode. Your task is to generate
an implementation plan. Don't make any code edits.

The plan should include:
* Overview of the feature or refactoring task
* Step-by-step implementation approach
* Files that need to be created or modified
* Testing strategy
```

### Key Capabilities

- **Tool restrictions:** Limit which tools the agent can use (e.g., a planning agent can search but not edit files)
- **Model selection:** Specify preferred models, with fallback ordering
- **Handoffs:** Define buttons that transition the user to another agent with a pre-filled prompt, creating multi-step workflows (e.g., Plan → Implement → Review)
- **Custom system prompts:** The Markdown body becomes the agent's operational instructions

### How Handoffs Work

Handoffs are a powerful feature that lets you chain agents together. When a user finishes with one agent, they see a button that transitions them to the next agent in the workflow. If `send: true`, the prompt auto-submits; if `send: false`, the user can review and modify it first.

### When to Use Custom Agents

- You need a named persona that consistently orchestrates tools for a workflow
- You want to restrict which tools are available to prevent unintended actions
- You need multi-step workflows with handoff transitions between phases
- Different team members work in different modes (planning vs. implementing vs. reviewing)
- You want to enforce that certain operations use specific, high-capability models

:::note
Custom agents define the session-level operating context. They work best as the outermost "wrapper" around a workflow. Combine them with instructions (for standards) and skills (for specialized tasks) for maximum effectiveness.
:::

## 5. Agent Skills

Agent Skills are the newest and most portable of Copilot's customization features. They are folders of instructions, scripts, and resources that Copilot automatically loads when it detects your prompt is relevant to a skill's described capability. Unlike instructions (always-on) or prompts (user-triggered), skills are auto-activated based on intent matching, and unlike agents (session-level), skills are task-level.

### What They Are

Each skill is a directory containing a `SKILL.md` file with YAML frontmatter (name, description) and a Markdown body with detailed instructions. The directory can also include scripts, templates, example files, and other resources the AI can reference. Skills follow an open standard and work across multiple agents: GitHub Copilot in VS Code, GitHub Copilot CLI, GitHub's Copilot coding agent and Claude Code.

### File Structure

```
.github/skills/
├── webapp-testing/
│   ├── SKILL.md              # Main skill definition
│   ├── test-template.js      # Template file
│   └── examples/
│       └── login-test.spec.ts # Example test
└── react-components/
    ├── SKILL.md
    ├── component-template.tsx
    └── styles-guide.md
```

### SKILL.md Anatomy

```markdown
---
name: webapp-testing
description: >
  Guide for testing web applications using Playwright.
  Use this when asked to create or run browser-based
  tests.
---

# Web Application Testing with Playwright

## When to use this skill
- Create new Playwright tests for web apps
- Debug failing browser tests
- Set up test infrastructure

## Creating tests
1. Always use the Page Object Model pattern
2. Reference the test template:
   [test-template.js](./test-template.js)
3. Follow naming convention: feature.spec.ts
```

### How Progressive Disclosure Works

Skills use a three-level progressive disclosure model to keep context efficient. At startup, only the name and description from the frontmatter are loaded into Copilot's system prompt. This is level one. When Copilot determines a skill is relevant to the current task, it loads the full SKILL.md body (level two). Only if the instructions reference additional files in the skill directory does Copilot load those resources (level three).

This means you can install many skills without bloating the context window.

### Storage Locations

| Type | Path | Scope |
|------|------|-------|
| Project skills | `.github/skills/` (recommended) `.claude/skills/` (legacy) | Repository-specific |
| Personal skills | `~/.copilot/skills/` (recommended) `~/.claude/skills/` (legacy) | All your workspaces |

### Skills vs. Instructions

| Aspect | Custom Instructions | Agent Skills |
|--------|---------------------|--------------|
| Activation | Always included in every request | Auto-loaded only when relevant |
| Scope | Project-wide or file-targeted | Task-specific capabilities |
| Resources | Markdown text only | Can include scripts, templates, examples |
| Portability | VS Code specific | Open standard across agents |
| Best for | Coding standards, architecture context | Specialized workflows, tools, procedures |

:::tip
Skills are an open standard. A skill you create for GitHub Copilot in VS Code also works with GitHub Copilot CLI, the Copilot coding agent, and Claude Code.
:::

## 6. MCP Servers

MCP (Model Context Protocol) is an open standard for connecting AI applications to external systems. Think of it like a USB-C port for AI — just as USB-C provides a standardized way to connect devices, MCP provides a standardized way to connect AI models to data sources, tools, and workflows. MCP servers let Copilot reach beyond your codebase to interact with databases, APIs, cloud services, browsers, and any custom backend you build.

### How MCP Works

MCP follows a client-server architecture. VS Code acts as the **MCP host**, creating an **MCP client** for each configured **MCP server**. Each client maintains a dedicated connection to its server. Servers can run locally (via stdio transport) or remotely (via HTTP transport).

When you configure an MCP server, VS Code discovers the server's capabilities during an initialization handshake. The server advertises what it can do, and those capabilities become available as tools in Copilot Chat.

MCP servers may run locally on your machine or remotely.  Many vendors provide hosted (remote) MCP servers for their tools and this is ideal so you don't have to worry about maintenance and updates. 

### What MCP Servers Provide

MCP servers expose three core primitives:

| Primitive | What It Does | How to Use in VS Code |
|-----------|-------------|----------------------|
| **Tools** | Executable functions the AI can invoke (e.g., query a database, call an API, manipulate files) | Available automatically in Agent mode; toggle via the tools icon in chat |
| **Resources** | Read-only context data (e.g., file contents, database schemas, API responses) that attach to your prompt | Select **Add Context > MCP Resources** in the chat input |
| **Prompts** | Preconfigured prompt templates tailored to the server's capabilities | Type `/<server-name>.<prompt-name>` in chat |

### Configuring MCP Servers

There are two ways to add MCP servers:

**1. MCP Gallery (recommended for discovery):** Open the Extensions view (`⇧⌘X`), filter by `@mcp`, and install servers directly. Servers installed in your workspace update `.vscode/mcp.json` automatically.

**2. Manual configuration:** Create or edit `.vscode/mcp.json` in your project root. This file can be committed to version control so your entire team shares the same server configuration.  Here is an example using the remote GitHub MCP server and a local Playwright server:

```json
{
  "servers": {
    "github": {
      "type": "http",
      "url": "https://api.githubcopilot.com/mcp"
    },
    "playwright": {
      "command": "npx",
      "args": ["-y", "@microsoft/mcp-server-playwright"]
    }
  }
}
```

Beyond the gallery, you can also find MCP servers by looking at registries.  For example: 

* [GitHub MCP Registry](https://github.com/mcp)
* [Official MCP Registry](https://registry.modelcontextprotocol.io/)

:::warning
Local MCP servers run arbitrary code on your machine. Only add servers from trusted sources and review the code and configuration before starting. VS Code prompts you to confirm trust when starting a server for the first time.
:::

### Configuration Scopes

| Scope | Location | Shared with Team | Best For |
|-------|----------|-----------------|----------|
| Workspace | `.vscode/mcp.json` | Yes (commit to repo) | Project-specific servers (DB, APIs) |
| User profile | User-level `mcp.json` | No | Personal productivity servers |
| Dev container | `devcontainer.json` | Yes | Consistent environment in containers |

For user-level `mcp.json`, use the **MCP: Open User Configuration** command. 

### Sandboxing (macOS/Linux)

You can restrict a local MCP server's access to the file system and network by enabling sandboxing:

```json
{
  "servers": {
    "myServer": {
      "command": "npx",
      "args": ["-y", "@example/mcp-server"],
      "sandboxEnabled": true,
      "sandbox": {
        "filesystem": {
          "allowWrite": ["${workspaceFolder}"]
        },
        "network": {
          "allowedDomains": ["api.example.com"]
        }
      }
    }
  }
}
```

Sandboxed servers only access explicitly permitted paths and domains, and their tool calls are auto-approved.

### When to Use MCP Servers

- You need Copilot to **query or act on external systems** (databases, cloud APIs, issue trackers, CI/CD)
- You want to **standardize tool access** across your team by committing `.vscode/mcp.json`
- You need to **extend agent capabilities** beyond what built-in tools provide
- You want to give Copilot **browser automation** (Playwright), **search** (Brave, Google), or other specialized abilities
- You're building a **custom integration** — MCP SDKs are available in Python, TypeScript, Java, C#, and more

:::important
Organizations can centrally manage which MCP servers are allowed via GitHub policies.  If you are unsure of your organizations policies around MCP server usage, check with your GitHub Copilot administrators before adding new servers.
:::


## 7. Agent Hooks

Agent hooks let you execute custom shell commands at specific lifecycle points during agent sessions. Unlike instructions or prompts that guide behavior through natural language, hooks run your code with deterministic, guaranteed outcomes — ideal for enforcing policies, automating quality gates, and creating audit trails.

:::note
Agent hooks are currently in Preview. Your organization may have disabled hook usage via enterprise policies.
:::

### How They Work

A hook is a JSON file that maps a lifecycle event to a shell command. When the event fires, VS Code executes your command, passes structured JSON via stdin, and reads JSON output from stdout to decide what happens next. Hooks live in `.github/hooks/*.json` (workspace) or `~/.copilot/hooks` (user), and can also be defined inline in a custom agent's frontmatter.

### Common Use Cases

- **Block dangerous operations** before they execute (e.g., `rm -rf`, `DROP TABLE`)
- **Auto-format code** after every file edit (run Prettier, ESLint, etc.)
- **Log tool usage** for compliance and auditing
- **Inject project context** at session start
- **Require approval** for sensitive operations while auto-approving safe ones

### Lifecycle Events

| Event | When It Fires | Example Use |
|-------|---------------|-------------|
| `SessionStart` | First prompt of a new session | Inject project context |
| `UserPromptSubmit` | User submits a prompt | Audit requests |
| `PreToolUse` | Before any tool invocation | Block or approve operations |
| `PostToolUse` | After a tool completes | Run formatters, log results |
| `Stop` | Agent session ends | Generate reports, cleanup |
| `SubagentStart` / `SubagentStop` | Subagent lifecycle | Track nested agent usage |
| `PreCompact` | Before context compaction | Save state before truncation |

### Quick Start Example

Create `.github/hooks/format.json` to auto-format files after every edit:

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "type": "command",
        "command": "npx prettier --write \"$TOOL_INPUT_FILE_PATH\""
      }
    ]
  }
}
```

### Configuring Hooks

You can also configure hooks through the UI: type `/hooks` in chat, use **Chat: Configure Hooks** from the Command Palette, or type `/create-hook` to have AI generate one for you.

:::info
For the full reference including input/output schemas, OS-specific command overrides, agent-scoped hooks, and security considerations, see the [VS Code hooks documentation](https://code.visualstudio.com/docs/copilot/customization/hooks).
:::


## 8. Agentic Workflows

GitHub Agentic Workflows (gh-aw) let you define repository automation in Markdown files that run as AI-powered agents inside GitHub Actions. Instead of writing complex scripts with fixed if/then logic, you write natural language instructions and let a coding agent (Copilot, Claude, or Codex) understand context, make decisions, and take action.

### How They Work

Each workflow is a `.md` file with YAML frontmatter (triggers, permissions, tools) and a Markdown body containing natural language instructions. The `gh aw compile` command converts this into a hardened `.lock.yml` GitHub Actions workflow. You commit both files.

```markdown
---
on:
  issues:
    types: [opened]

permissions: read-all

safe-outputs:
  add-comment:
---
# Issue Clarifier

Analyze the current issue and ask for additional
details if the issue is unclear.
```

### Agentic vs. Traditional Workflows

Traditional GitHub Actions execute pre-programmed steps with fixed logic. Agentic workflows use AI to understand context, choose appropriate actions, and adapt behavior — combining deterministic Actions infrastructure with AI-driven decision-making.

### Key Capabilities

- **Any GitHub Actions trigger:** Issues, PRs, comments, schedules, `workflow_dispatch`, and more
- **MCP tool integration:** GitHub operations, external APIs, file operations, and custom tools via Model Context Protocol
- **Safe outputs:** Write operations (create issue, add comment, create PR) are buffered and validated — the agent never gets direct write access
- **Reusable workflows:** Import shared workflow components across repositories

### Defense-in-Depth Security

Agentic workflows implement a layered security architecture that protects against prompt injection, rogue MCP servers, and compromised agents:

| Layer | What It Does |
|-------|-------------|
| **Compilation-time** | Schema validation, expression allowlisting, action SHA pinning, security scanning (actionlint, zizmor, poutine) |
| **Runtime isolation** | Agent runs in a containerized sandbox with an Agent Workflow Firewall (AWF) controlling network egress via domain allowlists |
| **Permission separation** | Agent job runs with read-only permissions; write operations are deferred to separate SafeOutputs jobs that execute only after the agent completes |
| **MCP sandboxing** | Each MCP server runs in its own isolated container with tool allowlisting — only explicitly permitted operations are exposed |
| **Threat detection** | A separate AI-powered detection job analyzes agent outputs for secret leaks, malicious patches, and policy violations before any writes are externalized |
| **Content sanitization** | User-generated input is sanitized (neutralize @mentions, strip HTML/XML tags, filter URIs, enforce size limits) before reaching the agent |
| **Secret redaction** | All workflow artifacts are scanned and secrets are masked before upload |

### Observability

All workflow outputs (prompts, patches, logs) are preserved as downloadable artifacts. Use `gh aw logs` for cost monitoring, `gh aw audit` for failure investigation, and `gh aw status` for workflow health.

:::info
For full documentation including setup, patterns, and reference material, see the [GitHub Agentic Workflows docs](https://github.github.com/gh-aw/).
:::

## 9. How Context is Built

Understanding how Copilot assembles context from all these sources is essential for effective customization. When you send a chat message, Copilot constructs a context window by layering information from multiple sources in a specific priority order.

### The Context Assembly Process

When you type a message in Copilot Chat, here is what happens behind the scenes:

1. **Agent selection:** The active agent (built-in or custom) establishes the session's operational boundaries, including which tools are available and what system-level instructions apply.

2. **Instructions injection:** All applicable instruction files are collected and injected. This includes the project-wide `copilot-instructions.md`, any file-targeted `*.instructions.md` files that match the current context, and user-level instructions from VS Code settings. No specific order is guaranteed when multiple instruction types are combined.

3. **MCP tool invocation (if applicable):** All MCP tools are pre-loaded in context, making it important to only enable the tools you need. These tools are available but do not execute until  called.

4. **Skill matching:** Copilot examines the skill descriptions it has pre-loaded and determines if any are relevant to your prompt. If a match is found, the full SKILL.md body is loaded into context.

5. **Explicit context:** Any files, symbols, terminal output, or other context you explicitly attached to the prompt via `#`-mentions is included.

6. **Prompt file content:** If you triggered a prompt file via `/command`, its instructions are added to the context.

7. **Your message:** Finally, your actual message text is added as the user prompt.

:::info
If multiple types of customization files exist in your project, VS Code combines them all. Use the diagnostics view (right-click in Chat → Diagnostics) to see all loaded customization files and troubleshoot issues.
:::

### Context Priority for Tools

When a prompt file and a custom agent both specify tools, the effective tool list is resolved by priority. A prompt file's tools override the agent's tools for that request. If neither specifies tools, the default set for the selected agent is used. Tools that aren't available in the environment are silently ignored.

## 10. Comparison Matrix

The following table provides a detailed side-by-side comparison of all five customization mechanisms.

| Dimension | Instructions | Prompt Files | Custom Agents | Agent Skills | MCP Servers |
|-----------|--------------|--------------|---------------|--------------|-------------|
| File extension | `.instructions.md` or `copilot-instructions.md` | `.prompt.md` | `.agent.md` | `SKILL.md` | `settings.json` or `mcp.json` |
| Location | `.github/` or anywhere in workspace | `.github/prompts/` or user profile | `.github/agents/` or user profile | `.github/skills/*/SKILL.md` | `.vscode/mcp.json` or VS Code settings |
| Activation | Automatic (every request) | On-demand (`/` command) | User selects in chat | Auto-matched by description | Invoked via tools |
| Scope | Global or file-targeted | Per-invocation | Session-level | Task-level | Tool-level |
| Can include scripts/files | No (Markdown only) | No (Markdown only) | No (Markdown only) | Yes (full directory) | Yes (separate service) |
| Specifies tools | No | Yes | Yes | No | Exposes tools |
| Specifies model | No | Yes | Yes | No | No |
| Portable across agents | VS Code only | VS Code only | VS Code only | Yes (open standard) | Yes (open standard) |
| Version controllable | Yes | Yes | Yes | Yes | Yes |
| Affects inline suggestions | No | No | No | No | No |

## 11. Decision Framework

Use the following decision tree to determine which customization type best fits your need.

| If you need to... | Use | Why |
|-------------------|-----|-----|
| Set project-wide coding standards that apply to every interaction | Instructions | Always-on, zero friction, ensures consistent baseline |
| Apply rules only to specific file types (e.g., `.tsx` vs `.py`) | Instructions (file-targeted) | `applyTo` glob patterns target precisely |
| Create a repeatable workflow that team members invoke on demand | Prompt Files | On-demand, sharable, configurable tools and model |
| Define a named operational persona with restricted tools | Custom Agents | Session-level control over behavior and capabilities |
| Chain multiple workflow phases together (plan → implement → review) | Custom Agents (with handoffs) | Handoff transitions create structured pipelines |
| Package a specialized capability with scripts and templates | Agent Skills | Self-contained, auto-activated, portable across agents |
| Share capabilities across teams or the community | Agent Skills | Open standard works beyond VS Code |
| Give Copilot the ability to run project-specific scripts | Agent Skills | Skills can include executable scripts and resources |
| Connect Copilot to external systems, APIs, or databases | MCP Servers | Exposes tools for querying or acting on external services |
| Integrate live data from third-party services into chat | MCP Servers | Real-time access to systems beyond the local workspace |

### Combining Customizations

These features are not mutually exclusive — they are designed to work together. A recommended layered approach:

- **Layer 1 — Instructions:** Start with `copilot-instructions.md` for project-wide standards. Add file-targeted instructions for language-specific rules. Keep instructions concise and focused on high-level guidelines.

- **Layer 2 — Prompt Files:** Create prompt files for common workflows your team performs repeatedly. Reference your instruction files via Markdown links to avoid duplication.

- **Layer 3 — Custom Agents:** Define agents for distinct operational modes (planning, implementing, reviewing). Use handoffs to chain agents into multi-step workflows.

- **Layer 4 — Agent Skills:** Build skills for specialized, self-contained capabilities that include scripts, templates, or examples. Let them auto-activate when relevant.

:::note
MCP servers are a separate extension point for connecting to external systems. Use them when you need capabilities beyond what can be included in skills or agents.
:::

## 12. Sharing Customizations with Plugins

### What They Are

Plugins are a new distribution mechanism for sharing Copilot customizations across teams and the broader community. A plugin is a packaged collection of agents, skills, hooks, MCP server configurations, and LSP server configurations that are bundled as a single installable unit. 

Plugins can be installed from a marketplace, a repository, or a local path. Once installed, the plugin's customizations are automatically loaded into your Copilot environment and can be used alongside your existing instructions, prompts, agents, and skills.

Use `/plugins` or `/plugin` to view and manage your installed plugins. 

Example Marketplaces: 

* [copilot-plugins](https://github.com/github/copilot-plugins) (added by default)
* [awesome-copilot](https://github.com/github/awesome-copilot) (added by default)
* [claude-code-plugins](https://github.com/anthropics/claude-code)
* [claudeforge-marketplace](https://github.com/claudeforge/marketplace)

### File Structure

```
my-plugin/
├── plugin.json           # Required manifest
├── agents/               # Custom agents (optional)
│   └── helper.agent.md
├── skills/               # Skills (optional)
│   └── deploy/
│       └── SKILL.md
├── hooks.json            # Hook configuration (optional)
└── .mcp.json             # MCP server config (optional)
```

### plugin.json Anatomy

```json
{
  "name": "my-dev-tools",
  "description": "React development utilities",
  "version": "1.2.0",
  "author": {
    "name": "Jane Doe",
    "email": "jane@example.com"
  },
  "license": "MIT",
  "keywords": ["react", "frontend"],
  "agents": "agents/",
  "skills": ["skills/", "extra-skills/"],
  "hooks": "hooks.json",
  "mcpServers": ".mcp.json"
}
```

### Creating a Marketplace 

A marketplace is a repository that hosts one or more plugins. To create a marketplace, simply create a GitHub repository, add your plugins to the `plugins/` directory, and then create a `.github/plugin/marketplace.json` file containing metadata about your marketplace.  

#### File Structure:

```
.github/
├── plugin
│   └── marketplace.json
plugins/
├── my-plugin/
├── my-next-plugin/
```

#### marketplace.json Anatomy:
```json
{
  "name": "my-plugins",
  "owner": {
    "name": "Your Name"
  },
  "plugins": [
    {
      "name": "my-plugin",
      "source": "./plugins/my-plugin",
      "description": "Adds something useful"
    },
    {
      "name": "my-next-plugin",
      "source": "./plugins/my-next-plugin",
      "description": "Adds something else useful"
    }
  ]
}
```

## 13. Best Practices

### Getting Started

- Use **Configure Chat** (gear icon) → **Generate Chat Instructions** to auto-generate a `copilot-instructions.md` based on your project structure
- Keep your initial instructions file concise — one page maximum. Add detail over time based on where Copilot falls short.
- Commit all customization files to version control so your entire team benefits
- Use the diagnostics view (right-click Chat → Diagnostics) to verify which files are loaded

### Writing Effective Instructions

- Be specific and actionable — "Use arrow functions for React components" is better than "Write clean code"
- Reference supporting documentation via Markdown links rather than inlining everything
- Include both positive guidance ("do this") and negative guidance ("avoid that")
- Override the model's default behavior where needed (e.g., "Don't apologize" or "Don't add comments unless asked")

### Organizing Skills

- Write clear, keyword-rich descriptions — Copilot matches skills to prompts based on the description field
- Use progressive disclosure: put the most important instructions in SKILL.md, details in reference files
- Include example inputs and outputs to demonstrate the expected behavior
- Test skills by prompting Copilot with tasks that should trigger them and verifying they activate
- Review community-contributed skills before using them to ensure quality and security

### Team Adoption

- Establish a single `copilot-instructions.md` as your team's "source of truth" for AI-assisted development
- Build a shared library of prompt files for common team workflows (PRs, migrations, component scaffolding)
- Document your customization strategy in CONTRIBUTING.md so new team members onboard quickly
- Iterate continuously — review Copilot's outputs and refine your customization files accordingly

:::info
For more community-contributed examples of instructions, prompts, agents, and skills, visit the **[github/awesome-copilot](https://github.com/github/awesome-copilot)** repository on GitHub.
:::
