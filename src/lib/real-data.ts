import yahooFinance from 'yahoo-finance2';
import {
  TimeSlot,
  GapFillResult,
  SessionPhase,
  DayOfWeekStat,
  IBStat,
  MarketRegime,
  StockMeta,
} from "./types";

// Instantiate the library
// @ts-ignore
let yf: any;

try {
  // @ts-ignore
  if (typeof yahooFinance === 'function') {
     // @ts-ignore
     yf = new yahooFinance({ suppressNotices: ['yahooSurvey'] });
  } else if (typeof yahooFinance === 'object' && yahooFinance !== null) {
      // @ts-ignore
      if (yahooFinance.default && typeof yahooFinance.default === 'function') {
           // @ts-ignore
           yf = new yahooFinance.default({ suppressNotices: ['yahooSurvey'] });
      } else {
           // Assume it's a singleton or pre-instantiated
           yf = yahooFinance;
      }
  } else {
      console.warn("Could not instantiate yahoo-finance2, falling back to global/module");
      yf = yahooFinance;
  }
} catch (e) {
  console.error("Error instantiating yahoo-finance2:", e);
  // Fallback to avoid crash during build if it's just a quirk
  yf = yahooFinance; 
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

const POPULAR_STICKERS = [
  "AAPL", "TSLA", "NVDA", "AMD", "AMZN", "META", "MSFT", "GOOGL", "SPY", "QQQ",
  "NFLX", "JPM", "BA", "COIN", "PLTR", "SOFI", "SMCI", "ARM", "MARA", "RIVN"
];

// Helper to format time to HH:mm in NY time
function formatNYTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'America/New_York'
  });
}

// Helper to check if a time is within market hours (09:30 - 16:00)
function isMarketHours(timeStr: string): boolean {
  return timeStr >= "09:30" && timeStr < "16:00";
}

export async function getStockList(): Promise<StockMeta[]> {
  try {
    const quotes = await yf.quote(POPULAR_STICKERS);
    return quotes.map((q: any) => ({
      ticker: q.symbol,
      name: q.shortName || q.longName || q.symbol,
      sector: "N/A", // quote doesn't always have sector, would need quoteSummary
      avgVolume: q.averageDailyVolume3Month || q.regularMarketVolume || 0,
      avgATR: 0, // Need historical to calc, leaving 0 or calc later
      price: q.regularMarketPrice || 0,
    }));
  } catch (e) {
    console.error("Error fetching stock list:", e);
    return [];
  }
}

export async function getStockMeta(ticker: string): Promise<StockMeta | undefined> {
  try {
    const q = await yf.quote(ticker);
    return {
      ticker: q.symbol,
      name: q.shortName || q.longName || q.symbol,
      sector: "N/A",
      avgVolume: q.averageDailyVolume3Month || 0,
      avgATR: 0,
      price: q.regularMarketPrice || 0,
    };
  } catch (e) {
    return undefined;
  }
}

export async function getTimeOfDayData(ticker: string): Promise<TimeSlot[]> {
  try {
    // Get 5 days of 1m data to build a profile
    // Note: yahoo-finance2 chart '1d' range might be today. '5d' gives last 5 days.
    const period1 = new Date();
    period1.setDate(period1.getDate() - 5);
    const result = await yf.chart(ticker, { interval: '1m', period1: period1 });
    if (!result || !result.quotes) return [];

    const quotes = result.quotes;
    // Map of timeSlot -> Array of values for all days
    const slotsMap = new Map<string, { vol: number[], rangePct: number[], return: number[] }>();

    TIME_SLOTS.forEach(t => slotsMap.set(t, { vol: [], rangePct: [], return: [] }));

    // Group 1m candles into 30m buckets
    // We need to sum 1m volumes into 30m volumes for each day, then average across days.
    
    quotes.forEach((q: any) => {
      if (!q.date) return;
      const timeStr = formatNYTime(q.date);
      const [h, m] = timeStr.split(':').map(Number);
      
      // 9:30 - 10:00 -> 09:30 bucket
      // Logic: floor minutes to 00 or 30
      const slotM = m >= 30 ? 30 : 0;
      const slotTime = `${String(h).padStart(2, '0')}:${String(slotM).padStart(2, '0')}`;
      
      if (slotsMap.has(slotTime)) {
        const bucket = slotsMap.get(slotTime)!;
        
        // 1m Volume
        bucket.vol.push(q.volume);
        
        // 1m Volatility (High-Low as % of Open) - "Activity"
        const volPct = ((q.high - q.low) / q.open) * 100;
        bucket.rangePct.push(volPct);
        
        // 1m Return %
        const retPct = ((q.close - q.open) / q.open);
        bucket.return.push(retPct);
      }
    });

    return TIME_SLOTS.map((time, i) => {
      const bucket = slotsMap.get(time);
      const count = bucket?.vol.length || 0;
      
      if (count === 0) {
          return {
            time,
            label: TIME_LABELS[i],
            avgVolume: 0,
            avgRange: 0,
            trendProb: 0.5,
            avgReturn: 0,
            volatility: 0
          };
      }

      // To get "Average 30m Volume", we need to know how many days we have.
      // We have (Days * 30) candles roughly (1m interval).
      const estimatedDays = Math.max(1, Math.round(count / 30));
      
      const totalVol = bucket!.vol.reduce((a, b) => a + b, 0);
      const avgVolume = Math.round(totalVol / estimatedDays);

      // Average 1m Range % (proxy for volatility intensity)
      const avgVolPct = bucket!.rangePct.reduce((a, b) => a + b, 0) / count;
      
      // Avg Return % (sum of 1m returns... scaled to 30m)
      // average 1m return * 30 = average 30m return roughly
      const avg1mReturn = bucket!.return.reduce((a, b) => a + b, 0) / count;
      const avgReturn = parseFloat((avg1mReturn * 30).toFixed(4)); // Scaled to 30m

      // Trend Probability: % of 1m candles that were Green
      // With 1m candles, this is a much smoother "momentum" indicator.
      const positiveCandles = bucket!.return.filter(r => r > 0).length;
      const trendProb = parseFloat((positiveCandles / count).toFixed(2));

      // Avg Range in Dollars 
      // Heuristic: Avg 1m Range * sqrt(30) or roughly * 5 for 30m high-low
      const avgRange = parseFloat((avgVolPct * 5).toFixed(2)); 

      return {
        time,
        label: TIME_LABELS[i],
        avgVolume,
        avgRange, // Placeholder dollar value
        trendProb,
        avgReturn, 
        volatility: parseFloat(avgVolPct.toFixed(2)), // Actual volatility %
      };
    });

  } catch (e) {
    console.error("Error getting ToD data", e);
    return [];
  }
}

// Helper to get last 6 months date
function getLast6MonthsDate(): Date {
  const d = new Date();
  d.setMonth(d.getMonth() - 6);
  return d;
}

export async function getGapFillData(ticker: string): Promise<GapFillResult[]> {
  try {
    const period1 = getLast6MonthsDate();
    const history = await yf.historical(ticker, { period1, interval: '1d' });

    if (history.length < 2) return [];

    const gaps: {
        range: string;
        direction: "up" | "down";
        filled: boolean;
        return: number;
    }[] = [];

    // Iterate history to find gaps
    for (let i = 1; i < history.length; i++) {
        const today = history[i];
        const yesterday = history[i-1];

        // Gap Up: Today Open > Yesterday High
        if (today.open > yesterday.high) {
            const gapSizePct = (today.open - yesterday.high) / yesterday.high * 100;
            // Check fill: Low <= Yesterday High
            const filled = today.low <= yesterday.high;
            
            let rangeLabel = "0-1%";
            if (gapSizePct > 5) rangeLabel = "5%+";
            else if (gapSizePct > 3) rangeLabel = "3-5%";
            else if (gapSizePct > 2) rangeLabel = "2-3%";
            else if (gapSizePct > 1) rangeLabel = "1-2%";

            gaps.push({
                range: rangeLabel,
                direction: "up",
                filled,
                return: (today.close - today.open) / today.open
            });
        } 
        // Gap Down: Today Open < Yesterday Low
        else if (today.open < yesterday.low) {
            const gapSizePct = (yesterday.low - today.open) / yesterday.low * 100;
            // Check fill: High >= Yesterday Low
            const filled = today.high >= yesterday.low;

            let rangeLabel = "0-1%";
            if (gapSizePct > 5) rangeLabel = "5%+";
            else if (gapSizePct > 3) rangeLabel = "3-5%";
            else if (gapSizePct > 2) rangeLabel = "2-3%";
            else if (gapSizePct > 1) rangeLabel = "1-2%";

            gaps.push({
                range: rangeLabel,
                direction: "down",
                filled,
                return: (today.close - today.open) / today.open
            });
        }
    }

    // Aggregate results
    const ranges = ["0-1%", "1-2%", "2-3%", "3-5%", "5%+"];
    const results: GapFillResult[] = [];

    for (const dir of ["up", "down"] as const) {
        for (const r of ranges) {
            const matches = gaps.filter(g => g.direction === dir && g.range === r);
            if (matches.length > 0) {
                const filledCount = matches.filter(g => g.filled).length;
                const fillRate = filledCount / matches.length;
                const avgRet = matches.reduce((sum, g) => sum + g.return, 0) / matches.length;
                
                results.push({
                    gapRange: r,
                    direction: dir,
                    fillRate,
                    avgFillTime: "N/A", // intra-day data needed for accurate time
                    sampleSize: matches.length,
                    avgReturn: parseFloat((avgRet * 100).toFixed(2))
                });
            } else {
                 // Push empty placeholder for UI consistency if needed, or skip
                 results.push({
                    gapRange: r,
                    direction: dir,
                    fillRate: 0,
                    avgFillTime: "-",
                    sampleSize: 0,
                    avgReturn: 0
                });
            }
        }
    }

    return results;

  } catch (e) {
    console.error("Gap data error", e);
    return [];
  }
}

export async function getSessionPhases(ticker: string): Promise<SessionPhase[]> {
    // Return static definitions with maybe dynamic vol/range from recent data
    // For prototype, reusing the static definitions is fine as the "phases" are conceptual
    // but we could update volume/range numbers
    const meta = await getStockMeta(ticker);
    const avgVol = meta?.avgVolume || 1000000;

    return [
        {
          name: "Opening Drive",
          timeRange: "9:30 - 10:00 AM",
          description: "High-energy opening with institutional order flow. Gaps set the tone.",
          trendProb: 0.65,
          reversalProb: 0.25,
          avgVolume: avgVol * 0.25 / 1000000, // 25% of daily vol in millions
          avgRange: 2.5,
          bestStrategy: "Momentum / Gap Fade",
          color: "#3b82f6",
        },
        // ... others
        {
          name: "Mid-Morning",
          timeRange: "10:00 - 11:30 AM",
          description: "Trend continuation or first reversal. Key decision zone for the day's direction.",
          trendProb: 0.55,
          reversalProb: 0.30,
          avgVolume: avgVol * 0.20 / 1000000,
          avgRange: 2.0,
          bestStrategy: "Trend Following / Pullback",
          color: "#22c55e",
        },
        {
          name: "Lunch Chop",
          timeRange: "11:30 AM - 1:30 PM",
          description: "Low volume, choppy price action. Algos dominate. Danger zone for overtrading.",
          trendProb: 0.20,
          reversalProb: 0.55,
          avgVolume: avgVol * 0.15 / 1000000,
          avgRange: 1.0,
          bestStrategy: "Sit Out / Mean Reversion Only",
          color: "#f59e0b",
        },
        {
          name: "Afternoon Push",
          timeRange: "1:30 - 3:00 PM",
          description: "Volume returns as institutions position for the close. Strong directional moves.",
          trendProb: 0.50,
          reversalProb: 0.32,
          avgVolume: avgVol * 0.20 / 1000000,
          avgRange: 1.8,
          bestStrategy: "Breakout / Trend Continuation",
          color: "#a855f7",
        },
        {
          name: "Close Auction",
          timeRange: "3:00 - 4:00 PM",
          description: "MOC orders and rebalancing.",
          trendProb: 0.60,
          reversalProb: 0.30,
          avgVolume: avgVol * 0.20 / 1000000,
          avgRange: 2.0,
          bestStrategy: "MOC Flow",
          color: "#06b6d4",
        }
    ];
}

export async function getDayOfWeekData(ticker: string): Promise<DayOfWeekStat[]> {
  try {
    const period1 = getLast6MonthsDate();
    const history = await yf.historical(ticker, { period1, interval: '1d' });
    
    // Group by Day (0=Sun, 1=Mon, ..., 5=Fri)
    const daysStats = new Map<number, { returns: number[], ranges: number[], volumes: number[] }>();
    
    // Initialize map
    for(let i=1; i<=5; i++) daysStats.set(i, { returns: [], ranges: [], volumes: [] });

    history.forEach((day: any) => {
        const d = day.date.getDay();
        if (d >= 1 && d <= 5) { // Mon-Fri
            const ret = (day.close - day.open) / day.open;
            const range = (day.high - day.low) / day.open * 100; // range as %
            const vol = day.volume;

            daysStats.get(d)?.returns.push(ret);
            daysStats.get(d)?.ranges.push(range);
            daysStats.get(d)?.volumes.push(vol);
        }
    });

    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const sessions = ["Opening Drive", "Mid-Morning", "Afternoon Push", "Close Auction"]; // placeholder for best session

    const results: DayOfWeekStat[] = [];
    for(let i=1; i<=5; i++) {
        const stats = daysStats.get(i)!;
        const count = stats.returns.length;
        if (count === 0) continue;

        const avgReturn = stats.returns.reduce((a,b)=>a+b,0) / count;
        const avgRange = stats.ranges.reduce((a,b)=>a+b,0) / count;
        const avgVolume = stats.volumes.reduce((a,b)=>a+b,0) / count;
        
        // Simple heuristic for trend prob: % of days with return > 0.2% or < -0.2% (directional)
        const trendDays = stats.returns.filter(r => Math.abs(r) > 0.002).length;
        const trendProb = trendDays / count;

        results.push({
            day: dayNames[i],
            avgReturn: parseFloat(avgReturn.toFixed(4)),
            avgRange: parseFloat(avgRange.toFixed(2)),
            avgVolume: Math.round(avgVolume),
            trendProb: parseFloat(trendProb.toFixed(2)),
            gapFrequency: 0.3, // placeholder or calc from gaps logic
            bestSession: sessions[i % sessions.length] // randomized placeholder
        });
    }

    return results;

  } catch (e) {
    console.error("DoW error", e);
    return [];
  }
}

export async function getIBData(ticker: string): Promise<IBStat> {
  try {
      // Best effort: Get 60 days of 30m data.
      // Yahoo allows ~60d of intraday for some intervals. 
      // period1 = 60 days ago
      const period1 = new Date();
      period1.setDate(period1.getDate() - 59);
      
      const result = await yf.chart(ticker, { interval: '30m', period1: period1 });
      if (!result || !result.quotes || result.quotes.length === 0) throw new Error("No data");

      let breakUp = 0;
      let breakDown = 0;
      let hold = 0;
      let upExtSum = 0;
      let downExtSum = 0;
      let ibRangeSum = 0;
      let daysCount = 0;

      // Group quotes by Date string (YYYY-MM-DD)
      const daysMap = new Map<string, any[]>();
      result.quotes.forEach((q: any) => {
          const dateStr = q.date.toISOString().split('T')[0];
          if (!daysMap.has(dateStr)) daysMap.set(dateStr, []);
          daysMap.get(dateStr)!.push(q);
      });

      daysMap.forEach((quotes, dateStr) => {
          // Sort by time
          quotes.sort((a,b) => a.date.getTime() - b.date.getTime());
          
          // Need at least 2 candles (IB + rest)
          if (quotes.length < 2) return;

          // First candle is approx IB (9:30-10:00)
          // Note: Yahoo 30m candles are [9:30, 10:00, ...].
          const ibCandle = quotes[0];
          const ibHigh = ibCandle.high;
          const ibLow = ibCandle.low;
          const ibRange = ibHigh - ibLow;

          let dayHigh = ibHigh;
          let dayLow = ibLow;

          // Check rest of the day
          for(let i=1; i<quotes.length; i++) {
              if (quotes[i].high > dayHigh) dayHigh = quotes[i].high;
              if (quotes[i].low < dayLow) dayLow = quotes[i].low;
          }

          const brokeUp = dayHigh > ibHigh;
          const brokeDown = dayLow < ibLow;

          if (brokeUp && brokeDown) {
              // Both broke? classify by which broke more or close?
              // Simple: classify as volatile/both.
              // For stats, count as break up if close > open?
              // Let's count as hold if it closed inside? No.
              // Let's split 0.5
              breakUp += 0.5;
              breakDown += 0.5;
          } else if (brokeUp) {
              breakUp++;
              upExtSum += (dayHigh - ibHigh);
          } else if (brokeDown) {
              breakDown++;
              downExtSum += (ibLow - dayLow);
          } else {
              hold++;
          }

          ibRangeSum += ibRange;
          daysCount++;
      });

      if (daysCount === 0) throw new Error("No valid days");

      return {
        ticker,
        ibBreakUpProb: parseFloat((breakUp / daysCount).toFixed(2)),
        ibBreakDownProb: parseFloat((breakDown / daysCount).toFixed(2)),
        ibHoldProb: parseFloat((hold / daysCount).toFixed(2)),
        avgUpExtension: parseFloat((upExtSum / (breakUp || 1)).toFixed(2)),
        avgDownExtension: parseFloat((downExtSum / (breakDown || 1)).toFixed(2)),
        avgIBRange: parseFloat((ibRangeSum / daysCount).toFixed(2)),
        sampleSize: daysCount
      };

  } catch (e) {
      console.error("IB Data Error", e);
      // Fallback
      return {
        ticker,
        ibBreakUpProb: 0.4,
        ibBreakDownProb: 0.4,
        ibHoldProb: 0.2,
        avgUpExtension: 1.5,
        avgDownExtension: 1.5,
        avgIBRange: 2.0,
        sampleSize: 0
      };
  }
}

export async function getMarketRegime(): Promise<MarketRegime> {
  try {
    const vix = await yf.quote('^VIX');
    const spy = await yf.quote('SPY');
    
    // Simple logic
    const vixLevel = vix.regularMarketPrice || 15;
    let regime: "trending" | "ranging" | "volatile" = "ranging";
    
    if (vixLevel > 20) regime = "volatile";
    else if (vixLevel < 13) regime = "trending";
    
    return {
      regime,
      confidence: 0.75, // placeholder
      vixLevel,
      vixTrend: vix.regularMarketChangePercent! > 0 ? "rising" : "falling",
      breadthScore: 60,
      atrPercentile: 50,
      trendWinRate: 0.5,
      meanReversionWinRate: 0.5,
      description: `VIX is at ${vixLevel}. Market is ${regime}.`
    };
  } catch (e) {
    return {
        regime: "ranging",
        confidence: 0,
        vixLevel: 0,
        vixTrend: "stable",
        breadthScore: 50,
        atrPercentile: 50,
        trendWinRate: 0.5,
        meanReversionWinRate: 0.5,
        description: "Data unavailable"
    };
  }
}

export async function getOptimalWindows(tickers: string[]): Promise<{ ticker: string; windows: { start: string; end: string; score: number }[] }[]> {
    // Simplified: return random or calc from ToD
    // Since this is heavy (N calls), we might just return placeholders for the list
    // or limit to top 3 tickers
    const sliced = tickers.slice(0, 3);
    const results = [];
    for (const t of sliced) {
        const tod = await getTimeOfDayData(t);
        // Find best slots
        const sorted = tod.sort((a,b) => b.avgRange - a.avgRange).slice(0, 3);
        results.push({
            ticker: t,
            windows: sorted.map(s => ({ start: s.time, end: "Unknown", score: 0.9 }))
        });
    }
    return results;
}
