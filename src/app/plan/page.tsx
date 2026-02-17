import { getStockList, getMarketRegime } from "@/lib/real-data";
import PlanView from "@/components/PlanView";

export const revalidate = 300;

export default async function PlanPage() {
  const [stocks, regime] = await Promise.all([
    getStockList(),
    getMarketRegime()
  ]);

  return <PlanView stocks={stocks} regime={regime} />;
}
