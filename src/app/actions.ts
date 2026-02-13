"use server";

import { getOptimalWindows, getTimeOfDayData, getSessionPhases } from "@/lib/real-data";

export async function fetchWatchlistData(tickers: string[]) {
  // Parallelize by ticker
  const results = await Promise.all(
    tickers.map(async (ticker) => {
      const [windowsWrapper, todData, phases] = await Promise.all([
        getOptimalWindows([ticker]),
        getTimeOfDayData(ticker),
        getSessionPhases(ticker)
      ]);
      
      return {
        ticker,
        windows: windowsWrapper[0].windows,
        todData,
        phases
      };
    })
  );
  
  return results;
}
