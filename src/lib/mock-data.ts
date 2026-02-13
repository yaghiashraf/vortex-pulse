import {
  TimeSlot,
  GapFillResult,
  SessionPhase,
  DayOfWeekStat,
  IBStat,
  MarketRegime,
  StockMeta,
} from "./types";

// Seeded pseudo-random for consistent results per ticker
function seededRandom(seed: string): () => number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (Math.imul(31, h) + seed.charCodeAt(i)) | 0;
  }
  return () => {
    h = (h ^ (h >>> 16)) * 0x45d9f3b;
    h = (h ^ (h >>> 16)) * 0x45d9f3b;
    h = h ^ (h >>> 16);
    return (h >>> 0) / 4294967296;
  };
}

const POPULAR_STOCKS: StockMeta[] = [
  { ticker: "AAPL", name: "Apple Inc.", sector: "Technology", avgVolume: 62000000, avgATR: 2.8, price: 227.5 },
  { ticker: "TSLA", name: "Tesla Inc.", sector: "Consumer Discretionary", avgVolume: 98000000, avgATR: 8.5, price: 342.1 },
  { ticker: "NVDA", name: "NVIDIA Corp.", sector: "Technology", avgVolume: 45000000, avgATR: 5.2, price: 138.7 },
  { ticker: "AMD", name: "Advanced Micro Devices", sector: "Technology", avgVolume: 55000000, avgATR: 3.9, price: 162.3 },
  { ticker: "AMZN", name: "Amazon.com Inc.", sector: "Consumer Discretionary", avgVolume: 48000000, avgATR: 4.1, price: 198.6 },
  { ticker: "META", name: "Meta Platforms", sector: "Technology", avgVolume: 22000000, avgATR: 8.7, price: 585.2 },
  { ticker: "MSFT", name: "Microsoft Corp.", sector: "Technology", avgVolume: 25000000, avgATR: 4.3, price: 415.8 },
  { ticker: "GOOGL", name: "Alphabet Inc.", sector: "Technology", avgVolume: 28000000, avgATR: 3.5, price: 175.4 },
  { ticker: "SPY", name: "S&P 500 ETF", sector: "ETF", avgVolume: 85000000, avgATR: 4.8, price: 527.3 },
  { ticker: "QQQ", name: "Nasdaq 100 ETF", sector: "ETF", avgVolume: 55000000, avgATR: 5.6, price: 452.1 },
  { ticker: "NFLX", name: "Netflix Inc.", sector: "Communication Services", avgVolume: 8500000, avgATR: 12.3, price: 892.4 },
  { ticker: "JPM", name: "JPMorgan Chase", sector: "Financials", avgVolume: 12000000, avgATR: 3.2, price: 245.7 },
  { ticker: "BA", name: "Boeing Co.", sector: "Industrials", avgVolume: 9500000, avgATR: 5.8, price: 178.9 },
  { ticker: "COIN", name: "Coinbase Global", sector: "Financials", avgVolume: 18000000, avgATR: 9.4, price: 265.3 },
  { ticker: "PLTR", name: "Palantir Technologies", sector: "Technology", avgVolume: 72000000, avgATR: 1.6, price: 24.8 },
  { ticker: "SOFI", name: "SoFi Technologies", sector: "Financials", avgVolume: 45000000, avgATR: 0.5, price: 9.7 },
  { ticker: "SMCI", name: "Super Micro Computer", sector: "Technology", avgVolume: 32000000, avgATR: 18.2, price: 412.5 },
  { ticker: "ARM", name: "Arm Holdings", sector: "Technology", avgVolume: 14000000, avgATR: 7.8, price: 168.9 },
  { ticker: "MARA", name: "Marathon Digital", sector: "Technology", avgVolume: 38000000, avgATR: 2.1, price: 22.4 },
  { ticker: "RIVN", name: "Rivian Automotive", sector: "Consumer Discretionary", avgVolume: 28000000, avgATR: 1.3, price: 14.2 },
];

export function getStockList(): StockMeta[] {
  return POPULAR_STOCKS;
}

export function getStockMeta(ticker: string): StockMeta | undefined {
  return POPULAR_STOCKS.find((s) => s.ticker === ticker.toUpperCase());
}

const TIME_SLOTS = [
  "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "13:00", "13:30", "14:00",
  "14:30", "15:00", "15:30",
];

const TIME_LABELS = [
  "9:30-10:00", "10:00-10:30", "10:30-11:00", "11:00-11:30", "11:30-12:00",
  "12:00-12:30", "12:30-1:00", "1:00-1:30", "1:30-2:00", "2:00-2:30",
  "2:30-3:00", "3:00-3:30", "3:30-4:00",
];

// Realistic intraday volume/volatility profile (U-shaped)
const VOLUME_PROFILE = [1.0, 0.75, 0.55, 0.42, 0.35, 0.28, 0.25, 0.27, 0.32, 0.38, 0.48, 0.65, 0.85];
const VOLATILITY_PROFILE = [1.0, 0.78, 0.58, 0.45, 0.38, 0.30, 0.28, 0.30, 0.35, 0.42, 0.52, 0.68, 0.88];

export function getTimeOfDayData(ticker: string): TimeSlot[] {
  const rng = seededRandom(ticker + "tod");
  const stock = getStockMeta(ticker);
  const baseVolume = stock?.avgVolume ?? 30000000;
  const baseATR = stock?.avgATR ?? 3.0;

  return TIME_SLOTS.map((time, i) => {
    const volMult = VOLUME_PROFILE[i] + (rng() - 0.5) * 0.15;
    const volaMult = VOLATILITY_PROFILE[i] + (rng() - 0.5) * 0.1;

    return {
      time,
      label: TIME_LABELS[i],
      avgVolume: Math.round(baseVolume * volMult / 13),
      avgRange: parseFloat((baseATR * volaMult / 13 * 3).toFixed(2)),
      trendProb: parseFloat((0.3 + volaMult * 0.4 + (rng() - 0.5) * 0.1).toFixed(2)),
      avgReturn: parseFloat(((rng() - 0.48) * 0.3).toFixed(3)),
      volatility: parseFloat((volaMult * 100).toFixed(1)),
    };
  });
}

export function getGapFillData(ticker: string): GapFillResult[] {
  const rng = seededRandom(ticker + "gap");
  const ranges = ["0-1%", "1-2%", "2-3%", "3-5%", "5%+"];
  const results: GapFillResult[] = [];

  for (const direction of ["up", "down"] as const) {
    for (const range of ranges) {
      const sizeIdx = ranges.indexOf(range);
      // Smaller gaps fill more often
      const baseFillRate = 0.82 - sizeIdx * 0.12;
      // Down gaps fill slightly more than up gaps
      const dirAdj = direction === "down" ? 0.04 : 0;

      results.push({
        gapRange: range,
        direction,
        fillRate: parseFloat(Math.min(0.95, Math.max(0.15, baseFillRate + dirAdj + (rng() - 0.5) * 0.1)).toFixed(2)),
        avgFillTime: sizeIdx <= 1 ? `${30 + Math.round(rng() * 60)}min` : sizeIdx <= 3 ? `${1 + Math.round(rng() * 2)}h ${Math.round(rng() * 30)}min` : `${3 + Math.round(rng() * 3)}h+`,
        sampleSize: Math.round(200 - sizeIdx * 35 + rng() * 30),
        avgReturn: parseFloat(((direction === "down" ? 1 : -1) * (0.3 + sizeIdx * 0.15) * (baseFillRate) + (rng() - 0.5) * 0.2).toFixed(2)),
      });
    }
  }

  return results;
}

export function getSessionPhases(ticker: string): SessionPhase[] {
  const rng = seededRandom(ticker + "session");

  return [
    {
      name: "Opening Drive",
      timeRange: "9:30 - 10:00 AM",
      description: "High-energy opening with institutional order flow. Gaps set the tone.",
      trendProb: parseFloat((0.62 + rng() * 0.15).toFixed(2)),
      reversalProb: parseFloat((0.25 + rng() * 0.1).toFixed(2)),
      avgVolume: parseFloat((28 + rng() * 8).toFixed(1)),
      avgRange: parseFloat((35 + rng() * 15).toFixed(1)),
      bestStrategy: "Momentum / Gap Fade",
      color: "#3b82f6",
    },
    {
      name: "Mid-Morning",
      timeRange: "10:00 - 11:30 AM",
      description: "Trend continuation or first reversal. Key decision zone for the day's direction.",
      trendProb: parseFloat((0.55 + rng() * 0.12).toFixed(2)),
      reversalProb: parseFloat((0.30 + rng() * 0.1).toFixed(2)),
      avgVolume: parseFloat((18 + rng() * 6).toFixed(1)),
      avgRange: parseFloat((22 + rng() * 10).toFixed(1)),
      bestStrategy: "Trend Following / Pullback",
      color: "#22c55e",
    },
    {
      name: "Lunch Chop",
      timeRange: "11:30 AM - 1:30 PM",
      description: "Low volume, choppy price action. Algos dominate. Danger zone for overtrading.",
      trendProb: parseFloat((0.20 + rng() * 0.1).toFixed(2)),
      reversalProb: parseFloat((0.55 + rng() * 0.12).toFixed(2)),
      avgVolume: parseFloat((8 + rng() * 4).toFixed(1)),
      avgRange: parseFloat((10 + rng() * 6).toFixed(1)),
      bestStrategy: "Sit Out / Mean Reversion Only",
      color: "#f59e0b",
    },
    {
      name: "Afternoon Push",
      timeRange: "1:30 - 3:00 PM",
      description: "Volume returns as institutions position for the close. Strong directional moves.",
      trendProb: parseFloat((0.50 + rng() * 0.12).toFixed(2)),
      reversalProb: parseFloat((0.32 + rng() * 0.1).toFixed(2)),
      avgVolume: parseFloat((15 + rng() * 5).toFixed(1)),
      avgRange: parseFloat((18 + rng() * 8).toFixed(1)),
      bestStrategy: "Breakout / Trend Continuation",
      color: "#a855f7",
    },
    {
      name: "Close Auction",
      timeRange: "3:00 - 4:00 PM",
      description: "Highest volume of the day. MOC orders and portfolio rebalancing create opportunity.",
      trendProb: parseFloat((0.58 + rng() * 0.14).toFixed(2)),
      reversalProb: parseFloat((0.28 + rng() * 0.1).toFixed(2)),
      avgVolume: parseFloat((22 + rng() * 8).toFixed(1)),
      avgRange: parseFloat((28 + rng() * 12).toFixed(1)),
      bestStrategy: "Momentum / MOC Flow",
      color: "#06b6d4",
    },
  ];
}

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

export function getDayOfWeekData(ticker: string): DayOfWeekStat[] {
  const rng = seededRandom(ticker + "dow");
  const sessions = ["Opening Drive", "Mid-Morning", "Afternoon Push", "Close Auction"];

  return DAYS.map((day) => ({
    day,
    avgReturn: parseFloat(((rng() - 0.48) * 0.5).toFixed(3)),
    avgRange: parseFloat((1.2 + rng() * 1.8).toFixed(2)),
    avgVolume: parseFloat((80 + rng() * 40).toFixed(0)),
    trendProb: parseFloat((0.40 + rng() * 0.25).toFixed(2)),
    gapFrequency: parseFloat((0.30 + rng() * 0.4).toFixed(2)),
    bestSession: sessions[Math.floor(rng() * sessions.length)],
  }));
}

export function getIBData(ticker: string): IBStat {
  const rng = seededRandom(ticker + "ib");
  const stock = getStockMeta(ticker);
  const baseATR = stock?.avgATR ?? 3.0;

  const breakUpProb = 0.35 + rng() * 0.15;
  const breakDownProb = 0.30 + rng() * 0.15;
  const holdProb = 1 - breakUpProb - breakDownProb;

  return {
    ticker: ticker.toUpperCase(),
    ibBreakUpProb: parseFloat(breakUpProb.toFixed(2)),
    ibBreakDownProb: parseFloat(breakDownProb.toFixed(2)),
    ibHoldProb: parseFloat(holdProb.toFixed(2)),
    avgUpExtension: parseFloat((baseATR * 0.6 + rng() * baseATR * 0.4).toFixed(2)),
    avgDownExtension: parseFloat((baseATR * 0.55 + rng() * baseATR * 0.35).toFixed(2)),
    avgIBRange: parseFloat((baseATR * 0.4 + rng() * baseATR * 0.3).toFixed(2)),
    sampleSize: Math.round(180 + rng() * 70),
  };
}

export function getMarketRegime(): MarketRegime {
  // Simulate a plausible current regime
  const regimes: MarketRegime[] = [
    {
      regime: "trending",
      confidence: 0.72,
      vixLevel: 14.8,
      vixTrend: "falling",
      breadthScore: 68,
      atrPercentile: 42,
      trendWinRate: 0.64,
      meanReversionWinRate: 0.38,
      description: "Markets showing sustained directional momentum with healthy breadth participation. Trend-following strategies have the highest edge.",
    },
    {
      regime: "ranging",
      confidence: 0.65,
      vixLevel: 18.2,
      vixTrend: "stable",
      breadthScore: 52,
      atrPercentile: 35,
      trendWinRate: 0.41,
      meanReversionWinRate: 0.62,
      description: "Indices consolidating in a defined range. Mean reversion and range-bound strategies outperform. Avoid chasing breakouts.",
    },
    {
      regime: "volatile",
      confidence: 0.81,
      vixLevel: 28.5,
      vixTrend: "rising",
      breadthScore: 35,
      atrPercentile: 85,
      trendWinRate: 0.48,
      meanReversionWinRate: 0.44,
      description: "Elevated fear with wide ranges and whipsaw risk. Reduce size, widen stops, and focus on high-conviction setups only.",
    },
  ];

  // Use date-based seed for daily consistency
  const today = new Date().toISOString().split("T")[0];
  const rng = seededRandom(today);
  return regimes[Math.floor(rng() * regimes.length)];
}

export function getOptimalWindows(tickers: string[]): { ticker: string; windows: { start: string; end: string; score: number }[] }[] {
  return tickers.map((ticker) => {
    const todData = getTimeOfDayData(ticker);
    const windows = todData
      .map((slot, i) => ({
        start: slot.time,
        end: TIME_SLOTS[i + 1] ?? "16:00",
        score: slot.trendProb * 0.5 + (slot.volatility / 100) * 0.3 + (slot.avgVolume > 3000000 ? 0.2 : 0.1),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);

    return { ticker, windows };
  });
}
