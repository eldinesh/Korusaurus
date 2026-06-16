import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

// ─────────────────────────────────────────────────────────────────────────────
// ⚠️  BEFORE DEPLOY: set these three to match your GitHub repo. Getting `baseUrl`
//     wrong is the #1 cause of "deployed but CSS/links are broken".
//     For a project site at https://<org>.github.io/<repo>/  use:
//        url:    'https://<org>.github.io'
//        baseUrl:'/<repo>/'
//     For a user/org site (repo named <org>.github.io) use baseUrl: '/'.
// ─────────────────────────────────────────────────────────────────────────────
const ORG = 'eldinesh';            // GitHub org or username
const REPO = 'Korusaurus';         // GitHub repository name

const config: Config = {
  title: 'Knowledge Hub',
  tagline: 'UX × AI — skills, prompts & workflow templates',
  favicon: 'img/favicon.ico',

  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  url: `https://${ORG}.github.io`,
  baseUrl: `/${REPO}/`,

  organizationName: ORG,
  projectName: REPO,
  trailingSlash: false,

  onBrokenLinks: 'throw',
  markdown: {
    // '.md' → CommonMark (no JSX/MDX), so designer-submitted prose with stray
    // `{` or `<` can't break the build. '.mdx' still gets full MDX.
    format: 'detect',
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
  },

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  // Self-hosted fonts (Inter + JetBrains Mono) — no Google Fonts network call.
  clientModules: ['./src/fonts.ts'],

  // Custom plugin: scans docs/ frontmatter and exposes it as global data so the
  // homepage gallery can render filterable cards without parsing on the client.
  plugins: ['./plugins/knowledge-index'],

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          routeBasePath: 'docs',
          // Enforce the controlled tag vocabulary in docs/tags.yml — a typo'd
          // tag fails the build instead of silently fragmenting filters.
          onInlineTags: 'throw',
          editUrl: `https://github.com/${ORG}/${REPO}/edit/main/`,
        },
        blog: {
          path: 'blog',
          routeBasePath: 'updates',
          blogTitle: 'Updates',
          blogDescription: 'Recently added experiments and changes',
          blogSidebarTitle: 'Recent updates',
          showReadingTime: false,
          feedOptions: {
            type: ['rss', 'atom'],
            xslt: true,
          },
          onInlineTags: 'warn',
          onInlineAuthors: 'warn',
          onUntruncatedBlogPosts: 'warn',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themes: [
    [
      // Offline local search — Lunr, build-time index, no Algolia/network.
      require.resolve('@easyops-cn/docusaurus-search-local'),
      {
        hashed: true,
        indexDocs: true,
        indexBlog: true,
        indexPages: true,
        docsRouteBasePath: 'docs',
        blogRouteBasePath: 'updates',
        highlightSearchTermsOnTargetPage: true,
      },
    ],
  ],

  themeConfig: {
    image: 'img/docusaurus-social-card.jpg',
    colorMode: {
      defaultMode: 'dark',
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'Knowledge Hub',
      // No logo image — clean wordmark, Linear-style. Drop in a real mark later
      // by re-adding `logo: { alt, src }`.
      items: [
        {to: '/', label: 'Browse', position: 'left', activeBaseRegex: '^/$'},
        {
          type: 'docSidebar',
          sidebarId: 'librarySidebar',
          position: 'left',
          label: 'Library',
        },
        {to: '/updates', label: 'Updates', position: 'left'},
        {to: '/docs/contributing', label: 'Contribute', position: 'left'},
        {
          href: `https://github.com/${ORG}/${REPO}`,
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Library',
          items: [
            {label: 'Prompts', to: '/docs/prompts'},
            {label: 'Skills', to: '/docs/skills'},
            {label: 'Workflows', to: '/docs/workflows'},
          ],
        },
        {
          title: 'Contribute',
          items: [
            {label: 'How to add an experiment', to: '/docs/contributing'},
            {
              label: 'Submit an experiment',
              href: `https://github.com/${ORG}/${REPO}/issues/new?template=new-experiment.yml`,
            },
          ],
        },
        {
          title: 'More',
          items: [
            {label: 'Updates', to: '/updates'},
            {label: 'GitHub', href: `https://github.com/${ORG}/${REPO}`},
          ],
        },
      ],
      copyright: `Knowledge Hub — UX × AI. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.nightOwl,
      additionalLanguages: ['markdown', 'json', 'bash', 'yaml'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
