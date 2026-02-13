"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: "◉" },
  { href: "/heatmap/SPY", label: "Heatmaps", icon: "▦" },
  { href: "/gaps/SPY", label: "Gap Fill", icon: "⇥" },
  { href: "/rhythm/SPY", label: "Rhythm", icon: "◫" },
  { href: "/calendar", label: "Day Edge", icon: "▤" },
  { href: "/ib/SPY", label: "IB Stats", icon: "⟛" },
  { href: "/plan", label: "My Plan", icon: "☰" },
];

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-vortex-bg/95 backdrop-blur-sm border-b border-vortex-border">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white font-bold text-sm">
              VP
            </div>
            <div>
              <span className="text-vortex-text-bright font-semibold text-sm tracking-wide">
                VortexPulse
              </span>
              <span className="text-vortex-muted text-[10px] block -mt-0.5 tracking-wider uppercase">
                Statistical Edge
              </span>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/" && pathname.startsWith(item.href.split("/").slice(0, 2).join("/")));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 ${
                    isActive
                      ? "bg-vortex-accent/15 text-vortex-accent-bright"
                      : "text-vortex-muted hover:text-vortex-text hover:bg-vortex-card"
                  }`}
                >
                  <span className="text-[11px]">{item.icon}</span>
                  {item.label}
                </Link>
              );
            })}
          </div>

          <div className="flex items-center gap-3">
            <a
              href="https://vortexedge.tech"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] text-vortex-muted hover:text-vortex-green transition-colors uppercase tracking-wider"
            >
              Edge
            </a>
            <a
              href="https://vortexflow.app"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] text-vortex-muted hover:text-vortex-cyan transition-colors uppercase tracking-wider"
            >
              Flow
            </a>
            <a
              href="https://vortexcapitalgroup.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] text-vortex-muted hover:text-vortex-purple transition-colors uppercase tracking-wider"
            >
              VCG
            </a>
          </div>
        </div>
      </div>

      {/* Mobile nav */}
      <div className="md:hidden border-t border-vortex-border px-2 py-1.5 flex gap-1 overflow-x-auto">
        {NAV_ITEMS.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href.split("/").slice(0, 2).join("/")));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`px-2.5 py-1 rounded text-[10px] font-medium whitespace-nowrap transition-colors ${
                isActive
                  ? "bg-vortex-accent/15 text-vortex-accent-bright"
                  : "text-vortex-muted"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
