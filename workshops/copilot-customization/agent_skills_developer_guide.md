---
title: Agent Skills Developer Guide
description: Step-by-step walkthroughs from Hello World to production-ready skills for React component standardization and API development
sidebar_position: 4
---

# Agent Skills Developer Guide

**Step-by-Step Walkthroughs for Building Skills**

From Hello World to production-ready skills for React component standardization and API development, here we will walk through the process of building agent skills with practical examples. Each walkthrough builds on the last, introducing new patterns and best practices for creating effective, reusable skills that work with GitHub Copilot and Claude Code.

## 1. Prerequisites and Setup

Before building agent skills, make sure your environment is ready. Skills are an open standard supported by GitHub Copilot (VS Code, CLI, and coding agent) and Claude Code. Skills you create for one also work with the other.

### Requirements

- Visual Studio Code (v1.108 or later recommended for agent skills support)
- GitHub Copilot extension installed and an active Copilot subscription (Free, Pro, or Enterprise)
- Agent Skills preview enabled: set `chat.useAgentSkills` to `true` in VS Code settings
- A workspace (Git repository) where you can create the skill directory structure
- Get a copy of the [dotnet-react-starter-demo repo](https://github.com/copilot-academy/dotnet-react-starter-demo)

### Enable Agent Skills in VS Code

```json
// In VS Code settings.json:
{
  "chat.useAgentSkills": true
}
```

### Directory Structure

All project-level skills live under `.github/skills/` in your repository root. Each skill gets its own subdirectory with a `SKILL.md` file and optional resource folders.

```
your-project/
├── .github/
│   └── skills/
│       ├── skill-name-one/
│       │   ├── SKILL.md           # Required: main skill file
│       │   ├── scripts/           # Optional: executable code
│       │   │   ├── setup.sh
│       │   │   └── validate.py
│       │   ├── references/        # Optional: documentation
│       │   │   └── api-patterns.md
│       │   ├── assets/            # Optional: templates, images
│       │   │   └── component.tsx
│       │   └── examples/          # Optional: worked examples
│       │       └── sample.test.ts
│       └── skill-name-two/
│           ├── SKILL.md
│           ├── scripts/
│           │   └── helper.js
│           └── src/
│               └── package.json
```

> **INFO:** Skill directory names should be lowercase with hyphens for spaces, matching the `name` field in your SKILL.md frontmatter. The `scripts/`, `references/`, and `assets/` subdirectories are optional but follow the convention established by Anthropic's skill-creator reference skill.

## 2. Anatomy of an Agent Skill

Every agent skill has the same structure: a `SKILL.md` file with YAML frontmatter and a Markdown body, optionally accompanied by supporting files organized in subdirectories.

### The SKILL.md File

```markdown
---
name: my-skill-name
description: >
  A clear description of what this skill does
  and when Copilot should use it. Include keywords
  that help with prompt matching.
---

# Skill Title

Detailed instructions that Copilot follows
when this skill is activated.

## Steps
1. First step with clear instructions
2. Run a script: [validate](./scripts/validate.py)
3. Reference docs: [patterns](./references/patterns.md)
```

### Frontmatter Fields

| Field | Required | Purpose |
|-------|----------|---------|
| `name` | Yes | Unique lowercase identifier with hyphens (e.g., `webapp-testing`) |
| `description` | Yes | What the skill does and when to use it. **Critical:** Copilot matches prompts to skills based on this text. Include all trigger keywords here, NOT in the body. |

### Bundled Resource Directories

| Directory | Contents | When to Use |
|-----------|----------|-------------|
| `scripts/` | Executable code (Python, Bash, JS) | When the same code would be rewritten repeatedly or deterministic reliability is needed. Token-efficient: scripts can run without loading into context. |
| `references/` | Documentation and reference material | For detailed info Copilot should reference while working (schemas, API docs, policies). Keeps SKILL.md lean. |
| `assets/` | Templates, images, boilerplate | When the skill needs files used in the final output (logos, component templates, font files). |

### Progressive Disclosure Model

- **Level 1 — Metadata:** At startup, only `name` and `description` from every skill's frontmatter are loaded. This lets Copilot know what skills exist without consuming context.

- **Level 2 — Full instructions:** When Copilot determines a skill matches your prompt, the entire SKILL.md body is loaded into context.

- **Level 3 — Referenced files:** If SKILL.md references additional files (scripts, references, assets), Copilot loads them only when needed. Scripts can be executed without loading into context.

> **TIP:** Write your description as if telling a colleague when to reach for this skill. Include the domain, capabilities, and trigger phrases. This is the single most important factor in whether your skill activates correctly.

## 3. Walkthrough 1: Hello World Skill

This walkthrough creates a simple skill that validates your entire setup. It demonstrates auto-activation, instruction following, the `scripts/` folder pattern, and how Copilot can execute bundled JavaScript to gather real system information.

### What You Will Build

A skill called `hello-world` that, when a user asks Copilot to "create a greeting" or "show a welcome message," runs a bundled Node.js script to gather the user's system information (OS, Node version, username) and displays it alongside "Hello GH Copilot" in ASCII art.

### Step 1: Create the Directory Structure

```bash
mkdir -p .github/skills/hello-world/scripts
```

### Step 2: Create the Greeting Script

Create `.github/skills/hello-world/scripts/greet.js`. This Node.js script gathers system info and prints ASCII art:

```javascript
#!/usr/bin/env node
const os = require('os');

const asciiArt = `
 _   _      _ _        ____ _   _
| | | | ___| | | ___  / ___| | | |
| |_| |/ _ \\ | |/ _ \\ | |  _| |_| |
|  _  |  __/ | | (_) || |_| |  _  |
|_| |_|\\___|_|_|\\___/  \\____|_| |_|

  ____            _ _       _
 / ___|___  _ __ (_) | ___ | |_
| |   / _ \\| '_ \\| | |/ _ \\| __|
| |__| (_) | |_) | | | (_) | |_
 \\____\\___/| .__/|_|_|\\___/ \\__|
           |_|
`;

const info = {
  username: os.userInfo().username,
  platform: `${os.type()} ${os.release()}`,
  arch: os.arch(),
  nodeVersion: process.version,
  cpus: os.cpus().length,
  totalMemory: `${(os.totalmem()/1024/1024/1024).toFixed(1)} GB`,
  hostname: os.hostname(),
};

console.log(asciiArt);
console.log('=== System Information ===');
Object.entries(info).forEach(
  ([key, val]) => console.log(` ${key}: ${val}`)
);
console.log('========================');
```

### Step 3: Create the SKILL.md File

Create `.github/skills/hello-world/SKILL.md`:

```markdown
---
name: hello-world
description: >
  Generate a friendly project greeting, welcome
  message, or system info display. Use when asked
  to create a greeting, show a welcome message,
  display system information, or introduce the
  project workspace.
---

# Hello World Greeting Generator

## Instructions

When asked to create a greeting or welcome message:

1. Run the greeting script to collect system info
   and display ASCII art:
   [greet.js](./scripts/greet.js)
   
   Execute with: `node .github/skills/hello-world/scripts/greet.js`

2. Present the script output to the user

3. Add a brief summary below the output:
   - The project name (from package.json or the workspace folder name)
   - The primary language/framework detected
   - A motivational closing line

## Output Format

Show the ASCII art and system info from the
script first, then append a Markdown summary:

> Welcome to **ProjectName**!
> Running on [platform] with Node [version].
> Happy coding!
```

### Step 4: Verify the Skill is Detected

Open VS Code in your workspace. To confirm the skill is loaded, you have two options:

- **Prompt in Chat:** In Agent mode, type `What skills do you have?` — Copilot should read from the skill and include `hello-world` in its response.

- **Check the System Prompt:** Open the Chat logs in the Output panel (select `editAgent` from the dropdown). Scroll to the bottom of the System Prompt section — you should see the skill's name and description listed there.

### Step 5: Test the Skill

In Copilot Chat (Agent mode), type:

```
Show me a welcome greeting with my system info
```

Verify you see the ASCII art, correct OS/Node details, and the project summary. If the script doesn't execute, make sure you are in Agent mode (not Ask mode).

> **TIP:** This skill validates your entire setup: directory structure, frontmatter parsing, description-based matching, instruction following, AND the `scripts/` execution pattern. If this works, you're ready for more complex skills.

## 4. Walkthrough 2: Using the Skill Creator

Anthropic publishes a reference skill called `skill-creator` in their public skills repository (github.com/anthropics/skills). This skill teaches your AI agent how to build other skills following a structured process with best practices baked in. Rather than manually creating every file from scratch, you can install it and let it guide the process.

### What the Skill Creator Does

When you ask Copilot to "create a new skill" with the skill-creator installed, it walks through a structured six-step process:

- **Step 1 — Understand with examples:** Asks what functionality the skill should support, what triggers it, and gathers concrete usage examples from you.

- **Step 2 — Plan reusable contents:** Analyzes each example to identify what scripts, references, and assets would be helpful to bundle.

- **Step 3 — Initialize the skill:** Runs an `init_skill.py` script that scaffolds the directory with SKILL.md, `scripts/`, `references/`, and `assets/` folders with template files.

- **Step 4 — Edit and populate:** Writes the SKILL.md frontmatter and body, creates bundled resources, and tests any scripts by actually running them.

- **Step 5 — Package:** Runs `package_skill.py` that validates and bundles the skill into a distributable `.skill` file.

- **Step 6 — Iterate:** After real-world use, refine the skill based on observed performance.

### Installing the Skill Creator

**Step 1: Copy the skill-creator to your project**

```bash
# Clone the anthropics/skills repository
git clone https://github.com/anthropics/skills.git /tmp/anthropic-skills

# Copy the skill-creator into your project
cp -r /tmp/anthropic-skills/skills/skill-creator .github/skills/skill-creator
```

**Step 2: Verify it loads in VS Code**

To verify it loaded, ask `What skills do you have?` in Agent mode chat. Alternatively, open the Output panel, select `editAgent` from the dropdown, and check that `skill-creator` appears in the System Prompt's skill list at the bottom.

**Step 3: Use it to create a new skill**

In Copilot Chat (Agent mode), prompt:

```
Create a new skill for generating database
migration files following our team's conventions
```

The skill-creator will engage you in a conversation: asking what your conventions are, what examples look like, then scaffolding the entire skill directory with SKILL.md, scripts, and reference docs.

### Key Design Principles from the Skill Creator

The skill-creator encodes best practices from Anthropic's experience building production skills:

- **Concise is key:** The context window is shared. Only add context the agent doesn't already have. Challenge each piece: "Does this justify its token cost?"

- **Degrees of freedom:** Match specificity to task fragility. High freedom (text instructions) for flexible tasks, low freedom (scripts with few parameters) for fragile operations.

- **Description is the trigger:** All "when to use" information belongs in the description, not the body. The body loads only after triggering, so trigger guidance there is wasted.

- **Test scripts by running them:** Any scripts added must be actually executed to verify they work. Do not ship untested code.

- **Delete what you don't need:** Remove example files from initialization that aren't relevant. Extra files add clutter and confusion.

> **NOTE:** The skill-creator's `init_skill.py` and `package_skill.py` scripts are designed primarily for use with Claude Code. In GitHub Copilot, you may need to run these scripts manually in the terminal or adapt the workflow to use Copilot's agent mode terminal tool.

## 5. Walkthrough 3: React Component Standards

This skill enforces your team's React and TypeScript front-end standards. When a developer asks Copilot to create or modify React components, this skill loads and ensures generated code follows your conventions for file structure, naming, styling, testing, and accessibility.

### What You Will Build

- A skill that auto-activates when working on React components
- A component template in `assets/` as the starting scaffold
- A styles reference in `references/` defining design system tokens
- An example test in `examples/` showing expected test patterns

### Step 1: Create the Skill Directory

```bash
mkdir -p .github/skills/react-component-standards/{assets,references,examples}
```

### Step 2: Create the SKILL.md File

````markdown
---
name: react-component-standards
description: >
  Enforce team React and TypeScript component
  standards. Use when creating, modifying, or
  reviewing React components, forms, pages, or
  UI elements. Covers file structure, naming,
  hooks, styling, accessibility, and testing.
---

# React Component Standards

## File Structure Rules

Every component MUST follow this layout:

```
src/components/ComponentName/
├── index.ts              # Re-export only
├── ComponentName.tsx     # Implementation
├── ComponentName.test.tsx # Unit tests
├── ComponentName.module.css # CSS Modules
└── ComponentName.types.ts   # TypeScript types
```

## Component Template

Use this starting scaffold:
[component-template.tsx](./assets/component-template.tsx)

## Naming Conventions

- Components: PascalCase (e.g., UserProfile)
- Props: ComponentNameProps interface
- Hooks: use + PascalCase (e.g., useUserData)
- Handlers: handle + Event (e.g., handleClick)
- Boolean props: is/has/should prefix

## Code Standards

- Functional components with arrow functions
- Explicit TypeScript types for all props
- NAMED exports only (never default export)
- Destructure props in the function signature
- React.memo() for complex object props

## Styling

- CSS Modules exclusively (no inline styles)
- Design tokens from: [styles-guide.md](./references/styles-guide.md)

## Accessibility

- Interactive elements: aria-labels required
- Images: alt text required
- Semantic HTML elements
- Keyboard navigation support

## Testing

- Every component MUST have a .test.tsx file
- React Testing Library (not Enzyme)
- Minimum: render test + one interaction test
- Example: [UserCard.test.tsx](./examples/UserCard.test.tsx)
````

### Step 3: Create the Component Template

Create `assets/component-template.tsx`:

```tsx
import React from 'react';
import styles from './ComponentName.module.css';
import { ComponentNameProps } from './ComponentName.types';

export const ComponentName: React.FC<ComponentNameProps> = ({
  className,
  ...rest
}) => {
  return (
    <div
      className={`${styles.root} ${className ?? ''}`}
      {...rest}
    >
      {/* Component content */}
    </div>
  );
};
```

### Step 4: Create Reference and Example Files

Create `references/styles-guide.md` with your design tokens (colors, spacing, typography). Create `examples/UserCard.test.tsx` with a sample test using React Testing Library. These files are only loaded by Copilot when it needs them.

### Step 5: Test the Skill

```
Create a UserProfile component that displays
a user's avatar, name, and email address
```

Verify: named export, arrow function, TypeScript types, CSS Modules, correct file structure, and a co-located test file.

> **NOTE:** If the skill doesn't trigger, expand the description with more keywords matching how developers naturally ask for React work ("component," "form," "page," "UI," "widget").

## 6. Walkthrough 4: API Builder Skill

This skill standardizes REST API endpoint creation with patterns for route structure, validation, error handling, database access, auth, and response formatting. It demonstrates multi-file skills with scripts, references, and assets.

### What You Will Build

- A skill that activates when building API routes, endpoints, or controllers
- A route template in `assets/` as the standard scaffold
- Error handling and validation guides in `references/`
- A worked CRUD example in `examples/`

### Step 1: Create the Skill Directory

```bash
mkdir -p .github/skills/api-builder/{assets,references,examples,scripts}
```

### Step 2: Create the SKILL.md File

````markdown
---
name: api-builder
description: >
  Build REST API endpoints following team
  standards. Use when creating, modifying, or
  reviewing API routes, controllers, endpoints,
  middleware, or backend services. Covers Express
  and Node.js patterns for routing, validation,
  error handling, auth, and database access.
---

# API Builder Standards

## Architecture

All APIs use a layered architecture:

```
src/
├── routes/        # Route definitions only
├── controllers/   # Request/response handling
├── services/      # Business logic
├── repositories/  # Database access
├── middleware/    # Auth, validation, logging
└── validators/    # Zod schemas
```

## Route Template

Start from: [route-template.ts](./assets/route-template.ts)

## Request Validation

- EVERY endpoint MUST validate with Zod schemas
- See: [validation-guide.md](./references/validation-guide.md)

## Error Handling

- Custom error classes extending AppError
- NEVER send raw errors to clients
- Standard: status code, error code, message, reqId
- See: [error-handling.md](./references/error-handling.md)

## Response Format

```json
{
  "success": true,
  "data": { ... },
  "meta": { "requestId": "uuid" }
}
```

## Authentication

- JWT Bearer tokens in Authorization header
- authMiddleware on all protected routes
- requireRole() for role-based access

## Database Access

- Repository pattern exclusively
- One repository per entity
- Transactions for multi-step operations

## Testing

- Integration tests with supertest
- Test: happy path, validation, auth, not-found
- Example: `users.test.ts`
````

### Step 3: Create Supporting Files

Create `assets/route-template.ts` with your standard CRUD route pattern using Express Router, authenticate middleware, and Zod validation. Create `references/error-handling.md` and `references/validation-guide.md` documenting your error classes and schema conventions.

### Step 4: Test the Skill

```
Create a full CRUD API for a 'products' resource
with fields: name, price, category, inStock
```

Verify: route file matching your template, controller with error handling, service layer, repository, Zod schemas, and test file — all following the layered architecture.

> **TIP:** Progressive disclosure keeps this skill efficient. Copilot only loads error handling or validation guides when it actually needs them.

## 7. Testing and Debugging Skills

### Verifying Skills Are Loaded

There are two reliable ways to confirm your skills are detected by Copilot:

- **Ask Copilot directly:** In Agent mode, prompt `What skills do you have?` — Copilot reads from the loaded skills and lists them in its response.

- **Inspect the System Prompt:** Open the Output panel in VS Code (View → Output), then select `editAgent` from the channel dropdown. Scroll to the bottom of the System Prompt — each loaded skill's name and description will appear there. This is the most definitive way to confirm detection and frontmatter parsing.

### Testing Checklist

| Test | How to Verify | Fix if Failing |
|------|---------------|----------------|
| Skill detection | Ask 'What skills do you have?' in chat, or check editAgent output panel for skill in System Prompt | Verify `.github/skills/name/SKILL.md` path |
| Frontmatter parsing | Name and description visible in editAgent System Prompt | Check YAML syntax (colons, quotes) |
| Activation | Prompt triggers correct behavior | Expand description with more keywords |
| Instruction following | Output matches SKILL.md guidelines | Make instructions more explicit |
| Script execution | Script runs and output appears | Check script path, permissions, runtime |
| File references | Template content in output | Check relative paths in Markdown links |
| Non-activation | Unrelated prompts don't trigger | Narrow description to avoid false matches |

### Common Issues

- **Skill not appearing:** Verify `chat.useAgentSkills` is enabled, file is named exactly `SKILL.md` (case-sensitive), path is `.github/skills/` or `~/.copilot/skills/`.

- **Skill not activating:** Description lacks keywords matching prompt. Add more trigger phrases and synonyms.

- **Script not executing:** Ensure you are in Agent mode (not Ask mode). Verify the script path and runtime (node, python) are available.

- **Partial instruction following:** SKILL.md may be too long or ambiguous. Prioritize important rules at the top. Use numbered steps.

## 8. Sharing and Distribution

Skills follow an open standard and work across GitHub Copilot and Claude Code. You can share them with your team or the community.

### Sharing with Your Team

Commit skills to your repository under `.github/skills/`. Every team member who clones the repo immediately gets access. Document your skills in `CONTRIBUTING.md`.  Skills can also be distributed in plugins with other components.

### Community Resources

- **[github/awesome-copilot](https://github.com/github/awesome-copilot):** Community-curated collection of skills, agents, instructions, and prompts for GitHub Copilot.

- **[anthropics/skills](https://github.com/anthropics/skills):** Reference skills from Anthropic, including the skill-creator, document processing skills (PPTX, XLSX, DOCX, PDF), and creative skills demonstrating advanced patterns.

- **[skills.sh](https://skills.sh) / [agentskills.io](https://agentskills.io):** Directories for discovering and installing skills, with documentation on the agent skills specification.

### Cross-Agent Compatibility

| Agent | Skill Location | Status |
|-------|----------------|--------|
| GitHub Copilot (VS Code) | `.github/skills/` or `~/.copilot/skills/` | Supported (preview) |
| GitHub Copilot CLI | `.github/skills/` or `~/.copilot/skills/` | Supported (preview) |
| Copilot Coding Agent | `.github/skills/` | Supported |
| Claude Code | `.claude/skills/` (also reads `.github/skills/`) | Supported |

> **NOTE:** Always review community-contributed skills before using them. Skills can include scripts that may execute in your environment. Verify instructions and bundled scripts meet your security standards.

## 9. Advanced Patterns

### Multi-File Skills with Progressive Disclosure

For complex domains, keep core SKILL.md under ~500 lines. Move specialized info to reference files. Copilot loads them only when needed.

```
.github/skills/data-pipeline/
├── SKILL.md                    # Core: common patterns
├── scripts/
│   ├── validate-schema.sh      # Executable helper
│   └── generate-migration.py
├── references/
│   ├── etl-patterns.md         # ETL workflows
│   └── streaming-guide.md      # Kafka/streaming
└── assets/
    └── pipeline-template/      # Boilerplate files
```

### Including Executable Scripts

Scripts in `scripts/` can be executed by Copilot without loading into context, saving tokens while providing deterministic reliability. Ideal for operations that would otherwise require rewriting the same code each time.

> **INFO:** Skills should only install packages locally (not globally) to avoid interfering with the user's environment. Use project-local dependencies wherever possible.

### Composing Skills with Instructions and Agents

- **Instructions** (`.github/copilot-instructions.md`) set the always-on baseline context
- **Skills** (`.github/skills/`) provide specialized capabilities that auto-activate based on task
- **Agents** (`.github/agents/`) orchestrate session-level workflows with specific tools
- **Prompt files** (`.github/prompts/`) define on-demand workflows triggered by `/commands`

### Writing Better Descriptions

- State the domain clearly ("React components," "API endpoints," "database migrations")
- List specific actions covered ("create, modify, review, test")
- Include natural language trigger phrases users might type
- Mention specific technologies ("Express, Zod, Playwright, PostgreSQL")
- Stay concise but keyword-rich — 2-4 lines maximum
- Put ALL "when to use" guidance in the description, never in the body

> **TIP:** Think of the description as a search engine index for your skill. The more relevant keywords, the more accurately Copilot will match prompts. But keep it truthful — false matches are worse than missed ones.
