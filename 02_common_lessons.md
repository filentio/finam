## 02 Общие уроки — 02_common_lessons.md
### ЖЁСТКИЕ ТРЕБОВАНИЯ
- Формулировки финальные.
- Любая вариативность запрещена.
- Любые placeholder запрещены.

### Общие правила (для всех уроков)
- Анимации внутри контента: `NONE`.
- Переход между экранами: 200ms fade.
- Tap feedback: opacity 0.85 на 120ms.
- Прогресс урока: хранится внутренне как `lessonId:currentIndex/total`. UI прогресса не отображается.
- Ошибка загрузки ассета (inline): `Не удалось загрузить экран / Проверьте подключение к интернету и повторите попытку. / Повторить`.
- Ошибка открытия deep link (modal): `Не удалось открыть / Попробуйте позже. / ОК`.

### Аналитика (для всех уроков)
- `screen_view` — отправка после успешной отрисовки экрана.
  - params: `screenId`, `lessonId`, `index`, `total`
- `action_click` — отправка в момент нажатия.
  - params: `actionId`, `screenId`, `lessonId`

## L1_BEGINNER_START
- **Название**: С чего начать
- **Цель**: Дать базу новичку и довести до первого действия: пополнение/покупка и переход в магазин продуктов.
- **Экраны**: 11

### Экран 1/11 — `s02a_start_intro`
- **Иллюстрация**: `assets/images/s02a_start_intro.png` / `assets/images/s02a_start_intro@2x.png` / `assets/images/s02a_start_intro@3x.png`
- **Текст (строго)**:

```text
УРОК 1
С чего
начать?
Разберемся в основах, пополним счет и сделаем первую покупку.
```

- **Микрокопирайтинг кнопок / действий (строго)**:
  - отсутствует
- **Подписи/подсказки**:
  - отсутствуют
- **Тексты ошибок**:
  - load error: `Не удалось загрузить экран` / `Проверьте подключение к интернету и повторите попытку.` / `Повторить`
  - deeplink error: `Не удалось открыть` / `Попробуйте позже.` / `ОК`
- **Прогресс**:
  - lessonId: `L1_BEGINNER_START`
  - index: 1
  - total: 11
- **Метрики (аналитика)**:
  - `screen_view`
    - params: screenId=`s02a_start_intro`, lessonId=`L1_BEGINNER_START`, index=1, total=11
    - момент отправки: `ON_SCREEN_RENDERED`

---

### Экран 2/11 — `s02_reality`
- **Иллюстрация**: `assets/images/s02_reality.png` / `assets/images/s02_reality@2x.png` / `assets/images/s02_reality@3x.png`
- **Заголовок (title)**: `Инвестиции без опыта — это реально`
- **Текст (строго)**:

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

- **Микрокопирайтинг кнопок / действий (строго)**:
  - отсутствует
- **Подписи/подсказки**:
  - отсутствуют
- **Тексты ошибок**:
  - load error: `Не удалось загрузить экран` / `Проверьте подключение к интернету и повторите попытку.` / `Повторить`
  - deeplink error: `Не удалось открыть` / `Попробуйте позже.` / `ОК`
- **Прогресс**:
  - lessonId: `L1_BEGINNER_START`
  - index: 2
  - total: 11
- **Метрики (аналитика)**:
  - `screen_view`
    - params: screenId=`s02_reality`, lessonId=`L1_BEGINNER_START`, index=2, total=11
    - момент отправки: `ON_SCREEN_RENDERED`

---

### Экран 3/11 — `s03_goals`
- **Иллюстрация**: `assets/images/s03_goals.png` / `assets/images/s03_goals@2x.png` / `assets/images/s03_goals@3x.png`
- **Заголовок (title)**: `Истинные цели инвестиций`
- **Текст (строго)**:

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

- **Микрокопирайтинг кнопок / действий (строго)**:
  - отсутствует
- **Подписи/подсказки**:
  - отсутствуют
- **Тексты ошибок**:
  - load error: `Не удалось загрузить экран` / `Проверьте подключение к интернету и повторите попытку.` / `Повторить`
  - deeplink error: `Не удалось открыть` / `Попробуйте позже.` / `ОК`
- **Прогресс**:
  - lessonId: `L1_BEGINNER_START`
  - index: 3
  - total: 11
- **Метрики (аналитика)**:
  - `screen_view`
    - params: screenId=`s03_goals`, lessonId=`L1_BEGINNER_START`, index=3, total=11
    - момент отправки: `ON_SCREEN_RENDERED`

---

### Экран 4/11 — `s04_concepts`
- **Иллюстрация**: `assets/images/s04_concepts.png` / `assets/images/s04_concepts@2x.png` / `assets/images/s04_concepts@3x.png`
- **Заголовок (title)**: `Основные понятия инвестирования`
- **Текст (строго)**:

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

- **Микрокопирайтинг кнопок / действий (строго)**:
  - actionId: `ACTION_OPEN_GLOSSARY`
    - label: `Изучить глоссарий`
    - destination: `DEEPLINK:finam://invest/glossary`
    - analytics: `action_click` (params: actionId, screenId, lessonId)
- **Подписи/подсказки**:
  - отсутствуют
- **Тексты ошибок**:
  - load error: `Не удалось загрузить экран` / `Проверьте подключение к интернету и повторите попытку.` / `Повторить`
  - deeplink error: `Не удалось открыть` / `Попробуйте позже.` / `ОК`
- **Прогресс**:
  - lessonId: `L1_BEGINNER_START`
  - index: 4
  - total: 11
- **Метрики (аналитика)**:
  - `screen_view`
    - params: screenId=`s04_concepts`, lessonId=`L1_BEGINNER_START`, index=4, total=11
    - момент отправки: `ON_SCREEN_RENDERED`
  - `action_click`
    - params: actionId=<see above>, screenId=`s04_concepts`, lessonId=`L1_BEGINNER_START`
    - момент отправки: `ON_TAP`

---

### Экран 5/11 — `s05_deposit`
- **Иллюстрация**: `assets/images/s05_deposit.png` / `assets/images/s05_deposit@2x.png` / `assets/images/s05_deposit@3x.png`
- **UI референс**: `assets/illustrations/s05_deposit__reference.png` / `@2x` / `@3x`
- **Заголовок (title)**: `Начинаем инвестировать`
- **Текст (строго)**:

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

- **Микрокопирайтинг кнопок / действий (строго)**:
  - actionId: `ACTION_DEPOSIT_PRIMARY`
    - label: `Пополнить счёт и получить бонус`
    - destination: `DEEPLINK:finam://invest/deposit?promo=bonus1500&min=30000`
    - analytics: `action_click` (params: actionId, screenId, lessonId)
  - actionId: `ACTION_DEPOSIT_ALREADY_DONE_TO_BUY`
    - label: `Счёт уже пополнен? К покупкам`
    - destination: `NAVIGATE_TO:s06_first_buy`
    - analytics: `action_click` (params: actionId, screenId, lessonId)
- **Подписи/подсказки**:
  - отсутствуют
- **Тексты ошибок**:
  - load error: `Не удалось загрузить экран` / `Проверьте подключение к интернету и повторите попытку.` / `Повторить`
  - deeplink error: `Не удалось открыть` / `Попробуйте позже.` / `ОК`
- **Прогресс**:
  - lessonId: `L1_BEGINNER_START`
  - index: 5
  - total: 11
- **Метрики (аналитика)**:
  - `screen_view`
    - params: screenId=`s05_deposit`, lessonId=`L1_BEGINNER_START`, index=5, total=11
    - момент отправки: `ON_SCREEN_RENDERED`
  - `action_click`
    - params: actionId=<see above>, screenId=`s05_deposit`, lessonId=`L1_BEGINNER_START`
    - момент отправки: `ON_TAP`

---

### Экран 6/11 — `s06_first_buy`
- **Иллюстрация**: `assets/images/s06_first_buy.png` / `assets/images/s06_first_buy@2x.png` / `assets/images/s06_first_buy@3x.png`
- **UI референс**: `assets/illustrations/s06_first_buy__reference.png` / `@2x` / `@3x`
- **Заголовок (title)**: `Делаем первую покупку`
- **Текст (строго)**:

```text
Первая покупка
Ваш счёт пополнен. Теперь самое интересное — станьте совладельцем крупнейших компаний.
Выберите актив
Найдите акции Газпрома, Сбера или Яндекса в каталоге и нажмите кнопку «Купить».
Выбрать актив и купить
```

- **Микрокопирайтинг кнопок / действий (строго)**:
  - actionId: `ACTION_FIRST_BUY_CHOOSE_ASSET`
    - label: `Выбрать актив и купить`
    - destination: `DEEPLINK:finam://invest/market`
    - analytics: `action_click` (params: actionId, screenId, lessonId)
- **Подписи/подсказки**:
  - отсутствуют
- **Тексты ошибок**:
  - load error: `Не удалось загрузить экран` / `Проверьте подключение к интернету и повторите попытку.` / `Повторить`
  - deeplink error: `Не удалось открыть` / `Попробуйте позже.` / `ОК`
- **Прогресс**:
  - lessonId: `L1_BEGINNER_START`
  - index: 6
  - total: 11
- **Метрики (аналитика)**:
  - `screen_view`
    - params: screenId=`s06_first_buy`, lessonId=`L1_BEGINNER_START`, index=6, total=11
    - момент отправки: `ON_SCREEN_RENDERED`
  - `action_click`
    - params: actionId=<see above>, screenId=`s06_first_buy`, lessonId=`L1_BEGINNER_START`
    - момент отправки: `ON_TAP`

---

### Экран 7/11 — `s06a_purchase_steps`
- **Иллюстрация**: `assets/images/s06a_purchase_steps.png` / `assets/images/s06a_purchase_steps@2x.png` / `assets/images/s06a_purchase_steps@3x.png`
- **UI референс**: `assets/illustrations/s06_first_buy__reference.png` / `@2x` / `@3x`
- **Текст (строго)**:

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

- **Микрокопирайтинг кнопок / действий (строго)**:
  - отсутствует
- **Подписи/подсказки**:
  - отсутствуют
- **Тексты ошибок**:
  - load error: `Не удалось загрузить экран` / `Проверьте подключение к интернету и повторите попытку.` / `Повторить`
  - deeplink error: `Не удалось открыть` / `Попробуйте позже.` / `ОК`
- **Прогресс**:
  - lessonId: `L1_BEGINNER_START`
  - index: 7
  - total: 11
- **Метрики (аналитика)**:
  - `screen_view`
    - params: screenId=`s06a_purchase_steps`, lessonId=`L1_BEGINNER_START`, index=7, total=11
    - момент отправки: `ON_SCREEN_RENDERED`

---

### Экран 8/11 — `s07_rules_updated`
- **Иллюстрация**: `assets/images/s07_rules_updated.png` / `assets/images/s07_rules_updated@2x.png` / `assets/images/s07_rules_updated@3x.png`
- **UI референс**: `assets/illustrations/s06_first_buy__reference.png` / `@2x` / `@3x`
- **Текст (строго)**:

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

- **Микрокопирайтинг кнопок / действий (строго)**:
  - отсутствует
- **Подписи/подсказки**:
  - отсутствуют
- **Тексты ошибок**:
  - load error: `Не удалось загрузить экран` / `Проверьте подключение к интернету и повторите попытку.` / `Повторить`
  - deeplink error: `Не удалось открыть` / `Попробуйте позже.` / `ОК`
- **Прогресс**:
  - lessonId: `L1_BEGINNER_START`
  - index: 8
  - total: 11
- **Метрики (аналитика)**:
  - `screen_view`
    - params: screenId=`s07_rules_updated`, lessonId=`L1_BEGINNER_START`, index=8, total=11
    - момент отправки: `ON_SCREEN_RENDERED`

---

### Экран 9/11 — `s08_instruments_updated`
- **Иллюстрация**: `assets/images/s08_instruments_updated.png` / `assets/images/s08_instruments_updated@2x.png` / `assets/images/s08_instruments_updated@3x.png`
- **UI референс**: `assets/illustrations/s06_first_buy__reference.png` / `@2x` / `@3x`
- **Текст (строго)**:

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

- **Микрокопирайтинг кнопок / действий (строго)**:
  - отсутствует
- **Подписи/подсказки**:
  - отсутствуют
- **Тексты ошибок**:
  - load error: `Не удалось загрузить экран` / `Проверьте подключение к интернету и повторите попытку.` / `Повторить`
  - deeplink error: `Не удалось открыть` / `Попробуйте позже.` / `ОК`
- **Прогресс**:
  - lessonId: `L1_BEGINNER_START`
  - index: 9
  - total: 11
- **Метрики (аналитика)**:
  - `screen_view`
    - params: screenId=`s08_instruments_updated`, lessonId=`L1_BEGINNER_START`, index=9, total=11
    - момент отправки: `ON_SCREEN_RENDERED`

---

### Экран 10/11 — `s09_choice_updated`
- **Иллюстрация**: `assets/images/s09_choice_updated.png` / `assets/images/s09_choice_updated@2x.png` / `assets/images/s09_choice_updated@3x.png`
- **Текст (строго)**:

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

- **Микрокопирайтинг кнопок / действий (строго)**:
  - actionId: `ACTION_GO_TO_PRODUCT_STORE`
    - label: `Перейти в магазин продуктов`
    - destination: `DEEPLINK:finam://invest/products`
    - analytics: `action_click` (params: actionId, screenId, lessonId)
- **Подписи/подсказки**:
  - отсутствуют
- **Тексты ошибок**:
  - load error: `Не удалось загрузить экран` / `Проверьте подключение к интернету и повторите попытку.` / `Повторить`
  - deeplink error: `Не удалось открыть` / `Попробуйте позже.` / `ОК`
- **Прогресс**:
  - lessonId: `L1_BEGINNER_START`
  - index: 10
  - total: 11
- **Метрики (аналитика)**:
  - `screen_view`
    - params: screenId=`s09_choice_updated`, lessonId=`L1_BEGINNER_START`, index=10, total=11
    - момент отправки: `ON_SCREEN_RENDERED`
  - `action_click`
    - params: actionId=<see above>, screenId=`s09_choice_updated`, lessonId=`L1_BEGINNER_START`
    - момент отправки: `ON_TAP`

---

### Экран 11/11 — `s10_courses`
- **Иллюстрация**: `assets/images/s10_courses.png` / `assets/images/s10_courses@2x.png` / `assets/images/s10_courses@3x.png`
- **Заголовок (title)**: `Готовы узнать больше?`
- **Текст (строго)**:

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

- **Микрокопирайтинг кнопок / действий (строго)**:
  - actionId: `ACTION_OPEN_COURSE_FAST_START`
    - label: `Быстрый старт`
    - destination: `DEEPLINK:finam://learn/course/fast-start`
    - analytics: `action_click` (params: actionId, screenId, lessonId)
  - actionId: `ACTION_OPEN_COURSE_STOCKS`
    - label: `Как торговать акциями?`
    - destination: `DEEPLINK:finam://learn/course/stocks`
    - analytics: `action_click` (params: actionId, screenId, lessonId)
  - actionId: `ACTION_OPEN_COURSE_BONDS`
    - label: `Как торговать облигациями?`
    - destination: `DEEPLINK:finam://learn/course/bonds`
    - analytics: `action_click` (params: actionId, screenId, lessonId)
- **Подписи/подсказки**:
  - отсутствуют
- **Тексты ошибок**:
  - load error: `Не удалось загрузить экран` / `Проверьте подключение к интернету и повторите попытку.` / `Повторить`
  - deeplink error: `Не удалось открыть` / `Попробуйте позже.` / `ОК`
- **Прогресс**:
  - lessonId: `L1_BEGINNER_START`
  - index: 11
  - total: 11
- **Метрики (аналитика)**:
  - `screen_view`
    - params: screenId=`s10_courses`, lessonId=`L1_BEGINNER_START`, index=11, total=11
    - момент отправки: `ON_SCREEN_RENDERED`
  - `action_click`
    - params: actionId=<see above>, screenId=`s10_courses`, lessonId=`L1_BEGINNER_START`
    - момент отправки: `ON_TAP`

---

## L2_INTERMEDIATE_PORTFOLIO
- **Название**: Собрать портфель
- **Цель**: Объяснить принципы портфеля и вывести на действие: перейти к конструктору портфеля.
- **Экраны**: 5

### Экран 1/5 — `s11_portfolio_intro`
- **Иллюстрация**: `assets/images/s11_portfolio_intro.png` / `assets/images/s11_portfolio_intro@2x.png` / `assets/images/s11_portfolio_intro@3x.png`
- **Заголовок (title)**: `Как собрать первый портфель`
- **Текст (строго)**:

```text
Раздел 3
Как собрать первый портфель
Создайте сбалансированный набор инвестиций для ваших целей
```

- **Микрокопирайтинг кнопок / действий (строго)**:
  - отсутствует
- **Подписи/подсказки**:
  - отсутствуют
- **Тексты ошибок**:
  - load error: `Не удалось загрузить экран` / `Проверьте подключение к интернету и повторите попытку.` / `Повторить`
  - deeplink error: `Не удалось открыть` / `Попробуйте позже.` / `ОК`
- **Прогресс**:
  - lessonId: `L2_INTERMEDIATE_PORTFOLIO`
  - index: 1
  - total: 5
- **Метрики (аналитика)**:
  - `screen_view`
    - params: screenId=`s11_portfolio_intro`, lessonId=`L2_INTERMEDIATE_PORTFOLIO`, index=1, total=5
    - момент отправки: `ON_SCREEN_RENDERED`

---

### Экран 2/5 — `s12_principles`
- **Иллюстрация**: `assets/images/s12_principles.png` / `assets/images/s12_principles@2x.png` / `assets/images/s12_principles@3x.png`
- **Заголовок (title)**: `Принципы формирования портфеля`
- **Текст (строго)**:

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

- **Микрокопирайтинг кнопок / действий (строго)**:
  - отсутствует
- **Подписи/подсказки**:
  - отсутствуют
- **Тексты ошибок**:
  - load error: `Не удалось загрузить экран` / `Проверьте подключение к интернету и повторите попытку.` / `Повторить`
  - deeplink error: `Не удалось открыть` / `Попробуйте позже.` / `ОК`
- **Прогресс**:
  - lessonId: `L2_INTERMEDIATE_PORTFOLIO`
  - index: 2
  - total: 5
- **Метрики (аналитика)**:
  - `screen_view`
    - params: screenId=`s12_principles`, lessonId=`L2_INTERMEDIATE_PORTFOLIO`, index=2, total=5
    - момент отправки: `ON_SCREEN_RENDERED`

---

### Экран 3/5 — `s13_structure`
- **Иллюстрация**: `assets/images/s13_structure.png` / `assets/images/s13_structure@2x.png` / `assets/images/s13_structure@3x.png`
- **Заголовок (title)**: `Образцовая структура портфеля`
- **Текст (строго)**:

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

- **Микрокопирайтинг кнопок / действий (строго)**:
  - отсутствует
- **Подписи/подсказки**:
  - отсутствуют
- **Тексты ошибок**:
  - load error: `Не удалось загрузить экран` / `Проверьте подключение к интернету и повторите попытку.` / `Повторить`
  - deeplink error: `Не удалось открыть` / `Попробуйте позже.` / `ОК`
- **Прогресс**:
  - lessonId: `L2_INTERMEDIATE_PORTFOLIO`
  - index: 3
  - total: 5
- **Метрики (аналитика)**:
  - `screen_view`
    - params: screenId=`s13_structure`, lessonId=`L2_INTERMEDIATE_PORTFOLIO`, index=3, total=5
    - момент отправки: `ON_SCREEN_RENDERED`

---

### Экран 4/5 — `s14_balance`
- **Иллюстрация**: `assets/images/s14_balance.png` / `assets/images/s14_balance@2x.png` / `assets/images/s14_balance@3x.png`
- **Заголовок (title)**: `Баланс риска и доходности`
- **Текст (строго)**:

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

- **Микрокопирайтинг кнопок / действий (строго)**:
  - отсутствует
- **Подписи/подсказки**:
  - отсутствуют
- **Тексты ошибок**:
  - load error: `Не удалось загрузить экран` / `Проверьте подключение к интернету и повторите попытку.` / `Повторить`
  - deeplink error: `Не удалось открыть` / `Попробуйте позже.` / `ОК`
- **Прогресс**:
  - lessonId: `L2_INTERMEDIATE_PORTFOLIO`
  - index: 4
  - total: 5
- **Метрики (аналитика)**:
  - `screen_view`
    - params: screenId=`s14_balance`, lessonId=`L2_INTERMEDIATE_PORTFOLIO`, index=4, total=5
    - момент отправки: `ON_SCREEN_RENDERED`

---

### Экран 5/5 — `s14a_portfolio_cta`
- **Иллюстрация**: `assets/images/s14a_portfolio_cta.png` / `assets/images/s14a_portfolio_cta@2x.png` / `assets/images/s14a_portfolio_cta@3x.png`
- **Текст (строго)**:

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

- **Микрокопирайтинг кнопок / действий (строго)**:
  - actionId: `ACTION_PORTFOLIO_BUILDER`
    - label: `Собрать портфель`
    - destination: `DEEPLINK:finam://invest/portfolio/builder`
    - analytics: `action_click` (params: actionId, screenId, lessonId)
  - actionId: `ACTION_PORTFOLIO_DEEP_COURSE`
    - label: `Пройти углубленный курс "Портфельное инвестирование"`
    - destination: `DEEPLINK:finam://learn/course/portfolio`
    - analytics: `action_click` (params: actionId, screenId, lessonId)
  - actionId: `ACTION_BACK_TO_MENU`
    - label: `Вернуться к выбору темы`
    - destination: `NAVIGATE_TO:s02_navigation_menu`
    - analytics: `action_click` (params: actionId, screenId, lessonId)
- **Подписи/подсказки**:
  - отсутствуют
- **Тексты ошибок**:
  - load error: `Не удалось загрузить экран` / `Проверьте подключение к интернету и повторите попытку.` / `Повторить`
  - deeplink error: `Не удалось открыть` / `Попробуйте позже.` / `ОК`
- **Прогресс**:
  - lessonId: `L2_INTERMEDIATE_PORTFOLIO`
  - index: 5
  - total: 5
- **Метрики (аналитика)**:
  - `screen_view`
    - params: screenId=`s14a_portfolio_cta`, lessonId=`L2_INTERMEDIATE_PORTFOLIO`, index=5, total=5
    - момент отправки: `ON_SCREEN_RENDERED`
  - `action_click`
    - params: actionId=<see above>, screenId=`s14a_portfolio_cta`, lessonId=`L2_INTERMEDIATE_PORTFOLIO`
    - момент отправки: `ON_TAP`

---

## L3_INTERMEDIATE_RISKS
- **Название**: Риски и защита
- **Цель**: Объяснить риски и защиту и вывести на действие: купить ОФЗ или открыть курс по рискам.
- **Экраны**: 7

### Экран 1/7 — `s15_risks_intro`
- **Иллюстрация**: `assets/images/s15_risks_intro.png` / `assets/images/s15_risks_intro@2x.png` / `assets/images/s15_risks_intro@3x.png`
- **Заголовок (title)**: `Как избежать рисков`
- **Текст (строго)**:

```text
Раздел 4
Как избежать рисков
Узнайте, как защитить свои вложения от потерь
```

- **Микрокопирайтинг кнопок / действий (строго)**:
  - отсутствует
- **Подписи/подсказки**:
  - отсутствуют
- **Тексты ошибок**:
  - load error: `Не удалось загрузить экран` / `Проверьте подключение к интернету и повторите попытку.` / `Повторить`
  - deeplink error: `Не удалось открыть` / `Попробуйте позже.` / `ОК`
- **Прогресс**:
  - lessonId: `L3_INTERMEDIATE_RISKS`
  - index: 1
  - total: 7
- **Метрики (аналитика)**:
  - `screen_view`
    - params: screenId=`s15_risks_intro`, lessonId=`L3_INTERMEDIATE_RISKS`, index=1, total=7
    - момент отправки: `ON_SCREEN_RENDERED`

---

### Экран 2/7 — `s16_risk_types`
- **Иллюстрация**: `assets/images/s16_risk_types.png` / `assets/images/s16_risk_types@2x.png` / `assets/images/s16_risk_types@3x.png`
- **Заголовок (title)**: `Возможные риски инвестирования`
- **Текст (строго)**:

```text
Возможные риски
Рыночный риск
Стоимость активов может снизиться из-за новостей или кризиса.
Риск ликвидности
Сложности с быстрой продажей актива по выгодной цене.
Кредитный риск
Банкротство компании-эмитента (невозможность вернуть долги).
```

- **Микрокопирайтинг кнопок / действий (строго)**:
  - отсутствует
- **Подписи/подсказки**:
  - отсутствуют
- **Тексты ошибок**:
  - load error: `Не удалось загрузить экран` / `Проверьте подключение к интернету и повторите попытку.` / `Повторить`
  - deeplink error: `Не удалось открыть` / `Попробуйте позже.` / `ОК`
- **Прогресс**:
  - lessonId: `L3_INTERMEDIATE_RISKS`
  - index: 2
  - total: 7
- **Метрики (аналитика)**:
  - `screen_view`
    - params: screenId=`s16_risk_types`, lessonId=`L3_INTERMEDIATE_RISKS`, index=2, total=7
    - момент отправки: `ON_SCREEN_RENDERED`

---

### Экран 3/7 — `s17_protection`
- **Иллюстрация**: `assets/images/s17_protection.png` / `assets/images/s17_protection@2x.png` / `assets/images/s17_protection@3x.png`
- **Заголовок (title)**: `Защита от потерь`
- **Текст (строго)**:

```text
Защита от потерь
Диверсификация
Не кладите все яйца в одну корзину. Распределяйте средства между разными активами.
Ликвидные активы
Держите часть средств в инструментах, которые можно быстро продать без потери стоимости.
Защитные инструменты
Используйте облигации и золото для стабилизации портфеля в периоды турбулентности.
```

- **Микрокопирайтинг кнопок / действий (строго)**:
  - отсутствует
- **Подписи/подсказки**:
  - отсутствуют
- **Тексты ошибок**:
  - load error: `Не удалось загрузить экран` / `Проверьте подключение к интернету и повторите попытку.` / `Повторить`
  - deeplink error: `Не удалось открыть` / `Попробуйте позже.` / `ОК`
- **Прогресс**:
  - lessonId: `L3_INTERMEDIATE_RISKS`
  - index: 3
  - total: 7
- **Метрики (аналитика)**:
  - `screen_view`
    - params: screenId=`s17_protection`, lessonId=`L3_INTERMEDIATE_RISKS`, index=3, total=7
    - момент отправки: `ON_SCREEN_RENDERED`

---

### Экран 4/7 — `s18_reliable`
- **Иллюстрация**: `assets/images/s18_reliable.png` / `assets/images/s18_reliable@2x.png` / `assets/images/s18_reliable@3x.png`
- **Заголовок (title)**: `Надежные инструменты для новичков`
- **Текст (строго)**:

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

- **Микрокопирайтинг кнопок / действий (строго)**:
  - отсутствует
- **Подписи/подсказки**:
  - отсутствуют
- **Тексты ошибок**:
  - load error: `Не удалось загрузить экран` / `Проверьте подключение к интернету и повторите попытку.` / `Повторить`
  - deeplink error: `Не удалось открыть` / `Попробуйте позже.` / `ОК`
- **Прогресс**:
  - lessonId: `L3_INTERMEDIATE_RISKS`
  - index: 4
  - total: 7
- **Метрики (аналитика)**:
  - `screen_view`
    - params: screenId=`s18_reliable`, lessonId=`L3_INTERMEDIATE_RISKS`, index=4, total=7
    - момент отправки: `ON_SCREEN_RENDERED`

---

### Экран 5/7 — `s19_bonds`
- **Иллюстрация**: `assets/images/s19_bonds.png` / `assets/images/s19_bonds@2x.png` / `assets/images/s19_bonds@3x.png`
- **Заголовок (title)**: `Государственные и корпоративные облигации`
- **Текст (строго)**:

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

- **Микрокопирайтинг кнопок / действий (строго)**:
  - отсутствует
- **Подписи/подсказки**:
  - отсутствуют
- **Тексты ошибок**:
  - load error: `Не удалось загрузить экран` / `Проверьте подключение к интернету и повторите попытку.` / `Повторить`
  - deeplink error: `Не удалось открыть` / `Попробуйте позже.` / `ОК`
- **Прогресс**:
  - lessonId: `L3_INTERMEDIATE_RISKS`
  - index: 5
  - total: 7
- **Метрики (аналитика)**:
  - `screen_view`
    - params: screenId=`s19_bonds`, lessonId=`L3_INTERMEDIATE_RISKS`, index=5, total=7
    - момент отправки: `ON_SCREEN_RENDERED`

---

### Экран 6/7 — `s20_capital_protection`
- **Иллюстрация**: `assets/images/s20_capital_protection.png` / `assets/images/s20_capital_protection@2x.png` / `assets/images/s20_capital_protection@3x.png`
- **Заголовок (title)**: `Инструменты с защитой капитала`
- **Текст (строго)**:

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

- **Микрокопирайтинг кнопок / действий (строго)**:
  - отсутствует
- **Подписи/подсказки**:
  - отсутствуют
- **Тексты ошибок**:
  - load error: `Не удалось загрузить экран` / `Проверьте подключение к интернету и повторите попытку.` / `Повторить`
  - deeplink error: `Не удалось открыть` / `Попробуйте позже.` / `ОК`
- **Прогресс**:
  - lessonId: `L3_INTERMEDIATE_RISKS`
  - index: 6
  - total: 7
- **Метрики (аналитика)**:
  - `screen_view`
    - params: screenId=`s20_capital_protection`, lessonId=`L3_INTERMEDIATE_RISKS`, index=6, total=7
    - момент отправки: `ON_SCREEN_RENDERED`

---

### Экран 7/7 — `s20a_risks_cta`
- **Иллюстрация**: `assets/images/s20a_risks_cta.png` / `assets/images/s20a_risks_cta@2x.png` / `assets/images/s20a_risks_cta@3x.png`
- **Текст (строго)**:

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

- **Микрокопирайтинг кнопок / действий (строго)**:
  - actionId: `ACTION_BUY_OFZ`
    - label: `Купить ОФЗ`
    - destination: `DEEPLINK:finam://invest/products/ofz`
    - analytics: `action_click` (params: actionId, screenId, lessonId)
  - actionId: `ACTION_RISK_MANAGEMENT_COURSE`
    - label: `Перейти к курсу`
    - destination: `DEEPLINK:finam://learn/course/risk-management`
    - analytics: `action_click` (params: actionId, screenId, lessonId)
  - actionId: `ACTION_BACK_TO_MENU`
    - label: `Вернуться к выбору темы`
    - destination: `NAVIGATE_TO:s02_navigation_menu`
    - analytics: `action_click` (params: actionId, screenId, lessonId)
- **Подписи/подсказки**:
  - отсутствуют
- **Тексты ошибок**:
  - load error: `Не удалось загрузить экран` / `Проверьте подключение к интернету и повторите попытку.` / `Повторить`
  - deeplink error: `Не удалось открыть` / `Попробуйте позже.` / `ОК`
- **Прогресс**:
  - lessonId: `L3_INTERMEDIATE_RISKS`
  - index: 7
  - total: 7
- **Метрики (аналитика)**:
  - `screen_view`
    - params: screenId=`s20a_risks_cta`, lessonId=`L3_INTERMEDIATE_RISKS`, index=7, total=7
    - момент отправки: `ON_SCREEN_RENDERED`
  - `action_click`
    - params: actionId=<see above>, screenId=`s20a_risks_cta`, lessonId=`L3_INTERMEDIATE_RISKS`
    - момент отправки: `ON_TAP`

---

## L4_ADVANCED_TARIFFS
- **Название**: Выбор тарифа
- **Цель**: Объяснить тарифы и вывести на действие: выбрать тариф.
- **Экраны**: 6

### Экран 1/6 — `s21_tariff_intro`
- **Иллюстрация**: `assets/images/s21_tariff_intro.png` / `assets/images/s21_tariff_intro@2x.png` / `assets/images/s21_tariff_intro@3x.png`
- **Заголовок (title)**: `Какой тариф выбрать`
- **Текст (строго)**:

```text
Раздел 5
Какой тариф выбрать
Подберите оптимальные условия для вашей стратегии
```

- **Микрокопирайтинг кнопок / действий (строго)**:
  - отсутствует
- **Подписи/подсказки**:
  - отсутствуют
- **Тексты ошибок**:
  - load error: `Не удалось загрузить экран` / `Проверьте подключение к интернету и повторите попытку.` / `Повторить`
  - deeplink error: `Не удалось открыть` / `Попробуйте позже.` / `ОК`
- **Прогресс**:
  - lessonId: `L4_ADVANCED_TARIFFS`
  - index: 1
  - total: 6
- **Метрики (аналитика)**:
  - `screen_view`
    - params: screenId=`s21_tariff_intro`, lessonId=`L4_ADVANCED_TARIFFS`, index=1, total=6
    - момент отправки: `ON_SCREEN_RENDERED`

---

### Экран 2/6 — `s22_tariff_long`
- **Иллюстрация**: `assets/images/s22_tariff_long.png` / `assets/images/s22_tariff_long@2x.png` / `assets/images/s22_tariff_long@3x.png`
- **Заголовок (title)**: `Тариф «Долгосрочный портфель»`
- **Текст (строго)**:

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

- **Микрокопирайтинг кнопок / действий (строго)**:
  - отсутствует
- **Подписи/подсказки**:
  - отсутствуют
- **Тексты ошибок**:
  - load error: `Не удалось загрузить экран` / `Проверьте подключение к интернету и повторите попытку.` / `Повторить`
  - deeplink error: `Не удалось открыть` / `Попробуйте позже.` / `ОК`
- **Прогресс**:
  - lessonId: `L4_ADVANCED_TARIFFS`
  - index: 2
  - total: 6
- **Метрики (аналитика)**:
  - `screen_view`
    - params: screenId=`s22_tariff_long`, lessonId=`L4_ADVANCED_TARIFFS`, index=2, total=6
    - момент отправки: `ON_SCREEN_RENDERED`

---

### Экран 3/6 — `s23_tariff_strateg`
- **Иллюстрация**: `assets/images/s23_tariff_strateg.png` / `assets/images/s23_tariff_strateg@2x.png` / `assets/images/s23_tariff_strateg@3x.png`
- **Заголовок (title)**: `Тариф «Стратег»`
- **Текст (строго)**:

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

- **Микрокопирайтинг кнопок / действий (строго)**:
  - отсутствует
- **Подписи/подсказки**:
  - отсутствуют
- **Тексты ошибок**:
  - load error: `Не удалось загрузить экран` / `Проверьте подключение к интернету и повторите попытку.` / `Повторить`
  - deeplink error: `Не удалось открыть` / `Попробуйте позже.` / `ОК`
- **Прогресс**:
  - lessonId: `L4_ADVANCED_TARIFFS`
  - index: 3
  - total: 6
- **Метрики (аналитика)**:
  - `screen_view`
    - params: screenId=`s23_tariff_strateg`, lessonId=`L4_ADVANCED_TARIFFS`, index=3, total=6
    - момент отправки: `ON_SCREEN_RENDERED`

---

### Экран 4/6 — `s24_tariff_investor`
- **Иллюстрация**: `assets/images/s24_tariff_investor.png` / `assets/images/s24_tariff_investor@2x.png` / `assets/images/s24_tariff_investor@3x.png`
- **Заголовок (title)**: `Тариф «Инвестор»`
- **Текст (строго)**:

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

- **Микрокопирайтинг кнопок / действий (строго)**:
  - отсутствует
- **Подписи/подсказки**:
  - отсутствуют
- **Тексты ошибок**:
  - load error: `Не удалось загрузить экран` / `Проверьте подключение к интернету и повторите попытку.` / `Повторить`
  - deeplink error: `Не удалось открыть` / `Попробуйте позже.` / `ОК`
- **Прогресс**:
  - lessonId: `L4_ADVANCED_TARIFFS`
  - index: 4
  - total: 6
- **Метрики (аналитика)**:
  - `screen_view`
    - params: screenId=`s24_tariff_investor`, lessonId=`L4_ADVANCED_TARIFFS`, index=4, total=6
    - момент отправки: `ON_SCREEN_RENDERED`

---

### Экран 5/6 — `s25_trust_management`
- **Иллюстрация**: `assets/images/s25_trust_management.png` / `assets/images/s25_trust_management@2x.png` / `assets/images/s25_trust_management@3x.png`
- **Заголовок (title)**: `Не хотите долго разбираться?`
- **Текст (строго)**:

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

- **Микрокопирайтинг кнопок / действий (строго)**:
  - отсутствует
- **Подписи/подсказки**:
  - отсутствуют
- **Тексты ошибок**:
  - load error: `Не удалось загрузить экран` / `Проверьте подключение к интернету и повторите попытку.` / `Повторить`
  - deeplink error: `Не удалось открыть` / `Попробуйте позже.` / `ОК`
- **Прогресс**:
  - lessonId: `L4_ADVANCED_TARIFFS`
  - index: 5
  - total: 6
- **Метрики (аналитика)**:
  - `screen_view`
    - params: screenId=`s25_trust_management`, lessonId=`L4_ADVANCED_TARIFFS`, index=5, total=6
    - момент отправки: `ON_SCREEN_RENDERED`

---

### Экран 6/6 — `s25a_tariff_cta`
- **Иллюстрация**: `assets/images/s25a_tariff_cta.png` / `assets/images/s25a_tariff_cta@2x.png` / `assets/images/s25a_tariff_cta@3x.png`
- **Текст (строго)**:

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

- **Микрокопирайтинг кнопок / действий (строго)**:
  - actionId: `ACTION_SELECT_TARIFF_INVESTOR`
    - label: `Выбрать`
    - destination: `DEEPLINK:finam://tariffs/select?tariff=investor`
    - analytics: `action_click` (params: actionId, screenId, lessonId)
  - actionId: `ACTION_SELECT_TARIFF_STRATEG`
    - label: `Выбрать`
    - destination: `DEEPLINK:finam://tariffs/select?tariff=strateg`
    - analytics: `action_click` (params: actionId, screenId, lessonId)
  - actionId: `ACTION_SELECT_TARIFF_LONG`
    - label: `Выбрать`
    - destination: `DEEPLINK:finam://tariffs/select?tariff=long`
    - analytics: `action_click` (params: actionId, screenId, lessonId)
  - actionId: `ACTION_SELECT_TARIFF_TRUST`
    - label: `Выбрать`
    - destination: `DEEPLINK:finam://tariffs/select?tariff=trust`
    - analytics: `action_click` (params: actionId, screenId, lessonId)
  - actionId: `ACTION_BACK_TO_MENU`
    - label: `Вернуться к выбору темы`
    - destination: `NAVIGATE_TO:s02_navigation_menu`
    - analytics: `action_click` (params: actionId, screenId, lessonId)
- **Подписи/подсказки**:
  - отсутствуют
- **Тексты ошибок**:
  - load error: `Не удалось загрузить экран` / `Проверьте подключение к интернету и повторите попытку.` / `Повторить`
  - deeplink error: `Не удалось открыть` / `Попробуйте позже.` / `ОК`
- **Прогресс**:
  - lessonId: `L4_ADVANCED_TARIFFS`
  - index: 6
  - total: 6
- **Метрики (аналитика)**:
  - `screen_view`
    - params: screenId=`s25a_tariff_cta`, lessonId=`L4_ADVANCED_TARIFFS`, index=6, total=6
    - момент отправки: `ON_SCREEN_RENDERED`
  - `action_click`
    - params: actionId=<see above>, screenId=`s25a_tariff_cta`, lessonId=`L4_ADVANCED_TARIFFS`
    - момент отправки: `ON_TAP`

---

## L5_ADVANCED_DIVERSIFICATION
- **Название**: Диверсификация
- **Цель**: Объяснить диверсификацию и вывести на действие: собрать портфель или запросить консультацию, затем завершить курс.
- **Экраны**: 6

### Экран 1/6 — `s26_diversification_intro`
- **Иллюстрация**: `assets/images/s26_diversification_intro.png` / `assets/images/s26_diversification_intro@2x.png` / `assets/images/s26_diversification_intro@3x.png`
- **Заголовок (title)**: `Диверсификация`
- **Текст (строго)**:

```text
Раздел 6
Диверсификация
Золотое правило инвестора: не кладите все яйца в одну корзину
```

- **Микрокопирайтинг кнопок / действий (строго)**:
  - отсутствует
- **Подписи/подсказки**:
  - отсутствуют
- **Тексты ошибок**:
  - load error: `Не удалось загрузить экран` / `Проверьте подключение к интернету и повторите попытку.` / `Повторить`
  - deeplink error: `Не удалось открыть` / `Попробуйте позже.` / `ОК`
- **Прогресс**:
  - lessonId: `L5_ADVANCED_DIVERSIFICATION`
  - index: 1
  - total: 6
- **Метрики (аналитика)**:
  - `screen_view`
    - params: screenId=`s26_diversification_intro`, lessonId=`L5_ADVANCED_DIVERSIFICATION`, index=1, total=6
    - момент отправки: `ON_SCREEN_RENDERED`

---

### Экран 2/6 — `s27_what_is_div`
- **Иллюстрация**: `assets/images/s27_what_is_div.png` / `assets/images/s27_what_is_div@2x.png` / `assets/images/s27_what_is_div@3x.png`
- **Заголовок (title)**: `Что такое диверсификация?`
- **Текст (строго)**:

```text
Что такое диверсификация?
Это распределение капитала между разными активами для снижения рисков.
«Не кладите все яйца в одну корзину»
Без диверсификации
Купили акции одной компании. Если она обанкротится — вы потеряете всё.
С диверсификацией
Купили акции 5 компаний. Одна упала, но остальные выросли — вы в плюсе.
```

- **Микрокопирайтинг кнопок / действий (строго)**:
  - отсутствует
- **Подписи/подсказки**:
  - отсутствуют
- **Тексты ошибок**:
  - load error: `Не удалось загрузить экран` / `Проверьте подключение к интернету и повторите попытку.` / `Повторить`
  - deeplink error: `Не удалось открыть` / `Попробуйте позже.` / `ОК`
- **Прогресс**:
  - lessonId: `L5_ADVANCED_DIVERSIFICATION`
  - index: 2
  - total: 6
- **Метрики (аналитика)**:
  - `screen_view`
    - params: screenId=`s27_what_is_div`, lessonId=`L5_ADVANCED_DIVERSIFICATION`, index=2, total=6
    - момент отправки: `ON_SCREEN_RENDERED`

---

### Экран 3/6 — `s28_asset_allocation`
- **Иллюстрация**: `assets/images/s28_asset_allocation.png` / `assets/images/s28_asset_allocation@2x.png` / `assets/images/s28_asset_allocation@3x.png`
- **Заголовок (title)**: `Как распределить активы?`
- **Текст (строго)**:

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

- **Микрокопирайтинг кнопок / действий (строго)**:
  - отсутствует
- **Подписи/подсказки**:
  - отсутствуют
- **Тексты ошибок**:
  - load error: `Не удалось загрузить экран` / `Проверьте подключение к интернету и повторите попытку.` / `Повторить`
  - deeplink error: `Не удалось открыть` / `Попробуйте позже.` / `ОК`
- **Прогресс**:
  - lessonId: `L5_ADVANCED_DIVERSIFICATION`
  - index: 3
  - total: 6
- **Метрики (аналитика)**:
  - `screen_view`
    - params: screenId=`s28_asset_allocation`, lessonId=`L5_ADVANCED_DIVERSIFICATION`, index=3, total=6
    - момент отправки: `ON_SCREEN_RENDERED`

---

### Экран 4/6 — `s29_why_works`
- **Иллюстрация**: `assets/images/s29_why_works.png` / `assets/images/s29_why_works@2x.png` / `assets/images/s29_why_works@3x.png`
- **Заголовок (title)**: `Почему это работает?`
- **Текст (строго)**:

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

- **Микрокопирайтинг кнопок / действий (строго)**:
  - отсутствует
- **Подписи/подсказки**:
  - отсутствуют
- **Тексты ошибок**:
  - load error: `Не удалось загрузить экран` / `Проверьте подключение к интернету и повторите попытку.` / `Повторить`
  - deeplink error: `Не удалось открыть` / `Попробуйте позже.` / `ОК`
- **Прогресс**:
  - lessonId: `L5_ADVANCED_DIVERSIFICATION`
  - index: 4
  - total: 6
- **Метрики (аналитика)**:
  - `screen_view`
    - params: screenId=`s29_why_works`, lessonId=`L5_ADVANCED_DIVERSIFICATION`, index=4, total=6
    - момент отправки: `ON_SCREEN_RENDERED`

---

### Экран 5/6 — `s30_example`
- **Иллюстрация**: `assets/images/s30_example.png` / `assets/images/s30_example@2x.png` / `assets/images/s30_example@3x.png`
- **Заголовок (title)**: `Пример сбалансированного портфеля`
- **Текст (строго)**:

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

- **Микрокопирайтинг кнопок / действий (строго)**:
  - отсутствует
- **Подписи/подсказки**:
  - отсутствуют
- **Тексты ошибок**:
  - load error: `Не удалось загрузить экран` / `Проверьте подключение к интернету и повторите попытку.` / `Повторить`
  - deeplink error: `Не удалось открыть` / `Попробуйте позже.` / `ОК`
- **Прогресс**:
  - lessonId: `L5_ADVANCED_DIVERSIFICATION`
  - index: 5
  - total: 6
- **Метрики (аналитика)**:
  - `screen_view`
    - params: screenId=`s30_example`, lessonId=`L5_ADVANCED_DIVERSIFICATION`, index=5, total=6
    - момент отправки: `ON_SCREEN_RENDERED`

---

### Экран 6/6 — `s30a_diversification_cta`
- **Иллюстрация**: `assets/images/s30a_diversification_cta.png` / `assets/images/s30a_diversification_cta@2x.png` / `assets/images/s30a_diversification_cta@3x.png`
- **Текст (строго)**:

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

- **Микрокопирайтинг кнопок / действий (строго)**:
  - actionId: `ACTION_DIVERSIFICATION_PORTFOLIO_BUILDER`
    - label: `Собрать портфель`
    - destination: `DEEPLINK:finam://invest/portfolio/builder`
    - analytics: `action_click` (params: actionId, screenId, lessonId)
  - actionId: `ACTION_GET_EXPERT_CONSULTATION`
    - label: `Получить консультацию`
    - destination: `DEEPLINK:finam://support/consultation`
    - analytics: `action_click` (params: actionId, screenId, lessonId)
  - actionId: `ACTION_FINISH_COURSE`
    - label: `Завершить обучение`
    - destination: `NAVIGATE_TO:s31_cta`
    - analytics: `action_click` (params: actionId, screenId, lessonId)
- **Подписи/подсказки**:
  - отсутствуют
- **Тексты ошибок**:
  - load error: `Не удалось загрузить экран` / `Проверьте подключение к интернету и повторите попытку.` / `Повторить`
  - deeplink error: `Не удалось открыть` / `Попробуйте позже.` / `ОК`
- **Прогресс**:
  - lessonId: `L5_ADVANCED_DIVERSIFICATION`
  - index: 6
  - total: 6
- **Метрики (аналитика)**:
  - `screen_view`
    - params: screenId=`s30a_diversification_cta`, lessonId=`L5_ADVANCED_DIVERSIFICATION`, index=6, total=6
    - момент отправки: `ON_SCREEN_RENDERED`
  - `action_click`
    - params: actionId=<see above>, screenId=`s30a_diversification_cta`, lessonId=`L5_ADVANCED_DIVERSIFICATION`
    - момент отправки: `ON_TAP`

---

