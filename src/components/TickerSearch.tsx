"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { StockMeta } from "@/lib/types";

interface TickerSearchProps {
  currentTicker?: string;
  basePath: string;
  stocks: StockMeta[];
}

export default function TickerSearch({ currentTicker, basePath, stocks }: TickerSearchProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const filtered = query
    ? stocks.filter(
        (s) =>
          s.ticker.toLowerCase().includes(query.toLowerCase()) ||
          s.name.toLowerCase().includes(query.toLowerCase())
      )
    : stocks;

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <div className="flex items-center gap-2">
        {currentTicker && (
          <span className="text-lg font-bold text-vortex-text-bright font-mono">
            {currentTicker}
          </span>
        )}
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Search ticker..."
          className="bg-vortex-card border border-vortex-border rounded-md px-3 py-1.5 text-xs text-vortex-text placeholder-vortex-muted focus:outline-none focus:border-vortex-accent w-48"
        />
      </div>

      {isOpen && (
        <div className="absolute top-full mt-1 left-0 w-72 bg-vortex-card border border-vortex-border rounded-lg shadow-xl max-h-64 overflow-y-auto z-50">
          {filtered.slice(0, 12).map((stock) => (
            <button
              key={stock.ticker}
              onClick={() => {
                router.push(`${basePath}/${stock.ticker}`);
                setQuery("");
                setIsOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2 text-xs hover:bg-vortex-surface transition-colors ${
                stock.ticker === currentTicker ? "bg-vortex-accent/10" : ""
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="font-mono font-semibold text-vortex-text-bright">
                  {stock.ticker}
                </span>
                <span className="text-vortex-muted truncate max-w-[140px]">
                  {stock.name}
                </span>
              </div>
              <span className="text-vortex-muted text-[10px]">{stock.sector}</span>
            </button>
          ))}
          {filtered.length === 0 && (
            <div className="px-3 py-4 text-xs text-vortex-muted text-center">
              No stocks found
            </div>
          )}
        </div>
      )}
    </div>
  );
}
