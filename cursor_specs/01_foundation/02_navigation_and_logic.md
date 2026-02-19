## 2) Навигация и логика (жёстко фиксировано)

### 2.1. Общие правила навигации
- **Единственный Home-экран**: `s02_navigation_menu`.
- **Единственный финал курса**: `s31_cta`.
- **Кнопка “назад” ОС/браузера**:
  - на экранах веток возвращает на предыдущий экран внутри текущей ветки;
  - на `s02_navigation_menu` возвращает на `s01_start`;
  - на `s01_start` возвращает на `QZ02_SEGMENT_RESULT`.
- **Запрещено**: перескоки между ветками без возврата в меню.

### 2.2. Переходы “вперёд” (детерминированно)
Все переходы внутри ветки линейные и происходят по свайпу/клику “далее” (если есть) либо по стандартному “next”.

#### 2.2.1. Глобальные экраны
- `QZ01_SEGMENT_QUIZ` → `QZ02_SEGMENT_RESULT` (после нажатия `Готово` при валидных ответах).
- `QZ02_SEGMENT_RESULT` → `s01_start` (по нажатию Primary CTA результата).
- `s01_start` → `s02_navigation_menu` (по нажатию кнопки `Поехали`).

#### 2.2.2. Ветка 1 (УРОК 1)
Линейно по порядку экранов из `01_screen_sequence.md`, завершение:
- `s10_courses` → `s02_navigation_menu` (без условий).

#### 2.2.3. Ветка 2 (УРОК 2)
Завершение:
- `s14a_portfolio_cta` → `s02_navigation_menu` по действию `ACTION_BACK_TO_MENU`.

#### 2.2.4. Ветка 3 (УРОК 3)
Завершение:
- `s20a_risks_cta` → `s02_navigation_menu` по действию `ACTION_BACK_TO_MENU`.

#### 2.2.5. Ветка 4 (УРОК 4)
Завершение:
- `s25a_tariff_cta` → `s02_navigation_menu` по действию `ACTION_BACK_TO_MENU`.

#### 2.2.6. Ветка 5 (УРОК 5)
Завершение:
- `s30a_diversification_cta` → `s31_cta` по действию `ACTION_FINISH_COURSE`.

### 2.3. Кликабельные элементы и их назначения (Action IDs)
Все кнопки/ссылки должны быть привязаны к **actionId**. Дальнейшее сопоставление actionId → destination фиксируется в `cursor_specs/02_common_lessons/02_cta_and_links.md`.

#### 2.3.1. Глобальные
- `ACTION_START_COURSE` — кнопка `Поехали` на `s01_start`.
- `ACTION_OPEN_MENU` — переход на `s02_navigation_menu` (используется в логике, не отображается как кнопка).
- `ACTION_BEGIN_LEARNING_FROM_RESULT` — кнопка `Перейти к обучению` на `QZ02_SEGMENT_RESULT`.

#### 2.3.2. Ветка 1
- `ACTION_OPEN_GLOSSARY` — ссылка `Изучить глоссарий` на `s04_concepts`.
- `ACTION_DEPOSIT_PRIMARY` — кнопка `Пополнить счёт и получить бонус` на `s05_deposit`.
- `ACTION_DEPOSIT_ALREADY_DONE_TO_BUY` — кнопка `Счёт уже пополнен? К покупкам` на `s05_deposit`.
- `ACTION_FIRST_BUY_CHOOSE_ASSET` — кнопка `Выбрать актив и купить` на `s06_first_buy`.
- `ACTION_GO_TO_PRODUCT_STORE` — кнопка `Перейти в магазин продуктов` на `s09_choice_updated`.
- `ACTION_OPEN_COURSE_FAST_START` — карточка `Быстрый старт` на `s10_courses`.
- `ACTION_OPEN_COURSE_STOCKS` — карточка `Как торговать акциями?` на `s10_courses`.
- `ACTION_OPEN_COURSE_BONDS` — карточка `Как торговать облигациями?` на `s10_courses`.

#### 2.3.3. Ветка 2
- `ACTION_PORTFOLIO_BUILDER` — кнопка `Собрать портфель / Перейти в конструктор` на `s14a_portfolio_cta`.
- `ACTION_PORTFOLIO_DEEP_COURSE` — кнопка `Пройти углубленный курс "Портфельное инвестирование"` на `s14a_portfolio_cta`.
- `ACTION_BACK_TO_MENU` — ссылка/кнопка `Вернуться к выбору темы` на `s14a_portfolio_cta`.

#### 2.3.4. Ветка 3
- `ACTION_BUY_OFZ` — кнопка `Купить ОФЗ` на `s20a_risks_cta`.
- `ACTION_RISK_MANAGEMENT_COURSE` — кнопка `Изучить управление рисками / Перейти к курсу` на `s20a_risks_cta`.
- `ACTION_BACK_TO_MENU` — ссылка/кнопка `Вернуться к выбору темы` на `s20a_risks_cta`.

#### 2.3.5. Ветка 4
- `ACTION_SELECT_TARIFF_INVESTOR` — кнопка `Выбрать` (Инвестор) на `s25a_tariff_cta`.
- `ACTION_SELECT_TARIFF_STRATEG` — кнопка `Выбрать` (Стратег) на `s25a_tariff_cta`.
- `ACTION_SELECT_TARIFF_LONG` — кнопка `Выбрать` (Долгосрочный) на `s25a_tariff_cta`.
- `ACTION_SELECT_TARIFF_TRUST` — кнопка `Выбрать` (Доверительное) на `s25a_tariff_cta`.
- `ACTION_BACK_TO_MENU` — ссылка/кнопка `Вернуться к выбору темы` на `s25a_tariff_cta`.

#### 2.3.6. Ветка 5
- `ACTION_DIVERSIFICATION_PORTFOLIO_BUILDER` — кнопка `Собрать портфель / Использовать конструктор` на `s30a_diversification_cta`.
- `ACTION_GET_EXPERT_CONSULTATION` — кнопка `Получить консультацию` на `s30a_diversification_cta`.
- `ACTION_FINISH_COURSE` — кнопка `Завершить обучение` на `s30a_diversification_cta`.

#### 2.3.7. Финал
- `ACTION_BEGIN_LEARNING` — кнопка `Начать обучение` на `s31_cta`.
- `ACTION_OPEN_ACCOUNT` — кнопка `Открыть брокерский счёт` на `s31_cta`.

