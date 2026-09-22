---
title: "GitHub Copilot App Tour"
description: "Get oriented in the GitHub Copilot app before you start the workshop exercises"
sidebar_position: 1.5
---

# GitHub Copilot App Tour

> **Time:** ~10 minutes
>
> **Copilot Features:** Sessions, Chats, My Work, Automations, Customize, Search

This workshop is written for the **GitHub Copilot app** — the desktop app where you run agent sessions against your repositories. This page is a quick orientation so the later exercises make sense. If you already use the app daily, skim it and move on.

:::tip Not installed yet?
Follow the [Copilot onboarding guide](/onboarding) to install the app and sign in, then come back here.
:::

## Where things live

| Surface | What it's for |
|---------|---------------|
| **Sessions** | Agent work on a repository. Choose an isolated worktree for parallel local work, your existing checkout for direct work, or a cloud sandbox when available. |
| **Chats** | Lightweight conversations that aren't tied to changing a repository — questions, research, drafting. |
| **My Work** | Browse and filter issues and pull requests, inspect CI and review activity, and start a session with the work item already in context. |
| **Automations** | Saved agent tasks that run manually, on a schedule, or in response to issue and pull request events. |
| **Customize** | Discover and manage plugins, skills, MCP servers, agents, and canvases. |
| **Search** | Search across your connected repositories from the app. |

You'll use **Sessions** for most of this workshop, **Customize** when you add MCP servers and custom agents, and **My Work** when you review the pull requests you produce.

## Sessions run in isolated worktrees

For this workshop, start each session in a **new worktree** — a separate checkout on its own branch. The app can also work directly in an existing checkout or use a cloud sandbox, but a worktree is the safest default for parallel local exercises.

This matters for the workshop:

- You can run several exercises at once without one agent overwriting another's files.
- Your main checkout stays clean, so an experiment that goes sideways costs you nothing.
- Each session's changes land on a branch that is ready to become a pull request.

> **Tip:** Start a **new session per exercise**. Fresh context produces better results than one long session carrying unrelated history.

## Choose a mode

Every session runs in one of three modes. You can switch mid-session.

| Mode | Behavior | Use it when |
|------|----------|-------------|
| **Interactive** | The agent works and checks in with you as it goes. | Most work. This is the default choice. |
| **Plan** | The agent researches, asks clarifying questions, and produces a plan for you to approve before writing code. | Ambiguous or multi-file work — like the cart feature in the next exercise. |
| **Autopilot** | The agent runs with minimal interruption until it's done. | Well-scoped, low-risk work you've already reasoned about. |

The workshop's rhythm is **Plan → approve → Interactive**: agree on the approach first, then let the agent build it.

## Choose a model

Leave the model on **Auto**. It routes your request to a suitable model, and it's the right default for nearly everything in this workshop.

Switch to a **higher-reasoning model** only when you hit genuinely hard work — a complex plan spanning many files, or a bug you've already failed to fix once. Higher-reasoning models are slower and cost more, so use them deliberately rather than by habit.

See the [model comparison](https://docs.github.com/en/copilot/reference/ai-models/model-comparison) for current options.

## Warm up

Try this before the first exercise so the interface isn't new when it matters:

1. Open the app and add your copy of the demo repository as a project.
2. Start a **new session** on it.
3. Leave the model on **Auto** and stay in **Interactive** mode.
4. Prompt:
   ```text
   Give me a tour of this repository: the stack, how the frontend and API are organized, and how to run it locally.
   ```
5. Note where the session's worktree and branch are shown — you'll come back to them when you open a pull request.

## Next Steps

Continue to [Feature Development](/workshops/immersive-experience/feature_development) to build your first feature.

## Resources

- [About the GitHub Copilot app](https://docs.github.com/en/copilot/concepts/agents/github-copilot-app)
- [Getting started with the GitHub Copilot app](https://docs.github.com/en/copilot/how-tos/github-copilot-app/getting-started)
- [Copilot automations](https://docs.github.com/en/copilot/concepts/agents/cloud-agent/about-automations)
