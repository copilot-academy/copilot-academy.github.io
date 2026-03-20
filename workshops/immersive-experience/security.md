---
title: "Security"
description: "Fix vulnerabilities faster with Code Quality, CodeQL, and Secret Scanning"
sidebar_position: 7
---

# Use Case 6: "Security keeps finding issues"

> **Scenario:** Your security team reports: *"We found 12 CodeQL alerts, 3 leaked secrets, and 47 code quality issues."*
>
> **Time:** ~20 minutes
>
> **Copilot Features:** Code Quality, CodeQL, Secret Scanning

**Your Challenge:** Triage and fix systematically using AI assistance.

## Step 1: Enable Code Quality

1. Go to **Settings → Code Quality**
2. Click **Enable Code Quality**
3. Wait for initial scan (this takes a few minutes)

Code Quality uses CodeQL and AI to identify maintainability issues in your codebase.  Similar to other agents, it will also use GitHub Actions to run scans.  You can see the initial run under **Actions → CodeQL** with the initial job being `Code Quality: CodeQL Setup`.

## Step 2: Review and Fix Code Quality Issues

1. Navigate to **Security → Code Quality → Standard findings**
2. Select the `Inconsistent direction of for loop`.  
3. Click **Show more** just above the 2 findings to get more details
4. Click **Generate fix** on both findings.  Copilot will take around 30 seconds to provide a fix
5. Review the AI-generated fix (in the diff view)
6. Click **Open pull request** and commit the change to apply

Note - This doesn't work in this demo environment.  This may still be in private preview and not enabled here.  The steps are left here for future reference.

## Step 3: Handle Secret Scanning with Extended Metadata

Note your organization must have GitHub Advanced Security enabled for this feature. 

1. Navigate to the repository's **Settings → Advanced Security**
2. Verify that GitHub Advanced Security and Secret Protection are enabled
3. Click **Enable** for `Extended metadata`
4. Go to **Security → Secret scanning → Default** and 
5. Click **Verify Secret**
6. Enable **Extended Metadata** from settings link
7. Return to alert - now see:
   - **Validity status** (is it still active?)
   - **Organization name**
   - **Owner name**
   - Direct contact info for rotation

## Step 4: Assign CodeQL Alerts to Coding Agent

1. Navigate to **Security → Code scanning**
2. Find "Database query built from user-controlled sources"
3. Click **Generate fix**.  Again this takes 15-30 seconds
4. Review the proposed fix
4. Under `Assignees` on the right side menu, Click the gear and assign to Copilot
5. You can track progress in [Mission Control](https://github.com/copilot/agents)
6. The autofix agent will:
   - Open a PR 
   - Analyze the vulnerability
   - Generate a fix
   - Test the fix

## Step 5: Bulk Fix with Security Campaigns (Optional)

This step is for awareness.  Please don't execute it!  There is a limit of 10 active security campaigns in an organization and more people doing this workshop!  However, here is how you remediate at scale.  Identify and filter by similar alerts:

1. Create a **Security Campaign** from code scanning filters
2. Generate autofixes for all applicable alerts
3. **Bulk assign to Copilot**
4. Monitor all fixes from [Mission Control](https://github.com/copilot/agents)

## What You Learned

✅ **Code Quality** - AI-powered maintainability scanning  
✅ **Extended Secret Metadata** - Context for faster remediation  
✅ **CodeQL + Coding Agent** - Automatic vulnerability fixes  
✅ **Security Campaigns** - Bulk remediation workflows

**Time Investment:** 20 minutes  
**Value:** Systematic security improvements, not whack-a-mole

## Next Steps

Continue to [Legacy Code](/workshops/immersive-experience/legacy_code) to learn how to understand and refactor inherited code.
