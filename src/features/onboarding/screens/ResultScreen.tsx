import { PieChart } from "../components/PieChart";
import type { ResultScreenProps } from "./ScreenProps";
import { ScreenShell } from "./ScreenShell";

const CONFETTI_COLORS = ["#ffffff", "#7dd3fc", "#86efac", "#fde047", "#fca5a5", "#c4b5fd"];

export function ResultScreen({ screen, riskResult }: ResultScreenProps) {
  return (
    <ScreenShell title={screen.title} subtitle={screen.subtitle}>
      {riskResult ? (
        <>
          <span className="ob-risk-chip">
            Итоговый профиль: <strong>{riskResult.final_profile.replace("_", " ")}</strong>
          </span>
          <PieChart allocation={riskResult.allocation} />
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
