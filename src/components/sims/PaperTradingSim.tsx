import { useState, useEffect } from 'react';

interface Position {
  id: string;
  side: 'long' | 'short';
  entryPrice: number;
  sizeBtc: number;
  investedUsd: number;
  stopLoss?: number;
  takeProfit?: number;
  openTime: string;
}

interface ClosedTrade {
  id: string;
  side: 'long' | 'short';
  entryPrice: number;
  exitPrice: number;
  profitUsd: number;
  roiPct: number;
  time: string;
}

export default function PaperTradingSim() {
  // Account Balances
  const [tradingBalance, setTradingBalance] = useState<number>(10000); // $10,000 active capital
  const [bankBalance, setBankBalance] = useState<number>(0); // $0 cashed out to bank initially
  const [currentPrice, setCurrentPrice] = useState<number>(67400); // Current BTC price
  const [priceHistory, setPriceHistory] = useState<number[]>([
    66800, 67000, 67200, 66900, 67100, 67400,
  ]);

  // Order Inputs
  const [orderSide, setOrderSide] = useState<'long' | 'short'>('long');
  const [tradeAllocationPct, setTradeAllocationPct] = useState<number>(25); // 25% of balance
  const stopLossOffsetPct = 2.5; // 2.5% stop loss
  const takeProfitOffsetPct = 7.5; // 7.5% take profit (1:3 R:R)

  // Positions & Trade History
  const [positions, setPositions] = useState<Position[]>([]);
  const [closedTrades, setClosedTrades] = useState<ClosedTrade[]>([]);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Auto price-tick interval
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isSimulating) {
      timer = setInterval(() => {
        advanceMarketPrice();
      }, 1500);
    }
    return () => clearInterval(timer);
  }, [isSimulating, currentPrice, positions]);

  // Move price with realistic brownian motion
  const advanceMarketPrice = () => {
    const deltaPct = (Math.random() - 0.48) * 0.015; // -0.7% to +0.8%
    const newP = Math.round(currentPrice * (1 + deltaPct));
    setCurrentPrice(newP);
    setPriceHistory((prev) => [...prev.slice(-15), newP]);

    // Check Stop Loss & Take Profit Triggers
    positions.forEach((pos) => {
      let triggered = false;
      let exitPrice = newP;
      let triggerReason = '';

      if (pos.side === 'long') {
        if (pos.stopLoss && newP <= pos.stopLoss) {
          triggered = true;
          exitPrice = pos.stopLoss;
          triggerReason = '🛑 Stop-Loss triggered! Risk protected.';
        } else if (pos.takeProfit && newP >= pos.takeProfit) {
          triggered = true;
          exitPrice = pos.takeProfit;
          triggerReason = '🎯 Take-Profit reached! Profits secured.';
        }
      }

      if (triggered) {
        closePosition(pos.id, exitPrice, triggerReason);
      }
    });
  };

  const handleOpenTrade = () => {
    setStatusMessage(null);
    const capitalToUse = (tradingBalance * tradeAllocationPct) / 100;

    if (capitalToUse < 50) {
      setStatusMessage('❌ Minimum trade size is $50.');
      return;
    }

    if (capitalToUse > tradingBalance) {
      setStatusMessage('❌ Insufficient trading capital.');
      return;
    }

    const sizeBtc = Number((capitalToUse / currentPrice).toFixed(4));
    const slPrice = Math.round(currentPrice * (1 - stopLossOffsetPct / 100));
    const tpPrice = Math.round(currentPrice * (1 + takeProfitOffsetPct / 100));

    const newPos: Position = {
      id: 'pos_' + Date.now(),
      side: orderSide,
      entryPrice: currentPrice,
      sizeBtc,
      investedUsd: capitalToUse,
      stopLoss: slPrice,
      takeProfit: tpPrice,
      openTime: new Date().toLocaleTimeString(),
    };

    setTradingBalance((prev) => prev - capitalToUse);
    setPositions((prev) => [...prev, newPos]);
    setStatusMessage(
      `✅ Opened ${orderSide.toUpperCase()} for ${sizeBtc} BTC @ $${currentPrice.toLocaleString()}`
    );
  };

  const closePosition = (id: string, customExitPrice?: number, customReason?: string) => {
    const pos = positions.find((p) => p.id === id);
    if (!pos) return;

    const exitPrice = customExitPrice || currentPrice;
    const priceDiff = exitPrice - pos.entryPrice;
    const profitUsd = pos.side === 'long' ? priceDiff * pos.sizeBtc : -priceDiff * pos.sizeBtc;
    const returnCapital = pos.investedUsd + profitUsd;
    const roiPct = (profitUsd / pos.investedUsd) * 100;

    setTradingBalance((prev) => Math.max(0, prev + returnCapital));
    setPositions((prev) => prev.filter((p) => p.id !== id));

    const closed: ClosedTrade = {
      id: pos.id,
      side: pos.side,
      entryPrice: pos.entryPrice,
      exitPrice,
      profitUsd,
      roiPct,
      time: new Date().toLocaleTimeString(),
    };

    setClosedTrades((prev) => [closed, ...prev]);
    setStatusMessage(
      customReason ||
        `${profitUsd >= 0 ? '🎉 Closed in Profit' : '🔻 Closed with Loss'}: ${
          profitUsd >= 0 ? '+' : ''
        }$${profitUsd.toFixed(2)} (${roiPct.toFixed(1)}%)`
    );
  };

  // Cash out accumulated profits to simulated Bank Account
  const handleCashoutToBank = () => {
    const cashoutAvailable = Math.max(0, tradingBalance - 10000); // Anything above initial $10k

    if (cashoutAvailable <= 10) {
      setStatusMessage(
        'ℹ️ No excess net profits above starting $10,000 principal to cash out yet.'
      );
      return;
    }

    setTradingBalance((prev) => prev - cashoutAvailable);
    setBankBalance((prev) => prev + cashoutAvailable);
    setStatusMessage(
      `🏦 Successfully off-ramped $${cashoutAvailable.toFixed(2)} to your Bank Account!`
    );
  };

  // Portfolio Metrics
  const winCount = closedTrades.filter((t) => t.profitUsd > 0).length;
  const totalTrades = closedTrades.length;
  const winRate = totalTrades > 0 ? ((winCount / totalTrades) * 100).toFixed(0) : '0';
  const totalRealizedPnl = closedTrades.reduce((sum, t) => sum + t.profitUsd, 0);

  return (
    <div className="my-8 rounded-2xl border border-border bg-card/80 p-5 md:p-7 shadow-lg backdrop-blur-sm">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-border/60 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 mb-2">
            <span>🎮 Paper Trading Terminal</span>
            <span>•</span>
            <span>Zero-Risk Market Simulation</span>
          </div>
          <h3 className="text-xl font-bold tracking-tight text-foreground m-0">
            Systematic Trading & Fiat Cash-Out Engine
          </h3>
          <p className="text-xs text-muted-foreground mt-1 mb-0">
            Practice disciplined execution with $10,000 in simulated capital. Set stop-losses,
            maintain 1:3 R:R, and off-ramp profits directly to your bank account.
          </p>
        </div>

        {/* Live Status Header */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="hidden sm:flex items-center gap-1 font-mono text-[10px] text-muted-foreground bg-muted/40 px-2.5 py-1.5 rounded-xl border border-border/40">
            <span>Trend:</span>
            {priceHistory.slice(-5).map((p, idx) => (
              <span
                key={idx}
                className={
                  p >= currentPrice ? 'text-emerald-500 font-bold' : 'text-rose-500 font-bold'
                }
              >
                ${(p / 1000).toFixed(1)}k
              </span>
            ))}
          </div>
          <button
            onClick={() => setIsSimulating(!isSimulating)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-mono font-bold transition-all ${
              isSimulating
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-500 animate-pulse'
                : 'bg-primary/10 border-primary/30 text-primary hover:bg-primary/20'
            }`}
          >
            {isSimulating ? '⏸ Pause Market' : '▶ Live Market Ticker'}
          </button>
          <button
            onClick={advanceMarketPrice}
            className="px-3 py-1.5 rounded-xl border border-border bg-card text-xs font-mono hover:border-primary/50 text-foreground"
          >
            +1 Tick
          </button>
        </div>
      </div>

      {/* Account Balance Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 my-5">
        <div className="p-3.5 rounded-xl border border-border bg-muted/20">
          <span className="text-[11px] text-muted-foreground block">Active Trading Collateral</span>
          <span className="text-xl font-extrabold font-mono text-foreground">
            $
            {tradingBalance.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
        </div>

        <div className="p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-500/5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 block font-bold">
              🏦 Cashed Out Bank Balance
            </span>
            <button
              onClick={handleCashoutToBank}
              className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/30 transition-all font-bold"
            >
              Cash Out
            </button>
          </div>
          <span className="text-xl font-extrabold font-mono text-emerald-500">
            $
            {bankBalance.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
        </div>

        <div className="p-3.5 rounded-xl border border-border bg-muted/20">
          <span className="text-[11px] text-muted-foreground block">BTC / USDT Price</span>
          <span className="text-xl font-extrabold font-mono text-primary">
            ${currentPrice.toLocaleString()}
          </span>
        </div>

        <div className="p-3.5 rounded-xl border border-border bg-muted/20">
          <span className="text-[11px] text-muted-foreground block">Win Rate / Realized PnL</span>
          <span className="text-sm font-extrabold font-mono text-foreground">
            {winRate}% ({totalTrades} trades) |{' '}
            <span className={totalRealizedPnl >= 0 ? 'text-emerald-500' : 'text-rose-500'}>
              {totalRealizedPnl >= 0 ? '+' : ''}${totalRealizedPnl.toFixed(0)}
            </span>
          </span>
        </div>
      </div>

      {statusMessage && (
        <div className="mb-4 p-3 rounded-xl border border-primary/20 bg-primary/5 text-xs font-mono text-foreground">
          {statusMessage}
        </div>
      )}

      {/* Main Trading Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Order Form */}
        <div className="lg:col-span-5 p-4 rounded-xl border border-border bg-muted/20 space-y-4">
          <div className="text-xs font-bold text-foreground">1. Place Disciplined Trade</div>

          {/* Side Toggle */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setOrderSide('long')}
              className={`py-2 rounded-lg text-xs font-bold font-mono transition-all ${
                orderSide === 'long'
                  ? 'bg-emerald-500 text-white shadow-md'
                  : 'bg-card border border-border text-muted-foreground hover:border-emerald-500/50'
              }`}
            >
              BUY / LONG
            </button>
            <button
              onClick={() => setOrderSide('short')}
              className={`py-2 rounded-lg text-xs font-bold font-mono transition-all ${
                orderSide === 'short'
                  ? 'bg-rose-500 text-white shadow-md'
                  : 'bg-card border border-border text-muted-foreground hover:border-rose-500/50'
              }`}
            >
              SELL / SHORT
            </button>
          </div>

          {/* Allocation % */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-muted-foreground">Position Size (% of Capital):</span>
              <span className="font-mono font-bold text-foreground">
                {tradeAllocationPct}% (${((tradingBalance * tradeAllocationPct) / 100).toFixed(0)})
              </span>
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {[10, 25, 50, 100].map((pct) => (
                <button
                  key={pct}
                  onClick={() => setTradeAllocationPct(pct)}
                  className={`py-1 text-[11px] font-mono rounded border transition-all ${
                    tradeAllocationPct === pct
                      ? 'border-primary bg-primary/10 text-primary font-bold'
                      : 'border-border bg-card text-muted-foreground hover:border-primary/40'
                  }`}
                >
                  {pct}%
                </button>
              ))}
            </div>
          </div>

          {/* Risk Management (Stop-Loss & Take-Profit) */}
          <div className="p-3 rounded-lg border border-border/80 bg-card/60 space-y-2 text-xs">
            <div className="font-semibold text-foreground flex items-center justify-between">
              <span>Risk Management (1:3 R:R)</span>
              <span className="text-[10px] font-mono text-emerald-500 font-bold">Disciplined</span>
            </div>

            <div className="flex justify-between items-center text-[11px]">
              <span className="text-muted-foreground">🛑 Stop Loss:</span>
              <span className="font-mono font-bold text-rose-500">
                -${((tradingBalance * tradeAllocationPct * stopLossOffsetPct) / 10000).toFixed(0)} (
                {stopLossOffsetPct}% @ $
                {Math.round(currentPrice * (1 - stopLossOffsetPct / 100)).toLocaleString()})
              </span>
            </div>

            <div className="flex justify-between items-center text-[11px]">
              <span className="text-muted-foreground">🎯 Take Profit:</span>
              <span className="font-mono font-bold text-emerald-500">
                +${((tradingBalance * tradeAllocationPct * takeProfitOffsetPct) / 10000).toFixed(0)}{' '}
                ({takeProfitOffsetPct}% @ $
                {Math.round(currentPrice * (1 + takeProfitOffsetPct / 100)).toLocaleString()})
              </span>
            </div>
          </div>

          <button
            onClick={handleOpenTrade}
            className={`w-full py-2.5 rounded-xl font-mono text-xs font-bold text-white transition-all shadow-md ${
              orderSide === 'long'
                ? 'bg-emerald-600 hover:bg-emerald-500'
                : 'bg-rose-600 hover:bg-rose-500'
            }`}
          >
            Execute {orderSide.toUpperCase()} Position
          </button>
        </div>

        {/* Right: Open Positions & Execution Journal */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-4 rounded-xl border border-border bg-card">
            <h4 className="text-xs font-bold text-foreground mb-3 flex items-center justify-between">
              <span>Active Open Positions ({positions.length})</span>
              <span className="text-[11px] font-mono text-muted-foreground font-normal">
                Live Mark-to-Market
              </span>
            </h4>

            {positions.length === 0 ? (
              <div className="text-center py-6 text-xs text-muted-foreground font-mono">
                No open positions. Use the form on the left to enter a setup!
              </div>
            ) : (
              <div className="space-y-2">
                {positions.map((pos) => {
                  const priceDiff = currentPrice - pos.entryPrice;
                  const pnl =
                    pos.side === 'long' ? priceDiff * pos.sizeBtc : -priceDiff * pos.sizeBtc;
                  const roi = (pnl / pos.investedUsd) * 100;

                  return (
                    <div
                      key={pos.id}
                      className="p-3 rounded-lg border border-border/80 bg-muted/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono"
                    >
                      <div>
                        <div className="flex items-center gap-1.5 font-bold">
                          <span
                            className={pos.side === 'long' ? 'text-emerald-500' : 'text-rose-500'}
                          >
                            {pos.side.toUpperCase()} {pos.sizeBtc} BTC
                          </span>
                          <span className="text-muted-foreground font-normal">
                            @ ${pos.entryPrice.toLocaleString()}
                          </span>
                        </div>
                        <div className="text-[11px] text-muted-foreground mt-0.5">
                          SL: ${pos.stopLoss?.toLocaleString()} | TP: $
                          {pos.takeProfit?.toLocaleString()}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div
                            className={`font-bold ${pnl >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}
                          >
                            {pnl >= 0 ? '+' : ''}${pnl.toFixed(2)} ({roi.toFixed(1)}%)
                          </div>
                        </div>
                        <button
                          onClick={() => closePosition(pos.id)}
                          className="px-2.5 py-1 rounded bg-muted hover:bg-muted/80 text-foreground border border-border text-[11px]"
                        >
                          Market Close
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Trade History */}
          <div className="p-4 rounded-xl border border-border bg-card">
            <h4 className="text-xs font-bold text-foreground mb-2 flex items-center justify-between">
              <span>Recent Closed Trades ({closedTrades.length})</span>
              <span className="text-[11px] font-mono text-muted-foreground font-normal">
                Execution Log
              </span>
            </h4>

            {closedTrades.length === 0 ? (
              <div className="text-center py-4 text-xs text-muted-foreground font-mono">
                Completed trades will be logged here.
              </div>
            ) : (
              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                {closedTrades.map((t) => (
                  <div
                    key={t.id}
                    className="p-2 rounded bg-muted/20 border border-border/40 flex items-center justify-between text-xs font-mono"
                  >
                    <span>
                      {t.side.toUpperCase()} ({t.time})
                    </span>
                    <span
                      className={
                        t.profitUsd >= 0 ? 'text-emerald-500 font-bold' : 'text-rose-500 font-bold'
                      }
                    >
                      {t.profitUsd >= 0 ? '+' : ''}${t.profitUsd.toFixed(2)} ({t.roiPct.toFixed(1)}
                      %)
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
