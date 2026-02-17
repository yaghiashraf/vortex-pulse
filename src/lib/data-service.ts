import {
  getGapFillData,
  getDayOfWeekData,
  getIBData
} from "@/lib/real-data";
import { GapFillResult, DayOfWeekStat, IBStat } from "@/lib/types";

// Gap Fill Data — direct from Yahoo Finance
export async function getGapData(ticker: string): Promise<GapFillResult[]> {
  return await getGapFillData(ticker);
}

// Seasonality / Day of Week — direct from Yahoo Finance
export async function getSeasonalityData(ticker: string): Promise<DayOfWeekStat[]> {
  return await getDayOfWeekData(ticker);
}

// IB Stats — direct from Yahoo Finance
export async function getIBStats(ticker: string): Promise<IBStat> {
  return await getIBData(ticker);
}
