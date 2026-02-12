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
    <div style={{ display: "grid", gap: 8 }}>
      <div style={{ display: "flex", gap: 6 }}>
        {segments.map((fill, index) => (
          <div
            key={index}
            style={{
              flex: 1,
              height: 6,
              borderRadius: 999,
              background: "#e6ebf4",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${Math.max(0, Math.min(fill, 1)) * 100}%`,
                height: "100%",
                background: "#3f67c8",
                transition: "width 180ms ease",
              }}
            />
          </div>
        ))}
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 12,
          color: "#5c6879",
        }}
      >
        <span>{progress.currentStepLabel}</span>
        <span>{Math.round(progress.overallProgress * 100)}%</span>
      </div>
    </div>
  );
}
