import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath } from 'node:url';

// https://astro.build/config
export default defineConfig({
  site: 'https://blockchain-made-easy.pages.dev',
  integrations: [
    starlight({
      title: 'Blockchain Made Easy',
      description: 'Master cryptocurrency from scratch through interactive simulations, real-world analogies, and hands-on labs.',
      defaultLocale: 'root',
      locales: {
        root: {
          label: 'English',
          lang: 'en',
        },
      },
      social: [
        {
          icon: 'github',
          label: 'GitHub',
          href: 'https://github.com/HellBus1/blockchain-made-easy',
        },
      ],
      customCss: [
        './src/styles/global.css',
      ],
      sidebar: [
        {
          label: 'Dashboard & Overview',
          items: [
            { label: 'Learning Dashboard', slug: 'dashboard' },
            { label: 'Simulation Lab', slug: 'lab' },
            { label: 'Interactive Glossary', slug: 'glossary' },
          ],
        },
        {
          label: 'Track 1: Foundations',
          items: [
            { label: '1.1 What Money Really Is', slug: 'learn/foundations/01-what-money-really-is' },
            { label: '1.2 The Double-Spend Problem', slug: 'learn/foundations/02-the-double-spend-problem' },
            { label: '1.3 The Shared Notebook', slug: 'learn/foundations/03-the-shared-notebook' },
            { label: '1.4 Gossip Protocol & Consensus', slug: 'learn/foundations/04-gossip-protocol' },
            { label: '1.5 Hashing: Digital Fingerprints', slug: 'learn/foundations/05-cryptographic-hashing' },
            { label: '1.6 Blocks & The Immutable Chain', slug: 'learn/foundations/06-blocks-and-blockchain' },
            { label: '1.7 Proof of Work vs Proof of Stake', slug: 'learn/foundations/07-pow-vs-pos' },
            { label: '1.8 Minting, Block Rewards & Halving', slug: 'learn/foundations/08-minting-and-halving' },
            { label: '1.9 Alice Sends 1 Coin to Bob', slug: 'learn/foundations/09-alice-to-bob-walkthrough' },
          ],
        },
        {
          label: 'Track 2: Wallets & Security',
          collapsed: true,
          items: [
            { label: '2.1 Keys & Public Addresses', slug: 'learn/wallets/01-keys-and-addresses' },
            { label: '2.2 Seed Phrases & Self-Custody', slug: 'learn/wallets/02-seed-phrases' },
          ],
        },
        {
          label: 'Track 3: Exchanges & Buying',
          collapsed: true,
          items: [
            { label: '3.1 The Fiat Bridge', slug: 'learn/exchanges/01-fiat-bridge' },
            { label: '3.2 Order Books & Matching Engines', slug: 'learn/exchanges/02-order-books' },
          ],
        },
        {
          label: 'Track 4: Ethereum & DeFi',
          collapsed: true,
          items: [
            { label: '4.1 Smart Contracts & EVM', slug: 'learn/ethereum/01-smart-contracts' },
          ],
        },
        {
          label: 'Track 5: Market Literacy',
          collapsed: true,
          items: [
            { label: '5.1 Candlesticks & Charts', slug: 'learn/markets/01-candlesticks-and-charts' },
          ],
        },
      ],
    }),
    react(),
  ],
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
  },
});
