import { supabase } from "@/lib/supabase";
import { 
  getGapFillData as fetchYFGapData, 
  getDayOfWeekData as fetchYFSeasonality,
  getIBData as fetchYFIBData
} from "@/lib/real-data";
import { GapFillResult, DayOfWeekStat, IBStat } from "@/lib/types";

// Gap Fill Data
export async function getGapData(ticker: string): Promise<GapFillResult[]> {
  const { data, error } = await supabase
    .from('daily_stats')
    .select('data')
    .eq('ticker', ticker)
    .eq('stat_type', 'gap_fill')
    .maybeSingle();

  if (error || !data) {
    // Fallback: Fetch from Yahoo Finance directly if DB is empty/fails
    console.warn(`[Supabase] Gap data for ${ticker} not found, falling back to Yahoo Finance.`);
    return await fetchYFGapData(ticker);
  }

  return data.data as GapFillResult[];
}

// Seasonality / Day of Week
export async function getSeasonalityData(ticker: string): Promise<DayOfWeekStat[]> {
  const { data, error } = await supabase
    .from('daily_stats')
    .select('data')
    .eq('ticker', ticker)
    .eq('stat_type', 'seasonality')
    .maybeSingle();

  if (error || !data) {
    console.warn(`[Supabase] Seasonality data for ${ticker} not found, fallback.`);
    return await fetchYFSeasonality(ticker);
  }

  return data.data as DayOfWeekStat[];
}

// IB Stats
export async function getIBStats(ticker: string): Promise<IBStat> {
  const { data, error } = await supabase
    .from('daily_stats')
    .select('data')
    .eq('ticker', ticker)
    .eq('stat_type', 'ib_stats')
    .maybeSingle();

  if (error || !data) {
    console.warn(`[Supabase] IB data for ${ticker} not found, fallback.`);
    return await fetchYFIBData(ticker);
  }

  return data.data as IBStat;
}
