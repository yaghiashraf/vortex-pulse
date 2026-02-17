import { getMarketRegime, getOptimalWindows, getStockList } from "@/lib/real-data";
import DashboardView from "@/components/DashboardView";

export const revalidate = 60;

export default async function Dashboard() {
  const regime = await getMarketRegime();
  const stocks = await getStockList();

  // Get top movers for quick view
  const topTickers = stocks.slice(0, 6).map((s) => s.ticker);
  const optimalWindows = await getOptimalWindows(topTickers);

  // Server-rendered timestamp in ET
  const renderedAt = new Date().toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: 'America/New_York',
  }) + ' ET';

  return (
    <DashboardView
      regime={regime}
      stocks={stocks}
      optimalWindows={optimalWindows}
      renderedAt={renderedAt}
    />
  );
}
