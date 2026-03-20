---
title: Integrations with MCP   
description: Integrating GitHub Copilot agents with external tools and services using MCP Servers
sidebar_position: 7
---

# Integrations with MCP Servers

This guide focuses exclusively on **using** existing Model Context Protocol (MCP) servers to enhance your development workflow. We cover how to discover, evaluate, configure, and integrate MCP servers into your Copilot setup. We will not cover building your own MCP server here. There are many existing MCP servers that cover typical use cases, although building your own is always an option if your needs are unique.

## 1. Where MCP Fits

If you have been following along with the other guides in this repository, you have already seen how Copilot customizations build on each other in layers:

1. **Custom Instructions** — Baseline context applied everywhere 
2. **Prompt Files** — Repeatable tasks triggered on demand 
3. **Custom Agents** — Operational personas with specific toolsets 
4. **Agent Skills** — Portable, specialized knowledge that activates automatically 
5. **MCP Integrations** — External tools and data sources connected via open protocol 

Each layer adds capability. MCP is unique because it extends what your AI assistant can **do** — it provides new tools and data access, not just new knowledge or workflow instructions. Agents and skills tell the AI *how* to work; MCP servers give it *what* to work with.

> **Tip:** MCP does not always need to be the answer for accessing external data. For systems that have a CLI or API, consider whether a skill with guidance to use the CLI or API might meet your needs without the overhead of an MCP server. Skills utilize progressive loading which can be more efficient if the need is simple. 

### Understanding Transport Types

MCP servers communicate with your AI assistant through one of two transport mechanisms. Understanding these is important because it affects how you configure servers and which environments support them.

| Transport | How It Works | When to Use |
|-----------|-------------|-------------|
| **local (stdio)** | Launches a local process; communicates over standard input/output | Typical for local MCP servers. Installed via `npx` or as local binaries. |
| **sse** | Legacy approach.  Connects to a remote HTTP endpoint using Server-Sent Events | Not commonly used. |
| **http** | Newer HTTP-based streaming transport | Typical remote MCP server transport. |

> **Tip:** If you are unsure which transport a server uses, check its README. Most community MCP servers default to `local` and launch via `npx`, which is the simplest setup.  Many such as the GitHub MCP server have both `local` and `http` options.  

### How It Works at Runtime

When you configure an MCP server and start a Copilot chat session:

1. VS Code starts the MCP server process (or connects to a remote endpoint)
2. The server reports its available **tools** and **resources** to Copilot
3. These tools appear alongside Copilot's built-in tools (file editing, terminal, search)
4. When the AI determines a tool is relevant to your request, it invokes it — with your approval
5. The tool result flows back into the conversation as additional context

This means the AI does not just *know about* your database — it can *query* it. It does not just *know about* your GitHub issues — it can *search and read* them.

## 2. Configuring MCP Servers in VS Code

VS Code supports three configuration scopes for MCP servers. Choose based on whether the configuration is personal, team-shared, or project-specific.

### Configuration Scopes

| Scope | File Location | Committed to Git? | Use Case |
|-------|--------------|-------------------|----------|
| **User settings** | run the `MCP: Open User Configuration` command to open the `mcp.json` file in your user profile folder. | No | Personal servers (your own API keys, local tools) |
| **Workspace settings** | `.vscode/mcp.json` | Yes (team choice) | Project-specific servers the whole team uses |
| **Devcontainer** | `devcontainer.json` | Yes | MCP Servers Configured in Dev Containers |

### Basic Configuration — stdio Transport

The most common pattern: a server installed via npm and launched with `npx`.

Create or edit `.vscode/mcp.json` in your project root:

```json
{
  "servers": {
    "playwright": {
      "type": "local",
      "command": "npx",
      "tools": [
        "*"
      ],
      "args": [
        "@playwright/mcp@latest"
      ]
    }
  }
}
```

**What each field means:**

- `"playwright"` — a name you choose; appears in the MCP server list in VS Code
- `"type": "local"` — launch a local process (vs. `http` for remote servers)
- `"command"` — the executable to run (`npx`, `node`, `python`, `docker`, etc.)
- `"args"` — command-line arguments passed to the executable

> **Important:** The `tools` key is required for each server. Consider allow-listing specific read-only tools rather than using `"*"` if you are planning to use on autopilot or with coding agent.

### Basic Configuration — http Transport

For servers running on a remote endpoint:

```json
{
  "servers": {
    "atlassian-rovo-mcp": {
       "type": "http",
       "url": "https://mcp.atlassian.com/v1/mcp"
    }
  }
}
```

### Handling Secrets with Input Variables

Never hardcode API keys or tokens in configuration files! Use the `inputs` mechanism to prompt for values at runtime or read from environment variables:

```json
{
  "inputs": [
    {
      "id": "github-token",
      "type": "promptString",
      "description": "GitHub Personal Access Token",
      "password": true
    }
  ],
  "servers": {
    "github": {
      "command": "docker",
      "args": [
        "run",
        "-i",
        "--rm",
        "-e",
        "GITHUB_PERSONAL_ACCESS_TOKEN",
        "ghcr.io/github/github-mcp-server"
      ],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "${input:github_token}"
      }
    }
  }
}
```

> **Security note:** If you commit `.vscode/mcp.json` to your repository, ensure it uses `inputs` or environment variable references — never literal secrets. Add any files containing secrets to `.gitignore`.

### Starting and Verifying a Server

After configuring the server in mcp.json you have to start it.  You can do that a few ways: 

* With the `MCP: List Servers` command from the Command Palette (CMD/Ctrl+Shift+P) you can select the server and start it from there. 
* With the `.vscode/mcp.json` file open, you can click the "Start Server" link that appears above the server configuration.

Once started, verify it's running and connected in the Copilot Chat panel:
1. Open the Copilot Chat panel in VS Code
2. Look for the **Configure tools** indicator to the right of the model selector
3. Click the indicator to see which servers are connected and what tools they provide
4. Select the MCP and tools you want to use (minimize this list as they take up context window space)
5. If a server failed to start, check the **Output** panel for the given MCP 
6. At this point you can prompt for something that would require the MCP's tools to verify it's working (e.g. "List all tables in the database" for a database server)

> **Note:** Each IDE or CLI configuration may be slightly different.  For example, Copilot CLI stores MCP servers in `~/.copilot/mcp-config.json`.  Copilot Coding Agent has a separate configuration in the GitHub repository settings. 

## 3. Walkthrough: Adding a Local Database MCP Server

This walkthrough demonstrates connecting to a SQLite MCP server to your VS Code environment. We chose SQLite because it requires no external database setup and illustrates the configuration pattern that applies to any database MCP server.

> **Note:** This is an illustrative example. Your production workflow will use whatever database your project requires (PostgreSQL, SQL Server, MySQL, etc.) and will likely be remote from your local environment.  The same MCP pattern applies. The chosen MCP server does work for multiple database engines, but there may be alternatives that are purpose built for your specific database. 

### Step 1 — Create a Sample Database

This repo includes a legacy SQL Server schema that defines `Employees` and `Departments` tables. Since that schema uses SQL Server syntax (`IDENTITY`, `GETDATE()`, etc.), we will create a simplified SQLite version for this walkthrough:

```bash
# From the repository root
mkdir -p data
sqlite3 data/demo.sqlite <<'EOF'
CREATE TABLE Employees (
    EmployeeId INTEGER PRIMARY KEY AUTOINCREMENT,
    Name TEXT NOT NULL,
    Email TEXT,
    Department TEXT,
    HireDate TEXT,
    ActiveIndicator INTEGER DEFAULT 1,
    Salary REAL,
    CreatedDate TEXT DEFAULT (datetime('now')),
    ModifiedDate TEXT DEFAULT (datetime('now'))
);

CREATE TABLE Departments (
    DepartmentId INTEGER PRIMARY KEY AUTOINCREMENT,
    DepartmentCode TEXT NOT NULL UNIQUE,
    Name TEXT NOT NULL,
    ManagerId INTEGER,
    BudgetAmount REAL,
    ActiveIndicator INTEGER DEFAULT 1,
    FOREIGN KEY (ManagerId) REFERENCES Employees(EmployeeId)
);

INSERT INTO Departments (DepartmentCode, Name, BudgetAmount) VALUES
    ('ENG', 'Engineering', 500000.00),
    ('SAL', 'Sales', 350000.00),
    ('MKT', 'Marketing', 250000.00),
    ('HRS', 'Human Resources', 150000.00);

INSERT INTO Employees (Name, Email, Department, HireDate, ActiveIndicator, Salary) VALUES
    ('Alice Johnson', 'alice.johnson@org.com', 'ENG', '2020-01-15', 1, 95000.00),
    ('Bob Martinez', 'bob.martinez@org.com', 'ENG', '2019-06-20', 1, 102000.00),
    ('Carol Williams', 'carol.williams@org.com', 'SAL', '2021-03-10', 1, 78000.00),
    ('David Chen', 'david.chen@org.com', 'MKT', '2018-11-05', 1, 85000.00),
    ('Eva Thompson', 'eva.thompson@org.com', 'HRS', '2017-08-22', 1, 72000.00),
    ('Frank Garcia', 'frank.garcia@org.com', 'ENG', '2022-02-14', 0, 88000.00);
EOF
```

This mirrors the tables and sample data from the legacy schema, adapted for SQLite.

### Step 2 — Configure the MCP Server

For this walkthrough we will use the [DBHub MCP server](https://github.com/mcp/bytebase/dbhub) which supports multiple database engines including SQLite.  You can see full documentation [here](https://dbhub.ai/). We will install this locally as follows: 

```bash
npm install -g @bytebase/dbhub
```

Then add the following server configuration to `.vscode/mcp.json`.  Be sure to update your sqlite database path to match where you created it in the previous step.

```json
{
  "servers": {
    "demo-database": {
      "type": "local",
      "command": "dbhub",
      "args": [
        "--transport",
        "stdio",
        "--dsn",
        "sqlite:///Users/YOUR_USERNAME/data/demo.sqlite"
      ]
    }
  }
}
```

### Step 3 — Verify the Connection

1. Start the MCP server using the `MCP: List Servers` command from the Command Palette (CMD/Ctrl+Shift+P) or by clicking "Start Server" above the server configuration in `.vscode/mcp.json`
2. Open Copilot Chat and check the MCP tools indicator (to the right of the model selector)
3. You should see `dbhub` in the tools list with `execute_sql` and `search_objects` tools.  Make certain you check these so they are available to your conversation.
4. If these tools do not appear, check the **Output** panel for `MCP: dbhub` and look for error messages. 

### Step 4 — Use It in a Conversation

Try these sample prompts in Copilot Chat:

- "List all tables in the database and describe their schemas"
- "Write a query to find all active employees in the Engineering department"

GitHub Copilot will use the MCP tools to connect to your database, inspect the schema, run queries, and use the results to inform its responses. You can expand each tool call to see the input and output details. While these examples are basic, this is useful for complex SQL generation, database exploration, writing code when schema-aware logic is required, and more.

> **Tip:** Always review tool invocations carefully, especially for write operations. Consider using read-only accounts. As long as you are not in autopilot, you will be asked for approval before executing any tool action. 

### What You Learned

- MCP servers give the AI **live access** to data, not just documentation about it
- The configuration pattern is the same regardless of which database server you use
- Combining MCP data access with agent instructions creates a powerful workflow: the agent knows *how* to generate code (from your instructions and skills), and the MCP server provides the actual schema to generate *from*

## 4. Walkthrough: Adding a Remote GitHub MCP Server

This walkthrough connects the GitHub MCP server, giving Copilot the ability to search issues, read pull requests, and interact with your repository's GitHub data directly from chat. This will showcase connecting to a remote MCP server using OAUTH credentials.

### Step 1 — Configure the MCP Server

Add to `.vscode/mcp.json`:

```json
{
  "servers": {
    "github": {
      "type": "http",
      "url": "https://api.githubcopilot.com/mcp/",
      "headers": {
        "X-MCP-Toolsets": "actions, code_security, dependabot, discussions, issues, orgs, projects, pull_requests, repos, secret_protection, security_advisories, copilot, copilot_spaces"
      }
    }
  }
}
```

> **Tip:** It is also possible to install MCP Servers from the `Extensions` panel in VS Code. Search for `@mcp` to see a list of available servers. 

> **Note:** There are several toolsets available to this server.  See the documentation [here](https://github.com/github/github-mcp-server/blob/main/docs/remote-server.md) for details. 

### Step 2 — Start the MCP server 

Start the server using the `MCP: List Servers` command from the Command Palette (CMD/Ctrl+Shift+P) or by clicking "Start Server" above the server configuration in `.vscode/mcp.json`.

VS Code will redirect you to a browser to authenticate with GitHub and grant permissions to the MCP server.  Follow the prompts to complete this process.  This is the OAUTH walkthrough.  It provides a simpler, more secure experience than using a personal access token.

### Step 3 — Verify the Connection

After configuration, check the MCP tools indicator in Copilot Chat to the right of the model selector. The GitHub server provides tools such as:

- `search_repositories` — find repositories by query
- `search_issues` — search across issues and pull requests
- `issue_read` — read issue details and comments
- `issue_write` — create new issues
- `assign_copilot_to_issue` — assign Copilot to start a coding agent session in GitHub.com
- `list_pull_requests` — list PRs for a repository

### Step 4 — Use It in a Conversation

The repo you are currently in is the context for the GitHub MCP server. You can always ask for something in another repo by specifying the repository as org_name/repo_name. Try prompts like:

Sample prompts to try:

- "List all open issues in the repository"
- "Summarize the last 5 pull requests and their review status"
- (After creating a plan) "Open an issue with the title 'Add pagination to employees endpoint' and the body including the plan you've just created.  Assign it to Copilot"


### What You Learned

- MCP servers can provide **write operations** (creating issues), not just reads
- Remote MCP servers with authentication provide a simple, secure way to connect to external systems without managing local MCP servers
- The GitHub MCP server can be used to interact with GitHub data in natural language with GitHub Copilot

## 8. Discovering MCP Servers

The MCP ecosystem is growing rapidly. When you identify a friction point in your workflow, there is likely already a server that addresses it. Here is where to look.

### The MCP Registry

The [GitHub MCP Registry](https://github.com/mcp) is a curated collection of MCP servers. It provides:

- **Verified servers** — reviewed for quality and adherence to the MCP specification
- **Categorized listings** — organized by function (databases, APIs, cloud services, etc.)
- **Configuration examples** — ready-to-use configuration snippets for each server

Start here when looking for a server. The registry is the most reliable source for well-maintained, secure, specification-compliant servers.

### Other Discovery Sources

| Source | What You Will Find |
|--------|--------------------|
| [Official MCP Registry](https://registry.modelcontextprotocol.io/) | Community-provided MCP servers |
| [Docker MCP Catalog](https://hub.docker.com/mcp) | Containerized MCP servers |
| Vendor documentation | Official MCP servers from cloud providers and other vendors |

### Common Categories 

MCP server selection is unique to every developer's workflow — there is no one-size-fits-all set. That said, these categories cover the most common needs we have seen in development teams:

| Category | Example Servers | What They Enable |
|----------|----------------|------------------|
| **Planning** | [GitHub](https://github.com/mcp/github/github-mcp-server), [Atlassian](https://github.com/mcp/com.atlassian/atlassian-mcp-server), [Azure DevOps](https://github.com/mcp/microsoft/azure-devops-mcp), [Figma](https://github.com/mcp/com.figma.mcp/mcp), [Miro](https://github.com/mcp/miroapp/mcp-server), [Notion](https://github.com/mcp/makenotion/notion-mcp-server) | Search and manage issues, PRs, project boards, and other planning artifacts |
| **Coding** | [GitHub](https://github.com/mcp/github/github-mcp-server), [Postman](https://github.com/mcp/com.postman/postman-mcp-server), [Context7](https://github.com/mcp/upstash/context7), [Microsoft Learn](https://github.com/mcp/microsoftdocs/mcp) | Access code repositories, API documentation, and other coding resources |
| **Databases** | [DBHub](https://github.com/mcp/bytebase/dbhub), [pgEdge Postgres](https://github.com/mcp/pgEdge/postgres-mcp), [SQL MCP Server](https://learn.microsoft.com/en-us/sql/mcp/), [MongoDB](https://github.com/mcp/mongodb-js/mongodb-mcp-server), [Redis](https://github.com/redis/mcp-redis), [MCP Toolbox for Databases](https://github.com/googleapis/genai-toolbox) | Query schemas, inspect data, generate migrations |
| **Cloud / Infrastructure** | [Azure](https://github.com/mcp/com.microsoft/azure), [AWS](https://docs.aws.amazon.com/aws-mcp/latest/userguide/what-is-mcp-server.html), [GCP](https://docs.cloud.google.com/mcp/overview), [Kubernetes](https://github.com/containers/kubernetes-mcp-server), [AKS](https://github.com/mcp/azure/aks-mcp), [Ansible](https://docs.ansible.com/projects/vscode-ansible/mcp/), [Bicep](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/bicep-mcp-server), [Terraform](http://github.com/mcp/hashicorp/terraform-mcp-server) | Check deployments, read logs, manage resources, Write IaC |
| **Verify** | [GitHub](https://github.com/mcp/github/github-mcp-server), [Codacy](https://github.com/mcp/codacy/codacy-mcp-server), [SonarQube](https://github.com/mcp/SonarSource/sonarqube-mcp-server), [Snyk](https://github.com/snyk/studio-mcp), [ESLint](https://eslint.org/docs/latest/use/mcp), [Chrome DevTools](https://github.com/mcp/ChromeDevTools/chrome-devtools-mcp), [Playwright](https://github.com/mcp/microsoft/playwright-mcp) | CI checks, analyze code quality, scan for vulnerabilities, linting, inspect live pages, and automate browser tests |
| **Deploy** | [Octopus Deploy](https://github.com/mcp/octopusdeploy/mcp-server), [LaunchDarkly](https://github.com/mcp/launchdarkly/mcp-server), [JFrog](https://github.com/mcp/jfrog/jfrog-mcp-server), [Slack](https://docs.slack.dev/ai/slack-mcp-server/), [Microsoft Teams](https://learn.microsoft.com/en-us/microsoft-agent-365/mcp-server-reference/teams) | Manage deployments, toggle feature flags, publish artifacts, send notifications |
| **Operate** | [New Relic](https://docs.newrelic.com/docs/agentic-ai/mcp/overview/), [DataDog](https://docs.datadoghq.com/bits_ai/mcp_server/), [Sentry](https://github.com/mcp/getsentry/sentry-mcp), [Dynatrace](https://www.dynatrace.com/platform/mcp-server/), [Grafana](https://github.com/grafana/mcp-grafana), [PagerDuty](https://github.com/mcp/PagerDuty/pagerduty-mcp), [ElasticSearch](https://www.elastic.co/docs/explore-analyze/ai-features/agent-builder/mcp-server), [Splunk](https://help.splunk.com/en/splunk-cloud-platform/mcp-server-for-splunk-platform/about-mcp-server-for-splunk-platform) | Investigate errors, review logs, read metrics, analyze traces |

> **Key principle:** Don't boil the ocean. Start with one or two servers that address real friction in your daily workflow. Add more only after you have proven value from the first ones. Each tool takes context space so having hundreds of tools may negatively impact space for your actual context like code and instructions!

---

## 9. Evaluating MCP Servers for Your Workflow

When assessing a specific MCP server, ask:

- [ ] **Actively maintained?** — Check the repository for recent commits, open issues, and release frequency
- [ ] **Transport compatibility?** — Is it local or remote? 
- [ ] **Permissions and secrets?** — What credentials does it require? Are you comfortable granting that level of access?
- [ ] **Overlap with built-in tools?** — Does Copilot already provide this capability natively? Adding a redundant server increases complexity without benefit
- [ ] **Trusted source?** — Is it from the GitHub MCP registry, a known vendor, or a reputable open-source maintainer?
- [ ] **Specification compliance?** — Does it follow the MCP spec, or is it a non-standard implementation?
- [ ] **Skills alternative?** — Could a skill with API calls achieve the same goal without the overhead of an MCP server?

> **🔒 Security consideration:** MCP servers execute code and access external systems on your behalf. Vet them with the same rigor you apply to any dependency in your project. Review the source code, check for known vulnerabilities, and apply the principle of least privilege when granting credentials. Never grant broader permissions than the server actually needs.

## 10. Best Practices and Common Pitfalls

### Best Practices

- **Start small** — Add one server, integrate it into your workflow, and prove its value before adding more. Complexity compounds quickly.

- **Keep secrets out of committed files** — Use the `inputs` mechanism in VS Code or repository secrets for the Coding Agent. Never hardcode tokens, passwords, or API keys in configuration files.

- **Document your team's MCP setup** — If your team relies on specific MCP servers, note them in your `README.md` or contributing guide. Include required credentials and setup steps.

- **Treat MCP servers as dependencies** — Pin versions when possible. Review changelogs before updating. Test after upgrades.

- **Combine MCP with agents and skills** — Create agents that leverage specific MCP tools. For example, a `database-migrator` agent that uses a PostgreSQL MCP server, or an `issue-triager` agent that uses the GitHub MCP server. The agent provides the workflow; the MCP server provides the access.

- **Review tool invocations** — When the AI uses an MCP tool, VS Code shows you what it is about to do and asks for confirmation. Review these carefully, especially for write operations.

### Common Pitfalls

| ❌ Don't | ✅ Do |
|-----------|-------|
| Install every MCP server you find | Start with 1–2 that solve real problems in your workflow |
| Hardcode API keys in `.vscode/mcp.json` | Use `inputs`, environment variables, or repository secrets |
| Assume MCP replaces agents and skills | Combine them — agents define workflow, MCP provides access |
| Skip verifying server trustworthiness | Check source, maintenance status, required permissions |
| Build a custom MCP server for a standard task | Check the registry and community servers first |
| Grant `"tools": ["*"]` without reviewing what tools exist | Allowlist specific tools, especially for autonomous Coding Agent usage |
| Grant broad permissions to every server | Apply least privilege — only the scopes the server needs |
