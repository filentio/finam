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
  --text-primary: #111111;
  --text-secondary: #444444;
  --text-inverse: #ffffff;
  --space-1: 8px;
  --space-2: 16px;
  --space-3: 24px;
  --space-4: 32px;
  --app-bottom-bar: 0px;
  --radius-sm: 16px;
  --radius-md: 16px;
  --radius-lg: 16px;
  --transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-base: 200ms cubic-bezier(0.4, 0, 0.2, 1);
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
  --segw-viewport-height: 100svh;
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
  width: 100%;
  padding: 0 16px;
}

.segw__seg-story-frame {
  width: 100%;
  max-width: 480px;
  min-height: var(--segw-viewport-height);
  height: var(--segw-viewport-height);
  max-height: var(--segw-viewport-height);
  border-radius: 16px;
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: #fff;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: none;
}

.segw__seg-story-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 16px 8px;
}

.segw__seg-story-close {
  border: 0;
  background: transparent;
  color: #fff;
  width: 44px;
  height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
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
  overflow: hidden;
  padding: 8px 16px 16px;
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
    transform: translateY(4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes segwSegSlidePrev {
  from {
    opacity: 0;
    transform: translateY(4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
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
  margin: 0 0 16px;
  font-size: 22px;
  font-weight: 600;
  line-height: 1.3;
}

.segw__seg-question-subtitle {
  margin: 0 0 8px;
  color: rgba(255, 255, 255, 0.86);
  font-size: 14px;
  line-height: 1.5;
}

.segw__seg-options {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: auto;
}

.segw__seg-option {
  width: 100%;
  border: 1px solid rgba(17, 17, 17, 0.14);
  border-radius: 16px;
  min-height: 48px;
  padding: 8px 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: center;
  text-align: center;
  background: #fff;
  color: #111;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: transform 200ms ease, box-shadow 200ms ease, border-color 200ms ease, background 200ms ease;
}

.segw__seg-option:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.segw__seg-option:active {
  transform: scale(0.98);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.08);
}

.segw__seg-option.is-selected {
  background: var(--segw-primary-soft);
  border-color: var(--segw-primary);
  color: #111;
  box-shadow: 0 0 0 1px rgba(26, 86, 219, 0.2), 0 4px 12px rgba(26, 86, 219, 0.16);
}

.segw__seg-option:disabled {
  opacity: 0.5;
  pointer-events: none;
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
  padding: 16px;
  padding-bottom: max(16px, env(safe-area-inset-bottom));
  background: linear-gradient(to top, rgba(0, 107, 235, 0.22), rgba(0, 107, 235, 0));
}

.segw__seg-story-next,
.segw__seg-cta {
  width: 100%;
  border: 0;
  border-radius: 16px;
  min-height: 48px;
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
  transform: translateY(-1px);
}

.segw__seg-story-next:active,
.segw__seg-cta:active {
  transform: scale(0.98);
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

.segw.segw--compact .segw__seg-story-header {
  padding: 10px 12px 6px;
}

.segw.segw--compact .segw__seg-story-progress {
  padding: 0 12px 6px;
}

.segw.segw--compact .segw__seg-story-content {
  padding: 6px 12px 10px;
}

.segw.segw--compact .segw__seg-intro-emoji,
.segw.segw--compact .segw__seg-result-emoji {
  font-size: 46px;
  margin-bottom: 10px;
}

.segw.segw--compact .segw__seg-intro-title,
.segw.segw--compact .segw__seg-result-title {
  margin-bottom: 8px;
  font-size: 24px;
}

.segw.segw--compact .segw__seg-intro-subtitle {
  margin-bottom: 10px;
  font-size: 15px;
  line-height: 1.35;
}

.segw.segw--compact .segw__seg-intro-card,
.segw.segw--compact .segw__seg-result-card {
  margin-bottom: 10px;
  padding: 12px;
}

.segw.segw--compact .segw__seg-benefits {
  gap: 8px;
}

.segw.segw--compact .segw__seg-benefits li {
  font-size: 14px;
}

.segw.segw--compact .segw__seg-intro-time {
  margin-bottom: 8px;
}

.segw.segw--compact .segw__seg-story-footer {
  padding: 10px 12px;
  padding-bottom: max(12px, env(safe-area-inset-bottom));
}

.segw.segw--compact .segw__seg-story-next,
.segw.segw--compact .segw__seg-cta {
  min-height: 44px;
  font-size: 15px;
}

.segw.segw--tight .segw__seg-intro-card,
.segw.segw--tight .segw__seg-intro-time {
  display: none;
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
  margin-top: 0;
  display: flex;
  justify-content: center;
  width: 100%;
  padding: 0 16px;
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
  width: 100%;
  min-height: var(--segw-viewport-height);
  height: var(--segw-viewport-height);
  background: #fff;
  padding: 0;
}

.segw__story-frame {
  width: 100%;
  max-width: 480px;
  height: var(--segw-viewport-height);
  max-height: var(--segw-viewport-height);
  min-height: var(--segw-viewport-height);
  margin: 0 auto;
  position: relative;
  overflow: hidden;
  border-radius: 16px;
  color: #111;
  opacity: 1;
  box-shadow: none;
  background: #fff;
  transition: none;
  display: block;
}

.segw__story-background-layer {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  background: #fff;
}

.segw__story-content-layer {
  position: relative;
  z-index: 1;
  min-height: 100%;
  height: 100%;
  display: grid;
  grid-template-rows: auto minmax(0, 1fr) auto;
  overflow: hidden;
}

.segw__story-header-layout {
  position: relative;
  z-index: 2;
  display: grid;
  gap: 8px;
  padding: 16px 16px 8px;
  background: #fff;
}

.segw__story-progress {
  display: flex;
  gap: 4px;
  padding: 0;
  position: relative;
  z-index: 2;
}

.segw__story-progress-segment {
  flex: 1 1 0;
  height: 4px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 999px;
  transition: background var(--transition-base);
}

.segw__story-progress-segment.is-active,
.segw__story-progress-segment.is-done {
  background: #fff;
}

.segw__story-content {
  position: relative;
  z-index: 2;
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  gap: 8px;
  padding: 16px;
  overflow: auto;
  -webkit-overflow-scrolling: touch;
}

.segw__story-content.is-lesson {
  justify-content: flex-start;
}

.segw__story-content.is-quiz-mode {
  justify-content: flex-start;
  gap: 12px;
  padding-top: 18px;
}

.segw__story-content.is-quiz-intro {
  justify-content: flex-start;
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
  border-radius: 16px;
  padding: var(--space-2);
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
  font-size: var(--text-base);
  text-align: center;
  cursor: pointer;
  transition: transform 200ms ease, box-shadow 200ms ease, border-color 200ms ease, background 200ms ease;
}

.segw__quiz-option:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.segw__quiz-option:active {
  transform: scale(0.98);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.14);
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
  animation: segwStorySlideNext 200ms ease;
}

.segw__story-content.is-enter-prev {
  animation: segwStorySlidePrev 200ms ease;
}

@keyframes segwStorySlideNext {
  from {
    opacity: 0;
    transform: translateY(4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes segwStorySlidePrev {
  from {
    opacity: 0;
    transform: translateY(4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
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
  gap: 8px;
  align-content: start;
}

.segw__lesson1-screen--hero,
.segw__lesson1-screen--cta {
  min-height: auto;
  align-content: start;
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
  border: 0;
  background: rgba(255, 255, 255, 0.1);
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
  gap: 8px;
  max-height: none;
  overflow: hidden;
  padding-right: 0;
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

.segw__lesson2-screen,
.segw__lesson3-screen,
.segw__lesson4-screen,
.segw__lesson5-screen,
.segw__lesson6-screen {
  display: grid;
  gap: 16px;
  align-content: start;
}

.segw__lesson2-screen--hero,
.segw__lesson2-screen--cta,
.segw__lesson3-screen--hero,
.segw__lesson3-screen--cta,
.segw__lesson4-screen--cta,
.segw__lesson5-screen--hero,
.segw__lesson5-screen--cta,
.segw__lesson6-screen--hero,
.segw__lesson6-screen--cta {
  min-height: auto;
  align-content: start;
  text-align: center;
}

.segw__lesson2-emoji,
.segw__lesson3-emoji,
.segw__lesson5-emoji,
.segw__lesson6-emoji {
  font-size: 48px;
  text-align: center;
}

.segw__lesson2-title,
.segw__lesson3-title,
.segw__lesson4-title,
.segw__lesson5-title,
.segw__lesson6-title {
  margin: 0;
  font-size: 24px;
  line-height: 1.2;
}

.segw__lesson2-subtitle,
.segw__lesson3-subtitle,
.segw__lesson4-subtitle,
.segw__lesson5-subtitle,
.segw__lesson6-subtitle {
  margin: 0;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.9);
}

.segw__lesson2-text,
.segw__lesson3-text,
.segw__lesson4-text,
.segw__lesson5-text,
.segw__lesson6-text {
  margin: 0;
  font-size: 14px;
  line-height: 1.4;
  color: rgba(255, 255, 255, 0.9);
}

.segw__lesson2-quote {
  margin: 0;
  padding: 10px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.16);
  border: 1px solid rgba(255, 255, 255, 0.3);
  font-size: 20px;
  font-style: italic;
  line-height: 1.35;
}

.segw__lesson2-author {
  margin: 0;
  text-align: center;
  color: rgba(255, 255, 255, 0.85);
  font-size: 14px;
}

.segw__lesson2-shield {
  width: 52px;
  height: 52px;
  margin: 0 auto;
  border-radius: 14px;
  background: rgba(255, 215, 0, 0.22);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
}

.segw__lesson2-risk-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

.segw__lesson2-risk-card {
  border-radius: 12px;
  padding: 8px;
  background: rgba(255, 255, 255, 0.14);
  border: 1px solid rgba(255, 255, 255, 0.28);
  animation: segwQuizFadeIn 300ms ease both;
}

.segw__lesson2-risk-title {
  color: var(--risk-color, #fff);
  font-size: 15px;
}

.segw__lesson2-risk-text {
  margin: 6px 0 0;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.35;
}

.segw__lesson2-rules {
  display: grid;
  gap: 6px;
}

.segw__lesson2-rule {
  border-radius: 12px;
  padding: 8px;
  background: rgba(255, 255, 255, 0.14);
  border: 1px solid rgba(255, 255, 255, 0.28);
  display: flex;
  gap: 8px;
}

.segw__lesson2-rule-num {
  width: 22px;
  height: 22px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.3);
  font-size: 12px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
}

.segw__lesson2-rule-body p {
  margin: 4px 0 0;
  font-size: 12px;
}

.segw__lesson2-tip {
  border-radius: 12px;
  padding: 10px 12px;
  background: rgba(255, 249, 196, 0.24);
  border: 1px solid rgba(255, 249, 196, 0.65);
  display: flex;
  gap: 8px;
  color: #fff;
}

.segw__lesson2-tip-icon {
  flex: 0 0 auto;
}

.segw__lesson2-chart {
  height: 120px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.28);
  background: rgba(255, 255, 255, 0.12);
  display: flex;
  align-items: center;
  padding: 0 12px;
}

.segw__lesson2-chart-line {
  width: 100%;
  height: 2px;
  background: linear-gradient(90deg, rgba(255, 255, 255, 0.5), #fff);
  position: relative;
}

.segw__lesson2-chart-line::before {
  content: "";
  position: absolute;
  inset: -18px 0 -18px 0;
  background: linear-gradient(
    to right,
    transparent 0%,
    transparent 12%,
    rgba(255, 255, 255, 0.9) 20%,
    transparent 28%,
    rgba(255, 255, 255, 0.9) 48%,
    transparent 56%,
    rgba(255, 255, 255, 0.9) 78%,
    transparent 86%,
    transparent 100%
  );
  mask-image: linear-gradient(to bottom, transparent, #000 25%, #000 75%, transparent);
}

.segw__lesson3-visual {
  min-height: 110px;
  border-radius: 12px;
  border: 0;
  background: rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 12px;
}

.segw__lesson3-pie,
.segw__lesson4-pie {
  width: 130px;
  height: 130px;
  border-radius: 999px;
  margin: 0 auto;
  border: 4px solid rgba(255, 255, 255, 0.3);
}

.segw__lesson3-note,
.segw__lesson4-note,
.segw__lesson5-note,
.segw__lesson6-note {
  margin: 0;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.82);
}

.segw__lesson3-portfolio-head {
  margin: 0;
  font-weight: 700;
}

.segw__lesson3-portfolio-table {
  display: grid;
  gap: 6px;
}

.segw__lesson3-portfolio-row {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  padding: 7px 8px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.14);
  border: 1px solid rgba(255, 255, 255, 0.28);
  font-size: 13px;
  animation: segwQuizFadeIn 300ms ease both;
}

.segw__lesson3-goal-advice {
  border-radius: 12px;
  padding: 10px 12px;
  background: rgba(255, 255, 255, 0.18);
  border: 1px solid rgba(255, 255, 255, 0.32);
  font-size: 14px;
  line-height: 1.4;
}

.segw__lesson3-spectrum {
  display: grid;
  gap: 6px;
}

.segw__lesson3-spectrum-row {
  border-radius: 10px;
  padding: 7px 8px;
  background: rgba(255, 255, 255, 0.14);
  border: 1px solid rgba(255, 255, 255, 0.28);
  display: grid;
  gap: 4px;
}

.segw__lesson4-profile-badge {
  margin: 0 auto;
  border-radius: 999px;
  padding: 10px 16px;
  font-weight: 700;
  background: color-mix(in srgb, var(--profile-color, #4caf50) 35%, transparent);
  border: 1px solid color-mix(in srgb, var(--profile-color, #4caf50) 70%, #fff 30%);
}

.segw__lesson4-breakdown {
  display: grid;
  gap: 6px;
}

.segw__lesson4-row {
  border-radius: 10px;
  padding: 7px 8px;
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.3);
  display: flex;
  justify-content: space-between;
  gap: 8px;
  font-size: 13px;
}

.segw__lesson4-levels {
  display: grid;
  gap: 6px;
}

.segw__lesson4-level-card {
  border-radius: 10px;
  padding: 8px;
  background: rgba(255, 255, 255, 0.14);
  border: 1px solid rgba(255, 255, 255, 0.28);
  display: grid;
  gap: 4px;
}

.segw__lesson4-level-card p,
.segw__lesson4-level-card small {
  margin: 0;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.9);
}

.segw__lesson5-top-list,
.segw__lesson5-quiz-list,
.segw__lesson5-faq {
  display: grid;
  gap: 6px;
}

.segw__lesson5-top-card,
.segw__lesson5-quiz-option,
.segw__lesson5-faq-item {
  border-radius: 12px;
  padding: 8px;
  background: rgba(255, 255, 255, 0.22);
  border: 1px solid rgba(255, 255, 255, 0.42);
}

.segw__lesson5-top-card.is-primary {
  border-color: rgba(76, 175, 80, 0.8);
  box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.25);
}

.segw__lesson5-top-head {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  align-items: center;
}

.segw__lesson5-badge {
  font-size: 11px;
  border-radius: 999px;
  padding: 4px 8px;
  background: rgba(76, 175, 80, 0.22);
  border: 1px solid rgba(76, 175, 80, 0.7);
}

.segw__lesson5-top-card p,
.segw__lesson5-top-card small,
.segw__lesson5-quiz-option p {
  margin: 6px 0 0;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.92);
}

.segw__lesson5-why {
  font-size: 12px;
}

.segw__lesson5-quiz-option {
  width: 100%;
  text-align: left;
  cursor: pointer;
}

.segw__lesson5-quiz-option.is-selected {
  border-color: rgba(76, 175, 80, 0.9);
  box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.28);
}

.segw__lesson5-mismatch {
  margin: 0;
  border-radius: 10px;
  padding: 10px;
  background: rgba(255, 221, 87, 0.22);
  border: 1px solid rgba(255, 221, 87, 0.7);
  color: #fff7cc;
  font-size: 13px;
}

.segw__lesson5-faq-question {
  width: 100%;
  border: 0;
  background: transparent;
  color: #fff;
  text-align: left;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  padding: 0;
}

.segw__lesson5-faq-answer {
  margin: 8px 0 0;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.92);
}

.segw__lesson6-compare,
.segw__lesson6-tariffs {
  display: grid;
  gap: 6px;
}

.segw__lesson6-compare-row,
.segw__lesson6-tariff-card {
  border-radius: 10px;
  padding: 8px;
  background: rgba(0, 0, 0, 0.18);
  border: 1px solid rgba(255, 255, 255, 0.34);
  color: #fff;
}

.segw__lesson6-tariff-card p,
.segw__lesson6-tariff-card small {
  margin: 6px 0 0;
  display: block;
  color: rgba(255, 255, 255, 0.9);
  font-size: 12px;
}

.segw__lesson6-tariff-card.is-recommended {
  border-color: rgba(255, 152, 0, 0.9);
  box-shadow: 0 0 0 2px rgba(255, 152, 0, 0.3);
}

.segw__lesson6-tariff-badge {
  display: inline-flex;
  margin-top: 6px;
  font-size: 11px;
  border-radius: 999px;
  padding: 4px 8px;
  background: rgba(255, 152, 0, 0.28);
  border: 1px solid rgba(255, 152, 0, 0.8);
}

.segw__onboarding-step-title,
.segw__quiz-intro-title,
.segw__quiz-result-title,
.segw__lesson1-title,
.segw__lesson2-title,
.segw__lesson3-title,
.segw__lesson4-title,
.segw__lesson5-title,
.segw__lesson6-title {
  font-size: 22px;
  line-height: 1.3;
  font-weight: 600;
}

.segw__quiz-question-title {
  font-size: 18px;
  line-height: 1.4;
  font-weight: 600;
}

.segw__onboarding-step-text,
.segw__quiz-result-description,
.segw__quiz-allocation-title,
.segw__lesson1-subtitle,
.segw__lesson1-body,
.segw__lesson2-text,
.segw__lesson3-text,
.segw__lesson4-text,
.segw__lesson5-text,
.segw__lesson6-text {
  font-size: 16px;
  line-height: 1.5;
}

.segw__seg-question-subtitle,
.segw__quiz-question-block-title,
.segw__lesson2-subtitle,
.segw__lesson3-subtitle,
.segw__lesson4-subtitle,
.segw__lesson5-subtitle,
.segw__lesson6-subtitle,
.segw__story-hint {
  font-size: 14px;
  line-height: 1.5;
}

.segw__seg-story-frame,
.segw__story-frame,
.segw__seg-option,
.segw__seg-story-next,
.segw__seg-cta,
.segw__story-next,
.segw__seg-intro-card,
.segw__seg-result-card,
.segw__seg-track-item,
.segw__onboarding-points li,
.segw__quiz-benefits,
.segw__quiz-option,
.segw__quiz-result-badge,
.segw__quiz-allocation-card,
.segw__lesson1-visual,
.segw__lesson1-highlight,
.segw__lesson1-step-card,
.segw__lesson1-instrument-card,
.segw__lesson1-goal-accent,
.segw__lesson1-cta,
.segw__lesson2-quote,
.segw__lesson2-risk-card,
.segw__lesson2-rule,
.segw__lesson2-tip,
.segw__lesson2-chart,
.segw__lesson3-visual,
.segw__lesson3-portfolio-row,
.segw__lesson3-goal-advice,
.segw__lesson3-spectrum-row,
.segw__lesson4-row,
.segw__lesson4-level-card,
.segw__lesson5-top-card,
.segw__lesson5-quiz-option,
.segw__lesson5-faq-item,
.segw__lesson5-mismatch,
.segw__lesson6-compare-row,
.segw__lesson6-tariff-card {
  border-radius: 16px;
}

.segw__lesson6-calculator {
  border-radius: 12px;
  padding: 8px;
  background: rgba(0, 0, 0, 0.16);
  border: 1px solid rgba(255, 255, 255, 0.32);
  display: grid;
  gap: 6px;
}

.segw__lesson6-slider-label {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.9);
}

.segw__lesson6-slider {
  width: 100%;
}

.segw__lesson6-calc-result {
  border-radius: 10px;
  padding: 6px;
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.26);
  display: grid;
  gap: 4px;
}

.segw__lesson6-calc-result p,
.segw__lesson6-calc-result strong {
  margin: 0;
  font-size: 13px;
}

.segw__onboarding-meta {
  margin: 0;
  padding: 0 0 4px;
  color: rgba(255, 255, 255, 0.78);
  text-align: center;
  font-size: 12px;
}

.segw__story-hint {
  margin: 0;
  padding: 0 0 10px;
  text-align: center;
  color: rgba(255, 255, 255, 0.6);
  font-size: 11px;
}

.segw__story-tapzones {
  position: absolute;
  z-index: 1;
  top: 72px;
  left: 0;
  right: 0;
  bottom: 112px;
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
  position: relative;
  margin-top: 0;
  z-index: 3;
  padding: 8px 16px 0;
  padding-bottom: calc(env(safe-area-inset-bottom) + var(--app-bottom-bar) + 16px);
  background: #fff;
  border-top: 1px solid #dbe3f0;
}

.segw__story-next {
  width: 100%;
  border: 0;
  min-height: 48px;
  border-radius: 16px;
  padding: 0 18px;
  background: rgba(255, 255, 255, 0.3);
  color: #fff;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  backdrop-filter: blur(8px);
  transition: all var(--transition-base);
}

.segw__story-next:hover {
  background: rgba(255, 255, 255, 0.4);
  transform: translateY(-1px);
}

.segw__story-next:active {
  transform: scale(0.98);
}

.segw__story-next.is-quiz-cta {
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.24);
  color: #fff;
  box-shadow: none;
}

.segw__story-next.is-quiz-cta:hover {
  background: rgba(255, 255, 255, 0.3);
}

.segw__story-next:disabled {
  background: rgba(255, 255, 255, 0.12);
  color: rgba(255, 255, 255, 0.5);
  opacity: 0.55;
  cursor: not-allowed;
}

.segw__story-top-label {
  margin: 0;
  padding: 0;
  font-size: 14px;
  line-height: 1.5;
  font-weight: 600;
  color: #444;
}

.segw__story-frame {
  background: #fff !important;
  color: #111;
  opacity: 1 !important;
}

.segw__story-background-layer {
  background: #fff;
  pointer-events: none;
}

.segw__story-progress-segment {
  background: rgba(17, 17, 17, 0.15);
}

.segw__story-progress-segment.is-active,
.segw__story-progress-segment.is-done {
  background: #1a56db;
}

.segw__story-footer {
  background: #fff;
  border-top: 1px solid #dbe3f0;
}

.segw__story-next,
.segw__story-next.is-quiz-cta {
  background: #1a56db;
  color: #fff;
  min-height: 48px;
  border-radius: 16px;
  box-shadow: 0 8px 20px rgba(26, 86, 219, 0.26);
}

.segw__story-next:hover,
.segw__story-next.is-quiz-cta:hover {
  background: #1447c4;
}

.segw__story-next:disabled {
  background: #9eb6eb;
  color: #fff;
  opacity: 0.65;
}

.segw.segw--compact .segw__story-header-layout {
  padding: 10px 12px 6px;
  gap: 6px;
}

.segw.segw--compact .segw__story-content {
  padding: 10px 12px;
}

.segw.segw--compact .segw__story-footer {
  padding: 6px 12px 0;
  padding-bottom: calc(env(safe-area-inset-bottom) + var(--app-bottom-bar) + 12px);
}

.segw.segw--compact .segw__story-next {
  min-height: 44px;
  font-size: 15px;
}

.segw.segw--compact .segw__onboarding-step-title,
.segw.segw--compact .segw__quiz-intro-title,
.segw.segw--compact .segw__quiz-result-title,
.segw.segw--compact .segw__lesson1-title,
.segw.segw--compact .segw__lesson2-title,
.segw.segw--compact .segw__lesson3-title,
.segw.segw--compact .segw__lesson4-title,
.segw.segw--compact .segw__lesson5-title,
.segw.segw--compact .segw__lesson6-title {
  font-size: 20px;
}

.segw.segw--compact .segw__onboarding-step-text,
.segw.segw--compact .segw__lesson1-subtitle,
.segw.segw--compact .segw__lesson1-body,
.segw.segw--compact .segw__lesson2-text,
.segw.segw--compact .segw__lesson3-text,
.segw.segw--compact .segw__lesson4-text,
.segw.segw--compact .segw__lesson5-text,
.segw.segw--compact .segw__lesson6-text {
  font-size: 15px;
  line-height: 1.4;
}

.segw__onboarding-meta {
  color: #444;
}

.segw__story-hint {
  color: #444;
}

.segw__story-frame .segw__onboarding-step-title,
.segw__story-frame .segw__quiz-intro-title,
.segw__story-frame .segw__quiz-result-title,
.segw__story-frame .segw__quiz-question-title,
.segw__story-frame .segw__lesson1-title,
.segw__story-frame .segw__lesson2-title,
.segw__story-frame .segw__lesson3-title,
.segw__story-frame .segw__lesson4-title,
.segw__story-frame .segw__lesson5-title,
.segw__story-frame .segw__lesson6-title {
  color: #111;
}

.segw__story-frame .segw__onboarding-step-text,
.segw__story-frame .segw__quiz-intro-subtitle,
.segw__story-frame .segw__quiz-question-block-title,
.segw__story-frame .segw__quiz-result-description,
.segw__story-frame .segw__lesson1-subtitle,
.segw__story-frame .segw__lesson1-body,
.segw__story-frame .segw__lesson2-subtitle,
.segw__story-frame .segw__lesson3-subtitle,
.segw__story-frame .segw__lesson4-subtitle,
.segw__story-frame .segw__lesson5-subtitle,
.segw__story-frame .segw__lesson6-subtitle,
.segw__story-frame .segw__lesson1-visual-text,
.segw__story-frame .segw__lesson1-step-description,
.segw__story-frame .segw__lesson1-instrument-description,
.segw__story-frame .segw__lesson1-instrument-risk,
.segw__story-frame .segw__lesson2-text,
.segw__story-frame .segw__lesson3-text,
.segw__story-frame .segw__lesson4-text,
.segw__story-frame .segw__lesson5-text,
.segw__story-frame .segw__lesson6-text,
.segw__story-frame .segw__lesson3-note,
.segw__story-frame .segw__lesson4-note,
.segw__story-frame .segw__lesson5-note,
.segw__story-frame .segw__lesson6-note {
  color: #444;
}

.segw__story-frame .segw__quiz-question-block-title,
.segw__story-frame .segw__lesson1-subtitle,
.segw__story-frame .segw__lesson2-subtitle,
.segw__story-frame .segw__lesson3-subtitle,
.segw__story-frame .segw__lesson4-subtitle,
.segw__story-frame .segw__lesson5-subtitle,
.segw__story-frame .segw__lesson6-subtitle {
  font-size: 16px;
  font-weight: 400;
  line-height: 1.5;
}

.segw__story-frame .segw__lesson1-cta-actions,
.segw__story-frame .segw__lesson5-top-list,
.segw__story-frame .segw__lesson5-quiz-list,
.segw__story-frame .segw__lesson5-faq,
.segw__story-frame .segw__lesson6-compare,
.segw__story-frame .segw__lesson6-tariffs {
  gap: 8px;
}

.segw__story-frame .segw__lesson2-screen,
.segw__story-frame .segw__lesson3-screen,
.segw__story-frame .segw__lesson4-screen,
.segw__story-frame .segw__lesson5-screen,
.segw__story-frame .segw__lesson6-screen {
  gap: 16px;
}

.segw__story-frame .segw__lesson5-top-card,
.segw__story-frame .segw__lesson5-quiz-option,
.segw__story-frame .segw__lesson5-faq-item,
.segw__story-frame .segw__lesson6-compare-row,
.segw__story-frame .segw__lesson6-tariff-card,
.segw__story-frame .segw__lesson6-calculator,
.segw__story-frame .segw__lesson6-calc-result,
.segw__story-frame .segw__lesson1-visual,
.segw__story-frame .segw__lesson1-step-card,
.segw__story-frame .segw__lesson1-instrument-card,
.segw__story-frame .segw__lesson1-goal-accent,
.segw__story-frame .segw__lesson3-portfolio-row,
.segw__story-frame .segw__lesson4-row,
.segw__story-frame .segw__lesson4-level-card,
.segw__story-frame .segw__lesson3-goal-advice,
.segw__story-frame .segw__lesson3-spectrum-row,
.segw__story-frame .segw__lesson5-mismatch {
  border-radius: 16px;
  padding: 16px;
  background: #fff;
  border: 1px solid #dbe3f0;
  color: #111;
}

.segw__story-frame .segw__lesson1-highlight {
  background: #e8f5e9;
  border: 1px solid #75c987;
  color: #111;
}

.segw__story-frame .segw__lesson1-highlight-text {
  color: #111;
}

.segw__story-frame .segw__lesson1-visual,
.segw__story-frame .segw__lesson2-quote {
  max-height: 320px;
  overflow: auto;
  -webkit-overflow-scrolling: touch;
}

.segw__story-frame .segw__lesson5-top-card p,
.segw__story-frame .segw__lesson5-top-card small,
.segw__story-frame .segw__lesson5-quiz-option p,
.segw__story-frame .segw__lesson6-tariff-card p,
.segw__story-frame .segw__lesson6-tariff-card small,
.segw__story-frame .segw__lesson6-slider-label,
.segw__story-frame .segw__lesson6-calc-result p,
.segw__story-frame .segw__lesson2-author,
.segw__story-frame .segw__lesson2-risk-text,
.segw__story-frame .segw__lesson4-level-card p,
.segw__story-frame .segw__lesson4-level-card small {
  color: #444;
}

.segw__story-frame .segw__lesson2-risk-title,
.segw__story-frame .segw__lesson2-tip {
  color: #111;
}

.segw__story-frame .segw__lesson5-quiz-option {
  cursor: pointer;
  transition: transform 200ms ease, box-shadow 200ms ease, border-color 200ms ease;
}

.segw__story-frame .segw__lesson5-quiz-option:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.segw__story-frame .segw__lesson5-quiz-option.is-selected {
  border-color: #1a56db;
  background: #eef4ff;
  box-shadow: 0 0 0 1px rgba(26, 86, 219, 0.2);
}

.segw__story-frame .segw__lesson5-mismatch {
  background: #fff9e8;
  border-color: #f7d78d;
  color: #5a4300;
}

.segw__story-frame .segw__lesson5-faq-item {
  padding: 0;
  overflow: hidden;
  transition: box-shadow 200ms ease, border-color 200ms ease, background 200ms ease;
}

.segw__story-frame .segw__lesson5-faq-item:hover {
  border-color: #c8d5eb;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.segw__story-frame .segw__lesson5-faq-item.is-open {
  background: #fff;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
}

.segw__story-frame .segw__lesson5-faq-question {
  min-height: 48px;
  padding: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #111;
  cursor: pointer;
}

.segw__story-frame .segw__lesson5-faq-question-text {
  display: inline-block;
}

.segw__story-frame .segw__lesson5-faq-chevron {
  flex: 0 0 auto;
  font-size: 18px;
  line-height: 1;
  color: #444;
  transition: transform 200ms ease;
}

.segw__story-frame .segw__lesson5-faq-item.is-open .segw__lesson5-faq-chevron {
  transform: rotate(180deg);
}

.segw__story-frame .segw__lesson5-faq-answer {
  margin: 0;
  padding: 0 16px;
  max-height: 0;
  opacity: 0;
  overflow: hidden;
  color: #444;
  transition: max-height 200ms ease, opacity 200ms ease, padding 200ms ease;
}

.segw__story-frame .segw__lesson5-faq-item.is-open .segw__lesson5-faq-answer {
  max-height: 220px;
  opacity: 1;
  padding: 0 16px 16px;
}

.segw__story-frame .segw__lesson1-cta {
  min-height: 48px;
  border-radius: 16px;
  transition: transform 200ms ease, box-shadow 200ms ease, background 200ms ease, border-color 200ms ease;
}

.segw__story-frame .segw__lesson1-cta--primary {
  background: #1a56db;
  color: #fff;
}

.segw__story-frame .segw__lesson1-cta--primary:hover {
  background: #1447c4;
}

.segw__story-frame .segw__lesson1-cta--secondary {
  background: #fff;
  color: #111;
  border: 1px solid #c8d5eb;
  opacity: 1;
  pointer-events: auto;
  cursor: pointer;
}

.segw__story-frame .segw__lesson1-cta--secondary:hover {
  border-color: #1a56db;
  box-shadow: 0 4px 12px rgba(26, 86, 219, 0.16);
}

.segw__story-frame .segw__lesson1-cta--secondary:disabled {
  opacity: 1;
  pointer-events: auto;
  cursor: pointer;
}

.segw__story-frame .segw__lesson1-cta:active {
  transform: scale(0.98);
}

.segw__story-frame .segw__lesson5-hero-note {
  margin: 0;
  padding: 16px;
  border-radius: 16px;
  background: #fff;
  border: 1px solid #dbe3f0;
  color: #444;
  font-size: 16px;
  line-height: 1.5;
}

.segw__story-frame .segw__quiz-benefits,
.segw__story-frame .segw__quiz-result-badge,
.segw__story-frame .segw__quiz-allocation-card {
  background: #fff;
  border: 1px solid #dbe3f0;
  color: #111;
}

.segw__story-frame .segw__quiz-benefits-title,
.segw__story-frame .segw__quiz-benefit-item,
.segw__story-frame .segw__quiz-allocation-item,
.segw__story-frame .segw__quiz-allocation-value,
.segw__story-frame .segw__quiz-allocation-breakdown {
  color: #444;
}

.segw__story-frame .segw__quiz-option {
  background: #fff;
  color: #111;
  border: 1px solid #dbe3f0;
}

.segw__story-frame .segw__quiz-option:hover {
  background: #f7f9ff;
}

.segw__story-frame .segw__quiz-option.is-selected {
  background: #eef4ff;
  border-color: #1a56db;
  color: #1a56db;
}

.segw__seg-story-next,
.segw__seg-cta {
  background: #1a56db;
  color: #fff;
}

.segw__seg-story-next:hover,
.segw__seg-cta:hover {
  background: #1447c4;
}

.segw__onboarding.is-entering .segw__story-frame {
  animation: none;
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
  display: none !important;
}

.segw__onboarding-footer {
  display: none !important;
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
  .segw__story-wrapper {
    padding: 0;
  }

  .segw__story-frame {
    min-height: var(--segw-viewport-height);
    height: var(--segw-viewport-height);
    max-height: var(--segw-viewport-height);
    border-radius: 16px;
    box-shadow: none;
  }
}

@media (max-width: 720px) {
  .segw__questionnaire {
    padding: 0 16px;
  }

  .segw__seg-story-frame {
    max-width: none;
    min-height: var(--segw-viewport-height);
    height: var(--segw-viewport-height);
    max-height: var(--segw-viewport-height);
    border-radius: 16px;
    box-shadow: none;
  }

  .segw__story-wrapper {
    min-height: var(--segw-viewport-height);
    height: var(--segw-viewport-height);
    padding: 0;
    border-radius: 0;
    background: #fff;
  }

  .segw__story-frame {
    max-width: none;
    border-radius: 16px;
    min-height: var(--segw-viewport-height);
    height: var(--segw-viewport-height);
    max-height: var(--segw-viewport-height);
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
        <div class="segw__story-background-layer" aria-hidden="true"></div>
        <div class="segw__story-content-layer">
          <div class="segw__story-header-layout">
            <div class="segw__story-progress" data-role="story-progress"></div>
            <p class="segw__story-top-label" data-role="story-top-label">Урок 1 из 6</p>
          </div>
          <div class="segw__story-content" data-role="story-content"></div>

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
            <p class="segw__onboarding-meta" data-role="onboarding-counter">Урок 1 из 6</p>
            <p class="segw__story-hint" data-role="onboarding-hint">
              Тап по правой части — следующий экран, по левой — предыдущий.
            </p>
            <button type="button" class="segw__story-next" data-action="onboarding-next" data-role="onboarding-next-label">
              Далее →
            </button>
          </div>
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

  var LESSON_2_RISK_CARDS = [
    {
      id: "market_risk",
      emoji: "📉",
      title: "Рыночный",
      description:
        "Цены на бирже могут падать. Это нормально — рынок всегда восстанавливается, но нужно время.",
      color: "#FF5252",
    },
    {
      id: "credit_risk",
      emoji: "🏢",
      title: "Кредитный",
      description:
        "Компания может обанкротиться. Поэтому не стоит вкладывать всё в одну бумагу.",
      color: "#FF9800",
    },
    {
      id: "currency_risk",
      emoji: "🌍",
      title: "Валютный",
      description:
        "Курс рубля может измениться. Это влияет на стоимость иностранных активов.",
      color: "#2196F3",
    },
    {
      id: "inflation_risk",
      emoji: "🔥",
      title: "Инфляционный",
      description:
        "Деньги на вкладе могут обесцениваться. Инвестиции помогают обогнать инфляцию.",
      color: "#FFC107",
    },
  ];

  var LESSON_2_SAFETY_BY_AMOUNT = {
    up_to_300k: {
      text:
        "Прежде чем инвестировать, убедитесь, что у вас есть резерв на 3–6 месяцев расходов. Начните с небольшой суммы, которую не страшно потерять.",
      tip: "Инвестируйте только свободные деньги",
    },
    "300k_2m": {
      text:
        "Даже с хорошим капиталом важно не инвестировать более 30% сбережений. Оставьте резерв на непредвиденные расходы.",
      tip: "Не более 30% сбережений в инвестиции",
    },
    "2m_5m": {
      text:
        "С вашим капиталом ключевое правило — распределение по классам активов. Часть средств всегда должна быть в ликвидных инструментах.",
      tip: "Распределите по классам активов",
    },
    more_5m: {
      text:
        "При значительном капитале рассмотрите хеджирование рисков через производные инструменты и международную диверсификацию.",
      tip: "Рассмотрите хеджирование",
    },
  };

  var LESSON_3_PORTFOLIOS_BY_AMOUNT = {
    up_to_300k: {
      name: "Стартовый",
      total: "30 000 ₽",
      instruments: [
        { name: "ETF на индекс Мосбиржи", ticker: "TMOS", amount: "15 000 ₽", pct: "50%", type: "ETF" },
        { name: "ОФЗ 26238", ticker: "SU26238", amount: "15 000 ₽", pct: "50%", type: "Облигация" },
      ],
      note: "💡 Всего 2 инструмента — просто и эффективно",
    },
    "300k_2m": {
      name: "Базовый",
      total: "500 000 ₽",
      instruments: [
        { name: "ETF на индекс Мосбиржи", ticker: "TMOS", amount: "150 000 ₽", pct: "30%", type: "ETF" },
        { name: "ОФЗ 26238", ticker: "SU26238", amount: "150 000 ₽", pct: "30%", type: "Облигация" },
        { name: "Сбербанк", ticker: "SBER", amount: "100 000 ₽", pct: "20%", type: "Акция" },
        { name: "Корпоративные облигации", ticker: "RU000A1", amount: "100 000 ₽", pct: "20%", type: "Облигация" },
      ],
      note: "💡 4 инструмента — хорошая диверсификация",
    },
    "2m_5m": {
      name: "Расширенный",
      total: "2 000 000 ₽",
      instruments: [
        { name: "ETF на индекс Мосбиржи", ticker: "TMOS", amount: "400 000 ₽", pct: "20%", type: "ETF" },
        { name: "ОФЗ 26238", ticker: "SU26238", amount: "400 000 ₽", pct: "20%", type: "Облигация" },
        { name: "Сбербанк", ticker: "SBER", amount: "300 000 ₽", pct: "15%", type: "Акция" },
        { name: "Лукойл", ticker: "LKOH", amount: "300 000 ₽", pct: "15%", type: "Акция" },
        { name: "Корпоративные облигации", ticker: "RU000A1", amount: "300 000 ₽", pct: "15%", type: "Облигация" },
        { name: "Золото (ETF)", ticker: "GOLD", amount: "300 000 ₽", pct: "15%", type: "Товарный" },
      ],
      note: "💡 6 инструментов — полноценная диверсификация",
    },
    more_5m: {
      name: "Премиальный",
      total: "5 000 000 ₽",
      instruments: [
        { name: "ETF на индекс Мосбиржи", ticker: "TMOS", amount: "750 000 ₽", pct: "15%", type: "ETF" },
        { name: "ОФЗ 26238", ticker: "SU26238", amount: "750 000 ₽", pct: "15%", type: "Облигация" },
        { name: "Сбербанк", ticker: "SBER", amount: "500 000 ₽", pct: "10%", type: "Акция" },
        { name: "Лукойл", ticker: "LKOH", amount: "500 000 ₽", pct: "10%", type: "Акция" },
        { name: "Яндекс", ticker: "YDEX", amount: "500 000 ₽", pct: "10%", type: "Акция" },
        { name: "Корпоративные облигации", ticker: "RU000A1", amount: "500 000 ₽", pct: "10%", type: "Облигация" },
        { name: "Золото (ETF)", ticker: "GOLD", amount: "500 000 ₽", pct: "10%", type: "Товарный" },
        { name: "Доверительное управление", ticker: "DU_BALANCED", amount: "1 000 000 ₽", pct: "20%", type: "ДУ" },
      ],
      note: "💡 8 инструментов + ДУ — максимальная диверсификация",
    },
  };

  var LESSON_3_GOAL_ADVICE = {
    purchase:
      "📌 Для накопления на покупку: увеличьте долю облигаций до 70% — предсказуемый доход к нужной дате.",
    passive_income:
      "📌 Для пассивного дохода: выбирайте дивидендные акции и облигации с купонами — регулярные выплаты.",
    growth:
      "📌 Для роста капитала: увеличьте долю акций до 60% — долгосрочный потенциал роста.",
    preservation:
      "📌 Для сохранения капитала: добавьте ОФЗ-ИН и золото — защита от инфляции.",
  };

  var LESSON_4_PROFILE_META = {
    conservative: {
      title: "Ваш профиль: Консервативный",
      subtitle: "Приоритет — сохранение капитала и стабильный доход",
      emoji: "🛡️",
      color: "#2196F3",
      name: "консервативного",
    },
    moderate: {
      title: "Ваш профиль: Умеренный",
      subtitle: "Баланс между ростом и защитой капитала",
      emoji: "⚖️",
      color: "#4CAF50",
      name: "умеренного",
    },
    aggressive: {
      title: "Ваш профиль: Агрессивный",
      subtitle: "Приоритет — максимальный рост капитала",
      emoji: "🚀",
      color: "#FF9800",
      name: "агрессивного",
    },
    ultra_aggressive: {
      title: "Ваш профиль: Сверхагрессивный",
      subtitle: "Готовность к высоким рискам ради высокой доходности",
      emoji: "⚡",
      color: "#F44336",
      name: "сверхагрессивного",
    },
  };

  var LESSON_5_TOP_BY_PROFILE_GOAL = {
    conservative: {
      purchase: [
        {
          name: "ОФЗ 26238",
          ticker: "SU26238",
          type: "Облигация",
          description: "Государственные облигации — самый надёжный инструмент",
          yield: "~10% годовых",
          risk: "Минимальный",
          why: "Предсказуемый доход к дате покупки",
          min_amount: "1 000 ₽",
          deeplink: "finamtrade://instrument/SU26238",
        },
        {
          name: "Фонд облигаций SBGB",
          ticker: "SBGB",
          type: "ETF",
          description: "Корзина из десятков облигаций в одной покупке",
          yield: "~9% годовых",
          risk: "Низкий",
          why: "Диверсификация без лишних усилий",
          min_amount: "500 ₽",
          deeplink: "finamtrade://instrument/SBGB",
        },
        {
          name: "Сбербанк (SBER)",
          ticker: "SBER",
          type: "Акция",
          description: "Крупнейший банк России, дивидендная акция",
          yield: "~5% дивиденды + рост",
          risk: "Средний",
          why: "Небольшая доля акций для роста",
          min_amount: "300 ₽",
          deeplink: "finamtrade://instrument/SBER",
        },
      ],
      passive_income: [
        {
          name: "ОФЗ 26238",
          ticker: "SU26238",
          type: "Облигация",
          description: "Государственные облигации с купонами",
          yield: "~10% годовых",
          risk: "Минимальный",
          why: "Регулярные купонные выплаты",
          min_amount: "1 000 ₽",
          deeplink: "finamtrade://instrument/SU26238",
        },
        {
          name: "Сбербанк (SBER)",
          ticker: "SBER",
          type: "Акция",
          description: "Дивидендная акция с историей выплат",
          yield: "~5% дивиденды",
          risk: "Средний",
          why: "Стабильные дивиденды 2 раза в год",
          min_amount: "300 ₽",
          deeplink: "finamtrade://instrument/SBER",
        },
        {
          name: "Лукойл (LKOH)",
          ticker: "LKOH",
          type: "Акция",
          description: "Нефтяная компания с высокими дивидендами",
          yield: "~7% дивиденды",
          risk: "Средний",
          why: "Высокая дивидендная доходность",
          min_amount: "6 000 ₽",
          deeplink: "finamtrade://instrument/LKOH",
        },
      ],
    },
    moderate: {
      growth: [
        {
          name: "ETF на индекс Мосбиржи (TMOS)",
          ticker: "TMOS",
          type: "ETF",
          description: "Весь рынок в одной покупке",
          yield: "~15% годовых (средняя)",
          risk: "Средний",
          why: "Диверсификация + рост",
          min_amount: "500 ₽",
          deeplink: "finamtrade://instrument/TMOS",
        },
        {
          name: "Сбербанк (SBER)",
          ticker: "SBER",
          type: "Акция",
          description: "Голубая фишка с потенциалом роста",
          yield: "~5% дивиденды + рост",
          risk: "Средний",
          why: "Баланс между ростом и дивидендами",
          min_amount: "300 ₽",
          deeplink: "finamtrade://instrument/SBER",
        },
        {
          name: "ОФЗ 26238",
          ticker: "SU26238",
          type: "Облигация",
          description: "Стабилизатор портфеля",
          yield: "~10% годовых",
          risk: "Низкий",
          why: "Снижение волатильности",
          min_amount: "1 000 ₽",
          deeplink: "finamtrade://instrument/SU26238",
        },
      ],
    },
    aggressive: {
      growth: [
        {
          name: "ETF на индекс Мосбиржи (TMOS)",
          ticker: "TMOS",
          type: "ETF",
          description: "Весь рынок в одной покупке",
          yield: "~15% годовых (средняя)",
          risk: "Средний",
          why: "Диверсификация + рост",
          min_amount: "500 ₽",
          deeplink: "finamtrade://instrument/TMOS",
        },
        {
          name: "Яндекс (YDEX)",
          ticker: "YDEX",
          type: "Акция",
          description: "Лидер IT-сектора в России",
          yield: "Потенциал роста",
          risk: "Высокий",
          why: "Рост капитала в долгосрочной перспективе",
          min_amount: "3 000 ₽",
          deeplink: "finamtrade://instrument/YDEX",
        },
        {
          name: "Сбербанк (SBER)",
          ticker: "SBER",
          type: "Акция",
          description: "Голубая фишка с потенциалом роста",
          yield: "~5% дивиденды + рост",
          risk: "Средний",
          why: "Баланс между ростом и дивидендами",
          min_amount: "300 ₽",
          deeplink: "finamtrade://instrument/SBER",
        },
      ],
    },
    ultra_aggressive: {
      growth: [
        {
          name: "Яндекс (YDEX)",
          ticker: "YDEX",
          type: "Акция",
          description: "Акция роста с высоким потенциалом",
          yield: "Потенциал роста",
          risk: "Высокий",
          why: "Фокус на рост капитала",
          min_amount: "3 000 ₽",
          deeplink: "finamtrade://instrument/YDEX",
        },
        {
          name: "ETF на индекс Мосбиржи (TMOS)",
          ticker: "TMOS",
          type: "ETF",
          description: "Широкая диверсификация по рынку",
          yield: "~15% годовых (средняя)",
          risk: "Средний",
          why: "Ядро портфеля даже для активного профиля",
          min_amount: "500 ₽",
          deeplink: "finamtrade://instrument/TMOS",
        },
        {
          name: "Акции роста (малая кап.)",
          ticker: "GROWTH",
          type: "Акция",
          description: "Высокорисковые истории роста",
          yield: "Высокий потенциал",
          risk: "Очень высокий",
          why: "Добавка к агрессивной стратегии",
          min_amount: "2 000 ₽",
          deeplink: "finamtrade://instrument/YDEX",
        },
      ],
    },
  };

  var LESSON_6_TARIFFS = [
    {
      id: "long_term_portfolio",
      name: "Долгосрочный портфель",
      price: "0 ₽/мес",
      commission: "Покупка: 0% · Продажа: 0,28%",
      best_for: "Для долгосрочного удержания бумаг",
      features: ["✓ Без абонплаты", "✓ Бесплатная покупка", "✓ Подходит для долгого горизонта"],
    },
    {
      id: "investor",
      name: "Инвестор",
      price: "200 ₽/мес",
      commission: "Акции/облигации: 0,035%",
      best_for: "Для регулярных сделок и объёмов",
      features: ["✓ Низкая комиссия", "✓ Подходит для активного инвестора", "✓ Базовая аналитика"],
      recommended: true,
      badge: "Оптимальный",
    },
    {
      id: "strateg",
      name: "Стратег",
      price: "0 ₽/мес",
      commission: "Акции: 0,05% (мин. 50 ₽)",
      best_for: "Для сделок без фиксированной абонплаты",
      features: ["✓ Без абонплаты", "✓ Предсказуемый минимум комиссии", "✓ Подходит для умеренной активности"],
    },
    {
      id: "single_day",
      name: "Единый дневной",
      price: "177 ₽/мес",
      commission: "Акции: 0,0354% (мин. 41,3 ₽)",
      best_for: "Для активной внутридневной торговли",
      features: ["✓ Низкая ставка", "✓ Подходит для частых сделок", "✓ Прозрачный минимум"],
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
    progressRoot.setAttribute("role", "progressbar");
    progressRoot.setAttribute("aria-label", "Прогресс анкеты");
    progressRoot.setAttribute("aria-valuemin", "1");
    progressRoot.setAttribute("aria-valuemax", String(SEGMENTATION_TOTAL_SEGMENTS));
    progressRoot.setAttribute("aria-valuenow", String(progressIndex + 1));
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

    var screenKey = "intro";
    if (flow.resultPayload) {
      screenKey = "result";
    } else if (flow.stepIndex >= 0 && flow.stepIndex < SEGMENTATION_STORY_ORDER.length) {
      screenKey = "question:" + String(flow.stepIndex);
    }

    var shouldAnimate = flow.lastRenderedScreenKey !== screenKey;
    refs.segContent.innerHTML = "";
    refs.segContent.classList.remove(
      "is-enter-next",
      "is-enter-prev",
      "is-intro",
      "is-question",
      "is-result",
    );
    if (shouldAnimate) {
      refs.segContent.classList.add(flow.direction >= 0 ? "is-enter-next" : "is-enter-prev");
    }

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
      flow.lastRenderedScreenKey = screenKey;
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
      flow.lastRenderedScreenKey = screenKey;
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
    optionsWrap.setAttribute("role", stepConfig.multiple ? "group" : "radiogroup");
    optionsWrap.setAttribute("aria-label", stepConfig.title);
    var options = Array.isArray(stepConfig.options) ? stepConfig.options : [];
    for (var o = 0; o < options.length; o += 1) {
      var option = options[o];
      var isSelected = isSegmentationOptionSelected(state, stepId, option.value);
      var optionButton = createStoryNode("button", "segw__seg-option");
      optionButton.type = "button";
      optionButton.setAttribute("data-action", stepConfig.action);
      optionButton.setAttribute("data-value", option.value);
      optionButton.setAttribute("role", stepConfig.multiple ? "checkbox" : "radio");
      optionButton.setAttribute("aria-pressed", isSelected ? "true" : "false");
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
    flow.lastRenderedScreenKey = screenKey;
  }

  function refreshSegmentationStepUI(refs, state) {
    if (!refs.segContent) {
      return;
    }

    var flow = state.segmentationFlow;
    if (flow.resultPayload || flow.stepIndex < 0 || flow.stepIndex >= SEGMENTATION_STORY_ORDER.length) {
      return;
    }

    var stepId = SEGMENTATION_STORY_ORDER[flow.stepIndex];
    var stepConfig = SEGMENTATION_STORY_STEPS[stepId];
    if (!stepConfig) {
      return;
    }

    var optionButtons = refs.segContent.querySelectorAll(".segw__seg-option[data-action][data-value]");
    for (var i = 0; i < optionButtons.length; i += 1) {
      var button = optionButtons[i];
      var value = button.getAttribute("data-value");
      var isSelected = isSegmentationOptionSelected(state, stepId, value || "");
      button.classList.toggle("is-selected", isSelected);
      button.setAttribute("aria-pressed", isSelected ? "true" : "false");
      if (stepConfig.multiple) {
        var check = button.querySelector(".segw__seg-option-check");
        if (check) {
          check.textContent = isSelected ? "✓" : "☐";
        }
      }
    }

    if (refs.segNextButton) {
      refs.segNextButton.disabled = !isSegmentationStepAnswered(state, stepId);
    }
  }

  function refreshLesson5QuizUI(contentRoot, selectedType, isMatch) {
    if (!contentRoot) {
      return;
    }

    var options = contentRoot.querySelectorAll(".segw__lesson5-quiz-option[data-value]");
    for (var i = 0; i < options.length; i += 1) {
      var option = options[i];
      var value = option.getAttribute("data-value");
      var isSelected = selectedType && value === selectedType;
      option.classList.toggle("is-selected", Boolean(isSelected));
      option.setAttribute("aria-pressed", isSelected ? "true" : "false");
    }

    var mismatch = contentRoot.querySelector('[data-role="lesson5-mismatch"]');
    if (mismatch) {
      mismatch.classList.toggle("segw__is-hidden", isMatch !== false);
    }
  }

  function refreshLesson5FaqUI(contentRoot, openId) {
    if (!contentRoot) {
      return;
    }

    var rows = contentRoot.querySelectorAll(".segw__lesson5-faq-item[data-question-id]");
    for (var i = 0; i < rows.length; i += 1) {
      var row = rows[i];
      var rowId = row.getAttribute("data-question-id");
      var isOpen = Boolean(openId) && rowId === openId;
      row.classList.toggle("is-open", isOpen);
      var trigger = row.querySelector(".segw__lesson5-faq-question");
      if (trigger) {
        trigger.setAttribute("aria-expanded", isOpen ? "true" : "false");
      }
    }
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

  function getLesson5TopInstruments(riskProfile, goal) {
    var byProfile = LESSON_5_TOP_BY_PROFILE_GOAL[riskProfile] || LESSON_5_TOP_BY_PROFILE_GOAL.moderate;
    if (byProfile && Array.isArray(byProfile[goal])) {
      return byProfile[goal];
    }
    if (byProfile && Array.isArray(byProfile.growth)) {
      return byProfile.growth;
    }
    var fallbackProfile = LESSON_5_TOP_BY_PROFILE_GOAL.conservative;
    if (fallbackProfile && Array.isArray(fallbackProfile[goal])) {
      return fallbackProfile[goal];
    }
    return fallbackProfile.purchase || [];
  }

  function getRecommendedTariff(amountTier, riskProfile) {
    if (amountTier === "more_5m") {
      return {
        tariff: "investor",
        label: "Инвестор",
        reason:
          "Для крупных объёмов обычно выгоднее низкая ставка 0,035% даже с абонплатой 200 ₽/мес.",
      };
    }

    if (amountTier === "2m_5m") {
      return {
        tariff: "investor",
        label: "Инвестор",
        reason:
          "При таком капитале тариф Инвестор чаще всего даёт лучшую итоговую комиссию.",
      };
    }

    if (riskProfile === "aggressive" || riskProfile === "ultra_aggressive") {
      if (amountTier === "up_to_300k") {
        return {
          tariff: "strateg",
          label: "Стратег",
          reason:
            "Для активного стиля без фиксированной абонплаты удобно начать со Стратега.",
        };
      }
      return {
        tariff: "single_day",
        label: "Единый дневной",
        reason:
          "При активных сделках Единый дневной может быть выгоднее за счёт ставки 0,0354%.",
      };
    }

    return {
      tariff: "long_term_portfolio",
      label: "Долгосрочный портфель",
      reason:
        "Для спокойных долгосрочных инвестиций без частых продаж подходит тариф Долгосрочный портфель.",
    };
  }

  function calculateTariffSavings(monthlyTrades, avgTradeAmount) {
    var trades = Math.max(1, Number(monthlyTrades) || 1);
    var amount = Math.max(5000, Number(avgTradeAmount) || 5000);
    var longTermDeal = amount * 0.0028;
    var investorDeal = amount * 0.00035;
    var longTermAnnual = Math.round(longTermDeal * trades * 12);
    var investorAnnual = Math.round(investorDeal * trades * 12 + 200 * 12);
    var savings = Math.max(0, longTermAnnual - investorAnnual);
    var savingsPct = longTermAnnual > 0 ? Math.round((savings / longTermAnnual) * 100) : 0;
    return {
      long_term_annual_commission: longTermAnnual,
      investor_annual_commission: investorAnnual,
      savings: savings,
      savings_pct: savingsPct,
    };
  }

  function formatMoney(value) {
    var numberValue = Number(value) || 0;
    return numberValue.toLocaleString("ru-RU") + " ₽";
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
    var amountTier = payload.amount_tier;
    var goal = payload.investment_goal;

    var mythContent = {
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
    var lesson1Myth = mythContent[amountTier] || mythContent.up_to_300k;

    var firstStepByAmount = {
      up_to_300k: "Начните с комфортной суммы — от 10 000 ₽",
      "300k_2m": "Переведите сумму, с которой хотите начать",
      "2m_5m": "Переведите часть запланированной суммы",
      more_5m: "Переведите первый транш для формирования портфеля",
    };

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

    var safetyContent = LESSON_2_SAFETY_BY_AMOUNT[amountTier] || LESSON_2_SAFETY_BY_AMOUNT.up_to_300k;
    var portfolioForAmount =
      LESSON_3_PORTFOLIOS_BY_AMOUNT[amountTier] || LESSON_3_PORTFOLIOS_BY_AMOUNT.up_to_300k;
    var goalAdvice = LESSON_3_GOAL_ADVICE[goal] || LESSON_3_GOAL_ADVICE.growth;

    var lesson1 = [
      {
        kind: "lesson1_hero",
        lesson: 1,
        lesson_id: "lesson_1",
        screen_id: "screen_1_1",
        screen_number: 1,
        gradient: "var(--gradient-lesson-1)",
        emoji: "🚀",
        title: "Инвестировать проще, чем кажется",
        subtitle:
          "Вы уже сделали первый шаг — открыли счёт. Теперь давайте разберёмся, что дальше.",
        illustration_alt: "Путь от точки А к точке Б",
      },
      {
        kind: "lesson1_myth",
        lesson: 1,
        lesson_id: "lesson_1",
        screen_id: "screen_1_2",
        screen_number: 2,
        gradient: "var(--gradient-lesson-1)",
        title: "Миф: нужны миллионы",
        text: lesson1Myth.text,
        highlight: lesson1Myth.highlight,
      },
      {
        kind: "lesson1_steps",
        lesson: 1,
        lesson_id: "lesson_1",
        screen_id: "screen_1_3",
        screen_number: 3,
        gradient: "var(--gradient-lesson-1)",
        title: "Три шага к первой инвестиции",
        steps: [
          {
            number: 1,
            emoji: "💳",
            title: "Пополните счёт",
            description: firstStepByAmount[amountTier] || firstStepByAmount.up_to_300k,
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
      },
      {
        kind: "lesson1_cards",
        lesson: 1,
        lesson_id: "lesson_1",
        screen_id: "screen_1_4",
        screen_number: 4,
        gradient: "var(--gradient-lesson-1)",
        title: "Что можно купить?",
        subtitle: "Основные классы активов на бирже",
        cards: lessonOneCards,
        goal_accent: goalAdvice.replace(/^📌\s*/, ""),
      },
      {
        kind: "lesson1_cta",
        lesson: 1,
        lesson_id: "lesson_1",
        screen_id: "screen_1_5",
        screen_number: 5,
        gradient: "var(--gradient-lesson-1)",
        title: "Готовы начать?",
        deeplink: "finamtrade://deposit",
      },
    ];

    var lesson2 = [
      {
        kind: "lesson2_hero",
        lesson: 2,
        lesson_id: "lesson_2",
        screen_id: "screen_2_1",
        screen_number: 1,
        gradient: "var(--gradient-lesson-2)",
        emoji: "🛡️",
        title: "Главное правило инвестора",
        quote:
          "«Правило №1: никогда не теряйте деньги.\nПравило №2: никогда не забывайте правило №1»",
        author: "Уоррен Баффет",
      },
      {
        kind: "lesson2_risks",
        lesson: 2,
        lesson_id: "lesson_2",
        screen_id: "screen_2_2",
        screen_number: 2,
        gradient: "var(--gradient-lesson-2)",
        title: "Какие бывают риски?",
        cards: LESSON_2_RISK_CARDS,
      },
      {
        kind: "lesson2_management",
        lesson: 2,
        lesson_id: "lesson_2",
        screen_id: "screen_2_3",
        screen_number: 3,
        gradient: "var(--gradient-lesson-2)",
        title: "Как управлять рисками?",
        text:
          "Главный инструмент — диверсификация. Не кладите все яйца в одну корзину: распределяйте деньги между разными активами, секторами и странами.",
        rules: [
          { number: 1, title: "Разные активы", example: "Акции + облигации + фонды" },
          { number: 2, title: "Разные секторы", example: "IT + финансы + энергетика" },
          { number: 3, title: "Разные страны", example: "Россия + международные рынки" },
        ],
      },
      {
        kind: "lesson2_safety",
        lesson: 2,
        lesson_id: "lesson_2",
        screen_id: "screen_2_4",
        screen_number: 4,
        gradient: "var(--gradient-lesson-2)",
        title: "Правило подушки безопасности",
        text: safetyContent.text,
        tip: safetyContent.tip,
      },
      {
        kind: "lesson2_market",
        lesson: 2,
        lesson_id: "lesson_2",
        screen_id: "screen_2_5",
        screen_number: 5,
        gradient: "var(--gradient-lesson-2)",
        title: "Что делать, если рынок падает?",
        text:
          "Рынок падает — это нормально. За последние 20 лет индекс Мосбиржи падал более чем на 20% пять раз, но каждый раз восстанавливался.",
        market_rules: [
          { number: 1, title: "Не паникуйте", description: "Не продавайте на дне — зафиксируете убыток" },
          {
            number: 2,
            title: "Помните о горизонте",
            description: "Если инвестируете на 3+ года — краткосрочные падения не важны",
          },
          {
            number: 3,
            title: "Падение = возможность",
            description: "Опытные инвесторы докупают подешевевшие активы",
          },
        ],
      },
      {
        kind: "lesson2_cta",
        lesson: 2,
        lesson_id: "lesson_2",
        screen_id: "screen_2_6",
        screen_number: 6,
        gradient: "var(--gradient-lesson-2)",
        title: "Теперь вы знаете, как защитить свои деньги",
        subtitle: "В следующем уроке — как собрать свой первый портфель.",
      },
    ];

    var lesson3Common = {
      portfolio: portfolioForAmount,
      goal_advice: goalAdvice,
      subtitle:
        payload.segment === "advanced"
          ? "Вот пример оптимизированного портфеля для вашей суммы:"
          : "Вот как может выглядеть ваш первый портфель:",
    };

    var lesson3Novice = [
      {
        kind: "lesson3_hero",
        lesson: 3,
        lesson_id: "lesson_3",
        screen_id: "screen_3_1",
        screen_number: 1,
        gradient: "var(--gradient-lesson-3)",
        emoji: "📊",
        title: "Портфель — это не одна бумага",
        subtitle:
          "Инвестиционный портфель — это набор разных активов, которые работают вместе.",
      },
      {
        kind: "lesson3_allocation",
        lesson: 3,
        lesson_id: "lesson_3",
        screen_id: "screen_3_2",
        screen_number: 2,
        gradient: "var(--gradient-lesson-3)",
        title: "Что такое аллокация?",
      },
      {
        kind: "lesson3_portfolio",
        lesson: 3,
        lesson_id: "lesson_3",
        screen_id: "screen_3_3",
        screen_number: 3,
        gradient: "var(--gradient-lesson-3)",
        title: "Пример портфеля",
        subtitle: lesson3Common.subtitle,
        portfolio: lesson3Common.portfolio,
        goal_advice: lesson3Common.goal_advice,
      },
      {
        kind: "lesson3_spectrum",
        lesson: 3,
        lesson_id: "lesson_3",
        screen_id: "screen_3_4",
        screen_number: 4,
        gradient: "var(--gradient-lesson-3)",
        title: "Портфель зависит от вашего отношения к риску",
        text:
          "Каким должен быть именно ваш портфель? Это зависит от вашего отношения к риску. Сейчас мы определим его — это займёт всего 1 минуту.",
      },
      {
        kind: "lesson3_cta",
        lesson: 3,
        lesson_id: "lesson_3",
        screen_id: "screen_3_5",
        screen_number: 5,
        gradient: "var(--gradient-lesson-3)",
        title: "Определим ваш риск-профиль",
        subtitle: "4 вопроса, ~1 минута",
        description:
          "На основе ваших ответов мы подберём оптимальное распределение активов и рекомендуем подходящие инструменты.",
      },
    ];

    var lesson3Advanced = [
      {
        kind: "lesson3_portfolio",
        lesson: 3,
        lesson_id: "lesson_3",
        screen_id: "screen_3_3",
        screen_number: 1,
        gradient: "var(--gradient-lesson-3)",
        title: "Пример портфеля",
        subtitle: lesson3Common.subtitle,
        portfolio: lesson3Common.portfolio,
        goal_advice: lesson3Common.goal_advice,
      },
      {
        kind: "lesson3_spectrum",
        lesson: 3,
        lesson_id: "lesson_3",
        screen_id: "screen_3_4",
        screen_number: 2,
        gradient: "var(--gradient-lesson-3)",
        title: "Портфель зависит от вашего отношения к риску",
        text:
          "Давайте уточним ваш риск-профиль, чтобы подобрать оптимальную аллокацию для вашей ситуации.",
      },
      {
        kind: "lesson3_cta",
        lesson: 3,
        lesson_id: "lesson_3",
        screen_id: "screen_3_5",
        screen_number: 3,
        gradient: "var(--gradient-lesson-3)",
        title: "Определим ваш риск-профиль",
        subtitle: "4 вопроса, ~1 минута",
        description:
          "На основе ваших ответов мы подберём оптимальное распределение активов и рекомендуем подходящие инструменты.",
      },
    ];

    var lesson4 = [
      {
        kind: "lesson4_hero",
        lesson: 4,
        lesson_id: "lesson_4",
        screen_id: "screen_4_1",
        screen_number: 1,
        gradient: "var(--gradient-lesson-5)",
      },
      {
        kind: "lesson4_allocation",
        lesson: 4,
        lesson_id: "lesson_4",
        screen_id: "screen_4_2",
        screen_number: 2,
        gradient: "var(--gradient-lesson-5)",
      },
      {
        kind: "lesson4_levels",
        lesson: 4,
        lesson_id: "lesson_4",
        screen_id: "screen_4_3",
        screen_number: 3,
        gradient: "var(--gradient-lesson-5)",
      },
      {
        kind: "lesson4_portfolio",
        lesson: 4,
        lesson_id: "lesson_4",
        screen_id: "screen_4_4",
        screen_number: 4,
        gradient: "var(--gradient-lesson-5)",
      },
      {
        kind: "lesson4_cta",
        lesson: 4,
        lesson_id: "lesson_4",
        screen_id: "screen_4_5",
        screen_number: 5,
        gradient: "var(--gradient-lesson-5)",
        title: "Теперь вы знаете, как диверсифицировать портфель",
        subtitle: "В следующем уроке — конкретные рекомендации, что купить первым.",
      },
    ];

    var lesson5 = [
      {
        kind: "lesson5_hero",
        lesson: 5,
        lesson_id: "lesson_5",
        screen_id: "screen_5_1",
        screen_number: 1,
        gradient: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
      },
      {
        kind: "lesson5_top3",
        lesson: 5,
        lesson_id: "lesson_5",
        screen_id: "screen_5_2",
        screen_number: 2,
        gradient: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
      },
      {
        kind: "lesson5_quiz",
        lesson: 5,
        lesson_id: "lesson_5",
        screen_id: "screen_5_3",
        screen_number: 3,
        gradient: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
      },
      {
        kind: "lesson5_howto",
        lesson: 5,
        lesson_id: "lesson_5",
        screen_id: "screen_5_4",
        screen_number: 4,
        gradient: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
      },
      {
        kind: "lesson5_faq",
        lesson: 5,
        lesson_id: "lesson_5",
        screen_id: "screen_5_5",
        screen_number: 5,
        gradient: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
      },
      {
        kind: "lesson5_cta",
        lesson: 5,
        lesson_id: "lesson_5",
        screen_id: "screen_5_6",
        screen_number: 6,
        gradient: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
      },
    ];

    var lesson6 = [
      {
        kind: "lesson6_hero",
        lesson: 6,
        lesson_id: "lesson_6",
        screen_id: "screen_6_1",
        screen_number: 1,
        gradient: "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)",
      },
      {
        kind: "lesson6_intro",
        lesson: 6,
        lesson_id: "lesson_6",
        screen_id: "screen_6_2",
        screen_number: 2,
        gradient: "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)",
      },
      {
        kind: "lesson6_compare",
        lesson: 6,
        lesson_id: "lesson_6",
        screen_id: "screen_6_3",
        screen_number: 3,
        gradient: "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)",
      },
      {
        kind: "lesson6_recommendation",
        lesson: 6,
        lesson_id: "lesson_6",
        screen_id: "screen_6_4",
        screen_number: 4,
        gradient: "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)",
      },
      {
        kind: "lesson6_cta",
        lesson: 6,
        lesson_id: "lesson_6",
        screen_id: "screen_6_5",
        screen_number: 5,
        gradient: "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)",
      },
    ];

    if (payload.segment === "novice") {
      return insertRiskQuizSteps(payload.segment, lesson1.concat(lesson2, lesson3Novice, lesson4, lesson5, lesson6));
    }

    if (payload.segment === "advanced") {
      return insertRiskQuizSteps(payload.segment, lesson3Advanced.concat(lesson4, lesson6));
    }

    return insertRiskQuizSteps(payload.segment, lesson6);
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
    state.inlineOnboarding.lastRenderedStepIndex = -1;
    state.inlineOnboarding.lessonState = {
      startedAt: {},
      completed: {},
      investorType: null,
      investorTypeMatch: null,
      faqOpenId: null,
      calculator: {
        monthlyTrades: 4,
        avgTradeAmount: 20000,
      },
      buyClicked: false,
      tariffSelected: null,
      onboardingCompleted: false,
    };
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
    state.inlineOnboarding.lastRenderedStepIndex = -1;
    state.inlineOnboarding.lessonState = {
      startedAt: {},
      completed: {},
      investorType: null,
      investorTypeMatch: null,
      faqOpenId: null,
      calculator: {
        monthlyTrades: 4,
        avgTradeAmount: 20000,
      },
      buyClicked: false,
      tariffSelected: null,
      onboardingCompleted: false,
    };
  }

  function getInlineRiskProfile(inlineState) {
    if (inlineState && inlineState.quizResult && inlineState.quizResult.final_profile) {
      return inlineState.quizResult.final_profile;
    }
    return null;
  }

  function ensureInlineLessonState(inlineState) {
    if (!inlineState.lessonState) {
      inlineState.lessonState = {
        startedAt: {},
        completed: {},
        investorType: null,
        investorTypeMatch: null,
        faqOpenId: null,
        calculator: {
          monthlyTrades: 4,
          avgTradeAmount: 20000,
        },
        buyClicked: false,
        tariffSelected: null,
        onboardingCompleted: false,
      };
    }
    return inlineState.lessonState;
  }

  function trackLessonStarted(inlineState, step) {
    if (!step || !step.lesson_id || !inlineState || !inlineState.payload) {
      return;
    }
    var lessonState = ensureInlineLessonState(inlineState);
    if (lessonState.startedAt[step.lesson_id]) {
      return;
    }

    lessonState.startedAt[step.lesson_id] = Date.now();
    var payload = inlineState.payload;
    var eventPayload = {
      segment: payload.segment,
      amount_tier: payload.amount_tier,
      goal: payload.investment_goal,
    };

    var riskProfile = getInlineRiskProfile(inlineState);
    if (riskProfile) {
      eventPayload.risk_profile = riskProfile;
    }

    trackEvent(step.lesson_id + "_started", eventPayload);
  }

  function trackLessonScreenViewed(inlineState, step) {
    if (!step || !step.lesson_id) {
      return;
    }

    var eventPayload = {
      screen_id: step.screen_id || step.kind || step.lesson_id,
      screen_number: step.screen_number || 1,
    };
    if (inlineState && inlineState.payload) {
      eventPayload.segment = inlineState.payload.segment;
    }
    trackEvent(step.lesson_id + "_screen_viewed", eventPayload);
  }

  function trackLessonCompleted(inlineState, lessonId, extraPayload) {
    if (!inlineState || !lessonId) {
      return;
    }
    var lessonState = ensureInlineLessonState(inlineState);
    if (lessonState.completed[lessonId]) {
      return;
    }

    var startedAt = lessonState.startedAt[lessonId] || 0;
    var spent = startedAt ? Math.max(0, Math.round((Date.now() - startedAt) / 1000)) : 0;
    var payload = {
      time_spent: spent,
    };

    if (inlineState.payload) {
      payload.segment = inlineState.payload.segment;
      payload.amount_tier = inlineState.payload.amount_tier;
    }
    var riskProfile = getInlineRiskProfile(inlineState);
    if (riskProfile) {
      payload.risk_profile = riskProfile;
    }
    if (extraPayload && typeof extraPayload === "object") {
      for (var key in extraPayload) {
        if (Object.prototype.hasOwnProperty.call(extraPayload, key)) {
          payload[key] = extraPayload[key];
        }
      }
    }

    trackEvent(lessonId + "_completed", payload);
    lessonState.completed[lessonId] = true;
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
    progressRoot.setAttribute("role", "progressbar");
    progressRoot.setAttribute("aria-label", "Прогресс обучения");
    progressRoot.setAttribute("aria-valuemin", "1");
    progressRoot.setAttribute("aria-valuemax", String(totalSegments));
    progressRoot.setAttribute("aria-valuenow", String(currentSegment + 1));

    for (var i = 0; i < totalSegments; i += 1) {
      var segment = document.createElement("span");
      segment.className = "segw__story-progress-segment";
      if (i < currentSegment) {
        segment.classList.add("is-done");
      } else if (i === currentSegment) {
        segment.classList.add("is-active");
      }
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

    var lessonState = ensureInlineLessonState(inlineState || {});
    var payload = inlineState && inlineState.payload ? inlineState.payload : null;
    var riskProfile = getInlineRiskProfile(inlineState) || "moderate";
    var allocation =
      inlineState && inlineState.quizResult && inlineState.quizResult.allocation
        ? inlineState.quizResult.allocation
        : QUIZ_PROFILE_ALLOCATIONS[riskProfile] || QUIZ_PROFILE_ALLOCATIONS.moderate;

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
      optionsRoot.setAttribute("role", "listbox");
      optionsRoot.setAttribute("aria-label", question.question || "Варианты ответа");
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
        optionButton.setAttribute("role", "option");
        optionButton.setAttribute(
          "aria-pressed",
          selected && selected.selected_option === option.id ? "true" : "false",
        );
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

    if (step.kind === "lesson2_hero") {
      contentRoot.classList.add("is-lesson", "is-lesson2");
      var l2Hero = createStoryNode("section", "segw__lesson2-screen segw__lesson2-screen--hero");
      l2Hero.appendChild(createStoryNode("div", "segw__lesson2-emoji", step.emoji || "🛡️"));
      l2Hero.appendChild(createStoryNode("h3", "segw__lesson2-title", step.title || "Главное правило инвестора"));
      var quote = createStoryNode("blockquote", "segw__lesson2-quote", step.quote || "");
      l2Hero.appendChild(quote);
      l2Hero.appendChild(createStoryNode("p", "segw__lesson2-author", step.author || "Уоррен Баффет"));
      l2Hero.appendChild(createStoryNode("div", "segw__lesson2-shield", "🛡️"));
      contentRoot.appendChild(l2Hero);
      return;
    }

    if (step.kind === "lesson2_risks") {
      contentRoot.classList.add("is-lesson", "is-lesson2");
      var l2Risks = createStoryNode("section", "segw__lesson2-screen");
      l2Risks.appendChild(createStoryNode("h3", "segw__lesson2-title", step.title || "Какие бывают риски?"));
      var riskGrid = createStoryNode("div", "segw__lesson2-risk-grid");
      var riskCards = Array.isArray(step.cards) ? step.cards : [];
      for (var r = 0; r < riskCards.length; r += 1) {
        var risk = riskCards[r];
        var riskCard = createStoryNode("article", "segw__lesson2-risk-card");
        riskCard.style.animationDelay = String(r * 100) + "ms";
        riskCard.style.setProperty("--risk-color", risk.color || "#fff");
        riskCard.appendChild(createStoryNode("div", "segw__lesson2-risk-emoji", risk.emoji || "•"));
        riskCard.appendChild(createStoryNode("strong", "segw__lesson2-risk-title", risk.title || ""));
        riskCard.appendChild(createStoryNode("p", "segw__lesson2-risk-text", risk.description || ""));
        riskGrid.appendChild(riskCard);
      }
      l2Risks.appendChild(riskGrid);
      contentRoot.appendChild(l2Risks);
      return;
    }

    if (step.kind === "lesson2_management") {
      contentRoot.classList.add("is-lesson", "is-lesson2");
      var l2Manage = createStoryNode("section", "segw__lesson2-screen");
      l2Manage.appendChild(
        createStoryNode("h3", "segw__lesson2-title", step.title || "Как управлять рисками?"),
      );
      l2Manage.appendChild(createStoryNode("p", "segw__lesson2-text", step.text || ""));
      var rules = createStoryNode("div", "segw__lesson2-rules");
      var stepRules = Array.isArray(step.rules) ? step.rules : [];
      for (var rr = 0; rr < stepRules.length; rr += 1) {
        var rule = stepRules[rr];
        var ruleCard = createStoryNode("article", "segw__lesson2-rule");
        ruleCard.style.animationDelay = String(rr * 150) + "ms";
        ruleCard.appendChild(createStoryNode("span", "segw__lesson2-rule-num", String(rule.number || rr + 1)));
        var ruleBody = createStoryNode("div", "segw__lesson2-rule-body");
        ruleBody.appendChild(createStoryNode("strong", "", rule.title || ""));
        ruleBody.appendChild(createStoryNode("p", "", rule.example || ""));
        ruleCard.appendChild(ruleBody);
        rules.appendChild(ruleCard);
      }
      l2Manage.appendChild(rules);
      contentRoot.appendChild(l2Manage);
      return;
    }

    if (step.kind === "lesson2_safety") {
      contentRoot.classList.add("is-lesson", "is-lesson2");
      var l2Safety = createStoryNode("section", "segw__lesson2-screen");
      l2Safety.appendChild(
        createStoryNode("h3", "segw__lesson2-title", step.title || "Правило подушки безопасности"),
      );
      l2Safety.appendChild(createStoryNode("p", "segw__lesson2-text", step.text || ""));
      var tip = createStoryNode("div", "segw__lesson2-tip");
      tip.appendChild(createStoryNode("span", "segw__lesson2-tip-icon", "💡"));
      tip.appendChild(createStoryNode("span", "", step.tip || ""));
      l2Safety.appendChild(tip);
      contentRoot.appendChild(l2Safety);
      return;
    }

    if (step.kind === "lesson2_market") {
      contentRoot.classList.add("is-lesson", "is-lesson2");
      var l2Market = createStoryNode("section", "segw__lesson2-screen");
      l2Market.appendChild(
        createStoryNode("h3", "segw__lesson2-title", step.title || "Что делать, если рынок падает?"),
      );
      l2Market.appendChild(createStoryNode("p", "segw__lesson2-text", step.text || ""));
      var chart = createStoryNode("div", "segw__lesson2-chart");
      var chartLine = createStoryNode("div", "segw__lesson2-chart-line");
      chart.appendChild(chartLine);
      l2Market.appendChild(chart);
      var marketRules = createStoryNode("div", "segw__lesson2-rules");
      var mRules = Array.isArray(step.market_rules) ? step.market_rules : [];
      for (var mr = 0; mr < mRules.length; mr += 1) {
        var marketRule = mRules[mr];
        var marketCard = createStoryNode("article", "segw__lesson2-rule");
        marketCard.appendChild(createStoryNode("span", "segw__lesson2-rule-num", String(marketRule.number || mr + 1)));
        var marketBody = createStoryNode("div", "segw__lesson2-rule-body");
        marketBody.appendChild(createStoryNode("strong", "", marketRule.title || ""));
        marketBody.appendChild(createStoryNode("p", "", marketRule.description || ""));
        marketCard.appendChild(marketBody);
        marketRules.appendChild(marketCard);
      }
      l2Market.appendChild(marketRules);
      contentRoot.appendChild(l2Market);
      return;
    }

    if (step.kind === "lesson2_cta") {
      contentRoot.classList.add("is-lesson", "is-lesson2");
      var l2Cta = createStoryNode("section", "segw__lesson2-screen segw__lesson2-screen--cta");
      l2Cta.appendChild(createStoryNode("div", "segw__lesson2-emoji", "✅"));
      l2Cta.appendChild(createStoryNode("h3", "segw__lesson2-title", step.title || ""));
      l2Cta.appendChild(createStoryNode("p", "segw__lesson2-subtitle", step.subtitle || ""));
      contentRoot.appendChild(l2Cta);
      return;
    }

    if (step.kind === "lesson3_hero") {
      contentRoot.classList.add("is-lesson", "is-lesson3");
      var l3Hero = createStoryNode("section", "segw__lesson3-screen segw__lesson3-screen--hero");
      l3Hero.appendChild(createStoryNode("div", "segw__lesson3-emoji", step.emoji || "📊"));
      l3Hero.appendChild(createStoryNode("h3", "segw__lesson3-title", step.title || ""));
      l3Hero.appendChild(createStoryNode("p", "segw__lesson3-subtitle", step.subtitle || ""));
      l3Hero.appendChild(createStoryNode("div", "segw__lesson3-visual", "Пазл: акции, облигации, фонды, кэш"));
      contentRoot.appendChild(l3Hero);
      return;
    }

    if (step.kind === "lesson3_allocation") {
      contentRoot.classList.add("is-lesson", "is-lesson3");
      var l3Allocation = createStoryNode("section", "segw__lesson3-screen");
      l3Allocation.appendChild(createStoryNode("h3", "segw__lesson3-title", step.title || "Что такое аллокация?"));
      l3Allocation.appendChild(
        createStoryNode(
          "p",
          "segw__lesson3-text",
          "Аллокация — это распределение денег между разными классами активов. Правильная аллокация снижает риски и повышает стабильность доходности.",
        ),
      );
      var pie = createStoryNode("div", "segw__lesson3-pie");
      pie.style.background =
        "conic-gradient(#4CAF50 0 40%, #2196F3 40% 80%, #FF9800 80% 95%, #9E9E9E 95% 100%)";
      l3Allocation.appendChild(pie);
      l3Allocation.appendChild(
        createStoryNode(
          "p",
          "segw__lesson3-note",
          "Это примерное распределение — ваш портфель будет зависеть от вашего отношения к риску.",
        ),
      );
      contentRoot.appendChild(l3Allocation);
      return;
    }

    if (step.kind === "lesson3_portfolio") {
      contentRoot.classList.add("is-lesson", "is-lesson3");
      var l3Portfolio = createStoryNode("section", "segw__lesson3-screen");
      l3Portfolio.appendChild(createStoryNode("h3", "segw__lesson3-title", step.title || "Пример портфеля"));
      l3Portfolio.appendChild(createStoryNode("p", "segw__lesson3-subtitle", step.subtitle || ""));
      var portfolio = step.portfolio || {};
      l3Portfolio.appendChild(
        createStoryNode(
          "p",
          "segw__lesson3-portfolio-head",
          (portfolio.name || "Портфель") + " · " + (portfolio.total || ""),
        ),
      );
      var table = createStoryNode("div", "segw__lesson3-portfolio-table");
      var instrumentRows = Array.isArray(portfolio.instruments) ? portfolio.instruments : [];
      for (var pr = 0; pr < instrumentRows.length; pr += 1) {
        var instrument = instrumentRows[pr];
        var row = createStoryNode("div", "segw__lesson3-portfolio-row");
        row.style.animationDelay = String(pr * 100) + "ms";
        row.appendChild(createStoryNode("span", "", instrument.ticker + " · " + instrument.name));
        row.appendChild(createStoryNode("strong", "", instrument.pct + " · " + instrument.amount));
        table.appendChild(row);
      }
      l3Portfolio.appendChild(table);
      l3Portfolio.appendChild(createStoryNode("p", "segw__lesson3-note", portfolio.note || ""));
      l3Portfolio.appendChild(createStoryNode("div", "segw__lesson3-goal-advice", step.goal_advice || ""));
      contentRoot.appendChild(l3Portfolio);
      return;
    }

    if (step.kind === "lesson3_spectrum") {
      contentRoot.classList.add("is-lesson", "is-lesson3");
      var l3Spectrum = createStoryNode("section", "segw__lesson3-screen");
      l3Spectrum.appendChild(
        createStoryNode("h3", "segw__lesson3-title", step.title || "Портфель зависит от вашего отношения к риску"),
      );
      l3Spectrum.appendChild(createStoryNode("p", "segw__lesson3-text", step.text || ""));
      var spectrum = createStoryNode("div", "segw__lesson3-spectrum");
      var profiles = [
        { name: "Консервативный", visual: "🔵🔵🔵🔵🟢", stocks: 20, bonds: 80 },
        { name: "Умеренный", visual: "🔵🔵🔵🟢🟢", stocks: 50, bonds: 50 },
        { name: "Агрессивный", visual: "🔵🟢🟢🟢🟢", stocks: 80, bonds: 20 },
      ];
      for (var sp = 0; sp < profiles.length; sp += 1) {
        var profile = profiles[sp];
        var profileRow = createStoryNode("div", "segw__lesson3-spectrum-row");
        profileRow.appendChild(createStoryNode("strong", "", profile.name));
        profileRow.appendChild(createStoryNode("span", "", profile.visual));
        profileRow.appendChild(createStoryNode("small", "", "Акции " + profile.stocks + "% · Облигации " + profile.bonds + "%"));
        spectrum.appendChild(profileRow);
      }
      l3Spectrum.appendChild(spectrum);
      l3Spectrum.appendChild(createStoryNode("p", "segw__lesson3-note", "Какой профиль ваш? Узнаем через 4 простых вопроса."));
      contentRoot.appendChild(l3Spectrum);
      return;
    }

    if (step.kind === "lesson3_cta") {
      contentRoot.classList.add("is-lesson", "is-lesson3");
      var l3Cta = createStoryNode("section", "segw__lesson3-screen segw__lesson3-screen--cta");
      l3Cta.appendChild(createStoryNode("div", "segw__lesson3-emoji", "🧠"));
      l3Cta.appendChild(createStoryNode("h3", "segw__lesson3-title", step.title || ""));
      l3Cta.appendChild(createStoryNode("p", "segw__lesson3-subtitle", step.subtitle || ""));
      l3Cta.appendChild(createStoryNode("p", "segw__lesson3-text", step.description || ""));
      contentRoot.appendChild(l3Cta);
      return;
    }

    if (step.kind === "lesson4_hero") {
      contentRoot.classList.add("is-lesson", "is-lesson4");
      var meta = LESSON_4_PROFILE_META[riskProfile] || LESSON_4_PROFILE_META.moderate;
      var l4Hero = createStoryNode("section", "segw__lesson4-screen");
      var badge = createStoryNode("div", "segw__lesson4-profile-badge", meta.emoji + " " + meta.title);
      badge.style.setProperty("--profile-color", meta.color);
      l4Hero.appendChild(badge);
      l4Hero.appendChild(createStoryNode("p", "segw__lesson4-subtitle", meta.subtitle));
      l4Hero.appendChild(
        createStoryNode(
          "p",
          "segw__lesson4-text",
          "Теперь давайте разберёмся, как собрать портфель под ваш профиль.",
        ),
      );
      contentRoot.appendChild(l4Hero);
      return;
    }

    if (step.kind === "lesson4_allocation") {
      contentRoot.classList.add("is-lesson", "is-lesson4");
      var l4Allocation = createStoryNode("section", "segw__lesson4-screen");
      l4Allocation.appendChild(createStoryNode("h3", "segw__lesson4-title", "Ваша рекомендуемая аллокация"));
      l4Allocation.appendChild(
        createStoryNode(
          "p",
          "segw__lesson4-text",
          "На основе вашего риск-профиля мы рекомендуем следующее распределение активов:",
        ),
      );
      var l4Pie = createStoryNode("div", "segw__lesson4-pie");
      var l4Stocks = allocation.stocks_pct || 0;
      var l4Bonds = allocation.bonds_pct || 0;
      var l4Alt = allocation.alternatives_pct || 0;
      var l4Cash = allocation.cash_pct || 0;
      l4Pie.style.background =
        "conic-gradient(#4CAF50 0 " +
        String(l4Stocks) +
        "%, #2196F3 " +
        String(l4Stocks) +
        "% " +
        String(l4Stocks + l4Bonds) +
        "%, #FF9800 " +
        String(l4Stocks + l4Bonds) +
        "% " +
        String(l4Stocks + l4Bonds + l4Alt) +
        "%, #9E9E9E " +
        String(l4Stocks + l4Bonds + l4Alt) +
        "% 100%)";
      l4Allocation.appendChild(l4Pie);
      var l4Breakdown = createStoryNode("div", "segw__lesson4-breakdown");
      var l4Rows = [
        { label: "Акции", value: l4Stocks, desc: "Рост капитала" },
        { label: "Облигации", value: l4Bonds, desc: "Стабильный доход" },
        { label: "Альтернативы", value: l4Alt, desc: "Диверсификация" },
        { label: "Кэш", value: l4Cash, desc: "Ликвидность" },
      ];
      for (var l4i = 0; l4i < l4Rows.length; l4i += 1) {
        var l4RowData = l4Rows[l4i];
        var l4Row = createStoryNode("div", "segw__lesson4-row");
        l4Row.appendChild(createStoryNode("span", "", l4RowData.label + " · " + l4RowData.desc));
        l4Row.appendChild(createStoryNode("strong", "", String(l4RowData.value) + "%"));
        l4Breakdown.appendChild(l4Row);
      }
      l4Allocation.appendChild(l4Breakdown);
      l4Allocation.appendChild(
        createStoryNode(
          "p",
          "segw__lesson4-note",
          "Это базовая рекомендация. Точное распределение зависит от ваших целей и ситуации.",
        ),
      );
      contentRoot.appendChild(l4Allocation);
      return;
    }

    if (step.kind === "lesson4_levels") {
      contentRoot.classList.add("is-lesson", "is-lesson4");
      var l4Levels = createStoryNode("section", "segw__lesson4-screen");
      l4Levels.appendChild(createStoryNode("h3", "segw__lesson4-title", "Три уровня диверсификации"));
      l4Levels.appendChild(
        createStoryNode(
          "p",
          "segw__lesson4-text",
          "Диверсификация — это не просто «купить разные бумаги». Это система из трёх уровней:",
        ),
      );
      var levels = [
        {
          icon: "📊",
          title: "По классам активов",
          description: "Акции + облигации + фонды + альтернативы",
          example: "Если акции падают, облигации могут расти",
        },
        {
          icon: "🏭",
          title: "По секторам экономики",
          description: "IT + финансы + энергетика + потребительский сектор",
          example: "Кризис в IT не затронет энергетику",
        },
        {
          icon: "🌍",
          title: "По географии",
          description: "Россия + США + Европа + развивающиеся рынки",
          example: "Санкции в России не влияют на американские акции",
        },
      ];
      var levelList = createStoryNode("div", "segw__lesson4-levels");
      for (var lv = 0; lv < levels.length; lv += 1) {
        var level = levels[lv];
        var levelCard = createStoryNode("article", "segw__lesson4-level-card");
        levelCard.style.animationDelay = String(lv * 150) + "ms";
        levelCard.appendChild(createStoryNode("strong", "", level.icon + " " + level.title));
        levelCard.appendChild(createStoryNode("p", "", level.description));
        levelCard.appendChild(createStoryNode("small", "", level.example));
        levelList.appendChild(levelCard);
      }
      l4Levels.appendChild(levelList);
      contentRoot.appendChild(l4Levels);
      return;
    }

    if (step.kind === "lesson4_portfolio") {
      contentRoot.classList.add("is-lesson", "is-lesson4");
      var l4Meta = LESSON_4_PROFILE_META[riskProfile] || LESSON_4_PROFILE_META.moderate;
      var l4BasePortfolio = LESSON_3_PORTFOLIOS_BY_AMOUNT[payload ? payload.amount_tier : "up_to_300k"] || LESSON_3_PORTFOLIOS_BY_AMOUNT.up_to_300k;
      var l4Portfolio = createStoryNode("section", "segw__lesson4-screen");
      l4Portfolio.appendChild(
        createStoryNode(
          "h3",
          "segw__lesson4-title",
          "Пример диверсифицированного портфеля для вашего профиля",
        ),
      );
      l4Portfolio.appendChild(
        createStoryNode(
          "p",
          "segw__lesson4-subtitle",
          "Портфель для " +
            l4Meta.name +
            " инвестора с суммой " +
            (l4BasePortfolio.total || ""),
        ),
      );
      var l4Table = createStoryNode("div", "segw__lesson4-breakdown");
      var l4Instruments = Array.isArray(l4BasePortfolio.instruments) ? l4BasePortfolio.instruments : [];
      for (var l4p = 0; l4p < l4Instruments.length; l4p += 1) {
        var l4Instrument = l4Instruments[l4p];
        var l4InstrumentRow = createStoryNode("div", "segw__lesson4-row");
        l4InstrumentRow.appendChild(
          createStoryNode("span", "", l4Instrument.ticker + " · " + l4Instrument.name),
        );
        l4InstrumentRow.appendChild(
          createStoryNode("strong", "", l4Instrument.pct + " · " + l4Instrument.amount),
        );
        l4Table.appendChild(l4InstrumentRow);
      }
      l4Portfolio.appendChild(l4Table);
      var l4Highlight = createStoryNode("div", "segw__lesson4-level-card");
      l4Highlight.appendChild(
        createStoryNode(
          "strong",
          "",
          "Обратите внимание: в портфеле представлены все три уровня диверсификации",
        ),
      );
      l4Highlight.appendChild(createStoryNode("p", "", "✓ Разные классы активов"));
      l4Highlight.appendChild(createStoryNode("p", "", "✓ Разные секторы"));
      l4Highlight.appendChild(createStoryNode("p", "", "✓ Разные страны (через ETF)"));
      l4Portfolio.appendChild(l4Highlight);
      contentRoot.appendChild(l4Portfolio);
      return;
    }

    if (step.kind === "lesson4_cta") {
      contentRoot.classList.add("is-lesson", "is-lesson4");
      var l4Cta = createStoryNode("section", "segw__lesson4-screen segw__lesson4-screen--cta");
      l4Cta.appendChild(createStoryNode("div", "segw__lesson2-emoji", "✅"));
      l4Cta.appendChild(createStoryNode("h3", "segw__lesson4-title", step.title || ""));
      l4Cta.appendChild(createStoryNode("p", "segw__lesson4-subtitle", step.subtitle || ""));
      contentRoot.appendChild(l4Cta);
      return;
    }

    if (step.kind === "lesson5_hero") {
      contentRoot.classList.add("is-lesson", "is-lesson5");
      var l5Hero = createStoryNode("section", "segw__lesson5-screen segw__lesson5-screen--hero");
      l5Hero.appendChild(createStoryNode("div", "segw__lesson5-emoji", "🛒"));
      l5Hero.appendChild(createStoryNode("h3", "segw__lesson5-title", "Готовы к первой покупке?"));
      l5Hero.appendChild(
        createStoryNode(
          "p",
          "segw__lesson5-subtitle",
          "Сейчас мы подберём конкретные инструменты под ваш профиль и цели.",
        ),
      );
      l5Hero.appendChild(
        createStoryNode(
          "p",
          "segw__lesson5-hero-note",
          "Дальше: 1) выберем инструмент, 2) разберем частые вопросы, 3) подключим подходящий тариф.",
        ),
      );
      contentRoot.appendChild(l5Hero);
      return;
    }

    if (step.kind === "lesson5_top3") {
      contentRoot.classList.add("is-lesson", "is-lesson5");
      var top3 = getLesson5TopInstruments(riskProfile, payload ? payload.investment_goal : "growth");
      var l5Top = createStoryNode("section", "segw__lesson5-screen");
      l5Top.appendChild(createStoryNode("h3", "segw__lesson5-title", "Топ-3 инструмента для вашего профиля"));
      l5Top.appendChild(
        createStoryNode(
          "p",
          "segw__lesson5-subtitle",
          "На основе вашего профиля и цели " + (GOAL_LABELS[payload ? payload.investment_goal : "growth"] || ""),
        ),
      );
      var topCards = createStoryNode("div", "segw__lesson5-top-list");
      for (var t3 = 0; t3 < top3.length; t3 += 1) {
        var topItem = top3[t3];
        var topCard = createStoryNode("article", "segw__lesson5-top-card");
        if (t3 === 0) {
          topCard.classList.add("is-primary");
        }
        var topHead = createStoryNode("div", "segw__lesson5-top-head");
        topHead.appendChild(createStoryNode("strong", "", topItem.name + " (" + topItem.ticker + ")"));
        if (t3 === 0) {
          topHead.appendChild(createStoryNode("span", "segw__lesson5-badge", "№1 для вас"));
        }
        topCard.appendChild(topHead);
        topCard.appendChild(createStoryNode("p", "", topItem.description));
        topCard.appendChild(
          createStoryNode("small", "", topItem.yield + " · " + topItem.risk + " · от " + topItem.min_amount),
        );
        topCard.appendChild(createStoryNode("p", "segw__lesson5-why", "Почему: " + topItem.why));
        topCards.appendChild(topCard);
      }
      l5Top.appendChild(topCards);
      l5Top.appendChild(
        createStoryNode(
          "p",
          "segw__lesson5-note",
          "Это базовые рекомендации. Точный выбор зависит от вашей ситуации.",
        ),
      );
      contentRoot.appendChild(l5Top);
      return;
    }

    if (step.kind === "lesson5_quiz") {
      contentRoot.classList.add("is-lesson", "is-lesson5");
      var l5Quiz = createStoryNode("section", "segw__lesson5-screen");
      l5Quiz.appendChild(createStoryNode("h3", "segw__lesson5-title", "Какой вы инвестор?"));
      l5Quiz.appendChild(
        createStoryNode("p", "segw__lesson5-subtitle", "Выберите вариант, который вам ближе:"),
      );
      var quizOptions = [
        { id: "cautious", emoji: "🛡️", title: "Осторожный", description: "Предпочитаю надёжность, готов к меньшей доходности" },
        { id: "balanced", emoji: "⚖️", title: "Сбалансированный", description: "Хочу баланс между риском и доходностью" },
        { id: "active", emoji: "🚀", title: "Активный", description: "Готов к риску ради высокой доходности" },
      ];
      var quizList = createStoryNode("div", "segw__lesson5-quiz-list");
      for (var qo = 0; qo < quizOptions.length; qo += 1) {
        var quizOption = quizOptions[qo];
        var isInvestorOptionSelected = lessonState.investorType === quizOption.id;
        var quizButton = createStoryNode(
          "button",
          "segw__lesson5-quiz-option" + (isInvestorOptionSelected ? " is-selected" : ""),
        );
        quizButton.type = "button";
        quizButton.setAttribute("data-action", "lesson5-investor-select");
        quizButton.setAttribute("data-value", quizOption.id);
        quizButton.setAttribute("aria-pressed", isInvestorOptionSelected ? "true" : "false");
        quizButton.appendChild(createStoryNode("strong", "", quizOption.emoji + " " + quizOption.title));
        quizButton.appendChild(createStoryNode("p", "", quizOption.description));
        quizList.appendChild(quizButton);
      }
      l5Quiz.appendChild(quizList);
      l5Quiz.appendChild(
        createStoryNode(
          "p",
          "segw__lesson5-note",
          "Это не влияет на ваш риск-профиль, просто помогает уточнить рекомендации.",
        ),
      );
      var mismatch = createStoryNode(
        "p",
        "segw__lesson5-mismatch" + (lessonState.investorTypeMatch === false ? "" : " segw__is-hidden"),
        "Ваш выбор отличается от результата анкеты. При желании вы можете пройти анкету риска заново.",
      );
      mismatch.setAttribute("data-role", "lesson5-mismatch");
      l5Quiz.appendChild(mismatch);
      contentRoot.appendChild(l5Quiz);
      return;
    }

    if (step.kind === "lesson5_howto") {
      contentRoot.classList.add("is-lesson", "is-lesson5");
      var l5Howto = createStoryNode("section", "segw__lesson5-screen");
      l5Howto.appendChild(createStoryNode("h3", "segw__lesson5-title", "Как совершить первую покупку"));
      l5Howto.appendChild(
        createStoryNode("p", "segw__lesson5-subtitle", "Это проще, чем кажется — всего 4 шага:"),
      );
      var purchaseSteps = [
        { emoji: "🔍", title: "Найдите инструмент", text: "В каталоге или через поиск по тикеру (например, SBER)" },
        { emoji: "💰", title: "Укажите сумму", text: "Введите сумму или количество бумаг" },
        { emoji: "✅", title: "Проверьте заявку", text: "Убедитесь, что всё правильно" },
        { emoji: "🎉", title: "Подтвердите покупку", text: "Одно нажатие — и вы инвестор!" },
      ];
      var howtoList = createStoryNode("div", "segw__lesson5-top-list");
      for (var hs = 0; hs < purchaseSteps.length; hs += 1) {
        var purchase = purchaseSteps[hs];
        var purchaseCard = createStoryNode("article", "segw__lesson5-top-card");
        purchaseCard.style.animationDelay = String(hs * 150) + "ms";
        purchaseCard.appendChild(createStoryNode("strong", "", purchase.emoji + " " + purchase.title));
        purchaseCard.appendChild(createStoryNode("p", "", purchase.text));
        howtoList.appendChild(purchaseCard);
      }
      l5Howto.appendChild(howtoList);
      contentRoot.appendChild(l5Howto);
      return;
    }

    if (step.kind === "lesson5_faq") {
      contentRoot.classList.add("is-lesson", "is-lesson5");
      var l5Faq = createStoryNode("section", "segw__lesson5-screen");
      l5Faq.appendChild(createStoryNode("h3", "segw__lesson5-title", "Частые вопросы новичков"));
      var faqItems = [
        {
          id: "when_buy",
          q: "Когда лучше покупать?",
          a: "Для долгосрочных инвестиций время входа не критично. Главное — начать. Опытные инвесторы используют стратегию усреднения: покупают регулярно небольшими суммами.",
        },
        {
          id: "lose_more",
          q: "Можно ли потерять больше, чем вложил?",
          a: "Нет, при покупке акций и облигаций вы можете потерять максимум вложенную сумму. Убыток больше 100% возможен только при использовании кредитного плеча.",
        },
        {
          id: "when_sell",
          q: "Когда продавать?",
          a: "Зависит от вашей цели. Если инвестируете на 3+ года — краткосрочные колебания не важны. Продавайте, когда достигли цели или изменились обстоятельства.",
        },
        {
          id: "check_daily",
          q: "Нужно ли следить за рынком каждый день?",
          a: "Нет. Для долгосрочных инвестиций достаточно проверять портфель раз в месяц. Частая проверка может привести к эмоциональным решениям.",
        },
      ];
      var faqList = createStoryNode("div", "segw__lesson5-faq");
      for (var fq = 0; fq < faqItems.length; fq += 1) {
        var faq = faqItems[fq];
        var isFaqOpen = lessonState.faqOpenId === faq.id;
        var faqRow = createStoryNode("article", "segw__lesson5-faq-item");
        faqRow.setAttribute("data-question-id", faq.id);
        faqRow.classList.toggle("is-open", isFaqOpen);
        var faqButton = createStoryNode("button", "segw__lesson5-faq-question");
        faqButton.type = "button";
        faqButton.setAttribute("data-action", "lesson5-faq-toggle");
        faqButton.setAttribute("data-question-id", faq.id);
        faqButton.setAttribute("aria-expanded", isFaqOpen ? "true" : "false");
        faqButton.appendChild(createStoryNode("span", "segw__lesson5-faq-question-text", faq.q));
        faqButton.appendChild(createStoryNode("span", "segw__lesson5-faq-chevron", "▾"));
        faqRow.appendChild(faqButton);
        faqRow.appendChild(createStoryNode("p", "segw__lesson5-faq-answer", faq.a));
        faqList.appendChild(faqRow);
      }
      l5Faq.appendChild(faqList);
      contentRoot.appendChild(l5Faq);
      return;
    }

    if (step.kind === "lesson5_cta") {
      contentRoot.classList.add("is-lesson", "is-lesson5");
      var l5Top3 = getLesson5TopInstruments(riskProfile, payload ? payload.investment_goal : "growth");
      var firstInstrument = l5Top3[0] || {
        name: "ETF на индекс Мосбиржи",
        ticker: "TMOS",
        type: "ETF",
        yield: "~15% годовых",
        min_amount: "500 ₽",
        deeplink: "finamtrade://instrument/TMOS",
      };
      var l5Cta = createStoryNode("section", "segw__lesson5-screen segw__lesson5-screen--cta");
      l5Cta.appendChild(createStoryNode("h3", "segw__lesson5-title", "Готовы к первой покупке?"));
      l5Cta.appendChild(
        createStoryNode("p", "segw__lesson5-subtitle", "Рекомендуем начать с " + firstInstrument.name),
      );
      var instrumentPreview = createStoryNode(
        "div",
        "segw__lesson5-top-card is-primary",
        firstInstrument.ticker + " · " + firstInstrument.type,
      );
      instrumentPreview.appendChild(
        createStoryNode("p", "", firstInstrument.yield + " · минимум " + firstInstrument.min_amount),
      );
      l5Cta.appendChild(instrumentPreview);
      var l5Actions = createStoryNode("div", "segw__lesson1-cta-actions");
      var buyButton = createStoryNode(
        "button",
        "segw__lesson1-cta segw__lesson1-cta--primary",
        "Купить " + firstInstrument.ticker,
      );
      buyButton.type = "button";
      buyButton.setAttribute("data-action", "lesson5-buy");
      buyButton.setAttribute("data-deeplink", firstInstrument.deeplink);
      buyButton.setAttribute("data-instrument", firstInstrument.ticker);
      var continueL5 = createStoryNode(
        "button",
        "segw__lesson1-cta segw__lesson1-cta--secondary",
        "Продолжить обучение",
      );
      continueL5.type = "button";
      continueL5.setAttribute("data-action", "lesson5-continue");
      l5Actions.appendChild(buyButton);
      l5Actions.appendChild(continueL5);
      l5Cta.appendChild(l5Actions);
      contentRoot.appendChild(l5Cta);
      return;
    }

    if (step.kind === "lesson6_hero") {
      contentRoot.classList.add("is-lesson", "is-lesson6");
      var l6Hero = createStoryNode("section", "segw__lesson6-screen segw__lesson6-screen--hero");
      l6Hero.appendChild(createStoryNode("div", "segw__lesson6-emoji", "💳"));
      l6Hero.appendChild(createStoryNode("h3", "segw__lesson6-title", "Последний шаг перед покупкой"));
      l6Hero.appendChild(
        createStoryNode(
          "p",
          "segw__lesson6-subtitle",
          "Выбор тарифа влияет на комиссии. Давайте подберём оптимальный для вас.",
        ),
      );
      contentRoot.appendChild(l6Hero);
      return;
    }

    if (step.kind === "lesson6_intro") {
      contentRoot.classList.add("is-lesson", "is-lesson6");
      var l6Intro = createStoryNode("section", "segw__lesson6-screen");
      l6Intro.appendChild(createStoryNode("h3", "segw__lesson6-title", "Что такое тариф?"));
      l6Intro.appendChild(
        createStoryNode(
          "p",
          "segw__lesson6-text",
          "Тариф определяет размер комиссий за сделки, доступ к аналитике и дополнительные сервисы. Правильный выбор тарифа может сэкономить тысячи рублей в год.",
        ),
      );
      var compare = createStoryNode("div", "segw__lesson6-compare");
      compare.appendChild(
        createStoryNode(
          "div",
          "segw__lesson6-compare-row",
          "Долгосрочный портфель: 0 ₽/мес · покупка 0% · продажа 0,28%",
        ),
      );
      compare.appendChild(
        createStoryNode(
          "div",
          "segw__lesson6-compare-row",
          "Инвестор: 200 ₽/мес · акции/облигации 0,035%",
        ),
      );
      compare.appendChild(
        createStoryNode(
          "div",
          "segw__lesson6-compare-row",
          "Стратег: 0 ₽/мес · акции 0,05% (мин. 50 ₽)",
        ),
      );
      compare.appendChild(
        createStoryNode(
          "div",
          "segw__lesson6-compare-row",
          "Единый дневной: 177 ₽/мес · акции 0,0354% (мин. 41,3 ₽)",
        ),
      );
      l6Intro.appendChild(compare);
      l6Intro.appendChild(createStoryNode("p", "segw__lesson6-note", "Проверьте тариф под ваш стиль торговли."));
      contentRoot.appendChild(l6Intro);
      return;
    }

    if (step.kind === "lesson6_compare") {
      contentRoot.classList.add("is-lesson", "is-lesson6");
      var l6Compare = createStoryNode("section", "segw__lesson6-screen");
      l6Compare.appendChild(createStoryNode("h3", "segw__lesson6-title", "Сравнение тарифов"));
      l6Compare.appendChild(
        createStoryNode(
          "p",
          "segw__lesson6-subtitle",
          "Выберите тариф, который подходит вашему стилю инвестирования",
        ),
      );
      var tariffsWrap = createStoryNode("div", "segw__lesson6-tariffs");
      for (var tr = 0; tr < LESSON_6_TARIFFS.length; tr += 1) {
        var tariff = LESSON_6_TARIFFS[tr];
        var tariffCard = createStoryNode(
          "article",
          "segw__lesson6-tariff-card" + (tariff.recommended ? " is-recommended" : ""),
        );
        tariffCard.appendChild(createStoryNode("strong", "", tariff.name + " · " + tariff.price));
        if (tariff.badge) {
          tariffCard.appendChild(createStoryNode("span", "segw__lesson6-tariff-badge", tariff.badge));
        }
        tariffCard.appendChild(createStoryNode("p", "", tariff.commission));
        tariffCard.appendChild(createStoryNode("small", "", tariff.best_for));
        tariffsWrap.appendChild(tariffCard);
      }
      l6Compare.appendChild(tariffsWrap);
      contentRoot.appendChild(l6Compare);
      return;
    }

    if (step.kind === "lesson6_recommendation") {
      contentRoot.classList.add("is-lesson", "is-lesson6");
      var recommendation = getRecommendedTariff(
        payload ? payload.amount_tier : "up_to_300k",
        riskProfile,
      );
      var l6Recommendation = createStoryNode("section", "segw__lesson6-screen");
      l6Recommendation.appendChild(createStoryNode("h3", "segw__lesson6-title", "Какой тариф вам подходит?"));
      l6Recommendation.appendChild(
        createStoryNode(
          "p",
          "segw__lesson6-subtitle",
          "Рекомендуем тариф: " + (recommendation.label || recommendation.tariff || "Инвестор"),
        ),
      );
      l6Recommendation.appendChild(createStoryNode("p", "segw__lesson6-text", recommendation.reason));

      var calc = lessonState.calculator || { monthlyTrades: 4, avgTradeAmount: 20000 };
      var calcResult = calculateTariffSavings(calc.monthlyTrades, calc.avgTradeAmount);
      var calculator = createStoryNode("div", "segw__lesson6-calculator");
      calculator.appendChild(createStoryNode("p", "segw__lesson6-note", "Калькулятор экономии"));

      var tradesLabel = createStoryNode("label", "segw__lesson6-slider-label", "Сделок в месяц: " + String(calc.monthlyTrades));
      var tradesRange = createStoryNode("input", "segw__lesson6-slider");
      tradesRange.type = "range";
      tradesRange.min = "1";
      tradesRange.max = "20";
      tradesRange.value = String(calc.monthlyTrades);
      tradesRange.setAttribute("data-action", "lesson6-slider");
      tradesRange.setAttribute("data-field", "monthly_trades");

      var amountLabel = createStoryNode(
        "label",
        "segw__lesson6-slider-label",
        "Средняя сумма сделки: " + formatMoney(calc.avgTradeAmount),
      );
      var amountRange = createStoryNode("input", "segw__lesson6-slider");
      amountRange.type = "range";
      amountRange.min = "5000";
      amountRange.max = "100000";
      amountRange.step = "5000";
      amountRange.value = String(calc.avgTradeAmount);
      amountRange.setAttribute("data-action", "lesson6-slider");
      amountRange.setAttribute("data-field", "avg_trade_amount");

      var result = createStoryNode("div", "segw__lesson6-calc-result");
      result.appendChild(
        createStoryNode(
          "p",
          "",
          "Долгосрочный портфель: " + formatMoney(calcResult.long_term_annual_commission) + " / год",
        ),
      );
      result.appendChild(
        createStoryNode(
          "p",
          "",
          "Инвестор: " + formatMoney(calcResult.investor_annual_commission) + " / год",
        ),
      );
      result.appendChild(
        createStoryNode(
          "strong",
          "",
          "Экономия: " + formatMoney(calcResult.savings) + " (" + String(calcResult.savings_pct) + "%)",
        ),
      );

      calculator.appendChild(tradesLabel);
      calculator.appendChild(tradesRange);
      calculator.appendChild(amountLabel);
      calculator.appendChild(amountRange);
      calculator.appendChild(result);
      l6Recommendation.appendChild(calculator);
      contentRoot.appendChild(l6Recommendation);
      return;
    }

    if (step.kind === "lesson6_cta") {
      contentRoot.classList.add("is-lesson", "is-lesson6");
      var l6RecommendationState = getRecommendedTariff(
        payload ? payload.amount_tier : "up_to_300k",
        riskProfile,
      );
      var tariffId = l6RecommendationState.tariff;
      var tariffCardData = null;
      for (var tf = 0; tf < LESSON_6_TARIFFS.length; tf += 1) {
        if (LESSON_6_TARIFFS[tf].id === tariffId) {
          tariffCardData = LESSON_6_TARIFFS[tf];
          break;
        }
      }
      if (!tariffCardData) {
        tariffCardData = LESSON_6_TARIFFS[1];
      }

      var l6Cta = createStoryNode("section", "segw__lesson6-screen segw__lesson6-screen--cta");
      l6Cta.appendChild(
        createStoryNode("h3", "segw__lesson6-title", "Подключите тариф " + tariffCardData.name),
      );
      l6Cta.appendChild(createStoryNode("p", "segw__lesson6-subtitle", tariffCardData.price));
      l6Cta.appendChild(createStoryNode("p", "segw__lesson6-text", l6RecommendationState.reason));
      var l6Actions = createStoryNode("div", "segw__lesson1-cta-actions");
      var connect = createStoryNode(
        "button",
        "segw__lesson1-cta segw__lesson1-cta--primary",
        "Подключить " + tariffCardData.name,
      );
      connect.type = "button";
      connect.setAttribute("data-action", "lesson6-connect-tariff");
      connect.setAttribute("data-tariff-id", tariffCardData.id);
      connect.setAttribute("data-deeplink", "finamtrade://tariff/" + tariffCardData.id);
      var compareTariffs = createStoryNode(
        "button",
        "segw__lesson1-cta segw__lesson1-cta--secondary",
        "Выбрать другой тариф",
      );
      compareTariffs.type = "button";
      compareTariffs.setAttribute("data-action", "lesson6-open-tariffs");
      compareTariffs.setAttribute("data-deeplink", "finamtrade://tariffs");
      var complete = createStoryNode(
        "button",
        "segw__lesson1-cta segw__lesson1-cta--secondary",
        "Завершить обучение",
      );
      complete.type = "button";
      complete.setAttribute("data-action", "lesson6-complete");
      l6Actions.appendChild(connect);
      l6Actions.appendChild(compareTariffs);
      l6Actions.appendChild(complete);
      l6Cta.appendChild(l6Actions);
      contentRoot.appendChild(l6Cta);
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
      refs.routePrep.classList.add("is-hidden");
      refs.routePrep.classList.remove("is-exiting");
    }
    if (refs.routePrepStart) {
      refs.routePrepStart.disabled = false;
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
    var lessonState = ensureInlineLessonState(inlineState);
    var quizAnswer =
      activeStep.kind === "quiz_question" && activeStep.question
        ? getQuizAnswer(inlineState, activeStep.question.id)
        : null;
    var lesson5InvestorType = lessonState.investorType;
    var isQuiz = isQuizStep(activeStep);
    var isActionOnlyStep =
      activeStep.kind === "lesson1_cta" ||
      activeStep.kind === "lesson5_cta" ||
      activeStep.kind === "lesson6_cta";
    var activeStepKey = String(activeStep.screen_id || activeStep.kind || "lesson") + ":" + String(inlineState.activeStepIndex);

    if (inlineState.lastViewedStepKey !== activeStepKey) {
      if (activeStep.lesson_id) {
        trackLessonStarted(inlineState, activeStep);
        trackLessonScreenViewed(inlineState, activeStep);

        if (activeStep.kind === "lesson3_portfolio") {
          trackEvent("lesson_3_portfolio_viewed", {
            amount_tier: inlineState.payload ? inlineState.payload.amount_tier : undefined,
            portfolio_name:
              activeStep.portfolio && activeStep.portfolio.name ? activeStep.portfolio.name : undefined,
            instruments_count:
              activeStep.portfolio && Array.isArray(activeStep.portfolio.instruments)
                ? activeStep.portfolio.instruments.length
                : 0,
          });
        } else if (activeStep.kind === "lesson4_portfolio") {
          var rp = getInlineRiskProfile(inlineState);
          trackEvent("lesson_4_portfolio_viewed", {
            risk_profile: rp || "unknown",
            amount_tier: inlineState.payload ? inlineState.payload.amount_tier : undefined,
          });
        }
      }

      if (activeStep.kind === "quiz_intro" && inlineState.payload) {
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

    if (refs.storyFrame) {
      refs.storyFrame.style.removeProperty("background");
    }

    if (refs.storyContent) {
      var shouldAnimateStep = inlineState.lastRenderedStepIndex !== inlineState.activeStepIndex;
      refs.storyContent.classList.remove("is-enter-next", "is-enter-prev");
      if (shouldAnimateStep) {
        refs.storyContent.scrollTop = 0;
      }
      if (shouldAnimateStep) {
        void refs.storyContent.offsetWidth;
        refs.storyContent.classList.add(
          inlineState.direction < 0 ? "is-enter-prev" : "is-enter-next",
        );
      }
      renderStoryStepContent(refs.storyContent, activeStep, inlineState);
      inlineState.lastRenderedStepIndex = inlineState.activeStepIndex;
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

    if (refs.storyTopLabel) {
      if (isQuiz) {
        refs.storyTopLabel.textContent =
          "Шаг " +
          String(progressState.currentSegment + 1) +
          " из " +
          String(progressState.totalSegments);
      } else {
        refs.storyTopLabel.textContent =
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
        isActionOnlyStep ||
        (activeStep.kind === "quiz_question" && !quizAnswer) ||
        (activeStep.kind === "lesson5_quiz" && !lesson5InvestorType)
      ) {
        refs.onboardingNext.disabled = true;
      } else {
        refs.onboardingNext.disabled = false;
      }
    }

    if (refs.onboardingFooter) {
      refs.onboardingFooter.classList.toggle("segw__is-hidden", isActionOnlyStep);
    }

    if (refs.onboardingNextButton) {
      refs.onboardingNextButton.classList.toggle("segw__is-hidden", isActionOnlyStep);
      if (isActionOnlyStep) {
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
        } else if (activeStep.kind === "lesson3_cta") {
          refs.onboardingNextButton.textContent = "Пройти анкету →";
          refs.onboardingNextButton.disabled = false;
        } else if (activeStep.kind === "lesson2_cta" || activeStep.kind === "lesson4_cta") {
          refs.onboardingNextButton.textContent = "Продолжить обучение →";
          refs.onboardingNextButton.disabled = false;
        } else if (activeStep.kind === "lesson5_quiz") {
          refs.onboardingNextButton.textContent = "Далее →";
          refs.onboardingNextButton.disabled = !lesson5InvestorType;
        } else if (isLastStep) {
          refs.onboardingNextButton.textContent = "Завершить маршрут";
          refs.onboardingNextButton.disabled = false;
        } else {
          refs.onboardingNextButton.textContent = "Далее →";
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

  function getSegwViewportHeight() {
    var candidates = [];

    if (
      window.visualViewport &&
      typeof window.visualViewport.height === "number" &&
      isFinite(window.visualViewport.height) &&
      window.visualViewport.height > 0
    ) {
      candidates.push(window.visualViewport.height);
    }

    if (typeof window.innerHeight === "number" && isFinite(window.innerHeight) && window.innerHeight > 0) {
      candidates.push(window.innerHeight);
    }

    if (
      document.documentElement &&
      typeof document.documentElement.clientHeight === "number" &&
      isFinite(document.documentElement.clientHeight) &&
      document.documentElement.clientHeight > 0
    ) {
      candidates.push(document.documentElement.clientHeight);
    }

    if (!candidates.length) {
      return 0;
    }

    return Math.min.apply(Math, candidates);
  }

  function applyViewportHeight(root) {
    if (!root || !root.style || typeof root.getBoundingClientRect !== "function") {
      return;
    }

    var viewportHeight = getSegwViewportHeight();
    if (!viewportHeight) {
      return;
    }

    var rect = root.getBoundingClientRect();
    var topOffset = rect && isFinite(rect.top) ? Math.max(0, rect.top) : 0;
    var availableHeight = Math.max(1, Math.round(viewportHeight - topOffset));
    root.style.setProperty("--segw-viewport-height", availableHeight + "px");
    root.style.height = availableHeight + "px";
    root.style.maxHeight = availableHeight + "px";
    root.style.overflow = "hidden";
    if (root.classList) {
      root.classList.toggle("segw--compact", availableHeight <= 620);
      root.classList.toggle("segw--tight", availableHeight <= 520);
    }
  }

  function bindViewportHeight(root) {
    if (!root || root.__segwViewportBound) {
      return;
    }
    root.__segwViewportBound = true;

    var rafId = 0;
    var schedule = function () {
      if (rafId) {
        return;
      }
      rafId = window.requestAnimationFrame(function () {
        rafId = 0;
        applyViewportHeight(root);
      });
    };

    applyViewportHeight(root);
    window.addEventListener("resize", schedule);
    window.addEventListener("orientationchange", schedule);
    window.addEventListener("scroll", schedule, { passive: true });
    if (
      window.visualViewport &&
      typeof window.visualViewport.addEventListener === "function"
    ) {
      window.visualViewport.addEventListener("resize", schedule);
      window.visualViewport.addEventListener("scroll", schedule);
    }
  }

  function initWidget(root) {
    if (!root || root.getAttribute("data-segw-initialized") === "true") {
      return root;
    }
    root.setAttribute("data-segw-initialized", "true");
    bindViewportHeight(root);

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
        lastRenderedScreenKey: "",
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
        lastRenderedStepIndex: -1,
        lessonState: {
          startedAt: {},
          completed: {},
          investorType: null,
          investorTypeMatch: null,
          faqOpenId: null,
          calculator: {
            monthlyTrades: 4,
            avgTradeAmount: 20000,
          },
          buyClicked: false,
          tariffSelected: null,
          onboardingCompleted: false,
        },
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
      storyTopLabel: root.querySelector('[data-role="story-top-label"]'),
      storyContent: root.querySelector('[data-role="story-content"]'),
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
      var shouldSoftUpdateSegmentation = false;

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
        state.segmentationFlow.lastRenderedScreenKey = "";
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
        if (refs.storyContent) {
          var selector = '.segw__quiz-option[data-question-id="' + questionId + '"]';
          var quizButtons = refs.storyContent.querySelectorAll(selector);
          for (var qb = 0; qb < quizButtons.length; qb += 1) {
            var quizButton = quizButtons[qb];
            var isActive = quizButton.getAttribute("data-option-id") === optionId;
            quizButton.classList.toggle("is-selected", isActive);
            quizButton.setAttribute("aria-pressed", isActive ? "true" : "false");
          }
        }
        if (refs.onboardingNextButton) {
          refs.onboardingNextButton.disabled = false;
        }
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

        trackLessonCompleted(state.inlineOnboarding, "lesson_1");

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
      } else if (action === "lesson5-investor-select") {
        if (!state.inlineOnboarding.isActive || !state.inlineOnboarding.steps.length) {
          return;
        }
        var activeLesson5Quiz = state.inlineOnboarding.steps[state.inlineOnboarding.activeStepIndex];
        if (!activeLesson5Quiz || activeLesson5Quiz.kind !== "lesson5_quiz") {
          return;
        }
        var selectedType = value;
        if (!selectedType) {
          return;
        }
        var lessonState = ensureInlineLessonState(state.inlineOnboarding);
        lessonState.investorType = selectedType;
        var riskProfileForMatch = getInlineRiskProfile(state.inlineOnboarding);
        var isMatch =
          (selectedType === "cautious" && riskProfileForMatch === "conservative") ||
          (selectedType === "balanced" && riskProfileForMatch === "moderate") ||
          (selectedType === "active" &&
            (riskProfileForMatch === "aggressive" || riskProfileForMatch === "ultra_aggressive"));
        lessonState.investorTypeMatch = isMatch;
        trackEvent("lesson_5_investor_type_selected", {
          selected: selectedType,
          risk_profile: riskProfileForMatch || "unknown",
          match: isMatch,
        });
        refreshLesson5QuizUI(refs.storyContent, selectedType, isMatch);
        if (refs.onboardingNext) {
          refs.onboardingNext.disabled = false;
        }
        if (refs.onboardingNextButton) {
          refs.onboardingNextButton.disabled = false;
        }
        return;
      } else if (action === "lesson5-faq-toggle") {
        if (!state.inlineOnboarding.isActive || !state.inlineOnboarding.steps.length) {
          return;
        }
        var activeLesson5Faq = state.inlineOnboarding.steps[state.inlineOnboarding.activeStepIndex];
        if (!activeLesson5Faq || activeLesson5Faq.kind !== "lesson5_faq") {
          return;
        }
        var questionId = button.getAttribute("data-question-id");
        if (!questionId) {
          return;
        }
        var lessonStateFaq = ensureInlineLessonState(state.inlineOnboarding);
        lessonStateFaq.faqOpenId = lessonStateFaq.faqOpenId === questionId ? null : questionId;
        trackEvent("lesson_5_faq_expanded", { question_id: questionId });
        refreshLesson5FaqUI(refs.storyContent, lessonStateFaq.faqOpenId);
        return;
      } else if (action === "lesson5-buy") {
        if (!state.inlineOnboarding.isActive || !state.inlineOnboarding.steps.length) {
          return;
        }
        var activeLesson5Cta = state.inlineOnboarding.steps[state.inlineOnboarding.activeStepIndex];
        if (!activeLesson5Cta || activeLesson5Cta.kind !== "lesson5_cta") {
          return;
        }
        var deeplinkBuy = button.getAttribute("data-deeplink");
        var instrumentTicker = button.getAttribute("data-instrument") || "UNKNOWN";
        var lessonStateBuy = ensureInlineLessonState(state.inlineOnboarding);
        lessonStateBuy.buyClicked = true;
        trackEvent("lesson_5_buy_clicked", {
          instrument: instrumentTicker,
          risk_profile: getInlineRiskProfile(state.inlineOnboarding) || "unknown",
        });
        if (deeplinkBuy) {
          try {
            window.location.href = deeplinkBuy;
          } catch (error) {
            if (window.console && typeof window.console.warn === "function") {
              window.console.warn("[segmentation] lesson5 buy deeplink failed", error);
            }
          }
        }
        return;
      } else if (action === "lesson5-continue") {
        if (!state.inlineOnboarding.isActive || !state.inlineOnboarding.steps.length) {
          return;
        }
        var activeLesson5Continue = state.inlineOnboarding.steps[state.inlineOnboarding.activeStepIndex];
        if (!activeLesson5Continue || activeLesson5Continue.kind !== "lesson5_cta") {
          return;
        }
        trackEvent("lesson_5_continue_clicked");
        trackLessonCompleted(state.inlineOnboarding, "lesson_5", {
          buy_clicked: ensureInlineLessonState(state.inlineOnboarding).buyClicked ? 1 : 0,
        });
        state.inlineOnboarding.direction = 1;
        state.inlineOnboarding.activeStepIndex = Math.min(
          state.inlineOnboarding.activeStepIndex + 1,
          state.inlineOnboarding.steps.length - 1,
        );
        render(root, refs, state);
        return;
      } else if (action === "lesson6-connect-tariff") {
        var tariffId = button.getAttribute("data-tariff-id") || "investor";
        var deeplinkTariff = button.getAttribute("data-deeplink");
        var lessonStateTariff = ensureInlineLessonState(state.inlineOnboarding);
        lessonStateTariff.tariffSelected = tariffId;
        trackEvent("lesson_6_tariff_selected", {
          tariff: tariffId,
          recommended: 1,
          amount_tier: state.inlineOnboarding.payload
            ? state.inlineOnboarding.payload.amount_tier
            : undefined,
        });
        if (deeplinkTariff) {
          try {
            window.location.href = deeplinkTariff;
          } catch (error) {
            if (window.console && typeof window.console.warn === "function") {
              window.console.warn("[segmentation] lesson6 tariff deeplink failed", error);
            }
          }
        }
        return;
      } else if (action === "lesson6-open-tariffs") {
        trackEvent("lesson_6_tariff_comparison_opened", {});
        var deeplinkAllTariffs = button.getAttribute("data-deeplink");
        if (deeplinkAllTariffs) {
          try {
            window.location.href = deeplinkAllTariffs;
          } catch (error) {
            if (window.console && typeof window.console.warn === "function") {
              window.console.warn("[segmentation] lesson6 all tariffs deeplink failed", error);
            }
          }
        }
        return;
      } else if (action === "lesson6-complete") {
        var lessonStateComplete = ensureInlineLessonState(state.inlineOnboarding);
        trackEvent("lesson_6_complete_clicked", {
          tariff_selected: lessonStateComplete.tariffSelected || "none",
        });
        trackLessonCompleted(state.inlineOnboarding, "lesson_6", {
          tariff_selected: lessonStateComplete.tariffSelected || "none",
        });
        if (!lessonStateComplete.onboardingCompleted) {
          trackEvent("onboarding_completed", {
            segment: state.inlineOnboarding.payload
              ? state.inlineOnboarding.payload.segment
              : undefined,
            tariff_selected: lessonStateComplete.tariffSelected || "none",
          });
          lessonStateComplete.onboardingCompleted = true;
        }
        state.inlineOnboarding.completed = true;
        state.inlineOnboarding.isActive = false;
        state.inlineOnboarding.awaitingStart = false;
        state.inlineOnboarding.transitioningToLessons = false;
        state.inlineOnboarding.enteringLessons = false;
        state.inlineOnboarding.lastRenderedStepIndex = -1;
        root.dispatchEvent(
          new CustomEvent("onboarding:completed", {
            detail: {
              segment: state.inlineOnboarding.payload ? state.inlineOnboarding.payload.segment : undefined,
              tariff_selected: lessonStateComplete.tariffSelected || "none",
            },
          }),
        );
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
          if (activeInlineStep.kind === "lesson2_cta") {
            trackEvent("lesson_2_continue_clicked", {});
            trackLessonCompleted(state.inlineOnboarding, "lesson_2");
          } else if (activeInlineStep.kind === "lesson3_cta") {
            trackEvent("risk_quiz_started_from_lesson_3", {
              segment: state.inlineOnboarding.payload
                ? state.inlineOnboarding.payload.segment
                : undefined,
            });
            trackLessonCompleted(state.inlineOnboarding, "lesson_3");
          } else if (activeInlineStep.kind === "lesson4_cta") {
            trackEvent("lesson_4_continue_clicked", {
              risk_profile: getInlineRiskProfile(state.inlineOnboarding) || "unknown",
            });
            trackLessonCompleted(state.inlineOnboarding, "lesson_4");
          } else if (activeInlineStep.kind === "lesson5_quiz") {
            var lessonStateForQuiz = ensureInlineLessonState(state.inlineOnboarding);
            if (!lessonStateForQuiz.investorType) {
              render(root, refs, state);
              return;
            }
          } else if (activeInlineStep.kind === "quiz_intro") {
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
        state.segmentationFlow.lastRenderedScreenKey = "";
        if (refs.result) {
          refs.result.classList.add("is-hidden");
        }
        trackEvent("segmentation_edit_started");

        state.segment = calculateSegment(state.qualifiedInvestor, state.experience);
        render(root, refs, state);
        return;
      } else if (action === "qualified") {
        state.qualifiedInvestor = value === "true";
        shouldSoftUpdateSegmentation = true;
      } else if (action === "experience") {
        state.experience = value;
        shouldSoftUpdateSegmentation = true;
      } else if (action === "amount") {
        state.amountTier = value;
        trackEvent("amount_selected", { amount_tier: value });
        shouldSoftUpdateSegmentation = true;
      } else if (action === "goal") {
        state.goal = value;
        trackEvent("goal_selected", { goal: value });
        shouldSoftUpdateSegmentation = true;
      } else if (action === "instrument") {
        var existingIndex = state.instruments.indexOf(value);
        if (existingIndex === -1) {
          state.instruments.push(value);
        } else {
          state.instruments.splice(existingIndex, 1);
        }
        shouldSoftUpdateSegmentation = true;
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
      if (
        shouldSoftUpdateSegmentation &&
        !state.inlineOnboarding.isActive &&
        !state.segmentationFlow.resultPayload &&
        state.segmentationFlow.stepIndex >= 0 &&
        state.segmentationFlow.stepIndex < SEGMENTATION_STORY_ORDER.length
      ) {
        refreshSegmentationStepUI(refs, state);
        return;
      }
      render(root, refs, state);
    });

    root.addEventListener("input", function (event) {
      var target = event.target;
      if (!target || target.tagName !== "INPUT") {
        return;
      }
      if (target.getAttribute("data-action") !== "lesson6-slider") {
        return;
      }
      if (!state.inlineOnboarding.isActive || !state.inlineOnboarding.steps.length) {
        return;
      }
      var activeStep = state.inlineOnboarding.steps[state.inlineOnboarding.activeStepIndex];
      if (!activeStep || activeStep.kind !== "lesson6_recommendation") {
        return;
      }
      var field = target.getAttribute("data-field");
      var value = Number(target.value);
      if (!field || !isFinite(value)) {
        return;
      }
      var lessonState = ensureInlineLessonState(state.inlineOnboarding);
      if (!lessonState.calculator) {
        lessonState.calculator = {
          monthlyTrades: 4,
          avgTradeAmount: 20000,
        };
      }
      if (field === "monthly_trades") {
        lessonState.calculator.monthlyTrades = Math.round(value);
      } else if (field === "avg_trade_amount") {
        lessonState.calculator.avgTradeAmount = Math.round(value);
      } else {
        return;
      }

      var calcResult = calculateTariffSavings(
        lessonState.calculator.monthlyTrades,
        lessonState.calculator.avgTradeAmount,
      );
      trackEvent("lesson_6_calculator_used", {
        monthly_trades: lessonState.calculator.monthlyTrades,
        avg_trade_amount: lessonState.calculator.avgTradeAmount,
        savings: calcResult.savings,
      });
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

    var existingWidget = document.querySelector("[" + WIDGET_ROOT_ATTR + "]");
    if (existingWidget) {
      scriptTag.setAttribute(SCRIPT_MOUNTED_ATTR, "true");
      return existingWidget;
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
  window.FinamSegmentationWidget.version = "1.0.33";

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
