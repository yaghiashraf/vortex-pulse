import {
  getTimeOfDayData,
  getStockMeta,
  getSessionPhases,
  getIBData,
} from "@/lib/real-data";
import TickerAnalysisView from "@/components/TickerAnalysisView";

export const revalidate = 60;

export default async function TickerPage({ params }: { params: Promise<{ ticker: string }> }) {
  const { ticker } = await params;
  const upperTicker = ticker.toUpperCase();

  // Fetch all data in parallel
  const [todData, stock, phases, ibData] = await Promise.all([
    getTimeOfDayData(upperTicker),
    getStockMeta(upperTicker),
    getSessionPhases(upperTicker),
    getIBData(upperTicker),
  ]);

  return (
    <TickerAnalysisView
      ticker={upperTicker}
      stock={stock}
      todData={todData}
      phases={phases}
      ibData={ibData}
    />
  );
}
