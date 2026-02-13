const tickers = [
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

async function syncTicker(ticker, retryCount = 0) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

    const response = await fetch('https://vortex-pulse.vercel.app/api/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ticker }),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (response.ok) {
      console.log(`✅ Synced: ${ticker}`);
      return true;
    } else {
      if (response.status === 504 && retryCount < 2) {
         console.warn(`⚠️ Timeout for ${ticker}, retrying (${retryCount + 1}/2)...`);
         await new Promise(r => setTimeout(r, 2000));
         return syncTicker(ticker, retryCount + 1);
      }
      console.error(`❌ Failed: ${ticker} - ${response.status}`);
      return false;
    }
  } catch (error) {
    if (retryCount < 2) {
        console.warn(`⚠️ Error for ${ticker}, retrying (${retryCount + 1}/2)...`);
        await new Promise(r => setTimeout(r, 2000));
        return syncTicker(ticker, retryCount + 1);
    }
    console.error(`❌ Error: ${ticker}`, error.message);
    return false;
  }
}

async function run() {
  const uniqueTickers = [...new Set(tickers)]; // Dedup
  console.log(`Starting sync for ${uniqueTickers.length} tickers...`);
  
  // Parallelism limit (e.g. 10 concurrent requests)
  const CONCURRENCY = 8;
  const results = [];

  for (let i = 0; i < uniqueTickers.length; i += CONCURRENCY) {
    const chunk = uniqueTickers.slice(i, i + CONCURRENCY);
    console.log(`Processing chunk ${Math.floor(i/CONCURRENCY) + 1}/${Math.ceil(uniqueTickers.length/CONCURRENCY)} (${chunk.join(', ')})`);
    
    const chunkResults = await Promise.all(chunk.map(t => syncTicker(t)));
    results.push(...chunkResults);
    
    // Delay between chunks to respect rate limits
    await new Promise(r => setTimeout(r, 1500));
  }
  
  const successCount = results.filter(Boolean).length;
  console.log(`Done! Successfully synced ${successCount}/${uniqueTickers.length} tickers.`);
}

run();
