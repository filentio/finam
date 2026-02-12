import type { CSSProperties } from "react";
import { PieChart } from "../components/PieChart";
import type { ResultScreenProps } from "./ScreenProps";

export function ResultScreen({ screen, riskResult, onNext }: ResultScreenProps) {
  return (
    <section style={containerStyle}>
      <h3 style={{ margin: 0 }}>{screen.title}</h3>
      {riskResult ? (
        <>
          <p style={{ margin: 0, color: "#4b5b71" }}>
            Итоговый профиль: <strong>{riskResult.final_profile.replace("_", " ")}</strong>
          </p>
          <PieChart allocation={riskResult.allocation} />
        </>
      ) : (
        <p style={{ margin: 0, color: "#4b5b71" }}>
          Заполните анкету риска, чтобы получить персональный профиль.
        </p>
      )}
      <button type="button" style={primaryButtonStyle} onClick={onNext}>
        Продолжить
      </button>
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
