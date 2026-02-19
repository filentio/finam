import React, { useEffect, useMemo } from "react";
import type { EntryGateDerived, EntryGateUiState } from "./21_entry_gate_rules";
import { useTrack } from "./23_analytics_context";

export type EntryGateScreenProps = {
  screenId: "ENTRY_GATE";
  derived: EntryGateDerived;
  onStart: () => void; // resetAll -> QZ1
  onResume: (resumeScreenId: string) => void; // computeResumeScreen
  onRestart: () => void; // resetAll -> QZ1
  onResetQuiz1: () => void; // resetFromQuiz1 -> QZ1
  onResetQuiz2: () => void; // resetFromQuiz2 -> QZ2
  onOpenFinal: () => void; // SCR_FINAL
};

export function EntryGateScreen(props: EntryGateScreenProps) {
  const track = useTrack();
  const uiState = props.derived.uiState;
  useEffect(() => {
    track("onboarding_entry_gate_view", { state: uiState });
  }, [uiState]);

  const actions = useMemo(() => getActionsForUiState(uiState, props), [uiState, props]);

  return (
    <div style={styles.card}>
      <h2 style={styles.h2}>Онбординг</h2>
      <p style={styles.p}>{subtitle(uiState)}</p>

      <div style={styles.actions}>
        {actions.primary ? (
          <button
            type="button"
            style={styles.primaryBtn}
            onClick={() => {
              track("onboarding_entry_gate_action", { action: actions.primary!.analyticsAction });
              actions.primary!.onClick();
            }}
          >
            {actions.primary.label}
          </button>
        ) : null}

        {actions.secondary.map((a) => (
          <button
            key={a.label}
            type="button"
            style={styles.secondaryBtn}
            onClick={() => {
              track("onboarding_entry_gate_action", { action: a.analyticsAction });
              a.onClick();
            }}
          >
            {a.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function subtitle(state: EntryGateUiState): string {
  switch (state) {
    case "NEW_USER":
      return "Начните обучение с анкеты. Прогресс будет сохранён автоматически.";
    case "IN_PROGRESS":
      return "Найден сохранённый прогресс. Вы можете продолжить или начать заново.";
    case "COMPLETED":
      return "Обучение завершено. Вы можете открыть итог или пройти заново.";
  }
}

function getActionsForUiState(uiState: EntryGateUiState, props: EntryGateScreenProps): {
  primary: null | { label: string; analyticsAction: string; onClick: () => void };
  secondary: Array<{ label: string; analyticsAction: string; onClick: () => void }>;
} {
  if (uiState === "NEW_USER") {
    return {
      primary: { label: "Начать обучение", analyticsAction: "START", onClick: props.onStart },
      secondary: [],
    };
  }

  if (uiState === "IN_PROGRESS") {
    const secondary: Array<{ label: string; analyticsAction: string; onClick: () => void }> = [
      { label: "Начать заново", analyticsAction: "RESTART", onClick: props.onRestart },
    ];
    if (props.derived.allowResetQuiz1) {
      secondary.push({ label: "Перепройти анкету", analyticsAction: "RESET_QUIZ1", onClick: props.onResetQuiz1 });
    }
    return {
      primary: { label: "Продолжить", analyticsAction: "RESUME", onClick: () => props.onResume(props.derived.resumeScreen) },
      secondary,
    };
  }

  // COMPLETED
  const secondary: Array<{ label: string; analyticsAction: string; onClick: () => void }> = [
    { label: "Пройти заново", analyticsAction: "RESTART", onClick: props.onRestart },
  ];
  if (props.derived.allowResetQuiz2) {
    secondary.push({ label: "Перепройти инвест-профиль", analyticsAction: "RESET_QUIZ2", onClick: props.onResetQuiz2 });
  }
  return {
    primary: { label: "Открыть итог", analyticsAction: "OPEN_FINAL", onClick: props.onOpenFinal },
    secondary,
  };
}

const styles: Record<string, React.CSSProperties> = {
  card: { border: "1px solid #E5E7EB", background: "#FFF", borderRadius: 16, padding: 16 },
  h2: { margin: 0, marginBottom: 8, fontSize: 20, color: "#333" },
  p: { margin: 0, marginBottom: 12, color: "#555", lineHeight: 1.4 },
  actions: { display: "flex", flexDirection: "column", gap: 10, marginTop: 8 },
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

