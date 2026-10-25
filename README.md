# Blockchain Made Easy

An end-to-end, visual, interactive GitBook-style learning web application designed to help anyone master cryptocurrency from scratch. 

Built with **Astro**, **Starlight**, **React islands**, and **Tailwind CSS v4**, deployed statically on **Cloudflare Pages**, and designed to be installed as an offline-first **PWA**.

---

## Key Features

- 📖 **GitBook-Style Navigation**: Smooth left-hand sidebar navigation, structured track hierarchy, and integrated full-text Pagefind search.
- ⚡ **Interactive Laboratory**: Every major concept is backed by an interactive simulation (SHA-256 hash playground, blockchain tamper simulator, PoW mining engine, Bitcoin halving scrubber, and the 6-act crypto journey).
- 🇮🇩 **Real-World Indonesian & Global Context**: Clear analogies connecting Rupiah (IDR), QRIS, bank rails, crypto exchanges (like Gate.io), and self-custody cold storage.
- 🔐 **Privacy-First**: Zero server tracking; progress is saved in local browser storage (`localStorage`).
- 📱 **Offline-First PWA**: Installable on desktop and mobile, with full static caching for offline learning.
- ☁️ **Cloudflare Pages Ready**: Zero-config static output (`dist/`) with custom caching and security headers.

---

## 5-Track Curriculum

1. **Foundations**: Money as a ledger, double-spending, distributed networks, hashing, proof-of-work/stake, and halving.
2. **Wallets & Security**: Public addresses, private keys, 12-word seed phrases, and scam defense.
3. **Exchanges & Buying**: Crossing the fiat bridge, order books, matching engines, and proof-of-reserves.
4. **Ethereum & Smart Contracts**: Programmable money, EVM, gas, tokens, stablecoins, and DeFi.
5. **Market Literacy & Trading**: Candlesticks (OHLC), order flow, risk management, and paper trading.

---

## Tech Stack

- **Framework**: [Astro](https://astro.build/) + [Starlight](https://starlight.astro.build/)
- **UI Islands**: [React](https://react.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Cryptography**: Native Web Crypto API & `@noble/hashes`
- **Typography**: IBM Plex Sans & IBM Plex Mono
- **Search**: Built-in Pagefind static indexer
- **Testing & Quality**: Vitest, ESLint (Flat Config), Prettier, Husky

---

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Local Development Server
```bash
npm run dev
```
Open `http://localhost:4321` in your browser.

### 3. Build for Production
```bash
npm run build
```
Generates a production static build in `./dist/`.

### 4. Preview Production Build
```bash
npm run preview
```

---

## Cloudflare Pages Deployment

- **Framework preset**: `Astro` / `None`
- **Build command**: `npm run build`
- **Build output directory**: `dist`
- **Node version**: Specified in `.nvmrc` (v22+)

---

## License

MIT