const tickers = [
  // Technology (Major)
  "AAPL", "MSFT", "NVDA", "AMD", "GOOGL", "META", "CRM", "ADBE", "INTC", "CSCO",
  // Technology (Growth/High Beta)
  "PLTR", "UBER", "ABNB", "SNOW", "PANW", "CRWD", "SQ", "COIN", "MARA", "SMCI",
  // Consumer Discretionary
  "AMZN", "TSLA", "HD", "MCD", "NKE", "SBUX", "DIS", "TGT", "LULU", "RIVN",
  // Consumer Staples
  "WMT", "COST", "PG", "KO", "PEP",
  // Financials
  "JPM", "BAC", "V", "MA", "GS", "MS", "BLK", "SOFI",
  // Healthcare
  "LLY", "JNJ", "UNH", "PFE", "MRK",
  // Industrials
  "CAT", "BA", "GE", "UPS", "LMT",
  // Energy
  "XOM", "CVX", "OXY",
  // ETFs (Indices & Volatility)
  "SPY", "QQQ", "IWM", "DIA", "TLT",
];

async function syncTicker(ticker) {
  try {
    const response = await fetch('https://vortex-pulse.vercel.app/api/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ticker }),
    });
    
    if (response.ok) {
      console.log(`✅ Synced: ${ticker}`);
    } else {
      console.error(`❌ Failed: ${ticker} - ${response.status} ${response.statusText}`);
      const txt = await response.text();
      console.error("Error details:", txt);
    }
  } catch (error) {
    console.error(`❌ Error: ${ticker}`, error.message);
  }
}

async function run() {
  console.log(`Starting sync for ${tickers.length} tickers...`);
  
  // Run in chunks to avoid overwhelming the server endpoint
  const chunkSize = 5;
  for (let i = 0; i < tickers.length; i += chunkSize) {
    const chunk = tickers.slice(i, i + chunkSize);
    await Promise.all(chunk.map(syncTicker));
    console.log(`...processed ${Math.min(i + chunkSize, tickers.length)}/${tickers.length}`);
    // Brief pause to be nice to rate limits
    await new Promise(r => setTimeout(r, 1000));
  }
  
  console.log("Done!");
}

run();
