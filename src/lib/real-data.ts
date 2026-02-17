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

// yahoo-finance2 v3 requires instantiation
const yf = new (yahooFinance as any)();

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

const POPULAR_TICKERS = [
  "AAPL", "TSLA", "NVDA", "AMD", "AMZN", "META", "MSFT", "GOOGL", "SPY", "QQQ",
  "NFLX", "JPM", "BA", "COIN", "PLTR", "SOFI", "SMCI", "ARM", "MARA", "RIVN"
];

// Static sector map for known tickers (avoids extra API calls)
const SECTOR_MAP: Record<string, string> = {
  // Technology
  AAPL: "Technology", MSFT: "Technology", NVDA: "Technology", AMD: "Technology",
  GOOGL: "Technology", GOOG: "Technology", META: "Technology", CRM: "Technology",
  ADBE: "Technology", INTC: "Technology", CSCO: "Technology", ORCL: "Technology",
  QCOM: "Technology", TXN: "Technology", AVGO: "Technology", IBM: "Technology",
  NOW: "Technology", AMAT: "Technology", MU: "Technology", ADI: "Technology",
  LRCX: "Technology", KLAC: "Technology", SNPS: "Technology", CDNS: "Technology",
  NXPI: "Technology", HPQ: "Technology", GLW: "Technology", MSI: "Technology",
  HPE: "Technology", DELL: "Technology", ANET: "Technology", KEYS: "Technology",
  FTNT: "Technology", NET: "Technology", PANW: "Technology", CRWD: "Technology",
  ZS: "Technology", DDOG: "Technology", PLTR: "Technology", SNOW: "Technology",
  ZM: "Technology", DOCU: "Technology", TWLO: "Technology", OKTA: "Technology",
  MDB: "Technology", TEAM: "Technology", WDAY: "Technology", U: "Technology",
  AI: "Technology", SMCI: "Technology", ARM: "Technology", CART: "Technology",
  PATH: "Technology", IOT: "Technology", GTLB: "Technology",
  // Consumer Discretionary
  AMZN: "Consumer Discretionary", TSLA: "Consumer Discretionary", HD: "Consumer Discretionary",
  MCD: "Consumer Discretionary", NKE: "Consumer Discretionary", SBUX: "Consumer Discretionary",
  DIS: "Consumer Discretionary", TGT: "Consumer Discretionary", LOW: "Consumer Discretionary",
  TJX: "Consumer Discretionary", BKNG: "Consumer Discretionary", MAR: "Consumer Discretionary",
  HLT: "Consumer Discretionary", CMG: "Consumer Discretionary", YUM: "Consumer Discretionary",
  LULU: "Consumer Discretionary", ROST: "Consumer Discretionary", BBY: "Consumer Discretionary",
  EBAY: "Consumer Discretionary", ETSY: "Consumer Discretionary", ABNB: "Consumer Discretionary",
  UBER: "Consumer Discretionary", LYFT: "Consumer Discretionary", DASH: "Consumer Discretionary",
  RIVN: "Consumer Discretionary", LCID: "Consumer Discretionary", F: "Consumer Discretionary",
  GM: "Consumer Discretionary", DKNG: "Consumer Discretionary", NFLX: "Consumer Discretionary",
  // Consumer Staples
  WMT: "Consumer Staples", COST: "Consumer Staples", PG: "Consumer Staples",
  KO: "Consumer Staples", PEP: "Consumer Staples", PM: "Consumer Staples",
  MO: "Consumer Staples", CL: "Consumer Staples", MNST: "Consumer Staples",
  CELH: "Consumer Staples", KR: "Consumer Staples", DG: "Consumer Staples",
  // Financials
  JPM: "Financials", BAC: "Financials", V: "Financials", MA: "Financials",
  GS: "Financials", MS: "Financials", WFC: "Financials", C: "Financials",
  BLK: "Financials", SCHW: "Financials", AXP: "Financials", COF: "Financials",
  SOFI: "Financials", HOOD: "Financials", COIN: "Financials", PYPL: "Financials",
  AFRM: "Financials", UPST: "Financials",
  // Healthcare
  LLY: "Healthcare", JNJ: "Healthcare", UNH: "Healthcare", PFE: "Healthcare",
  MRK: "Healthcare", ABBV: "Healthcare", TMO: "Healthcare", ABT: "Healthcare",
  AMGN: "Healthcare", GILD: "Healthcare", ISRG: "Healthcare", MRNA: "Healthcare",
  BNTX: "Healthcare", DXCM: "Healthcare",
  // Industrials
  CAT: "Industrials", BA: "Industrials", GE: "Industrials", UPS: "Industrials",
  HON: "Industrials", DE: "Industrials", LMT: "Industrials", RTX: "Industrials",
  FDX: "Industrials", DAL: "Industrials", UAL: "Industrials",
  // Energy
  XOM: "Energy", CVX: "Energy", COP: "Energy", SLB: "Energy", OXY: "Energy",
  MPC: "Energy", PSX: "Energy", VLO: "Energy", HAL: "Energy",
  // Materials
  LIN: "Materials", SHW: "Materials", FCX: "Materials", NEM: "Materials",
  APD: "Materials", DD: "Materials", DOW: "Materials", NUE: "Materials",
  X: "Materials", AA: "Materials",
  // Real Estate
  PLD: "Real Estate", AMT: "Real Estate", CCI: "Real Estate", EQIX: "Real Estate",
  O: "Real Estate", SPG: "Real Estate",
  // Utilities
  NEE: "Utilities", DUK: "Utilities", SO: "Utilities", AEP: "Utilities",
  // Crypto-related
  MARA: "Technology",
  // ETFs
  SPY: "ETF", QQQ: "ETF", IWM: "ETF", DIA: "ETF", TLT: "ETF",
  GLD: "ETF", SLV: "ETF", XLE: "ETF", XLF: "ETF", XLK: "ETF",
  XLV: "ETF", XLY: "ETF", XLP: "ETF", XLI: "ETF", SMH: "ETF",
  SOXX: "ETF", ARKK: "ETF", TQQQ: "ETF", SQQQ: "ETF",
};

/** Calculate 14-period ATR from historical daily data */
async function calcATR(ticker: string): Promise<number> {
  try {
    const period1 = new Date();
    period1.setDate(period1.getDate() - 30); // fetch ~20 trading days
    const history = await yf.historical(ticker, { period1, interval: '1d' });
    if (!history || history.length < 2) return 0;

    const trueRanges: number[] = [];
    for (let i = 1; i < history.length; i++) {
      const h = history[i].high;
      const l = history[i].low;
      const prevC = history[i - 1].close;
      const tr = Math.max(h - l, Math.abs(h - prevC), Math.abs(l - prevC));
      trueRanges.push(tr);
    }

    // Use last 14 periods (or all available if fewer)
    const periods = Math.min(14, trueRanges.length);
    const recentTR = trueRanges.slice(-periods);
    return recentTR.reduce((sum, v) => sum + v, 0) / periods;
  } catch {
    return 0;
  }
}

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
    const quotes = await yf.quote(POPULAR_TICKERS);
    // Calculate ATR for all tickers in parallel
    const atrValues = await Promise.all(
      POPULAR_TICKERS.map(t => calcATR(t))
    );
    return quotes.map((q: any, i: number) => ({
      ticker: q.symbol,
      name: q.shortName || q.longName || q.symbol,
      sector: SECTOR_MAP[q.symbol] || "N/A",
      avgVolume: q.averageDailyVolume3Month || q.regularMarketVolume || 0,
      avgATR: parseFloat(atrValues[i].toFixed(2)),
      price: q.regularMarketPrice || 0,
    }));
  } catch (e) {
    console.error("Error fetching stock list:", e);
    return [];
  }
}

export async function getStockMeta(ticker: string): Promise<StockMeta | undefined> {
  try {
    const [q, atr] = await Promise.all([
      yf.quote(ticker),
      calcATR(ticker),
    ]);
    return {
      ticker: q.symbol,
      name: q.shortName || q.longName || q.symbol,
      sector: SECTOR_MAP[q.symbol] || "N/A",
      avgVolume: q.averageDailyVolume3Month || 0,
      avgATR: parseFloat(atr.toFixed(2)),
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
    const [vix, spy, iwm] = await Promise.all([
      yf.quote('^VIX'),
      yf.quote('SPY'),
      yf.quote('IWM'),
    ]);

    const vixLevel = vix.regularMarketPrice || 15;
    const vixChange = vix.regularMarketChangePercent || 0;
    let regime: "trending" | "ranging" | "volatile" = "ranging";

    if (vixLevel > 20) regime = "volatile";
    else if (vixLevel < 13) regime = "trending";

    // Confidence: how far VIX is from the 13-20 boundaries (closer = less confident)
    let confidence: number;
    if (regime === "volatile") {
      confidence = Math.min(0.95, 0.6 + (vixLevel - 20) * 0.03);
    } else if (regime === "trending") {
      confidence = Math.min(0.95, 0.6 + (13 - vixLevel) * 0.05);
    } else {
      // Ranging: confidence is lower near boundaries
      const midpoint = 16.5;
      const distFromMid = Math.abs(vixLevel - midpoint);
      confidence = Math.max(0.4, 0.75 - distFromMid * 0.05);
    }

    // Breadth score: compare SPY vs IWM performance (broad participation)
    const spyChange = spy.regularMarketChangePercent || 0;
    const iwmChange = iwm.regularMarketChangePercent || 0;
    // If both positive and close, breadth is high; divergence = lower breadth
    const divergence = Math.abs(spyChange - iwmChange);
    const bothPositive = spyChange > 0 && iwmChange > 0;
    const breadthScore = Math.round(
      bothPositive
        ? Math.min(85, 70 - divergence * 5)
        : Math.max(20, 50 - divergence * 5)
    );

    // Win rates based on regime
    let trendWinRate: number;
    let meanReversionWinRate: number;
    if (regime === "trending") {
      trendWinRate = 0.65;
      meanReversionWinRate = 0.35;
    } else if (regime === "volatile") {
      trendWinRate = 0.40;
      meanReversionWinRate = 0.45;
    } else {
      trendWinRate = 0.45;
      meanReversionWinRate = 0.60;
    }

    // Description
    const vixTrend = vixChange > 0.5 ? "rising" : vixChange < -0.5 ? "falling" : "stable";
    const descriptions: Record<string, string> = {
      trending: `VIX at ${vixLevel.toFixed(1)} signals low fear. Trend-following strategies favored. ${vixTrend === "rising" ? "Watch for regime shift as VIX rises." : "Calm conditions support directional moves."}`,
      ranging: `VIX at ${vixLevel.toFixed(1)} indicates a neutral market. Mean reversion setups have edge. ${breadthScore > 55 ? "Broad participation supports selective trend plays." : "Narrow breadth — stick to large caps."}`,
      volatile: `VIX at ${vixLevel.toFixed(1)} signals elevated fear. Reduce size, widen stops. ${vixTrend === "falling" ? "VIX declining — potential regime normalization ahead." : "Elevated volatility — focus on A+ setups only."}`,
    };

    return {
      regime,
      confidence: parseFloat(confidence.toFixed(2)),
      vixLevel,
      vixTrend: vixTrend as "rising" | "falling" | "stable",
      breadthScore,
      atrPercentile: 50,
      trendWinRate,
      meanReversionWinRate,
      description: descriptions[regime],
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
    // Process all tickers in parallel
    const results = await Promise.all(
        tickers.map(async (t) => {
            const tod = await getTimeOfDayData(t);
            if (tod.length === 0) return { ticker: t, windows: [] };

            const maxRange = Math.max(...tod.map(s => s.avgRange)) || 1;
            // Sort a copy to avoid mutating the original array
            const sorted = [...tod].sort((a, b) => b.avgRange - a.avgRange).slice(0, 3);

            return {
                ticker: t,
                windows: sorted.map(s => {
                    const idx = TIME_SLOTS.indexOf(s.time);
                    const end = idx >= 0 && idx < TIME_SLOTS.length - 1
                        ? TIME_SLOTS[idx + 1]
                        : "16:00";
                    return {
                        start: s.time,
                        end,
                        score: parseFloat((s.avgRange / maxRange).toFixed(2)),
                    };
                }),
            };
        })
    );
    return results;
}
