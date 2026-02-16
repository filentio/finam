import { InstrumentCard } from "../components/InstrumentCard";
import { usePersonalization } from "../hooks/usePersonalization";
import type { CardItem, Instrument, InstrumentCardConfig } from "../types/onboarding";
import type { CardsScreenProps } from "./ScreenProps";
import { ScreenShell } from "./ScreenShell";

const CARDS: InstrumentCardConfig[] = [
  {
    instrument_id: "stocks",
    label: "Акции",
    description: "Доли в компаниях. Потенциал роста и дивиденды.",
    risk_level: "high",
    icon: "chart_line_up",
  },
  {
    instrument_id: "bonds",
    label: "Облигации",
    description: "Более предсказуемый доход и меньшая волатильность.",
    risk_level: "low",
    icon: "shield",
  },
  {
    instrument_id: "etf",
    label: "ETF",
    description: "Диверсификация через один инструмент.",
    risk_level: "medium",
    icon: "pie",
  },
  {
    instrument_id: "currency",
    label: "Валюта",
    description: "Инструмент для хеджирования валютного риска.",
    risk_level: "medium",
    icon: "currency",
  },
];

export function CardsScreen({
  screen,
  highlightedInstruments,
}: CardsScreenProps) {
  const { getContentVariantObject, isInstrumentHighlighted } = usePersonalization();

  const rawCards = ((screen.items as CardItem[] | undefined) ?? CARDS) as Array<
    CardItem | InstrumentCardConfig
  >;
  const configuredCards = rawCards.map((card) => {
    const instrumentId = (card.instrument_id ?? card.id) as Instrument;
    const title = "label" in card ? card.label : card.title;

    return {
      key: instrumentId,
      instrumentId,
      title,
      description: card.description,
      riskLevel: card.risk_level ?? "medium",
    };
  });

  const goalAccent = screen.content_variants?.by_goal
    ? getContentVariantObject(screen.content_variants.by_goal, "goal")
    : null;

  return (
    <ScreenShell title={screen.title} subtitle={screen.subtitle}>
      <div style={{ display: "grid", gap: 6 }}>
        {configuredCards.map((card, index) => (
          <div
            key={card.key}
            className="ob-card--stagger"
            style={{ animationDelay: `${index * 80}ms` }}
          >
            <InstrumentCard
              title={card.title}
              description={card.description}
              riskLevel={card.riskLevel}
              highlighted={
                highlightedInstruments.includes(card.instrumentId) ||
                isInstrumentHighlighted(card.instrumentId)
              }
            />
          </div>
        ))}
      </div>
      {goalAccent?.text ? (
        <div className="ob-card" style={{ color: "rgba(255,255,255,0.9)", fontSize: 13 }}>
          {goalAccent.text}
        </div>
      ) : null}
    </ScreenShell>
  );
}
