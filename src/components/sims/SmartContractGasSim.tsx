import { useState } from 'react';

interface TxPreset {
  id: string;
  name: string;
  gasUnits: number;
  description: string;
  category: 'transfer' | 'defi' | 'nft';
  opcodes: { op: string; cost: number; desc: string }[];
}

const PRESETS: TxPreset[] = [
  {
    id: 'eth_transfer',
    name: 'Simple ETH Transfer',
    gasUnits: 21000,
    description: 'Native transfer from one address to another. Standard fixed cost.',
    category: 'transfer',
    opcodes: [
      { op: 'STANDARD_TX', cost: 21000, desc: 'Base intrinsic transaction gas & ECDSA signature' },
    ],
  },
  {
    id: 'erc20_transfer',
    name: 'USDC / USDT Transfer',
    gasUnits: 65000,
    description:
      'Calls transfer() on an ERC-20 smart contract. Updates sender & recipient balances in storage.',
    category: 'transfer',
    opcodes: [
      { op: 'PUSH4 / CALLDATALOAD', cost: 12, desc: 'Load function selector & arguments' },
      { op: 'SLOAD (Balance check)', cost: 2100, desc: 'Cold storage read of sender balance' },
      { op: 'SSTORE (Deduct balance)', cost: 5000, desc: 'Storage write updating sender balance' },
      {
        op: 'SSTORE (Credit balance)',
        cost: 20000,
        desc: 'Storage write creating/updating receiver balance',
      },
      {
        op: 'LOG3 (Transfer event)',
        cost: 1875,
        desc: 'Emit Transfer event for indexers & wallets',
      },
    ],
  },
  {
    id: 'dex_swap',
    name: 'Uniswap Token Swap',
    gasUnits: 165000,
    description:
      'Swaps token A for token B via an Automated Market Maker (AMM) pool. Involves math, fee deduction & multi-contract calls.',
    category: 'defi',
    opcodes: [
      { op: 'CALL (Router to Pool)', cost: 2600, desc: 'External contract invocation' },
      { op: 'SLOAD (Reserves x & y)', cost: 4200, desc: 'Read token reserves from storage' },
      {
        op: 'MUL / DIV / ADD (AMM math)',
        cost: 150,
        desc: 'Compute constant product output (x * y = k)',
      },
      {
        op: 'TRANSFER_FROM & SSTORE',
        cost: 45000,
        desc: 'Transfer token A in, write new reserves',
      },
      { op: 'TRANSFER & SSTORE', cost: 45000, desc: 'Transfer token B out to recipient' },
      { op: 'LOG4 (Swap event)', cost: 2400, desc: 'Log price, tick, and swap amounts' },
    ],
  },
  {
    id: 'nft_mint',
    name: 'NFT Mint / Claim',
    gasUnits: 120000,
    description:
      'Mints a unique ERC-721 token. Writes token ID ownership, increments total supply, and emits events.',
    category: 'nft',
    opcodes: [
      {
        op: 'SLOAD (Check supply & whitelist)',
        cost: 4200,
        desc: 'Read max supply & verify Merkle proof',
      },
      {
        op: 'SSTORE (Mint new token ID)',
        cost: 20000,
        desc: 'Initialize token ownership in storage',
      },
      { op: 'SSTORE (Increment count)', cost: 5000, desc: 'Update total supply counter' },
      { op: 'LOG4 (Transfer 0x0 -> user)', cost: 2400, desc: 'Emit mint event' },
    ],
  },
  {
    id: 'defi_deposit',
    name: 'Aave / Compound Yield Deposit',
    gasUnits: 280000,
    description:
      'Deposits stablecoins into a lending pool. Mints interest-bearing aTokens and updates dynamic interest rate curves.',
    category: 'defi',
    opcodes: [
      { op: 'CALL (Lending Pool)', cost: 2600, desc: 'Call core lending contract' },
      {
        op: 'SLOAD (Reserve indices)',
        cost: 6300,
        desc: 'Calculate accrued compounding interest index',
      },
      { op: 'TRANSFER_FROM (USDC in)', cost: 45000, desc: 'Pull stablecoins from user wallet' },
      {
        op: 'MINT (Interest tokens)',
        cost: 55000,
        desc: 'Mint receipt tokens representing deposited shares',
      },
      {
        op: 'SSTORE (State updates)',
        cost: 40000,
        desc: 'Update total liquidity & utilization rate',
      },
    ],
  },
];

export default function SmartContractGasSim() {
  const [selectedPresetId, setSelectedPresetId] = useState<string>('dex_swap');
  const [baseFeeGwei, setBaseFeeGwei] = useState<number>(25); // 25 Gwei
  const [priorityFeeGwei, setPriorityFeeGwei] = useState<number>(2); // 2 Gwei
  const [ethPriceUsd, setEthPriceUsd] = useState<number>(3200); // $3,200

  const activePreset = PRESETS.find((p) => p.id === selectedPresetId) || PRESETS[0];

  // Mathematical Gas Calculations under EIP-1559
  const effectiveGasPriceGwei = baseFeeGwei + priorityFeeGwei;
  const effectiveGasPriceEth = effectiveGasPriceGwei / 1e9;
  const totalCostEth = activePreset.gasUnits * effectiveGasPriceEth;
  const totalCostUsd = totalCostEth * ethPriceUsd;

  // Base Fee Burned vs Validator Tip
  const burnedEth = activePreset.gasUnits * (baseFeeGwei / 1e9);
  const burnedUsd = burnedEth * ethPriceUsd;
  const tipEth = activePreset.gasUnits * (priorityFeeGwei / 1e9);
  const tipUsd = tipEth * ethPriceUsd;

  // L2 Rollup Calculations (Typical 95% - 99% cost reduction via calldata compression)
  const arbitrumCostUsd = Math.max(0.01, totalCostUsd * 0.035);
  const baseCostUsd = Math.max(0.01, totalCostUsd * 0.015);
  const optimismCostUsd = Math.max(0.01, totalCostUsd * 0.025);

  const getNetworkStatus = (gwei: number) => {
    if (gwei <= 15) return { label: 'Quiet / Low Congestion', color: 'text-emerald-500' };
    if (gwei <= 40) return { label: 'Moderate Traffic', color: 'text-blue-500' };
    if (gwei <= 80) return { label: 'Heavy Congestion', color: 'text-amber-500' };
    return { label: 'Extreme Gas Surge (Bull Run / NFT Mania)', color: 'text-rose-500' };
  };

  const netStatus = getNetworkStatus(baseFeeGwei);

  return (
    <div className="my-8 rounded-2xl border border-border bg-card/80 p-5 md:p-7 shadow-lg backdrop-blur-sm">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-border/60 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 mb-2">
            <span>⚡ Interactive Simulation</span>
            <span>•</span>
            <span>EVM & Gas Economics</span>
          </div>
          <h3 className="text-xl font-bold tracking-tight text-foreground m-0">
            EVM Gas Engine & Layer 2 Savings Calculator
          </h3>
          <p className="text-xs text-muted-foreground mt-1 mb-0">
            Simulate how opcode execution costs in smart contracts translate directly into real fiat
            cash fees under EIP-1559.
          </p>
        </div>

        <div className="text-right bg-muted/40 px-3 py-2 rounded-xl border border-border/50">
          <div className="text-[11px] font-mono text-muted-foreground uppercase">
            Network Status
          </div>
          <div className={`text-xs font-bold font-mono ${netStatus.color}`}>{netStatus.label}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
        {/* Left Column: Transaction Type Presets & Sliders */}
        <div className="lg:col-span-7 space-y-5">
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
              1. Select Smart Contract Action
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {PRESETS.map((p) => {
                const isSelected = p.id === selectedPresetId;
                return (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPresetId(p.id)}
                    className={`text-left p-3 rounded-xl border text-xs transition-all ${
                      isSelected
                        ? 'border-primary bg-primary/10 text-primary font-semibold ring-1 ring-primary/40'
                        : 'border-border bg-card hover:border-primary/40 text-foreground'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span>{p.name}</span>
                      <span className="font-mono text-[11px] text-muted-foreground font-normal">
                        {p.gasUnits.toLocaleString()} gas
                      </span>
                    </div>
                    <div className="text-[11px] text-muted-foreground line-clamp-1">
                      {p.description}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Interactive Parameters */}
          <div className="p-4 rounded-xl border border-border bg-muted/20 space-y-4">
            <div className="text-xs font-bold text-foreground flex items-center justify-between">
              <span>2. Network Variables</span>
              <span className="font-mono text-muted-foreground text-[11px]">
                Formula: Gas × (Base + Tip)
              </span>
            </div>

            {/* Base Fee Slider */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-muted-foreground">
                  EIP-1559 Base Fee (Algorithmically Burned):
                </span>
                <span className="font-mono font-bold text-foreground">{baseFeeGwei} Gwei</span>
              </div>
              <input
                type="range"
                min="5"
                max="120"
                step="1"
                value={baseFeeGwei}
                onChange={(e) => setBaseFeeGwei(Number(e.target.value))}
                className="w-full accent-primary h-2 bg-muted rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground font-mono mt-1">
                <span>5 Gwei (Quiet weekend)</span>
                <span>40 Gwei (Busy day)</span>
                <span>120 Gwei (Peak hype)</span>
              </div>
            </div>

            {/* Priority Fee Slider */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-muted-foreground">
                  Priority Tip (Paid to Validator for Speed):
                </span>
                <span className="font-mono font-bold text-foreground">{priorityFeeGwei} Gwei</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                step="0.5"
                value={priorityFeeGwei}
                onChange={(e) => setPriorityFeeGwei(Number(e.target.value))}
                className="w-full accent-primary h-2 bg-muted rounded-lg cursor-pointer"
              />
            </div>

            {/* ETH Price Slider */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-muted-foreground">Ethereum Market Price:</span>
                <span className="font-mono font-bold text-foreground">
                  ${ethPriceUsd.toLocaleString()}
                </span>
              </div>
              <input
                type="range"
                min="1500"
                max="6000"
                step="100"
                value={ethPriceUsd}
                onChange={(e) => setEthPriceUsd(Number(e.target.value))}
                className="w-full accent-primary h-2 bg-muted rounded-lg cursor-pointer"
              />
            </div>
          </div>

          {/* Opcode Cost Breakdown */}
          <div className="p-4 rounded-xl border border-border bg-card">
            <h4 className="text-xs font-bold text-foreground mb-2 flex items-center justify-between">
              <span>EVM Opcode Breakdown for {activePreset.name}</span>
              <span className="text-[11px] font-mono text-muted-foreground font-normal">
                Why does this action cost {activePreset.gasUnits.toLocaleString()} units?
              </span>
            </h4>
            <div className="space-y-2 mt-2">
              {activePreset.opcodes.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between text-xs p-2 rounded-lg bg-muted/30 border border-border/40 font-mono"
                >
                  <div>
                    <span className="text-primary font-bold mr-2">{item.op}</span>
                    <span className="text-[11px] text-muted-foreground font-sans">{item.desc}</span>
                  </div>
                  <span className="font-semibold text-foreground">
                    ~{item.cost.toLocaleString()} gas
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Fiat Cost Breakdown & L1 vs L2 Comparison */}
        <div className="lg:col-span-5 space-y-5">
          {/* Ethereum L1 Mainnet Cost Card */}
          <div className="p-5 rounded-2xl border-2 border-rose-500/30 bg-rose-500/5 relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-500">
                Ethereum L1 Mainnet Fee
              </span>
              <span className="text-[11px] font-mono bg-rose-500/10 text-rose-500 px-2 py-0.5 rounded font-bold">
                Heavy Cost
              </span>
            </div>

            <div className="text-3xl font-extrabold font-mono text-foreground tracking-tight">
              ${totalCostUsd.toFixed(2)}
            </div>
            <div className="text-xs font-mono text-muted-foreground mt-1">
              {totalCostEth.toFixed(6)} ETH @ {effectiveGasPriceGwei} Gwei
            </div>

            <div className="mt-4 pt-4 border-t border-rose-500/20 grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-[11px] text-muted-foreground block">Base Fee Burned:</span>
                <span className="font-mono font-bold text-foreground">
                  ${burnedUsd.toFixed(2)} ({burnedEth.toFixed(5)} ETH)
                </span>
              </div>
              <div>
                <span className="text-[11px] text-muted-foreground block">Validator Tip:</span>
                <span className="font-mono font-bold text-foreground">
                  ${tipUsd.toFixed(2)} ({tipEth.toFixed(5)} ETH)
                </span>
              </div>
            </div>
          </div>

          {/* Layer 2 Savings Table */}
          <div className="p-5 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-emerald-600 dark:text-emerald-400 m-0">
                  Layer 2 Rollup Cost (95%+ Cheaper)
                </h4>
                <p className="text-[11px] text-muted-foreground mt-0.5 mb-0">
                  How modern Web3 DeFi earners protect their profit margins from gas erosion:
                </p>
              </div>
              <span className="text-xs font-mono font-bold bg-emerald-500/10 text-emerald-500 px-2 py-1 rounded">
                Profit Safe
              </span>
            </div>

            <div className="space-y-2.5">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-card border border-border text-xs">
                <div>
                  <div className="font-bold text-foreground">Base (Coinbase L2)</div>
                  <div className="text-[10px] text-muted-foreground">EIP-4844 Blob compression</div>
                </div>
                <div className="text-right">
                  <div className="font-mono font-bold text-emerald-500">
                    ${baseCostUsd.toFixed(2)}
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    Save ${(totalCostUsd - baseCostUsd).toFixed(2)} (98.5%)
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-card border border-border text-xs">
                <div>
                  <div className="font-bold text-foreground">Arbitrum One</div>
                  <div className="text-[10px] text-muted-foreground">
                    Nitro multi-round fraud proof
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono font-bold text-emerald-500">
                    ${arbitrumCostUsd.toFixed(2)}
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    Save ${(totalCostUsd - arbitrumCostUsd).toFixed(2)} (96.5%)
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-card border border-border text-xs">
                <div>
                  <div className="font-bold text-foreground">Optimism (OP Mainnet)</div>
                  <div className="text-[10px] text-muted-foreground">
                    OP Stack rollup architecture
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono font-bold text-emerald-500">
                    ${optimismCostUsd.toFixed(2)}
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    Save ${(totalCostUsd - optimismCostUsd).toFixed(2)} (97.5%)
                  </div>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-muted/40 border border-border/50 text-[11px] text-muted-foreground leading-relaxed">
              💡 <strong>Income Rule:</strong> If you perform 20 yield-farming claims or token swaps
              a month on L1, you burn{' '}
              <strong className="text-rose-500 font-mono">${(totalCostUsd * 20).toFixed(0)}</strong>{' '}
              in fees. Moving that exact same capital to <strong>Base or Arbitrum</strong> cuts your
              annual fee overhead from thousands of dollars down to just{' '}
              <strong className="text-emerald-500 font-mono">
                ${(baseCostUsd * 20 * 12).toFixed(0)}
              </strong>
              !
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
