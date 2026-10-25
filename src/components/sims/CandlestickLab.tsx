import { useState } from 'react';

type CandlePreset = {
  id: string;
  name: string;
  type: 'bullish' | 'bearish' | 'neutral';
  open: number;
  close: number;
  high: number;
  low: number;
  meaning: string;
  tradingImplication: string;
};

const PRESETS: CandlePreset[] = [
  {
    id: 'hammer',
    name: 'Bullish Hammer',
    type: 'bullish',
    open: 65200,
    close: 65800,
    high: 65900,
    low: 64200,
    meaning:
      'Sellers drove the price down aggressively, but buyers completely absorbed the selling pressure and forced the close near the day high.',
    tradingImplication:
      'Often marks the bottom of a downtrend. High probability long entry with stop-loss just below the lower wick.',
  },
  {
    id: 'shooting_star',
    name: 'Shooting Star',
    type: 'bearish',
    open: 66200,
    close: 65700,
    high: 67800,
    low: 65600,
    meaning:
      'Buyers attempted to push prices higher, but institutional sellers rejected the rally and dumped price back down to the open.',
    tradingImplication:
      'Bearish reversal signal at market tops. Time to take profits or set tight trailing stops.',
  },
  {
    id: 'bullish_engulfing',
    name: 'Bullish Strong Candle (Marubozu)',
    type: 'bullish',
    open: 64000,
    close: 67200,
    high: 67300,
    low: 63900,
    meaning:
      'Continuous, overpowering buying demand from the open to the close with virtually zero wicks. Total buyer conviction.',
    tradingImplication:
      'Strong trend continuation. Signals aggressive market orders breaking past resistance.',
  },
  {
    id: 'doji',
    name: 'Doji (Indecision)',
    type: 'neutral',
    open: 65500,
    close: 65520,
    high: 66800,
    low: 64300,
    meaning:
      'Buyers and sellers fought furiously throughout the session, but neither could gain control, resulting in a virtually identical open and close.',
    tradingImplication:
      'Market equilibrium. A major breakout or trend reversal is imminent once volume resolves the tie.',
  },
];

export default function CandlestickLab() {
  const [selectedPresetId, setSelectedPresetId] = useState<string>('hammer');
  const [openPrice, setOpenPrice] = useState<number>(65200);
  const [closePrice, setClosePrice] = useState<number>(65800);
  const [highPrice, setHighPrice] = useState<number>(65900);
  const [lowPrice, setLowPrice] = useState<number>(64200);

  const applyPreset = (preset: CandlePreset) => {
    setSelectedPresetId(preset.id);
    setOpenPrice(preset.open);
    setClosePrice(preset.close);
    setHighPrice(preset.high);
    setLowPrice(preset.low);
  };

  const isBullish = closePrice >= openPrice;

  // Math for visual geometry
  const minVal = Math.min(lowPrice, openPrice, closePrice, 63000);
  const maxVal = Math.max(highPrice, openPrice, closePrice, 68000);
  const totalRange = maxVal - minVal || 1;

  // Convert price to percentage from bottom (0% = minVal, 100% = maxVal)
  const getPercent = (price: number) =>
    Math.max(0, Math.min(100, ((price - minVal) / totalRange) * 100));

  const highPct = getPercent(highPrice);
  const lowPct = getPercent(lowPrice);
  const openPct = getPercent(openPrice);
  const closePct = getPercent(closePrice);

  const bodyBottomPct = Math.min(openPct, closePct);
  const bodyHeightPct = Math.max(2, Math.abs(closePct - openPct));

  const upperWickHeight = highPct - Math.max(openPct, closePct);
  const lowerWickHeight = Math.min(openPct, closePct) - lowPct;

  const currentPreset = PRESETS.find((p) => p.id === selectedPresetId);

  return (
    <div className="my-8 rounded-2xl border border-border bg-card/80 p-5 md:p-7 shadow-lg backdrop-blur-sm">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-border/60 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 mb-2">
            <span>📊 Interactive Lab</span>
            <span>•</span>
            <span>Technical Market Literacy</span>
          </div>
          <h3 className="text-xl font-bold tracking-tight text-foreground m-0">
            Candlestick Anatomy & Price Action Inspector
          </h3>
          <p className="text-xs text-muted-foreground mt-1 mb-0">
            Deconstruct how Open, High, Low, and Close prices reveal the real-time psychological
            struggle between buyers and sellers.
          </p>
        </div>

        <div className="text-right bg-muted/40 px-3 py-2 rounded-xl border border-border/50 font-mono">
          <div className="text-[11px] text-muted-foreground uppercase">Candle State</div>
          <div className={`text-xs font-bold ${isBullish ? 'text-emerald-500' : 'text-rose-500'}`}>
            {isBullish ? '🟢 Bullish (Close ≥ Open)' : '🔴 Bearish (Close < Open)'}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
        {/* Left Column: Interactive Candle Canvas */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center p-6 rounded-2xl bg-muted/20 border border-border relative min-h-[380px]">
          <div className="absolute top-3 left-4 text-[11px] font-mono text-muted-foreground">
            Price Scale (High to Low)
          </div>

          {/* Candle Container */}
          <div className="relative w-36 h-72 flex flex-col items-center justify-end border-l border-dashed border-border/70 pl-6">
            {/* High Price Marker */}
            <div
              className="absolute left-8 font-mono text-xs font-bold text-foreground transition-all duration-200"
              style={{ bottom: `${highPct}%` }}
            >
              ▲ High: ${highPrice.toLocaleString()}
            </div>

            {/* Upper Wick Line */}
            <div
              className={`w-1 transition-all duration-200 ${
                isBullish ? 'bg-emerald-500' : 'bg-rose-500'
              }`}
              style={{
                position: 'absolute',
                bottom: `${Math.max(openPct, closePct)}%`,
                height: `${upperWickHeight}%`,
              }}
            />

            {/* Candle Body */}
            <div
              className={`w-16 rounded-md border transition-all duration-200 flex flex-col justify-between p-1.5 font-mono text-[10px] text-white select-none ${
                isBullish
                  ? 'bg-emerald-500 border-emerald-400 shadow-lg shadow-emerald-500/20'
                  : 'bg-rose-500 border-rose-400 shadow-lg shadow-rose-500/20'
              }`}
              style={{
                position: 'absolute',
                bottom: `${bodyBottomPct}%`,
                height: `${bodyHeightPct}%`,
              }}
            >
              <div className="truncate text-center font-bold">
                {isBullish ? `Close $${closePrice}` : `Open $${openPrice}`}
              </div>
              <div className="truncate text-center font-bold">
                {isBullish ? `Open $${openPrice}` : `Close $${closePrice}`}
              </div>
            </div>

            {/* Lower Wick Line */}
            <div
              className={`w-1 transition-all duration-200 ${
                isBullish ? 'bg-emerald-500' : 'bg-rose-500'
              }`}
              style={{
                position: 'absolute',
                bottom: `${lowPct}%`,
                height: `${lowerWickHeight}%`,
              }}
            />

            {/* Low Price Marker */}
            <div
              className="absolute left-8 font-mono text-xs font-bold text-foreground transition-all duration-200"
              style={{ bottom: `${lowPct}%` }}
            >
              ▼ Low: ${lowPrice.toLocaleString()}
            </div>
          </div>

          <div className="mt-4 text-center">
            <span className="text-xs font-mono text-muted-foreground">
              Total Range: ${(highPrice - lowPrice).toLocaleString()} | Body: $
              {Math.abs(closePrice - openPrice).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Right Column: Pattern Presets & Interactive Sliders */}
        <div className="lg:col-span-7 space-y-5">
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
              1. Classic High-Winrate Candlestick Patterns
            </label>
            <div className="grid grid-cols-2 gap-2">
              {PRESETS.map((p) => {
                const isSelected = p.id === selectedPresetId;
                return (
                  <button
                    key={p.id}
                    onClick={() => applyPreset(p)}
                    className={`text-left p-3 rounded-xl border text-xs transition-all ${
                      isSelected
                        ? 'border-primary bg-primary/10 text-primary font-semibold ring-1 ring-primary/40'
                        : 'border-border bg-card hover:border-primary/40 text-foreground'
                    }`}
                  >
                    <div className="font-bold flex items-center justify-between">
                      <span>{p.name}</span>
                      <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-muted">
                        {p.type}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Pattern Deep Dive Explanation */}
          {currentPreset && (
            <div className="p-4 rounded-xl border border-border bg-muted/20 space-y-2 text-xs">
              <div className="font-bold text-foreground flex items-center gap-2">
                <span>🔍 Price Action Analysis:</span>
                <span className="text-primary">{currentPreset.name}</span>
              </div>
              <p className="text-muted-foreground leading-relaxed m-0 text-[11px]">
                {currentPreset.meaning}
              </p>
              <div className="pt-2 border-t border-border/50 text-[11px] text-muted-foreground">
                <strong className="text-foreground">Income Execution Rule:</strong>{' '}
                {currentPreset.tradingImplication}
              </div>
            </div>
          )}

          {/* Manual Price Sliders */}
          <div className="p-4 rounded-xl border border-border bg-card space-y-3">
            <div className="text-xs font-bold text-foreground">2. Custom Candlestick Sculptor</div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-muted-foreground">Open Price:</span>
                <span className="font-mono font-bold text-foreground">
                  ${openPrice.toLocaleString()}
                </span>
              </div>
              <input
                type="range"
                min="64000"
                max="67000"
                step="50"
                value={openPrice}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setOpenPrice(val);
                  if (val > highPrice) setHighPrice(val);
                  if (val < lowPrice) setLowPrice(val);
                }}
                className="w-full accent-primary h-2 bg-muted rounded-lg cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-muted-foreground">Close Price:</span>
                <span className="font-mono font-bold text-foreground">
                  ${closePrice.toLocaleString()}
                </span>
              </div>
              <input
                type="range"
                min="64000"
                max="67000"
                step="50"
                value={closePrice}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setClosePrice(val);
                  if (val > highPrice) setHighPrice(val);
                  if (val < lowPrice) setLowPrice(val);
                }}
                className="w-full accent-primary h-2 bg-muted rounded-lg cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-muted-foreground">High (Max Upper Wick):</span>
                <span className="font-mono font-bold text-foreground">
                  ${highPrice.toLocaleString()}
                </span>
              </div>
              <input
                type="range"
                min="65000"
                max="68000"
                step="50"
                value={highPrice}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  if (val >= Math.max(openPrice, closePrice)) setHighPrice(val);
                }}
                className="w-full accent-primary h-2 bg-muted rounded-lg cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-muted-foreground">Low (Max Lower Wick):</span>
                <span className="font-mono font-bold text-foreground">
                  ${lowPrice.toLocaleString()}
                </span>
              </div>
              <input
                type="range"
                min="63000"
                max="65500"
                step="50"
                value={lowPrice}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  if (val <= Math.min(openPrice, closePrice)) setLowPrice(val);
                }}
                className="w-full accent-primary h-2 bg-muted rounded-lg cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
