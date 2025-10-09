import { defineConfig } from 'vocs'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import rehypeMermaid from 'rehype-mermaid'

export default defineConfig({
  aiCta: true,
  title: 'Docs',
  iconUrl: '/favicon.png',
  ogImageUrl: {
    '/': 'og-docs.png',
    '/blog': 'og-blog.png',
    '/blog/*': 'og-blog.png',
  },
  logoUrl: {
    light: '/logo-light.svg',
    dark: '/logo-dark.svg',
  },
  topNav: [
    { text: 'Docs', link: '/' },
    { text: 'Blog', link: '/blog' },
    { text: 'openaudio.org', link: 'https://openaudio.org' },
  ],
  markdown: {
    remarkPlugins: [remarkMath],
    rehypePlugins: [rehypeKatex, rehypeMermaid],
  },
  description: "Docs for the Open Audio Protocol",
  socials: [
    {
      icon: 'github',
      link: 'https://github.com/OpenAudio',
    },
    {
      icon: 'x',
      link: 'https://twitter.com/OpenAudioProto',
    },
  ],
  sidebar: [
    {
      text: 'Open Audio Protocol',
      link: '/'
    },
    {
      text: 'Concepts',
      items: [
        {
          text: '1. \$AUDIO',
          link: '/concepts/audio',
        },
        {
          text: '2. Staking',
          link: '/concepts/staking',
        },
        {
          text: '3. Governance',
          link: '/concepts/governance',
        },
        {
          text: '4. Validators',
          link: '/concepts/validators',
        },
        {
          text: '5. Wire Protocol',
          link: '/concepts/wire-protocol',
        },
        {
          text: '6. Media Storage',
          link: '/concepts/media-storage',
        },
        {
          text: '7. Moderation',
          link: '/concepts/moderation',
        },
        {
          text: '8. Indexers & Views',
          link: '/concepts/indexers-views',
        },
        {
          text: '9. Artist Coins',
          link: '/concepts/artist-coins',
        },
      ],
    },
    {
      text: 'Tutorials',
      items: [
        {
          text: 'Run a node',
          link: '/tutorials/run-a-node',
        },
        {
          text: 'Launch artist coins',
          link: '/tutorials/launch-artist-coins',
        },
        {
          text: 'Create reward pools',
          link: '/tutorials/create-reward-pools',
        },
        {
          text: 'Gate release access',
          link: '/tutorials/gate-release-access',
        },
      ],
    },
    {
      text: 'Reference',
      items: [
        {
          text: 'Ethereum Contracts',
          link: '/reference/ethereum-contracts',
        },
        {
          text: 'Solana Programs',
          link: '/reference/solana-programs',
        },
      ],
    },
    {
      text: 'Blog',
      link: '/blog',
    }
  ],
  theme: {
    accentColor: {
      light: '#000',
      dark: "#fff"
    },
    variables: {
      color: {
        background: {
          light: "#fff",
          dark: "#0A0A0A"
        },
        backgroundDark: {
          light: "#FAFAFA",
          dark: "#000"
        },
        text: {
          light: "#000",
          dark: "#fff"
        }
      }
    }
  },
})
