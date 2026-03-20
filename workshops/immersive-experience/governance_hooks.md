---
title: "Governance with Hooks"
description: "Trigger commands on agent events for governance and automation"
sidebar_position: 12
---

# Use Case 11: "Governance with Hooks"

> **Scenario:** Your team wants to better understand what code is aided or delivered by Copilot.
>
> **Time:** ~15 minutes
>
> **Copilot Features:** Hooks

**Your Challenge:** Add a hook to create a git commit after each agent session with proper attribution to Copilot.  This will create an auditable trail in git history for all agent sessions.

## What are Agent Hooks?

Agent Hooks allow execution of arbitrary commands or scripts at specific points in the Copilot Agent lifecycle. These hooks enable sophisticated workflows such as:

- **Audit Logging**: Recording prompts and session events for compliance.
- **Automated Checkpoints**: Creating git commits after each agent session.
- **Validation**: Running linters or tests before allowing the agent to proceed.

Hooks are defined in `.github/hooks/*.json` and support lifecycle events including `sessionStart`, `UserPromptSubmit`, and `Stop`.

## Step 1: Explore existing hooks

1. Open `.github/hooks/hooks.json` to see existing hook definitions.  Notice we have existing hooks for `sessionStart`, `UserPromptSubmit`, and `Stop` that log events to `.agent.log`
2. Assuming you've been using Copilot during this workshop, open `.agent.log` in your root workspace to see a log of your agent sessions, prompts submitted, and when sessions stopped.  This is an example of using hooks for audit logging.
3. If you have not been using Copilot yet, start an agent session and submit a prompt to see how it gets logged in `.agent.log`

## Step 2: Adding a git commit hook with Copilot attribution

The majority of this work has been done for you with a script and comment.  We'll just need to make a few modifications for our use case.  

1. Go back to `.github/hooks/hooks.json`.  Uncomment the agent hook definition under `Stop` for commits.  Notice this is calling a script, `.github/hooks/checkpoint-commit.sh`.  

```json
      // comment this in if you want automatic commits after each agent session
      {
        "type": "command",
        "bash": ".github/hooks/checkpoint-commit.sh",
        "cwd": ".",
        "timeoutSec": 10
      }
```

2. Open `.github/hooks/checkpoint-commit.sh` to see the script that creates a git commit with the message "Checkpoint commit after agent session".  This script will run every time an agent session stops, creating a checkpoint in git history.  Modify the script so the commit message includes Copilot attribution.  For example: 

```bash
# Create timestamped commit with Copilot co-author trailer
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
git commit -m "[Checkpoint-commit] $TIMESTAMP

Co-authored-by: GitHub Copilot <copilot@github.com>" --no-verify 2>/dev/null || {
  echo "⚠️  Commit failed"
  exit 0
}
```

3. Create a new branch (`git branch checkpoint-hook-test`) and start an agent session.  Use the following prompt:

<div className="prompt-block">

```text
Add two rocket emojis 🚀🚀 to the title in the README.
```

</div>

4. Once the session stops, check the git history by running `git log -1`.  You should see a new commit with the message starting with `[Checkpoint-commit]` and the co-author trailer for GitHub Copilot.  Note you could also search all commit history with `git log --grep="Co-authored-by: GitHub Copilot" --oneline`

Note if you accidentally commit to main branch, you can reset to undo the commit and move it to a new branch:
```bash
git reset HEAD~1  # Undo last commit but keep changes staged
git checkout -b checkpoint-hook-test  # Move to new branch
```

## What You Learned

✅ **Agent Hooks** - Commands triggered at specific points in agent lifecycle

**Time Investment:** 15 minutes  
**Value:** Hooks provide ways to call external scripts at different points in the agent lifecycle.  This could be used to send notifications, enforce policies, create audit logs, block certain actions, or even create git commits for every agent session with proper attribution.  This gives you control at various events throughout the agent lifecycle.  

## Next Steps

Continue to [Agentic Workflows](/workshops/immersive-experience/agentic_workflows) to learn about intelligent workflows in GitHub Actions.
