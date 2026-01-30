/*!
 * Finam Tariff Widget
 * Self-contained embed widget (no build step).
 * Version: 0.3.5
 */
(function (global) {
  'use strict';

  var VERSION = '0.3.5';

  var DEFAULTS = {
    // 'intro' | 'questionnaire'
    initialView: 'intro',
    showTabs: false,
    loadFonts: true,
    shadowDom: true,
    analytics: true,
    onEvent: null, // (name: string, payload: object) => void
  };

  // STRICT WHITELIST (DO NOT CHANGE NAMES/URLS)
  var TARIFF_CATALOG = [
    {
      id: 'n1_dolgosrochniy',
      name: 'Долгосрочный портфель',
      url: 'https://broker.finam.ru/landing/tariffs-n1-dolgosrochniy/',
    },
    {
      id: 'n2_day',
      name: 'Единый дневной',
      url: 'https://broker.finam.ru/landing/tariffs-n2-day/',
    },
    {
      id: 'n3_investor',
      name: 'Инвестор',
      url: 'https://broker.finam.ru/landing/tariffs-n3-investor/',
    },
    {
      id: 'n4_strateg',
      name: 'Стратег',
      url: 'https://broker.finam.ru/landing/tariffs-n4-strateg/',
    },
    {
      id: 'n5_consulting',
      name: 'Единый консультационный',
      url: 'https://broker.finam.ru/landing/tariffs-n5-consulting/',
    },
  ];

  // Runtime safety guard: only these IDs are allowed.
  var ALLOWED = new Set(['n1_dolgosrochniy', 'n2_day', 'n3_investor', 'n4_strateg', 'n5_consulting']);
  function assertValidTariff(tariffId) {
    if (!ALLOWED.has(tariffId)) throw new Error('Invalid tariff id');
  }

  function tariffById(id) {
    assertValidTariff(id);
    for (var i = 0; i < TARIFF_CATALOG.length; i++) if (TARIFF_CATALOG[i].id === id) return TARIFF_CATALOG[i];
    return null;
  }

  function otherTariffs(id) {
    var out = [];
    for (var i = 0; i < TARIFF_CATALOG.length; i++) if (TARIFF_CATALOG[i].id !== id) out.push(TARIFF_CATALOG[i]);
    return out;
  }

  var TARIFFS = {
    longterm: {
      id: 'longterm',
      name: 'Долгосрочный портфель',
      description: '',
      features: [],
      warnings: [],
      icon: null,
    },
    daily: {
      id: 'daily',
      name: 'Единый дневной',
      description: '',
      features: [],
      warnings: [],
      icon: null,
    },
    strateg: {
      id: 'strateg',
      name: 'Стратег',
      description: '',
      features: [],
      warnings: [],
      icon: null,
    },
    freetrade: {
      id: 'freetrade',
      name: 'Инвестор',
      description: '',
      features: [],
      warnings: [],
      icon: null,
    },
    consulting: {
      id: 'consulting',
      name: 'Единый консультационный',
      description: '',
      features: [],
      warnings: [],
      icon: null,
    },
  };

  var QUESTIONS = [
    {
      id: 'q1_goal',
      title: 'Для чего вы планируете инвестировать?',
      options: [
        { value: 'a1_save', label: 'Хочу сохранить деньги и понемногу приумножать' },
        { value: 'a2_active', label: 'Планирую активно торговать' },
        { value: 'a3_try', label: 'Хочу попробовать инвестиции и разобраться' },
        { value: 'a4_unsure', label: 'Пока не уверен(а), хочу посмотреть' },
      ],
    },
    {
      id: 'q2_frequency',
      title: 'Как часто вы планируете покупать или продавать активы?',
      helperText: 'Это поможет учесть комиссии и доступные инструменты',
      options: [
        { value: 'b1_rare', label: 'Несколько раз в год' },
        { value: 'b2_month', label: 'Несколько раз в месяц' },
        { value: 'b3_daily', label: 'Почти каждый день' },
        { value: 'b4_unknown', label: 'Пока не знаю' },
      ],
    },
    {
      id: 'q3_instruments',
      title: 'Чем вы планируете торговать?',
      options: [
        { value: 'c1_stocks', label: 'Акции и облигации' },
        { value: 'c2_futures', label: 'Фьючерсы / активная торговля' },
        { value: 'c3_currency', label: 'Валюта' },
        { value: 'c4_unknown', label: 'Пока не знаю' },
      ],
    },
    {
      id: 'q4_assistance',
      title: 'Нужна ли вам помощь при инвестировании?',
      options: [
        { value: 'd1_yes', label: 'Да, хочу подсказки и сопровождение' },
        { value: 'd2_sometimes', label: 'Иногда, но в целом сам(а)' },
        { value: 'd3_no', label: 'Нет, всё делаю сам(а)' },
      ],
    },
  ];

  function ensureFonts() {
    if (document.getElementById('finam-tariff-widget-fonts')) return;
    var link = document.createElement('link');
    link.id = 'finam-tariff-widget-fonts';
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap';
    document.head.appendChild(link);
  }

  function formatRUB(n) {
    try {
      return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(n);
    } catch (_) {
      return Math.round(n) + ' ₽';
    }
  }

  function el(tag, attrs) {
    var node = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        var v = attrs[k];
        if (k === 'class') node.className = v;
        else if (k === 'text') node.textContent = v;
        else if (k === 'html') node.innerHTML = v;
        else if (k === 'type') node.type = v;
        else if (k === 'value') node.value = v;
        else if (k === 'disabled') node.disabled = !!v;
        else if (k.indexOf('data-') === 0) node.setAttribute(k, v);
        else if (k === 'onClick') node.addEventListener('click', v);
        else if (k === 'onChange') node.addEventListener('change', v);
        else if (k === 'onInput') node.addEventListener('input', v);
        else node.setAttribute(k, v);
      });
    }
    for (var i = 2; i < arguments.length; i++) {
      var c = arguments[i];
      if (c == null) continue;
      if (typeof c === 'string') node.appendChild(document.createTextNode(c));
      else node.appendChild(c);
    }
    return node;
  }

  function track(widget, name, payload) {
    if (!widget || !widget.options || widget.options.analytics === false) return;
    var detail = payload || {};
    detail.event = name;
    detail.widget = 'tariff_selection_widget';
    detail.version = VERSION;

    try {
      if (typeof widget.options.onEvent === 'function') widget.options.onEvent(name, detail);
    } catch (_) {}

    try {
      var ev = new CustomEvent('finamTariffWidget', { detail: detail });
      (widget.mountPoint || document).dispatchEvent(ev);
      window.dispatchEvent(ev);
    } catch (_) {}

    try {
      if (Array.isArray(window.dataLayer)) window.dataLayer.push(detail);
    } catch (_) {}
  }

  // (scoring-based matching removed; we use strict conservative rules below)

  // Conservative mapping (STRICT). Returns exactly ONE tariff id from whitelist.
  function recommendTariffId(answers) {
    // Rule 1 — Consultation need
    if (answers.q4_assistance === 'd1_yes') return 'n5_consulting';
    // Rule 2 — Futures / active trading instrument
    if (answers.q3_instruments === 'c2_futures') return 'n2_day';
    // Rule 3 — Explicit active trading intent
    if (answers.q1_goal === 'a2_active') return 'n2_day';
    // Rule 4 — Long-term intent
    if (answers.q1_goal === 'a1_save') return 'n1_dolgosrochniy';
    // Rule 5 — Try & learn
    if (answers.q1_goal === 'a3_try') return 'n3_investor';
    // Rule 6 — Fallback
    return 'n3_investor';
  }

  // Result copy (STRICT, NO assumptions).
  var RESULT_COPY = {
    n1_dolgosrochniy: {
      title: 'Вам подойдёт тариф «Долгосрочный портфель»',
      benefits: [
        'Подходит для спокойного долгосрочного подхода',
        'Удобен, если вы реже совершаете сделки',
        'Можно перейти и посмотреть условия тарифа',
      ],
    },
    n2_day: {
      title: 'Вам подойдёт тариф «Единый дневной»',
      benefits: [
        'Подходит, если вы планируете активные сделки',
        'Удобен для динамичной торговли',
        'Можно перейти и посмотреть условия тарифа',
      ],
    },
    n3_investor: {
      title: 'Вам подойдёт тариф «Инвестор»',
      benefits: [
        'Понятный старт без лишней сложности',
        'Подходит, если вы пока определяетесь со стратегией',
        'Можно перейти и посмотреть условия тарифа',
      ],
    },
    n4_strateg: {
      title: 'Вам подойдёт тариф «Стратег»',
      benefits: [
        'Подходит для более продвинутого подхода',
        'Удобен, если вы уверенно ориентируетесь в инвестициях',
        'Можно перейти и посмотреть условия тарифа',
      ],
    },
    n5_consulting: {
      title: 'Вам подойдёт тариф «Единый консультационный»',
      benefits: [
        'Подходит, если вам важны подсказки и сопровождение',
        'Помогает инвестировать с поддержкой',
        'Можно перейти и посмотреть условия тарифа',
      ],
    },
  };

  // (commission calculator removed; widget is questionnaire-only)

  function cssText() {
    return (
      '' +
      ':host{all:initial}' +
      /* Premium dark theme (scoped). */
      '.ftw{--tw-bg-page:#F2F4F7;--tw-surface:#0B0E14;--tw-surface-2:#141824;--tw-text-primary:#FFFFFF;--tw-text-secondary:rgba(255,255,255,0.72);--tw-border:rgba(255,255,255,0.10);--tw-border-strong:rgba(255,255,255,0.16);--tw-shadow:rgba(0,0,0,0.45);--tw-primary:#F5C84C;--tw-primary-hover:#EAB83E;--tw-primary-text:#111827;--tw-secondary:rgba(255,255,255,0.10);--tw-secondary-hover:rgba(255,255,255,0.16);--tw-radio-selected-bg:rgba(245,200,76,0.12);--tw-radio-selected-border:#F5C84C;--tw-radius-card:20px;--tw-radius-button:12px;--tw-radius-item:14px;--tw-card-pad:28px;--tw-h2-size:28px;--tw-h2-lh:34px;--tw-h2-weight:800;--tw-h3-size:22px;--tw-h3-lh:28px;--tw-h3-weight:800;--tw-body-size:14px;--tw-body-lh:20px;--tw-body-weight:500;--tw-meta-size:12px;--tw-meta-lh:16px;--tw-meta-weight:700}' +
      '.ftw *{box-sizing:border-box}' +
      '.ftw .wrap{width:100%}' +
      '.ftw .tw-widget{max-width:980px;margin:0 auto;border-radius:var(--tw-radius-card);background:linear-gradient(135deg,var(--tw-surface) 0%,var(--tw-surface-2) 100%);box-shadow:0 30px 80px var(--tw-shadow);padding:var(--tw-card-pad);color:var(--tw-text-primary);font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Arial,\"Noto Sans\",\"Helvetica Neue\",sans-serif}' +
      '.ftw .tw-h2{font-size:var(--tw-h2-size);line-height:var(--tw-h2-lh);font-weight:var(--tw-h2-weight);margin:0 0 8px 0;color:var(--tw-text-primary)}' +
      '.ftw .tw-h3{font-size:var(--tw-h3-size);line-height:var(--tw-h3-lh);font-weight:var(--tw-h3-weight);margin:0 0 12px 0;color:var(--tw-text-primary)}' +
      '.ftw .tw-body{font-size:var(--tw-body-size);line-height:var(--tw-body-lh);font-weight:var(--tw-body-weight);margin:0 0 18px 0;color:var(--tw-text-secondary)}' +
      '.ftw .tw-meta{font-size:var(--tw-meta-size);line-height:var(--tw-meta-lh);font-weight:var(--tw-meta-weight);color:var(--tw-text-secondary);margin:0 0 8px 0}' +
      '.ftw .tw-two-col{display:grid;grid-template-columns:1.1fr 0.9fr;gap:24px;align-items:center}' +
      '@media (max-width:860px){.ftw .tw-two-col{grid-template-columns:1fr}}' +
      /* Right decorative premium visual (no content) */
      '.ftw .tw-premium-visual{width:100%;min-height:180px;border-radius:16px;position:relative;overflow:hidden;background:radial-gradient(120% 90% at 80% 25%, rgba(245,200,76,0.22), transparent 60%),radial-gradient(90% 70% at 30% 80%, rgba(255,255,255,0.10), transparent 55%),linear-gradient(135deg,#0B0E14 0%,#141824 100%);box-shadow:inset 0 0 0 1px rgba(255,255,255,0.06)}' +
      '.ftw .tw-premium-visual::after{content:\"\";position:absolute;inset:-40% -20%;transform:rotate(12deg);background:linear-gradient(90deg,transparent 0%,rgba(255,255,255,0.06) 45%,transparent 70%);opacity:0.8}' +
      '.ftw .tw-progress-bar{width:100%;height:4px;border-radius:999px;background:var(--tw-border);overflow:hidden;margin:0 0 18px 0}' +
      '.ftw .tw-progress-bar > div{height:100%;width:var(--tw-progress,0%);background:var(--tw-primary);border-radius:999px}' +
      '.ftw .tw-options{display:flex;flex-direction:column;gap:12px;margin:0 0 16px 0}' +
      '.ftw .tw-option{border:1px solid var(--tw-border);border-radius:var(--tw-radius-item);padding:14px 14px;display:grid;grid-template-columns:1fr 28px;align-items:center;cursor:pointer;background:rgba(255,255,255,0.04);transition:background .15s ease,border-color .15s ease}' +
      '.ftw .tw-option:hover{border-color:var(--tw-border-strong);background:rgba(255,255,255,0.06)}' +
      '.ftw .tw-option.is-selected{background:var(--tw-radio-selected-bg);border-color:var(--tw-radio-selected-border)}' +
      '.ftw .tw-option-text{font-size:14px;line-height:20px;font-weight:700;color:var(--tw-text-primary)}' +
      '.ftw .tw-option-check{width:18px;height:18px;border-radius:999px;border:2px solid rgba(255,255,255,0.25);display:flex;align-items:center;justify-content:center;justify-self:end}' +
      '.ftw .tw-option.is-selected .tw-option-check{border-color:var(--tw-primary);background:var(--tw-primary)}' +
      '.ftw .tw-option.is-selected .tw-option-check::after{content:\"✓\";color:#1F2937;font-size:12px;font-weight:900;transform:translateY(-.5px)}' +
      '.ftw .tw-actions{display:flex;align-items:center;justify-content:space-between;gap:16px;margin-top:18px}' +
      '.ftw .tw-actions-left{display:flex;gap:10px;flex-wrap:wrap}' +
      '.ftw .tw-actions-right{display:flex;gap:10px;flex-wrap:wrap;justify-content:flex-end;align-items:center}' +
      '.ftw .tw-btn{border:none;border-radius:var(--tw-radius-button);padding:10px 16px;font-weight:700;font-size:14px;line-height:18px;cursor:pointer;transition:background .15s ease,transform .05s ease}' +
      '.ftw .tw-btn:active{transform:translateY(1px)}' +
      '.ftw .tw-btn-primary{background:var(--tw-primary)!important;color:var(--tw-primary-text)!important;font-weight:800}' +
      '.ftw .tw-btn-primary:hover{background:var(--tw-primary-hover)!important}' +
      '.ftw .tw-btn-secondary{background:var(--tw-secondary)!important;color:var(--tw-text-primary)!important;font-weight:800}' +
      '.ftw .tw-btn-secondary:hover{background:var(--tw-secondary-hover)!important}' +
      '.ftw .tw-btn[disabled]{opacity:.55;cursor:not-allowed;transform:none}' +
      '.ftw .tw-link{color:rgba(255,255,255,0.88);text-decoration:none;font-weight:800;font-size:14px;cursor:pointer}' +
      '.ftw .tw-link:hover{text-decoration:underline}' +
      '.ftw .tw-bullets{list-style:none;padding:0;margin:14px 0 14px 0;display:flex;flex-direction:column;gap:10px}' +
      '.ftw .tw-bullets li{display:grid;grid-template-columns:12px 1fr;gap:10px;align-items:start;color:rgba(255,255,255,0.90);font-weight:700;font-size:14px;line-height:20px}' +
      '.ftw .tw-bullets li::before{content:\"\";width:8px;height:8px;margin-top:6px;border-radius:999px;background:var(--tw-primary)}' +
      '.ftw .tw-btn:focus-visible,.ftw .tw-option:focus-visible,.ftw .tw-link:focus-visible{outline:2px solid var(--tw-primary);outline-offset:2px}' +
      ''
    );
  }

  function createRoot(target, options) {
    var useShadow = !!(options.shadowDom && target.attachShadow);
    var root = useShadow ? target.attachShadow({ mode: 'open' }) : target;
    var host = el('div', { class: 'ftw' });
    var style = el('style', { html: cssText() });
    if (useShadow) {
      root.appendChild(style);
      root.appendChild(host);
    } else {
      target.appendChild(style);
      target.appendChild(host);
    }
    return { root: root, host: host, useShadow: useShadow };
  }

  function Widget(target, opts) {
    this.options = {};
    for (var k in DEFAULTS) this.options[k] = DEFAULTS[k];
    for (var k2 in (opts || {})) this.options[k2] = opts[k2];

    if (this.options.loadFonts) ensureFonts();

    this.mountPoint = target;
    this.dom = createRoot(target, this.options);

    var initialStep = 0;
    var initialView = this.options.initialView || 'intro';
    if (initialView === 'intro') initialStep = -1;
    if (initialView === 'questionnaire') initialStep = 0;

    this.state = {
      view: 'questionnaire',
      step: initialStep, // -1 = intro, 0.. = questions, >= QUESTIONS.length = result
      answers: {
        q1_goal: null,
        q2_frequency: null,
        q3_instruments: null,
        q4_assistance: null,
      },
      manualOnly: false,
      prevStep: 0,
    };

    track(this, 'widget_init', {});
    this.render();
  }

  Widget.prototype.setState = function (patch) {
    for (var k in patch) this.state[k] = patch[k];
    this.render();
  };

  Widget.prototype.setAnswer = function (id, value) {
    this.state.answers[id] = value;
    track(this, 'question_answered', { question_id: id, answer_id: String(value) });
    this.render();
  };

  Widget.prototype.canNext = function () {
    var q = QUESTIONS[this.state.step];
    return q && this.state.answers[q.id] != null;
  };

  Widget.prototype.resetQuestionnaire = function () {
    this.state.step = -1;
    this.state.answers = {
      q1_goal: null,
      q2_frequency: null,
      q3_instruments: null,
      q4_assistance: null,
    };
    this.state.manualOnly = false;
    this.state.prevStep = 0;
    this.render();
  };

  Widget.prototype.renderIntro = function (container) {
    var self = this;
    container.appendChild(
      el(
        'div',
        { class: 'tw-widget' },
        el(
          'div',
          { class: 'tw-two-col' },
          el(
            'div',
            null,
            el('div', { class: 'tw-h2', text: 'Подберём подходящий тариф за 1 минуту' }),
            el('div', { class: 'tw-body', text: 'Ответьте на несколько вопросов — мы покажем тариф, который лучше всего подойдёт под ваши задачи' }),
            el(
              'div',
              { class: 'tw-actions' },
              el('div', { class: 'tw-actions-left' }),
              el(
                'div',
                { class: 'tw-actions-right' },
                el('button', {
                  class: 'tw-btn tw-btn-primary',
                  onClick: function () {
                    track(self, 'widget_start', {});
                    self.setState({ step: 0 });
                  },
                  text: 'Начать подбор',
                })
              )
            )
          ),
          el('div', { class: 'tw-premium-visual', 'aria-hidden': 'true' })
        )
      )
    );
  };

  Widget.prototype.renderProgress = function (container) {
    var step = this.state.step;
    var total = QUESTIONS.length;
    var current = Math.min(total, Math.max(1, step + 1));
    container.appendChild(el('div', { class: 'tw-meta', text: 'Вопрос ' + current + ' из ' + total }));
    var wrap = el('div', { class: 'tw-progress-bar' }, el('div', {}));
    wrap.style.setProperty('--tw-progress', Math.round((current / total) * 100) + '%');
    container.appendChild(wrap);
  };

  Widget.prototype.renderQuestionnaire = function (container) {
    var self = this;
    var step = this.state.step;
    var q = QUESTIONS[step];

    var card = el('div', { class: 'tw-widget' });

    this.renderProgress(card);
    card.appendChild(el('div', { class: 'tw-h3', text: q.title }));

    var group = el('div', { class: 'tw-options', role: 'radiogroup', 'aria-label': q.title });
    var rows = [];
    function onGroupKeydown(e) {
      var key = e.key;
      var idx = rows.indexOf(document.activeElement);
      if (idx < 0) idx = 0;
      if (key === 'ArrowDown' || key === 'ArrowRight') {
        e.preventDefault();
        rows[(idx + 1 + rows.length) % rows.length].focus();
      } else if (key === 'ArrowUp' || key === 'ArrowLeft') {
        e.preventDefault();
        rows[(idx - 1 + rows.length) % rows.length].focus();
      }
    }
    group.addEventListener('keydown', onGroupKeydown);

    q.options.forEach(function (o) {
      var checked = self.state.answers[q.id] === o.value;
      var row = el('button', {
        class: checked ? 'tw-option is-selected' : 'tw-option',
        role: 'radio',
        'aria-checked': checked ? 'true' : 'false',
        onClick: function () {
          self.setAnswer(q.id, o.value);
        },
      });
      row.appendChild(el('div', { class: 'tw-option-text', text: o.label }));
      row.appendChild(el('div', { class: 'tw-option-check', 'aria-hidden': 'true' }));
      row.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          row.click();
        }
      });
      row.tabIndex = checked ? 0 : -1;
      rows.push(row);
      group.appendChild(row);
    });
    card.appendChild(group);

    if (q.helperText) card.appendChild(el('div', { class: 'tw-meta', text: q.helperText }));

    var backBtn = el('button', {
      class: 'tw-btn tw-btn-secondary',
      disabled: step === 0,
      onClick: function () {
        if (step === 0) return;
        self.setState({ step: Math.max(0, step - 1) });
      },
      text: 'Назад',
    });

    var next = el('button', {
      class: 'tw-btn tw-btn-primary',
      disabled: !self.canNext(),
      onClick: function () {
        if (step < QUESTIONS.length - 1) self.setState({ step: step + 1 });
        else {
          track(self, 'widget_completed', {});
          self.setState({ step: QUESTIONS.length });
        }
      },
      text: 'Далее',
    });

    var manual = el('a', {
      class: 'tw-link',
      href: '#',
      text: 'Я хочу выбрать тариф самостоятельно',
      onClick: function (e) {
        e.preventDefault();
        track(self, 'manual_tariff_selection', {});
        self.setState({ step: QUESTIONS.length, manualOnly: true, prevStep: step });
      },
    });

    card.appendChild(
      el(
        'div',
        { class: 'tw-actions' },
        el('div', { class: 'tw-actions-left' }, manual),
        el('div', { class: 'tw-actions-right' }, backBtn, next)
      )
    );

    container.appendChild(card);
  };

  Widget.prototype.openTariff = function (tariffId) {
    // tariffId must be from STRICT WHITELIST
    assertValidTariff(tariffId);
    var t = tariffById(tariffId);
    if (!t) return;
    track(this, 'tariff_recommended', { tariff_id: tariffId });
    try {
      window.location.href = t.url;
    } catch (_) {}
  };

  Widget.prototype.renderResultScreen = function (container) {
    var self = this;

    // Manual selection screen (escape route): show ONLY the 5 whitelisted tariffs.
    if (this.state.manualOnly) {
      var manualCard = el('div', { class: 'tw-widget' });
      manualCard.appendChild(el('div', { class: 'tw-actions' },
        el('div', { class: 'tw-actions-left' },
          el('button', {
            class: 'tw-btn tw-btn-secondary',
            onClick: function () {
              self.setState({ step: self.state.prevStep || 0, manualOnly: false });
            },
            text: 'Назад',
          })
        ),
        el('div', { class: 'tw-actions-left' })
      ));

      var list = el('div', { class: 'tw-options' });
      for (var i = 0; i < TARIFF_CATALOG.length; i++) {
        (function (t) {
          var row = el('button', {
            class: 'tw-option',
            onClick: function () {
              self.openTariff(t.id);
            },
          });
          row.appendChild(el('div', { class: 'tw-option-text', text: t.name }));
          row.appendChild(el('div', { class: 'tw-option-check', 'aria-hidden': 'true' }));
          list.appendChild(row);
        })(TARIFF_CATALOG[i]);
      }
      manualCard.appendChild(list);
      container.appendChild(manualCard);
      return;
    }

    var tariffId = recommendTariffId(this.state.answers);
    assertValidTariff(tariffId);
    var tariff = tariffById(tariffId);
    var rc = RESULT_COPY[tariffId];

    if (!tariff || !rc) {
      tariffId = 'n3_investor';
      tariff = tariffById(tariffId);
      rc = RESULT_COPY[tariffId];
    }

    var card = el(
      'div',
      { class: 'tw-widget' },
      el(
        'div',
        { class: 'tw-two-col' },
        el('div', null),
        el('div', { class: 'tw-premium-visual', 'aria-hidden': 'true' })
      )
    );
    var left = card.querySelector('.tw-two-col > div');
    left.appendChild(el('div', { class: 'tw-h2', text: rc.title }));
    left.appendChild(el('div', { class: 'tw-body', text: 'Мы подобрали его на основе ваших ответов' }));

    if (rc && Array.isArray(rc.benefits)) {
      var list = el('ul', { class: 'tw-bullets' });
      rc.benefits.slice(0, 3).forEach(function (b) {
        list.appendChild(el('li', { text: b }));
      });
      left.appendChild(list);
    }

    left.appendChild(
      el(
        'div',
        { class: 'tw-actions' },
        el('div', { class: 'tw-actions-left' }),
        el('div', { class: 'tw-actions-right' },
          el('button', {
            class: 'tw-btn tw-btn-secondary',
            onClick: function () {
              self.setState({ manualOnly: true, prevStep: QUESTIONS.length });
            },
            text: 'Посмотреть другие тарифы',
          }),
          el('button', {
            class: 'tw-btn tw-btn-primary',
            onClick: function () {
              self.openTariff(tariffId);
            },
            text: 'Перейти к тарифу',
          })
        )
      )
    );

    // ResultScreen must show exactly ONE tariff (no embedded alternatives list).

    container.appendChild(card);
  };

  Widget.prototype.render = function () {
    var host = this.dom.host;
    while (host.firstChild) host.removeChild(host.firstChild);

    var wrap = el('div', { class: 'wrap' });
    if (this.state.step < 0) {
      this.renderIntro(wrap);
    } else if (this.state.step >= QUESTIONS.length) {
      this.renderResultScreen(wrap);
    } else {
      this.renderQuestionnaire(wrap);
    }

    host.appendChild(wrap);
  };

  function normalizeTarget(t) {
    if (!t) return null;
    if (typeof t === 'string') return document.querySelector(t);
    return t;
  }

  function mount(target, options) {
    var elTarget = normalizeTarget(target);
    if (!elTarget) throw new Error('FinamTariffWidget.mount: target not found');
    return new Widget(elTarget, options || {});
  }

  function autoMount() {
    var nodes = document.querySelectorAll('[data-finam-tariff-widget]');
    for (var i = 0; i < nodes.length; i++) {
      if (nodes[i].__finamTariffWidgetMounted) continue;
      nodes[i].__finamTariffWidgetMounted = true;
      mount(nodes[i], {});
    }
  }

  function onReady(fn) {
    if (document.readyState === 'complete' || document.readyState === 'interactive') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  global.FinamTariffWidget = { mount: mount, autoMount: autoMount, version: VERSION };
  onReady(autoMount);
})(window);

