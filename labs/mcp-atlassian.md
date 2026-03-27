---
title: "Lab: MCP - Atlassian Jira and Confluence"
description: Use the Atlassian remote MCP server to integrate with Jira and Confluence, enabling AI-powered work planning and knowledge management directly from your IDE or CLI.
sidebar_position: 3
---

# Lab: MCP — Atlassian Jira and Confluence

> **Duration:** ~45 minutes | **Level:** Intermediate | **Prerequisites:** VS Code with GitHub Copilot (or Copilot CLI), Atlassian Cloud site with Jira and Confluence

## Objective

Connect the **Atlassian remote MCP server** to GitHub Copilot and use it to plan work in **Jira** and manage knowledge in **Confluence** — all through natural language, without leaving your editor.

By the end of this lab you will be able to:

- Configure the Atlassian MCP server in VS Code, Copilot CLI, or the Copilot Coding Agent
- Search, create, and manage Jira issues, epics, and sprints through conversational prompts
- Search, create, and update Confluence pages for documentation and knowledge sharing
- Combine Jira and Confluence in cross-tool workflows

## What You'll Build

You won't build a traditional application in this lab. Instead, you'll set up an integration that turns GitHub Copilot into a bridge between your code editor and Atlassian's project management and knowledge tools. You'll practice realistic workflows — from sprint planning in Jira to creating design docs in Confluence — all driven by natural language prompts.

## 1 Understanding the Atlassian MCP Server

The **Atlassian Rovo MCP Server** is a cloud-hosted service that exposes Jira, Confluence, and Compass data over the Model Context Protocol (MCP). This became [generally available](https://www.atlassian.com/blog/announcements/atlassian-rovo-mcp-ga) in February 2026. When connected to an MCP-capable client like GitHub Copilot, it lets your AI assistant read and write Atlassian data on your behalf — with the same permissions your Atlassian account has.

### Remote vs Local

Atlassian provides an official **remote** MCP server. The community also maintains **local** MCP servers you can self-host. Here's how they compare:

| | Remote (Atlassian-hosted) | Local (community / self-hosted) |
|---|---|---|
| **Endpoint** | `https://mcp.atlassian.com/v1/mcp` | Runs on your machine via Docker or npm |
| **Auth** | OAuth 2.1 or API token | API token only |
| **Maintenance** | Managed by Atlassian — always up to date | You manage updates and configuration |
| **Products** | Jira, Confluence, Compass | Jira, Confluence (varies by project) |
| **Best for** | Teams, production use, quick setup | Offline use, advanced customization |

This lab uses the **remote** server. See the [atlassian-mcp-server repo](https://github.com/atlassian/atlassian-mcp-server) for local setup instructions.

### Available Tools

The remote MCP server exposes **72+ tools** across Jira, Confluence, and Compass. Here are the categories you'll use in this lab:

| Product | Category | Example Tools |
|---------|----------|---------------|
| **Jira** | Issue operations | Create, update, transition, assign, delete issues |
| | Search | JQL-based search, fetch fields and options |
| | Agile | List boards/sprints, create sprints, move issues |
| | Comments & worklogs | Add/edit comments, manage worklogs |
| | Projects | List projects, versions, components |
| **Confluence** | Pages | Create, read, update, delete, move pages |
| | Search | CQL-driven full-text and metadata search |
| | Comments & labels | Add comments, manage labels |
| | Attachments | Upload, download, manage attachments |

:::tip
You don't need to memorize tool names. Just describe what you want in natural language and Copilot will pick the right tool.
:::

## 2 Authentication

The Atlassian MCP server supports two authentication methods:

### OAuth 2.1 (Recommended)

The default and most secure option. When you first connect, your browser opens an Atlassian authorization page where you grant access. Tokens are scoped to your Atlassian permissions.

- Works with VS Code, Copilot CLI, and other desktop clients
- No API token management required
- Browser required for initial authorization

:::important
When using OAuth it will present you with the list of permissions the MCP is requesting. Make certain you include both Jira and Confluence permissions if you want to use tools from both products. If you only grant Jira permissions, Confluence tools will not work, and vice versa.
:::

### API Token

An alternative for headless environments, scripts, or the Copilot Coding Agent (which cannot perform browser-based OAuth flows).

- Must be **explicitly enabled** by your Atlassian Cloud admin
- Generate a token at [id.atlassian.com/manage-profile/security/api-tokens](https://id.atlassian.com/manage-profile/security/api-tokens)
- Store securely — treat like a password

| | OAuth 2.1 | API Token |
|---|---|---|
| **Security** | Scoped, time-limited tokens | Long-lived, user-managed |
| **Setup** | Browser authorization flow | Manual token generation |
| **Admin action** | None (enabled by default) | Admin must enable |
| **Use case** | Interactive IDE / CLI use | CI/CD, Coding Agent, headless |

Is is best practice to use OAuth for interactive sessions and reserve API tokens for non-interactive use cases. Always follow your organization's security policies when handling credentials.

:::note
The **Copilot Coding Agent** does not support OAuth-based remote MCP servers. If you plan to use the Atlassian MCP with the Coding Agent, you must use API token authentication.
:::

## 3 Setup

### Prerequisites

Before starting, confirm you have:

- [ ] An **Atlassian Cloud** site with Jira and Confluence (e.g., `https://yourcompany.atlassian.net`)
- [ ] **VS Code** with GitHub Copilot extension installed, **or** the **GitHub Copilot CLI**
- [ ] A Jira project you can create issues in and a Confluence space you can write to
- [ ] (Optional) An Atlassian API token if your admin has enabled token-based auth

:::tip For most users, no admin action is needed — OAuth 2.1 works out of the box.  However, you may need to coordinate with your admin if you want to use API tokens or if your org has strict allowlisting policies.
:::

### Option A: VS Code Setup

1. Open your project in VS Code
2. Create or edit `.vscode/mcp.json` in your project root:

```json
{
  "servers": {
    "atlassian": {
      "url": "https://mcp.atlassian.com/v1/mcp",
      "type": "http"
    }
  }
}
```

3. Open the Command Palette (`Cmd+Shift+P` / `Ctrl+Shift+P`) and run **MCP: List Servers**
4. You should see **atlassian** listed. If it shows as disconnected, click to start it. (You can also start from the mcp.json file)
5. Your browser will open an Atlassian authorization page — sign in and grant access
6. Back in VS Code, open **Copilot Chat** in **Agent mode** and verify the Atlassian tools are available by clicking the tools icon

:::tip 
You can also add the server via the Command Palette: run **MCP: Add Server**, choose **HTTP**, and enter `https://mcp.atlassian.com/v1/mcp`.
:::

### Option B: Copilot CLI Setup

1. Add the Atlassian MCP server to your CLI configuration. Create or edit `~/.copilot/mcp-config.json`:

```json
{
  "mcpServers": {
    "atlassian": {
      "type": "http",
      "url": "https://mcp.atlassian.com/v1/mcp"
    }
  }
}
```

:::note
For per-repo config, use `.copilot/mcp-config.json` in the project root instead.
:::

2. Start a Copilot CLI session. The first time, your browser will open for OAuth authorization.
3. Verify the connection by asking: *"List the MCP tools available from Atlassian"*

:::note
You can also use `/mcp` to show or add MCP servers interactively in the CLI.
:::

### Verify Your Setup

Confirm the connection works by asking Copilot:

```text
What Jira projects do I have access to?
```

You should see a list of your Atlassian projects. If you get an error, check the [Troubleshooting](#8-troubleshooting) section.

## 4 Exercise — Jira Work Planning

**Scenario:** You're a team lead kicking off a new feature. You'll use Copilot + Jira MCP to explore your project, create work items, plan a sprint, and manage daily workflow — all from your editor.

> **NOTE:** Replace project names, keys, and usernames in the example prompts with values from your own Jira instance.

### 4.1 Explore Your Jira Project

Start by getting oriented.  You've already listed projects. Try searching for issues or checking your boards (replace DEMO with your project key):

```text 
Find all issues assigned to me that are in progress

Find all issues reported by me in the DEMO project
```

Ask other questions that may be relevant to explore your project. Notice that you will be prompted to approve tool calls. You can expand these calls to see the exact API request and response data.

### 4.2 Create an Epic and User Stories

Now plan a new feature. You may want to create a separate project to avoid cluttering your existing project. Note the MCP server does not support project creation so you need to do it manually in Jira. 

Now create an epic:

```text
Create a Jira epic in project DEMO titled 'User Authentication Overhaul' with the description: Modernize the authentication system to support OAuth 2.0 and multi-factor authentication."
```

Then create user stories under it:

```text
Create three user stories in project DEMO under the epic 'User Authentication Overhaul':
1. 'Implement OAuth 2.0 login flow' — As a user, I want to log in with my Google or GitHub account so I don't need a separate password. Acceptance criteria: Google and GitHub OAuth providers configured, login redirects work, new users are auto-provisioned.
2. 'Add multi-factor authentication' — As a security-conscious user, I want to enable MFA on my account. Acceptance criteria: TOTP-based MFA, backup codes generated, MFA enforcement toggle for admins.
3. 'Migrate existing sessions' — As a developer, I need to migrate existing session tokens to the new auth system. Acceptance criteria: Zero-downtime migration, backward-compatible session validation for 30 days.
```

Verify your work:

```text
Show me the epic 'User Authentication Overhaul' and its child issues in project DEMO
```

:::note
The response should show links to the epic and child stories. You can click these links to view the issues directly in Jira. This is a powerful way to navigate between your editor and Jira seamlessly.
:::

### 4.4 Day-to-Day Workflow

Simulate a typical day of work:

Start work on a story:

```text
Transition the issue 'Implement OAuth 2.0 login flow' in project DEMO to 'In Progress'
```

Add a progress comment:

```text
Add a comment to the OAuth login story: 'Started implementation. Google OAuth provider configured. Working on GitHub provider next.'
```

Assign a teammate (note this will fail if the user doesn't exist or isn't in the project):

```text
Assign the MFA story to @alex in project DEMO
```

Find blockers:

```text
Search for issues in project DEMO with the label 'blocked' or status 'Blocked'
```

Finish a story:

```text
Transition the OAuth login story to 'Done' and add a comment: 'Implemented and tested. PR #42 merged.'
```

## 5 Exercise - Confluence Knowledge Management

**Scenario:** Your team needs documentation for the authentication feature you just planned. You'll use Copilot + Confluence MCP to find existing knowledge, create new pages, and keep documentation up to date.

:::note
Replace named of spaces and page titles with values from your own Confluence instance!
:::

### 5.1 Explore Existing Knowledge

Start by searching what already exists (you would need an 'Engineering' space with relevant pages for this to work well). You should adopt to your own Confluence content here, but try prompts like:

Search across Confluence.  A few example prompts you can modify to fit your Confluence instance:

```text
Search Confluence for pages about 'authentication' in the Engineering space

Find Confluence pages with the label 'architecture-decision-record'
```

:::note
Confluence indexing may take some time for new pages. If you just created new content and are not seeing it immediately, try searching in the Confluence web UI. It is likely not an MCP issue and the content just hasn't been indexed yet. 
:::

Read and summarize a page:

```text
Get the content of the Confluence page titled 'Security Guidelines' in the Engineering space

Summarize the key points from the 'API Authentication' page in the Engineering space
```

Browse a space:

```text
List the top-level pages in the Engineering Confluence space

Show me the child pages under 'Architecture' in the Engineering space
```

### 5.2 Create Documentation

Create a design document for your new feature (make sure to replace space and page names with your own).  Use the following prompt:

```text
Create a new Confluence page in the Engineering space titled 'Design: User Authentication Overhaul' with this content:

## Overview
We are modernizing the authentication system to support OAuth 2.0 and multi-factor authentication (MFA).

## Goals
- Replace custom auth with industry-standard OAuth 2.0
- Add TOTP-based multi-factor authentication
- Zero-downtime migration from existing sessions

## Technical Approach
- Use OpenID Connect with Google and GitHub as identity providers
- Implement TOTP MFA with backup codes
- Session migration via dual-read strategy during 30-day transition period

## Timeline
- Sprint 1: OAuth 2.0 login + MFA implementation
- Sprint 2: Session migration + testing

## Open Questions
- Should we support hardware security keys (WebAuthn) in v1?
- What is the session token expiry policy during migration?"
```

### 5.3 Update and Maintain Documentation

As work progresses, keep documentation current:

Update an existing page:

```text
Update the 'Design: User Authentication Overhaul' page in the Engineering space. In the 'Open Questions' section, add a new bullet: 'Decided: WebAuthn support deferred to v2 per team discussion on March 15.'
```

Add a review comment:

```text
Add a comment to the 'Design: User Authentication Overhaul' page: 'Reviewed and approved by the security team. One suggestion — add a rollback plan section.'
```

Check recent changes:

```text
Show me the most recently updated pages in the Engineering Confluence space
```

### 5.4 Cross-Tool Workflow: Jira + Confluence

It is possible to combine tools to complete complex workflows. For example, after creating your design doc in Confluence, you may want to create Jira tasks for each open question to track them. You can do this all in one prompt:

```text
Read the 'Open Questions' section from the 'Design: User Authentication Overhaul' Confluence page. For each open question, create a Jira task in the DEMO project so we can track decisions.
```

:::tip
Cross-tool prompts work because both the Jira and Confluence MCP tools are available in the same session. If you have other non-Atlassian tools you could also integrate them. Copilot can chain tool calls behind the scenes to fulfill complex requests.
:::

## 6 Tips and Best Practices

### Writing Effective Prompts

- **Be specific** — include project keys, space names, and issue types: *"Create a Bug in project DEMO"* works better than *"Create an issue"*
- **Provide context** — Copilot uses your prompt and previous conversation to choose tools and fill fields
- **Use natural workflow language** — "Move to In Progress", "Assign to Alice", "Add a comment" map directly to Jira actions
- **Chain requests** — Copilot can handle multi-step prompts like "Create an issue and then assign it to me"

### Security Considerations

- MCP respects your Atlassian permissions — you can only access what your account can access
- Audit logs in Atlassian Administration track all MCP tool invocations
- Use **OAuth 2.1** for interactive sessions and **API tokens** only when OAuth isn't possible
- Never commit API tokens to version control — use environment variables or secret stores

### Performance

- The remote MCP server is subject to Atlassian Cloud rate limits based on your plan
- For bulk operations (creating many issues), consider batching or using Jira's bulk import
- Large Confluence searches may take longer — narrow your queries with space names and labels

## 7 Wrap Up

In this lab you connected the Atlassian remote MCP server to GitHub Copilot and used natural language to drive real project management and documentation workflows — without leaving your editor.

MCP turns your editor into a unified interface for code *and* project context. Instead of switching between Jira, Confluence, and your IDE, you stay in flow — describing what you need and letting Copilot handle the tool calls. This also allows agents to be able to interact with these systems. This pattern extends to any MCP server, so the skills you practiced here apply to databases, cloud platforms, and any other integration your team adopts.

## 8 Troubleshooting

| Problem | Solution |
|---------|----------|
| **"No tools available"** | Verify your MCP config URL is `https://mcp.atlassian.com/v1/mcp` (not the deprecated `/v1/sse` endpoint). Restart VS Code or your CLI session. Ensure the tools are enabled and there are no errors in the output log. |
| **OAuth flow doesn't open** | Check your browser is set as default. For CLI, ensure you're not in a headless environment. |
| **"Permission denied" errors** | Your Atlassian account lacks access to the project/space. Check with your admin. |
| **Tools time out** | Check your network connection and any corporate firewall/proxy settings. Ensure Atlassian's domains aren't blocked. |

## 9 Related Resources

- [Atlassian Rovo MCP Server — Getting Started](https://support.atlassian.com/atlassian-rovo-mcp-server/docs/getting-started-with-the-atlassian-remote-mcp-server/) — Official setup guide
- [Supported Tools Reference](https://support.atlassian.com/atlassian-rovo-mcp-server/docs/supported-tools/) — Full list of available MCP tools
- [Setting Up IDEs](https://support.atlassian.com/atlassian-rovo-mcp-server/docs/setting-up-ides/) — VS Code, Cursor, and other IDE configs
- [Atlassian MCP Server on GitHub](https://github.com/atlassian/atlassian-mcp-server) — Source code and local server documentation
- [Extending Copilot Coding Agent with MCP](https://docs.github.com/en/copilot/how-tos/use-copilot-agents/coding-agent/extend-coding-agent-with-mcp) — GitHub's MCP integration docs
- [Adding MCP Servers for Copilot CLI](https://docs.github.com/en/copilot/how-tos/copilot-cli/customize-copilot/add-mcp-servers) — CLI-specific MCP configuration
- [VS Code MCP Configuration Reference](https://code.visualstudio.com/docs/copilot/reference/mcp-configuration) — VS Code MCP settings reference
