import { useState, useEffect } from 'react';

export default function HashPlayground() {
  const [input, setInput] = useState('Alice sends 1 Coin to Bob');
  const [hash, setHash] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isCancelled = false;

    async function calculateHash() {
      setLoading(true);
      try {
        const msgUint8 = new TextEncoder().encode(input);
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
        if (!isCancelled) {
          setHash(hashHex);
          setLoading(false);
        }
      } catch {
        if (!isCancelled) {
          setHash('Error generating hash');
          setLoading(false);
        }
      }
    }

    calculateHash();

    return () => {
      isCancelled = true;
    };
  }, [input]);

  return (
    <div className="my-6 rounded-2xl border border-sky-500/20 bg-slate-950/80 p-5 shadow-xl font-sans not-content">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <span className="flex h-3 w-3 rounded-full bg-cyan-400 animate-pulse"></span>
          <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
            Interactive Lab • SHA-256 Hash Engine
          </span>
        </div>
        <span className="text-xs font-mono text-slate-400">256-bit Fixed Fingerprint</span>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wide">
            Input Transaction Data (Try changing a single letter or punctuation):
          </label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={2}
            className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3.5 py-2.5 text-sm font-mono text-slate-100 placeholder-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
            placeholder="Type any message..."
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wide">
              Computed Cryptographic Hash (SHA-256 Output):
            </label>
            <span className="text-xs text-slate-500 font-mono">64 Hex Characters</span>
          </div>
          <div className="relative rounded-lg border border-cyan-500/30 bg-slate-900/90 p-3.5 font-mono text-xs text-cyan-300 break-all select-all flex items-center min-h-[46px]">
            {loading ? <span className="text-slate-500 animate-pulse">Hashing...</span> : hash}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 pt-1 text-xs">
          <span className="text-slate-400">Quick Test Cases:</span>
          <button
            onClick={() => setInput('Alice sends 1 Coin to Bob')}
            className="rounded bg-slate-800 hover:bg-slate-700 px-2.5 py-1 text-slate-200 border border-slate-700 transition"
          >
            "Alice sends 1 Coin to Bob"
          </button>
          <button
            onClick={() => setInput('Alice sends 1 coin to Bob')}
            className="rounded bg-slate-800 hover:bg-slate-700 px-2.5 py-1 text-slate-200 border border-slate-700 transition"
          >
            lowercase "coin" (Watch it change!)
          </button>
          <button
            onClick={() => setInput('Alice sends 1 Coin to Bob.')}
            className="rounded bg-slate-800 hover:bg-slate-700 px-2.5 py-1 text-slate-200 border border-slate-700 transition"
          >
            Added period "."
          </button>
        </div>
      </div>
    </div>
  );
}
