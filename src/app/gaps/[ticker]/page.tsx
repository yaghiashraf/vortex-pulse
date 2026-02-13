import { getGapFillData, getStockMeta, getStockList } from "@/lib/real-data";
import GapFillView from "@/components/GapFillView";

export default async function GapFillPage({ params }: { params: Promise<{ ticker: string }> }) {
  const { ticker } = await params;
  const upperTicker = ticker.toUpperCase();
  
  const [data, stock, stocks] = await Promise.all([
    getGapFillData(upperTicker),
    getStockMeta(upperTicker),
    getStockList()
  ]);

  return <GapFillView ticker={upperTicker} data={data} stock={stock} stocks={stocks} />;
}
