import { getDayOfWeekData, getStockList } from "@/lib/real-data";
import CalendarView from "@/components/CalendarView";

export default async function CalendarPage({ searchParams }: { searchParams: Promise<{ ticker?: string }> }) {
  const { ticker } = await searchParams;
  const selectedTicker = (ticker || "SPY").toUpperCase();
  
  const [data, stocks] = await Promise.all([
    getDayOfWeekData(selectedTicker),
    getStockList()
  ]);

  return <CalendarView stocks={stocks} selectedTicker={selectedTicker} data={data} />;
}
