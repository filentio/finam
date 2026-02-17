interface StageProgressProps {
  currentStage: 1 | 2 | 3;
  labels?: string[];
}

export function StageProgress({
  currentStage,
  labels = ["Анкета", "Результат", "Обучение"],
}: StageProgressProps) {
  return (
    <div className="stage-progress" aria-label="Прогресс этапов онбординга">
      {labels.map((label, index) => {
        const stage = index + 1;
        return (
          <div key={label} className="stage-progress__item">
            <span className="text-caption stage-progress__label">{label}</span>
            <span
              className={`stage-progress__bar ${stage <= currentStage ? "is-active" : ""}`}
              aria-hidden="true"
            />
          </div>
        );
      })}
    </div>
  );
}
