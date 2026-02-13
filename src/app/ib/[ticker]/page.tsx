import { getIBData, getStockMeta, getStockList } from "@/lib/real-data";
import TickerSearch from "@/components/TickerSearch";
import StatCard from "@/components/StatCard";

export default async function IBPage({ params }: { params: Promise<{ ticker: string }> }) {
  const { ticker } = await params;
  const upperTicker = ticker.toUpperCase();
  
  const [ib, stock, stocks] = await Promise.all([
    getIBData(upperTicker),
    getStockMeta(upperTicker),
    getStockList()
  ]);

  const dominantDirection =
    ib.ibBreakUpProb > ib.ibBreakDownProb ? "upside" : "downside";

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-vortex-text-bright mb-1">
            Initial Balance Statistics
          </h1>
          <p className="text-xs text-vortex-muted">
            IB break/hold rates and extension targets (first 30 minutes)
            {stock && <span> — {stock.name}</span>}
          </p>
        </div>
        <TickerSearch currentTicker={upperTicker} basePath="/ib" stocks={stocks} />
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <StatCard
          label="IB Break Up"
          value={`${(ib.ibBreakUpProb * 100).toFixed(0)}%`}
          subValue="probability of upside break"
          color="green"
        />
        <StatCard
          label="IB Break Down"
          value={`${(ib.ibBreakDownProb * 100).toFixed(0)}%`}
          subValue="probability of downside break"
          color="red"
        />
        <StatCard
          label="IB Hold"
          value={`${(ib.ibHoldProb * 100).toFixed(0)}%`}
          subValue="price stays within IB range"
          color="amber"
        />
        <StatCard
          label="Sample Size"
          value={ib.sampleSize.toString()}
          subValue="trading days analyzed"
          color="blue"
        />
      </div>

      {/* Visual IB Breakdown */}
      <div className="bg-vortex-card border border-vortex-border rounded-xl p-5 mb-6">
        <h2 className="text-xs uppercase tracking-wider text-vortex-muted mb-6">
          IB Outcome Distribution
        </h2>

        {/* Stacked Bar */}
        <div className="mb-6">
          <div className="flex rounded-lg overflow-hidden h-12">
            <div
              className="bg-vortex-green/70 flex items-center justify-center"
              style={{ width: `${ib.ibBreakUpProb * 100}%` }}
            >
              <span className="text-xs font-mono font-bold text-white">
                ▲ {(ib.ibBreakUpProb * 100).toFixed(0)}%
              </span>
            </div>
            <div
              className="bg-vortex-amber/50 flex items-center justify-center"
              style={{ width: `${ib.ibHoldProb * 100}%` }}
            >
              <span className="text-xs font-mono font-bold text-white">
                ◆ {(ib.ibHoldProb * 100).toFixed(0)}%
              </span>
            </div>
            <div
              className="bg-vortex-red/60 flex items-center justify-center"
              style={{ width: `${ib.ibBreakDownProb * 100}%` }}
            >
              <span className="text-xs font-mono font-bold text-white">
                ▼ {(ib.ibBreakDownProb * 100).toFixed(0)}%
              </span>
            </div>
          </div>
          <div className="flex justify-between mt-1 text-[9px] text-vortex-muted">
            <span>Break Up</span>
            <span>Hold (Range)</span>
            <span>Break Down</span>
          </div>
        </div>

        {/* Extension Targets */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Upside Extension */}
          <div className="bg-vortex-surface rounded-lg p-4 border border-vortex-border/50">
            <div className="text-xs font-semibold text-vortex-green mb-3">
              ▲ Upside Extension Target
            </div>
            <div className="flex items-end gap-4">
              <div>
                <div className="text-2xl font-bold font-mono text-vortex-green">
                  ${ib.avgUpExtension.toFixed(2)}
                </div>
                <div className="text-[10px] text-vortex-muted">avg extension beyond IB high</div>
              </div>
              <div className="flex-1">
                <div className="relative h-20 bg-vortex-bg rounded">
                  {/* IB Range */}
                  <div className="absolute bottom-4 left-0 right-0 h-6 bg-vortex-accent/20 rounded border border-vortex-accent/30 flex items-center justify-center">
                    <span className="text-[8px] font-mono text-vortex-accent">
                      IB: ${ib.avgIBRange.toFixed(2)}
                    </span>
                  </div>
                  {/* Extension */}
                  <div className="absolute top-1 left-0 right-0 h-3 bg-vortex-green/30 rounded-t border-t border-x border-vortex-green/40 flex items-center justify-center">
                    <span className="text-[7px] font-mono text-vortex-green">
                      +${ib.avgUpExtension.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Downside Extension */}
          <div className="bg-vortex-surface rounded-lg p-4 border border-vortex-border/50">
            <div className="text-xs font-semibold text-vortex-red mb-3">
              ▼ Downside Extension Target
            </div>
            <div className="flex items-end gap-4">
              <div>
                <div className="text-2xl font-bold font-mono text-vortex-red">
                  ${ib.avgDownExtension.toFixed(2)}
                </div>
                <div className="text-[10px] text-vortex-muted">avg extension beyond IB low</div>
              </div>
              <div className="flex-1">
                <div className="relative h-20 bg-vortex-bg rounded">
                  {/* IB Range */}
                  <div className="absolute top-4 left-0 right-0 h-6 bg-vortex-accent/20 rounded border border-vortex-accent/30 flex items-center justify-center">
                    <span className="text-[8px] font-mono text-vortex-accent">
                      IB: ${ib.avgIBRange.toFixed(2)}
                    </span>
                  </div>
                  {/* Extension */}
                  <div className="absolute bottom-1 left-0 right-0 h-3 bg-vortex-red/30 rounded-b border-b border-x border-vortex-red/40 flex items-center justify-center">
                    <span className="text-[7px] font-mono text-vortex-red">
                      -${ib.avgDownExtension.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* IB Range Info */}
      <div className="bg-vortex-card border border-vortex-border rounded-xl p-5 mb-6">
        <h2 className="text-xs uppercase tracking-wider text-vortex-muted mb-4">
          IB Range Analysis
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <div className="text-[10px] text-vortex-muted uppercase tracking-wider mb-1">
              Average IB Range
            </div>
            <div className="text-xl font-bold font-mono text-vortex-accent-bright">
              ${ib.avgIBRange.toFixed(2)}
            </div>
            <div className="text-[10px] text-vortex-muted">
              {stock ? `${((ib.avgIBRange / stock.price) * 100).toFixed(2)}% of price` : ""}
            </div>
          </div>
          <div>
            <div className="text-[10px] text-vortex-muted uppercase tracking-wider mb-1">
              Dominant Direction
            </div>
            <div
              className={`text-xl font-bold font-mono ${
                dominantDirection === "upside" ? "text-vortex-green" : "text-vortex-red"
              }`}
            >
              {dominantDirection.toUpperCase()}
            </div>
            <div className="text-[10px] text-vortex-muted">
              {dominantDirection === "upside"
                ? `${((ib.ibBreakUpProb - ib.ibBreakDownProb) * 100).toFixed(0)}% more likely to break up`
                : `${((ib.ibBreakDownProb - ib.ibBreakUpProb) * 100).toFixed(0)}% more likely to break down`}
            </div>
          </div>
          <div>
            <div className="text-[10px] text-vortex-muted uppercase tracking-wider mb-1">
              Extension Ratio
            </div>
            <div className="text-xl font-bold font-mono text-vortex-purple">
              {(ib.avgUpExtension / (ib.avgIBRange || 1)).toFixed(1)}x / {(ib.avgDownExtension / (ib.avgIBRange || 1)).toFixed(1)}x
            </div>
            <div className="text-[10px] text-vortex-muted">up ext / down ext vs IB range</div>
          </div>
        </div>
      </div>

      {/* How to Use */}
      <div className="bg-vortex-surface border border-vortex-border rounded-xl p-5">
        <h2 className="text-xs uppercase tracking-wider text-vortex-accent mb-3">
          How to Use IB Statistics
        </h2>
        <ol className="space-y-2 text-xs text-vortex-text leading-relaxed list-decimal list-inside">
          <li>
            Wait for the first 30 minutes to establish the <strong className="text-vortex-text-bright">Initial Balance</strong> (IB high and low).
          </li>
          <li>
            Check the IB break probability — {upperTicker} breaks {dominantDirection} {dominantDirection === "upside"
              ? (ib.ibBreakUpProb * 100).toFixed(0)
              : (ib.ibBreakDownProb * 100).toFixed(0)}% of the time.
          </li>
          <li>
            Use the <strong className="text-vortex-text-bright">extension targets</strong> (${ib.avgUpExtension.toFixed(2)} up / ${ib.avgDownExtension.toFixed(2)} down) as profit targets.
          </li>
          <li>
            On IB hold days ({(ib.ibHoldProb * 100).toFixed(0)}% frequency), consider <strong className="text-vortex-text-bright">range trading</strong> between IB high and low.
          </li>
          <li>
            Combine with VortexEdge&apos;s IB pattern detection for real-time confirmation.
          </li>
        </ol>
      </div>
    </div>
  );
}
