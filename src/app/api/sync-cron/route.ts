import { NextResponse } from 'next/server';

export const maxDuration = 60; 

// Full list of ~400 tickers
const ALL_TICKERS = [
  // --- TECHNOLOGY ---
  "AAPL", "MSFT", "NVDA", "AMD", "GOOGL", "GOOG", "META", "CRM", "ADBE", "INTC", 
  "CSCO", "ORCL", "QCOM", "TXN", "AVGO", "IBM", "NOW", "AMAT", "MU", "ADI", 
  "LRCX", "KLAC", "SNPS", "CDNS", "ROP", "NXPI", "APH", "TEL", "HPQ", "GLW", 
  "MSI", "HPE", "IT", "DELL", "ANET", "KEYS", "FTNT", "NET", "PANW", "CRWD", 
  "ZS", "DDOG", "PLTR", "SNOW", "ZM", "DOCU", "TWLO", "OKTA", "MDB", "TEAM", 
  "WDAY", "ZS", "U", "AI", "SMCI", "ARM", "CART", "PATH", "IOT", "GTLB",
  
  // --- CONSUMER DISCRETIONARY ---
  "AMZN", "TSLA", "HD", "MCD", "NKE", "SBUX", "DIS", "TGT", "LOW", "TJX", 
  "BKNG", "MAR", "HLT", "CMG", "YUM", "DRI", "DPZ", "LULU", "ROST", "ORLY", 
  "AZO", "TSCO", "ULTA", "BBY", "KMX", "EBAY", "ETSY", "ABNB", "UBER", "LYFT", 
  "DASH", "RIVN", "LCID", "F", "GM", "STLA", "TM", "HMC", "HOG", "CCL", 
  "RCL", "NCLH", "MGM", "LVS", "WYNN", "CZR", "DKNG", "PENN", "EXPE", "TRIP",

  // --- CONSUMER STAPLES ---
  "WMT", "COST", "PG", "KO", "PEP", "PM", "MO", "CL", "EL", "KMB", 
  "GIS", "K", "MDLZ", "HSY", "STZ", "TAP", "BF.B", "MNST", "CELH", "TSN", 
  "HRL", "CAG", "CPB", "SJM", "MKC", "CHD", "CLX", "SYY", "KR", "DG", 
  "DLTR", "WBA", "TATE", "ADM", "BG",

  // --- FINANCIALS ---
  "JPM", "BAC", "V", "MA", "GS", "MS", "WFC", "C", "BLK", "SCHW", 
  "AXP", "SPGI", "MCO", "CME", "ICE", "MMC", "AON", "AJG", "PGR", "TRV", 
  "CB", "ALL", "HIG", "MET", "PRU", "AIG", "COF", "DFS", "SYF", "USB", 
  "PNC", "TFC", "BK", "STT", "NTRS", "FITB", "KEY", "RF", "HBAN", "CFG", 
  "SOFI", "HOOD", "COIN", "PYPL", "AFRM", "UPST",

  // --- HEALTHCARE ---
  "LLY", "JNJ", "UNH", "PFE", "MRK", "ABBV", "TMO", "ABT", "DHR", "BMY", 
  "AMGN", "GILD", "ISRG", "SYK", "ELV", "CVS", "CI", "HUM", "MCK", "COR", 
  "CNC", "HCA", "REGN", "VRTX", "BIIB", "MRNA", "BNTX", "DXCM", "EW", "ZBH", 
  "BSX", "BAX", "BDX", "RMD", "IDXX", "A", "MTD", "WAT", "ILMN", "ALGN",

  // --- INDUSTRIALS ---
  "CAT", "BA", "GE", "UPS", "HON", "UNP", "LMT", "RTX", "DE", "MMM", 
  "ETN", "ITW", "EMR", "PH", "CMI", "PCAR", "GWW", "FAST", "URI", "PWR", 
  "JCI", "CARR", "OTIS", "ADP", "PAYX", "CTAS", "EFX", "VRSK", "CSX", "NSC", 
  "FDX", "ODFL", "DAL", "UAL", "AAL", "LUV", "ALK", "NOC", "GD", "LHX",

  // --- ENERGY ---
  "XOM", "CVX", "COP", "SLB", "EOG", "MPC", "PSX", "VLO", "OXY", "HES", 
  "KMI", "WMB", "OKE", "TRGP", "HAL", "BKR", "DVN", "FANG", "MRO", "CTRA", 
  "EQT", "APA", "CHK",

  // --- MATERIALS ---
  "LIN", "SHW", "FCX", "SCCO", "NEM", "APD", "ECL", "DD", "DOW", "PPG", 
  "VMC", "MLM", "NUE", "STLD", "CLF", "X", "AA", "ALB", "FMC", "MOS",

  // --- REAL ESTATE ---
  "PLD", "AMT", "CCI", "EQIX", "DLR", "PSA", "O", "SPG", "WELL", "VTR", 
  "AVB", "EQR", "MAA", "ESS", "ARE", "BXP", "VICI", "GLPI", "CBRE", "CSGP",

  // --- UTILITIES ---
  "NEE", "DUK", "SO", "AEP", "SRE", "D", "PEG", "EXC", "XEL", "ED", 
  "EIX", "WEC", "ES", "DTE", "FE", "PPL", "AEE", "CMS", "CNP", "NRG",

  // --- ETFs ---
  "SPY", "QQQ", "IWM", "DIA", "TLT", "GLD", "SLV", "USO", "UNG", "XLE", 
  "XLF", "XLK", "XLV", "XLY", "XLP", "XLI", "XLU", "XLB", "XLRE", "XLC", 
  "SMH", "SOXX", "XBI", "IBB", "KRE", "KBE", "JETS", "ARKK", "TQQQ", "SQQQ", 
  "SPXU", "UPRO", "UVXY", "VXX", "HYG", "LQD", "BND", "AGG", "EEM", "EFA"
];

// Dedup tickers
const UNIQUE_TICKERS = [...new Set(ALL_TICKERS)];

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const batchIndex = parseInt(searchParams.get('batch') || '0', 10);
  const BATCH_SIZE = 50;

  const start = batchIndex * BATCH_SIZE;
  const end = start + BATCH_SIZE;
  
  if (start >= UNIQUE_TICKERS.length) {
      return NextResponse.json({ message: "Batch index out of range", processed: 0 });
  }

  const batch = UNIQUE_TICKERS.slice(start, end);
  console.log(`[Cron] Syncing Batch ${batchIndex} (${start}-${end}): ${batch.length} tickers`);

  const results = [];
  const CONCURRENCY = 5; 

  // We hit our own sync API to do the heavy lifting per ticker
  const baseUrl = process.env.NEXT_PUBLIC_VERCEL_URL 
      ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}` 
      : 'http://localhost:3000';

  for (let i = 0; i < batch.length; i += CONCURRENCY) {
      const chunk = batch.slice(i, i + CONCURRENCY);
      const promises = chunk.map(ticker => 
          fetch(`${baseUrl}/api/sync`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ticker })
          }).then(res => ({ ticker, status: res.status }))
      );
      
      results.push(...await Promise.all(promises));
      // Brief pause
      await new Promise(r => setTimeout(r, 500));
  }

  return NextResponse.json({ 
      success: true, 
      batch: batchIndex, 
      count: results.length,
      results 
  });
}
