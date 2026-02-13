"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { StockMeta, MarketRegime, SessionPhase, TimeSlot } from "@/lib/types";
import { fetchWatchlistData } from "@/app/actions";

const PRESET_WATCHLISTS: { name: string; tickers: string[] }[] = [
  { name: "Tech Leaders", tickers: ["AAPL", "NVDA", "MSFT", "GOOGL", "META", "AMD"] },
  { name: "High Beta", tickers: ["TSLA", "COIN", "MARA", "SMCI", "RIVN", "SOFI"] },
  { name: "ETFs", tickers: ["SPY", "QQQ"] },
  { name: "Mega Caps", tickers: ["AAPL", "MSFT", "AMZN", "GOOGL", "META", "NVDA"] },
];

interface PlanViewProps {
  stocks: StockMeta[];
  regime: MarketRegime;
}

interface TickerData {
  ticker: string;
  windows: { start: string; end: string; score: number }[];
  todData: TimeSlot[];
  phases: SessionPhase[];
}

export default function PlanView({ stocks, regime }: PlanViewProps) {
  const [watchlist, setWatchlist] = useState<string[]>(["SPY", "TSLA", "NVDA", "AAPL"]);
  const [inputTicker, setInputTicker] = useState("");
  const [data, setData] = useState<TickerData[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    const loadData = async () => {
      setLoading(true);
      try {
        const result = await fetchWatchlistData(watchlist);
        if (mounted) {
            setData(result);
        }
      } catch (e) {
        console.error(e);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    
    // Debounce or just call? For now call.
    if (watchlist.length > 0) {
        loadData();
    } else {
        setData([]);
    }

    return () => { mounted = false; };
  }, [watchlist]);

  const addTicker = (ticker: string) => {
    const upper = ticker.toUpperCase().trim();
    if (upper && !watchlist.includes(upper) && stocks.find((s) => s.ticker === upper)) {
      setWatchlist([...watchlist, upper]);
    }
    setInputTicker("");
  };

  const removeTicker = (ticker: string) => {
    setWatchlist(watchlist.filter((t) => t !== ticker));
  };

  // Aggregate optimal windows
  type TimeWindow = { time: string; tickers: { ticker: string; score: number }[] };
  const timeMap = new Map<string, TimeWindow>();

  data.forEach(({ ticker, windows: w }) => {
    w.forEach((win) => {
      const key = `${win.start}-${win.end}`;
      if (!timeMap.has(key)) {
        timeMap.set(key, { time: key, tickers: [] });
      }
      timeMap.get(key)!.tickers.push({ ticker, score: win.score });
    });
  });

  const aggregatedWindows = Array.from(timeMap.values())
    .map((w) => ({
      ...w,
      avgScore: w.tickers.reduce((sum, t) => sum + t.score, 0) / w.tickers.length,
      count: w.tickers.length,
    }))
    .sort((a, b) => b.count * b.avgScore - a.count * a.avgScore);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-vortex-text-bright mb-1">My Trading Plan</h1>
        <p className="text-xs text-vortex-muted">
          Personalized optimal trading schedule based on your watchlist
        </p>
      </div>

      {/* Watchlist Builder */}
      <div className="bg-vortex-card border border-vortex-border rounded-xl p-5 mb-6">
        <h2 className="text-xs uppercase tracking-wider text-vortex-muted mb-3">
          Your Watchlist
        </h2>

        {/* Preset Buttons */}
        <div className="flex flex-wrap gap-2 mb-3">
          {PRESET_WATCHLISTS.map((preset) => (
            <button
              key={preset.name}
              onClick={() => setWatchlist(preset.tickers)}
              className="px-3 py-1 rounded-md text-[10px] font-medium bg-vortex-surface border border-vortex-border text-vortex-muted hover:text-vortex-text hover:border-vortex-accent/40 transition-colors"
            >
              {preset.name}
            </button>
          ))}
        </div>

        {/* Current Watchlist */}
        <div className="flex flex-wrap gap-2 mb-3">
          {watchlist.map((ticker) => (
            <span
              key={ticker}
              className="inline-flex items-center gap-1.5 bg-vortex-accent/10 border border-vortex-accent/30 rounded-md px-2.5 py-1 text-xs font-mono"
            >
              <span className="text-vortex-accent-bright">{ticker}</span>
              <button
                onClick={() => removeTicker(ticker)}
                className="text-vortex-muted hover:text-vortex-red transition-colors"
              >
                ×
              </button>
            </span>
          ))}
        </div>

        {/* Add Ticker */}
        <div className="flex gap-2">
          <input
            type="text"
            value={inputTicker}
            onChange={(e) => setInputTicker(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addTicker(inputTicker)}
            placeholder="Add ticker (e.g., AAPL)"
            className="bg-vortex-surface border border-vortex-border rounded-md px-3 py-1.5 text-xs text-vortex-text placeholder-vortex-muted focus:outline-none focus:border-vortex-accent w-48 font-mono"
          />
          <button
            onClick={() => addTicker(inputTicker)}
            className="px-4 py-1.5 bg-vortex-accent rounded-md text-xs font-medium text-white hover:bg-vortex-accent-bright transition-colors"
          >
            Add
          </button>
        </div>
      </div>

      {/* Market Context */}
      <div className="bg-vortex-card border border-vortex-border rounded-xl p-5 mb-6">
        <div className="flex items-center gap-3 mb-3">
          <div
            className={`w-2 h-2 rounded-full pulse-dot ${
              regime.regime === "trending"
                ? "bg-vortex-green"
                : regime.regime === "ranging"
                ? "bg-vortex-amber"
                : "bg-vortex-red"
            }`}
          />
          <h2 className="text-xs uppercase tracking-wider text-vortex-muted">
            Today&apos;s Market Context
          </h2>
          <span
            className={`text-xs font-bold font-mono ${
              regime.regime === "trending"
                ? "text-vortex-green"
                : regime.regime === "ranging"
                ? "text-vortex-amber"
                : "text-vortex-red"
            }`}
          >
            {regime.regime.toUpperCase()}
          </span>
        </div>
        <p className="text-xs text-vortex-text mb-2">{regime.description}</p>
        <div className="flex gap-4 text-[10px]">
          <span className="text-vortex-muted">
            VIX: <span className="text-vortex-text font-mono">{regime.vixLevel.toFixed(2)}</span>
          </span>
          <span className="text-vortex-muted">
            Trend WR:{" "}
            <span className="text-vortex-text font-mono">
              {(regime.trendWinRate * 100).toFixed(0)}%
            </span>
          </span>
          <span className="text-vortex-muted">
            MR WR:{" "}
            <span className="text-vortex-text font-mono">
              {(regime.meanReversionWinRate * 100).toFixed(0)}%
            </span>
          </span>
        </div>
      </div>

      {/* Optimal Trading Schedule */}
      <div className="bg-vortex-card border border-vortex-border rounded-xl p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs uppercase tracking-wider text-vortex-muted">
                Your Optimal Trading Schedule
            </h2>
            {loading && <span className="text-xs text-vortex-accent animate-pulse">Updating analysis...</span>}
        </div>

        {watchlist.length === 0 ? (
          <p className="text-xs text-vortex-muted py-8 text-center">
            Add tickers to your watchlist to see your personalized schedule
          </p>
        ) : (
          <>
            {/* Top Windows */}
            <div className="mb-6">
              <div className="text-[10px] text-vortex-muted mb-2 uppercase tracking-wider">
                Priority Windows (most overlap)
              </div>
              <div className="space-y-2">
                {aggregatedWindows.slice(0, 5).map((w, i) => (
                  <div
                    key={w.time}
                    className={`flex items-center gap-3 p-3 rounded-lg ${
                      i === 0
                        ? "bg-vortex-green/10 border border-vortex-green/20"
                        : "bg-vortex-surface border border-vortex-border/50"
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full bg-vortex-bg flex items-center justify-center">
                      <span className="text-xs font-bold text-vortex-text-bright">#{i + 1}</span>
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-mono font-bold text-vortex-text-bright">
                        {w.time}
                      </div>
                      <div className="flex gap-1.5 mt-0.5">
                        {w.tickers.map((t) => (
                          <Link
                            key={t.ticker}
                            href={`/heatmap/${t.ticker}`}
                            className="text-[9px] font-mono bg-vortex-accent/10 text-vortex-accent-bright px-1.5 py-0.5 rounded hover:bg-vortex-accent/20 transition-colors"
                          >
                            {t.ticker}
                          </Link>
                        ))}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-mono text-vortex-text">
                        {w.count} ticker{w.count > 1 ? "s" : ""}
                      </div>
                      <div className="text-[10px] text-vortex-muted">
                        score: {(w.avgScore * 100).toFixed(0)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Per-Ticker Breakdown */}
            <div>
              <div className="text-[10px] text-vortex-muted mb-2 uppercase tracking-wider">
                Per-Ticker Best Windows
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {data.map(({ ticker, windows: w, phases }) => {
                  const bestPhase = phases.reduce(
                    (best, p) => (p.trendProb > best.trendProb ? p : best),
                    phases[0]
                  );

                  return (
                    <div
                      key={ticker}
                      className="bg-vortex-surface rounded-lg p-4 border border-vortex-border/50"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-mono font-bold text-sm text-vortex-text-bright">
                          {ticker}
                        </span>
                        <Link
                          href={`/heatmap/${ticker}`}
                          className="text-[9px] text-vortex-accent hover:text-vortex-accent-bright"
                        >
                          Full Analysis →
                        </Link>
                      </div>
                      <div className="space-y-1">
                        {w.map((win, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <div
                              className="w-1.5 h-1.5 rounded-full"
                              style={{
                                backgroundColor:
                                  i === 0 ? "#22c55e" : i === 1 ? "#3b82f6" : "#6b7280",
                              }}
                            />
                            <span className="text-xs font-mono text-vortex-text">
                              {win.start}-{win.end}
                            </span>
                            <span className="text-[10px] text-vortex-muted">
                              score {(win.score * 100).toFixed(0)}
                            </span>
                          </div>
                        ))}
                      </div>
                      <div className="mt-2 text-[9px] text-vortex-muted">
                        Best session: <span className="text-vortex-accent-bright">{bestPhase.name}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Action Items */}
      <div className="bg-vortex-surface border border-vortex-border rounded-xl p-5">
        <h2 className="text-xs uppercase tracking-wider text-vortex-accent mb-3">
          Today&apos;s Action Plan
        </h2>
        <div className="space-y-3 text-xs text-vortex-text">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-vortex-accent/10 flex items-center justify-center text-vortex-accent text-[10px] font-bold mt-0.5">
              1
            </div>
            <div>
              <strong className="text-vortex-text-bright">Pre-Market (8:00-9:30 AM)</strong>
              <p className="text-vortex-muted mt-0.5">
                Review overnight gaps on VortexEdge. Check gap fill probabilities here for each
                gapping stock.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-vortex-accent/10 flex items-center justify-center text-vortex-accent text-[10px] font-bold mt-0.5">
              2
            </div>
            <div>
              <strong className="text-vortex-text-bright">Opening Drive (9:30-10:00 AM)</strong>
              <p className="text-vortex-muted mt-0.5">
                {regime.regime === "trending"
                  ? "Market is trending — follow the opening momentum. Use VortexFlow for entry confirmation."
                  : regime.regime === "ranging"
                  ? "Market is ranging — watch for failed breakouts and fade extreme moves."
                  : "High volatility — reduce size and wait for clearer setups."}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-vortex-amber/10 flex items-center justify-center text-vortex-amber text-[10px] font-bold mt-0.5">
              3
            </div>
            <div>
              <strong className="text-vortex-text-bright">Lunch (11:30 AM-1:30 PM)</strong>
              <p className="text-vortex-muted mt-0.5">
                Dead zone. Step away or use this time to review morning trades and plan afternoon
                setups.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-vortex-accent/10 flex items-center justify-center text-vortex-accent text-[10px] font-bold mt-0.5">
              4
            </div>
            <div>
              <strong className="text-vortex-text-bright">Afternoon (1:30-4:00 PM)</strong>
              <p className="text-vortex-muted mt-0.5">
                Focus on your priority windows above. Use IB data for extension targets. Monitor
                VortexFlow for institutional positioning into the close.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
