import type { ProgressInfo } from "../types/onboarding";
import { ProgressBar } from "./ProgressBar";

interface OnboardingHeaderProps {
  progress: ProgressInfo;
  stepLabel: string;
  onClose: () => void;
}

export function OnboardingHeader({ progress, stepLabel, onClose }: OnboardingHeaderProps) {
  const isScreenCounter = /^\d+\/\d+$/.test(stepLabel);

  return (
    <header className="ob-layout-header ob-onboarding-header">
      <div className="ob-layout-header__top">
        <p className={`ob-layout-step-label ${isScreenCounter ? "ob-layout-step-label--counter" : ""}`}>
          {stepLabel}
        </p>
        <button
          type="button"
          className="ob-layout-close"
          onClick={onClose}
          aria-label="Закрыть обучение"
        >
          ×
        </button>
      </div>
      <ProgressBar progress={progress} />
    </header>
  );
}
