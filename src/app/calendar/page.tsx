import { getStockList, getOptimalWindows } from "@/lib/real-data";
import { getSeasonalityData } from "@/lib/data-service";
import CalendarView from "@/components/CalendarView";

export const revalidate = 300;

export default async function CalendarPage({ searchParams }: { searchParams: Promise<{ ticker?: string }> }) {
  const { ticker } = await searchParams;
  const selectedTicker = (ticker || "SPY").toUpperCase();

  const [data, stocks, optimalWindows] = await Promise.all([
    getSeasonalityData(selectedTicker),
    getStockList(),
    getOptimalWindows([selectedTicker])
  ]);

  const windows = optimalWindows.length > 0 ? optimalWindows[0].windows : [];

  return <CalendarView stocks={stocks} selectedTicker={selectedTicker} data={data} optimalWindows={windows} />;
}
