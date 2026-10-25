import { useState, useEffect, Fragment } from 'react';

interface StageNode {
  icon: string;
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
        icon: '🙋‍♂️',
        title: 'Sender (You)',
        role: 'Requests Rp 100k transfer',
        detail:
          'You tap "Send Rp 100,000" on your phone. You aren\'t sending digital coins directly to your friend—you are sending an authorization request to your bank\'s central server.',
      },
      {
        icon: '🏦',
        title: 'Central Bank Ledger',
        role: 'Private middleman database',
        edgeLabel: 'Asks permission',
        detail:
          'The bank checks if you have sufficient balance, deducts Rp 100,000 from your row, and credits your friend. Only the bank can view or modify this private SQL ledger.',
      },
      {
        icon: '🙋‍♀️',
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
    accent: '#38bdf8',
    analogy:
      'Instead of one person holding the score sheet, every single villager sits in a circle with their own identical notebook. Whenever someone pays someone else, they shout it out loud and everyone writes it down on Page 52 at the exact same second.',
    points: [
      'Thousands of independent computers worldwide (called Nodes) keep an identical, synchronized copy of the ledger.',
      'When a page of transactions fills up, it is sealed using a cryptographic hash—that sealed page is a Block.',
      'Each new page includes the fingerprint of the previous page, chaining them together into an unbreakable Blockchain.',
    ],
    nodes: [
      {
        icon: '📢',
        title: 'Broadcast Transfer',
        role: 'Announced to the network',
        detail:
          'A transaction is broadcast out loud to the entire global peer-to-peer network simultaneously rather than routed through a private corporate server.',
      },
      {
        icon: '🌐',
        title: 'Global Node Network',
        role: '10,000+ identical copies',
        edgeLabel: 'Syncs everywhere',
        detail:
          'Independent computers in Jakarta, Tokyo, London, and New York all cross-reference their local copies of history to confirm the sender truly owns the coins.',
      },
      {
        icon: '🔗',
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
    accent: '#eab308',
    analogy:
      'Think of the network as an automated gold mine. The software rules state: "Whoever does the heavy computational lifting to verify and seal the next page of the village notebook gets paid in brand-new gold coins created automatically by the protocol."',
    points: [
      'Nodes do not maintain the ledger out of charity—the protocol pays them in freshly minted coins every time they successfully seal a block.',
      'Proof of Work (Bitcoin): Miners use specialized hardware to race to solve a math puzzle to earn the right to seal the page.',
      'Proof of Stake (Ethereum): Validators lock up their own coins as a security collateral to verify pages; if they cheat, their deposit is slashed.',
    ],
    nodes: [
      {
        icon: '⚡',
        title: 'Miner / Validator',
        role: 'Verifies & seals the block',
        detail:
          'A miner (using computational energy) or validator (staking coins) gathers pending transactions, verifies signatures, and seals Block #102.',
      },
      {
        icon: '📜',
        title: 'Protocol Code Rule',
        role: 'Automated issuance engine',
        edgeLabel: 'Proves work/stake',
        detail:
          'No central bank governor decides to print currency. The open-source code automatically triggers a Coinbase Reward on a strict mathematical schedule.',
      },
      {
        icon: '🪙',
        title: 'Brand-New Coins',
        role: 'Credited to Validator address',
        edgeLabel: 'Mints 3.125 BTC',
        detail:
          'The first line of the new block writes: "Create 3.125 new Coins and assign them to Miner_Alpha." This is the sole mechanism by which native cryptocurrency enters circulation.',
      },
    ],
    ledgerType: 'Block #102 — Coin Issuance Record',
    ledgerHeaders: ['Tx Type', 'From', 'To Address', 'Amount'],
    ledgerRows: [
      ['✨ MINT REWARD', 'PROTOCOL (New Supply)', 'bc1q_miner_alpha', '+3.125 BTC'],
      ['Regular Transfer', 'bc1q_alice88', 'bc1q_bob99', '0.400 BTC'],
      ['Regular Transfer', 'bc1q_charlie', 'bc1q_dave77', '1.150 BTC'],
    ],
    ledgerNote:
      '💡 Key Insight: Coins are not MP3 or PDF files on your computer. "Owning a coin" simply means the shared ledger has an unalterable line crediting your public address!',
  },
  {
    id: 4,
    shortName: 'Wallets & Keys',
    badge: 'Act 4 • Digital Identity',
    title: 'Mailboxes & Signatures (Wallets & Keys)',
    subtitle:
      'How you claim an identity on the public notebook without submitting your name, passport, or national ID.',
    accent: '#a855f7',
    analogy:
      "Your Public Address is like a transparent glass mailbox on the public street—anyone can see what's inside and drop money into the slot. Your Private Key is the only physical brass key that unlocks the door so you can take money out.",
    points: [
      'A Crypto Wallet does not store coins inside the mobile app—it stores your private cryptographic keys that control your row on the global notebook.',
      'Public Key (Wallet Address): Safe to share with anyone (like your bank account number or email) so they can send you funds.',
      'Private Key (12/24-Word Seed Phrase): Your secret digital signature. Whoever holds these words has absolute control over the funds.',
    ],
    nodes: [
      {
        icon: '📱',
        title: 'Wallet App Generator',
        role: 'Creates math keypair',
        detail:
          'When you install a wallet app, it uses offline mathematics to generate a unique 12-word recovery seed phrase and derives your public and private keys.',
      },
      {
        icon: '📬',
        title: 'Public Address',
        role: 'Shareable mailbox',
        edgeLabel: 'Derives public ID',
        detail:
          'Looks like "0x71C...89A" or "bc1q...". You copy-paste this to receive funds. Anyone can verify this address balance on the public blockchain.',
      },
      {
        icon: '🔑',
        title: 'Private Key (Seed)',
        role: 'Secret digital signature',
        edgeLabel: 'Signs outgoing tx',
        detail:
          'Never reveal this to anyone! When you want to transfer coins, your wallet uses this private key to stamp an unforgeable mathematical signature on the transaction.',
      },
    ],
    ledgerType: 'Cryptographic Ownership Verification',
    ledgerHeaders: ['Component', 'Visibility', 'Real-World Equivalent'],
    ledgerRows: [
      ['Public Address (0x71C...)', 'Public to Everyone', 'Bank Account # / Mailbox Slot'],
      ['Ledger Balance (0.50 BTC)', 'Public on Blockchain', 'Visible Balance Inside Glass Box'],
      ['Private Key / 12 Words', 'Strictly Secret (You Only)', 'Master Vault Key / Signature'],
    ],
    ledgerNote:
      '🔐 Golden Rule of Crypto: "Not your keys, not your coins." Whoever holds the Private Key holds 100% unilateral authority to move the balance.',
  },
  {
    id: 5,
    shortName: 'Buying with Fiat',
    badge: 'Act 5 • The Fiat Bridge',
    title: 'Crossing the Bridge: Buying with Fiat Money',
    subtitle:
      'How you use everyday Rupiah (IDR) or Dollars (USD) from your bank account to purchase coins from sellers.',
    accent: '#10b981',
    analogy:
      'A Crypto Exchange (like Gate.io, Indodax, or Coinbase) is like an airport currency exchange booth or a busy commodities market. Sellers bring digital tokens they earned to sell for cash; you bring Rupiah from your bank to buy those tokens.',
    points: [
      'Your local bank (Rupiah/USD) and the Blockchain do not speak the same language, so you use a regulated Exchange as an on-ramp bridge.',
      "Step 1 (Fiat Deposit): You transfer Rp 1,000,000 from your bank account via bank transfer or QRIS to the exchange's corporate account.",
      'Step 2 (Order Book Match): The exchange matching engine pairs your buy order with a seller off-chain in their fast internal database.',
    ],
    nodes: [
      {
        icon: '💵',
        title: 'You (Fiat Buyer)',
        role: 'Deposits Rp 1,000,000 via Bank',
        detail:
          'You complete KYC identity verification on an exchange app and deposit Rp 1,000,000 via bank transfer or QRIS into the exchange.',
      },
      {
        icon: '🏛️',
        title: 'Crypto Exchange',
        role: 'Matches Buyer & Seller',
        edgeLabel: 'Swaps on Order Book',
        detail:
          "The exchange matching engine pairs your Rp 1,000,000 order with a seller offering 0.001 BTC. This happens instantly inside the exchange's internal database.",
      },
      {
        icon: '⛏️',
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
        icon: '🏦',
        title: 'Exchange Vault Wallet',
        role: 'Signs withdrawal request',
        detail:
          'You click "Withdraw". The exchange withdraws the coins from its institutional multi-sig vault and broadcasts a transaction addressed to your wallet.',
      },
      {
        icon: '⛓️',
        title: 'Blockchain Validators',
        role: 'Seals Block #103 globally',
        edgeLabel: 'Broadcasts to nodes',
        detail:
          'Validators worldwide verify the exchange signature, deduct the coins from the exchange row, and seal Block #103 permanently.',
      },
      {
        icon: '🛡️',
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
    <div className="my-8 rounded-2xl border border-sky-500/20 bg-slate-950/90 p-5 sm:p-6 shadow-2xl font-sans not-content">
      {/* Stepper Navigation Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 mb-6">
        {STAGES.map((st, idx) => (
          <button
            key={st.id}
            onClick={() => {
              setCurrentStageIdx(idx);
              setSelectedNodeIdx(0);
            }}
            className={`p-2.5 rounded-xl border text-left transition-all ${
              idx === currentStageIdx
                ? 'border-cyan-400 bg-cyan-950/30 shadow-md shadow-cyan-950/50'
                : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700 hover:text-slate-200'
            }`}
          >
            <span
              className={`text-[10px] font-bold uppercase tracking-wider block mb-0.5 ${
                idx === currentStageIdx ? 'text-cyan-400' : 'text-slate-500'
              }`}
            >
              Act {st.id}
            </span>
            <div className="text-xs font-bold text-slate-200 truncate">{st.shortName}</div>
          </button>
        ))}
      </div>

      {/* Main Grid: Interactive Canvas & Ledger Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Visual Flow & Node Inspector */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 sm:p-5">
            <div className="flex items-center justify-between gap-2 mb-3">
              <span
                className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border text-white"
                style={{ backgroundColor: `${stage.accent}20`, borderColor: stage.accent }}
              >
                {stage.badge}
              </span>
              <span className="text-xs text-slate-500">Tap cards to inspect</span>
            </div>
            <h3 className="text-xl font-bold text-slate-100 my-1">{stage.title}</h3>
            <p className="text-xs text-slate-400 mt-1 mb-4">{stage.subtitle}</p>

            {/* Interactive Flow Nodes */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 my-4">
              {stage.nodes.map((n, idx) => (
                <Fragment key={n.title}>
                  {idx > 0 && (
                    <div className="flex flex-col items-center justify-center my-1 sm:my-0">
                      <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider mb-1">
                        {n.edgeLabel || 'Next'}
                      </span>
                      <div className="h-0.5 w-8 sm:w-12 bg-slate-700 relative overflow-hidden rounded">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400 to-white animate-pulse"></div>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => setSelectedNodeIdx(idx)}
                    className={`flex-1 w-full sm:w-auto p-3.5 rounded-xl border text-center transition-all ${
                      idx === selectedNodeIdx
                        ? 'border-cyan-400 bg-slate-800 shadow-lg scale-102 ring-1 ring-cyan-400'
                        : 'border-slate-800 bg-slate-900/90 hover:border-slate-700'
                    }`}
                  >
                    <div className="text-2xl mb-1">{n.icon}</div>
                    <div className="text-xs font-bold text-slate-200">{n.title}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5 leading-snug">{n.role}</div>
                  </button>
                </Fragment>
              ))}
            </div>
          </div>

          {/* Deep Dive Node Inspector */}
          <div className="rounded-xl border border-cyan-500/30 bg-slate-900/80 p-4 border-l-4 border-l-cyan-400">
            <div className="text-xs font-bold uppercase tracking-wider text-cyan-400 mb-1 flex items-center gap-1.5">
              <span>{node.icon}</span> {node.title} — Mechanism Deep Dive
            </div>
            <p className="text-xs text-slate-300 leading-relaxed my-0">{node.detail}</p>
          </div>
        </div>

        {/* Right Column: Speaker Guide & Live Ledger State */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
          {/* Analogy & Talking Points Card */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 text-xs space-y-3">
            <div className="font-bold text-[11px] uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
              <span>🎙</span> Real-World Mental Model
            </div>
            <div className="rounded-lg border border-slate-800 bg-slate-950 p-3 text-slate-300 italic leading-relaxed">
              "{stage.analogy}"
            </div>
            <ul className="space-y-1.5 text-slate-300 pl-4 list-disc text-[11px]">
              {stage.points.map((pt, i) => (
                <li key={i}>{pt}</li>
              ))}
            </ul>
          </div>

          {/* Live Notebook / Ledger State Card */}
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 text-xs flex-1 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-cyan-400"></span> Live Ledger View
                </span>
                <span className="text-[10px] text-cyan-400 font-mono">{stage.ledgerType}</span>
              </div>

              <table className="w-full text-left text-[11px] font-mono border-collapse mb-2">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-500 text-[10px]">
                    {stage.ledgerHeaders.map((h, i) => (
                      <th key={i} className="py-1 px-1.5">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850 text-slate-300">
                  {stage.ledgerRows.map((row, rIdx) => (
                    <tr key={rIdx} className="hover:bg-slate-900/40">
                      {row.map((cell, cIdx) => (
                        <td
                          key={cIdx}
                          className={`py-1.5 px-1.5 ${
                            cIdx === row.length - 1 ? 'font-bold text-cyan-300' : ''
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

            <div className="rounded bg-slate-900/70 p-2 text-[10px] text-slate-400 font-sans border border-slate-800/80">
              {stage.ledgerNote}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="flex items-center justify-between pt-5 mt-4 border-t border-slate-800">
        <button
          onClick={handlePrev}
          disabled={currentStageIdx === 0}
          className="px-4 py-2 rounded-lg border border-slate-700 bg-slate-900 text-xs font-semibold text-slate-300 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition"
        >
          ← Previous Act
        </button>

        <span className="text-xs text-slate-500 font-mono">
          Act {stage.id} of {STAGES.length}
        </span>

        <button
          onClick={handleNext}
          disabled={currentStageIdx === STAGES.length - 1}
          className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed transition"
        >
          Next Act →
        </button>
      </div>
    </div>
  );
}
