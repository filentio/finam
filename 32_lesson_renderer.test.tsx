import React from "react";
import { describe, expect, it } from "vitest";
import { LessonScreenRenderer } from "./32_lesson_renderer";
import type { LessonScreen } from "./30_lessons_schema";

describe("LessonScreenRenderer snapshots", () => {
  it("renders intro", () => {
    const screen: LessonScreen = {
      id: "t_intro",
      type: "intro",
      title: "УРОК 1",
      payload: { subtitle: "С чего начать", description: "Разберемся в основах." },
      assets: [{ type: "icon", src: "assets/icons/s05_deposit__gift.svg", alt: "gift" }],
    };
    expect(<LessonScreenRenderer screen={screen} assetBaseUrl="https://cdn.example/" />).toMatchSnapshot();
  });

  it("renders cards", () => {
    const screen: LessonScreen = {
      id: "t_cards",
      type: "cards",
      title: "Понятия",
      payload: {
        cards: [
          { title: "Ценная бумага", text: "Документ, подтверждающий ваши права на актив." },
          { title: "Биржа", text: "Площадка для торговли ценными бумагами." },
        ],
      },
    };
    expect(<LessonScreenRenderer screen={screen} />).toMatchSnapshot();
  });

  it("renders cta", () => {
    const screen: LessonScreen = {
      id: "t_cta",
      type: "cta",
      title: "Начинаем",
      body: "Сделайте первое пополнение счёта.",
      payload: { label: "Пополнить счёт", link: "finam://invest/deposit" },
    };
    expect(<LessonScreenRenderer screen={screen} />).toMatchSnapshot();
  });
});

