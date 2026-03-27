---
title: "Lab: Copilot SDK"
description: Build a Smart Changelog Generator CLI tool using the GitHub Copilot SDK to embed Copilot's agentic engine into your own application.
sidebar_position: 2
---

# Lab: Copilot SDK

> **Duration:** ~1 hour | **Level:** Beginner | **Prerequisites:** Node.js 18+, GitHub Copilot subscription, Copilot CLI installed & authenticated

## Objective

The **GitHub Copilot SDK** exposes the same production-grade agentic engine that powers the Copilot CLI — sessions, streaming, tool calling, multi-turn conversations — as a library you can embed directly in your own applications. In this lab you will use the SDK to build a practical CLI tool you can run on any repository, every sprint.

By the end of this lab you will understand:

- How the Copilot SDK relates to Copilot CLI and the broader Copilot platform
- How to create and manage Copilot sessions programmatically
- How to stream AI responses in real time
- How to define **custom tools** that give the agent new capabilities
- How to build multi-turn, interactive workflows

## What You'll Build

Writing release notes is one of those tasks that every team needs but nobody enjoys. Commits pile up between releases and distilling them into a clear, categorized summary is tedious. The tool you build here automates that work — and because every release has new commits, you can **run it again and again**. It also serves as a template for any CLI tool you want to power with Copilot.

We will build a CLI tool called **changelog-gen** with the following features:

| Feature | Description |
|---------|-------------|
| **Git history analysis** | Reads commits between any two refs (tags, SHAs, branches) |
| **Categorized output** | Produces structured release notes (Features, Bug Fixes, Breaking Changes, etc.) |
| **Real-time streaming** | Shows output token-by-token as it generates |
| **Custom tools** | Gives the agent `get_git_log` and `read_file` tools to inspect the repo |
| **Interactive follow-ups** | Lets you ask questions like *"Expand on the auth changes"* or *"Which commits affect the API?"* |

When finished you will be able to run:

```bash
node changelog.mjs HEAD~10 HEAD
```

and get a polished changelog streamed straight to your terminal along with the ability to ask follow-up questions interactively.

## Background: What Is the Copilot SDK?

The [GitHub Copilot SDK](https://github.com/github/copilot-sdk) is a multi-platform library (TypeScript, Python, Go, .NET, Java) that wraps the Copilot CLI's agent runtime. Instead of interacting with Copilot through an editor or terminal, you call it from code.

### How It Works

```
┌──────────────────────┐       ┌──────────────────┐       ┌─────────────────┐
│  Your Application    │──────▶│  Copilot SDK     │──────▶│  Copilot CLI    │
│  (Node.js script)    │◀──────│  (npm package)   │◀──────│  (agent runtime)│
└──────────────────────┘       └──────────────────┘       └─────────────────┘
         │                              │                          │
    Code calls SDK              SDK manages sessions        CLI handles LLM
    methods & events            and tool dispatch           calls & execution
```

The SDK communicates with a local Copilot CLI process that handles model routing, authentication, and the planning/execution loop. Your code focuses on *what* to ask and *which tools* to provide.

### Key Concepts

| Concept | Description |
|---------|-------------|
| **Client** | The main entry point. Starts/stops the Copilot CLI background process. |
| **Session** | A conversation context. Supports multi-turn prompts, tool calling, and streaming. |
| **Tools** | Functions your code defines that the agent can invoke to gather data or perform actions. |
| **Events** | Real-time streaming events (`assistant.message_delta`, `session.idle`, etc.) emitted during generation. |
| **BYOK** | Bring Your Own Key — optionally connect to other LLM providers instead of GitHub's models. |

### Available SDKs

| Language | Install Command | 
|----------|----------------|
| **TypeScript/Node.js** | `npm install @github/copilot-sdk` |
| **Python** | `pip install github-copilot-sdk` |
| **Go** | `go get github.com/github/copilot-sdk/go` |
| **.NET** | `dotnet add package GitHub.Copilot.SDK` | 
| **Java** | Maven / Gradle |

Unnofficial SDKs for Rust, Clojure, and C++ also exist in the community.

> **Why TypeScript for this lab?** TypeScript/Node.js has the most mature SDK, extensive examples, and is the most common choice for CLI tooling. The concepts you learn here apply to every SDK.

## Prerequisites

Before you begin, ensure you have:

- [ ] **Node.js 24+** — check with `node --version`
- [ ] **npm 9+** — check with `npm --version`
- [ ] **GitHub Copilot subscription** — Individual, Business, or Enterprise
- [ ] **Copilot CLI installed & authenticated** — install with `npm install -g @githubnext/copilot-cli` and authenticate with `copilot auth login`
- [ ] **A git repository with commit history** — any repo works. The tool you build will analyze commits between any two refs (tags, SHAs, branches), so you can use it on your own projects or open-source repos.

:::tip No git repo handy?
Clone a popular open-source project to experiment with:
```bash
git clone https://github.com/expressjs/express.git sample-repo
cd sample-repo
```
You can also use the `changelog-gen` project itself — by the time you reach Step 5, it will have its own commit history if you've been committing your work along the way.
:::

## Step 1: Scaffold the Project

Create a new directory and initialize the project:

```bash
mkdir changelog-gen && cd changelog-gen
npm init -y
```

Install the Copilot SDK:

```bash
npm install @github/copilot-sdk
```

| Package | Purpose |
|---------|---------|
| `@github/copilot-sdk` | The Copilot SDK — client, sessions, streaming, and tool support |

Since we are writing a simple CLI tool, we will use plain `.mjs` files (ES modules) — no TypeScript compilation needed. Update `package.json` to set the module type:

```json
{
  "type": "module"
}
```

Your project structure:

```
changelog-gen/
├── node_modules/
├── package.json
└── package-lock.json
```

## Step 2: Hello Copilot SDK

Create a file called `hello.mjs` — this is a minimal "hello world" to verify the SDK is working:

```javascript
// hello.mjs — Verify the Copilot SDK is working
import { CopilotClient, approveAll } from "@github/copilot-sdk";

// 1. Create a client (manages the Copilot CLI background process)
const client = new CopilotClient();
await client.start();

// 2. Create a session (a conversation context)
const session = await client.createSession({
  model: "gpt-4.1",
  onPermissionRequest: approveAll,
});

// 3. Send a prompt and wait for the full response
const response = await session.sendAndWait({
  prompt: "In one sentence, what makes a good changelog?",
});

console.log(response?.data.content);

// 4. Clean up
await client.stop();
```

Run it:

```bash
node hello.mjs
```

You should see a one-sentence answer printed to your terminal. If you get an authentication error, make sure you have run `copilot auth login` first.

:::info What just happened?
1. `CopilotClient` started a Copilot CLI process in the background.
2. `createSession` opened a new conversation with the `gpt-4.1` model.
3. `sendAndWait` sent your prompt and blocked until the full response was ready.
4. `client.stop()` shut down the background process.

This is the simplest possible SDK usage — one prompt, one response. In the next steps we will add streaming, tools, and multi-turn conversations.
:::

## Step 3: Add Real-Time Streaming

Replace waiting for the full response with **streaming** — see tokens appear as they are generated. Create `stream.mjs`:

```javascript
// stream.mjs — Stream responses token-by-token
import { CopilotClient, approveAll  } from "@github/copilot-sdk";

const client = new CopilotClient();
await client.start();

const session = await client.createSession({
  model: "gpt-4.1",
  streaming: true,
  onPermissionRequest: approveAll,
});

// Listen for streaming deltas (individual tokens/chunks)
session.on("assistant.message_delta", (event) => {
  process.stdout.write(event.data.deltaContent);
});

// Listen for when the session finishes processing
session.on("session.idle", () => {
  console.log("\n--- Done ---");
});

// Send a prompt — streaming events fire as the response generates
await session.sendAndWait({
  prompt: "Write a short, professional changelog entry for a feature that adds dark mode support to a web application.",
});

await client.stop();
```

Run it:

```bash
node stream.mjs
```

When creating the session, `streaming: true` enables real-time token streaming. You should see the response appear **word by word** in your terminal, just like a chat interface. This is essential for a good user experience in CLI tools — nobody wants to stare at a blank screen for 10 seconds.

### Key Streaming Events

| Event | When It Fires | Typical Use |
|-------|---------------|-------------|
| `assistant.message_delta` | Each chunk of the response | Display output in real time |
| `session.idle` | Agent has finished all work | Print a newline, show a prompt, clean up |

## Step 4: Define Custom Tools

This is where it gets powerful. So far the agent can only generate text from its training data. By defining **custom tools**, you give it the ability to **reach into the real world** — read files, query APIs, run commands.

Create `tools.mjs` with two tools the agent will use to analyze a repository:

```javascript
// tools.mjs — Custom tools: get_git_log and read_file
import { CopilotClient, approveAll } from "@github/copilot-sdk";
import { execSync } from "child_process";
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

const REPO_PATH = process.argv[2] || ".";

const client = new CopilotClient();
await client.start();

const session = await client.createSession({
  model: "gpt-4.1",
  streaming: true,
  onPermissionRequest: approveAll,
  tools: [
    {
      name: "get_git_log",
      description:
        "Get the git commit log for a repository. Optionally filter by a ref range (e.g. 'v1.0.0..v2.0.0').",
      parameters: {
        type: "object",
        properties: {
          refRange: {
            type: "string",
            description:
              'A git ref range like "v1.0.0..v2.0.0" or "main~10..main". If omitted, returns the last 20 commits.',
          },
          maxCount: {
            type: "number",
            description: "Maximum number of commits to return. Default: 50.",
          },
        },
      },
      handler: async ({ refRange, maxCount = 50 }) => {
        const rangeArg = refRange ? ` ${refRange}` : "";
        const cmd = `git -C ${resolve(REPO_PATH)} log${rangeArg} --pretty=format:"%h %s (%an, %ad)" --date=short -n ${maxCount}`;
        try {
          return execSync(cmd, { encoding: "utf-8" });
        } catch (err) {
          return {
            textResultForLlm: `Error running git log: ${err.message}`,
            resultType: "failure",
            error: err.message,
          };
        }
      },
    },
    {
      name: "read_file",
      description:
        "Read the contents of a file in the repository. Useful for inspecting READMEs, configs, or source files.",
      parameters: {
        type: "object",
        properties: {
          filePath: {
            type: "string",
            description:
              "Path to the file relative to the repository root.",
          },
        },
        required: ["filePath"],
      },
      handler: async ({ filePath }) => {
        const fullPath = resolve(REPO_PATH, filePath);
        if (!existsSync(fullPath)) {
          return {
            textResultForLlm: `File not found: ${filePath}`,
            resultType: "failure",
            error: `File not found: ${filePath}`,
          };
        }
        const content = readFileSync(fullPath, "utf-8");
        if (content.length > 10000) {
          return content.slice(0, 10000) + "\n\n... [truncated]";
        }
        return content;
      },
    },
  ],
});

// Stream the response
session.on("assistant.message_delta", (event) => {
  process.stdout.write(event.data.deltaContent);
});

session.on("session.idle", () => {
  console.log();
});

await session.sendAndWait(
  {
    prompt: `You have access to a git repository. Use the get_git_log tool to retrieve the last 10 commits and summarize what changed recently.`,
  },
  120000,
);

await client.stop();
```

Run it (point it at any repo — or omit the path to use the current directory):

```bash
# Use the current directory
node tools.mjs

# Or point at another repo
node tools.mjs ../my-other-project
```

Watch the agent **call your tools automatically** — it will invoke `get_git_log`, receive the commit list, and then summarize the changes in natural language.

:::info How tool calling works
1. You define tools with a `name`, `description`, `parameters` schema, and an `execute` function.
2. When the agent decides it needs data, it emits a tool call request.
3. The SDK automatically invokes your `execute` function and feeds the result back to the agent.
4. The agent incorporates the tool output into its response.

You never need to handle the dispatch loop yourself — the SDK manages it.
:::

## Step 5: Build the Changelog Generator

Now combine everything into the main CLI tool. Create `changelog.mjs`:

```javascript
// changelog.mjs — Smart Changelog Generator
import { CopilotClient, approveAll } from "@github/copilot-sdk";
import { execSync } from "child_process";
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";
import { createInterface } from "readline";

// --- Parse CLI arguments ---
const args = process.argv.slice(2);
if (args.length < 2) {
  console.error("Usage: node changelog.mjs <from-ref> <to-ref> [repo-path]");
  console.error("Example: node changelog.mjs v1.0.0 v2.0.0");
  console.error("Example: node changelog.mjs main~20 main ./my-project");
  process.exit(1);
}

const [fromRef, toRef, repoPath = "."] = args;
const refRange = `${fromRef}..${toRef}`;
const resolvedRepo = resolve(repoPath);

console.log(`\n📋 Generating changelog for ${refRange} in ${resolvedRepo}\n`);

// --- Define tools ---
const tools = [
  {
    name: "get_git_log",
    description:
      "Get the git commit log. Supports a ref range like 'v1.0.0..v2.0.0'.",
    parameters: {
      type: "object",
      properties: {
        refRange: {
          type: "string",
          description: 'A git ref range, e.g. "v1.0.0..v2.0.0".',
        },
        maxCount: {
          type: "number",
          description: "Max commits to return. Default: 100.",
        },
      },
    },
    handler: async ({ refRange: range, maxCount = 100 }) => {
      const rangeArg = range ? ` ${range}` : "";
      const cmd = `git -C ${resolvedRepo} log${rangeArg} --pretty=format:"%h|%s|%an|%ad" --date=short -n ${maxCount}`;
      try {
        return execSync(cmd, { encoding: "utf-8", stdio: ["pipe", "pipe", "pipe"] });
      } catch (err) {
        return {
          textResultForLlm: `Error running git log: ${err.message}`,
          resultType: "failure",
          error: err.message,
        };
      }
    },
  },
  {
    name: "read_file",
    description: "Read a file from the repository.",
    parameters: {
      type: "object",
      properties: {
        filePath: {
          type: "string",
          description: "File path relative to the repo root.",
        },
      },
      required: ["filePath"],
    },
    handler: async ({ filePath }) => {
      const fullPath = resolve(resolvedRepo, filePath);
      if (!existsSync(fullPath)) {
        return {
          textResultForLlm: `File not found: ${filePath}`,
          resultType: "failure",
          error: `File not found: ${filePath}`,
        };
      }
      const content = readFileSync(fullPath, "utf-8");
      return content.length > 10000
        ? content.slice(0, 10000) + "\n... [truncated]"
        : content;
    },
  },
];

// --- Start the Copilot SDK ---
const client = new CopilotClient();
await client.start();

const session = await client.createSession({
  model: "gpt-4.1",
  streaming: true,
  onPermissionRequest: approveAll,
  tools,
});

// Stream output to the terminal
session.on("assistant.message_delta", (event) => {
  process.stdout.write(event.data.deltaContent);
});

session.on("session.idle", () => {
  console.log();
});

// --- Generate the changelog ---
const response = await session.sendAndWait({
  prompt: `You are a release notes writer. Use the get_git_log tool to retrieve the commits in the range "${refRange}".

Then produce a well-structured changelog in Markdown with these sections:
- **Summary** — A 2-3 sentence overview of the release.
- **✨ Features** — New capabilities added.
- **🐛 Bug Fixes** — Issues resolved.
- **⚠️ Breaking Changes** — Anything that requires user action.
- **🔧 Maintenance** — Refactoring, dependency updates, CI changes, docs.

Rules:
- Group related commits together under a single bullet point when appropriate.
- Write from the user's perspective, not the developer's. Say "You can now..." not "Added a function that...".
- If a category has no commits, omit it.
- Include the commit hash in parentheses at the end of each entry for traceability.
- If you need more context on a specific change, use the read_file tool to inspect relevant files.`,
});

const content = response?.data.content || "";
const looksLikeChangelog = content.includes("##") || content.includes("**Summary**");

if (looksLikeChangelog) {
  console.log("\n✅ Changelog generated!\n");
} else {
  console.error("\n❌ Failed to generate changelog.\n");
  process.exitCode = 1;
}

await client.stop();
```

Run it:

```bash
# Easiest: analyze the last 5 commits in the current repo
node changelog.mjs HEAD~5 HEAD

# Analyze the last 10 commits on main
node changelog.mjs HEAD~10 HEAD

# Point at a different repo on disk
node changelog.mjs HEAD~5 HEAD ../my-other-project

# If the repo uses version tags, use those
node changelog.mjs v1.0.0 v2.0.0
```

:::tip Finding valid refs to use
Not sure what refs to use? These commands help:
```bash
# See how many commits the repo has
git log --oneline | head -20

# List available tags
git tag --sort=-creatordate | head -10

# Use relative refs — HEAD~N always works
# HEAD~5 = 5 commits back, HEAD~10 = 10 commits back
```
`HEAD~N HEAD` is the most reliable approach since it works on **any** repo with enough commits — no tags required.
:::

What an example to test?  Check out the GitHub Actions Runner repository! 

* View the releases page [here](https://github.com/actions/runner/releases)
* Clone the repository and run the changelog generator against two recent releases:
  ```bash
  git clone https://github.com/actions/runner.git
  # Update the refs below to the two most recent releases.
  node changelog.mjs v2.332.0 v2.333.0 runner
  ```

* How did it do compared to the official release notes?

You should see a polished, categorized changelog streamed to your terminal in real time. The agent will call `get_git_log` to fetch the commits, analyze them, and optionally call `read_file` if it needs more context on a particular change.

## Step 6: Interactive Follow-Ups

The session is still alive after generating the changelog, which means we can add **multi-turn conversation** — let users ask follow-up questions.

In `changelog.mjs`, replace everything **after** the `const looksLikeChangelog = ...` line (the `if`/`else` block and `await client.stop()`) with the code below:

```javascript
if (!looksLikeChangelog) {
  console.error("\n❌ Failed to generate changelog.\n");
  await client.stop();
  process.exit(1);
}

// --- Interactive follow-up loop ---
const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
});

const askQuestion = () => {
  rl.question("💬 Ask a follow-up (or 'quit' to exit): ", async (input) => {
    const trimmed = input.trim();
    if (!trimmed || trimmed.toLowerCase() === "quit") {
      console.log("👋 Goodbye!");
      rl.close();
      await client.stop();
      return;
    }

    await session.sendAndWait({ prompt: trimmed });
    console.log();
    askQuestion();
  });
};

console.log("\n✅ Changelog generated! You can now ask follow-up questions.\n");
askQuestion();
```

If changelog generation fails, the script exits immediately. On success, it drops into an interactive prompt:

```
✅ Changelog generated! You can now ask follow-up questions.

💬 Ask a follow-up (or 'quit' to exit): Which commits affect the API?
...streaming response...

💬 Ask a follow-up (or 'quit' to exit): Rewrite the summary for a non-technical audience
...streaming response...

💬 Ask a follow-up (or 'quit' to exit): quit
👋 Goodbye!
```

Because the session retains context from the initial changelog generation, follow-up questions are answered in the context of the same commits and analysis — no need to re-fetch or re-explain.

## Step 7: Wrap-Up & Next Steps

Congratulations! You have built a fully functional CLI tool powered by the GitHub Copilot SDK. This included project scaffolding, SDK installation, creating a client and session, sending prompts, streaming responses, defining custom tools, building a complete CLI application, and handling multi-turn interactive conversations!

Here are ways to extend what you built with different SDK capabilities:

| Extension | Difficulty | What You'll Practice |
|-----------|-----------|---------------------|
| **Add a `get_diff` tool** that returns the actual code diff for a commit | Easy | Deeper tool definitions |
| **Export to file** — write the changelog to `CHANGELOG.md` automatically | Easy | Post-processing SDK output |
| **CI/CD integration** — run on `git tag` push to auto-generate GitHub Release notes | Medium | Headless (non-interactive) SDK usage |
| **Multiple output formats** — JSON, HTML, Slack blocks | Medium | Prompt engineering with structured output |
| **Add a `search_issues` tool** that queries GitHub Issues for context | Advanced | API integration with tool calling |

## Bonus Challenge: Export to Markdown File

If you want a quick win, add automatic file export. The `response` from `sendAndWait` already contains the full changelog text, so you can write it to a file right after the validation check. In `changelog.mjs`, add this right after the failure guard (the `if (!looksLikeChangelog)` block that calls `process.exit(1)`):

```javascript
import { writeFileSync } from "fs";

// ... (add this import at the top of the file with the other imports)

// After the failure guard, save the changelog to a file:
writeFileSync("CHANGELOG.md", content);
console.log("📄 Saved to CHANGELOG.md");
```

So the end of your file should look like:

```javascript
if (!looksLikeChangelog) {
  console.error("\n❌ Failed to generate changelog.\n");
  await client.stop();
  process.exit(1);
}

writeFileSync("CHANGELOG.md", content);
console.log("📄 Saved to CHANGELOG.md");

// --- Interactive follow-up loop ---
// ... rest of Step 6 code ...
```

Now every run produces both terminal output and a `CHANGELOG.md` file you can commit to your repo.

## Related Resources

### Official Documentation

- [GitHub Copilot SDK Repository](https://github.com/github/copilot-sdk): Source code, README, and multi-language examples
- [Getting Started with Copilot SDK (GitHub Docs)](https://docs.github.com/en/copilot/how-tos/copilot-sdk/sdk-getting-started): Official quickstart guide
- [SDK Features Documentation](https://github.com/github/copilot-sdk/blob/main/docs/features/index.md): Detailed guides for sessions, tools, streaming, hooks, and more
- [GitHub Blog: Build an Agent into Any App with the GitHub Copilot SDK](https://github.blog/news-insights/company-news/build-an-agent-into-any-app-with-the-github-copilot-sdk/): Announcement and overview

### Video Tutorials

- 🎥 [GitHub Copilot SDK in Action: Flight School (8:51)](https://www.youtube.com/watch?v=wN8oD9BHS_U): Demonstrates what is possible with the GitHub Copilot SDK
- 🎥 [GitHub Copilot SDK Tutorial: Build AI Apps with Live Coding (6:10)](https://www.youtube.com/watch?v=ZGo362en01M): Hands-on live coding walkthrough covering setup, sessions, and tools
- 🎥 [The GitHub Copilot SDK IS INSANE! Put Copilot INSIDE Your Apps! (20:54)](https://www.youtube.com/watch?v=GsEPS1yHaHQ): James Montemagno's deep dive on SDK features including streaming, tool calling, and .NET examples

### Community Guides & Blog Posts

- [Building Agents with GitHub Copilot SDK (Microsoft Tech Community)](https://techcommunity.microsoft.com/blog/azuredevcommunityblog/building-agents-with-github-copilot-sdk-a-practical-guide-to-automated-tech-upda/4488948): Practical guide to building automated agents
- [Integrate GitHub Copilot SDK into Your Apps – Quick Guide (AIBit)](https://aibit.im/blog/post/integrate-github-copilot-sdk-into-your-apps-quick-guide): Community integration guide with security and BYOK coverage
- [Building Custom AI Tooling with the GitHub Copilot SDK for .NET](https://benjamin-abt.com/blog/2026/02/03/github-copilot-sdk-dotnet-tooling/): .NET-focused guide (great cross-reference for polyglot teams)

