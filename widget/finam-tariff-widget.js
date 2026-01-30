/*!
 * Finam Tariff Widget
 * Self-contained embed widget (no build step).
 * Version: 0.1.0
 */
(function (global) {
  'use strict';

  var VERSION = '0.1.0';

  var DEFAULTS = {
    initialView: 'questionnaire', // 'questionnaire' | 'calculator'
    showTabs: true,
    loadFonts: true,
    shadowDom: true,
  };

  var TARIFFS = {
    longterm: {
      id: 'longterm',
      name: 'Долгосрочный портфель',
      description: 'Идеален для инвесторов, которые покупают и держат. 0% комиссии за покупку.',
      buyCommission: 0,
      sellCommission: 0.0028,
      monthlyFee: 0,
      features: ['0% комиссия за покупку акций и облигаций РФ', 'Нет абонентской платы', 'Подходит для стратегии Buy & Hold'],
      warnings: ['Высокая комиссия за продажу (0.28%)', 'Не подходит для активной торговли'],
      icon: null,
    },
    daily: {
      id: 'daily',
      name: 'Единый дневной',
      description: 'Для активных трейдеров. Чем больше оборот, тем ниже комиссия.',
      buyCommission: 'от 0.018%',
      sellCommission: 'от 0.018%',
      monthlyFee: 177,
      features: ['Комиссия снижается с ростом оборота', 'Одинаковая комиссия на покупку и продажу', 'Выгодно при обороте от 100 000 ₽ в день'],
      warnings: [],
      icon: null,
    },
    strateg: {
      id: 'strateg',
      name: 'Стратег',
      description: 'Сбалансированный тариф для регулярной, но не частой торговли.',
      buyCommission: 'от 0.018%',
      sellCommission: 'от 0.018%',
      monthlyFee: 200,
      features: ['Универсальные условия', 'Подходит для среднесрочных стратегий'],
      warnings: [],
      icon: null,
    },
    freetrade: {
      id: 'freetrade',
      name: 'Free Trade',
      description: 'Тест-драйв для новичков. Специальные условия на первые 30 дней.',
      buyCommission: 0.000177,
      sellCommission: 0.000177,
      monthlyFee: 177,
      features: ['Минимальные комиссии', 'Идеально для обучения', 'Фиксированная плата 177 ₽/мес'],
      warnings: ['Действует только 30 дней', 'Автоматическая смена тарифа после пробного периода'],
      icon: null,
    },
    consulting: {
      id: 'consulting',
      name: 'Единый консультационный',
      description: 'Для тех, кому нужны инвестиционные идеи и поддержка экспертов.',
      buyCommission: 'Индивидуально',
      sellCommission: 'Индивидуально',
      monthlyFee: 0,
      features: ['Доступ к аналитике и идеям', 'Помощь в принятии решений', 'Персональный подход'],
      warnings: ['Комиссии выше, чем на самостоятельных тарифах'],
      icon: null,
    },
  };

  var QUESTIONS = [
    {
      id: 'experience',
      title: 'Ваш опыт инвестирования?',
      options: [
        { value: 'beginner', label: 'Я только начинаю', description: 'Делаю первые шаги' },
        { value: 'intermediate', label: 'Уже есть опыт', description: 'Разбираюсь в основах' },
        { value: 'experienced', label: 'Опытный инвестор', description: 'Хорошо понимаю рынок' },
        { value: 'pro', label: 'Профессионал', description: 'Торговля — моя работа' },
      ],
    },
    {
      id: 'strategy',
      title: 'Ваша торговая стратегия?',
      options: [
        { value: 'longterm', label: 'Долгосрочное инвестирование', description: 'Купил и держу' },
        { value: 'mediumterm', label: 'Среднесрочная торговля', description: 'Сделки раз в месяц' },
        { value: 'active', label: 'Активная торговля', description: 'Несколько сделок в неделю' },
        { value: 'intraday', label: 'Интрадей', description: 'Торговля внутри дня' },
        { value: 'undecided', label: 'Пока не определился', description: 'Хочу попробовать разное' },
      ],
    },
    {
      id: 'frequency',
      title: 'Как часто планируете совершать сделки?',
      options: [
        { value: 3, label: 'Редко', description: '1-5 сделок в месяц' },
        { value: 15, label: 'Иногда', description: '5-20 сделок в месяц' },
        { value: 35, label: 'Регулярно', description: '20-50 сделок в месяц' },
        { value: 75, label: 'Очень часто', description: '50-100 сделок в месяц' },
        { value: 150, label: 'Постоянно', description: '100+ сделок в месяц' },
      ],
    },
    {
      id: 'volume',
      title: 'Предполагаемый месячный оборот?',
      description: 'Сумма всех покупок и продаж',
      options: [
        { value: 50000, label: 'До 100 000 ₽' },
        { value: 300000, label: '100к - 500к ₽' },
        { value: 750000, label: '500к - 1 млн ₽' },
        { value: 3000000, label: '1 млн - 5 млн ₽' },
        { value: 10000000, label: 'Более 5 млн ₽' },
        { value: 0, label: 'Затрудняюсь ответить', description: 'Посчитаем по среднему' },
      ],
    },
    {
      id: 'operationBalance',
      title: 'Баланс покупок и продаж?',
      description: 'Например: купили на 100к, продали на 20к = больше покупок',
      options: [
        { value: 'onlyBuy', label: 'Только покупать', description: 'Накопление портфеля' },
        { value: 'moreBuy', label: 'Больше покупать', description: 'Покупок > Продаж' },
        { value: 'equal', label: 'Примерно поровну', description: 'Покупки ≈ Продажи' },
        { value: 'moreSell', label: 'Больше продавать', description: 'Продаж > Покупок' },
      ],
    },
    {
      id: 'needConsulting',
      title: 'Нужна ли помощь экспертов?',
      options: [
        { value: 'yes', label: 'Да, нужны идеи', description: 'Хочу получать рекомендации' },
        { value: 'maybe', label: 'Возможно иногда', description: 'Буду думать' },
        { value: 'no', label: 'Нет, я сам', description: 'Принимаю решения самостоятельно' },
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

  function computeScores(a) {
    // Логика повторяет vA из текущей реализации
    var score = { longterm: 0, daily: 0, strateg: 0, freetrade: 0, consulting: 0 };

    if (a.experience === 'beginner') {
      score.freetrade += 30;
      score.consulting += 20;
    } else if (a.experience === 'pro') {
      score.daily += 20;
    }

    if (a.strategy === 'longterm') score.longterm += 50;
    else if (a.strategy === 'active' || a.strategy === 'intraday') score.daily += 50;
    else if (a.strategy === 'mediumterm') score.strateg += 40;
    else if (a.strategy === 'undecided') score.freetrade += 40;

    if (a.operationBalance === 'onlyBuy' || a.operationBalance === 'moreBuy') {
      score.longterm += 40;
    } else if (a.operationBalance === 'equal' || a.operationBalance === 'moreSell') {
      score.daily += 30;
      score.strateg += 25;
    }

    if (a.frequency <= 5) score.longterm += 30;
    else if (a.frequency > 20) score.daily += 40;
    else score.strateg += 30;

    if (a.needConsulting === 'yes') score.consulting += 100;

    if (a.volume > 5000000) score.daily += 20;

    return score;
  }

  function pickBestTariff(scores) {
    var best = 'strateg';
    var bestScore = -1;
    Object.keys(scores).forEach(function (k) {
      if (scores[k] > bestScore) {
        bestScore = scores[k];
        best = k;
      }
    });
    return TARIFFS[best];
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
      /* Neutral corporate (Finam-like) defaults. You can override via CSS variables on the container:
         --ftw-primary, --ftw-bg, --ftw-card, --ftw-text, --ftw-muted, --ftw-border, --ftw-radius, --ftw-shadow */
      '.ftw{--ftw-bg:transparent;--ftw-card:#fff;--ftw-text:#0b1220;--ftw-muted:#5b667a;--ftw-border:#e6eaf2;--ftw-primary:#0b5fff;--ftw-danger:#d50000;--ftw-radius:16px;--ftw-shadow:0 12px 30px rgba(11,18,32,.10);--ftw-shadow-sm:0 6px 16px rgba(11,18,32,.08);font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;color:var(--ftw-text)}' +
      '.ftw *{box-sizing:border-box}' +
      '.ftw .wrap{width:100%;max-width:980px;margin:0 auto;background:var(--ftw-bg);padding:0}' +
      '.ftw .card{background:var(--ftw-card);border:1px solid var(--ftw-border);border-radius:var(--ftw-radius);box-shadow:var(--ftw-shadow);padding:20px}' +
      '.ftw .row{display:flex;gap:12px;align-items:center;flex-wrap:wrap}' +
      '.ftw .title{font-size:22px;line-height:1.25;font-weight:800;margin:0}' +
      '.ftw .subtitle{margin-top:10px;color:var(--ftw-muted);font-size:14px;line-height:1.55;font-weight:500}' +
      '.ftw .tabs{display:flex;gap:8px;margin-top:16px}' +
      '.ftw .tab{border:1px solid var(--ftw-border);background:#f6f8fc;border-radius:999px;padding:10px 12px;font-weight:700;font-size:13px;cursor:pointer;color:var(--ftw-text)}' +
      '.ftw .tab:hover{background:#eef3ff}' +
      '.ftw .tab[aria-selected="true"]{background:rgba(11,95,255,.10);border-color:rgba(11,95,255,.25);color:var(--ftw-primary)}' +
      '.ftw .progress{margin-top:16px;height:8px;border-radius:999px;overflow:hidden;background:#eef2f8}' +
      '.ftw .bar{height:100%;background:var(--ftw-primary);width:0%}' +
      '.ftw .qhead{margin-top:10px}' +
      '.ftw .qtitle{font-weight:800;font-size:16px;line-height:1.35}' +
      '.ftw .qdesc{margin-top:6px;color:var(--ftw-muted);font-size:13px;font-weight:500;line-height:1.55}' +
      '.ftw .grid{margin-top:14px;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}' +
      '@media (max-width:640px){.ftw .grid{grid-template-columns:1fr}}' +
      '.ftw .opt{border:1px solid var(--ftw-border);background:#fff;border-radius:14px;padding:14px;cursor:pointer;box-shadow:var(--ftw-shadow-sm);transition:transform .12s ease, box-shadow .12s ease, border-color .12s ease, background .12s ease}' +
      '.ftw .opt:hover{transform:translateY(-1px);border-color:rgba(11,95,255,.35);background:#fbfdff}' +
      '.ftw .opt[aria-pressed="true"]{border-color:rgba(11,95,255,.45);box-shadow:0 10px 22px rgba(11,95,255,.12)}' +
      '.ftw .optL{font-weight:800}' +
      '.ftw .optD{margin-top:6px;color:var(--ftw-muted);font-weight:500;font-size:12px;line-height:1.45}' +
      '.ftw .actions{display:flex;gap:10px;justify-content:flex-end;align-items:center;margin-top:16px;flex-wrap:wrap}' +
      '.ftw .btn{border:1px solid var(--ftw-border);border-radius:12px;background:#fff;cursor:pointer;padding:10px 14px;font-weight:700;font-size:13px;transition:background .12s ease,border-color .12s ease,transform .12s ease}' +
      '.ftw .btn:hover{background:#f6f8fc}' +
      '.ftw .btn.primary{background:var(--ftw-primary);border-color:var(--ftw-primary);color:#fff}' +
      '.ftw .btn.primary:hover{background:#0a57e8}' +
      '.ftw .btn:disabled{opacity:.55;cursor:not-allowed}' +
      '.ftw .result{margin-top:14px}' +
      '.ftw .badge{display:inline-flex;gap:8px;align-items:center;background:rgba(11,95,255,.10);border:1px solid rgba(11,95,255,.20);border-radius:999px;padding:7px 10px;font-weight:700;font-size:12px;color:var(--ftw-primary)}' +
      '.ftw .tariffName{margin-top:12px;font-size:18px;font-weight:800}' +
      '.ftw .tariffDesc{margin-top:6px;color:var(--ftw-muted);font-weight:500;font-size:13px;line-height:1.55}' +
      '.ftw .kpis{margin-top:14px;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}' +
      '@media (max-width:640px){.ftw .kpis{grid-template-columns:1fr}}' +
      '.ftw .kpi{border:1px solid var(--ftw-border);border-radius:14px;padding:14px;background:#fbfdff}' +
      '.ftw .kpiT{font-weight:700;font-size:12px;color:var(--ftw-muted)}' +
      '.ftw .kpiV{margin-top:8px;font-weight:800;font-size:18px}' +
      '.ftw .list{margin-top:12px;padding-left:18px;color:var(--ftw-text)}' +
      '.ftw .list li{margin:6px 0;color:var(--ftw-muted);font-weight:500;line-height:1.55}' +
      '.ftw .warn{margin-top:12px;border:1px solid rgba(255,193,7,.45);border-radius:14px;padding:14px;background:rgba(255,193,7,.12)}' +
      '.ftw .warnT{font-weight:800;font-size:12px}' +
      '.ftw .calcHead{display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px}' +
      '.ftw .table{width:100%;border-collapse:separate;border-spacing:0;margin-top:12px}' +
      '.ftw .table th,.ftw .table td{border-bottom:1px solid var(--ftw-border);padding:10px;font-weight:600;font-size:12px;background:transparent;vertical-align:top}' +
      '.ftw .table th{font-weight:700;color:var(--ftw-muted)}' +
      '.ftw .table tr:last-child td{border-bottom:none}' +
      '.ftw select,.ftw input{border:1px solid var(--ftw-border);border-radius:12px;padding:9px 10px;font-weight:600;background:#fff;width:100%}' +
      '.ftw select:focus,.ftw input:focus{outline:none;border-color:rgba(11,95,255,.45);box-shadow:0 0 0 4px rgba(11,95,255,.12)}' +
      '.ftw .mini{font-size:11px;color:var(--ftw-muted);font-weight:500}' +
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
      view: this.options.initialView === 'calculator' ? 'calculator' : 'questionnaire',
      step: 0,
      answers: {
        experience: null,
        strategy: null,
        frequency: null,
        volume: null,
        operationBalance: null,
        needConsulting: null,
      },
      deals: [],
    };

    this.render();
  }

  Widget.prototype.setState = function (patch) {
    for (var k in patch) this.state[k] = patch[k];
    this.render();
  };

  Widget.prototype.setAnswer = function (id, value) {
    this.state.answers[id] = value;
    this.render();
  };

  Widget.prototype.canNext = function () {
    var q = QUESTIONS[this.state.step];
    return q && this.state.answers[q.id] != null;
  };

  Widget.prototype.resetQuestionnaire = function () {
    this.state.step = 0;
    this.state.answers = {
      experience: null,
      strategy: null,
      frequency: null,
      volume: null,
      operationBalance: null,
      needConsulting: null,
    };
    this.render();
  };

  Widget.prototype.renderHeader = function (container) {
    var self = this;
    var head = el('div', { class: 'card' });
    head.appendChild(
      el('div', { class: 'title', text: 'Подбор тарифа и расчет комиссий' })
    );
    head.appendChild(
      el('div', {
        class: 'subtitle',
        text: 'Пройдите короткий опрос или добавьте сделки в калькулятор — виджет подскажет, какой тариф может быть выгоднее.',
      })
    );

    if (this.options.showTabs) {
      var tabs = el('div', { class: 'tabs' });
      var tabQ = el('button', {
        class: 'tab',
        'aria-selected': this.state.view === 'questionnaire' ? 'true' : 'false',
        onClick: function () {
          self.setState({ view: 'questionnaire' });
        },
        text: 'Опрос',
      });
      var tabC = el('button', {
        class: 'tab',
        'aria-selected': this.state.view === 'calculator' ? 'true' : 'false',
        onClick: function () {
          self.setState({ view: 'calculator' });
        },
        text: 'Калькулятор',
      });
      tabs.appendChild(tabQ);
      tabs.appendChild(tabC);
      head.appendChild(tabs);
    }

    container.appendChild(head);
  };

  Widget.prototype.renderQuestionnaire = function (container) {
    var self = this;
    var step = this.state.step;
    var q = QUESTIONS[step];

    var card = el('div', { class: 'card', style: 'margin-top:14px' });

    var progress = el('div', { class: 'progress' }, el('div', { class: 'bar' }));
    progress.querySelector('.bar').style.width = Math.round(((step + 1) / QUESTIONS.length) * 100) + '%';
    card.appendChild(progress);

    var qhead = el('div', { class: 'qhead' });
    qhead.appendChild(el('div', { class: 'qtitle', text: q.title }));
    if (q.description) qhead.appendChild(el('div', { class: 'qdesc', text: q.description }));
    card.appendChild(qhead);

    var grid = el('div', { class: 'grid' });
    q.options.forEach(function (o) {
      var pressed = self.state.answers[q.id] === o.value;
      var b = el('button', {
        class: 'opt',
        'aria-pressed': pressed ? 'true' : 'false',
        onClick: function () {
          self.setAnswer(q.id, o.value);
        },
      });
      b.appendChild(el('div', { class: 'optL', text: o.label }));
      if (o.description) b.appendChild(el('div', { class: 'optD', text: o.description }));
      grid.appendChild(b);
    });
    card.appendChild(grid);

    var actions = el('div', { class: 'actions' });

    var back = el('button', {
      class: 'btn',
      disabled: step === 0,
      onClick: function () {
        self.setState({ step: Math.max(0, step - 1) });
      },
      text: 'Назад',
    });

    var nextText = step === QUESTIONS.length - 1 ? 'Показать результат' : 'Далее';
    var next = el('button', {
      class: 'btn primary',
      disabled: !self.canNext(),
      onClick: function () {
        if (step < QUESTIONS.length - 1) self.setState({ step: step + 1 });
        else self.setState({ step: QUESTIONS.length });
      },
      text: nextText,
    });

    actions.appendChild(back);
    actions.appendChild(next);
    card.appendChild(actions);

    container.appendChild(card);
  };

  Widget.prototype.renderResult = function () {
    var answers = this.state.answers;
    var scores = computeScores(answers);
    var tariff = pickBestTariff(scores);
    var est = estimateMonthlyCost(answers, tariff.id);

    var card = el('div', { class: 'card result' });
    card.appendChild(el('div', { class: 'badge', text: 'Рекомендованный тариф' }));
    card.appendChild(el('div', { class: 'tariffName', text: tariff.name }));
    card.appendChild(el('div', { class: 'tariffDesc', text: tariff.description }));

    var kpis = el('div', { class: 'kpis' });
    kpis.appendChild(
      el(
        'div',
        { class: 'kpi' },
        el('div', { class: 'kpiT', text: 'Оценка стоимости / мес' }),
        el('div', { class: 'kpiV', text: formatRUB(est.monthlyCost) })
      )
    );
    kpis.appendChild(
      el(
        'div',
        { class: 'kpi' },
        el('div', { class: 'kpiT', text: 'Потенциальная экономия' }),
        el('div', { class: 'kpiV', text: formatRUB(est.savings) }),
        el('div', { class: 'mini', text: 'по сравнению с: ' + est.comparedTo })
      )
    );
    card.appendChild(kpis);

    var ul = el('ul', { class: 'list' });
    tariff.features.forEach(function (f) {
      ul.appendChild(el('li', { text: f }));
    });
    card.appendChild(ul);

    if (tariff.warnings && tariff.warnings.length) {
      var warn = el('div', { class: 'warn' });
      warn.appendChild(el('div', { class: 'warnT', text: 'Важно' }));
      var wul = el('ul', { class: 'list', style: 'margin-top:8px' });
      tariff.warnings.forEach(function (w) {
        wul.appendChild(el('li', { text: w }));
      });
      warn.appendChild(wul);
      card.appendChild(warn);
    }

    return card;
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
    this.renderHeader(wrap);

    if (this.state.view === 'calculator') {
      this.renderCalculator(wrap);
    } else {
      if (this.state.step >= QUESTIONS.length) {
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

