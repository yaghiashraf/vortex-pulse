import { getStockList } from "@/lib/real-data";
import { getSeasonalityData } from "@/lib/data-service";
import CalendarView from "@/components/CalendarView";

export const revalidate = 300;

export default async function CalendarPage({ searchParams }: { searchParams: Promise<{ ticker?: string }> }) {
  const { ticker } = await searchParams;
  const selectedTicker = (ticker || "SPY").toUpperCase();
  
  const [data, stocks] = await Promise.all([
    getSeasonalityData(selectedTicker),
    getStockList()
  ]);

  return <CalendarView stocks={stocks} selectedTicker={selectedTicker} data={data} />;
}
