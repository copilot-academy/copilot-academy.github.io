/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  labsSidebar: [
    {
      type: 'doc',
      id: 'index',
      label: 'All Labs',
    },
    {
      type: 'category',
      label: 'Getting Started',
      items: [
        'copilot-cli-zero-to-hero',
        'copilot-sdk',
      ],
    },
    {
      type: 'category',
      label: 'Intermediate',
      items: [
        'mcp-atlassian',
        'agentic-workflows-repo-analyzer',
        'customization-in-90-minutes',
        'context-engineering-lab',
      ],
    },
    {
      type: 'category',
      label: 'Advanced',
      items: [
        'build-your-mcp-server',
      ], 
    },
  ],
};

export default sidebars;
