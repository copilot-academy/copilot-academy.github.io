---
title: "Legacy Code"
description: "Understand and refactor inherited code with Ask Mode, Inline Chat, and Agent Refactoring"
sidebar_position: 8
---

# Use Case 7: "I inherited legacy code I don't understand"

> **Scenario:** You've been assigned to maintain a 3-year-old module. The original developer left. The code works but is poorly documented and uses unfamiliar patterns.
>
> **Time:** ~20 minutes
>
> **Copilot Features:** Ask Mode, Inline Chat, Agent Refactoring

**Your Challenge:** Understand the code, document it, and refactor safely without breaking functionality.

## Step 1: Understand with Ask Mode

1. Open a complex file (e.g., `api/src/repositories/suppliersRepo.ts`)
2. Select a confusing function
3. Use **Inline Chat** (Cmd/Ctrl + I):
   <div className="prompt-block">
   ```text
   Explain what this function does, including edge cases and error handling
   ```
   </div>
4. Close the inline chat
5. Move to the chat window, clear your history, and provide broader context in **Ask Mode**:
   <div className="prompt-block">
   ```text
   @workspace Explain the repository pattern used in this codebase. 
   How does it handle database connections and error mapping?
   ```
   </div>

## Step 2: Add Documentation

1. Switch to `Agent` mode
2. Prompt:
   <div className="prompt-block">
   ```text
   Add comprehensive JSDoc comments to all functions in suppliersRepo.ts.
   Include parameter descriptions, return types, and example usage.
   ```
   </div>
3. Agent will add structured documentation.  Review changes and keep one by one in the editor or keep all at once in the chat window.  

## Step 3: Refactor with Test Guardrails

1. First, ensure tests exist:
   <div className="prompt-block">
   ```text
   Review suppliersRepo.test.ts. Are there any missing test cases for edge conditions?
   ```
   </div>
2. If coverage gaps exist:
   <div className="prompt-block">
   ```text
   Add tests for error scenarios: database connection failures, 
   invalid IDs, constraint violations.
   ```
   </div>
3. Now safely refactor:
   <div className="prompt-block">
   ```text
   Refactor suppliersRepo.ts for better readability:
   - Extract complex conditionals into named functions
   - Reduce nested callbacks
   - Add type safety where any types are used
   
   Run tests after each change to ensure no breaking changes.
   ```
   </div>

## Step 4: Generate Architecture Documentation

1. Prompt:
   <div className="prompt-block">
   ```text
   Create a Mermaid diagram showing the data flow from 
   API route → repository → database for the suppliers module.
   Save it in docs/architecture-suppliers.md
   ```
   </div>
2. Open and review the file that was created
3. Note you can render the markdown and diagram by right-clicking the filename in the top tab and selecting **"Open Preview"**

## Step 5: Document Database Schema

1. Prompt:
   <div className="prompt-block">
   ```text
   Analyze the SQL migrations in api/sql/migrations/ and create 
   an ERD (Entity Relationship Diagram) in Mermaid format.
   Include all tables, relationships, and cardinality.
   
   Save to docs/database-schema.md
   ```
   </div>

## Step 6: Create Developer Onboarding Guide

1. Prompt:
   <div className="prompt-block">
   ```text
   Create docs/ONBOARDING.md with:
   - Prerequisites and setup
   - Architecture overview
   - How to run tests
   - How to add a new API endpoint (step-by-step)
   - Common troubleshooting issues
   - Link to all other documentation
   ```
   </div>

Copilot is great at reviewing code and generating documentation.  Keep in mind you could always assign this type of task to Coding Agent if you wanted to delegate it.

## What You Learned

✅ **Ask Mode** - Understand complex code without reading line-by-line  
✅ **Inline Chat** - Quick explanations without leaving your file  
✅ **Agent Refactoring** - Safe improvements with test guardrails  
✅ **Documentation Generation** - Diagrams and docs from code

**Time Investment:** 20 minutes  
**Value:** Hours of code reading condensed, safer refactoring, permanent documentation

## Next Steps

Continue to [Agent Skills](/workshops/immersive-experience/agent_skills) to learn how to customize Copilot with reusable skills.
