import { getMarketRegime, getOptimalWindows, getStockList } from "@/lib/real-data";
import DashboardView from "@/components/DashboardView";

export const revalidate = 60;

export default async function Dashboard() {
  const regime = await getMarketRegime();
  const stocks = await getStockList();
  
  // Get top movers for quick view
  const topTickers = stocks.slice(0, 6).map((s) => s.ticker);
  const optimalWindows = await getOptimalWindows(topTickers);

  return (
    <DashboardView 
      regime={regime} 
      stocks={stocks} 
      optimalWindows={optimalWindows} 
    />
  );
}
