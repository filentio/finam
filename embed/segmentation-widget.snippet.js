(function () {
  var EXPERIENCE_LABELS = {
    none: "Нет опыта",
    less_1y: "Менее 1 года",
    "1_3y": "1–3 года",
    "3_5y": "3–5 лет",
    more_5y: "Более 5 лет",
  };

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

  var ONBOARDING_ROUTE_BY_SEGMENT = {
    novice: "/onboarding/full-course",
    advanced: "/onboarding/short-course",
    expert: "/onboarding/minimal-risk-form",
  };

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
    var safePayload = payload || {};

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

    if (typeof window.gtag === "function") {
      window.gtag("event", eventName, safePayload);
    }

    if (window.console && typeof window.console.info === "function") {
      window.console.info("[segmentation]", eventName, safePayload);
    }
  }

  function initWidget(root) {
    if (!root || root.getAttribute("data-segw-initialized") === "true") {
      return;
    }
    root.setAttribute("data-segw-initialized", "true");

    var state = {
      qualifiedInvestor: null,
      experience: null,
      amountTier: null,
      goal: null,
      instruments: [],
      segment: null,
    };

    var refs = {
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
    };

    function canContinue() {
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

    function buildPayload() {
      if (!canContinue()) {
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

    function navigateToOnboarding(segment, amountTier) {
      var baseRoute = ONBOARDING_ROUTE_BY_SEGMENT[segment];
      var target = baseRoute + "?amountTier=" + encodeURIComponent(amountTier);

      if (typeof window.navigateToOnboarding === "function") {
        window.navigateToOnboarding(segment, amountTier);
      } else {
        window.location.hash = target;
      }

      return target;
    }

    function updateOptionStates() {
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

    function render() {
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
        refs.continueButton.disabled = !canContinue();
      }

      updateOptionStates();
    }

    function showTariffCard(payload, targetRoute) {
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
        refs.instrumentsValue.textContent = payload.instruments
          .map(function (instrument) {
            return INSTRUMENT_LABELS[instrument] || instrument;
          })
          .join(", ");
      }
      if (refs.routeLink) {
        refs.routeLink.href = targetRoute;
        refs.routeLink.textContent = "Перейти к онбордингу";
      }
      if (refs.json) {
        refs.json.textContent = JSON.stringify(payload, null, 2);
      }
    }

    root.addEventListener("click", function (event) {
      var button = event.target.closest("button[data-action]");
      if (!button || !root.contains(button)) {
        return;
      }

      var action = button.getAttribute("data-action");
      var value = button.getAttribute("data-value");

      if (action === "qualified") {
        var qualified = value === "true";
        state.qualifiedInvestor = qualified;
        if (qualified === true) {
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
        var idx = state.instruments.indexOf(value);
        if (idx === -1) {
          state.instruments.push(value);
        } else {
          state.instruments.splice(idx, 1);
        }
      } else if (action === "continue") {
        var payload = buildPayload();
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

        var targetRoute = navigateToOnboarding(payload.segment, payload.amount_tier);
        showTariffCard(payload, targetRoute);

        if (typeof window.onSegmentationComplete === "function") {
          window.onSegmentationComplete(payload);
        }

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
      render();
    });

    trackEvent("segmentation_started");
    render();
  }

  function initAllSegmentationWidgets() {
    var roots = document.querySelectorAll("[data-segmentation-widget]");
    for (var i = 0; i < roots.length; i += 1) {
      initWidget(roots[i]);
    }
  }

  window.initAllSegmentationWidgets = initAllSegmentationWidgets;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initAllSegmentationWidgets);
  } else {
    initAllSegmentationWidgets();
  }
})();
