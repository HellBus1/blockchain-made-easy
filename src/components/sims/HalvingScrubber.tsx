import { useState } from 'react';

interface Epoch {
  year: string;
  epochNum: number;
  reward: number;
  circulating: number;
  percent: number;
  description: string;
}

const EPOCHS: Epoch[] = [
  {
    year: '2009',
    epochNum: 1,
    reward: 50,
    circulating: 10500000,
    percent: 50.0,
    description: 'Genesis launch by Satoshi Nakamoto. First 210,000 blocks minted.',
  },
  {
    year: '2012',
    epochNum: 2,
    reward: 25,
    circulating: 15750000,
    percent: 75.0,
    description: 'First Halving: Reward drops to 25 BTC. 75% of all coins in existence.',
  },
  {
    year: '2016',
    epochNum: 3,
    reward: 12.5,
    circulating: 18375000,
    percent: 87.5,
    description: 'Second Halving: Reward drops to 12.5 BTC. Global adoption accelerates.',
  },
  {
    year: '2020',
    epochNum: 4,
    reward: 6.25,
    circulating: 19687500,
    percent: 93.75,
    description: 'Third Halving: Reward drops to 6.25 BTC amidst global macro shifts.',
  },
  {
    year: '2024',
    epochNum: 5,
    reward: 3.125,
    circulating: 20343750,
    percent: 96.875,
    description: 'Fourth Halving (Current): Reward drops to 3.125 BTC per block.',
  },
  {
    year: '2028',
    epochNum: 6,
    reward: 1.5625,
    circulating: 20671875,
    percent: 98.438,
    description: 'Fifth Halving: Reward drops to 1.5625 BTC. Less than 2% left to mine.',
  },
  {
    year: '2140',
    epochNum: 33,
    reward: 0,
    circulating: 21000000,
    percent: 100.0,
    description: 'Final Satoshi minted! Miners earn 100% of revenue from transaction fees alone.',
  },
];

export default function HalvingScrubber() {
  const [selectedIdx, setSelectedIdx] = useState<number>(4); // Default to current epoch (2024)
  const current = EPOCHS[selectedIdx];

  return (
    <div className="my-6 rounded-2xl border border-sky-500/20 bg-slate-950/80 p-5 shadow-xl font-sans not-content">
      <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-3 mb-4 gap-2">
        <div className="flex items-center gap-2">
          <span className="flex h-3 w-3 rounded-full bg-amber-400 animate-pulse"></span>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
            Interactive Lab • Enforced Scarcity & Halving Engine
          </span>
        </div>
        <span className="text-xs font-mono text-slate-400">21,000,000 Hard Cap</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3 text-xs">
          <span className="text-slate-400 block mb-1">Block Reward (Per Block):</span>
          <span className="text-xl font-mono font-bold text-amber-400">{current.reward} BTC</span>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3 text-xs">
          <span className="text-slate-400 block mb-1">Circulating Supply:</span>
          <span className="text-xl font-mono font-bold text-cyan-300">
            {current.circulating.toLocaleString()} BTC
          </span>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3 text-xs">
          <span className="text-slate-400 block mb-1">Percent of Total Supply:</span>
          <span className="text-xl font-mono font-bold text-emerald-400">{current.percent}%</span>
        </div>
      </div>

      {/* Visual Supply Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-xs text-slate-400 mb-1.5 font-medium">
          <span>0 BTC (2009)</span>
          <span>Current: {current.percent}% Minted</span>
          <span>21M Max Hard Cap</span>
        </div>
        <div className="h-3 w-full rounded-full bg-slate-800 overflow-hidden p-0.5 border border-slate-700">
          <div
            className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-amber-400 transition-all duration-300"
            style={{ width: `${current.percent}%` }}
          ></div>
        </div>
      </div>

      {/* Epoch Stepper Buttons */}
      <div className="space-y-2 mb-4">
        <span className="text-xs font-semibold text-slate-300 uppercase tracking-wide block">
          Select Halving Epoch:
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
          {EPOCHS.map((ep, i) => (
            <button
              key={ep.year}
              onClick={() => setSelectedIdx(i)}
              className={`p-2 rounded-lg border text-left transition ${
                selectedIdx === i
                  ? 'border-amber-400 bg-amber-950/30 text-amber-300 font-bold shadow-md shadow-amber-950/40'
                  : 'border-slate-800 bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <div className="text-[10px] text-slate-500 uppercase">Epoch {ep.epochNum}</div>
              <div className="text-xs font-mono">{ep.year}</div>
              <div className="text-[11px] text-amber-400 font-medium">{ep.reward} BTC</div>
            </button>
          ))}
        </div>
      </div>

      {/* Epoch Detail Note */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3.5 text-xs text-slate-300">
        <span className="font-bold text-cyan-400 mr-2">Epoch Note:</span>
        {current.description}
      </div>
    </div>
  );
}
