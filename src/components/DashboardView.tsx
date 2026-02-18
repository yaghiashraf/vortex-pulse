"use client";

import Link from "next/link";
import StatCard from "@/components/StatCard";
import RecentTickers from "@/components/RecentTickers";
import DashboardWindows from "@/components/DashboardWindows";
import { MarketRegime, StockMeta, IndexSnapshot } from "@/lib/types";

const FEATURES = [
  {
    title: "Ticker Analysis",
    description: "Heatmaps, session rhythm, IB stats, and day-of-week edge — all in one unified view.",
    href: "/ticker/SPY",
    icon: "▦",
    color: "from-blue-500/20 to-blue-600/5",
  },
  {
    title: "My Trading Plan",
    description: "Build a personalized trading schedule based on your watchlist's optimal windows.",
    href: "/plan",
    icon: "☰",
    color: "from-pink-500/20 to-pink-600/5",
  },
  {
    title: "How It Works",
    description: "VortexPulse analyzes real market data to surface statistical edges across time, session, and day.",
    href: "/ticker/SPY",
    icon: "◉",
    color: "from-cyan-500/20 to-cyan-600/5",
  },
];

interface DashboardViewProps {
  regime: MarketRegime;
  stocks: StockMeta[];
  indexData: IndexSnapshot[];
  renderedAt: string;
}

export default function DashboardView({ regime, stocks, indexData, renderedAt }: DashboardViewProps) {
  const regimeLabel = {
    trending: "TRENDING",
    ranging: "RANGING",
    volatile: "VOLATILE",
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Hero */}
      <div className="mb-4">
        <h1 className="text-4xl font-bold text-vortex-text-bright mb-2">
          Know when the edge is in your favor.
        </h1>
        <p className="text-base text-vortex-muted max-w-2xl">
          VortexPulse uses real-time statistical analysis to help day traders identify optimal
          trading windows, session rhythm patterns, and IB break probabilities.
        </p>
      </div>

      {/* Data Freshness - moved up */}
      <div className="mb-8">
        <span className="text-xs text-vortex-muted font-mono">
          Data as of {renderedAt}
        </span>
      </div>

      {/* Recently Viewed */}
      <div className="mb-8">
        <RecentTickers />
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
              <span className="text-sm uppercase tracking-wider text-vortex-muted">
                Market Regime
              </span>
            </div>
            <span
              className={`text-base font-bold font-mono ${
                regime.regime === "trending"
                  ? "text-vortex-green"
                  : regime.regime === "ranging"
                  ? "text-vortex-amber"
                  : "text-vortex-red"
              }`}
            >
              {regimeLabel[regime.regime]}
            </span>
            <span className="text-xs text-vortex-muted">
              ({(regime.confidence * 100).toFixed(0)}% confidence)
            </span>
          </div>
          <Link
            href="/ticker/SPY"
            className="text-xs text-vortex-accent hover:text-vortex-accent-bright transition-colors uppercase tracking-wider"
          >
            Full Analysis →
          </Link>
        </div>

        <p className="text-sm text-vortex-text mb-4">{regime.description}</p>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
          <StatCard label="VIX" value={regime.vixLevel.toFixed(2)} color={regime.vixLevel > 25 ? "red" : regime.vixLevel > 18 ? "amber" : "green"} />
          <StatCard label="VIX Trend" value={regime.vixTrend.toUpperCase()} color={regime.vixTrend === "falling" ? "green" : regime.vixTrend === "rising" ? "red" : "amber"} />
          <StatCard label="Breadth" value={`${regime.breadthScore}%`} color={regime.breadthScore > 55 ? "green" : regime.breadthScore > 40 ? "amber" : "red"} />
          <StatCard label="Trend W/R" value={`${(regime.trendWinRate * 100).toFixed(0)}%`} color="blue" subValue="trend following" />
          <StatCard label="MR W/R" value={`${(regime.meanReversionWinRate * 100).toFixed(0)}%`} color="purple" subValue="mean reversion" />
        </div>

        {/* Index ETF Snapshots */}
        {indexData.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {indexData.map((idx) => (
              <Link
                key={idx.ticker}
                href={`/ticker/${idx.ticker}`}
                className="bg-vortex-surface border border-vortex-border rounded-lg p-3 hover:border-vortex-accent/40 transition-colors"
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="font-mono font-bold text-sm text-vortex-text-bright">
                    {idx.ticker}
                  </span>
                  <span className="text-xs text-vortex-muted">·</span>
                  <span className="text-xs text-vortex-muted truncate">{idx.name}</span>
                </div>
                <div className="font-mono text-lg font-semibold text-vortex-text-bright">
                  ${idx.price.toFixed(2)}
                </div>
                <div
                  className={`text-xs font-mono ${
                    idx.change >= 0 ? "text-vortex-green" : "text-vortex-red"
                  }`}
                >
                  {idx.change >= 0 ? "+" : ""}
                  {idx.change.toFixed(2)} ({idx.changePercent >= 0 ? "+" : ""}
                  {idx.changePercent.toFixed(2)}%)
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Today's Optimal Windows — user-customizable */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-vortex-text-bright uppercase tracking-wider">
            Top Trading Windows Today
          </h2>
          <Link
            href="/plan"
            className="text-xs text-vortex-accent hover:text-vortex-accent-bright transition-colors uppercase tracking-wider"
          >
            Customize →
          </Link>
        </div>

        <DashboardWindows />
      </div>

      {/* Feature Grid - reduced to 3 */}
      <div className="mb-8">
        <h2 className="text-base font-semibold text-vortex-text-bright uppercase tracking-wider mb-4">
          Tools
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {FEATURES.map((feature) => (
            <Link
              key={feature.title}
              href={feature.href}
              className="group bg-vortex-card border border-vortex-border rounded-xl p-5 hover:border-vortex-accent/40 transition-all"
            >
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${feature.color} flex items-center justify-center text-lg mb-3`}>
                {feature.icon}
              </div>
              <h3 className="text-base font-semibold text-vortex-text-bright mb-1 group-hover:text-vortex-accent-bright transition-colors">
                {feature.title}
              </h3>
              <p className="text-sm text-vortex-muted leading-relaxed">
                {feature.description}
              </p>
            </Link>
          ))}
        </div>
      </div>

      {/* Product Ecosystem */}
      <div className="border-t border-vortex-border pt-8">
        <h2 className="text-base font-semibold text-vortex-text-bright uppercase tracking-wider mb-4">
          Vortex Capital Group Ecosystem
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 rounded-xl p-5">
            <div className="text-xs text-blue-400 uppercase tracking-wider mb-1">Step 1 — When</div>
            <h3 className="text-base font-bold text-vortex-text-bright mb-1">VortexPulse</h3>
            <p className="text-sm text-vortex-muted mb-3">
              Statistical timing intelligence. Know when the edge is in your favor.
            </p>
            <span className="text-xs text-blue-400 font-mono">vortexpulse.tech</span>
          </div>
          <a
            href="https://vortexedge.tech"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/20 rounded-xl p-5 hover:border-green-500/40 transition-colors"
          >
            <div className="text-xs text-green-400 uppercase tracking-wider mb-1">Step 2 — What</div>
            <h3 className="text-base font-bold text-vortex-text-bright mb-1">VortexEdge</h3>
            <p className="text-sm text-vortex-muted mb-3">
              Market intelligence terminal. Pattern recognition & quantitative screening.
            </p>
            <span className="text-xs text-green-400 font-mono">vortexedge.tech</span>
          </a>
          <a
            href="https://vortexflow.app"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-gradient-to-br from-cyan-500/10 to-cyan-600/5 border border-cyan-500/20 rounded-xl p-5 hover:border-cyan-500/40 transition-colors"
          >
            <div className="text-xs text-cyan-400 uppercase tracking-wider mb-1">Step 3 — How</div>
            <h3 className="text-base font-bold text-vortex-text-bright mb-1">VortexFlow</h3>
            <p className="text-sm text-vortex-muted mb-3">
              Order flow visualization. Real-time price ladder, CVD, and large trade alerts.
            </p>
            <span className="text-xs text-cyan-400 font-mono">vortexflow.app</span>
          </a>
        </div>
      </div>
    </div>
  );
}
