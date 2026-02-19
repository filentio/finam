## 1) Фиксированный порядок экранов и ветвление

### 1.1. Глобальный пользовательский путь (end-to-end)
Путь фиксирован и не допускает альтернативных трактовок:

1. `QZ01_SEGMENT_QUIZ` — анкета сегментации (5 вопросов).
2. `QZ02_SEGMENT_RESULT` — результат сегмента + описание.
3. `s01_start` — титульный экран курса.
4. `s02_navigation_menu` — главное меню «Выберите тему».
5. Пользователь выбирает **ровно одну** ветку (урок) в меню и проходит её до **финального экрана ветки**.
6. После финального экрана ветки пользователь **всегда** возвращается на `s02_navigation_menu`, кроме ветки 5, где после финального экрана ветки происходит переход на `s31_cta`.
7. `s31_cta` — финальный экран курса.

### 1.2. Ветки (уроки) меню
Меню `s02_navigation_menu` содержит 5 пунктов и ведёт на стартовый экран соответствующей ветки:

- Ветка 1 «С чего начать» → `s02a_start_intro`
- Ветка 2 «Собрать портфель» → `s11_portfolio_intro`
- Ветка 3 «Риски и защита» → `s15_risks_intro`
- Ветка 4 «Выбор тарифа» → `s21_tariff_intro`
- Ветка 5 «Диверсификация» → `s26_diversification_intro`

### 1.3. Канонический порядок экранов колоды (38 экранов, 9:16)
Ниже — **канонический** порядок. Реализация должна следовать ему, даже если в исходном файле-источнике слайды были размещены иначе.

Примечание по файлам скриншотов: имена PNG в `cursor_specs/assets/slides/` содержат порядковый индекс из экспортированного набора + `slide_id`. Для надёжной привязки используйте **`slide_id`**, а не индекс.

#### 1.3.1. Глобальные экраны
- 01 `s01_start` → скриншот: `cursor_specs/assets/slides/01_s01_start.png`
- 02 `s02_navigation_menu` → скриншот: `cursor_specs/assets/slides/02_s02_navigation_menu.png`

#### 1.3.2. Ветка 1 — «С чего начать» (УРОК 1)
- 03 `s02a_start_intro` → `cursor_specs/assets/slides/03_s02a_start_intro.png`
- 04 `s02_reality` → `cursor_specs/assets/slides/04_s02_reality.png`
- 05 `s03_goals` → `cursor_specs/assets/slides/05_s03_goals.png`
- 06 `s04_concepts` → `cursor_specs/assets/slides/06_s04_concepts.png`
- 07 `s05_deposit` → `cursor_specs/assets/slides/07_s05_deposit.png`
- 08 `s06_first_buy` → `cursor_specs/assets/slides/08_s06_first_buy.png`
- 09 `s06a_purchase_steps` → `cursor_specs/assets/slides/09_s06a_purchase_steps.png`
- 10 `s07_rules_updated` → `cursor_specs/assets/slides/10_s07_rules_updated.png`
- 11 `s08_instruments_updated` → `cursor_specs/assets/slides/11_s08_instruments_updated.png`
- 12 `s09_choice_updated` → `cursor_specs/assets/slides/12_s09_choice_updated.png`
- 13 `s10_courses` → `cursor_specs/assets/slides/13_s10_courses.png`

**Завершение ветки 1**: после `s10_courses` переход на `s02_navigation_menu`.

#### 1.3.3. Ветка 2 — «Собрать портфель» (УРОК 2)
- 14 `s11_portfolio_intro` → `cursor_specs/assets/slides/14_s11_portfolio_intro.png`
- 15 `s12_principles` → `cursor_specs/assets/slides/15_s12_principles.png`
- 16 `s13_structure` → `cursor_specs/assets/slides/16_s13_structure.png`
- 17 `s14_balance` → `cursor_specs/assets/slides/17_s14_balance.png`
- 18 `s14a_portfolio_cta` → `cursor_specs/assets/slides/20_s14a_portfolio_cta.png`

**Завершение ветки 2**: после `s14a_portfolio_cta` переход на `s02_navigation_menu`.

#### 1.3.4. Ветка 3 — «Риски и защита» (УРОК 3)
- 19 `s15_risks_intro` → `cursor_specs/assets/slides/18_s15_risks_intro.png`
- 20 `s16_risk_types` → `cursor_specs/assets/slides/19_s16_risk_types.png`
- 21 `s17_protection` → `cursor_specs/assets/slides/21_s17_protection.png`
- 22 `s18_reliable` → `cursor_specs/assets/slides/22_s18_reliable.png`
- 23 `s19_bonds` → `cursor_specs/assets/slides/23_s19_bonds.png`
- 24 `s20_capital_protection` → `cursor_specs/assets/slides/24_s20_capital_protection.png`
- 25 `s20a_risks_cta` → `cursor_specs/assets/slides/27_s20a_risks_cta.png`

**Завершение ветки 3**: после `s20a_risks_cta` переход на `s02_navigation_menu`.

#### 1.3.5. Ветка 4 — «Выбор тарифа» (УРОК 4)
- 26 `s21_tariff_intro` → `cursor_specs/assets/slides/25_s21_tariff_intro.png`
- 27 `s22_tariff_long` → `cursor_specs/assets/slides/26_s22_tariff_long.png`
- 28 `s23_tariff_strateg` → `cursor_specs/assets/slides/28_s23_tariff_strateg.png`
- 29 `s24_tariff_investor` → `cursor_specs/assets/slides/29_s24_tariff_investor.png`
- 30 `s25_trust_management` → `cursor_specs/assets/slides/30_s25_trust_management.png`
- 31 `s25a_tariff_cta` → `cursor_specs/assets/slides/33_s25a_tariff_cta.png`

**Завершение ветки 4**: после `s25a_tariff_cta` переход на `s02_navigation_menu`.

#### 1.3.6. Ветка 5 — «Диверсификация» (УРОК 5)
- 32 `s26_diversification_intro` → `cursor_specs/assets/slides/31_s26_diversification_intro.png`
- 33 `s27_what_is_div` → `cursor_specs/assets/slides/32_s27_what_is_div.png`
- 34 `s28_asset_allocation` → `cursor_specs/assets/slides/34_s28_asset_allocation.png`
- 35 `s29_why_works` → `cursor_specs/assets/slides/35_s29_why_works.png`
- 36 `s30_example` → `cursor_specs/assets/slides/36_s30_example.png`
- 37 `s30a_diversification_cta` → `cursor_specs/assets/slides/38_s30a_diversification_cta.png`

**Завершение ветки 5**: после `s30a_diversification_cta` переход на `s31_cta`.

#### 1.3.7. Финал
- 38 `s31_cta` → `cursor_specs/assets/slides/37_s31_cta.png`

