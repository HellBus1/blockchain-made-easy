import { useState, useEffect } from 'react';

interface Block {
  id: number;
  data: string;
  prevHash: string;
  hash: string;
  nonce: number;
}

async function sha256(str: string): Promise<string> {
  const buffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export default function BlockChainSimulator() {
  const [blocks, setBlocks] = useState<Block[]>([
    {
      id: 1,
      data: 'Genesis: Alice earns 10 Coins',
      prevHash: '0000000000000000000000000000000000000000000000000000000000000000',
      hash: '',
      nonce: 104,
    },
    {
      id: 2,
      data: 'Alice sends 1 Coin to Bob',
      prevHash: '',
      hash: '',
      nonce: 245,
    },
    {
      id: 3,
      data: 'Bob sends 0.5 Coins to Charlie',
      prevHash: '',
      hash: '',
      nonce: 890,
    },
  ]);

  const [hashes, setHashes] = useState<string[]>(['', '', '']);
  const [recomputing, setRecomputing] = useState(false);

  // Recalculate block hashes whenever data or nonce changes
  useEffect(() => {
    async function updateChain() {
      setRecomputing(true);
      const newHashes: string[] = [];

      let currentPrev = blocks[0].prevHash;
      for (let i = 0; i < blocks.length; i++) {
        const b = blocks[i];
        const content = `${b.id}${b.nonce}${b.data}${currentPrev}`;
        const h = await sha256(content);
        newHashes.push(h);
        currentPrev = h;
      }

      setHashes(newHashes);
      setRecomputing(false);
    }

    updateChain();
  }, [blocks]);

  const handleDataChange = (index: number, val: string) => {
    const updated = [...blocks];
    updated[index].data = val;
    setBlocks(updated);
  };

  const handleReset = () => {
    setBlocks([
      {
        id: 1,
        data: 'Genesis: Alice earns 10 Coins',
        prevHash: '0000000000000000000000000000000000000000000000000000000000000000',
        hash: '',
        nonce: 104,
      },
      {
        id: 2,
        data: 'Alice sends 1 Coin to Bob',
        prevHash: '',
        hash: '',
        nonce: 245,
      },
      {
        id: 3,
        data: 'Bob sends 0.5 Coins to Charlie',
        prevHash: '',
        hash: '',
        nonce: 890,
      },
    ]);
  };

  const isTampered = (index: number): boolean => {
    if (index === 0) return blocks[0].data !== 'Genesis: Alice earns 10 Coins';
    if (index === 1) return blocks[1].data !== 'Alice sends 1 Coin to Bob' || isTampered(0);
    if (index === 2) return blocks[2].data !== 'Bob sends 0.5 Coins to Charlie' || isTampered(1);
    return false;
  };

  return (
    <div className="my-6 rounded-2xl border border-sky-500/20 bg-slate-950/80 p-5 shadow-xl font-sans not-content">
      <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-3 mb-4 gap-2">
        <div className="flex items-center gap-2">
          <span className="flex h-3 w-3 rounded-full bg-cyan-400 animate-pulse"></span>
          <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
            Interactive Lab • Cryptographic Hash Chain Simulator
          </span>
        </div>
        <button
          onClick={handleReset}
          className="text-xs rounded border border-slate-700 bg-slate-800 px-2.5 py-1 text-slate-300 hover:bg-slate-700 transition"
        >
          Reset Chain
        </button>
      </div>

      <p className="text-xs text-slate-400 mb-4">
        Try modifying the text in <strong>Block #1</strong> or <strong>Block #2</strong>. Notice how
        the mathematical fingerprint breaks and cascades an unforgeable tamper alert down the entire
        chain!
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {blocks.map((block, i) => {
          const tampered = isTampered(i);
          const prevH = i === 0 ? block.prevHash : hashes[i - 1] || '...';
          const currentH = hashes[i] || '...';

          return (
            <div
              key={block.id}
              className={`rounded-xl border p-4 transition-all duration-300 ${
                tampered
                  ? 'border-rose-500/70 bg-rose-950/20 shadow-lg shadow-rose-950/40'
                  : 'border-emerald-500/40 bg-slate-900/90'
              }`}
            >
              <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
                <span className="font-bold text-sm text-slate-100">Block #{block.id}</span>
                <span
                  className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                    tampered
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  }`}
                >
                  {tampered ? '⚠ Tampered / Invalid' : '✓ Valid Block'}
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-slate-400 font-medium block mb-1">
                    Transaction Ledger Data:
                  </span>
                  <input
                    type="text"
                    value={block.data}
                    onChange={(e) => handleDataChange(i, e.target.value)}
                    className="w-full rounded border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-xs font-mono text-slate-200 focus:border-cyan-400 focus:outline-none"
                  />
                </div>

                <div>
                  <span className="text-slate-400 font-medium block mb-0.5">Previous Hash:</span>
                  <div className="rounded bg-slate-950 p-1.5 font-mono text-[10px] text-slate-400 truncate">
                    {prevH}
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 font-medium block mb-0.5">Block Seal Hash:</span>
                  <div
                    className={`rounded p-1.5 font-mono text-[10px] truncate ${
                      tampered ? 'bg-rose-950/40 text-rose-300' : 'bg-slate-950 text-cyan-300'
                    }`}
                  >
                    {recomputing ? 'Recomputing...' : currentH}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
