import React, { useState, useEffect } from 'react';

interface StageNode {
  iconType:
    | 'user'
    | 'bank'
    | 'friend'
    | 'broadcast'
    | 'network'
    | 'block'
    | 'miner'
    | 'rule'
    | 'coins'
    | 'key'
    | 'address'
    | 'mailbox'
    | 'deposit'
    | 'exchange'
    | 'seller'
    | 'vault'
    | 'validator'
    | 'wallet';
  title: string;
  role: string;
  edgeLabel?: string;
  detail: string;
}

interface Stage {
  id: number;
  shortName: string;
  badge: string;
  title: string;
  subtitle: string;
  accent: string;
  analogy: string;
  points: string[];
  nodes: StageNode[];
  ledgerType: string;
  ledgerHeaders: string[];
  ledgerRows: string[][];
  ledgerNote: string;
}

const STAGES: Stage[] = [
  {
    id: 1,
    shortName: 'The Middleman',
    badge: 'Act 1 • The Problem',
    title: 'The Flaw of the Single Middleman',
    subtitle:
      'Why digital money historically required a bank in the middle—and why that creates a trust bottleneck.',
    accent: '#f59e0b',
    analogy:
      "Imagine playing Monopoly where only ONE player is allowed to hold the score sheet and the pencil. Everyone else has to trust that they won't erase a number, charge an arbitrary fee, or refuse to write down your turn.",
    points: [
      "When you send Rp 100,000 via a banking app, no physical cash moves through your phone. The bank simply subtracts 100k from your row and adds 100k to your friend's row.",
      'Without a bank guarding the ledger, a dishonest user could copy-paste digital money and spend it twice (the Double-Spend Problem).',
      'The downside: Because one company owns the notebook, they control the fees, settlement speed, and access to your money.',
    ],
    nodes: [
      {
        iconType: 'user',
        title: 'Sender (You)',
        role: 'Requests Rp 100k transfer',
        detail:
          'You tap "Send Rp 100,000" on your phone. You aren\'t sending digital coins directly to your friend—you are sending an authorization request to your bank\'s central server.',
      },
      {
        iconType: 'bank',
        title: 'Central Bank Ledger',
        role: 'Private middleman database',
        edgeLabel: 'Asks permission',
        detail:
          'The bank checks if you have sufficient balance, deducts Rp 100,000 from your row, and credits your friend. Only the bank can view or modify this private SQL ledger.',
      },
      {
        iconType: 'friend',
        title: 'Receiver (Friend)',
        role: 'Sees updated bank balance',
        edgeLabel: 'Updates private row',
        detail:
          "Your friend receives a notification. If the bank is undergoing scheduled maintenance or it's a cross-border wire, settlement can take several business days.",
      },
    ],
    ledgerType: 'Private Bank Database (1 Owner)',
    ledgerHeaders: ['Account Holder', 'Balance', 'Controlled By'],
    ledgerRows: [
      ['You (User_01)', 'Rp 900,000 (-100k)', 'Bank Admin Only'],
      ['Friend (User_02)', 'Rp 600,000 (+100k)', 'Bank Admin Only'],
      ['System Rule', 'Can freeze / edit rows', 'Central Authority'],
    ],
    ledgerNote:
      '⚠ Single Point of Failure: If the bank server goes offline or freezes your account, you cannot access your funds.',
  },
  {
    id: 2,
    shortName: 'Shared Notebook',
    badge: 'Act 2 • The Breakthrough',
    title: 'The Shared Notebook (The Blockchain)',
    subtitle:
      'Instead of one bank guarding a secret database, thousands of computers hold an identical public copy.',
    accent: '#06b6d4',
    analogy:
      'Instead of one person holding the score sheet, every single villager sits in a circle with their own identical notebook. Whenever someone pays someone else, they shout it out loud and everyone writes it down on Page 52 at the exact same second.',
    points: [
      'Thousands of independent computers worldwide (called Nodes) keep an identical, synchronized copy of the ledger.',
      'When a page of transactions fills up, it is sealed using a cryptographic hash—that sealed page is a Block.',
      'Each new page includes the fingerprint of the previous page, chaining them together into an unbreakable Blockchain.',
    ],
    nodes: [
      {
        iconType: 'broadcast',
        title: 'Broadcast Transfer',
        role: 'Announced to the network',
        detail:
          'A transaction is broadcast out loud to the entire global peer-to-peer network simultaneously rather than routed through a private corporate server.',
      },
      {
        iconType: 'network',
        title: 'Global Node Network',
        role: '10,000+ identical copies',
        edgeLabel: 'Syncs everywhere',
        detail:
          'Independent computers in Jakarta, Tokyo, London, and New York all cross-reference their local copies of history to confirm the sender truly owns the coins.',
      },
      {
        iconType: 'block',
        title: 'Sealed Block (#101)',
        role: 'Chained by math fingerprint',
        edgeLabel: 'Cryptographic seal',
        detail:
          'Once verified, the page is sealed with a unique hash fingerprint (e.g. 0x9f8e...). Modifying even a single letter on an old page breaks the math lock, so fraud is rejected immediately.',
      },
    ],
    ledgerType: 'Public Synchronized Blockchain',
    ledgerHeaders: ['Block #', 'Prev Hash', 'Transactions', 'New Seal (Hash)'],
    ledgerRows: [
      ['Block #99', '0x44a1...', '1,420 Verified Tx', '0x7b2c...'],
      ['Block #100', '0x7b2c...', '1,890 Verified Tx', '0x9f8e...'],
      ['Block #101', '0x9f8e...', '2,105 Verified Tx', '0x3d1a... (Immutable)'],
    ],
    ledgerNote:
      "🔒 Tamper-Proof: Notice how Block #101 contains Block #100's exact seal. You cannot alter history without rewriting every block on 10,000+ computers.",
  },
  {
    id: 3,
    shortName: 'Birth of a Coin',
    badge: 'Act 3 • Minting Supply',
    title: 'How First Coins Are Born (Minting)',
    subtitle:
      'Where do new coins come from, and why do strangers spend electricity maintaining this shared notebook?',
    accent: '#10b981',
    analogy:
      'Think of the network as an automated gold mine. The software rules state: "Whoever does the heavy computational lifting to verify and seal the next page of the village notebook gets paid in brand-new gold coins created automatically by the protocol."',
    points: [
      'Nodes do not maintain the ledger out of charity—the protocol pays them in freshly minted coins every time they successfully seal a block.',
      'Proof of Work (Bitcoin): Miners use specialized hardware to race to solve a math puzzle to earn the right to seal the page.',
      'Proof of Stake (Ethereum): Validators lock up their own coins as a security collateral to verify pages; if they cheat, their deposit is slashed.',
    ],
    nodes: [
      {
        iconType: 'miner',
        title: 'Miner / Validator',
        role: 'Verifies & seals the block',
        detail:
          'A miner (using computational energy) or validator (staking coins) gathers pending transactions, verifies signatures, and seals Block #102.',
      },
      {
        iconType: 'rule',
        title: 'Coinbase Protocol Rule',
        role: 'Autonomous minting rule',
        edgeLabel: 'Applies algorithm',
        detail:
          'The protocol code automatically authorizes a special "Coinbase Transaction" rewarding the winning miner with newly minted cryptocurrency plus user fees.',
      },
      {
        iconType: 'coins',
        title: 'Fresh Coins Minted',
        role: '+3.125 BTC Created',
        edgeLabel: 'Awards new supply',
        detail:
          'New coins are injected into circulating supply! No government printed them, and no central bank approved them—they were minted purely by cryptographic code.',
      },
    ],
    ledgerType: 'Block #102 — Coinbase Reward Minting',
    ledgerHeaders: ['Transaction ID', 'From Address', 'To Address', 'Amount'],
    ledgerRows: [
      ['tx_mint_01', 'PROTOCOL (Code Rules)', 'bc1q_miner_winner', '+3.125 BTC'],
      ['tx_user_44', 'bc1q_alice_wallet', 'bc1q_bob_wallet', '0.045 BTC'],
      ['tx_user_89', 'bc1q_charlie_wallet', 'bc1q_dave_wallet', '0.120 BTC'],
    ],
    ledgerNote:
      '✨ Scarcity by Math: Every 4 years (210,000 blocks), this reward is sliced in half (The Halving) until exactly 21 Million Bitcoins exist.',
  },
  {
    id: 4,
    shortName: 'Identity & Keys',
    badge: 'Act 4 • Digital Identity',
    title: 'The Glass Mailbox (Public & Private Keys)',
    subtitle: 'How accounts work without usernames, passwords, or government ID cards.',
    accent: '#8b5cf6',
    analogy:
      'Your crypto address is like a mailbox made of transparent glass. Anyone can see inside and anyone can drop a letter (or coins) through the slot. But ONLY YOU hold the physical bronze key to open the back door and take money out.',
    points: [
      'You never need to give your name, phone number, or passport to create a blockchain address—it is purely mathematics.',
      'Public Address: Derived from your public key. Safe to share with anyone who wants to send you coins.',
      'Private Key (Seed Phrase): Your secret 256-bit digital signature. Whoever holds the private key owns the coins.',
    ],
    nodes: [
      {
        iconType: 'key',
        title: 'Private Key (Seed)',
        role: 'Your master signature',
        detail:
          'A 256-bit secret number (represented as 12 or 24 human words). It signs outgoing transfers. NEVER share this with anyone!',
      },
      {
        iconType: 'address',
        title: 'Math One-Way Hash',
        role: 'Elliptic Curve derivation',
        edgeLabel: 'Mathematically derives',
        detail:
          'Through Elliptic Curve cryptography, your private key generates your Public Key, which is compressed into your Public Address. You cannot reverse this process.',
      },
      {
        iconType: 'mailbox',
        title: 'Public Glass Mailbox',
        role: 'Your receiving address',
        edgeLabel: 'Publishes to world',
        detail:
          'Your address (e.g. bc1q... or 0x...). You can safely post this on social media, invoice clients, or show it to friends to receive payments.',
      },
    ],
    ledgerType: 'Cryptographic Keypair Derivation',
    ledgerHeaders: ['Key Level', 'Example Representation', 'Sharing Rule'],
    ledgerRows: [
      ['Master Seed', '12 / 24 Secret Words', '⛔ NEVER SHARE (Owns funds)'],
      ['Private Key', '5K... (256-bit secret string)', '⛔ NEVER SHARE (Signs transfers)'],
      ['Public Address', 'bc1q_YOUR_ADDRESS_88', '✓ Safe to share publicly with everyone'],
    ],
    ledgerNote:
      '🔑 Not Your Keys, Not Your Coins: If you store your coins on an exchange without withdrawing, the exchange holds the private key—not you!',
  },
  {
    id: 5,
    shortName: 'The Fiat Bridge',
    badge: 'Act 5 • Entering the System',
    title: 'The Fiat Bridge (Buying Your First Coins)',
    subtitle:
      'How ordinary everyday fiat money (Rupiah, USD) transforms into cryptocurrency on an exchange.',
    accent: '#0284c7',
    analogy:
      'Think of a centralized crypto exchange as an international airport money changer. You hand over Indonesian Rupiah from your bank app, and they credit digital foreign currency to your exchange balance.',
    points: [
      'To enter crypto, beginners use a Centralized Exchange (CEX) like Indodax, Tokocrypto, or Coinbase as a gateway.',
      'You deposit fiat currency (IDR) using bank transfer, Virtual Account, or QRIS.',
      'The exchange order book matches your buy order with another user who is selling coins.',
    ],
    nodes: [
      {
        iconType: 'deposit',
        title: 'Bank / QRIS Deposit',
        role: 'Transfers Rp 1,000,000 fiat',
        detail:
          'You open your mobile banking app or e-wallet and transfer Rp 1,000,000 to the regulated exchange via QRIS or Virtual Account.',
      },
      {
        iconType: 'exchange',
        title: 'Crypto Exchange',
        role: 'Matches Buyer & Seller',
        edgeLabel: 'Swaps on Order Book',
        detail:
          "The exchange matching engine pairs your Rp 1,000,000 order with a seller offering 0.001 BTC. This happens instantly inside the exchange's internal database.",
      },
      {
        iconType: 'seller',
        title: 'Crypto Seller / Miner',
        role: 'Receives Rp 1,000,000 cash',
        edgeLabel: 'Sells coins for cash',
        detail:
          'The seller receives your cash to pay real-world bills, and your exchange portfolio dashboard now displays an account balance of 0.001 BTC!',
      },
    ],
    ledgerType: 'Exchange Internal Database (Custodial)',
    ledgerHeaders: ['User Account', 'Fiat Balance (IDR)', 'Crypto Balance (BTC)'],
    ledgerRows: [
      ['You (Buyer)', 'Rp 0 (-1,000,000)', '0.0010 BTC (+0.0010)'],
      ['Seller / Miner', 'Rp 1,000,000 (+1,000,000)', '0.0000 BTC (-0.0010)'],
      ['Actual Blockchain', 'No on-chain move yet', 'Held in Exchange Pool Vault'],
    ],
    ledgerNote:
      '🏦 Wait—Where are the coins? Right now, the exchange holds the actual coins in its corporate pooled vault and simply writes an IOU balance in your app account.',
  },
  {
    id: 6,
    shortName: 'True Ownership',
    badge: 'Act 6 • On-Chain Settlement',
    title: 'Stepping Onto the Blockchain (Self-Custody)',
    subtitle:
      'Moving your purchased coins off the exchange into your personal wallet so your address is etched into the global ledger.',
    accent: '#ec4899',
    analogy:
      'Buying gold on an app is like holding a paper receipt while the vault holds the gold. Withdrawing to your self-custody wallet is walking out of the vault with the physical gold bar safely locked inside your private home safe.',
    points: [
      'To achieve 100% direct ownership without middleman counterparty risk, you copy your personal Public Address and tap "Withdraw" on the exchange.',
      'The exchange signs an official blockchain transaction: "Move 0.001 BTC from Exchange Vault to User\'s Public Address."',
      'Validators verify and seal that transfer into the next block. Now, all 10,000+ computers worldwide agree that your address owns those coins!',
    ],
    nodes: [
      {
        iconType: 'vault',
        title: 'Exchange Vault Wallet',
        role: 'Signs withdrawal request',
        detail:
          'You click "Withdraw". The exchange withdraws the coins from its institutional multi-sig vault and broadcasts a transaction addressed to your wallet.',
      },
      {
        iconType: 'validator',
        title: 'Blockchain Validators',
        role: 'Seals Block #103 globally',
        edgeLabel: 'Broadcasts to nodes',
        detail:
          'Validators worldwide verify the exchange signature, deduct the coins from the exchange row, and seal Block #103 permanently.',
      },
      {
        iconType: 'wallet',
        title: 'Your Personal Wallet',
        role: '100% Self-Custody Ownership',
        edgeLabel: 'Permanent record',
        detail:
          'Mission accomplished! Your coins are now recorded directly under your Public Address on the global notebook, controlled solely by your private seed phrase.',
      },
    ],
    ledgerType: 'Public Blockchain — Block #103 (Final Settlement)',
    ledgerHeaders: ['Block #', 'From Address', 'To Address (Yours!)', 'Status'],
    ledgerRows: [
      ['Block #103', 'bc1q_exchange_vault', 'bc1q_YOUR_WALLET_88', '+0.0010 BTC'],
      ['Consensus State', '10,450 / 10,450 Nodes', 'Verified & Sealed', '✓ IMMUTABLE'],
      ['Key Authority', 'Your Private Seed Only', 'No Middleman Needed', '🔐 Self-Custody'],
    ],
    ledgerNote:
      '🎉 The Complete Journey: You turned traditional bank money (Fiat) into an unchangeable, globally verified asset on the blockchain!',
  },
];

function NodeIcon({ type }: { type: StageNode['iconType'] }) {
  const iconProps = {
    className: 'w-6 h-6',
    fill: 'none',
    stroke: 'currentColor',
    viewBox: '0 0 24 24',
    strokeWidth: 1.8,
  };

  switch (type) {
    case 'user':
      return (
        <svg {...iconProps}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      );
    case 'bank':
      return (
        <svg {...iconProps}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
          />
        </svg>
      );
    case 'friend':
      return (
        <svg {...iconProps}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      );
    case 'broadcast':
      return (
        <svg {...iconProps}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"
          />
        </svg>
      );
    case 'network':
      return (
        <svg {...iconProps}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
          />
        </svg>
      );
    case 'block':
      return (
        <svg {...iconProps}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
          />
        </svg>
      );
    case 'miner':
      return (
        <svg {...iconProps}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      );
    case 'rule':
      return (
        <svg {...iconProps}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      );
    case 'coins':
      return (
        <svg {...iconProps}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      );
    case 'key':
      return (
        <svg {...iconProps}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
          />
        </svg>
      );
    case 'address':
      return (
        <svg {...iconProps}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
          />
        </svg>
      );
    case 'mailbox':
      return (
        <svg {...iconProps}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
      );
    case 'deposit':
      return (
        <svg {...iconProps}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
      );
    case 'exchange':
      return (
        <svg {...iconProps}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
          />
        </svg>
      );
    case 'seller':
      return (
        <svg {...iconProps}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
      );
    case 'vault':
      return (
        <svg {...iconProps}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
          />
        </svg>
      );
    case 'validator':
      return (
        <svg {...iconProps}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
          />
        </svg>
      );
    case 'wallet':
      return (
        <svg {...iconProps}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
          />
        </svg>
      );
  }
}

export default function StoryWalkthrough() {
  const [currentStageIdx, setCurrentStageIdx] = useState<number>(0);
  const [selectedNodeIdx, setSelectedNodeIdx] = useState<number>(0);

  const stage = STAGES[currentStageIdx];
  const node = stage.nodes[selectedNodeIdx];

  const handleNext = () => {
    if (currentStageIdx < STAGES.length - 1) {
      setCurrentStageIdx((prev) => prev + 1);
      setSelectedNodeIdx(0);
    }
  };

  const handlePrev = () => {
    if (currentStageIdx > 0) {
      setCurrentStageIdx((prev) => prev - 1);
      setSelectedNodeIdx(0);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentStageIdx]);

  return (
    <div className="not-content my-8 rounded-2xl border border-border bg-card/60 backdrop-blur-md p-5 sm:p-7 shadow-sm">
      {/* Top Stage Navigation Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 mb-6">
        {STAGES.map((st, idx) => {
          const isActive = idx === currentStageIdx;
          return (
            <button
              key={st.id}
              onClick={() => {
                setCurrentStageIdx(idx);
                setSelectedNodeIdx(0);
              }}
              type="button"
              className={`cursor-pointer p-3 rounded-xl border text-left transition-all ${
                isActive
                  ? 'border-primary ring-2 ring-primary/30 bg-primary/10 shadow-xs'
                  : 'border-border/60 bg-muted/30 text-muted-foreground hover:bg-muted/70 hover:text-foreground'
              }`}
            >
              <span
                className={`text-[10px] font-bold uppercase tracking-wider block mb-1 font-mono ${
                  isActive ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                Act {st.id}
              </span>
              <div className="text-xs font-bold text-foreground truncate">{st.shortName}</div>
            </button>
          );
        })}
      </div>

      {/* Stage Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-border/60">
        <div>
          <div className="inline-flex items-center gap-2 mb-1.5">
            <span
              className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border"
              style={{
                backgroundColor: `${stage.accent}15`,
                borderColor: `${stage.accent}40`,
                color: stage.accent,
              }}
            >
              {stage.badge}
            </span>
            <span className="text-xs text-muted-foreground">Click nodes below to inspect</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-foreground m-0">{stage.title}</h3>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 mb-0 max-w-3xl leading-relaxed">
            {stage.subtitle}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0 font-mono text-xs text-muted-foreground">
          Act {stage.id} of {STAGES.length}
        </div>
      </div>

      {/* FULL-WIDTH VISUAL DIAGRAM BOX */}
      <div className="p-5 sm:p-6 rounded-xl border border-border/80 bg-background/60 shadow-inner mb-6">
        <div className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider mb-4 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <span
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ backgroundColor: stage.accent }}
            />
            Interactive Process Flowchart
          </span>
          <span className="text-[10px] text-muted-foreground/80">Interactive Canvas</span>
        </div>

        {/* Nodes Flow: Horizontal on md+, Vertical on mobile */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-3">
          {stage.nodes.map((n, idx) => {
            const isSelected = idx === selectedNodeIdx;

            return (
              <React.Fragment key={n.title}>
                {/* Connector between nodes */}
                {idx > 0 && (
                  <div className="flex md:flex-col items-center justify-center gap-2 my-1 md:my-0 px-2 shrink-0 w-full md:w-auto">
                    {/* Horizontal line for desktop, vertical line for mobile */}
                    <div className="hidden md:flex flex-col items-center">
                      <span className="text-[10px] font-bold text-primary tracking-wide text-center uppercase mb-1.5 whitespace-nowrap px-2 py-0.5 rounded bg-primary/10 border border-primary/20">
                        {n.edgeLabel || 'Relays'}
                      </span>
                      <div className="flex items-center gap-1">
                        <div className="w-12 lg:w-16 h-0.5 bg-primary/40 relative overflow-hidden rounded">
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary to-white animate-pulse" />
                        </div>
                        <svg
                          className="w-3.5 h-3.5 text-primary -ml-1.5 shrink-0"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    </div>

                    {/* Mobile Downward Connector */}
                    <div className="flex md:hidden items-center justify-center gap-2 py-1 w-full">
                      <div className="h-4 w-0.5 bg-primary/50" />
                      <span className="text-[10px] font-bold text-primary tracking-wide uppercase px-2 py-0.5 rounded bg-primary/10 border border-primary/20">
                        ↓ {n.edgeLabel || 'Relays'}
                      </span>
                      <div className="h-4 w-0.5 bg-primary/50" />
                    </div>
                  </div>
                )}

                {/* Node Card */}
                <button
                  onClick={() => setSelectedNodeIdx(idx)}
                  type="button"
                  className={`cursor-pointer flex-1 w-full md:min-w-0 p-4 rounded-xl border text-center transition-all duration-200 select-none ${
                    isSelected
                      ? 'border-primary ring-2 ring-primary/40 bg-card shadow-md scale-102 -translate-y-0.5'
                      : 'border-border/80 bg-card/80 hover:border-primary/50 hover:bg-card'
                  }`}
                >
                  <div className="flex items-center justify-center mb-2">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                        isSelected
                          ? 'bg-primary/15 text-primary border border-primary/30 shadow-xs'
                          : 'bg-muted/60 text-muted-foreground border border-border/50'
                      }`}
                    >
                      <NodeIcon type={n.iconType} />
                    </div>
                  </div>

                  <div className="text-sm font-bold text-foreground leading-snug">{n.title}</div>
                  <div className="text-xs text-muted-foreground mt-1 line-clamp-2">{n.role}</div>

                  <div className="mt-3">
                    <span
                      className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full transition-colors ${
                        isSelected
                          ? 'bg-primary text-primary-foreground font-bold'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {isSelected ? 'Selected ✓' : 'Click to inspect'}
                    </span>
                  </div>
                </button>
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* LOWER SPLIT: Deep Dive Inspector & Live Ledger Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Mechanism Inspector & Analogy */}
        <div className="lg:col-span-6 space-y-4">
          {/* Selected Node Mechanism Deep Dive */}
          <div className="p-5 rounded-xl border border-primary/30 bg-primary/5 border-l-4 border-l-primary">
            <div className="text-xs font-bold uppercase tracking-wider text-primary mb-1.5 flex items-center gap-2">
              <span className="w-5 h-5 flex items-center justify-center">
                <NodeIcon type={node.iconType} />
              </span>
              <span>{node.title} — Technical Mechanism</span>
            </div>
            <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed m-0 font-sans">
              {node.detail}
            </p>
          </div>

          {/* Real-World Mental Model Analogy */}
          <div className="p-4 rounded-xl border border-border bg-card/80 text-xs space-y-3">
            <div className="font-bold text-[11px] uppercase tracking-wider text-primary flex items-center gap-1.5">
              <span>💡</span> Real-World Mental Model
            </div>
            <div className="rounded-lg border border-border/60 bg-muted/30 p-3 text-foreground/80 italic leading-relaxed text-xs">
              "{stage.analogy}"
            </div>
            <ul className="space-y-1.5 text-muted-foreground pl-4 list-disc text-xs m-0">
              {stage.points.map((pt, i) => (
                <li key={i}>{pt}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right: Live Ledger View State */}
        <div className="lg:col-span-6 flex flex-col justify-between p-5 rounded-xl border border-border bg-card/80 text-xs">
          <div>
            <div className="flex items-center justify-between border-b border-border/60 pb-2.5 mb-3">
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: stage.accent }} />
                Live Ledger View
              </span>
              <span
                className="text-[10px] font-mono px-2 py-0.5 rounded border"
                style={{
                  backgroundColor: `${stage.accent}15`,
                  borderColor: `${stage.accent}30`,
                  color: stage.accent,
                }}
              >
                {stage.ledgerType}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono border-collapse mb-3">
                <thead>
                  <tr className="border-b border-border text-muted-foreground text-[11px]">
                    {stage.ledgerHeaders.map((h, i) => (
                      <th key={i} className="py-1.5 px-2 font-semibold">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50 text-foreground/90">
                  {stage.ledgerRows.map((row, rIdx) => (
                    <tr key={rIdx} className="hover:bg-muted/40 transition-colors">
                      {row.map((cell, cIdx) => (
                        <td
                          key={cIdx}
                          className={`py-2 px-2 text-[11px] ${
                            cIdx === row.length - 1 ? 'font-bold text-primary' : ''
                          }`}
                        >
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-lg bg-muted/40 p-2.5 text-xs text-muted-foreground font-sans border border-border/60 mt-2">
            {stage.ledgerNote}
          </div>
        </div>
      </div>

      {/* Bottom Stage Navigation Controls */}
      <div className="flex items-center justify-between pt-5 mt-6 border-t border-border/60">
        <button
          onClick={handlePrev}
          disabled={currentStageIdx === 0}
          type="button"
          className="cursor-pointer px-4 py-2 rounded-lg border border-border bg-background hover:bg-muted text-xs font-semibold text-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          ← Previous Act
        </button>

        <span className="text-xs text-muted-foreground font-mono">
          Use{' '}
          <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border text-[10px]">←</kbd>{' '}
          <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border text-[10px]">→</kbd>{' '}
          arrow keys to navigate
        </span>

        <button
          onClick={handleNext}
          disabled={currentStageIdx === STAGES.length - 1}
          type="button"
          className="cursor-pointer px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
        >
          Next Act →
        </button>
      </div>
    </div>
  );
}
