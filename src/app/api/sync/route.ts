import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase';
import { getGapFillData, getDayOfWeekData, getIBData, getStockList } from '@/lib/real-data';

// Add Service Role Key to your env for this to work
// POST /api/sync { "ticker": "SPY" }
export async function POST(req: NextRequest) {
  try {
    const { ticker } = await req.json();
    if (!ticker) return NextResponse.json({ error: "Ticker required" }, { status: 400 });

    const admin = getAdminClient(); // Will throw if no SERVICE_ROLE_KEY
    
    // 1. Fetch Stats from Yahoo Finance
    const [gaps, dow, ib] = await Promise.all([
      getGapFillData(ticker),
      getDayOfWeekData(ticker),
      getIBData(ticker)
    ]);

    // 2. Upsert into 'daily_stats' table
    // For Gaps
    const { error: gapErr } = await admin
      .from('daily_stats')
      .upsert({ 
        ticker, 
        stat_type: 'gap_fill', 
        data: gaps,
        updated_at: new Date()
      }, { onConflict: 'ticker, stat_type' });

    if (gapErr) throw gapErr;

    // For Day of Week
    const { error: dowErr } = await admin
      .from('daily_stats')
      .upsert({
        ticker,
        stat_type: 'seasonality',
        data: dow,
        updated_at: new Date()
      }, { onConflict: 'ticker, stat_type' });
      
    if (dowErr) throw dowErr;

    // For IB Stats
    const { error: ibErr } = await admin
      .from('daily_stats')
      .upsert({
        ticker,
        stat_type: 'ib_stats',
        data: ib,
        updated_at: new Date()
      }, { onConflict: 'ticker, stat_type' });

    if (ibErr) throw ibErr;

    return NextResponse.json({ success: true, ticker });
  } catch (e: any) {
    console.error("Sync Error:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
