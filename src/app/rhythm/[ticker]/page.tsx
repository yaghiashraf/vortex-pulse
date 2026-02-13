"use client";

import { use } from "react";
import { getSessionPhases, getStockMeta } from "@/lib/mock-data";
import TickerSearch from "@/components/TickerSearch";

export default function RhythmPage({ params }: { params: Promise<{ ticker: string }> }) {
  const { ticker } = use(params);
  const upperTicker = ticker.toUpperCase();
  const phases = getSessionPhases(upperTicker);
  const stock = getStockMeta(upperTicker);

  const bestPhase = phases.reduce((best, p) => (p.trendProb > best.trendProb ? p : best), phases[0]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-vortex-text-bright mb-1">Session Rhythm Analysis</h1>
          <p className="text-xs text-vortex-muted">
            How {upperTicker} behaves during each trading session phase
            {stock && <span> — {stock.name}</span>}
          </p>
        </div>
        <TickerSearch currentTicker={upperTicker} basePath="/rhythm" />
      </div>

      {/* Timeline Visualization */}
      <div className="bg-vortex-card border border-vortex-border rounded-xl p-5 mb-6">
        <h2 className="text-xs uppercase tracking-wider text-vortex-muted mb-6">
          Trading Day Timeline
        </h2>

        {/* Visual Timeline Bar */}
        <div className="relative mb-8">
          <div className="flex gap-0.5 rounded-lg overflow-hidden h-14">
            {phases.map((phase) => {
              const width =
                phase.name === "Opening Drive"
                  ? "8%"
                  : phase.name === "Mid-Morning"
                  ? "23%"
                  : phase.name === "Lunch Chop"
                  ? "31%"
                  : phase.name === "Afternoon Push"
                  ? "23%"
                  : "15%";

              return (
                <div
                  key={phase.name}
                  className="relative flex flex-col items-center justify-center"
                  style={{ width, backgroundColor: phase.color + "30" }}
                >
                  <span className="text-[9px] font-semibold text-white/90">{phase.name}</span>
                  <span className="text-[8px] text-white/60">{phase.timeRange}</span>
                </div>
              );
            })}
          </div>

          {/* Trend probability overlay */}
          <div className="flex gap-0.5 mt-1">
            {phases.map((phase) => {
              const width =
                phase.name === "Opening Drive"
                  ? "8%"
                  : phase.name === "Mid-Morning"
                  ? "23%"
                  : phase.name === "Lunch Chop"
                  ? "31%"
                  : phase.name === "Afternoon Push"
                  ? "23%"
                  : "15%";

              return (
                <div key={phase.name} className="text-center" style={{ width }}>
                  <div
                    className="mx-auto rounded-full h-2"
                    style={{
                      width: `${phase.trendProb * 100}%`,
                      backgroundColor: phase.color,
                      minWidth: "10px",
                    }}
                  />
                  <span className="text-[9px] font-mono" style={{ color: phase.color }}>
                    {(phase.trendProb * 100).toFixed(0)}%
                  </span>
                </div>
              );
            })}
          </div>
          <div className="text-center text-[9px] text-vortex-muted mt-0.5">Trend Probability</div>
        </div>
      </div>

      {/* Phase Cards */}
      <div className="space-y-4 mb-6">
        {phases.map((phase) => (
          <div
            key={phase.name}
            className="bg-vortex-card border border-vortex-border rounded-xl p-5"
            style={{ borderLeftColor: phase.color, borderLeftWidth: "3px" }}
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-sm font-bold text-vortex-text-bright">{phase.name}</h3>
                <span className="text-[10px] font-mono text-vortex-muted">{phase.timeRange}</span>
              </div>
              {phase.name === bestPhase.name && (
                <span className="text-[9px] bg-vortex-green/15 text-vortex-green px-2 py-0.5 rounded-full font-medium">
                  BEST WINDOW
                </span>
              )}
              {phase.name === "Lunch Chop" && (
                <span className="text-[9px] bg-vortex-amber/15 text-vortex-amber px-2 py-0.5 rounded-full font-medium">
                  DANGER ZONE
                </span>
              )}
            </div>

            <p className="text-xs text-vortex-text mb-4 leading-relaxed">{phase.description}</p>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <div>
                <div className="text-[10px] text-vortex-muted uppercase tracking-wider">
                  Trend Prob
                </div>
                <div
                  className="text-lg font-bold font-mono"
                  style={{ color: phase.color }}
                >
                  {(phase.trendProb * 100).toFixed(0)}%
                </div>
              </div>
              <div>
                <div className="text-[10px] text-vortex-muted uppercase tracking-wider">
                  Reversal Prob
                </div>
                <div className="text-lg font-bold font-mono text-vortex-amber">
                  {(phase.reversalProb * 100).toFixed(0)}%
                </div>
              </div>
              <div>
                <div className="text-[10px] text-vortex-muted uppercase tracking-wider">
                  Avg Volume
                </div>
                <div className="text-lg font-bold font-mono text-vortex-text-bright">
                  {phase.avgVolume}%
                </div>
                <div className="text-[9px] text-vortex-muted">of daily total</div>
              </div>
              <div>
                <div className="text-[10px] text-vortex-muted uppercase tracking-wider">
                  Avg Range
                </div>
                <div className="text-lg font-bold font-mono text-vortex-text-bright">
                  {phase.avgRange}%
                </div>
                <div className="text-[9px] text-vortex-muted">of daily range</div>
              </div>
              <div>
                <div className="text-[10px] text-vortex-muted uppercase tracking-wider">
                  Best Strategy
                </div>
                <div className="text-xs font-semibold text-vortex-accent-bright mt-1">
                  {phase.bestStrategy}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Trading Tips */}
      <div className="bg-vortex-surface border border-vortex-border rounded-xl p-5">
        <h2 className="text-xs uppercase tracking-wider text-vortex-accent mb-3">
          Session Rhythm Tips for {upperTicker}
        </h2>
        <ul className="space-y-2 text-xs text-vortex-text leading-relaxed">
          <li className="flex items-start gap-2">
            <span className="text-vortex-green mt-0.5">●</span>
            <span>
              <strong className="text-vortex-text-bright">Opening Drive</strong> shows the highest
              trend probability. Use VortexEdge gap/pattern data to enter early if the setup aligns.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-vortex-amber mt-0.5">●</span>
            <span>
              <strong className="text-vortex-text-bright">Lunch Chop</strong> has the lowest trend
              probability and highest reversal rate. Consider stepping away or trading mean reversion
              only.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-vortex-purple mt-0.5">●</span>
            <span>
              <strong className="text-vortex-text-bright">Afternoon Push</strong> often sets the
              day&apos;s final direction. Watch VortexFlow order flow for institutional positioning.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-vortex-cyan mt-0.5">●</span>
            <span>
              <strong className="text-vortex-text-bright">Close Auction</strong> volume surge
              creates opportunity but also whipsaw risk. Size down and focus on high-conviction only.
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
}
