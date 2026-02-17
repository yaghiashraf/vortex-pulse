import type { Metadata } from "next";
import "./globals.css";
import Navigation from "@/components/Navigation";
import { SpeedInsights } from "@vercel/speed-insights/next";

export const metadata: Metadata = {
  title: "VortexPulse | Intraday Statistical Edge Dashboard",
  description:
    "Know when the edge is in your favor. Historical statistical analysis for day traders — time-of-day heatmaps, gap fill probabilities, session rhythm, and market regime detection.",
  keywords: "day trading, statistical edge, intraday analysis, gap fill, market regime, trading tools",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-vortex-bg antialiased">
        <Navigation />
        <main className="pt-14 md:pt-14">{children}</main>
        <SpeedInsights />
      </body>
    </html>
  );
}
