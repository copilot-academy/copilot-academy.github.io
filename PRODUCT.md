# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

New GitHub.com users on Windows or macOS who need a clear, guided path through their first local GitHub Copilot setup.

## Product Purpose

Provide a standalone `/onboarding` guide that takes a user from prerequisites through installing and authenticating GitHub CLI, Copilot CLI, and the GitHub Copilot app. Success means the user can verify each tool, understand any organization-managed access constraints, and finish with a trustworthy record of their progress.

## Positioning

The guide combines operating-system-specific setup, verification, and recovery guidance in one sequence. It auto-detects Windows or macOS while preserving an explicit manual platform switch.

## Operating Context

Users move between this web guide, a terminal, GitHub.com authentication pages, and the GitHub Copilot app. Commands and external references must come from official product sources. The guide must avoid hard-coded release versions and asset filenames that become stale.

## Capabilities and Constraints

- The guide is a standalone `/onboarding` route.
- It supports Windows and macOS instructions.
- It auto-detects the operating system and always allows the user to switch platforms manually.
- Progress persists only in browser `localStorage`.
- Progress is not synced to GitHub or any other service.
- No progress telemetry is collected.
- Organization-managed Copilot access, policies, and installation restrictions can supersede the guide.
- Setup facts and links must use official sources.

## Brand Commitments

Extend the site's existing GitHub and Primer identity. Preserve established GitHub product names and terminology.

## Evidence on Hand

The canonical onboarding content is maintained in `src/data/copilotOnboarding.js`. There are no testimonials, completion analytics, or progress telemetry to present.

## Product Principles

1. Make the next action obvious and verifiable.
2. Keep platform guidance current without pinning transient versions.
3. Explain organization-managed restrictions without implying that users can bypass them.
4. Keep progress private to the current browser.
5. Prefer official product guidance over duplicated or speculative instructions.

## Accessibility & Inclusion

The complete flow must be usable by keyboard and screen-reader users. Platform selection, progress controls, instructions, command actions, verification, troubleshooting, and completion status must expose clear names, order, and state without relying on color or pointer interaction.
