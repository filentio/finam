import type { Segment } from "../types/onboarding";

interface RoutePreparationScreenProps {
  segment: Segment;
  onStart: () => void;
}

const SEGMENT_DESCRIPTION: Record<Segment, string> = {
  novice: "Маршрут собран для мягкого старта: базовые решения, низкий порог входа и пошаговые действия.",
  advanced:
    "Маршрут собран для ускорения: меньше теории, больше точечных действий и настройки риск-контроля.",
  expert:
    "Маршрут собран для экспертного режима: компактные блоки, риск-профиль и персональные рекомендации.",
};

export function RoutePreparationScreen({ segment, onStart }: RoutePreparationScreenProps) {
  return (
    <section className="ob-route-prep">
      <div className="ob-route-prep__icon" aria-hidden="true">
        ✨
      </div>
      <h2>Мы подобрали для вас персональный маршрут</h2>
      <p>{SEGMENT_DESCRIPTION[segment]}</p>
      <button type="button" className="btn-primary" onClick={onStart}>
        Начать обучение
      </button>
    </section>
  );
}

