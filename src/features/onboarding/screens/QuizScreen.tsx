import type { QuizScreenProps } from "./ScreenProps";

export function QuizScreen({ question, selectedOptionId, onSelectOption }: QuizScreenProps) {
  return (
    <section className="ob-screen ob-quiz-question-screen">
      <p className="ob-quiz-question__block-title">{question.block_title}</p>
      <h2 className="ob-quiz-question__text">{question.question}</h2>
      <div
        className={`ob-quiz-options ${
          question.screen_config.layout === "single_select_horizontal"
            ? "ob-quiz-options--horizontal"
            : ""
        }`}
      >
        {question.options.map((option) => {
          const selected = selectedOptionId === option.id;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() =>
                onSelectOption({
                  question_id: question.id,
                  selected_option: option.id,
                  score: option.score,
                })
              }
              className={`ob-quiz-option ${selected ? "is-selected ob-quiz-option--selecting" : ""}`}
              data-testid="quiz-option"
            >
              {option.text}
            </button>
          );
        })}
      </div>
    </section>
  );
}
