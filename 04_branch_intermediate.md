## 04 Ветка Intermediate — 04_branch_intermediate.md
### ЖЁСТКИЕ ТРЕБОВАНИЯ
- Любые альтернативы запрещены.
- Последовательность экранов фиксирована.

### Полная последовательность (строго)
01. `s02_navigation_menu`
02. `s11_portfolio_intro`
03. `s12_principles`
04. `s13_structure`
05. `s14_balance`
06. `s14a_portfolio_cta`
07. `s02_navigation_menu`
08. `s15_risks_intro`
09. `s16_risk_types`
10. `s17_protection`
11. `s18_reliable`
12. `s19_bonds`
13. `s20_capital_protection`
14. `s20a_risks_cta`
15. `s02_navigation_menu`

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

#### `s11_portfolio_intro`
- Type: `lesson`
- Иллюстрация: `assets/images/s11_portfolio_intro.png`
- Текст (строго):

```text
Раздел 3
Как собрать первый портфель
Создайте сбалансированный набор инвестиций для ваших целей
```
- Состояния: loading=ALLOWED, empty=FORBIDDEN, filled=REQUIRED, error=ALLOWED, offline=ALLOWED, completed=ALLOWED
- Переходы (строго):
  - `s11_portfolio_intro` → `s12_principles` | condition: `NEXT` | type: `linear`
- Ошибки: см. CORE раздел 2.6 (тексты фиксированы).

#### `s12_principles`
- Type: `lesson`
- Иллюстрация: `assets/images/s12_principles.png`
- Текст (строго):

```text
Принципы формирования портфеля
1
Цель и риск
Определите, чего хотите достичь, срок инвестирования и готовность к риску.
2
Выбор инструментов
Подберите активы под свой профиль: консервативный или агрессивный.
3
Распределение
Разделите капитал между акциями, облигациями и фондами.
4
Ребалансировка
Регулярно восстанавливайте исходные пропорции портфеля.
```
- Состояния: loading=ALLOWED, empty=FORBIDDEN, filled=REQUIRED, error=ALLOWED, offline=ALLOWED, completed=ALLOWED
- Переходы (строго):
  - `s12_principles` → `s13_structure` | condition: `NEXT` | type: `linear`
- Ошибки: см. CORE раздел 2.6 (тексты фиксированы).

#### `s13_structure`
- Type: `lesson`
- Иллюстрация: `assets/images/s13_structure.png`
- Текст (строго):

```text
Образцовая структура портфеля
Баланс
50/50
Сердце — Рост
40–50%
Глобальные ETF
Акции лидеров рынка
Потенциал роста капитала
Мозг — Защита
50–60%
ОФЗ (Гособлигации)
Корпоративные облигации
Денежный резерв
```
- Состояния: loading=ALLOWED, empty=FORBIDDEN, filled=REQUIRED, error=ALLOWED, offline=ALLOWED, completed=ALLOWED
- Переходы (строго):
  - `s13_structure` → `s14_balance` | condition: `NEXT` | type: `linear`
- Ошибки: см. CORE раздел 2.6 (тексты фиксированы).

#### `s14_balance`
- Type: `lesson`
- Иллюстрация: `assets/images/s14_balance.png`
- Текст (строго):

```text
Баланс риска и доходности
Активное
Попытка обогнать рынок за счет частого выбора бумаг.
Потенциально высокая доходность
Требует много времени и знаний
Высокий риск ошибок
VS
Пассивное
Следование за рынком (купил и держи).
Среднерыночная доходность
Минимум времени (1 час в год)
Низкие комиссии и стресс
Совет новичку
Начните с пассивного подхода. Это надежнее и проще для старта.
```
- Состояния: loading=ALLOWED, empty=FORBIDDEN, filled=REQUIRED, error=ALLOWED, offline=ALLOWED, completed=ALLOWED
- Переходы (строго):
  - `s14_balance` → `s14a_portfolio_cta` | condition: `NEXT` | type: `linear`
- Ошибки: см. CORE раздел 2.6 (тексты фиксированы).

#### `s14a_portfolio_cta`
- Type: `lesson`
- Иллюстрация: `assets/images/s14a_portfolio_cta.png`
- Текст (строго):

```text
ИТОГИ УРОКА 2
Ваш следующий шаг
Вы узнали принципы создания сбалансированного портфеля. Теперь пора применить знания на практике.
💼
Собрать портфель
Перейти в конструктор
Пройти углубленный курс
"Портфельное инвестирование"
Вернуться к выбору темы
```
- Состояния: loading=ALLOWED, empty=FORBIDDEN, filled=REQUIRED, error=ALLOWED, offline=ALLOWED, completed=ALLOWED
- Переходы (строго):
  - `s14a_portfolio_cta` → `s02_navigation_menu` | condition: `END_OF_LESSON` | type: `return`
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

#### `s15_risks_intro`
- Type: `lesson`
- Иллюстрация: `assets/images/s15_risks_intro.png`
- Текст (строго):

```text
Раздел 4
Как избежать рисков
Узнайте, как защитить свои вложения от потерь
```
- Состояния: loading=ALLOWED, empty=FORBIDDEN, filled=REQUIRED, error=ALLOWED, offline=ALLOWED, completed=ALLOWED
- Переходы (строго):
  - `s15_risks_intro` → `s16_risk_types` | condition: `NEXT` | type: `linear`
- Ошибки: см. CORE раздел 2.6 (тексты фиксированы).

#### `s16_risk_types`
- Type: `lesson`
- Иллюстрация: `assets/images/s16_risk_types.png`
- Текст (строго):

```text
Возможные риски
Рыночный риск
Стоимость активов может снизиться из-за новостей или кризиса.
Риск ликвидности
Сложности с быстрой продажей актива по выгодной цене.
Кредитный риск
Банкротство компании-эмитента (невозможность вернуть долги).
```
- Состояния: loading=ALLOWED, empty=FORBIDDEN, filled=REQUIRED, error=ALLOWED, offline=ALLOWED, completed=ALLOWED
- Переходы (строго):
  - `s16_risk_types` → `s17_protection` | condition: `NEXT` | type: `linear`
- Ошибки: см. CORE раздел 2.6 (тексты фиксированы).

#### `s17_protection`
- Type: `lesson`
- Иллюстрация: `assets/images/s17_protection.png`
- Текст (строго):

```text
Защита от потерь
Диверсификация
Не кладите все яйца в одну корзину. Распределяйте средства между разными активами.
Ликвидные активы
Держите часть средств в инструментах, которые можно быстро продать без потери стоимости.
Защитные инструменты
Используйте облигации и золото для стабилизации портфеля в периоды турбулентности.
```
- Состояния: loading=ALLOWED, empty=FORBIDDEN, filled=REQUIRED, error=ALLOWED, offline=ALLOWED, completed=ALLOWED
- Переходы (строго):
  - `s17_protection` → `s18_reliable` | condition: `NEXT` | type: `linear`
- Ошибки: см. CORE раздел 2.6 (тексты фиксированы).

#### `s18_reliable`
- Type: `lesson`
- Иллюстрация: `assets/images/s18_reliable.png`
- Текст (строго):

```text
Надежные инструменты
Для новичка надежность важнее высокой доходности. На что смотреть при выборе?
Низкая волатильность
Цена актива меняется плавно, без резких скачков вверх или вниз.
Высокая ликвидность
Возможность быстро продать актив по рыночной цене в любой момент.
Прозрачность
Понятный эмитент (государство или крупная компания) и предсказуемый доход.
```
- Состояния: loading=ALLOWED, empty=FORBIDDEN, filled=REQUIRED, error=ALLOWED, offline=ALLOWED, completed=ALLOWED
- Переходы (строго):
  - `s18_reliable` → `s19_bonds` | condition: `NEXT` | type: `linear`
- Ошибки: см. CORE раздел 2.6 (тексты фиксированы).

#### `s19_bonds`
- Type: `lesson`
- Иллюстрация: `assets/images/s19_bonds.png`
- Текст (строго):

```text
Гос. и корпоративные облигации
Государственные
ОФЗ
Эмитент: Минфин РФ
Надежность: Максимальная (гарантия государства)
Доходность: Умеренная, чуть выше инфляции
Корпоративные
Облигации компаний
Эмитент: Газпром, МТС, Сбер и др.
Надежность: Зависит от компании (выбирайте лидеров)
Доходность: Выше, чем у ОФЗ
```
- Состояния: loading=ALLOWED, empty=FORBIDDEN, filled=REQUIRED, error=ALLOWED, offline=ALLOWED, completed=ALLOWED
- Переходы (строго):
  - `s19_bonds` → `s20_capital_protection` | condition: `NEXT` | type: `linear`
- Ошибки: см. CORE раздел 2.6 (тексты фиксированы).

#### `s20_capital_protection`
- Type: `lesson`
- Иллюстрация: `assets/images/s20_capital_protection.png`
- Текст (строго):

```text
Инструменты с защитой капитала
Потенциальный
доход
100% Защита
капитала
Гарантия возврата
В конце срока вы получаете обратно 100% вложенных средств, даже если рынок упал.
Участие в росте
Если выбранный актив (например, золото или акции) вырастет, вы получите доход.
Структурные продукты: Это готовые решения от Финам, сочетающие надежность депозита и доходность рынка акций.
```
- Состояния: loading=ALLOWED, empty=FORBIDDEN, filled=REQUIRED, error=ALLOWED, offline=ALLOWED, completed=ALLOWED
- Переходы (строго):
  - `s20_capital_protection` → `s20a_risks_cta` | condition: `NEXT` | type: `linear`
- Ошибки: см. CORE раздел 2.6 (тексты фиксированы).

#### `s20a_risks_cta`
- Type: `lesson`
- Иллюстрация: `assets/images/s20a_risks_cta.png`
- Текст (строго):

```text
ИТОГИ УРОКА 3
Защитите свои вложения
Самый надежный способ начать инвестировать без стресса — выбрать государственные облигации.
🛡️
ОФЗ
Купить ОФЗ
Самый низкий риск
Изучить управление рисками
Перейти к курсу
Вернуться к выбору темы
```
- Состояния: loading=ALLOWED, empty=FORBIDDEN, filled=REQUIRED, error=ALLOWED, offline=ALLOWED, completed=ALLOWED
- Переходы (строго):
  - `s20a_risks_cta` → `s02_navigation_menu` | condition: `END_OF_LESSON` | type: `return`
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
- После `s14a_portfolio_cta` и `s20a_risks_cta` выполняется возврат на `s02_navigation_menu` (END_OF_LESSON).
