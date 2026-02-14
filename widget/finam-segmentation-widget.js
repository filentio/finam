(function () {
  "use strict";

  var SCRIPT_REF = document.currentScript || null;
  var STYLE_ID = "finam-segmentation-widget-style-v1";
  var SCRIPT_MOUNTED_ATTR = "data-segw-mounted";
  var WIDGET_ROOT_ATTR = "data-segmentation-widget";
  var WIDGET_OPTIONS = {
    useLegacyGlobalNavigate:
      SCRIPT_REF && SCRIPT_REF.getAttribute("data-use-global-navigate") === "true",
    disableTracking:
      SCRIPT_REF && SCRIPT_REF.getAttribute("data-disable-tracking") === "true",
    onboardingMode: SCRIPT_REF ? SCRIPT_REF.getAttribute("data-onboarding-mode") : null,
    openInNewTab:
      SCRIPT_REF && SCRIPT_REF.getAttribute("data-open-in-new-tab") === "true",
    onboardingBaseUrl: SCRIPT_REF
      ? SCRIPT_REF.getAttribute("data-onboarding-url") ||
        SCRIPT_REF.getAttribute("data-onboarding-base-url")
      : null,
    onboardingUrlMap: {
      novice: SCRIPT_REF ? SCRIPT_REF.getAttribute("data-onboarding-novice-url") : null,
      advanced: SCRIPT_REF ? SCRIPT_REF.getAttribute("data-onboarding-advanced-url") : null,
      expert: SCRIPT_REF ? SCRIPT_REF.getAttribute("data-onboarding-expert-url") : null,
    },
  };

  var WIDGET_CSS = `
.segw {
  --finam-primary: #1a56db;
  --finam-primary-hover: #1447c4;
  --bg-base: #ffffff;
  --bg-elevated: #f8f9fa;
  --text-primary: #1e293b;
  --text-secondary: #64748b;
  --text-inverse: #ffffff;
  --space-1: 8px;
  --space-2: 16px;
  --space-3: 24px;
  --space-4: 32px;
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-base: 300ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-slow: 500ms cubic-bezier(0.4, 0, 0.2, 1);
  --gradient-lesson-1: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  --gradient-lesson-2: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  --gradient-lesson-3: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  --gradient-lesson-4: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
  --gradient-lesson-5: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
  --gradient-lesson-6: linear-gradient(135deg, #30cfd0 0%, #330867 100%);
  --segw-bg: transparent;
  --segw-card: var(--bg-base);
  --segw-line: #e6eaf2;
  --segw-primary: var(--finam-primary);
  --segw-primary-soft: rgba(26, 86, 219, 0.08);
  --segw-text: var(--text-primary);
  --segw-muted: var(--text-secondary);
  font-family:
    Inter,
    system-ui,
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    sans-serif;
  color: var(--segw-text);
  background: var(--segw-bg);
  padding: 0;
  border-radius: 0;
}

.segw__btn-primary {
  background: var(--finam-primary);
  color: var(--text-inverse);
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-md);
  font-size: 16px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all var(--transition-base);
}

.segw__btn-primary:hover {
  background: var(--finam-primary-hover);
  transform: translateY(-1px);
}

.segw__btn-primary:disabled {
  opacity: 0.55;
  cursor: not-allowed;
  transform: none;
}

.segw__btn-secondary {
  background: transparent;
  color: var(--text-secondary);
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-md);
  font-size: 14px;
  font-weight: 500;
  border: 1px solid #e2e8f0;
  cursor: pointer;
  transition: all var(--transition-base);
}

.segw__btn-primary:focus-visible,
.segw__btn-secondary:focus-visible,
.segw__option:focus-visible {
  outline: 2px solid rgba(26, 86, 219, 0.55);
  outline-offset: 2px;
}

.segw * {
  box-sizing: border-box;
}

.segw__header {
  margin-bottom: 18px;
}

.segw__header h2 {
  margin: 0 0 8px;
  font-size: 28px;
  line-height: 1.2;
}

.segw__eyebrow {
  margin: 0 0 6px;
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--segw-primary);
  font-weight: 600;
}

.segw__description {
  margin: 0;
  color: var(--segw-muted);
  font-size: 0.93rem;
}

.segw__section {
  border: 1px solid var(--segw-line);
  background: var(--segw-card);
  border-radius: 14px;
  padding: 16px;
  margin-top: 24px;
}

.segw__title {
  margin: 0 0 10px;
  font-size: 1rem;
  line-height: 1.35;
}

.segw__hint {
  margin: -2px 0 10px;
  color: var(--segw-muted);
  font-size: 0.86rem;
}

.segw__grid {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.segw__option {
  min-height: 56px;
  width: 100%;
  border: 2px solid #e2e8f0;
  background: var(--bg-base);
  border-radius: var(--radius-md);
  padding: 14px 16px;
  cursor: pointer;
  color: inherit;
  text-align: left;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  transition: all var(--transition-base);
}

.segw__option:hover {
  border-color: #cbd5e1;
  background: var(--bg-elevated);
  transform: translateY(-1px);
}

.segw__option:active {
  transform: translateY(0);
  box-shadow: 0 8px 16px rgba(16, 24, 40, 0.1);
}

.segw__option:focus-visible {
  outline: 3px solid rgba(47, 95, 204, 0.25);
  outline-offset: 2px;
}

.segw__option.is-selected {
  border-color: var(--finam-primary);
  border-width: 2px;
  background: rgba(26, 86, 219, 0.05);
  box-shadow: 0 0 0 3px rgba(26, 86, 219, 0.1);
}

.segw__option-mark {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0;
  font-weight: 700;
  color: transparent;
  background: #fff;
  border: 2px solid #e2e8f0;
  flex: 0 0 auto;
  position: relative;
}

.segw__option.is-selected .segw__option-mark {
  border-color: var(--finam-primary);
  background: var(--finam-primary);
}

.segw__option.is-selected .segw__option-mark::after {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 8px;
  height: 8px;
  background: #fff;
  border-radius: 50%;
}

.segw__option[data-action="instrument"] .segw__option-mark {
  border-radius: 6px;
}

.segw__option[data-action="instrument"].is-selected .segw__option-mark::after {
  border-radius: 2px;
  width: 10px;
  height: 10px;
}

.segw__option--wide {
  grid-column: 1 / -1;
}

.segw__experience {
  max-height: 0;
  opacity: 0;
  transform: translateY(-4px);
  margin-top: 0;
  overflow: hidden;
  pointer-events: none;
  transition:
    max-height 0.35s ease,
    opacity 0.2s ease,
    transform 0.2s ease,
    margin 0.2s ease;
}

.segw__experience.is-open {
  max-height: 520px;
  opacity: 1;
  transform: translateY(0);
  margin-top: 24px;
  pointer-events: auto;
}

.segw__submit {
  margin-top: 24px;
  border: 1px solid var(--segw-line);
  background: #fff;
  border-radius: 14px;
  padding: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
}

.segw__segment {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--segw-muted);
  font-size: 0.92rem;
}

.segw__segment-chip {
  border: 1px solid #d8e2f2;
  background: #f6f8fb;
  border-radius: 999px;
  padding: 6px 10px;
  text-transform: none;
  letter-spacing: 0;
  font-size: 13px;
  color: #3d4b5c;
}

.segw__segment-chip.is-active {
  border-color: rgba(47, 95, 204, 0.35);
  background: rgba(47, 95, 204, 0.1);
  color: #1f3a73;
}

.segw__continue {
  border: 0;
  background: var(--finam-primary);
  color: var(--text-inverse);
  border-radius: var(--radius-md);
  padding: var(--space-2) var(--space-4);
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
  transition: all var(--transition-base);
}

.segw__continue:hover {
  background: var(--finam-primary-hover);
  transform: translateY(-1px);
}

.segw__continue:disabled {
  opacity: 0.45;
  cursor: not-allowed;
  filter: grayscale(0.15);
}

.segw__questionnaire {
  margin-top: 0;
  display: flex;
  justify-content: center;
  padding: 8px 0;
}

.segw__seg-story-frame {
  width: 100%;
  max-width: 430px;
  min-height: 932px;
  height: 932px;
  border-radius: 24px;
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: #fff;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 18px 42px rgba(15, 23, 42, 0.25);
}

.segw__seg-story-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px 8px;
}

.segw__seg-story-close {
  border: 0;
  background: transparent;
  color: #fff;
  font-size: 30px;
  line-height: 1;
  cursor: pointer;
  transition: opacity var(--transition-fast);
}

.segw__seg-story-close:hover {
  opacity: 0.8;
}

.segw__seg-story-counter {
  font-size: 14px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.95);
}

.segw__seg-story-progress {
  display: flex;
  gap: 4px;
  padding: 0 16px 8px;
}

.segw__seg-story-progress-segment {
  height: 12px;
  flex: 1;
  border-radius: 4px;
  border: 1px solid rgba(255, 255, 255, 0.45);
  background: rgba(255, 255, 255, 0.12);
  transition: background-color var(--transition-base), border-color var(--transition-base);
}

.segw__seg-story-progress-segment.is-done {
  background: #fff;
  border-color: transparent;
}

.segw__seg-story-content {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 8px 24px 24px;
  display: flex;
  flex-direction: column;
}

.segw__seg-story-content.is-enter-next {
  animation: segwSegSlideNext var(--transition-base);
}

.segw__seg-story-content.is-enter-prev {
  animation: segwSegSlidePrev var(--transition-base);
}

@keyframes segwSegSlideNext {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes segwSegSlidePrev {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.segw__seg-intro {
  margin: auto 0;
  text-align: center;
}

.segw__seg-intro-emoji,
.segw__seg-result-emoji {
  font-size: 64px;
  line-height: 1;
  margin-bottom: 18px;
}

.segw__seg-intro-title,
.segw__seg-result-title {
  margin: 0 0 12px;
  font-size: 30px;
  line-height: 1.2;
}

.segw__seg-intro-subtitle {
  margin: 0 0 20px;
  color: rgba(255, 255, 255, 0.82);
  font-size: 18px;
  line-height: 1.45;
}

.segw__seg-intro-card,
.segw__seg-result-card {
  width: 100%;
  max-width: 360px;
  margin: 0 auto 18px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.28);
  backdrop-filter: blur(8px);
  padding: 18px;
}

.segw__seg-benefits {
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 12px;
  text-align: left;
}

.segw__seg-benefits li {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #fff;
}

.segw__seg-intro-time {
  margin: 0 0 18px;
  color: rgba(255, 255, 255, 0.65);
  font-size: 13px;
}

.segw__seg-question {
  display: flex;
  flex-direction: column;
  min-height: 100%;
}

.segw__seg-block-title {
  margin: 0 0 8px;
  font-size: 14px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.82);
}

.segw__seg-question-title {
  margin: 0 0 14px;
  font-size: 28px;
  line-height: 1.25;
}

.segw__seg-question-subtitle {
  margin: 0 0 10px;
  color: rgba(255, 255, 255, 0.74);
  font-size: 16px;
}

.segw__seg-options {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: auto;
}

.segw__seg-option {
  width: 100%;
  border: 1px solid rgba(255, 255, 255, 0.55);
  border-radius: 16px;
  min-height: 56px;
  padding: 14px 16px;
  display: flex;
  align-items: center;
  gap: 10px;
  justify-content: center;
  text-align: center;
  background: rgba(255, 255, 255, 0.18);
  color: #fff;
  font-size: 17px;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-base);
}

.segw__seg-option:hover {
  background: rgba(255, 255, 255, 0.3);
}

.segw__seg-option.is-selected {
  background: #fff;
  border-color: #fff;
  color: #2f9adf;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.2);
}

.segw__seg-option.is-multiple {
  justify-content: flex-start;
  text-align: left;
  padding-left: 16px;
}

.segw__seg-option-check {
  font-size: 20px;
  line-height: 1;
}

.segw__seg-helper {
  margin: 12px 0 0;
  display: flex;
  align-items: flex-start;
  gap: 10px;
  color: rgba(255, 255, 255, 0.82);
  font-size: 14px;
  line-height: 1.35;
}

.segw__seg-helper-icon {
  width: 20px;
  height: 20px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.55);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  flex: 0 0 auto;
}

.segw__seg-story-footer {
  position: sticky;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 14px 24px 24px;
  background: linear-gradient(to top, rgba(0, 107, 235, 0.22), rgba(0, 107, 235, 0));
}

.segw__seg-story-next,
.segw__seg-cta {
  width: 100%;
  border: 0;
  border-radius: 16px;
  min-height: 52px;
  padding: 0 18px;
  background: rgba(255, 255, 255, 0.3);
  color: #fff;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  backdrop-filter: blur(8px);
  transition: all var(--transition-base);
}

.segw__seg-story-next:hover,
.segw__seg-cta:hover {
  background: rgba(255, 255, 255, 0.4);
}

.segw__seg-story-next:disabled {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.5);
  cursor: not-allowed;
}

.segw__seg-result {
  margin: auto 0;
  text-align: center;
}

.segw__seg-result-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 14px;
}

.segw__seg-result-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 48px;
  padding: 0 22px;
  border-radius: 999px;
  background: linear-gradient(180deg, #54be57 0%, #3f9b3f 100%);
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 12px;
}

.segw__seg-result-description {
  margin: 0 0 14px;
  color: rgba(255, 255, 255, 0.82);
  font-size: 14px;
  text-align: center;
}

.segw__seg-track {
  text-align: left;
}

.segw__seg-track h3 {
  margin: 0 0 8px;
  font-size: 15px;
  text-align: center;
}

.segw__seg-track-item {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 10px;
  min-height: 54px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.85);
  color: #1e293b;
  padding: 0 14px;
}

.segw__questionnaire.is-hidden {
  display: none;
}

.segw__result {
  margin-top: 24px;
}

.segw__result.is-hidden {
  display: none;
}

.segw__tariff {
  border-radius: 14px;
  background: linear-gradient(160deg, #1f4bb7, #3c77ea);
  color: #fff;
  padding: 14px;
}

.segw__tariff-caption {
  margin: 0 0 6px;
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  opacity: 0.9;
}

.segw__tariff-title {
  margin: 0 0 10px;
  font-size: 1.18rem;
}

.segw__tariff-list {
  margin: 0 0 12px;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 6px;
  font-size: 0.9rem;
}

.segw__tariff-list li {
  display: grid;
  gap: 2px;
}

.segw__label {
  opacity: 0.75;
  font-size: 0.76rem;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.segw__value {
  font-weight: 600;
}

.segw__route {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  border-radius: 10px;
  padding: 10px 12px;
  background: #fff;
  color: #194199;
  font-weight: 600;
}

.segw__route--ghost {
  background: transparent;
  border: 1px solid rgba(25, 65, 153, 0.25);
}

.segw__onboarding {
  margin-top: 16px;
}

.segw__onboarding.is-hidden {
  display: none;
}

.segw__route-prep {
  margin-top: 16px;
}

.segw__route-prep.is-hidden {
  display: none;
}

.segw__route-prep-card {
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 16px;
  background: linear-gradient(160deg, #1f4bb7, #3c77ea);
  color: #fff;
  padding: 18px 16px;
  display: grid;
  gap: 10px;
  text-align: center;
  transform-origin: center;
  animation: segwRoutePrepEnter var(--transition-slow) both;
}

.segw__route-prep.is-exiting .segw__route-prep-card {
  animation: segwRoutePrepExit var(--transition-base) forwards;
}

.segw__route-prep-icon {
  width: 64px;
  height: 64px;
  border-radius: 18px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  font-size: 30px;
  background: rgba(255, 255, 255, 0.2);
}

.segw__route-prep-title {
  margin: 0;
  font-size: 24px;
  line-height: 1.2;
}

.segw__route-prep-text {
  margin: 0;
  color: rgba(255, 255, 255, 0.8);
}

@keyframes segwRoutePrepEnter {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes segwRoutePrepExit {
  from {
    opacity: 1;
    transform: scale(1);
  }
  to {
    opacity: 0;
    transform: scale(0.95);
  }
}

.segw__onboarding-kicker {
  margin: 0;
  font-size: 0.82rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: rgba(255, 255, 255, 0.75);
  font-weight: 600;
}

.segw__story-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: #000;
  padding: 20px;
  border-radius: 20px;
}

.segw__story-frame {
  width: 100%;
  max-width: 430px;
  height: 100vh;
  max-height: 100vh;
  min-height: 100vh;
  margin: 0 auto;
  position: relative;
  overflow: hidden;
  border-radius: 20px;
  color: #fff;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.52);
  background: var(--gradient-lesson-1);
  transition: background var(--transition-base);
  display: flex;
  flex-direction: column;
}

.segw__story-progress {
  display: flex;
  gap: 4px;
  padding: 12px 16px;
  background: rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.segw__story-progress-segment {
  flex: 1 1 0;
  height: 3px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 999px;
  overflow: hidden;
}

.segw__story-progress-fill {
  display: block;
  height: 100%;
  width: 0;
  background: #fff;
  border-radius: inherit;
  transition: width var(--transition-base);
}

.segw__story-progress-segment.is-done .segw__story-progress-fill {
  width: 100%;
}

.segw__story-progress-segment.is-active .segw__story-progress-fill {
  background: #fff;
}

.segw__story-progress-segment.is-active {
  background: rgba(255, 255, 255, 0.5);
}

.segw__story-progress-segment.is-done {
  background: #fff;
}

.segw__story-header {
  position: relative;
  z-index: 6;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 14px 0;
}

.segw__story-close {
  border: 0;
  background: rgba(0, 0, 0, 0.25);
  color: #fff;
  width: 28px;
  height: 28px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  line-height: 1;
  cursor: pointer;
}

.segw__story-content {
  position: relative;
  z-index: 5;
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 8px;
  padding: var(--space-2);
  padding-bottom: 100px;
  overflow-y: auto;
}

.segw__story-content.is-lesson {
  justify-content: center;
}

.segw__story-content.is-quiz-mode {
  justify-content: flex-start;
  gap: 12px;
  padding-top: 18px;
}

.segw__story-content.is-quiz-intro {
  justify-content: center;
}

.segw__quiz-intro-emoji {
  font-size: 64px;
  line-height: 1;
  text-align: center;
  margin: 4px 0;
  animation: segwQuizScaleIn var(--transition-slow) ease-out both;
}

.segw__quiz-intro-title {
  margin: 0;
  text-align: center;
  font-size: clamp(26px, 5.4vw, 32px);
  line-height: 1.2;
  font-weight: 700;
}

.segw__quiz-intro-subtitle {
  margin: 0;
  text-align: center;
  color: rgba(255, 255, 255, 0.82);
  font-size: 18px;
  line-height: 1.45;
}

.segw__quiz-benefits {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: var(--radius-lg);
  padding: var(--space-2);
}

.segw__quiz-benefits-title {
  margin: 0 0 var(--space-1);
  font-size: var(--text-sm);
  color: rgba(255, 255, 255, 0.88);
}

.segw__quiz-benefits-list {
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: var(--space-1);
}

.segw__quiz-benefit-item {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  opacity: 0;
  animation: segwQuizFadeIn var(--transition-base) ease-out forwards;
}

.segw__quiz-benefit-icon {
  font-weight: 700;
}

.segw__quiz-question-block-title {
  margin: 0;
  font-size: var(--text-xl);
  font-weight: 600;
  color: rgba(255, 255, 255, 0.82);
}

.segw__quiz-question-title {
  margin: 0;
  font-size: var(--text-2xl);
  line-height: 1.3;
  font-weight: 600;
}

.segw__quiz-options {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  margin-top: 6px;
}

.segw__quiz-options--horizontal {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.segw__quiz-option {
  border: 2px solid transparent;
  border-radius: var(--radius-md);
  padding: var(--space-2);
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
  font-size: var(--text-base);
  text-align: center;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.segw__quiz-option:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.02);
}

.segw__quiz-option.is-selected {
  background: #fff;
  color: #667eea;
  border-color: #fff;
  font-weight: 600;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.segw__quiz-result-emoji {
  font-size: 64px;
  line-height: 1;
  text-align: center;
  margin: 4px 0;
  animation: segwQuizScaleIn var(--transition-slow) ease-out both;
}

.segw__quiz-result-title {
  margin: 0;
  text-align: center;
  font-size: clamp(26px, 5.4vw, 32px);
  line-height: 1.2;
  font-weight: 700;
}

.segw__quiz-result-badge {
  border: 2px solid var(--quiz-profile-color, #4caf50);
  background: rgba(255, 255, 255, 0.2);
  border-radius: var(--radius-lg);
  padding: var(--space-2);
  animation: segwQuizScaleIn var(--transition-base) ease-out;
}

.segw__quiz-result-badge-name {
  margin: 0;
  text-align: center;
  font-size: var(--text-2xl);
  line-height: 1.2;
  font-weight: 600;
}

.segw__quiz-result-description {
  margin: 0;
  text-align: center;
  color: rgba(255, 255, 255, 0.82);
  font-size: var(--text-base);
}

.segw__quiz-allocation-card {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: var(--radius-lg);
  padding: var(--space-2);
  display: grid;
  gap: var(--space-1);
}

.segw__quiz-allocation-title {
  margin: 0;
  font-size: var(--text-lg);
  line-height: 1.3;
  font-weight: 600;
}

.segw__quiz-allocation-pie {
  width: 160px;
  height: 160px;
  margin: 0 auto;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.34);
  animation: segwQuizPieIn 800ms ease-out both;
}

.segw__quiz-allocation-breakdown {
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 6px;
  animation: segwQuizFadeIn var(--transition-base) ease-out 220ms both;
}

.segw__quiz-allocation-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 4px 2px;
}

.segw__quiz-allocation-label {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.segw__quiz-allocation-color {
  width: 14px;
  height: 14px;
  border-radius: 4px;
}

.segw__quiz-allocation-color.is-stocks {
  background: #60a5fa;
}

.segw__quiz-allocation-color.is-bonds {
  background: #34d399;
}

.segw__quiz-allocation-color.is-alt {
  background: #fbbf24;
}

.segw__quiz-allocation-color.is-cash {
  background: #c4b5fd;
}

.segw__quiz-allocation-value {
  font-weight: 700;
}

@keyframes segwQuizFadeIn {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes segwQuizScaleIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes segwQuizPieIn {
  from {
    opacity: 0;
    transform: scale(0.88);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.segw__story-content.is-enter-next {
  animation: segwStorySlideNext var(--transition-base);
}

.segw__story-content.is-enter-prev {
  animation: segwStorySlidePrev var(--transition-base);
}

@keyframes segwStorySlideNext {
  from {
    opacity: 0;
    transform: translateX(36px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes segwStorySlidePrev {
  from {
    opacity: 0;
    transform: translateX(-36px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.segw__story-emoji {
  font-size: 64px;
  line-height: 1;
  text-align: center;
  margin-bottom: 2px;
}

.segw__onboarding-step-title {
  margin: 0;
  text-align: center;
  font-size: var(--text-2xl);
  line-height: 1.2;
  font-weight: 700;
}

.segw__onboarding-step-text {
  margin: 0;
  text-align: center;
  color: rgba(255, 255, 255, 0.9);
  font-size: var(--text-base);
  line-height: 1.45;
}

.segw__onboarding-points {
  margin: 2px 0 0;
  padding-left: 18px;
  display: grid;
  gap: var(--space-1);
  font-size: var(--text-sm);
  color: rgba(255, 255, 255, 0.94);
}

.segw__onboarding-points li {
  padding: 8px 10px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.14);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.segw__lesson1-screen {
  display: grid;
  gap: 14px;
  align-content: start;
}

.segw__lesson1-screen--hero,
.segw__lesson1-screen--cta {
  min-height: 100%;
  align-content: center;
}

.segw__lesson1-emoji {
  font-size: 58px;
  line-height: 1;
  text-align: center;
}

.segw__lesson1-title {
  margin: 0;
  font-size: 32px;
  line-height: 1.2;
  text-align: center;
}

.segw__lesson1-subtitle,
.segw__lesson1-body {
  margin: 0;
  font-size: 16px;
  line-height: 1.45;
  color: rgba(255, 255, 255, 0.9);
}

.segw__lesson1-subtitle {
  text-align: center;
}

.segw__lesson1-visual {
  min-height: 124px;
  border-radius: 16px;
  border: 1px dashed rgba(255, 255, 255, 0.42);
  background: rgba(255, 255, 255, 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 14px;
}

.segw__lesson1-visual-text {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.82);
}

.segw__lesson1-highlight {
  display: flex;
  align-items: center;
  gap: 10px;
  border-radius: 14px;
  padding: 12px 14px;
  background: rgba(76, 175, 80, 0.24);
  border: 1px solid rgba(76, 175, 80, 0.6);
}

.segw__lesson1-highlight-icon {
  width: 26px;
  height: 26px;
  border-radius: 999px;
  background: #4caf50;
  color: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  flex: 0 0 auto;
}

.segw__lesson1-highlight-text {
  font-size: 16px;
  font-weight: 600;
}

.segw__lesson1-step-cards {
  display: grid;
  gap: 10px;
}

.segw__lesson1-step-card {
  border-radius: 14px;
  padding: 12px 14px;
  background: rgba(255, 255, 255, 0.16);
  border: 1px solid rgba(255, 255, 255, 0.3);
  animation: segwQuizFadeIn 300ms ease both;
}

.segw__lesson1-step-head {
  display: flex;
  align-items: center;
  gap: 8px;
}

.segw__lesson1-step-num {
  width: 24px;
  height: 24px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.24);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
}

.segw__lesson1-step-emoji {
  font-size: 18px;
}

.segw__lesson1-step-title {
  font-size: 16px;
}

.segw__lesson1-step-description {
  margin: 8px 0 0;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.88);
}

.segw__lesson1-cards-scroller {
  display: grid;
  gap: 10px;
  max-height: 340px;
  overflow-y: auto;
  padding-right: 2px;
}

.segw__lesson1-instrument-card {
  border-radius: 14px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.14);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.segw__lesson1-instrument-card.is-highlighted {
  border-color: rgba(245, 166, 35, 0.9);
  box-shadow: 0 0 0 2px rgba(245, 166, 35, 0.28);
}

.segw__lesson1-instrument-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.segw__lesson1-badge {
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 999px;
  background: rgba(245, 166, 35, 0.22);
  border: 1px solid rgba(245, 166, 35, 0.72);
}

.segw__lesson1-instrument-description {
  margin: 8px 0 0;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.88);
}

.segw__lesson1-instrument-risk {
  margin: 8px 0 0;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.95);
}

.segw__lesson1-goal-accent {
  margin-top: 4px;
  border-radius: 14px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.18);
  border: 1px solid rgba(255, 255, 255, 0.32);
  font-size: 14px;
  line-height: 1.4;
}

.segw__lesson1-cta-actions {
  display: grid;
  gap: 10px;
}

.segw__lesson1-cta {
  width: 100%;
  min-height: 50px;
  border-radius: 14px;
  border: 0;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
}

.segw__lesson1-cta--primary {
  background: #f5a623;
  color: #1f2937;
}

.segw__lesson1-cta--secondary {
  background: rgba(255, 255, 255, 0.26);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.45);
}

.segw__onboarding-meta {
  position: relative;
  z-index: 6;
  margin: 0;
  padding: 8px 20px 0;
  color: rgba(255, 255, 255, 0.82);
  text-align: center;
  font-size: 13px;
}

.segw__story-hint {
  position: relative;
  z-index: 6;
  margin: 0;
  padding: 4px 20px 12px;
  text-align: center;
  color: rgba(255, 255, 255, 0.55);
  font-size: 12px;
}

.segw__story-tapzones {
  position: absolute;
  z-index: 4;
  top: 46px;
  left: 0;
  right: 0;
  bottom: 86px;
  display: flex;
}

.segw__story-tap {
  border: 0;
  background: transparent;
  cursor: pointer;
  padding: 0;
}

.segw__story-tap--prev {
  width: 30%;
}

.segw__story-tap--next {
  width: 70%;
}

.segw__story-footer {
  position: sticky;
  bottom: 0;
  margin-top: auto;
  z-index: 8;
  padding: var(--space-2);
  padding-bottom: max(var(--space-3), env(safe-area-inset-bottom));
  background: linear-gradient(to top, rgba(0, 0, 0, 0.86), rgba(0, 0, 0, 0));
}

.segw__story-next {
  width: 100%;
  border: 0;
  min-height: 52px;
}

.segw__story-next.is-quiz-cta {
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
  box-shadow: none;
}

.segw__story-next.is-quiz-cta:hover {
  background: rgba(255, 255, 255, 0.3);
}

.segw__story-next:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.segw__onboarding.is-entering .segw__story-frame {
  animation: segwLessonsEnter var(--transition-slow) both;
}

@keyframes segwLessonsEnter {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.segw__btn {
  border: 0;
  background: var(--segw-primary);
  color: #fff;
  border-radius: 10px;
  padding: 10px 12px;
  font-weight: 600;
  cursor: pointer;
}

.segw__btn--secondary,
.segw__btn-secondary {
  background: #fff;
  color: #2a3b52;
  border: 1px solid #d7e0ee;
}

.segw__btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.segw__onboarding-done {
  margin: 12px 0 0;
  color: #1f6f44;
  background: #ecf8f0;
  border: 1px solid #bfe4cb;
  border-radius: 10px;
  padding: 9px 10px;
  font-size: 0.87rem;
}

.segw__onboarding-footer {
  margin-top: 12px;
  display: flex;
  gap: 10px;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
}

.segw__onboarding-footer .segw__route--ghost {
  border-color: rgba(25, 65, 153, 0.3);
  color: #194199;
  background: #fff;
}

.segw__is-hidden {
  display: none !important;
}

.segw__json {
  margin: 10px 0 0;
  border: 1px solid rgba(255, 255, 255, 0.35);
  border-radius: 10px;
  overflow: hidden;
}

.segw__json summary {
  cursor: pointer;
  padding: 8px 10px;
  font-size: 0.83rem;
  background: rgba(255, 255, 255, 0.08);
}

.segw__json pre {
  margin: 0;
  padding: 10px;
  background: rgba(18, 28, 53, 0.48);
  overflow: auto;
  font-size: 0.73rem;
  line-height: 1.45;
}

@media (min-width: 768px) {
  .segw__story-frame {
    min-height: min(90vh, 932px);
    height: min(90vh, 932px);
    max-height: 90vh;
    border-radius: 20px;
  }
}

@media (max-width: 720px) {
  .segw__questionnaire {
    padding: 0;
  }

  .segw__seg-story-frame {
    max-width: none;
    min-height: 100dvh;
    height: 100dvh;
    border-radius: 0;
    box-shadow: none;
  }

  .segw__story-wrapper {
    min-height: auto;
    padding: 0;
    border-radius: 0;
    background: #000;
  }

  .segw__story-frame {
    max-width: none;
    border-radius: 0;
    min-height: 100dvh;
    height: 100dvh;
  }

  .segw__onboarding-footer {
    flex-direction: column;
    align-items: stretch;
  }

  .segw__btn,
  .segw__route {
    width: 100%;
    justify-content: center;
  }
}
`;

  var WIDGET_HTML = `
<div data-segmentation-widget class="segw">
  <div class="segw__questionnaire" data-role="questionnaire">
    <article class="segw__seg-story-frame">
      <header class="segw__seg-story-header">
        <button
          type="button"
          class="segw__seg-story-close"
          data-action="seg-reset"
          aria-label="Сбросить анкету"
        >
          ×
        </button>
        <span class="segw__seg-story-counter" data-role="seg-counter">1/7</span>
      </header>

      <div class="segw__seg-story-progress" data-role="seg-progress"></div>
      <div class="segw__seg-story-content" data-role="seg-content"></div>

      <footer class="segw__seg-story-footer" data-role="seg-footer">
        <button
          type="button"
          class="segw__seg-story-next"
          data-action="seg-next"
          data-role="seg-next"
          disabled
        >
          Далее →
        </button>
      </footer>
    </article>
  </div>

  <section class="segw__onboarding is-hidden" data-role="onboarding">
    <div class="segw__story-wrapper">
      <article class="segw__story-frame" data-role="story-frame">
        <div class="segw__story-progress" data-role="story-progress"></div>
        <div class="segw__story-header">
          <p class="segw__onboarding-kicker" data-role="onboarding-title">Персональный онбординг</p>
          <button type="button" class="segw__story-close" data-action="restart-segmentation" aria-label="Закрыть онбординг">
            ×
          </button>
        </div>

        <div class="segw__story-content" data-role="story-content"></div>

        <p class="segw__onboarding-meta" data-role="onboarding-counter">Урок 1 из 6</p>
        <p class="segw__story-hint" data-role="onboarding-hint">
          Тап по правой части — следующий экран, по левой — предыдущий.
        </p>

        <div class="segw__story-tapzones">
          <button
            type="button"
            class="segw__story-tap segw__story-tap--prev"
            data-action="onboarding-prev"
            aria-label="Предыдущий экран"
          ></button>
          <button
            type="button"
            class="segw__story-tap segw__story-tap--next"
            data-action="onboarding-next"
            aria-label="Следующий экран"
          ></button>
        </div>

        <div class="segw__story-footer">
          <button type="button" class="segw__story-next segw__btn-primary" data-action="onboarding-next" data-role="onboarding-next-label">
            Далее
          </button>
        </div>
      </article>
    </div>

    <p class="segw__onboarding-done segw__is-hidden" data-role="onboarding-done">
      Модуль завершен. Можно перейти к следующему шагу оформления.
    </p>

    <div class="segw__onboarding-footer">
      <button type="button" class="segw__btn-secondary" data-action="restart-segmentation">
        Изменить ответы анкеты
      </button>
      <a href="#" class="segw__route segw__route--ghost segw__is-hidden" data-role="onboarding-route-link">
        Открыть полную версию на отдельной странице
      </a>
    </div>
  </section>
</div>
`;

  var AMOUNT_LABELS = {
    up_to_300k: "До 300 тыс. ₽",
    "300k_2m": "300 тыс. – 2 млн ₽",
    "2m_5m": "2–5 млн ₽",
    more_5m: "Более 5 млн ₽",
  };

  var GOAL_LABELS = {
    purchase: "Накопить на крупную покупку",
    passive_income: "Получать пассивный доход",
    growth: "Увеличить капитал",
    preservation: "Сохранить капитал",
  };

  var INSTRUMENT_LABELS = {
    etf: "ETF",
    stocks: "Акции",
    bonds: "Облигации",
    trust_management: "Доверительное управление",
    ipo: "IPO",
    currency: "Валюта",
    structured: "Структурные продукты",
    derivatives: "Производные инструменты",
  };

  var SEGMENT_LABELS = {
    novice: "Новичок",
    advanced: "Обучающийся",
    expert: "Квалифицированный инвестор",
  };

  var ONBOARDING_PLAN_LABELS = {
    novice: "Полный курс",
    advanced: "Сокращённый курс",
    expert: "Минимальный маршрут + анкета риска",
  };

  var SEGMENTATION_TOTAL_SEGMENTS = 7;
  var SEGMENTATION_STORY_ORDER = ["experience", "amount", "goal", "instruments", "qualified"];
  var SEGMENTATION_STORY_STEPS = {
    experience: {
      action: "experience",
      blockTitle: "Опыт инвестирования",
      title: "Какой у вас опыт инвестирования?",
      subtitle: "",
      multiple: false,
      options: [
        { value: "none", label: "Нет опыта, только начинаю" },
        { value: "less_1y", label: "Менее 1 года" },
        { value: "1_3y", label: "1–3 года" },
        { value: "3_5y", label: "3–5 лет" },
        { value: "more_5y", label: "Более 5 лет" },
      ],
    },
    amount: {
      action: "amount",
      blockTitle: "Сумма инвестиций",
      title: "Какую сумму вы планируете инвестировать?",
      subtitle: "",
      multiple: false,
      options: [
        { value: "up_to_300k", label: "До 300 тыс. ₽" },
        { value: "300k_2m", label: "300 тыс. – 2 млн ₽" },
        { value: "2m_5m", label: "2–5 млн ₽" },
        { value: "more_5m", label: "Более 5 млн ₽" },
      ],
    },
    goal: {
      action: "goal",
      blockTitle: "Цель инвестирования",
      title: "Какая у вас основная цель инвестирования?",
      subtitle: "",
      multiple: false,
      options: [
        { value: "purchase", label: "Накопить на крупную покупку" },
        { value: "passive_income", label: "Получать пассивный доход" },
        { value: "growth", label: "Увеличить капитал" },
        { value: "preservation", label: "Сохранить капитал" },
      ],
    },
    instruments: {
      action: "instrument",
      blockTitle: "Интересующие инструменты",
      title: "Какие инструменты вас интересуют?",
      subtitle: "(можно выбрать несколько)",
      multiple: true,
      options: [
        { value: "etf", label: "ETF" },
        { value: "stocks", label: "Акции" },
        { value: "bonds", label: "Облигации" },
        { value: "trust_management", label: "Доверительное управление" },
        { value: "ipo", label: "IPO" },
        { value: "currency", label: "Валюта" },
        { value: "structured", label: "Структурные продукты" },
        { value: "derivatives", label: "Производные инструменты" },
      ],
    },
    qualified: {
      action: "qualified",
      blockTitle: "Статус инвестора",
      title: "Являетесь ли вы квалифицированным инвестором?",
      subtitle: "",
      helper:
        "Квалифицированный инвестор — статус для опытных инвесторов с активами от 6 млн ₽",
      multiple: false,
      options: [
        { value: "true", label: "Да" },
        { value: "false", label: "Нет" },
      ],
    },
  };

  var SEGMENTATION_RESULT_META = {
    novice: {
      emoji: "🌱",
      title: "Новичок",
      track: ["6 уроков", "Анкета риска", "Первая покупка"],
    },
    advanced: {
      emoji: "🚀",
      title: "Обучающийся",
      track: ["3 урока", "Анкета риска", "Первая покупка"],
    },
    expert: {
      emoji: "⚡",
      title: "Квалифицированный инвестор",
      track: ["Анкета риска", "Персональные рекомендации", "Первая покупка"],
    },
  };

  var ROUTE_PREP_TEXT_BY_SEGMENT = {
    novice: "Маршрут для мягкого старта: база, практика и первый шаг к покупке.",
    advanced: "Маршрут для ускорения: точечные экраны, риск-контроль и оптимизация действий.",
    expert: "Маршрут для эксперта: компактная программа, риск-профиль и персональные рекомендации.",
  };

  var ONBOARDING_ROUTE_BY_SEGMENT = {
    novice: "/onboarding/full-course",
    advanced: "/onboarding/short-course",
    expert: "/onboarding/minimal-risk-form",
  };

  var INLINE_STORY_TOTAL_SEGMENTS = 6;
  var QUIZ_TOTAL_SEGMENTS = 6;
  var QUIZ_THEME_GRADIENT = "var(--gradient-lesson-1)";
  var QUIZ_PROFILE_ORDER = ["conservative", "moderate", "aggressive", "ultra_aggressive"];
  var QUIZ_PROFILE_PRESENTATION = {
    conservative: {
      name: "Консервативный",
      emoji: "🛡️",
      color: "#2196F3",
      description: "Приоритет — сохранение капитала и стабильный доход.",
    },
    moderate: {
      name: "Умеренный",
      emoji: "⚖️",
      color: "#4CAF50",
      description: "Баланс между ростом и защитой капитала.",
    },
    aggressive: {
      name: "Агрессивный",
      emoji: "🚀",
      color: "#FF9800",
      description: "Приоритет — максимальный рост капитала.",
    },
    ultra_aggressive: {
      name: "Сверхагрессивный",
      emoji: "⚡",
      color: "#F44336",
      description: "Готовность к высоким рискам ради высокой доходности.",
    },
  };
  var QUIZ_PROFILE_ALLOCATIONS = {
    conservative: {
      stocks_pct: 20,
      bonds_pct: 65,
      alternatives_pct: 5,
      cash_pct: 10,
    },
    moderate: {
      stocks_pct: 50,
      bonds_pct: 40,
      alternatives_pct: 5,
      cash_pct: 5,
    },
    aggressive: {
      stocks_pct: 75,
      bonds_pct: 15,
      alternatives_pct: 10,
      cash_pct: 0,
    },
    ultra_aggressive: {
      stocks_pct: 90,
      bonds_pct: 0,
      alternatives_pct: 10,
      cash_pct: 0,
    },
  };
  var QUIZ_EXPERIENCE_SCORE = {
    none: 1,
    less_1y: 2,
    "1_3y": 3,
    "3_5y": 3,
    more_5y: 4,
  };
  var QUIZ_AMOUNT_SCORE = {
    up_to_300k: 2,
    "300k_2m": 3,
    "2m_5m": 3,
    more_5m: 4,
  };
  var QUIZ_GOAL_SCORE = {
    preservation: 1,
    purchase: 2,
    passive_income: 2,
    growth: 3,
  };
  var QUIZ_INSTRUMENT_SCORE = {
    etf: 1,
    stocks: 1,
    bonds: 1,
    trust_management: 0,
    ipo: 1,
    currency: 1,
    structured: 2,
    derivatives: 2,
  };
  var QUIZ_QUESTIONS = [
    {
      id: "Q5",
      blockTitle: "Финансовое положение",
      question:
        "Есть ли у вас финансовая подушка безопасности (резерв на 3-6 месяцев расходов)?",
      layout: "vertical",
      options: [
        { id: "a", text: "Нет, резерва нет", score: 1 },
        { id: "b", text: "Да, на 1-3 месяца", score: 2 },
        { id: "c", text: "Да, на 3-6 месяцев", score: 3 },
        { id: "d", text: "Да, более чем на 6 месяцев", score: 4 },
      ],
    },
    {
      id: "Q6",
      blockTitle: "Горизонт инвестирования",
      question: "На какой срок вы планируете инвестировать?",
      layout: "horizontal",
      options: [
        { id: "a", text: "Менее 1 года", score: 1 },
        { id: "b", text: "1-3 года", score: 2 },
        { id: "c", text: "3-5 лет", score: 3 },
        { id: "d", text: "Более 5 лет", score: 4 },
      ],
    },
    {
      id: "Q7",
      blockTitle: "Отношение к риску",
      question: "Как вы оцениваете свое отношение к риску?",
      layout: "vertical",
      options: [
        {
          id: "a",
          text: "Риски должны быть минимальными, я не готов(а) к потерям",
          score: 1,
        },
        {
          id: "b",
          text: "Готов(а) к небольшим колебаниям ради умеренного дохода",
          score: 2,
        },
        {
          id: "c",
          text: "Принимаю значительные колебания ради хорошей доходности",
          score: 3,
        },
        {
          id: "d",
          text: "Готов(а) к существенным потерям ради максимальной доходности",
          score: 4,
        },
      ],
    },
    {
      id: "Q8",
      blockTitle: "Поведение при падении",
      question: "Представьте: за 3 месяца ваши инвестиции упали на 20%. Что вы сделаете?",
      layout: "vertical",
      options: [
        { id: "a", text: "Продам все и переведу на вклад", score: 1 },
        {
          id: "b",
          text: "Продам часть и переложу в более надежные инструменты",
          score: 2,
        },
        { id: "c", text: "Подожду восстановления, ничего не буду делать", score: 3 },
        { id: "d", text: "Докуплю подешевевшие активы", score: 4 },
      ],
    },
  ];

  function getQuizAnswer(inlineState, questionId) {
    if (!inlineState || !inlineState.quizAnswers) {
      return null;
    }
    return inlineState.quizAnswers[questionId] || null;
  }

  function scoreToRiskProfile(score) {
    if (score <= 13) {
      return "conservative";
    }
    if (score <= 19) {
      return "moderate";
    }
    if (score <= 25) {
      return "aggressive";
    }
    return "ultra_aggressive";
  }

  function selfAssessmentToRiskProfile(score) {
    if (score <= 1) {
      return "conservative";
    }
    if (score === 2) {
      return "moderate";
    }
    if (score === 3) {
      return "aggressive";
    }
    return "ultra_aggressive";
  }

  function capRiskProfile(rawProfile, capProfile) {
    var rawIndex = QUIZ_PROFILE_ORDER.indexOf(rawProfile);
    var capIndex = QUIZ_PROFILE_ORDER.indexOf(capProfile);

    if (rawIndex === -1 || capIndex === -1) {
      return "conservative";
    }

    return QUIZ_PROFILE_ORDER[Math.min(rawIndex, capIndex)];
  }

  function calculateInstrumentRiskScore(instruments) {
    if (!Array.isArray(instruments) || !instruments.length) {
      return 0;
    }

    var sum = 0;
    for (var i = 0; i < instruments.length; i += 1) {
      var instrument = instruments[i];
      sum += QUIZ_INSTRUMENT_SCORE[instrument] || 0;
    }

    return Math.min(sum, 4);
  }

  function calculateInlineQuizResult(payload, quizAnswers) {
    if (!payload) {
      return null;
    }

    var answers = quizAnswers || {};
    var q5 = answers.Q5 || null;
    var q6 = answers.Q6 || null;
    var q7 = answers.Q7 || null;
    var q8 = answers.Q8 || null;
    var totalScore =
      (QUIZ_EXPERIENCE_SCORE[payload.experience] || 1) +
      (QUIZ_AMOUNT_SCORE[payload.amount_tier] || 2) +
      (QUIZ_GOAL_SCORE[payload.investment_goal] || 2) +
      calculateInstrumentRiskScore(payload.instruments) +
      (q5 ? q5.score : 0) +
      (q6 ? q6.score : 0) +
      (q7 ? q7.score : 0) +
      (q8 ? q8.score : 0);
    var rawProfile = scoreToRiskProfile(totalScore);
    var selfCap = selfAssessmentToRiskProfile(q7 ? q7.score : 4);
    var finalProfile = capRiskProfile(rawProfile, selfCap);

    return {
      total_score: totalScore,
      raw_profile: rawProfile,
      self_assessment_cap: selfCap,
      final_profile: finalProfile,
      allocation: QUIZ_PROFILE_ALLOCATIONS[finalProfile] || QUIZ_PROFILE_ALLOCATIONS.conservative,
    };
  }

  function buildRiskQuizSteps() {
    var steps = [
      {
        kind: "quiz_intro",
        quizIndex: 0,
        gradient: QUIZ_THEME_GRADIENT,
        emoji: "🎯",
        title: "Определим ваш риск-профиль",
        subtitle: "Это займет всего 1 минуту и поможет подобрать подходящие инструменты.",
        benefits: [
          "Ваша готовность к риску",
          "Рекомендуемая аллокация",
          "Подходящие инструменты",
        ],
      },
    ];

    for (var i = 0; i < QUIZ_QUESTIONS.length; i += 1) {
      steps.push({
        kind: "quiz_question",
        quizIndex: i + 1,
        gradient: QUIZ_THEME_GRADIENT,
        question: QUIZ_QUESTIONS[i],
      });
    }

    steps.push({
      kind: "quiz_result",
      quizIndex: QUIZ_TOTAL_SEGMENTS - 1,
      gradient: QUIZ_THEME_GRADIENT,
      title: "Ваш риск-профиль определен",
    });

    return steps;
  }

  function insertRiskQuizSteps(segment, lessonSteps) {
    var quizSteps = buildRiskQuizSteps();
    if (!Array.isArray(lessonSteps) || !lessonSteps.length) {
      return quizSteps;
    }

    if (segment === "expert") {
      return quizSteps.concat(lessonSteps);
    }

    var insertAfterIndex = -1;
    for (var i = 0; i < lessonSteps.length; i += 1) {
      var lessonValue = lessonSteps[i] && typeof lessonSteps[i].lesson === "number"
        ? lessonSteps[i].lesson
        : null;
      if (lessonValue !== null && lessonValue <= 3) {
        insertAfterIndex = i;
      }
    }

    if (insertAfterIndex === -1) {
      return lessonSteps.concat(quizSteps);
    }

    return lessonSteps
      .slice(0, insertAfterIndex + 1)
      .concat(quizSteps, lessonSteps.slice(insertAfterIndex + 1));
  }

  function hasConfiguredExternalOnboarding() {
    return Boolean(
      WIDGET_OPTIONS.onboardingBaseUrl ||
        WIDGET_OPTIONS.onboardingUrlMap.novice ||
        WIDGET_OPTIONS.onboardingUrlMap.advanced ||
        WIDGET_OPTIONS.onboardingUrlMap.expert,
    );
  }

  function getOnboardingMode() {
    var rawMode = (WIDGET_OPTIONS.onboardingMode || "inline").toLowerCase();

    if (rawMode === "external" || rawMode === "inline" || rawMode === "auto") {
      return rawMode;
    }

    return "inline";
  }

  function shouldUseInlineOnboarding() {
    var mode = getOnboardingMode();

    if (mode === "external") {
      return false;
    }

    if (mode === "inline") {
      return true;
    }

    return !hasConfiguredExternalOnboarding();
  }

  function buildFallbackHashTarget(segment, amountTier) {
    return (
      "#finam-segmentation-onboarding?segment=" +
      encodeURIComponent(segment) +
      "&amountTier=" +
      encodeURIComponent(amountTier)
    );
  }

  function appendQueryParams(baseUrl, params) {
    var separator = baseUrl.indexOf("?") === -1 ? "?" : "&";
    return baseUrl + separator + params;
  }

  function redirectToTarget(targetUrl, skipNavigation) {
    if (skipNavigation) {
      return targetUrl;
    }

    if (WIDGET_OPTIONS.openInNewTab) {
      var openedWindow = window.open(targetUrl, "_blank", "noopener,noreferrer");
      if (openedWindow) {
        return targetUrl;
      }
      // Popup blockers can prevent window.open; fallback to same-tab navigation.
    }

    window.location.href = targetUrl;
    return targetUrl;
  }

  function ensureStyles() {
    if (document.getElementById(STYLE_ID)) {
      return;
    }
    var styleElement = document.createElement("style");
    styleElement.id = STYLE_ID;
    styleElement.textContent = WIDGET_CSS;
    document.head.appendChild(styleElement);
  }

  function createWidgetRoot() {
    var container = document.createElement("div");
    container.innerHTML = WIDGET_HTML.trim();
    return container.firstElementChild;
  }

  function calculateSegment(qualifiedInvestor, experience) {
    if (qualifiedInvestor === null) {
      return null;
    }

    if (qualifiedInvestor === true) {
      return "expert";
    }

    if (experience === "none" || experience === "less_1y") {
      return "novice";
    }

    if (experience === "1_3y" || experience === "3_5y") {
      return "advanced";
    }

    if (experience === "more_5y") {
      return "expert";
    }

    return null;
  }

  function trackEvent(eventName, payload) {
    if (WIDGET_OPTIONS.disableTracking) {
      return;
    }

    var safePayload = payload || {};

    try {
      if (Array.isArray(window.dataLayer)) {
        window.dataLayer.push(
          Object.assign(
            {
              event: eventName,
            },
            safePayload,
          ),
        );
      }
    } catch (error) {
      if (window.console && typeof window.console.warn === "function") {
        window.console.warn("[segmentation] dataLayer push failed", error);
      }
    }

    try {
      if (typeof window.gtag === "function") {
        window.gtag("event", eventName, safePayload);
      }
    } catch (error) {
      if (window.console && typeof window.console.warn === "function") {
        window.console.warn("[segmentation] gtag failed", error);
      }
    }

    try {
      if (window.console && typeof window.console.info === "function") {
        window.console.info("[segmentation]", eventName, safePayload);
      }
    } catch (error) {
      // no-op
    }
  }

  function safeInvokeNavigate(fn, segment, amountTier, target, fallbackTarget) {
    try {
      var result = fn(segment, amountTier, target, fallbackTarget);
      return typeof result === "string" && result ? result : fallbackTarget;
    } catch (error) {
      if (window.console && typeof window.console.warn === "function") {
        window.console.warn("[segmentation] custom navigate callback failed", error);
      }
      return fallbackTarget;
    }
  }

  function safeInvokeComplete(payload) {
    if (typeof window.onSegmentationComplete !== "function") {
      return;
    }

    try {
      window.onSegmentationComplete(payload);
    } catch (error) {
      if (window.console && typeof window.console.warn === "function") {
        window.console.warn("[segmentation] onSegmentationComplete failed", error);
      }
    }
  }

  function navigateToOnboarding(segment, amountTier, options) {
    var skipNavigation = options && options.skipNavigation === true;
    var baseRoute = ONBOARDING_ROUTE_BY_SEGMENT[segment];
    var target = baseRoute + "?amountTier=" + encodeURIComponent(amountTier);
    var customSegmentUrl = WIDGET_OPTIONS.onboardingUrlMap[segment];
    var fallbackHashTarget = buildFallbackHashTarget(segment, amountTier);
    var queryParams =
      "segment=" + encodeURIComponent(segment) + "&amountTier=" + encodeURIComponent(amountTier);

    if (customSegmentUrl) {
      return redirectToTarget(
        appendQueryParams(
          customSegmentUrl,
          "amountTier=" + encodeURIComponent(amountTier) + "&segment=" + encodeURIComponent(segment),
        ),
        skipNavigation,
      );
    }

    if (WIDGET_OPTIONS.onboardingBaseUrl) {
      return redirectToTarget(
        appendQueryParams(WIDGET_OPTIONS.onboardingBaseUrl, queryParams),
        skipNavigation,
      );
    }

    if (skipNavigation) {
      return fallbackHashTarget;
    }

    if (
      window.FinamSegmentationWidget &&
      typeof window.FinamSegmentationWidget.navigateToOnboarding === "function"
    ) {
      return safeInvokeNavigate(
        window.FinamSegmentationWidget.navigateToOnboarding,
        segment,
        amountTier,
        target,
        fallbackHashTarget,
      );
    }

    if (typeof window.__finamSegmentationNavigate === "function") {
      return safeInvokeNavigate(
        window.__finamSegmentationNavigate,
        segment,
        amountTier,
        target,
        fallbackHashTarget,
      );
    }

    if (WIDGET_OPTIONS.useLegacyGlobalNavigate && typeof window.navigateToOnboarding === "function") {
      return safeInvokeNavigate(
        window.navigateToOnboarding,
        segment,
        amountTier,
        target,
        fallbackHashTarget,
      );
    }

    if (WIDGET_OPTIONS.openInNewTab) {
      var currentPageWithoutHash = window.location.href.split("#")[0];
      return redirectToTarget(currentPageWithoutHash + fallbackHashTarget, false);
    }

    window.location.hash = fallbackHashTarget.replace(/^#/, "");
    return fallbackHashTarget;
  }

  function canContinue(state) {
    if (state.qualifiedInvestor === null) {
      return false;
    }

    if (state.amountTier === null || state.goal === null) {
      return false;
    }

    if (!state.instruments.length) {
      return false;
    }

    if (state.qualifiedInvestor === false && state.experience === null) {
      return false;
    }

    return state.segment !== null;
  }

  function buildPayload(state) {
    if (!canContinue(state)) {
      return null;
    }

    return {
      qualified_investor: state.qualifiedInvestor,
      experience: state.qualifiedInvestor ? "more_5y" : state.experience || "more_5y",
      segment: state.segment,
      amount_tier: state.amountTier,
      investment_goal: state.goal,
      instruments: state.instruments.slice(),
    };
  }

  function isSegmentationStepAnswered(state, stepId) {
    if (stepId === "qualified") {
      return state.qualifiedInvestor !== null;
    }
    if (stepId === "experience") {
      return state.experience !== null;
    }
    if (stepId === "amount") {
      return state.amountTier !== null;
    }
    if (stepId === "goal") {
      return state.goal !== null;
    }
    return Array.isArray(state.instruments) && state.instruments.length > 0;
  }

  function isSegmentationOptionSelected(state, stepId, optionValue) {
    if (stepId === "qualified") {
      return String(state.qualifiedInvestor) === optionValue;
    }
    if (stepId === "experience") {
      return state.experience === optionValue;
    }
    if (stepId === "amount") {
      return state.amountTier === optionValue;
    }
    if (stepId === "goal") {
      return state.goal === optionValue;
    }
    return state.instruments.indexOf(optionValue) !== -1;
  }

  function getSegmentationProgressIndex(state) {
    var flow = state.segmentationFlow;
    if (flow.resultPayload) {
      return SEGMENTATION_TOTAL_SEGMENTS - 1;
    }
    if (flow.stepIndex < 0) {
      return 0;
    }
    var index = flow.stepIndex + 1;
    if (index < 0) {
      return 0;
    }
    if (index > SEGMENTATION_TOTAL_SEGMENTS - 1) {
      return SEGMENTATION_TOTAL_SEGMENTS - 1;
    }
    return index;
  }

  function renderSegmentationProgress(progressRoot, progressIndex) {
    if (!progressRoot) {
      return;
    }

    progressRoot.innerHTML = "";
    for (var i = 0; i < SEGMENTATION_TOTAL_SEGMENTS; i += 1) {
      var segment = document.createElement("span");
      segment.className = "segw__seg-story-progress-segment";
      if (i <= progressIndex) {
        segment.classList.add("is-done");
      }
      progressRoot.appendChild(segment);
    }
  }

  function renderSegmentationStory(refs, state) {
    if (!refs.segContent || !refs.segCounter || !refs.segProgress) {
      return;
    }

    var flow = state.segmentationFlow;
    var progressIndex = getSegmentationProgressIndex(state);
    refs.segCounter.textContent = String(progressIndex + 1) + "/" + String(SEGMENTATION_TOTAL_SEGMENTS);
    renderSegmentationProgress(refs.segProgress, progressIndex);

    var isQuestionScreen =
      !flow.resultPayload && flow.stepIndex >= 0 && flow.stepIndex < SEGMENTATION_STORY_ORDER.length;

    if (refs.segFooter) {
      if (isQuestionScreen) {
        refs.segFooter.classList.remove("segw__is-hidden");
      } else {
        refs.segFooter.classList.add("segw__is-hidden");
      }
    }

    if (refs.segNextButton) {
      if (isQuestionScreen) {
        var activeStepId = SEGMENTATION_STORY_ORDER[flow.stepIndex];
        refs.segNextButton.disabled = !isSegmentationStepAnswered(state, activeStepId);
      } else {
        refs.segNextButton.disabled = true;
      }
      refs.segNextButton.textContent = "Далее →";
    }

    refs.segContent.innerHTML = "";
    refs.segContent.classList.remove(
      "is-enter-next",
      "is-enter-prev",
      "is-intro",
      "is-question",
      "is-result",
    );
    refs.segContent.classList.add(flow.direction >= 0 ? "is-enter-next" : "is-enter-prev");

    if (flow.resultPayload) {
      refs.segContent.classList.add("is-result");
      var resultMeta =
        SEGMENTATION_RESULT_META[flow.resultPayload.segment] || SEGMENTATION_RESULT_META.novice;

      var resultWrap = createStoryNode("section", "segw__seg-result");
      resultWrap.appendChild(createStoryNode("div", "segw__seg-result-emoji", "🎉"));
      resultWrap.appendChild(createStoryNode("h3", "segw__seg-result-title", "Ваш путь определён"));

      var resultCard = createStoryNode("div", "segw__seg-result-card");
      var resultBadge = createStoryNode("div", "segw__seg-result-badge");
      var resultPill = createStoryNode("div", "segw__seg-result-pill");
      resultPill.appendChild(createStoryNode("span", "", resultMeta.emoji || "🌱"));
      resultPill.appendChild(createStoryNode("span", "", resultMeta.title || "Новичок"));
      resultBadge.appendChild(resultPill);
      resultCard.appendChild(resultBadge);
      resultCard.appendChild(
        createStoryNode(
          "p",
          "segw__seg-result-description",
          "Мы подготовили для вас пошаговую программу обучения",
        ),
      );

      var track = createStoryNode("div", "segw__seg-track");
      track.appendChild(createStoryNode("h3", "", "Что вас ждёт:"));
      var items = Array.isArray(resultMeta.track) ? resultMeta.track : [];
      for (var t = 0; t < items.length; t += 1) {
        var row = createStoryNode("div", "segw__seg-track-item");
        row.appendChild(createStoryNode("span", "", t === 0 ? "📚" : t === 1 ? "🎯" : "💼"));
        row.appendChild(createStoryNode("span", "", items[t]));
        track.appendChild(row);
      }
      resultCard.appendChild(track);
      resultWrap.appendChild(resultCard);

      var startButton = createStoryNode("button", "segw__seg-cta", "Начать обучение →");
      startButton.type = "button";
      startButton.setAttribute("data-action", "seg-start-onboarding");
      resultWrap.appendChild(startButton);
      refs.segContent.appendChild(resultWrap);
      return;
    }

    if (flow.stepIndex < 0) {
      refs.segContent.classList.add("is-intro");
      var introWrap = createStoryNode("section", "segw__seg-intro");
      introWrap.appendChild(createStoryNode("div", "segw__seg-intro-emoji", "👋"));
      introWrap.appendChild(createStoryNode("h3", "segw__seg-intro-title", "Добро пожаловать!"));
      introWrap.appendChild(
        createStoryNode(
          "p",
          "segw__seg-intro-subtitle",
          "Ответьте на 5 вопросов, чтобы мы подобрали для вас подходящий путь обучения",
        ),
      );

      var introCard = createStoryNode("div", "segw__seg-intro-card");
      var benefits = createStoryNode("ul", "segw__seg-benefits");
      var benefitItems = [
        "Определим ваш опыт",
        "Подберём уроки",
        "Порекомендуем инструменты",
      ];
      for (var b = 0; b < benefitItems.length; b += 1) {
        var benefit = createStoryNode("li");
        benefit.appendChild(createStoryNode("span", "", "✓"));
        benefit.appendChild(createStoryNode("span", "", benefitItems[b]));
        benefits.appendChild(benefit);
      }
      introCard.appendChild(benefits);
      introWrap.appendChild(introCard);
      introWrap.appendChild(createStoryNode("p", "segw__seg-intro-time", "Это займёт 2 минуты"));

      var introButton = createStoryNode("button", "segw__seg-cta", "Начать →");
      introButton.type = "button";
      introButton.setAttribute("data-action", "seg-next");
      introWrap.appendChild(introButton);
      refs.segContent.appendChild(introWrap);
      return;
    }

    var stepId = SEGMENTATION_STORY_ORDER[flow.stepIndex];
    var stepConfig = SEGMENTATION_STORY_STEPS[stepId];
    if (!stepConfig) {
      return;
    }

    refs.segContent.classList.add("is-question");
    var questionWrap = createStoryNode("section", "segw__seg-question");
    questionWrap.appendChild(createStoryNode("p", "segw__seg-block-title", stepConfig.blockTitle));
    questionWrap.appendChild(createStoryNode("h3", "segw__seg-question-title", stepConfig.title));
    if (stepConfig.subtitle) {
      questionWrap.appendChild(createStoryNode("p", "segw__seg-question-subtitle", stepConfig.subtitle));
    }

    var optionsWrap = createStoryNode("div", "segw__seg-options");
    var options = Array.isArray(stepConfig.options) ? stepConfig.options : [];
    for (var o = 0; o < options.length; o += 1) {
      var option = options[o];
      var isSelected = isSegmentationOptionSelected(state, stepId, option.value);
      var optionButton = createStoryNode("button", "segw__seg-option");
      optionButton.type = "button";
      optionButton.setAttribute("data-action", stepConfig.action);
      optionButton.setAttribute("data-value", option.value);
      if (isSelected) {
        optionButton.classList.add("is-selected");
      }
      if (stepConfig.multiple) {
        optionButton.classList.add("is-multiple");
      }

      if (stepConfig.multiple) {
        optionButton.appendChild(
          createStoryNode("span", "segw__seg-option-check", isSelected ? "✓" : "☐"),
        );
      }

      optionButton.appendChild(createStoryNode("span", "", option.label));
      optionsWrap.appendChild(optionButton);
    }
    questionWrap.appendChild(optionsWrap);

      if (stepConfig.helper) {
        var helper = createStoryNode("div", "segw__seg-helper");
        helper.appendChild(createStoryNode("span", "segw__seg-helper-icon", "i"));
        helper.appendChild(createStoryNode("span", "", stepConfig.helper));
        questionWrap.appendChild(helper);
      }

    refs.segContent.appendChild(questionWrap);
  }

  function getInstrumentLabelList(instruments) {
    if (!Array.isArray(instruments) || !instruments.length) {
      return "базовые инструменты";
    }

    return instruments
      .map(function (instrument) {
        return INSTRUMENT_LABELS[instrument] || instrument;
      })
      .join(", ");
  }

  function getStoryGradient(segment, stepIndex) {
    var bySegment = {
      novice: [
        "var(--gradient-lesson-1)",
        "var(--gradient-lesson-2)",
        "var(--gradient-lesson-3)",
        "var(--gradient-lesson-4)",
        "var(--gradient-lesson-5)",
        "var(--gradient-lesson-6)",
      ],
      advanced: [
        "var(--gradient-lesson-4)",
        "var(--gradient-lesson-5)",
        "var(--gradient-lesson-6)",
        "var(--gradient-lesson-1)",
        "var(--gradient-lesson-2)",
        "var(--gradient-lesson-3)",
      ],
      expert: [
        "var(--gradient-lesson-6)",
        "var(--gradient-lesson-2)",
        "var(--gradient-lesson-4)",
        "var(--gradient-lesson-1)",
        "var(--gradient-lesson-5)",
        "var(--gradient-lesson-3)",
      ],
    };

    var palette = bySegment[segment] || bySegment.novice;
    var index = typeof stepIndex === "number" ? stepIndex : 0;
    return palette[index] || palette[palette.length - 1];
  }

  function buildInlineOnboardingSteps(payload) {
    var goalLabel = GOAL_LABELS[payload.investment_goal] || payload.investment_goal;
    var amountLabel = AMOUNT_LABELS[payload.amount_tier] || payload.amount_tier;
    var instrumentList = getInstrumentLabelList(payload.instruments);
    var primaryInstrument =
      payload.instruments && payload.instruments.length
        ? INSTRUMENT_LABELS[payload.instruments[0]] || payload.instruments[0]
        : "инструменты с низким порогом входа";

    function buildStep(lesson, emoji, title, text, hint, points) {
      return {
        kind: "lesson",
        lesson: lesson,
        emoji: emoji,
        title: title,
        text: text,
        hint: hint,
        gradient: getStoryGradient(payload.segment, lesson - 1),
        points: Array.isArray(points) ? points : [],
      };
    }

    if (payload.segment === "novice") {
      var mythByAmount = {
        up_to_300k: {
          text:
            "Даже с 10 000 ₽ можно купить первые бумаги. Многие успешные инвесторы начинали с небольших сумм и постепенно наращивали портфель.",
          highlight: "10 000 ₽ — достаточно для старта",
        },
        "300k_2m": {
          text:
            "С вашей суммой можно сразу собрать диверсифицированный портфель из нескольких инструментов. Это отличная стартовая позиция.",
          highlight: "Ваша сумма позволяет сразу диверсифицировать",
        },
        "2m_5m": {
          text:
            "Ваш капитал открывает доступ ко всем основным стратегиям: от консервативных облигаций до доверительного управления.",
          highlight: "Все основные стратегии доступны",
        },
        more_5m: {
          text:
            "С вашим капиталом доступны все стратегии, включая индивидуальные решения и персонального менеджера.",
          highlight: "Включая индивидуальные стратегии и ДУ",
        },
      };
      var mythContent = mythByAmount[payload.amount_tier] || mythByAmount.up_to_300k;

      var firstStepByAmount = {
        up_to_300k: "Начните с комфортной суммы — от 10 000 ₽",
        "300k_2m": "Переведите сумму, с которой хотите начать",
        "2m_5m": "Переведите часть запланированной суммы",
        more_5m: "Переведите первый транш для формирования портфеля",
      };
      var firstStepText = firstStepByAmount[payload.amount_tier] || firstStepByAmount.up_to_300k;

      var goalAccentByGoal = {
        purchase:
          "Для накопления на покупку лучше всего подходят облигации — предсказуемый доход к нужной дате.",
        passive_income:
          "Для пассивного дохода обратите внимание на дивидендные акции и купонные облигации.",
        growth: "Для роста капитала основной инструмент — акции и ETF на индексы.",
        preservation:
          "Для сохранения капитала подойдут ОФЗ и фонды облигаций — защита от инфляции.",
      };
      var goalAccent = goalAccentByGoal[payload.investment_goal] || goalAccentByGoal.growth;

      var lessonOneCards = [
        {
          id: "stocks",
          name: "Акции",
          description: "Доли в компаниях. Могут расти в цене и платить дивиденды.",
          risk_label: "🔴 Высокий",
          highlighted: payload.instruments.indexOf("stocks") !== -1,
        },
        {
          id: "bonds",
          name: "Облигации",
          description: "Долговые бумаги. Предсказуемый доход, низкий риск.",
          risk_label: "🟢 Низкий",
          highlighted: payload.instruments.indexOf("bonds") !== -1,
        },
        {
          id: "etf",
          name: "Фонды (ETF)",
          description: "Готовые корзины из десятков бумаг. Диверсификация в одной покупке.",
          risk_label: "🟡 Средний",
          highlighted: payload.instruments.indexOf("etf") !== -1,
        },
        {
          id: "currency",
          name: "Валюта",
          description: "Покупка долларов, евро и юаней на бирже по выгодному курсу.",
          risk_label: "🟡 Средний",
          highlighted: payload.instruments.indexOf("currency") !== -1,
        },
      ];

      var noviceSteps = [
        {
          kind: "lesson1_hero",
          lesson: 1,
          screen_id: "screen_1_1",
          screen_number: 1,
          gradient: "var(--gradient-lesson-1)",
          emoji: "🚀",
          title: "Инвестировать проще, чем кажется",
          subtitle:
            "Вы уже сделали первый шаг — открыли счёт. Теперь давайте разберёмся, что дальше.",
          illustration_alt: "Путь от точки А к точке Б",
          hint: "Тап по правой части — следующий экран, по левой — предыдущий.",
        },
        {
          kind: "lesson1_myth",
          lesson: 1,
          screen_id: "screen_1_2",
          screen_number: 2,
          gradient: "var(--gradient-lesson-1)",
          title: "Миф: нужны миллионы",
          text: mythContent.text,
          highlight: mythContent.highlight,
          hint: "Тап по правой части — следующий экран, по левой — предыдущий.",
        },
        {
          kind: "lesson1_steps",
          lesson: 1,
          screen_id: "screen_1_3",
          screen_number: 3,
          gradient: "var(--gradient-lesson-1)",
          title: "Три шага к первой инвестиции",
          steps: [
            {
              number: 1,
              emoji: "💳",
              title: "Пополните счёт",
              description: firstStepText,
            },
            {
              number: 2,
              emoji: "🔍",
              title: "Выберите инструмент",
              description: "Мы поможем подобрать подходящий — после обучения",
            },
            {
              number: 3,
              emoji: "🛒",
              title: "Купите",
              description: "Одно нажатие — и вы инвестор",
            },
          ],
          hint: "Тап по правой части — следующий экран, по левой — предыдущий.",
        },
        {
          kind: "lesson1_cards",
          lesson: 1,
          screen_id: "screen_1_4",
          screen_number: 4,
          gradient: "var(--gradient-lesson-1)",
          title: "Что можно купить?",
          subtitle: "Основные классы активов на бирже",
          cards: lessonOneCards,
          goal_accent: goalAccent,
          hint: "Тап по правой части — следующий экран, по левой — предыдущий.",
        },
        {
          kind: "lesson1_cta",
          lesson: 1,
          screen_id: "screen_1_5",
          screen_number: 5,
          gradient: "var(--gradient-lesson-1)",
          title: "Готовы начать?",
          deeplink: "finamtrade://deposit",
        },
        buildStep(
          2,
          "🛡️",
          "Урок 2. Защита первых инвестиций",
          "Разбираем, как не потерять темп и не допустить типичных ошибок новичка.",
          "Фокус на риск-контроле и дисциплине входа.",
          [
            "Лимиты по объему сделки на старте.",
            "Правила: когда входить и когда ждать.",
          ],
        ),
        buildStep(
          3,
          "🧩",
          "Урок 3. Первый сбалансированный портфель",
          "Опираемся на инструменты: " + instrumentList + ".",
          "Формируем понятную структуру портфеля.",
          [
            "Распределяем доли под ваш горизонт.",
            "Делаем акцент на " + primaryInstrument + ".",
          ],
        ),
        buildStep(
          4,
          "📅",
          "Урок 4. Регулярные пополнения",
          "Создаем ритм пополнений, чтобы рост капитала был управляемым.",
          "Минимизируем влияние эмоций на решения.",
          [
            "График пополнений и автоконтроль.",
            "Пошаговый план покупок вместо одного входа.",
          ],
        ),
        buildStep(
          5,
          "📉",
          "Урок 5. Контроль просадки",
          "Подключаем простые правила снижения риска без сложных формул.",
          "Контроль риска в ежедневной практике.",
          [
            "Ограничения по убытку на позицию.",
            "Порог пересмотра стратегии и фиксации прибыли.",
          ],
        ),
        buildStep(
          6,
          "✅",
          "Урок 6. План на 30 дней",
          "Собираем персональный маршрут в понятный чек-лист внедрения.",
          "Финальный урок перед самостоятельным режимом.",
          [
            "Чек-лист еженедельной проверки портфеля.",
            "Готовый следующий шаг после онбординга.",
          ],
        ),
      ];

      return insertRiskQuizSteps(payload.segment, noviceSteps);
    }

    if (payload.segment === "advanced") {
      var advancedSteps = [
        buildStep(
          1,
          "📊",
          "Урок 1. Ревизия структуры",
          "Обновляем структуру под цель \"" + goalLabel + "\" и капитал " + amountLabel + ".",
          "Быстрый аудит перед активными действиями.",
          [
            "Выявляем перекосы по классам активов.",
            "Обновляем целевые доли портфеля.",
          ],
        ),
        buildStep(
          2,
          "🛡️",
          "Урок 2. Персональные риск-лимиты",
          "Формируем рабочие лимиты по риску и просадке под текущий рынок.",
          "Лимиты, которые реально соблюдать каждый день.",
          [
            "Ограничения по позиции и сектору.",
            "Триггеры для частичной фиксации и выхода.",
          ],
        ),
        buildStep(
          3,
          "🎯",
          "Урок 3. Сценарии входа и выхода",
          "Настраиваем сценарии под инструменты: " + instrumentList + ".",
          "Сохраняем гибкость при росте волатильности.",
          [
            "План входа по частям вместо одной точки.",
            "План фиксации прибыли и защитных действий.",
          ],
        ),
        buildStep(
          4,
          "⚙️",
          "Урок 4. Эффективность исполнения",
          "Оптимизируем частоту сделок и комиссионную нагрузку.",
          "Улучшаем результат без роста лишнего риска.",
          [
            "Контроль частоты сделок по KPI.",
            "Снижение издержек на исполнение.",
          ],
        ),
        buildStep(
          5,
          "📈",
          "Урок 5. Ребалансировка",
          "Фиксируем понятный регламент ребалансировки портфеля.",
          "Портфель остается в целевой структуре.",
          [
            "Календарная и пороговая ребалансировка.",
            "Правила возврата к целевым долям.",
          ],
        ),
        buildStep(
          6,
          "🏁",
          "Урок 6. План роста на квартал",
          "Собираем персональный план действий на 90 дней.",
          "Финальный модуль для устойчивого темпа роста.",
          [
            "Маршрут регулярной ревизии стратегии.",
            "Следующий уровень после завершения курса.",
          ],
        ),
      ];

      return insertRiskQuizSteps(payload.segment, advancedSteps);
    }

    var expertSteps = [
      buildStep(
        1,
        "🧠",
        "Урок 1. Экспресс-аудит стратегии",
        "Проверяем соответствие текущего подхода цели \"" + goalLabel + "\".",
        "Краткая диагностика ключевых зон роста.",
        [
          "Сверяем профиль риска и структуру активов.",
          "Фиксируем приоритеты корректировки.",
        ],
      ),
      buildStep(
        2,
        "🛡️",
        "Урок 2. Риск-модель портфеля",
        "Перенастраиваем риск-параметры под объем " + amountLabel + ".",
        "Точные ограничения без потери гибкости.",
        [
          "Лимиты концентрации и допустимой просадки.",
          "Правила обработки стресс-сценариев.",
        ],
      ),
      buildStep(
        3,
        "📉",
        "Урок 3. Стресс-тест и защита",
        "Проверяем устойчивость к волатильности и шоковым движениям.",
        "Сценарный подход к управлению портфелем.",
        [
          "Сценарии market drawdown и восстановление.",
          "Реакции на рост корреляций между активами.",
        ],
      ),
      buildStep(
        4,
        "⚖️",
        "Урок 4. Ликвидность и хедж",
        "Актуализируем инструменты ликвидности и защитные конструкции.",
        "Контроль ликвидности на уровне портфеля.",
        [
          "План действий при снижении ликвидности.",
          "Точечное хеджирование ключевых рисков.",
        ],
      ),
      buildStep(
        5,
        "🤖",
        "Урок 5. Автоматизация контроля",
        "Собираем регулярный мониторинг и сигналы контроля.",
        "Система, которая поддерживает дисциплину.",
        [
          "Авто-проверка порогов риска и структуры.",
          "Шаблон еженедельного управленческого отчета.",
        ],
      ),
      buildStep(
        6,
        "🚀",
        "Урок 6. План внедрения",
        "Финализируем маршрут внедрения по инструментам: " + instrumentList + ".",
        "Переход в стабильный рабочий режим.",
        [
          "Порядок внедрения изменений без просадки темпа.",
          "Следующий шаг после завершения онбординга.",
        ],
      ),
    ];

    return insertRiskQuizSteps(payload.segment, expertSteps);
  }

  function resetInlineOnboardingState(state) {
    state.inlineOnboarding.isActive = false;
    state.inlineOnboarding.awaitingStart = false;
    state.inlineOnboarding.transitioningToLessons = false;
    state.inlineOnboarding.enteringLessons = false;
    state.inlineOnboarding.steps = [];
    state.inlineOnboarding.activeStepIndex = 0;
    state.inlineOnboarding.direction = 1;
    state.inlineOnboarding.completed = false;
    state.inlineOnboarding.payload = null;
    state.inlineOnboarding.targetRoute = "";
    state.inlineOnboarding.quizAnswers = {};
    state.inlineOnboarding.quizResult = null;
    state.inlineOnboarding.quizStartedAt = 0;
    state.inlineOnboarding.lastViewedStepKey = "";
    state.inlineOnboarding.lesson1StartedAt = 0;
    state.inlineOnboarding.lesson1Completed = false;
  }

  function startInlineOnboardingFlow(state, payload, targetRoute) {
    state.inlineOnboarding.isActive = true;
    state.inlineOnboarding.awaitingStart = false;
    state.inlineOnboarding.transitioningToLessons = false;
    state.inlineOnboarding.enteringLessons = false;
    state.inlineOnboarding.steps = buildInlineOnboardingSteps(payload);
    state.inlineOnboarding.activeStepIndex = 0;
    state.inlineOnboarding.direction = 1;
    state.inlineOnboarding.completed = false;
    state.inlineOnboarding.payload = payload;
    state.inlineOnboarding.targetRoute = targetRoute || "";
    state.inlineOnboarding.quizAnswers = {};
    state.inlineOnboarding.quizResult = null;
    state.inlineOnboarding.quizStartedAt = 0;
    state.inlineOnboarding.lastViewedStepKey = "";
    state.inlineOnboarding.lesson1StartedAt = 0;
    state.inlineOnboarding.lesson1Completed = false;
  }

  function getStepLessonNumber(step, fallbackLesson) {
    var lesson = fallbackLesson;
    if (step && typeof step.lesson === "number" && isFinite(step.lesson)) {
      lesson = step.lesson;
    }

    lesson = Math.round(lesson);
    if (lesson < 1) {
      return 1;
    }
    if (lesson > INLINE_STORY_TOTAL_SEGMENTS) {
      return INLINE_STORY_TOTAL_SEGMENTS;
    }
    return lesson;
  }

  function getStoryProgressState(steps, activeStepIndex) {
    if (!Array.isArray(steps) || !steps.length) {
      return {
        totalSegments: INLINE_STORY_TOTAL_SEGMENTS,
        currentSegment: 0,
        progress: 0,
      };
    }

    var safeActiveIndex = activeStepIndex;
    if (safeActiveIndex < 0) {
      safeActiveIndex = 0;
    } else if (safeActiveIndex > steps.length - 1) {
      safeActiveIndex = steps.length - 1;
    }

    var activeStep = steps[safeActiveIndex];
    if (isQuizStep(activeStep)) {
      var quizIndex = typeof activeStep.quizIndex === "number" ? activeStep.quizIndex : 0;
      if (quizIndex < 0) {
        quizIndex = 0;
      } else if (quizIndex > QUIZ_TOTAL_SEGMENTS - 1) {
        quizIndex = QUIZ_TOTAL_SEGMENTS - 1;
      }

      return {
        totalSegments: QUIZ_TOTAL_SEGMENTS,
        currentSegment: quizIndex,
        progress: 1,
      };
    }

    var activeLesson = getStepLessonNumber(steps[safeActiveIndex], safeActiveIndex + 1);
    var currentSegment = activeLesson - 1;
    var lessonIndexes = [];
    for (var i = 0; i < steps.length; i += 1) {
      if (getStepLessonNumber(steps[i], i + 1) === activeLesson) {
        lessonIndexes.push(i);
      }
    }

    var progress = 1;
    if (lessonIndexes.length > 1) {
      var lessonPosition = 0;
      for (var j = 0; j < lessonIndexes.length; j += 1) {
        if (lessonIndexes[j] === safeActiveIndex) {
          lessonPosition = j;
          break;
        }
      }
      progress = (lessonPosition + 1) / lessonIndexes.length;
    }

    if (!isFinite(progress)) {
      progress = 0;
    }
    if (progress < 0) {
      progress = 0;
    } else if (progress > 1) {
      progress = 1;
    }

    return {
      totalSegments: INLINE_STORY_TOTAL_SEGMENTS,
      currentSegment: currentSegment,
      progress: progress,
    };
  }

  function renderStoryProgress(progressRoot, totalSegments, currentSegment, progress) {
    if (!progressRoot) {
      return;
    }

    progressRoot.innerHTML = "";

    for (var i = 0; i < totalSegments; i += 1) {
      var segment = document.createElement("span");
      segment.className = "segw__story-progress-segment";
      var fillWidth = "0%";

      if (i < currentSegment) {
        segment.classList.add("is-done");
        fillWidth = "100%";
      } else if (i === currentSegment) {
        segment.classList.add("is-active");
        fillWidth = String(Math.round(progress * 100)) + "%";
      }

      var fill = document.createElement("span");
      fill.className = "segw__story-progress-fill";
      fill.style.width = fillWidth;
      segment.appendChild(fill);
      progressRoot.appendChild(segment);
    }
  }

  function isQuizStep(step) {
    return Boolean(step && typeof step.kind === "string" && step.kind.indexOf("quiz_") === 0);
  }

  function createStoryNode(tagName, className, textContent) {
    var node = document.createElement(tagName);
    if (className) {
      node.className = className;
    }
    if (typeof textContent === "string") {
      node.textContent = textContent;
    }
    return node;
  }

  function renderStoryStepContent(contentRoot, step, inlineState) {
    if (!contentRoot || !step) {
      return;
    }

    contentRoot.innerHTML = "";
    contentRoot.classList.remove(
      "is-lesson",
      "is-lesson1",
      "is-quiz-mode",
      "is-quiz-intro",
      "is-quiz-question",
      "is-quiz-result",
    );

    if (step.kind === "quiz_intro") {
      contentRoot.classList.add("is-quiz-mode", "is-quiz-intro");
      var introEmoji = createStoryNode("div", "segw__quiz-intro-emoji", step.emoji || "🎯");
      var introTitle = createStoryNode(
        "h3",
        "segw__quiz-intro-title",
        step.title || "Определим ваш риск-профиль",
      );
      var introSubtitle = createStoryNode(
        "p",
        "segw__quiz-intro-subtitle",
        step.subtitle ||
          "Это займет всего 1 минуту и поможет подобрать подходящие инструменты.",
      );
      var benefitsCard = createStoryNode("section", "segw__quiz-benefits");
      var benefitsTitle = createStoryNode("p", "segw__quiz-benefits-title", "Что мы узнаем:");
      var benefitsList = createStoryNode("ul", "segw__quiz-benefits-list");
      var benefits = Array.isArray(step.benefits) ? step.benefits : [];
      for (var i = 0; i < benefits.length; i += 1) {
        var benefitItem = createStoryNode("li", "segw__quiz-benefit-item");
        benefitItem.style.animationDelay = String(100 + i * 100) + "ms";
        var icon = createStoryNode("span", "segw__quiz-benefit-icon", "✓");
        var text = createStoryNode("span", "segw__quiz-benefit-text", benefits[i]);
        benefitItem.appendChild(icon);
        benefitItem.appendChild(text);
        benefitsList.appendChild(benefitItem);
      }
      benefitsCard.appendChild(benefitsTitle);
      benefitsCard.appendChild(benefitsList);
      contentRoot.appendChild(introEmoji);
      contentRoot.appendChild(introTitle);
      contentRoot.appendChild(introSubtitle);
      contentRoot.appendChild(benefitsCard);
      return;
    }

    if (step.kind === "quiz_question") {
      contentRoot.classList.add("is-quiz-mode", "is-quiz-question");
      var question = step.question || {};
      var blockTitle = createStoryNode(
        "p",
        "segw__quiz-question-block-title",
        question.blockTitle || "Анкета риск-профиля",
      );
      var questionTitle = createStoryNode(
        "h3",
        "segw__quiz-question-title",
        question.question || "Выберите вариант ответа",
      );
      var optionsRoot = createStoryNode(
        "div",
        "segw__quiz-options" + (question.layout === "horizontal" ? " segw__quiz-options--horizontal" : ""),
      );
      var options = Array.isArray(question.options) ? question.options : [];
      var selected = getQuizAnswer(inlineState, question.id);

      for (var j = 0; j < options.length; j += 1) {
        var option = options[j];
        var optionButton = createStoryNode(
          "button",
          "segw__quiz-option" +
            (selected && selected.selected_option === option.id ? " is-selected" : ""),
          option.text,
        );
        optionButton.type = "button";
        optionButton.setAttribute("data-action", "quiz-answer-select");
        optionButton.setAttribute("data-question-id", question.id);
        optionButton.setAttribute("data-option-id", option.id);
        optionButton.setAttribute("data-option-score", String(option.score));
        optionsRoot.appendChild(optionButton);
      }

      contentRoot.appendChild(blockTitle);
      contentRoot.appendChild(questionTitle);
      contentRoot.appendChild(optionsRoot);
      return;
    }

    if (step.kind === "quiz_result") {
      contentRoot.classList.add("is-quiz-mode", "is-quiz-result");
      var resultEmoji = createStoryNode("div", "segw__quiz-result-emoji", "🎉");
      var resultTitle = createStoryNode(
        "h3",
        "segw__quiz-result-title",
        step.title || "Ваш риск-профиль определен",
      );
      var quizResult = inlineState.quizResult;
      if (!quizResult) {
        quizResult = calculateInlineQuizResult(inlineState.payload, inlineState.quizAnswers);
        inlineState.quizResult = quizResult;
      }

      if (!quizResult) {
        contentRoot.appendChild(resultEmoji);
        contentRoot.appendChild(resultTitle);
        contentRoot.appendChild(
          createStoryNode(
            "p",
            "segw__quiz-result-description",
            "Нужно ответить на вопросы анкеты, чтобы получить результат.",
          ),
        );
        return;
      }

      var profile = QUIZ_PROFILE_PRESENTATION[quizResult.final_profile];
      var allocation = quizResult.allocation || QUIZ_PROFILE_ALLOCATIONS.conservative;
      var badge = createStoryNode("div", "segw__quiz-result-badge");
      badge.style.setProperty("--quiz-profile-color", profile.color);
      var badgeName = createStoryNode(
        "p",
        "segw__quiz-result-badge-name",
        profile.emoji + " " + profile.name,
      );
      var description = createStoryNode("p", "segw__quiz-result-description", profile.description);
      var allocationCard = createStoryNode("section", "segw__quiz-allocation-card");
      var allocationTitle = createStoryNode(
        "p",
        "segw__quiz-allocation-title",
        "Рекомендуемая аллокация",
      );
      var pie = createStoryNode("div", "segw__quiz-allocation-pie");
      var stocks = allocation.stocks_pct || 0;
      var bonds = allocation.bonds_pct || 0;
      var alternatives = allocation.alternatives_pct || 0;
      var cash = allocation.cash_pct || 0;
      pie.style.background =
        "conic-gradient(" +
        "#60a5fa 0 " +
        String(stocks) +
        "%, " +
        "#34d399 " +
        String(stocks) +
        "% " +
        String(stocks + bonds) +
        "%, " +
        "#fbbf24 " +
        String(stocks + bonds) +
        "% " +
        String(stocks + bonds + alternatives) +
        "%, " +
        "#c4b5fd " +
        String(stocks + bonds + alternatives) +
        "% " +
        String(stocks + bonds + alternatives + cash) +
        "%)";

      var breakdown = createStoryNode("ul", "segw__quiz-allocation-breakdown");
      var rows = [
        { label: "Акции", value: stocks, colorClass: "is-stocks" },
        { label: "Облигации", value: bonds, colorClass: "is-bonds" },
        { label: "Альтернативы", value: alternatives, colorClass: "is-alt" },
        { label: "Кэш", value: cash, colorClass: "is-cash" },
      ];

      for (var k = 0; k < rows.length; k += 1) {
        var row = rows[k];
        var rowNode = createStoryNode("li", "segw__quiz-allocation-item");
        var rowLabel = createStoryNode("span", "segw__quiz-allocation-label");
        var rowColor = createStoryNode(
          "span",
          "segw__quiz-allocation-color " + row.colorClass,
        );
        var rowText = createStoryNode("span", "", row.label);
        var rowValue = createStoryNode(
          "strong",
          "segw__quiz-allocation-value",
          String(row.value) + "%",
        );
        rowLabel.appendChild(rowColor);
        rowLabel.appendChild(rowText);
        rowNode.appendChild(rowLabel);
        rowNode.appendChild(rowValue);
        breakdown.appendChild(rowNode);
      }

      badge.appendChild(badgeName);
      allocationCard.appendChild(allocationTitle);
      allocationCard.appendChild(pie);
      allocationCard.appendChild(breakdown);
      contentRoot.appendChild(resultEmoji);
      contentRoot.appendChild(resultTitle);
      contentRoot.appendChild(badge);
      contentRoot.appendChild(description);
      contentRoot.appendChild(allocationCard);
      return;
    }

    if (step.kind === "lesson1_hero") {
      contentRoot.classList.add("is-lesson", "is-lesson1");
      var heroRoot = createStoryNode("section", "segw__lesson1-screen segw__lesson1-screen--hero");
      heroRoot.appendChild(createStoryNode("div", "segw__lesson1-emoji", step.emoji || "🚀"));
      heroRoot.appendChild(
        createStoryNode(
          "h3",
          "segw__lesson1-title",
          step.title || "Инвестировать проще, чем кажется",
        ),
      );
      heroRoot.appendChild(
        createStoryNode(
          "p",
          "segw__lesson1-subtitle",
          step.subtitle ||
            "Вы уже сделали первый шаг — открыли счёт. Теперь давайте разберёмся, что дальше.",
        ),
      );
      var heroVisual = createStoryNode("div", "segw__lesson1-visual");
      heroVisual.appendChild(
        createStoryNode("span", "segw__lesson1-visual-text", step.illustration_alt || "Путь к цели"),
      );
      heroRoot.appendChild(heroVisual);
      contentRoot.appendChild(heroRoot);
      return;
    }

    if (step.kind === "lesson1_myth") {
      contentRoot.classList.add("is-lesson", "is-lesson1");
      var mythRoot = createStoryNode("section", "segw__lesson1-screen");
      mythRoot.appendChild(
        createStoryNode("h3", "segw__lesson1-title", step.title || "Миф: нужны миллионы"),
      );
      mythRoot.appendChild(
        createStoryNode(
          "p",
          "segw__lesson1-body",
          step.text || "Начать можно с комфортной суммы и двигаться шаг за шагом.",
        ),
      );
      var highlight = createStoryNode("div", "segw__lesson1-highlight");
      highlight.appendChild(createStoryNode("span", "segw__lesson1-highlight-icon", "✓"));
      highlight.appendChild(
        createStoryNode("span", "segw__lesson1-highlight-text", step.highlight || "Старт возможен уже сейчас"),
      );
      mythRoot.appendChild(highlight);
      var mythVisual = createStoryNode("div", "segw__lesson1-visual");
      mythVisual.appendChild(
        createStoryNode("span", "segw__lesson1-visual-text", "Миф перечёркнут, реальность с галочкой"),
      );
      mythRoot.appendChild(mythVisual);
      contentRoot.appendChild(mythRoot);
      return;
    }

    if (step.kind === "lesson1_steps") {
      contentRoot.classList.add("is-lesson", "is-lesson1");
      var stepsRoot = createStoryNode("section", "segw__lesson1-screen");
      stepsRoot.appendChild(
        createStoryNode("h3", "segw__lesson1-title", step.title || "Три шага к первой инвестиции"),
      );
      var stepCards = createStoryNode("div", "segw__lesson1-step-cards");
      var flowSteps = Array.isArray(step.steps) ? step.steps : [];
      for (var s = 0; s < flowSteps.length; s += 1) {
        var item = flowSteps[s];
        var card = createStoryNode("article", "segw__lesson1-step-card");
        card.style.animationDelay = String(s * 150) + "ms";
        var head = createStoryNode("div", "segw__lesson1-step-head");
        head.appendChild(createStoryNode("span", "segw__lesson1-step-num", String(item.number || s + 1)));
        head.appendChild(createStoryNode("span", "segw__lesson1-step-emoji", item.emoji || "•"));
        head.appendChild(createStoryNode("strong", "segw__lesson1-step-title", item.title || "Шаг"));
        card.appendChild(head);
        card.appendChild(
          createStoryNode(
            "p",
            "segw__lesson1-step-description",
            item.description || "Описание шага",
          ),
        );
        stepCards.appendChild(card);
      }
      stepsRoot.appendChild(stepCards);
      contentRoot.appendChild(stepsRoot);
      return;
    }

    if (step.kind === "lesson1_cards") {
      contentRoot.classList.add("is-lesson", "is-lesson1");
      var cardsRoot = createStoryNode("section", "segw__lesson1-screen");
      cardsRoot.appendChild(createStoryNode("h3", "segw__lesson1-title", step.title || "Что можно купить?"));
      cardsRoot.appendChild(
        createStoryNode(
          "p",
          "segw__lesson1-subtitle",
          step.subtitle || "Основные классы активов на бирже",
        ),
      );

      var cardsScroller = createStoryNode("div", "segw__lesson1-cards-scroller");
      var cards = Array.isArray(step.cards) ? step.cards : [];
      for (var c = 0; c < cards.length; c += 1) {
        var cardData = cards[c];
        var instrumentCard = createStoryNode(
          "article",
          "segw__lesson1-instrument-card" + (cardData.highlighted ? " is-highlighted" : ""),
        );
        var cardHead = createStoryNode("div", "segw__lesson1-instrument-head");
        cardHead.appendChild(createStoryNode("strong", "", cardData.name || "Инструмент"));
        if (cardData.highlighted) {
          cardHead.appendChild(createStoryNode("span", "segw__lesson1-badge", "Вас интересует"));
        }
        instrumentCard.appendChild(cardHead);
        instrumentCard.appendChild(
          createStoryNode("p", "segw__lesson1-instrument-description", cardData.description || ""),
        );
        instrumentCard.appendChild(
          createStoryNode("p", "segw__lesson1-instrument-risk", cardData.risk_label || ""),
        );
        cardsScroller.appendChild(instrumentCard);
      }
      cardsRoot.appendChild(cardsScroller);

      var goalAccent = createStoryNode("div", "segw__lesson1-goal-accent", step.goal_accent || "");
      cardsRoot.appendChild(goalAccent);
      contentRoot.appendChild(cardsRoot);
      return;
    }

    if (step.kind === "lesson1_cta") {
      contentRoot.classList.add("is-lesson", "is-lesson1");
      var ctaRoot = createStoryNode("section", "segw__lesson1-screen segw__lesson1-screen--cta");
      ctaRoot.appendChild(createStoryNode("h3", "segw__lesson1-title", step.title || "Готовы начать?"));
      var ctaVisual = createStoryNode("div", "segw__lesson1-visual");
      ctaVisual.appendChild(createStoryNode("span", "segw__lesson1-visual-text", "Финишная линия"));
      ctaRoot.appendChild(ctaVisual);

      var ctaActions = createStoryNode("div", "segw__lesson1-cta-actions");
      var depositButton = createStoryNode("button", "segw__lesson1-cta segw__lesson1-cta--primary", "Пополнить счёт");
      depositButton.type = "button";
      depositButton.setAttribute("data-action", "lesson1-deposit");
      if (step.deeplink) {
        depositButton.setAttribute("data-deeplink", step.deeplink);
      }
      var continueButton = createStoryNode(
        "button",
        "segw__lesson1-cta segw__lesson1-cta--secondary",
        "Продолжить обучение",
      );
      continueButton.type = "button";
      continueButton.setAttribute("data-action", "lesson1-continue");
      ctaActions.appendChild(depositButton);
      ctaActions.appendChild(continueButton);
      ctaRoot.appendChild(ctaActions);
      contentRoot.appendChild(ctaRoot);
      return;
    }

    contentRoot.classList.add("is-lesson");
    contentRoot.appendChild(createStoryNode("div", "segw__story-emoji", step.emoji || "📘"));
    contentRoot.appendChild(
      createStoryNode("h3", "segw__onboarding-step-title", step.title || "Персональный урок"),
    );
    contentRoot.appendChild(
      createStoryNode(
        "p",
        "segw__onboarding-step-text",
        step.text || "Подготовили персональный контент для этого шага.",
      ),
    );
    var points = createStoryNode("ul", "segw__onboarding-points");
    var stepPoints = Array.isArray(step.points) ? step.points : [];
    for (var m = 0; m < stepPoints.length; m += 1) {
      points.appendChild(createStoryNode("li", "segw__story-point", stepPoints[m]));
    }
    contentRoot.appendChild(points);
  }

  function renderInlineOnboarding(refs, state) {
    if (!refs.onboarding) {
      return;
    }

    var inlineState = state.inlineOnboarding;
    if (!inlineState.isActive || !inlineState.steps.length) {
      refs.onboarding.classList.add("is-hidden");
      refs.onboarding.classList.remove("is-entering");
      if (refs.routePrep) {
        refs.routePrep.classList.add("is-hidden");
        refs.routePrep.classList.remove("is-exiting");
      }
      if (refs.routePrepStart) {
        refs.routePrepStart.disabled = false;
      }
      return;
    }

    if (refs.routePrep) {
      if (inlineState.awaitingStart && inlineState.payload) {
        refs.routePrep.classList.remove("is-hidden");
        refs.routePrep.classList.toggle("is-exiting", inlineState.transitioningToLessons);
        if (refs.routePrepText) {
          refs.routePrepText.textContent =
            ROUTE_PREP_TEXT_BY_SEGMENT[inlineState.payload.segment] ||
            "Подготовили персональный маршрут обучения.";
        }
      } else {
        refs.routePrep.classList.add("is-hidden");
        refs.routePrep.classList.remove("is-exiting");
      }
    }
    if (refs.routePrepStart) {
      refs.routePrepStart.disabled = inlineState.transitioningToLessons;
    }

    if (inlineState.awaitingStart) {
      refs.onboarding.classList.add("is-hidden");
      refs.onboarding.classList.remove("is-entering");
      return;
    }

    refs.onboarding.classList.remove("is-hidden");
    refs.onboarding.classList.toggle("is-entering", inlineState.enteringLessons);
    var maxStepIndex = inlineState.steps.length - 1;

    if (inlineState.activeStepIndex < 0) {
      inlineState.activeStepIndex = 0;
    } else if (inlineState.activeStepIndex > maxStepIndex) {
      inlineState.activeStepIndex = maxStepIndex;
    }

    var activeStep = inlineState.steps[inlineState.activeStepIndex];
    var isLastStep = inlineState.activeStepIndex === maxStepIndex;
    var hasExternalLink = hasConfiguredExternalOnboarding() && Boolean(inlineState.targetRoute);
    var progressState = getStoryProgressState(inlineState.steps, inlineState.activeStepIndex);
    var quizAnswer =
      activeStep.kind === "quiz_question" && activeStep.question
        ? getQuizAnswer(inlineState, activeStep.question.id)
        : null;
    var isQuiz = isQuizStep(activeStep);
    var isLesson1Step =
      Boolean(activeStep && typeof activeStep.kind === "string") &&
      activeStep.kind.indexOf("lesson1_") === 0;
    var isLesson1Cta = activeStep.kind === "lesson1_cta";
    var activeStepKey =
      String(activeStep.kind || "lesson") +
      ":" +
      String(activeStep.question ? activeStep.question.id : inlineState.activeStepIndex);

    if (inlineState.lastViewedStepKey !== activeStepKey) {
      if (isLesson1Step && inlineState.payload && inlineState.payload.segment === "novice") {
        if (!inlineState.lesson1StartedAt) {
          inlineState.lesson1StartedAt = Date.now();
          trackEvent("lesson_1_started", {
            segment: inlineState.payload.segment,
            amount_tier: inlineState.payload.amount_tier,
          });
        }
        trackEvent("lesson_1_screen_viewed", {
          screen_id: activeStep.screen_id || "lesson_1",
          screen_number: activeStep.screen_number || 1,
        });
      } else if (activeStep.kind === "quiz_intro" && inlineState.payload) {
        if (!inlineState.quizStartedAt) {
          inlineState.quizStartedAt = Date.now();
          trackEvent("risk_quiz_started", {
            segment: inlineState.payload.segment,
            amount_tier: inlineState.payload.amount_tier,
          });
        }
      } else if (activeStep.kind === "quiz_question" && activeStep.question) {
        trackEvent("risk_quiz_question_viewed", {
          question_id: activeStep.question.id,
          screen_number: (activeStep.quizIndex || 0) + 1,
        });
      } else if (activeStep.kind === "quiz_result") {
        if (!inlineState.quizResult) {
          inlineState.quizResult = calculateInlineQuizResult(
            inlineState.payload,
            inlineState.quizAnswers,
          );
        }
        if (inlineState.quizResult) {
          trackEvent("risk_quiz_result_viewed", {
            final_profile: inlineState.quizResult.final_profile,
            allocation: inlineState.quizResult.allocation,
          });
        }
      }
      inlineState.lastViewedStepKey = activeStepKey;
    }

    renderStoryProgress(
      refs.storyProgress,
      progressState.totalSegments,
      progressState.currentSegment,
      progressState.progress,
    );

    if (refs.storyFrame && activeStep.gradient) {
      refs.storyFrame.style.background = activeStep.gradient;
    }

    if (refs.storyContent) {
      refs.storyContent.classList.remove("is-enter-next", "is-enter-prev");
      void refs.storyContent.offsetWidth;
      refs.storyContent.classList.add(
        inlineState.direction < 0 ? "is-enter-prev" : "is-enter-next",
      );
      renderStoryStepContent(refs.storyContent, activeStep, inlineState);
    }

    if (refs.onboardingTitle && inlineState.payload) {
      refs.onboardingTitle.textContent = isQuiz
        ? "Анкета риск-профиля"
        : ONBOARDING_PLAN_LABELS[inlineState.payload.segment];
    }

    if (refs.onboardingCounter) {
      if (isQuiz) {
        refs.onboardingCounter.textContent =
          String(progressState.currentSegment + 1) + "/" + String(progressState.totalSegments);
      } else {
        refs.onboardingCounter.textContent =
          "Урок " +
          String(progressState.currentSegment + 1) +
          " из " +
          String(progressState.totalSegments);
      }
    }

    if (refs.onboardingHint) {
      if (isQuiz) {
        refs.onboardingHint.classList.add("segw__is-hidden");
      } else {
        refs.onboardingHint.classList.remove("segw__is-hidden");
        refs.onboardingHint.textContent =
          activeStep.hint ||
          "Тап по правой части — следующий экран, по левой — предыдущий.";
      }
    }

    if (refs.onboardingPrev) {
      refs.onboardingPrev.disabled = inlineState.activeStepIndex === 0;
    }

    if (refs.onboardingNext) {
      if (
        inlineState.completed ||
        isLesson1Cta ||
        (activeStep.kind === "quiz_question" && !quizAnswer)
      ) {
        refs.onboardingNext.disabled = true;
      } else {
        refs.onboardingNext.disabled = false;
      }
    }

    if (refs.onboardingFooter) {
      refs.onboardingFooter.classList.toggle("segw__is-hidden", isLesson1Cta);
    }

    if (refs.onboardingNextButton) {
      refs.onboardingNextButton.classList.toggle("segw__is-hidden", isLesson1Cta);
      if (isLesson1Cta) {
        refs.onboardingNextButton.textContent = "Выберите действие";
        refs.onboardingNextButton.disabled = true;
      } else {
        refs.onboardingNextButton.classList.toggle("is-quiz-cta", isQuiz);
        if (inlineState.completed) {
          refs.onboardingNextButton.textContent = "Пройдено";
          refs.onboardingNextButton.disabled = true;
        } else if (activeStep.kind === "quiz_intro") {
          refs.onboardingNextButton.textContent = "Начать анкету →";
          refs.onboardingNextButton.disabled = false;
        } else if (activeStep.kind === "quiz_question") {
          refs.onboardingNextButton.textContent = "Далее →";
          refs.onboardingNextButton.disabled = !quizAnswer;
        } else if (activeStep.kind === "quiz_result") {
          refs.onboardingNextButton.textContent = "Продолжить обучение →";
          refs.onboardingNextButton.disabled = false;
        } else if (isLastStep) {
          refs.onboardingNextButton.textContent = "Завершить маршрут";
          refs.onboardingNextButton.disabled = false;
        } else {
          refs.onboardingNextButton.textContent = "Далее";
          refs.onboardingNextButton.disabled = false;
        }
      }
    }

    if (refs.onboardingDone) {
      if (inlineState.completed) {
        refs.onboardingDone.classList.remove("segw__is-hidden");
      } else {
        refs.onboardingDone.classList.add("segw__is-hidden");
      }
    }

    if (refs.onboardingRouteLink) {
      if (hasExternalLink) {
        refs.onboardingRouteLink.classList.remove("segw__is-hidden");
        refs.onboardingRouteLink.href = inlineState.targetRoute;
        if (WIDGET_OPTIONS.openInNewTab) {
          refs.onboardingRouteLink.target = "_blank";
          refs.onboardingRouteLink.rel = "noopener noreferrer";
        } else {
          refs.onboardingRouteLink.removeAttribute("target");
          refs.onboardingRouteLink.removeAttribute("rel");
        }
      } else {
        refs.onboardingRouteLink.classList.add("segw__is-hidden");
        refs.onboardingRouteLink.removeAttribute("href");
        refs.onboardingRouteLink.removeAttribute("target");
        refs.onboardingRouteLink.removeAttribute("rel");
      }
    }
  }


  function updateOptionStates(root, state) {
    var buttons = root.querySelectorAll("button[data-action][data-value]");

    for (var i = 0; i < buttons.length; i += 1) {
      var button = buttons[i];
      var action = button.getAttribute("data-action");
      var value = button.getAttribute("data-value");
      var isSelected = false;

      if (action === "qualified") {
        isSelected = String(state.qualifiedInvestor) === value;
      } else if (action === "experience") {
        isSelected = state.experience === value;
      } else if (action === "amount") {
        isSelected = state.amountTier === value;
      } else if (action === "goal") {
        isSelected = state.goal === value;
      } else if (action === "instrument") {
        isSelected = state.instruments.indexOf(value) !== -1;
      }

      if (isSelected) {
        button.classList.add("is-selected");
      } else {
        button.classList.remove("is-selected");
      }

      var mark = button.querySelector(".segw__option-mark");
      if (mark) {
        if (action === "instrument") {
          mark.textContent = isSelected ? "✓" : "□";
        } else {
          mark.textContent = isSelected ? "●" : "○";
        }
      }
    }
  }

  function render(root, refs, state) {
    if (refs.questionnaire) {
      if (state.inlineOnboarding.isActive) {
        refs.questionnaire.classList.add("is-hidden");
      } else {
        refs.questionnaire.classList.remove("is-hidden");
      }
    }

    if (!state.inlineOnboarding.isActive) {
      renderSegmentationStory(refs, state);
    }

    renderInlineOnboarding(refs, state);
  }

  function showTariffCard(refs, payload, targetRoute, options) {
    var inlineMode = options && options.inlineMode === true;
    var hasExternalLink = hasConfiguredExternalOnboarding() && Boolean(targetRoute);

    if (refs.result) {
      refs.result.classList.remove("is-hidden");
    }
    if (refs.planTitle) {
      refs.planTitle.textContent = ONBOARDING_PLAN_LABELS[payload.segment];
    }
    if (refs.segmentValue) {
      refs.segmentValue.textContent = SEGMENT_LABELS[payload.segment];
    }
    if (refs.amountValue) {
      refs.amountValue.textContent = AMOUNT_LABELS[payload.amount_tier];
    }
    if (refs.goalValue) {
      refs.goalValue.textContent = GOAL_LABELS[payload.investment_goal];
    }
    if (refs.instrumentsValue) {
      refs.instrumentsValue.textContent = getInstrumentLabelList(payload.instruments);
    }
    if (refs.routeLink) {
      if (hasExternalLink) {
        refs.routeLink.classList.remove("segw__is-hidden");
        refs.routeLink.href = targetRoute;
        refs.routeLink.textContent = inlineMode
          ? "Открыть полную версию на отдельной странице"
          : "Перейти к онбордингу";
        if (WIDGET_OPTIONS.openInNewTab) {
          refs.routeLink.target = "_blank";
          refs.routeLink.rel = "noopener noreferrer";
        } else {
          refs.routeLink.removeAttribute("target");
          refs.routeLink.removeAttribute("rel");
        }
      } else {
        refs.routeLink.classList.add("segw__is-hidden");
        refs.routeLink.removeAttribute("href");
        refs.routeLink.removeAttribute("target");
        refs.routeLink.removeAttribute("rel");
      }
    }
    if (refs.json) {
      refs.json.textContent = JSON.stringify(payload, null, 2);
    }
  }

  function initWidget(root) {
    if (!root || root.getAttribute("data-segw-initialized") === "true") {
      return root;
    }
    root.setAttribute("data-segw-initialized", "true");

    var state = {
      qualifiedInvestor: null,
      experience: null,
      amountTier: null,
      goal: null,
      instruments: [],
      segment: null,
      segmentationFlow: {
        stepIndex: -1,
        direction: 1,
        resultPayload: null,
        targetRoute: "",
        inlineMode: true,
      },
      inlineOnboarding: {
        isActive: false,
        awaitingStart: false,
        transitioningToLessons: false,
        enteringLessons: false,
        steps: [],
        activeStepIndex: 0,
        direction: 1,
        completed: false,
        payload: null,
        targetRoute: "",
        quizAnswers: {},
        quizResult: null,
        quizStartedAt: 0,
        lastViewedStepKey: "",
        lesson1StartedAt: 0,
        lesson1Completed: false,
      },
    };

    var refs = {
      questionnaire: root.querySelector('[data-role="questionnaire"]'),
      segCounter: root.querySelector('[data-role="seg-counter"]'),
      segProgress: root.querySelector('[data-role="seg-progress"]'),
      segContent: root.querySelector('[data-role="seg-content"]'),
      segFooter: root.querySelector('[data-role="seg-footer"]'),
      segNextButton: root.querySelector('[data-role="seg-next"]'),
      result: root.querySelector('[data-role="result"]'),
      planTitle: root.querySelector('[data-role="plan-title"]'),
      segmentValue: root.querySelector('[data-role="segment-value"]'),
      amountValue: root.querySelector('[data-role="amount-value"]'),
      goalValue: root.querySelector('[data-role="goal-value"]'),
      instrumentsValue: root.querySelector('[data-role="instruments-value"]'),
      routeLink: root.querySelector('[data-role="route-link"]'),
      json: root.querySelector('[data-role="json"]'),
      routePrep: root.querySelector('[data-role="route-prep"]'),
      routePrepText: root.querySelector('[data-role="route-prep-text"]'),
      routePrepStart: root.querySelector('[data-role="route-prep-start"]'),
      onboarding: root.querySelector('[data-role="onboarding"]'),
      storyFrame: root.querySelector('[data-role="story-frame"]'),
      storyProgress: root.querySelector('[data-role="story-progress"]'),
      storyContent: root.querySelector('[data-role="story-content"]'),
      onboardingTitle: root.querySelector('[data-role="onboarding-title"]'),
      onboardingCounter: root.querySelector('[data-role="onboarding-counter"]'),
      onboardingHint: root.querySelector('[data-role="onboarding-hint"]'),
      onboardingPrev: root.querySelector('[data-action="onboarding-prev"]'),
      onboardingNext: root.querySelector('[data-action="onboarding-next"]'),
      onboardingFooter: root.querySelector(".segw__story-footer"),
      onboardingNextButton: root.querySelector('[data-role="onboarding-next-label"]'),
      onboardingDone: root.querySelector('[data-role="onboarding-done"]'),
      onboardingRouteLink: root.querySelector('[data-role="onboarding-route-link"]'),
    };

    root.addEventListener("click", function (event) {
      var target = event.target;
      if (!target || typeof target.closest !== "function") {
        return;
      }

      var button = target.closest("button[data-action]");
      if (!button || !root.contains(button)) {
        return;
      }

      var action = button.getAttribute("data-action");
      var value = button.getAttribute("data-value");

      if (action === "seg-reset") {
        state.qualifiedInvestor = null;
        state.experience = null;
        state.amountTier = null;
        state.goal = null;
        state.instruments = [];
        state.segment = null;
        state.segmentationFlow.stepIndex = -1;
        state.segmentationFlow.direction = -1;
        state.segmentationFlow.resultPayload = null;
        state.segmentationFlow.targetRoute = "";
        state.segmentationFlow.inlineMode = true;
        resetInlineOnboardingState(state);
        if (refs.result) {
          refs.result.classList.add("is-hidden");
        }
        trackEvent("segmentation_edit_started");
        render(root, refs, state);
        return;
      } else if (action === "seg-next") {
        if (state.inlineOnboarding.isActive) {
          return;
        }

        state.segmentationFlow.direction = 1;
        if (state.segmentationFlow.stepIndex < 0) {
          state.segmentationFlow.stepIndex = 0;
          render(root, refs, state);
          return;
        }

        var activeStepId = SEGMENTATION_STORY_ORDER[state.segmentationFlow.stepIndex];
        if (!isSegmentationStepAnswered(state, activeStepId)) {
          render(root, refs, state);
          return;
        }

        var isLastQuestion = state.segmentationFlow.stepIndex === SEGMENTATION_STORY_ORDER.length - 1;
        if (!isLastQuestion) {
          state.segmentationFlow.stepIndex += 1;
          render(root, refs, state);
          return;
        }

        var payload = buildPayload(state);
        if (!payload) {
          render(root, refs, state);
          return;
        }

        trackEvent("segmentation_completed", {
          segment: payload.segment,
          amount_tier: payload.amount_tier,
        });
        trackEvent("segment_" + payload.segment, {
          amount_tier: payload.amount_tier,
        });

        var inlineMode = shouldUseInlineOnboarding();
        var targetRoute = navigateToOnboarding(payload.segment, payload.amount_tier, {
          skipNavigation: true,
        });

        state.segmentationFlow.resultPayload = payload;
        state.segmentationFlow.targetRoute = targetRoute;
        state.segmentationFlow.inlineMode = inlineMode;
        state.segmentationFlow.stepIndex = SEGMENTATION_STORY_ORDER.length;

        safeInvokeComplete(payload);
        root.dispatchEvent(
          new CustomEvent("segmentation:completed", {
            detail: {
              payload: payload,
              targetRoute: targetRoute,
            },
          }),
        );

        render(root, refs, state);
        return;
      } else if (action === "seg-start-onboarding") {
        var resultPayload = state.segmentationFlow.resultPayload;
        if (!resultPayload) {
          return;
        }

        if (state.segmentationFlow.inlineMode) {
          startInlineOnboardingFlow(
            state,
            resultPayload,
            state.segmentationFlow.targetRoute || "",
          );
          trackEvent("inline_onboarding_started", {
            segment: resultPayload.segment,
            amount_tier: resultPayload.amount_tier,
          });

          var scrollTarget = refs.routePrep || refs.onboarding;
          if (scrollTarget && typeof scrollTarget.scrollIntoView === "function") {
            setTimeout(function () {
              scrollTarget.scrollIntoView({ behavior: "smooth", block: "start" });
            }, 30);
          }
          render(root, refs, state);
          return;
        }

        navigateToOnboarding(resultPayload.segment, resultPayload.amount_tier, {
          skipNavigation: false,
        });
        return;
      } else if (action === "start-inline-onboarding") {
        if (
          !state.inlineOnboarding.isActive ||
          !state.inlineOnboarding.steps.length ||
          state.inlineOnboarding.transitioningToLessons
        ) {
          return;
        }

        state.inlineOnboarding.transitioningToLessons = true;
        render(root, refs, state);

        setTimeout(function () {
          if (
            !state.inlineOnboarding.isActive ||
            !state.inlineOnboarding.steps.length ||
            !state.inlineOnboarding.transitioningToLessons
          ) {
            return;
          }

          state.inlineOnboarding.awaitingStart = false;
          state.inlineOnboarding.transitioningToLessons = false;
          state.inlineOnboarding.enteringLessons = true;
          state.inlineOnboarding.direction = 1;
          state.inlineOnboarding.activeStepIndex = 0;
          render(root, refs, state);

          if (refs.onboarding && typeof refs.onboarding.scrollIntoView === "function") {
            setTimeout(function () {
              refs.onboarding.scrollIntoView({ behavior: "smooth", block: "start" });
            }, 30);
          }

          setTimeout(function () {
            if (!state.inlineOnboarding.isActive) {
              return;
            }
            state.inlineOnboarding.enteringLessons = false;
            render(root, refs, state);
          }, 350);
        }, 300);
        return;
      } else if (action === "quiz-answer-select") {
        if (
          !state.inlineOnboarding.isActive ||
          state.inlineOnboarding.awaitingStart ||
          !state.inlineOnboarding.steps.length
        ) {
          return;
        }

        var activeQuizStep = state.inlineOnboarding.steps[state.inlineOnboarding.activeStepIndex];
        if (!activeQuizStep || activeQuizStep.kind !== "quiz_question" || !activeQuizStep.question) {
          return;
        }

        var questionId = button.getAttribute("data-question-id");
        var optionId = button.getAttribute("data-option-id");
        var optionScore = Number(button.getAttribute("data-option-score"));
        if (!questionId || !optionId || !isFinite(optionScore)) {
          return;
        }

        state.inlineOnboarding.quizAnswers[questionId] = {
          question_id: questionId,
          selected_option: optionId,
          score: optionScore,
        };
        state.inlineOnboarding.quizResult = null;

        trackEvent("risk_quiz_answer_selected", {
          question_id: questionId,
          selected_option: optionId,
          score: optionScore,
        });
        render(root, refs, state);
        return;
      } else if (action === "lesson1-deposit") {
        if (!state.inlineOnboarding.isActive || !state.inlineOnboarding.steps.length) {
          return;
        }

        var activeDepositStep = state.inlineOnboarding.steps[state.inlineOnboarding.activeStepIndex];
        if (!activeDepositStep || activeDepositStep.kind !== "lesson1_cta") {
          return;
        }

        var payloadForDeposit = state.inlineOnboarding.payload;
        var deeplink = button.getAttribute("data-deeplink") || "finamtrade://deposit";
        if (payloadForDeposit) {
          trackEvent("lesson_1_deposit_cta_clicked", {
            segment: payloadForDeposit.segment,
            amount_tier: payloadForDeposit.amount_tier,
          });
          trackEvent("onboarding_deposit_cta_clicked", {
            segment: payloadForDeposit.segment,
            amount_tier: payloadForDeposit.amount_tier,
          });
        }

        try {
          window.location.href = deeplink;
        } catch (error) {
          if (window.console && typeof window.console.warn === "function") {
            window.console.warn("[segmentation] deeplink navigation failed", error);
          }
        }
        return;
      } else if (action === "lesson1-continue") {
        if (!state.inlineOnboarding.isActive || !state.inlineOnboarding.steps.length) {
          return;
        }

        var activeContinueStep = state.inlineOnboarding.steps[state.inlineOnboarding.activeStepIndex];
        if (!activeContinueStep || activeContinueStep.kind !== "lesson1_cta") {
          return;
        }

        var payloadForContinue = state.inlineOnboarding.payload;
        if (payloadForContinue) {
          trackEvent("lesson_1_continue_clicked", {
            segment: payloadForContinue.segment,
            amount_tier: payloadForContinue.amount_tier,
          });
        }

        if (!state.inlineOnboarding.lesson1Completed) {
          var lesson1TimeSpent = 0;
          if (state.inlineOnboarding.lesson1StartedAt) {
            lesson1TimeSpent = Math.max(
              0,
              Math.round((Date.now() - state.inlineOnboarding.lesson1StartedAt) / 1000),
            );
          }
          if (payloadForContinue) {
            trackEvent("lesson_1_completed", {
              segment: payloadForContinue.segment,
              amount_tier: payloadForContinue.amount_tier,
              time_spent: lesson1TimeSpent,
            });
          }
          state.inlineOnboarding.lesson1Completed = true;
        }

        state.inlineOnboarding.direction = 1;
        var lesson1LastIndex = state.inlineOnboarding.steps.length - 1;
        if (state.inlineOnboarding.activeStepIndex < lesson1LastIndex) {
          state.inlineOnboarding.activeStepIndex += 1;
        } else if (!state.inlineOnboarding.completed) {
          state.inlineOnboarding.completed = true;
          if (state.inlineOnboarding.payload) {
            trackEvent("inline_onboarding_completed", {
              segment: state.inlineOnboarding.payload.segment,
              amount_tier: state.inlineOnboarding.payload.amount_tier,
            });
          }
        }

        render(root, refs, state);
        return;
      } else if (action === "onboarding-prev") {
        if (
          !state.inlineOnboarding.isActive ||
          state.inlineOnboarding.awaitingStart ||
          !state.inlineOnboarding.steps.length
        ) {
          return;
        }

        state.inlineOnboarding.direction = -1;
        if (state.inlineOnboarding.completed) {
          state.inlineOnboarding.completed = false;
        }
        if (state.inlineOnboarding.activeStepIndex > 0) {
          state.inlineOnboarding.activeStepIndex -= 1;
        }

        render(root, refs, state);
        return;
      } else if (action === "onboarding-next") {
        if (
          !state.inlineOnboarding.isActive ||
          state.inlineOnboarding.awaitingStart ||
          !state.inlineOnboarding.steps.length
        ) {
          return;
        }

        state.inlineOnboarding.direction = 1;
        var activeInlineStep = state.inlineOnboarding.steps[state.inlineOnboarding.activeStepIndex];
        if (activeInlineStep) {
          if (activeInlineStep.kind === "quiz_intro") {
            trackEvent("risk_quiz_intro_completed");
          } else if (activeInlineStep.kind === "quiz_question" && activeInlineStep.question) {
            var activeAnswer = getQuizAnswer(state.inlineOnboarding, activeInlineStep.question.id);
            if (!activeAnswer) {
              render(root, refs, state);
              return;
            }

            trackEvent("risk_quiz_answer_submitted", {
              question_id: activeInlineStep.question.id,
              selected_option: activeAnswer.selected_option,
              score: activeAnswer.score,
            });

            if (activeInlineStep.question.id === "Q8") {
              state.inlineOnboarding.quizResult = calculateInlineQuizResult(
                state.inlineOnboarding.payload,
                state.inlineOnboarding.quizAnswers,
              );
              if (state.inlineOnboarding.quizResult) {
                var elapsedSec = 0;
                if (state.inlineOnboarding.quizStartedAt) {
                  elapsedSec = Math.max(
                    0,
                    Math.round((Date.now() - state.inlineOnboarding.quizStartedAt) / 1000),
                  );
                }
                trackEvent("risk_quiz_completed", {
                  total_score: state.inlineOnboarding.quizResult.total_score,
                  raw_profile: state.inlineOnboarding.quizResult.raw_profile,
                  final_profile: state.inlineOnboarding.quizResult.final_profile,
                  total_time_sec: elapsedSec,
                });
              }
            }
          } else if (activeInlineStep.kind === "quiz_result") {
            var resultForContinue =
              state.inlineOnboarding.quizResult ||
              calculateInlineQuizResult(
                state.inlineOnboarding.payload,
                state.inlineOnboarding.quizAnswers,
              );
            if (resultForContinue) {
              state.inlineOnboarding.quizResult = resultForContinue;
              trackEvent("risk_quiz_continue_clicked", {
                final_profile: resultForContinue.final_profile,
              });
            }
          }
        }

        var lastIndex = state.inlineOnboarding.steps.length - 1;
        if (state.inlineOnboarding.activeStepIndex < lastIndex) {
          state.inlineOnboarding.activeStepIndex += 1;
        } else if (!state.inlineOnboarding.completed) {
          state.inlineOnboarding.completed = true;
          if (state.inlineOnboarding.payload) {
            trackEvent("inline_onboarding_completed", {
              segment: state.inlineOnboarding.payload.segment,
              amount_tier: state.inlineOnboarding.payload.amount_tier,
            });
          }
        }

        render(root, refs, state);
        return;
      } else if (action === "restart-segmentation") {
        resetInlineOnboardingState(state);
        state.segmentationFlow.resultPayload = null;
        state.segmentationFlow.targetRoute = "";
        state.segmentationFlow.inlineMode = true;
        state.segmentationFlow.direction = -1;
        state.segmentationFlow.stepIndex = 0;
        if (refs.result) {
          refs.result.classList.add("is-hidden");
        }
        trackEvent("segmentation_edit_started");

        state.segment = calculateSegment(state.qualifiedInvestor, state.experience);
        render(root, refs, state);
        return;
      } else if (action === "qualified") {
        state.qualifiedInvestor = value === "true";
      } else if (action === "experience") {
        state.experience = value;
      } else if (action === "amount") {
        state.amountTier = value;
        trackEvent("amount_selected", { amount_tier: value });
      } else if (action === "goal") {
        state.goal = value;
        trackEvent("goal_selected", { goal: value });
      } else if (action === "instrument") {
        var existingIndex = state.instruments.indexOf(value);
        if (existingIndex === -1) {
          state.instruments.push(value);
        } else {
          state.instruments.splice(existingIndex, 1);
        }
      } else if (action === "continue") {
        var payload = buildPayload(state);
        if (!payload) {
          return;
        }

        trackEvent("segmentation_completed", {
          segment: payload.segment,
          amount_tier: payload.amount_tier,
        });
        trackEvent("segment_" + payload.segment, {
          amount_tier: payload.amount_tier,
        });

        var inlineMode = shouldUseInlineOnboarding();
        var targetRoute = navigateToOnboarding(payload.segment, payload.amount_tier, {
          skipNavigation: inlineMode,
        });

        showTariffCard(refs, payload, targetRoute, { inlineMode: inlineMode });

        if (inlineMode) {
          startInlineOnboardingFlow(state, payload, targetRoute);
          trackEvent("inline_onboarding_started", {
            segment: payload.segment,
            amount_tier: payload.amount_tier,
          });

          var scrollTarget = refs.routePrep || refs.onboarding;
          if (scrollTarget && typeof scrollTarget.scrollIntoView === "function") {
            setTimeout(function () {
              scrollTarget.scrollIntoView({ behavior: "smooth", block: "start" });
            }, 30);
          }
        } else {
          resetInlineOnboardingState(state);
        }

        safeInvokeComplete(payload);

        root.dispatchEvent(
          new CustomEvent("segmentation:completed", {
            detail: {
              payload: payload,
              targetRoute: targetRoute,
            },
          }),
        );
      }

      state.segment = calculateSegment(state.qualifiedInvestor, state.experience);
      render(root, refs, state);
    });

    trackEvent("segmentation_started");
    render(root, refs, state);
    return root;
  }

  function mountInto(targetElement, replaceContent) {
    if (!targetElement) {
      return null;
    }

    if (replaceContent) {
      targetElement.innerHTML = "";
    }

    var root = createWidgetRoot();
    if (!root) {
      return null;
    }

    targetElement.appendChild(root);
    return initWidget(root);
  }

  function mountFromScript(scriptTag) {
    if (!scriptTag || scriptTag.getAttribute(SCRIPT_MOUNTED_ATTR) === "true") {
      return null;
    }

    var targetSelector = scriptTag.getAttribute("data-target");
    var root = null;

    if (targetSelector) {
      root = mount(targetSelector, { replace: true, wait: true });
      scriptTag.setAttribute(SCRIPT_MOUNTED_ATTR, "true");
      return root;
    }

    if (!root && scriptTag.parentElement && scriptTag.parentElement.tagName.toLowerCase() !== "head") {
      root = createWidgetRoot();
      if (root) {
        scriptTag.parentElement.insertBefore(root, scriptTag);
        initWidget(root);
      }
    }

    if (!root && document.body) {
      var fallbackHost = document.createElement("div");
      fallbackHost.setAttribute("data-segmentation-widget-auto", "true");
      document.body.appendChild(fallbackHost);
      root = mountInto(fallbackHost, true);
    }

    if (root) {
      scriptTag.setAttribute(SCRIPT_MOUNTED_ATTR, "true");
    }

    return root;
  }

  function querySelectorSafely(selector) {
    if (typeof selector !== "string") {
      return null;
    }

    try {
      return document.querySelector(selector);
    } catch (error) {
      return null;
    }
  }

  function mountWithRetry(selector, replaceContent, options) {
    var waitMs = options && typeof options.waitMs === "number" ? options.waitMs : 60000;
    var intervalMs =
      options && typeof options.intervalMs === "number" ? options.intervalMs : 200;
    var elapsed = 0;
    var mounted = false;
    var observer = null;

    function attemptMount() {
      if (mounted) {
        return true;
      }

      var targetElement = querySelectorSafely(selector);
      if (!targetElement) {
        return false;
      }

      mountInto(targetElement, replaceContent);
      mounted = true;
      return true;
    }

    if (attemptMount()) {
      return;
    }

    var timer = setInterval(function () {
      if (attemptMount()) {
        clearInterval(timer);
        if (observer) {
          observer.disconnect();
        }
        return;
      }

      elapsed += intervalMs;
      if (elapsed >= waitMs) {
        clearInterval(timer);
        if (observer) {
          observer.disconnect();
        }
      }
    }, intervalMs);

    if (typeof MutationObserver !== "undefined" && document.body) {
      observer = new MutationObserver(function () {
        if (!attemptMount()) {
          return;
        }
        clearInterval(timer);
        observer.disconnect();
      });

      observer.observe(document.body, { childList: true, subtree: true });
    }
  }

  function mountDefaultHostIfPresent() {
    var defaultHost = document.getElementById("finam-segmentation-widget");
    if (!defaultHost) {
      mount("#finam-segmentation-widget", { replace: true, wait: true, waitMs: 60000 });
      return null;
    }

    if (defaultHost.querySelector("[" + WIDGET_ROOT_ATTR + "]")) {
      return defaultHost;
    }

    return mountInto(defaultHost, true);
  }

  function ensureFallbackHostMounted() {
    var existingWidget = document.querySelector("[" + WIDGET_ROOT_ATTR + "]");
    if (existingWidget) {
      return existingWidget;
    }

    var defaultHost = document.getElementById("finam-segmentation-widget");
    if (defaultHost) {
      return mountInto(defaultHost, true);
    }

    if (!document.body) {
      return null;
    }

    var fallbackHost = document.getElementById("finam-segmentation-widget-auto");
    if (!fallbackHost) {
      fallbackHost = document.createElement("div");
      fallbackHost.id = "finam-segmentation-widget-auto";
      fallbackHost.setAttribute("data-segmentation-widget-auto", "true");
      fallbackHost.style.margin = "16px 0";
      document.body.appendChild(fallbackHost);
    }

    return mountInto(fallbackHost, true);
  }

  function initExistingWidgets() {
    var existingRoots = document.querySelectorAll("[" + WIDGET_ROOT_ATTR + "]");
    for (var i = 0; i < existingRoots.length; i += 1) {
      initWidget(existingRoots[i]);
    }
  }

  function mount(targetOrSelector, options) {
    var replaceContent = !options || options.replace !== false;
    ensureStyles();

    if (typeof targetOrSelector === "string") {
      var targetElement = querySelectorSafely(targetOrSelector);
      if (targetElement) {
        return mountInto(targetElement, replaceContent);
      }

      if (!options || options.wait !== false) {
        mountWithRetry(targetOrSelector, replaceContent, options);
      }
      return null;
    }

    return mountInto(targetOrSelector, replaceContent);
  }

  window.FinamSegmentationWidget = window.FinamSegmentationWidget || {};
  window.FinamSegmentationWidget.mount = mount;
  window.FinamSegmentationWidget.initAll = function () {
    ensureStyles();
    initExistingWidgets();
    mountDefaultHostIfPresent();
    ensureFallbackHostMounted();
  };
  window.FinamSegmentationWidget.version = "1.0.18";

  ensureStyles();
  initExistingWidgets();
  mountDefaultHostIfPresent();
  ensureFallbackHostMounted();

  var mounted = mountFromScript(SCRIPT_REF);
  if (!mounted && SCRIPT_REF && document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      mountFromScript(SCRIPT_REF);
      mountDefaultHostIfPresent();
      ensureFallbackHostMounted();
    });
  }

  if (document.readyState !== "loading") {
    setTimeout(function () {
      mountDefaultHostIfPresent();
      ensureFallbackHostMounted();
    }, 400);
  } else {
    document.addEventListener("DOMContentLoaded", function () {
      setTimeout(function () {
        mountDefaultHostIfPresent();
        ensureFallbackHostMounted();
      }, 400);
    });
  }
})();
