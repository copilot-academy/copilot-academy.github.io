---
title: "End-to-End Tests"
description: "Add browser testing using MCP Playwright"
sidebar_position: 10
---

# Use Case 9: "I need end-to-end tests"

> **Scenario:** Your QA team wants automated browser tests for critical user flows.
>
> **Time:** ~15 minutes
>
> **Copilot Features:** MCP Playwright

**Your Challenge:** Generate and run Playwright tests using MCP integration.

Playwright is a popular end-to-end testing framework for web applications.  GitHub Copilot can integrate with Playwright via the Model Context Protocol (MCP) to generate and run tests based on natural language prompts.

## Step 1: Start Playwright MCP

1. Open Command Palette (Cmd/Ctrl + Shift + P)
2. Select **MCP: List Servers**
3. Select the Playwright server
4. Click **Start Server**

## Step 2: Generate Test Scenarios

Note this requires that you've already implemented a shopping cart feature (from Use Case 1).

1. In the chat window, clear history, switch to `Agent` mode, and select the `Claude Sonnet 4.6` model
2. Prompt:
   <div className="prompt-block">
   ```text
   Create a Playwright e2e feature file testing:
   1. User adds two products to cart
   2. Verifies cart badge shows "2"
   3. Opens cart page
   4. Verifies subtotal is correct
   5. Removes one item
   6. Verifies badge updates to "1"

   Consult playwright config for the appropriate directories and setup.
   ```
   </div>
3. Review the files created (feature file in Gherkin format and E2E test implementation)

## Step 3: Run Tests (Local Only)

1. Prompt:
   <div className="prompt-block">
   ```text
   Run these tests in headless mode and show me results
   ```
   </div>
2. You'll be prompted to install some dependencies for Chromium...
3. Agent executes tests using MCP and discusses results in chat

## What You Learned

✅ **MCP Integration** - Extend Copilot with external tools  
✅ **Browser Automation** - Generate E2E tests from natural language  
✅ **BDD Workflows** - Readable, maintainable test scenarios in Gherkin

**Time Investment:** 15 minutes  
**Value:** E2E tests without learning Playwright syntax

## Next Steps

Continue to [Spec-Driven Development](/workshops/immersive-experience/spec_driven_development) to learn how to build features from specifications.
