## Таблица CTA / линков (actionId → destination)

Эта таблица является источником истины для всех кликабельных элементов. Запрещено:
- менять `actionId`
- менять `destination`
- менять `label` на UI

### Формат destination
- `NAVIGATE_TO:<screenId>` — переход внутри курса
- `DEEPLINK:<uri>` — открытие deep link

### Глобальные
| actionId | label (UI) | behavior | destination | analyticsEvent |
|---|---|---|---|---|
| ACTION_BEGIN_LEARNING_FROM_RESULT | Перейти к обучению | navigate | NAVIGATE_TO:s01_start | action_click |
| ACTION_START_COURSE | Поехали | navigate | NAVIGATE_TO:s02_navigation_menu | action_click |
| ACTION_BEGIN_LEARNING | Начать обучение | navigate | NAVIGATE_TO:s02_navigation_menu | action_click |
| ACTION_OPEN_ACCOUNT | Открыть брокерский счёт | deeplink | DEEPLINK:finam://account/open | action_click |

### Ветка 1
| actionId | label (UI) | behavior | destination | analyticsEvent |
|---|---|---|---|---|
| ACTION_OPEN_GLOSSARY | Изучить глоссарий | deeplink | DEEPLINK:finam://invest/glossary | action_click |
| ACTION_DEPOSIT_PRIMARY | Пополнить счёт и получить бонус | deeplink | DEEPLINK:finam://invest/deposit?promo=bonus1500&min=30000 | action_click |
| ACTION_DEPOSIT_ALREADY_DONE_TO_BUY | Счёт уже пополнен? К покупкам | navigate | NAVIGATE_TO:s06_first_buy | action_click |
| ACTION_FIRST_BUY_CHOOSE_ASSET | Выбрать актив и купить | deeplink | DEEPLINK:finam://invest/market | action_click |
| ACTION_GO_TO_PRODUCT_STORE | Перейти в магазин продуктов | deeplink | DEEPLINK:finam://invest/products | action_click |
| ACTION_OPEN_COURSE_FAST_START | Быстрый старт | deeplink | DEEPLINK:finam://learn/course/fast-start | action_click |
| ACTION_OPEN_COURSE_STOCKS | Как торговать акциями? | deeplink | DEEPLINK:finam://learn/course/stocks | action_click |
| ACTION_OPEN_COURSE_BONDS | Как торговать облигациями? | deeplink | DEEPLINK:finam://learn/course/bonds | action_click |

### Ветка 2
| actionId | label (UI) | behavior | destination | analyticsEvent |
|---|---|---|---|---|
| ACTION_PORTFOLIO_BUILDER | Собрать портфель | deeplink | DEEPLINK:finam://invest/portfolio/builder | action_click |
| ACTION_PORTFOLIO_DEEP_COURSE | Пройти углубленный курс \"Портфельное инвестирование\" | deeplink | DEEPLINK:finam://learn/course/portfolio | action_click |
| ACTION_BACK_TO_MENU | Вернуться к выбору темы | navigate | NAVIGATE_TO:s02_navigation_menu | action_click |

### Ветка 3
| actionId | label (UI) | behavior | destination | analyticsEvent |
|---|---|---|---|---|
| ACTION_BUY_OFZ | Купить ОФЗ | deeplink | DEEPLINK:finam://invest/products/ofz | action_click |
| ACTION_RISK_MANAGEMENT_COURSE | Перейти к курсу | deeplink | DEEPLINK:finam://learn/course/risk-management | action_click |
| ACTION_BACK_TO_MENU | Вернуться к выбору темы | navigate | NAVIGATE_TO:s02_navigation_menu | action_click |

### Ветка 4
| actionId | label (UI) | behavior | destination | analyticsEvent |
|---|---|---|---|---|
| ACTION_SELECT_TARIFF_INVESTOR | Выбрать | deeplink | DEEPLINK:finam://tariffs/select?tariff=investor | action_click |
| ACTION_SELECT_TARIFF_STRATEG | Выбрать | deeplink | DEEPLINK:finam://tariffs/select?tariff=strateg | action_click |
| ACTION_SELECT_TARIFF_LONG | Выбрать | deeplink | DEEPLINK:finam://tariffs/select?tariff=long | action_click |
| ACTION_SELECT_TARIFF_TRUST | Выбрать | deeplink | DEEPLINK:finam://tariffs/select?tariff=trust | action_click |
| ACTION_BACK_TO_MENU | Вернуться к выбору темы | navigate | NAVIGATE_TO:s02_navigation_menu | action_click |

### Ветка 5
| actionId | label (UI) | behavior | destination | analyticsEvent |
|---|---|---|---|---|
| ACTION_DIVERSIFICATION_PORTFOLIO_BUILDER | Собрать портфель | deeplink | DEEPLINK:finam://invest/portfolio/builder | action_click |
| ACTION_GET_EXPERT_CONSULTATION | Получить консультацию | deeplink | DEEPLINK:finam://support/consultation | action_click |
| ACTION_FINISH_COURSE | Завершить обучение | navigate | NAVIGATE_TO:s31_cta | action_click |

