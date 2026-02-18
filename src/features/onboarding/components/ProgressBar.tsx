import type { ProgressInfo } from "../types/onboarding";

interface ProgressBarProps {
  progress: ProgressInfo;
}

export function ProgressBar({ progress }: ProgressBarProps) {
  if (progress.totalSteps === 0) {
    return null;
  }

  const progressPercent = Math.round(Math.max(0, Math.min(progress.overallProgress, 1)) * 100);

  const segments = Array.from({ length: progress.totalSteps }, (_, index) => {
    if (index < progress.currentStepIndex) {
      return 1;
    }
    if (index > progress.currentStepIndex) {
      return 0;
    }
    return progress.currentStepProgress;
  });

  return (
    <div
      className="ob-progress"
      role="progressbar"
      aria-valuenow={progressPercent}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`Прогресс урока: ${progressPercent}%`}
    >
      <div className="ob-progress__segments">
        {segments.map((fill, index) => (
          <div
            key={index}
            data-testid="progress-segment"
            data-segment-index={index}
            data-segment-id={`segment-${index}`}
            className={`ob-progress__segment ${
              index < progress.currentStepIndex
                ? "is-done"
                : index === progress.currentStepIndex
                  ? "is-active"
                  : ""
            }`}
          >
            <span
              className="ob-progress__fill"
              style={{
                width: `${Math.max(0, Math.min(fill, 1)) * 100}%`,
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
