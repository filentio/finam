import { useState } from "react";
import type { QuizScreenProps } from "./ScreenProps";
import { ScreenShell } from "./ScreenShell";

export function QuizScreen({ question, onAnswer, onNext, onPrev }: QuizScreenProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  return (
    <ScreenShell title={question.block_title} subtitle={question.question}>
      <div className="ob-quiz-options">
        {question.options.map((option) => {
          const selected = selectedOption === option.id;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => setSelectedOption(option.id)}
              className={`ob-quiz-option ${selected ? "is-selected" : ""}`}
            >
              {option.text}
            </button>
          );
        })}
      </div>

      <div className="ob-inline-actions">
        <button className="is-secondary" type="button" onClick={onPrev}>
          Назад
        </button>
        <button
          className="is-primary"
          type="button"
          disabled={!selectedOption}
          onClick={() => {
            const picked = question.options.find((option) => option.id === selectedOption);
            if (!picked) {
              return;
            }

            onAnswer({
              question_id: question.id,
              selected_option: picked.id,
              score: picked.score,
            });
            onNext();
          }}
        >
          Ответить
        </button>
      </div>
    </ScreenShell>
  );
}
