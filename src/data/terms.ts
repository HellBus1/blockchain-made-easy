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
  'public-key': {
    id: 'public-key',
    name: 'Public Key / Address',
    short:
      'A cryptographic string derived from your private key that others use to send you cryptocurrency.',
    analogy:
      'Your bank account number or email address: completely safe to share publicly with anyone who wants to pay you.',
    category: 'wallets',
  },
  'private-key': {
    id: 'private-key',
    name: 'Private Key',
    short:
      'A secret 256-bit number that proves ownership of funds and mathematically signs outgoing transactions.',
    analogy:
      'Your handwritten signature and safe deposit box key rolled into one: never share it with anyone under any circumstance.',
    category: 'wallets',
  },
  'seed-phrase': {
    id: 'seed-phrase',
    name: 'Seed Phrase (Mnemonic Recovery Phrase)',
    short:
      'A 12- or 24-word sequence that encodes your master private key, allowing full wallet restoration on any device.',
    analogy:
      'A master key formula: writing down these 12 words allows you to recreate your wallet keys even if your phone falls in the ocean.',
    category: 'wallets',
  },
  'self-custody': {
    id: 'self-custody',
    name: 'Self-Custody (Non-Custodial)',
    short:
      'Holding the cryptographic private keys to your funds yourself, rather than trusting a third-party bank or exchange.',
    analogy:
      'Keeping cash in a personal titanium home safe rather than depositing it in a commercial bank that could freeze withdrawals.',
    category: 'wallets',
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
};

export function getTerm(id: string): TermDefinition | undefined {
  return TERMS[id] || TERMS[id.toLowerCase()];
}
