---
title: "Lab: APM in 60 Minutes"
description: Package, version, publish, and consume AI agent primitives with APM — build a plugin repo, a marketplace repo, and install your own package end to end.
sidebar_position: 5
---

# Lab: APM in 60 Minutes

> **Duration:** ~60 minutes | **Level:** Intermediate | **Prerequisites:** A GitHub account, Git, and either [GitHub Copilot CLI](https://docs.github.com/copilot/how-tos/set-up/install-copilot-cli) or the [GitHub Copilot app](https://github.com/features/copilot)

## Objective

Your team has a great skill for writing release notes. It lives in one repo. Six weeks later there are four copies of it across four repos, each slightly different, and nobody knows which one is current.

This is the problem [**APM (Agent Package Manager)**](https://microsoft.github.io/apm/) solves. APM is a dependency manager for AI agent primitives — skills, prompts, instructions, agents, hooks, and MCP servers. You declare what you need in a manifest, `apm install` deploys it into every AI harness it detects, and a lockfile pins exact versions and content hashes so every teammate gets a byte-identical result.

In this lab you will:

- **Install** APM and consume an existing package to learn the consumer loop
- **Build** a producer repo containing a Release Notes plugin — one skill, one prompt, one instruction
- **Publish** a second repo that acts as a curated marketplace indexing your plugin
- **Consume** your own package from your own marketplace, and verify it in both Copilot CLI and the GitHub Copilot app
- **Understand** the monorepo shape for teams shipping many plugins from one repo

:::note APM is evolving fast
APM is under active development and commands change. If something looks different from what you see here, check the [official APM docs](https://microsoft.github.io/apm/).
:::

## Prerequisites

You need three things before you start.

**1. A GitHub account.** You will create two private repos under your own account. Throughout this lab, replace `<owner>` with your GitHub username.

**2. Git and the GitHub CLI installed and configured.** Confirm that `gh` is authenticated before you start:

```bash
gh auth status
```

**3. An AI harness to verify against.** Either:

- [GitHub Copilot CLI](https://docs.github.com/copilot/how-tos/set-up/install-copilot-cli) — `copilot` on your PATH, or
- The [GitHub Copilot app](https://github.com/features/copilot)

Both read the same files from disk, so anything you install with APM shows up in either one.

## What You'll Build

Three moving parts, wired together:

```
┌──────────────────────────────┐
│  <owner>/release-notes-plugin│   PRODUCER REPO
│                              │
│  apm.yml                     │   Declares the package
│  .apm/skills/academy-release-notes/ │ A model-invoked guide
│  .apm/prompts/*.prompt.md    │   An on-demand workflow
│  .apm/instructions/*.md      │   Scope-attached rules
│                              │
│  tagged v0.1.0 ──────────────┼──┐
└──────────────────────────────┘  │
                                  │  indexed by
┌──────────────────────────────┐  │
│  <owner>/academy-marketplace │◄─┘   MARKETPLACE REPO
│                              │
│  apm.yml (marketplace: block)│   Curated index
│  generated marketplace index │   Built by apm pack
└──────────────┬───────────────┘
               │  apm marketplace add
               │  apm install release-notes@academy-marketplace
               ▼
┌──────────────────────────────┐
│  your-consumer-project/      │   CONSUMER PROJECT
│                              │
│  .github/prompts/            │   Deployed by apm install
│  .github/instructions/       │
│  .agents/skills/             │
│  apm.lock.yaml               │   Pinned + hashed
└──────────────────────────────┘
```

The producer repo and marketplace repo are separate on purpose — that is the **aggregator** shape, where a marketplace curates packages that live in other repos. Part 6 covers the **monorepo** alternative where both live together.

---

## Part 1 — Install APM and the Mental Model

**Time: ~5 minutes**

### 1.1 Install the CLI

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs groupId="os">
<TabItem value="macos" label="macOS / Linux" default>

```bash
curl -sSL https://aka.ms/apm-unix | sh
```

</TabItem>
<TabItem value="windows" label="Windows (PowerShell)">

```powershell
irm https://aka.ms/apm-windows | iex
```

</TabItem>
</Tabs>

Verify the install:

```bash
apm --version
```

:::tip Other install methods
Homebrew, Scoop, pip, air-gapped mirrors, and signed archives are all supported. See the [installation guide](https://microsoft.github.io/apm/getting-started/installation/) if the script above does not fit your environment.
:::

:::warning Running in a container, Codespace, or slim Linux image?
The install script **exits 0 even when the resulting binary is broken**, so always run `apm --version` before moving on. If it fails with a `sqlite3` import error, the base image is missing a shared library the bundled binary needs:

```bash
sudo apt-get update && sudo apt-get install -y libsqlite3-0
```

Then re-run `apm --version`. If you would rather avoid the standalone binary entirely, `pip install --user apm-cli` works and has no such dependency.
:::

### 1.2 The mental model

Three files do all the work. Learn these now and the rest of the lab is mechanical.

| File | Who writes it | What it does |
|------|---------------|--------------|
| `apm.yml` | You, by hand | The manifest. Declares your package's identity, dependencies, and targets. |
| `apm.lock.yaml` | APM, on install | The lockfile. Pins the exact commit and SHA-256 content hash of everything installed. |
| `apm_modules/` | APM, on install | The package cache. Gitignored automatically; rebuilt from the lockfile. |

And one command does the heavy lifting:

```
apm install
   │
   ├─ 1. Resolve      Turn "owner/repo#v1.0.0" into an exact commit
   ├─ 2. Policy gate  Check apm-policy.yml (if your org ships one)
   ├─ 3. Scan         Reject hidden-Unicode attacks; critical findings block
   ├─ 4. Integrate    Copy primitives into each detected harness's directories
   └─ 5. Lockfile     Record the commit + content hash of every deployed file
```

The **Integrate** step is the interesting one. APM does not install into a generic folder — it writes into the directory the AI tool actually reads. One source file gets rewritten into its deployed location:

| You author | Copilot gets |
|------------|--------------|
| `.apm/skills/foo/SKILL.md` | `.agents/skills/foo/SKILL.md` |
| `.apm/prompts/bar.prompt.md` | `.github/prompts/bar.prompt.md` |
| `.apm/instructions/baz.instructions.md` | `.github/instructions/baz.instructions.md` |

Author once in a single source layout, let APM place the files. That is the core promise.

---

## Part 2 — The Consumer Loop

**Time: ~10 minutes**

Before you author a package, install someone else's. This is the loop your future consumers will run, and you need to recognize what "working" looks like.

### 2.1 Create a scratch project

```bash
mkdir apm-consumer-demo
cd apm-consumer-demo
git init
```

### 2.2 Initialize APM

```bash
apm init
```

This is interactive. It asks for a project name, version, description, and author, then shows an "About to create" summary and a final `Is this OK?` confirmation.

**Press Enter through every prompt to accept the defaults.** The defaults are all sensible for this exercise, and accepting them keeps everyone on the same page for the rest of the lab.

:::note The default version is `1.0.0`, not `0.1.0`
`apm init` starts you at `1.0.0` because it assumes a project, not a pre-release library. The `apm plugin init` scaffold in Part 3 starts at `0.1.0`, so the two generated versions differ by design.

Prefer to skip the questions entirely? `apm init --yes` takes every default without prompting.
:::

It writes exactly one file: `apm.yml`. Open it, replace the commented target examples with `targets: [copilot]`, and leave the other generated values unchanged:

```yaml
name: apm-consumer-demo
version: 1.0.0
description: APM project for apm-consumer-demo
author: Developer
targets:
  - copilot

dependencies:
  apm: []
  mcp: []
includes: auto
scripts: {}
```

Three fields matter on day one:

- **`dependencies.apm`** — the packages you install. Empty for now.
- **`dependencies.mcp`** — MCP servers, wired into every detected harness.
- **`targets`** — commented out, so APM auto-detects harnesses from directories like `.github/`.

### 2.3 Install a package

```bash
apm install microsoft/apm-sample-package#v1.0.0 --target copilot
```

:::note Why `--target copilot` is explicit here
A brand-new project has no harness markers on disk yet, so auto-detection has nothing to find. Once a recognized marker exists (like `.github/`), the flag becomes optional. Without either a flag or a detectable marker, `apm install` exits with a target-selection error rather than guessing.
:::

The output shows what landed where:

```
[+] microsoft/apm-sample-package #v1.0.0 @fb285168
    |-- 2 prompts integrated      -> .github/prompts/
    |-- 1 agents integrated       -> .github/agents/
    |-- 1 instruction(s)          -> .github/instructions/
    |-- 1 skill(s) integrated     -> .agents/skills/
[+] github.com/github/awesome-copilot/skills/review-and-refactor
    |-- Skill integrated          -> .agents/skills/
[*] Installed 2 APM dependencies in 1.4s.
```

Notice the second entry. `review-and-refactor` is a **transitive dependency** — the sample package depends on it, and APM resolved and installed it in the same pass. The lockfile records both.

### 2.4 Inspect what changed

```bash
git status
```

```
Changes not staged for commit:
	modified:   apm.yml

Untracked files:
	.agents/
	.github/
	.gitignore
	apm.lock.yaml
```

Here is what each one is:

| Path | What happened |
|------|---------------|
| `apm.yml` | **Modified** — the package was added under `dependencies.apm` |
| `apm.lock.yaml` | **New** — pins resolved commits and content hashes |
| `.github/` | **New** — prompts, agents, instructions |
| `.agents/skills/` | **New** — harness-neutral skills |
| `.gitignore` | **New** — APM created it to ignore `apm_modules/` |

:::note Where is `apm_modules/`?
It exists on disk, but `git status` doesn't list it. During the install APM printed `[i] Added apm_modules/ to .gitignore` — it wrote a `.gitignore` (creating the file if you didn't have one) so the package cache stays out of your history.

If you already had a `.gitignore`, APM appends to it rather than overwriting.
:::

Open `apm.lock.yaml`. Every entry carries a resolved commit SHA and a content hash. This is what makes installs reproducible — a teammate who clones your repo and runs `apm install` gets byte-identical files, or the install fails loudly.

### 2.5 Commit vs. gitignore

Use this rule when deciding what belongs in version control:

| Path | Commit? | Why |
|------|---------|-----|
| `apm.yml` | ✅ Yes | The manifest. Shared with the team. |
| `apm.lock.yaml` | ✅ Yes | Reproducible installs depend on it. |
| `.github/`, `.agents/` | ✅ Yes | Deployed context. Contributors get it on clone, **before** they run `apm install`. |
| `apm_modules/` | ❌ No | Rebuildable cache. APM adds it to `.gitignore` for you. |

Committing the deployed directories is the counter-intuitive one. The reason: a teammate who clones the repo and opens Copilot immediately gets your skills and instructions, without needing APM installed at all.

### 2.6 Explore the installed package

```bash
apm list
```

`apm list` lists **scripts**, not installed packages. Because this project does not define any scripts, the command prints:

```
[!] No scripts found.
```

:::note Why are there no scripts?
Scripts are optional shortcuts declared under `scripts:` in `apm.yml`. Installing a package does not add scripts to the consumer project, so this output is expected.
:::

To inspect the installed package, run:

```bash
apm view microsoft/apm-sample-package
```

The package metadata should look like this:

```
Name: apm-sample-package
Version: 1.0.0
Source: local
Ref: v1.0.0
Commit: fb2851683be0

Context Files:
  * 1 instructions
  * 1 agents

Agent Workflows:
  * 2 executable workflows
```

:::tip Try it in your harness
Open this folder in Copilot CLI (`copilot`) or the Copilot app and look at your prompts picker. The sample package's prompts are already there — no registration step, no restart.
:::

---

## Part 3 — Build the Producer Repo

**Time: ~15 minutes**

Now you author a package. You will build a **Release Notes plugin** with three primitive types: a skill, a prompt, and an instruction.

### 3.1 Understand the three primitives you're about to write

Each primitive has a different invocation model. Use the table below to choose the one that matches the behavior you want.

| Primitive | Invoked by | Use it when |
|-----------|-----------|-------------|
| **Skill** | The model, automatically | The agent should reach for a guide mid-conversation based on what the user asked |
| **Prompt** | The user, explicitly | The user runs a named workflow on demand, picked from a list or referenced by path |
| **Instruction** | The file glob | A rule should fire whenever the agent touches matching files |

In short: **prompts are called, skills are reached for, and instructions apply automatically.**

### 3.2 Create the repo with GitHub CLI

Create a private repo and clone it in one command:

```bash
cd ..
gh repo create release-notes-plugin --private --clone
cd release-notes-plugin
```

Private repos work with APM as long as your Git credentials can read them. To make the example public instead, replace `--private` with `--public`.

### 3.3 Scaffold the plugin

```bash
apm plugin init --target copilot --yes
```

This writes two files into the current directory:

- **`plugin.json`** — the bundle's identity card, seeded from the **directory name**
- **`apm.yml`** — the manifest, with `dependencies`, `devDependencies`, `scripts`, and `includes` blocks

Open `apm.yml` and set the package name and description:

```yaml
name: release-notes
version: 0.1.0
description: Turn a commit range into clean, user-facing release notes.
author: <owner>
license: MIT

targets:
  - copilot

includes: auto

dependencies: {}
```

Now align `plugin.json` with what you just wrote. Your directory is `release-notes-plugin`, so the scaffold seeded `plugin.json` with `"name": "release-notes-plugin"`, while `apm.yml` now says `release-notes`. Open `plugin.json` and make the name and description match:

```json
{
  "name": "release-notes",
  "description": "Turn a commit range into clean, user-facing release notes."
}
```

Keeping the two in sync matters because a root `plugin.json` is the source of truth for **bundle identity** — `apm.yml` drives resolution and versioning, but the packaged name comes from `plugin.json`. Leave them out of sync and your bundle ships under the wrong name, which breaks `apm install release-notes@academy-marketplace` in Part 5.

Two more things to note in `apm.yml`:

- **`targets: [copilot]`** pins deployment to GitHub Copilot.
- **`dependencies: {}`** — an explicit empty mapping. This tells `apm pack` to produce a bundle. If you *omit* `dependencies:` entirely, no bundle is built. That distinction matters in Part 4.

### 3.4 Set up the source layout

Everything you author lives under a directory called `.apm/`, split by primitive type:

```
release-notes-plugin/
├── apm.yml
├── plugin.json
└── .apm/
    ├── skills/
    │   └── academy-release-notes/
    │       └── SKILL.md
    ├── prompts/
    │   └── draft-release-notes.prompt.md
    └── instructions/
        └── release-notes.instructions.md
```

`.apm/` is your **source**. It is not what consumers receive. Later in this part you'll run `apm pack`, which walks `.apm/`, collects every primitive it finds, rewrites paths into the layout each harness expects, and writes the result to `build/`. That `build/` output is the bundle consumers actually install.

Create the tree now:

<Tabs groupId="os">
<TabItem value="macos" label="macOS / Linux" default>

```bash
mkdir -p .apm/skills/academy-release-notes .apm/prompts .apm/instructions
```

</TabItem>
<TabItem value="windows" label="Windows (PowerShell)">

```powershell
New-Item -ItemType Directory -Force -Path `
  .apm/skills/academy-release-notes, `
  .apm/prompts, `
  .apm/instructions | Out-Null
```

</TabItem>
</Tabs>

:::warning Keep primitives under `.apm/<type>/`
APM collects primitives only from supported source paths. Put an instruction or prompt at your repo root instead of under `.apm/` and `apm pack` **silently omits it from the bundle** — no error, no warning, exit code 0.

| Primitive | `apm pack` collects from | Root fallback |
|-----------|--------------------------|----------------|
| instruction | `.apm/instructions/*.instructions.md` | **None** |
| command (prompt) | `.apm/prompts/*.prompt.md` | **None** |
| agent | `.apm/agents/**/*.agent.md` | **None** |
| hook | `.apm/hooks/*.json` | `hooks/*.json` |
| skill | `.apm/skills/<name>/SKILL.md` | `skills/<name>/SKILL.md` |

Only hooks and skills have a root fallback. Store every primitive under `.apm/<type>/`, then use the dry run in step 3.8 to confirm the bundle contains every expected file.
:::

### 3.5 Author the skill

A skill is a model-invoked guide. The runtime uses its `description` to decide when to load it, so describe the user request and trigger conditions clearly.

Create `.apm/skills/academy-release-notes/SKILL.md` with the command for your terminal:

<Tabs groupId="os">
<TabItem value="macos" label="macOS / Linux" default>

```bash
cat > .apm/skills/academy-release-notes/SKILL.md <<'EOF'
---
name: academy-release-notes
description: Use when the user asks to write, draft, or summarize release notes, changelogs, or "what shipped" summaries from commits, PRs, or a tag range. Converts raw git history into user-facing prose grouped by impact.
---

# Release Notes

Turn raw commit history into notes a **user** cares about — not a
restatement of the git log.

## Process

1. Determine the commit range. Default to `<last-tag>..HEAD`. If no tag
   exists, use the last 30 commits.
2. Read the commits. Prefer PR titles and bodies over raw commit subjects
   when both are available.
3. Discard anything with no user-visible effect: dependency bumps, CI
   tweaks, formatting, internal refactors, revert pairs that cancel out.
4. Group whatever remains under these headings, omitting empty ones:
   - **Added** — new capabilities
   - **Changed** — behavior that differs from the previous release
   - **Fixed** — bugs a user could have hit
   - **Deprecated** — still works, but scheduled for removal
   - **Breaking** — requires action from the user before upgrading
5. Write one line per entry. Lead with the verb. Say what the user can
   now do, not which function changed.

## Rules

- Never invent an entry that has no commit behind it.
- If a change is breaking, say so explicitly and state the migration step.
- Link issue or PR numbers when the source material has them.
- If the range contains nothing user-visible, say exactly that. Do not
  pad the notes to look productive.

## Example

Bad — describes the code:

> Refactored `AuthProvider` to use the new token cache.

Good — describes the user's world:

> Sign-in now completes without a round trip on repeat visits.
EOF
```

</TabItem>
<TabItem value="windows" label="Windows (PowerShell)">

```powershell
@'
---
name: academy-release-notes
description: Use when the user asks to write, draft, or summarize release notes, changelogs, or "what shipped" summaries from commits, PRs, or a tag range. Converts raw git history into user-facing prose grouped by impact.
---

# Release Notes

Turn raw commit history into notes a **user** cares about — not a
restatement of the git log.

## Process

1. Determine the commit range. Default to `<last-tag>..HEAD`. If no tag
   exists, use the last 30 commits.
2. Read the commits. Prefer PR titles and bodies over raw commit subjects
   when both are available.
3. Discard anything with no user-visible effect: dependency bumps, CI
   tweaks, formatting, internal refactors, revert pairs that cancel out.
4. Group whatever remains under these headings, omitting empty ones:
   - **Added** — new capabilities
   - **Changed** — behavior that differs from the previous release
   - **Fixed** — bugs a user could have hit
   - **Deprecated** — still works, but scheduled for removal
   - **Breaking** — requires action from the user before upgrading
5. Write one line per entry. Lead with the verb. Say what the user can
   now do, not which function changed.

## Rules

- Never invent an entry that has no commit behind it.
- If a change is breaking, say so explicitly and state the migration step.
- Link issue or PR numbers when the source material has them.
- If the range contains nothing user-visible, say exactly that. Do not
  pad the notes to look productive.

## Example

Bad — describes the code:

> Refactored `AuthProvider` to use the new token cache.

Good — describes the user's world:

> Sign-in now completes without a round trip on repeat visits.
'@ | Set-Content -Path .apm/skills/academy-release-notes/SKILL.md -Encoding utf8
```

</TabItem>
</Tabs>

:::tip What makes a description good
Runtimes match on the **first sentence**. Lead with the user's intent ("Use when the user asks to..."), then the trigger conditions. A vague description like "Helps with release notes" collides with every other skill on the machine. Keep it under 1024 characters — that is a hard ceiling in the agent-skills spec.
:::

### 3.6 Author the prompt

A prompt is invoked explicitly by name. Create `.apm/prompts/draft-release-notes.prompt.md` with the command for your terminal:

<Tabs groupId="os">
<TabItem value="macos" label="macOS / Linux" default>

```bash
cat > .apm/prompts/draft-release-notes.prompt.md <<'EOF'
---
description: Draft release notes for a commit range and write them to CHANGELOG.md.
input:
  - since: "Tag or commit to start from (defaults to the latest tag)"
  - version: "Version number these notes describe (e.g. 1.4.0)"
argument-hint: "[since] [version]"
---

# Draft release notes for ${input:version}

Draft the release notes for version `${input:version}`, covering every
change since `${input:since}`.

Follow these steps:

1. Run `git log ${input:since}..HEAD --oneline --no-merges` to collect
   the raw history. If `${input:since}` is empty, resolve the latest tag
   with `git describe --tags --abbrev=0` and use that instead.
2. Apply the **academy-release-notes** skill to turn that history into grouped,
   user-facing entries.
3. Prepend the result to `CHANGELOG.md` under a
   `## ${input:version} — <today's date>` heading. Create the file if it
   does not exist. Never overwrite existing entries.
4. Print the notes you wrote so I can review them before committing.

If the range contains no user-visible changes, tell me that instead of
writing an empty section.
EOF
```

</TabItem>
<TabItem value="windows" label="Windows (PowerShell)">

```powershell
@'
---
description: Draft release notes for a commit range and write them to CHANGELOG.md.
input:
  - since: "Tag or commit to start from (defaults to the latest tag)"
  - version: "Version number these notes describe (e.g. 1.4.0)"
argument-hint: "[since] [version]"
---

# Draft release notes for ${input:version}

Draft the release notes for version `${input:version}`, covering every
change since `${input:since}`.

Follow these steps:

1. Run `git log ${input:since}..HEAD --oneline --no-merges` to collect
   the raw history. If `${input:since}` is empty, resolve the latest tag
   with `git describe --tags --abbrev=0` and use that instead.
2. Apply the **academy-release-notes** skill to turn that history into grouped,
   user-facing entries.
3. Prepend the result to `CHANGELOG.md` under a
   `## ${input:version} — <today's date>` heading. Create the file if it
   does not exist. Never overwrite existing entries.
4. Print the notes you wrote so I can review them before committing.

If the range contains no user-visible changes, tell me that instead of
writing an empty section.
'@ | Set-Content -Path .apm/prompts/draft-release-notes.prompt.md -Encoding utf8
```

</TabItem>
</Tabs>

Two details worth calling out:

- **`${input:name}`** placeholders stay as-is on Copilot. They are the prompt's parameters — the agent asks you to fill them in when the prompt runs.
- Only five frontmatter keys are portable: `description`, `input`, `allowed-tools`, `model`, and `argument-hint`. Stick to those.

### 3.7 Author the instruction

An instruction is a rule attached to a file glob. It fires automatically whenever the agent touches a matching file.

Create `.apm/instructions/release-notes.instructions.md` with the command for your terminal:

<Tabs groupId="os">
<TabItem value="macos" label="macOS / Linux" default>

```bash
cat > .apm/instructions/release-notes.instructions.md <<'EOF'
---
description: Formatting and tone rules for changelog and release-note files.
applyTo: "CHANGELOG.md,**/release-notes/**,**/RELEASES.md"
---

# Changelog conventions

- Newest version at the top. Never append to the bottom.
- Heading format: `## <version> — <YYYY-MM-DD>`.
- Allowed group headings, in this order: Added, Changed, Fixed,
  Deprecated, Breaking. Omit any group with no entries.
- One entry per line, starting with a verb in present tense
  ("Adds", "Fixes", not "Added" or "This change fixes").
- Write for a user of the product, not a contributor to it. No file
  paths, no function names, no internal module names.
- Reference issues as `(#123)` at the end of the line.
- Never edit an entry under a version that has already been released.
EOF
```

</TabItem>
<TabItem value="windows" label="Windows (PowerShell)">

```powershell
@'
---
description: Formatting and tone rules for changelog and release-note files.
applyTo: "CHANGELOG.md,**/release-notes/**,**/RELEASES.md"
---

# Changelog conventions

- Newest version at the top. Never append to the bottom.
- Heading format: `## <version> — <YYYY-MM-DD>`.
- Allowed group headings, in this order: Added, Changed, Fixed,
  Deprecated, Breaking. Omit any group with no entries.
- One entry per line, starting with a verb in present tense
  ("Adds", "Fixes", not "Added" or "This change fixes").
- Write for a user of the product, not a contributor to it. No file
  paths, no function names, no internal module names.
- Reference issues as `(#123)` at the end of the line.
- Never edit an entry under a version that has already been released.
'@ | Set-Content -Path .apm/instructions/release-notes.instructions.md -Encoding utf8
```

</TabItem>
</Tabs>

:::note `applyTo` scopes the instruction
`applyTo` tells Copilot which files should receive this instruction. If you leave it out, APM treats the instruction as global and includes it in generated context files such as `AGENTS.md`.

Separate multiple globs with commas. A comma inside a brace pattern, such as `**/*.{css,scss}`, belongs to that pattern and does not separate the globs.
:::

### 3.8 Preview before you pack

Run a dry run before packing to catch misplaced files **before** consumers install the package.

```bash
apm pack --dry-run --verbose
```

The dry run reports **destination** paths inside the bundle, not your `.apm/` source paths. `apm pack` rewrites the layout as it goes, and `.prompt.md` files become `commands/*.md`:

```
skills/academy-release-notes/SKILL.md
commands/draft-release-notes.md
instructions/release-notes.instructions.md
```

If your instruction or prompt is missing from this list, it is in the wrong directory and `apm pack` has dropped it. Go back to the table in step 3.4.

### 3.9 Pack it

```bash
apm pack
```

APM writes a plugin-format directory under `./build/`, named `<name>-<version>`:

```
build/release-notes-0.1.0/
├── plugin.json          # copied from your root plugin.json
├── skills/
├── commands/
└── instructions/
```

Two side effects worth knowing:

- `apm pack` also writes **`.github/plugin/plugin.json`** into your working tree. That file *is* regenerated from `apm.yml`; decide whether your project will commit or ignore it.
- The `build/` directory is a build artifact. Add it to `.gitignore` — you publish the **tagged source repo**, not the bundle.

:::warning Never use `--format apm`
The legacy APM bundle layout has no `plugin.json`, and `apm install` **rejects it** with a targeted error. Always use the default (`--format plugin`). Similarly, `--target` on `apm pack` is deprecated — bundles are target-agnostic, and the consumer's project decides which harness layouts receive files at install time.
:::

### 3.10 Publish and tag

The tag is what makes your package versionable. Without it, the marketplace has nothing to resolve.

```bash
echo "build/" >> .gitignore

git add .
git commit -m "Add release-notes plugin: skill, prompt, and instruction"
git push

git tag v0.1.0
git push --tags
```

Confirm the tag landed:

```bash
git ls-remote --tags origin
```

You should see `refs/tags/v0.1.0`. Your producer repo is done.

---

## Part 4 — Build the Marketplace Repo

**Time: ~15 minutes**

A **marketplace** is a curated index: one repo publishes it, many repos install from it. This is the **aggregator** shape — no plugin source lives here, only pointers to plugins that live elsewhere.

:::caution Working in a Codespace? This part needs extra setup
From here on the lab spans **two repos** — the marketplace resolves your plugin repo over the network. A Codespace is credentialed for the single repo it was created from, so cloning and pushing a second repo will fail on authentication.

Run Parts 4 and 5 **locally**, or first authenticate the Codespace for multi-repo access (for example `gh auth login` with a token that covers both repos, or a Codespace configured with multi-repository permissions).
:::

### 4.1 Create the repo with GitHub CLI

Create the private marketplace repo alongside the producer repo:

```bash
cd ..
gh repo create academy-marketplace --private --clone
cd academy-marketplace
```

As in Part 3, use `--public` instead if you want anyone to browse or install from this marketplace without repository access.

### 4.2 Initialize the marketplace

```bash
apm marketplace init --owner <owner> --name academy-marketplace
```

This appends a `marketplace:` block to `apm.yml`, creating the file if it does not exist. The scaffold includes a dummy `example-package` entry — you will remove it in the next step.

### 4.3 Add your plugin to the index

```bash
apm marketplace package add <owner>/release-notes-plugin \
  --name release-notes \
  --version "^0.1.0"
```

The command appends `release-notes` to `marketplace.packages` in `apm.yml`. Do not add the package by hand.

Open `apm.yml` and **delete only the scaffolded `example-package` entry**. The resulting marketplace block should contain the package that the command added:

```yaml
marketplace:
  name: academy-marketplace
  owner:
    name: <owner>
    url: https://github.com/<owner>
  description: Curated APM packages for the Copilot Academy lab

  build:
    tagPattern: "v{version}"

  packages:
    - name: release-notes
      description: Turn a commit range into clean, user-facing release notes.
      source: <owner>/release-notes-plugin
      version: "^0.1.0"
```

:::danger Delete `example-package` or nothing will build
`apm marketplace init` seeds a placeholder entry pointing at a repo that does not exist. Leave it in and `apm marketplace check` reports **"2 entries have issues"** — and both `check` and `apm pack` **exit 1**. Remove the placeholder so validation checks only your package.
:::

:::note Watch the key names
In `apm.yml` the key is **`packages:`**. In the generated `marketplace.json` it becomes **`plugins:`**. Copilot CLI and APM both read this generated index. No alternate marketplace outputs are configured, and the plugin remains restricted to `targets: [copilot]`.

`owner:` is a **nested mapping** (`name:` + `url:`), not a flat string. Also note there is **no `versions[]` array**. Each compiled package carries exactly one resolved ref — the highest tag matching your range at build time. To publish a new version, re-tag the producer repo and re-run `apm pack` here.
:::

### 4.4 Validate before building

```bash
apm marketplace check
```

This resolves every package's ref or version range against the remote and prints an **Entry Health Check** table — Status, Package, Reachable, Version Found, Ref OK, Detail. A missing tag or an unresolvable range exits non-zero, which is exactly why this is the command to run in CI before you push a release commit.

If this fails, the two usual causes are the `example-package` entry from step 4.3, or skipping `git push --tags` in step 3.10.

### 4.5 Build the marketplace artifact

```bash
apm pack
```

APM resolves every remote entry with `git ls-remote` and prints the path to the generated `marketplace.json`. Open that file. You will see your package with a **resolved** ref — the range `^0.1.0` has been pinned to a concrete tag *and* the commit SHA behind it:

```json
{
  "name": "academy-marketplace",
  "owner": { "name": "<owner>", "url": "https://github.com/<owner>" },
  "plugins": [
    {
      "name": "release-notes",
      "version": "0.1.0",
      "source": {
        "source": "github",
        "repo": "<owner>/release-notes-plugin",
        "ref": "v0.1.0",
        "sha": "657ec1140270b5b3ebd2539c4faff772b12ce904",
        "tag_pattern": "v{version}"
      }
    }
  ]
}
```

That `sha` is the provenance guarantee: even if someone force-moves the `v0.1.0` tag later, consumers resolving through your marketplace still get the exact commit you published.

Notice that **no bundle was produced**. That is because `apm.yml` here has no `dependencies:` mapping at all. Compare with Part 3, where `dependencies: {}` explicitly selected bundle output:

| `dependencies:` in `apm.yml` | `apm pack` produces |
|------------------------------|---------------------|
| Omitted or null | `marketplace.json` only |
| `{}` (explicit empty) | Bundle **and** `marketplace.json` |
| Populated | Bundle **and** `marketplace.json` |

:::warning A `.gitignore` with `*.json` will silently break your marketplace
If your repo ignores `*.json`, the generated `marketplace.json` never gets committed and consumers see nothing. `apm marketplace init` warns about this. Add `!**/marketplace.json` to unignore generated marketplace indexes.
:::

### 4.6 Publish

```bash
git add apm.yml ':(glob)**/marketplace.json'
git commit -m "Publish academy-marketplace with release-notes v0.1.0"
git push
```

Your marketplace is live.

:::tip Non-standard tag layouts
If a package's repo tags releases as `release-notes_v0.1.0` instead of `v0.1.0`, APM cannot resolve it with the default convention. Set a `tag_pattern` on the package entry — for example `"{name}_v{version}"` — and re-run `apm pack`. The generated `marketplace.json` carries the pattern forward so consumers resolve it the same way.
:::

---

## Part 5 — Consume Your Own Package

**Time: ~10 minutes**

Now install through the marketplace to validate the producer and marketplace configuration from Parts 3 and 4.

### 5.1 Register the marketplace

Go back to your consumer project from Part 2 (or create a fresh one):

```bash
cd ../apm-consumer-demo
apm marketplace add <owner>/academy-marketplace
```

### 5.2 Install from it

```bash
apm install release-notes@academy-marketplace
```

The `<package>@<marketplace>` syntax is what makes marketplaces useful: consumers reference a short, stable name instead of a git URL, and the marketplace controls which version that name resolves to.

### 5.3 Verify the files landed

```bash
ls .github/prompts/
ls .github/instructions/
ls .agents/skills/
```

You should see all three primitives:

```
.github/prompts/draft-release-notes.prompt.md
.github/instructions/release-notes.instructions.md
.agents/skills/academy-release-notes/SKILL.md
```

:::danger If a file is missing, check the `.apm/` source layout
An instruction or prompt authored outside `.apm/<type>/` was **dropped by `apm pack`** — it never made it into the bundle, so there was nothing to install. Go back to the discovery table in step 3.4, move the file, then re-run `apm pack`, re-tag, and re-install.

This is why step 3.8's `--dry-run --verbose` check matters — it is much cheaper to catch this before publishing.
:::

:::tip Watch for the unpinned-dependency warning
If your install prints something like:

```
[!] 1 dependency unpinned: <owner>/release-notes-plugin -- add #tag or #sha to prevent drift
```

that is APM telling you the resolved source has no immutable ref. Marketplace entries resolved from a version range get pinned automatically; direct git installs do not. Add `#v0.1.0` to the source to silence it — and to guarantee reproducibility.
:::

Check the lockfile too:

```bash
grep -A3 release-notes apm.lock.yaml
```

You should see a resolved commit and a content hash for each deployed file.

### 5.4 Give the project something to summarize

`apm-consumer-demo` has been a scratch folder up to now — you ran `git init` back in step 2.1 but never committed. A release-notes workflow with no tags and no commits will correctly tell you there is nothing to summarize, which looks like a broken plugin.

Give it a real history first:

```bash
git add -A
git commit -m "chore: install release-notes plugin"
git tag v0.1.0

git commit --allow-empty -m "feat: add changelog scaffold"
git commit --allow-empty -m "fix: correct tag parsing in the release script"
```

Confirm there is now a range to work with:

```bash
git log v0.1.0..HEAD --oneline
```

You should see the two commits made after the tag.

### 5.5 Verify in Copilot CLI

```bash
copilot
```

**Skills are exposed as slash commands. Prompt files are not.** Your skill is registered under its `name:` from `SKILL.md`. This lab uses `academy-release-notes` because Copilot CLI already includes a built-in `/release-notes` command:

```
/academy-release-notes
```

Then verify auto-activation — describe the task without naming anything:

```
Summarize what shipped in this repo since the last tag.
```

The **academy-release-notes** skill should activate on its own. That is the difference between a skill and a prompt: you never typed its name, the model reached for it based on the `description:` you wrote in step 3.5.

:::warning `.prompt.md` files are not slash commands in Copilot CLI
Typing `/draft-release-notes` will **not** work. Copilot CLI will tell you it is not a command — the CLI does not support prompt files as slash commands.

The file deployed to the correct place (`.github/prompts/draft-release-notes.prompt.md`), but Copilot CLI does not expose prompt files as slash commands. To run it from the CLI, reference it by path:

```
@.github/prompts/draft-release-notes.prompt.md
```

**Practical rule:** if you want a workflow that a user can invoke by name from the CLI, ship it as a **skill**. Prompts are best where a prompt picker exists.
:::

### 5.6 Verify in the GitHub Copilot app

Open the same folder in the GitHub Copilot app.

Both surfaces read the identical on-disk files — `.github/prompts/`, `.github/instructions/`, and `.agents/skills/` — so there is no extra installation step. What differs is how each surface exposes them:

| Primitive | Copilot CLI | Copilot app |
|-----------|-------------|-------------|
| Skill | `/academy-release-notes`, plus auto-activation | Auto-activation |
| Prompt | `@` by file path only | Appears in the prompts picker |
| Instruction | Fires on glob match | Fires on glob match |

Test the instruction specifically: ask the agent to add a changelog entry, and confirm it uses the `## <version> — <YYYY-MM-DD>` heading format and present-tense verbs you specified. The agent was never told about those rules in your message — the glob matched, so the rule loaded.

---

## Bonus — Scheduled Workflows in the Copilot App

**Time: ~10 minutes — optional, beyond the 60-minute budget**

Everything so far runs when *you* ask for it. The Copilot app adds an experimental target of its own, `copilot-app`, which turns a prompt into a **scheduled workflow** — the same primitive, running on a timer with nobody in the loop.

Release notes are a natural fit: draft them every Friday morning instead of remembering to ask.

### B.1 Enable the experimental target

```bash
apm experimental enable copilot-app
```

Experimental targets are opt-in per machine. Until you enable it, `--target copilot-app` is rejected.

### B.2 Write the workflow

A workflow is a prompt with scheduling fields in its frontmatter. Back in your **plugin repo**, create `.apm/prompts/weekly-release-notes.prompt.md`:

```markdown
---
description: Draft release notes for everything merged in the past week.
interval: weekly
schedule_day: 5
schedule_hour: 9
---

Summarize everything merged into the default branch in the last 7 days
as user-facing release notes.

Use the academy-release-notes skill for tone and structure. Group entries under
Added, Changed, and Fixed. Skip commits that only touch CI config or
lockfiles.

If nothing user-facing shipped this week, say so in a single line rather
than padding the notes.
```

| Field | Meaning |
|-------|---------|
| `interval` | `hourly`, `daily`, or `weekly` |
| `schedule_day` | Day of week, `0` = Sunday through `6` = Saturday. Only read when `interval: weekly` |
| `schedule_hour` | Hour of day, `0`–`23`, in the app's local timezone |

Notice there is **no `${input:...}` placeholder** anywhere in the body. A scheduled run has no user available to answer questions, so a workflow has to be entirely self-contained. That is the main authoring difference from the interactive prompt you wrote in step 3.6 — everything the run needs must already be in the file.

### B.3 Ship it

Same publish loop as Part 3 — pack, commit, tag, push:

```bash
apm pack
git add -A
git commit -m "feat: add weekly release notes workflow"
git tag v0.2.0
git push && git push --tags
```

Then in `apm-consumer-demo`, pull it down against the new target:

```bash
apm install --target copilot-app
```

### B.4 Turn it on

Open the Copilot app and go to the **Workflows** tab. Your workflow is listed there — and it is **disabled**.

That is deliberate. APM will never schedule background work on your machine without an explicit opt-in. Toggle it on and confirm the next run time matches the `schedule_day` and `schedule_hour` you set.

:::tip Iterating on a workflow
Scheduled runs are slow to debug by definition — you do not want a week-long feedback loop on wording. Get the body right as an ordinary prompt first, then add the scheduling frontmatter once you like the output.
:::

Full details in the [Copilot app integration docs](https://microsoft.github.io/apm/integrations/copilot-app/).


---

## Part 6 — Scaling Up: The Monorepo Option

**Time: ~5 minutes — read only, no commands to run**

The two-repo layout works well for one plugin. As the catalog grows, an aggregator or monorepo can reduce repository overhead. The table below compares all three layouts.

### 6.1 The three repo shapes

| Shape | Source files | Use when |
|-------|--------------|----------|
| **Single-plugin** | One `apm.yml` at the repo root | One plugin per repo. Smallest surface and fewest layout decisions. *(You built this in Part 3.)* |
| **Aggregator** | One `apm.yml` at the root with N remote `packages:` | You curate plugins that live in other repos. *(You built this in Part 4.)* |
| **Monorepo-hybrid** | Root `apm.yml` **plus** per-plugin `apm.yml` in subdirectories | Many plugins ship together, alongside the marketplace that indexes them. |

There is no `--shape` flag. Every layout emerges from composing the same two commands — `apm plugin init` and `apm marketplace init` — in different working directories.

### 6.2 What the monorepo looks like

```
agents-hub/
├── apm.yml                          # marketplace: + local-path packages
└── packages/
    ├── release-notes/
    │   ├── apm.yml                  # this plugin's own manifest
    │   └── .apm/
    │       ├── skills/
    │       ├── prompts/
    │       └── instructions/
    └── pr-review/
        ├── apm.yml
        └── .apm/
            └── skills/
```

Each plugin gets its own `apm.yml` so it can be compiled, packed, and tested in isolation. The root `apm.yml` owns only the marketplace index.

### 6.3 How you'd scaffold it

```bash
mkdir agents-hub && cd agents-hub

# One plugin per subdirectory
mkdir -p packages/release-notes && (cd packages/release-notes && apm plugin init --yes)
mkdir -p packages/pr-review    && (cd packages/pr-review    && apm plugin init --yes)

# Marketplace at the root, pointing at local paths
apm marketplace init --owner <owner> --name agents-hub
apm marketplace package add ./packages/release-notes --name release-notes
apm marketplace package add ./packages/pr-review     --name pr-review
```

The resulting root `apm.yml`:

```yaml
marketplace:
  name: agents-hub
  owner: <owner>
  description: Agent plugins shipped together
  url: https://github.com/<owner>

  versioning:
    strategy: lockstep

  packages:
    - name: release-notes
      source: ./packages/release-notes
    - name: pr-review
      source: ./packages/pr-review
```

### 6.4 What changes versus what you built

| | Aggregator (Part 4) | Monorepo-hybrid |
|---|---|---|
| Package `source:` | `<owner>/some-repo` | `./packages/some-plugin` |
| Resolution at pack time | `git ls-remote` per entry | Local paths, **no remote resolution** |
| Versioning | Each repo tags independently | Usually `strategy: lockstep` — all plugins share one version |
| `apm pack` | Once, at the root | Per-plugin for bundles, plus once at the root for the index |
| Cross-plugin change | N PRs across N repos | One PR |

The trade-off is real: a monorepo makes coordinated changes easier but independent versioning more difficult. Separate repos do the opposite.

### 6.5 Consuming from a monorepo

Consumers can install a single plugin directly out of a subdirectory, no marketplace required:

```bash
apm install <owner>/agents-hub/packages/release-notes
```

The `owner/repo/sub/dir` reference form works for any git host APM supports.

:::tip Live reference
[**`DevExpGbb/zava-agent-config`**](https://github.com/DevExpGbb/zava-agent-config) is a production monorepo-hybrid: 7 plugins under `plugins/`, one root `apm.yml`, and releases automated with [`microsoft/apm-action@v1`](https://github.com/microsoft/apm-action) in `mode: release`.

Read [Repo shapes](https://microsoft.github.io/apm/producer/repo-shapes/) and [Versioning strategies](https://microsoft.github.io/apm/producer/versioning-strategies/) before committing to a layout — migrating later means moving directories and re-running the same commands, which is doable but noisy.
:::

---

## Wrap-Up

### What you built

- ✅ A **producer repo** shipping a skill, a prompt, and an instruction under `.apm/`
- ✅ A **marketplace repo** curating that plugin into a versioned, resolvable index
- ✅ A **consumer project** installing your package by name and running it in two harnesses
- ✅ A working mental model of the three repo shapes and when each applies

### The security model you got for free

Everything you ran had guardrails you never configured:

| Layer | What it does |
|-------|--------------|
| **Hidden-Unicode scan** | Every primitive is scanned before deploy. A zero-width character injected into a skill blocks the install for every consumer. |
| **Content hashing** | `apm.lock.yaml` pins a SHA-256 for every deployed file. Tampering is detected at install time. |
| **Bundle attestation** | `apm pack` records `pack.bundle_files`; `apm install` rehashes and rejects on mismatch, missing file, extra file, or symlink. |
| **Transitive MCP gating** | APM packages flow transitively, but **MCP servers do not**. Install pauses and requires you to re-declare them top-level unless you pass `--trust-transitive-mcp`. |
| **Policy inheritance** | `apm-policy.yml` is tighten-only from enterprise → org → repo. A repo cannot loosen what the org set. |

### Taking it to a real team

```bash
apm install --frozen     # CI: fail if apm.yml and apm.lock.yaml disagree
apm audit --ci           # CI: policy + security gate, exits non-zero on violation
apm marketplace check    # CI: fail before release if any package ref won't resolve
apm outdated             # Local: which dependencies have newer matching tags
apm update               # Local: move within your declared version ranges
apm doctor               # Local: diagnose environment problems
```

The `--frozen` flag is the one to wire up first. It is APM's equivalent of `npm ci` — it refuses to silently re-resolve, which is exactly what you want on a build agent.

### Challenge exercises

If you finished early, try these in order of difficulty:

1. **Ship v0.2.0.** Add a second prompt (`/summarize-prs`) to the producer repo, tag `v0.2.0`, push tags, then re-run `apm pack` in the marketplace repo. Watch `marketplace.json` resolve to the new tag with no edit to the version range.
2. **Break it on purpose.** Move your instruction from `.apm/instructions/` to a root-level `instructions/` directory. Run `apm pack --dry-run --verbose` and note it still packs. Then re-install as a consumer and watch it silently fail to appear.
3. **Convert to a monorepo.** Move `release-notes-plugin` into `packages/release-notes/` inside the marketplace repo, switch the package `source:` to a local path, and add `versioning: strategy: lockstep`.

### Further reading

| Topic | Link |
|-------|------|
| What APM is and why | [Concepts overview](https://microsoft.github.io/apm/concepts/what-is-apm/) |
| Full `apm.yml` schema | [Manifest schema](https://microsoft.github.io/apm/reference/manifest-schema/) |
| Consumer deep-dive | [Consumer ramp](https://microsoft.github.io/apm/consumer/) |
| Producer deep-dive | [Producer ramp](https://microsoft.github.io/apm/producer/) |
| Choosing a layout | [Repo shapes](https://microsoft.github.io/apm/producer/repo-shapes/) |
| Which primitive reaches which tool | [Targets matrix](https://microsoft.github.io/apm/reference/targets-matrix/) |
| Rolling out across an org | [Governance guide](https://microsoft.github.io/apm/enterprise/governance-guide/) |
| Automating releases | [`microsoft/apm-action`](https://github.com/microsoft/apm-action) |

APM builds on three open standards — [AGENTS.md](https://agents.md), [Agent Skills](https://agentskills.io), and [MCP](https://modelcontextprotocol.io). Nothing you authored in this lab is locked to APM; the package manager is what gives it versioning, provenance, and reach.
