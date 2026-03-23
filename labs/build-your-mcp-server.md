---
title: "Lab: Build Your MCP Server"
description: Build an Architecture Decision Record (ADR) Manager MCP server in TypeScript and integrate it with GitHub Copilot in VS Code.
sidebar_position: 6
---

# Lab: Build Your MCP Server

> **Duration:** ~60 minutes | **Level:** Advanced | **Prerequisites:** VS Code with GitHub Copilot, Node.js 18+, basic TypeScript knowledge

## Objective

In this lab you will build a fully functional **Model Context Protocol (MCP) server** from scratch using TypeScript. The server you create — an **Architecture Decision Record (ADR) Manager** — will integrate directly with GitHub Copilot in VS Code, giving Copilot the ability to create, search, and manage architectural decisions for your projects.

By the end of this lab you will understand:

- What MCP is and how it extends AI assistants like GitHub Copilot
- The three MCP primitives: **Resources**, **Tools**, and **Prompts**
- How to build, configure, and use a custom MCP server with GitHub Copilot

### Why Architecture Decision Records?

One of the most persistent pain points in software development is the loss of architectural context. Teams make critical decisions — choosing a database, adopting a framework, designing an API contract — but rarely document **why**. When someone joins the team, revisits the code months later, or needs to evaluate whether a past decision still holds, that context is gone.

Architecture Decision Records (ADRs) solve this by capturing decisions in lightweight, structured documents. Your MCP server will make it effortless to create and query these records directly through Copilot, turning architectural documentation from an afterthought into a natural part of the development workflow.

## What You'll Build

An MCP server called **ADR Manager** that exposes all three MCP primitives:

| Primitive | What It Does | Examples in This Lab |
|-----------|-------------|---------------------|
| **Resources** | Read-only data the AI can access | ADR index listing, individual ADR content |
| **Tools** | Actions the AI can invoke | Create ADR, search ADRs, update ADR status |
| **Prompts** | Reusable prompt templates | "Draft a new ADR" template, "Review a decision" template |

When connected to GitHub Copilot, you will be able to ask things like:

- *"List all of our architecture decisions"*
- *"Create an ADR for our decision to use PostgreSQL over MongoDB"*
- *"Search our ADRs for anything related to authentication"*
- *"Review ADR #3 and suggest improvements"*

## Background: What Is MCP?

The **Model Context Protocol (MCP)** is an open standard that provides a uniform way for AI assistants to interact with external tools, data sources, and services. Think of it as **USB for AI** — instead of building custom integrations for each AI tool, you build one MCP server that works with any MCP-compatible client (GitHub Copilot, Claude, Cursor, and others).

### How MCP Extends Copilot

Without MCP, Copilot can only work with what is already in your editor — open files, terminal output, and its built-in tools. With MCP, Copilot gains access to:

- **External data** — databases, APIs, file systems, documentation
- **Custom actions** — creating files, querying services, triggering workflows
- **Domain-specific knowledge** — tailored prompts and templates for your team's processes

### The Three Primitives

Every MCP server can expose three types of capabilities:

1. **Resources** — Read-only data endpoints. The AI client can read these to gain context. Similar to GET endpoints in a REST API.
2. **Tools** — Callable functions that perform actions. The AI invokes these when it needs to *do* something. Similar to POST/PUT endpoints.
3. **Prompts** — Reusable prompt templates with parameters. These give users pre-built starting points for common tasks.

### Transport Types

MCP servers communicate with clients via a transport layer:

| Transport | Description | When to Use |
|-----------|------------|-------------|
| **stdio** | Communicates over standard input/output | Local servers launched by the editor |
| **Streamable HTTP** | HTTP-based streaming | Remote/hosted servers |

In this lab we use **stdio** — the simplest option for local development.

## Available MCP SDKs

MCP has official and community SDKs for many languages:

| Language | Repository | Tier |
|----------|---------|------|
| **TypeScript** | [modelcontextprotocol/typescript-sdk](https://github.com/modelcontextprotocol/typescript-sdk) | Tier 1 |
| **Python** | [modelcontextprotocol/python-sdk](https://github.com/modelcontextprotocol/python-sdk) | Tier 1 |
| **C#** | [modelcontextprotocol/csharp-sdk](https://github.com/modelcontextprotocol/csharp-sdk) | Tier 1 |
| **Go** | [modelcontextprotocol/go-sdk](https://github.com/modelcontextprotocol/go-sdk) | Tier 1 |
| **Java** | [modelcontextprotocol/java-sdk](https://github.com/modelcontextprotocol/java-sdk) | Tier 2 |
| **Rust** | [modelcontextprotocol/rust-sdk](https://github.com/modelcontextprotocol/rust-sdk) | Tier 2 |
| **Swift** | [modelcontextprotocol/swift-sdk](https://github.com/modelcontextprotocol/swift-sdk) | Tier 3 |
| **Ruby** | [modelcontextprotocol/ruby-sdk](https://github.com/modelcontextprotocol/ruby-sdk) | Tier 3 |
| **PHP** | [modelcontextprotocol/php-sdk](https://github.com/modelcontextprotocol/php-sdk) | Tier 3 |
| **Kotlin** | [modelcontextprotocol/kotlin-sdk](https://github.com/modelcontextprotocol/kotlin-sdk) | TBD | 

> **Why TypeScript for this lab?** TypeScript is the most widely used language for MCP servers, has the most mature SDK with excellent documentation, and provides strong type safety through Zod schemas. The patterns you learn here transfer directly to any other SDK.

## Prerequisites

Before you begin, ensure you have:

- [ ] **Node.js 22+** — check with `node --version`
- [ ] **npm 10+** — check with `npm --version`
- [ ] **VS Code** with **GitHub Copilot** and **GitHub Copilot Chat** extensions
- [ ] Basic familiarity with TypeScript and the command line

## Step 1: Scaffold the Project

Create a new directory and initialize the project:

```bash
mkdir adr-manager-mcp && cd adr-manager-mcp
npm init -y
```

Install the MCP SDK and dependencies:

```bash
npm install @modelcontextprotocol/sdk zod
npm install -D typescript @types/node
```

| Package | Purpose |
|---------|---------|
| `@modelcontextprotocol/sdk` | The MCP server framework |
| `zod` | Schema validation for tool inputs |
| `typescript` | TypeScript compiler |
| `@types/node` | Node.js type definitions |

Initialize TypeScript:

```bash
npx tsc --init
```

Update `tsconfig.json` — replace the entire file contents with:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "outDir": "./build",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src/**/*"]
}
```

Update `package.json` to add a build script and set the module type. Add or replace these fields:

```json
{
  "type": "module",
  "scripts": {
    "build": "tsc",
    "start": "node build/index.js"
  }
}
```

Your finished package.json should look something like this:

```json
{
  "name": "adr-manager-mcp",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "build": "tsc",
    "start": "node build/index.js",
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "type": "module",
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.27.1",
    "zod": "^4.3.6"
  },
  "devDependencies": {
    "@types/node": "^25.5.0",
    "typescript": "^5.9.3"
  }
}
``` 

Create the source directory:

```bash
mkdir src
```

Your project structure should look like this:

```
adr-manager-mcp/
├── node_modules/
├── src/               ← your code goes here
├── package.json
├── package-lock.json
└── tsconfig.json
```

## Step 2: Create the Server Entry Point

Create `src/index.ts` — this is the heart of your MCP server. Start with the minimal boilerplate to initialize the server and connect it to stdio transport:

```typescript
import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import * as fs from "fs";
import * as path from "path";

// ADR files are stored relative to the working directory
const ADR_DIR = path.join(process.cwd(), "docs", "adr");

// --- Helper Functions ---

function ensureAdrDir(): void {
  if (!fs.existsSync(ADR_DIR)) {
    fs.mkdirSync(ADR_DIR, { recursive: true });
  }
}

function getNextAdrNumber(): number {
  ensureAdrDir();
  const files = fs.readdirSync(ADR_DIR).filter((f) => /^\d{4}-.*\.md$/.test(f));
  if (files.length === 0) return 1;
  const numbers = files.map((f) => parseInt(f.split("-")[0], 10));
  return Math.max(...numbers) + 1;
}

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// --- Create the MCP Server ---

const server = new McpServer({
  name: "ADR Manager",
  version: "1.0.0",
});
```

> **What is happening here?** You import the MCP SDK classes, define a directory where ADR files will live (`docs/adr/` inside the current project), create some helper functions for file management, and instantiate the `McpServer` with a name and version. The server does not do anything yet — you will add capabilities in the next steps.

## Step 3: Implement Resources

Resources give the AI **read-only access to data**. You will create two resources:

1. **`adr://index`** — Returns a listing of all ADRs with their titles and statuses
2. **`adr://content/{id}`** — Returns the full content of a specific ADR by its number

Add the following below your server instantiation in `src/index.ts`:

```typescript
// --- Resources ---

// Resource: List all ADRs
server.resource("adr-index", "adr://index", async (uri) => {
  ensureAdrDir();
  const files = fs
    .readdirSync(ADR_DIR)
    .filter((f) => /^\d{4}-.*\.md$/.test(f))
    .sort();

  const index = files
    .map((f) => {
      const content = fs.readFileSync(path.join(ADR_DIR, f), "utf-8");
      const titleMatch = content.match(/^#\s+(.+)$/m);
      const statusMatch = content.match(/\*\*Status:\*\*\s+(.+)$/m);
      return `- ${f}: ${titleMatch?.[1] ?? "Untitled"} [${statusMatch?.[1] ?? "Unknown"}]`;
    })
    .join("\n");

  return {
    contents: [
      {
        uri: uri.href,
        mimeType: "text/plain",
        text: index || "No ADRs found. Use the create_adr tool to create one.",
      },
    ],
  };
});

// Resource template: Read a specific ADR by number
server.resource(
  "adr-content",
  new ResourceTemplate("adr://content/{id}", { list: undefined }),
  async (uri, { id }) => {
    ensureAdrDir();
    const prefix = String(id).padStart(4, "0");
    const files = fs.readdirSync(ADR_DIR).filter((f) => f.startsWith(prefix));

    if (files.length === 0) {
      return {
        contents: [{ uri: uri.href, mimeType: "text/plain", text: `ADR ${id} not found.` }],
      };
    }

    const content = fs.readFileSync(path.join(ADR_DIR, files[0]), "utf-8");
    return {
      contents: [{ uri: uri.href, mimeType: "text/markdown", text: content }],
    };
  }
);
```

> **Key concept:** The first resource uses a **static URI** (`adr://index`), while the second uses a **`ResourceTemplate`** with a parameter (`{id}`). Resource templates allow the AI to request specific items dynamically — similar to parameterized routes in a web framework.

## Step 4: Implement Tools

Tools are **actions the AI can invoke**. You will create three tools:

| Tool | Purpose | Parameters |
|------|---------|------------|
| `create_adr` | Create a new ADR file | title, context, decision, consequences, status |
| `search_adrs` | Search ADRs by keyword | query |
| `update_adr_status` | Change an ADR's status | id, status |

Add the following to the bottom of `src/index.ts`:

```typescript
// --- Tools ---

// Tool: Create a new ADR
server.tool(
  "create_adr",
  "Create a new Architecture Decision Record",
  {
    title: z.string().describe("Title of the architecture decision"),
    context: z.string().describe("Context and problem statement"),
    decision: z.string().describe("The decision that was made"),
    consequences: z.string().describe("Consequences of this decision"),
    status: z
      .enum(["proposed", "accepted", "deprecated", "superseded"])
      .default("proposed")
      .describe("Status of the decision"),
  },
  async ({ title, context, decision, consequences, status }) => {
    ensureAdrDir();
    const num = getNextAdrNumber();
    const slug = slugify(title);
    const filename = `${String(num).padStart(4, "0")}-${slug}.md`;
    const date = new Date().toISOString().split("T")[0];

    const content = `# ${num}. ${title}

**Date:** ${date}

**Status:** ${status}

## Context

${context}

## Decision

${decision}

## Consequences

${consequences}
`;

    fs.writeFileSync(path.join(ADR_DIR, filename), content);

    return {
      content: [{ type: "text" as const, text: `Created ADR: ${filename}` }],
    };
  }
);

// Tool: Search ADRs by keyword
server.tool(
  "search_adrs",
  "Search Architecture Decision Records by keyword",
  {
    query: z.string().describe("Search keyword to find in ADR titles and content"),
  },
  async ({ query }) => {
    ensureAdrDir();
    const files = fs.readdirSync(ADR_DIR).filter((f) => /^\d{4}-.*\.md$/.test(f));

    const results = files
      .filter((f) => {
        const content = fs.readFileSync(path.join(ADR_DIR, f), "utf-8");
        return content.toLowerCase().includes(query.toLowerCase());
      })
      .map((f) => {
        const content = fs.readFileSync(path.join(ADR_DIR, f), "utf-8");
        const titleMatch = content.match(/^#\s+(.+)$/m);
        const statusMatch = content.match(/\*\*Status:\*\*\s+(.+)$/m);
        return `- ${f}: ${titleMatch?.[1] ?? "Untitled"} [${statusMatch?.[1] ?? "Unknown"}]`;
      });

    return {
      content: [
        {
          type: "text" as const,
          text:
            results.length > 0
              ? `Found ${results.length} ADR(s):\n${results.join("\n")}`
              : `No ADRs found matching "${query}".`,
        },
      ],
    };
  }
);

// Tool: Update the status of an ADR
server.tool(
  "update_adr_status",
  "Update the status of an existing Architecture Decision Record",
  {
    id: z.number().describe("ADR number to update"),
    status: z
      .enum(["proposed", "accepted", "deprecated", "superseded"])
      .describe("New status for the ADR"),
  },
  async ({ id, status }) => {
    ensureAdrDir();
    const prefix = String(id).padStart(4, "0");
    const files = fs.readdirSync(ADR_DIR).filter((f) => f.startsWith(prefix));

    if (files.length === 0) {
      return {
        content: [{ type: "text" as const, text: `ADR ${id} not found.` }],
      };
    }

    const filePath = path.join(ADR_DIR, files[0]);
    let fileContent = fs.readFileSync(filePath, "utf-8");
    fileContent = fileContent.replace(
      /\*\*Status:\*\*\s+.+/,
      `**Status:** ${status}`
    );
    fs.writeFileSync(filePath, fileContent);

    return {
      content: [
        { type: "text" as const, text: `Updated ADR ${id} status to "${status}".` },
      ],
    };
  }
);
```

> **Key concept:** Each tool has four parts: a **name**, a **description** (used by the AI to decide when to call it), an **input schema** (defined with Zod for type safety and validation), and an **async handler** that performs the action and returns a result. The descriptions are critical — they are what the AI reads to understand when and how to use each tool.

## Step 5: Implement Prompts

Prompts are **reusable templates** that give users pre-built starting points for common tasks. You will create two prompts:

1. **`new-adr`** — Guides the AI to draft a complete ADR for a given topic
2. **`review-decision`** — Guides the AI to evaluate an existing ADR for quality and completeness

Add the following to the bottom of `src/index.ts`:

```typescript
// --- Prompts ---

// Prompt: Draft a new ADR
server.prompt(
  "new-adr",
  "Draft a new Architecture Decision Record",
  { topic: z.string().describe("The architectural topic or decision to document") },
  ({ topic }) => ({
    messages: [
      {
        role: "user" as const,
        content: {
          type: "text" as const,
          text: `Help me draft an Architecture Decision Record (ADR) for the following topic:

**Topic:** ${topic}

Please structure the ADR with these sections:
1. **Context** — What is the problem or situation that requires a decision?
2. **Decision Drivers** — What factors are most important? (performance, maintainability, cost, team expertise, etc.)
3. **Options Considered** — List at least 3 alternatives with brief pros and cons for each
4. **Decision** — Which option was chosen and why?
5. **Consequences** — What are the positive and negative outcomes of this decision?

Use clear, concise language. Focus on the "why" behind the decision, not just the "what."
After drafting, use the create_adr tool to save it.`,
        },
      },
    ],
  })
);

// Prompt: Review an existing ADR
server.prompt(
  "review-decision",
  "Review and evaluate an architectural decision",
  { id: z.string().describe("The ADR number to review") },
  ({ id }) => ({
    messages: [
      {
        role: "user" as const,
        content: {
          type: "text" as const,
          text: `Review Architecture Decision Record #${id}.

First, read the ADR using the adr://content/${id} resource. Then evaluate it against these criteria:

1. **Completeness** — Does it clearly state the context, decision, and consequences?
2. **Alternatives** — Were other options considered and documented?
3. **Rationale** — Is the reasoning behind the decision well-explained?
4. **Risks** — Are potential risks and mitigation strategies identified?
5. **Reversibility** — Is it clear how difficult this decision would be to reverse?

Provide specific, actionable feedback for improving the ADR.`,
        },
      },
    ],
  })
);
```

> **Key concept:** Prompts do not execute code — they return structured messages that pre-fill the chat. This gives users a consistent starting point without having to remember the right questions to ask. Notice how the `new-adr` prompt instructs the AI to use the `create_adr` tool after drafting — prompts and tools work together.

## Step 6: Start the Server

Add the server startup code at the bottom of `src/index.ts`:

```typescript
// --- Start the Server ---

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("ADR Manager MCP server running on stdio");
}

main().catch(console.error);
```

:::note
The startup message uses `console.error` deliberately. In stdio transport, `stdout` is reserved for MCP protocol messages. Any logging must go to `stderr`.
:::

Now build the project:

```bash
npm run build
```

You should see no errors. The compiled JavaScript will be in the `build/` directory.

To verify the server starts correctly:

```bash
echo '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-03-26","capabilities":{},"clientInfo":{"name":"test","version":"1.0.0"}}}' | node build/index.js
```

You should see a JSON response containing the server's capabilities — this confirms your server is working.

## Step 7: Configure in VS Code

Now connect your MCP server to GitHub Copilot.

Open a project where you want to manage ADRs (or use the current directory). Create a `.vscode/mcp.json` file:

```json
{
  "servers": {
    "adr-manager": {
      "type": "stdio",
      "command": "node",
      "args": ["/absolute/path/to/adr-manager-mcp/build/index.js"]
    }
  }
}
```

:::important
Replace `/absolute/path/to/adr-manager-mcp/build/index.js` with the actual absolute path to your compiled server. You can find it by running `echo "$(pwd)/build/index.js"` from your project directory.
:::

After saving the file, click the start button for VS Code to start the MCP server. You should see it change to a `running` status. You can verify it is running:

1. Open the Command Palette (`Cmd+Shift+P` / `Ctrl+Shift+P`)
2. Run **MCP: List Servers**
3. You should see **adr-manager** listed with a running status

:::tip
If you modify your server code, rebuild with `npm run build`, then use **MCP: List Servers** and click the restart button next to your server to pick up the changes.
:::

## Step 8: Use It with GitHub Copilot

Open GitHub Copilot Chat in **Agent mode** and try these scenarios.  Use a cheaper model like `GPT-5.4 Mini` or `Claude Haiku 4.5` for these interactions. 

### Scenario 1 — Create Your First ADR

Ask Copilot:

```
Create an ADR for our decision to use PostgreSQL instead of MongoDB for our
user data store. The main drivers were ACID compliance, mature tooling, and
the team's existing SQL expertise.
```

Copilot should invoke the `create_adr` tool and create a file in `docs/adr/`. Check that the file was created:

```bash
ls docs/adr/
cat docs/adr/0001-*.md
```

### Scenario 2 — Search Decisions

```
Search our architecture decisions for anything related to databases.
```

Copilot should invoke the `search_adrs` tool and return matching records.

### Scenario 3 — Use the Draft Prompt

Use the `new-adr` prompt (Currently you can reach this with `/mcp.adr-manager.new-adr` although this is subject to change.) The prompt is **Draft a new Architecture Decision Record**.  Enter `/mcp.adr-manager.new-adr` and it will ask for the architectural topic or decision to input.  Input this:

```
Adopting a message queue for async processing between microservices
```


Copilot will then post the full ADR structure. Click the `send` button to submit it and it will save it using the `create_adr` tool. Look for docs/adr/0002...md to confirm it was created.

### Scenario 4 — Review a Decision

Use the `/mcp.adr-manager.review-decision` prompt and enter `0001` as the ADR number. Copilot will pull up the ADR content.  Click `send` and it will read the content using the resource and provide a structured review with improvement suggestions.

### Scenario 5 — Update a Status

After it provides it's review, ask it to update the status to **accepted**.  

```
Accept ADR number 1 — the team has approved the PostgreSQL decision.
```

Copilot should invoke `update_adr_status` to change the status from "proposed" to "accepted."

## Stretch Goals

Finished early? You could try extending your MCP server:

- **Add tags** — Add a `tags` parameter to `create_adr` and a `filter_by_tag` tool
- **Supersedes tracking** — When marking an ADR as "superseded", link to the new ADR that replaces it
- **Timeline resource** — Add a `adr://timeline` resource that returns ADRs sorted by date
- **Export tool** — Add a tool that generates a summary table of all ADRs in markdown format
- **Publish to npm** — Package your server so others can install it with `npx`

## Key Concepts Recap

| Concept | What You Learned |
|---------|-----------------|
| **MCP Protocol** | Open standard for connecting AI assistants to external tools and data |
| **Resources** | Read-only data endpoints the AI can access for context |
| **Tools** | Callable functions the AI invokes to perform actions |
| **Prompts** | Reusable templates that pre-fill chat with structured instructions |
| **Zod Schemas** | Type-safe input validation that also serves as documentation for the AI |
| **stdio Transport** | Local communication channel between VS Code and your MCP server |
| **`.vscode/mcp.json`** | Configuration file that tells VS Code how to launch your MCP server |

## The Same Server in Other Languages

For reference, here is how the server entry point and a single tool look in Python and C#.

### Python

```python
# pip install "mcp[cli]"
from mcp.server.fastmcp import FastMCP

mcp = FastMCP("ADR Manager")

@mcp.tool()
def create_adr(title: str, context: str, decision: str, consequences: str, status: str = "proposed") -> str:
    """Create a new Architecture Decision Record."""
    # ... file creation logic ...
    return f"Created ADR: {filename}"

@mcp.resource("adr://index")
def adr_index() -> str:
    """List all Architecture Decision Records."""
    # ... file listing logic ...
    return index_text

@mcp.prompt()
def new_adr(topic: str) -> str:
    """Draft a new Architecture Decision Record."""
    return f"Help me draft an ADR for: {topic} ..."

# Run with: mcp run server.py (stdio) or mcp run server.py --transport sse (remote)
```

### C\#

```csharp
// dotnet add package ModelContextProtocol
using ModelContextProtocol;
using System.ComponentModel;

var builder = Host.CreateApplicationBuilder(args);
builder.Services.AddMcpServer()
    .WithStdioServerTransport()
    .WithToolsFromAssembly();

var app = builder.Build();
await app.RunAsync();

[McpServerToolType]
public static class AdrTools
{
    [McpServerTool, Description("Create a new Architecture Decision Record")]
    public static string CreateAdr(string title, string context, string decision, string consequences)
    {
        // ... file creation logic ...
        return $"Created ADR: {filename}";
    }
}
```

:::note The core concepts — tools, resources, prompts, and transport — are the same across all SDKs. Only the syntax and idioms differ.
:::

## Related Resources

- [MCP Specification & Documentation](https://modelcontextprotocol.io/docs)
- [MCP Docs - Build an MCP Server](https://modelcontextprotocol.io/docs/develop/build-server)
- [SDK Reference](https://modelcontextprotocol.io/docs/sdk)
- [GitHub MCP Registry](https://github.com/mcp)
- [Copilot Academy: Integrating with existing MCP Servers](/workshops/copilot-customization/integrations)
