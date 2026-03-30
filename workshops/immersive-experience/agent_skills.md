---
title: "Agent Skills"
description: "Customize Copilot with reusable skills for complex workflows"
sidebar_position: 9
---

# Use Case 8: "Customize Copilot with skills"

> **Scenario:** Generating API endpoints is a workflow that involves multiple steps and Copilot doesn't consistently handle all aspects to our standards. You want to automate this workflow to save time.
>
> **Time:** ~15 minutes
>
> **Copilot Features:** Agent Skills

**Your Challenge:** Use a skill to implement a new API endpoint with a single prompt.

## What are Skills?

Agent Skills are folders of instructions, scripts, and resources that GitHub Copilot can load when relevant to perform specialized tasks. Skills are an [open standard](https://agentskills.io/) that works across multiple AI agents, including GitHub Copilot in VS Code, GitHub Copilot CLI, and GitHub Copilot coding agent.

**Key benefits of Agent Skills:**

- **Specialize Copilot**: Tailor capabilities for domain-specific tasks without repeating context
- **Reduce repetition**: Create once, use automatically across all conversations
- **Compose capabilities**: Combine multiple skills to build complex workflows
- **Efficient loading**: Optimize your context window by only loading relevant content when needed

**Comparing Customization Options:**

- **Custom Instructions**: Apply universally to all interactions, ideal for broad guidelines and standards. However, they lack the ability to execute scripts or provide structured resources.
- **Prompt Files**: Reusable templates for specific tasks, but require manual invocation and don't support dynamic execution or structured resources.
- **Agent Skills**: Automatically load based on context, can include executable scripts and structured resources, ideal for complex workflows that require multiple steps or specialized knowledge.
- **MCP Servers:** Extend capabilities with external tools and APIs, but require separate setup and management outside of Copilot's native environment.

### Skill Structure

Skills are defined in `.github/skills/` or `.claude/skills/` directories and contain:
- `SKILL.md` - The skill definition with YAML frontmatter (name, description) and detailed instructions
- Additional resources - Scripts, examples, templates, and reference documentation

## Step 1: Explore the `api-endpoint` Skill

1. Navigate to `.github/skills/api-endpoint/`
2. Open `SKILL.md` to review the skill definition and instructions
  - Note the YAML frontmatter is the ONLY thing loaded into context.  When the skill is triggered, Copilot will fetch the markdown and pull in any scripts, templates, or resources as needed based on the instructions.  This keeps the context window efficient and focused on the task at hand.
3. Open the `references` folder to see the examples provided to Copilot to learn from when executing the skill.

## Step 2: Generate the DeliveryVehicle Entity

1. Open Copilot Chat and switch to **Agent** mode.  Select `Claude Opus 4.6`. 
2. Enter the following prompt:
   ```txt
   Add a new API endpoint for a new Entity called 'DeliveryVehicle'. Vehicles belong to branches.
   ```
3. Watch as Copilot:
   - Analyzes the existing codebase structure
   - References the `api-endpoint` skill automatically
   - Generates all required components following the established patterns:
     - **Model**: Generates the model using conventions
     - **Repository**: Generates the Repository with CRUD operations
     - **Routes**: Generates the route with full REST endpoints
     - **Migration**: Creates db migrations
     - **Seed Data**: Creates seed data
     - **Tests**: Creates and runs unit tests for the new endpoint

4. Review the generated code and note how it follows all the patterns and standards defined in the skill:
   - **Naming Conventions**: Follows naming conventions for entities/methods
   - **Foreign Key Relationship**: The `branchId` field linking to the `branches` table
   - **API Documentation**: Complete OpenAPI annotations for all endpoints
   - **Error Handling**: Consistent use of custom errors
   - **SQL Utilities**: Using specified utils
   - **Unit Tests**: Created and verified unit tests

5. (Optional) Verify the implementation
   ```bash
   make build-api             # Build the API
   make test                  # Run unit tests
   make run-api               # Start the API server    
   # Open the Swagger UI at `http://localhost:3000/api-docs` and show the new DeliveryVehicle endpoints
   ```

## What You Learned

✅ **Skills** - Encode your team's patterns and conventions, enabling consistent implementation and making them accessible to all developers and AI  

**Time Investment:** 15 minutes  
**Value:** Faster development of new features, consistent code quality, and a way to capture and share institutional knowledge

## Next Steps

Continue to [End-to-End Tests](/workshops/immersive-experience/end_to_end_tests) to learn how to add browser testing with MCP Playwright.
