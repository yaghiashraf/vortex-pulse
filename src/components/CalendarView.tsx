"use client";

import { useRouter } from "next/navigation";
import { DayOfWeekStat, StockMeta } from "@/lib/types";

interface OptimalWindow {
  start: string;
  end: string;
  score: number;
}

interface CalendarViewProps {
  stocks: StockMeta[];
  selectedTicker: string;
  data: DayOfWeekStat[];
  optimalWindows: OptimalWindow[];
}

export default function CalendarView({ stocks, selectedTicker, data, optimalWindows }: CalendarViewProps) {
  const router = useRouter();

  const bestDay = data.length ? data.reduce((best, d) => (d.trendProb > best.trendProb ? d : best), data[0]) : null;
  const worstDay = data.length ? data.reduce((worst, d) => (d.trendProb < worst.trendProb ? d : worst), data[0]) : null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-vortex-text-bright mb-1">Day-of-Week Edge</h1>
          <p className="text-xs text-vortex-muted">
            Statistical tendencies by day of week — identify recurring patterns
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-vortex-text-bright font-mono">
            {selectedTicker}
          </span>
          <select
            value={selectedTicker}
            onChange={(e) => {
                const t = e.target.value;
                router.push(`/calendar?ticker=${t}`);
            }}
            className="bg-vortex-card border border-vortex-border rounded-md px-3 py-1.5 text-xs text-vortex-text focus:outline-none focus:border-vortex-accent"
          >
            {stocks.map((s) => (
              <option key={s.ticker} value={s.ticker}>
                {s.ticker} — {s.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Optimal Trading Windows for Today */}
      {optimalWindows.length > 0 && (
        <div className="bg-vortex-card border border-vortex-border rounded-xl p-5 mb-6">
          <h2 className="text-xs uppercase tracking-wider text-vortex-muted mb-4">
            Top Trading Windows Today — {selectedTicker}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {optimalWindows.map((w, i) => (
              <div
                key={i}
                className={`rounded-lg p-4 border ${
                  i === 0
                    ? "bg-vortex-green/10 border-vortex-green/30"
                    : i === 1
                    ? "bg-vortex-accent/10 border-vortex-accent/30"
                    : "bg-vortex-surface border-vortex-border"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono font-bold text-vortex-text-bright">
                    {w.start} – {w.end}
                  </span>
                  <span
                    className={`text-xs font-mono font-bold ${
                      i === 0 ? "text-vortex-green" : i === 1 ? "text-vortex-accent-bright" : "text-vortex-muted"
                    }`}
                  >
                    {(w.score * 100).toFixed(0)} score
                  </span>
                </div>
                <div className="w-full bg-vortex-bg rounded-full h-2">
                  <div
                    className={`h-full rounded-full ${
                      i === 0 ? "bg-vortex-green" : i === 1 ? "bg-vortex-accent" : "bg-vortex-muted"
                    }`}
                    style={{ width: `${w.score * 100}%` }}
                  />
                </div>
                <div className="text-[9px] text-vortex-muted mt-1">
                  {i === 0 ? "Best window" : i === 1 ? "2nd best" : "3rd best"}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {data.length === 0 ? (
          <div className="text-vortex-muted text-sm">No data available.</div>
      ) : (
        <>
            {/* Visual Day Comparison */}
            <div className="bg-vortex-card border border-vortex-border rounded-xl p-5 mb-6">
                <h2 className="text-xs uppercase tracking-wider text-vortex-muted mb-6">
                Weekly Pattern Overview
                </h2>

                <div className="grid grid-cols-5 gap-3">
                {data.map((d) => {
                    const isBest = bestDay && d.day === bestDay.day;
                    const isWorst = worstDay && d.day === worstDay.day;

                    return (
                    <div
                        key={d.day}
                        className={`rounded-xl p-4 border transition-colors ${
                        isBest
                            ? "bg-vortex-green/10 border-vortex-green/30"
                            : isWorst
                            ? "bg-vortex-red/10 border-vortex-red/30"
                            : "bg-vortex-surface border-vortex-border"
                        }`}
                    >
                        <div className="text-center mb-3">
                        <div className="text-xs font-semibold text-vortex-text-bright">{d.day}</div>
                        {isBest && (
                            <span className="text-[8px] text-vortex-green uppercase tracking-wider">
                            Best Day
                            </span>
                        )}
                        {isWorst && (
                            <span className="text-[8px] text-vortex-red uppercase tracking-wider">
                            Weakest
                            </span>
                        )}
                        </div>

                        {/* Trend Probability Bar */}
                        <div className="mb-3">
                        <div className="text-[9px] text-vortex-muted text-center mb-1">Trend Prob</div>
                        <div className="w-full bg-vortex-bg rounded-full h-5 relative">
                            <div
                            className={`h-full rounded-full flex items-center justify-center ${
                                d.trendProb > 0.55
                                ? "bg-vortex-green/60"
                                : d.trendProb > 0.42
                                ? "bg-vortex-accent/50"
                                : "bg-vortex-amber/40"
                            }`}
                            style={{ width: `${d.trendProb * 100}%` }}
                            >
                            <span className="text-[9px] font-mono font-bold text-white">
                                {(d.trendProb * 100).toFixed(0)}%
                            </span>
                            </div>
                        </div>
                        </div>

                        <div className="space-y-2 text-[10px]">
                        <div className="flex justify-between">
                            <span className="text-vortex-muted">Avg Return</span>
                            <span
                            className={`font-mono font-semibold ${
                                d.avgReturn >= 0 ? "text-vortex-green" : "text-vortex-red"
                            }`}
                            >
                            {d.avgReturn >= 0 ? "+" : ""}
                            {(d.avgReturn * 100).toFixed(2)}%
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
                            <span className="font-mono text-vortex-text">
                            {(d.gapFrequency * 100).toFixed(0)}%
                            </span>
                        </div>
                        <div className="pt-1 border-t border-vortex-border/50">
                            <span className="text-vortex-muted">Best Session</span>
                            <div className="font-semibold text-vortex-accent-bright mt-0.5">
                            {d.bestSession}
                            </div>
                        </div>
                        </div>
                    </div>
                    );
                })}
                </div>
            </div>

            {/* Detailed Table */}
            <div className="bg-vortex-card border border-vortex-border rounded-xl p-5 mb-6">
                <h2 className="text-xs uppercase tracking-wider text-vortex-muted mb-4">
                Detailed Day-of-Week Statistics
                </h2>
                <div className="overflow-x-auto">
                <table className="w-full text-xs">
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
                        <tr
                        key={d.day}
                        className="border-b border-vortex-border/50 hover:bg-vortex-surface/50"
                        >
                        <td className="py-2.5 font-semibold text-vortex-text-bright">{d.day}</td>
                        <td
                            className={`py-2.5 text-right font-mono ${
                            d.avgReturn >= 0 ? "text-vortex-green" : "text-vortex-red"
                            }`}
                        >
                            {d.avgReturn >= 0 ? "+" : ""}
                            {(d.avgReturn * 100).toFixed(2)}%
                        </td>
                        <td className="py-2.5 text-right font-mono text-vortex-text">{d.avgRange}%</td>
                        <td className="py-2.5 text-right font-mono text-vortex-text">{d.avgVolume}%</td>
                        <td
                            className={`py-2.5 text-right font-mono font-semibold ${
                            d.trendProb > 0.55
                                ? "text-vortex-green"
                                : d.trendProb > 0.42
                                ? "text-vortex-accent-bright"
                                : "text-vortex-amber"
                            }`}
                        >
                            {(d.trendProb * 100).toFixed(0)}%
                        </td>
                        <td className="py-2.5 text-right font-mono text-vortex-text">
                            {(d.gapFrequency * 100).toFixed(0)}%
                        </td>
                        <td className="py-2.5 pl-4 text-vortex-accent-bright">{d.bestSession}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
                </div>
            </div>

            {/* Insights */}
            {bestDay && worstDay && (
                <div className="bg-vortex-surface border border-vortex-border rounded-xl p-5">
                    <h2 className="text-xs uppercase tracking-wider text-vortex-accent mb-3">
                    Weekly Edge Insights for {selectedTicker}
                    </h2>
                    <div className="space-y-2 text-xs text-vortex-text leading-relaxed">
                    <p>
                        <strong className="text-vortex-text-bright">{bestDay.day}</strong> shows the highest
                        trend probability at {(bestDay.trendProb * 100).toFixed(0)}%, making it the best day for
                        directional trading strategies.
                    </p>
                    <p>
                        <strong className="text-vortex-text-bright">{worstDay.day}</strong> has the lowest trend
                        probability at {(worstDay.trendProb * 100).toFixed(0)}%. Consider reduced size or mean
                        reversion strategies.
                    </p>
                    <p className="text-vortex-muted">
                        Note: Day-of-week effects are statistical tendencies, not guarantees. Always confirm with
                        real-time data from VortexEdge and VortexFlow before entering positions.
                    </p>
                    </div>
                </div>
            )}
        </>
      )}
    </div>
  );
}
