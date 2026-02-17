import { getTimeOfDayData, getStockMeta, getStockList } from "@/lib/real-data";
import TickerSearch from "@/components/TickerSearch";
import StatCard from "@/components/StatCard";

export const revalidate = 60;

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

export default async function HeatmapPage({ params }: { params: Promise<{ ticker: string }> }) {
  const { ticker } = await params;
  const upperTicker = ticker.toUpperCase();
  
  // Parallel fetch
  const [data, stock, stocks] = await Promise.all([
    getTimeOfDayData(upperTicker),
    getStockMeta(upperTicker),
    getStockList()
  ]);

  const maxVol = Math.max(...data.map((d) => d.avgVolume)) || 1;
  const maxRange = Math.max(...data.map((d) => d.avgRange)) || 1;
  const maxVolatility = Math.max(...data.map((d) => d.volatility)) || 1;

  const bestSlot = data.length ? data.reduce((best, d) => (d.trendProb > best.trendProb ? d : best), data[0]) : null;
  const worstSlot = data.length ? data.reduce((worst, d) => (d.trendProb < worst.trendProb ? d : worst), data[0]) : null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-bold text-vortex-text-bright">Time-of-Day Heatmap</h1>
          </div>
          <p className="text-xs text-vortex-muted">
            Historical volatility, volume, and trend probability across the trading day
            {stock && <span> — {stock.name}</span>}
          </p>
        </div>
        <TickerSearch currentTicker={upperTicker} basePath="/heatmap" stocks={stocks} />
      </div>

      {/* Summary Stats */}
      {bestSlot && worstSlot && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <StatCard
            label="Best Window"
            value={bestSlot.label}
            subValue={`${(bestSlot.trendProb * 100).toFixed(0)}% trend prob`}
            color="green"
            />
            <StatCard
            label="Avoid"
            value={worstSlot.label}
            subValue={`${(worstSlot.trendProb * 100).toFixed(0)}% trend prob`}
            color="red"
            />
            <StatCard
            label="Peak Volume"
            value={`${(maxVol / 1000000).toFixed(1)}M`}
            subValue={`at ${data.find((d) => d.avgVolume === maxVol)?.label}`}
            color="blue"
            />
            <StatCard
            label="Peak Range"
            value={`$${maxRange.toFixed(2)}`}
            subValue={`at ${data.find((d) => d.avgRange === maxRange)?.label}`}
            color="purple"
            />
        </div>
      )}

      {/* Heatmap Grid */}
      <div className="bg-vortex-card border border-vortex-border rounded-xl p-5 mb-6">
        <h2 className="text-xs uppercase tracking-wider text-vortex-muted mb-4">
          Volume & Volatility Heatmap
        </h2>

        {data.length === 0 ? (
            <div className="text-vortex-muted text-sm">No data available for {upperTicker}. Try a liquid stock like SPY, AAPL, NVDA.</div>
        ) : (
            <>
                {/* Header Row */}
                <div className="grid grid-cols-[100px_repeat(13,1fr)] gap-1 mb-2">
                <div className="text-[10px] text-vortex-muted" />
                {data.map((d) => (
                    <div key={d.time} className="text-[9px] text-vortex-muted text-center font-mono">
                    {d.time}
                    </div>
                ))}
                </div>

                {/* Volume Row */}
                <div className="grid grid-cols-[100px_repeat(13,1fr)] gap-1 mb-1">
                <div className="text-[10px] text-vortex-muted flex items-center">Volume</div>
                {data.map((d) => (
                    <div
                    key={d.time}
                    className={`heatmap-cell ${getHeatColor(d.avgVolume, maxVol)} rounded h-10 flex items-center justify-center cursor-default`}
                    title={`${d.label}: ${(d.avgVolume / 1000000).toFixed(1)}M avg volume`}
                    >
                    <span className="text-[9px] font-mono text-white/80">
                        {(d.avgVolume / 1000000).toFixed(1)}M
                    </span>
                    </div>
                ))}
                </div>

                {/* Volatility Row */}
                <div className="grid grid-cols-[100px_repeat(13,1fr)] gap-1 mb-1">
                <div className="text-[10px] text-vortex-muted flex items-center">Volatility</div>
                {data.map((d) => {
                    const ratio = d.volatility / maxVolatility;
                    const bg =
                    ratio > 0.8
                        ? "bg-purple-500"
                        : ratio > 0.6
                        ? "bg-purple-600/80"
                        : ratio > 0.4
                        ? "bg-purple-700/60"
                        : ratio > 0.2
                        ? "bg-purple-800/40"
                        : "bg-purple-900/20";
                    return (
                    <div
                        key={d.time}
                        className={`heatmap-cell ${bg} rounded h-10 flex items-center justify-center cursor-default`}
                        title={`${d.label}: ${d.volatility}% relative volatility`}
                    >
                        <span className="text-[9px] font-mono text-white/80">{d.volatility.toFixed(0)}%</span>
                    </div>
                    );
                })}
                </div>

                {/* Range Row */}
                <div className="grid grid-cols-[100px_repeat(13,1fr)] gap-1 mb-1">
                <div className="text-[10px] text-vortex-muted flex items-center">Avg Range</div>
                {data.map((d) => {
                    const ratio = d.avgRange / maxRange;
                    const bg =
                    ratio > 0.8
                        ? "bg-cyan-500"
                        : ratio > 0.6
                        ? "bg-cyan-600/80"
                        : ratio > 0.4
                        ? "bg-cyan-700/60"
                        : ratio > 0.2
                        ? "bg-cyan-800/40"
                        : "bg-cyan-900/20";
                    return (
                    <div
                        key={d.time}
                        className={`heatmap-cell ${bg} rounded h-10 flex items-center justify-center cursor-default`}
                        title={`${d.label}: $${d.avgRange} avg range`}
                    >
                        <span className="text-[9px] font-mono text-white/80">${d.avgRange}</span>
                    </div>
                    );
                })}
                </div>

                {/* Trend Probability Row */}
                <div className="grid grid-cols-[100px_repeat(13,1fr)] gap-1">
                <div className="text-[10px] text-vortex-muted flex items-center">Trend Prob</div>
                {data.map((d) => {
                    const bg =
                    d.trendProb > 0.6
                        ? "bg-green-500"
                        : d.trendProb > 0.45
                        ? "bg-green-600/70"
                        : d.trendProb > 0.3
                        ? "bg-amber-600/50"
                        : "bg-red-800/40";
                    return (
                    <div
                        key={d.time}
                        className={`heatmap-cell ${bg} rounded h-10 flex items-center justify-center cursor-default`}
                        title={`${d.label}: ${(d.trendProb * 100).toFixed(0)}% trend probability`}
                    >
                        <span className="text-[9px] font-mono text-white/80">
                        {(d.trendProb * 100).toFixed(0)}%
                        </span>
                    </div>
                    );
                })}
                </div>
            </>
        )}

        {/* Legend */}
        <div className="flex items-center gap-6 mt-4 text-[10px] text-vortex-muted">
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
      {data.length > 0 && (
        <div className="bg-vortex-card border border-vortex-border rounded-xl p-5">
            <h2 className="text-xs uppercase tracking-wider text-vortex-muted mb-4">
            Detailed Statistics by Time Window
            </h2>
            <div className="overflow-x-auto">
            <table className="w-full text-xs">
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
                    <td className="py-2 text-right font-mono text-vortex-text">
                        {(d.avgVolume / 1000000).toFixed(2)}M
                    </td>
                    <td className="py-2 text-right font-mono text-vortex-text">${d.avgRange}</td>
                    <td className="py-2 text-right font-mono text-vortex-text">{d.volatility.toFixed(1)}%</td>
                    <td className={`py-2 text-right font-mono font-semibold ${getTrendColor(d.trendProb)}`}>
                        {(d.trendProb * 100).toFixed(0)}%
                    </td>
                    <td
                        className={`py-2 text-right font-mono ${
                        d.avgReturn >= 0 ? "text-vortex-green" : "text-vortex-red"
                        }`}
                    >
                        {d.avgReturn >= 0 ? "+" : ""}
                        {(d.avgReturn * 100).toFixed(2)}%
                    </td>
                    </tr>
                ))}
                </tbody>
            </table>
            </div>
        </div>
      )}
    </div>
  );
}
