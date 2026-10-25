import { useState } from 'react';

export default function DexLiquiditySim() {
  // Deposit Capital Settings
  const initialEthPrice = 3000; // Benchmark initial price $3,000
  const [userEthDeposit, setUserEthDeposit] = useState<number>(1.0); // 1.0 ETH
  const [feeTier, setFeeTier] = useState<number>(0.3); // 0.3% standard Uniswap fee
  const [dailyPoolVolume, setDailyPoolVolume] = useState<number>(2500000); // $2.5M daily volume
  const totalPoolLiquidity = 25000000; // $25M pool size
  const [daysActive, setDaysActive] = useState<number>(30); // 30 days
  const [newEthPrice, setNewEthPrice] = useState<number>(3600); // Price moved to $3,600

  // Total Initial Deposit: 50% in ETH, 50% in USDC
  const initialUserUsdc = userEthDeposit * initialEthPrice;
  const initialTotalDepositUsd = initialUserUsdc * 2; // e.g. $3,000 USDC + 1 ETH ($3,000) = $6,000

  // User's Share of the Liquidity Pool
  const userSharePct = (initialTotalDepositUsd / totalPoolLiquidity) * 100;

  // Trading Fee Revenue Generated
  const dailyTotalPoolFees = dailyPoolVolume * (feeTier / 100);
  const userDailyFeesUsd = dailyTotalPoolFees * (userSharePct / 100);
  const totalFeesEarnedUsd = userDailyFeesUsd * daysActive;

  // Constant Product AMM Math (x * y = k)
  // Price ratio r = newPrice / initialPrice
  const priceRatio = newEthPrice / initialEthPrice;

  // Value if HODL (Simply kept the 1 ETH + $3,000 USDC in wallet)
  const hodlValueUsd = initialUserUsdc + userEthDeposit * newEthPrice;

  // Value in Pool after AMM Arbitrageurs rebalance:
  // V_pool = 2 * V_0 * sqrt(r) / (1 + r) * HODL
  // Standard Impermanent Loss formula: IL = 2 * sqrt(r) / (1 + r) - 1
  const ilFraction = (2 * Math.sqrt(priceRatio)) / (1 + priceRatio) - 1;
  const ilPct = ilFraction * 100; // Will be 0 or negative
  const poolValueUsd = hodlValueUsd * (1 + ilFraction);
  const ilLossDollars = Math.abs(hodlValueUsd - poolValueUsd);

  // Net Return with Fees included
  const netValueUsd = poolValueUsd + totalFeesEarnedUsd;
  const netProfitVsInitial = netValueUsd - initialTotalDepositUsd;
  const netProfitVsHodl = netValueUsd - hodlValueUsd;
  const annualizedApy = (totalFeesEarnedUsd / initialTotalDepositUsd) * (365 / daysActive) * 100;

  return (
    <div className="my-8 rounded-2xl border border-border bg-card/80 p-5 md:p-7 shadow-lg backdrop-blur-sm">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-border/60 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 mb-2">
            <span>💧 DEX Liquidity Lab</span>
            <span>•</span>
            <span>Passive Yield & Impermanent Loss</span>
          </div>
          <h3 className="text-xl font-bold tracking-tight text-foreground m-0">
            Automated Market Maker (AMM) Income Simulator
          </h3>
          <p className="text-xs text-muted-foreground mt-1 mb-0">
            Model real yield earnings from Uniswap-style liquidity pools and understand how
            Impermanent Loss affects your net profit.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-right bg-muted/40 px-3 py-2 rounded-xl border border-border/50 font-mono">
            <div className="text-[11px] text-muted-foreground uppercase">Pool Share</div>
            <div className="text-xs font-bold text-primary">{userSharePct.toFixed(4)}%</div>
          </div>
          <div className="text-right bg-emerald-500/10 px-3 py-2 rounded-xl border border-emerald-500/20 font-mono">
            <div className="text-[11px] text-emerald-600 dark:text-emerald-400 uppercase">
              Fee APY
            </div>
            <div className="text-xs font-bold text-emerald-500">{annualizedApy.toFixed(1)}%</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
        {/* Left Column: Pool Controls */}
        <div className="lg:col-span-7 space-y-5">
          <div className="p-4 rounded-xl border border-border bg-muted/20 space-y-4">
            <div className="text-xs font-bold text-foreground flex items-center justify-between">
              <span>1. Your Initial Liquidity Deposit</span>
              <span className="font-mono text-muted-foreground text-[11px]">
                Total: ${initialTotalDepositUsd.toLocaleString()}
              </span>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-muted-foreground">ETH Deposited (+ matching 50% USDC):</span>
                <span className="font-mono font-bold text-foreground">
                  {userEthDeposit} ETH + ${(userEthDeposit * initialEthPrice).toLocaleString()} USDC
                </span>
              </div>
              <input
                type="range"
                min="0.1"
                max="5"
                step="0.1"
                value={userEthDeposit}
                onChange={(e) => setUserEthDeposit(Number(e.target.value))}
                className="w-full accent-primary h-2 bg-muted rounded-lg cursor-pointer"
              />
            </div>

            {/* Fee Tier Selection */}
            <div>
              <label className="text-xs text-muted-foreground block mb-1.5">
                Pool Fee Tier (Deducted from every trader swap):
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { tier: 0.05, label: '0.05% (Stablecoins)' },
                  { tier: 0.3, label: '0.30% (ETH/USDC)' },
                  { tier: 1.0, label: '1.00% (Exotic)' },
                ].map((item) => (
                  <button
                    key={item.tier}
                    onClick={() => setFeeTier(item.tier)}
                    className={`py-2 px-2.5 rounded-lg border text-xs text-center font-mono transition-all ${
                      feeTier === item.tier
                        ? 'border-primary bg-primary/10 text-primary font-bold ring-1 ring-primary/40'
                        : 'border-border bg-card text-muted-foreground hover:border-primary/40'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-border bg-muted/20 space-y-4">
            <div className="text-xs font-bold text-foreground flex items-center justify-between">
              <span>2. Market Simulation & Duration</span>
              <span className="font-mono text-muted-foreground text-[11px]">
                Formula: x · y = k
              </span>
            </div>

            {/* New ETH Price Slider */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-muted-foreground">
                  ETH Market Price (Initial: ${initialEthPrice.toLocaleString()}):
                </span>
                <span
                  className={`font-mono font-bold ${
                    newEthPrice >= initialEthPrice ? 'text-emerald-500' : 'text-rose-500'
                  }`}
                >
                  ${newEthPrice.toLocaleString()} ({newEthPrice >= initialEthPrice ? '+' : ''}
                  {(((newEthPrice - initialEthPrice) / initialEthPrice) * 100).toFixed(1)}%)
                </span>
              </div>
              <input
                type="range"
                min="1200"
                max="6000"
                step="50"
                value={newEthPrice}
                onChange={(e) => setNewEthPrice(Number(e.target.value))}
                className="w-full accent-primary h-2 bg-muted rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground font-mono mt-1">
                <span>$1,200 (Market Crash)</span>
                <span>$3,000 (No Change)</span>
                <span>$6,000 (Bull Run)</span>
              </div>
            </div>

            {/* Daily Volume Slider */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-muted-foreground">Daily Pool Trading Volume:</span>
                <span className="font-mono font-bold text-foreground">
                  ${(dailyPoolVolume / 1e6).toFixed(1)}M / day
                </span>
              </div>
              <input
                type="range"
                min="500000"
                max="10000000"
                step="250000"
                value={dailyPoolVolume}
                onChange={(e) => setDailyPoolVolume(Number(e.target.value))}
                className="w-full accent-primary h-2 bg-muted rounded-lg cursor-pointer"
              />
            </div>

            {/* Days Active Slider */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-muted-foreground">Duration Liquidity Provided:</span>
                <span className="font-mono font-bold text-foreground">{daysActive} Days</span>
              </div>
              <input
                type="range"
                min="1"
                max="90"
                step="1"
                value={daysActive}
                onChange={(e) => setDaysActive(Number(e.target.value))}
                className="w-full accent-primary h-2 bg-muted rounded-lg cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Fee Yield vs Impermanent Loss Matrix */}
        <div className="lg:col-span-5 space-y-4">
          {/* Net Return Overview Card */}
          <div
            className={`p-5 rounded-2xl border-2 ${
              netProfitVsHodl >= 0
                ? 'border-emerald-500/30 bg-emerald-500/5'
                : 'border-amber-500/30 bg-amber-500/5'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Total Portfolio Value
              </span>
              <span
                className={`text-[11px] font-mono px-2 py-0.5 rounded font-bold ${
                  netProfitVsHodl >= 0
                    ? 'bg-emerald-500/10 text-emerald-500'
                    : 'bg-amber-500/10 text-amber-500'
                }`}
              >
                {netProfitVsHodl >= 0 ? 'Beating HODL' : 'HODL Outperformed'}
              </span>
            </div>

            <div className="text-3xl font-extrabold font-mono text-foreground tracking-tight">
              ${netValueUsd.toFixed(2)}
            </div>
            <div className="text-xs font-mono text-muted-foreground mt-1">
              Initial Capital: ${initialTotalDepositUsd.toLocaleString()} (
              <span className={netProfitVsInitial >= 0 ? 'text-emerald-500' : 'text-rose-500'}>
                {netProfitVsInitial >= 0 ? '+' : ''}${netProfitVsInitial.toFixed(2)}
              </span>
              )
            </div>

            <div className="mt-4 pt-4 border-t border-border/60 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Fees Earned (Cash Flow):</span>
                <span className="font-mono font-bold text-emerald-500">
                  +${totalFeesEarnedUsd.toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-muted-foreground">Impermanent Loss (IL):</span>
                <span className="font-mono font-bold text-rose-500">
                  {ilPct === 0
                    ? '$0.00 (0%)'
                    : `-$${ilLossDollars.toFixed(2)} (${ilPct.toFixed(2)}%)`}
                </span>
              </div>

              <div className="flex justify-between pt-2 border-t border-border/40 font-bold">
                <span className="text-foreground">Net Advantage vs Just Holding:</span>
                <span
                  className={`font-mono ${
                    netProfitVsHodl >= 0 ? 'text-emerald-500' : 'text-amber-500'
                  }`}
                >
                  {netProfitVsHodl >= 0 ? '+' : ''}${netProfitVsHodl.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Strategy Insight Card */}
          <div className="p-4 rounded-xl border border-border bg-card space-y-2.5 text-xs">
            <h4 className="font-bold text-foreground text-xs m-0 flex items-center gap-1.5">
              <span>💡</span>
              <span>The Liquidity Provider's Income Rule</span>
            </h4>
            <p className="text-muted-foreground leading-relaxed m-0 text-[11px]">
              In an Automated Market Maker, you earn continuous transaction fees every time someone
              buys or sells. However, if the price swings wildly, arbitrageurs rebalance your pool,
              leaving you with more of the declining asset (Impermanent Loss).
            </p>
            <div className="p-2.5 rounded-lg bg-primary/5 border border-primary/20 text-[11px] text-muted-foreground">
              <strong className="text-primary">Pro Tip for Stable Income:</strong> Providing
              liquidity to pegged pairs like <strong>USDC / USDT</strong> or{' '}
              <strong>wstETH / ETH</strong> carries virtually <strong>0% Impermanent Loss</strong>.
              This turns your capital into a pure trading fee collection engine!
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
