---
title: "Security"
description: "Shift security left with /security-review, then fix vulnerabilities faster with Code Quality, CodeQL, and Secret Scanning"
sidebar_position: 7
---

# Use Case 6: "Security keeps finding issues"

> **Scenario:** Your security team reports: *"We found 12 CodeQL alerts, 3 leaked secrets, and 47 code quality issues."*
>
> **Time:** ~25 minutes
>
> **Copilot Features:** Copilot security review (public preview), Code Quality, CodeQL, Secret Scanning

**Your Challenge:** Catch issues before they reach a pull request, then triage and fix the rest systematically using AI assistance.

## Step 1: Review Your Changes Before You Open a PR

The fastest security fix is the one you make before anyone else sees the code. Copilot's `/security-review` command (**public preview**) runs an AI-driven review of your in-flight changes right in your session — no PR, no CI run, no waiting.

1. Make sure your working tree contains **uncommitted changes**. `/security-review` reviews the working-tree diff; a committed change is not included merely because it has not been pushed. If your tree is clean, modify earlier exercise code or introduce a deliberate issue such as building a SQL query with string concatenation from a request parameter.
2. In an active GitHub Copilot app session or GitHub Copilot CLI session, run:

   ```text
   /security-review
   ```

3. Copilot analyzes your changed code and reports findings with a severity and confidence rating, plus a suggested remediation for each.
4. Pick one high-confidence finding and ask Copilot to fix it:

   ```text
   Fix the highest severity finding from the security review and explain what changed.
   ```

5. Re-run `/security-review` to confirm the finding is resolved.

**How this fits with the rest of your security tooling.** `/security-review` is an additional, early layer — it does not replace the platform scanning you configure in the following steps:

| Layer | Scope | When it runs | Best at |
| --- | --- | --- | --- |
| `/security-review` | Your current changes | On demand, in your session | Fast feedback on in-flight code, before a PR exists |
| CodeQL code scanning | Whole repository | CI, on push and PR | Deep dataflow/taint analysis, merge gates, audit trail |
| Code Quality | Whole repository | CI, on push and PR | Maintainability and reliability findings |
| Secret scanning | Whole repository and history | Continuously | Detecting and validating leaked credentials |
| Security campaigns | Existing alert backlog | Planned remediation | Fixing similar alerts in bulk |

Findings from `/security-review` are not written to your repository's security alerts, and it is not a compliance gate. Treat it as a shift-left safety net that reduces how much CodeQL, Code Quality, and secret scanning have to catch later.

## Step 2: Enable Code Quality

1. In the repository settings, open **Security and quality → Advanced Security**
2. Click **Enable Code Quality**
3. Wait for initial scan (this takes a few minutes)

Code Quality uses CodeQL and AI to identify maintainability issues in your codebase.  Similar to other agents, it will also use GitHub Actions to run scans.  You can see the initial run under **Actions → CodeQL** with the initial job being `Code Quality: CodeQL Setup`.

## Step 3: Review and Fix Code Quality Issues

1. Open the repository's **Code Quality** findings
2. Select the `Inconsistent direction of for loop`.  
3. Click **Show more** just above the 2 findings to get more details
4. Click **Generate fix** on both findings.  Copilot will take around 30 seconds to provide a fix
5. Review the AI-generated fix (in the diff view)
6. Click **Open pull request** and commit the change to apply

Code Quality and its **Generate fix** action roll out per organization, so the exact options you see depend on what is enabled for your account. If **Generate fix** isn't available in your environment, read through the finding details and move on — the triage workflow is the takeaway, and you already practiced AI-assisted remediation in Step 1.

## Step 4: Handle Secret Scanning with Extended Metadata

Your organization must have **GitHub Secret Protection** enabled for this feature.

1. Navigate to the repository's **Settings → Security and quality → Advanced Security**
2. Verify that GitHub Secret Protection is enabled
3. Click **Enable** for `Extended metadata`
4. Open the repository's secret scanning alerts
5. Click **Verify Secret**
6. Enable **Extended Metadata** from settings link
7. Return to alert - now see:
   - **Validity status** (is it still active?)
   - **Organization name**
   - **Owner name**
   - Direct contact info for rotation

## Step 5: Assign CodeQL Alerts to the Copilot Cloud Agent

1. Open the repository's code scanning alerts
2. Find "Database query built from user-controlled sources"
3. Click **Generate fix**.  Again this takes 15-30 seconds
4. Review the proposed fix
5. Under `Assignees` on the right side menu, Click the gear and assign to Copilot
6. Track the resulting pull request in the app's **My Work** view. Mission Control remains available as a browser alternative.
7. The Copilot cloud agent will:
   - Open a PR 
   - Analyze the vulnerability
   - Generate a fix
   - Test the fix

## Step 6: Bulk Fix with Security Campaigns (Optional)

This step is for awareness.  Please don't execute it!  There is a limit of 10 active security campaigns in an organization and more people doing this workshop!  However, here is how you remediate at scale.  Identify and filter by similar alerts:

1. Create a **Security Campaign** from code scanning filters
2. Generate autofixes for all applicable alerts
3. **Bulk assign to Copilot**
4. Monitor the resulting fixes from **My Work** in the GitHub Copilot app or from Mission Control on the web

## What You Learned

✅ **Copilot security review** - Catch issues in your changes before a PR exists (public preview)
✅ **Code Quality** - AI-powered maintainability scanning  
✅ **Extended Secret Metadata** - Context for faster remediation  
✅ **CodeQL + Copilot cloud agent** - Automatic vulnerability fixes
✅ **Security Campaigns** - Bulk remediation workflows

**Time Investment:** 25 minutes
**Value:** Systematic security improvements, not whack-a-mole

## Next Steps

Continue to [Legacy Code](/workshops/immersive-experience/legacy_code) to learn how to understand and refactor inherited code.
