import yahooFinance from 'yahoo-finance2';
import {
  TimeSlot,
  GapFillResult,
  SessionPhase,
  DayOfWeekStat,
  IBStat,
  MarketRegime,
  StockMeta,
  IndexSnapshot,
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

// Full ~450 ticker universe (same as sync-cron)
const ALL_TICKERS = [
  // Technology
  "AAPL", "MSFT", "NVDA", "AMD", "GOOGL", "GOOG", "META", "CRM", "ADBE", "INTC",
  "CSCO", "ORCL", "QCOM", "TXN", "AVGO", "IBM", "NOW", "AMAT", "MU", "ADI",
  "LRCX", "KLAC", "SNPS", "CDNS", "ROP", "NXPI", "APH", "TEL", "HPQ", "GLW",
  "MSI", "HPE", "IT", "DELL", "ANET", "KEYS", "FTNT", "NET", "PANW", "CRWD",
  "ZS", "DDOG", "PLTR", "SNOW", "ZM", "DOCU", "TWLO", "OKTA", "MDB", "TEAM",
  "WDAY", "U", "AI", "SMCI", "ARM", "CART", "PATH", "IOT", "GTLB",
  // Consumer Discretionary
  "AMZN", "TSLA", "HD", "MCD", "NKE", "SBUX", "DIS", "TGT", "LOW", "TJX",
  "BKNG", "MAR", "HLT", "CMG", "YUM", "DRI", "DPZ", "LULU", "ROST", "ORLY",
  "AZO", "TSCO", "ULTA", "BBY", "KMX", "EBAY", "ETSY", "ABNB", "UBER", "LYFT",
  "DASH", "RIVN", "LCID", "F", "GM", "STLA", "TM", "HMC", "HOG", "CCL",
  "RCL", "NCLH", "MGM", "LVS", "WYNN", "CZR", "DKNG", "PENN", "EXPE", "TRIP",
  // Consumer Staples
  "WMT", "COST", "PG", "KO", "PEP", "PM", "MO", "CL", "EL", "KMB",
  "GIS", "K", "MDLZ", "HSY", "STZ", "TAP", "BF.B", "MNST", "CELH", "TSN",
  "HRL", "CAG", "CPB", "SJM", "MKC", "CHD", "CLX", "SYY", "KR", "DG",
  "DLTR", "WBA", "TATE", "ADM", "BG",
  // Financials
  "JPM", "BAC", "V", "MA", "GS", "MS", "WFC", "C", "BLK", "SCHW",
  "AXP", "SPGI", "MCO", "CME", "ICE", "MMC", "AON", "AJG", "PGR", "TRV",
  "CB", "ALL", "HIG", "MET", "PRU", "AIG", "COF", "DFS", "SYF", "USB",
  "PNC", "TFC", "BK", "STT", "NTRS", "FITB", "KEY", "RF", "HBAN", "CFG",
  "SOFI", "HOOD", "COIN", "PYPL", "AFRM", "UPST",
  // Healthcare
  "LLY", "JNJ", "UNH", "PFE", "MRK", "ABBV", "TMO", "ABT", "DHR", "BMY",
  "AMGN", "GILD", "ISRG", "SYK", "ELV", "CVS", "CI", "HUM", "MCK", "COR",
  "CNC", "HCA", "REGN", "VRTX", "BIIB", "MRNA", "BNTX", "DXCM", "EW", "ZBH",
  "BSX", "BAX", "BDX", "RMD", "IDXX", "A", "MTD", "WAT", "ILMN", "ALGN",
  // Industrials
  "CAT", "BA", "GE", "UPS", "HON", "UNP", "LMT", "RTX", "DE", "MMM",
  "ETN", "ITW", "EMR", "PH", "CMI", "PCAR", "GWW", "FAST", "URI", "PWR",
  "JCI", "CARR", "OTIS", "ADP", "PAYX", "CTAS", "EFX", "VRSK", "CSX", "NSC",
  "FDX", "ODFL", "DAL", "UAL", "AAL", "LUV", "ALK", "NOC", "GD", "LHX",
  // Energy
  "XOM", "CVX", "COP", "SLB", "EOG", "MPC", "PSX", "VLO", "OXY", "HES",
  "KMI", "WMB", "OKE", "TRGP", "HAL", "BKR", "DVN", "FANG", "MRO", "CTRA",
  "EQT", "APA", "CHK",
  // Materials
  "LIN", "SHW", "FCX", "SCCO", "NEM", "APD", "ECL", "DD", "DOW", "PPG",
  "VMC", "MLM", "NUE", "STLD", "CLF", "X", "AA", "ALB", "FMC", "MOS",
  // Real Estate
  "PLD", "AMT", "CCI", "EQIX", "DLR", "PSA", "O", "SPG", "WELL", "VTR",
  "AVB", "EQR", "MAA", "ESS", "ARE", "BXP", "VICI", "GLPI", "CBRE", "CSGP",
  // Utilities
  "NEE", "DUK", "SO", "AEP", "SRE", "D", "PEG", "EXC", "XEL", "ED",
  "EIX", "WEC", "ES", "DTE", "FE", "PPL", "AEE", "CMS", "CNP", "NRG",
  // ETFs
  "SPY", "QQQ", "IWM", "DIA", "TLT", "GLD", "SLV", "USO", "UNG", "XLE",
  "XLF", "XLK", "XLV", "XLY", "XLP", "XLI", "XLU", "XLB", "XLRE", "XLC",
  "SMH", "SOXX", "XBI", "IBB", "KRE", "KBE", "JETS", "ARKK", "TQQQ", "SQQQ",
  "SPXU", "UPRO", "UVXY", "VXX", "HYG", "LQD", "BND", "AGG", "EEM", "EFA",
  // Popular/Meme/Crypto-adjacent
  "NFLX", "MARA", "RIOT",
];

const UNIQUE_TICKERS = [...new Set(ALL_TICKERS)];

// Top 20 for dashboard optimal windows (most liquid)
const TOP_TICKERS = [
  "AAPL", "TSLA", "NVDA", "AMD", "AMZN", "META", "MSFT", "GOOGL", "SPY", "QQQ",
  "NFLX", "JPM", "BA", "COIN", "PLTR", "SOFI", "SMCI", "ARM", "MARA", "RIVN"
];

// Static sector map for all tickers
const SECTOR_MAP: Record<string, string> = {
  // Technology
  AAPL: "Technology", MSFT: "Technology", NVDA: "Technology", AMD: "Technology",
  GOOGL: "Technology", GOOG: "Technology", META: "Technology", CRM: "Technology",
  ADBE: "Technology", INTC: "Technology", CSCO: "Technology", ORCL: "Technology",
  QCOM: "Technology", TXN: "Technology", AVGO: "Technology", IBM: "Technology",
  NOW: "Technology", AMAT: "Technology", MU: "Technology", ADI: "Technology",
  LRCX: "Technology", KLAC: "Technology", SNPS: "Technology", CDNS: "Technology",
  ROP: "Technology", NXPI: "Technology", APH: "Technology", TEL: "Technology",
  HPQ: "Technology", GLW: "Technology", MSI: "Technology", HPE: "Technology",
  IT: "Technology", DELL: "Technology", ANET: "Technology", KEYS: "Technology",
  FTNT: "Technology", NET: "Technology", PANW: "Technology", CRWD: "Technology",
  ZS: "Technology", DDOG: "Technology", PLTR: "Technology", SNOW: "Technology",
  ZM: "Technology", DOCU: "Technology", TWLO: "Technology", OKTA: "Technology",
  MDB: "Technology", TEAM: "Technology", WDAY: "Technology", U: "Technology",
  AI: "Technology", SMCI: "Technology", ARM: "Technology", CART: "Technology",
  PATH: "Technology", IOT: "Technology", GTLB: "Technology", NFLX: "Technology",
  MARA: "Technology", RIOT: "Technology",
  // Consumer Discretionary
  AMZN: "Consumer Disc.", TSLA: "Consumer Disc.", HD: "Consumer Disc.",
  MCD: "Consumer Disc.", NKE: "Consumer Disc.", SBUX: "Consumer Disc.",
  DIS: "Consumer Disc.", TGT: "Consumer Disc.", LOW: "Consumer Disc.",
  TJX: "Consumer Disc.", BKNG: "Consumer Disc.", MAR: "Consumer Disc.",
  HLT: "Consumer Disc.", CMG: "Consumer Disc.", YUM: "Consumer Disc.",
  DRI: "Consumer Disc.", DPZ: "Consumer Disc.", LULU: "Consumer Disc.",
  ROST: "Consumer Disc.", ORLY: "Consumer Disc.", AZO: "Consumer Disc.",
  TSCO: "Consumer Disc.", ULTA: "Consumer Disc.", BBY: "Consumer Disc.",
  KMX: "Consumer Disc.", EBAY: "Consumer Disc.", ETSY: "Consumer Disc.",
  ABNB: "Consumer Disc.", UBER: "Consumer Disc.", LYFT: "Consumer Disc.",
  DASH: "Consumer Disc.", RIVN: "Consumer Disc.", LCID: "Consumer Disc.",
  F: "Consumer Disc.", GM: "Consumer Disc.", STLA: "Consumer Disc.",
  TM: "Consumer Disc.", HMC: "Consumer Disc.", HOG: "Consumer Disc.",
  CCL: "Consumer Disc.", RCL: "Consumer Disc.", NCLH: "Consumer Disc.",
  MGM: "Consumer Disc.", LVS: "Consumer Disc.", WYNN: "Consumer Disc.",
  CZR: "Consumer Disc.", DKNG: "Consumer Disc.", PENN: "Consumer Disc.",
  EXPE: "Consumer Disc.", TRIP: "Consumer Disc.",
  // Consumer Staples
  WMT: "Consumer Staples", COST: "Consumer Staples", PG: "Consumer Staples",
  KO: "Consumer Staples", PEP: "Consumer Staples", PM: "Consumer Staples",
  MO: "Consumer Staples", CL: "Consumer Staples", EL: "Consumer Staples",
  KMB: "Consumer Staples", GIS: "Consumer Staples", K: "Consumer Staples",
  MDLZ: "Consumer Staples", HSY: "Consumer Staples", STZ: "Consumer Staples",
  TAP: "Consumer Staples", "BF.B": "Consumer Staples", MNST: "Consumer Staples",
  CELH: "Consumer Staples", TSN: "Consumer Staples", HRL: "Consumer Staples",
  CAG: "Consumer Staples", CPB: "Consumer Staples", SJM: "Consumer Staples",
  MKC: "Consumer Staples", CHD: "Consumer Staples", CLX: "Consumer Staples",
  SYY: "Consumer Staples", KR: "Consumer Staples", DG: "Consumer Staples",
  DLTR: "Consumer Staples", WBA: "Consumer Staples", TATE: "Consumer Staples",
  ADM: "Consumer Staples", BG: "Consumer Staples",
  // Financials
  JPM: "Financials", BAC: "Financials", V: "Financials", MA: "Financials",
  GS: "Financials", MS: "Financials", WFC: "Financials", C: "Financials",
  BLK: "Financials", SCHW: "Financials", AXP: "Financials", SPGI: "Financials",
  MCO: "Financials", CME: "Financials", ICE: "Financials", MMC: "Financials",
  AON: "Financials", AJG: "Financials", PGR: "Financials", TRV: "Financials",
  CB: "Financials", ALL: "Financials", HIG: "Financials", MET: "Financials",
  PRU: "Financials", AIG: "Financials", COF: "Financials", DFS: "Financials",
  SYF: "Financials", USB: "Financials", PNC: "Financials", TFC: "Financials",
  BK: "Financials", STT: "Financials", NTRS: "Financials", FITB: "Financials",
  KEY: "Financials", RF: "Financials", HBAN: "Financials", CFG: "Financials",
  SOFI: "Financials", HOOD: "Financials", COIN: "Financials", PYPL: "Financials",
  AFRM: "Financials", UPST: "Financials",
  // Healthcare
  LLY: "Healthcare", JNJ: "Healthcare", UNH: "Healthcare", PFE: "Healthcare",
  MRK: "Healthcare", ABBV: "Healthcare", TMO: "Healthcare", ABT: "Healthcare",
  DHR: "Healthcare", BMY: "Healthcare", AMGN: "Healthcare", GILD: "Healthcare",
  ISRG: "Healthcare", SYK: "Healthcare", ELV: "Healthcare", CVS: "Healthcare",
  CI: "Healthcare", HUM: "Healthcare", MCK: "Healthcare", COR: "Healthcare",
  CNC: "Healthcare", HCA: "Healthcare", REGN: "Healthcare", VRTX: "Healthcare",
  BIIB: "Healthcare", MRNA: "Healthcare", BNTX: "Healthcare", DXCM: "Healthcare",
  EW: "Healthcare", ZBH: "Healthcare", BSX: "Healthcare", BAX: "Healthcare",
  BDX: "Healthcare", RMD: "Healthcare", IDXX: "Healthcare", A: "Healthcare",
  MTD: "Healthcare", WAT: "Healthcare", ILMN: "Healthcare", ALGN: "Healthcare",
  // Industrials
  CAT: "Industrials", BA: "Industrials", GE: "Industrials", UPS: "Industrials",
  HON: "Industrials", UNP: "Industrials", LMT: "Industrials", RTX: "Industrials",
  DE: "Industrials", MMM: "Industrials", ETN: "Industrials", ITW: "Industrials",
  EMR: "Industrials", PH: "Industrials", CMI: "Industrials", PCAR: "Industrials",
  GWW: "Industrials", FAST: "Industrials", URI: "Industrials", PWR: "Industrials",
  JCI: "Industrials", CARR: "Industrials", OTIS: "Industrials", ADP: "Industrials",
  PAYX: "Industrials", CTAS: "Industrials", EFX: "Industrials", VRSK: "Industrials",
  CSX: "Industrials", NSC: "Industrials", FDX: "Industrials", ODFL: "Industrials",
  DAL: "Industrials", UAL: "Industrials", AAL: "Industrials", LUV: "Industrials",
  ALK: "Industrials", NOC: "Industrials", GD: "Industrials", LHX: "Industrials",
  // Energy
  XOM: "Energy", CVX: "Energy", COP: "Energy", SLB: "Energy", EOG: "Energy",
  MPC: "Energy", PSX: "Energy", VLO: "Energy", OXY: "Energy", HES: "Energy",
  KMI: "Energy", WMB: "Energy", OKE: "Energy", TRGP: "Energy", HAL: "Energy",
  BKR: "Energy", DVN: "Energy", FANG: "Energy", MRO: "Energy", CTRA: "Energy",
  EQT: "Energy", APA: "Energy", CHK: "Energy",
  // Materials
  LIN: "Materials", SHW: "Materials", FCX: "Materials", SCCO: "Materials",
  NEM: "Materials", APD: "Materials", ECL: "Materials", DD: "Materials",
  DOW: "Materials", PPG: "Materials", VMC: "Materials", MLM: "Materials",
  NUE: "Materials", STLD: "Materials", CLF: "Materials", X: "Materials",
  AA: "Materials", ALB: "Materials", FMC: "Materials", MOS: "Materials",
  // Real Estate
  PLD: "Real Estate", AMT: "Real Estate", CCI: "Real Estate", EQIX: "Real Estate",
  DLR: "Real Estate", PSA: "Real Estate", O: "Real Estate", SPG: "Real Estate",
  WELL: "Real Estate", VTR: "Real Estate", AVB: "Real Estate", EQR: "Real Estate",
  MAA: "Real Estate", ESS: "Real Estate", ARE: "Real Estate", BXP: "Real Estate",
  VICI: "Real Estate", GLPI: "Real Estate", CBRE: "Real Estate", CSGP: "Real Estate",
  // Utilities
  NEE: "Utilities", DUK: "Utilities", SO: "Utilities", AEP: "Utilities",
  SRE: "Utilities", D: "Utilities", PEG: "Utilities", EXC: "Utilities",
  XEL: "Utilities", ED: "Utilities", EIX: "Utilities", WEC: "Utilities",
  ES: "Utilities", DTE: "Utilities", FE: "Utilities", PPL: "Utilities",
  AEE: "Utilities", CMS: "Utilities", CNP: "Utilities", NRG: "Utilities",
  // ETFs
  SPY: "ETF", QQQ: "ETF", IWM: "ETF", DIA: "ETF", TLT: "ETF",
  GLD: "ETF", SLV: "ETF", USO: "ETF", UNG: "ETF", XLE: "ETF",
  XLF: "ETF", XLK: "ETF", XLV: "ETF", XLY: "ETF", XLP: "ETF",
  XLI: "ETF", XLU: "ETF", XLB: "ETF", XLRE: "ETF", XLC: "ETF",
  SMH: "ETF", SOXX: "ETF", XBI: "ETF", IBB: "ETF", KRE: "ETF",
  KBE: "ETF", JETS: "ETF", ARKK: "ETF", TQQQ: "ETF", SQQQ: "ETF",
  SPXU: "ETF", UPRO: "ETF", UVXY: "ETF", VXX: "ETF", HYG: "ETF",
  LQD: "ETF", BND: "ETF", AGG: "ETF", EEM: "ETF", EFA: "ETF",
};

// Static ticker name map (avoids bulk Yahoo quote calls for 450 tickers)
const TICKER_NAMES: Record<string, string> = {
  AAPL: "Apple", MSFT: "Microsoft", NVDA: "NVIDIA", AMD: "AMD", GOOGL: "Alphabet",
  GOOG: "Alphabet C", META: "Meta Platforms", CRM: "Salesforce", ADBE: "Adobe",
  INTC: "Intel", CSCO: "Cisco", ORCL: "Oracle", QCOM: "Qualcomm", TXN: "Texas Instruments",
  AVGO: "Broadcom", IBM: "IBM", NOW: "ServiceNow", AMAT: "Applied Materials",
  MU: "Micron", ADI: "Analog Devices", LRCX: "Lam Research", KLAC: "KLA Corp",
  SNPS: "Synopsys", CDNS: "Cadence", ROP: "Roper Tech", NXPI: "NXP Semi",
  APH: "Amphenol", TEL: "TE Connectivity", HPQ: "HP Inc", GLW: "Corning",
  MSI: "Motorola Sol.", HPE: "HP Enterprise", IT: "Gartner", DELL: "Dell",
  ANET: "Arista Networks", KEYS: "Keysight", FTNT: "Fortinet", NET: "Cloudflare",
  PANW: "Palo Alto", CRWD: "CrowdStrike", ZS: "Zscaler", DDOG: "Datadog",
  PLTR: "Palantir", SNOW: "Snowflake", ZM: "Zoom", DOCU: "DocuSign",
  TWLO: "Twilio", OKTA: "Okta", MDB: "MongoDB", TEAM: "Atlassian",
  WDAY: "Workday", U: "Unity", AI: "C3.ai", SMCI: "Super Micro",
  ARM: "ARM Holdings", CART: "Instacart", PATH: "UiPath", IOT: "Samsara",
  GTLB: "GitLab", NFLX: "Netflix", MARA: "Marathon Digital", RIOT: "Riot Platforms",
  // Consumer Discretionary
  AMZN: "Amazon", TSLA: "Tesla", HD: "Home Depot", MCD: "McDonald's",
  NKE: "Nike", SBUX: "Starbucks", DIS: "Disney", TGT: "Target",
  LOW: "Lowe's", TJX: "TJX Companies", BKNG: "Booking", MAR: "Marriott",
  HLT: "Hilton", CMG: "Chipotle", YUM: "Yum! Brands", DRI: "Darden",
  DPZ: "Domino's", LULU: "Lululemon", ROST: "Ross Stores", ORLY: "O'Reilly Auto",
  AZO: "AutoZone", TSCO: "Tractor Supply", ULTA: "Ulta Beauty", BBY: "Best Buy",
  KMX: "CarMax", EBAY: "eBay", ETSY: "Etsy", ABNB: "Airbnb",
  UBER: "Uber", LYFT: "Lyft", DASH: "DoorDash", RIVN: "Rivian",
  LCID: "Lucid Group", F: "Ford", GM: "General Motors", STLA: "Stellantis",
  TM: "Toyota", HMC: "Honda", HOG: "Harley-Davidson", CCL: "Carnival",
  RCL: "Royal Caribbean", NCLH: "Norwegian Cruise", MGM: "MGM Resorts",
  LVS: "Las Vegas Sands", WYNN: "Wynn Resorts", CZR: "Caesars",
  DKNG: "DraftKings", PENN: "PENN Entertain.", EXPE: "Expedia", TRIP: "TripAdvisor",
  // Consumer Staples
  WMT: "Walmart", COST: "Costco", PG: "Procter & Gamble", KO: "Coca-Cola",
  PEP: "PepsiCo", PM: "Philip Morris", MO: "Altria", CL: "Colgate",
  EL: "Estee Lauder", KMB: "Kimberly-Clark", GIS: "General Mills", K: "Kellanova",
  MDLZ: "Mondelez", HSY: "Hershey", STZ: "Constellation", TAP: "Molson Coors",
  "BF.B": "Brown-Forman", MNST: "Monster Beverage", CELH: "Celsius",
  TSN: "Tyson Foods", HRL: "Hormel", CAG: "Conagra", CPB: "Campbell's",
  SJM: "J.M. Smucker", MKC: "McCormick", CHD: "Church & Dwight",
  CLX: "Clorox", SYY: "Sysco", KR: "Kroger", DG: "Dollar General",
  DLTR: "Dollar Tree", WBA: "Walgreens", TATE: "Tate & Lyle", ADM: "ADM", BG: "Bunge",
  // Financials
  JPM: "JPMorgan Chase", BAC: "Bank of America", V: "Visa", MA: "Mastercard",
  GS: "Goldman Sachs", MS: "Morgan Stanley", WFC: "Wells Fargo", C: "Citigroup",
  BLK: "BlackRock", SCHW: "Charles Schwab", AXP: "American Express",
  SPGI: "S&P Global", MCO: "Moody's", CME: "CME Group", ICE: "ICE",
  MMC: "Marsh & McLennan", AON: "Aon", AJG: "Arthur J. Gallagher",
  PGR: "Progressive", TRV: "Travelers", CB: "Chubb", ALL: "Allstate",
  HIG: "Hartford", MET: "MetLife", PRU: "Prudential", AIG: "AIG",
  COF: "Capital One", DFS: "Discover", SYF: "Synchrony", USB: "US Bancorp",
  PNC: "PNC Financial", TFC: "Truist", BK: "BNY Mellon", STT: "State Street",
  NTRS: "Northern Trust", FITB: "Fifth Third", KEY: "KeyCorp", RF: "Regions",
  HBAN: "Huntington", CFG: "Citizens", SOFI: "SoFi", HOOD: "Robinhood",
  COIN: "Coinbase", PYPL: "PayPal", AFRM: "Affirm", UPST: "Upstart",
  // Healthcare
  LLY: "Eli Lilly", JNJ: "Johnson & Johnson", UNH: "UnitedHealth",
  PFE: "Pfizer", MRK: "Merck", ABBV: "AbbVie", TMO: "Thermo Fisher",
  ABT: "Abbott", DHR: "Danaher", BMY: "Bristol-Myers", AMGN: "Amgen",
  GILD: "Gilead", ISRG: "Intuitive Surgical", SYK: "Stryker", ELV: "Elevance",
  CVS: "CVS Health", CI: "Cigna", HUM: "Humana", MCK: "McKesson",
  COR: "Cencora", CNC: "Centene", HCA: "HCA Healthcare", REGN: "Regeneron",
  VRTX: "Vertex", BIIB: "Biogen", MRNA: "Moderna", BNTX: "BioNTech",
  DXCM: "DexCom", EW: "Edwards Life", ZBH: "Zimmer Biomet", BSX: "Boston Sci.",
  BAX: "Baxter", BDX: "Becton Dickinson", RMD: "ResMed", IDXX: "IDEXX",
  A: "Agilent", MTD: "Mettler-Toledo", WAT: "Waters Corp", ILMN: "Illumina",
  ALGN: "Align Tech",
  // Industrials
  CAT: "Caterpillar", BA: "Boeing", GE: "GE Aerospace", UPS: "UPS",
  HON: "Honeywell", UNP: "Union Pacific", LMT: "Lockheed Martin", RTX: "RTX Corp",
  DE: "Deere & Co", MMM: "3M", ETN: "Eaton", ITW: "Illinois Tool Works",
  EMR: "Emerson", PH: "Parker-Hannifin", CMI: "Cummins", PCAR: "PACCAR",
  GWW: "Grainger", FAST: "Fastenal", URI: "United Rentals", PWR: "Quanta Services",
  JCI: "Johnson Controls", CARR: "Carrier", OTIS: "Otis Elevator", ADP: "ADP",
  PAYX: "Paychex", CTAS: "Cintas", EFX: "Equifax", VRSK: "Verisk",
  CSX: "CSX Corp", NSC: "Norfolk Southern", FDX: "FedEx", ODFL: "Old Dominion",
  DAL: "Delta Airlines", UAL: "United Airlines", AAL: "American Airlines",
  LUV: "Southwest", ALK: "Alaska Air", NOC: "Northrop Grumman",
  GD: "General Dynamics", LHX: "L3Harris",
  // Energy
  XOM: "ExxonMobil", CVX: "Chevron", COP: "ConocoPhillips", SLB: "Schlumberger",
  EOG: "EOG Resources", MPC: "Marathon Petroleum", PSX: "Phillips 66",
  VLO: "Valero", OXY: "Occidental", HES: "Hess", KMI: "Kinder Morgan",
  WMB: "Williams", OKE: "ONEOK", TRGP: "Targa Resources", HAL: "Halliburton",
  BKR: "Baker Hughes", DVN: "Devon Energy", FANG: "Diamondback", MRO: "Marathon Oil",
  CTRA: "Coterra", EQT: "EQT Corp", APA: "APA Corp", CHK: "Chesapeake",
  // Materials
  LIN: "Linde", SHW: "Sherwin-Williams", FCX: "Freeport-McMoRan", SCCO: "Southern Copper",
  NEM: "Newmont", APD: "Air Products", ECL: "Ecolab", DD: "DuPont",
  DOW: "Dow Inc", PPG: "PPG Industries", VMC: "Vulcan Materials", MLM: "Martin Marietta",
  NUE: "Nucor", STLD: "Steel Dynamics", CLF: "Cleveland-Cliffs", X: "U.S. Steel",
  AA: "Alcoa", ALB: "Albemarle", FMC: "FMC Corp", MOS: "Mosaic",
  // Real Estate
  PLD: "Prologis", AMT: "American Tower", CCI: "Crown Castle", EQIX: "Equinix",
  DLR: "Digital Realty", PSA: "Public Storage", O: "Realty Income", SPG: "Simon Property",
  WELL: "Welltower", VTR: "Ventas", AVB: "AvalonBay", EQR: "Equity Residential",
  MAA: "Mid-America Apt", ESS: "Essex Property", ARE: "Alexandria RE",
  BXP: "Boston Properties", VICI: "VICI Properties", GLPI: "Gaming & Leisure",
  CBRE: "CBRE Group", CSGP: "CoStar",
  // Utilities
  NEE: "NextEra Energy", DUK: "Duke Energy", SO: "Southern Co", AEP: "AEP",
  SRE: "Sempra", D: "Dominion Energy", PEG: "PSEG", EXC: "Exelon",
  XEL: "Xcel Energy", ED: "Con Edison", EIX: "Edison Intl", WEC: "WEC Energy",
  ES: "Eversource", DTE: "DTE Energy", FE: "FirstEnergy", PPL: "PPL Corp",
  AEE: "Ameren", CMS: "CMS Energy", CNP: "CenterPoint", NRG: "NRG Energy",
  // ETFs
  SPY: "S&P 500 ETF", QQQ: "Nasdaq 100 ETF", IWM: "Russell 2000 ETF",
  DIA: "Dow Jones ETF", TLT: "20+ Year Treasury", GLD: "Gold ETF",
  SLV: "Silver ETF", USO: "Oil ETF", UNG: "Natural Gas ETF", XLE: "Energy Select",
  XLF: "Financial Select", XLK: "Technology Select", XLV: "Health Care Select",
  XLY: "Consumer Disc. Select", XLP: "Consumer Staples Select",
  XLI: "Industrial Select", XLU: "Utilities Select", XLB: "Materials Select",
  XLRE: "Real Estate Select", XLC: "Communication Select",
  SMH: "Semiconductor ETF", SOXX: "iShares Semiconductor", XBI: "Biotech ETF",
  IBB: "iShares Biotech", KRE: "Regional Banks ETF", KBE: "Bank ETF",
  JETS: "Airlines ETF", ARKK: "ARK Innovation", TQQQ: "3x Nasdaq Bull",
  SQQQ: "3x Nasdaq Bear", SPXU: "3x S&P Bear", UPRO: "3x S&P Bull",
  UVXY: "1.5x VIX Short-Term", VXX: "VIX Short-Term",
  HYG: "High Yield Bond", LQD: "Investment Grade Bond",
  BND: "Total Bond Market", AGG: "Aggregate Bond", EEM: "Emerging Markets",
  EFA: "EAFE Intl",
};

/** Calculate 14-period ATR from historical daily data */
async function calcATR(ticker: string): Promise<number> {
  try {
    const period1 = new Date();
    period1.setDate(period1.getDate() - 30);
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

/**
 * Returns the full ~450 ticker universe as a static list.
 * No Yahoo Finance calls — just ticker, name, sector from static maps.
 * Individual pages call getStockMeta() for live price/ATR when needed.
 */
export async function getStockList(): Promise<StockMeta[]> {
  return UNIQUE_TICKERS.map(ticker => ({
    ticker,
    name: TICKER_NAMES[ticker] || ticker,
    sector: SECTOR_MAP[ticker] || "Other",
    avgVolume: 0,
    avgATR: 0,
    price: 0,
  }));
}

export async function getStockMeta(ticker: string): Promise<StockMeta | undefined> {
  try {
    const [q, atr] = await Promise.all([
      yf.quote(ticker),
      calcATR(ticker),
    ]);
    return {
      ticker: q.symbol,
      name: TICKER_NAMES[ticker] || q.shortName || q.longName || q.symbol,
      sector: SECTOR_MAP[q.symbol] || "Other",
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
    const period1 = new Date();
    period1.setDate(period1.getDate() - 5);
    const result = await yf.chart(ticker, { interval: '1m', period1: period1 });
    if (!result || !result.quotes) return [];

    const quotes = result.quotes;
    const slotsMap = new Map<string, { vol: number[], rangePct: number[], return: number[] }>();
    TIME_SLOTS.forEach(t => slotsMap.set(t, { vol: [], rangePct: [], return: [] }));

    quotes.forEach((q: any) => {
      if (!q.date) return;
      const timeStr = formatNYTime(new Date(q.date));
      const [h, m] = timeStr.split(':').map(Number);

      const slotM = m >= 30 ? 30 : 0;
      const slotTime = `${String(h).padStart(2, '0')}:${String(slotM).padStart(2, '0')}`;

      if (slotsMap.has(slotTime)) {
        const bucket = slotsMap.get(slotTime)!;
        bucket.vol.push(q.volume);
        const volPct = ((q.high - q.low) / q.open) * 100;
        bucket.rangePct.push(volPct);
        const retPct = ((q.close - q.open) / q.open);
        bucket.return.push(retPct);
      }
    });

    return TIME_SLOTS.map((time, i) => {
      const bucket = slotsMap.get(time);
      const count = bucket?.vol.length || 0;

      if (count === 0) {
        return {
          time, label: TIME_LABELS[i],
          avgVolume: 0, avgRange: 0, trendProb: 0.5, avgReturn: 0, volatility: 0
        };
      }

      const estimatedDays = Math.max(1, Math.round(count / 30));
      const totalVol = bucket!.vol.reduce((a, b) => a + b, 0);
      const avgVolume = Math.round(totalVol / estimatedDays);
      const avgVolPct = bucket!.rangePct.reduce((a, b) => a + b, 0) / count;
      const avg1mReturn = bucket!.return.reduce((a, b) => a + b, 0) / count;
      const avgReturn = parseFloat((avg1mReturn * 30).toFixed(4));
      const positiveCandles = bucket!.return.filter(r => r > 0).length;
      const trendProb = parseFloat((positiveCandles / count).toFixed(2));
      const avgRange = parseFloat((avgVolPct * 5).toFixed(2));

      return {
        time, label: TIME_LABELS[i],
        avgVolume, avgRange, trendProb, avgReturn,
        volatility: parseFloat(avgVolPct.toFixed(2)),
      };
    });

  } catch (e) {
    console.error("Error getting ToD data", e);
    return [];
  }
}

// Helper to get last N months date
function getLastNMonthsDate(n: number): Date {
  const d = new Date();
  d.setMonth(d.getMonth() - n);
  return d;
}

/**
 * Gap fill analysis using standard definition: open vs previous close.
 * 12-month lookback for larger sample sizes.
 */
export async function getGapFillData(ticker: string): Promise<GapFillResult[]> {
  try {
    const period1 = getLastNMonthsDate(12);
    const history = await yf.historical(ticker, { period1, interval: '1d' });

    if (history.length < 2) return [];

    const gaps: {
      range: string;
      direction: "up" | "down";
      filled: boolean;
      return: number;
    }[] = [];

    for (let i = 1; i < history.length; i++) {
      const today = history[i];
      const yesterday = history[i - 1];
      const prevClose = yesterday.close;

      // Gap Up: open > prev close by at least 0.1%
      if (today.open > prevClose * 1.001) {
        const gapSizePct = (today.open - prevClose) / prevClose * 100;
        // Fill check: did price retrace to prev close?
        const filled = today.low <= prevClose;

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
      // Gap Down: open < prev close by at least 0.1%
      else if (today.open < prevClose * 0.999) {
        const gapSizePct = (prevClose - today.open) / prevClose * 100;
        // Fill check: did price retrace up to prev close?
        const filled = today.high >= prevClose;

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
            avgFillTime: "Intraday",
            sampleSize: matches.length,
            avgReturn: parseFloat((avgRet * 100).toFixed(2))
          });
        } else {
          results.push({
            gapRange: r, direction: dir,
            fillRate: 0, avgFillTime: "-", sampleSize: 0, avgReturn: 0
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

/**
 * Session phases computed from real time-of-day data per ticker.
 * Aggregates 30-min slot stats into 5 trading phases.
 */
export async function getSessionPhases(ticker: string): Promise<SessionPhase[]> {
  const tod = await getTimeOfDayData(ticker);

  // Phase definitions: which TIME_SLOTS map to each phase
  const phaseConfig = [
    { name: "Opening Drive", timeRange: "9:30 - 10:00 AM", slots: ["09:30"], color: "#3b82f6", strategy: "Momentum / Gap Fade" },
    { name: "Mid-Morning", timeRange: "10:00 - 11:30 AM", slots: ["10:00", "10:30", "11:00"], color: "#22c55e", strategy: "Trend Following / Pullback" },
    { name: "Lunch Chop", timeRange: "11:30 AM - 1:30 PM", slots: ["11:30", "12:00", "12:30", "13:00"], color: "#f59e0b", strategy: "Sit Out / Mean Reversion Only" },
    { name: "Afternoon Push", timeRange: "1:30 - 3:00 PM", slots: ["13:30", "14:00", "14:30"], color: "#a855f7", strategy: "Breakout / Trend Continuation" },
    { name: "Close Auction", timeRange: "3:00 - 4:00 PM", slots: ["15:00", "15:30"], color: "#06b6d4", strategy: "MOC Flow" },
  ];

  const phases: SessionPhase[] = phaseConfig.map(cfg => {
    const matchingSlots = tod.filter(s => cfg.slots.includes(s.time));

    if (matchingSlots.length === 0) {
      return {
        name: cfg.name, timeRange: cfg.timeRange,
        description: `No data available for ${cfg.name}.`,
        trendProb: 0.5, reversalProb: 0.25,
        avgVolume: 0, avgRange: 0,
        bestStrategy: cfg.strategy, color: cfg.color,
      };
    }

    const totalCandles = matchingSlots.length;
    const avgTrendProb = matchingSlots.reduce((s, sl) => s + sl.trendProb, 0) / totalCandles;
    const avgVol = matchingSlots.reduce((s, sl) => s + sl.avgVolume, 0);
    const avgRange = matchingSlots.reduce((s, sl) => s + sl.avgRange, 0) / totalCandles;
    const avgVolatility = matchingSlots.reduce((s, sl) => s + sl.volatility, 0) / totalCandles;

    // reversalProb: slots where trend prob is below 0.45 are "choppy/reversal prone"
    const reversalProb = Math.max(0, Math.min(0.8, 1 - avgTrendProb - 0.15));

    // Generate description based on data
    let description: string;
    if (avgTrendProb > 0.55) {
      description = `Strong directional tendency with ${(avgTrendProb * 100).toFixed(0)}% trend probability. High-conviction setups thrive here.`;
    } else if (avgTrendProb < 0.45) {
      description = `Choppy conditions with only ${(avgTrendProb * 100).toFixed(0)}% trend probability. Avoid trend-following; mean reversion preferred.`;
    } else {
      description = `Neutral conditions with ${(avgTrendProb * 100).toFixed(0)}% trend probability. Wait for confirmation before committing.`;
    }

    return {
      name: cfg.name,
      timeRange: cfg.timeRange,
      description,
      trendProb: parseFloat(avgTrendProb.toFixed(2)),
      reversalProb: parseFloat(reversalProb.toFixed(2)),
      avgVolume: Math.round(avgVol / 1000000 * 100) / 100, // in millions
      avgRange: parseFloat(avgRange.toFixed(2)),
      bestStrategy: cfg.strategy,
      color: cfg.color,
    };
  });

  return phases;
}

/**
 * Day-of-week stats with real gap frequency, normalized volume, and meaningful bestSession.
 * 6-month lookback.
 */
export async function getDayOfWeekData(ticker: string): Promise<DayOfWeekStat[]> {
  try {
    const period1 = getLastNMonthsDate(6);
    const history = await yf.historical(ticker, { period1, interval: '1d' });

    // Group by Day (0=Sun, 1=Mon, ..., 5=Fri)
    const daysStats = new Map<number, { returns: number[], ranges: number[], volumes: number[], gapDays: number, totalDays: number }>();
    for (let i = 1; i <= 5; i++) daysStats.set(i, { returns: [], ranges: [], volumes: [], gapDays: 0, totalDays: 0 });

    for (let i = 0; i < history.length; i++) {
      const day = history[i];
      const d = new Date(day.date).getDay();
      if (d < 1 || d > 5) continue;

      const stats = daysStats.get(d)!;
      const ret = (day.close - day.open) / day.open;
      const range = (day.high - day.low) / day.open * 100;
      const vol = day.volume;

      stats.returns.push(ret);
      stats.ranges.push(range);
      stats.volumes.push(vol);
      stats.totalDays++;

      // Count gap days: open vs previous close differs by >0.1%
      if (i > 0) {
        const prevClose = history[i - 1].close;
        const gapPct = Math.abs(day.open - prevClose) / prevClose;
        if (gapPct > 0.001) stats.gapDays++;
      }
    }

    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    // Calculate overall avg volume for normalization
    let totalAvgVol = 0;
    let dayCount = 0;
    for (let i = 1; i <= 5; i++) {
      const stats = daysStats.get(i)!;
      if (stats.volumes.length > 0) {
        totalAvgVol += stats.volumes.reduce((a, b) => a + b, 0) / stats.volumes.length;
        dayCount++;
      }
    }
    const overallAvgVol = dayCount > 0 ? totalAvgVol / dayCount : 1;

    const results: DayOfWeekStat[] = [];
    for (let i = 1; i <= 5; i++) {
      const stats = daysStats.get(i)!;
      const count = stats.returns.length;
      if (count === 0) continue;

      const avgReturn = stats.returns.reduce((a, b) => a + b, 0) / count;
      const avgRange = stats.ranges.reduce((a, b) => a + b, 0) / count;
      const rawAvgVolume = stats.volumes.reduce((a, b) => a + b, 0) / count;
      // Normalize volume to % of weekly average
      const relativeVolume = Math.round((rawAvgVolume / overallAvgVol) * 100);

      const trendDays = stats.returns.filter(r => Math.abs(r) > 0.002).length;
      const trendProb = trendDays / count;

      const gapFrequency = stats.totalDays > 1 ? stats.gapDays / (stats.totalDays - 1) : 0;

      // bestSession heuristic based on day's character
      let bestSession: string;
      if (gapFrequency > 0.6) bestSession = "Opening Drive";
      else if (avgReturn > 0.001) bestSession = "Mid-Morning";
      else if (avgReturn < -0.001) bestSession = "Afternoon Push";
      else bestSession = "Close Auction";

      results.push({
        day: dayNames[i],
        avgReturn: parseFloat(avgReturn.toFixed(4)),
        avgRange: parseFloat(avgRange.toFixed(2)),
        avgVolume: relativeVolume,
        trendProb: parseFloat(trendProb.toFixed(2)),
        gapFrequency: parseFloat(gapFrequency.toFixed(2)),
        bestSession,
      });
    }

    return results;

  } catch (e) {
    console.error("DoW error", e);
    return [];
  }
}

/**
 * IB (Initial Balance) stats with market-hours filtering.
 * Filters to 09:30-16:00 ET to avoid pre-market candles.
 */
export async function getIBData(ticker: string): Promise<IBStat> {
  try {
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

    // Group quotes by Date string, filtering to market hours only
    const daysMap = new Map<string, any[]>();
    result.quotes.forEach((q: any) => {
      if (!q.date || q.high == null || q.low == null) return;
      const qDate = new Date(q.date);
      const timeStr = formatNYTime(qDate);
      if (!isMarketHours(timeStr)) return; // Skip pre/post market

      const dateStr = qDate.toISOString().split('T')[0];
      if (!daysMap.has(dateStr)) daysMap.set(dateStr, []);
      daysMap.get(dateStr)!.push(q);
    });

    daysMap.forEach((quotes) => {
      quotes.sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
      if (quotes.length < 2) return;

      // First market-hours candle is the IB (9:30-10:00)
      const ibCandle = quotes[0];
      const ibHigh = ibCandle.high;
      const ibLow = ibCandle.low;
      const ibRange = ibHigh - ibLow;
      if (ibRange <= 0) return;

      let dayHigh = ibHigh;
      let dayLow = ibLow;
      for (let i = 1; i < quotes.length; i++) {
        if (quotes[i].high > dayHigh) dayHigh = quotes[i].high;
        if (quotes[i].low < dayLow) dayLow = quotes[i].low;
      }

      const brokeUp = dayHigh > ibHigh;
      const brokeDown = dayLow < ibLow;

      if (brokeUp && brokeDown) {
        breakUp += 0.5;
        breakDown += 0.5;
        // Count extensions for both directions on dual-break days
        upExtSum += (dayHigh - ibHigh);
        downExtSum += (ibLow - dayLow);
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
    return {
      ticker,
      ibBreakUpProb: 0.4, ibBreakDownProb: 0.4, ibHoldProb: 0.2,
      avgUpExtension: 1.5, avgDownExtension: 1.5, avgIBRange: 2.0,
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

    let confidence: number;
    if (regime === "volatile") {
      confidence = Math.min(0.95, 0.6 + (vixLevel - 20) * 0.03);
    } else if (regime === "trending") {
      confidence = Math.min(0.95, 0.6 + (13 - vixLevel) * 0.05);
    } else {
      const midpoint = 16.5;
      const distFromMid = Math.abs(vixLevel - midpoint);
      confidence = Math.max(0.4, 0.75 - distFromMid * 0.05);
    }

    const spyChange = spy.regularMarketChangePercent || 0;
    const iwmChange = iwm.regularMarketChangePercent || 0;
    const divergence = Math.abs(spyChange - iwmChange);
    const bothPositive = spyChange > 0 && iwmChange > 0;
    const breadthScore = Math.round(
      bothPositive
        ? Math.min(85, 70 - divergence * 5)
        : Math.max(20, 50 - divergence * 5)
    );

    let trendWinRate: number;
    let meanReversionWinRate: number;
    if (regime === "trending") {
      trendWinRate = 0.65; meanReversionWinRate = 0.35;
    } else if (regime === "volatile") {
      trendWinRate = 0.40; meanReversionWinRate = 0.45;
    } else {
      trendWinRate = 0.45; meanReversionWinRate = 0.60;
    }

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
      regime: "ranging", confidence: 0, vixLevel: 0, vixTrend: "stable",
      breadthScore: 50, atrPercentile: 50, trendWinRate: 0.5, meanReversionWinRate: 0.5,
      description: "Data unavailable"
    };
  }
}

export async function getOptimalWindows(tickers: string[]): Promise<{ ticker: string; windows: { start: string; end: string; score: number }[] }[]> {
  const results = await Promise.all(
    tickers.map(async (t) => {
      const tod = await getTimeOfDayData(t);
      if (tod.length === 0) return { ticker: t, windows: [] };

      const maxRange = Math.max(...tod.map(s => s.avgRange)) || 1;
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

const INDEX_META: Record<string, string> = {
  SPY: "S&P 500",
  DIA: "Dow Jones",
  QQQ: "Nasdaq 100",
  IWM: "Russell 2000",
};

export async function getIndexSnapshot(): Promise<IndexSnapshot[]> {
  const tickers = ["SPY", "DIA", "QQQ", "IWM"];
  try {
    const quotes = await Promise.all(tickers.map((t) => yf.quote(t)));
    return quotes.map((q: any, i: number) => ({
      ticker: tickers[i],
      name: INDEX_META[tickers[i]],
      price: q.regularMarketPrice ?? 0,
      change: q.regularMarketChange ?? 0,
      changePercent: q.regularMarketChangePercent ?? 0,
    }));
  } catch {
    return tickers.map((t) => ({
      ticker: t,
      name: INDEX_META[t],
      price: 0,
      change: 0,
      changePercent: 0,
    }));
  }
}
