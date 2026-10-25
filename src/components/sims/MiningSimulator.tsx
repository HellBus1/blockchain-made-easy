import { useState } from 'react';

async function sha256(str: string): Promise<string> {
  const buffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export default function MiningSimulator() {
  const [activeTab, setActiveTab] = useState<'pow' | 'pos'>('pow');
  const [difficulty, setDifficulty] = useState<number>(3); // 3 leading zeros
  const [nonce, setNonce] = useState<number>(0);
  const [hash, setHash] = useState<string>('Click "Start Mining" to begin hash race...');
  const [isMining, setIsMining] = useState<boolean>(false);
  const [minedBlock, setMinedBlock] = useState<boolean>(false);
  const [hashRate, setHashRate] = useState<number>(0);

  // PoS State
  const [stakedAmount, setStakedAmount] = useState<number>(32);
  const [validatorStatus, setValidatorStatus] = useState<string>('Active & Attesting');
  const [rewardsEarned, setRewardsEarned] = useState<number>(0.125);
  const [slashed, setSlashed] = useState<boolean>(false);

  const startMining = async () => {
    setIsMining(true);
    setMinedBlock(false);
    const prefix = '0'.repeat(difficulty);
    const blockData = 'Block #102: Alice -> Bob 1 Coin | Charlie -> Dave 0.5 Coin';

    let currentNonce = 0;
    const startTime = performance.now();

    while (true) {
      currentNonce++;
      const candidateHash = await sha256(`${blockData}${currentNonce}`);

      if (candidateHash.startsWith(prefix)) {
        setNonce(currentNonce);
        setHash(candidateHash);
        setIsMining(false);
        setMinedBlock(true);
        const duration = (performance.now() - startTime) / 1000;
        setHashRate(Math.round(currentNonce / Math.max(duration, 0.01)));
        break;
      }

      // Update UI periodically so it doesn't freeze
      if (currentNonce % 70 === 0) {
        setNonce(currentNonce);
        setHash(candidateHash);
        await new Promise((r) => setTimeout(r, 0));
      }
    }
  };

  const handleSlash = () => {
    setSlashed(true);
    setStakedAmount(0);
    setValidatorStatus('SLASHED: Proposed Invalid Double-Spend Block!');
  };

  const handleResetPoS = () => {
    setSlashed(false);
    setStakedAmount(32);
    setValidatorStatus('Active & Attesting');
    setRewardsEarned(0.125);
  };

  return (
    <div className="my-6 rounded-2xl border border-sky-500/20 bg-slate-950/80 p-5 shadow-xl font-sans not-content">
      <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-3 mb-4 gap-2">
        <div className="flex items-center gap-2">
          <span className="flex h-3 w-3 rounded-full bg-cyan-400 animate-pulse"></span>
          <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
            Interactive Lab • Consensus Mechanism Simulator
          </span>
        </div>

        <div className="flex rounded-lg bg-slate-900 p-0.5 border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('pow')}
            className={`px-3 py-1 rounded-md font-semibold transition ${
              activeTab === 'pow'
                ? 'bg-cyan-500 text-slate-950'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Proof-of-Work (PoW)
          </button>
          <button
            onClick={() => setActiveTab('pos')}
            className={`px-3 py-1 rounded-md font-semibold transition ${
              activeTab === 'pos'
                ? 'bg-cyan-500 text-slate-950'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Proof-of-Stake (PoS)
          </button>
        </div>
      </div>

      {activeTab === 'pow' ? (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="text-slate-300">
              Mining Difficulty Target: <strong>{difficulty} Leading Zeros</strong>
            </span>
            <div className="flex items-center gap-2">
              <span className="text-slate-500">Difficulty:</span>
              <button
                onClick={() => setDifficulty(2)}
                disabled={isMining}
                className={`px-2 py-0.5 rounded border ${
                  difficulty === 2
                    ? 'border-cyan-400 text-cyan-300 bg-cyan-950/30'
                    : 'border-slate-700 text-slate-400'
                }`}
              >
                Easy (2 zeros)
              </button>
              <button
                onClick={() => setDifficulty(3)}
                disabled={isMining}
                className={`px-2 py-0.5 rounded border ${
                  difficulty === 3
                    ? 'border-cyan-400 text-cyan-300 bg-cyan-950/30'
                    : 'border-slate-700 text-slate-400'
                }`}
              >
                Standard (3 zeros)
              </button>
              <button
                onClick={() => setDifficulty(4)}
                disabled={isMining}
                className={`px-2 py-0.5 rounded border ${
                  difficulty === 4
                    ? 'border-cyan-400 text-cyan-300 bg-cyan-950/30'
                    : 'border-slate-700 text-slate-400'
                }`}
              >
                Hard (4 zeros)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3">
              <span className="text-slate-400 block mb-1">Nonces Checked:</span>
              <span className="text-lg font-mono font-bold text-slate-100">
                {nonce.toLocaleString()}
              </span>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3">
              <span className="text-slate-400 block mb-1">Hash Rate:</span>
              <span className="text-lg font-mono font-bold text-slate-100">
                {hashRate ? `${hashRate} H/s` : isMining ? 'Calculating...' : '0 H/s'}
              </span>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3">
              <span className="text-slate-400 block mb-1">Protocol Reward:</span>
              <span className="text-lg font-mono font-bold text-amber-400">+3.125 BTC</span>
            </div>
          </div>

          <div>
            <span className="text-xs text-slate-400 font-medium block mb-1">
              Live Mining Hash Output:
            </span>
            <div
              className={`rounded-lg border p-3 font-mono text-xs break-all transition ${
                minedBlock
                  ? 'border-emerald-500 bg-emerald-950/30 text-emerald-300'
                  : 'border-slate-800 bg-slate-900 text-slate-300'
              }`}
            >
              {hash}
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <button
              onClick={startMining}
              disabled={isMining}
              className={`px-5 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 transition ${
                isMining
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950'
              }`}
            >
              {isMining
                ? '⛏ Mining In Progress...'
                : minedBlock
                  ? '⛏ Mine Next Block'
                  : '⛏ Start Mining (Solve Math Lock)'}
            </button>

            {minedBlock && (
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <span>✓</span> Block #102 Validated & Sealed into Global Blockchain!
              </span>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-4 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3">
              <span className="text-slate-400 block mb-1">Security Deposit (Stake):</span>
              <span
                className={`text-lg font-mono font-bold ${slashed ? 'text-rose-400 line-through' : 'text-cyan-400'}`}
              >
                {stakedAmount} ETH
              </span>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3">
              <span className="text-slate-400 block mb-1">Validator Status:</span>
              <span
                className={`text-sm font-bold ${slashed ? 'text-rose-400' : 'text-emerald-400'}`}
              >
                {validatorStatus}
              </span>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3">
              <span className="text-slate-400 block mb-1">Attestation Earnings:</span>
              <span className="text-lg font-mono font-bold text-amber-400">
                +{rewardsEarned} ETH
              </span>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/50 space-y-2">
            <p className="text-slate-300">
              In <strong>Proof-of-Stake</strong>, you do not burn electricity to solve math puzzles.
              Instead, validators put up their own digital assets as collateral (typically 32 ETH).
              If the validator accurately attests to valid blocks, they earn interest rewards.
            </p>
            <p className="text-rose-400/90">
              <strong>The Penalty (Slashing)</strong>: If a validator submits conflicting blocks or
              attempts a double-spend, their security deposit is automatically destroyed (burned) by
              the protocol.
            </p>
          </div>

          <div className="flex items-center gap-3 pt-2">
            {!slashed ? (
              <button
                onClick={handleSlash}
                className="px-4 py-2 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 font-semibold transition"
              >
                Simulate Malicious Cheating Attempt (Trigger Slashing)
              </button>
            ) : (
              <button
                onClick={handleResetPoS}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold transition"
              >
                Reset Validator Stake (32 ETH)
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
