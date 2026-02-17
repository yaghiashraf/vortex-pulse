"use client";

import { useState, useEffect } from "react";
import { TimeSlot, SessionPhase, DayOfWeekStat, IBStat, StockMeta } from "@/lib/types";
import StatCard from "@/components/StatCard";
import RecentTickers, { saveRecentTicker } from "@/components/RecentTickers";

type Tab = "heatmap" | "rhythm" | "ib" | "dayedge";

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: "heatmap", label: "Heatmap", icon: "▦" },
  { id: "rhythm", label: "Rhythm", icon: "◫" },
  { id: "ib", label: "IB Stats", icon: "⟛" },
  { id: "dayedge", label: "Day Edge", icon: "▤" },
];

interface TickerAnalysisViewProps {
  ticker: string;
  stock: StockMeta | undefined;
  todData: TimeSlot[];
  phases: SessionPhase[];
  ibData: IBStat;
  dowData: DayOfWeekStat[];
}

// --- Heatmap helpers ---
function getHeatColor(value: number, max: number): string {
  const ratio = value / max;
  if (ratio > 0.8) return "bg-blue-500";
  if (ratio > 0.6) return "bg-blue-600/80";
  if (ratio > 0.4) return "bg-blue-700/60";
  if (ratio > 0.2) return "bg-blue-800/40";
  return "bg-blue-900/20";
}

function getTrendColor(prob: number): string {
  if (prob > 0.6) return "text-vortex-green";
  if (prob > 0.45) return "text-vortex-accent-bright";
  if (prob > 0.3) return "text-vortex-amber";
  return "text-vortex-red";
}

export default function TickerAnalysisView({
  ticker,
  stock,
  todData,
  phases,
  ibData,
  dowData,
}: TickerAnalysisViewProps) {
  const [activeTab, setActiveTab] = useState<Tab>("heatmap");

  useEffect(() => {
    saveRecentTicker(ticker);
  }, [ticker]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-vortex-text-bright font-mono">{ticker}</h1>
            {stock && (
              <div className="flex items-center gap-2">
                <span className="text-base text-vortex-text">{stock.name}</span>
                <span className="text-sm text-vortex-muted">{stock.sector}</span>
              </div>
            )}
          </div>
          {stock && (
            <div className="flex items-center gap-4">
              {stock.price > 0 && (
                <span className="text-xl font-bold font-mono text-vortex-text-bright">
                  ${stock.price.toFixed(2)}
                </span>
              )}
              {stock.avgATR > 0 && (
                <span className="text-sm text-vortex-muted font-mono">
                  ATR ${stock.avgATR.toFixed(2)}
                </span>
              )}
            </div>
          )}
        </div>
        <RecentTickers currentTicker={ticker} />
      </div>

      {/* Tab Bar */}
      <div className="flex gap-1 mb-6 bg-vortex-card border border-vortex-border rounded-xl p-1.5">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? "bg-vortex-accent/15 text-vortex-accent-bright"
                : "text-vortex-muted hover:text-vortex-text hover:bg-vortex-surface"
            }`}
          >
            <span className="text-sm">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "heatmap" && <HeatmapTab data={todData} />}
      {activeTab === "rhythm" && <RhythmTab phases={phases} ticker={ticker} />}
      {activeTab === "ib" && <IBTab ib={ibData} stock={stock} ticker={ticker} />}
      {activeTab === "dayedge" && <DayEdgeTab data={dowData} ticker={ticker} />}
    </div>
  );
}

// ============================================================
// HEATMAP TAB
// ============================================================
function HeatmapTab({ data }: { data: TimeSlot[] }) {
  if (data.length === 0) {
    return <div className="text-sm text-vortex-muted">No heatmap data available. Try a liquid stock like SPY, AAPL, NVDA.</div>;
  }

  const maxVol = Math.max(...data.map((d) => d.avgVolume)) || 1;
  const maxRange = Math.max(...data.map((d) => d.avgRange)) || 1;
  const maxVolatility = Math.max(...data.map((d) => d.volatility)) || 1;

  const bestSlot = data.reduce((best, d) => (d.trendProb > best.trendProb ? d : best), data[0]);
  const worstSlot = data.reduce((worst, d) => (d.trendProb < worst.trendProb ? d : worst), data[0]);

  return (
    <>
      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <StatCard label="Best Window" value={bestSlot.label} subValue={`${(bestSlot.trendProb * 100).toFixed(0)}% trend prob`} color="green" />
        <StatCard label="Avoid" value={worstSlot.label} subValue={`${(worstSlot.trendProb * 100).toFixed(0)}% trend prob`} color="red" />
        <StatCard label="Peak Volume" value={`${(maxVol / 1000000).toFixed(1)}M`} subValue={`at ${data.find((d) => d.avgVolume === maxVol)?.label}`} color="blue" />
        <StatCard label="Peak Range" value={`$${maxRange.toFixed(2)}`} subValue={`at ${data.find((d) => d.avgRange === maxRange)?.label}`} color="purple" />
      </div>

      {/* Heatmap Grid */}
      <div className="bg-vortex-card border border-vortex-border rounded-xl p-5 mb-6">
        <h2 className="text-sm uppercase tracking-wider text-vortex-muted mb-4">
          Volume & Volatility Heatmap
        </h2>

        {/* Header Row */}
        <div className="grid grid-cols-[100px_repeat(13,1fr)] gap-1 mb-2">
          <div className="text-xs text-vortex-muted" />
          {data.map((d) => (
            <div key={d.time} className="text-[10px] text-vortex-muted text-center font-mono">{d.time}</div>
          ))}
        </div>

        {/* Volume Row */}
        <div className="grid grid-cols-[100px_repeat(13,1fr)] gap-1 mb-1">
          <div className="text-xs text-vortex-muted flex items-center">Volume</div>
          {data.map((d) => (
            <div key={d.time} className={`heatmap-cell ${getHeatColor(d.avgVolume, maxVol)} rounded h-10 flex items-center justify-center cursor-default`} title={`${d.label}: ${(d.avgVolume / 1000000).toFixed(1)}M avg volume`}>
              <span className="text-[10px] font-mono text-white/80">{(d.avgVolume / 1000000).toFixed(1)}M</span>
            </div>
          ))}
        </div>

        {/* Volatility Row */}
        <div className="grid grid-cols-[100px_repeat(13,1fr)] gap-1 mb-1">
          <div className="text-xs text-vortex-muted flex items-center">Volatility</div>
          {data.map((d) => {
            const ratio = d.volatility / maxVolatility;
            const bg = ratio > 0.8 ? "bg-purple-500" : ratio > 0.6 ? "bg-purple-600/80" : ratio > 0.4 ? "bg-purple-700/60" : ratio > 0.2 ? "bg-purple-800/40" : "bg-purple-900/20";
            return (
              <div key={d.time} className={`heatmap-cell ${bg} rounded h-10 flex items-center justify-center cursor-default`} title={`${d.label}: ${d.volatility}% relative volatility`}>
                <span className="text-[10px] font-mono text-white/80">{d.volatility.toFixed(0)}%</span>
              </div>
            );
          })}
        </div>

        {/* Range Row */}
        <div className="grid grid-cols-[100px_repeat(13,1fr)] gap-1 mb-1">
          <div className="text-xs text-vortex-muted flex items-center">Avg Range</div>
          {data.map((d) => {
            const ratio = d.avgRange / maxRange;
            const bg = ratio > 0.8 ? "bg-cyan-500" : ratio > 0.6 ? "bg-cyan-600/80" : ratio > 0.4 ? "bg-cyan-700/60" : ratio > 0.2 ? "bg-cyan-800/40" : "bg-cyan-900/20";
            return (
              <div key={d.time} className={`heatmap-cell ${bg} rounded h-10 flex items-center justify-center cursor-default`} title={`${d.label}: $${d.avgRange} avg range`}>
                <span className="text-[10px] font-mono text-white/80">${d.avgRange}</span>
              </div>
            );
          })}
        </div>

        {/* Trend Probability Row */}
        <div className="grid grid-cols-[100px_repeat(13,1fr)] gap-1">
          <div className="text-xs text-vortex-muted flex items-center">Trend Prob</div>
          {data.map((d) => {
            const bg = d.trendProb > 0.6 ? "bg-green-500" : d.trendProb > 0.45 ? "bg-green-600/70" : d.trendProb > 0.3 ? "bg-amber-600/50" : "bg-red-800/40";
            return (
              <div key={d.time} className={`heatmap-cell ${bg} rounded h-10 flex items-center justify-center cursor-default`} title={`${d.label}: ${(d.trendProb * 100).toFixed(0)}% trend probability`}>
                <span className="text-[10px] font-mono text-white/80">{(d.trendProb * 100).toFixed(0)}%</span>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-6 mt-4 text-xs text-vortex-muted">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-blue-500" /> Volume (high)
            <div className="w-3 h-3 rounded bg-blue-900/30 ml-2" /> Volume (low)
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-green-500" /> High trend prob
            <div className="w-3 h-3 rounded bg-red-800/40 ml-2" /> Low trend prob
          </div>
        </div>
      </div>

      {/* Detailed Table */}
      <div className="bg-vortex-card border border-vortex-border rounded-xl p-5">
        <h2 className="text-sm uppercase tracking-wider text-vortex-muted mb-4">
          Detailed Statistics by Time Window
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-vortex-border">
                <th className="text-left py-2 text-vortex-muted font-medium">Window</th>
                <th className="text-right py-2 text-vortex-muted font-medium">Avg Volume</th>
                <th className="text-right py-2 text-vortex-muted font-medium">Avg Range</th>
                <th className="text-right py-2 text-vortex-muted font-medium">Volatility</th>
                <th className="text-right py-2 text-vortex-muted font-medium">Trend Prob</th>
                <th className="text-right py-2 text-vortex-muted font-medium">Avg Return</th>
              </tr>
            </thead>
            <tbody>
              {data.map((d) => (
                <tr key={d.time} className="border-b border-vortex-border/50 hover:bg-vortex-surface/50">
                  <td className="py-2 font-mono text-vortex-text">{d.label}</td>
                  <td className="py-2 text-right font-mono text-vortex-text">{(d.avgVolume / 1000000).toFixed(2)}M</td>
                  <td className="py-2 text-right font-mono text-vortex-text">${d.avgRange}</td>
                  <td className="py-2 text-right font-mono text-vortex-text">{d.volatility.toFixed(1)}%</td>
                  <td className={`py-2 text-right font-mono font-semibold ${getTrendColor(d.trendProb)}`}>{(d.trendProb * 100).toFixed(0)}%</td>
                  <td className={`py-2 text-right font-mono ${d.avgReturn >= 0 ? "text-vortex-green" : "text-vortex-red"}`}>
                    {d.avgReturn >= 0 ? "+" : ""}{(d.avgReturn * 100).toFixed(2)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

// ============================================================
// RHYTHM TAB
// ============================================================
function RhythmTab({ phases, ticker }: { phases: SessionPhase[]; ticker: string }) {
  const bestPhase = phases.reduce((best, p) => (p.trendProb > best.trendProb ? p : best), phases[0]);

  return (
    <>
      {/* Timeline Visualization */}
      <div className="bg-vortex-card border border-vortex-border rounded-xl p-5 mb-6">
        <h2 className="text-sm uppercase tracking-wider text-vortex-muted mb-6">
          Trading Day Timeline
        </h2>

        <div className="relative mb-8">
          <div className="flex gap-0.5 rounded-lg overflow-hidden h-14">
            {phases.map((phase) => {
              const width = phase.name === "Opening Drive" ? "8%" : phase.name === "Mid-Morning" ? "23%" : phase.name === "Lunch Chop" ? "31%" : phase.name === "Afternoon Push" ? "23%" : "15%";
              return (
                <div key={phase.name} className="relative flex flex-col items-center justify-center" style={{ width, backgroundColor: phase.color + "30" }}>
                  <span className="text-[10px] font-semibold text-white/90">{phase.name}</span>
                  <span className="text-[10px] text-white/60">{phase.timeRange}</span>
                </div>
              );
            })}
          </div>

          <div className="flex gap-0.5 mt-1">
            {phases.map((phase) => {
              const width = phase.name === "Opening Drive" ? "8%" : phase.name === "Mid-Morning" ? "23%" : phase.name === "Lunch Chop" ? "31%" : phase.name === "Afternoon Push" ? "23%" : "15%";
              return (
                <div key={phase.name} className="text-center" style={{ width }}>
                  <div className="mx-auto rounded-full h-2" style={{ width: `${phase.trendProb * 100}%`, backgroundColor: phase.color, minWidth: "10px" }} />
                  <span className="text-[10px] font-mono" style={{ color: phase.color }}>{(phase.trendProb * 100).toFixed(0)}%</span>
                </div>
              );
            })}
          </div>
          <div className="text-center text-[10px] text-vortex-muted mt-0.5">Trend Probability</div>
        </div>
      </div>

      {/* Phase Cards */}
      <div className="space-y-4 mb-6">
        {phases.map((phase) => (
          <div key={phase.name} className="bg-vortex-card border border-vortex-border rounded-xl p-5" style={{ borderLeftColor: phase.color, borderLeftWidth: "3px" }}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-base font-bold text-vortex-text-bright">{phase.name}</h3>
                <span className="text-xs font-mono text-vortex-muted">{phase.timeRange}</span>
              </div>
              {phase.name === bestPhase.name && (
                <span className="text-[10px] bg-vortex-green/15 text-vortex-green px-2 py-0.5 rounded-full font-medium">BEST WINDOW</span>
              )}
              {phase.name === "Lunch Chop" && (
                <span className="text-[10px] bg-vortex-amber/15 text-vortex-amber px-2 py-0.5 rounded-full font-medium">DANGER ZONE</span>
              )}
            </div>

            <p className="text-sm text-vortex-text mb-4 leading-relaxed">{phase.description}</p>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <div>
                <div className="text-xs text-vortex-muted uppercase tracking-wider">Trend Prob</div>
                <div className="text-xl font-bold font-mono" style={{ color: phase.color }}>{(phase.trendProb * 100).toFixed(0)}%</div>
              </div>
              <div>
                <div className="text-xs text-vortex-muted uppercase tracking-wider">Reversal Prob</div>
                <div className="text-xl font-bold font-mono text-vortex-amber">{(phase.reversalProb * 100).toFixed(0)}%</div>
              </div>
              <div>
                <div className="text-xs text-vortex-muted uppercase tracking-wider">Avg Volume</div>
                <div className="text-xl font-bold font-mono text-vortex-text-bright">{phase.avgVolume}%</div>
                <div className="text-[10px] text-vortex-muted">of daily total</div>
              </div>
              <div>
                <div className="text-xs text-vortex-muted uppercase tracking-wider">Avg Range</div>
                <div className="text-xl font-bold font-mono text-vortex-text-bright">{phase.avgRange}%</div>
                <div className="text-[10px] text-vortex-muted">of daily range</div>
              </div>
              <div>
                <div className="text-xs text-vortex-muted uppercase tracking-wider">Best Strategy</div>
                <div className="text-sm font-semibold text-vortex-accent-bright mt-1">{phase.bestStrategy}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Trading Tips */}
      <div className="bg-vortex-surface border border-vortex-border rounded-xl p-5">
        <h2 className="text-sm uppercase tracking-wider text-vortex-accent mb-3">
          Session Rhythm Tips for {ticker}
        </h2>
        <ul className="space-y-2 text-sm text-vortex-text leading-relaxed">
          <li className="flex items-start gap-2">
            <span className="text-vortex-green mt-0.5">●</span>
            <span>
              <strong className="text-vortex-text-bright">Opening Drive</strong> shows the highest trend probability. Use VortexEdge gap/pattern data to enter early if the setup aligns.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-vortex-amber mt-0.5">●</span>
            <span>
              <strong className="text-vortex-text-bright">Lunch Chop</strong> has the lowest trend probability and highest reversal rate. Consider stepping away or trading mean reversion only.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-vortex-purple mt-0.5">●</span>
            <span>
              <strong className="text-vortex-text-bright">Afternoon Push</strong> often sets the day&apos;s final direction. Watch VortexFlow order flow for institutional positioning.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-vortex-cyan mt-0.5">●</span>
            <span>
              <strong className="text-vortex-text-bright">Close Auction</strong> volume surge creates opportunity but also whipsaw risk. Size down and focus on high-conviction only.
            </span>
          </li>
        </ul>
      </div>
    </>
  );
}

// ============================================================
// IB STATS TAB
// ============================================================
function IBTab({ ib, stock, ticker }: { ib: IBStat; stock: StockMeta | undefined; ticker: string }) {
  const dominantDirection = ib.ibBreakUpProb > ib.ibBreakDownProb ? "upside" : "downside";

  return (
    <>
      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <StatCard label="IB Break Up" value={`${(ib.ibBreakUpProb * 100).toFixed(0)}%`} subValue="probability of upside break" color="green" />
        <StatCard label="IB Break Down" value={`${(ib.ibBreakDownProb * 100).toFixed(0)}%`} subValue="probability of downside break" color="red" />
        <StatCard label="IB Hold" value={`${(ib.ibHoldProb * 100).toFixed(0)}%`} subValue="price stays within IB range" color="amber" />
        <StatCard label="Sample Size" value={ib.sampleSize.toString()} subValue="trading days analyzed" color="blue" />
      </div>

      {/* Visual IB Breakdown */}
      <div className="bg-vortex-card border border-vortex-border rounded-xl p-5 mb-6">
        <h2 className="text-sm uppercase tracking-wider text-vortex-muted mb-6">IB Outcome Distribution</h2>

        <div className="mb-6">
          <div className="flex rounded-lg overflow-hidden h-12">
            <div className="bg-vortex-green/70 flex items-center justify-center" style={{ width: `${ib.ibBreakUpProb * 100}%` }}>
              <span className="text-sm font-mono font-bold text-white">▲ {(ib.ibBreakUpProb * 100).toFixed(0)}%</span>
            </div>
            <div className="bg-vortex-amber/50 flex items-center justify-center" style={{ width: `${ib.ibHoldProb * 100}%` }}>
              <span className="text-sm font-mono font-bold text-white">◆ {(ib.ibHoldProb * 100).toFixed(0)}%</span>
            </div>
            <div className="bg-vortex-red/60 flex items-center justify-center" style={{ width: `${ib.ibBreakDownProb * 100}%` }}>
              <span className="text-sm font-mono font-bold text-white">▼ {(ib.ibBreakDownProb * 100).toFixed(0)}%</span>
            </div>
          </div>
          <div className="flex justify-between mt-1 text-[10px] text-vortex-muted">
            <span>Break Up</span>
            <span>Hold (Range)</span>
            <span>Break Down</span>
          </div>
        </div>

        {/* Extension Targets */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-vortex-surface rounded-lg p-4 border border-vortex-border/50">
            <div className="text-sm font-semibold text-vortex-green mb-3">▲ Upside Extension Target</div>
            <div className="flex items-end gap-4">
              <div>
                <div className="text-2xl font-bold font-mono text-vortex-green">${ib.avgUpExtension.toFixed(2)}</div>
                <div className="text-xs text-vortex-muted">avg extension beyond IB high</div>
              </div>
              <div className="flex-1">
                <div className="relative h-20 bg-vortex-bg rounded">
                  <div className="absolute bottom-4 left-0 right-0 h-6 bg-vortex-accent/20 rounded border border-vortex-accent/30 flex items-center justify-center">
                    <span className="text-[10px] font-mono text-vortex-accent">IB: ${ib.avgIBRange.toFixed(2)}</span>
                  </div>
                  <div className="absolute top-1 left-0 right-0 h-3 bg-vortex-green/30 rounded-t border-t border-x border-vortex-green/40 flex items-center justify-center">
                    <span className="text-[10px] font-mono text-vortex-green">+${ib.avgUpExtension.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-vortex-surface rounded-lg p-4 border border-vortex-border/50">
            <div className="text-sm font-semibold text-vortex-red mb-3">▼ Downside Extension Target</div>
            <div className="flex items-end gap-4">
              <div>
                <div className="text-2xl font-bold font-mono text-vortex-red">${ib.avgDownExtension.toFixed(2)}</div>
                <div className="text-xs text-vortex-muted">avg extension beyond IB low</div>
              </div>
              <div className="flex-1">
                <div className="relative h-20 bg-vortex-bg rounded">
                  <div className="absolute top-4 left-0 right-0 h-6 bg-vortex-accent/20 rounded border border-vortex-accent/30 flex items-center justify-center">
                    <span className="text-[10px] font-mono text-vortex-accent">IB: ${ib.avgIBRange.toFixed(2)}</span>
                  </div>
                  <div className="absolute bottom-1 left-0 right-0 h-3 bg-vortex-red/30 rounded-b border-b border-x border-vortex-red/40 flex items-center justify-center">
                    <span className="text-[10px] font-mono text-vortex-red">-${ib.avgDownExtension.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* IB Range Info */}
      <div className="bg-vortex-card border border-vortex-border rounded-xl p-5 mb-6">
        <h2 className="text-sm uppercase tracking-wider text-vortex-muted mb-4">IB Range Analysis</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <div className="text-xs text-vortex-muted uppercase tracking-wider mb-1">Average IB Range</div>
            <div className="text-xl font-bold font-mono text-vortex-accent-bright">${ib.avgIBRange.toFixed(2)}</div>
            <div className="text-xs text-vortex-muted">{stock ? `${((ib.avgIBRange / stock.price) * 100).toFixed(2)}% of price` : ""}</div>
          </div>
          <div>
            <div className="text-xs text-vortex-muted uppercase tracking-wider mb-1">Dominant Direction</div>
            <div className={`text-xl font-bold font-mono ${dominantDirection === "upside" ? "text-vortex-green" : "text-vortex-red"}`}>
              {dominantDirection.toUpperCase()}
            </div>
            <div className="text-xs text-vortex-muted">
              {dominantDirection === "upside"
                ? `${((ib.ibBreakUpProb - ib.ibBreakDownProb) * 100).toFixed(0)}% more likely to break up`
                : `${((ib.ibBreakDownProb - ib.ibBreakUpProb) * 100).toFixed(0)}% more likely to break down`}
            </div>
          </div>
          <div>
            <div className="text-xs text-vortex-muted uppercase tracking-wider mb-1">Extension Ratio</div>
            <div className="text-xl font-bold font-mono text-vortex-purple">
              {(ib.avgUpExtension / (ib.avgIBRange || 1)).toFixed(1)}x / {(ib.avgDownExtension / (ib.avgIBRange || 1)).toFixed(1)}x
            </div>
            <div className="text-xs text-vortex-muted">up ext / down ext vs IB range</div>
          </div>
        </div>
      </div>

      {/* How to Use */}
      <div className="bg-vortex-surface border border-vortex-border rounded-xl p-5">
        <h2 className="text-sm uppercase tracking-wider text-vortex-accent mb-3">How to Use IB Statistics</h2>
        <ol className="space-y-2 text-sm text-vortex-text leading-relaxed list-decimal list-inside">
          <li>Wait for the first 30 minutes to establish the <strong className="text-vortex-text-bright">Initial Balance</strong> (IB high and low).</li>
          <li>Check the IB break probability &mdash; {ticker} breaks {dominantDirection} {dominantDirection === "upside" ? (ib.ibBreakUpProb * 100).toFixed(0) : (ib.ibBreakDownProb * 100).toFixed(0)}% of the time.</li>
          <li>Use the <strong className="text-vortex-text-bright">extension targets</strong> (${ib.avgUpExtension.toFixed(2)} up / ${ib.avgDownExtension.toFixed(2)} down) as profit targets.</li>
          <li>On IB hold days ({(ib.ibHoldProb * 100).toFixed(0)}% frequency), consider <strong className="text-vortex-text-bright">range trading</strong> between IB high and low.</li>
          <li>Combine with VortexEdge&apos;s IB pattern detection for real-time confirmation.</li>
        </ol>
      </div>
    </>
  );
}

// ============================================================
// DAY EDGE TAB
// ============================================================
function DayEdgeTab({ data, ticker }: { data: DayOfWeekStat[]; ticker: string }) {
  if (data.length === 0) {
    return <div className="text-sm text-vortex-muted">No day-of-week data available.</div>;
  }

  const bestDay = data.reduce((best, d) => (d.trendProb > best.trendProb ? d : best), data[0]);
  const worstDay = data.reduce((worst, d) => (d.trendProb < worst.trendProb ? d : worst), data[0]);

  return (
    <>
      {/* Visual Day Comparison */}
      <div className="bg-vortex-card border border-vortex-border rounded-xl p-5 mb-6">
        <h2 className="text-sm uppercase tracking-wider text-vortex-muted mb-6">Weekly Pattern Overview</h2>

        <div className="grid grid-cols-5 gap-3">
          {data.map((d) => {
            const isBest = d.day === bestDay.day;
            const isWorst = d.day === worstDay.day;

            return (
              <div key={d.day} className={`rounded-xl p-4 border transition-colors ${isBest ? "bg-vortex-green/10 border-vortex-green/30" : isWorst ? "bg-vortex-red/10 border-vortex-red/30" : "bg-vortex-surface border-vortex-border"}`}>
                <div className="text-center mb-3">
                  <div className="text-sm font-semibold text-vortex-text-bright">{d.day}</div>
                  {isBest && <span className="text-[10px] text-vortex-green uppercase tracking-wider">Best Day</span>}
                  {isWorst && <span className="text-[10px] text-vortex-red uppercase tracking-wider">Weakest</span>}
                </div>

                <div className="mb-3">
                  <div className="text-[10px] text-vortex-muted text-center mb-1">Trend Prob</div>
                  <div className="w-full bg-vortex-bg rounded-full h-5 relative">
                    <div className={`h-full rounded-full flex items-center justify-center ${d.trendProb > 0.55 ? "bg-vortex-green/60" : d.trendProb > 0.42 ? "bg-vortex-accent/50" : "bg-vortex-amber/40"}`} style={{ width: `${d.trendProb * 100}%` }}>
                      <span className="text-[10px] font-mono font-bold text-white">{(d.trendProb * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-vortex-muted">Avg Return</span>
                    <span className={`font-mono font-semibold ${d.avgReturn >= 0 ? "text-vortex-green" : "text-vortex-red"}`}>
                      {d.avgReturn >= 0 ? "+" : ""}{(d.avgReturn * 100).toFixed(2)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-vortex-muted">Avg Range</span>
                    <span className="font-mono text-vortex-text">{d.avgRange}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-vortex-muted">Vol</span>
                    <span className="font-mono text-vortex-text">{d.avgVolume}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-vortex-muted">Gap Freq</span>
                    <span className="font-mono text-vortex-text">{(d.gapFrequency * 100).toFixed(0)}%</span>
                  </div>
                  <div className="pt-1 border-t border-vortex-border/50">
                    <span className="text-vortex-muted">Best Session</span>
                    <div className="font-semibold text-vortex-accent-bright mt-0.5">{d.bestSession}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detailed Table */}
      <div className="bg-vortex-card border border-vortex-border rounded-xl p-5 mb-6">
        <h2 className="text-sm uppercase tracking-wider text-vortex-muted mb-4">Detailed Day-of-Week Statistics</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-vortex-border">
                <th className="text-left py-2 text-vortex-muted font-medium">Day</th>
                <th className="text-right py-2 text-vortex-muted font-medium">Avg Return</th>
                <th className="text-right py-2 text-vortex-muted font-medium">Avg Range</th>
                <th className="text-right py-2 text-vortex-muted font-medium">Rel Volume</th>
                <th className="text-right py-2 text-vortex-muted font-medium">Trend Prob</th>
                <th className="text-right py-2 text-vortex-muted font-medium">Gap Freq</th>
                <th className="text-left py-2 text-vortex-muted font-medium pl-4">Best Session</th>
              </tr>
            </thead>
            <tbody>
              {data.map((d) => (
                <tr key={d.day} className="border-b border-vortex-border/50 hover:bg-vortex-surface/50">
                  <td className="py-2.5 font-semibold text-vortex-text-bright">{d.day}</td>
                  <td className={`py-2.5 text-right font-mono ${d.avgReturn >= 0 ? "text-vortex-green" : "text-vortex-red"}`}>
                    {d.avgReturn >= 0 ? "+" : ""}{(d.avgReturn * 100).toFixed(2)}%
                  </td>
                  <td className="py-2.5 text-right font-mono text-vortex-text">{d.avgRange}%</td>
                  <td className="py-2.5 text-right font-mono text-vortex-text">{d.avgVolume}%</td>
                  <td className={`py-2.5 text-right font-mono font-semibold ${d.trendProb > 0.55 ? "text-vortex-green" : d.trendProb > 0.42 ? "text-vortex-accent-bright" : "text-vortex-amber"}`}>
                    {(d.trendProb * 100).toFixed(0)}%
                  </td>
                  <td className="py-2.5 text-right font-mono text-vortex-text">{(d.gapFrequency * 100).toFixed(0)}%</td>
                  <td className="py-2.5 pl-4 text-vortex-accent-bright">{d.bestSession}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Insights */}
      <div className="bg-vortex-surface border border-vortex-border rounded-xl p-5">
        <h2 className="text-sm uppercase tracking-wider text-vortex-accent mb-3">
          Weekly Edge Insights for {ticker}
        </h2>
        <div className="space-y-2 text-sm text-vortex-text leading-relaxed">
          <p>
            <strong className="text-vortex-text-bright">{bestDay.day}</strong> shows the highest trend probability at {(bestDay.trendProb * 100).toFixed(0)}%, making it the best day for directional trading strategies.
          </p>
          <p>
            <strong className="text-vortex-text-bright">{worstDay.day}</strong> has the lowest trend probability at {(worstDay.trendProb * 100).toFixed(0)}%. Consider reduced size or mean reversion strategies.
          </p>
          <p className="text-vortex-muted">
            Note: Day-of-week effects are statistical tendencies, not guarantees. Always confirm with real-time data from VortexEdge and VortexFlow before entering positions.
          </p>
        </div>
      </div>
    </>
  );
}
