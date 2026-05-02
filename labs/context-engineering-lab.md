---
title: "Lab: Context Engineering"
description: Learn to measure, optimize, and engineer the context you feed to AI models — cutting token waste and reducing costs while getting better results.
sidebar_position: 4
---

# Lab: Context Engineering

> **Duration:** ~2 hours | **Level:** Intermediate | **Prerequisites:** Active [GitHub Copilot subscription](https://github.com/features/copilot/plans), [GitHub Copilot CLI installed](https://github.com/features/copilot/cli), Basic familiarity with Copilot CLI (or completion of the [Zero to Hero lab](https://copilot-academy.github.io/labs/copilot-cli-zero-to-hero)), [Node.js 22+](https://nodejs.org/)

## Objective

Every token your AI coding agent reads or writes costs money. A single chatty response can cost more than a carefully optimized session. In practice, a significant portion of token budgets goes to noise: formatting, filler words, verbose tool output, and stale conversation history.

In this lab, you will learn **context engineering**: the practice of designing, measuring, and optimizing the information you feed to AI models. You will measure real token usage and build habits that can save your organization thousands of dollars per month.

By the end, you'll be able to:

- Explain the difference between prompt engineering and context engineering
- Measure token usage in real time using Copilot CLI
- Reduce output tokens by 60–80% through custom instructions
- Choose the right model for each task
- Manage sessions to avoid the "stale session tax"
- Filter tool output to eliminate context window pollution
- Write information-dense prompts that get better results with fewer tokens

## Background: From Prompt Engineering to Context Engineering

Andrej Karpathy put it best:

> *"We should probably start saying 'context engineering' instead of 'prompt engineering.' We went from prompt to few-shot to retrieval-augmented to tool-augmented to ever more dynamic, programmatically synthesized, long, structured contexts. You don't write prompts anymore — you engineer contexts."*

When you chat with an AI model, your prompt is just the tip of the iceberg. The **context window** is the total block of tokens the model processes. It includes:

| Component | Description | Who Controls It |
|-----------|-------------|-----------------|
| **System prompt** | The model's instructions and persona | Copilot / Platform |
| **Custom instructions** | Your `.github/copilot-instructions.md` | You |
| **Conversation history** | Every previous message in the session | Accumulates automatically |
| **Tools** | MCP Servers, custom agents, skills | You |
| **Tool results** | Output from file reads, grep, git, shell commands | You (indirectly) |
| **File contents** | Files pulled in via `@` mentions or exploration | You (direct/indirect) |
| **Model reasoning** | Internal thinking tokens (on thinking models) | Model configuration |

**The key insight**: You control most of what goes into the context window. Context engineering is about making deliberate choices to maximize signal and minimize noise in that window.

### Why Cost Matters — Now More Than Ever

> ⚠️ **Billing is changing.** GitHub Copilot is transitioning from **premium request** billing to **usage-based billing**, similar to how OpenAI, Anthropic, and other model providers charge. Under this model, every token you consume directly affects your invoice. The techniques in this lab are money-saving measures with a direct line to your bill.

Token pricing follows a simple formula, but there's a hidden discount most developers don't know about:

```
Cost = (Uncached Input * Input Price)
     + (Cached Input  * Input Price * 0.1)    ← 90% discount!
     + (Output Tokens * Output Price)
```

**Prompt caching** is automatic on most AI platforms: when your prompt starts with the same prefix as a recent request (system prompt, instructions, conversation history), those tokens are served from cache at **~10% of the normal input price**. The first time content is cached, it costs ~25% more than base input — but every subsequent cache hit within the 5-minute TTL saves 90%. Active coding sessions naturally maximize cache hits because your system prompt and conversation history form a stable, growing prefix.

:::tip What this means in practice
Your system prompt (~2,000 tokens) + custom instructions (~500 tokens) + tool definitions (~10,000 tokens) get cached on the first request. For the rest of your session, those approximately 12,500 tokens cost only ~10% of the initial request.  If you do this 100 times a day that difference adds up. We'll cover how to exploit caching strategically in Exercise 5.
:::

**Output tokens cost 3–5 times more than input tokens**. A chatty 4,000-token response at $75/MTok output costs **$0.30**. Compress that to 1,000 tokens and you pay **$0.075**. Do that 200 times per day across a 10-person team, and you're saving **$450/day** — over **$100K per year**.

Under usage-based billing, these aren't abstract numbers. They're your actual costs. Every technique in this lab directly reduces your bill.

## Exercise 1 — See What's in the Window

### 1.1 Launch and Set Your Model

Start a new Copilot CLI session in an empty directory:

```bash
mkdir context-lab && cd context-lab
git init
copilot
```

Select a model for this lab. **Auto** is a good default — it picks the best available model and gives a 10% multiplier discount on paid plans. For the thinking token comparisons in Exercise 4, you'll want a reasoning-capable model like Claude Opus or GPT-5.5:

```
/model
```

Choose **Claude Opus 4.6** (or the latest Opus). We'll switch models later to compare costs.

### 1.2 Check the Baseline

Before you type anything, look at what's already in your context window:

```
/context
```

You'll see a breakdown showing:
- **System/tool overhead**: The instructions and tool definitions Copilot loads automatically
- **Messages/conversation**: Empty (you haven't said anything yet)
- **Buffer**: Reserved space for compaction triggers
- **Remaining free space**: The tokens available for your work

> 📝 **Write down** the baseline token usage. This is the "fixed cost" of every session — before you've done anything useful. The only way to reduce this is removing tools, agents, and other customizations.

### 1.3 Watch the Window Grow

Now ask a simple question:

```
What is context engineering?
```

After Copilot responds, immediately run:

```
/context
```

Compare the numbers. Notice:
- **Your question** added tokens (input)
- **Copilot's response** added tokens (output, now part of conversation history)
- The remaining space shrank

:::note Using VS Code? 
There is a donut-shaped context usage visualization in the bottom-right that shows the same information. Normally it is not available until the first chat message.
:::

Ask one more question:

```
How does it differ from prompt engineering?
```

Run `/context` again. The conversation history is growing with every turn.

### ✅ Checkpoint

You can read the `/context` output and understand the three main sections: system overhead, conversation history, and remaining space. You've seen that every message permanently consumes window space whether it is yours or the AI's.

## Exercise 2 — Measuring the Real Cost

### 2.1 The Verbose Experiment

Let's see how much a verbose response costs. First run `/clear` to clear your session.  Then ask Copilot:

```
Explain the SOLID principles in software engineering. Include examples for each principle, best practices, common mistakes, and how they apply to modern JavaScript development.
```

After the response, run `/context` and note the total tokens used.

### 2.2 The Concise Experiment

Run `/clear` again to clear your history. Now ask for the same information, but differently:

```
List the 5 SOLID principles. One sentence each, no examples.
```

Run `/context` again. Compare the token difference between the two responses.

:::tip Key insight
The verbose response likely used 3–5 times more output tokens than the concise one — and output tokens are the expensive ones.
:::

### 2.3 Check Usage Stats

Before exiting, run:

```
/usage
```

This shows token consumption statistics for the current session, including breakdown by model and request count.

Now exit the session:

```
/exit
```

Copilot also shows a **session summary** at exit including:
- Total tokens consumed per model
- Number of premium requests (This will be removed after June 1, 2026)
- A link to resume the session

> 📝 **Write down** the total token count from this session. We'll compare it to an optimized session later.

:::tip Want deeper analytics?
[Codeburn](https://github.com/getagentseal/codeburn) reads your Copilot CLI session data from `~/.copilot/session-state/` and provides a TUI dashboard with cost breakdowns by model, tool, task type, and project. In addition there is an `optimize` command that detects waste patterns. Install with `npm install -g codeburn` and run with `codeburn`.
:::

### 2.4 Quick Cost Calculation

Use these approximate model rates to understand the economics. As Copilot transitions to **usage-based billing**, these rates become increasingly relevant. Your token consumption will directly determine your costs:

| Model | Input (per 1M tokens) | Output (per 1M tokens) |
|-------|----------------------|----------------------|
| Claude Haiku 4.5 | $1.00 | $5.00 |
| Claude Sonnet 4.6 | $3.00 | $15.00 |
| Claude Opus 4.7 | $5.00 | $25.00 |
| GPT-5.5 | $5.00 | $30.00 |
| GPT-5.3-Codex | $1.75 | $14.00 |
| GPT-5.4 Mini | $0.75 | $4.50 |

:::warning Token prices change frequently
The exact numbers matter less than the **ratios** — output is always significantly more expensive than input, and more robust models cost 5–20 times more than lightweight ones.
:::

:::note Enterprise cost reality
Usage-based billing changes the economics of AI coding. In the previous premium request model, requests were originally a single LLM round trip question and answer.  With agents that model became unsustainable as a single request could be many LLM calls and potentially cost $100s. Usage-based billing means you must understand and control token consumption as it directly impacts your team's budget
:::

### ✅ Checkpoint

You can measure token usage per interaction, read session exit stats, and estimate costs. You understand that output tokens are a primary cost driver.

## Exercise 3 — Taming the Output (The Biggest Win)

Since output tokens cost 3–5 times more than input, **reducing output verbosity is the single highest-ROI optimization**.

### 3.1 Start a Fresh Session

```bash
copilot
```

### 3.2 Ask Without Instructions

```
Write a JavaScript function that validates an email address using a regex. Include error handling.
```

After the response, run `/context`. Note:
- Did Copilot add an explanation you didn't ask for?
- Did it include usage examples?
- Did it add a "note" or "tip" at the end?

All of that is **output token waste**. You asked for a function, not a tutorial!

### 3.3 Ask With a Conciseness Constraint

Run `/context` to measure usage. Now `/clear` your session and ask again, with explicit output constraints:

```
Write a JavaScript function that validates an email address using a regex. Include error handling. Code only — no explanation, no examples, no notes.
```

Run `/context`. Compare the output token difference.

### 3.4 Make It Permanent with Custom Instructions

Exit the session (`/exit`) and create a project instruction file:

```bash
mkdir -p .github
cat > .github/copilot-instructions.md << 'EOF'
# Project Instructions

## Response Style
- Be extremely concise. No pleasantries, no filler.
- When asked to write code, return code only unless explanation is explicitly requested.
- No sycophantic preambles ("Sure!", "Great question!", "Absolutely!").
- No "Here's a function that..." preambles.
- Don't restate the question before answering.
- No "Note:", "Tip:", or "Remember:" appendices unless asked.
- No usage examples unless asked.
- No unsolicited suggestions or improvements beyond what was asked.
- Use short variable names where meaning is clear from context.

## Code Style
- JavaScript (ES2022+), no TypeScript unless specified
- Arrow functions, const over let
- Minimal inline comments — only for genuinely complex logic
EOF
```

Alternatively you could make this a user-level setting, but ideally all people take advantage.

:::warning Instruction files have a cost
Everything in `copilot-instructions.md` is sent as **input tokens on every single turn**. Caching helps reduce the cost. However, keep instructions small and high-impact. A 500-word instruction file costs tokens 50+ times per session. Aim for the smallest set of rules that produce the biggest behavior change.
:::

:::tip How far can you push it? 
The [Caveman](https://github.com/JuliusBrussee/caveman) project takes this to the extreme by rewriting all model output in a compressed "caveman speak" style that reduces output tokens by ~75%. While you may not want caveman-speak, it demonstrates just how much output bloat is in typical AI responses. You can follow the same principle by telling the model exactly how to format its output. It is what makes your custom instructions so effective.
:::

Restart Copilot so it picks up the instructions:

```bash
copilot
```

### 3.5 See the Difference

Ask the same question again:

```
Write a JavaScript function that validates an email address using a regex. Include error handling.
```

Run `/context`. The response should be dramatically shorter while retaining the same quality code.

### 3.6 Verify Instructions Are Active

```
/instructions
```

This shows which instruction files Copilot is currently reading. Confirm your `.github/copilot-instructions.md` appears.

### ✅ Checkpoint

You've seen that custom instructions can reduce output tokens by 60–80% for typical code generation tasks. This is the single biggest cost lever you have.

## Exercise 4 — Right-Sizing Your Model

Not every task needs the most expensive model, but many people don't think to change. A function rename doesn't need the same horsepower as an architecture decision.

### 4.1 Set Up a Test File

Create a simple file to work with:

```bash
cat > calculator.js << 'EOF'
function add(a, b) { return a + b; }
function subtract(a, b) { return a - b; }
function multiply(a, b) { return a * b; }
function divide(a, b) {
  if (b === 0) throw new Error('Division by zero');
  return a / b;
}
module.exports = { add, subtract, multiply, divide };
EOF
```

### 4.2 Simple Task on a Cheap Model

Try the task with a lightweight model using non-interactive mode:

```bash
cat calculator.js | copilot --model claude-haiku-4.5 --allow-tool='write' -p "Add a modulo function following the same pattern as the existing functions. Code only."
```

Review the output. For a simple, pattern-following task, Haiku produces perfectly fine code.

### 4.3 Same Task on an Expensive Model

Rewrite the calculator.js file to reset the content.  Use the `cat` command above to overwrite. Then run the same prompt with a stronger model:

```bash
cat calculator.js | copilot --model claude-opus-4.6 --allow-tool='write' -p "Add a modulo function following the same pattern as the existing functions. Code only."
```

Compare: the output quality is likely identical for this simple task, but Opus costs significantly more per token.

### 4.4 Complex Task Comparison

Reset the file again. Now try something that actually benefits from a smarter model:

```bash
cat calculator.js | copilot --model claude-haiku-4.5 --allow-tool='write' --allow-tool='shell' -p "Refactor this module to use a class with method chaining, add input validation for all methods (must be finite numbers), add a history feature that tracks the last 10 operations, and make it work as both CommonJS and ESM. Code only."
```

Remove files and reset calculator.js again. Now run the same prompt with Opus:

```bash
cat calculator.js | copilot --model claude-opus-4.6 --allow-tool='write' --allow-tool='shell' -p "Refactor this module to use a class with method chaining, add input validation for all methods (must be finite numbers), add a history feature that tracks the last 10 operations, and make it work as both CommonJS and ESM. Code only."
```

Compare the quality. For complex, multi-requirement tasks, the premium model usually produces noticeably better code.

### 4.5 The Model Selection Framework

GitHub organizes available models into **task categories**, not just cost tiers. Use this table to pick the right model for what you're actually doing[^model-comparison]:

| Task Category | When to Use | Recommended Models | Cost Tier |
|---------------|-------------|---------------------|-----------|
| **General-purpose coding** | Writing/reviewing functions, docs, code diffs, explaining errors | Claude Sonnet 4.6, GPT-5.3-Codex, GPT-5.4 mini | Low–Medium |
| **Fast / repetitive** | Boilerplate, syntax help, commit messages, formatting, prototyping | Claude Haiku 4.5, Gemini 3 Flash | Lowest |
| **Deep reasoning & debugging** | Complex refactoring, multi-file analysis, architecture decisions, weighing trade-offs | Claude Opus 4.7, GPT-5.5, Gemini 3.1 Pro | High |
| **Agentic development** | Multi-step autonomous tasks with heavy tool use, codebase exploration | GPT-5.3-Codex, GPT-5.4 mini | Medium–High |

:::tip Auto Mode
If you're unsure, start with **Auto**. Copilot will select the best available model automatically and give you a 10% discount. You can always override once you see the task clearly.
:::

> 📖 **Reference**: [GitHub AI Model Comparison](https://docs.github.com/en/enterprise-cloud@latest/copilot/reference/ai-models/model-comparison): Task-based model selection guide with real examples.  Also, be aware of the [pricing](https://docs.github.com/en/enterprise-cloud@latest/copilot/reference/copilot-billing/models-and-pricing#pricing-tables) of models. To optimize you want to choose the cheapest model that can address the given task.

### 4.6 Thinking Tokens: The Hidden Output Cost

When you use a thinking-enabled model (like Claude Sonnet with extended thinking or Opus), the model generates **thinking tokens**. This is internal reasoning that doesn't appear in the response but still counts as output tokens. Since output tokens cost 3–5 times more than input, thinking tokens can significantly increase the cost of a request.

To see the difference, you need a prompt that genuinely requires multi-step reasoning. Create a file with a subtle concurrency bug:

```bash
cat > scheduler.js << 'EOF'
const tasks = [];
let running = false;

async function addTask(fn, priority = 0) {
  tasks.push({ fn, priority });
  tasks.sort((a, b) => b.priority - a.priority);
  if (!running) await drain();
}

async function drain() {
  running = true;
  while (tasks.length > 0) {
    const task = tasks.shift();
    await task.fn();
  }
  running = false;
}

module.exports = { addTask };
EOF
```

Now compare:

```bash
# Non-thinking model
cat scheduler.js | copilot --model claude-haiku-4.5 -p "Identify all race conditions and concurrency bugs in this scheduler. Be thorough."
```

```bash
# Thinking-enabled model
cat scheduler.js | copilot --model claude-opus-4.6 -p "Identify all race conditions and concurrency bugs in this scheduler. Be thorough."
```

After each run, check the token summary line. It looks something like this:

```
Tokens    ↑ 289.6k • ↓ 6.9k • 187.1k (cached) • 4.5k (reasoning)
```

Breaking that down:

| Field | What it means |
|-------|---------------|
| `↑` input | Total input tokens across all requests in the session |
| `↓` output | Total visible output tokens (the response text) |
| `(cached)` | Input tokens served from cache at ~10% of normal cost |
| `(reasoning)` | **Thinking tokens** — billed at output rates, never shown to you |

The `reasoning` field is the thinking token count. These are the hidden output tokens: the model's internal reasoning that you never see but are charged for at the same rate as regular output.

The high input total isn't just the file — each request carries the full system prompt and tool definitions (~75k tokens of overhead in this example). Three requests means that overhead is charged three times. The large `cached` number shows prompt caching is working: the stable system prefix was served at ~10% cost on repeated calls.

:::note Why task choice matters
Thinking tokens are only engaged when the model genuinely needs to reason. A factual question ("what's the time complexity of `x + y`?") produces no reasoning tokens on either model — there's nothing to think through. Concurrency bugs, security vulnerabilities, and architectural trade-offs require tracing multiple possible execution paths, which is exactly what extended thinking is designed for.
:::

**When thinking tokens are worth it:**
- Complex debugging with subtle logic errors
- Architecture decisions requiring multi-step reasoning
- Security audits that need thorough analysis

**When thinking tokens are waste:**
- Simple code generation and boilerplate
- Pattern-following tasks (adding a new endpoint like existing ones)
- Documentation, commit messages, formatting

### ✅ Checkpoint

Choosing the right model for each task type, including thinking vs. non-thinking models, can cut costs by 75%+ with no quality loss. Thinking tokens are a hidden cost multiplier.

### 4.7 Auto Model Selection: Let Copilot Decide

When you don't have a strong reason to pin a specific model, **Auto** is the optimal default. Copilot's auto model selection:

- Chooses from available models based on **real-time system health and performance**
- **Reduces rate limiting** by routing away from overloaded models
- Provides a **10% multiplier discount** on paid plans
- Automatically respects your org's model access policies

```
/model
```

Select **Auto** from the list.

> 📖 **Reference**: [About Copilot Auto Model Selection](https://docs.github.com/en/enterprise-cloud@latest/copilot/concepts/auto-model-selection)

:::note 
In the future auto model selection will route based on intent, choosing the best model based on the given prompt.
:::

### 4.8 Switching Models Mid-Session

You can change the active model **during a conversation** without losing context. The history carries over. Only the model processing it changes going forward. This means you can use a cheap model for routine turns and a premium model only for the turns that need it.

**Try it:**

Start a session on Auto (or Haiku):

```bash
copilot
```

Ask something simple:

```
List the 5 SOLID principles. One sentence each.
```

Now run `/model` and switch to a reasoning model (Opus or GPT-5.5):

```
/model
```

Ask a complex follow-up:

```
I have a Node.js Express app where all business logic lives in route handlers. Propose a refactoring plan to apply the Dependency Inversion Principle across 3 files. Be specific.
```

Then switch back to Haiku for a quick follow-up:

```
/model
```

```
Summarize the plan in 3 bullet points.
```

Run `/context` and `/usage` after each switch. You optimized price by using a thinking model only for the reasoning turn.

:::tip Retry with a different model
After any response, you can regenerate the same prompt using a different model via the retry button in the IDE or just re-running the same prompt in the CLI after switching. The full conversation context is preserved.
:::

### ✅ Checkpoint

You can classify tasks into model categories (general-purpose, fast, reasoning, agentic), use Auto as a cost-optimal default, override to specific models when justified, and switch models mid-session to pay premium pricing only for the turns that need it.

## Exercise 5 — Session Hygiene

Long-running sessions accumulate context debt. Every old message stays in the window, consuming tokens and potentially confusing the model with outdated information.

### 5.1 Build Up a Long Session

Start a new interactive session:

```bash
copilot
```

Have a conversation with several turns. Ask Copilot to:

```
Create a simple Express.js server with a GET /health endpoint
```

Then:

```
Add a POST /users endpoint that accepts name and email
```

Then:

```
Add input validation to the POST /users endpoint using Zod
```

Then:

```
Add a GET /users endpoint that returns all users
```

Then:

```
Add a DELETE /users/:id endpoint
```

Now check your context:

```
/context
```

Notice how much of the window is consumed by conversation history — most of which describes intermediate states of code that have already been superseded.

### 5.2 Compact the Session

Run the compact command:

```
/compact
```

Copilot will summarize the conversation history into a condensed form, preserving the essential decisions and current state while discarding the step-by-step intermediate dialogue.

Run `/context` again. Note the token reduction.

### 5.3 Compact with a Focus Hint

You can guide compaction by providing a hint about what matters. First create some more conversation history to compact: 

```
Add a new products endpoint with CRUD capabilities similar to the users endpoint 
```

Check the conversation history with `/context`. Then ask to compact with a focus hint:

```
/compact Focus on the current state of the Express server code and the API endpoints. Discard the step-by-step build process.
```

Review `/context` and also the ` /session checkpoints` link returned to you. This produces a focused summary based on the content you want to keep. 

### 5.4 Context Rot: The Quality Cliff

Even before you hit the context window limit, there's a more insidious problem: **context rot**.

Research and real-world experience show that model quality degrades significantly once context utilization exceeds **~60% of the window**. A 200K-token window doesn't give you 200K tokens of useful work:

```
Total window:           200,000 tokens
System prompt + tools:  -75,000 tokens (roughly)
Available:              125,000 tokens
Quality cliff (~60%):   ~75,000 tokens of conversation
─────────────────────────────────────────────
Effective usable:       ~45,000 tokens before quality degrades
```

:::tip Think of it as RAM
Your context window is like RAM: fast but limited. When it fills up, the model starts "swapping to disk". This results in losing track of earlier details, contradicting itself, and producing lower-quality output. Just like with RAM, the solution isn't just to use less. The solution is to **evict stale data** (via `/compact` or `/clear` for fresh sessions) before you hit the cliff.
:::

This is why session hygiene matters even when you're nowhere near the token limit. A 50K-token session full of outdated intermediate states performs worse than a 10K-token session with focused, current context.


### 5.5 The Stale Session Tax and Prompt Caching

Here's a cost trap many developers don't know about: **prompt cache expiration**.

AI platforms cache prompt prefixes to speed up repeated requests. When a cache hit occurs, those input tokens can cost as little as **10% of the normal price**.  This is a massive discount that happens automatically when you're actively working. Your system prompt, custom instructions, and the beginning of your conversation history are prime candidates for caching because they stay stable across requests.

But when you step away from a session (coffee break, meeting, lunch), this cache expires. When you return, the *entire conversation history* gets re-processed as **uncached input** at full price.

**How to exploit caching deliberately:**
- **Keep stable content at the beginning**: System prompt + custom instructions form a stable prefix that caches well
- **Work in focused bursts**: Active sessions maximize cache hit rates
- **Compact before breaks**: `/compact` shrinks the variable part of context while preserving the cache-friendly prefix
- **Start fresh for new tasks**: A new session with a small, stable prefix caches better than a bloated old session

**Rule of thumb**: If you're switching to a different task or returning after a break, strongly consider:
1. Running `/compact` before you leave
2. Starting a **new session** for the new task
3. Using `/clear` to reset the conversation while keeping instructions loaded

### 5.6 Practice the Fresh Start

Exit your session (`/exit`) and start a new one (`copilot`). Notice how the context is clean and the token usage is back to baseline (`/context`). This is your "fresh start" state — ideal for new tasks, especially if your previous session was long and bloated. In your new session, provide the context you need:

```
I have an Express.js server with CRUD endpoints for /users (GET all, GET by id, POST with Zod validation, DELETE by id) and a /health endpoint. I need to add PATCH /users/:id to update individual fields. The server uses an in-memory array for storage.
```

Starting fresh by restarting a session or using `/clear` allows you to avoid a bloated old session. This is useful when switching to a different task or returning after a break. You can still benefit from prompt caching on the new session's stable prefix (system prompt + instructions) while keeping the conversation history focused and relevant.

> 🧠 **Session recall — beyond the context window**: Copilot CLI maintains a `session-store.db` database that persists summaries, file edits, and refs across sessions. Currently if you have experimental model enabled, you can ask questions about the session history or use `/chronicle` to interact with it. This is your "disk" storage: slower to access but unlimited. See the documentation [here](https://docs.github.com/en/copilot/how-tos/copilot-cli/use-copilot-cli/chronicle) for details.  Tools like [auto-memory](https://github.com/dezgit2025/auto-memory) came before this and can automatically query this database to bring relevant historical context into new sessions, extending your effective memory far beyond a single context window. Think of it as giving Copilot a long-term memory that survives session restarts.

:::important
If your repositories are in GitHub, [Copilot Agentic Memory](https://docs.github.com/en/enterprise-cloud@latest/copilot/concepts/agents/copilot-memory) can automatically pull in relevant information from your codebase, PRs, issues, and more. This is a powerful way to give Copilot access to learn from your codebase without bloating the session window.
:::

### ✅ Checkpoint

You can use `/compact`, `/clear`, and fresh sessions strategically. You understand the stale session tax and know when to start fresh.

## Exercise 6 — Context Input: Files and Tool Output

Every time Copilot runs a tool, reads a file, executes a shell command, runs grep, the **entire output goes into the context window**. These input tokens are the biggest source of silent token waste.

:::warning How big is the problem?
Real-world measurements show a typical 2-hour coding session can generate **~210K tokens of raw CLI output** — enough to overflow a 200K context window on its own. Most of those tokens are noise: stack traces, progress bars, git object hashes, and verbose test runners.
:::

### 6.1 Set Up a Project to Explore

Let's create a small project with some files:

```bash
mkdir -p src tests
cat > src/app.js << 'EOF'
const express = require('express');
const app = express();
app.use(express.json());

const items = [];
let nextId = 1;

app.get('/items', (req, res) => {
  res.json(items);
});

app.post('/items', (req, res) => {
  const item = { id: nextId++, ...req.body, createdAt: new Date() };
  items.push(item);
  res.status(201).json(item);
});

app.get('/items/:id', (req, res) => {
  const item = items.find(i => i.id === parseInt(req.params.id));
  if (!item) return res.status(404).json({ error: 'Not found' });
  res.json(item);
});

app.delete('/items/:id', (req, res) => {
  const idx = items.findIndex(i => i.id === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  items.splice(idx, 1);
  res.status(204).send();
});

module.exports = app;
EOF

cat > src/server.js << 'EOF'
const app = require('./app');
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
EOF

cat > package.json << 'EOF'
{
  "name": "context-lab",
  "version": "1.0.0",
  "scripts": {
    "start": "node src/server.js",
    "test": "vitest run --reporter=verbose"
  },
  "dependencies": {
    "express": "^5.2.1"
  },
  "devDependencies": {
    "vitest": "^4.1.5",
    "supertest": "^7.2.2"
  }
}
EOF

npm install
```

### 6.2 The Whole-File Dump

Start a Copilot session:

```bash
copilot
```

Reference an entire file:

```
Look at @src/app.js and tell me if there are any bugs.
```

Run `/context`. The entire file content was sent into the window.
Note it is likely for a very large file that it will view in ranges.  

### 6.3 Targeted Context is Cheaper

Instead of referencing the whole file, be specific:

```
Look at the DELETE /items/:id handler in @src/app.js. Is the 404 handling correct?
```

Copilot still reads the file, but its response can be focused and you've signaled which part matters, reducing unnecessary output.  Check out `/context` to see the difference in token usage.

:::tip Key distinction
Selective context reduces *output* cost (shorter responses), not *input* cost (the file still loads). For true input reduction, avoid `@` mentions entirely and describe what you need from memory, or use the explore-then-act pattern below.
:::

### 6.4 Explore, Then Focus

For larger files, a useful pattern is a **cheap exploration step** before an **expensive action step**. Create a more complex file to demonstrate:

```bash
cat > src/middleware.js << 'EOF'
const rateLimit = new Map();

const rateLimiter = (maxRequests = 100, windowMs = 60000) => {
  return (req, res, next) => {
    const key = req.ip;
    const now = Date.now();
    const windowStart = now - windowMs;
    
    if (!rateLimit.has(key)) {
      rateLimit.set(key, []);
    }
    
    const requests = rateLimit.get(key).filter(t => t > windowStart);
    rateLimit.set(key, requests);
    
    if (requests.length >= maxRequests) {
      return res.status(429).json({ error: 'Too many requests' });
    }
    
    requests.push(now);
    next();
  };
};

const requestLogger = (req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.url} ${res.statusCode} ${duration}ms`);
  });
  next();
};

const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  
  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: err.message, details: err.details });
  }
  
  if (err.name === 'NotFoundError') {
    return res.status(404).json({ error: err.message });
  }
  
  res.status(500).json({ error: 'Internal server error' });
};

const corsMiddleware = (allowedOrigins = ['http://localhost:5173']) => {
  return (req, res, next) => {
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    }
    if (req.method === 'OPTIONS') {
      return res.status(204).send();
    }
    next();
  };
};

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  // Simple token validation — in production, verify JWT
  if (token === 'invalid') {
    return res.status(403).json({ error: 'Invalid token' });
  }
  req.user = { id: 'user-1', role: 'admin' };
  next();
};

module.exports = {
  rateLimiter,
  requestLogger,
  errorHandler,
  corsMiddleware,
  authMiddleware
};
EOF
```

Open a fresh `copilot` session and use a two-step approach:

* Step 1: Cheap exploration with a lightweight model to identify relevant parts of the file
  * Use `/model` to switch to Claude Haiku 4.5 for this step
    ```
    List all exported function names in src/middleware.js. Names only, one per line.
    ```

* Step 2: Reference exactly what you need with a stronger model for the actual code change
  * Use `/model` to switch to Claude Sonnet 4.6 for this step
    ```bash
    Rewrite the rateLimiter function in src/middleware.js to use a sliding window algorithm instead of a fixed window. The function signature and exports must stay the same. Code only.
    ```

This two-step pattern uses the cheap model for discovery and the expensive model only where it adds value.

### 6.5 Shell Output Bloat

Now try running a shell command:

```
Run `npm test` and tell me about the results
```

If tests fail (they will as we haven't written any), the full error output goes into the context window. Stack traces, file paths, Node.js internals... These can result in hundreds of tokens of noise.

:::tip Before/after examples of what the model actually needs
The gap between raw output and useful signal is enormous. Every unnecessary token competes with your actual code and conversation for space in the context window.

| Command | Raw output | What the model needs |
|---------|-----------|---------------------|
| `npm test` (all passing) | ~2,000 tokens of test runner output | "All 47 tests passed" |
| `npm test` (failures) | ~5,000 tokens with full stack traces | The failing test name + assertion error |
| `git push` | ~500 tokens of object enumeration | "Pushed to main successfully" |
| `npm install` | ~3,000 tokens of dependency resolution | "Installed 127 packages, 0 vulnerabilities" |
:::

### 6.6 The Filtered Approach
Stay in your Copilot session and ask it to run a pre-filtered command so only the relevant output enters the context window:

```
Run `npm test 2>&1 | tail -20` and summarize any failures.
```

By asking Copilot to pipe and trim the output as part of the shell command, you can limit the response to only the needed context. Copilot instructions could be used to tell the model how it should test so it chooses this approach automatically. Note in this example the response is not verbose, but just used to demonstrate the principle. 

:::tip Approve selectively
When Copilot proposes reading a file or running a command, ask yourself: "Do I need all of this output to answer the question?" If not, deny the call and give a more specific instruction. For example, asking for a grep of only the relevant function rather than the whole file.
:::

### 6.7 Least-Privilege Tool Access

When using `copilot -p` for scripted tasks, use `--allow-tool` to pre-approve only the specific tools needed. This reduces friction (no approval prompts) while **signaling to the model what tools are available for the task**, which helps it stay focused:

```bash
copilot --allow-tool='write(src/app.js)' -p "Add a PUT /items/:id endpoint to src/app.js following the same pattern as the existing POST and DELETE endpoints. Code only."
```

:::tip
Pair `--allow-tool` with a focused prompt. The combination of limited tools + specific instructions keeps the model on-task and minimizes unnecessary context usage.
:::

### 6.8 The "Think in Code" Pattern

Here's a powerful paradigm shift: instead of reading data into the context window and asking the model to analyze it, **write a script that processes data externally and returns only the result**. Below is an example of how this works in practice.  Note that this lab does not have any tests files so the example is purely illustrative.

❌ **Token-heavy approach** (dumps everything into context):
```
Read all 50 test files in tests/ and tell me which ones are testing the auth module.
```

✅ **Token-light approach** (processes externally, returns only the answer):
```
Write a shell script that greps all files in tests/ for imports from src/auth/ and prints just the filenames. Run it and show me the results.
```

The first approach reads 50 files into context (~25,000 tokens). The second writes a 3-line script and returns ~500 tokens of filenames. Same answer, 98% fewer tokens.

This "think in code" pattern is especially powerful for:
- **Data analysis**: Write a script to compute statistics instead of reading raw data
- **Codebase exploration**: Write a script to find patterns instead of reading every file
- **Log analysis**: Write a script to filter and summarize instead of reading full logs

:::tip This pattern has a name
The "think in code" technique is formalized as **CodeAct** in agent frameworks like [Microsoft Agent Framework](https://learn.microsoft.com/en-us/agent-framework/agents/code_act). [Research (ICML 2024)](https://arxiv.org/abs/2402.01030) shows it achieves up to 20% higher success rates while reducing token usage by collapsing multiple tool calls into a single code execution step.
:::

### 6.9 Automated CLI Filtering with RTK

The manual techniques above work, but they require discipline. [RTK (Read The Key-output)](https://github.com/rtk-ai/rtk) automates this entire process. It intercepts CLI output and filters it before it reaches the context window, achieving **60–90% token reduction** automatically.

RTK supports Copilot CLI directly. Check out the documentation for setup instructions. Below is an example for macOS using Homebrew:
```bash
# Install RTK
brew install rtk 

# Initialize for Copilot CLI
rtk init -g
```

Once configured, RTK automatically strips progress bars, ANSI codes, verbose logging, and other noise from tool output, giving the model clean, focused results without manual piping.

### ✅ Checkpoint

You understand that both file loading and tool output are sources of token waste. You can use targeted file references to reduce output cost, the explore-cheap-then-act pattern to reduce input cost, and filtered piping and `--allow-tool` to minimize context pollution.

## Exercise 7 — MCP Tools vs. CLI/API Tools: A Token Comparison

MCP (Model Context Protocol) tools extend Copilot's capabilities with external integrations: database access, browser automation, API calls, and more. But every MCP tool is loaded into the system prompt and MCP response flows into the context window. MCP responses can be **significantly more verbose** than built-in CLI tool results.

### 7.1 Understand the Difference

| Aspect | CLI/API Tools | MCP Tools |
|--------|-------------------|-----------|
| **Examples** | `view`, `grep`, `glob`, `shell` | Playwright, database connectors, API tools |
| **Response format** | Optimized for context efficiency | Often return full JSON payloads, HTML, or verbose structured data |
| **Token impact** | Moderate — designed for CLI context | Can be large — returns whatever the external service provides |
| **Control** | Copilot controls formatting | Limited control over response size |

### 7.2 See the Baseline

Start a fresh session and check baseline context with `copilot` and then `/context`.  

Note the system/tool overhead. This is the cost of the built-in tools and any MCP servers, skills, instructions, and custom agents you have loaded.

### 7.3 MCP Tool Definitions: The Hidden Cost

Each MCP server you connect adds **tool definitions** to the system prompt including descriptions of every tool the server offers. Even with deferred tool loading (where only tool names enter context until used), the overhead adds up:

- Each MCP tool name + description: ~50–200 tokens
- A typical MCP server with 10 tools: ~500–2,000 tokens of definitions
- Multiple servers: The cost compounds quickly

Meanwhile, CLI tools like `gh`, `git`, `npm`, and `curl` have **zero per-tool listing overhead**. Copilot knows how to use them via shell commands without needing explicit tool definitions in the system prompt. Skills can be created to guide the agent while minimizing tool impact.

:::tip Quick test
Run `/context` with and without MCP servers connected. Use `/mcp show` and `/mcp disable` to disable MCPs.  Run `/clear` and `/context` to see the comparison. The difference in system/tool tokens is the "tax" you pay just for having those tools available, whether you use them or not.  In testing with 6 MCP servers this was 15K tokens of overhead in the system prompt alone, before any tool calls were made.
:::

### 7.4 Hands-On: MCP vs CLI for the Same Task

If you have the GitHub MCP server configured, try this comparison. Open one of your active repos that has several issues logged. Perform the same operation using both approaches:

Start with `/clear` to reset context to a clean baseline.

**Via MCP tool**:
```
Use the GitHub MCP tool to list the latest 5 open issues in this repository.
```

* Run `/context` to see the token cost of the MCP response.  Mine was 3.4k tokens. 
* Run `/clear` to reset context again before the next test.

**Via CLI tool**:
```
Run `gh issue list --limit 5` and show me the results.
```

* Run `/context` again to see the token cost of the MCP response.  Mine was 683 tokens.

The MCP approach typically returns rich JSON payloads with full issue metadata, while the CLI returns compact tabular output. Same information, significantly different token costs. In this example I saved 80% of tokens by using the CLI tool instead of the MCP server for the same task.

> 📊 **Real-world data point**: A single Playwright MCP browser snapshot can be **56KB** (~14,000 tokens) per call. If your workflow takes 4 snapshots to navigate a page, that's 56,000 tokens (nearly half your usable context window) just on browser state. This is expensive if all you need is to curl a page and see a result, but worth it for actual test execution.

### 7.5 Finding CLI Alternatives to MCP Tools

Before reaching for an MCP server, check if an agent skill with CLI can do the same job. For example, Playwright MCP can be replaced with a [Playwright CLI Skill](https://github.com/microsoft/playwright-cli/tree/main/skills/playwright-cli) that is much more efficient than the [Playwright MCP Server](https://github.com/microsoft/playwright-mcp).

Common CLI alternatives:
| MCP Server | CLI Alternative | Token Savings |
|-----------|----------------|---------------|
| GitHub MCP | `gh` CLI | Significant — compact output vs. full JSON |
| Playwright MCP | `curl` + pipe to summary | Very high for simple use cases — avoid 56KB snapshots |
| Database MCP | `psql`/`mysql` CLI + piped output | Moderate — direct query vs. structured response |

### 7.6 Best Practices for MCP Token Management

1. **Prefer CLI tools when available**: If `gh` can answer your question, don't use the GitHub MCP server. CLI output is leaner and doesn't require tool definitions in the system prompt
2. **Be specific about what you need**: Instead of "get the page content," ask for specific elements
3. **Process externally first**: If you can filter or summarize MCP output before it enters context, do so
4. **Disable unnecessary MCP servers**: Each connected MCP server adds tool definitions to the system prompt, consuming tokens even when not in use
5. **Monitor with `/context`**: Check context usage after MCP tool calls. You may be surprised!

### ✅ Checkpoint

You understand the token cost difference between built-in CLI tools and MCP tools. You know to prefer built-in tools when possible and to be specific with MCP requests to minimize payload size.

## Exercise 8 — Agent Workflows: When Tokens Multiply

Copilot CLI supports agent workflows: plan mode, sub-agents (explore, task, code-review), background agents, and delegation to the cloud coding agent. These are powerful, but each agent operates in its **own context window**, which means token usage can multiply rapidly.

### 8.1 Understanding Agent Context Isolation

When you use agent features in Copilot CLI, here's what happens to token usage:

| Feature | Context Windows | Token Multiplier |
|---------|----------------|-----------------|
| Interactive chat | 1 (your session) | 1x |
| `/compact` then continue | 1 (same session, smaller) | &lt;1x |
| Plan mode (multi-step) | 1, but steps accumulate context | ~2–3x |
| Sub-agent (explore, task) | Separate window per agent | 2x (main, sub) |
| Multiple parallel agents | Separate window per agent | Nx for N agents |
| `/delegate` to coding agent | Cloud context, independent | New main session |

### 8.2 Plan Mode vs. Interactive Mode

Plan mode asks the model to break a task into steps and execute each one. This is powerful for complex work, but each step builds on the accumulated context of all previous steps:

**Interactive mode (cheaper for simple tasks):**
```
Add a healthcheck endpoint to @src/app.js that returns { status: "ok", uptime: process.uptime() }. Code only.
```
One prompt, one response. Minimal tokens.

**Plan mode (justified for complex tasks):**
```
/plan Add rate limiting, request logging, CORS support, and error handling middleware to @src/app.js. Test each piece. Create the middleware in a separate file.
```

The model explores the application, generates a plan, and will then execute once you approve the plan. Each step carries the full context forward. 

:::tip Rule
Use plan mode when the task is complex or genuinely has dependencies between steps. For simple or independent tasks, just prompt directly as it could save as much as 5 times the number of tokens of planning.
:::

### 8.3 Sub-Agent Cost Awareness

When Copilot spawns sub-agents (e.g., explore agents to research your codebase, task agents to run tests), each agent builds its own context from scratch. A single request that triggers 3 parallel explore agents could triple the token usage for that operation.

**How to minimize agent costs:**
1. **Be specific**: A focused prompt like "find the auth middleware in src/" requires less work than "understand the project architecture"
2. **Do simple lookups yourself**: If you know which file to check, use `@` mentions instead of asking Copilot to explore
3. **Avoid speculative exploration**: Don't ask Copilot to "look around" or "get familiar with the codebase."  That triggers broad, expensive agent sweeps. That might be worth it up front to help create a copilot-instructions.md file.
4. **Check `/context` after agent operations**: You may be surprised how much context agents added. Checking regularly will help you understand the cost and adjust your approach.

### 8.4 Delegation: Yet Another Context Window

The `/delegate` command sends a task to the Copilot Cloud Agent (CCA), which operates with its own agent session and token window. This has the potential of consuming more tokens than your local session. Use delegation for tasks that are:
- Well-specified (vague delegation = expensive exploration)
- Needing a sandbox for safety
- Want to share session with other developers in your repo
- Want to offload work to the cloud (no laptop impact, laptop can be offline and task continues)

### ✅ Checkpoint

You understand that agentic workflows multiply token usage through independent context windows. You can choose between interactive, plan mode, and delegation based on task complexity and cost tolerance.

## Exercise 9 — Information-Dense Prompts

The way you write your prompt directly affects both input AND output token counts. Vague prompts produce longer responses because the model hedges and over-explains.

### 9.1 The Vague Prompt

Start a fresh session with `copilot` or use `/clear` to reset context. Then ask:

```
I need to add some kind of search to my API. The items endpoint should support filtering. Can you help me think through how to do this and then implement it?
```

This prompt is **expensive** because:
- "some kind of" invites the model to enumerate options (extra output)
- "help me think through" requests planning before implementation (extra output)
- No constraints on scope, so the model covers every possibility

Run `/context` to see the damage.

### 9.2 The Dense Prompt

Now, run `/clear` and ask:

```
Create a new /products endpoint similar to /items. Add query parameter filtering to GET /products in @src/app.js. Support: ?status=active (exact match), ?q=searchterm (substring match on name field), ?sort=createdAt&order=desc. Return 400 for invalid sort fields. Code only.
```

This prompt is **cheaper** because:
- Exact requirements eliminate speculation
- "Code only" suppresses explanation
- Specific field names and behaviors leave no room for the model to ramble

Run `/context`. Compare the output tokens between the two approaches.

### 9.3 Use Reference Patterns Instead of Descriptions

Instead of describing what you want in words, point the model at existing code:

```
Add a PATCH /items/:id endpoint to @src/app.js. Follow the exact same error handling pattern as the DELETE endpoint. Accept partial updates. Only modify fields that are present in the request body. Code only.
```

"Follow the pattern in X" is dramatically cheaper than describing the pattern from scratch. You leverage existing context (the file is already loaded) instead of spending tokens to describe it.

### 9.4 Structured Prompts for Complex Tasks

For complex multi-part tasks, a structured format is more token-efficient than prose:

```
Update @src/app.js:

Requirements:
- Add request logging middleware (method, url, response time in ms)
- Add a rate limiter: max 100 requests per minute per IP
- Add CORS headers for http://localhost:5173

Constraints:
- No external dependencies — implement in plain Node.js
- Add to existing middleware chain, don't replace
- Code only
```

This structured format is ~30% shorter than the equivalent natural language paragraph while being more precise.

### ✅ Checkpoint

You can write prompts that are 40–60% smaller and produce better results. You know to use reference patterns, structured formats, and explicit constraints.


## Exercise 10 — Knowledge Graphs & Pre-Compiled Context

So far you've learned to selectively choose *which* files to load. This exercise goes one level deeper: instead of loading files at all, you'll pre-compile knowledge into compact, structured forms that Copilot can navigate in a fraction of the tokens.

### 10.1 Why Knowledge Graphs Reduce Tokens

When you ask Copilot about your codebase, it has two options:

- **On-demand exploration**: Run `grep`, `find`, or `read_file` calls to discover facts each time — each tool call consumes tokens, and the results are verbose raw text
- **Pre-compiled knowledge**: Read a compact, structured summary where the synthesis work was done once and not repeated on every query

This is the core insight of **knowledge graphs** in AI workflows. You can replace verbose prose with structured facts.

A raw text paragraph:

```
PaymentService is a microservice written in Go that handles payment processing. It depends on AuthService for token validation, connects to a PostgreSQL database for transaction records, and calls NotificationService to send payment confirmations.
```

**~55 tokens.**

The same information as structured triples:

```
PaymentService → DEPENDS_ON   → AuthService (validates tokens)
PaymentService → STORES_IN    → PostgreSQL (transaction records)
PaymentService → CALLS        → NotificationService (payment confirmations)
```

**~25 tokens. Same information. ~2x more token-efficient.**

For large collections of documents, the compression is far greater. Microsoft's GraphRAG research shows **26–97% fewer tokens per query** when pre-built graph summaries replace raw document search ([arXiv:2404.16130](https://arxiv.org/abs/2404.16130)).

The pattern comes in a few forms:
1. **Structured context files** — manually encode your codebase as a graph or use a tool like graphify to generate one from your codebase
2. **LLM-wiki** — an LLM builds and maintains the graph from raw sources automatically

### 10.2 Your copilot-instructions.md Is Already a Knowledge Graph

The `copilot-instructions.md` you created in Exercise 3 is already a knowledge graph — it just may not be structured like one. A well-structured instructions file encodes:

- **Nodes**: files, commands, modules, dependencies
- **Edges**: depends-on, runs-before, implements, lives-at

Compare these two styles:

**Narrative style (~80 tokens, requires parsing):**

```
The project uses Express with Mongoose for MongoDB. Tests use Jest and supertest. Source code is in src/ and tests are in tests/. Run npm test to test and npm run dev for development.
```

**Graph-structured style (~45 tokens, Copilot navigates directly):**

```markdown
## Architecture
- src/app.js        → Express entry point, route registration
- src/models/       → Mongoose schemas (Item, User)
- src/middleware.js → Auth, validation, error handling
- tests/            → Jest + supertest (mirror src/ structure)

## Commands
- npm install → always run first
- npm run dev → development (nodemon)
- npm test    → must pass before PR
```

The second form lets Copilot answer "where does auth live?" With zero tool calls it reads the graph, finds the node, and answers directly.

**Hands-on: Create an Architecture Map**

Add a dedicated architecture map to the lab project in the `copilot` CLI:

```
Read the src/ directory structure in this project. Create a file called ARCHITECTURE_MAP.md that encodes the architecture as a structured knowledge graph with two sections:
* "Where Things Live" (markdown table: Component | Path | Responsibility)
* "Key Relationships" (bullet list of how components depend on each other)
Keep it under 200 words. Code only.
```

Then reference it from your custom instructions:

```bash
echo '
## Architecture Map
See ARCHITECTURE_MAP.md for the full component graph. Read it before exploring src/.' \
  >> .github/copilot-instructions.md
```

Now measure the token difference. `/clear` your session to start fresh and prompt:

```
Without searching any files, tell me: where does middleware logic live in this project?
```

Run `/usage`. Note how many tokens Copilot consumed and whether it used any tool calls.

Next, start a second fresh session (`/clear`). Remove the `ARCHITECTURE_MAP.md` as well as the reference in `.github/copilot-instructions.md`. Ask the same question:

```
Where does middleware logic live in this project?
```

You will likely see it list files, search, and grep.  In addition `/usage` will show at least 1/3 more tokens used to achieve the same result. 

:::tip 
Well-structured context files have been shown to reduce session startup tokens from by as much as 88% by replacing on-demand exploration with pre-compiled knowledge.
:::

### 10.3 LLM-Wiki: Pre-Compiling Documentation

Copilot-instructions can provide a basic knowledge graph. The pattern of linking other docs from the instructions file minimized the system prompt token consumption with every chat call, but still enables the model to discover knowledge whern needed.  **[LLM-wiki](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f)** is a pattern coined by Andrej Karpathy (co-founder of OpenAI). Instead of having Copilot read raw documentation on every question, an LLM incrementally builds a **persistent wiki** of interlinked markdown files. This includes one per concept, entity, or source. Copilot reads a compact index first, then drills into one or two relevant pages instead of searching the full raw source.

The three-layer architecture:

```
raw/       ← immutable source captures (URLs, repos, transcripts) — never modified
wiki/      ← LLM-compiled summaries: entity pages, concept pages, cross-references
AGENTS.md  ← schema document: tells Copilot HOW to navigate the wiki
```

A 50,000-token raw documentation page becomes a ~500-token wiki summary. The generated `AGENTS.md` instructs Copilot to read `wiki/index.md` first (the navigation layer) instead of fetching raw URLs.

**Hands-on: Install and use pin-llm-wiki**

`pin-llm-wiki` implements this pattern as a GitHub Copilot CLI skill:

```bash
npx skills@latest add ndjordjevic/pin-llm-wiki
```

:::note
Only install the Universal options. Just hit enter instead of selecting others. In addition, just install at the project level for now. 
:::

First ask copilot in a `/clear` session and ask Copilot directly with no wiki:

```
What types of context does GitHub Copilot use when answering questions in the IDE? Summarize the different context sources.
```

Run `/usage`. Record the token count.

Now initialize a wiki in the current project. Start `copilot` CLI and then use the skill initialization:

```
/pin-llm-wiki init
```

Answer the questions: 
* Purpose: GitHub Documentation
* Detail Level: Standard
* Source type: Web
* Initialize a git repo: yes
* When should lint run: Batch
* After ingest, flip inbox: Yes
* Proceed with Scaffold: Yes

Ingest some docs content for the wiki (This will take several minutes):

```
/pin-llm-wiki ingest https://docs.github.com/api/article/body?pathname=/en/copilot/concepts
/pin-llm-wiki ingest https://docs.github.com/en/copilot/concepts/context
/pin-llm-wiki ingest https://docs.github.com/api/article/body?pathname=/en/copilot/concepts/context/repository-indexing
/pin-llm-wiki ingest https://docs.github.com/api/article/body?pathname=/en/copilot/concepts/prompting
/pin-llm-wiki ingest https://docs.github.com/api/article/body?pathname=/en/copilot/concepts/prompting/prompt-engineering 
/pin-llm-wiki ingest https://docs.github.com/api/article/body?pathname=/en/copilot/concepts/chat
```

When it completes ingesting these docs it will also lint to ensure quality. 

Now compare usage with the wiki.  In `copilot`, `/clear` your session history and prompt the same as before but with the wiki:

```
Using the wiki, what types of context does GitHub Copilot use when answering questions in the IDE? Summarize the different context sources.
```

Run `/usage` again. During writing this lab this approach saved about 50% on token usage (both input and output). 

:::note
The wiki answer reads a pre-compiled ~500-token summary page avoiding the need to fetch a more lengthy URL after initial ingest.  
:::

### 10.4 Graphify: Knowledge Graphs for Your Codebase

The LLM-wiki pattern works well for external documentation. For your own codebase, **[Graphify](https://github.com/safishamsi/graphify)** applies the same principle automatically. In this section we will install Graphify, have it build a knowledge graph, and produce a `GRAPH_REPORT.md` that lets Copilot navigate your codebase structure without reading raw files on every turn. This allows to use fewer tokens per query compared to direct file exploration.

**How it works:**

Graphify runs in three passes:

1. **AST pass** — Deterministically extracts classes, functions, imports, call graphs, and docstrings from 25 languages (Python, JS/TS, Go, Rust, Java, C/C++, and more) with no LLM needed.
2. **Transcription pass** — Transcribes any video/audio files locally using Whisper with a domain-aware prompt.
3. **LLM extraction pass** — Sub-agents run in parallel over docs, images, and transcripts to extract concepts and relationships.

The result is merged into a graph, clustered by topology (no embeddings or vector DB needed), and exported as:

```
graphify-out/
├── graph.html       # interactive visualization — open in any browser
├── GRAPH_REPORT.md  # god nodes, community structure, suggested questions
├── graph.json       # persistent graph — queryable weeks later
└── cache/           # SHA256 cache — re-runs only process changed files
```

Every relationship is tagged `EXTRACTED` (found in source), `INFERRED` (with a confidence score), or `AMBIGUOUS`, so Copilot always knows what was found vs. guessed.

**Capture a baseline**

Before installing Graphify, establish a baseline *without* the graph. In `copilot`, start a fresh session with `/clear` and ask a structural question about your project:

```
What are the main modules in this codebase, what does each one do, and how do they depend on each other?
```

Run `/usage` and note the input and output token counts. Copilot will grep through source files and read many of them to build up that picture.

**Install and try it:**

Full installation instructions are in the [Graphify Repo](https://github.com/safishamsi/graphify).

```bash
uv tool install graphifyy 
graphify install --platform copilot
```

Start `copilot` in your project and run:

```
/graphify .
```

This will take about 5 minutes. After graphify builds the graph, install the always-on hook so Copilot reads `GRAPH_REPORT.md` before searching raw files.

The `graphify copilot install` command only installs the skill file today and **not** an always-on hook. Copilot CLI does support hooks natively so we will create one manually. In the future I'd expect Graphify will be updated to support this natively. 

Setup the below hook to fire a `preToolUse` command before every file-search tool call, checks whether the graph exists, and if so injects a reminder into the tool response. The below hook is slightly different than what Graphify provides in their documentation, but it seems more effective in testing.

```bash
mkdir -p .github/hooks
cat > .github/hooks/graphify.json << 'EOF'
{
  "version": 1,
  "hooks": {
    "preToolUse": [
      {
        "type": "command",
        "bash": "[ -f graphify-out/graph.json ] && echo '{\"additionalContext\":\"graphify: Knowledge graph exists. Read graphify-out/GRAPH_REPORT.md before taking any action. Do not explore the codebase, search or read additional files until you have reviewed the knowledge graph.\"}' || true",
        "powershell": "if (Test-Path graphify-out/graph.json) { Write-Output '{\"additionalContext\":\"graphify: Knowledge graph exists. Read graphify-out/GRAPH_REPORT.md before taking any action. Do not explore the codebase, search or read additional files until you have reviewed the knowledge graph.\"}' }"
      }
    ]
  }
}
EOF
```

This fires before every tool call: if `graph.json` exists, Copilot receives the reminder as `additionalContext` and navigates via `GRAPH_REPORT.md` instead of grepping through raw files.

**See the savings for yourself:**

Start `copilot` and `/clear` if needed. Ask the same question you used for the baseline. Copilot will now automatically read the pre-compiled graph first:

```
What are the main modules in this codebase, what does each one do, and how do they depend on each other?
```

Run `/usage` and compare with your baseline. In testing this reduced input tokens around 50% as the single `GRAPH_REPORT.md` file replaces dozens of individual file reads. The savings should scale with codebase size. A large monorepo with hundreds of files could see significantly more savings than a small demo project. 

Note `graphify hook install` can be used to setup git hooks that update the graph incrementally as you change files so you do not need to re-run the full graphify process on every change.

:::tip When to use graphify vs. LLM-wiki vs. LSP
Use **graphify** for broad codebase navigation. It extracts structure from code with no manual ingestion step and answers architectural questions ("what are the modules, how do they relate?") from a single pre-compiled file. Use **LLM-wiki** (or pin-llm-wiki) for external documentation you want to pre-compile into compact, linkable summaries. They complement each other: graphify covers your source, LLM-wiki covers your docs.

For **per-symbol navigation** such as finding where a symbol is defined, listing all call sites, or getting type information, **LSP tools** are more token-efficient than grep. A single LSP call returns only the exact location rather than raw file content with surrounding noise. LSP is always up-to-date and accurate, while graphify is a point-in-time snapshot. The two are complementary: graphify for architecture, LSP for live symbol resolution. Check the [documentation](https://docs.github.com/en/enterprise-cloud@latest/copilot/concepts/agents/copilot-cli/lsp-servers) for how to set up LSP servers with Copilot CLI.
:::

> **Going deeper**: For large collections of documents, dedicated graph extraction pipelines like [LightRAG](https://github.com/HKUDS/LightRAG) and [Microsoft GraphRAG](https://github.com/microsoft/graphrag) (`pip install graphrag`) automate entity extraction and hierarchical summarization with peer-reviewed data showing 26–97% fewer tokens at query time. For agent memory similar to graphify, [Graphiti](https://github.com/getzep/graphiti) also provides a zero-server temporal knowledge graph.

### ✅ Checkpoint

You understand why knowledge graphs reduce tokens: structured triples and pre-compiled summaries replace verbose on-demand exploration. You've built an architecture map that lets Copilot navigate your codebase without tool calls, used LLM-wiki to pre-compile documentation into a token-efficient wiki, and used graphify to automatically build a knowledge graph of your codebase to reduce tokens per query.

## Wrap-Up: The Context Engineering Mindset

### Quick Reference: Techniques & Impact

| Technique | Potential Savings | When to Use |
|-----------|----------------|-------------|
| Concise custom instructions | Significant output reduction | Always — set it and forget it |
| Right-size model selection | Up to 75% cost per task | Every task — use Auto as default, override for specific task categories |
| Thinking tokens awareness | Significant output reduction | When choosing thinking vs. non-thinking models |
| `/compact` and fresh sessions | Meaningful input reduction | After 5+ turns or task switches |
| Prompt cache exploitation | Up to 75-90% input discount | Keep stable prefixes, work in focused bursts |
| Filtered tool output (pipe + tail) | Significant input reduction | Scripted tasks with `copilot -p` |
| "Think in code" pattern | Up to 98% input reduction | Data analysis, codebase exploration, log analysis |
| Structured/dense prompts | Moderate input reduction | Complex multi-requirement tasks |
| Focused questions on `@` mentions | Moderate output reduction | Large files where you only need a section |
| `--allow-tool` + focused prompts | Reduces context growth | Scripted tasks — keeps model on-task |
| CLI tools over MCP | Reduces system prompt + output | Whenever a CLI tool can replace an MCP server |
| Explore-cheap-then-act-expensive | Significant cost reduction | Discovery → Implementation workflows |
| Interactive over plan mode | Avoids context multiplication | Simple tasks that don't need multi-step planning |
| Org-level instructions | Team-wide output reduction | Enterprise governance |
| Knowledge graph Context (LLM-wiki, Graphify) | Fewer tokens per query | Document-heavy projects, Large or unfamiliar codebases |

### Key Principles

1. **Every token has a cost.** Under usage-based billing, that cost is on your invoice.
2. **Output tokens are the expensive ones.** Reducing verbosity is always the highest-ROI move.
3. **Not every task needs the smartest model.** Right-size aggressively.
4. **Thinking tokens are invisible output.** Match reasoning effort to task complexity.
5. **Sessions accumulate debt.** Compact often, start fresh for new tasks.
6. **Tool output is invisible bloat.** Filter before it enters the window if possible.
7. **Agents add ability, but multiply costs.** Each sub-agent or plan step has its own context window.
8. **Precision beats volume.** A focused prompt produces a focused (cheaper) response.

### Beyond Copilot: Where Context Engineering Applies

Everything you learned here applies wherever you interact with LLMs:

- **API-based applications**: Token pricing directly impacts margins
- **Custom agents**: Agent loops can burn thousands of dollars on unfiltered tool output
- **CI/CD pipelines**: Scripted AI tasks should always use `--allow-tool` and cheap models
- **Production RAG systems**: Chunk size, retrieval precision, and context packing are all context engineering

### Tools & Ecosystem

Several open-source tools automate the techniques taught in this lab:

| Tool | Automates | Install |
|------|-----------|---------|
| [RTK](https://github.com/rtk-ai/rtk) | Exercise 6 — Filters CLI output before it enters context (60–90% reduction) | `npm install -g rtk-cli` |
| [Caveman](https://github.com/JuliusBrussee/caveman) | Exercise 3 — Compresses model output via instruction rewriting (~75% output reduction) | `npx skills add JuliusBrussee/caveman -a github-copilot` |
| [auto-memory](https://github.com/dezgit2025/auto-memory) | Exercise 5 — Queries Copilot CLI's session-store.db for cross-session recall | Pure Python, zero dependencies |
| [awesome-copilot](https://github.com/nicobailon/awesome-copilot) | Exercise 7 — Curated list of Copilot skills, agents, and hooks (CLI alternatives to MCP) | Reference list |
| [Codeburn](https://github.com/getagentseal/codeburn) | Exercises 2, 8 — Tracks token usage, cost, and one-shot rates across sessions. `optimize` command detects waste patterns. | `npm install -g codeburn` |
| [pin-llm-wiki](https://github.com/ndjordjevic/pin-llm-wiki) | Exercise 11 — Builds a token-efficient wiki from URLs, repos, and YouTube; generates AGENTS.md so Copilot navigates the wiki instead of fetching raw sources | `npx skills@latest add ndjordjevic/pin-llm-wiki` |
| [graphify](https://github.com/safishamsi/graphify) | Exercise 10 — Builds a knowledge graph from your codebase; 71.5x fewer tokens per query vs. raw file reading. Installs as a Copilot CLI skill. | `pip install graphifyy && graphify install --platform copilot` |

:::tip
These tools complement, not replace, the manual techniques you've learned. Understanding *why* each technique works lets you apply the principles even when tools aren't available.
:::

### Further Reading

- [GitHub AI Model Comparison](https://docs.github.com/en/enterprise-cloud@latest/copilot/reference/ai-models/model-comparison) — Task-based model selection guide (general-purpose, reasoning, fast, agentic, visual)
- [Comparing AI Models Using Different Tasks](https://docs.github.com/en/enterprise-cloud@latest/copilot/using-github-copilot/ai-models/comparing-ai-models-using-different-tasks) — Real-world examples with sample prompts and responses per model
- [About Copilot Auto Model Selection](https://docs.github.com/en/enterprise-cloud@latest/copilot/concepts/auto-model-selection) — How auto selection works, multiplier discounts, and when to override
- [Andrej Karpathy on Context Engineering](https://x.com/karpathy/status/1937902205765607626)
- [LangChain: The Rise of Context Engineering](https://blog.langchain.com/the-rise-of-context-engineering/)
- [GitHub Copilot CLI Documentation](https://docs.github.com/en/copilot/concepts/agents/about-copilot-cli)
- [GitHub Copilot CLI Context Management](https://docs.github.com/en/copilot/concepts/agents/copilot-cli/context-management)
- [Claude Code Costs Documentation](https://docs.anthropic.com/en/docs/claude-code/costs) — Enterprise cost data and optimization strategies (applicable to any AI coding tool)
- [Stop Feeding Your AI Agent Junk Tokens](https://zerotopete.com/stop-feeding-your-ai-agent-junk-tokens/) — Real-world data on CLI output bloat (210K tokens in 2 hours)
- [I Wasted 68 Minutes a Day on Context Switching Until This AI Tool Fixed It](https://devblogs.microsoft.com/semantic-kernel/i-wasted-68-minutes-a-day-on-context-switching-until-this-ai-tool-fixed-it/) — Auto-memory for cross-session context recall
- [CodeAct: Executable Code Actions (Microsoft Agent Framework)](https://learn.microsoft.com/en-us/agent-framework/agents/code_act) — Formalizes the "think in code" pattern (Exercise 6.8) as an agent architecture
- [CodeAct Paper (ICML 2024)](https://arxiv.org/abs/2402.01030) — Research behind executable code actions for LLM agents (up to 20% higher success rate)
- [Karpathy's LLM-wiki spec](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f) — Original concept: three-layer architecture (raw → wiki → schema) for pre-compiled knowledge wikis that reduce per-query token consumption
- [Microsoft GraphRAG](https://github.com/microsoft/graphrag) — 26–97% fewer tokens at query time via hierarchical community summaries; peer-reviewed data at arXiv:2404.16130
- [LightRAG](https://github.com/HKUDS/LightRAG) — Graph-enhanced RAG with dual-level retrieval; easy `pip install` entry point for comparing naive vs. graph-based retrieval modes

> **🎓 You've completed the Context Engineering lab!** You now have the knowledge and tools to make every token count: Saving money, staying within usage limits, and getting better results from your AI coding partner.
