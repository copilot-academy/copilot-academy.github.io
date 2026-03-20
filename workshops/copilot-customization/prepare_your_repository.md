---
title: Preparing a Repository for AI Agents
description: Making repositories machine-readable so AI agents can effectively read, reason about, and modify code
sidebar_position: 2
---

# Preparing a Repository for AI Agents

Most teams try AI agents on repositories that were never structured for machine consumption. This often leads to poor results and the mistaken belief that "agents don't work."

If AI agents will read, modify, and reason about your repository, it should be prepared like a **machine‑readable development environment**, not just a human one.  Luckily, the information AI needs is similar to that which humans need!  

## 1. Project Orientation

Agents struggle most with **initial context acquisition**.  Help the Agent Understand the project by making it easy for the agent to answer:

-   What is this project?
-   How do I build it?
-   How do I run tests?
-   What are the important components?

### Recommended files

#### Clear README

Include:

-   Project purpose
-   Architecture summary
-   Build steps
-   Test steps
-   Repository layout

#### Architecture documentation

Example:

    ```text
    /docs/architecture.md
    /docs/components.md
    /docs/system-overview.md
    ```

Include:

-   System diagram
-   Key modules
-   Important dependencies
-   Runtime flow

## 2. Repository Structure

Agents (and people) perform best when code organization is predictable.

### Example structure

    ```text
    /src
    /tests
    /docs
    /scripts
    /tools
    /examples
    ```

Avoid unclear folders like:

    ```text
    /misc
    /stuff
    /temp
    ```

Clear structure improves:

-   Code discovery
-   Dependency reasoning
-   Tool selection

## 3. Keep Documentation in repo in markdown - Reduce Hidden Knowlege

Provide Machine‑Readable Development Instructions.  Agents shouldn't have to guess how to work with code.  Having access to your documentation allows an agent to gain knowledge as it works.  

An alternative is to connect an agent to a document source via API or MCP server.  This still requires extra steps for an agent versus just inspecting the workspace.  

**Examples:**

### Build instructions

Example:

    ```text
    /docs/build.md
    ```

Include:

-   Dependencies
-   Commands
-   Environment variables

### Test instructions

Example:

    ```text
    /docs/testing.md
    ```

Include:

-   How to run all tests
-   How to run a single test
-   How to generate coverage

### Contribution instructions

Example:

    ```text
    CONTRIBUTING.md
    ```

Include:

-   Coding standards
-   Branch strategy
-   Pull request expectations

### Architecture Decision Records (ADRs)

Agents are dramatically more effective when repositories include **decision records** that explain **why** systems were built a certain way. This helps agents avoid making incorrect "improvements" that conflict with intentional design choices.

Example:

    ```text
    /docs/adr/
    ```

Agents cannot access tribal knowledge.  The more explicit the repository is, the better agents will preform.  Consider also documenting things like: 

-   Architectural constraints
-   Performance requirements
-   Deployment quirks
-   Dependency decisions

## 5. Clear workflow steps - Not complex commands

Agents perform better when actions are **scriptable** rather than inferred.  Avoid forcing agents to guess complex commands.  Also ensure this content is captured in documentation. 

Prefer:

```bash
make build
make test
make lint
make format

Or:

```bash
npm run build
npm run test
npm run lint
```

## 6. Ensure High Test Coverage

Verification is key to agent success.  If an agent doesn't have the tools to validate its changes and confirm the remainder of the application is functional, **YOU** will be the one validating the changes and application.  Don't make yourself do that!!  Make AI do that! 

Strong test suites provide:

-   Safety
-   Feedback loops
-   Confidence in automated changes

Repositories with weak or brittle tests are much harder for agents to work with.

## 7. Ensure Automated CI 

Agents work best with fast feedback and rapid validation.  Use CI to automatically run: 

-   Tests
-   Linting
-   Security scans
-   Formatting

This creates a tight improvement loop.  And it means you can include in prompts that success criteria includes running these and remediating any new issues. 

## 8. Add Linting and Formatting

Linting tools help agents produce compliant code automatically.  If you are already using these, start getting your agents to use them too!  Agents will quickly adapt to these patterns.  If you are not using them, look to begin as it will improve agent responses. 

Examples:

-   Prettier
-   ESLint
-   Black
-   Ruff
-   clang-format

## 9. Enable Automatic Code Reviews with GitHub Copilot

Enabling AI-assisted code reviews helps reinforce repository standards and provides automated feedback on agent-generated code. While this can be done manually by assigning Copilot as a reviewer on a pull request, it is better to guarantee a review and not waste time requesting.  

This can be done at a user level, single repository level, or at an organization level.  It is ideal to set it once at an organization level and be done.  Documentation is available [here](https://docs.github.com/en/enterprise-cloud@latest/copilot/how-tos/use-copilot-agents/request-a-code-review/configure-automatic-review).  

Benefits of this include:

- Immediate feedback on agent changes 
- Improved code quality
- Reduces burden on human reviewers
- Encourages better pull requests

It is worth noting it is expected you are already following typical best practices such as requiring a pull request, requiring reviewers, requiring checks to pass, ...

It is possible to request a pull request directly in your development environment.  See this [documentation](https://docs.github.com/en/enterprise-cloud@latest/copilot/how-tos/use-copilot-agents/request-a-code-review/use-code-review) with a selector at the top for each surface supported.  For CLI, you can just use `/review`.

## 10. Custom Instructions

Now is a good time to add custom instructions.  GitHub Copilot knows nothing about your codebase at the start of every session.  Consider it a developer that you just onboarded.  They know how to code.  But no nothing about your specific project, processes, or standards.  Custom instructions are sent with every chat interaction and provide a powerful way to offer that guidance.  Examples: 

* What is the purpose of this project? 
* What is the tech stack and architecture? 
* How should I work on this project?  How to build and test?  
* What coding standards should I follow?

You can ask Copilot to create an initial `.github/copilot-instructions.md`.  There is a button in the top of that chat window in VSCode where you can 'Generate Instructions'. In the Copilot CLI you can type `/init`.  That may be a starting point, but this will only find content that is easily discoverable and may not provide value.  Expirement with this to see what the agent already knows, but do consider reducing information that is obvious.  Also, look in the [awesome-copilot repo](https://github.com/github/awesome-copilot/tree/main/instructions) for examples to get started.

You will likely need to add your own information and guidance to ensure the best results. This is an iterative process — you can continue to refine and improve these instructions over time as you learn what information is most helpful for your agents. 

### Key things to include

* **Project overview:** A brief description of the project, its purpose, and its main components.
* **Tech stack:** The programming languages, frameworks, and tools used in the project.
* **Coding standards:** Any specific coding conventions, style guides, or best practices that should be
followed when contributing to the project.
* **Explain the project structure:** A high-level overview of the repository structure and where to find important files and components.
* **Point to available resources:** Links to documentation, build instructions, MCP servers, skills, and other resources that provide context or support for the project.
* **Build and test instructions:** Clear steps for how to build the project and run tests.


It doesn't need to be perfect.  Just start with the basics and iterate from there.  You can always add more information as you see where the gaps are.  The important thing is to get something in place that helps guide the agent in the right direction.

### Guidance for writing effective custom instructions:

* **Less is more:** These instructions take up context on every interaction. Be concise and focus on the most critical information. No longer than 200-300 lines!
* **Progressive disclosure:** Instead of including every detail upfront, link to other documentation in the repo.  For example, instead of including detailed build instructions, you can include a line like "Refer to /docs/build.md for build instructions".  This allows you to provide detailed guidance without consuming context if the agent doesn't need to build.
* **Use Path Specific Instructions where appropriate:** For example, a path of `**/tests/*.spec.ts` with instructios specific to writing playwright tests.  This allows you to provide targeted guidance without consuming context for other interactions where that guidance isn't relevant.
* **Use the right tool for the job:** If you want to enforce coding standards, an LLM with guidelines can help.  However, linters are purpose built for this. Hooks or CI rules could be used for automated enforcement. This doesn't mean you can't include them in your instructions, but don't expect pages of instructions to be as effective as a well configured linter. 
* **Be specific:** Provide clear and actionable guidance that the agent can follow. Avoid vague or ambiguous instructions.
* **Focus on non-obvious information:** Don't waste valuable context on information that is easily discoverable or obvious.  Focus on the things that are unique to your project and not easily learned through code inspection.
* **Iterate:** When you see Copilot making mistakes or missing important context, update your instructions to address those gaps.  Over time, you can build a robust set of instructions that significantly improve agent performance.

Every repository should have custom instructions.  This is a critical part of preparing your repository for agents.  It provides the necessary context and guidance to help agents understand how to work with your codebase effectively.  Don't skip this step!

## 11. Implement in small, well-scoped tasks

Agents work best with **well‑scoped tasks**.

- Good example: `Add validation to email field in user service`
- Bad example: `Improve authentication system`

The clearer the task, the more reliable the agent.  This isn't necessarily related to preparing your repository, but more a word of wisdom once you have completed the steps above.  

## Wrapping Up

Ultimately, preparing a repository for agents is an exercise in **context engineering**.  The goal is to make the repository self-describing so an automated system can understand how the project works, how changes should be made, and how those changes should be validated.  

An **agent-ready repository** clearly communicates: 

* How the project is structured
* How the software is built and tested
* What standards and conventions must be followed
* Where important architectural boundaries exist
* How changes are verified and validated

When this information is explicit, documented, and scriptable, agents can reliably navigate the codebase and contribute meaningful changes.  In practice, this means the repository should minimize hidden knowledge and maximize machine-readable guidance and automated validation.
