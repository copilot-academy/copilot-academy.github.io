---
title: "Feature Development"
description: "Build a shopping cart feature using Planning Mode, Agent Mode, and Vision"
sidebar_position: 2
---

# Use Case 1: "I'm asked to add a new feature"

> **Scenario:** Your PM says: *"We need a shopping cart. Users should be able to add products, see a count in the nav bar, and view their cart on a dedicated page."*
>
> **Time:** ~30 minutes
>
> **Copilot Features:** Planning Agent, Agent Mode, Vision

**Your Challenge:** Build this feature end-to-end, matching a provided design.

## Step 1: Understand Requirements with Planning Agent

The **planning agent** exists to help build a plan and clarify requirements.  It improves the quality of your prompt and ultimately the output.  

1. Open Copilot Chat, switch to `Plan` mode
2. Drag `docs/design/cart.png` into chat (feel free to open it to review first)
3. Set your model to 'Claude Opus 4.6' or 'Gemini 3.1 Pro'
4. Prompt:
   ```text
   I need to implement a shopping cart feature in this application matching this image including routing, navbar badge with item count, state management, and add/remove interactions.
   ```
5. Copilot will ask clarifying questions like:
   - Should the cart persist across sessions?
   - What data should be stored?
   - Any constraints on UI/UX?
6. Answer the questions or say "Use standard e-commerce patterns"
7. Review the generated plan - iterate if needed

## Step 2: Implement with Agent Mode

1. Switch to `Agent` mode, select `Claude Sonnet 4.6` model
2. Prompt:
   ```text
   Implement the plan you just produced.
   ```
3. **Agent will:**
   - Create Cart component and page
   - Add routing
   - Implement state management (Context/Provider)
   - Add NavBar badge
   - Wire up add/remove functionality

You can follow along as files are created/modified and also in the task list.  If it doesn't run the application to verify it, you should ask the agent to 'start the application and verify the cart works as expected'. 

## Step 3: Test & Iterate

1. Run the application:
   ```bash
   npm run dev
   ```
2. Test in browser - Click on 'Ports' tab to open port 5137:
   - Go to the 'Products' page or click 'Explore Products'
   - Increment a quantity of a product and add to cart
   - Verify badge updates (shows a count next to the cart icon)
   - Click the cart icon to view cart page
3. If issues arise, have Copilot help troubleshoot.  Example prompt:
   ```text
   The badge doesn't update when I add items. Fix this.
   ```
4. When you are all done, click 'Keep' to save the changes.  

## What You Learned

✅ **Planning Agent** - Clarify ambiguous requirements  
✅ **Vision** - Copilot understands UI designs  
✅ **Agent Mode** - Multi-file implementation with iteration  
✅ **Self-correction** - Agent can fix its own mistakes

**Time Investment:** 30 minutes  
**Value:** A complete feature that would normally take 2-3 hours

## Next Steps

Continue to [Test Coverage](/workshops/immersive-experience/test_coverage) to learn how to improve test coverage with Copilot.
