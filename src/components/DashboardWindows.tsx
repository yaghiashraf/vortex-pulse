"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { fetchWatchlistData } from "@/app/actions";

const STORAGE_KEY = "vp_dashboard_tickers";
const DEFAULT_TICKERS = ["SPY", "", "", "", "", ""];

interface WindowData {
  ticker: string;
  windows: { start: string; end: string; score: number }[];
}

export default function DashboardWindows() {
  const [tickers, setTickers] = useState<string[]>(DEFAULT_TICKERS);
  const [windowData, setWindowData] = useState<Map<string, WindowData>>(new Map());
  const [loading, setLoading] = useState<Set<string>>(new Set());
  const [inputValues, setInputValues] = useState<string[]>(Array(6).fill(""));

  // Load tickers from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length === 6) {
          setTickers(parsed);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  // Persist tickers to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tickers));
    } catch {
      // ignore
    }
  }, [tickers]);

  // Fetch data for filled tickers
  const fetchTicker = useCallback(async (ticker: string) => {
    if (!ticker || windowData.has(ticker)) return;
    setLoading((prev) => new Set(prev).add(ticker));
    try {
      const result = await fetchWatchlistData([ticker]);
      if (result.length > 0) {
        setWindowData((prev) => {
          const next = new Map(prev);
          next.set(ticker, { ticker, windows: result[0].windows });
          return next;
        });
      }
    } catch {
      // ignore fetch errors
    } finally {
      setLoading((prev) => {
        const next = new Set(prev);
        next.delete(ticker);
        return next;
      });
    }
  }, [windowData]);

  // Fetch all filled tickers on mount / when tickers change
  useEffect(() => {
    tickers.forEach((t) => {
      if (t) fetchTicker(t);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tickers]);

  const handleSubmit = (index: number) => {
    const val = inputValues[index].trim().toUpperCase();
    if (!val) return;
    const next = [...tickers];
    next[index] = val;
    setTickers(next);
    setInputValues((prev) => {
      const n = [...prev];
      n[index] = "";
      return n;
    });
  };

  const handleClear = (index: number) => {
    const ticker = tickers[index];
    const next = [...tickers];
    next[index] = "";
    setTickers(next);
    setWindowData((prev) => {
      const n = new Map(prev);
      n.delete(ticker);
      return n;
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
      {tickers.map((ticker, i) => {
        if (ticker) {
          const data = windowData.get(ticker);
          const isLoading = loading.has(ticker);
          return (
            <div
              key={i}
              className="bg-vortex-card border border-vortex-border rounded-lg p-4 relative group"
            >
              <button
                onClick={() => handleClear(i)}
                className="absolute top-2 right-2 text-vortex-muted hover:text-vortex-red text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label={`Remove ${ticker}`}
              >
                ✕
              </button>
              <Link href={`/ticker/${ticker}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono font-bold text-base text-vortex-text-bright">
                    {ticker}
                  </span>
                </div>
                {isLoading ? (
                  <div className="text-xs text-vortex-muted animate-pulse">Loading...</div>
                ) : data && data.windows.length > 0 ? (
                  <div className="space-y-1.5">
                    {data.windows.map((w, j) => (
                      <div key={j} className="flex items-center gap-2">
                        <div
                          className="h-1.5 rounded-full"
                          style={{
                            width: `${w.score * 100}%`,
                            backgroundColor:
                              j === 0 ? "#22c55e" : j === 1 ? "#3b82f6" : "#6b7280",
                          }}
                        />
                        <span className="text-xs font-mono text-vortex-muted whitespace-nowrap">
                          {w.start}-{w.end}
                        </span>
                        <span className="text-xs font-mono text-vortex-text">
                          {(w.score * 100).toFixed(0)}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-vortex-muted">No data</div>
                )}
              </Link>
            </div>
          );
        }

        // Empty slot — input
        return (
          <div
            key={i}
            className="bg-vortex-card border border-dashed border-vortex-border rounded-lg p-4 flex items-center justify-center"
          >
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmit(i);
              }}
              className="w-full"
            >
              <input
                type="text"
                value={inputValues[i]}
                onChange={(e) => {
                  const next = [...inputValues];
                  next[i] = e.target.value;
                  setInputValues(next);
                }}
                placeholder="Enter ticker"
                className="w-full bg-transparent border-b border-vortex-border text-center text-sm font-mono text-vortex-text-bright placeholder:text-vortex-muted/50 focus:outline-none focus:border-vortex-accent py-2"
              />
            </form>
          </div>
        );
      })}
    </div>
  );
}
