import { PieChart } from "../components/PieChart";
import type { ResultScreenProps } from "./ScreenProps";
import type { CSSProperties } from "react";
import type { RiskProfile } from "../types/onboarding";
import { ScreenShell } from "./ScreenShell";

const CONFETTI_COLORS = ["#2F5BCC", "#5F7EDD", "#8EA4E9", "#3BB273", "#8FD8B7", "#C8D3F2"];

interface ProfilePresentation {
  name: string;
  emoji: string;
  color: string;
  description: string;
}

function getProfilePresentation(profile: RiskProfile): ProfilePresentation {
  const profiles: Record<RiskProfile, ProfilePresentation> = {
    conservative: {
      name: "Консервативный",
      emoji: "🛡️",
      color: "#2F5BCC",
      description: "Приоритет — сохранение капитала и стабильный доход.",
    },
    moderate: {
      name: "Умеренный",
      emoji: "⚖️",
      color: "#3BB273",
      description: "Баланс между ростом и защитой капитала.",
    },
    aggressive: {
      name: "Агрессивный",
      emoji: "🚀",
      color: "#5F7EDD",
      description: "Приоритет — максимальный рост капитала.",
    },
    ultra_aggressive: {
      name: "Сверхагрессивный",
      emoji: "⚡",
      color: "#274FB1",
      description: "Готовность к высоким рискам ради высокой доходности.",
    },
  };

  return profiles[profile];
}

export function ResultScreen({ screen, riskResult }: ResultScreenProps) {
  const presentation = riskResult ? getProfilePresentation(riskResult.final_profile) : null;

  return (
    <ScreenShell className="ob-quiz-result-screen" title={screen.title} subtitle={screen.subtitle}>
      {riskResult ? (
        <>
          <div className="ob-quiz-result__emoji" aria-hidden="true">
            🎉
          </div>
          <div
            className="ob-quiz-result__profile-badge"
            style={{ "--profile-color": presentation?.color ?? "#4CAF50" } as CSSProperties}
          >
            <p className="ob-quiz-result__profile-name">
              <span aria-hidden="true">{presentation?.emoji}</span>
              <span>{presentation?.name}</span>
            </p>
          </div>
          <p className="ob-quiz-result__profile-description">
            {presentation?.description ?? "Риск-профиль рассчитан по ответам анкеты."}
          </p>
          <section className="ob-quiz-result__allocation">
            <h3 className="ob-quiz-result__allocation-title">Рекомендуемая аллокация</h3>
            <PieChart allocation={riskResult.allocation} />
            <ul className="ob-quiz-result__breakdown">
              <li className="ob-quiz-result__breakdown-item">
                <span className="ob-quiz-result__breakdown-label">
                  <span className="ob-quiz-result__breakdown-color is-stocks" />
                  Акции
                </span>
                <strong className="ob-quiz-result__breakdown-pct">
                  {riskResult.allocation.stocks_pct}%
                </strong>
              </li>
              <li className="ob-quiz-result__breakdown-item">
                <span className="ob-quiz-result__breakdown-label">
                  <span className="ob-quiz-result__breakdown-color is-bonds" />
                  Облигации
                </span>
                <strong className="ob-quiz-result__breakdown-pct">
                  {riskResult.allocation.bonds_pct}%
                </strong>
              </li>
              <li className="ob-quiz-result__breakdown-item">
                <span className="ob-quiz-result__breakdown-label">
                  <span className="ob-quiz-result__breakdown-color is-alt" />
                  Альтернативы
                </span>
                <strong className="ob-quiz-result__breakdown-pct">
                  {riskResult.allocation.alternatives_pct}%
                </strong>
              </li>
              <li className="ob-quiz-result__breakdown-item">
                <span className="ob-quiz-result__breakdown-label">
                  <span className="ob-quiz-result__breakdown-color is-cash" />
                  Кэш
                </span>
                <strong className="ob-quiz-result__breakdown-pct">
                  {riskResult.allocation.cash_pct}%
                </strong>
              </li>
            </ul>
          </section>
          <div className="ob-confetti" aria-hidden="true">
            {Array.from({ length: 18 }).map((_, index) => (
              <span
                key={index}
                style={{
                  left: `${(index % 6) * 16 + 4}%`,
                  background: CONFETTI_COLORS[index % CONFETTI_COLORS.length],
                  animationDelay: `${index * 40}ms`,
                }}
              />
            ))}
          </div>
        </>
      ) : (
        <p className="ob-screen__subtitle">
          Заполните анкету риска, чтобы получить персональный профиль.
        </p>
      )}
    </ScreenShell>
  );
}
