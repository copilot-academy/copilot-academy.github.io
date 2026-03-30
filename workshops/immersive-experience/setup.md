---
title: Setup
description: Prepare your environment for the GitHub Copilot Immersive Experience
sidebar_position: 1
---

# Setup

> **Time:** ~10 minutes

## Prerequisites

- GitHub account with Copilot enabled
- **Option A:** GitHub Codespace (recommended for consistency)
- **Option B:** Local machine with Node.js 18+, Git, VS Code

## Quick Start

1. **Fork or clone the demo repository**
   ```bash
   git clone <repo-url> demo_copilot_agent
   cd demo_copilot_agent
   make install
   ```

2. **Verify the build**
   ```bash
   make build
   ```

3. **Initialize the database**
   ```bash
   make db-init
   ```

4. **If using Codespaces:** Make ports 3000 and 5137 **Public**
   - Click on the `Ports` tab in the bottom panel, right click on a port and select `Port Visibility → Public`

## Next Steps

Once your environment is ready, proceed to [Feature Development](/workshops/immersive-experience/feature_development) to start building with Copilot.
