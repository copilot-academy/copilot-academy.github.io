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
        'copilot-coding-agent',
        'copilot-sdk',
      ],
    },
    {
      type: 'category',
      label: 'Intermediate',
      items: [
        'mcp-atlassian',

      ],
    },
    {
      type: 'category',
      label: 'Advanced',
      items: [
        'agent-orchestration',
        'build-your-mcp-server',
      ], 
    },
  ],
};

export default sidebars;
