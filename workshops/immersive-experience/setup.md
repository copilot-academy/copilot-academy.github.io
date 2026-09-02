---
title: Setup
description: Prepare your environment for the GitHub Copilot Immersive Experience
sidebar_position: 1
---

# Setup

> **Time:** ~10 minutes

## Prerequisites

- A GitHub account with Copilot enabled
- Git installed locally
- Node.js 22+ (only needed if you run the demo app on your own machine)
- GNU Make and a Unix-like shell (macOS, Linux, or Windows with WSL)

> **Windows users:** Use WSL or a GitHub Codespace for the repository exercises. The demo Makefile uses Unix shell commands that do not run in PowerShell alone.

## Step 1: Set up Copilot

This workshop is written for the **GitHub Copilot app**. It's the recommended path: sessions run in isolated worktrees, so you can work through exercises in parallel without them colliding.

:::tip Start with the onboarding guide
For the complete account, environment, installation, and verification flow, follow the [Copilot onboarding guide](/onboarding). Return here once the GitHub Copilot app is installed and signed in.
:::

New to the app? Take the short [GitHub Copilot app tour](/workshops/immersive-experience/copilot_app) to learn where Sessions, Chats, My Work, Automations, Customize, and Search live, and when to use Interactive, Plan, and Autopilot modes.

### Alternatives

The exercises also work in an IDE, with two differences: you'll use **Agent** mode instead of the app's **Interactive** mode, and you won't get isolated worktrees per exercise — so use a branch per exercise and commit before moving on.

- **VS Code** — install the [GitHub Copilot extension](https://marketplace.visualstudio.com/items?itemName=GitHub.copilot) and sign in.
- **GitHub Codespaces** — open the demo repository in a codespace. Copilot is already available; skip the local install steps below.

## Step 2: Get the demo repository

Make your own copy of the [Octocat Supply](https://github.com/copilot-academy/octocat_supply) demo application, then set it up:

```bash
git clone <your-copy-url> demo_copilot_agent
cd demo_copilot_agent
make install
```

If you're using the GitHub Copilot app, add this folder as a project so you can start sessions against it.

## Step 3: Verify the build

```bash
make build
make db-init
```

Both commands should complete without errors before you continue.

> **Automation module:** Copilot cloud automations require a private or internal repository. If your workshop copy is public, you can still complete the local, manually triggered automation path in the final module.

## Step 4: Codespaces only — expose the ports

If you're working in a codespace, make ports **3000** and **5137** public so you can open the app in a browser:

1. Open the **Ports** tab in the bottom panel.
2. Right-click each port and select **Port Visibility → Public**.

## Next Steps

Once your environment is ready, take the [GitHub Copilot App Tour](/workshops/immersive-experience/copilot_app), then continue to [Feature Development](/workshops/immersive-experience/feature_development).
