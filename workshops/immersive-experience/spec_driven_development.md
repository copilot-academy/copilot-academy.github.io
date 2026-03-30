---
title: "Spec-Driven Development"
description: "Build features from specifications using Spec Kit"
sidebar_position: 11
---

# Use Case 10: "I want to build from specs, not vibes"

> **Scenario:** Your team struggles with "vibe coding" - starting implementation before requirements are clear, leading to rework, scope creep, and features that don't align with business goals. Your PM wants a disciplined approach that maintains velocity while ensuring quality.
>
> **Time:** ~30 minutes
>
> **Copilot Features:** Spec Kit, Spec-Driven Development

**Your Challenge:** Adopt Specification-Driven Development (SDD) to transform requirements into implementation systematically, with specifications as executable artifacts that drive code generation.

## What is Spec-Driven Development?

Traditional development treats code as king - specifications are scaffolding you discard once coding begins. **Specification-Driven Development (SDD) inverts this**: specifications don't serve code, **code serves specifications**. The Product Requirements Document (PRD) isn't a guide - it's the source that generates implementation.

With AI, specifications can now be:
- **Executable** - Precise enough to generate working systems
- **Living** - Stay in sync with code because they generate it
- **Testable** - Include acceptance criteria that become automated tests
- **Traceable** - Every technical decision links back to requirements

**Spec Kit** is GitHub's open-source toolkit that provides templates, commands, and workflows to implement SDD systematically.

## Step 1: Install Spec Kit

1. Install the Specify CLI:
   ```bash
   # Prerequisites
   sudo apt update && sudo apt install -y python3-pip pipx
   pipx install uv && pipx ensurepath

   # Setup Specify CLI
   uv tool install specify-cli --from git+https://github.com/github/spec-kit.git

   specify check
   # This should say "Specify CLI is ready to use!"
   ```
   
2. Initialize your project:
   ```bash
   # Run this in the root of your repo - Say yes to continue with the risk of overwriting files
   specify init . --ai copilot --script sh

   # If you run into auth issues, try this:
   # `env -u GITHUB_TOKEN specify init . --ai copilot --script sh`
   ```
   
   This creates:
   - `.specify/` directory with templates and scripts
   - Command shortcuts (`/speckit.specify`, `/speckit.plan`, etc.)
   - Constitution template for project principles

## Step 2: Establish Project Constitution

The **constitution** is your project's immutable architectural DNA - the principles that govern every specification and implementation.

1. Clear your chat history, ensure you are on `Agent` mode with `Claude Sonnet 4.6`
2. Run the constitution command with the following prompt:
   ```text
   /speckit.constitution  Our OctoCAT Supply Chain application follows these principles:
   - Library-first architecture for maximum reusability
   - Test-driven development with contract tests before implementation
   - Integration tests over mocks (real SQLite database)
   - Simplicity over abstraction - use frameworks directly
   - REST API design with OpenAPI documentation
   - TypeScript for type safety
   - Minimal dependencies - evaluate before adding
   ```
3. Review the generated `.specify/memory/constitution.md`
4. When happy with it, click `Keep` to save changes
5. The constitution will now guide all subsequent specifications and plans

## Step 3: Create a Feature Specification

Let's add a **Purchase Order** feature using spec-driven development.

1. Run the specify command and provide the feature description:
   ```text
   /speckit.specify Create a Purchase Order management system. Buyers at branches can create purchase 
   orders to suppliers for products. Each PO contains multiple line items with 
   quantities and expected prices. Track PO status (Draft, Submitted, Approved, 
   Fulfilled, Cancelled). Suppliers receive notifications when POs are submitted. 
   Include approval workflow for POs over $10,000.
   ```
2. **Agent will:**
   - Scan existing specs to assign next feature number (e.g., `001-purchase-orders`)
   - Create a feature branch automatically
   - Generate `specs/001-purchase-orders/spec.md` with:
     - User stories
     - Functional requirements
     - Success criteria
     - Key entities
     - Assumptions section
   
4. Review the specification - notice it:
   - ✅ Focuses on **WHAT** and **WHY**, not **HOW**
   - ✅ Marks ambiguities with `[NEEDS CLARIFICATION]`
   - ✅ Defines testable acceptance criteria
   - ✅ Avoids implementation details (no tech stack mentions)

## Step 4: Clarify Requirements

Before planning implementation, use structured clarification to reduce downstream rework.

1. Run the clarify command:
   ```text
   /speckit.clarify
   ```
2. Agent will analyze the spec and ask targeted questions like:
   - "How should suppliers receive notifications?"
   - "What happens when an approver tries to approve their own purchase orders?"
   - "Should PO approvals support multi-level approval chains?"
   - "What happens to in-progress POs when a product is discontinued?"
   
3. Answer each question as you would in a requirements gathering session
4. Agent records clarifications directly in the spec's **Clarifications** section
5. This prevents scope creep and reduces "we should have asked that earlier" moments

## Step 5: Generate Implementation Plan

Now translate the business spec into a technical plan with your chosen architecture.

1. Run the plan command with your technical requirements:
   ```text
   /speckit.plan  Technology Stack:
   - TypeScript with Express.js for REST API
   - SQLite database with repository pattern
   - React frontend with TypeScript
   - OpenAPI/Swagger for API documentation
   - Nodemailer for email notifications (stub for now)
   - Vitest for unit tests, Playwright for E2E tests
   
   Architecture:
   - Repository layer for data access
   - Service layer for business logic (approval workflow, notifications)
   - REST API following existing patterns in codebase
   - React Context for state management
   - Responsive UI matching existing design system
   ```

3. **Agent will generate multiple artifacts**:
   - `specs/004-purchase-orders/plan.md` - High-level implementation plan
   - `specs/004-purchase-orders/research.md` - Technology evaluation and tradeoffs
   - `specs/004-purchase-orders/data-model.md` - Database schema and relationships
   - `specs/004-purchase-orders/contracts/` - API endpoint specifications
   - `specs/004-purchase-orders/quickstart.md` - Key validation scenarios
   
4. Review the plan - notice:
   - Every technical decision references a requirement
   - Constitutional compliance checks (simplicity gates, test-first, etc.)
   - Phase breakdown with clear deliverables
   - Complexity tracking for any deviations from principles

## Step 6: Generate Task Breakdown

Convert the implementation plan into actionable, executable tasks.

1. Run the tasks command:
   ```text
   /speckit.tasks
   ```
2. Agent analyzes the plan and creates `specs/004-purchase-orders/tasks.md` with:
   - Database migration tasks (schema, indexes, foreign keys)
   - Repository layer tasks (CRUD operations per entity)
   - API endpoint tasks (one per contract)
   - Frontend component tasks (PO list, form, approval UI)
   - Test tasks (contract tests first, then integration, then E2E)
   - Parallel execution markers `[P]` for independent tasks
   
3. Tasks are organized in dependency order:
   ```markdown
   ### Phase 1: Foundation [P]
   - [P] Create purchase_orders table migration
   - [P] Create purchase_order_items table migration
   - [P] Create purchase_order_approval_logs table
   
   ### Phase 2: Repository Layer
   - [ ] Implement PurchaseOrdersRepository (depends on Phase 1)
   - [P] Implement PurchaseOrderItemsRepository (depends on Phase 1)
   ```

## Step 7: Implement with Agent

Now execute the implementation plan.

1. Run the implement command:
   ```text
   /speckit.implement
   ```
2. **Agent will:**
   - Validate all prerequisites (constitution, spec, plan, tasks exist)
   - Execute tasks in dependency order
   - Follow TDD: write tests first, confirm they fail, then implement
   - Run builds and tests after each task
   - Track progress and handle errors
   - Provide regular status updates

3. Monitor in real-time as agent:
   - Creates SQL migrations
   - Implements repository classes
   - Builds REST API endpoints
   - Generates OpenAPI documentation
   - Creates React components
   - Writes comprehensive tests at each layer

## Step 8: Verify and Iterate

1. Once implementation completes, test the feature:
   ```bash
   make build
   make test
   make dev
   ```
2. Test in the browser:
   - Navigate to the new Purchase Orders page
   - Create a PO with multiple line items
   - Submit for approval
   - Verify approval workflow for high-value POs
   
3. If issues arise, provide feedback to agent.  For example:
   ```text
   The approval notification isn't triggering. 
   Fix the notification service and add integration tests.
   ```
4. Agent will update the implementation and re-run tests

## Step 9: Specification Evolution

When requirements change (and they will), update specifications first.

**Scenario:** PM says *"We need to support partial fulfillment - suppliers can fulfill line items incrementally."*

1. Update the spec:
   ```text
   /speckit.specify
   
   Update the Purchase Order spec to support partial fulfillment:
   - Line items can be fulfilled in multiple shipments
   - Track fulfillment history per line item
   - PO status is "Partially Fulfilled" until all items complete
   - Add GET /api/purchase-orders/:id/fulfillment-history endpoint
   ```
2. Regenerate the plan:
   ```text
   /speckit.plan
   ```
3. Regenerate tasks:
   ```text
   /speckit.tasks
   ```
4. Implement changes:
   ```text
   /speckit.implement
   ```

The specification drives evolution. Code is regenerated from updated specs, not manually patched.

## What You Learned

✅ **Specification-First Thinking** - Requirements before code, every time  
✅ **Executable Specifications** - Specs precise enough to generate working systems  
✅ **Constitutional Governance** - Immutable principles ensure architectural consistency  
✅ **Structured Clarification** - Reduce rework by asking the right questions upfront  
✅ **Traceability** - Every technical decision links to a requirement  
✅ **Test-First Automation** - Tests written before implementation, built into workflow  
✅ **Systematic Evolution** - Changes start with specs, code regenerates

### Benefits of SDD

| Traditional Development | Spec-Driven Development |
|------------------------|------------------------|
| Code is truth, specs drift | Specs are truth, code is generated |
| "Just start coding" | "Let's clarify first" |
| Manual coordination across files | Automated multi-file implementation |
| Requirements changes = painful rewrites | Requirements changes = regeneration |
| Tests written after (maybe) | Tests mandated before implementation |
| Tribal knowledge | Documented, traceable decisions |
| 2-3 hours to spec a feature | 15 minutes with `/speckit.*` commands |

### When to Use SDD

**Great for:**
- ✅ New features with complex requirements
- ✅ Cross-cutting changes affecting multiple files
- ✅ Features requiring coordination across team members
- ✅ Projects with compliance/audit requirements
- ✅ When requirements are likely to evolve

**Less valuable for:**
- ❌ Trivial bug fixes
- ❌ One-file changes with clear scope
- ❌ Prototypes meant to be thrown away
- ❌ Emergency hotfixes

**Time Investment:** 30 minutes (+ agent implementation time)  
**Value:** Reduced rework, living documentation, systematic quality, faster pivots

## Next Steps

Continue to [Governance with Hooks](/workshops/immersive-experience/governance_hooks) to learn about triggering commands on agent events.
