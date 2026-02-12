import { useState } from "react";
import type { CSSProperties } from "react";
import type { QuizScreenProps } from "./ScreenProps";

export function QuizScreen({ question, onAnswer, onNext, onPrev }: QuizScreenProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  return (
    <section style={containerStyle}>
      <h3 style={{ margin: 0 }}>{question.block_title}</h3>
      <p style={{ margin: 0, color: "#44536a" }}>{question.question}</p>
      <div style={{ display: "grid", gap: 8 }}>
        {question.options.map((option) => {
          const selected = selectedOption === option.id;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => setSelectedOption(option.id)}
              style={{
                textAlign: "left",
                border: `1px solid ${selected ? "#466dc9" : "#d7e0ef"}`,
                background: selected ? "#eff4ff" : "#fff",
                borderRadius: 10,
                padding: "12px 14px",
                cursor: "pointer",
              }}
            >
              {option.text}
            </button>
          );
        })}
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <button style={ghostButtonStyle} type="button" onClick={onPrev}>
          Назад
        </button>
        <button
          style={primaryButtonStyle}
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
    </section>
  );
}

const containerStyle: CSSProperties = {
  border: "1px solid #dce5f2",
  borderRadius: 14,
  padding: 16,
  background: "#fff",
  display: "grid",
  gap: 12,
};

const primaryButtonStyle: CSSProperties = {
  border: 0,
  borderRadius: 10,
  background: "#2f5fcc",
  color: "#fff",
  padding: "10px 14px",
  cursor: "pointer",
};

const ghostButtonStyle: CSSProperties = {
  border: "1px solid #c8d4e8",
  borderRadius: 10,
  background: "#fff",
  color: "#3a4a61",
  padding: "10px 14px",
  cursor: "pointer",
};
