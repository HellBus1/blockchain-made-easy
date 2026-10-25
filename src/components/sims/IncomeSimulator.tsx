import { useState } from 'react';

export default function IncomeSimulator() {
  const [activeTab, setActiveTab] = useState<'offramp' | 'staking' | 'gridbot'>('offramp');

  // --- TAB 1: Fiat Cashout State ---
  const [initialFiat, setInitialFiat] = useState<number>(1000); // $1,000 invested
  const [cryptoBought, setCryptoBought] = useState<number>(0.02); // 0.02 BTC
  const [currentBtcPrice, setCurrentBtcPrice] = useState<number>(68000); // $68,000
  const [cashoutAmountBtc, setCashoutAmountBtc] = useState<number>(0.02);
  const [exchangeFeePct, setExchangeFeePct] = useState<number>(0.1); // 0.1%
  const [taxWithholdingPct, setTaxWithholdingPct] = useState<number>(0.1); // 0.1% (PPh Bappebti style)
  const [networkWithdrawFee, setNetworkWithdrawFee] = useState<number>(1.5); // $1.50 bank withdrawal fee

  // Cashout Calculations
  const grossProceeds = cashoutAmountBtc * currentBtcPrice;
  const exchangeTradingFee = (grossProceeds * exchangeFeePct) / 100;
  const taxWithheld = (grossProceeds * taxWithholdingPct) / 100;
  const netBankDeposit = Math.max(
    0,
    grossProceeds - exchangeTradingFee - taxWithheld - networkWithdrawFee
  );
  const netProfit = netBankDeposit - initialFiat * (cashoutAmountBtc / cryptoBought);
  const roiPct = ((netProfit / (initialFiat * (cashoutAmountBtc / cryptoBought))) * 100).toFixed(1);

  // --- TAB 2: Staking & Passive Yield State ---
  const [principalCapital, setPrincipalCapital] = useState<number>(5000); // $5,000
  const [apyPct, setApyPct] = useState<number>(8.5); // 8.5% APY
  const [stakingYears, setStakingYears] = useState<number>(2); // 2 years
  const [reinvestYield, setReinvestYield] = useState<boolean>(true);

  // Staking Calculations
  const monthlyRate = apyPct / 100 / 12;
  const totalMonths = stakingYears * 12;
  const compoundedFinal = reinvestYield
    ? principalCapital * Math.pow(1 + monthlyRate, totalMonths)
    : principalCapital + principalCapital * (apyPct / 100) * stakingYears;
  const totalYieldEarned = compoundedFinal - principalCapital;
  const averageMonthlyCashflow = totalYieldEarned / totalMonths;

  // --- TAB 3: Grid Trading Bot State ---
  const [botCapital, setBotCapital] = useState<number>(2000); // $2,000 USDT
  const [lowerPrice, setLowerPrice] = useState<number>(60000);
  const [upperPrice, setUpperPrice] = useState<number>(75000);
  const [gridCount, setGridCount] = useState<number>(20);
  const [volatilitySwingsPerDay, setVolatilitySwingsPerDay] = useState<number>(4);

  // Grid Bot Calculations
  const priceRange = upperPrice - lowerPrice;
  const gridStep = priceRange / gridCount;
  const profitPerGridPct = (gridStep / lowerPrice) * 100 - 0.1; // minus 0.1% maker fee
  const capitalPerGrid = botCapital / gridCount;
  const profitPerArbitrage = capitalPerGrid * (profitPerGridPct / 100);
  const dailyBotIncome = profitPerArbitrage * volatilitySwingsPerDay;
  const monthlyBotIncome = dailyBotIncome * 30;
  const estimatedBotApy = ((monthlyBotIncome * 12) / botCapital) * 100;

  return (
    <div className="not-content my-8 rounded-2xl border border-border/80 bg-card/60 backdrop-blur-md shadow-lg overflow-hidden transition-all">
      {/* Header Bar */}
      <div className="p-4 sm:p-5 bg-muted/40 border-b border-border/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-3 w-3 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
          <div>
            <h4 className="text-sm sm:text-base font-bold text-foreground m-0">
              Blockchain Income & Fiat Cashout Calculator
            </h4>
            <p className="text-xs text-muted-foreground m-0">
              Model real-world fiat profits, passive staking yield, and automated trading bot
              returns
            </p>
          </div>
        </div>

        <span className="text-[11px] font-mono px-2.5 py-1 rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
          💰 Income Generation Suite
        </span>
      </div>

      {/* Mode Selector Tabs */}
      <div className="flex flex-wrap border-b border-border/70 bg-muted/30 px-3 pt-2">
        <button
          onClick={() => setActiveTab('offramp')}
          type="button"
          className={`cursor-pointer px-4 py-2.5 text-xs sm:text-sm font-medium border-b-2 transition-all ${
            activeTab === 'offramp'
              ? 'border-emerald-500 text-emerald-500 font-bold'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          1. Fiat Cashout & Profit Realizer
        </button>
        <button
          onClick={() => setActiveTab('staking')}
          type="button"
          className={`cursor-pointer px-4 py-2.5 text-xs sm:text-sm font-medium border-b-2 transition-all ${
            activeTab === 'staking'
              ? 'border-emerald-500 text-emerald-500 font-bold'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          2. Passive Staking & Stable Yield
        </button>
        <button
          onClick={() => setActiveTab('gridbot')}
          type="button"
          className={`cursor-pointer px-4 py-2.5 text-xs sm:text-sm font-medium border-b-2 transition-all ${
            activeTab === 'gridbot'
              ? 'border-emerald-500 text-emerald-500 font-bold'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          3. Automated Grid Trading Bot
        </button>
      </div>

      {/* Tab 1: Fiat Cashout & Profit Realizer */}
      {activeTab === 'offramp' && (
        <div className="p-5 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Input Controls */}
            <div className="space-y-4">
              <h5 className="text-xs font-bold uppercase tracking-wider text-muted-foreground m-0">
                1. Your Investment & Current Valuation
              </h5>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Initial Fiat Invested ($ USD / equiv IDR)
                </label>
                <input
                  type="number"
                  step="50"
                  value={initialFiat}
                  onChange={(e) => setInitialFiat(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm font-mono text-foreground focus:ring-2 focus:ring-emerald-500/40"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    BTC Purchased
                  </label>
                  <input
                    type="number"
                    step="0.005"
                    value={cryptoBought}
                    onChange={(e) => setCryptoBought(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm font-mono text-foreground focus:ring-2 focus:ring-emerald-500/40"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Current BTC Price ($)
                  </label>
                  <input
                    type="number"
                    step="1000"
                    value={currentBtcPrice}
                    onChange={(e) => setCurrentBtcPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm font-mono text-foreground focus:ring-2 focus:ring-emerald-500/40"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Amount of BTC to Sell & Cash Out
                </label>
                <input
                  type="range"
                  min="0.001"
                  max={cryptoBought}
                  step="0.001"
                  value={cashoutAmountBtc}
                  onChange={(e) => setCashoutAmountBtc(Number(e.target.value))}
                  className="w-full accent-emerald-500"
                />
                <div className="flex justify-between text-xs font-mono text-muted-foreground mt-1">
                  <span>Sell: {cashoutAmountBtc} BTC</span>
                  <span>{((cashoutAmountBtc / cryptoBought) * 100).toFixed(0)}% of portfolio</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs pt-1">
                <div>
                  <label className="block text-muted-foreground mb-0.5">Trading Fee %</label>
                  <input
                    type="number"
                    step="0.05"
                    value={exchangeFeePct}
                    onChange={(e) => setExchangeFeePct(Number(e.target.value))}
                    className="w-full px-2 py-1 rounded border border-border bg-background font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block text-muted-foreground mb-0.5">Tax Withhold %</label>
                  <input
                    type="number"
                    step="0.05"
                    value={taxWithholdingPct}
                    onChange={(e) => setTaxWithholdingPct(Number(e.target.value))}
                    className="w-full px-2 py-1 rounded border border-border bg-background font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block text-muted-foreground mb-0.5">Bank Fee ($)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={networkWithdrawFee}
                    onChange={(e) => setNetworkWithdrawFee(Number(e.target.value))}
                    className="w-full px-2 py-1 rounded border border-border bg-background font-mono text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Cashout Settlement Card */}
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-5 flex flex-col justify-between">
              <div>
                <div className="text-xs uppercase font-semibold text-emerald-600 dark:text-emerald-400 mb-1">
                  Bank Settlement Projection
                </div>
                <div className="text-3xl font-mono font-bold text-foreground">
                  $
                  {netBankDeposit.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  Direct wire to checking account (Net of all fees & tax)
                </div>
              </div>

              {/* Deductions Breakdown */}
              <div className="my-4 py-3 border-y border-border/70 space-y-1.5 text-xs font-mono">
                <div className="flex justify-between text-muted-foreground">
                  <span>Gross Crypto Sold:</span>
                  <span className="text-foreground">${grossProceeds.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Exchange Trading Fee ({exchangeFeePct}%):</span>
                  <span className="text-red-500">-${exchangeTradingFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Tax Withholding ({taxWithholdingPct}%):</span>
                  <span className="text-red-500">-${taxWithheld.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Fiat Bank Rail Fee:</span>
                  <span className="text-red-500">-${networkWithdrawFee.toFixed(2)}</span>
                </div>
              </div>

              {/* Net Profit & ROI */}
              <div className="p-3 rounded-lg bg-card border border-border/60 flex items-center justify-between">
                <div>
                  <div className="text-[11px] text-muted-foreground uppercase font-semibold">
                    Net Realized Profit
                  </div>
                  <div
                    className={`text-base font-mono font-bold ${netProfit >= 0 ? 'text-emerald-500' : 'text-red-500'}`}
                  >
                    {netProfit >= 0 ? '+' : ''}${netProfit.toFixed(2)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[11px] text-muted-foreground uppercase font-semibold">
                    Net ROI
                  </div>
                  <div
                    className={`text-base font-mono font-bold ${Number(roiPct) >= 0 ? 'text-emerald-500' : 'text-red-500'}`}
                  >
                    {Number(roiPct) >= 0 ? '+' : ''}
                    {roiPct}%
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Passive Staking & Stable Yield */}
      {activeTab === 'staking' && (
        <div className="p-5 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h5 className="text-xs font-bold uppercase tracking-wider text-muted-foreground m-0">
                Staking & Lending Parameters
              </h5>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Staked Capital ($ USDT / ETH)
                </label>
                <input
                  type="number"
                  step="500"
                  value={principalCapital}
                  onChange={(e) => setPrincipalCapital(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm font-mono text-foreground focus:ring-2 focus:ring-emerald-500/40"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-foreground mb-1">
                  <span>Annual Yield Rate (APY)</span>
                  <span className="font-mono text-emerald-500 font-bold">{apyPct}%</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="20"
                  step="0.5"
                  value={apyPct}
                  onChange={(e) => setApyPct(Number(e.target.value))}
                  className="w-full accent-emerald-500"
                />
                <div className="flex justify-between text-[11px] text-muted-foreground font-mono">
                  <span>3.5% (Native ETH)</span>
                  <span>8% (Stablecoin Lending)</span>
                  <span>15% (DeFi Pool)</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Staking Duration ({stakingYears} Years / {totalMonths} Months)
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 5].map((yr) => (
                    <button
                      key={yr}
                      type="button"
                      onClick={() => setStakingYears(yr)}
                      className={`cursor-pointer flex-1 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors ${
                        stakingYears === yr
                          ? 'bg-primary text-primary-foreground font-bold'
                          : 'bg-muted text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {yr} Year{yr > 1 ? 's' : ''}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="reinvestYield"
                  checked={reinvestYield}
                  onChange={(e) => setReinvestYield(e.target.checked)}
                  className="rounded border-border text-emerald-500 focus:ring-emerald-500"
                />
                <label
                  htmlFor="reinvestYield"
                  className="text-xs font-medium text-foreground cursor-pointer"
                >
                  Auto-Compound Monthly (Reinvest yield to earn interest on interest)
                </label>
              </div>
            </div>

            {/* Staking Yield Output Card */}
            <div className="rounded-xl border border-primary/30 bg-primary/5 p-5 flex flex-col justify-between">
              <div>
                <div className="text-xs uppercase font-semibold text-primary mb-1">
                  Projected Passive Cash Flow
                </div>
                <div className="text-3xl font-mono font-bold text-foreground">
                  ${averageMonthlyCashflow.toFixed(2)}
                  <span className="text-sm font-normal text-muted-foreground"> / month</span>
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  Est. 100% passive income earned without trading or timing the market
                </div>
              </div>

              <div className="my-4 py-3 border-y border-border/70 space-y-2 text-xs font-mono">
                <div className="flex justify-between text-muted-foreground">
                  <span>Initial Principal:</span>
                  <span className="text-foreground">${principalCapital.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Total Passive Interest Earned:</span>
                  <span className="text-emerald-500 font-bold">
                    +${totalYieldEarned.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Total Portfolio Balance:</span>
                  <span className="text-foreground font-bold">${compoundedFinal.toFixed(2)}</span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-card border border-border/60 text-xs">
                <span className="font-semibold text-foreground">⚡ Cash-Out Realization:</span>
                <p className="text-muted-foreground mt-1 m-0">
                  You can withdraw your ${averageMonthlyCashflow.toFixed(2)}/mo yield directly to
                  your local bank account via P2P or fiat off-ramp while keeping your $
                  {principalCapital.toLocaleString()} initial principal intact.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Automated Grid Trading Bot */}
      {activeTab === 'gridbot' && (
        <div className="p-5 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h5 className="text-xs font-bold uppercase tracking-wider text-muted-foreground m-0">
                Grid Bot Configuration (Gate.io / Spot Style)
              </h5>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Bot Allocated Capital ($ USDT)
                </label>
                <input
                  type="number"
                  step="500"
                  value={botCapital}
                  onChange={(e) => setBotCapital(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm font-mono text-foreground focus:ring-2 focus:ring-emerald-500/40"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Lower Bound ($)
                  </label>
                  <input
                    type="number"
                    step="1000"
                    value={lowerPrice}
                    onChange={(e) => setLowerPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm font-mono text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Upper Bound ($)
                  </label>
                  <input
                    type="number"
                    step="1000"
                    value={upperPrice}
                    onChange={(e) => setUpperPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm font-mono text-foreground"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-foreground mb-1">
                  <span>Grid Count ({gridCount} orders)</span>
                  <span className="font-mono text-muted-foreground">
                    Step: ${gridStep.toFixed(0)} | Profit/Grid: {profitPerGridPct.toFixed(2)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="50"
                  step="1"
                  value={gridCount}
                  onChange={(e) => setGridCount(Number(e.target.value))}
                  className="w-full accent-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Expected Volatility Hits (Swings / Day): {volatilitySwingsPerDay}
                </label>
                <input
                  type="range"
                  min="1"
                  max="15"
                  step="1"
                  value={volatilitySwingsPerDay}
                  onChange={(e) => setVolatilitySwingsPerDay(Number(e.target.value))}
                  className="w-full accent-primary"
                />
                <div className="text-[11px] text-muted-foreground mt-0.5">
                  How many times price bounces between grid levels per 24h
                </div>
              </div>
            </div>

            {/* Grid Bot Output Card */}
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-5 flex flex-col justify-between">
              <div>
                <div className="text-xs uppercase font-semibold text-amber-600 dark:text-amber-400 mb-1">
                  Estimated Automated Arbitrage Income
                </div>
                <div className="text-3xl font-mono font-bold text-foreground">
                  ${monthlyBotIncome.toFixed(2)}
                  <span className="text-sm font-normal text-muted-foreground"> / month</span>
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  Automated high-frequency buy-low / sell-high grid execution
                </div>
              </div>

              <div className="my-4 py-3 border-y border-border/70 space-y-1.5 text-xs font-mono">
                <div className="flex justify-between text-muted-foreground">
                  <span>Daily Arbitrage Profit:</span>
                  <span className="text-emerald-500 font-bold">
                    +${dailyBotIncome.toFixed(2)} / day
                  </span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Est. Annualized Return (APY):</span>
                  <span className="text-foreground font-bold">
                    {estimatedBotApy.toFixed(1)}% APY
                  </span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Capital per Grid Level:</span>
                  <span className="text-foreground">${capitalPerGrid.toFixed(0)}</span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-card border border-border/60 text-xs">
                <span className="font-semibold text-amber-600 dark:text-amber-400">
                  ⚠️ Risk Parameter:
                </span>
                <p className="text-muted-foreground mt-1 m-0">
                  If market price drops below ${lowerPrice.toLocaleString()}, the bot will hold 100%
                  BTC in unrealized drawdown. Always set an automatic Stop-Loss below your lower
                  bound.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
