import { GoalOverlay } from "../components/GoalOverlay";
import { PieChart } from "../components/PieChart";
import { PortfolioTable } from "../components/PortfolioTable";
import { usePersonalization } from "../hooks/usePersonalization";
import type { PortfolioScreenProps } from "./ScreenProps";
import { ScreenShell } from "./ScreenShell";
import { Disclaimer } from "../../../components/Disclaimer";

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
  const visibleItems = portfolio.items.slice(0, 5);
  const hiddenItemsCount = Math.max(0, portfolio.items.length - visibleItems.length);
  const glossary = [
    {
      key: "etf",
      visible: portfolio.items.some((item) => /ETF|TMOS/i.test(`${item.instrument} ${item.ticker}`)),
      text: "ETF — биржевой фонд, который позволяет купить готовую корзину активов одной сделкой.",
    },
    {
      key: "ofz",
      visible: portfolio.items.some((item) => /ОФЗ|SU/i.test(`${item.instrument} ${item.ticker}`)),
      text: "ОФЗ — облигации федерального займа: долговые бумаги государства с фиксированным купоном.",
    },
    {
      key: "blue-chips",
      visible: portfolio.items.some((item) => /SBER|LKOH|YDEX/i.test(item.ticker)),
      text: "Голубые фишки — акции крупнейших и наиболее ликвидных компаний рынка.",
    },
    {
      key: "lqdt",
      visible: true,
      text: "LQDT — фонд денежного рынка, который часто используют как «парковку» для свободных денег.",
    },
  ].filter((item) => item.visible);

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
      <PortfolioTable items={visibleItems} />
      {hiddenItemsCount > 0 ? (
        <p className="ob-screen__subtitle">
          Ещё {hiddenItemsCount} инструментов в полной версии портфеля.
        </p>
      ) : null}
      {glossary.length > 0 ? (
        <div className="ob-glossary">
          {glossary.map((item) => (
            <p key={item.key}>{item.text}</p>
          ))}
        </div>
      ) : null}
      <Disclaimer />
    </ScreenShell>
  );
}
