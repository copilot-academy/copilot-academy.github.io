---
title: Custom Agent Developer Guide
description: A step-by-step walkthrough from zero to a production-ready test-coverage agent with patterns for building your own
sidebar_position: 5
---

# Custom Agent Developer Guide

**A Step-by-Step Walkthrough for Building GitHub Copilot Custom Agents**

From zero to a production-ready `test-coverage` agent, including patterns for building your own custom agents to solve your team's unique challenges.

## 1. Introduction — What Are Custom Agents?

Custom agents are specialized AI personas that you define in a simple Markdown file. Each agent packages together:

- **Instructions** — a system prompt telling the AI *who it is* and *how to behave*
- **Tools** — which VS Code capabilities (file editing, terminal, search, test runner, etc.) the agent can use
- **Handoffs** — suggested next-step buttons that chain agents into multi-step workflows

When you select a custom agent in the VS Code Copilot Chat panel, it replaces the default behavior with your specialized configuration. This means the AI follows your instructions, uses only the tools you've allowed, and stays focused on the task you've designed it for.

### Agents vs. Instructions vs. Prompts — When to Use What

| Customization | File Extension | Purpose | Scope |
|---------------|----------------|---------|-------|
| **Custom Instructions** | `copilot-instructions.md` | Always-on context and standards | Applied to every Copilot interaction |
| **Prompt Files** | `.prompt.md` | Reusable, parameterized task templates | Invoked on demand via slash commands |
| **Custom Agents** | `.agent.md` | Specialized AI personas with tool control | Selected from the Agents dropdown |

**Use an agent when** you want to change the AI's *identity*, *available tools*, or *workflow behavior*. Use instructions when you want rules that apply universally. Use prompts for repeatable task templates.

### Where We Built Our Agent

We built the `test-coverage` agent for the `dotnet-react-starter` template application — a .NET 8 Web API + React starter that serves as a foundation for demonstrating GitHub Copilot capabilities. The agent lives at:

```
.github/agents/test-coverage.agent.md
```

### Key References

| Resource | URL |
|----------|-----|
| VS Code Custom Agents Docs | https://code.visualstudio.com/docs/copilot/customization/custom-agents |
| GitHub Custom Agents Docs | https://docs.github.com/en/enterprise-cloud@latest/copilot/how-tos/use-copilot-agents/coding-agent/create-custom-agents |
| Agent Configuration Reference | https://docs.github.com/en/enterprise-cloud@latest/copilot/reference/custom-agents-configuration |
| Awesome Copilot — Community Agents | https://github.com/github/awesome-copilot/tree/main/agents |

## 2. Prerequisites and Setup

### Requirements

- **Visual Studio Code** v1.106 or later (custom agents were introduced in this release)
- **GitHub Copilot** extension installed with an active subscription (Free, Pro, or Enterprise)
- A **workspace** (Git repository) where you can create the `.github/agents/` folder
- Get a copy of the [dotnet-react-starter-demo repo](https://github.com/copilot-academy/dotnet-react-starter-demo)

### Create the Agents Directory

Custom agents are discovered automatically when placed in the `.github/agents/` folder of your repository:

```
your-project/
├── .github/
│   ├── agents/                     ← Agents go here
│   │   ├── test-coverage.agent.md
│   │   ├── api-builder.agent.md
│   │   └── asp-migrator.agent.md
│   ├── copilot-instructions.md     ← Always-on instructions
│   ├── prompts/                    ← Reusable prompt files
│   └── skills/                     ← Agent skills with examples
├── backend/
├── frontend/
└── ...
```

### Alternative: User-Level Agents

You can also create agents in your VS Code user profile so they're available across all workspaces:

1. In the Agents dropdown in the Copilot Chat panel, select **Configure Custom Agents**
2. Run **+ Create New Custom Agent**
3. Choose **User Data** as the location

User-level agents are great for personal productivity tools (e.g., a "code reviewer" agent you use everywhere). Repository-level agents are better for team-shared, project-specific workflows.

### Verify Setup

After creating an `.agent.md` file, verify it's detected:

1. Open Copilot Chat (`⌘⇧I` or via the sidebar)
2. Click the **Agents dropdown** at the top of the chat panel
3. Your custom agent should appear in the list
4. Select **Configure Custom Agents** to see all loaded agents and their sources

> **Tip:** To debug custom agents, click the **`...`** overflow menu in the Chat view → **Show Chat Debug View** (or run `Developer: Show Chat Debug View` from the Command Palette). This shows the full system prompt, context sent to the model, and tool invocations — making it easy to verify your agent's instructions are being applied correctly.

## 3. Anatomy of an Agent File

Every `.agent.md` file has two parts: an optional **YAML frontmatter header** and a **Markdown body**.

### Complete File Structure

```markdown
---
# YAML Frontmatter — Configuration
name: my-agent
description: 'Brief description shown as placeholder in the chat input'
tools: ['search', 'codebase', 'editFiles', 'runCommands']
# Optional properties:
# model: 'Claude Sonnet 4 (copilot)'
# handoffs: [...]
# agents: [...]
# target: 'vscode' | 'github-copilot'
# user-invokable: true
# argument-hint: 'Describe what you want to test'
---

# Body — Agent Instructions (Markdown, up to 30,000 characters)

Everything below the frontmatter is the agent's system prompt.
This is where you define the AI's identity, behavior, workflow,
rules, and constraints.
```

### YAML Frontmatter Properties Reference

| Property | Required | Type | Description |
|----------|----------|------|-------------|
| `description` | **Yes** | string | Shown as placeholder text in chat input. Keep concise (50–150 chars). |
| `name` | No | string | Display name. Defaults to filename without `.agent.md`. |
| `argument-hint` | No | string | Hint text shown to guide users on input expectations. |
| `tools` | No | string[] | List of available tools. **Omit to allow all tools.** |
| `model` | No | string \| string[] | AI model to use. Format: `Model Name (vendor)`. Can be an array for fallback. |
| `handoffs` | No | object[] | Suggested next-step buttons for agent chaining (see [Section 4](#4-key-concepts--tools-handoffs-and-subagents)). |
| `agents` | No | string[] | List of subagent names this agent can invoke. Use `*` for all. |
| `target` | No | string | `vscode` or `github-copilot`. Omit = available in both. |
| `user-invokable` | No | boolean | `false` hides from dropdown; only usable as subagent. Default: `true`. |
| `mcp-servers` | No | object[] | MCP server configurations for Coding Agent usage. |

### Body — Writing Effective Instructions

The body is your agent's system prompt. Structure it clearly:

1. **Identity and Role** — Who is this agent? What is its expertise?
2. **Workflow Steps** — Numbered steps the agent should follow
3. **Standards and Rules** — Conventions, patterns, constraints
4. **Output Format** — How results should be presented
5. **Boundaries** — What the agent should NOT do

> **Pro tip:** Reference other files using Markdown links to reuse instructions. For example: `Follow the standards in [copilot-instructions.md](../../copilot-instructions.md)`. Reference tools in the body using `#tool:toolName` syntax.

## 4. Key Concepts — Tools, Handoffs, and Subagents

### Tools — What Your Agent Can Do

Tools give your agent capabilities. If you omit the `tools` property, the agent gets access to **all available tools**. If you specify a list, the agent can *only* use those tools.

#### Available Built-in Tools

| Tool Name | What It Does | Example Use Case |
|-----------|--------------|------------------|
| `search` | Search workspace files by text | Finding code patterns |
| `codebase` | Semantic code search | Understanding project structure |
| `editFiles` | Create and edit files | Writing code |
| `runCommands` | Execute terminal commands | `dotnet build`, `dotnet test`, `npm run` |
| `runTests` | Run the test suite | Executing and checking test results |
| `findTestFiles` | Locate test files | Discovering existing test patterns |
| `testFailure` | Get test failure details | Debugging failing tests |
| `problems` | Get compile/lint errors | Fixing build issues |
| `changes` | View git changes | Reviewing modifications |
| `usages` | Find symbol usages | Understanding code dependencies |
| `fetch` | Fetch web content | Reading documentation |
| `githubRepo` | Search GitHub repos | Finding code examples |
| `terminalLastCommand` | Get last command output | Checking results |

#### Tool Selection Strategy by Agent Type

| Agent Type | Recommended Tools | Why |
|------------|-------------------|-----|
| **Planner / Read-only** | `search`, `codebase`, `fetch`, `usages` | Prevents accidental code changes |
| **Implementation** | All tools (omit `tools` property) | Needs full editing + running capability |
| **Testing** | `search`, `codebase`, `editFiles`, `runTests`, `findTestFiles`, `testFailure`, `runCommands`, `problems` | Write tests, run them, diagnose failures |
| **Code Review** | `search`, `codebase`, `changes`, `problems`, `usages` | Read-only analysis of changes |

> This strategy is inspired by the **Custom Agent Foundry** agent from the [awesome-copilot](https://github.com/github/awesome-copilot/blob/main/agents/custom-agent-foundry.agent.md) community collection, which codifies tool selection patterns for different agent archetypes.

### Handoffs — Chaining Agents into Workflows

Handoffs create interactive buttons that appear after an agent's response, allowing users to transition to the next agent in a workflow.

```yaml
handoffs:
  - label: "Generate Tests"        # Button text shown to user
    agent: test-coverage            # Target agent to switch to
    prompt: "Generate comprehensive tests for the code above"
    send: false                     # false = pre-fill prompt, user clicks send
                                    # true = auto-submit immediately
    model: Claude Sonnet 4 (copilot)  # Optional: override model for this step
```

#### Example Workflow Chains

```
┌─────────────┐    handoff     ┌──────────────────┐    handoff     ┌───────────────┐
│   Planner   │ ──────────────→ │  Implementation  │ ──────────────→ │ Test Coverage │
│ (read-only) │  "Implement    │  (full tools)     │  "Add tests   │ (test tools)  │
│             │   the plan"    │                    │  for new code"│               │
└─────────────┘                └──────────────────┘                └───────────────┘
```

### Subagents — Agents Calling Other Agents

An agent can invoke other agents as subagents for specialized sub-tasks. This is useful for orchestration agents that coordinate multiple specialists:

```yaml
---
name: asp-migrator
description: 'Migrates Classic ASP pages to .NET 8 + React'
agents: ['api-builder', 'test-coverage']  # This agent can call these as subagents
---
```

Use `agents: ['*']` to allow invocation of any available agent, or `agents: []` to prevent any subagent use.

### Explore a working example - Plan Agent

The built-in `Plan` agent is an example you can review to understand all of the settings in frontmatter including tools, agents, handoffs, and overall instructions.  To view it's contents, follow these steps: 

1. In the Agents dropdown in the Copilot Chat panel, select **Configure Custom Agents**
2. Click on **Plan** to open the agent file

## 5. Walkthrough: Building the `test-coverage` Agent

This section walks through exactly how we built the `test-coverage` agent for the `dotnet-react-starter` application, step by step.

### Step 1: Define the Agent's Purpose

Before writing any file, clearly define:

- **Who is this agent?** A .NET testing specialist focused on code coverage.
- **What does it do?** Analyzes codebase for untested code, generates comprehensive unit and integration tests, targets 80%+ coverage.
- **What tools does it need?** All tools — it needs to read code, write tests, run builds, run tests, and check results.
- **Does it need handoffs?** No — this is a single-purpose agent. It does its job and reports results.

### Step 2: Study Existing Examples

Before writing the agent, we studied community examples from the [github/awesome-copilot](https://github.com/github/awesome-copilot/tree/main/agents) repository to learn proven patterns:

| Example Agent | What We Learned |
|---------------|-----------------|
| [**TDD Red Phase**](https://github.com/github/awesome-copilot/blob/main/agents/tdd-red.agent.md) | Test-first methodology, AAA pattern enforcement, xUnit + FluentAssertions patterns, linking tests to requirements |
| [**TDD Green Phase**](https://github.com/github/awesome-copilot/blob/main/agents/tdd-green.agent.md) | Making tests pass with minimal implementation, iterative approach |
| [**TDD Refactor Phase**](https://github.com/github/awesome-copilot/blob/main/agents/tdd-refactor.agent.md) | Improving test quality and coverage post-implementation |
| [**C# Expert**](https://github.com/github/awesome-copilot/blob/main/agents/CSharpExpert.agent.md) | Testing best practices, code coverage with dotnet-coverage, comprehensive .NET tooling |
| [**Playwright Tester**](https://github.com/github/awesome-copilot/blob/main/agents/playwright-tester.agent.md) | "Explore first, code second" pattern — analyze before generating |
| [**Custom Agent Foundry**](https://github.com/github/awesome-copilot/blob/main/agents/custom-agent-foundry.agent.md) | Agent design methodology, tool selection strategy, quality checklist |

**Key patterns extracted:**

- **The TDD agents** showed us how to structure test-writing instructions with strict AAA pattern enforcement and clear naming conventions.
- **The Playwright Tester** demonstrated the "analyze → generate → validate" workflow — explore the codebase before writing anything.
- **The Custom Agent Foundry** gave us a meta-framework for designing agents: define the role, select tools, write constraints, provide examples.

### Step 3: Study Your Repository's Existing Patterns

Before writing the agent, examine what patterns already exist in the codebase. Our `dotnet-react-starter` already had:

- **`copilot-instructions.md`** — Comprehensive testing standards including naming conventions, AAA pattern, `#region` blocks
- **`add-unit-tests.prompt.md`** — A prompt file for generating tests (our agent would be a more powerful, autonomous version of this)
- **Existing tests in `backend/tests/Api.Tests/`** — `HealthControllerTests.cs` showing the team's preferred test patterns
- **`TestDataBuilders.cs`** — Establishing the pattern for test data generation

The agent's instructions need to align with all of these existing standards.

### Step 4: Write the YAML Frontmatter

```yaml
---
name: test-coverage
description: 'Analyzes codebase for coverage gaps and generates comprehensive unit/integration tests targeting 80%+ coverage'
---
```

**Design decisions:**

- **No `tools` property** — We omit it to give the agent access to ALL tools. A testing agent needs to read code, write tests, run `dotnet build`, run `dotnet test`, check for errors, and iterate. Restricting tools would hamper its effectiveness.
- **No `model` property** — We let the user choose their preferred model from the model picker.
- **No `handoffs`** — This is a self-contained, single-purpose agent. It analyzes, generates, validates, and reports. No need to chain to another agent.
- **No `target`** — Agent works in both VS Code and GitHub Copilot Coding Agent.

### Step 5: Write the Agent Instructions (Body)

Structure the body into clear sections:

#### 5a. Identity and Role

```markdown
# Role and Identity

You are a senior .NET testing specialist. Your sole focus is analyzing
codebases for test coverage gaps and generating comprehensive unit and
integration tests that target 80%+ code coverage.

You follow the project's established testing conventions defined in
`copilot-instructions.md` and match patterns found in existing test files.
```

**Why this matters:** The identity statement grounds the AI. Without it, the AI defaults to being a general-purpose assistant. By declaring expertise, you get more focused, higher-quality output.

#### 5b. Workflow Steps

```markdown
# Workflow

1. **Analyze** — Scan the codebase to identify all source classes and methods
   that lack test coverage. Check `backend/src/Api/` for controllers, services,
   repositories, middleware, and DTOs.

2. **Discover Patterns** — Read existing test files in `backend/tests/Api.Tests/`
   to learn the project's testing style, naming conventions, and helper utilities.

3. **Plan** — Create a coverage plan listing every class and method that needs
   tests, organized by architectural layer (Controller → Service → Repository →
   Middleware → Integration).

4. **Generate** — Write test classes one at a time, following the project's
   conventions. After writing each test class, run `dotnet build` to verify
   compilation.

5. **Validate** — Run `dotnet test` and verify all tests pass. If any test
   fails, diagnose the issue and fix it before proceeding.

6. **Report** — Summarize what was covered: total tests added, classes covered,
   and any remaining gaps.
```

#### 5c. Testing Standards (From the Repository)

````markdown
# Testing Standards

## Naming Convention
- Test methods: `{MethodName}_{Scenario}_{ExpectedResult}`
- Example: `GetHealth_WhenCalled_ReturnsOkWithHealthResponse`

## AAA Pattern (Mandatory)
Every test must have:
```csharp
// Arrange
var sut = new HealthController();

// Act
var result = await sut.GetHealth(CancellationToken.None);

// Assert
result.Should().NotBeNull();
```

## Organization
- One test class per source class
- Group related tests with `#region` blocks
- Test file path mirrors source path:
  `src/Api/Controllers/HealthController.cs`
  → `tests/Api.Tests/Controllers/HealthControllerTests.cs`

## Test Data
- Use `TestDataBuilders` static class for factory methods
- Factory methods have default parameter values for easy customization

## Mocking Strategy
- **Controllers:** Mock service interfaces
- **Services:** Mock repository interfaces
- **Repositories:** Use EF Core InMemory provider
- **Middleware:** Mock `HttpContext` pipeline
- **Integration:** Use `CustomWebApplicationFactory`
````

#### 5d. Rules and Constraints

```markdown
# Rules

- NEVER modify production code unless a bug prevents testing
- ALWAYS run `dotnet test` after writing tests to verify they pass
- ALWAYS match existing patterns found in the test project
- Use Moq for mocking, xUnit for test framework, no FluentAssertions unless
  already present in the project
- Include XML documentation comments on test classes
```

### Step 6: Save the File

Save the complete file to `.github/agents/test-coverage.agent.md` in your repository.

### Step 7: Push to the Repository

```bash
git add .github/agents/test-coverage.agent.md
git commit -m "feat(agents): add test-coverage custom agent"
git push origin main
```

## 6. Testing and Iterating on Your Agent

### Testing Locally in VS Code

1. Open the repository in VS Code
2. Open Copilot Chat (`⌘⇧I`)
3. Click the **Agents dropdown** at the top of the chat panel
4. Select **test-coverage**
5. Type a prompt and observe the behavior

#### Recommended Test Prompts

Start with simple, focused prompts to validate each aspect of the agent:

| Prompt | What It Tests |
|--------|---------------|
| `"Analyze the current test coverage and identify gaps"` | Does the agent scan the codebase correctly? |
| `"Add unit tests for HealthController"` | Does it follow the naming convention and AAA pattern? |
| `"Generate integration tests for TransactionIdMiddleware"` | Does it use `CustomWebApplicationFactory` correctly? |
| `"Run the tests and report the results"` | Does it execute `dotnet test` and interpret results? |

#### What to Check

- ✅ Agent correctly identifies existing tests in `tests/Api.Tests/`
- ✅ Generated tests follow the `{MethodName}_{Scenario}_{ExpectedResult}` naming convention
- ✅ Tests include `// Arrange`, `// Act`, `// Assert` comments
- ✅ Tests are organized with `#region` blocks
- ✅ Tests pass when run with `dotnet test`
- ✅ Agent does NOT modify production source code

### Testing with GitHub Copilot Coding Agent

You can also test the agent with the autonomous Coding Agent:

1. Create a GitHub Issue: *"Add comprehensive unit tests for all backend layers targeting 80% coverage"*
2. Assign the issue to Copilot
3. The Coding Agent will use the `test-coverage` agent's instructions (inherited from `copilot-instructions.md` and the agent file) when working on the issue
4. Review the generated PR for test quality

### Iteration Tips

After testing, you'll likely need to refine the agent. Common adjustments:

| Observation | Fix |
|-------------|-----|
| Agent writes tests that don't compile | Add explicit examples of correct patterns in the instructions |
| Agent modifies production code | Strengthen the "NEVER modify production code" rule; add it to multiple sections |
| Agent generates too many tests at once | Add a "one test class at a time" instruction with a build step between each |
| Agent doesn't follow naming convention | Add more concrete examples of correct vs. incorrect test names |
| Agent uses wrong mocking library | Be explicit: "Use Moq 4.x. Do not use NSubstitute or FakeItEasy." |

> **Key learning:** Agent instructions are like any code — they improve through iteration. Write, test, observe, refine.

### Using the Chat Debug View

The **Chat Debug View** is the primary tool for troubleshooting custom agents:

1. Click the **`...`** overflow menu in the Chat view
2. Select **Show Chat Debug View**
3. Alternatively, run `Developer: Show Chat Debug View` from the Command Palette (`⇧⌘P`)

This opens a panel showing:
- The **system prompt** that was sent to the model (including your agent's instructions)
- The **user prompt** and any context gathered
- **Tool invocations** — which tools were called and their results

Use this view to verify that your agent's instructions are being included in the prompt, that the correct tools are available, and to understand why the agent is behaving a certain way.

> **Note:** Some VS Code versions also offer a **Chat Customization Diagnostics** view (right-click in the chat conversation area → **Diagnostics**) that shows all loaded customization files and their load status. If this option is available in your version, it's useful for quickly checking whether your `.agent.md` file was detected and parsed without errors.

## 7. Real-World Examples from the Community

The [github/awesome-copilot](https://github.com/github/awesome-copilot/tree/main/agents) repository contains 100+ community-contributed agent examples. Here are particularly instructive ones, organized by pattern:

### Pattern 1: The Specialist Agent (Single-Purpose)

**Example: [Playwright Tester](https://github.com/github/awesome-copilot/blob/main/agents/playwright-tester.agent.md)**

```yaml
---
description: "Testing mode for Playwright tests"
name: "Playwright Tester Mode"
tools: ["changes", "codebase", "edit/editFiles", "fetch", "findTestFiles",
        "problems", "runCommands", "runTasks", "runTests", "search",
        "searchResults", "terminalLastCommand", "terminalSelection",
        "testFailure", "playwright"]
model: Claude Sonnet 4
---
```

**Key takeaway:** This agent explicitly lists its tools rather than allowing all, and specifies a model. The body follows an "explore first, code second" pattern — it navigates the website before writing tests. Our `test-coverage` agent uses a similar "analyze first" approach.

### Pattern 2: The Meta Agent (Agent That Builds Agents)

**Example: [Custom Agent Foundry](https://github.com/github/awesome-copilot/blob/main/agents/custom-agent-foundry.agent.md)**

```yaml
---
description: 'Expert at designing and creating VS Code custom agents'
name: Custom Agent Foundry
argument-hint: Describe the agent role, purpose, and required capabilities
model: Claude Sonnet 4.5
tools: ['vscode', 'execute', 'read', 'edit', 'search', 'web', 'agent',
        'github/*', 'todo']
---
```

**Key takeaway:** This is a meta-agent that helps you design other agents. It codifies the entire agent design process: requirements gathering → design → draft → review → refine → document. It includes a quality checklist and common agent archetypes. This is an excellent tool to use when starting your own agent design.

### Pattern 3: The TDD Workflow (Chained Agents)

**Examples: [TDD Red](https://github.com/github/awesome-copilot/blob/main/agents/tdd-red.agent.md) → [TDD Green](https://github.com/github/awesome-copilot/blob/main/agents/tdd-green.agent.md) → [TDD Refactor](https://github.com/github/awesome-copilot/blob/main/agents/tdd-refactor.agent.md)**

These three agents form a workflow chain following the classic Red-Green-Refactor TDD cycle:

1. **Red:** Write failing tests that describe desired behavior
2. **Green:** Write minimal implementation to make tests pass
3. **Refactor:** Improve code quality while keeping tests green

**Key takeaway:** Each agent in the chain has a narrow focus and specific constraints. The Red agent explicitly states "No production code written yet" and "NEVER write multiple tests at once." This constraint-driven design is what makes agents effective — they do one thing well.

### Pattern 4: The Migration Agent (Complex Orchestration)

**Example: [.NET Upgrade](https://github.com/github/awesome-copilot/blob/main/agents/dotnet-upgrade.agent.md)**

This agent handles .NET version upgrades with a structured analysis → plan → execute pattern. It's relevant to our planned `asp-migrator` agent, which will use handoffs and subagents for multi-step Classic ASP → .NET 8 + React migration.

### Pattern 5: The Platform Expert

**Example: [C# Expert](https://github.com/github/awesome-copilot/blob/main/agents/CSharpExpert.agent.md)**

A comprehensive C# and .NET specialist with detailed coding standards, testing best practices, and code coverage guidance. This agent demonstrates how to encode deep domain expertise in an agent file.

## 8. Using the Agent Builder Agent

One of the most powerful patterns is using an agent to build other agents. The [Custom Agent Foundry](https://github.com/github/awesome-copilot/blob/main/agents/custom-agent-foundry.agent.md) from the community collection does exactly this.

### How It Works

1. Copy the `custom-agent-foundry.agent.md` file into your `.github/agents/` folder
2. Select it from the Agents dropdown in Copilot Chat
3. Describe the agent you want to create:

```
I need an agent that reviews pull requests for security vulnerabilities
in our .NET 8 backend. It should be read-only (no code changes),
check for SQL injection, XSS, CSRF, and hardcoded credentials,
and produce a structured report.
```

4. The Agent Foundry will:
   - Ask clarifying questions about scope and constraints
   - Propose an agent structure with rationale for tool selections
   - Draft the complete `.agent.md` file
   - Explain its design decisions
   - Iterate on your feedback

### Why This Is Valuable

The Agent Foundry codifies best practices for agent design:

- **Tool Selection Strategy** — It knows which tools are appropriate for read-only vs. implementation vs. testing agents
- **Instruction Writing** — It produces well-structured instructions with identity statements, workflow steps, and constraints
- **Handoff Design** — It suggests workflow chains when appropriate
- **Quality Checklist** — It validates the output against a checklist of best practices

This is an excellent starting point when you're unsure how to structure a new agent.

## 9. Sharing Agents Across Teams and Organizations

### Repository-Level Sharing

The simplest way to share agents is to commit them to your repository's `.github/agents/` folder. Anyone who clones the repo automatically gets access to the agents.

```
your-repo/
└── .github/
    └── agents/
        ├── test-coverage.agent.md     ← Available to all repo users
        ├── api-builder.agent.md
        └── asp-migrator.agent.md
```

### Organization-Level Sharing

For agents that should be available across all repositories in a GitHub organization:

1. Create a `.github-private` repository in your organization (e.g., `your-org/.github-private`)
2. Add agents to the `agents/` folder in that repository
3. In VS Code, enable organization agents:

```json
// In VS Code settings.json:
{
  "github.copilot.chat.organizationCustomAgents.enabled": true
}
```

Organization-level agents appear in the Agents dropdown alongside personal and workspace agents. This is ideal for org-wide standards enforcement agents.

### Cross-Workspace Sharing (User Profile)

For personal agents you want everywhere:

1. Create the agent via **Chat: New Custom Agent** → **User profile**
2. The agent file is stored in your VS Code profile and travels with you across workspaces

### Recommended Structure for Teams

```
Organization Level (.github-private repo)
├── agents/
│   ├── org-code-reviewer.agent.md      ← Org-wide standards
│   └── org-security-scanner.agent.md   ← Security policies
│
Repository Level (each app repo)
├── .github/agents/
│   ├── test-coverage.agent.md          ← Repo-specific testing agent
│   └── api-builder.agent.md            ← Repo-specific builder agent
│
User Profile (per developer)
├── agents/
│   └── my-productivity.agent.md        ← Personal workflow agent
```

## 10. Best Practices and Common Pitfalls

### ✅ Do

| Practice | Why |
|----------|-----|
| **Start with the agent's identity** | A clear identity statement focuses the AI's responses. "You are a senior .NET testing specialist" works better than jumping straight into instructions. |
| **Use numbered workflow steps** | The AI follows numbered steps more reliably than unstructured prose. |
| **Include concrete examples** | Show correct test names, code patterns, and output formats. Examples are more effective than abstract rules. |
| **Match existing patterns** | Tell the agent to read existing code in the repo and follow the same patterns. This produces more consistent output. |
| **Iterate based on testing** | Run the agent, observe output, refine instructions. Agent development is iterative, just like code. |
| **Restrict tools for read-only agents** | A planning agent that can edit files is a liability. Use the `tools` property to enforce boundaries. |
| **Add validation steps** | Include "run `dotnet build`" and "run `dotnet test`" as explicit steps. This catches errors early. |

### ❌ Don't

| Anti-Pattern | Why It Fails |
|--------------|--------------|
| **Writing vague instructions** | "Write good tests" doesn't help. "Use AAA pattern with `// Arrange`, `// Act`, `// Assert` comments" does. |
| **Including too many responsibilities** | An agent that tests, builds APIs, reviews code, and manages deployments will do none of them well. One purpose per agent. |
| **Forgetting to test** | Always test the agent with real prompts before sharing it. What reads well in Markdown may not produce good AI behavior. |
| **Hardcoding file paths** | Use patterns like "scan the `backend/` directory" rather than absolute paths. |
| **Skipping the analyze step** | Agents that jump straight to generating code without first understanding the codebase produce lower-quality output. |
| **Ignoring existing standards** | If your repo has `copilot-instructions.md`, your agent inherits those. Don't contradict them. |

### Prompt Engineering Tips for Agent Instructions

1. **Be imperative** — "You MUST run `dotnet test` after writing each test class" is stronger than "You should run tests."
2. **Use negative constraints** — "NEVER modify production code unless a bug prevents testing" prevents common mistakes.
3. **Define success criteria** — "A test class is complete when all tests pass and the code compiles with zero warnings."
4. **Layer specificity** — Start general ("You are a testing specialist"), then get specific ("Use xUnit 2.x with Moq 4.x").
5. **Reference tools explicitly** — "Use `#tool:runCommands` to execute `dotnet test`" helps the AI know which tool to reach for.

## 11. What's Next — Building More Agents

The `test-coverage` agent was our first agent — chosen because it's the simplest to build and test. Here's what comes next in our development plan:

### Planned Agents

| Agent | Key New Concepts | Status |
|-------|------------------|--------|
| **test-coverage** | Single-purpose specialist, all tools, analyze→generate→validate | ✅ Complete |
| **api-builder** | References skills for code examples, multi-file scaffolding, handoff to `test-coverage` | 🔲 Next |
| **asp-migrator** | Handoffs for multi-step workflow, subagent orchestration, backend + frontend generation | 🔲 Planned |

### The `api-builder` Agent — What's Different

The `api-builder` agent introduces new concepts:

- **Skill References** — It reads the `dotnet-api-standards` skill for code examples (controller, DTO, repository patterns)
- **Multi-File Orchestration** — Scaffolds files in a specific order: DTO → Domain → Repository → Service → Controller → DI Registration → Tests
- **Handoffs** — After implementation, suggests a handoff to `test-coverage` for comprehensive testing

### The `asp-migrator` Agent — Most Complex

The `asp-migrator` agent is the most sophisticated:

- **Handoffs** for multi-step migration: Analyze Legacy → Create Backend → Create Frontend → Verify
- **Subagents** — Invokes `api-builder` for backend scaffolding and `test-coverage` for testing
- **Cross-Stack** — Handles both .NET 8 backend and React/TypeScript frontend

### Resources for Building Your Own

| Resource | What You'll Learn |
|----------|-------------------|
| [VS Code Custom Agents Docs](https://code.visualstudio.com/docs/copilot/customization/custom-agents) | Official reference for all agent properties and features |
| [Agent Configuration Reference](https://docs.github.com/en/enterprise-cloud@latest/copilot/reference/custom-agents-configuration) | Complete YAML frontmatter property reference |
| [Awesome Copilot Agents](https://github.com/github/awesome-copilot/tree/main/agents) | 100+ community examples covering every pattern |
| [Custom Agent Foundry](https://github.com/github/awesome-copilot/blob/main/agents/custom-agent-foundry.agent.md) | Meta-agent that helps you design new agents |
| [Agent Skills Developer Guide](./agent_skills_developer_guide.md) | Companion guide for building skills that agents reference |

## Appendix A: Quick-Start Template

Copy this template to create a new agent in seconds:

```markdown
---
name: my-agent-name
description: 'One-line description of what this agent does'
# tools: ['search', 'codebase', 'editFiles', 'runCommands']  ← uncomment to restrict tools
# handoffs:
#   - label: Next Step
#     agent: next-agent
#     prompt: Continue with the next phase
#     send: false
---

# Role

You are a [ROLE]. Your expertise is in [DOMAIN].

# Workflow

1. **Analyze** — [What to examine first]
2. **Plan** — [What to plan before acting]
3. **Execute** — [What to create or modify]
4. **Validate** — [How to verify correctness]
5. **Report** — [What to summarize]

# Standards

- [Convention 1]
- [Convention 2]

# Rules

- NEVER [constraint]
- ALWAYS [requirement]
```

## Appendix B: Troubleshooting

| Issue | Solution |
|-------|----------|
| Agent doesn't appear in dropdown | Verify the file is in `.github/agents/` and has the `.agent.md` extension |
| Agent ignores instructions | Check for syntax errors in YAML frontmatter; use the Chat Debug View (`...` → Show Chat Debug View) to verify instructions are included in the prompt |
| Agent can't use a tool | Verify the tool name is correct; use the Chat Debug View to check tool invocations |
| Agent contradicts copilot-instructions.md | Agent instructions are added *on top of* base instructions — don't contradict them |
| Agent produces inconsistent output | Add more concrete examples and stricter constraints |
| YAML parsing error | Ensure proper indentation, use single quotes for strings with special characters |
