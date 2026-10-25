import { useState, useMemo, type SyntheticEvent } from 'react';

interface Order {
  id: string;
  price: number;
  amount: number;
  total: number;
  isUser?: boolean;
}

interface Trade {
  id: string;
  time: string;
  price: number;
  amount: number;
  side: 'buy' | 'sell';
}

const INITIAL_ASKS: Order[] = [
  { id: 'a1', price: 68450, amount: 0.45, total: 30802.5 },
  { id: 'a2', price: 68400, amount: 1.2, total: 82080 },
  { id: 'a3', price: 68350, amount: 0.85, total: 58097.5 },
  { id: 'a4', price: 68300, amount: 2.1, total: 143430 },
  { id: 'a5', price: 68250, amount: 0.65, total: 44362.5 },
];

const INITIAL_BIDS: Order[] = [
  { id: 'b1', price: 68200, amount: 0.95, total: 64790 },
  { id: 'b2', price: 68150, amount: 1.5, total: 102225 },
  { id: 'b3', price: 68100, amount: 0.75, total: 51075 },
  { id: 'b4', price: 68050, amount: 2.4, total: 163320 },
  { id: 'b5', price: 68000, amount: 3.1, total: 210800 },
];

export default function OrderBookSim() {
  const [asks, setAsks] = useState<Order[]>(INITIAL_ASKS);
  const [bids, setBids] = useState<Order[]>(INITIAL_BIDS);
  const [trades, setTrades] = useState<Trade[]>([
    { id: 't1', time: '14:28:10', price: 68220, amount: 0.25, side: 'buy' },
    { id: 't2', time: '14:28:02', price: 68200, amount: 0.5, side: 'sell' },
    { id: 't3', time: '14:27:45', price: 68215, amount: 0.15, side: 'buy' },
  ]);

  // User Balances (Simulated)
  const [fiatBalance, setFiatBalance] = useState<number>(10000); // 10,000 USDT / USD
  const [cryptoBalance, setCryptoBalance] = useState<number>(0.15); // 0.15 BTC

  // Order Form State
  const [side, setSide] = useState<'buy' | 'sell'>('buy');
  const [orderType, setOrderType] = useState<'limit' | 'market'>('limit');
  const [limitPrice, setLimitPrice] = useState<number>(68200);
  const [amount, setAmount] = useState<number>(0.05);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Highest Bid & Lowest Ask
  const bestBid = bids.length > 0 ? bids[0].price : 68200;
  const bestAsk = asks.length > 0 ? asks[asks.length - 1].price : 68250;
  const spread = Math.max(0, bestAsk - bestBid);
  const spreadPct = ((spread / bestAsk) * 100).toFixed(3);

  // Max totals for depth bar visuals
  const maxAskTotal = useMemo(() => Math.max(...asks.map((a) => a.total), 1), [asks]);
  const maxBidTotal = useMemo(() => Math.max(...bids.map((b) => b.total), 1), [bids]);

  const handlePlaceOrder = (e: SyntheticEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    const now = new Date().toLocaleTimeString();

    if (orderType === 'market') {
      // TAKER ORDER: Executes immediately against the top of the opposite book
      if (side === 'buy') {
        const execPrice = bestAsk;
        const cost = amount * execPrice;
        const fee = cost * 0.0015; // 0.15% Taker Fee
        const totalDeduction = cost + fee;

        if (fiatBalance < totalDeduction) {
          setStatusMessage('❌ Insufficient USDT balance for market buy.');
          return;
        }

        setFiatBalance((prev) => Math.max(0, prev - totalDeduction));
        setCryptoBalance((prev) => prev + amount);

        const newTrade: Trade = {
          id: 'trade-' + Date.now(),
          time: now,
          price: execPrice,
          amount,
          side: 'buy',
        };
        setTrades((prev) => [newTrade, ...prev.slice(0, 9)]);
        setStatusMessage(
          `✅ Market Buy Executed! Bought ${amount} BTC at $${execPrice.toLocaleString()} (Taker Fee: $${fee.toFixed(2)})`
        );
      } else {
        // Market Sell
        if (cryptoBalance < amount) {
          setStatusMessage('❌ Insufficient BTC balance for market sell.');
          return;
        }
        const execPrice = bestBid;
        const revenue = amount * execPrice;
        const fee = revenue * 0.0015;
        const netCredit = revenue - fee;

        setCryptoBalance((prev) => Math.max(0, prev - amount));
        setFiatBalance((prev) => prev + netCredit);

        const newTrade: Trade = {
          id: 'trade-' + Date.now(),
          time: now,
          price: execPrice,
          amount,
          side: 'sell',
        };
        setTrades((prev) => [newTrade, ...prev.slice(0, 9)]);
        setStatusMessage(
          `✅ Market Sell Executed! Sold ${amount} BTC at $${execPrice.toLocaleString()} (Net: $${netCredit.toFixed(2)})`
        );
      }
    } else {
      // LIMIT ORDER: Placed onto the order book as a MAKER order
      const cost = amount * limitPrice;
      if (side === 'buy') {
        if (fiatBalance < cost) {
          setStatusMessage('❌ Insufficient USDT balance to reserve limit buy order.');
          return;
        }
        setFiatBalance((prev) => prev - cost);
        const newBid: Order = {
          id: 'user-b-' + Date.now(),
          price: limitPrice,
          amount,
          total: cost,
          isUser: true,
        };
        // Insert sorted high to low
        setBids((prev) => [...prev, newBid].sort((a, b) => b.price - a.price));
        setStatusMessage(
          `📋 Maker Limit Buy placed at $${limitPrice.toLocaleString()}! Earning 0.05% maker fee tier when matched.`
        );
      } else {
        if (cryptoBalance < amount) {
          setStatusMessage('❌ Insufficient BTC balance to reserve limit sell order.');
          return;
        }
        setCryptoBalance((prev) => prev - amount);
        const newAsk: Order = {
          id: 'user-a-' + Date.now(),
          price: limitPrice,
          amount,
          total: cost,
          isUser: true,
        };
        // Insert sorted high to low
        setAsks((prev) => [...prev, newAsk].sort((a, b) => b.price - a.price));
        setStatusMessage(
          `📋 Maker Limit Sell placed at $${limitPrice.toLocaleString()}! Waiting for buyers to hit your order.`
        );
      }
    }
  };

  const handleReset = () => {
    setAsks(INITIAL_ASKS);
    setBids(INITIAL_BIDS);
    setFiatBalance(10000);
    setCryptoBalance(0.15);
    setStatusMessage('Balances and order books reset to initial state.');
  };

  return (
    <div className="not-content my-8 rounded-2xl border border-border/80 bg-card/60 backdrop-blur-md shadow-lg overflow-hidden transition-all">
      {/* Header & Wallet Balances */}
      <div className="p-4 sm:p-5 bg-muted/40 border-b border-border/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-3 w-3 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
          <div>
            <h4 className="text-sm sm:text-base font-bold text-foreground m-0">
              Exchange Trading Terminal: BTC / USDT
            </h4>
            <p className="text-xs text-muted-foreground m-0">
              Live matching engine simulation with Maker/Taker dynamics
            </p>
          </div>
        </div>

        {/* User Balance Cards */}
        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-lg bg-card border border-border/60 text-right">
            <div className="text-[10px] text-muted-foreground uppercase font-semibold">
              USDT Cash
            </div>
            <div className="text-xs sm:text-sm font-mono font-bold text-emerald-500">
              $
              {fiatBalance.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-card border border-border/60 text-right">
            <div className="text-[10px] text-muted-foreground uppercase font-semibold">
              BTC Asset
            </div>
            <div className="text-xs sm:text-sm font-mono font-bold text-amber-500">
              {cryptoBalance.toFixed(4)} BTC
            </div>
          </div>
          <button
            onClick={handleReset}
            type="button"
            className="cursor-pointer text-xs text-muted-foreground hover:text-foreground p-2 rounded hover:bg-muted transition-colors"
            title="Reset Terminal"
          >
            ↺
          </button>
        </div>
      </div>

      {/* Main Trading Floor Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 divide-y lg:divide-y-0 lg:divide-x divide-border/70">
        {/* Left Column: Visual Order Book (6 cols) */}
        <div className="lg:col-span-6 p-4">
          <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground pb-2 border-b border-border/50">
            <span>Price (USDT)</span>
            <span>Size (BTC)</span>
            <span>Total Depth</span>
          </div>

          {/* Asks (Sell Orders - Red, stacked from high to low) */}
          <div className="space-y-1 py-2">
            {asks.map((ask) => {
              const depthPct = Math.min(100, Math.round((ask.total / maxAskTotal) * 100));
              return (
                <div
                  key={ask.id}
                  className={`relative flex items-center justify-between text-xs font-mono py-1 px-1.5 rounded transition-colors ${
                    ask.isUser ? 'bg-amber-500/15 border border-amber-500/40' : 'hover:bg-muted/40'
                  }`}
                >
                  {/* Visual Depth Bar */}
                  <div
                    className="absolute right-0 top-0 bottom-0 bg-red-500/10 pointer-events-none rounded-r"
                    style={{ width: `${depthPct}%` }}
                  />
                  <span className="text-red-500 font-bold z-10">
                    ${ask.price.toLocaleString()} {ask.isUser && '★'}
                  </span>
                  <span className="text-muted-foreground z-10">{ask.amount.toFixed(4)}</span>
                  <span className="text-foreground z-10">
                    ${Math.round(ask.total).toLocaleString()}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Spread Indicator Strip */}
          <div className="py-2.5 px-3 my-1 rounded-lg bg-muted/40 border border-border/60 flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-foreground">
                ${bestBid.toLocaleString()}
              </span>
              <span className="text-[11px] text-muted-foreground">Market Price</span>
            </div>
            <div className="text-[11px] text-muted-foreground">
              Spread: <strong className="text-foreground">${spread}</strong> ({spreadPct}%)
            </div>
          </div>

          {/* Bids (Buy Orders - Green, stacked from high to low) */}
          <div className="space-y-1 py-2">
            {bids.map((bid) => {
              const depthPct = Math.min(100, Math.round((bid.total / maxBidTotal) * 100));
              return (
                <div
                  key={bid.id}
                  className={`relative flex items-center justify-between text-xs font-mono py-1 px-1.5 rounded transition-colors ${
                    bid.isUser ? 'bg-amber-500/15 border border-amber-500/40' : 'hover:bg-muted/40'
                  }`}
                >
                  {/* Visual Depth Bar */}
                  <div
                    className="absolute right-0 top-0 bottom-0 bg-emerald-500/10 pointer-events-none rounded-r"
                    style={{ width: `${depthPct}%` }}
                  />
                  <span className="text-emerald-500 font-bold z-10">
                    ${bid.price.toLocaleString()} {bid.isUser && '★'}
                  </span>
                  <span className="text-muted-foreground z-10">{bid.amount.toFixed(4)}</span>
                  <span className="text-foreground z-10">
                    ${Math.round(bid.total).toLocaleString()}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Execution Form & Recent Trades (6 cols) */}
        <div className="lg:col-span-6 p-4 flex flex-col justify-between">
          <form onSubmit={handlePlaceOrder} className="space-y-4">
            {/* Buy / Sell Toggle */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-muted/40 rounded-xl border border-border/60">
              <button
                type="button"
                onClick={() => setSide('buy')}
                className={`cursor-pointer py-2 rounded-lg text-xs font-bold transition-all ${
                  side === 'buy'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Buy BTC
              </button>
              <button
                type="button"
                onClick={() => setSide('sell')}
                className={`cursor-pointer py-2 rounded-lg text-xs font-bold transition-all ${
                  side === 'sell'
                    ? 'bg-red-600 text-white shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Sell BTC
              </button>
            </div>

            {/* Order Type Toggle (Limit vs Market) */}
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-muted-foreground">Execution Mode:</span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setOrderType('limit')}
                  className={`cursor-pointer px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                    orderType === 'limit'
                      ? 'bg-primary text-primary-foreground font-bold'
                      : 'bg-muted text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Limit (Maker)
                </button>
                <button
                  type="button"
                  onClick={() => setOrderType('market')}
                  className={`cursor-pointer px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                    orderType === 'market'
                      ? 'bg-primary text-primary-foreground font-bold'
                      : 'bg-muted text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Market (Taker)
                </button>
              </div>
            </div>

            {/* Price Input (Disabled for Market) */}
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">
                Price (USDT)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="10"
                  disabled={orderType === 'market'}
                  value={orderType === 'market' ? (side === 'buy' ? bestAsk : bestBid) : limitPrice}
                  onChange={(e) => setLimitPrice(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm font-mono text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary/40 disabled:opacity-60"
                />
                <span className="absolute right-3 top-2.5 text-xs text-muted-foreground font-mono">
                  {orderType === 'market' ? 'Best Market' : 'USDT'}
                </span>
              </div>
            </div>

            {/* Amount Input */}
            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground mb-1">
                <span>Amount (BTC)</span>
                <span className="text-[11px] font-mono">
                  Available:{' '}
                  {side === 'buy'
                    ? `$${fiatBalance.toFixed(0)}`
                    : `${cryptoBalance.toFixed(3)} BTC`}
                </span>
              </div>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  min="0.001"
                  value={amount}
                  onChange={(e) => setAmount(Math.max(0.001, Number(e.target.value)))}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm font-mono text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary/40"
                />
                <span className="absolute right-3 top-2.5 text-xs text-muted-foreground font-mono">
                  BTC
                </span>
              </div>
            </div>

            {/* Total & Fee Estimation */}
            <div className="p-3 rounded-lg bg-muted/30 border border-border/50 text-xs space-y-1.5 font-mono">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal:</span>
                <span className="text-foreground">
                  $
                  {(
                    amount *
                    (orderType === 'market' ? (side === 'buy' ? bestAsk : bestBid) : limitPrice)
                  ).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Fee Tier ({orderType === 'limit' ? 'Maker 0.05%' : 'Taker 0.15%'}):</span>
                <span
                  className={
                    orderType === 'limit' ? 'text-emerald-500 font-bold' : 'text-amber-500'
                  }
                >
                  $
                  {(
                    amount *
                    (orderType === 'market' ? (side === 'buy' ? bestAsk : bestBid) : limitPrice) *
                    (orderType === 'limit' ? 0.0005 : 0.0015)
                  ).toFixed(2)}
                </span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className={`cursor-pointer w-full py-3 rounded-xl font-bold text-sm text-white shadow-md transition-all active:scale-98 ${
                side === 'buy'
                  ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/20'
                  : 'bg-red-600 hover:bg-red-500 shadow-red-500/20'
              }`}
            >
              {side === 'buy' ? 'Buy BTC' : 'Sell BTC'}{' '}
              {orderType === 'limit' ? '(Post Limit Order)' : '(Execute Market)'}
            </button>

            {statusMessage && (
              <div className="p-2.5 rounded-lg text-xs font-mono bg-muted/60 border border-border animate-fadeIn">
                {statusMessage}
              </div>
            )}
          </form>

          {/* Mini Tape: Recent Trades */}
          <div className="mt-4 pt-3 border-t border-border/60">
            <div className="text-[11px] font-semibold uppercase text-muted-foreground mb-1.5">
              Recent Executed Trades
            </div>
            <div className="space-y-1">
              {trades.slice(0, 4).map((t) => (
                <div key={t.id} className="flex items-center justify-between text-[11px] font-mono">
                  <span className="text-muted-foreground">{t.time}</span>
                  <span className={t.side === 'buy' ? 'text-emerald-500' : 'text-red-500'}>
                    ${t.price.toLocaleString()}
                  </span>
                  <span className="text-muted-foreground">{t.amount} BTC</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Educational Explainer Bar */}
      <div className="px-5 py-3.5 bg-primary/5 border-t border-border/70 text-xs text-muted-foreground flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-primary">💡 Pro Trading Insight:</span>
          <span>
            <strong>Makers</strong> add liquidity by waiting on the book (paying only 0.05%).{' '}
            <strong>Takers</strong> take liquidity immediately (paying 0.15% + spread).
          </span>
        </div>
        <span className="font-mono text-[11px] text-muted-foreground">Simulated Exchange v1.0</span>
      </div>
    </div>
  );
}
