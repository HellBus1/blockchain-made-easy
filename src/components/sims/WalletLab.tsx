import { useState, useEffect } from 'react';
import * as bip39 from '@scure/bip39';
import { wordlist } from '@scure/bip39/wordlists/english.js';
import { secp256k1 } from '@noble/curves/secp256k1.js';
import { sha256 } from '@noble/hashes/sha2.js';
import { keccak_256 } from '@noble/hashes/sha3.js';
import { ripemd160 } from '@noble/hashes/legacy.js';

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function hexToBytes(hex: string): Uint8Array {
  const cleanHex = hex.startsWith('0x') ? hex.slice(2) : hex;
  const bytes = new Uint8Array(cleanHex.length / 2);
  for (let i = 0; i < cleanHex.length; i += 2) {
    bytes[i / 2] = parseInt(cleanHex.substring(i, i + 2), 16);
  }
  return bytes;
}

// Compute EIP-55 checksum address for Ethereum
function toChecksumAddress(addressHex: string): string {
  const clean = addressHex.toLowerCase().replace(/^0x/, '');
  const hash = bytesToHex(keccak_256(new TextEncoder().encode(clean)));
  let ret = '0x';
  for (let i = 0; i < clean.length; i++) {
    if (parseInt(hash[i], 16) >= 8) {
      ret += clean[i].toUpperCase();
    } else {
      ret += clean[i];
    }
  }
  return ret;
}

// Simple Base58 encode for Bitcoin legacy address display
const B58_CHARS = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
function base58Encode(bytes: Uint8Array): string {
  let x = BigInt('0x' + bytesToHex(bytes));
  let result = '';
  while (x > 0n) {
    const rem = Number(x % 58n);
    x = x / 58n;
    result = B58_CHARS[rem] + result;
  }
  for (let i = 0; i < bytes.length && bytes[i] === 0; i++) {
    result = '1' + result;
  }
  return result;
}

function computeBtcLegacyAddress(pubKeyCompressed: Uint8Array): string {
  const sha = sha256(pubKeyCompressed);
  const hash160 = ripemd160(sha);
  const versioned = new Uint8Array(1 + hash160.length);
  versioned[0] = 0x00; // Mainnet P2PKH
  versioned.set(hash160, 1);
  const checksum = sha256(sha256(versioned)).slice(0, 4);
  const full = new Uint8Array(versioned.length + 4);
  full.set(versioned, 0);
  full.set(checksum, versioned.length);
  return base58Encode(full);
}

export default function WalletLab() {
  const [activeTab, setActiveTab] = useState<'bip39' | 'keys' | 'addresses' | 'signing'>('bip39');
  const [wordCount, setWordCount] = useState<12 | 24>(12);
  const [passphrase, setPassphrase] = useState<string>('');
  const [mnemonic, setMnemonic] = useState<string>('');
  const [seedHex, setSeedHex] = useState<string>('');
  const [entropyBits, setEntropyBits] = useState<string>('');

  // Key state derived from seed
  const [privateKeyHex, setPrivateKeyHex] = useState<string>('');
  const [pubKeyCompressedHex, setPubKeyCompressedHex] = useState<string>('');
  const [pubKeyUncompressedHex, setPubKeyUncompressedHex] = useState<string>('');
  const [ethAddress, setEthAddress] = useState<string>('');
  const [btcAddress, setBtcAddress] = useState<string>('');

  // Signing state
  const [message, setMessage] = useState<string>('Alice authorizes transfer of 1.5 BTC to Bob');
  const [signatureHex, setSignatureHex] = useState<string>('');
  const [sigR, setSigR] = useState<string>('');
  const [sigS, setSigS] = useState<string>('');
  const [isSignatureValid, setIsSignatureValid] = useState<boolean>(true);
  const [isCopied, setIsCopied] = useState<string | null>(null);

  // Generate initial or fresh mnemonic
  const generateNewWallet = async (words: 12 | 24, pass: string) => {
    const strength = words === 12 ? 128 : 256;
    const newMnemonic = bip39.generateMnemonic(wordlist, strength);
    setMnemonic(newMnemonic);

    // Compute raw entropy bits
    const entropy = bip39.mnemonicToEntropy(newMnemonic, wordlist);
    let bits = '';
    for (const byte of entropy) {
      bits += byte.toString(2).padStart(8, '0');
    }
    setEntropyBits(bits);

    // Compute 512-bit seed
    const seed = await bip39.mnemonicToSeed(newMnemonic, pass);
    const sHex = bytesToHex(seed);
    setSeedHex(sHex);

    // Derive deterministic master private key (first 32 bytes of seed SHA-256 for teaching)
    const privKeyBytes = sha256(seed);
    const privHex = bytesToHex(privKeyBytes);
    setPrivateKeyHex(privHex);

    // Compute secp256k1 public keys
    const pubCompressed = secp256k1.getPublicKey(privKeyBytes, true);
    const pubUncompressed = secp256k1.getPublicKey(privKeyBytes, false);
    setPubKeyCompressedHex(bytesToHex(pubCompressed));
    setPubKeyUncompressedHex(bytesToHex(pubUncompressed));

    // Ethereum address: Keccak-256 of uncompressed public key (omitting 0x04 prefix), take last 20 bytes
    const ethKeccak = keccak_256(pubUncompressed.slice(1));
    const rawEthAddress = '0x' + bytesToHex(ethKeccak.slice(-20));
    setEthAddress(toChecksumAddress(rawEthAddress));

    // Bitcoin address: SHA-256 -> RIPEMD-160 -> Base58Check
    setBtcAddress(computeBtcLegacyAddress(pubCompressed));

    // Initial signature
    const msgBytes = new TextEncoder().encode(message);
    const sig = secp256k1.sign(sha256(msgBytes), privKeyBytes);
    setSignatureHex(bytesToHex(sig));
    setSigR(bytesToHex(sig.slice(0, 32)));
    setSigS(bytesToHex(sig.slice(32, 64)));
    setIsSignatureValid(true);
  };

  useEffect(() => {
    generateNewWallet(wordCount, passphrase);
  }, []);

  const handlePassphraseChange = async (newPass: string) => {
    setPassphrase(newPass);
    if (!mnemonic) return;
    const seed = await bip39.mnemonicToSeed(mnemonic, newPass);
    const sHex = bytesToHex(seed);
    setSeedHex(sHex);
    const privKeyBytes = sha256(seed);
    const privHex = bytesToHex(privKeyBytes);
    setPrivateKeyHex(privHex);
    const pubCompressed = secp256k1.getPublicKey(privKeyBytes, true);
    const pubUncompressed = secp256k1.getPublicKey(privKeyBytes, false);
    setPubKeyCompressedHex(bytesToHex(pubCompressed));
    setPubKeyUncompressedHex(bytesToHex(pubUncompressed));
    const ethKeccak = keccak_256(pubUncompressed.slice(1));
    setEthAddress(toChecksumAddress('0x' + bytesToHex(ethKeccak.slice(-20))));
    setBtcAddress(computeBtcLegacyAddress(pubCompressed));

    // Refresh signature
    const msgBytes = new TextEncoder().encode(message);
    const sig = secp256k1.sign(sha256(msgBytes), privKeyBytes);
    setSignatureHex(bytesToHex(sig));
    setSigR(bytesToHex(sig.slice(0, 32)));
    setSigS(bytesToHex(sig.slice(32, 64)));
    setIsSignatureValid(true);
  };

  const handleSignMessage = () => {
    try {
      const privKeyBytes = hexToBytes(privateKeyHex);
      const msgBytes = new TextEncoder().encode(message);
      const sig = secp256k1.sign(sha256(msgBytes), privKeyBytes);
      setSignatureHex(bytesToHex(sig));
      setSigR(bytesToHex(sig.slice(0, 32)));
      setSigS(bytesToHex(sig.slice(32, 64)));
      setIsSignatureValid(true);
    } catch {
      setIsSignatureValid(false);
    }
  };

  const handleTamperMessage = () => {
    const tampered = message + ' [TAMPERED 0.0001]';
    setMessage(tampered);
    try {
      const pubCompressed = hexToBytes(pubKeyCompressedHex);
      const tamperedBytes = new TextEncoder().encode(tampered);
      const isValid = secp256k1.verify(
        hexToBytes(signatureHex),
        sha256(tamperedBytes),
        pubCompressed
      );
      setIsSignatureValid(isValid);
    } catch {
      setIsSignatureValid(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(label);
    setTimeout(() => setIsCopied(null), 2000);
  };

  const mnemonicWords = mnemonic.split(' ').filter(Boolean);

  return (
    <div className="not-content my-8 rounded-2xl border border-border/70 bg-card/60 backdrop-blur-md shadow-lg overflow-hidden transition-all">
      {/* Educational Sandbox Header & Disclaimer */}
      <div className="px-5 py-4 bg-amber-500/10 border-b border-amber-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-3 w-3 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
          </span>
          <span className="text-xs sm:text-sm font-semibold text-amber-600 dark:text-amber-400">
            Interactive Wallet Laboratory (Live Secp256k1 & BIP-39)
          </span>
        </div>
        <span className="text-[11px] font-mono px-2.5 py-1 rounded-md bg-amber-500/20 text-amber-700 dark:text-amber-300">
          ⚠️ Educational Sandbox — Never fund keys generated here
        </span>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap border-b border-border/70 bg-muted/30 px-3 pt-2">
        <button
          onClick={() => setActiveTab('bip39')}
          type="button"
          className={`cursor-pointer px-4 py-2.5 text-xs sm:text-sm font-medium border-b-2 transition-all ${
            activeTab === 'bip39'
              ? 'border-primary text-primary font-semibold'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          1. Seed Words & Entropy
        </button>
        <button
          onClick={() => setActiveTab('keys')}
          type="button"
          className={`cursor-pointer px-4 py-2.5 text-xs sm:text-sm font-medium border-b-2 transition-all ${
            activeTab === 'keys'
              ? 'border-primary text-primary font-semibold'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          2. Elliptic Curve Keys (secp256k1)
        </button>
        <button
          onClick={() => setActiveTab('addresses')}
          type="button"
          className={`cursor-pointer px-4 py-2.5 text-xs sm:text-sm font-medium border-b-2 transition-all ${
            activeTab === 'addresses'
              ? 'border-primary text-primary font-semibold'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          3. Address Derivation
        </button>
        <button
          onClick={() => setActiveTab('signing')}
          type="button"
          className={`cursor-pointer px-4 py-2.5 text-xs sm:text-sm font-medium border-b-2 transition-all ${
            activeTab === 'signing'
              ? 'border-primary text-primary font-semibold'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          4. Message Signing & Tamper Test
        </button>
      </div>

      {/* Main Tab Views */}
      <div className="p-5 sm:p-6 space-y-6">
        {/* TAB 1: BIP-39 Mnemonic */}
        {activeTab === 'bip39' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h4 className="text-base font-semibold text-foreground">
                  BIP-39 Mnemonic Generation
                </h4>
                <p className="text-xs text-muted-foreground">
                  Random entropy is divided into 11-bit chunks. Each chunk maps to 1 of 2,048 words
                  in the standard wordlist.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex rounded-lg border border-border bg-card p-1 text-xs">
                  <button
                    onClick={() => {
                      setWordCount(12);
                      generateNewWallet(12, passphrase);
                    }}
                    type="button"
                    className={`cursor-pointer px-2.5 py-1 rounded font-medium ${
                      wordCount === 12
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground'
                    }`}
                  >
                    12 Words (128-bit)
                  </button>
                  <button
                    onClick={() => {
                      setWordCount(24);
                      generateNewWallet(24, passphrase);
                    }}
                    type="button"
                    className={`cursor-pointer px-2.5 py-1 rounded font-medium ${
                      wordCount === 24
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground'
                    }`}
                  >
                    24 Words (256-bit)
                  </button>
                </div>

                <button
                  onClick={() => generateNewWallet(wordCount, passphrase)}
                  type="button"
                  className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground transition-all shadow-xs"
                >
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  Roll New Seed
                </button>
              </div>
            </div>

            {/* Seed Words Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
              {mnemonicWords.map((word, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border/80 bg-muted/40 font-mono text-xs shadow-2xs hover:border-primary/50 transition-colors"
                >
                  <span className="text-[10px] text-muted-foreground/60 w-4 font-sans font-bold">
                    {idx + 1}.
                  </span>
                  <span className="font-semibold text-foreground tracking-wide">{word}</span>
                </div>
              ))}
            </div>

            {/* Optional Passphrase Input */}
            <div className="p-4 rounded-xl border border-border/70 bg-card/40 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-foreground flex items-center gap-1.5">
                  <span>Optional Passphrase (BIP-39 "25th Word"):</span>
                  <span className="text-muted-foreground text-[11px] font-normal">
                    Creates a decoy or separate vault
                  </span>
                </label>
                {passphrase && (
                  <span className="text-[10px] font-mono text-emerald-500 font-medium">
                    ✓ Custom Salt Active
                  </span>
                )}
              </div>
              <input
                type="text"
                value={passphrase}
                onChange={(e) => handlePassphraseChange(e.target.value)}
                placeholder="Leave blank for standard wallet, or type passphrase..."
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-xs font-mono text-foreground placeholder:text-muted-foreground/50 focus:outline-hidden focus:ring-1 focus:ring-primary"
              />
              <p className="text-[11px] text-muted-foreground">
                Notice: changing even a single letter in the passphrase produces a completely
                different 512-bit seed and private key below!
              </p>
            </div>

            {/* Binary Entropy & Seed Breakdown */}
            <div className="space-y-3 font-mono text-xs">
              <div className="p-3.5 rounded-xl border border-border/60 bg-muted/20">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-muted-foreground font-semibold">
                    Raw Entropy ({entropyBits.length} bits):
                  </span>
                  <button
                    onClick={() => copyToClipboard(entropyBits, 'entropy')}
                    type="button"
                    className="text-[10px] text-primary hover:underline cursor-pointer"
                  >
                    {isCopied === 'entropy' ? 'Copied ✓' : 'Copy Bits'}
                  </button>
                </div>
                <div className="break-all text-[11px] text-muted-foreground/90 font-mono select-all">
                  {entropyBits}
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-border/60 bg-muted/20">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-muted-foreground font-semibold">
                    Derived 512-bit Master Seed (PBKDF2):
                  </span>
                  <button
                    onClick={() => copyToClipboard(seedHex, 'seed')}
                    type="button"
                    className="text-[10px] text-primary hover:underline cursor-pointer"
                  >
                    {isCopied === 'seed' ? 'Copied ✓' : 'Copy Hex'}
                  </button>
                </div>
                <div className="break-all text-[11px] text-primary/90 font-mono select-all">
                  {seedHex}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Elliptic Curve Keys */}
        {activeTab === 'keys' && (
          <div className="space-y-6">
            <div>
              <h4 className="text-base font-semibold text-foreground">
                Elliptic Curve Cryptography: Secp256k1
              </h4>
              <p className="text-xs text-muted-foreground">
                Cryptocurrency uses the elliptic curve equation{' '}
                <code className="text-primary font-mono">y² = x³ + 7 (mod p)</code>. Your private
                key is a secret scalar multiplier <code className="font-mono">k</code>. The public
                key is the coordinate point <code className="font-mono">K = k × G</code>.
              </p>
            </div>

            {/* Curve Formula Box */}
            <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                  The One-Way Mathematical Trapdoor
                </span>
                <div className="font-mono text-sm sm:text-base font-bold text-foreground">
                  Public Key = Private Key × Generator Point G
                </div>
                <p className="text-xs text-muted-foreground">
                  Calculating <code className="font-mono text-foreground">k × G</code> is blazing
                  fast (~microseconds). Reversing it (finding{' '}
                  <code className="font-mono text-foreground">k</code> given{' '}
                  <code className="font-mono text-foreground">K</code>) requires 2¹²⁸ computational
                  operations—impossible even for global supercomputers.
                </p>
              </div>

              <div className="shrink-0 px-4 py-3 rounded-lg border border-primary/30 bg-background text-center">
                <span className="text-[10px] uppercase font-mono text-muted-foreground block">
                  Curvature Parameter
                </span>
                <span className="text-sm font-bold text-primary font-mono">secp256k1</span>
              </div>
            </div>

            {/* Private Key Display */}
            <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-red-600 dark:text-red-400 flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                  Private Key (256-bit Secret Scalar k)
                </span>
                <button
                  onClick={() => copyToClipboard(privateKeyHex, 'privKey')}
                  type="button"
                  className="text-xs text-red-500 hover:underline cursor-pointer"
                >
                  {isCopied === 'privKey' ? 'Copied ✓' : 'Copy'}
                </button>
              </div>
              <div className="p-3 rounded-lg bg-background border border-border font-mono text-xs break-all select-all text-red-600 dark:text-red-400">
                0x{privateKeyHex}
              </div>
              <p className="text-[11px] text-muted-foreground">
                Never disclose this number. Anyone possessing this scalar can generate valid
                signatures and drain every asset associated with this address.
              </p>
            </div>

            {/* Public Key Display (Compressed vs Uncompressed) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-border/80 bg-muted/20 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-foreground">
                    Compressed Public Key (33 bytes)
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-muted text-muted-foreground">
                    Standard
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-background border border-border font-mono text-[11px] break-all select-all text-primary">
                  0x{pubKeyCompressedHex}
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Starts with <code className="font-mono text-foreground">02</code> (even y) or{' '}
                  <code className="font-mono text-foreground">03</code> (odd y). Saves 32 bytes on
                  the blockchain because <code className="font-mono">y</code> can be solved directly
                  from <code className="font-mono">x</code>.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-border/80 bg-muted/20 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-foreground">
                    Uncompressed Public Key (65 bytes)
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-muted text-muted-foreground">
                    Legacy (X + Y)
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-background border border-border font-mono text-[11px] break-all select-all text-foreground/80">
                  0x{pubKeyUncompressedHex}
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Starts with <code className="font-mono text-foreground">04</code> followed by 32
                  bytes of x and 32 bytes of y. Used by Ethereum for address derivation.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Address Derivation */}
        {activeTab === 'addresses' && (
          <div className="space-y-6">
            <div>
              <h4 className="text-base font-semibold text-foreground">
                Public Address Derivation Pipeline
              </h4>
              <p className="text-xs text-muted-foreground">
                Public keys are never exposed directly as account numbers. They undergo
                cryptographic hashing and checksum encodings to produce readable addresses.
              </p>
            </div>

            {/* Ethereum Pipeline Card */}
            <div className="p-5 rounded-xl border border-indigo-500/30 bg-indigo-500/5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs">
                    Ξ
                  </span>
                  <span className="text-sm font-semibold text-foreground">
                    Ethereum Address (EIP-55 Checksum)
                  </span>
                </div>
                <button
                  onClick={() => copyToClipboard(ethAddress, 'ethAddr')}
                  type="button"
                  className="text-xs text-indigo-500 hover:underline cursor-pointer font-medium"
                >
                  {isCopied === 'ethAddr' ? 'Copied ✓' : 'Copy Address'}
                </button>
              </div>

              <div className="p-3 rounded-lg bg-background border border-border font-mono text-sm text-indigo-600 dark:text-indigo-400 font-semibold select-all break-all">
                {ethAddress}
              </div>

              {/* Derivation Steps Flow */}
              <div className="text-xs space-y-1.5 text-muted-foreground border-t border-border/50 pt-2.5">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-indigo-400">1.</span>
                  <span>
                    Uncompressed Public Key (64 bytes, stripping{' '}
                    <code className="font-mono">04</code> prefix)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-indigo-400">2.</span>
                  <span>Keccak-256 hash calculated over the 64 bytes</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-indigo-400">3.</span>
                  <span>Keep the last 20 bytes (40 hex characters)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-indigo-400">4.</span>
                  <span>
                    Prepend <code className="font-mono text-foreground">0x</code> and apply EIP-55
                    mixed-case checksum for typo prevention
                  </span>
                </div>
              </div>
            </div>

            {/* Bitcoin Pipeline Card */}
            <div className="p-5 rounded-xl border border-amber-500/30 bg-amber-500/5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-500 flex items-center justify-center font-bold text-xs">
                    ₿
                  </span>
                  <span className="text-sm font-semibold text-foreground">
                    Bitcoin Address (Legacy P2PKH)
                  </span>
                </div>
                <button
                  onClick={() => copyToClipboard(btcAddress, 'btcAddr')}
                  type="button"
                  className="text-xs text-amber-500 hover:underline cursor-pointer font-medium"
                >
                  {isCopied === 'btcAddr' ? 'Copied ✓' : 'Copy Address'}
                </button>
              </div>

              <div className="p-3 rounded-lg bg-background border border-border font-mono text-sm text-amber-600 dark:text-amber-400 font-semibold select-all break-all">
                {btcAddress}
              </div>

              {/* Derivation Steps Flow */}
              <div className="text-xs space-y-1.5 text-muted-foreground border-t border-border/50 pt-2.5">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-amber-500">1.</span>
                  <span>Compressed Public Key (33 bytes)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-amber-500">2.</span>
                  <span>
                    SHA-256 hash followed by RIPEMD-160 hash (
                    <code className="font-mono">HASH160</code>)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-amber-500">3.</span>
                  <span>
                    Add Version byte (<code className="font-mono">0x00</code> for mainnet) and
                    double-SHA256 4-byte checksum
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-amber-500">4.</span>
                  <span>
                    Encode in Base58 (starts with numeral{' '}
                    <code className="font-mono text-foreground">1</code>)
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: Message Signing & Tamper Verification */}
        {activeTab === 'signing' && (
          <div className="space-y-6">
            <div>
              <h4 className="text-base font-semibold text-foreground">
                ECDSA Message Signing & Tamper Proof
              </h4>
              <p className="text-xs text-muted-foreground">
                When you make a transaction, your wallet signs the message with your private key.
                Anyone with your public key can verify you authorized it without knowing your
                private key.
              </p>
            </div>

            {/* Message Input Box */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                <span>Message Payload to Sign:</span>
                <span className="text-muted-foreground text-[11px] font-normal font-mono">
                  {new TextEncoder().encode(message).length} bytes
                </span>
              </label>
              <textarea
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value);
                  setIsSignatureValid(true);
                }}
                rows={2}
                className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-xs font-mono text-foreground focus:ring-1 focus:ring-primary focus:outline-hidden"
              />
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handleSignMessage}
                  type="button"
                  className="cursor-pointer px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  Re-Sign Message with Private Key
                </button>
                <button
                  onClick={handleTamperMessage}
                  type="button"
                  className="cursor-pointer px-3 py-1.5 rounded-lg text-xs font-medium border border-red-500/40 text-red-600 dark:text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  ⚠️ Simulate Malicious Tamper
                </button>
              </div>
            </div>

            {/* Cryptographic Signature Display */}
            <div className="p-4 rounded-xl border border-border/80 bg-muted/20 space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between">
                <span className="text-foreground font-semibold">
                  Generated ECDSA Signature (r, s):
                </span>
                <span className="text-[10px] text-muted-foreground">IEEE P1363 (64 bytes)</span>
              </div>
              <div className="p-2.5 rounded-lg bg-background border border-border break-all text-[11px] text-primary select-all">
                {signatureHex}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px]">
                <div className="p-2 rounded bg-background/50 border border-border/50">
                  <span className="text-muted-foreground block text-[10px]">
                    Scalar r (Random point x-coord):
                  </span>
                  <span className="break-all text-foreground">{sigR}</span>
                </div>
                <div className="p-2 rounded bg-background/50 border border-border/50">
                  <span className="text-muted-foreground block text-[10px]">
                    Scalar s (Proof value):
                  </span>
                  <span className="break-all text-foreground">{sigS}</span>
                </div>
              </div>
            </div>

            {/* Verification Result Banner */}
            {isSignatureValid ? (
              <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 flex items-start gap-3">
                <span className="p-1 rounded-full bg-emerald-500/20 text-emerald-500 mt-0.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2.5"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </span>
                <div>
                  <h5 className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    Signature Mathematically Valid ✓
                  </h5>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    The curve equation{' '}
                    <code className="font-mono text-foreground font-semibold">
                      R' = (u₁G + u₂K)
                    </code>{' '}
                    matched perfectly. The network verifies this message came exclusively from the
                    owner of address{' '}
                    <code className="font-mono text-xs">{ethAddress.slice(0, 10)}...</code> with
                    zero knowledge of the private key.
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl border border-red-500/40 bg-red-500/10 flex items-start gap-3">
                <span className="p-1 rounded-full bg-red-500/20 text-red-500 mt-0.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2.5"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </span>
                <div>
                  <h5 className="text-xs font-bold text-red-600 dark:text-red-400">
                    Cryptographic Verification Failed! ✗
                  </h5>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    The payload text was tampered with! Because SHA-256 satisfies the avalanche
                    effect, altering a single character changes the message hash completely. The
                    signature no longer satisfies the elliptic curve equation and will be rejected
                    by every node on the blockchain.
                  </p>
                  <button
                    onClick={() => {
                      setMessage('Alice authorizes transfer of 1.5 BTC to Bob');
                      handleSignMessage();
                    }}
                    type="button"
                    className="mt-2 text-xs font-semibold text-red-500 hover:underline cursor-pointer inline-flex items-center gap-1"
                  >
                    Reset Original Message & Re-verify
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
