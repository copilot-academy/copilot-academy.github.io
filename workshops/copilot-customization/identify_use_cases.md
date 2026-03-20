---
title: Identify Use Cases
description: Discover where GitHub Copilot customization delivers the most value for your team
sidebar_position: 3
---

# Identify Use Cases

Before you build a single skill or agent, you need to know **where to aim**. The teams that get the most value from Copilot customization aren't the ones that build the most — they're the ones that build for the right problems.

This module walks you through a structured discovery exercise to map your entire development lifecycle, surface the hidden friction, and identify the highest-impact opportunities for customization.

## What You'll Learn

- How to map your development value stream from idea to production
- A question-driven framework for surfacing automation opportunities at every stage
- How to categorize discoveries by customization mechanism (instructions, prompts, skills, agents, MCP)
- A prioritization model for deciding what to build first

## 1. Map Your Value Stream

Every piece of software follows a journey from **idea** to **running in production**. The specifics vary by team, but the stages are broadly the same. Your goal is to map *your* version of this value stream and then mine it for opportunities.

Here's a typical development value stream:

```text
┌─────────┐   ┌─────────┐   ┌─────────┐   ┌─────────┐   ┌─────────┐   ┌─────────┐   ┌─────────┐   ┌─────────┐
│  Idea   │──▶│  Plan   │──▶│  Code   │──▶│  Test   │──▶│ Review  │──▶│ Deploy  │──▶│ Operate │──▶│ Monitor │
└─────────┘   └─────────┘   └─────────┘   └─────────┘   └─────────┘   └─────────┘   └─────────┘   └─────────┘
```

> **TIP:** Your value stream might look different. You may have additional stages like design, security review, compliance, documentation, or release management. Add them. The more complete the map, the more opportunities you'll find.

### Exercise: Draw Your Value Stream

Take 5 minutes and sketch your team's actual value stream. Don't idealize it — capture what really happens.

1. List every stage a change goes through from "someone has an idea" to "it's running in production and being monitored"
2. For each stage, note **who** does the work and **what tools** they use
3. Mark the handoff points between people or systems
4. Circle the stages where work gets stuck, delayed, or dropped

## 2. Discovery: Question Every Stage

Now walk through each stage of your value stream and ask the following questions. **Write down your answers** — they become your backlog of customization opportunities.

### Idea & Planning

| Question | Your Answer |
|----------|-------------|
| How do you capture and refine requirements? | |
| What does your issue or ticket template look like? Do you wish it were better? | |
| How do you break down epics into implementable tasks? | |
| Do you create specs or design docs? Who writes them? | |
| How do you estimate effort? | |

**Common opportunities:**
- A prompt or skill that generates well-structured issues from rough ideas
- An agent that creates implementation specs from product requirements
- A skill that breaks down epics into sized tasks with acceptance criteria

### Code

| Question | Your Answer |
|----------|-------------|
| What do you do repeatedly every time you write code? (boilerplate, patterns, imports) | |
| What multi-step workflows do you follow? (e.g., create component → add test → register route → update docs) | |
| What standards or conventions must code follow? (naming, structure, patterns) | |
| What specialty knowledge does your codebase require? (domain models, internal APIs, business rules) | |
| Where do you copy-paste from existing code as a starting point? | |

**Common opportunities:**
- Code generation instructions that enforce your standards automatically
- Skills that scaffold multi-file features following your project's conventions
- Custom instructions that encode domain knowledge so the agent knows your business logic

### Test

| Question | Your Answer |
|----------|-------------|
| What kinds of tests do you write? (unit, integration, e2e, performance) | |
| How much of your testing is manual vs. automated? | |
| What's your test data strategy? How painful is it? | |
| What test patterns or frameworks does your team use? | |
| What testing do you skip because it's too tedious? | |

**Common opportunities:**
- A skill that generates tests following your exact framework and patterns
- An agent that creates test data matching your schema
- Instructions that ensure every code change includes appropriate test coverage

### Review

| Question | Your Answer |
|----------|-------------|
| What do reviewers check for beyond correctness? (security, performance, accessibility, compliance) | |
| What are the most common review comments? (the ones you'd love to never write again) | |
| How long do PRs wait for review? | |
| Do you have a PR template? Does it actually get filled out well? | |

**Common opportunities:**
- Custom instructions that address your top review feedback patterns before code is submitted
- A skill that generates thorough PR descriptions from diffs
- Copilot code review with custom review instructions for your org
- A custom review agent that automatically runs after code generation

### Deploy & Release

| Question | Your Answer |
|----------|-------------|
| How many manual steps are in your deployment? | |
| What goes wrong most often during deploys? | |
| How do you handle configuration across environments? | |
| What's your rollback process? | |
| Do you write release notes? How? | |

**Common opportunities:**
- A skill that generates release notes from merged PRs
- An agent that creates deployment checklists
- Instructions for generating environment-specific configuration

### Operate & Monitor

| Question | Your Answer |
|----------|-------------|
| How do you triage incidents? | |
| What's your runbook situation? (current? complete? machine-readable?) | |
| How do you investigate production issues? What logs and tools do you check? | |
| How do you turn incidents into preventive improvements? | |

**Common opportunities:**
- An agent that assists with incident triage using your runbooks
- A skill that generates post-incident improvement tickets
- MCP integrations that give your agent access to monitoring and logging tools

## 3. The Questions That Reveal the Best Opportunities

Beyond the stage-by-stage walkthrough, these cross-cutting questions often surface the highest-value use cases:

### What do you do on a repeated basis?

Repetition is the strongest signal. If you do something more than twice, it's a candidate for a skill or instruction. Think about:
- Boilerplate you write for every new feature
- Steps you follow every time you fix a bug
- Patterns you apply whenever you create a new service, component, or endpoint

### Is this a workflow that takes multiple steps?

Multi-step workflows are where agents and skills shine brightest. A single code completion is helpful, but an agent that executes an entire workflow — scaffold, implement, test, document — is transformative. Map the steps and ask if an agent could handle most of them.

### What could you automate with intelligence from idea to production?

Some automation is simple (scripts, CI/CD). But intelligent automation — where the system needs to *reason* about code, context, and intent — is where Copilot customization excels. Look for places where the automation needs judgment, not just execution.

### Where is friction?

Friction shows up as:
- Context switching between tools
- Waiting for someone else
- Tasks that are disproportionately tedious relative to their value
- Work that requires tribal knowledge trapped in someone's head

### What tasks do you never get to?

Every team has a backlog of "we really should..." items: improving documentation, adding test coverage, refactoring technical debt, standardizing patterns. These are often perfect for AI because the work is well-understood but competes with higher-priority feature work.

### What are all the tools you interact with?

List every tool, platform, and service your team uses. Each one is a potential MCP integration point. Think beyond the obvious:
- Issue trackers, CI/CD, source control
- Monitoring, logging, APM tools
- Internal wikis, Confluence, Notion
- Slack, Teams, email
- Databases, APIs, cloud consoles
- Design tools, Figma, Storybook

### What specialty knowledge do you need? Your agent needs it too.

If a new team member would need weeks to ramp up on your domain, your agent needs that same knowledge. Identify:
- Domain-specific terminology and business rules
- Internal API contracts and data models
- Architectural decisions and their rationale
- Compliance or regulatory requirements
- Undocumented conventions that "everyone just knows"

This knowledge becomes your custom instructions, reference documentation, and skill content.

## 4. Categorize: Map Discoveries to Customization Mechanisms

Now take everything you've written down and categorize it. Each opportunity maps to one or more customization mechanisms:

| Customization Mechanism | Best For | Examples |
|------------------------|----------|----------|
| **Custom Instructions** (`.github/copilot-instructions.md`) | Standards, conventions, and context that should always apply | Coding standards, naming conventions, architectural patterns, domain terminology |
| **Prompt Files** (`.github/prompts/*.prompt.md`) | Repeatable tasks you trigger on demand | Generating components, creating tests, writing migration scripts |
| **Agent Skills** (`.github/skills/`) | Multi-step workflows with supporting scripts and references | Feature scaffolding, API endpoint generation, test suite creation |
| **Custom Agents** (`.github/agents/*.agent.md`) | Specialized personas with curated tools and context | Security reviewer, database migration specialist, onboarding assistant |
| **MCP Integrations** | Connecting to external tools and data sources | Issue trackers, monitoring tools, databases, internal APIs |
| **Agentic Workflows** | Automated tasks that improve daily life | Issue triage, documentation updates, code quality fixes, burning through backlog |

### Exercise: Sort Your Backlog

Go through your list of opportunities and tag each one with the mechanism that fits best. Some may combine multiple mechanisms — that's fine.

## 5. Prioritize: What to Build First

You probably have more ideas than time. Use this framework to decide where to start:

### The Impact/Effort Matrix

```text
                    HIGH IMPACT
                        │
        ┌───────────────┼───────────────┐
        │               │               │
        │   Quick Wins  │   Big Bets    │
        │  (Start here) │  (Plan these) │
        │               │               │
  LOW ──┼───────────────┼───────────────┼── HIGH
 EFFORT │               │               │  EFFORT
        │   Nice to     │   Avoid       │
        │   Have        │   (for now)   │
        │               │               │
        └───────────────┼───────────────┘
                        │
                    LOW IMPACT
```

### Scoring Criteria

Rate each opportunity on these dimensions:

| Dimension | Question to Ask |
|-----------|----------------|
| **Frequency** | How often does this happen? Daily > weekly > monthly |
| **Pain** | How frustrating or time-consuming is it today? |
| **Reach** | How many people on the team would benefit? |
| **Feasibility** | Can this be built with current customization mechanisms? |
| **Build effort** | How long would it take to create and test? |

> **TIP:** Start with the **Quick Wins** — high-frequency, high-pain tasks that can be solved with a simple instruction or prompt file. Early wins build momentum and teach your team how customization works before taking on bigger projects.

### Suggested Starting Order

1. **Custom instructions** — Set up your `.github/copilot-instructions.md` with your team's coding standards and domain context. Immediate improvement, minimal effort.
2. **Prompt files** — Pick your most repeated task and turn it into a reusable prompt. You'll see value on day one.
3. **A first skill** — Choose a multi-step workflow your team does frequently and build a skill for it. The [Agent Skills Developer Guide](/workshops/copilot-customization/agent_skills_developer_guide) walks you through this.
4. **A custom agent** — Once you're comfortable with skills, compose them into a specialized agent for a specific role.
5. **MCP integrations** — Connect your agents to the external tools where work happens.

**Agentic Workflows** can be sprinkled in at any point once you have some skills and agents built. They're a powerful way to automate repetitive tasks.

## 6. Real-World Examples

Here are patterns teams commonly discover during this exercise:

| Discovery | Customization Built |
|-----------|-------------------|
| "We copy the same component structure every time" | **Skill:** React component scaffolder with tests, stories, and index exports |
| "New devs don't know our API conventions" | **Instructions:** API design standards with endpoint naming, error handling, and pagination patterns |
| "PR descriptions are always incomplete" | **Prompt:** PR description generator that pulls context from linked issues and code changes |
| "We spend hours triaging dependabot PRs" | **Agent:** Dependency update reviewer that checks changelogs and runs tests |
| "Nobody writes ADRs even though we should" | **Prompt:** ADR generator that interviews the developer about the decision |
| "Incident response follows a runbook nobody reads" | **Agent:** Incident responder with MCP access to monitoring tools and runbook knowledge |
| "Our internal SDK has no docs" | **Skill:** SDK documentation generator that reads source code and produces usage guides |
| "Test data setup takes longer than writing the test" | **Skill:** Test fixture generator that understands your schema and relationships |
| "Docs are always out of date" | **Agentic Workflows:** Daily Documentation Updater syncs docs with code changes automatically | 
| "Security fixes get deferred" | **Agentic Workflows:** Security Fix PR auto-creates PRs for known vulnerabilities |

## Wrapping Up

The goal of this exercise is not to build everything! It's to **see everything**. When you map your full value stream and interrogate each stage, you shift from "I wonder what Copilot can do" to "I know exactly what I need it to do."

Keep your prioritized list. As you work through the remaining modules, building skills, creating agents, adding integrations, you'll have a clear picture of what to build and why it matters.

## Next Steps

With your use cases identified and prioritized, continue to the [Agent Skills Developer Guide](/workshops/copilot-customization/agent_skills_developer_guide) to start building your first skill.
