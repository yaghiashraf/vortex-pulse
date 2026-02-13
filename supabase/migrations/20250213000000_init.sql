-- Enable Extensions (if needed)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table: stock_candles
-- Stores daily Open, High, Low, Close, Volume data for each ticker.
-- This allows us to calculate Gap Fill stats, Seasonality, etc. without re-fetching Yahoo Finance.
CREATE TABLE IF NOT EXISTS public.stock_candles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticker TEXT NOT NULL,
    date DATE NOT NULL,
    open NUMERIC NOT NULL,
    high NUMERIC NOT NULL,
    low NUMERIC NOT NULL,
    close NUMERIC NOT NULL,
    volume BIGINT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(ticker, date) -- Ensure only one entry per ticker per day
);

-- Table: daily_stats (Calculated stats)
-- Stores calculated metrics like Gap Fill %, Seasonality for fast retrieval.
CREATE TABLE IF NOT EXISTS public.daily_stats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticker TEXT NOT NULL,
    stat_type TEXT NOT NULL, -- 'gap_fill', 'seasonality', 'ib_stats'
    data JSONB NOT NULL, -- Flexible JSON storage for the stats object
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(ticker, stat_type)
);

-- RLS Policies (Row Level Security)
-- Allow public read access to data
ALTER TABLE public.stock_candles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access" ON public.stock_candles FOR SELECT USING (true);

ALTER TABLE public.daily_stats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access" ON public.daily_stats FOR SELECT USING (true);

-- Only allow service_role (backend) to insert/update
-- (Implicitly denied for anon unless policy created)
