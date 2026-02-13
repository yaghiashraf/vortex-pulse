"use client";

import Link from "next/link";
import StatCard from "@/components/StatCard";
import { useState } from "react";
import { MarketRegime, StockMeta } from "@/lib/types";

const FEATURES = [
  {
    title: "Time-of-Day Heatmaps",
    description: "See when each stock moves. Historical volatility and volume mapped across the trading day.",
    href: "/heatmap/SPY",
    icon: "▦",
    color: "from-blue-500/20 to-blue-600/5",
  },
  {
    title: "Gap Fill Calculator",
    description: "Historical gap fill probabilities by size, direction, and day of week.",
    href: "/gaps/SPY",
    icon: "⇥",
    color: "from-green-500/20 to-green-600/5",
  },
  {
    title: "Session Rhythm",
    description: "Opening drive, lunch chop, close auction — know which session phase suits your strategy.",
    href: "/rhythm/SPY",
    icon: "◫",
    color: "from-purple-500/20 to-purple-600/5",
  },
  {
    title: "Day-of-Week Edge",
    description: "Statistical tendencies by day of week. Monday gaps, Friday positioning, and more.",
    href: "/calendar",
    icon: "▤",
    color: "from-amber-500/20 to-amber-600/5",
  },
  {
    title: "IB Statistics",
    description: "Initial Balance break/hold rates, extension targets, and historical IB range data.",
    href: "/ib/SPY",
    icon: "⟛",
    color: "from-cyan-500/20 to-cyan-600/5",
  },
  {
    title: "My Trading Plan",
    description: "Build a personalized trading schedule based on your watchlist's optimal windows.",
    href: "/plan",
    icon: "☰",
    color: "from-pink-500/20 to-pink-600/5",
  },
];

interface DashboardViewProps {
  regime: MarketRegime;
  stocks: StockMeta[];
  optimalWindows: { ticker: string; windows: { start: string; end: string; score: number }[] }[];
}

export default function DashboardView({ regime, stocks, optimalWindows }: DashboardViewProps) {
  const [showAll, setShowAll] = useState(false);

  const regimeColor = {
    trending: "green" as const,
    ranging: "amber" as const,
    volatile: "red" as const,
  };

  const regimeLabel = {
    trending: "TRENDING",
    ranging: "RANGING",
    volatile: "VOLATILE",
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Hero */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-vortex-text-bright mb-2">
          Know when the edge is in your favor.
        </h1>
        <p className="text-sm text-vortex-muted max-w-2xl">
          VortexPulse uses real-time statistical analysis to help day traders identify optimal
          trading windows, gap fill probabilities, and session rhythm patterns.
        </p>
      </div>

      {/* Market Regime Banner */}
      <div className="mb-8 bg-vortex-card border border-vortex-border rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div
                className={`w-2.5 h-2.5 rounded-full pulse-dot ${
                  regime.regime === "trending"
                    ? "bg-vortex-green"
                    : regime.regime === "ranging"
                    ? "bg-vortex-amber"
                    : "bg-vortex-red"
                }`}
              />
              <span className="text-xs uppercase tracking-wider text-vortex-muted">
                Market Regime
              </span>
            </div>
            <span
              className={`text-sm font-bold font-mono ${
                regime.regime === "trending"
                  ? "text-vortex-green"
                  : regime.regime === "ranging"
                  ? "text-vortex-amber"
                  : "text-vortex-red"
              }`}
            >
              {regimeLabel[regime.regime]}
            </span>
            <span className="text-[10px] text-vortex-muted">
              ({(regime.confidence * 100).toFixed(0)}% confidence)
            </span>
          </div>
          <Link
            href="/rhythm/SPY"
            className="text-[10px] text-vortex-accent hover:text-vortex-accent-bright transition-colors uppercase tracking-wider"
          >
            Full Analysis →
          </Link>
        </div>

        <p className="text-xs text-vortex-text mb-4">{regime.description}</p>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <StatCard label="VIX" value={regime.vixLevel.toFixed(2)} color={regime.vixLevel > 25 ? "red" : regime.vixLevel > 18 ? "amber" : "green"} />
          <StatCard label="VIX Trend" value={regime.vixTrend.toUpperCase()} color={regime.vixTrend === "falling" ? "green" : regime.vixTrend === "rising" ? "red" : "amber"} />
          <StatCard label="Breadth" value={`${regime.breadthScore}%`} color={regime.breadthScore > 55 ? "green" : regime.breadthScore > 40 ? "amber" : "red"} />
          <StatCard label="Trend W/R" value={`${(regime.trendWinRate * 100).toFixed(0)}%`} color="blue" subValue="trend following" />
          <StatCard label="MR W/R" value={`${(regime.meanReversionWinRate * 100).toFixed(0)}%`} color="purple" subValue="mean reversion" />
        </div>
      </div>

      {/* Today's Optimal Windows */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-vortex-text-bright uppercase tracking-wider">
            Top Trading Windows Today
          </h2>
          <Link
            href="/plan"
            className="text-[10px] text-vortex-accent hover:text-vortex-accent-bright transition-colors uppercase tracking-wider"
          >
            Customize →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {optimalWindows.map(({ ticker, windows }) => (
            <Link
              key={ticker}
              href={`/heatmap/${ticker}`}
              className="bg-vortex-card border border-vortex-border rounded-lg p-4 hover:border-vortex-accent/40 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono font-bold text-sm text-vortex-text-bright">
                  {ticker}
                </span>
                <span className="text-[10px] text-vortex-muted">
                  {stocks.find((s) => s.ticker === ticker)?.name}
                </span>
              </div>
              <div className="space-y-1.5">
                {windows.map((w, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div
                      className="h-1.5 rounded-full"
                      style={{
                        width: `${w.score * 100}%`,
                        backgroundColor:
                          i === 0
                            ? "#22c55e"
                            : i === 1
                            ? "#3b82f6"
                            : "#6b7280",
                      }}
                    />
                    <span className="text-[10px] font-mono text-vortex-muted whitespace-nowrap">
                      {w.start}-{w.end}
                    </span>
                    <span className="text-[10px] font-mono text-vortex-text">
                      {(w.score * 100).toFixed(0)}
                    </span>
                  </div>
                ))}
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Feature Grid */}
      <div className="mb-8">
        <h2 className="text-sm font-semibold text-vortex-text-bright uppercase tracking-wider mb-4">
          Tools
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((feature) => (
            <Link
              key={feature.href}
              href={feature.href}
              className="group bg-vortex-card border border-vortex-border rounded-xl p-5 hover:border-vortex-accent/40 transition-all"
            >
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${feature.color} flex items-center justify-center text-lg mb-3`}>
                {feature.icon}
              </div>
              <h3 className="text-sm font-semibold text-vortex-text-bright mb-1 group-hover:text-vortex-accent-bright transition-colors">
                {feature.title}
              </h3>
              <p className="text-xs text-vortex-muted leading-relaxed">
                {feature.description}
              </p>
            </Link>
          ))}
        </div>
      </div>

      {/* Popular Stocks Quick Access */}
      <div className="mb-8">
        <h2 className="text-sm font-semibold text-vortex-text-bright uppercase tracking-wider mb-4">
          Popular Stocks
        </h2>
        <div className="flex flex-wrap gap-2">
          {(showAll ? stocks : stocks.slice(0, 10)).map((stock) => (
            <Link
              key={stock.ticker}
              href={`/heatmap/${stock.ticker}`}
              className="bg-vortex-card border border-vortex-border rounded-md px-3 py-1.5 text-xs font-mono hover:border-vortex-accent/40 hover:text-vortex-accent-bright transition-colors"
            >
              {stock.ticker}
            </Link>
          ))}
          {!showAll && stocks.length > 10 && (
            <button
              onClick={() => setShowAll(true)}
              className="text-xs text-vortex-accent hover:text-vortex-accent-bright transition-colors px-2"
            >
              +{stocks.length - 10} more
            </button>
          )}
        </div>
      </div>

      {/* Product Ecosystem */}
      <div className="border-t border-vortex-border pt-8">
        <h2 className="text-sm font-semibold text-vortex-text-bright uppercase tracking-wider mb-4">
          Vortex Capital Group Ecosystem
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 rounded-xl p-5">
            <div className="text-xs text-blue-400 uppercase tracking-wider mb-1">Step 1 — When</div>
            <h3 className="text-sm font-bold text-vortex-text-bright mb-1">VortexPulse</h3>
            <p className="text-xs text-vortex-muted mb-3">
              Statistical timing intelligence. Know when the edge is in your favor.
            </p>
            <span className="text-[10px] text-blue-400 font-mono">vortexpulse.app</span>
          </div>
          <a
            href="https://vortexedge.tech"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/20 rounded-xl p-5 hover:border-green-500/40 transition-colors"
          >
            <div className="text-xs text-green-400 uppercase tracking-wider mb-1">Step 2 — What</div>
            <h3 className="text-sm font-bold text-vortex-text-bright mb-1">VortexEdge</h3>
            <p className="text-xs text-vortex-muted mb-3">
              Market intelligence terminal. Pattern recognition & quantitative screening.
            </p>
            <span className="text-[10px] text-green-400 font-mono">vortexedge.tech</span>
          </a>
          <a
            href="https://vortexflow.app"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-gradient-to-br from-cyan-500/10 to-cyan-600/5 border border-cyan-500/20 rounded-xl p-5 hover:border-cyan-500/40 transition-colors"
          >
            <div className="text-xs text-cyan-400 uppercase tracking-wider mb-1">Step 3 — How</div>
            <h3 className="text-sm font-bold text-vortex-text-bright mb-1">VortexFlow</h3>
            <p className="text-xs text-vortex-muted mb-3">
              Order flow visualization. Real-time price ladder, CVD, and large trade alerts.
            </p>
            <span className="text-[10px] text-cyan-400 font-mono">vortexflow.app</span>
          </a>
        </div>
      </div>
    </div>
  );
}
