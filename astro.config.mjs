import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import cloudflare from '@astrojs/cloudflare';
import { fileURLToPath } from 'node:url';

// https://astro.build/config
export default defineConfig({
  session: false,
  adapter: cloudflare({
    prerenderEnvironment: 'node',
    imageService: 'compile',
  }),
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
      head: [
        {
          tag: 'link',
          attrs: {
            rel: 'manifest',
            href: '/manifest.webmanifest',
          },
        },
        {
          tag: 'meta',
          attrs: {
            name: 'theme-color',
            content: '#0284c7',
          },
        },
        {
          tag: 'script',
          attrs: {
            src: '/scripts/sidebar-checkmarks.js',
            defer: true,
          },
        },
        {
          tag: 'script',
          attrs: {
            src: '/scripts/register-sw.js',
            defer: true,
          },
        },
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
          collapsed: false,
          items: [
            { label: '2.1 Keys & Public Addresses', slug: 'learn/wallets/01-keys-and-addresses' },
            { label: '2.2 Seed Phrases & BIP-39', slug: 'learn/wallets/02-seed-phrases' },
            { label: '2.3 Custodial vs Self-Custody', slug: 'learn/wallets/03-custodial-vs-self-custody' },
            { label: '2.4 Hot, Cold & Hardware Wallets', slug: 'learn/wallets/04-hot-cold-hardware-wallets' },
            { label: '2.5 Sending Safely', slug: 'learn/wallets/05-sending-safely' },
            { label: '2.6 Scams & Threat Models', slug: 'learn/wallets/06-scams-and-security' },
          ],
        },
        {
          label: 'Track 3: Exchanges & Income',
          collapsed: false,
          items: [
            { label: '3.1 The Fiat Bridge & Cashing Out', slug: 'learn/exchanges/01-fiat-bridge' },
            { label: '3.2 Order Books & Execution', slug: 'learn/exchanges/02-order-books' },
            { label: '3.3 P2P Trading & Cash Arbitrage', slug: 'learn/exchanges/03-p2p-trading-and-arbitrage' },
            {
              label: '3.4 Generating Income: Staking & Yield',
              slug: 'learn/exchanges/04-passive-income-staking-and-defi',
            },
            { label: '3.5 Automated Income: DCA & Grid Bots', slug: 'learn/exchanges/05-trading-bots-and-dca' },
            {
              label: '3.6 Risk Management & The Cash-Out Blueprint',
              slug: 'learn/exchanges/06-risk-management-and-cashing-out',
            },
          ],
        },
        {
          label: 'Track 4: Ethereum, Smart Contracts & Web3',
          collapsed: false,
          items: [
            { label: '4.1 Programmable Money & Smart Contracts', slug: 'learn/ethereum/01-smart-contracts' },
            {
              label: '4.2 Gas Economics: Protecting Your Profits',
              slug: 'learn/ethereum/02-gas-mechanics-and-eip1559',
            },
            {
              label: '4.3 Tokens, Stablecoins & Real-World Assets',
              slug: 'learn/ethereum/03-tokens-erc20-and-rwa',
            },
            {
              label: '4.4 Decentralized Exchanges & Liquidity Fees',
              slug: 'learn/ethereum/04-dex-and-liquidity-pools',
            },
            {
              label: '4.5 Layer 2 Scaling: 99% Cheaper Gas',
              slug: 'learn/ethereum/05-layer-2-scaling-and-cheap-yield',
            },
            {
              label: '4.6 Web3 Security: Rugpulls & Exploits',
              slug: 'learn/ethereum/06-smart-contract-safety-and-auditing',
            },
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
    build: {
      rollupOptions: {
        external: ['@bruits/satteri-wasm32-wasi'],
      },
      rolldownOptions: {
        external: ['@bruits/satteri-wasm32-wasi'],
      },
    },
  },
});
