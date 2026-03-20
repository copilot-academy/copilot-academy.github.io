# Contributing

This site is built with [Docusaurus 3.9.2](https://docusaurus.io/) and deployed to GitHub Pages via GitHub Actions.

## Local Development

### Option 1: Docker (recommended)

No local Node.js required — just Docker:

```bash
docker compose up --build
```

The site will be available at [http://localhost:3000/copilot-workshops/](http://localhost:3000/copilot-workshops/). File edits in `workshops/`, `labs/`, `src/`, and `static/` trigger live reload.

To stop:

```bash
docker compose down
```

### Option 2: npm

Requires [Node.js](https://nodejs.org/) 18+:

```bash
npm install
npm start
```

The site will open at [http://localhost:3000/copilot-workshops/](http://localhost:3000/copilot-workshops/).

### Production build test

```bash
npm run build
npm run serve
```

## Adding a New Workshop

1. Create a directory under `workshops/` (e.g., `workshops/my-new-workshop/`).

2. Add an `index.md` landing page and module markdown files with frontmatter:

   ```markdown
   ---
   title: Your Module Title
   description: A brief description for SEO and social sharing
   sidebar_position: 1
   ---

   # Your Module Title

   Content goes here...
   ```

3. Create a sidebar file at `sidebars/my-new-workshop.js`:

   ```js
   /** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
   const sidebars = {
     workshopSidebar: ['index', 'module-1', 'module-2'],
   };
   module.exports = sidebars;
   ```

4. Register the plugin in `docusaurus.config.js` by adding a new `@docusaurus/plugin-content-docs` entry in the `plugins` array.

5. Add a navbar entry for the new workshop in `docusaurus.config.js`.

## Adding a New Lab

1. Create a markdown file in `labs/` with frontmatter:

   ```markdown
   ---
   title: Lab Title
   description: Brief description
   sidebar_position: 4
   ---
   ```

2. The lab will automatically appear in the sidebar. Update `sidebars/labs.js` if you need custom grouping.

3. Internal links use relative paths without `.md` extensions:

   ```markdown
   See the [Introduction](copilot_customization_handbook) for details.
   ```

## Adding Videos

Use the `Video` component in any MDX file:

```jsx
import Video from '@site/src/components/Video';

<Video url="https://www.youtube.com/embed/VIDEO_ID" title="Description" />
```

For a placeholder (video not yet recorded):

```jsx
<Video title="Coming soon" />
```

## Deployment

Deployment is automated — push to `main` and GitHub Actions handles the rest:

1. The [test workflow](.github/workflows/test.yml) runs on every PR to validate the build
2. The [deploy workflow](.github/workflows/deploy.yml) runs on push to `main` and publishes to GitHub Pages

The site is live at: https://octodemo.github.io/copilot-workshops/

## Project Structure

```
├── workshops/                   # Full workshop content
│   └── copilot-customization/   # Copilot Customization workshop
├── labs/                        # Standalone hands-on labs
├── sidebars/                    # Sidebar configs (one per content collection)
│   ├── copilot-customization.js
│   └── labs.js
├── src/
│   ├── components/              # React components (e.g., Video)
│   ├── css/                     # Custom styles (GitHub Primer theme)
│   └── pages/                   # Landing page (index.jsx)
├── static/                      # Static assets (images, .nojekyll)
├── docusaurus.config.js         # Main site configuration
├── package.json                 # Dependencies and scripts
├── Dockerfile                   # Docker dev environment
├── docker-compose.yml           # Docker Compose for local dev
└── .github/workflows/           # CI/CD pipelines
```
