import type { ProgressInfo } from "../types/onboarding";

interface ProgressBarProps {
  progress: ProgressInfo;
}

export function ProgressBar({ progress }: ProgressBarProps) {
  if (progress.totalSteps === 0) {
    return null;
  }

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
    <div className="ob-progress">
      <div className="ob-progress__segments">
        {segments.map((fill, index) => (
          <div
            key={index}
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

      <div className="ob-progress__meta">
        <span>{progress.currentStepLabel}</span>
        <span>{Math.round(progress.overallProgress * 100)}%</span>
      </div>
    </div>
  );
}
