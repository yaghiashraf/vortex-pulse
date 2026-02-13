"use client";

import { useState } from "react";
import { GapFillResult, StockMeta } from "@/lib/types";
import TickerSearch from "@/components/TickerSearch";
import StatCard from "@/components/StatCard";

interface GapFillViewProps {
  ticker: string;
  data: GapFillResult[];
  stock?: StockMeta;
  stocks: StockMeta[];
}

export default function GapFillView({ ticker, data, stock, stocks }: GapFillViewProps) {
  const [dirFilter, setDirFilter] = useState<"all" | "up" | "down">("all");
  const upperTicker = ticker.toUpperCase();

  const filtered = dirFilter === "all" ? data : data.filter((d) => d.direction === dirFilter);

  const upGaps = data.filter((d) => d.direction === "up");
  const downGaps = data.filter((d) => d.direction === "down");
  const avgUpFill = upGaps.length ? upGaps.reduce((sum, d) => sum + d.fillRate, 0) / upGaps.length : 0;
  const avgDownFill = downGaps.length ? downGaps.reduce((sum, d) => sum + d.fillRate, 0) / downGaps.length : 0;
  const totalSamples = data.reduce((sum, d) => sum + d.sampleSize, 0);
  const bestEdge = data.length ? data.reduce((best, d) => (d.fillRate > best.fillRate ? d : best), data[0]) : null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-vortex-text-bright mb-1">
            Gap Fill Probability Calculator
          </h1>
          <p className="text-xs text-vortex-muted">
            Historical gap fill rates by size, direction, and timing
            {stock && <span> — {stock.name}</span>}
          </p>
        </div>
        <TickerSearch currentTicker={upperTicker} basePath="/gaps" stocks={stocks} />
      </div>

      {bestEdge && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <StatCard
            label="Avg Gap Up Fill"
            value={`${(avgUpFill * 100).toFixed(0)}%`}
            subValue="all gap up sizes"
            color="green"
            />
            <StatCard
            label="Avg Gap Down Fill"
            value={`${(avgDownFill * 100).toFixed(0)}%`}
            subValue="all gap down sizes"
            color="red"
            />
            <StatCard
            label="Best Edge"
            value={`${(bestEdge.fillRate * 100).toFixed(0)}%`}
            subValue={`${bestEdge.direction} ${bestEdge.gapRange}`}
            color="blue"
            />
            <StatCard
            label="Sample Size"
            value={totalSamples.toLocaleString()}
            subValue="total gap events analyzed"
            color="purple"
            />
        </div>
      )}

      {/* Filter */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xs text-vortex-muted">Direction:</span>
        {(["all", "up", "down"] as const).map((dir) => (
          <button
            key={dir}
            onClick={() => setDirFilter(dir)}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
              dirFilter === dir
                ? "bg-vortex-accent/15 text-vortex-accent-bright"
                : "text-vortex-muted hover:text-vortex-text hover:bg-vortex-card"
            }`}
          >
            {dir === "all" ? "All" : dir === "up" ? "Gap Up" : "Gap Down"}
          </button>
        ))}
      </div>

      {/* Visual Gap Fill Chart */}
      <div className="bg-vortex-card border border-vortex-border rounded-xl p-5 mb-6">
        <h2 className="text-xs uppercase tracking-wider text-vortex-muted mb-4">
          Gap Fill Rate by Size
        </h2>
        <div className="space-y-3">
          {filtered.map((d, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-20 text-right">
                <span
                  className={`text-xs font-mono font-semibold ${
                    d.direction === "up" ? "text-vortex-green" : "text-vortex-red"
                  }`}
                >
                  {d.direction === "up" ? "▲" : "▼"} {d.gapRange}
                </span>
              </div>
              <div className="flex-1 bg-vortex-surface rounded-full h-7 relative overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 flex items-center justify-end pr-2 ${
                    d.fillRate > 0.7
                      ? "bg-vortex-green/70"
                      : d.fillRate > 0.5
                      ? "bg-vortex-accent/60"
                      : d.fillRate > 0.3
                      ? "bg-vortex-amber/50"
                      : "bg-vortex-red/40"
                  }`}
                  style={{ width: `${d.fillRate * 100}%` }}
                >
                  <span className="text-[10px] font-mono font-bold text-white">
                    {(d.fillRate * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
              <div className="w-20 text-xs text-vortex-muted font-mono">{d.avgFillTime}</div>
              <div className="w-12 text-[10px] text-vortex-muted">n={d.sampleSize}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Detailed Table */}
      <div className="bg-vortex-card border border-vortex-border rounded-xl p-5">
        <h2 className="text-xs uppercase tracking-wider text-vortex-muted mb-4">
          Detailed Gap Fill Statistics
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-vortex-border">
                <th className="text-left py-2 text-vortex-muted font-medium">Direction</th>
                <th className="text-left py-2 text-vortex-muted font-medium">Gap Size</th>
                <th className="text-right py-2 text-vortex-muted font-medium">Fill Rate</th>
                <th className="text-right py-2 text-vortex-muted font-medium">Avg Fill Time</th>
                <th className="text-right py-2 text-vortex-muted font-medium">Avg Return</th>
                <th className="text-right py-2 text-vortex-muted font-medium">Sample</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((d, i) => (
                <tr
                  key={i}
                  className="border-b border-vortex-border/50 hover:bg-vortex-surface/50"
                >
                  <td className="py-2">
                    <span
                      className={`font-mono font-semibold ${
                        d.direction === "up" ? "text-vortex-green" : "text-vortex-red"
                      }`}
                    >
                      {d.direction === "up" ? "▲ UP" : "▼ DOWN"}
                    </span>
                  </td>
                  <td className="py-2 font-mono text-vortex-text">{d.gapRange}</td>
                  <td className="py-2 text-right">
                    <span
                      className={`font-mono font-semibold ${
                        d.fillRate > 0.7
                          ? "text-vortex-green"
                          : d.fillRate > 0.5
                          ? "text-vortex-accent-bright"
                          : "text-vortex-amber"
                      }`}
                    >
                      {(d.fillRate * 100).toFixed(1)}%
                    </span>
                  </td>
                  <td className="py-2 text-right font-mono text-vortex-text">{d.avgFillTime}</td>
                  <td
                    className={`py-2 text-right font-mono ${
                      d.avgReturn >= 0 ? "text-vortex-green" : "text-vortex-red"
                    }`}
                  >
                    {d.avgReturn >= 0 ? "+" : ""}
                    {d.avgReturn.toFixed(2)}%
                  </td>
                  <td className="py-2 text-right font-mono text-vortex-muted">{d.sampleSize}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Insight Box */}
        <div className="mt-4 bg-vortex-surface rounded-lg p-4 border border-vortex-border/50">
          <div className="text-[10px] uppercase tracking-wider text-vortex-accent mb-1">Key Insight</div>
          <p className="text-xs text-vortex-text leading-relaxed">
            For <span className="font-mono font-semibold text-vortex-text-bright">{upperTicker}</span>,
            smaller gaps (0-2%) have significantly higher fill rates ({(avgUpFill * 100).toFixed(0)}%+ average).
            {avgDownFill > avgUpFill
              ? " Gap downs fill more frequently than gap ups, suggesting stronger buy-the-dip behavior."
              : " Gap ups and gap downs fill at similar rates."}
            {" "}Consider these probabilities when planning gap fade strategies with VortexEdge&apos;s GAP% scanner.
          </p>
        </div>
      </div>
    </div>
  );
}
