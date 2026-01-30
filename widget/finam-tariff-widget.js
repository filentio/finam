/*!
 * Finam Tariff Widget
 * Self-contained embed widget (no build step).
 * Version: 1.0.1
 */
(function (global) {
  'use strict';

  var VERSION = '1.0.1';

  var DEFAULTS = {
    // 'form' | 'result'
    initialView: 'form',
    loadFonts: false, // no external dependencies by default
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

  // Questions (step-by-step flow)
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
      required: true,
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
      required: true,
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
      required: true,
    },
    {
      id: 'q4_assistance',
      title: 'Нужна ли вам помощь при инвестировании?',
      options: [
        { value: 'd1_yes', label: 'Да, хочу подсказки и сопровождение' },
        { value: 'd2_sometimes', label: 'Иногда, но в целом сам(а)' },
        { value: 'd3_no', label: 'Нет, всё делаю сам(а)' },
      ],
      required: true,
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

  // Result copy (STRICT, NO assumptions).
  var RESULT_COPY = {
    n1_dolgosrochniy: {
      benefits: [
        'Подходит для спокойного долгосрочного подхода',
        'Удобен, если вы реже совершаете сделки',
        'Можно перейти и посмотреть условия тарифа',
      ],
    },
    n2_day: {
      benefits: [
        'Подходит, если вы планируете активные сделки',
        'Удобен для динамичной торговли',
        'Можно перейти и посмотреть условия тарифа',
      ],
    },
    n3_investor: {
      benefits: [
        'Понятный старт без лишней сложности',
        'Подходит, если вы пока определяетесь со стратегией',
        'Можно перейти и посмотреть условия тарифа',
      ],
    },
    n4_strateg: {
      benefits: [
        'Можно перейти и посмотреть условия тарифа',
        'Подходит, если вам ближе готовые подходы',
        'Помогает действовать более системно',
      ],
    },
    n5_consulting: {
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
      /* Tokens (Finam premium dark + gold). */
      '.ftw{' +
      '--ui-font: \"Inter var\", Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;' +
      '--ui-bg-dark:#151519;' +
      '--ui-border-on-dark:hsla(0,0%,100%,.12);' +
      '--ui-text-inverse:#ebebf2;' +
      '--ui-text-inverse-secondary:rgb(164,164,178);' +
      '--ui-brand:#ffc759;' +
      '--ui-brand-hover:#ffba30;' +
      '--ui-brand-pressed:#f9a605;' +
      '--ui-gradient-premium:linear-gradient(225deg, rgba(192,192,204,.24) -0.21%, rgba(0,0,0,.2) 45.81%, rgba(0,0,0,.4) 96.67%), #151519;' +
      '--ui-gradient-gold-soft:radial-gradient(90% 120% at 20% 10%, rgba(255,199,89,.22) 0%, rgba(255,199,89,0) 55%);' +
      '--ui-gradient-gold-edge:radial-gradient(70% 120% at 100% 0%, rgba(255,186,48,.18) 0%, rgba(255,186,48,0) 60%);' +
      '--ui-shadow-cardDark:0px 5px 10px 0px rgba(57,57,66,.16), 0px 15px 20px 0px rgba(57,57,66,.16), 0px 25px 50px 0px rgba(57,57,66,.16);' +
      '--ui-shadow-cardMid:0px 2px 6px 0px rgba(57,57,66,.06), 0px 10px 20px 0px rgba(57,57,66,.06);' +
      /* Slightly smaller rounding (per request) */
      '--ui-radius-shell:24px;' +
      '--ui-radius-card:16px;' +
      '--ui-radius-item:12px;' +
      '--ui-radius-btn:10px;' +
      '}' +
      '.ftw *{box-sizing:border-box}' +
      '.ftw .wrap{width:100%}' +
      /* Shell */
      '.ftw .tw-shell{font-family:var(--ui-font);border-radius:var(--ui-radius-shell);background:var(--ui-gradient-premium);box-shadow:var(--ui-shadow-cardDark);border:1px solid var(--ui-border-on-dark);color:var(--ui-text-inverse);overflow:hidden}' +
      '.ftw .tw-header{padding:24px;display:flex;align-items:center;justify-content:space-between;gap:16px;background-image:var(--ui-gradient-gold-edge)}' +
      '.ftw .tw-h1{font-size:24px;line-height:28px;font-weight:700;color:var(--ui-text-inverse);margin:0}' +
      '.ftw .tw-h2{font-size:32px;line-height:38px;font-weight:900;color:var(--ui-text-inverse);margin:0}' +
      '.ftw .tw-secondaryText{font-size:16px;line-height:20px;font-weight:400;letter-spacing:-0.096px;color:var(--ui-text-inverse-secondary);margin-top:8px}' +
      '.ftw .tw-meta{font-size:12px;line-height:16px;font-weight:700;color:var(--ui-text-inverse-secondary);margin:0 0 10px 0}' +
      /* Body grid */
      '.ftw .tw-two-col{display:grid;grid-template-columns:1.05fr 0.95fr;gap:24px;align-items:stretch;padding:24px}' +
      '@media (max-width:860px){.ftw .tw-two-col{grid-template-columns:1fr}.ftw .tw-premium-visual{display:none}}' +
      /* Premium visual */
      '.ftw .tw-premium-visual{border-radius:var(--ui-radius-shell);background-image:var(--ui-gradient-gold-soft), var(--ui-gradient-gold-edge);background-color:var(--ui-bg-dark);box-shadow:inset 0 0 0 1px rgba(255,255,255,0.06);position:relative;min-height:260px;overflow:hidden}' +
      '.ftw .tw-premium-visual::after{content:\"\";position:absolute;inset:-40% -20%;transform:rotate(12deg);background:linear-gradient(90deg,transparent 0%,rgba(255,255,255,0.06) 45%,transparent 70%);opacity:0.8}' +
      /* Inner card */
      '.ftw .tw-card{border-radius:var(--ui-radius-card);background:rgba(255,255,255,0.04);border:1px solid var(--ui-border-on-dark);box-shadow:var(--ui-shadow-cardMid);padding:24px}' +
      '.ftw .tw-questionTitle{font-size:20px;line-height:24px;font-weight:700;color:var(--ui-text-inverse);margin:0 0 12px 0}' +
      '.ftw .tw-progress{height:4px;border-radius:999px;background:rgba(255,255,255,0.10);overflow:hidden;margin:8px 0 18px 0}' +
      '.ftw .tw-progress > div{height:100%;width:var(--tw-progress,0%);background:var(--ui-brand);border-radius:999px}' +
      /* Options */
      '.ftw .tw-options{display:flex;flex-direction:column;gap:16px;margin:0 0 20px 0}' +
      '.ftw .tw-option{border-radius:var(--ui-radius-item);background:rgba(255,255,255,0.04);border:1px solid var(--ui-border-on-dark);padding:16px;cursor:pointer;display:grid;grid-template-columns:1fr 28px;align-items:center;transition:background .15s ease,border-color .15s ease}' +
      '.ftw .tw-option:hover{background:rgba(255,255,255,0.06)}' +
      '.ftw .tw-option.is-selected{background:rgba(255,199,89,0.10);border-color:rgba(255,186,48,0.45)}' +
      '.ftw .tw-option-text{font-size:16px;line-height:20px;font-weight:500;color:var(--ui-text-inverse)}' +
      '.ftw .tw-option-check{width:18px;height:18px;border-radius:999px;border:2px solid rgba(255,255,255,0.25);justify-self:end;display:flex;align-items:center;justify-content:center}' +
      '.ftw .tw-option.is-selected .tw-option-check{border-color:var(--ui-brand);background:var(--ui-brand)}' +
      '.ftw .tw-option.is-selected .tw-option-check::after{content:\"✓\";color:#000;font-size:12px;font-weight:900}' +
      /* Divider */
      '.ftw .tw-divider{height:1px;background:hsla(0,0%,100%,.12);margin:16px 0}' +
      /* Bullets */
      '.ftw .tw-bullets{list-style:none;padding:0;margin:16px 0;display:flex;flex-direction:column;gap:10px}' +
      '.ftw .tw-bullets li{display:grid;grid-template-columns:12px 1fr;gap:10px;align-items:start;color:var(--ui-text-inverse);font-weight:700;font-size:14px;line-height:20px}' +
      '.ftw .tw-bullets li::before{content:\"\";width:8px;height:8px;margin-top:6px;border-radius:999px;background:var(--ui-brand)}' +
      /* Actions */
      '.ftw .tw-actions{display:flex;align-items:center;justify-content:space-between;gap:16px;margin-top:20px;flex-wrap:wrap}' +
      '.ftw .tw-actions-left{display:flex;gap:10px;flex-wrap:wrap}' +
      '.ftw .tw-actions-right{display:flex;gap:10px;flex-wrap:wrap;justify-content:flex-end;align-items:center}' +
      /* Buttons */
      '.ftw .tw-btn{height:48px;padding:0 20px;border-radius:var(--ui-radius-btn);font-family:var(--ui-font);font-size:16px;line-height:20px;font-weight:500;border:none;cursor:pointer;transition:background .15s ease, transform .05s ease}' +
      '.ftw .tw-btn:active{transform:translateY(1px)}' +
      '.ftw .tw-btn-primary{background:var(--ui-brand);color:#000}' +
      '.ftw .tw-btn-primary:hover{background:var(--ui-brand-hover)}' +
      '.ftw .tw-btn-secondary{background:rgba(255,255,255,0.08);color:var(--ui-text-inverse);border:1px solid var(--ui-border-on-dark)}' +
      '.ftw .tw-btn-secondary:hover{background:rgba(255,255,255,0.12)}' +
      '.ftw .tw-btn[disabled]{opacity:0.6;cursor:not-allowed;transform:none}' +
      /* Focus */
      '.ftw .tw-btn:focus-visible,.ftw .tw-option:focus-visible{outline:2px solid var(--ui-brand);outline-offset:2px}' +
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

    this.state = {
      mode: 'intro', // 'intro' | 'question' | 'result' | 'error'
      step: 0,
      answers: {
        q1_goal: null,
        q2_frequency: null,
        q3_instruments: null,
        q4_assistance: null,
      },
      resultTariffId: null,
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
    this.state.mode = 'intro';
    this.state.step = 0;
    this.state.answers = { q1_goal: null, q2_frequency: null, q3_instruments: null, q4_assistance: null };
    this.state.resultTariffId = null;
    this.render();
  };

  Widget.prototype.recommendTariffId = function () {
    // Conservative mapping for restored questions
    var a = this.state.answers;
    if (a.q4_assistance === 'd1_yes') return 'n5_consulting';
    if (a.q3_instruments === 'c2_futures') return 'n2_day';
    if (a.q1_goal === 'a2_active') return 'n2_day';
    if (a.q1_goal === 'a1_save') return 'n1_dolgosrochniy';
    if (a.q1_goal === 'a3_try') return 'n3_investor';
    return 'n3_investor';
  };

  Widget.prototype.renderIntroScreen = function (container) {
    var self = this;
    var shell = el('div', { class: 'tw-shell tw-widgetShell' });
    var header = el(
      'div',
      { class: 'tw-header tw-widgetHeader' },
      el(
        'div',
        null,
        el('div', { class: 'tw-h1', text: 'Поможем подобрать тариф' }),
        el('div', { class: 'tw-secondaryText', text: 'Ответьте на несколько вопросов — покажем подходящий тариф.' })
      )
    );
    shell.appendChild(header);

    var grid = el('div', { class: 'tw-two-col' }, el('div', null), el('div', { class: 'tw-premium-visual', 'aria-hidden': 'true' }));
    var left = grid.querySelector('.tw-two-col > div');

    var card = el('div', { class: 'tw-card' });
    card.appendChild(el('div', { class: 'tw-h2', text: 'Подберём подходящий тариф за 1 минуту' }));
    card.appendChild(el('div', { class: 'tw-secondaryText', text: 'Ответьте на несколько вопросов — мы покажем тариф, который лучше всего подойдёт под ваши задачи.' }));
    card.appendChild(
      el('div', { class: 'tw-actions' },
        el('div', { class: 'tw-actions-left' }),
        el('div', { class: 'tw-actions-right' },
          el('button', {
            class: 'tw-btn tw-btn-primary',
            onClick: function () {
              track(self, 'widget_start', {});
              self.setState({ mode: 'question', step: 0 });
            },
            text: 'Начать подбор',
          })
        )
      )
    );

    left.appendChild(card);
    shell.appendChild(grid);
    container.appendChild(shell);
  };

  Widget.prototype.renderQuestionScreen = function (container) {
    var self = this;
    var q = QUESTIONS[this.state.step];
    var total = QUESTIONS.length;
    var current = this.state.step + 1;

    var shell = el('div', { class: 'tw-shell tw-widgetShell' });
    var header = el(
      'div',
      { class: 'tw-header tw-widgetHeader' },
      el(
        'div',
        null,
        el('div', { class: 'tw-h1', text: 'Поможем подобрать тариф' }),
        el('div', { class: 'tw-secondaryText', text: 'Ответьте на несколько вопросов — покажем подходящий тариф.' })
      )
    );
    shell.appendChild(header);

    var grid = el('div', { class: 'tw-two-col' }, el('div', null), el('div', { class: 'tw-premium-visual', 'aria-hidden': 'true' }));
    var left = grid.querySelector('.tw-two-col > div');

    var card = el('div', { class: 'tw-card' });
    card.appendChild(el('div', { class: 'tw-meta', text: 'Вопрос ' + current + ' из ' + total }));
    var pb = el('div', { class: 'tw-progress' }, el('div', {}));
    pb.style.setProperty('--tw-progress', Math.round((current / total) * 100) + '%');
    card.appendChild(pb);

    card.appendChild(el('div', { class: 'tw-questionTitle', text: q.title }));
    var group = el('div', { class: 'tw-options', role: 'radiogroup', 'aria-label': q.title });
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
      group.appendChild(row);
    });
    card.appendChild(group);
    if (q.helperText) card.appendChild(el('div', { class: 'tw-secondaryText', text: q.helperText }));

    var back = el('button', {
      class: 'tw-btn tw-btn-secondary',
      disabled: this.state.step === 0,
      onClick: function () {
        if (self.state.step === 0) return;
        self.setState({ step: Math.max(0, self.state.step - 1) });
      },
      text: 'Назад',
    });

    var isLast = this.state.step === total - 1;
    var next = el('button', {
      class: 'tw-btn tw-btn-primary',
      disabled: !this.canNext(),
      onClick: function () {
        if (!self.canNext()) return;
        if (!isLast) self.setState({ step: self.state.step + 1 });
        else {
          track(self, 'widget_completed', {});
          var id = self.recommendTariffId();
          assertValidTariff(id);
          self.setState({ mode: 'result', resultTariffId: id });
        }
      },
      text: isLast ? 'Показать тариф' : 'Далее',
    });

    card.appendChild(
      el('div', { class: 'tw-actions' },
        el('div', { class: 'tw-actions-left' }),
        el('div', { class: 'tw-actions-right' }, back, next)
      )
    );

    left.appendChild(card);
    shell.appendChild(grid);
    container.appendChild(shell);
  };

  Widget.prototype.openTariff = function (tariffId) {
    // tariffId must be from STRICT WHITELIST
    assertValidTariff(tariffId);
    var t = tariffById(tariffId);
    if (!t) return;
    track(this, 'tariff_recommended', { tariff_id: tariffId });
    try {
      var w = window.open(t.url, '_blank', 'noopener,noreferrer');
      if (!w) window.location.href = t.url;
    } catch (_) {}
  };

  Widget.prototype.renderResultScreen = function (container) {
    var self = this;
    var tariffId = this.state.resultTariffId || this.recommendTariffId();
    assertValidTariff(tariffId);
    var tariff = tariffById(tariffId);
    if (!tariff) {
      this.setState({ mode: 'error' });
      return;
    }

    var shell = el('div', { class: 'tw-shell tw-widgetShell' });
    var header = el(
      'div',
      { class: 'tw-header tw-widgetHeader' },
      el(
        'div',
        null,
        el('div', { class: 'tw-h1', text: 'Поможем подобрать тариф' }),
        el('div', { class: 'tw-secondaryText', text: 'Результат подбора' })
      )
    );
    shell.appendChild(header);

    var grid = el(
      'div',
      { class: 'tw-two-col' },
      el('div', null),
      el('div', { class: 'tw-premium-visual', 'aria-hidden': 'true' })
    );
    var left = grid.querySelector('.tw-two-col > div');

    var card = el('div', { class: 'tw-card' });
    card.appendChild(el('div', { class: 'tw-h2', text: 'Вам подходит тариф: ' + tariff.name }));
    card.appendChild(el('div', { class: 'tw-secondaryText', text: 'Мы подобрали его на основе ваших ответов.' }));
    card.appendChild(el('div', { class: 'tw-divider' }));

    var bullets = el('ul', { class: 'tw-bullets' });
    var rc = RESULT_COPY[tariffId];
    var items = rc && rc.benefits ? rc.benefits : [];
    for (var i = 0; i < items.length && i < 3; i++) bullets.appendChild(el('li', { text: items[i] }));
    card.appendChild(bullets);

    card.appendChild(
      el(
        'div',
        { class: 'tw-actions' },
        el('div', { class: 'tw-actions-left' },
          el('button', { class: 'tw-btn tw-btn-secondary', onClick: function () { self.resetQuestionnaire(); }, text: 'Пройти заново' })
        ),
        el('div', { class: 'tw-actions-right' },
          el('button', { class: 'tw-btn tw-btn-primary', onClick: function () { self.openTariff(tariffId); }, text: 'Перейти к тарифу' })
        )
      )
    );

    left.appendChild(card);
    shell.appendChild(grid);
    container.appendChild(shell);
  };

  Widget.prototype.renderErrorScreen = function (container) {
    var self = this;
    var shell = el('div', { class: 'tw-shell tw-widgetShell' });
    var card = el('div', { class: 'tw-card' });
    card.appendChild(el('div', { class: 'tw-h2', text: 'Не удалось подобрать тариф' }));
    card.appendChild(el('div', { class: 'tw-secondaryText', text: 'Попробуйте выбрать варианты ещё раз.' }));
    card.appendChild(el('div', { class: 'tw-actions' },
      el('div', { class: 'tw-actions-left' }),
      el('div', { class: 'tw-actions-right' },
        el('button', { class: 'tw-btn tw-btn-primary', onClick: function () { self.resetQuestionnaire(); }, text: 'Вернуться к вопросам' })
      )
    ));
    shell.appendChild(card);
    container.appendChild(shell);
  };

  Widget.prototype.render = function () {
    var host = this.dom.host;
    while (host.firstChild) host.removeChild(host.firstChild);

    var wrap = el('div', { class: 'wrap' });
    if (this.state.mode === 'result') this.renderResultScreen(wrap);
    else if (this.state.mode === 'error') this.renderErrorScreen(wrap);
    else if (this.state.mode === 'question') this.renderQuestionScreen(wrap);
    else this.renderIntroScreen(wrap);

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

