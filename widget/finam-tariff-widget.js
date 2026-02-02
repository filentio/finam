/*!
 * Finam Tariff Widget
 * Self-contained embed widget (no build step).
 * Version: 1.0.16
 */
(function (global) {
  'use strict';

  var VERSION = '1.0.16';
  var FLOW_VERSION = 'tariff_picker_v1';

  var DEFAULTS = {
    // 'form' | 'result'
    initialView: 'form',
    loadFonts: false, // no external dependencies by default
    shadowDom: true,
    analytics: true,
    onEvent: null, // (name: string, payload: object) => void
    // 'auto' | '' | null | false | string (URL)
    // - 'auto' tries to load /assets/premium-visual.svg next to the script host (jsDelivr/raw/local)
    // - empty/false disables the image and keeps abstract gradients
    premiumVisualImageUrl: 'auto',
    // Feedback (right block on result screen)
    feedbackEnabled: true,
    feedbackEndpoint: '', // optional URL for POSTing feedback JSON
    userId: null, // optional
    abGroup: null, // optional
    flowVersion: FLOW_VERSION, // analytics/feedback versioning
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

  function getCurrentScriptSrc() {
    try {
      if (document.currentScript && document.currentScript.src) return document.currentScript.src;
    } catch (_) {}
    try {
      var scripts = document.getElementsByTagName('script');
      for (var i = scripts.length - 1; i >= 0; i--) {
        var src = scripts[i] && scripts[i].src ? String(scripts[i].src) : '';
        if (src && src.indexOf('finam-tariff-widget.js') !== -1) return src;
      }
    } catch (_) {}
    return '';
  }

  function getSessionId() {
    try {
      if (global.crypto && typeof global.crypto.randomUUID === 'function') return global.crypto.randomUUID();
    } catch (_) {}
    // Fallback UUIDv4-ish
    var s = '';
    for (var i = 0; i < 36; i++) {
      if (i === 8 || i === 13 || i === 18 || i === 23) s += '-';
      else {
        var r = (Math.random() * 16) | 0;
        if (i === 14) r = 4;
        if (i === 19) r = (r & 0x3) | 0x8;
        s += r.toString(16);
      }
    }
    return s;
  }

  function getPlatformHint() {
    try {
      if (global.matchMedia && global.matchMedia('(max-width: 860px)').matches) return 'mobile';
    } catch (_) {}
    return 'web';
  }

  function postJsonWithRetry(url, payload, attempts, cb) {
    var max = typeof attempts === 'number' ? attempts : 3;
    var attempt = 0;
    function done(ok) {
      try {
        if (typeof cb === 'function') cb(!!ok);
      } catch (_) {}
    }
    function once() {
      attempt++;
      try {
        // Prefer fetch if available, but don't rely on it.
        if (typeof fetch === 'function') {
          fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          })
            .then(function (r) {
              if (r && r.ok) return done(true);
              retry();
            })
            .catch(function () {
              retry();
            });
          return;
        }
      } catch (_) {}

      // XHR fallback (very compatible)
      try {
        var xhr = new XMLHttpRequest();
        xhr.open('POST', url, true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.onreadystatechange = function () {
          if (xhr.readyState !== 4) return;
          if (xhr.status >= 200 && xhr.status < 300) done(true);
          else retry();
        };
        xhr.send(JSON.stringify(payload));
        return;
      } catch (_) {}

      retry();
    }
    function retry() {
      if (attempt >= max) return done(false);
      var delay = 500 * Math.pow(2, attempt - 1);
      try {
        setTimeout(once, delay);
      } catch (_) {
        done(false);
      }
    }
    once();
  }

  function guessRepoBaseFromScriptSrc(src) {
    if (!src) return '';
    var clean = String(src).split('#')[0].split('?')[0];

    // jsDelivr: https://cdn.jsdelivr.net/gh/<user>/<repo>@<ref>/widget/finam-tariff-widget.js
    var m = clean.match(/^(https?:\/\/cdn\.jsdelivr\.net\/gh\/[^\/]+\/[^@\/]+@[^\/]+)\/.+$/i);
    if (m && m[1]) return m[1] + '/';

    // Raw GitHub: https://raw.githubusercontent.com/<user>/<repo>/<ref>/widget/finam-tariff-widget.js
    var m2 = clean.match(/^(https?:\/\/raw\.githubusercontent\.com\/[^\/]+\/[^\/]+\/[^\/]+)\/.+$/i);
    if (m2 && m2[1]) return m2[1] + '/';

    // Local or other host: strip /widget/finam-tariff-widget.js
    return clean.replace(/\/widget\/finam-tariff-widget\.js$/i, '/');
  }

  function defaultPremiumVisualUrl() {
    var base = guessRepoBaseFromScriptSrc(getCurrentScriptSrc());
    if (!base) return '';
    return base + 'assets/premium-visual.svg';
  }

  function safeCssUrl(u) {
    // Avoid breaking out of url("...") context.
    return String(u).replace(/"/g, '%22');
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
      ':host{all:initial;display:block;width:100%}' +
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
      /* Card H2 (match tariff card): 40/48/700/-0.384 */
      '.ftw .tw-h2{font-size:32px;line-height:38px;font-weight:700;letter-spacing:-0.384px;color:rgb(235, 235, 242);margin:0}' +
      '.ftw .tw-heroTitle{font-size:36px;line-height:42px;font-weight:800;letter-spacing:-0.384px;color:rgb(235, 235, 242);margin:0}' +
      '@media (max-width:860px){.ftw .tw-heroTitle{font-size:30px;line-height:36px}}' +
      '.ftw .tw-secondaryText{font-size:16px;line-height:20px;font-weight:400;letter-spacing:-0.096px;color:var(--ui-text-inverse-secondary);margin-top:8px}' +
      '.ftw .tw-meta{font-size:12px;line-height:16px;font-weight:700;color:var(--ui-text-inverse-secondary);margin:0 0 10px 0}' +
      /* One-column body (used for questions/results to avoid layout jumps) */
      '.ftw .tw-one-col{padding:24px}' +
      /* Body grid */
      '.ftw .tw-two-col{display:grid;grid-template-columns:1.05fr 0.95fr;gap:24px;align-items:stretch;padding:24px}' +
      '@media (max-width:860px){.ftw .tw-two-col{grid-template-columns:1fr}.ftw .tw-premium-visual{display:none}}' +
      /* Background image mode (question/result): image is part of whole module background */
      '.ftw .tw-shell-bg{position:relative}' +
      '.ftw .tw-shell-bg::before{content:\"\";position:absolute;inset:0;z-index:0;background-image:var(--tw-bg-img, none);background-repeat:no-repeat;background-position:center;background-size:var(--tw-bg-size, 820px auto);opacity:0.92;filter:saturate(1.06) contrast(1.06);pointer-events:none}' +
      '.ftw .tw-shell-bg > *{position:relative;z-index:1}' +
      '@media (max-width:860px){.ftw .tw-shell-bg::before{background-size:680px auto}}' +
      /* Premium visual */
      '.ftw .tw-premium-visual{border-radius:var(--ui-radius-shell);background-color:var(--ui-bg-dark);box-shadow:inset 0 0 0 1px rgba(255,255,255,0.06);position:relative;min-height:260px;overflow:hidden}' +
      '.ftw .tw-premium-img{position:absolute;inset:0;z-index:0;background-size:cover;background-position:right center;background-repeat:no-repeat;opacity:0.92;filter:saturate(1.05) contrast(1.05);transform:scale(1.03)}' +
      '.ftw .tw-premium-overlay{position:absolute;inset:0;z-index:1;background-image:var(--ui-gradient-gold-soft), var(--ui-gradient-gold-edge);pointer-events:none}' +
      '.ftw .tw-premium-visual::after{content:\"\";position:absolute;z-index:2;inset:-40% -20%;transform:rotate(12deg);background:linear-gradient(90deg,transparent 0%,rgba(255,255,255,0.06) 45%,transparent 70%);opacity:0.8;pointer-events:none}' +
      /* Inner card */
      '.ftw .tw-card{border-radius:var(--ui-radius-card);background:rgba(255,255,255,0.04);border:1px solid var(--ui-border-on-dark);box-shadow:var(--ui-shadow-cardMid);padding:24px}' +
      /* Solid card (questions/results) to keep readability over visuals */
      '.ftw .tw-cardSolid{background:rgba(21,21,25,0.92);border:1px solid rgba(255,255,255,0.14);box-shadow:var(--ui-shadow-cardDark)}' +
      /* Feedback block (right side on result) */
      '.ftw .tw-feedback{border-radius:var(--ui-radius-shell);background:rgba(255,255,255,0.04);border:1px solid var(--ui-border-on-dark);box-shadow:var(--ui-shadow-cardMid);padding:24px;min-height:260px}' +
      '.ftw .tw-feedbackTitle{font-size:18px;line-height:22px;font-weight:800;letter-spacing:-0.16px;color:var(--ui-text-inverse);margin:0}' +
      '.ftw .tw-feedbackSub{font-size:14px;line-height:18px;font-weight:500;color:var(--ui-text-inverse-secondary);margin-top:8px}' +
      '.ftw .tw-stars{display:flex;gap:10px;margin-top:16px;flex-wrap:wrap}' +
      '.ftw .tw-starBtn{width:44px;height:44px;border-radius:12px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);cursor:pointer;display:flex;align-items:center;justify-content:center;transition:background .15s ease,border-color .15s ease,transform .05s ease}' +
      '.ftw .tw-starBtn:active{transform:translateY(1px)}' +
      '.ftw .tw-star{font-size:22px;line-height:1;color:rgba(255,255,255,0.22)}' +
      '.ftw .tw-starBtn.is-on .tw-star{color:var(--ui-brand)}' +
      '.ftw .tw-starBtn:hover{background:rgba(255,255,255,0.10)}' +
      '.ftw .tw-chipTitle{margin-top:16px;font-size:14px;line-height:18px;font-weight:800;color:var(--ui-text-inverse)}' +
      '.ftw .tw-chips{display:flex;flex-wrap:wrap;gap:10px;margin-top:10px}' +
      '.ftw .tw-chip{height:36px;padding:0 12px;border-radius:999px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);color:var(--ui-text-inverse);font-weight:700;font-size:13px;cursor:pointer;transition:background .15s ease,border-color .15s ease}' +
      '.ftw .tw-chip:hover{background:rgba(255,255,255,0.10)}' +
      '.ftw .tw-chip.is-selected{background:rgba(255,199,89,0.12);border-color:rgba(255,186,48,0.45)}' +
      '.ftw .tw-skip{margin-top:12px;font-size:13px;font-weight:700;color:var(--ui-text-inverse-secondary);background:none;border:none;padding:0;cursor:pointer;text-decoration:underline;text-underline-offset:3px}' +
      '.ftw .tw-skip:hover{color:var(--ui-text-inverse)}' +
      '.ftw .tw-feedbackActions{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-top:16px;flex-wrap:wrap}' +
      '.ftw .tw-feedbackBtn{height:40px;padding:0 16px;border-radius:12px;font-family:var(--ui-font);font-size:14px;line-height:18px;font-weight:800;background:rgba(255,255,255,0.08);color:var(--ui-text-inverse);border:1px solid rgba(255,255,255,0.14);cursor:pointer;transition:background .15s ease,transform .05s ease}' +
      '.ftw .tw-feedbackBtn:hover{background:rgba(255,255,255,0.12)}' +
      '.ftw .tw-feedbackBtn:active{transform:translateY(1px)}' +
      '.ftw .tw-feedbackBtn[disabled]{opacity:0.55;cursor:not-allowed;transform:none}' +
      '.ftw .tw-feedbackThanks{margin-top:14px;font-size:14px;line-height:18px;font-weight:800;color:var(--ui-text-inverse)}' +
      '.ftw .tw-feedbackDone{display:flex;gap:10px;align-items:flex-start;margin-top:14px}' +
      '.ftw .tw-doneIcon{width:28px;height:28px;border-radius:10px;background:rgba(255,199,89,0.12);border:1px solid rgba(255,186,48,0.35);display:flex;align-items:center;justify-content:center;color:var(--ui-brand);font-weight:900}' +
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
      /* Buttons (match tariff card paddings + SemiBold) */
      '.ftw .tw-btn{height:48px;padding:0 24px;border-radius:var(--ui-radius-btn);font-family:var(--ui-font);font-size:16px;line-height:20px;font-weight:600;border:none;cursor:pointer;transition:background .15s ease, transform .05s ease}' +
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

    if (this.options.premiumVisualImageUrl === 'auto') {
      this.options.premiumVisualImageUrl = defaultPremiumVisualUrl();
    }
    if (!this.options.premiumVisualImageUrl) this.options.premiumVisualImageUrl = '';

    this.mountPoint = target;
    this.dom = createRoot(target, this.options);

    // Fixed height for question screens (avoids layout jumps).
    // Set when user enters questionnaire.
    this._fixedQuestionHeight = 0;
    this._feedbackTimer = null;
    this._feedbackShownOnce = false;
    this.sessionId = getSessionId();

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
      feedback: { state: 'idle', rating: null, reasons: [] },
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
    try {
      if (this._feedbackTimer) clearTimeout(this._feedbackTimer);
    } catch (_) {}
    this._feedbackTimer = null;
    this._feedbackShownOnce = false;
    this.state.mode = 'intro';
    this.state.step = 0;
    this.state.answers = { q1_goal: null, q2_frequency: null, q3_instruments: null, q4_assistance: null };
    this.state.resultTariffId = null;
    this.state.feedback = { state: 'idle', rating: null, reasons: [] };
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

  Widget.prototype.createPremiumVisual = function () {
    var wrap = el('div', { class: 'tw-premium-visual', 'aria-hidden': 'true' });
    if (this.options.premiumVisualImageUrl) {
      var img = el('div', { class: 'tw-premium-img' });
      img.style.backgroundImage = 'url("' + safeCssUrl(this.options.premiumVisualImageUrl) + '")';
      wrap.appendChild(img);
    }
    wrap.appendChild(el('div', { class: 'tw-premium-overlay' }));
    return wrap;
  };

  Widget.prototype.applyBackgroundImage = function (shell) {
    if (!shell) return;
    if (!this.options.premiumVisualImageUrl) return;
    shell.style.setProperty('--tw-bg-img', 'url("' + safeCssUrl(this.options.premiumVisualImageUrl) + '")');
  };

  Widget.prototype.createFeedbackBlock = function (tariffId) {
    var self = this;
    var fb = this.state.feedback || { state: 'idle', rating: null, reasons: [] };

    var CHIPSET = [
      { id: 'too_many_questions', label: 'Слишком много вопросов' },
      { id: 'unclear_terms', label: 'Сложно понять термины' },
      { id: 'unclear_recommendation', label: 'Не понял, почему предложили этот тариф' },
      { id: 'missing_instruments', label: 'Не нашёл нужные инструменты' },
      { id: 'takes_too_long', label: 'Долго проходить' },
      { id: 'other', label: 'Другое' },
    ];

    function buildPayload(rating, reasons) {
      return {
        session_id: self.sessionId,
        user_id: self.options.userId || undefined,
        tariff_id: String(tariffId),
        rating: rating,
        reasons: rating <= 3 ? (reasons || []) : undefined,
        flow_version: String(self.options.flowVersion || FLOW_VERSION),
        timestamp: new Date().toISOString(),
        platform: getPlatformHint(),
        ab_group: self.options.abGroup || undefined,
      };
    }

    function submit(payload) {
      track(self, 'feedback_submit', {
        tariff_id: payload.tariff_id,
        rating: payload.rating,
        reasons_count: Array.isArray(payload.reasons) ? payload.reasons.length : 0,
        flow_version: payload.flow_version,
      });
      if (!self.options.feedbackEndpoint) return;
      postJsonWithRetry(self.options.feedbackEndpoint, payload, 3, function (ok) {
        track(self, ok ? 'feedback_submit_success' : 'feedback_submit_fail', { tariff_id: payload.tariff_id });
      });
    }

    function setFb(next) {
      self.state.feedback = next;
      self.render();
    }

    function completeNow(payload) {
      // silent-fail submission
      try {
        submit(payload);
      } catch (_) {}
      setFb({ state: 'completed', rating: payload.rating, reasons: payload.reasons || [] });
      track(self, 'feedback_completed', { tariff_id: String(tariffId), rating: payload.rating });
    }

    var wrap = el('div', { class: 'tw-feedback', 'aria-label': 'Оценка удобства подбора тарифа' });

    if (fb.state === 'completed') {
      wrap.appendChild(el('div', { class: 'tw-feedbackTitle', text: 'Спасибо!' }));
      wrap.appendChild(
        el(
          'div',
          { class: 'tw-feedbackDone' },
          el('div', { class: 'tw-doneIcon', text: '✓', 'aria-hidden': 'true' }),
          el('div', { class: 'tw-feedbackSub', text: 'Мы учтём ваш отзыв.' })
        )
      );
      return wrap;
    }

    wrap.appendChild(el('div', { class: 'tw-feedbackTitle', text: 'Насколько удобным был подбор тарифа?' }));
    wrap.appendChild(el('div', { class: 'tw-feedbackSub', text: 'Оценка займёт пару секунд' }));

    var stars = el('div', { class: 'tw-stars', role: 'radiogroup', 'aria-label': 'Оценка 1–5' });
    var hovered = 0;

    function renderStars(active) {
      while (stars.firstChild) stars.removeChild(stars.firstChild);
      for (var i = 1; i <= 5; i++) {
        (function (value) {
          var on = value <= active;
          var btn = el('button', {
            class: on ? 'tw-starBtn is-on' : 'tw-starBtn',
            type: 'button',
            role: 'radio',
            'aria-checked': fb.rating === value ? 'true' : 'false',
            'aria-label': String(value),
            onClick: function () {
              var rating = value;
              track(self, 'feedback_rated', { tariff_id: String(tariffId), rating: rating });

              if (rating >= 4) {
                setFb({ state: 'rated_positive', rating: rating, reasons: [] });
              } else {
                setFb({ state: 'rated_negative', rating: rating, reasons: Array.isArray(fb.reasons) ? fb.reasons : [] });
              }
            },
          });
          btn.addEventListener('mouseenter', function () {
            hovered = value;
            renderStars(hovered);
          });
          btn.addEventListener('mouseleave', function () {
            hovered = 0;
            renderStars(fb.rating || 0);
          });
          btn.appendChild(el('span', { class: 'tw-star', text: '★', 'aria-hidden': 'true' }));
          stars.appendChild(btn);
        })(i);
      }
    }

    renderStars(fb.rating || 0);
    wrap.appendChild(stars);

    if (fb.state === 'rated_positive' && fb.rating != null) {
      wrap.appendChild(el('div', { class: 'tw-feedbackThanks', text: 'Спасибо за оценку!' }));
    }

    if (fb.state === 'rated_negative' && fb.rating != null) {
      wrap.appendChild(el('div', { class: 'tw-chipTitle', text: 'Что было неудобно?' }));
      var chips = el('div', { class: 'tw-chips' });
      CHIPSET.forEach(function (c) {
        var selected = Array.isArray(fb.reasons) && fb.reasons.indexOf(c.id) !== -1;
        var chip = el('button', {
          class: selected ? 'tw-chip is-selected' : 'tw-chip',
          type: 'button',
          onClick: function () {
            var nextReasons = Array.isArray(fb.reasons) ? fb.reasons.slice() : [];
            var idx = nextReasons.indexOf(c.id);
            if (idx === -1) nextReasons.push(c.id);
            else nextReasons.splice(idx, 1);
            track(self, 'feedback_reason_toggled', { tariff_id: String(tariffId), reason: c.id, selected: idx === -1 });
            setFb({ state: 'rated_negative', rating: fb.rating, reasons: nextReasons });
          },
        });
        chip.textContent = c.label;
        chips.appendChild(chip);
      });
      wrap.appendChild(chips);
    }

    // Actions: submit + optional skip (never blocks main CTA)
    var actions = el('div', { class: 'tw-feedbackActions' });
    actions.appendChild(
      el('button', {
        class: 'tw-skip',
        type: 'button',
        onClick: function () {
          track(self, 'feedback_skipped', { tariff_id: String(tariffId) });
          setFb({ state: 'completed', rating: null, reasons: [] });
        },
        text: 'Пропустить',
      })
    );
    actions.appendChild(
      el('button', {
        class: 'tw-feedbackBtn',
        type: 'button',
        disabled: fb.rating == null,
        onClick: function () {
          if (fb.rating == null) return;
          completeNow(buildPayload(fb.rating, Array.isArray(fb.reasons) ? fb.reasons : []));
        },
        text: 'Отправить',
      })
    );
    wrap.appendChild(actions);

    try {
      if (!self._feedbackShownOnce) {
        self._feedbackShownOnce = true;
        track(self, 'feedback_shown', { tariff_id: String(tariffId) });
      }
    } catch (_) {}

    return wrap;
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

    var grid = el('div', { class: 'tw-two-col' }, el('div', null), this.createPremiumVisual());
    var left = grid.firstChild;

    var card = el('div', { class: 'tw-card' });
    card.appendChild(el('div', { class: 'tw-heroTitle', text: 'Выберите тариф, который подойдёт именно вам' }));
    card.appendChild(el('div', { class: 'tw-secondaryText', text: 'Предложим оптимальный тариф без лишних сложностей.' }));
    card.appendChild(
      el('div', { class: 'tw-actions' },
        el('div', { class: 'tw-actions-left' }),
        el('div', { class: 'tw-actions-right' },
          el('button', {
            class: 'tw-btn tw-btn-primary',
            onClick: function () {
              track(self, 'widget_start', {});
              // Fix questionnaire height to prevent layout jumps between questions.
              // Value chosen to comfortably fit longest question on desktop.
              self._fixedQuestionHeight = 620;
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
    if (this._fixedQuestionHeight) shell.style.minHeight = this._fixedQuestionHeight + 'px';
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

    // Two columns on questions: stable card width, visual on the right.
    var grid = el('div', { class: 'tw-two-col' }, el('div', null), this.createPremiumVisual());
    var left = grid.firstChild;

    var card = el('div', { class: 'tw-card tw-cardSolid' });
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
        try {
          var h = Math.ceil(shell.getBoundingClientRect().height || 0);
          if (h) self._fixedQuestionHeight = Math.max(self._fixedQuestionHeight || 0, h);
        } catch (_) {}
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

    var right;
    if (this.options.feedbackEnabled) {
      try {
        right = this.createFeedbackBlock(tariffId);
      } catch (e) {
        // If feedback fails, never block the main result.
        try {
          if (global.console && typeof global.console.error === 'function') {
            global.console.error('[FinamTariffWidget] feedback render failed', e);
          }
        } catch (_) {}
        right = this.createPremiumVisual();
      }
    } else {
      right = this.createPremiumVisual();
    }
    var grid = el('div', { class: 'tw-two-col' }, el('div', null), right);
    var left = grid.firstChild;

    var card = el('div', { class: 'tw-card tw-cardSolid' });
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

  function findScriptElement(doc) {
    try {
      var scripts = doc.getElementsByTagName ? doc.getElementsByTagName('script') : [];
      for (var i = scripts.length - 1; i >= 0; i--) {
        var s = scripts[i];
        var src = s && s.src ? String(s.src) : '';
        if (src && src.indexOf('finam-tariff-widget.js') !== -1) return s;
      }
    } catch (_) {}
    return null;
  }

  function queryAllDeep(root, selector) {
    var out = [];
    function walk(node) {
      if (!node) return;
      // node can be Document or ShadowRoot
      try {
        if (node.querySelectorAll) {
          var list = node.querySelectorAll(selector);
          for (var i = 0; i < list.length; i++) out.push(list[i]);
        }
      } catch (_) {}
      // Walk shadow roots
      try {
        var tree = node.querySelectorAll ? node.querySelectorAll('*') : [];
        for (var j = 0; j < tree.length; j++) {
          var el = tree[j];
          if (el && el.shadowRoot) walk(el.shadowRoot);
        }
      } catch (_) {}
    }
    walk(root);
    return out;
  }

  function ensureContainerNearScript(doc) {
    try {
      var script = findScriptElement(doc);
      if (!script || !script.parentNode) return null;
      // Avoid duplicates
      var existing = null;
      try {
        existing = script.parentNode.querySelector && script.parentNode.querySelector('[data-finam-tariff-widget],#finam-tariff');
      } catch (_) {}
      if (existing) return existing;

      var d = doc;
      var div = d.createElement('div');
      div.setAttribute('data-finam-tariff-widget', '');
      div.style.width = '100%';
      // insert after script
      if (script.nextSibling) script.parentNode.insertBefore(div, script.nextSibling);
      else script.parentNode.appendChild(div);
      return div;
    } catch (_) {}
    return null;
  }

  function autoMountInDocument(doc) {
    if (!doc || !doc.querySelectorAll) return;
    var mountedAny = false;

    // data-attribute mounting
    var nodes = queryAllDeep(doc, '[data-finam-tariff-widget]');
    for (var i = 0; i < nodes.length; i++) {
      if (nodes[i].__finamTariffWidgetMounted) continue;
      nodes[i].__finamTariffWidgetMounted = true;
      try {
        // mount must run in the same document where target lives
        new Widget(nodes[i], {});
        mountedAny = true;
      } catch (e) {
        try {
          nodes[i].__finamTariffWidgetMounted = false;
        } catch (_) {}
        try {
          if (global.console && typeof global.console.error === 'function') {
            global.console.error('[FinamTariffWidget] mount failed', e);
          }
        } catch (_) {}
      }
    }

    // id mounting fallback (builders sometimes strip data-*)
    var byId = null;
    try {
      byId = doc.getElementById && doc.getElementById('finam-tariff');
    } catch (_) {}
    if (byId && !byId.__finamTariffWidgetMounted) {
      byId.__finamTariffWidgetMounted = true;
      try {
        new Widget(byId, {});
        mountedAny = true;
      } catch (e2) {
        try {
          byId.__finamTariffWidgetMounted = false;
        } catch (_) {}
        try {
          if (global.console && typeof global.console.error === 'function') {
            global.console.error('[FinamTariffWidget] mount failed', e2);
          }
        } catch (_) {}
      }
    }

    // If nothing found/mounted, create a container next to the script tag and mount there.
    if (!mountedAny) {
      var created = ensureContainerNearScript(doc);
      if (created && !created.__finamTariffWidgetMounted) {
        created.__finamTariffWidgetMounted = true;
        try {
          new Widget(created, {});
          mountedAny = true;
        } catch (e3) {
          try {
            created.__finamTariffWidgetMounted = false;
          } catch (_) {}
          try {
            if (global.console && typeof global.console.error === 'function') {
              global.console.error('[FinamTariffWidget] mount failed', e3);
            }
          } catch (_) {}
        }
      }
    }
  }

  function autoMountDeep(rootDoc) {
    var visited = new Set();
    function walk(doc) {
      if (!doc || visited.has(doc)) return;
      visited.add(doc);
      autoMountInDocument(doc);
      // Try accessible same-origin iframes (cross-origin will throw)
      var iframes = [];
      try {
        iframes = doc.querySelectorAll ? doc.querySelectorAll('iframe') : [];
      } catch (_) {}
      for (var i = 0; i < iframes.length; i++) {
        var f = iframes[i];
        try {
          var childDoc = f && (f.contentDocument || (f.contentWindow && f.contentWindow.document));
          if (childDoc) walk(childDoc);
        } catch (_) {
          // cross-origin iframe: ignore
        }
      }
    }
    walk(rootDoc || document);
  }

  function autoMount() {
    autoMountDeep(document);
  }

  function onReady(fn) {
    if (document.readyState === 'complete' || document.readyState === 'interactive') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  function setupAutoMountObserver() {
    try {
      if (!global.MutationObserver) return;
      if (global.__finamTariffWidgetObserver) return;
      var obs = new MutationObserver(function (mutations) {
        for (var i = 0; i < mutations.length; i++) {
          var m = mutations[i];
          if (!m || !m.addedNodes || !m.addedNodes.length) continue;
          // Any DOM addition may include the mount container; just attempt autoMount (it is idempotent).
          autoMount();
          break;
        }
      });
      obs.observe(document.documentElement || document.body, { childList: true, subtree: true });
      global.__finamTariffWidgetObserver = obs;
    } catch (_) {}
  }

  global.FinamTariffWidget = { mount: mount, autoMount: autoMount, version: VERSION };
  onReady(function () {
    autoMount();
    setupAutoMountObserver();
    // Extra attempts for page builders that inject blocks late.
    try {
      setTimeout(autoMount, 0);
      setTimeout(autoMount, 500);
      setTimeout(autoMount, 1500);
    } catch (_) {}
  });
})(window);

