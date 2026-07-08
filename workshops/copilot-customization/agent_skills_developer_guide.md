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

- Visual Studio Code v1.120 or greater recommended (v1.108 or later is necessary for agent skills support)
- GitHub Copilot extension installed and an active Copilot subscription 
- An empty workspace (Git repository) where you can create the skill directory structure
- Get a copy of the [dotnet-react-starter-demo repo](https://github.com/copilot-academy/dotnet-react-starter-demo)

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

Every agent skill has the same structure: a `SKILL.md` file with YAML frontmatter and a markdown body, optionally accompanied by supporting files organized in subdirectories.

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

:::tip
Write your description as if telling a colleague when to reach for this skill. Include the domain, capabilities, and trigger phrases. This is the single most important factor in whether your skill activates correctly.
:::

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

- **Prompt in Chat:** In Agent mode, type `What skills do you have?`. Copilot should read from the skill and include `hello-world` in its response.

- **Check the System Prompt:** In the chat window, click the ellipsis (⋯) → `Show Chat Debug View`. Select your recent skills prompt. Scroll to view all the details of the chat interaction. In the System Prompt section you should see the skill's name and description listed there. (You can just search for `hello-world`)

### Step 5: Test the Skill

In Copilot Chat (Agent mode), use a cheap model like `Claude Haiku 4.5` and type:

```
Show me a welcome greeting with my system info
```

If prompted to approve running the greet.js command, you can approve. This does rely on node being installed on your system to execute. Verify you see the ASCII art, correct OS/Node details, and the project summary. If the script doesn't execute, make sure you are in Agent mode (not Ask mode).

:::tip
This skill validates your entire setup: directory structure, frontmatter parsing, description-based matching, instruction following, AND the `scripts/` execution pattern. If this works, you're ready for more complex skills.
:::

## 4. Walkthrough 2: Using the Skill Creator

Anthropic publishes a reference skill called `skill-creator` in their public skills repository ([github.com/anthropics/skills](https://github.com/anthropics/skills/tree/main/skills/skill-creator)). This skill teaches your AI agent how to build other skills following a structured process with best practices baked in. Rather than manually creating every file from scratch, you can install it and let it guide the process.

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

To verify it loaded, ask `What skills do you have?` in Agent mode chat or click the gear icon (⚙️) → `Skills` to see a full list. You should see `skill-creator` listed.

**Step 3: Use it to create a new skill**

In Copilot Chat (Agent mode), continue with `Claude Haiku 4.5` and prompt:

```
Create a new skill for generating database migration files following our team's conventions
```

The skill-creator will engage you in a conversation: asking what your conventions are, what examples look like, then scaffolding the entire skill directory with SKILL.md, scripts, and reference docs.

Review the skill to ensure it matches your expectations. If you want to test the skill, you can prompt:

```
Can you generate a migration file for the legacy code in this repo?
```

### Key Design Principles from the Skill Creator

The skill-creator encodes best practices from Anthropic's experience building production skills:

- **Concise is key:** The context window is shared. Only add context the agent doesn't already have. Challenge each piece: "Does this justify its token cost?"

- **Degrees of freedom:** Match specificity to task fragility. High freedom (text instructions) for flexible tasks, low freedom (scripts with few parameters) for fragile operations.

- **Description is the trigger:** All "when to use" information belongs in the description, not the body. The body loads only after triggering, so trigger guidance there is wasted.

- **Test scripts by running them:** Any scripts added must be actually executed to verify they work. Do not ship untested code.

- **Delete what you don't need:** Remove example files from initialization that aren't relevant. Extra files add clutter and confusion.

## 5. Walkthrough 3: React Component Standards

This skill enforces your team's React and TypeScript front-end standards. When a developer asks Copilot to create or modify React components, this skill loads and ensures generated code follows your conventions for file structure, naming, styling, testing, and accessibility.

### What You Will Build

- A skill that auto-activates when working on React components
- A component template in `assets/` as the starting scaffold
- A styles reference in `references/` defining design system tokens

### Step 1: Create the Skill Directory

```bash
mkdir -p .github/skills/react-component-standards/{assets,references,examples}
```

### Step 2: Create the SKILL.md File 

In `.github/skills/react-component-standards`, create `SKILL.md`:

````markdown
---
name: react-component-standards
description: >
  Enforce team React 18 + TypeScript component
  standards for this repo (Vite + Tailwind).
  Use when creating, modifying, or reviewing
  React components, pages, or UI elements under
  frontend/src/. Covers file structure, naming,
  styling with Tailwind + brand CSS variables,
  accessibility, and testing.
---

# React Component Standards

Stack: **React 18 + TypeScript + Vite + Tailwind CSS**, located in `frontend/`.
Existing references: `frontend/src/components/ErrorMessage/`, `frontend/src/components/LoadingSpinner/`.

## File Structure

Every component lives in its own folder under `frontend/src/components/`:

```
frontend/src/components/ComponentName/
├── index.ts              # Named re-export only
└── ComponentName.tsx     # Implementation (props interface inline)
```

Add `ComponentName.test.tsx` only after Jest + React Testing Library are
configured in `frontend/package.json` (see Testing section below).

Do NOT add:
- `*.module.css` — styling is Tailwind-only
- `*.types.ts` — declare the props interface inline; cross-component domain
  types belong in `frontend/src/lib/types.ts`

## Component Template

Use this scaffold: [component-template.tsx](./assets/component-template.tsx)

## Naming Conventions

- **Components:** PascalCase (e.g., `UserProfile`)
- **Props interface:** `ComponentNameProps`, declared inline in the `.tsx`
- **Hooks:** `use` + PascalCase (e.g., `useUserData`)
- **Handlers:** `handle` + Event (e.g., `handleClick`)
- **Boolean props:** use the `Indicator` suffix (e.g., `activeIndicator`, `disabledIndicator`). **Never** use `is`/`has`/`should` prefixes — this matches the org-wide naming standard used by the API DTOs.
- **Date props:** `Date` suffix (e.g., `createdDate`)
- **ID props:** `Id` suffix (e.g., `employeeId`)

## Code Standards

- **Function declarations**, not arrow functions assigned to `const`. (`export function ComponentName(...) { ... }`). Do not use `React.FC`.
- **Named exports only** — never `export default`.
- **Destructure props** in the function signature.
- Explicit TypeScript types for all props.
- Reach for `React.memo` only when profiling shows a real win — do not apply it by default.
- No hardcoded user-facing strings that would block i18n later; prefer constants or props.

## Styling

- **Tailwind utility classes exclusively.** No CSS Modules, no inline `style={{ ... }}` (except for genuinely dynamic values that cannot be expressed in Tailwind).
- Use the brand CSS variables defined in `frontend/src/index.css` via Tailwind's arbitrary-value syntax:
  - `bg-[var(--color-brand-header)]`
  - `bg-[var(--color-brand-content)]`
  - `text-[var(--color-brand-primary)]`
  - `text-[var(--color-brand-text)]`
- See [styles-guide.md](./references/styles-guide.md) for the full token list and Tailwind usage patterns.

## Accessibility

- Interactive non-button/link elements must have `role` and `aria-label`.
- Images must have `alt` text; decorative images use `alt=""` and `aria-hidden="true"`.
- Use semantic HTML (`<header>`, `<nav>`, `<main>`, `<button>`, headings).
- Keyboard navigation must work for any interactive element.
- Loading and error states announce via `role="status"` / `role="alert"` and `aria-live` (see `LoadingSpinner` and `ErrorMessage` for patterns).

## API Integration

When a component fetches or mutates data, use the API client at `frontend/src/lib/api.ts` and the envelope types from `frontend/src/lib/types.ts` (`ApiResponse<T>`, etc.). Do not call `fetch` directly from components.

## Testing

Jest and React Testing Library are **not currently installed** in `frontend/package.json`. Until they are wired up, do not add `.test.tsx` files (they will not run and will confuse contributors).

To enable component testing, a maintainer should:

1. Install dev deps: `jest`, `ts-jest`, `@types/jest`, `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`, `jest-environment-jsdom`.
2. Add a `test` script and a Jest config (jsdom environment, ts-jest transform, `setupFilesAfterEach` for `@testing-library/jest-dom`).
3. Then update this skill to require `ComponentName.test.tsx` with at minimum a render test and one interaction test, using RTL (never Enzyme).
````

### Step 3: Create Supporting Files

#### Create a `references/styles-guide.md` file

````markdown
# Styling Guide

Styling in this repo is **Tailwind CSS only**. No CSS Modules, no SCSS, no inline `style` attributes (except for genuinely dynamic values that cannot be expressed as Tailwind utilities).

Tailwind config: `frontend/tailwind.config.js`
Global stylesheet: `frontend/src/index.css`

## Brand Tokens

Defined as CSS custom properties on `:root` in `frontend/src/index.css`:

| Variable                       | Value     | Purpose                              |
|--------------------------------|-----------|--------------------------------------|
| `--color-brand-header`         | `#87adeb` | App header background, primary chips |
| `--color-brand-content`        | `#e0f1fa` | Page/content background              |
| `--color-brand-primary`        | `#0066cc` | Primary actions, links               |
| `--color-brand-text`           | `#333333` | Default body text                    |

Use them in components via Tailwind's arbitrary-value syntax:

```tsx
<header className="bg-[var(--color-brand-header)] p-4">
  <h1 className="text-white font-bold">Application</h1>
</header>

<a className="text-[var(--color-brand-primary)] hover:underline">Link</a>

<p className="text-[var(--color-brand-text)]">Body copy</p>
```

To add a new brand color, declare the variable in `index.css` first, then reference it the same way. Do not hardcode hex values in component files.

## Common Patterns

### Card surface

```tsx
<div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
  ...
</div>
```

### Primary button

```tsx
<button
  type="button"
  className="px-4 py-2 bg-[var(--color-brand-primary)] text-white font-semibold rounded-md hover:opacity-90 disabled:opacity-50"
>
  Save
</button>
```

### Status / alert region

Use semantic ARIA, mirroring `ErrorMessage` and `LoadingSpinner`:

```tsx
<div role="status" aria-live="polite" className="...">...</div>
<div role="alert"  aria-live="assertive" className="...">...</div>
```

## Spacing, Typography, Radii

Use Tailwind's default scale (`p-2`, `gap-4`, `text-sm`, `rounded-lg`, etc.). Avoid custom values unless a design specifies one. When a custom value is unavoidable, use Tailwind arbitrary values (`p-[18px]`) rather than escaping into a stylesheet.

## What Not To Do

- ❌ `import styles from './X.module.css'`
- ❌ `<div style={{ color: '#0066cc' }}>` (use `text-[var(--color-brand-primary)]`)
- ❌ Hardcoded brand hex values in `.tsx` files
- ❌ Adding a new global stylesheet — extend `index.css` only for new CSS custom properties
````

#### Create `.github/skills/react-component-standards/assets/component-template.tsx` with a basic React component scaffold:

```tsx
interface ComponentNameProps {
  // Declare props here. Boolean props use the `Indicator` suffix
  // (e.g., activeIndicator), never `is`/`has`/`should`.
}

/**
 * Short description of what this component does and when to use it.
 */
export function ComponentName({}: ComponentNameProps) {
  return (
    <div className="p-4 bg-white border border-gray-200 rounded-lg">
      {/* Component content. Use Tailwind utilities and brand CSS vars
          like text-[var(--color-brand-text)]. */}
    </div>
  );
}

```

### Step 4: Test the Skill

```
Create a UserProfile component that displays a user's avatar, name, and email address
```

This should create a new component, `frontend/src/components/UserProfile/UserProfile.tsx`, with a named export, TypeScript types, a function declaration (not arrow function), Tailwind CSS classes, and correct file structure.

:::note
If the skill doesn't trigger, expand the description with more keywords matching how developers naturally ask for React work ("component," "form," "page," "UI," "widget").
:::

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

Create `assets/route-template.ts` with your standard CRUD route pattern using Express Router, authenticate middleware, and Zod validation. 

```
import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { authenticate } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { AppError } from '../utils/errors';

const router = Router();

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const createResourceSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().max(1000).optional(),
  // Add additional fields as needed
});

const updateResourceSchema = createResourceSchema.partial();

const querySchema = z.object({
  offset: z.coerce.number().int().min(0).default(0),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.enum(['createdAt', 'name']).optional(),
});

// ============================================================================
// ROUTE HANDLERS
// ============================================================================

/**
 * GET /v1/resources
 * List all resources with pagination and filtering
 */
router.get(
  '/',
  authenticate,
  validateRequest({ query: querySchema }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { offset, limit, sortBy } = req.query as z.infer<typeof querySchema>;
      
      // Call service layer
      const { items, total } = await resourceService.findAll({
        offset,
        limit,
        sortBy,
      });

      res.json({
        success: true,
        data: items,
        meta: {
          requestId: req.id,
          total,
          offset,
          limit,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /v1/resources/:id
 * Retrieve a single resource by ID
 */
router.get(
  '/:id',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      
      const resource = await resourceService.findById(id);
      if (!resource) {
        throw new AppError('RESOURCE_NOT_FOUND', 'Resource not found', 404);
      }

      res.json({
        success: true,
        data: resource,
        meta: { requestId: req.id },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /v1/resources
 * Create a new resource
 */
router.post(
  '/',
  authenticate,
  validateRequest({ body: createResourceSchema }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req.body as z.infer<typeof createResourceSchema>;
      
      const resource = await resourceService.create(data);

      res.status(201).json({
        success: true,
        data: resource,
        meta: { requestId: req.id },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * PATCH /v1/resources/:id
 * Update an existing resource
 */
router.patch(
  '/:id',
  authenticate,
  validateRequest({ body: updateResourceSchema }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const data = req.body as z.infer<typeof updateResourceSchema>;

      const resource = await resourceService.update(id, data);
      if (!resource) {
        throw new AppError('RESOURCE_NOT_FOUND', 'Resource not found', 404);
      }

      res.json({
        success: true,
        data: resource,
        meta: { requestId: req.id },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * DELETE /v1/resources/:id
 * Delete a resource
 */
router.delete(
  '/:id',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      await resourceService.delete(id);

      res.json({
        success: true,
        data: null,
        meta: { requestId: req.id },
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
```

Create `references/error-handling.md`:

````markdown
# Error Handling Standards

## AppError Class

All errors MUST extend from `AppError`. This provides consistent error responses across the API.

```typescript
// utils/errors.ts
export class AppError extends Error {
  constructor(
    public code: string,
    public message: string,
    public statusCode: number = 500,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = 'AppError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: Record<string, any>) {
    super('VALIDATION_ERROR', message, 400, details);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string) {
    super('NOT_FOUND', message, 404);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super('UNAUTHORIZED', message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden') {
    super('FORBIDDEN', message, 403);
  }
}
```

## Error Response Format

**Success Response:**
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "requestId": "uuid-here"
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input provided",
    "statusCode": 400,
    "details": {
      "email": "Invalid email format",
      "age": "Must be 18 or older"
    }
  },
  "meta": {
    "requestId": "uuid-here"
  }
}
```

## Error Codes

Use prefixed error codes for categorization:

| Category | Code Format | Examples |
|----------|------------|----------|
| Validation | `VALIDATION_*` | `VALIDATION_ERROR`, `VALIDATION_SCHEMA_MISMATCH` |
| Authentication | `AUTH_*` | `AUTH_INVALID_CREDENTIALS`, `AUTH_TOKEN_EXPIRED` |
| Authorization | `AUTHZ_*` | `AUTHZ_INSUFFICIENT_PERMISSIONS` |
| Not Found | `NOT_FOUND` | `RESOURCE_NOT_FOUND`, `USER_NOT_FOUND` |
| Server Error | `SERVER_*` | `SERVER_ERROR`, `DATABASE_ERROR` |

## Global Error Handler

**middleware/errorHandler.ts:**
```typescript
import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import { logger } from '../utils/logger';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Log error
  logger.error({
    requestId: req.id,
    error: err.message,
    stack: err.stack,
  });

  // Handle AppError subclasses
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        statusCode: err.statusCode,
        ...(err.details && { details: err.details }),
      },
      meta: { requestId: req.id },
    });
  }

  // Handle unexpected errors
  res.status(500).json({
    success: false,
    error: {
      code: 'SERVER_ERROR',
      message: 'An unexpected error occurred',
      statusCode: 500,
    },
    meta: { requestId: req.id },
  });
};
```

## Best Practices

1. **Never expose stack traces** to clients in production
2. **Use specific error codes** to help clients handle different scenarios
3. **Include requestId** in all error responses for debugging
4. **Validate early** in middleware to catch errors before reaching service logic
5. **Throw early** with appropriate error types from services
6. **Log errors** with full context (stack trace, request details, user info)
7. **Handle async errors** with try-catch or `.catch()` chains

````

Finally, create `references/validation-guide.md` documenting your error classes and schema conventions.

````markdown
# Validation Standards with Zod

All API input validation MUST use Zod schemas and the `validateRequest` middleware.

## Validation Middleware

**middleware/validation.ts:**
```typescript
import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import { ValidationError } from '../utils/errors';

export interface ValidateRequestOptions {
  body?: ZodSchema;
  params?: ZodSchema;
  query?: ZodSchema;
}

export const validateRequest = (schemas: ValidateRequestOptions) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate body
      if (schemas.body) {
        const bodyResult = schemas.body.safeParse(req.body);
        if (!bodyResult.success) {
          const details = formatZodErrors(bodyResult.error);
          throw new ValidationError('Invalid request body', details);
        }
        req.body = bodyResult.data;
      }

      // Validate params
      if (schemas.params) {
        const paramsResult = schemas.params.safeParse(req.params);
        if (!paramsResult.success) {
          const details = formatZodErrors(paramsResult.error);
          throw new ValidationError('Invalid request parameters', details);
        }
        req.params = paramsResult.data;
      }

      // Validate query
      if (schemas.query) {
        const queryResult = schemas.query.safeParse(req.query);
        if (!queryResult.success) {
          const details = formatZodErrors(queryResult.error);
          throw new ValidationError('Invalid query parameters', details);
        }
        req.query = queryResult.data;
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

function formatZodErrors(error: any): Record<string, string> {
  const details: Record<string, string> = {};
  error.errors.forEach((err: any) => {
    const path = err.path.join('.');
    details[path] = err.message;
  });
  return details;
}
```

## Schema Conventions

### Basic Types

```typescript
const userSchema = z.object({
  // Strings
  email: z.string().email('Invalid email format'),
  name: z.string().min(1).max(255),
  bio: z.string().max(1000).optional(),

  // Numbers
  age: z.number().int().min(0).max(150),
  price: z.number().positive(),

  // Booleans
  activeIndicator: z.boolean().default(false),

  // Dates
  createdAt: z.coerce.date(),
  birthDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid date format',
  }),
});
```

### Composition & Reusability

```typescript
// Base schema
const createUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(255),
  role: z.enum(['admin', 'user', 'guest']),
});

// Update schema (all fields optional)
const updateUserSchema = createUserSchema.partial();

// Query schema
const userQuerySchema = z.object({
  offset: z.coerce.number().int().min(0).default(0),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  role: z.enum(['admin', 'user', 'guest']).optional(),
  search: z.string().optional(),
});

// Params schema
const userParamsSchema = z.object({
  id: z.string().uuid(),
});
```

### Custom Validation

```typescript
const createProductSchema = z.object({
  name: z.string().min(1),
  price: z.number().positive(),
  discountPrice: z.number().positive().optional(),
  quantity: z.number().int().min(0),
})
  .refine(
    (data) => !data.discountPrice || data.discountPrice < data.price,
    {
      message: 'Discount price must be less than regular price',
      path: ['discountPrice'],
    }
  );

const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Must contain uppercase letter')
  .regex(/[a-z]/, 'Must contain lowercase letter')
  .regex(/[0-9]/, 'Must contain number');
```

### Advanced Patterns

```typescript
// Discriminated unions
const actionSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('email'),
    to: z.string().email(),
    subject: z.string(),
    body: z.string(),
  }),
  z.object({
    type: z.literal('sms'),
    phoneNumber: z.string(),
    message: z.string(),
  }),
]);

// Arrays
const tagSchema = z.object({
  tags: z.array(z.string().min(1)).min(1).max(10),
  categories: z.array(z.enum(['tech', 'business', 'lifestyle'])),
});

// Nested objects
const companySchema = z.object({
  name: z.string(),
  address: z.object({
    street: z.string(),
    city: z.string(),
    country: z.string(),
    zipCode: z.string(),
  }),
  employees: z.array(
    z.object({
      name: z.string(),
      email: z.string().email(),
    })
  ),
});
```

## Usage in Routes

```typescript
router.post(
  '/',
  authenticate,
  validateRequest({
    body: createUserSchema,
  }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // req.body is now fully typed and validated
      const user = await userService.create(req.body);
      res.status(201).json({
        success: true,
        data: user,
        meta: { requestId: req.id },
      });
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  '/',
  validateRequest({
    query: userQuerySchema,
  }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // req.query is now validated with proper types and defaults
      const { offset, limit, role, search } = req.query;
      const result = await userService.findAll({
        offset,
        limit,
        role,
        search,
      });
      res.json({
        success: true,
        data: result.items,
        meta: {
          requestId: req.id,
          total: result.total,
          offset,
          limit,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);
```

## Best Practices

1. **Define schemas at the top** of route files
2. **Reuse schemas** across similar endpoints (create, update, query)
3. **Use `.partial()`** for update/patch endpoints
4. **Use `.optional()`** instead of `| null` for optional fields
5. **Always validate user input** before passing to services
6. **Leverage TypeScript inference** with `z.infer<typeof schema>`
7. **Use `.refine()` or `.superRefine()`** for complex cross-field validation
8. **Test schemas** as part of route tests
````

### Step 4: Test the Skill

```
Use the api-builder skill to create a full CRUD API for a 'products' resource with fields: name, price, category, inStock
```

Verify: route file matching your template, controller with error handling, service layer, repository, Zod schemas, and test file — all following the layered architecture.

:::tip
Progressive disclosure keeps this skill efficient. Copilot only loads error handling or validation guides when it actually needs them.
:::

:::note 
You can reference a skill directly as shown above.  In this repo there is a chance the model will just read the copilot-instructions.md file which also has API standards and not load the skill.
:::

## 7. Testing and Debugging Skills

### Verifying Skills Are Loaded

There are two reliable ways to confirm your skills are detected by Copilot:

- **Ask Copilot directly:** In Agent mode, prompt `What skills do you have?` — Copilot reads from the loaded skills and lists them in its response.

- **Inspect the System Prompt:** Open the Output panel in VS Code (View → Output), then select `editAgent` from the channel dropdown. Scroll to the bottom of the System Prompt — each loaded skill's name and description will appear there. This is the most definitive way to confirm detection and frontmatter parsing.

### Testing Checklist

| Test | How to Verify | Fix if Failing |
|------|---------------|----------------|
| Skill detection | Ask 'What skills do you have?' in chat.  Alternatively, click on the gear at the top of the chat window to see skills. | Verify `.github/skills/name/SKILL.md` path |
| Frontmatter parsing | Ask in chat: 'What is the description for...' | Check YAML syntax (colons, quotes) |
| Activation | Prompt triggers correct behavior | Expand description with more keywords |
| Non-activation | Unrelated prompts don't trigger | Narrow description to avoid false matches |
| Instruction following | Output matches SKILL.md guidelines | Make instructions more explicit |
| Script execution | Script runs and output appears | Check script path, permissions, runtime |
| File references | Template content in output | Check relative paths in Markdown links |

### Common Issues

- **Skill not appearing:** Verify `chat.useAgentSkills` is enabled, file is named exactly `SKILL.md` (case-sensitive), path is `.github/skills/` or `~/.copilot/skills/`.

- **Skill not activating:** Description lacks keywords matching prompt. Add more trigger phrases and synonyms.

- **Script not executing:** Ensure you are in Agent mode (not Ask mode). Verify the script path and runtime (node, python) are available.

- **Partial instruction following:** SKILL.md may be too long or ambiguous. Prioritize important rules at the top. Use numbered steps.

## 8. Sharing and Distribution

Skills follow an open standard and work across GitHub Copilot and other coding agents. You can share them with your team or the community.

### Sharing with Your Team

Commit skills to your repository under `.github/skills/`. Every team member who clones the repo immediately gets access. Document your skills in `CONTRIBUTING.md`.  Skills can also be distributed in plugins with other components. If interested in plugins, please see the following documentation:

* [Creating a plugin for GitHub Copilot CLI](https://docs.github.com/en/copilot/how-tos/copilot-cli/customize-copilot/plugins-creating)
* [Creating a plugin marketplace for GitHub Copilot CLI](https://docs.github.com/en/copilot/how-tos/copilot-cli/customize-copilot/plugins-marketplace)

### Community Resources

- **[Awesome Copilot](https://awesome-copilot.github.com/) / [Repository](https://github.com/github/awesome-copilot):** Community-curated collection of skills, agents, instructions, and prompts for GitHub Copilot.

- **[anthropics/skills](https://github.com/anthropics/skills):** Reference skills from Anthropic, including the skill-creator, document processing skills (PPTX, XLSX, DOCX, PDF), and creative skills demonstrating advanced patterns.

- **[skills.sh](https://skills.sh) / [agentskills.io](https://agentskills.io):** Directories for discovering and installing skills, with documentation on the agent skills specification.

:::caution
Always review community-contributed skills before using them. Skills can include scripts that may execute in your environment. Verify instructions and bundled scripts meet your security standards.
:::

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

:::info 
Skills should only install packages locally (not globally) to avoid interfering with the user's environment. Use project-local dependencies wherever possible.
:::

### Composing Skills with Instructions and Agents

- **Instructions** (`.github/copilot-instructions.md`) set the always-on baseline context
- **Skills** (`.github/skills/`) provide specialized capabilities that auto-activate based on task
- **Agents** (`.github/agents/`) act as a persona and orchestrate session-level workflows with specific tools
- **Prompt files** (`.github/prompts/`) define on-demand workflows triggered by `/commands`

### Writing Better Descriptions

- State the domain clearly ("React components," "API endpoints," "database migrations")
- List specific actions covered ("create, modify, review, test")
- Include natural language trigger phrases users might type
- Mention specific technologies ("Express, Zod, Playwright, PostgreSQL")
- Stay concise but keyword-rich — 2-4 lines maximum
- Put ALL "when to use" guidance in the description, never in the body

:::tip
Think of the description as a search engine index for your skill. The more relevant keywords, the more accurately Copilot will match prompts. But keep it truthful — false matches are worse than missed ones.
:::