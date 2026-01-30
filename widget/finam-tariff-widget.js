/*!
 * Finam Tariff Widget
 * Self-contained embed widget (no build step).
 * Version: 0.2.1
 */
(function (global) {
  'use strict';

  var VERSION = '0.2.1';

  var DEFAULTS = {
    // 'intro' | 'questionnaire' | 'calculator'
    // (calculator is optional legacy mode; default flow follows the spec)
    initialView: 'intro',
    showTabs: false,
    loadFonts: true,
    shadowDom: true,
    manualUrl: '#',
    tariffLinks: {}, // { [tariffId]: url }
    analytics: true,
    onEvent: null, // (name: string, payload: object) => void
  };

  var TARIFFS = {
    longterm: {
      id: 'longterm',
      name: 'Инвестор',
      description: 'Для спокойного инвестирования и сделок без высокой частоты.',
      features: ['Подходит для редких и средних по частоте сделок', 'Понятные условия без лишних опций', 'Хороший выбор для начала'],
      warnings: [],
      icon: null,
    },
    daily: {
      id: 'daily',
      name: 'Активный трейдер',
      description: 'Для частых операций и активной торговли.',
      features: ['Оптимален при высокой частоте сделок', 'Подходит для активной торговли', 'Удобно, когда сделки — почти каждый день'],
      warnings: [],
      icon: null,
    },
    strateg: {
      id: 'strateg',
      name: 'Сбалансированный',
      description: 'Универсальный вариант, если частота сделок средняя или пока не уверены.',
      features: ['Подходит для большинства сценариев', 'Комфортный “по умолчанию”', 'Хорош, если ответы смешанные'],
      warnings: [],
      icon: null,
    },
    freetrade: {
      id: 'freetrade',
      name: 'Free Trade',
      description: 'Для тех, кто хочет попробовать и разобраться.',
      features: ['Подходит, чтобы “попробовать инвестиции”', 'Простой старт без лишних настроек', 'Можно понять механику на практике'],
      warnings: [],
      icon: null,
    },
    consulting: {
      id: 'consulting',
      name: 'С сопровождением',
      description: 'Если хотите подсказки и поддержку при инвестировании.',
      features: ['Подсказки и сопровождение', 'Помогает, когда важна уверенность', 'Хорошо для новичков и занятых'],
      warnings: [],
      icon: null,
    },
  };

  var QUESTIONS = [
    {
      id: 'goal',
      title: 'Для чего вы планируете инвестировать?',
      options: [
        { value: 'preserve', label: 'Хочу сохранить деньги и понемногу приумножать' },
        { value: 'active', label: 'Планирую активно торговать' },
        { value: 'try', label: 'Хочу попробовать инвестиции и разобраться' },
        { value: 'unsure', label: 'Пока не уверен(а), хочу посмотреть' },
      ],
    },
    {
      id: 'frequency',
      title: 'Как часто вы планируете покупать или продавать активы?',
      options: [
        { value: 'year', label: 'Несколько раз в год' },
        { value: 'month', label: 'Несколько раз в месяц' },
        { value: 'day', label: 'Почти каждый день' },
        { value: 'unknown', label: 'Пока не знаю' },
      ],
    },
    {
      id: 'instruments',
      title: 'Чем вы планируете торговать?',
      options: [
        { value: 'stocks', label: 'Акции и облигации' },
        { value: 'futures', label: 'Фьючерсы / активная торговля' },
        { value: 'currency', label: 'Валюта' },
        { value: 'unknown', label: 'Пока не знаю' },
      ],
    },
    {
      id: 'assistance',
      title: 'Нужна ли вам помощь при инвестировании?',
      options: [
        { value: 'yes', label: 'Да, хочу подсказки и сопровождение' },
        { value: 'sometimes', label: 'Иногда, но в целом сам(а)' },
        { value: 'no', label: 'Нет, всё делаю сам(а)' },
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

  function computeScores(a) {
    // Scoring tuned for "guided questionnaire" flow, low jargon.
    var score = { longterm: 0, daily: 0, strateg: 0, freetrade: 0, consulting: 0 };

    // Q1 Goal
    if (a.goal === 'preserve') {
      score.longterm += 50;
      score.strateg += 20;
    } else if (a.goal === 'active') {
      score.daily += 55;
      score.strateg += 10;
    } else if (a.goal === 'try') {
      score.freetrade += 50;
      score.consulting += 10;
    } else if (a.goal === 'unsure') {
      score.strateg += 35;
      score.freetrade += 20;
    }

    // Q2 Frequency
    if (a.frequency === 'year') score.longterm += 35;
    else if (a.frequency === 'month') score.strateg += 35;
    else if (a.frequency === 'day') score.daily += 45;
    else if (a.frequency === 'unknown') score.strateg += 20;

    // Q3 Instruments
    if (a.instruments === 'stocks') {
      score.longterm += 25;
      score.strateg += 15;
    } else if (a.instruments === 'futures') {
      score.daily += 35;
    } else if (a.instruments === 'currency') {
      score.strateg += 20;
      score.daily += 10;
    } else if (a.instruments === 'unknown') {
      score.strateg += 15;
    }

    // Q4 Assistance
    if (a.assistance === 'yes') score.consulting += 70;
    else if (a.assistance === 'sometimes') score.consulting += 20;

    return score;
  }

  function pickTopTariffs(scores) {
    var list = Object.keys(scores)
      .map(function (k) {
        return { id: k, score: scores[k] };
      })
      .sort(function (a, b) {
        return b.score - a.score;
      });

    if (list.length === 0) return [];
    var top = list[0];
    var second = list[1];

    // "Multiple match case": show 2 if close enough
    var threshold = 12;
    if (second && top.score - second.score <= threshold) return [top.id, second.id];
    return [top.id];
  }

  function estimateMonthlyCost(answers, tariffId) {
    // Логика повторяет xA из текущей реализации
    var o = answers.volume || 0;
    if (o === 0) o = 1000000; // "по среднему"

    var monthly = 0;

    if (tariffId === 'longterm') {
      monthly = (answers.operationBalance === 'onlyBuy' ? 0 : o * 0.2) * 0.0028;
    } else if (tariffId === 'freetrade') {
      monthly = 177 + o * 0.000177;
    } else if (tariffId === 'daily') {
      var d = o > 1000000 ? 0.00029 : 0.0004;
      monthly = 177 + o * d;
    } else if (tariffId === 'strateg') {
      monthly = 200 + o * 0.0004;
    } else {
      monthly = o * 0.0004;
    }

    var comparedTo = '';
    var alt = 0;
    if (tariffId === 'longterm') {
      var d2 = o > 1000000 ? 0.00029 : 0.0004;
      alt = o * d2;
      comparedTo = 'Единый дневной';
    } else {
      alt = o * 0.5 * 0.0028;
      comparedTo = 'Долгосрочный портфель';
    }

    return {
      monthlyCost: Math.round(monthly),
      savings: Math.round(Math.max(0, alt - monthly)),
      comparedTo: comparedTo,
    };
  }

  function ratesByInstrument(type) {
    // Логика повторяет nb из текущей реализации
    var rates = {
      longterm: { buy: 0, sell: 0.0028, monthlyFee: 0 },
      daily: { buy: 0.00035, sell: 0.00035, monthlyFee: 177 },
      strateg: { buy: 0.00035, sell: 0.00035, monthlyFee: 200 },
      freetrade: { buy: 0.000177, sell: 0.000177, monthlyFee: 177 },
      consulting: { buy: 0.0005, sell: 0.0005, monthlyFee: 0 },
    };

    if (type === 'stocks_us') {
      rates.longterm.buy = 0.001;
      rates.longterm.sell = 0.001;
      rates.daily.buy = 0.001;
      rates.daily.sell = 0.001;
      rates.strateg.buy = 0.001;
      rates.strateg.sell = 0.001;
    }

    if (type === 'options' || type === 'futures') {
      rates.longterm.buy = 0.0045;
      rates.longterm.sell = 0.0045;
      rates.daily.buy = 0.0045;
      rates.daily.sell = 0.0045;
    }

    return rates;
  }

  function dealCommission(deal, tariffId) {
    var rates = ratesByInstrument(deal.type);
    var r = deal.isBuy ? rates[tariffId].buy : rates[tariffId].sell;
    return deal.volume * r;
  }

  function totalForTariff(deals, tariffId) {
    var sum = 0;
    for (var i = 0; i < deals.length; i++) sum += dealCommission(deals[i], tariffId);
    var type = deals[0] ? deals[0].type : 'stocks_rf';
    var fee = ratesByInstrument(type)[tariffId].monthlyFee;
    return sum + fee;
  }

  function totalsForAll(deals) {
    return {
      longterm: totalForTariff(deals, 'longterm'),
      daily: totalForTariff(deals, 'daily'),
      strateg: totalForTariff(deals, 'strateg'),
      freetrade: totalForTariff(deals, 'freetrade'),
      consulting: totalForTariff(deals, 'consulting'),
    };
  }

  function cheapestTariff(deals) {
    var totals = totalsForAll(deals);
    var best = 'strateg';
    var bestValue = totals.strateg;
    Object.keys(totals).forEach(function (k) {
      if (totals[k] < bestValue) {
        bestValue = totals[k];
        best = k;
      }
    });
    return { tariff: best, commission: bestValue, totals: totals };
  }

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
      view: initialView === 'calculator' ? 'calculator' : 'questionnaire',
      step: initialStep, // -1 = intro, 0.. = questions, >= QUESTIONS.length = result
      answers: {
        goal: null,
        frequency: null,
        instruments: null,
        assistance: null,
      },
      deals: [],
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
      goal: null,
      frequency: null,
      instruments: null,
      assistance: null,
    };
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

    if (q.id === 'frequency') {
      container.appendChild(el('div', { class: 'helper', text: 'Это поможет учесть комиссии и доступные инструменты' }));
    }

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

  function whyText(answers, tariffId) {
    if (tariffId === 'consulting') return 'Вы указали, что вам важны подсказки и сопровождение — поэтому мы предлагаем вариант с поддержкой.';
    if (tariffId === 'daily') return 'По вашим ответам видно, что вы планируете активную торговлю и частые сделки — для этого лучше подходит тариф для активных операций.';
    if (tariffId === 'freetrade') return 'Вы хотите попробовать инвестиции и разобраться — этот вариант проще для старта и поможет спокойно освоиться.';
    if (tariffId === 'longterm') return 'Вы ориентируетесь на спокойное инвестирование и нечастые операции — поэтому подходит тариф для инвестора.';
    return 'Ваши ответы смешанные или вы пока не уверены — поэтому мы предлагаем универсальный вариант.';
  }

  function benefitsForTariff(tariffId) {
    var t = TARIFFS[tariffId];
    if (!t) return [];
    return (t.features || []).slice(0, 3);
  }

  Widget.prototype.openTariff = function (tariffId) {
    track(this, 'tariff_recommended', { tariff_id: tariffId });
    var url = (this.options.tariffLinks && this.options.tariffLinks[tariffId]) || '#';
    try {
      window.location.href = url;
    } catch (_) {}
  };

  Widget.prototype.renderResultScreen = function (container) {
    var self = this;
    var answers = this.state.answers;
    var scores = computeScores(answers);
    var top = pickTopTariffs(scores);

    if (top.length === 0) top = ['strateg'];

    container.appendChild(el('div', { class: 'pill', text: 'Мы подобрали его на основе ваших ответов' }));
    container.appendChild(el('div', { class: 'space-16' }));

    // Multiple match: show 2 cards, do not force
    if (top.length > 1) {
      container.appendChild(el('div', { class: 'resultTitle', text: 'Вам могут подойти два тарифа' }));
      container.appendChild(el('div', { class: 'space-12' }));

      var cards = el('div', { class: 'cards' });
      top.slice(0, 2).forEach(function (tid) {
        var card = el('div', { class: 'tariffCard' });
        card.appendChild(el('div', { class: 'tariffName', text: '«' + TARIFFS[tid].name + '»' }));
        var ul = el('ul', { class: 'benefits' });
        benefitsForTariff(tid).slice(0, 2).forEach(function (b) {
          ul.appendChild(el('li', { text: b }));
        });
        card.appendChild(ul);
        card.appendChild(el('div', { class: 'space-16' }));
        card.appendChild(
          el('button', {
            class: 'btn primary',
            onClick: function () {
              self.openTariff(tid);
            },
            text: 'Выбрать тариф',
          })
        );
        cards.appendChild(card);
      });
      container.appendChild(cards);

      container.appendChild(el('div', { class: 'space-20' }));
      container.appendChild(
        el(
          'div',
          { class: 'actions' },
          el('button', {
            class: 'btn',
            onClick: function () {
              self.resetQuestionnaire();
            },
            text: 'Пройти заново',
          }),
          el('a', { class: 'link', href: this.options.manualUrl || '#', text: 'Посмотреть другие тарифы' })
        )
      );

      return;
    }

    var tariffId = top[0];
    container.appendChild(el('div', { class: 'resultTitle', text: 'Вам подойдёт тариф «' + TARIFFS[tariffId].name + '»' }));
    container.appendChild(el('div', { class: 'space-12' }));
    container.appendChild(el('div', { class: 'why', text: whyText(answers, tariffId) }));

    var benefits = benefitsForTariff(tariffId);
    if (benefits.length) {
      var list = el('ul', { class: 'benefits' });
      benefits.forEach(function (b) {
        list.appendChild(el('li', { text: b }));
      });
      container.appendChild(list);
    }

    container.appendChild(el('div', { class: 'space-20' }));
    container.appendChild(
      el(
        'div',
        { class: 'actions' },
        el('button', {
          class: 'btn primary',
          onClick: function () {
            self.openTariff(tariffId);
          },
          text: 'Перейти к тарифу',
        }),
        el('a', { class: 'link', href: this.options.manualUrl || '#', text: 'Посмотреть другие тарифы' }),
        el('button', {
          class: 'btn',
          onClick: function () {
            self.resetQuestionnaire();
          },
          text: 'Пройти заново',
        })
      )
    );
  };

  Widget.prototype.renderResultScreen = function (container) {
    var self = this;
    var card = this.renderResult();

    var actions = el('div', { class: 'actions' });
    actions.appendChild(
      el('button', {
        class: 'btn',
        onClick: function () {
          self.setState({ step: Math.max(0, QUESTIONS.length - 1) });
        },
        text: 'Назад',
      })
    );
    actions.appendChild(
      el('button', {
        class: 'btn primary',
        onClick: function () {
          self.resetQuestionnaire();
        },
        text: 'Пройти заново',
      })
    );
    card.appendChild(actions);

    container.appendChild(card);
  };

  Widget.prototype.renderCalculator = function (container) {
    var self = this;
    var card = el('div', { class: 'card', style: 'margin-top:14px' });

    var head = el('div', { class: 'calcHead' });
    head.appendChild(el('div', { class: 'qtitle', text: 'Калькулятор комиссий' }));
    head.appendChild(
      el('button', {
        class: 'btn primary',
        onClick: function () {
          self.state.deals.push({ type: 'stocks_rf', isBuy: true, volume: 100000 });
          self.render();
        },
        text: 'Добавить сделку',
      })
    );
    card.appendChild(head);
    card.appendChild(el('div', { class: 'qdesc', text: 'Добавьте сделки и сравните итоговую стоимость по тарифам.' }));

    var table = el('table', { class: 'table' });
    var thead = el('thead', null);
    thead.appendChild(
      el(
        'tr',
        null,
        el('th', { text: 'Инструмент' }),
        el('th', { text: 'Тип' }),
        el('th', { text: 'Объем (₽)' }),
        el('th', { text: '' })
      )
    );
    table.appendChild(thead);

    var tbody = el('tbody', null);
    this.state.deals.forEach(function (d, idx) {
      var tr = el('tr', null);

      var selType = el(
        'select',
        {
          onChange: function (e) {
            d.type = e.target.value;
            self.render();
          },
        },
        el('option', { value: 'stocks_rf', text: 'Акции/облигации РФ' }),
        el('option', { value: 'stocks_us', text: 'Акции США' }),
        el('option', { value: 'options', text: 'Опционы' }),
        el('option', { value: 'futures', text: 'Фьючерсы' })
      );
      selType.value = d.type;

      var selSide = el(
        'select',
        {
          onChange: function (e) {
            d.isBuy = e.target.value === 'buy';
            self.render();
          },
        },
        el('option', { value: 'buy', text: 'Покупка' }),
        el('option', { value: 'sell', text: 'Продажа' })
      );
      selSide.value = d.isBuy ? 'buy' : 'sell';

      var inpVol = el('input', {
        type: 'number',
        value: String(d.volume || 0),
        onInput: function (e) {
          var v = Number(e.target.value || 0);
          d.volume = isFinite(v) ? v : 0;
          self.render();
        },
        min: '0',
      });

      tr.appendChild(el('td', null, selType));
      tr.appendChild(el('td', null, selSide));
      tr.appendChild(el('td', null, inpVol));
      tr.appendChild(
        el(
          'td',
          null,
          el('button', {
            class: 'btn',
            onClick: function () {
              self.state.deals.splice(idx, 1);
              self.render();
            },
            text: 'Удалить',
          })
        )
      );

      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    card.appendChild(table);

    if (this.state.deals.length === 0) {
      card.appendChild(el('div', { class: 'qdesc', style: 'margin-top:12px', text: 'Добавьте сделки, чтобы увидеть сравнение комиссий.' }));
    } else {
      var best = cheapestTariff(this.state.deals);
      var totals = best.totals;

      var res = el('div', { class: 'result' });
      res.appendChild(el('div', { class: 'badge', text: 'Самый выгодный по расчету' }));
      res.appendChild(el('div', { class: 'tariffName', text: TARIFFS[best.tariff].name }));
      res.appendChild(el('div', { class: 'tariffDesc', text: 'Итоговая оценка: ' + formatRUB(best.commission) + ' / мес' }));

      var grid = el('div', { class: 'kpis' });
      Object.keys(TARIFFS).forEach(function (tid) {
        grid.appendChild(
          el(
            'div',
            { class: 'kpi' },
            el('div', { class: 'kpiT', text: TARIFFS[tid].name }),
            el('div', { class: 'kpiV', text: formatRUB(Math.round(totals[tid])) })
          )
        );
      });
      res.appendChild(grid);
      card.appendChild(res);
    }

    container.appendChild(card);
  };

  Widget.prototype.render = function () {
    var host = this.dom.host;
    while (host.firstChild) host.removeChild(host.firstChild);

    var wrap = el('div', { class: 'wrap' });

    if (this.state.view === 'calculator') {
      this.renderCalculator(wrap);
    } else {
      if (this.state.step < 0) {
        this.renderIntro(wrap);
      } else if (this.state.step >= QUESTIONS.length) {
        this.renderResultScreen(wrap);
      } else {
        this.renderQuestionnaire(wrap);
      }
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

