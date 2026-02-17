import type { ReactNode } from "react";
import { ProgressBar } from "./ProgressBar";
import type { ProgressInfo } from "../types/onboarding";

export type TransitionPreset =
  | "screen_to_screen"
  | "lesson_to_lesson"
  | "quiz_enter"
  | "result_enter";

interface OnboardingLayoutProps {
  progress: ProgressInfo;
  stepLabel: string;
  background: string;
  transitionPreset: TransitionPreset;
  direction: 1 | -1;
  transitionKey: string;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  showFooter?: boolean;
  enableTapNavigation?: boolean;
  emphasizeNext?: boolean;
  quizMode?: boolean;
  showTapHint?: boolean;
  children: ReactNode;
}

function getTransitionClass(preset: TransitionPreset, direction: 1 | -1): string {
  if (preset === "screen_to_screen") {
    return direction > 0 ? "ob-transition--screen-next" : "ob-transition--screen-prev";
  }

  if (preset === "lesson_to_lesson") {
    return direction > 0 ? "ob-transition--lesson-next" : "ob-transition--lesson-prev";
  }

  if (preset === "quiz_enter") {
    return "ob-transition--quiz-enter";
  }

  return "ob-transition--result-enter";
}

export function OnboardingLayout({
  progress,
  stepLabel,
  background,
  transitionPreset,
  direction,
  transitionKey,
  onClose,
  onPrev,
  onNext,
  nextLabel = "Далее",
  nextDisabled = false,
  showFooter = true,
  enableTapNavigation = true,
  emphasizeNext = false,
  quizMode = false,
  showTapHint = false,
  children,
}: OnboardingLayoutProps) {
  const isScreenCounter = /^\d+\/\d+$/.test(stepLabel);

  return (
    <div className="ob-layout-root">
      <section className={`ob-layout-frame ${quizMode ? "ob-layout-frame--quiz" : ""}`} style={{ background }}>
        <div className="ob-layout-safe">
          <header className="ob-layout-header">
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

          <div className="ob-layout-screen-wrap">
            <div
              key={transitionKey}
              className={`ob-layout-screen ${getTransitionClass(transitionPreset, direction)}`}
            >
              {children}
            </div>
          </div>

          {enableTapNavigation ? (
            <div className="ob-layout-tap-zones" aria-hidden="true">
              <button
                type="button"
                className="ob-layout-tap-zone ob-layout-tap-zone--prev"
                onClick={onPrev}
                tabIndex={-1}
              />
              <button
                type="button"
                className="ob-layout-tap-zone ob-layout-tap-zone--next"
                onClick={onNext}
                tabIndex={-1}
              />
            </div>
          ) : null}

          {showFooter ? (
            <footer className={`ob-layout-footer ${quizMode ? "ob-layout-footer--quiz" : ""}`}>
              {showTapHint ? (
                <p className="ob-layout-hint">
                  Тап по правой части — следующий экран, по левой — предыдущий.
                </p>
              ) : null}
              <button
                type="button"
                className={`ob-layout-next btn-primary ${emphasizeNext ? "ob-layout-next--glow" : ""}`}
                onClick={onNext}
                disabled={nextDisabled}
                aria-label="Перейти к следующему шагу"
              >
                {nextLabel}
              </button>
            </footer>
          ) : null}
        </div>
      </section>
    </div>
  );
}

