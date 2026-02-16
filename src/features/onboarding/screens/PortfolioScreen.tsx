import { GoalOverlay } from "../components/GoalOverlay";
import { PieChart } from "../components/PieChart";
import { PortfolioTable } from "../components/PortfolioTable";
import { usePersonalization } from "../hooks/usePersonalization";
import type { PortfolioScreenProps } from "./ScreenProps";
import { ScreenShell } from "./ScreenShell";

export function PortfolioScreen({
  screen,
  portfolio,
  overlay,
}: PortfolioScreenProps) {
  const { segment } = usePersonalization();
  const total = portfolio.items.reduce((sum, item) => sum + item.amount, 0);
  const stocks = portfolio.items
    .filter((item) => item.type === "stock" || item.type === "etf")
    .reduce((sum, item) => sum + item.share_pct, 0);
  const bonds = portfolio.items
    .filter((item) => item.type === "bond")
    .reduce((sum, item) => sum + item.share_pct, 0);
  const alternatives = Math.max(0, 100 - stocks - bonds);

  return (
    <ScreenShell
      title={screen.title}
      subtitle={`${screen.description_variants?.[segment] ?? `Пример на ${portfolio.total_amount_label}.`} Текущая раскладка: ${total.toLocaleString("ru-RU")} ₽`}
    >
      <PieChart
        allocation={{
          stocks_pct: stocks,
          bonds_pct: bonds,
          alternatives_pct: alternatives,
          cash_pct: 0,
        }}
      />
      <GoalOverlay overlay={overlay} />
      <PortfolioTable items={portfolio.items} />
    </ScreenShell>
  );
}
