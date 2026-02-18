import type { CSSProperties, ReactNode } from "react";
import type { ProgressInfo } from "../types/onboarding";
import { OnboardingShell } from "./OnboardingShell";
import { OnboardingHeader } from "./OnboardingHeader";
import { PrimaryButton } from "./PrimaryButton";

export type TransitionPreset =
  | "screen_to_screen"
  | "lesson_to_lesson"
  | "quiz_enter"
  | "result_enter";

interface StepLayoutProps {
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

export function StepLayout({
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
}: StepLayoutProps) {
  const frameStyle = {
    "--ob-step-bg": background,
  } as CSSProperties;

  return (
    <OnboardingShell>
      <section className={`ob-layout-frame ${quizMode ? "ob-layout-frame--quiz" : ""}`} style={frameStyle}>
        <div className={`ob-layout-safe ${showFooter ? "ob-layout-safe--with-footer" : ""}`}>
          <OnboardingHeader progress={progress} stepLabel={stepLabel} onClose={onClose} />

          <div className={`ob-layout-content ${showFooter ? "ob-layout-content--with-footer" : ""}`}>
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
          </div>

          {showFooter ? (
            <footer className={`ob-layout-footer ${quizMode ? "ob-layout-footer--quiz" : ""}`}>
              {showTapHint ? (
                <p className="ob-layout-hint">
                  Тап по правой части — следующий экран, по левой — предыдущий.
                </p>
              ) : null}
              <PrimaryButton
                className={`ob-layout-next ${emphasizeNext ? "ob-layout-next--glow" : ""}`}
                onClick={onNext}
                disabled={nextDisabled}
                aria-label="Перейти к следующему шагу"
              >
                {nextLabel}
              </PrimaryButton>
            </footer>
          ) : null}
        </div>
      </section>
    </OnboardingShell>
  );
}

export const OnboardingLayout = StepLayout;

