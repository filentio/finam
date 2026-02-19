## 01 CORE (foundation) — 01_core_structure.md
### ЖЁСТКИЕ ТРЕБОВАНИЯ
- В этом документе отсутствует вариативность формулировок.
- Альтернативы запрещены.
- Placeholder запрещены.
- Любые решения "на усмотрение" запрещены.
- Последовательность экранов фиксирована.
- Тексты финальные.

### 1. Структура процесса
#### 1.1. Полный список экранов в строгой последовательности
| # | Screen ID | Type | Asset (1x) | Asset (2x) | Asset (3x) |
|---:|---|---|---|---|---|
| 1 | `QZ01_SEGMENT_QUIZ` | `quiz` | `assets/illustrations/QZ01_SEGMENT_QUIZ.png` | `assets/illustrations/QZ01_SEGMENT_QUIZ@2x.png` | `assets/illustrations/QZ01_SEGMENT_QUIZ@3x.png` |
| 2 | `QZ02_SEGMENT_RESULT` | `result` | см. раздел 1.1.1 | см. раздел 1.1.1 | см. раздел 1.1.1 |
| 3 | `s01_start` | `story` | `assets/images/s01_start.png` | `assets/images/s01_start@2x.png` | `assets/images/s01_start@3x.png` |
| 4 | `s02_navigation_menu` | `branch` | `assets/images/s02_navigation_menu.png` | `assets/images/s02_navigation_menu@2x.png` | `assets/images/s02_navigation_menu@3x.png` |
| 5 | `s02a_start_intro` | `lesson` | `assets/images/s02a_start_intro.png` | `assets/images/s02a_start_intro@2x.png` | `assets/images/s02a_start_intro@3x.png` |
| 6 | `s02_reality` | `lesson` | `assets/images/s02_reality.png` | `assets/images/s02_reality@2x.png` | `assets/images/s02_reality@3x.png` |
| 7 | `s03_goals` | `lesson` | `assets/images/s03_goals.png` | `assets/images/s03_goals@2x.png` | `assets/images/s03_goals@3x.png` |
| 8 | `s04_concepts` | `lesson` | `assets/images/s04_concepts.png` | `assets/images/s04_concepts@2x.png` | `assets/images/s04_concepts@3x.png` |
| 9 | `s05_deposit` | `lesson` | `assets/images/s05_deposit.png` | `assets/images/s05_deposit@2x.png` | `assets/images/s05_deposit@3x.png` |
| 10 | `s06_first_buy` | `lesson` | `assets/images/s06_first_buy.png` | `assets/images/s06_first_buy@2x.png` | `assets/images/s06_first_buy@3x.png` |
| 11 | `s06a_purchase_steps` | `lesson` | `assets/images/s06a_purchase_steps.png` | `assets/images/s06a_purchase_steps@2x.png` | `assets/images/s06a_purchase_steps@3x.png` |
| 12 | `s07_rules_updated` | `lesson` | `assets/images/s07_rules_updated.png` | `assets/images/s07_rules_updated@2x.png` | `assets/images/s07_rules_updated@3x.png` |
| 13 | `s08_instruments_updated` | `lesson` | `assets/images/s08_instruments_updated.png` | `assets/images/s08_instruments_updated@2x.png` | `assets/images/s08_instruments_updated@3x.png` |
| 14 | `s09_choice_updated` | `lesson` | `assets/images/s09_choice_updated.png` | `assets/images/s09_choice_updated@2x.png` | `assets/images/s09_choice_updated@3x.png` |
| 15 | `s10_courses` | `lesson` | `assets/images/s10_courses.png` | `assets/images/s10_courses@2x.png` | `assets/images/s10_courses@3x.png` |
| 16 | `s11_portfolio_intro` | `lesson` | `assets/images/s11_portfolio_intro.png` | `assets/images/s11_portfolio_intro@2x.png` | `assets/images/s11_portfolio_intro@3x.png` |
| 17 | `s12_principles` | `lesson` | `assets/images/s12_principles.png` | `assets/images/s12_principles@2x.png` | `assets/images/s12_principles@3x.png` |
| 18 | `s13_structure` | `lesson` | `assets/images/s13_structure.png` | `assets/images/s13_structure@2x.png` | `assets/images/s13_structure@3x.png` |
| 19 | `s14_balance` | `lesson` | `assets/images/s14_balance.png` | `assets/images/s14_balance@2x.png` | `assets/images/s14_balance@3x.png` |
| 20 | `s14a_portfolio_cta` | `lesson` | `assets/images/s14a_portfolio_cta.png` | `assets/images/s14a_portfolio_cta@2x.png` | `assets/images/s14a_portfolio_cta@3x.png` |
| 21 | `s15_risks_intro` | `lesson` | `assets/images/s15_risks_intro.png` | `assets/images/s15_risks_intro@2x.png` | `assets/images/s15_risks_intro@3x.png` |
| 22 | `s16_risk_types` | `lesson` | `assets/images/s16_risk_types.png` | `assets/images/s16_risk_types@2x.png` | `assets/images/s16_risk_types@3x.png` |
| 23 | `s17_protection` | `lesson` | `assets/images/s17_protection.png` | `assets/images/s17_protection@2x.png` | `assets/images/s17_protection@3x.png` |
| 24 | `s18_reliable` | `lesson` | `assets/images/s18_reliable.png` | `assets/images/s18_reliable@2x.png` | `assets/images/s18_reliable@3x.png` |
| 25 | `s19_bonds` | `lesson` | `assets/images/s19_bonds.png` | `assets/images/s19_bonds@2x.png` | `assets/images/s19_bonds@3x.png` |
| 26 | `s20_capital_protection` | `lesson` | `assets/images/s20_capital_protection.png` | `assets/images/s20_capital_protection@2x.png` | `assets/images/s20_capital_protection@3x.png` |
| 27 | `s20a_risks_cta` | `lesson` | `assets/images/s20a_risks_cta.png` | `assets/images/s20a_risks_cta@2x.png` | `assets/images/s20a_risks_cta@3x.png` |
| 28 | `s21_tariff_intro` | `lesson` | `assets/images/s21_tariff_intro.png` | `assets/images/s21_tariff_intro@2x.png` | `assets/images/s21_tariff_intro@3x.png` |
| 29 | `s22_tariff_long` | `lesson` | `assets/images/s22_tariff_long.png` | `assets/images/s22_tariff_long@2x.png` | `assets/images/s22_tariff_long@3x.png` |
| 30 | `s23_tariff_strateg` | `lesson` | `assets/images/s23_tariff_strateg.png` | `assets/images/s23_tariff_strateg@2x.png` | `assets/images/s23_tariff_strateg@3x.png` |
| 31 | `s24_tariff_investor` | `lesson` | `assets/images/s24_tariff_investor.png` | `assets/images/s24_tariff_investor@2x.png` | `assets/images/s24_tariff_investor@3x.png` |
| 32 | `s25_trust_management` | `lesson` | `assets/images/s25_trust_management.png` | `assets/images/s25_trust_management@2x.png` | `assets/images/s25_trust_management@3x.png` |
| 33 | `s25a_tariff_cta` | `lesson` | `assets/images/s25a_tariff_cta.png` | `assets/images/s25a_tariff_cta@2x.png` | `assets/images/s25a_tariff_cta@3x.png` |
| 34 | `s26_diversification_intro` | `lesson` | `assets/images/s26_diversification_intro.png` | `assets/images/s26_diversification_intro@2x.png` | `assets/images/s26_diversification_intro@3x.png` |
| 35 | `s27_what_is_div` | `lesson` | `assets/images/s27_what_is_div.png` | `assets/images/s27_what_is_div@2x.png` | `assets/images/s27_what_is_div@3x.png` |
| 36 | `s28_asset_allocation` | `lesson` | `assets/images/s28_asset_allocation.png` | `assets/images/s28_asset_allocation@2x.png` | `assets/images/s28_asset_allocation@3x.png` |
| 37 | `s29_why_works` | `lesson` | `assets/images/s29_why_works.png` | `assets/images/s29_why_works@2x.png` | `assets/images/s29_why_works@3x.png` |
| 38 | `s30_example` | `lesson` | `assets/images/s30_example.png` | `assets/images/s30_example@2x.png` | `assets/images/s30_example@3x.png` |
| 39 | `s30a_diversification_cta` | `lesson` | `assets/images/s30a_diversification_cta.png` | `assets/images/s30a_diversification_cta@2x.png` | `assets/images/s30a_diversification_cta@3x.png` |
| 40 | `s31_cta` | `story` | `assets/images/s31_cta.png` | `assets/images/s31_cta@2x.png` | `assets/images/s31_cta@3x.png` |

#### 1.1.1. Ассеты для `QZ02_SEGMENT_RESULT` (фиксировано)
Экран результата имеет 4 фиксированных варианта в зависимости от вычисленного сегмента:

- `novice`
  - 1x: `assets/illustrations/QZ02_SEGMENT_RESULT__novice.png`
  - 2x: `assets/illustrations/QZ02_SEGMENT_RESULT__novice@2x.png`
  - 3x: `assets/illustrations/QZ02_SEGMENT_RESULT__novice@3x.png`
- `learner`
  - 1x: `assets/illustrations/QZ02_SEGMENT_RESULT__learner.png`
  - 2x: `assets/illustrations/QZ02_SEGMENT_RESULT__learner@2x.png`
  - 3x: `assets/illustrations/QZ02_SEGMENT_RESULT__learner@3x.png`
- `experienced`
  - 1x: `assets/illustrations/QZ02_SEGMENT_RESULT__experienced.png`
  - 2x: `assets/illustrations/QZ02_SEGMENT_RESULT__experienced@2x.png`
  - 3x: `assets/illustrations/QZ02_SEGMENT_RESULT__experienced@3x.png`
- `qualified`
  - 1x: `assets/illustrations/QZ02_SEGMENT_RESULT__qualified.png`
  - 2x: `assets/illustrations/QZ02_SEGMENT_RESULT__qualified@2x.png`
  - 3x: `assets/illustrations/QZ02_SEGMENT_RESULT__qualified@3x.png`

#### 1.2. Переходы (from → to)
Переходы являются источником истины. Переход, не описанный здесь, запрещён.

#### 1.3. Таблица навигации
| ID | From | To | Условие | Тип |
|---|---|---|---|---|
| NAV_001 | `QZ01_SEGMENT_QUIZ` | `QZ02_SEGMENT_RESULT` | `ALL_ANSWERS_VALID` | `submit` |
| NAV_002 | `QZ02_SEGMENT_RESULT` | `s01_start` | `ACTION_BEGIN_LEARNING_FROM_RESULT` | `action` |
| NAV_003 | `s01_start` | `s02_navigation_menu` | `ACTION_START_COURSE` | `action` |
| NAV_004 | `s02_navigation_menu` | `s02a_start_intro` | `MENU_SELECT_L1_START` | `branch` |
| NAV_005 | `s02_navigation_menu` | `s11_portfolio_intro` | `MENU_SELECT_L2_PORTFOLIO` | `branch` |
| NAV_006 | `s02_navigation_menu` | `s15_risks_intro` | `MENU_SELECT_L3_RISKS` | `branch` |
| NAV_007 | `s02_navigation_menu` | `s21_tariff_intro` | `MENU_SELECT_L4_TARIFFS` | `branch` |
| NAV_008 | `s02_navigation_menu` | `s26_diversification_intro` | `MENU_SELECT_L5_DIVERSIFICATION` | `branch` |
| NAV_009 | `s02a_start_intro` | `s02_reality` | `NEXT` | `linear` |
| NAV_010 | `s02_reality` | `s03_goals` | `NEXT` | `linear` |
| NAV_011 | `s03_goals` | `s04_concepts` | `NEXT` | `linear` |
| NAV_012 | `s04_concepts` | `s05_deposit` | `NEXT` | `linear` |
| NAV_013 | `s05_deposit` | `s06_first_buy` | `NEXT` | `linear` |
| NAV_014 | `s06_first_buy` | `s06a_purchase_steps` | `NEXT` | `linear` |
| NAV_015 | `s06a_purchase_steps` | `s07_rules_updated` | `NEXT` | `linear` |
| NAV_016 | `s07_rules_updated` | `s08_instruments_updated` | `NEXT` | `linear` |
| NAV_017 | `s08_instruments_updated` | `s09_choice_updated` | `NEXT` | `linear` |
| NAV_018 | `s09_choice_updated` | `s10_courses` | `NEXT` | `linear` |
| NAV_019 | `s11_portfolio_intro` | `s12_principles` | `NEXT` | `linear` |
| NAV_020 | `s12_principles` | `s13_structure` | `NEXT` | `linear` |
| NAV_021 | `s13_structure` | `s14_balance` | `NEXT` | `linear` |
| NAV_022 | `s14_balance` | `s14a_portfolio_cta` | `NEXT` | `linear` |
| NAV_023 | `s15_risks_intro` | `s16_risk_types` | `NEXT` | `linear` |
| NAV_024 | `s16_risk_types` | `s17_protection` | `NEXT` | `linear` |
| NAV_025 | `s17_protection` | `s18_reliable` | `NEXT` | `linear` |
| NAV_026 | `s18_reliable` | `s19_bonds` | `NEXT` | `linear` |
| NAV_027 | `s19_bonds` | `s20_capital_protection` | `NEXT` | `linear` |
| NAV_028 | `s20_capital_protection` | `s20a_risks_cta` | `NEXT` | `linear` |
| NAV_029 | `s21_tariff_intro` | `s22_tariff_long` | `NEXT` | `linear` |
| NAV_030 | `s22_tariff_long` | `s23_tariff_strateg` | `NEXT` | `linear` |
| NAV_031 | `s23_tariff_strateg` | `s24_tariff_investor` | `NEXT` | `linear` |
| NAV_032 | `s24_tariff_investor` | `s25_trust_management` | `NEXT` | `linear` |
| NAV_033 | `s25_trust_management` | `s25a_tariff_cta` | `NEXT` | `linear` |
| NAV_034 | `s26_diversification_intro` | `s27_what_is_div` | `NEXT` | `linear` |
| NAV_035 | `s27_what_is_div` | `s28_asset_allocation` | `NEXT` | `linear` |
| NAV_036 | `s28_asset_allocation` | `s29_why_works` | `NEXT` | `linear` |
| NAV_037 | `s29_why_works` | `s30_example` | `NEXT` | `linear` |
| NAV_038 | `s30_example` | `s30a_diversification_cta` | `NEXT` | `linear` |
| NAV_039 | `s05_deposit` | `s06_first_buy` | `ACTION_DEPOSIT_ALREADY_DONE_TO_BUY` | `action` |
| NAV_040 | `s10_courses` | `s02_navigation_menu` | `END_OF_LESSON` | `return` |
| NAV_041 | `s14a_portfolio_cta` | `s02_navigation_menu` | `END_OF_LESSON` | `return` |
| NAV_042 | `s20a_risks_cta` | `s02_navigation_menu` | `END_OF_LESSON` | `return` |
| NAV_043 | `s25a_tariff_cta` | `s02_navigation_menu` | `END_OF_LESSON` | `return` |
| NAV_044 | `s30a_diversification_cta` | `s31_cta` | `ACTION_FINISH_COURSE` | `action` |

### 2. Логика
#### 2.1. Блок‑схема
```text
QZ01_SEGMENT_QUIZ --(submit + ALL_ANSWERS_VALID)--> QZ02_SEGMENT_RESULT
QZ02_SEGMENT_RESULT --(ACTION_BEGIN_LEARNING_FROM_RESULT)--> s01_start
s01_start --(ACTION_START_COURSE)--> s02_navigation_menu
s02_navigation_menu --(menu select)--> L1 or L2 or L3 or L4 or L5
L1 ends at s10_courses --(END_OF_LESSON)--> s02_navigation_menu
L2 ends at s14a_portfolio_cta --(END_OF_LESSON)--> s02_navigation_menu
L3 ends at s20a_risks_cta --(END_OF_LESSON)--> s02_navigation_menu
L4 ends at s25a_tariff_cta --(END_OF_LESSON)--> s02_navigation_menu
L5 ends at s30a_diversification_cta --(ACTION_FINISH_COURSE)--> s31_cta
```

#### 2.2. Условия
- `ALL_ANSWERS_VALID`: анкета заполнена по правилам раздела 5.
- `NEXT`: переход по фиксированному порядку экрана внутри ветки.
- `END_OF_LESSON`: возврат в меню после финального экрана ветки.
- `MENU_SELECT_*`: выбор пункта меню.

#### 2.3. Edge cases
- EDGE_001: Выход во время анкеты. Ответы сохраняются; возврат открывает `QZ01_SEGMENT_QUIZ` в состоянии `filled`.
- EDGE_002: Выход во время просмотра слайдов. Возврат открывает `course.progress.lastVisitedScreenId`.
- EDGE_003: Offline в любом экране. UI переходит в `offline`, действия блокируются.
- EDGE_004: Ошибка загрузки ассета. UI переходит в `error` и показывает фиксированные тексты.
- EDGE_005: Ошибка открытия deep link. UI показывает фиксированное модальное окно.

#### 2.4. Back/Return/Interrupt
- Back внутри ветки: предыдущий экран ветки.
- Back на `s02_navigation_menu`: переход на `s01_start`.
- Back на `s01_start`: переход на `QZ02_SEGMENT_RESULT`.
- Прерывание: экран не сбрасывается.

#### 2.5. Фиксированные тексты ошибок
- Inline load error: `Не удалось загрузить экран` / `Проверьте подключение к интернету и повторите попытку.` / `Повторить`
- Deep link error modal: `Не удалось открыть` / `Попробуйте позже.` / `ОК`

### 3. Разводящий экран (s02_navigation_menu)
- UX‑цель: предоставить выбор ветки и быть точкой возврата после завершения ветки.

#### 3.1. Тексты (строго)
Заголовок:
- `Выберите тему`

Подзаголовок:
- `Нажмите на раздел, чтобы перейти к обучению`

Пункты меню (строго):
- Пункт 1:
  - Title: `С чего начать`
  - Subtitle: `Первые шаги и правила`
  - Icon: `assets/icons/s02_navigation_menu__start.svg`
  - Переход: `s02_navigation_menu` → `s02a_start_intro` (`MENU_SELECT_L1_START`)
- Пункт 2:
  - Title: `Собрать портфель`
  - Subtitle: `Структура и баланс`
  - Icon: `assets/icons/s02_navigation_menu__portfolio.svg`
  - Переход: `s02_navigation_menu` → `s11_portfolio_intro` (`MENU_SELECT_L2_PORTFOLIO`)
- Пункт 3:
  - Title: `Риски и защита`
  - Subtitle: `Как не потерять деньги`
  - Icon: `assets/icons/s02_navigation_menu__risks.svg`
  - Переход: `s02_navigation_menu` → `s15_risks_intro` (`MENU_SELECT_L3_RISKS`)
- Пункт 4:
  - Title: `Выбор тарифа`
  - Subtitle: `Оптимальные условия`
  - Icon: `assets/icons/s02_navigation_menu__tariffs.svg`
  - Переход: `s02_navigation_menu` → `s21_tariff_intro` (`MENU_SELECT_L4_TARIFFS`)
- Пункт 5:
  - Title: `Диверсификация`
  - Subtitle: `Золотое правило`
  - Icon: `assets/icons/s02_navigation_menu__diversification.svg`
  - Переход: `s02_navigation_menu` → `s26_diversification_intro` (`MENU_SELECT_L5_DIVERSIFICATION`)

#### 3.2. Состояния (строго)
- `loading`: меню отображает skeleton элементов списка (5 строк). Клики запрещены.
- `filled`: основной режим. Клики разрешены.
- `offline`: отображается offline‑баннер. Клики запрещены.
- `error`: отображается текст ошибки из раздела 2.5. Кнопка `Повторить` повторяет загрузку.

#### 3.3. Поведение (строго)
- При выборе пункта меню:
  - отправляется `action_click` с `actionId=MENU_SELECT_L1_START|MENU_SELECT_L2_PORTFOLIO|MENU_SELECT_L3_RISKS|MENU_SELECT_L4_TARIFFS|MENU_SELECT_L5_DIVERSIFICATION` и `screenId=s02_navigation_menu`
  - выполняется переход согласно таблице навигации
- Прогресс сохраняется при каждом `screen_view` и при каждом `action_click`.

### 4. Дизайн система
- Цвета (hex): #1E5AA8, #F5A623, #333333, #555555, #666666, #999999, #F0F2F5, #FFFFFF, #E5E7EB, #4CAF50, #D32F2F
- Шрифт: Inter (fallback sans-serif).
- Сетка: 1080×1920, safe area top 96 bottom 80 left/right 48, шаг отступов 8.
- Иконки: SVG `assets/icons/`, color через `currentColor`.
- Hover/tap: фиксированы (opacity правила).
- Mobile/Web: фиксированы breakpoints и ограничения.

### 5. Анкета
#### 5.1. Вопросы и обязательность
- Экран: `QZ01_SEGMENT_QUIZ`
- Тип: `quiz`
- Иллюстрация‑референс: `assets/illustrations/QZ01_SEGMENT_QUIZ.png`

Вопросы (строго, без изменений строк):

**Q1** — `Есть ли у вас статус квалифицированного инвестора?`
- type: `single`
- required: `true`
- options (строго): `Да`, `Нет`

**Q2** — `Какой у вас опыт в инвестициях?`
- type: `single`
- required: `true`
- options (строго):
  - `Еще нет опыта`
  - `Менее 1 года`
  - `От 1 до 3 лет`
  - `От 3 до 5 лет`
  - `Более 5 лет`

**Q3** — `С какой суммы вы планируете инвестировать?`
- type: `single`
- required: `true`
- options (строго):
  - `До 300 тыс`
  - `300 тыс - 2 млн`
  - `2 - 5 млн`
  - `Более 5 млн`

**Q4** — `Ваша главная цель инвестиций?`
- type: `single`
- required: `true`
- options (строго):
  - `Накопление на крупную покупку`
  - `Получение пассивного дохода`
  - `Рост капитала`
  - `Сохранение и наследие`

**Q5** — `Какие продукты/инструменты вам наиболее интересны?`
- type: `multi`
- required: `true`
- ограничения: minSelected=1, maxSelected=5
- helperText (строго): `Возможно несколько вариантов ответа`
- options (строго):
  - `Фонды (ETF, ПИФ)`
  - `Акции`
  - `Доверительное управление / готовые портфели`
  - `Облигации`
  - `IPO`
  - `Валюта`
  - `Структурные продукты`
  - `Производные (фьючерсы, опционы)`

#### 5.2. Логика сегментации
- Q1=Да → qualified.
- Q1=Нет → Q2: (0–1 год) novice; (1–3) learner; (3+ лет) experienced.

#### 5.3. Валидация
- Кнопка `Готово` (label строго: `Готово`) активна только при валидных ответах.
- При нажатии `Готово` при невалидности переход запрещён и выполняется:
  - прокрутка к первому невалидному вопросу
  - отображение текста ошибки (строго): `Заполните все вопросы анкеты`

### Таблица состояний
| Screen ID | loading | empty | filled | error | offline | completed |
|---|---|---|---|---|---|---|
| `QZ01_SEGMENT_QUIZ` | `ALLOWED` | `REQUIRED` | `ALLOWED` | `ALLOWED` | `ALLOWED` | `ALLOWED` |
| `QZ02_SEGMENT_RESULT` | `FORBIDDEN` | `FORBIDDEN` | `REQUIRED` | `FORBIDDEN` | `ALLOWED` | `ALLOWED` |
| `s01_start` | `ALLOWED` | `FORBIDDEN` | `REQUIRED` | `ALLOWED` | `ALLOWED` | `ALLOWED` |
| `s02_navigation_menu` | `ALLOWED` | `FORBIDDEN` | `REQUIRED` | `ALLOWED` | `ALLOWED` | `ALLOWED` |
| `s02a_start_intro` | `ALLOWED` | `FORBIDDEN` | `REQUIRED` | `ALLOWED` | `ALLOWED` | `ALLOWED` |
| `s02_reality` | `ALLOWED` | `FORBIDDEN` | `REQUIRED` | `ALLOWED` | `ALLOWED` | `ALLOWED` |
| `s03_goals` | `ALLOWED` | `FORBIDDEN` | `REQUIRED` | `ALLOWED` | `ALLOWED` | `ALLOWED` |
| `s04_concepts` | `ALLOWED` | `FORBIDDEN` | `REQUIRED` | `ALLOWED` | `ALLOWED` | `ALLOWED` |
| `s05_deposit` | `ALLOWED` | `FORBIDDEN` | `REQUIRED` | `ALLOWED` | `ALLOWED` | `ALLOWED` |
| `s06_first_buy` | `ALLOWED` | `FORBIDDEN` | `REQUIRED` | `ALLOWED` | `ALLOWED` | `ALLOWED` |
| `s06a_purchase_steps` | `ALLOWED` | `FORBIDDEN` | `REQUIRED` | `ALLOWED` | `ALLOWED` | `ALLOWED` |
| `s07_rules_updated` | `ALLOWED` | `FORBIDDEN` | `REQUIRED` | `ALLOWED` | `ALLOWED` | `ALLOWED` |
| `s08_instruments_updated` | `ALLOWED` | `FORBIDDEN` | `REQUIRED` | `ALLOWED` | `ALLOWED` | `ALLOWED` |
| `s09_choice_updated` | `ALLOWED` | `FORBIDDEN` | `REQUIRED` | `ALLOWED` | `ALLOWED` | `ALLOWED` |
| `s10_courses` | `ALLOWED` | `FORBIDDEN` | `REQUIRED` | `ALLOWED` | `ALLOWED` | `ALLOWED` |
| `s11_portfolio_intro` | `ALLOWED` | `FORBIDDEN` | `REQUIRED` | `ALLOWED` | `ALLOWED` | `ALLOWED` |
| `s12_principles` | `ALLOWED` | `FORBIDDEN` | `REQUIRED` | `ALLOWED` | `ALLOWED` | `ALLOWED` |
| `s13_structure` | `ALLOWED` | `FORBIDDEN` | `REQUIRED` | `ALLOWED` | `ALLOWED` | `ALLOWED` |
| `s14_balance` | `ALLOWED` | `FORBIDDEN` | `REQUIRED` | `ALLOWED` | `ALLOWED` | `ALLOWED` |
| `s14a_portfolio_cta` | `ALLOWED` | `FORBIDDEN` | `REQUIRED` | `ALLOWED` | `ALLOWED` | `ALLOWED` |
| `s15_risks_intro` | `ALLOWED` | `FORBIDDEN` | `REQUIRED` | `ALLOWED` | `ALLOWED` | `ALLOWED` |
| `s16_risk_types` | `ALLOWED` | `FORBIDDEN` | `REQUIRED` | `ALLOWED` | `ALLOWED` | `ALLOWED` |
| `s17_protection` | `ALLOWED` | `FORBIDDEN` | `REQUIRED` | `ALLOWED` | `ALLOWED` | `ALLOWED` |
| `s18_reliable` | `ALLOWED` | `FORBIDDEN` | `REQUIRED` | `ALLOWED` | `ALLOWED` | `ALLOWED` |
| `s19_bonds` | `ALLOWED` | `FORBIDDEN` | `REQUIRED` | `ALLOWED` | `ALLOWED` | `ALLOWED` |
| `s20_capital_protection` | `ALLOWED` | `FORBIDDEN` | `REQUIRED` | `ALLOWED` | `ALLOWED` | `ALLOWED` |
| `s20a_risks_cta` | `ALLOWED` | `FORBIDDEN` | `REQUIRED` | `ALLOWED` | `ALLOWED` | `ALLOWED` |
| `s21_tariff_intro` | `ALLOWED` | `FORBIDDEN` | `REQUIRED` | `ALLOWED` | `ALLOWED` | `ALLOWED` |
| `s22_tariff_long` | `ALLOWED` | `FORBIDDEN` | `REQUIRED` | `ALLOWED` | `ALLOWED` | `ALLOWED` |
| `s23_tariff_strateg` | `ALLOWED` | `FORBIDDEN` | `REQUIRED` | `ALLOWED` | `ALLOWED` | `ALLOWED` |
| `s24_tariff_investor` | `ALLOWED` | `FORBIDDEN` | `REQUIRED` | `ALLOWED` | `ALLOWED` | `ALLOWED` |
| `s25_trust_management` | `ALLOWED` | `FORBIDDEN` | `REQUIRED` | `ALLOWED` | `ALLOWED` | `ALLOWED` |
| `s25a_tariff_cta` | `ALLOWED` | `FORBIDDEN` | `REQUIRED` | `ALLOWED` | `ALLOWED` | `ALLOWED` |
| `s26_diversification_intro` | `ALLOWED` | `FORBIDDEN` | `REQUIRED` | `ALLOWED` | `ALLOWED` | `ALLOWED` |
| `s27_what_is_div` | `ALLOWED` | `FORBIDDEN` | `REQUIRED` | `ALLOWED` | `ALLOWED` | `ALLOWED` |
| `s28_asset_allocation` | `ALLOWED` | `FORBIDDEN` | `REQUIRED` | `ALLOWED` | `ALLOWED` | `ALLOWED` |
| `s29_why_works` | `ALLOWED` | `FORBIDDEN` | `REQUIRED` | `ALLOWED` | `ALLOWED` | `ALLOWED` |
| `s30_example` | `ALLOWED` | `FORBIDDEN` | `REQUIRED` | `ALLOWED` | `ALLOWED` | `ALLOWED` |
| `s30a_diversification_cta` | `ALLOWED` | `FORBIDDEN` | `REQUIRED` | `ALLOWED` | `ALLOWED` | `ALLOWED` |
| `s31_cta` | `ALLOWED` | `FORBIDDEN` | `REQUIRED` | `ALLOWED` | `ALLOWED` | `ALLOWED` |

### Аналитика
- Каждый экран: `screen_view(screenId)` после отрисовки.
- Каждое действие: `action_click(actionId, screenId)` в момент нажатия.
- Анкета: `segment_quiz_answer(questionId,value)` при выборе; `segment_quiz_submit(segment)` при submit.

### Performance
- Конфигурация сценария ≤ 250KB.
- Preload следующего экрана в ветке обязателен.
- Lazy load ассетов обязателен.

### Accessibility
- Контраст ≥ 4.5:1.
- Размер текста ≥ 14px.
- Screen reader: aria-label для интерактивных элементов.
- Tab order: сверху вниз.

### Технические ограничения
- iOS ≥ 15, Android ≥ 10.
- Web: последние 2 версии браузеров.
- Breakpoints: 360/390/430/768/1024/1440.

### Definition of Done
- Нет незаполненных полей.
- Нет placeholder.
- Нет формулировок "можно"/"вариант"/"на усмотрение".
- Переходы покрыты на 100%.
- Состояния описаны для каждого экрана.
- Ассеты в `/assets` присутствуют и именованы по ID.
- Аналитика описана и покрывает все экраны.
