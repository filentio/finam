/*!
 * Finam Tariff Widget
 * Self-contained embed widget (no build step).
 * Version: 0.3.0
 */
(function (global) {
  'use strict';

  var VERSION = '0.3.0';

  var DEFAULTS = {
    // 'intro' | 'questionnaire'
    initialView: 'intro',
    showTabs: false,
    loadFonts: true,
    shadowDom: true,
    manualUrl: '#', // "выбрать самостоятельно" (настраивается снаружи)
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
  var ALLOWED_TARIFF_IDS = ['n1_dolgosrochniy', 'n2_day', 'n3_investor', 'n4_strateg', 'n5_consulting'];

  function assertValidTariff(tariffId) {
    for (var i = 0; i < ALLOWED_TARIFF_IDS.length; i++) {
      if (ALLOWED_TARIFF_IDS[i] === tariffId) return;
    }
    throw new Error('Invalid tariff generated: ' + tariffId);
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
      /* Spec defaults. Override via CSS variables on the container. */
      '.ftw{--ftw-bg:#fff;--ftw-text:#0b1220;--ftw-muted:#5b667a;--ftw-border:#e6eaf2;--ftw-primary:#0b5fff;--ftw-accent:#ffd600;--ftw-radius:16px;--ftw-shadow:0 12px 30px rgba(11,18,32,.10);--ftw-shadow-sm:0 6px 16px rgba(11,18,32,.08);font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;color:var(--ftw-text)}' +
      '.ftw *{box-sizing:border-box}' +
      '.ftw .wrap{width:100%;max-width:840px;margin:0 auto;background:var(--ftw-bg);border-radius:var(--ftw-radius);box-shadow:var(--ftw-shadow);padding:28px;border:1px solid var(--ftw-border)}' +
      '@media (max-width:640px){.ftw .wrap{padding:20px}}' +
      '.ftw h2{margin:0;font-size:22px;line-height:1.25;font-weight:800}' +
      '.ftw h3{margin:0;font-size:18px;line-height:1.35;font-weight:800}' +
      '.ftw p{margin:0;color:var(--ftw-muted);font-size:14px;line-height:1.55;font-weight:500}' +
      '.ftw .space-12{height:12px}' +
      '.ftw .space-16{height:16px}' +
      '.ftw .space-20{height:20px}' +
      '.ftw .progressLabel{font-size:12px;font-weight:600;color:var(--ftw-muted)}' +
      '.ftw .progress{margin-top:10px;height:4px;border-radius:999px;overflow:hidden;background:#e9edf5}' +
      '.ftw .bar{height:100%;background:var(--ftw-accent);width:0%}' +
      '.ftw .radio{margin-top:16px;display:flex;flex-direction:column;gap:10px}' +
      '.ftw .radioRow{display:flex;align-items:center;justify-content:space-between;gap:12px;width:100%;text-align:left;border:1px solid var(--ftw-border);background:#fff;border-radius:12px;padding:14px 14px;cursor:pointer;transition:background .12s ease,border-color .12s ease,box-shadow .12s ease}' +
      '.ftw .radioRow:hover{background:#fbfdff;border-color:#d7deed}' +
      '.ftw .radioRow[aria-checked=\"true\"]{background:rgba(255,214,0,.14);border-color:rgba(255,214,0,.55);box-shadow:var(--ftw-shadow-sm)}' +
      '.ftw .radioText{font-size:14px;font-weight:600;color:var(--ftw-text);line-height:1.35}' +
      '.ftw .check{width:20px;height:20px;flex:0 0 20px;border-radius:999px;border:2px solid #c9d2e6;display:flex;align-items:center;justify-content:center;background:#fff}' +
      '.ftw .radioRow[aria-checked=\"true\"] .check{border-color:rgba(11,18,32,.15);background:var(--ftw-accent)}' +
      '.ftw .check svg{display:block}' +
      '.ftw .helper{margin-top:10px;font-size:12px;line-height:1.45;color:var(--ftw-muted)}' +
      '.ftw .actions{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-top:20px;flex-wrap:wrap}' +
      '.ftw .btn{border:1px solid var(--ftw-border);border-radius:12px;background:#fff;cursor:pointer;padding:12px 16px;font-weight:700;font-size:14px;transition:background .12s ease,border-color .12s ease}' +
      '.ftw .btn:hover{background:#f6f8fc}' +
      '.ftw .btn.primary{background:var(--ftw-primary);border-color:var(--ftw-primary);color:#fff}' +
      '.ftw .btn.primary:hover{background:#0a57e8}' +
      '.ftw .btn:disabled{opacity:.55;cursor:not-allowed}' +
      '.ftw a.link{color:var(--ftw-primary);text-decoration:none;font-size:14px;font-weight:600;cursor:pointer}' +
      '.ftw a.link:hover{text-decoration:underline}' +
      '.ftw .btn,.ftw .radioRow,.ftw a.link{cursor:pointer}' +
      '.ftw .btn:disabled{cursor:not-allowed}' +
      '.ftw .btn:focus-visible,.ftw .radioRow:focus-visible,.ftw a.link:focus-visible{outline:none;box-shadow:0 0 0 4px rgba(11,95,255,.16)}' +
      '.ftw .resultTitle{font-size:18px;font-weight:800;color:var(--ftw-text)}' +
      '.ftw .pill{display:inline-flex;align-items:center;gap:8px;background:#f6f8fc;border:1px solid var(--ftw-border);border-radius:999px;padding:8px 10px;font-size:12px;font-weight:700;color:var(--ftw-muted)}' +
      '.ftw .cards{margin-top:16px;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}' +
      '@media (max-width:640px){.ftw .cards{grid-template-columns:1fr}}' +
      '.ftw .tariffCard{border:1px solid var(--ftw-border);border-radius:14px;padding:16px;background:#fff}' +
      '.ftw .tariffName{font-size:16px;font-weight:800;color:var(--ftw-text)}' +
      '.ftw .why{margin-top:8px;font-size:14px;line-height:1.55;color:var(--ftw-muted)}' +
      '.ftw ul.benefits{margin:12px 0 0;padding-left:18px;color:var(--ftw-muted)}' +
      '.ftw ul.benefits li{margin:6px 0;line-height:1.45;font-weight:500}' +
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
      showAlternatives: false,
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
    this.state.showAlternatives = false;
    this.render();
  };

  Widget.prototype.renderIntro = function (container) {
    var self = this;
    container.appendChild(el('h2', { text: 'Подберём подходящий тариф за 1 минуту' }));
    container.appendChild(el('div', { class: 'space-12' }));
    container.appendChild(
      el('p', {
        text: 'Ответьте на несколько вопросов — мы покажем тариф, который лучше всего подойдёт под ваши задачи',
      })
    );
    container.appendChild(el('div', { class: 'space-20' }));
    container.appendChild(
      el(
        'div',
        { class: 'actions' },
        el('span', { text: '' }),
        el('button', {
          class: 'btn primary',
          onClick: function () {
            track(self, 'widget_start', {});
            self.setState({ step: 0 });
          },
          text: 'Начать подбор',
        })
      )
    );
  };

  Widget.prototype.renderProgress = function (container) {
    var step = this.state.step;
    var total = QUESTIONS.length;
    var current = Math.min(total, Math.max(1, step + 1));
    container.appendChild(el('div', { class: 'progressLabel', text: 'Вопрос ' + current + ' из ' + total }));
    var progress = el('div', { class: 'progress' }, el('div', { class: 'bar' }));
    progress.querySelector('.bar').style.width = Math.round((current / total) * 100) + '%';
    container.appendChild(progress);
  };

  Widget.prototype.renderQuestionnaire = function (container) {
    var self = this;
    var step = this.state.step;
    var q = QUESTIONS[step];

    this.renderProgress(container);
    container.appendChild(el('div', { class: 'space-16' }));
    container.appendChild(el('h3', { text: q.title }));

    var group = el('div', { class: 'radio', role: 'radiogroup', 'aria-label': q.title });
    var rows = [];
    function onGroupKeydown(e) {
      var key = e.key;
      var idx = rows.indexOf(document.activeElement);
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
        class: 'radioRow',
        role: 'radio',
        'aria-checked': checked ? 'true' : 'false',
        onClick: function () {
          self.setAnswer(q.id, o.value);
        },
      });
      row.appendChild(el('div', { class: 'radioText', text: o.label }));
      row.appendChild(
        el(
          'div',
          { class: 'check', 'aria-hidden': 'true' },
          el('svg', { width: '14', height: '14', viewBox: '0 0 16 16', html: '<path d="M6.3 11.4 3 8.1l1.1-1.1 2.2 2.2 5.6-5.6L13 4.7z" fill="#0b1220"/>' })
        )
      );
      row.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          row.click();
        }
      });
      if (checked) row.tabIndex = 0;
      else row.tabIndex = -1;
      rows.push(row);
      group.appendChild(row);
    });

    container.appendChild(group);

    if (q.helperText) container.appendChild(el('div', { class: 'helper', text: q.helperText }));

    container.appendChild(el('div', { class: 'space-20' }));

    var left = step > 0
      ? el('button', {
          class: 'btn',
          onClick: function () {
            self.setState({ step: Math.max(0, step - 1) });
          },
          text: 'Назад',
        })
      : el('span', { text: '' });

    var next = el('button', {
      class: 'btn primary',
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
      class: 'link',
      href: this.options.manualUrl || '#',
      text: 'Я хочу выбрать тариф самостоятельно',
      onClick: function (e) {
        track(self, 'manual_tariff_selection', {});
        // allow navigation
      },
    });

    container.appendChild(el('div', { class: 'actions' }, left, next, manual));
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
    var tariffId = recommendTariffId(this.state.answers);
    assertValidTariff(tariffId);
    var tariff = tariffById(tariffId);
    var rc = RESULT_COPY[tariffId];

    if (!tariff || !rc) {
      tariffId = 'n3_investor';
      tariff = tariffById(tariffId);
      rc = RESULT_COPY[tariffId];
    }

    container.appendChild(el('h2', { text: rc.title }));
    container.appendChild(el('div', { class: 'space-12' }));
    container.appendChild(el('p', { text: 'Мы подобрали его на основе ваших ответов' }));

    if (rc && Array.isArray(rc.benefits)) {
      var list = el('ul', { class: 'benefits' });
      rc.benefits.slice(0, 3).forEach(function (b) {
        list.appendChild(el('li', { text: b }));
      });
      container.appendChild(list);
    }

    container.appendChild(el('div', { class: 'space-20' }));
    container.appendChild(
      el(
        'div',
        { class: 'actions' },
        el('span', { text: '' }),
        el('button', {
          class: 'btn primary',
          onClick: function () {
            self.openTariff(tariffId);
          },
          text: 'Перейти к тарифу',
        }),
        el('button', {
          class: 'btn',
          onClick: function () {
            self.setState({ showAlternatives: !self.state.showAlternatives });
          },
          text: 'Посмотреть другие тарифы',
        })
      )
    );

    if (this.state.showAlternatives) {
      container.appendChild(el('div', { class: 'space-16' }));
      var others = otherTariffs(tariffId);
      var cards = el('div', { class: 'cards' });
      for (var i = 0; i < others.length; i++) {
        (function (t) {
          var card = el('div', { class: 'tariffCard' });
          card.appendChild(el('div', { class: 'tariffName', text: t.name }));
          card.appendChild(el('div', { class: 'space-12' }));
          card.appendChild(
            el('button', {
              class: 'btn primary',
              onClick: function () {
                self.openTariff(t.id);
              },
              text: 'Перейти к тарифу',
            })
          );
          cards.appendChild(card);
        })(others[i]);
      }
      container.appendChild(cards);
    }
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

