// @ts-check

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'GitHub Copilot',
  tagline: 'Self-paced workshops and hands-on labs',
  favicon: '/img/favicon.svg',

  url: 'https://copilot-academy.github.io',
  baseUrl: '/',

  organizationName: 'copilot-academy',
  projectName: 'copilot-academy.github.io',
  trailingSlash: false,

  onBrokenLinks: 'throw',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: false,
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      }),
    ],
  ],

  plugins: [
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'copilot-customization',
        path: 'workshops/copilot-customization',
        routeBasePath: 'workshops/copilot-customization',
        sidebarPath: './sidebars/copilot-customization.js',
        editUrl:
          'https://github.com/copilot-academy/copilot-academy.github.io/tree/main/',
      },
    ],
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'immersive-experience',
        path: 'workshops/immersive-experience',
        routeBasePath: 'workshops/immersive-experience',
        sidebarPath: './sidebars/immersive-experience.js',
        editUrl:
          'https://github.com/copilot-academy/copilot-academy.github.io/tree/main/',
      },
    ],
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'labs',
        path: 'labs',
        routeBasePath: 'labs',
        sidebarPath: './sidebars/labs.js',
        editUrl:
          'https://github.com/copilot-academy/copilot-academy.github.io/tree/main/',
      },
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      image: 'img/social-card.png',
      navbar: {
        title: 'Copilot Academy',
        logo: {
          alt: 'GitHub Logo',
          src: 'img/logo.svg',
        },
        items: [
          {
            type: 'dropdown',
            label: 'Workshops',
            position: 'left',
            items: [
              {
                label: 'Copilot Customization',
                to: '/workshops/copilot-customization',
              },
              {
                label: 'Immersive Experience',
                to: '/workshops/immersive-experience',
              },
            ],
          },
          {
            to: '/labs',
            label: 'Labs',
            position: 'left',
          },
          {
            href: 'https://github.com/copilot-academy/copilot-academy.github.io',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Workshops',
            items: [
              {
                label: 'Copilot Customization',
                to: '/workshops/copilot-customization',
              },
              {
                label: 'Immersive Experience',
                to: '/workshops/immersive-experience',
              },
            ],
          },
          {
            title: 'Labs',
            items: [
              {
                label: 'All Labs',
                to: '/labs',
              },
            ],
          },
          {
            title: 'Resources',
            items: [
              {
                label: 'GitHub Copilot Docs',
                href: 'https://docs.github.com/en/copilot',
              },
              {
                label: 'VS Code Copilot',
                href: 'https://code.visualstudio.com/docs/copilot/overview',
              },
              {
                label: 'GitHub',
                href: 'https://github.com/copilot-academy/copilot-academy.github.io',
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} GitHub `,
      },
      prism: {
        theme: {
          plain: {
            color: '#24292f',
            backgroundColor: '#f6f8fa',
          },
          styles: [
            { types: ['comment', 'prolog', 'doctype', 'cdata'], style: { color: '#6e7781' } },
            { types: ['punctuation'], style: { color: '#24292f' } },
            { types: ['namespace'], style: { opacity: 0.7 } },
            { types: ['property', 'tag', 'boolean', 'number', 'constant', 'symbol', 'deleted'], style: { color: '#0550ae' } },
            { types: ['selector', 'attr-name', 'string', 'char', 'builtin', 'inserted'], style: { color: '#0a3069' } },
            { types: ['operator', 'entity', 'url'], style: { color: '#24292f' } },
            { types: ['atrule', 'attr-value', 'keyword'], style: { color: '#cf222e' } },
            { types: ['function', 'class-name'], style: { color: '#8250df' } },
            { types: ['regex', 'important', 'variable'], style: { color: '#116329' } },
          ],
        },
        darkTheme: {
          plain: {
            color: '#e6edf3',
            backgroundColor: '#161b22',
          },
          styles: [
            { types: ['comment', 'prolog', 'doctype', 'cdata'], style: { color: '#8b949e' } },
            { types: ['punctuation'], style: { color: '#e6edf3' } },
            { types: ['namespace'], style: { opacity: 0.7 } },
            { types: ['property', 'tag', 'boolean', 'number', 'constant', 'symbol', 'deleted'], style: { color: '#79c0ff' } },
            { types: ['selector', 'attr-name', 'string', 'char', 'builtin', 'inserted'], style: { color: '#a5d6ff' } },
            { types: ['operator', 'entity', 'url'], style: { color: '#e6edf3' } },
            { types: ['atrule', 'attr-value', 'keyword'], style: { color: '#ff7b72' } },
            { types: ['function', 'class-name'], style: { color: '#d2a8ff' } },
            { types: ['regex', 'important', 'variable'], style: { color: '#7ee787' } },
          ],
        },
        additionalLanguages: ['bash', 'json', 'yaml', 'markdown', 'typescript'],
      },
      colorMode: {
        defaultMode: 'light',
        disableSwitch: false,
        respectPrefersColorScheme: true,
      },
    }),
};

export default config;
