"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const STORAGE_KEY = "vp_recent";
const MAX_RECENT = 8;

export function saveRecentTicker(ticker: string) {
  if (typeof window === "undefined") return;
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]") as string[];
    const filtered = stored.filter((t) => t !== ticker);
    filtered.unshift(ticker);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered.slice(0, MAX_RECENT)));
  } catch {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([ticker]));
  }
}

export function useRecentTickers(): string[] {
  const [recent, setRecent] = useState<string[]>([]);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]") as string[];
      setRecent(stored.slice(0, MAX_RECENT));
    } catch {
      setRecent([]);
    }
  }, []);

  return recent;
}

interface RecentTickersProps {
  currentTicker?: string;
}

export default function RecentTickers({ currentTicker }: RecentTickersProps) {
  const recent = useRecentTickers();

  if (recent.length === 0) return null;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-xs text-vortex-muted uppercase tracking-wider">Recent:</span>
      {recent.map((ticker) => (
        <Link
          key={ticker}
          href={`/ticker/${ticker}`}
          className={`px-2.5 py-1 rounded-md text-xs font-mono font-medium transition-colors ${
            ticker === currentTicker
              ? "bg-vortex-accent/20 text-vortex-accent-bright border border-vortex-accent/40"
              : "bg-vortex-card border border-vortex-border text-vortex-text hover:border-vortex-accent/40 hover:text-vortex-accent-bright"
          }`}
        >
          {ticker}
        </Link>
      ))}
    </div>
  );
}
