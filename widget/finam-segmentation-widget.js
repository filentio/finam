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
  padding: 10px 10px 0;
  position: relative;
  z-index: 5;
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
  transition: width 0.2s ease-out;
}

.segw__story-progress-segment.is-done .segw__story-progress-fill {
  width: 100%;
}

.segw__story-progress-segment.is-active .segw__story-progress-fill {
  animation: segwStoryProgressFill 0.3s ease-out forwards;
}

@keyframes segwStoryProgressFill {
  from {
    width: 0;
  }
  to {
    width: 100%;
  }
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

.segw__story-content.is-enter-next {
  animation: segwStorySlideNext 0.2s ease-out;
}

.segw__story-content.is-enter-prev {
  animation: segwStorySlidePrev 0.2s ease-out;
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
  font-size: clamp(22px, 4.3vw, 28px);
  line-height: 1.2;
  font-weight: 700;
}

.segw__onboarding-step-text {
  margin: 0;
  text-align: center;
  color: rgba(255, 255, 255, 0.74);
  font-size: 16px;
  line-height: 1.45;
}

.segw__onboarding-points {
  margin: 2px 0 0;
  padding-left: 18px;
  display: grid;
  gap: 8px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.94);
}

.segw__onboarding-points li {
  padding: 8px 10px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.14);
  border: 1px solid rgba(255, 255, 255, 0.2);
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
  border-radius: var(--radius-md);
  min-height: 52px;
  background: var(--bg-base);
  color: var(--text-primary);
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-base);
}

.segw__story-next:hover {
  background: #f8fafc;
  transform: translateY(-1px);
}

.segw__story-next:disabled {
  opacity: 0.55;
  cursor: not-allowed;
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
  .segw__grid {
    grid-template-columns: 1fr;
  }

  .segw__submit {
    flex-direction: column;
    align-items: stretch;
  }

  .segw__continue {
    width: 100%;
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
  <header class="segw__header">
    <p class="segw__eyebrow">DOC → Segment Engine</p>
    <h2>Анкета сегментации клиента</h2>
    <p class="segw__description">
      Заполните анкету, чтобы получить персональный маршрут онбординга.
    </p>
  </header>

  <div class="segw__questionnaire" data-role="questionnaire">
  <section class="segw__section">
    <h3 class="segw__title">Являетесь ли вы квалифицированным инвестором?</h3>
    <div class="segw__grid">
      <button type="button" class="segw__option" data-action="qualified" data-value="true">
        Да <span class="segw__option-mark">○</span>
      </button>
      <button type="button" class="segw__option" data-action="qualified" data-value="false">
        Нет <span class="segw__option-mark">○</span>
      </button>
    </div>
  </section>

  <section class="segw__section segw__experience" data-role="experience-section">
    <h3 class="segw__title">Какой у вас опыт инвестирования?</h3>
    <div class="segw__grid">
      <button type="button" class="segw__option" data-action="experience" data-value="none">
        Нет опыта <span class="segw__option-mark">○</span>
      </button>
      <button type="button" class="segw__option" data-action="experience" data-value="less_1y">
        Менее 1 года <span class="segw__option-mark">○</span>
      </button>
      <button type="button" class="segw__option" data-action="experience" data-value="1_3y">
        1–3 года <span class="segw__option-mark">○</span>
      </button>
      <button type="button" class="segw__option" data-action="experience" data-value="3_5y">
        3–5 лет <span class="segw__option-mark">○</span>
      </button>
      <button type="button" class="segw__option segw__option--wide" data-action="experience" data-value="more_5y">
        Более 5 лет <span class="segw__option-mark">○</span>
      </button>
    </div>
  </section>

  <section class="segw__section">
    <h3 class="segw__title">Какую сумму вы планируете инвестировать?</h3>
    <div class="segw__grid">
      <button type="button" class="segw__option" data-action="amount" data-value="up_to_300k">
        До 300 000 ₽ <span class="segw__option-mark">○</span>
      </button>
      <button type="button" class="segw__option" data-action="amount" data-value="300k_2m">
        300 000 – 2 млн ₽ <span class="segw__option-mark">○</span>
      </button>
      <button type="button" class="segw__option" data-action="amount" data-value="2m_5m">
        2 – 5 млн ₽ <span class="segw__option-mark">○</span>
      </button>
      <button type="button" class="segw__option" data-action="amount" data-value="more_5m">
        Более 5 млн ₽ <span class="segw__option-mark">○</span>
      </button>
    </div>
  </section>

  <section class="segw__section">
    <h3 class="segw__title">Ваша главная цель инвестирования</h3>
    <div class="segw__grid">
      <button type="button" class="segw__option" data-action="goal" data-value="purchase">
        Накопление <span class="segw__option-mark">○</span>
      </button>
      <button type="button" class="segw__option" data-action="goal" data-value="passive_income">
        Пассивный доход <span class="segw__option-mark">○</span>
      </button>
      <button type="button" class="segw__option" data-action="goal" data-value="growth">
        Рост капитала <span class="segw__option-mark">○</span>
      </button>
      <button type="button" class="segw__option" data-action="goal" data-value="preservation">
        Сохранение <span class="segw__option-mark">○</span>
      </button>
    </div>
  </section>

  <section class="segw__section">
    <h3 class="segw__title">Какие инструменты вам интересны?</h3>
    <p class="segw__hint">Можно выбрать несколько вариантов.</p>
    <div class="segw__grid">
      <button type="button" class="segw__option" data-action="instrument" data-value="etf">
        ETF <span class="segw__option-mark">□</span>
      </button>
      <button type="button" class="segw__option" data-action="instrument" data-value="stocks">
        Акции <span class="segw__option-mark">□</span>
      </button>
      <button type="button" class="segw__option" data-action="instrument" data-value="bonds">
        Облигации <span class="segw__option-mark">□</span>
      </button>
      <button type="button" class="segw__option" data-action="instrument" data-value="trust_management">
        Доверительное управление <span class="segw__option-mark">□</span>
      </button>
      <button type="button" class="segw__option" data-action="instrument" data-value="ipo">
        IPO <span class="segw__option-mark">□</span>
      </button>
      <button type="button" class="segw__option" data-action="instrument" data-value="currency">
        Валюта <span class="segw__option-mark">□</span>
      </button>
    </div>
  </section>

  <section class="segw__submit">
    <div class="segw__segment">
      <span>Сегмент:</span>
      <strong class="segw__segment-chip" data-role="segment-chip">не определён</strong>
    </div>
    <button type="button" class="segw__continue segw__btn-primary" data-action="continue" disabled>
      Получить персональный маршрут
    </button>
  </section>
  </div>

  <section class="segw__result is-hidden" data-role="result">
    <div class="segw__tariff">
      <p class="segw__tariff-caption">Ваш маршрут онбординга</p>
      <h3 class="segw__tariff-title" data-role="plan-title">—</h3>
      <ul class="segw__tariff-list">
        <li>
          <span class="segw__label">Сегмент</span>
          <span class="segw__value" data-role="segment-value">—</span>
        </li>
        <li>
          <span class="segw__label">Сумма</span>
          <span class="segw__value" data-role="amount-value">—</span>
        </li>
        <li>
          <span class="segw__label">Цель</span>
          <span class="segw__value" data-role="goal-value">—</span>
        </li>
        <li>
          <span class="segw__label">Инструменты</span>
          <span class="segw__value" data-role="instruments-value">—</span>
        </li>
      </ul>
      <a href="#" class="segw__route" data-role="route-link">Перейти к онбордингу</a>
      <details class="segw__json">
        <summary>Показать JSON payload</summary>
        <pre data-role="json"></pre>
      </details>
    </div>
  </section>

  <section class="segw__route-prep is-hidden" data-role="route-prep">
    <div class="segw__route-prep-card">
      <div class="segw__route-prep-icon" aria-hidden="true">✨</div>
      <h3 class="segw__route-prep-title">Мы подобрали для вас персональный маршрут</h3>
      <p class="segw__route-prep-text" data-role="route-prep-text">Готовим программу обучения...</p>
      <button type="button" class="segw__btn-primary" data-action="start-inline-onboarding">
        Начать обучение
      </button>
    </div>
  </section>

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

        <div class="segw__story-content" data-role="story-content">
          <div class="segw__story-emoji" data-role="onboarding-emoji">🚀</div>
          <h3 class="segw__onboarding-step-title" data-role="onboarding-step-title">—</h3>
          <p class="segw__onboarding-step-text" data-role="onboarding-step-text"></p>
          <ul class="segw__onboarding-points" data-role="onboarding-step-points"></ul>
        </div>

        <p class="segw__onboarding-meta" data-role="onboarding-counter">Шаг 1 из 3</p>
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
    up_to_300k: "До 300 000 ₽",
    "300k_2m": "300 000 – 2 млн ₽",
    "2m_5m": "2 – 5 млн ₽",
    more_5m: "Более 5 млн ₽",
  };

  var GOAL_LABELS = {
    purchase: "Накопление",
    passive_income: "Пассивный доход",
    growth: "Рост капитала",
    preservation: "Сохранение",
  };

  var INSTRUMENT_LABELS = {
    etf: "ETF",
    stocks: "Акции",
    bonds: "Облигации",
    trust_management: "Доверительное управление",
    ipo: "IPO",
    currency: "Валюта",
  };

  var SEGMENT_LABELS = {
    novice: "Новичок",
    advanced: "Продвинутый",
    expert: "Эксперт",
  };

  var ONBOARDING_PLAN_LABELS = {
    novice: "Полный курс",
    advanced: "Сокращённый курс",
    expert: "Минимальный маршрут + анкета риска",
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
      experience: state.experience || "more_5y",
      segment: state.segment,
      amount_tier: state.amountTier,
      investment_goal: state.goal,
      instruments: state.instruments.slice(),
    };
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
      novice: ["var(--gradient-lesson-1)", "var(--gradient-lesson-2)", "var(--gradient-lesson-3)"],
      advanced: [
        "var(--gradient-lesson-4)",
        "var(--gradient-lesson-5)",
        "var(--gradient-lesson-6)",
      ],
      expert: ["var(--gradient-lesson-6)", "var(--gradient-lesson-2)", "var(--gradient-lesson-4)"],
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

    if (payload.segment === "novice") {
      return [
        {
          emoji: "🚀",
          title: "С чего начать инвестировать?",
          text: "Спокойный старт под цель \"" + goalLabel + "\" и бюджет " + amountLabel + ".",
          hint: "Экран 1: база без перегруза",
          gradient: getStoryGradient(payload.segment, 0),
          points: [
            "Открываем счет и определяем стартовую стратегию.",
            "Избегаем частых ошибок первого месяца.",
          ],
        },
        {
          emoji: "🧩",
          title: "Собираем первый портфель",
          text: "Фокус на " + primaryInstrument + " и балансе риска.",
          hint: "Экран 2: готовая схема входа",
          gradient: getStoryGradient(payload.segment, 1),
          points: [
            "Фиксируем доли активов под ваш горизонт.",
            "Планируем пошаговые покупки вместо одной точки входа.",
          ],
        },
        {
          emoji: "✅",
          title: "Дисциплина и контроль",
          text: "Рабочий ритм для инструментов: " + instrumentList + ".",
          hint: "Экран 3: завершаем модуль",
          gradient: getStoryGradient(payload.segment, 2),
          points: [
            "Чек-лист регулярной проверки портфеля.",
            "Понятный следующий шаг в онбординге.",
          ],
        },
      ];
    }

    if (payload.segment === "advanced") {
      return [
        {
          emoji: "📊",
          title: "Капитал и риск-контроль",
          text: "Актуализируем структуру портфеля под \"" + goalLabel + "\" и " + amountLabel + ".",
          hint: "Экран 1: ревизия стратегии",
          gradient: getStoryGradient(payload.segment, 0),
          points: [
            "Проверяем перекосы по риску и долям активов.",
            "Фиксируем лимиты до начала сделок.",
          ],
        },
        {
          emoji: "🎯",
          title: "Оптимизация инструментов",
          text: "Настраиваем набор: " + instrumentList + ".",
          hint: "Экран 2: точечные улучшения",
          gradient: getStoryGradient(payload.segment, 1),
          points: [
            "Сценарии входа/выхода под волатильность.",
            "Правила фиксации прибыли и ограничений убытков.",
          ],
        },
        {
          emoji: "🏁",
          title: "Личный регламент действий",
          text: "Финализируем короткий операционный план инвестора.",
          hint: "Экран 3: готово к внедрению",
          gradient: getStoryGradient(payload.segment, 2),
          points: [
            "Ритм ревизии портфеля и KPI эффективности.",
            "Подготовка к следующему уровню онбординга.",
          ],
        },
      ];
    }

    return [
      {
        emoji: "🧠",
        title: "Экспресс-аудит стратегии",
        text: "Проверяем, насколько текущий подход соответствует цели \"" + goalLabel + "\".",
        hint: "Экран 1: диагностика",
        gradient: getStoryGradient(payload.segment, 0),
        points: [
          "Сверяем структуру активов и риск-профиль.",
          "Выявляем узкие места в текущей системе.",
        ],
      },
      {
        emoji: "🛡️",
        title: "Управление риском",
        text: "Корректируем параметры под объем " + amountLabel + ".",
        hint: "Экран 2: риск-правила",
        gradient: getStoryGradient(payload.segment, 1),
        points: [
          "Ограничения по просадке и концентрации.",
          "Понятные условия входа и выхода из позиций.",
        ],
      },
      {
        emoji: "📌",
        title: "План внедрения",
        text: "Финальный маршрут по инструментам: " + instrumentList + ".",
        hint: "Экран 3: завершение",
        gradient: getStoryGradient(payload.segment, 2),
        points: [
          "Последовательность внедрения без потери темпа.",
          "Переход к следующему блоку обучения.",
        ],
      },
    ];
  }

  function resetInlineOnboardingState(state) {
    state.inlineOnboarding.isActive = false;
    state.inlineOnboarding.awaitingStart = false;
    state.inlineOnboarding.steps = [];
    state.inlineOnboarding.activeStepIndex = 0;
    state.inlineOnboarding.direction = 1;
    state.inlineOnboarding.completed = false;
    state.inlineOnboarding.payload = null;
    state.inlineOnboarding.targetRoute = "";
  }

  function startInlineOnboardingFlow(state, payload, targetRoute) {
    state.inlineOnboarding.isActive = true;
    state.inlineOnboarding.awaitingStart = true;
    state.inlineOnboarding.steps = buildInlineOnboardingSteps(payload);
    state.inlineOnboarding.activeStepIndex = 0;
    state.inlineOnboarding.direction = 1;
    state.inlineOnboarding.completed = false;
    state.inlineOnboarding.payload = payload;
    state.inlineOnboarding.targetRoute = targetRoute || "";
  }

  function renderStoryProgress(progressRoot, stepsCount, activeStepIndex) {
    if (!progressRoot) {
      return;
    }

    progressRoot.innerHTML = "";

    for (var i = 0; i < stepsCount; i += 1) {
      var segment = document.createElement("span");
      segment.className = "segw__story-progress-segment";

      if (i < activeStepIndex) {
        segment.classList.add("is-done");
      } else if (i === activeStepIndex) {
        segment.classList.add("is-active");
      }

      var fill = document.createElement("span");
      fill.className = "segw__story-progress-fill";
      segment.appendChild(fill);
      progressRoot.appendChild(segment);
    }
  }

  function renderInlineOnboarding(refs, state) {
    if (!refs.onboarding) {
      return;
    }

    var inlineState = state.inlineOnboarding;
    if (!inlineState.isActive || !inlineState.steps.length) {
      refs.onboarding.classList.add("is-hidden");
      if (refs.routePrep) {
        refs.routePrep.classList.add("is-hidden");
      }
      return;
    }

    if (refs.routePrep) {
      if (inlineState.awaitingStart && inlineState.payload) {
        refs.routePrep.classList.remove("is-hidden");
        if (refs.routePrepText) {
          refs.routePrepText.textContent =
            ROUTE_PREP_TEXT_BY_SEGMENT[inlineState.payload.segment] ||
            "Подготовили персональный маршрут обучения.";
        }
      } else {
        refs.routePrep.classList.add("is-hidden");
      }
    }

    if (inlineState.awaitingStart) {
      refs.onboarding.classList.add("is-hidden");
      return;
    }

    refs.onboarding.classList.remove("is-hidden");
    var maxStepIndex = inlineState.steps.length - 1;

    if (inlineState.activeStepIndex < 0) {
      inlineState.activeStepIndex = 0;
    } else if (inlineState.activeStepIndex > maxStepIndex) {
      inlineState.activeStepIndex = maxStepIndex;
    }

    var activeStep = inlineState.steps[inlineState.activeStepIndex];
    var isLastStep = inlineState.activeStepIndex === maxStepIndex;
    var hasExternalLink = hasConfiguredExternalOnboarding() && Boolean(inlineState.targetRoute);

    renderStoryProgress(
      refs.storyProgress,
      inlineState.steps.length,
      inlineState.activeStepIndex,
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
    }

    if (refs.onboardingTitle && inlineState.payload) {
      refs.onboardingTitle.textContent = ONBOARDING_PLAN_LABELS[inlineState.payload.segment];
    }

    if (refs.onboardingCounter) {
      refs.onboardingCounter.textContent =
        "Шаг " + String(inlineState.activeStepIndex + 1) + " из " + String(inlineState.steps.length);
    }

    if (refs.onboardingStepTitle) {
      refs.onboardingStepTitle.textContent = activeStep.title;
    }

    if (refs.onboardingStepText) {
      refs.onboardingStepText.textContent = activeStep.text;
    }

    if (refs.onboardingEmoji) {
      refs.onboardingEmoji.textContent = activeStep.emoji || "📘";
    }

    if (refs.onboardingHint) {
      refs.onboardingHint.textContent =
        activeStep.hint ||
        "Тап по правой части — следующий экран, по левой — предыдущий.";
    }

    if (refs.onboardingStepPoints) {
      refs.onboardingStepPoints.innerHTML = "";
      for (var i = 0; i < activeStep.points.length; i += 1) {
        var point = document.createElement("li");
        point.className = "segw__story-point";
        point.textContent = activeStep.points[i];
        refs.onboardingStepPoints.appendChild(point);
      }
    }

    if (refs.onboardingPrev) {
      refs.onboardingPrev.disabled = inlineState.activeStepIndex === 0;
    }

    if (refs.onboardingNext) {
      if (inlineState.completed) {
        refs.onboardingNext.disabled = true;
      } else {
        refs.onboardingNext.disabled = false;
      }
    }

    if (refs.onboardingNextButton) {
      if (inlineState.completed) {
        refs.onboardingNextButton.textContent = "Пройдено";
        refs.onboardingNextButton.disabled = true;
      } else if (isLastStep) {
        refs.onboardingNextButton.textContent = "Завершить урок";
        refs.onboardingNextButton.disabled = false;
      } else {
        refs.onboardingNextButton.textContent = "Далее";
        refs.onboardingNextButton.disabled = false;
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
    var showExperience = state.qualifiedInvestor === false;

    if (refs.experienceSection) {
      if (showExperience) {
        refs.experienceSection.classList.add("is-open");
      } else {
        refs.experienceSection.classList.remove("is-open");
      }
    }

    if (refs.segmentChip) {
      if (state.segment) {
        refs.segmentChip.textContent = SEGMENT_LABELS[state.segment];
        refs.segmentChip.classList.add("is-active");
      } else {
        refs.segmentChip.textContent = "не определён";
        refs.segmentChip.classList.remove("is-active");
      }
    }

    if (refs.continueButton) {
      refs.continueButton.disabled = !canContinue(state);
    }

    if (refs.questionnaire) {
      if (state.inlineOnboarding.isActive) {
        refs.questionnaire.classList.add("is-hidden");
      } else {
        refs.questionnaire.classList.remove("is-hidden");
      }
    }

    renderInlineOnboarding(refs, state);
    updateOptionStates(root, state);
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
      inlineOnboarding: {
        isActive: false,
        awaitingStart: false,
        steps: [],
        activeStepIndex: 0,
        direction: 1,
        completed: false,
        payload: null,
        targetRoute: "",
      },
    };

    var refs = {
      questionnaire: root.querySelector('[data-role="questionnaire"]'),
      experienceSection: root.querySelector('[data-role="experience-section"]'),
      segmentChip: root.querySelector('[data-role="segment-chip"]'),
      continueButton: root.querySelector('[data-action="continue"]'),
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
      onboarding: root.querySelector('[data-role="onboarding"]'),
      storyFrame: root.querySelector('[data-role="story-frame"]'),
      storyProgress: root.querySelector('[data-role="story-progress"]'),
      storyContent: root.querySelector('[data-role="story-content"]'),
      onboardingTitle: root.querySelector('[data-role="onboarding-title"]'),
      onboardingCounter: root.querySelector('[data-role="onboarding-counter"]'),
      onboardingEmoji: root.querySelector('[data-role="onboarding-emoji"]'),
      onboardingStepTitle: root.querySelector('[data-role="onboarding-step-title"]'),
      onboardingStepText: root.querySelector('[data-role="onboarding-step-text"]'),
      onboardingStepPoints: root.querySelector('[data-role="onboarding-step-points"]'),
      onboardingHint: root.querySelector('[data-role="onboarding-hint"]'),
      onboardingPrev: root.querySelector('[data-action="onboarding-prev"]'),
      onboardingNext: root.querySelector('[data-action="onboarding-next"]'),
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

      if (action === "start-inline-onboarding") {
        if (!state.inlineOnboarding.isActive || !state.inlineOnboarding.steps.length) {
          return;
        }

        state.inlineOnboarding.awaitingStart = false;
        state.inlineOnboarding.direction = 1;
        state.inlineOnboarding.activeStepIndex = 0;
        render(root, refs, state);

        if (refs.onboarding && typeof refs.onboarding.scrollIntoView === "function") {
          setTimeout(function () {
            refs.onboarding.scrollIntoView({ behavior: "smooth", block: "start" });
          }, 30);
        }
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
        if (refs.result) {
          refs.result.classList.add("is-hidden");
        }
        trackEvent("segmentation_edit_started");

        state.segment = calculateSegment(state.qualifiedInvestor, state.experience);
        render(root, refs, state);
        return;
      } else if (action === "qualified") {
        var qualified = value === "true";
        state.qualifiedInvestor = qualified;
        if (qualified) {
          state.experience = null;
        }
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
  window.FinamSegmentationWidget.version = "1.0.12";

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
