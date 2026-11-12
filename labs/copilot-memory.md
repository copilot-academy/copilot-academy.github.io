---
title: "Lab: Copilot Memory"
description: Learn to add and verify repository and user-level Copilot Memory from the Copilot app, with optional CLI import and Dreaming.
sidebar_position: 6
---

# Lab: Copilot Memory

> **Duration:** ~45–60 minutes (core path) + ~20 minutes (optional Dreaming) | **Level:** Beginner → Intermediate | **Prerequisites:** An eligible paid [GitHub Copilot subscription](https://github.com/features/copilot/plans), the [GitHub Copilot app](https://github.com/features/ai/github-app) and [Copilot CLI](https://github.com/features/copilot/cli) installed, and write access to your existing Copilot Academy repository

## Objective

In this lab, you'll use the GitHub Copilot app to add and test a durable fact about your existing Copilot Academy repository, then add a user-level preference asking Copilot to call you by a name you choose. You'll verify each memory in the appropriate GitHub settings, learn the difference between the two scopes, and see an optional Copilot CLI import path. A final optional exercise explores Copilot Dreaming for the same repository.

:::note Copilot Memory is evolving fast
Feature availability and settings can change. If something differs from this lab, check the [official Copilot Memory documentation](https://docs.github.com/en/copilot/concepts/prompting-and-context/copilot-memory) and the [Copilot CLI command reference](https://docs.github.com/en/copilot/reference/copilot-cli-reference/cli-command-reference).
:::

---

## What You'll Build

- One repository-level memory, chosen and authored by you, in your existing Copilot Academy repository
- One user-level preference with a name you choose
- Read-only follow-ups in fresh Copilot app sessions to test whether each memory is useful
- Optionally, a JSONL file validated for import with Copilot CLI
- Optionally, a Copilot Dreaming configuration for the same repository

## Exercise 1 — Open Your Repository and Check Memory Settings

### 1.1 Start in your existing Copilot Academy repository

Use the Copilot Academy repository you already created for the Academy labs. Open it in the GitHub Copilot app and start a session there. Keep all repository-level memory and Dreaming activities in this repository.

You need write access to create repository-level memories. Copilot Memory is available on eligible paid plans, but account settings and organization or enterprise policies can still restrict which memory types are available.

### 1.2 Check the settings before prompting

1. In GitHub settings, open **Copilot → Features → Copilot Memory** and enable user-level preferences before Exercise 3. If an organization or enterprise policy restricts this setting, ask your administrator. This is separate from the repository-level Memory setting.
2. In your Copilot Academy repository, open **Settings → Copilot → Memory** and confirm that repository facts are allowed. An organization or enterprise policy may control this setting.
3. If you have Copilot licenses from multiple organizations or enterprises, select a default billing entity in your account settings before creating memories.

:::note The Copilot app does not have a shared-memory management screen
You can ask Copilot to create a memory in the GitHub Copilot app, but the app does not provide a separate screen for viewing or deleting shared Copilot Memory facts or user-level preferences. Use the repository's **Settings → Copilot → Memory** page to verify and manage repository facts. Viewing repository facts there also requires write access and user-level preferences enabled for your account. Verify and delete your user-level preferences in [personal Copilot Memory settings](https://github.com/settings/copilot/memory).

The Copilot app's per-project **Memory** setting is separate: it stores project preferences across tasks, not shared repository facts or user-level Copilot Memory.
:::

### ✅ Checkpoint

You have your existing Copilot Academy repository open in the app, and repository-level Memory is allowed for it.

## Exercise 2 — Add a Repository Fact from the Copilot App

### 2.1 Find a durable fact in this repository

Use a Copilot app session in the Academy repository to inspect its lab structure. A useful place to look is `CONTRIBUTING.md`, along with `labs/index.md` and `sidebars/labs.js`. Verify a stable fact directly in the files, then choose a fact of your own that would help someone working in this repository. Do not store a temporary task detail or sensitive information.

### 2.2 Ask Copilot to remember your fact

In the Copilot app session, replace the bracketed parts with your verified fact and its supporting file:

```text
In this repository, remember this durable fact for everyone contributing: [your own concise, verified fact]. Cite [path/to/the/supporting/file].
```

Review Copilot's response and scope. If it asks whether the fact applies to you or to the repository, specify repository-level. Verify the result in GitHub settings rather than relying on the response as proof that it was stored.

### 2.3 Verify the stored fact and test it in a fresh session

Open the repository's **Settings → Copilot → Memory** page on GitHub and confirm the fact and citation appear. If they do not, check the repository Memory setting, your write access, account settings, and organization or enterprise policy. Prompting Copilot does not guarantee storage.

Return to the Copilot app and start a fresh session in the same repository. Without repeating the fact, ask for a read-only task that could benefit from it. For example:

```text
Read-only: based on the existing lab structure, outline the files and guidance you would check before proposing a new lab. Cite the sources you used. Do not edit files or run commands.
```

Compare Copilot's response with the repository files. A correct answer alone does not prove that the memory was retrieved; if you cannot tell whether it used the memory, record the result as inconclusive. Memories are useful context, not guaranteed instructions.

### ✅ Checkpoint

Your repository settings show the fact you chose, and you have tested a related read-only question in a fresh Copilot app session.

## Exercise 3 — Add a User-Level Preference from the Copilot App

### 3.1 Confirm user-level preferences are enabled

Before this exercise, enable user-level preferences in GitHub settings under **Copilot → Features → Copilot Memory**. On Copilot Business or Enterprise, an administrator must allow the feature. If you have Copilot licenses from multiple organizations or enterprises, select a default billing entity before creating memories.

User-level preferences apply to you across Copilot projects. This exercise adds one personal preference; it does not add another repository or change the repository scope of your fact and Dreaming exercise.

### 3.2 Ask Copilot to use the name you choose

In a Copilot app session, replace the placeholder with a name of your choosing:

```text
Across all my projects, remember to address me as [YOUR-CHOSEN-NAME]. This is a user-level preference for how you address me, not a fact about the Copilot Academy repository.
```

If Copilot asks you to clarify or approve the scope, specify and approve it only as a **user-level preference**. If it is treated as a repository fact, do not approve that scope; clarify that the preference applies to you across projects. Avoid adding sensitive information.

### 3.3 Verify the preference and test it in a fresh session

Open [personal Copilot Memory settings](https://github.com/settings/copilot/memory) and confirm that the preference appears as user-level. You can also delete it from this page. The Copilot app does not provide a separate screen for managing shared Copilot Memory preferences.

Start a fresh session in the Copilot app and ask a simple question without repeating your chosen name. Check whether Copilot addresses you as requested. The preference can apply across contexts, but a correct response alone does not prove that the memory was retrieved; if you cannot tell, record the result as inconclusive.

### 3.4 Compare memory scopes

Repository-level facts describe one repository and can be shared with collaborators who have read access and can use Copilot Memory. They do not automatically apply to other repositories or forks. User-level preferences follow you across projects. The Copilot app's per-project **Memory** setting is separate from both shared memory types.

Use Copilot Memory for useful facts and preferences Copilot can retrieve when relevant. Use custom instructions for rules that must be followed consistently. Asking Copilot to “forget” a memory may downvote it, but does not delete it: delete repository facts from repository settings and user-level preferences from personal settings.

Repository facts and user-level preferences expire after 90 days by default if Copilot does not reinforce them. An organization or enterprise can configure repository-fact retention from 7 to 180 days; that does not change the default retention for user-level preferences. Simply retrieving a memory does not extend its retention period.

### ✅ Checkpoint

You verified a user-level preference in personal settings, checked it in a fresh app session, and can distinguish it from the repository-level fact.

## Exercise 4 — Optional: Use Copilot CLI

The Copilot app is the main path for this lab. Use the CLI for an alternate prompt workflow or to import a prepared memory file.

### 4.1 Check the CLI's local setting

In a terminal, start Copilot CLI in the same existing repository:

```bash
cd /path/to/your/copilot-academy-repo
copilot
```

In the interactive CLI, use:

```text
/memory show
```

This shows the CLI's local setting and a link to memory settings, not a list of stored facts. If you previously opted out locally, run `/memory on`; it clears only the CLI's local opt-out and does not override account or repository policies. Non-interactive prompts such as `copilot -p "..."` have memory disabled by default; `--enable-memory` enables it for that run.

### 4.2 Import a new fact with JSONL (optional)

Each line in a `.jsonl` file must be one versioned memory object. Save the file outside the repository so it is not committed with project files:

```bash
mkdir -p ~/copilot-memory-lab
```

Replace the repository placeholders with your actual Academy repo identity, choose a new fact you verified and its supporting path/line numbers, and replace the name placeholder with the name you chose in Exercise 3. Remove either record if you do not want to import that memory:

```jsonl
{"type":"memory","version":1,"externalId":"academy-fact-1","scope":{"type":"repository","repository":{"host":"github.com","owner":"YOUR-OWNER","name":"YOUR-COPILOT-ACADEMY-REPOSITORY"}},"subject":"lab structure","fact":"[A new, concise, verified fact about this repository.]","reason":"This helps future work follow a stable convention in this repository.","citations":[{"type":"file","path":"PATH/TO/SUPPORTING-FILE","lineStart":1,"lineEnd":1}]}
{"type":"memory","version":1,"externalId":"user-name-preference-1","scope":{"type":"user"},"subject":"addressing preference","fact":"Address me as [YOUR-CHOSEN-NAME].","reason":"This is my preferred form of address across Copilot projects.","citations":[{"type":"text","text":"User input: \"Across all my projects, remember to address me as [YOUR-CHOSEN-NAME].\""}]}
```

Save the records you intend to use as `~/copilot-memory-lab/memories.jsonl`. If you already stored either memory in Exercises 2 or 3, do not submit it again: use a new verified fact, remove the duplicate record, or run only the dry-run.

Validate the file without submitting memories:

```bash
copilot memories import ~/copilot-memory-lab/memories.jsonl --dry-run
```

The dry run checks the format, not your permissions or repository policies. To deliberately submit the file, run the command without `--dry-run`; running it counts as approval:

```bash
copilot memories import ~/copilot-memory-lab/memories.jsonl
```

You can add `--on-conflict skip` to skip conflicts or `--output json` for JSON results. `externalId` helps identify an input record in results but is not a permanent memory identifier. Skipping conflicts does not make an import idempotent or prevent duplicate facts. Check every record's result, retry only failures, then verify repository facts in repository settings and user-level preferences in [personal Copilot Memory settings](https://github.com/settings/copilot/memory).

### ✅ Checkpoint

If you chose the import path, the file passed `--dry-run`. You submitted it only if you deliberately ran the import without that flag.

## Exercise 5 — Optional: Explore Copilot Dreaming

:::warning Dreaming changes context and uses AI credits
Copilot Dreaming can automatically add, update, or remove memories. Every run uses AI credits, including runs that make no changes. Proposed changes to repository instruction or skill files arrive as pull requests and do not change files unless you merge them. Turning Dreaming off does not undo changes already made. Review repository coverage and spending controls before enabling it.
:::

:::important Prerequisites
Copilot Dreaming is in public preview. The current preview requires an eligible paid Copilot plan (not Copilot Pro), access to GPT-6.1 Sol under applicable policies, and does not support GitHub Enterprise Cloud with data residency. Repository customization requires repository Memory, repository Dreaming, and eligible session syncing.

For managed Copilot access, the **Store local sessions in the Cloud** policy must allow at least **View from cloud**. If `remoteExport` is `false` in `~/.copilot/settings.json`, remove that setting or change it to `true`. If you complete prerequisites after enabling Dreaming, turn Dreaming off and on again.
:::

### 5.1 Check the right enablement path

Use the path that matches your account and repository:

- **Personally owned repository and an eligible individual Copilot subscription, with no Copilot access from an organization or enterprise:** You must be a repository administrator, and the repository cannot be archived. Follow the [personal-account Dreaming setup](https://docs.github.com/en/copilot/how-tos/use-copilot-agents/copilot-memory/manage-for-yourself#enabling-copilot-dreaming-for-a-personally-owned-repository).
- **Organization-owned repository or Copilot access managed by an organization or enterprise:** An administrator must allow Dreaming. Organization-level enablement can cover every repository in the organization's Copilot Memory access selection, not just this repository; review the selection before enabling it. Follow the [administrator setup](https://docs.github.com/en/copilot/how-tos/use-copilot-agents/copilot-memory/manage-as-administrator#enabling-copilot-dreaming).

In either case, repository Memory must be allowed for your Copilot Academy repository. Personal Dreaming is configured separately and is not required for this repository exercise.

### 5.2 Prepare a repository session and review runs

In the Copilot app, start a read-only session in your Copilot Academy repository and ask:

```text
Read-only: inspect CONTRIBUTING.md, labs/index.md, and sidebars/labs.js. Outline a checklist for proposing a new lab that follows the existing repository patterns. Cite the sources; do not edit files or run commands.
```

Repository Dream runs appear in the Copilot app for repositories you have added to the app. If your Academy repository is not already listed, select **+** beside **Sessions**, choose **Add GitHub repository**, and select it by its `OWNER/REPOSITORY` name.

Open **Automations → Dreaming → Repository Dream runs**. Dreaming runs on a schedule managed by GitHub; you cannot start a run manually, so results may not appear during this lab. Refreshing the list only reloads results. Record the outcome:

- **Pending:** no run is visible yet. A future scheduled run may use the session; pending is a valid result.
- **Completed, no updates:** the run made no memory changes or opened no pull request.
- **Completed, updates available:** review the memory changes and any proposed pull request.

Memory changes are applied automatically. Instruction and skill-file changes require pull-request review and merge. Do not assume a run changed anything; completion of this lab does not depend on Dreaming results appearing.

### ✅ Checkpoint

You know which settings path applies, how Dreaming results are reviewed, and that a pending run is a valid outcome.

## Finish — Completion Checklist and Troubleshooting

Before you finish, confirm that you:

- Added one fact you chose and verified for your existing Copilot Academy repository.
- Added a user-level preference using a name you chose, then checked it in personal settings.
- Tested both memories in fresh Copilot app sessions; marked retrieval inconclusive if it was not observable.
- Used only `--dry-run` unless you deliberately chose to submit an import.
- If you tried Dreaming, recorded whether the result was pending, completed with no updates, or completed with updates.

If a repository fact was not stored, check repository Memory access, your write access, and any organization or enterprise policy. If a user-level preference was not stored, check **Copilot → Features → Copilot Memory** and whether your administrator allows user-level preferences. Also check your CLI's local setting if using the CLI. For Dreaming, check plan/model eligibility, session syncing, and the applicable personal or administrator policy; a successful setup does not trigger an immediate run.

### Official documentation

- [Manually creating memories and importing JSONL](https://docs.github.com/en/copilot/how-tos/use-copilot-agents/copilot-memory/create-memories)
- [Managing Copilot Memory for your personal account](https://docs.github.com/en/copilot/how-tos/use-copilot-agents/copilot-memory/manage-for-yourself)
- [Copilot CLI command reference](https://docs.github.com/en/copilot/reference/copilot-cli-reference/cli-command-reference)
- [About GitHub Copilot Memory](https://docs.github.com/en/copilot/concepts/prompting-and-context/copilot-memory)
- [About GitHub Copilot Dreaming](https://docs.github.com/en/copilot/concepts/prompting-and-context/copilot-dreaming)
- [Managing Copilot Memory and Dreaming as an administrator](https://docs.github.com/en/copilot/how-tos/use-copilot-agents/copilot-memory/manage-as-administrator)
