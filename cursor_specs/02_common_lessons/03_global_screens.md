## Глобальные экраны (вне веток) — детальная спецификация

### `s01_start`
- **Screenshot**: `cursor_specs/assets/slides/01_s01_start.png`
- **Text (строго)**:

```text
Finam
С чего начать?
Ваш первый шаг в мир инвестиций и финансовой свободы
Поехали
```

- **Actions (строго)**:
  - `ACTION_START_COURSE` (label: `Поехали`) → `NAVIGATE_TO:s02_navigation_menu`

---

### `s02_navigation_menu`
- **Screenshot**: `cursor_specs/assets/slides/02_s02_navigation_menu.png`
- **Text (строго)**:

```text
Выберите тему
Нажмите на раздел, чтобы перейти к обучению
С чего начать
Первые шаги и правила
Собрать портфель
Структура и баланс
Риски и защита
Как не потерять деньги
Выбор тарифа
Оптимальные условия
Диверсификация
Золотое правило
```

- **Menu items (строго)**:
  - `С чего начать` → `NAVIGATE_TO:s02a_start_intro`  (это исправление некорректного `#s03_start_intro` из исходного HTML)
  - `Собрать портфель` → `NAVIGATE_TO:s11_portfolio_intro`
  - `Риски и защита` → `NAVIGATE_TO:s15_risks_intro`
  - `Выбор тарифа` → `NAVIGATE_TO:s21_tariff_intro`
  - `Диверсификация` → `NAVIGATE_TO:s26_diversification_intro`

---

### `s31_cta`
- **Screenshot**: `cursor_specs/assets/slides/37_s31_cta.png`
- **Text (строго)**:

```text
Finam
Время действовать!
Инвестиции — это проще, чем кажется. Сделайте первый шаг уже сегодня.
Начать обучение
Открыть брокерский счёт
```

- **Actions (строго)**:
  - `ACTION_BEGIN_LEARNING` (label: `Начать обучение`) → `NAVIGATE_TO:s02_navigation_menu`
  - `ACTION_OPEN_ACCOUNT` (label: `Открыть брокерский счёт`) → `DEEPLINK:finam://account/open`

