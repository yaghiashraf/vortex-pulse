import { getMarketRegime, getIndexSnapshot, getStockList } from "@/lib/real-data";
import DashboardView from "@/components/DashboardView";

export const revalidate = 60;

export default async function Dashboard() {
  const [regime, stocks, indexData] = await Promise.all([
    getMarketRegime(),
    getStockList(),
    getIndexSnapshot(),
  ]);

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
      indexData={indexData}
      renderedAt={renderedAt}
    />
  );
}
