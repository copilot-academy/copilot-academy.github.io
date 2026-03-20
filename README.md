# GitHub Copilot Workshops

[![Deploy to GitHub Pages](https://github.com/copilot-academy/copilot-academy/actions/workflows/deploy.yml/badge.svg)](https://github.com/copilot-academy/copilot-academy/actions/workflows/deploy.yml)

A collection of self-paced workshops and hands-on labs for understanding and leveraging GitHub Copilot's customization capabilities — from basic instructions to advanced agentic workflows.

**Live site:** https://copilot-academy.github.io/

## Workshops

* Copilot Customization - A comprehensive workshop on customizing GitHub Copilot with instructions, prompts, agents, and skills.
* Immersive Experience - A scenario-based workshop where you tackle real development problems using Planning Mode, Agent Mode, custom agents, security tools, and more.

## Standalone Labs

These are a collection of focused, self-contained exercises . Each lab covers a single topic and can be done independently.

Note these are currently in development — check back soon for content!


## Project Structure

```
workshops/              # Full workshop content
  copilot-customization/  # Copilot Customization workshop modules
labs/                   # Standalone hands-on labs
sidebars/               # Per-workshop and labs sidebar configs
src/
  components/           # React components (Video, etc.)
  css/                  # Custom styles (GitHub Primer theme)
  pages/                # Landing page
static/                 # Static assets (images, .nojekyll)
```

## Local Development

### Docker

```bash
docker compose up --build
```

### npm

```bash
npm install
npm start
```

Site will be available at http://localhost:3000/copilot-workshops/

## Deployment

Automated via GitHub Actions — push to `main` and the site is published to GitHub Pages.

See [CONTRIBUTING.md](CONTRIBUTING.md) for full development and contribution guidelines.

## Related Content

* [dotnet-react-starter-demo](https://github.com/copilot-academy/dotnet-react-starter-demo) - A sample .NET + React app used in the Copilot Customization workshop
