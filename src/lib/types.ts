export interface TimeSlot {
  time: string;
  label: string;
  avgVolume: number;
  avgRange: number;
  trendProb: number;
  avgReturn: number;
  volatility: number;
}

export interface GapFillResult {
  gapRange: string;
  direction: "up" | "down";
  fillRate: number;
  avgFillTime: string;
  sampleSize: number;
  avgReturn: number;
}

export interface SessionPhase {
  name: string;
  timeRange: string;
  description: string;
  trendProb: number;
  reversalProb: number;
  avgVolume: number;
  avgRange: number;
  bestStrategy: string;
  color: string;
}

export interface DayOfWeekStat {
  day: string;
  avgReturn: number;
  avgRange: number;
  avgVolume: number;
  trendProb: number;
  gapFrequency: number;
  bestSession: string;
}

export interface IBStat {
  ticker: string;
  ibBreakUpProb: number;
  ibBreakDownProb: number;
  ibHoldProb: number;
  avgUpExtension: number;
  avgDownExtension: number;
  avgIBRange: number;
  sampleSize: number;
}

export interface MarketRegime {
  regime: "trending" | "ranging" | "volatile";
  confidence: number;
  vixLevel: number;
  vixTrend: "rising" | "falling" | "stable";
  breadthScore: number;
  atrPercentile: number;
  trendWinRate: number;
  meanReversionWinRate: number;
  description: string;
}

export interface StockMeta {
  ticker: string;
  name: string;
  sector: string;
  avgVolume: number;
  avgATR: number;
  price: number;
}

export interface WatchlistItem {
  ticker: string;
  optimalWindows: { start: string; end: string; score: number }[];
}
