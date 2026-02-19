## 05 Ветка Advanced — 05_branch_advanced.md
### ЖЁСТКИЕ ТРЕБОВАНИЯ
- Любые альтернативы запрещены.
- Последовательность экранов фиксирована.

### Полная последовательность (строго)
01. `s02_navigation_menu`
02. `s21_tariff_intro`
03. `s22_tariff_long`
04. `s23_tariff_strateg`
05. `s24_tariff_investor`
06. `s25_trust_management`
07. `s25a_tariff_cta`
08. `s02_navigation_menu`
09. `s26_diversification_intro`
10. `s27_what_is_div`
11. `s28_asset_allocation`
12. `s29_why_works`
13. `s30_example`
14. `s30a_diversification_cta`
15. `s31_cta`

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

#### `s21_tariff_intro`
- Type: `lesson`
- Иллюстрация: `assets/images/s21_tariff_intro.png`
- Текст (строго):

```text
Раздел 5
Какой тариф выбрать
Подберите оптимальные условия для вашей стратегии
```
- Состояния: loading=ALLOWED, empty=FORBIDDEN, filled=REQUIRED, error=ALLOWED, offline=ALLOWED, completed=ALLOWED
- Переходы (строго):
  - `s21_tariff_intro` → `s22_tariff_long` | condition: `NEXT` | type: `linear`
- Ошибки: см. CORE раздел 2.6 (тексты фиксированы).

#### `s22_tariff_long`
- Type: `lesson`
- Иллюстрация: `assets/images/s22_tariff_long.png`
- Текст (строго):

```text
Тариф «Долгосрочный портфель»
Выбор новичков
0 ₽
абонентская плата
Бесплатное обслуживание
Платите только комиссию за сделки
Идеально для «Купил и держи»
Выгодно для редких сделок
Отсутствие скрытых платежей
Всё прозрачно и понятно
Оптимальный выбор для старта инвестиций с небольшими суммами.
```
- Состояния: loading=ALLOWED, empty=FORBIDDEN, filled=REQUIRED, error=ALLOWED, offline=ALLOWED, completed=ALLOWED
- Переходы (строго):
  - `s22_tariff_long` → `s23_tariff_strateg` | condition: `NEXT` | type: `linear`
- Ошибки: см. CORE раздел 2.6 (тексты фиксированы).

#### `s23_tariff_strateg`
- Type: `lesson`
- Иллюстрация: `assets/images/s23_tariff_strateg.png`
- Текст (строго):

```text
Тариф «Стратег»
Идеальный выбор для активной торговли
Стратег
Низкая комиссия
от 0.035% за сделку
Профессиональные терминалы
Quik, Transaq — бесплатно
Выгодное маржинальное кредитование
Рекомендуется при обороте от 500 000 ₽ в месяц
```
- Состояния: loading=ALLOWED, empty=FORBIDDEN, filled=REQUIRED, error=ALLOWED, offline=ALLOWED, completed=ALLOWED
- Переходы (строго):
  - `s23_tariff_strateg` → `s24_tariff_investor` | condition: `NEXT` | type: `linear`
- Ошибки: см. CORE раздел 2.6 (тексты фиксированы).

#### `s24_tariff_investor`
- Type: `lesson`
- Иллюстрация: `assets/images/s24_tariff_investor.png`
- Текст (строго):

```text
Тариф «Инвестор»
Максимальная простота и удобство
Единая комиссия
Прозрачные условия без сложных расчетов и скрытых списаний.
Удобное приложение
Finam Trade — всё для торговли и анализа в вашем смартфоне.
Доступ ко всем рынкам
Акции, облигации, валюта и фонды на одной платформе.
Отличный старт для тех, кто хочет попробовать всё.
```
- Состояния: loading=ALLOWED, empty=FORBIDDEN, filled=REQUIRED, error=ALLOWED, offline=ALLOWED, completed=ALLOWED
- Переходы (строго):
  - `s24_tariff_investor` → `s25_trust_management` | condition: `NEXT` | type: `linear`
- Ошибки: см. CORE раздел 2.6 (тексты фиксированы).

#### `s25_trust_management`
- Type: `lesson`
- Иллюстрация: `assets/images/s25_trust_management.png`
- Текст (строго):

```text
Не хотите долго разбираться?
Если нет времени на анализ рынка, доверьте управление профессионалам.
Автоследование
Сервис Comon.ru позволяет автоматически копировать сделки успешных трейдеров на вашем счете.
Выбор из 1000+ стратегий
Доверительное управление
Индивидуальные стратегии для крупных капиталов. Управляющий принимает решения за вас.
Полная делегация
```
- Состояния: loading=ALLOWED, empty=FORBIDDEN, filled=REQUIRED, error=ALLOWED, offline=ALLOWED, completed=ALLOWED
- Переходы (строго):
  - `s25_trust_management` → `s25a_tariff_cta` | condition: `NEXT` | type: `linear`
- Ошибки: см. CORE раздел 2.6 (тексты фиксированы).

#### `s25a_tariff_cta`
- Type: `lesson`
- Иллюстрация: `assets/images/s25a_tariff_cta.png`
- Текст (строго):

```text
ИТОГИ УРОКА 4
Выберите тариф
Подключите тариф, который подходит под ваш стиль.
Инвестор
Для начинающих
Выбрать
Стратег
Для активных
Выбрать
Долгосрочный
Без абонплаты
Выбрать
Доверительное
Управление
Выбрать
Вернуться к выбору темы
```
- Состояния: loading=ALLOWED, empty=FORBIDDEN, filled=REQUIRED, error=ALLOWED, offline=ALLOWED, completed=ALLOWED
- Переходы (строго):
  - `s25a_tariff_cta` → `s02_navigation_menu` | condition: `END_OF_LESSON` | type: `return`
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

#### `s26_diversification_intro`
- Type: `lesson`
- Иллюстрация: `assets/images/s26_diversification_intro.png`
- Текст (строго):

```text
Раздел 6
Диверсификация
Золотое правило инвестора: не кладите все яйца в одну корзину
```
- Состояния: loading=ALLOWED, empty=FORBIDDEN, filled=REQUIRED, error=ALLOWED, offline=ALLOWED, completed=ALLOWED
- Переходы (строго):
  - `s26_diversification_intro` → `s27_what_is_div` | condition: `NEXT` | type: `linear`
- Ошибки: см. CORE раздел 2.6 (тексты фиксированы).

#### `s27_what_is_div`
- Type: `lesson`
- Иллюстрация: `assets/images/s27_what_is_div.png`
- Текст (строго):

```text
Что такое диверсификация?
Это распределение капитала между разными активами для снижения рисков.
«Не кладите все яйца в одну корзину»
Без диверсификации
Купили акции одной компании. Если она обанкротится — вы потеряете всё.
С диверсификацией
Купили акции 5 компаний. Одна упала, но остальные выросли — вы в плюсе.
```
- Состояния: loading=ALLOWED, empty=FORBIDDEN, filled=REQUIRED, error=ALLOWED, offline=ALLOWED, completed=ALLOWED
- Переходы (строго):
  - `s27_what_is_div` → `s28_asset_allocation` | condition: `NEXT` | type: `linear`
- Ошибки: см. CORE раздел 2.6 (тексты фиксированы).

#### `s28_asset_allocation`
- Type: `lesson`
- Иллюстрация: `assets/images/s28_asset_allocation.png`
- Текст (строго):

```text
Как распределить активы?
Двигатель
Акции
Обеспечивают основной рост капитала и обгоняют инфляцию на длинной дистанции.
Подушка
Облигации
Гасят колебания портфеля и приносят стабильный, предсказуемый доход.
Баланс
ETF и ПИФ
Помогают дешево и быстро диверсифицировать портфель по странам и отраслям.
```
- Состояния: loading=ALLOWED, empty=FORBIDDEN, filled=REQUIRED, error=ALLOWED, offline=ALLOWED, completed=ALLOWED
- Переходы (строго):
  - `s28_asset_allocation` → `s29_why_works` | condition: `NEXT` | type: `linear`
- Ошибки: см. CORE раздел 2.6 (тексты фиксированы).

#### `s29_why_works`
- Type: `lesson`
- Иллюстрация: `assets/images/s29_why_works.png`
- Текст (строго):

```text
Почему это работает?
Акции упали
Кризис на рынке
+
Золото выросло
Защитный актив
=
Портфель стабилен
Убытки компенсированы
Разная реакция
Разные активы по-разному реагируют на одни и те же события. Когда одни падают, другие часто растут, сохраняя ваши деньги.
```
- Состояния: loading=ALLOWED, empty=FORBIDDEN, filled=REQUIRED, error=ALLOWED, offline=ALLOWED, completed=ALLOWED
- Переходы (строго):
  - `s29_why_works` → `s30_example` | condition: `NEXT` | type: `linear`
- Ошибки: см. CORE раздел 2.6 (тексты фиксированы).

#### `s30_example`
- Type: `lesson`
- Иллюстрация: `assets/images/s30_example.png`
- Текст (строго):

```text
Пример портфеля
Баланс
Акции РФ
50%
Потенциал роста
Сбер
Лукойл
Яндекс
Облигации
40%
Защитная часть
ОФЗ 26238
МТС
Золото / Фонды
10%
Страховка от кризиса
GLDRUB
Фонды
```
- Состояния: loading=ALLOWED, empty=FORBIDDEN, filled=REQUIRED, error=ALLOWED, offline=ALLOWED, completed=ALLOWED
- Переходы (строго):
  - `s30_example` → `s30a_diversification_cta` | condition: `NEXT` | type: `linear`
- Ошибки: см. CORE раздел 2.6 (тексты фиксированы).

#### `s30a_diversification_cta`
- Type: `lesson`
- Иллюстрация: `assets/images/s30a_diversification_cta.png`
- Текст (строго):

```text
ИТОГИ УРОКА 5
Соберите идеальный портфель
Используйте принцип диверсификации, чтобы снизить риски и повысить доходность.
🧩
Собрать портфель
Использовать конструктор
Нужна помощь эксперта?
Получить консультацию
Завершить обучение
```
- Состояния: loading=ALLOWED, empty=FORBIDDEN, filled=REQUIRED, error=ALLOWED, offline=ALLOWED, completed=ALLOWED
- Переходы (строго):
  - `s30a_diversification_cta` → `s31_cta` | condition: `ACTION_FINISH_COURSE` | type: `action`
- Ошибки: см. CORE раздел 2.6 (тексты фиксированы).

#### `s31_cta`
- Type: `story`
- Иллюстрация: `assets/images/s31_cta.png`
- Текст (строго):

```text
Finam
Время действовать!
Инвестиции — это проще, чем кажется. Сделайте первый шаг уже сегодня.
Начать обучение
Открыть брокерский счёт
```
- Состояния: loading=ALLOWED, empty=FORBIDDEN, filled=REQUIRED, error=ALLOWED, offline=ALLOWED, completed=ALLOWED
- Переходы (строго): отсутствуют (экран конечный или переход по back).
- Ошибки: см. CORE раздел 2.6 (тексты фиксированы).

### Финальный экран
- `s31_cta`

### Возврат в общий поток
- После `s25a_tariff_cta` выполняется возврат на `s02_navigation_menu` (END_OF_LESSON). После `s30a_diversification_cta` выполняется переход на `s31_cta` (ACTION_FINISH_COURSE).
