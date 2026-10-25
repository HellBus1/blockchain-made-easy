export interface TermDefinition {
  id: string;
  name: string;
  short: string;
  analogy: string;
  category: 'consensus' | 'cryptography' | 'networking' | 'economics' | 'wallets' | 'architecture';
}

export const TERMS: Record<string, TermDefinition> = {
  'double-spend': {
    id: 'double-spend',
    name: 'Double-Spend Problem',
    short:
      'The risk that a digital currency can be spent more than once before the network registers the transaction.',
    analogy:
      'Like trying to spend the exact same physical $20 bill simultaneously at two different cash registers.',
    category: 'consensus',
  },
  ledger: {
    id: 'ledger',
    name: 'Distributed Ledger',
    short:
      'A chronological, tamper-evident log of balances and transactions replicated across multiple computers.',
    analogy:
      'A shared classroom notebook where everyone has an identical photocopy and agrees on every new sentence written.',
    category: 'architecture',
  },
  node: {
    id: 'node',
    name: 'Blockchain Node',
    short:
      'Any computer running the blockchain protocol software that validates transactions and maintains a copy of the ledger.',
    analogy:
      'An independent auditor with a complete library of all historical accounts, checking every incoming cheque.',
    category: 'networking',
  },
  'gossip-protocol': {
    id: 'gossip-protocol',
    name: 'Gossip Protocol',
    short:
      'A peer-to-peer communication method where each computer randomly relays new transactions and blocks to its neighbors.',
    analogy:
      'How rumors spread through a school cafeteria: tell 3 friends, who each tell 3 friends, reaching everyone in seconds.',
    category: 'networking',
  },
  hash: {
    id: 'hash',
    name: 'Cryptographic Hash',
    short:
      'A mathematical one-way function that turns any input data into a fixed-length unique digital fingerprint (e.g. SHA-256).',
    analogy:
      'A food blender: easy to blend a banana into a smoothie, mathematically impossible to reconstruct the banana from the smoothie.',
    category: 'cryptography',
  },
  blockchain: {
    id: 'blockchain',
    name: 'Blockchain',
    short:
      'A continuously growing chain of transaction batches (blocks) cryptographically linked together via previous hash pointers.',
    analogy:
      'A stack of wax-sealed glass envelopes where each envelope contains a photograph of the envelope beneath it.',
    category: 'architecture',
  },
  nonce: {
    id: 'nonce',
    name: 'Nonce (Number Used Once)',
    short:
      'An arbitrary 32-bit counter that miners repeatedly increment to discover a block hash that meets network difficulty.',
    analogy:
      'The combination dial on a padlock: you spin through combinations until the latch clicks open.',
    category: 'consensus',
  },
  pow: {
    id: 'pow',
    name: 'Proof of Work (PoW)',
    short:
      'A consensus mechanism requiring nodes to expend computational energy solving cryptographic puzzles to validate blocks.',
    analogy:
      'A lottery where buying more tickets (computational hashpower) gives you a proportionally higher chance to win the block reward.',
    category: 'consensus',
  },
  pos: {
    id: 'pos',
    name: 'Proof of Stake (PoS)',
    short:
      'A consensus mechanism where validators lock up native coins as collateral to be selected to propose and verify blocks.',
    analogy:
      'A security bond deposited with a landlord: if you trash the apartment (cheat the chain), your deposit gets slashed.',
    category: 'consensus',
  },
  halving: {
    id: 'halving',
    name: 'Halving (Halvening)',
    short:
      'A programmatic event occurring every 210,000 blocks (~4 years) that cuts the newly minted block reward in half.',
    analogy:
      'A central bank with an unalterable constitutional treaty to cut its money-printing press speed in half every four years.',
    category: 'economics',
  },
  'coinbase-tx': {
    id: 'coinbase-tx',
    name: 'Coinbase Transaction',
    short:
      'The very first transaction included in every new block, creating brand-new coins out of thin air to reward the miner.',
    analogy:
      'The royal mint striking fresh coins from gold ore and handing them directly to the miner who dug the quarry.',
    category: 'economics',
  },
  'fiat-bridge': {
    id: 'fiat-bridge',
    name: 'Fiat Gateway / Bridge',
    short:
      'A regulated platform (centralized exchange) enabling users to trade sovereign fiat currency (USD, IDR) for crypto assets.',
    analogy:
      'An international airport currency exchange counter connecting conventional banking to the decentralized realm.',
    category: 'architecture',
  },
  'order-book': {
    id: 'order-book',
    name: 'Order Book',
    short:
      'A real-time electronic list of buy orders (bids) and sell orders (asks) organized by price level.',
    analogy:
      'A live auction board matching buyers who want to pay the least with sellers who want to receive the most.',
    category: 'economics',
  },
  mempool: {
    id: 'mempool',
    name: 'Mempool (Memory Pool)',
    short:
      'The waiting room on each node where valid, broadcasted transactions wait to be picked up and included in the next block.',
    analogy:
      'Passengers waiting in the departure lounge before boarding the next scheduled flight.',
    category: 'architecture',
  },
  'genesis-block': {
    id: 'genesis-block',
    name: 'Genesis Block (Block #0)',
    short:
      'The initial foundational block of a blockchain network, hardcoded by its creators with no previous hash pointer.',
    analogy:
      'The cornerstone laid at the foundation of a skyscraper upon which all subsequent floors must rest.',
    category: 'architecture',
  },
  '51-percent-attack': {
    id: '51-percent-attack',
    name: '51% Attack',
    short:
      'A hypothetical attack where an entity controls the majority of mining hashpower, allowing them to reverse recent transactions.',
    analogy:
      'A hostile shareholder vote where someone holding 51% of shares votes to cancel recent contract payments.',
    category: 'consensus',
  },
  'private-key': {
    id: 'private-key',
    name: 'Private Key',
    short:
      'A secret 256-bit number that generates cryptographic signatures, granting mathematical ownership and spending rights over funds.',
    analogy:
      'The physical brass key to a high-security safe: anyone who holds it can open the door and take the contents.',
    category: 'cryptography',
  },
  'public-key': {
    id: 'public-key',
    name: 'Public Key',
    short:
      'A cryptographic point on an elliptic curve mathematically derived from the private key, safe to share publicly.',
    analogy:
      'A bank account number or email address: anyone can see it to send you money or messages, but nobody can withdraw with it.',
    category: 'cryptography',
  },
  'public-address': {
    id: 'public-address',
    name: 'Public Address',
    short:
      'A hashed, encoded destination string (e.g., 0x... or bc1...) derived from a public key where funds are sent.',
    analogy:
      'A glass mailbox on the street: transparent to see what dropped inside, but only the homeowner’s key opens the door.',
    category: 'wallets',
  },
  bip39: {
    id: 'bip39',
    name: 'BIP-39 (Mnemonic Standard)',
    short:
      'Bitcoin Improvement Proposal 39: a standard for converting raw cryptographic entropy into a human-friendly sequence of 12 or 24 words.',
    analogy:
      'A universal translation dictionary that turns an unpronounceable 64-digit hexadecimal code into simple memorable English words.',
    category: 'wallets',
  },
  'seed-phrase': {
    id: 'seed-phrase',
    name: 'Seed Phrase (Recovery Phrase)',
    short:
      'A master sequence of 12 or 24 words from which all private keys and addresses in a wallet are deterministically generated.',
    analogy:
      'A master key blueprint: if your hardware wallet falls into a lake, entering these 12 words on a new device restores every single asset.',
    category: 'wallets',
  },
  'derivation-path': {
    id: 'derivation-path',
    name: 'Derivation Path (BIP-44)',
    short:
      "A tree-like notation (e.g. m/44'/60'/0'/0/0) telling the wallet algorithm how to navigate from the master seed to specific coin addresses.",
    analogy: 'A street address inside a massive office tower: Floor 44, Suite 60, Room 0, Desk 0.',
    category: 'wallets',
  },
  'self-custody': {
    id: 'self-custody',
    name: 'Self-Custody (Non-Custodial)',
    short:
      'Holding and safeguarding your own private keys directly on your device, without relying on banks, brokers, or exchanges.',
    analogy:
      'Keeping physical gold in a private home vault rather than handing it to a depository bank that could freeze withdrawals.',
    category: 'wallets',
  },
  'custodial-wallet': {
    id: 'custodial-wallet',
    name: 'Custodial Wallet',
    short:
      'A service (such as an exchange or fintech app) that holds private keys on your behalf and owes you an IOU balance.',
    analogy:
      'A traditional bank checking account: the bank holds the actual cash vault, and you log in with a username and password.',
    category: 'wallets',
  },
  'cold-storage': {
    id: 'cold-storage',
    name: 'Cold Storage',
    short:
      'Storing cryptocurrency private keys completely offline on devices that have never touched an active internet connection.',
    analogy: 'An underground fallout bunker disconnected from all power lines and internet cables.',
    category: 'wallets',
  },
  'hardware-wallet': {
    id: 'hardware-wallet',
    name: 'Hardware Wallet',
    short:
      'A dedicated tamper-resistant physical microcontroller (e.g. Ledger, Trezor) designed specifically to sign transactions in an isolated environment.',
    analogy:
      'A secure signing booth: documents enter through a narrow slot, get signed inside by a sequestered notary, and only the finished signature leaves.',
    category: 'wallets',
  },
  'hot-wallet': {
    id: 'hot-wallet',
    name: 'Hot Wallet',
    short:
      'A software wallet running on an internet-connected device (such as a browser extension, phone app, or desktop software).',
    analogy:
      'The cash wallet in your pocket: convenient for quick everyday street purchases, but dangerous to keep your life savings in.',
    category: 'wallets',
  },
  'blind-signing': {
    id: 'blind-signing',
    name: 'Blind Signing',
    short:
      'Approving a cryptographic transaction on a wallet without being able to verify the human-readable outcome or permissions being granted.',
    analogy:
      'Signing a legal contract with a blindfold on because the salesperson promised it only orders a sandwich.',
    category: 'wallets',
  },
  'test-send': {
    id: 'test-send',
    name: 'Test Send',
    short:
      'Sending a nominal tiny transaction first to verify that the destination address, network, and memo are correct before sending substantial wealth.',
    analogy:
      'Testing a new garden hose connection with a gentle drip before opening the high-pressure fire hydrant.',
    category: 'wallets',
  },
  'destination-tag': {
    id: 'destination-tag',
    name: 'Destination Tag (Memo)',
    short:
      'A secondary numeric identifier required by centralized exchanges when depositing to a shared omnibus wallet address.',
    analogy:
      'An apartment unit number on a package: the street address gets it to the building, but the unit number ensures it reaches your door.',
    category: 'wallets',
  },
  'address-poisoning': {
    id: 'address-poisoning',
    name: 'Address Poisoning',
    short:
      'A deception attack where a fraudster sends tiny dummy tokens from a vanity address matching your frequent transfer prefix/suffix to fool copy-paste.',
    analogy:
      'A scammer printing business cards with the exact first 4 and last 4 digits of your mother’s phone number, hoping you click redial.',
    category: 'wallets',
  },
  'approval-phishing': {
    id: 'approval-phishing',
    name: 'Approval Phishing (Drainer)',
    short:
      'Tricking a user into signing an ERC-20 `approve` or `setApprovalForAll` transaction that grants an attacker unlimited permission to transfer your tokens.',
    analogy:
      'Signing a blank Power of Attorney form believing it was merely an attendance sheet for a free concert.',
    category: 'wallets',
  },
  'maker-taker': {
    id: 'maker-taker',
    name: 'Maker vs Taker Fees',
    short:
      'Makers provide liquidity by placing pending limit orders (paying lower fees); Takers remove liquidity by executing immediate market orders (paying higher fees).',
    analogy:
      'A wholesale farmer setting up a market stall with price tags (Maker) vs a hungry customer grabbing whatever is on the counter right away (Taker).',
    category: 'economics',
  },
  'limit-order': {
    id: 'limit-order',
    name: 'Limit Order',
    short:
      'An order to buy or sell a cryptocurrency at a specified price or better, resting on the order book until filled.',
    analogy:
      'Telling a real estate agent: "Buy this property only if the owner accepts $300,000 or less, otherwise wait."',
    category: 'economics',
  },
  'market-order': {
    id: 'market-order',
    name: 'Market Order',
    short:
      'An order to buy or sell immediately at the current best available price across the order book.',
    analogy:
      'Hailing a cab during rush hour: you get in immediately and pay whatever the meter says, regardless of traffic surcharges.',
    category: 'economics',
  },
  'stop-loss': {
    id: 'stop-loss',
    name: 'Stop-Loss Order',
    short:
      'An automated conditional order designed to sell an asset if price drops to a designated trigger level, capping downside loss.',
    analogy:
      'An emergency parachute with an altimeter: if your plane drops below 1,000 feet, the chute deploys automatically.',
    category: 'economics',
  },
  'p2p-trading': {
    id: 'p2p-trading',
    name: 'P2P (Peer-to-Peer) Trading',
    short:
      'Direct buying and selling of cryptocurrency between individuals using fiat payment methods, secured by exchange escrow.',
    analogy:
      'Buying a used car in cash from a neighbor with an escrow notary holding the car title until the bank transfer arrives.',
    category: 'economics',
  },
  'fiat-offramp': {
    id: 'fiat-offramp',
    name: 'Fiat Off-Ramp (Cashout)',
    short:
      'The process of selling cryptocurrency on an exchange and transferring the resulting government fiat money directly into your bank account.',
    analogy:
      'Exchanging foreign currency or casino chips at the cashier desk for local cash before exiting the building.',
    category: 'economics',
  },
  'staking-rewards': {
    id: 'staking-rewards',
    name: 'Staking Rewards',
    short:
      'Passive yield earned by locking Proof of Stake tokens to validate blockchain transactions and secure the network.',
    analogy:
      'Earning quarterly dividends or high-yield bond interest for depositing capital into a public utility trust.',
    category: 'economics',
  },
  apy: {
    id: 'apy',
    name: 'APY (Annual Percentage Yield)',
    short:
      'The real annual rate of return earned on an investment, taking into account the effect of compounding interest over 365 days.',
    analogy:
      'A savings account where the interest you earned in January earns its own interest in February, snowballing over the full year.',
    category: 'economics',
  },
  'grid-trading-bot': {
    id: 'grid-trading-bot',
    name: 'Grid Trading Bot',
    short:
      'An automated algorithmic bot that places a staggered ladder of buy and sell limit orders within a price corridor, harvesting profits from market volatility.',
    analogy:
      'A fisherman casting a net with 20 levels: as waves rise and fall, small fish are automatically caught and sold continuously.',
    category: 'economics',
  },
};

export function getTerm(id: string): TermDefinition | undefined {
  return TERMS[id] || TERMS[id.toLowerCase()];
}
