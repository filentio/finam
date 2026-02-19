## 03 Ветка Beginner — 03_branch_beginner.md
### ЖЁСТКИЕ ТРЕБОВАНИЯ
- Любые альтернативы запрещены.
- Последовательность экранов фиксирована.

### Полная последовательность (строго)
01. `s02_navigation_menu`
02. `s02a_start_intro`
03. `s02_reality`
04. `s03_goals`
05. `s04_concepts`
06. `s05_deposit`
07. `s06_first_buy`
08. `s06a_purchase_steps`
09. `s07_rules_updated`
10. `s08_instruments_updated`
11. `s09_choice_updated`
12. `s10_courses`
13. `s02_navigation_menu`

### Экран‑за‑экраном
#### `s02_navigation_menu`
- Type: `branch`
- Иллюстрация: `assets/images/s02_navigation_menu.png`
- Текст (строго):

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
- Состояния: loading=ALLOWED, empty=FORBIDDEN, filled=REQUIRED, error=ALLOWED, offline=ALLOWED, completed=ALLOWED
- Переходы (строго):
  - `s02_navigation_menu` → `s02a_start_intro` | condition: `MENU_SELECT_L1_START` | type: `branch`
  - `s02_navigation_menu` → `s11_portfolio_intro` | condition: `MENU_SELECT_L2_PORTFOLIO` | type: `branch`
  - `s02_navigation_menu` → `s15_risks_intro` | condition: `MENU_SELECT_L3_RISKS` | type: `branch`
  - `s02_navigation_menu` → `s21_tariff_intro` | condition: `MENU_SELECT_L4_TARIFFS` | type: `branch`
  - `s02_navigation_menu` → `s26_diversification_intro` | condition: `MENU_SELECT_L5_DIVERSIFICATION` | type: `branch`
- Ошибки: см. CORE раздел 2.6 (тексты фиксированы).

#### `s02a_start_intro`
- Type: `lesson`
- Иллюстрация: `assets/images/s02a_start_intro.png`
- Текст (строго):

```text
УРОК 1
С чего
начать?
Разберемся в основах, пополним счет и сделаем первую покупку.
```
- Состояния: loading=ALLOWED, empty=FORBIDDEN, filled=REQUIRED, error=ALLOWED, offline=ALLOWED, completed=ALLOWED
- Переходы (строго):
  - `s02a_start_intro` → `s02_reality` | condition: `NEXT` | type: `linear`
- Ошибки: см. CORE раздел 2.6 (тексты фиксированы).

#### `s02_reality`
- Type: `lesson`
- Иллюстрация: `assets/images/s02_reality.png`
- Текст (строго):

```text
Инвестиции без опыта — это реально
Доступно каждому
Не нужно быть аналитиком или профессиональным трейдером
Готовые решения
Умные алгоритмы и стратегии работают за вас
Простой старт
Подходит даже новичкам с нулевыми знаниями
Всё в одном приложении:
брокер, сигналы, курсы
```
- Состояния: loading=ALLOWED, empty=FORBIDDEN, filled=REQUIRED, error=ALLOWED, offline=ALLOWED, completed=ALLOWED
- Переходы (строго):
  - `s02_reality` → `s03_goals` | condition: `NEXT` | type: `linear`
- Ошибки: см. CORE раздел 2.6 (тексты фиксированы).

#### `s03_goals`
- Type: `lesson`
- Иллюстрация: `assets/images/s03_goals.png`
- Текст (строго):

```text
Истинные цели инвестиций
Вложение денег сегодня, чтобы они росли завтра
Обгонять инфляцию
Сохранить ценность денег
Пассивный доход
Деньги работают на вас
Подушка безопасности
Финансовая защита
Финансовые цели
Квартира, авто, образование
Важно: Инвестиции помогают достичь целей быстрее, чем простое накопление.
```
- Состояния: loading=ALLOWED, empty=FORBIDDEN, filled=REQUIRED, error=ALLOWED, offline=ALLOWED, completed=ALLOWED
- Переходы (строго):
  - `s03_goals` → `s04_concepts` | condition: `NEXT` | type: `linear`
- Ошибки: см. CORE раздел 2.6 (тексты фиксированы).

#### `s04_concepts`
- Type: `lesson`
- Иллюстрация: `assets/images/s04_concepts.png`
- Текст (строго):

```text
Основные понятия инвестирования
Ценная бумага
Документ, подтверждающий ваши права на актив (акция, облигация).
Доход
Финансовая награда за ваше терпение и дисциплину.
Экономика
Бизнес страны. Состояние экономики влияет на ваши инвестиции.
Биржа
Площадка для торговли ценными бумагами (Московская, СПБ).
Изучить глоссарий
```
- Состояния: loading=ALLOWED, empty=FORBIDDEN, filled=REQUIRED, error=ALLOWED, offline=ALLOWED, completed=ALLOWED
- Переходы (строго):
  - `s04_concepts` → `s05_deposit` | condition: `NEXT` | type: `linear`
- Ошибки: см. CORE раздел 2.6 (тексты фиксированы).

#### `s05_deposit`
- Type: `lesson`
- Иллюстрация: `assets/images/s05_deposit.png`
- Текст (строго):

```text
Начинаем
инвестировать
Сделайте первое пополнение счёта, чтобы иметь возможность быстро купить интересующие инструменты.
Бонус от Финам
+1 500
бонусов
При пополнении от 30 000 ₽
Пополнить счёт и получить бонус
Счёт уже пополнен? К покупкам
Акция действует для новых клиентов
```
- Состояния: loading=ALLOWED, empty=FORBIDDEN, filled=REQUIRED, error=ALLOWED, offline=ALLOWED, completed=ALLOWED
- Переходы (строго):
  - `s05_deposit` → `s06_first_buy` | condition: `NEXT` | type: `linear`
  - `s05_deposit` → `s06_first_buy` | condition: `ACTION_DEPOSIT_ALREADY_DONE_TO_BUY` | type: `action`
- Ошибки: см. CORE раздел 2.6 (тексты фиксированы).

#### `s06_first_buy`
- Type: `lesson`
- Иллюстрация: `assets/images/s06_first_buy.png`
- Текст (строго):

```text
Первая покупка
Ваш счёт пополнен. Теперь самое интересное — станьте совладельцем крупнейших компаний.
Выберите актив
Найдите акции Газпрома, Сбера или Яндекса в каталоге и нажмите кнопку «Купить».
Выбрать актив и купить
```
- Состояния: loading=ALLOWED, empty=FORBIDDEN, filled=REQUIRED, error=ALLOWED, offline=ALLOWED, completed=ALLOWED
- Переходы (строго):
  - `s06_first_buy` → `s06a_purchase_steps` | condition: `NEXT` | type: `linear`
- Ошибки: см. CORE раздел 2.6 (тексты фиксированы).

#### `s06a_purchase_steps`
- Type: `lesson`
- Иллюстрация: `assets/images/s06a_purchase_steps.png`
- Текст (строго):

```text
Делаем первую покупку
1
Выберите инструмент
Найдите акцию или фонд в каталоге приложения
2
Укажите сумму
Введите количество лотов или сумму покупки
3
Подтвердите
Нажмите кнопку «Купить» и подтвердите операцию
Готово!
Отслеживайте рост актива в вашем портфеле
```
- Состояния: loading=ALLOWED, empty=FORBIDDEN, filled=REQUIRED, error=ALLOWED, offline=ALLOWED, completed=ALLOWED
- Переходы (строго):
  - `s06a_purchase_steps` → `s07_rules_updated` | condition: `NEXT` | type: `linear`
- Ошибки: см. CORE раздел 2.6 (тексты фиксированы).

#### `s07_rules_updated`
- Type: `lesson`
- Иллюстрация: `assets/images/s07_rules_updated.png`
- Текст (строго):

```text
Правила
инвестирования
Начинайте с малого
Начинайте с небольших вложений — учитесь на практике без стресса.
Диверсифицируйте
Несколько разных инструментов снижают общий риск портфеля.
Следите за рисками
Не гонитесь за сверхдоходностью, оценивайте возможные потери.
Будьте консервативны
На старте выбирайте надежные инструменты: облигации и ETF.
```
- Состояния: loading=ALLOWED, empty=FORBIDDEN, filled=REQUIRED, error=ALLOWED, offline=ALLOWED, completed=ALLOWED
- Переходы (строго):
  - `s07_rules_updated` → `s08_instruments_updated` | condition: `NEXT` | type: `linear`
- Ошибки: см. CORE раздел 2.6 (тексты фиксированы).

#### `s08_instruments_updated`
- Type: `lesson`
- Иллюстрация: `assets/images/s08_instruments_updated.png`
- Текст (строго):

```text
Выберите инструмент
Акции
Доля в бизнесе компании
Потенциально высокий доход
Выше риск колебаний цены
Облигации
Даём в долг под проценты
Стабильный, предсказуемый доход
Низкий риск (особенно ОФЗ)
ETF и ПИФ
Готовая корзина активов
Автоматическая диверсификация
Идеально подходит новичкам
```
- Состояния: loading=ALLOWED, empty=FORBIDDEN, filled=REQUIRED, error=ALLOWED, offline=ALLOWED, completed=ALLOWED
- Переходы (строго):
  - `s08_instruments_updated` → `s09_choice_updated` | condition: `NEXT` | type: `linear`
- Ошибки: см. CORE раздел 2.6 (тексты фиксированы).

#### `s09_choice_updated`
- Type: `lesson`
- Иллюстрация: `assets/images/s09_choice_updated.png`
- Текст (строго):

```text
Как выбрать первый инструмент?
Низкий порог входа
Начать можно с минимальной суммы — от 1 000 ₽.
Прозрачная история
Выбирайте ликвидные активы, которые легко купить и продать.
Для старта подойдут
Надежные инструменты с понятной доходностью.
Рекомендуем:
ОФЗ
Сбер
Газпром
ETF MOEX
Перейти в магазин продуктов
```
- Состояния: loading=ALLOWED, empty=FORBIDDEN, filled=REQUIRED, error=ALLOWED, offline=ALLOWED, completed=ALLOWED
- Переходы (строго):
  - `s09_choice_updated` → `s10_courses` | condition: `NEXT` | type: `linear`
- Ошибки: см. CORE раздел 2.6 (тексты фиксированы).

#### `s10_courses`
- Type: `lesson`
- Иллюстрация: `assets/images/s10_courses.png`
- Текст (строго):

```text
Готовы узнать больше?
Чтобы начать безопасный путь в инвестициях, команда Финам подготовила для вас специальные обучающие курсы.
Быстрый старт
Основы инвестирования
Как торговать акциями?
Работа с акциями
Как торговать облигациями?
Стабильный доход
```
- Состояния: loading=ALLOWED, empty=FORBIDDEN, filled=REQUIRED, error=ALLOWED, offline=ALLOWED, completed=ALLOWED
- Переходы (строго):
  - `s10_courses` → `s02_navigation_menu` | condition: `END_OF_LESSON` | type: `return`
- Ошибки: см. CORE раздел 2.6 (тексты фиксированы).

#### `s02_navigation_menu`
- Type: `branch`
- Иллюстрация: `assets/images/s02_navigation_menu.png`
- Текст (строго):

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
- Состояния: loading=ALLOWED, empty=FORBIDDEN, filled=REQUIRED, error=ALLOWED, offline=ALLOWED, completed=ALLOWED
- Переходы (строго):
  - `s02_navigation_menu` → `s02a_start_intro` | condition: `MENU_SELECT_L1_START` | type: `branch`
  - `s02_navigation_menu` → `s11_portfolio_intro` | condition: `MENU_SELECT_L2_PORTFOLIO` | type: `branch`
  - `s02_navigation_menu` → `s15_risks_intro` | condition: `MENU_SELECT_L3_RISKS` | type: `branch`
  - `s02_navigation_menu` → `s21_tariff_intro` | condition: `MENU_SELECT_L4_TARIFFS` | type: `branch`
  - `s02_navigation_menu` → `s26_diversification_intro` | condition: `MENU_SELECT_L5_DIVERSIFICATION` | type: `branch`
- Ошибки: см. CORE раздел 2.6 (тексты фиксированы).

### Финальный экран
- `s02_navigation_menu`

### Возврат в общий поток
- После `s10_courses` выполняется возврат на `s02_navigation_menu` (END_OF_LESSON).
