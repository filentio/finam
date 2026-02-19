## 2) Общие уроки — обзор (фиксировано)

Этот раздел фиксирует состав уроков, их цель, вход/выход, а также обязательные CTA.

### Уроки (ветки) меню

#### L1_START — «С чего начать»
- **Старт**: `s02a_start_intro`
- **Экраны (строго)**:
  - `s02a_start_intro` → `s02_reality` → `s03_goals` → `s04_concepts` → `s05_deposit` → `s06_first_buy` → `s06a_purchase_steps` → `s07_rules_updated` → `s08_instruments_updated` → `s09_choice_updated` → `s10_courses`
- **Финиш**: `s10_courses`
- **Выход**: переход на `s02_navigation_menu`
- **CTA**:
  - депозит (bonus): `ACTION_DEPOSIT_PRIMARY`
  - переход к покупке/магазину: `ACTION_DEPOSIT_ALREADY_DONE_TO_BUY`, `ACTION_FIRST_BUY_CHOOSE_ASSET`, `ACTION_GO_TO_PRODUCT_STORE`
  - переходы на курсы: `ACTION_OPEN_COURSE_FAST_START`, `ACTION_OPEN_COURSE_STOCKS`, `ACTION_OPEN_COURSE_BONDS`

#### L2_PORTFOLIO — «Собрать портфель»
- **Старт**: `s11_portfolio_intro`
- **Экраны (строго)**:
  - `s11_portfolio_intro` → `s12_principles` → `s13_structure` → `s14_balance` → `s14a_portfolio_cta`
- **Финиш**: `s14a_portfolio_cta`
- **Выход**: `ACTION_BACK_TO_MENU` → `s02_navigation_menu`
- **CTA**:
  - конструктор портфеля: `ACTION_PORTFOLIO_BUILDER`
  - углубленный курс: `ACTION_PORTFOLIO_DEEP_COURSE`

#### L3_RISKS — «Риски и защита»
- **Старт**: `s15_risks_intro`
- **Экраны (строго)**:
  - `s15_risks_intro` → `s16_risk_types` → `s17_protection` → `s18_reliable` → `s19_bonds` → `s20_capital_protection` → `s20a_risks_cta`
- **Финиш**: `s20a_risks_cta`
- **Выход**: `ACTION_BACK_TO_MENU` → `s02_navigation_menu`
- **CTA**:
  - покупка ОФЗ: `ACTION_BUY_OFZ`
  - курс по рискам: `ACTION_RISK_MANAGEMENT_COURSE`

#### L4_TARIFFS — «Выбор тарифа»
- **Старт**: `s21_tariff_intro`
- **Экраны (строго)**:
  - `s21_tariff_intro` → `s22_tariff_long` → `s23_tariff_strateg` → `s24_tariff_investor` → `s25_trust_management` → `s25a_tariff_cta`
- **Финиш**: `s25a_tariff_cta`
- **Выход**: `ACTION_BACK_TO_MENU` → `s02_navigation_menu`
- **CTA**:
  - выбор тарифа: `ACTION_SELECT_TARIFF_INVESTOR`, `ACTION_SELECT_TARIFF_STRATEG`, `ACTION_SELECT_TARIFF_LONG`, `ACTION_SELECT_TARIFF_TRUST`

#### L5_DIVERSIFICATION — «Диверсификация»
- **Старт**: `s26_diversification_intro`
- **Экраны (строго)**:
  - `s26_diversification_intro` → `s27_what_is_div` → `s28_asset_allocation` → `s29_why_works` → `s30_example` → `s30a_diversification_cta`
- **Финиш**: `s30a_diversification_cta`
- **Выход**: `ACTION_FINISH_COURSE` → `s31_cta`
- **CTA**:
  - конструктор портфеля: `ACTION_DIVERSIFICATION_PORTFOLIO_BUILDER`
  - консультация: `ACTION_GET_EXPERT_CONSULTATION`

### Финальный экран курса
- `s31_cta`
- CTA:
  - `ACTION_BEGIN_LEARNING`
  - `ACTION_OPEN_ACCOUNT`

