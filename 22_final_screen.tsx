import React, { useEffect, useMemo } from "react";
import type { BranchId, Segment, Strategy } from "./01_state_machine";
import { useTrack } from "./23_analytics_context";

export type FinalScreenProps = {
  screenId: "SCR_FINAL";
  segment: Segment;
  strategy: Strategy;
  branchId: BranchId;
  onFinish: () => void;
  onRestart: () => void;
};

export function FinalScreen(props: FinalScreenProps) {
  const track = useTrack();
  useEffect(() => {
    track("onboarding_final_view", { segment: props.segment, strategy: props.strategy, branchId: props.branchId });
  }, [props.segment, props.strategy, props.branchId]);

  const summary = useMemo(() => getSummary(props.branchId, props.strategy), [props.branchId, props.strategy]);

  return (
    <div style={styles.card}>
      <h2 style={styles.h2}>Итог</h2>
      <p style={styles.p}>Вы прошли обучение.</p>

      <div style={styles.kv}>
        <div style={styles.kvRow}>
          <span style={styles.kvLabel}>Сегмент</span>
          <span style={styles.kvValue}>{segmentLabel(props.segment)}</span>
        </div>
        <div style={styles.kvRow}>
          <span style={styles.kvLabel}>Стратегия</span>
          <span style={styles.kvValue}>{strategyLabel(props.strategy)}</span>
        </div>
        <div style={styles.kvRow}>
          <span style={styles.kvLabel}>Ветка</span>
          <span style={styles.kvValue}>{branchLabel(props.branchId)}</span>
        </div>
      </div>

      <div style={styles.summaryBox}>{summary}</div>

      <div style={styles.ctaCol}>
        <a
          href={"finam://invest/deposit?promo=bonus1500&min=30000"}
          style={styles.ctaLink}
          onClick={() => track("onboarding_final_cta_click", { ctaId: "CTA_DEPOSIT" })}
        >
          Перейти к пополнению
        </a>
        <a
          href={"finam://invest/market"}
          style={styles.ctaLink}
          onClick={() => track("onboarding_final_cta_click", { ctaId: "CTA_FIRST_BUY" })}
        >
          К первой покупке
        </a>
      </div>

      <div style={styles.actions}>
        <button
          type="button"
          style={styles.secondaryBtn}
          onClick={() => {
            track("onboarding_final_cta_click", { ctaId: "CTA_RESTART" });
            props.onRestart();
          }}
        >
          Пройти заново
        </button>
        <button
          type="button"
          style={styles.primaryBtn}
          onClick={() => {
            track("onboarding_final_cta_click", { ctaId: "CTA_FINISH" });
            props.onFinish();
          }}
        >
          Завершить
        </button>
      </div>
    </div>
  );
}

function segmentLabel(segment: Segment): string {
  switch (segment) {
    case "NOVICE":
      return "Новичок";
    case "LEARNER":
      return "Начинающий";
    case "EXPERIENCED":
      return "Опытный";
    case "QUALIFIED":
      return "Квалифицированный";
  }
}

function strategyLabel(strategy: Strategy): string {
  switch (strategy) {
    case "conservative":
      return "Консервативная";
    case "balanced":
      return "Сбалансированная";
    case "aggressive":
      return "Агрессивная";
  }
}

function branchLabel(branchId: BranchId): string {
  switch (branchId) {
    case "BR_BEGINNER":
      return "Beginner";
    case "BR_INTERMEDIATE":
      return "Intermediate";
    case "BR_ADVANCED":
      return "Advanced";
  }
}

function getSummary(branchId: BranchId, strategy: Strategy): string {
  const branchSummary =
    branchId === "BR_BEGINNER"
      ? "Вы прошли базовые уроки и первые шаги."
      : branchId === "BR_INTERMEDIATE"
        ? "Вы прошли уроки по портфелю и управлению рисками."
        : "Вы прошли продвинутые уроки по тарифам и диверсификации.";

  const strategySummary =
    strategy === "conservative"
      ? "Рекомендуется начать с более стабильных инструментов и правил риска."
      : strategy === "balanced"
        ? "Рекомендуется сочетать рост и защиту по заранее выбранным правилам."
        : "Рекомендуется соблюдать лимиты риска и действовать по плану в просадках.";

  return `${branchSummary} ${strategySummary}`;
}

const styles: Record<string, React.CSSProperties> = {
  card: { border: "1px solid #E5E7EB", background: "#FFF", borderRadius: 16, padding: 16 },
  h2: { margin: 0, marginBottom: 8, fontSize: 20, color: "#333" },
  p: { margin: 0, marginBottom: 12, color: "#555", lineHeight: 1.4 },
  kv: { border: "1px solid #F0F2F5", borderRadius: 12, padding: 12, background: "#FAFAFA" },
  kvRow: { display: "flex", justifyContent: "space-between", gap: 12, margin: "6px 0" },
  kvLabel: { fontSize: 12, color: "#666" },
  kvValue: { fontSize: 12, color: "#333", fontWeight: 600 },
  summaryBox: { marginTop: 12, padding: 12, borderRadius: 12, background: "#FFF7E6", color: "#333" },
  ctaCol: { marginTop: 12, display: "flex", flexDirection: "column", gap: 10 },
  ctaLink: { color: "#1E5AA8", textDecoration: "none", fontWeight: 600 },
  actions: { display: "flex", justifyContent: "space-between", gap: 12, marginTop: 16 },
  primaryBtn: {
    height: 44,
    borderRadius: 12,
    border: "none",
    padding: "0 16px",
    background: "#F5A623",
    color: "#FFF",
    fontWeight: 600,
    cursor: "pointer",
  },
  secondaryBtn: {
    height: 44,
    borderRadius: 12,
    border: "1px solid #E5E7EB",
    padding: "0 16px",
    background: "#FFF",
    color: "#333",
    fontWeight: 600,
    cursor: "pointer",
  },
};

