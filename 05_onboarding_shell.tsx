import React, { useEffect, useMemo, useReducer, useRef, useState } from "react";
import {
  DEFAULT_QUIZ1_ANSWERS,
  DEFAULT_QUIZ2_ANSWERS,
  getInitialOnboardingState,
  onboardingReducer,
  type OnboardingState,
  type ScreenId,
} from "./01_state_machine";
import { guardScreenAccess, getBackScreenId, getNextScreenId } from "./02_routes";
import {
  assertBranchMappingCoverage,
  computeSegmentFromQuiz1,
  computeStrategyFromQuiz2,
  getBranchId,
  validateQuiz1Answers,
  validateQuiz2Answers,
} from "./03_branch_mapping";
import { clearProgress, loadProgress, saveProgress } from "./04_progress_storage";

type Props = {
  storageEnabled?: boolean;
};

const FIXED_ERROR_QUIZ_INVALID = "Заполните все вопросы анкеты";

function setHash(screenId: ScreenId) {
  if (typeof window === "undefined") return;
  const next = `#${screenId}`;
  if (window.location.hash !== next) window.location.hash = next;
}

function readHash(): ScreenId | null {
  if (typeof window === "undefined") return null;
  const raw = window.location.hash.replace("#", "").trim();
  if (!raw) return null;
  return raw as ScreenId;
}

export default function OnboardingShell(props: Props) {
  const storageEnabled = props.storageEnabled ?? true;

  const [state, dispatch] = useReducer(onboardingReducer, undefined, () => getInitialOnboardingState());
  const stateRef = useRef<OnboardingState>(state);
  const [quizError, setQuizError] = useState<string | null>(null);

  // One-time integrity check.
  useEffect(() => {
    assertBranchMappingCoverage();
  }, []);

  // Keep ref updated.
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // Hydrate from storage.
  useEffect(() => {
    if (!storageEnabled) return;
    const loaded = loadProgress();
    if (!loaded) return;
    dispatch({ type: "HYDRATE", state: loaded });
  }, [storageEnabled]);

  // Mark abandoned on exit.
  useEffect(() => {
    if (!storageEnabled) return;
    const onBeforeUnload = () => {
      const s = stateRef.current;
      if (s.processStatus === "IN_PROGRESS") {
        saveProgress({ ...s, processStatus: "ABANDONED" });
      } else {
        saveProgress(s);
      }
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [storageEnabled]);

  // Persist on each state change.
  useEffect(() => {
    if (!storageEnabled) return;
    saveProgress(state);
  }, [state, storageEnabled]);

  // Sync hash on screen change.
  useEffect(() => {
    setHash(state.currentScreenId);
  }, [state.currentScreenId]);

  // If process is completed, force screenId to SCR_FINAL.
  useEffect(() => {
    if (state.processStatus === "COMPLETED" && state.currentScreenId !== "SCR_FINAL") {
      dispatch({ type: "SET_CURRENT_SCREEN", screenId: "SCR_FINAL" });
    }
  }, [state.processStatus, state.currentScreenId]);

  // Handle hash navigation attempts.
  useEffect(() => {
    const onHashChange = () => {
      const requested = readHash();
      if (!requested) return;
      const guard = guardScreenAccess(stateRef.current, requested);
      if (!guard.allowed) {
        dispatch({ type: "SET_CURRENT_SCREEN", screenId: guard.redirectTo });
        return;
      }
      dispatch({ type: "SET_CURRENT_SCREEN", screenId: requested });
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  // Guard current screen.
  useEffect(() => {
    const guard = guardScreenAccess(state, state.currentScreenId);
    if (!guard.allowed) {
      if (state.currentScreenId !== guard.redirectTo) {
        dispatch({ type: "SET_CURRENT_SCREEN", screenId: guard.redirectTo });
      }
      return;
    }
    const currentStatus = state.screenStatusById[state.currentScreenId];
    if (currentStatus !== "active" && currentStatus !== "completed") {
      dispatch({ type: "SET_SCREEN_STATUS", screenId: state.currentScreenId, status: "active" });
    }
  }, [
    state.currentScreenId,
    state.processStatus,
    state.quiz1.isCompleted,
    state.quiz2.isCompleted,
    state.branch.branchId,
    state.completedScreenIds,
    state.screenStatusById,
  ]);

  const canGoBack = useMemo(() => {
    return getBackScreenId(state) !== null && state.processStatus !== "COMPLETED";
  }, [state]);

  const onBack = () => {
    setQuizError(null);
    const back = getBackScreenId(state);
    if (!back) return;
    dispatch({ type: "SET_CURRENT_SCREEN", screenId: back });
  };

  const onNextLinear = () => {
    setQuizError(null);
    const next = getNextScreenId(state);
    if (!next) return;
    dispatch({ type: "MARK_SCREEN_COMPLETED", screenId: state.currentScreenId });
    dispatch({ type: "SET_CURRENT_SCREEN", screenId: next });
  };

  const onReset = () => {
    if (!storageEnabled) return;
    clearProgress();
    dispatch({ type: "HYDRATE", state: getInitialOnboardingState() });
    setQuizError(null);
  };

  // Screen render
  const screenId = state.processStatus === "COMPLETED" ? "SCR_FINAL" : state.currentScreenId;

  return (
    <div style={styles.shell}>
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.badge}>Onboarding Shell</div>
          <div style={styles.meta}>
            <span>processStatus={state.processStatus}</span>
            <span>screenId={screenId}</span>
          </div>
        </div>
        <div style={styles.headerRight}>
          <button style={styles.ghostBtn} onClick={onReset} disabled={!storageEnabled}>
            Reset
          </button>
        </div>
      </div>

      <div style={styles.body}>
        {screenId === "SCR_ENTRY" && (
          <EntryScreen
            onStart={() => {
              setQuizError(null);
              dispatch({ type: "START_PROCESS" });
              dispatch({ type: "MARK_SCREEN_COMPLETED", screenId: "SCR_ENTRY" });
              dispatch({ type: "SET_CURRENT_SCREEN", screenId: "QZ1_EXPERIENCE_GOALS" });
            }}
          />
        )}

        {screenId === "QZ1_EXPERIENCE_GOALS" && (
          <Quiz1Screen
            state={state}
            error={quizError}
            onChange={(answers) => dispatch({ type: "SET_QUIZ1_ANSWERS", answers })}
            onSubmit={() => {
              const v = validateQuiz1Answers(state.quiz1.answers);
              if (!v.ok) {
                setQuizError(FIXED_ERROR_QUIZ_INVALID);
                return;
              }
              const segment = computeSegmentFromQuiz1(state.quiz1.answers);
              dispatch({ type: "SET_QUIZ1_COMPLETED", segment });
              dispatch({ type: "MARK_SCREEN_COMPLETED", screenId: "QZ1_EXPERIENCE_GOALS" });
              dispatch({ type: "SET_CURRENT_SCREEN", screenId: "CL01_PLACEHOLDER" });
              setQuizError(null);
            }}
          />
        )}

        {screenId === "CL01_PLACEHOLDER" && (
          <PlaceholderLessonScreen
            title="Общий урок 1 (заглушка)"
            description="Экран-заглушка. Контент урока не реализуется на этом этапе."
            onNext={onNextLinear}
          />
        )}
        {screenId === "CL02_PLACEHOLDER" && (
          <PlaceholderLessonScreen
            title="Общий урок 2 (заглушка)"
            description="Экран-заглушка. Контент урока не реализуется на этом этапе."
            onNext={onNextLinear}
          />
        )}
        {screenId === "CL03_PLACEHOLDER" && (
          <PlaceholderLessonScreen
            title="Общий урок 3 (заглушка)"
            description="Экран-заглушка. Контент урока не реализуется на этом этапе."
            onNext={onNextLinear}
          />
        )}

        {screenId === "QZ2_INVEST_PROFILE" && (
          <Quiz2Screen
            state={state}
            error={quizError}
            onChange={(answers) => dispatch({ type: "SET_QUIZ2_ANSWERS", answers })}
            onSubmit={() => {
              const v = validateQuiz2Answers(state.quiz2.answers);
              if (!v.ok) {
                setQuizError(FIXED_ERROR_QUIZ_INVALID);
                return;
              }
              if (!state.quiz1.segment) {
                setQuizError(FIXED_ERROR_QUIZ_INVALID);
                return;
              }
              const strategy = computeStrategyFromQuiz2(state.quiz2.answers);
              const branchId = getBranchId(state.quiz1.segment, strategy);
              dispatch({ type: "SET_QUIZ2_COMPLETED", strategy });
              dispatch({ type: "SET_BRANCH_ID", branchId });
              dispatch({ type: "MARK_SCREEN_COMPLETED", screenId: "QZ2_INVEST_PROFILE" });
              dispatch({ type: "SET_CURRENT_SCREEN", screenId: getBranchStartScreen(branchId) });
              setQuizError(null);
            }}
          />
        )}

        {screenId === "BR_BEGINNER_01" && (
          <BranchPlaceholderScreen
            title="Ветка Beginner — экран 1 (заглушка)"
            subtitle={branchSubtitle(state)}
            onNext={onNextLinear}
          />
        )}
        {screenId === "BR_BEGINNER_02" && (
          <BranchPlaceholderScreen
            title="Ветка Beginner — экран 2 (заглушка)"
            subtitle={branchSubtitle(state)}
            onNext={onNextLinear}
          />
        )}
        {screenId === "BR_INTERMEDIATE_01" && (
          <BranchPlaceholderScreen
            title="Ветка Intermediate — экран 1 (заглушка)"
            subtitle={branchSubtitle(state)}
            onNext={onNextLinear}
          />
        )}
        {screenId === "BR_INTERMEDIATE_02" && (
          <BranchPlaceholderScreen
            title="Ветка Intermediate — экран 2 (заглушка)"
            subtitle={branchSubtitle(state)}
            onNext={onNextLinear}
          />
        )}
        {screenId === "BR_ADVANCED_01" && (
          <BranchPlaceholderScreen
            title="Ветка Advanced — экран 1 (заглушка)"
            subtitle={branchSubtitle(state)}
            onNext={onNextLinear}
          />
        )}
        {screenId === "BR_ADVANCED_02" && (
          <BranchPlaceholderScreen
            title="Ветка Advanced — экран 2 (заглушка)"
            subtitle={branchSubtitle(state)}
            onNext={onNextLinear}
          />
        )}

        {screenId === "SCR_FINAL" && (
          <FinalScreen
            isCompleted={state.processStatus === "COMPLETED"}
            onFinish={() => {
              dispatch({ type: "MARK_SCREEN_COMPLETED", screenId: "SCR_FINAL" });
              dispatch({ type: "COMPLETE_PROCESS" });
              dispatch({ type: "SET_CURRENT_SCREEN", screenId: "SCR_FINAL" });
            }}
          />
        )}
      </div>

      <div style={styles.footer}>
        <button style={styles.secondaryBtn} disabled={!canGoBack} onClick={onBack}>
          Back
        </button>
        <span style={styles.footerHint}>Back navigation is strictly controlled.</span>
      </div>
    </div>
  );
}

function getBranchStartScreen(branchId: OnboardingState["branch"]["branchId"]): ScreenId {
  if (branchId === "BR_BEGINNER") return "BR_BEGINNER_01";
  if (branchId === "BR_INTERMEDIATE") return "BR_INTERMEDIATE_01";
  return "BR_ADVANCED_01";
}

function branchSubtitle(state: OnboardingState): string {
  const segment = state.quiz1.segment ?? "unknown";
  const strategy = state.quiz2.strategy ?? "unknown";
  const branchId = state.branch.branchId ?? "unknown";
  return `segment=${segment} strategy=${strategy} branchId=${branchId}`;
}

function EntryScreen(props: { onStart: () => void }) {
  return (
    <div style={styles.card}>
      <h2 style={styles.h2}>Вход</h2>
      <p style={styles.p}>Этот экран является точкой входа процесса онбординга.</p>
      <button style={styles.primaryBtn} onClick={props.onStart}>
        Начать
      </button>
    </div>
  );
}

function PlaceholderLessonScreen(props: { title: string; description: string; onNext: () => void }) {
  return (
    <div style={styles.card}>
      <h2 style={styles.h2}>{props.title}</h2>
      <p style={styles.p}>{props.description}</p>
      <button style={styles.primaryBtn} onClick={props.onNext}>
        Далее
      </button>
    </div>
  );
}

function BranchPlaceholderScreen(props: { title: string; subtitle: string; onNext: () => void }) {
  return (
    <div style={styles.card}>
      <h2 style={styles.h2}>{props.title}</h2>
      <p style={styles.p}>{props.subtitle}</p>
      <button style={styles.primaryBtn} onClick={props.onNext}>
        Далее
      </button>
    </div>
  );
}

function FinalScreen(props: { isCompleted: boolean; onFinish: () => void }) {
  return (
    <div style={styles.card}>
      <h2 style={styles.h2}>Финальный экран</h2>
      <p style={styles.p}>Процесс онбординга завершён.</p>
      <button style={styles.primaryBtn} onClick={props.onFinish} disabled={props.isCompleted}>
        Завершить
      </button>
      {props.isCompleted && <p style={styles.p}>processStatus=COMPLETED</p>}
    </div>
  );
}

function Quiz1Screen(props: {
  state: OnboardingState;
  error: string | null;
  onChange: (answers: typeof DEFAULT_QUIZ1_ANSWERS) => void;
  onSubmit: () => void;
}) {
  const a = props.state.quiz1.answers;
  const set = (next: Partial<typeof DEFAULT_QUIZ1_ANSWERS>) => props.onChange({ ...a, ...next });

  const selectedInterests = Object.entries(a.q5Interests)
    .filter(([, v]) => v)
    .map(([k]) => k)
    .length;

  return (
    <div style={styles.card}>
      <h2 style={styles.h2}>Анкета №1 (5 вопросов)</h2>
      <p style={styles.p}>Контент анкеты является базовым и не является финальным UI.</p>

      <Fieldset title="Q1. Есть ли у вас статус квалифицированного инвестора?">
        <Radio
          name="q1"
          value="Да"
          checked={a.q1QualifiedStatus === "Да"}
          label="Да"
          onChange={() => set({ q1QualifiedStatus: "Да" })}
        />
        <Radio
          name="q1"
          value="Нет"
          checked={a.q1QualifiedStatus === "Нет"}
          label="Нет"
          onChange={() => set({ q1QualifiedStatus: "Нет" })}
        />
      </Fieldset>

      <Fieldset title="Q2. Какой у вас опыт в инвестициях?">
        {(
          [
            "Еще нет опыта",
            "Менее 1 года",
            "От 1 до 3 лет",
            "От 3 до 5 лет",
            "Более 5 лет",
          ] as const
        ).map((v) => (
          <Radio
            key={v}
            name="q2"
            value={v}
            checked={a.q2Experience === v}
            label={v}
            onChange={() => set({ q2Experience: v })}
          />
        ))}
      </Fieldset>

      <Fieldset title="Q3. С какой суммы вы планируете инвестировать?">
        {(["До 300 тыс", "300 тыс - 2 млн", "2 - 5 млн", "Более 5 млн"] as const).map((v) => (
          <Radio
            key={v}
            name="q3"
            value={v}
            checked={a.q3PlannedAmount === v}
            label={v}
            onChange={() => set({ q3PlannedAmount: v })}
          />
        ))}
      </Fieldset>

      <Fieldset title="Q4. Ваша главная цель инвестиций?">
        {(
          [
            "Накопление на крупную покупку",
            "Получение пассивного дохода",
            "Рост капитала",
            "Сохранение и наследие",
          ] as const
        ).map((v) => (
          <Radio
            key={v}
            name="q4"
            value={v}
            checked={a.q4MainGoal === v}
            label={v}
            onChange={() => set({ q4MainGoal: v })}
          />
        ))}
      </Fieldset>

      <Fieldset title="Q5. Какие продукты/инструменты вам наиболее интересны? (мин. 1, макс. 5)">
        <Checkbox
          checked={a.q5Interests.fundsEtfPif}
          label="Фонды (ETF, ПИФ)"
          onChange={(v) => set({ q5Interests: { ...a.q5Interests, fundsEtfPif: v } })}
        />
        <Checkbox
          checked={a.q5Interests.stocks}
          label="Акции"
          onChange={(v) => set({ q5Interests: { ...a.q5Interests, stocks: v } })}
        />
        <Checkbox
          checked={a.q5Interests.trustManagement}
          label="Доверительное управление / готовые портфели"
          onChange={(v) => set({ q5Interests: { ...a.q5Interests, trustManagement: v } })}
        />
        <Checkbox
          checked={a.q5Interests.bonds}
          label="Облигации"
          onChange={(v) => set({ q5Interests: { ...a.q5Interests, bonds: v } })}
        />
        <Checkbox
          checked={a.q5Interests.ipo}
          label="IPO"
          onChange={(v) => set({ q5Interests: { ...a.q5Interests, ipo: v } })}
        />
        <Checkbox
          checked={a.q5Interests.currency}
          label="Валюта"
          onChange={(v) => set({ q5Interests: { ...a.q5Interests, currency: v } })}
        />
        <Checkbox
          checked={a.q5Interests.structuredProducts}
          label="Структурные продукты"
          onChange={(v) => set({ q5Interests: { ...a.q5Interests, structuredProducts: v } })}
        />
        <Checkbox
          checked={a.q5Interests.derivatives}
          label="Производные (фьючерсы, опционы)"
          onChange={(v) => set({ q5Interests: { ...a.q5Interests, derivatives: v } })}
        />
        <div style={styles.smallMeta}>Выбрано: {selectedInterests}</div>
      </Fieldset>

      {props.error && <div style={styles.errorBox}>{props.error}</div>}

      <button style={styles.primaryBtn} onClick={props.onSubmit}>
        Готово
      </button>
    </div>
  );
}

function Quiz2Screen(props: {
  state: OnboardingState;
  error: string | null;
  onChange: (answers: typeof DEFAULT_QUIZ2_ANSWERS) => void;
  onSubmit: () => void;
}) {
  const a = props.state.quiz2.answers;
  const set = (next: Partial<typeof DEFAULT_QUIZ2_ANSWERS>) => props.onChange({ ...a, ...next });

  return (
    <div style={styles.card}>
      <h2 style={styles.h2}>Анкета №2 (инвест профиль)</h2>
      <p style={styles.p}>Контент анкеты является базовым и не является финальным UI.</p>

      <Fieldset title="Q1. Инвестиционный горизонт">
        {(["До 1 года", "1–3 года", "3–5 лет", "Более 5 лет"] as const).map((v) => (
          <Radio
            key={v}
            name="q2_1"
            value={v}
            checked={a.q1Horizon === v}
            label={v}
            onChange={() => set({ q1Horizon: v })}
          />
        ))}
      </Fieldset>

      <Fieldset title="Q2. Реакция на просадку 20%">
        {(["Продам", "Подожду", "Докуплю"] as const).map((v) => (
          <Radio
            key={v}
            name="q2_2"
            value={v}
            checked={a.q2DrawdownReaction === v}
            label={v}
            onChange={() => set({ q2DrawdownReaction: v })}
          />
        ))}
      </Fieldset>

      <Fieldset title="Q3. Доля дохода для инвестирования в месяц">
        {(["До 5%", "5–15%", "Более 15%"] as const).map((v) => (
          <Radio
            key={v}
            name="q2_3"
            value={v}
            checked={a.q3MonthlyShare === v}
            label={v}
            onChange={() => set({ q3MonthlyShare: v })}
          />
        ))}
      </Fieldset>

      <Fieldset title="Q4. Предпочтение">
        {(["Сохранение", "Баланс", "Рост"] as const).map((v) => (
          <Radio
            key={v}
            name="q2_4"
            value={v}
            checked={a.q4Preference === v}
            label={v}
            onChange={() => set({ q4Preference: v })}
          />
        ))}
      </Fieldset>

      {props.error && <div style={styles.errorBox}>{props.error}</div>}

      <button style={styles.primaryBtn} onClick={props.onSubmit}>
        Готово
      </button>
    </div>
  );
}

function Fieldset(props: { title: string; children: React.ReactNode }) {
  return (
    <div style={styles.fieldset}>
      <div style={styles.fieldsetTitle}>{props.title}</div>
      <div style={styles.fieldsetBody}>{props.children}</div>
    </div>
  );
}

function Radio(props: {
  name: string;
  value: string;
  checked: boolean;
  label: string;
  onChange: () => void;
}) {
  return (
    <label style={styles.choiceRow}>
      <input type="radio" name={props.name} value={props.value} checked={props.checked} onChange={props.onChange} />
      <span>{props.label}</span>
    </label>
  );
}

function Checkbox(props: { checked: boolean; label: string; onChange: (v: boolean) => void }) {
  return (
    <label style={styles.choiceRow}>
      <input type="checkbox" checked={props.checked} onChange={(e) => props.onChange(e.target.checked)} />
      <span>{props.label}</span>
    </label>
  );
}

const styles: Record<string, React.CSSProperties> = {
  shell: { fontFamily: "Inter, system-ui, -apple-system, Segoe UI, sans-serif", padding: 16, maxWidth: 720 },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  headerLeft: { display: "flex", flexDirection: "column", gap: 6 },
  headerRight: { display: "flex", gap: 8 },
  badge: { display: "inline-block", padding: "4px 8px", borderRadius: 8, background: "#F0F2F5", color: "#333" },
  meta: { display: "flex", gap: 12, color: "#666", fontSize: 12 },
  body: { display: "flex", flexDirection: "column", gap: 12 },
  footer: { display: "flex", alignItems: "center", gap: 12, marginTop: 12 },
  footerHint: { color: "#666", fontSize: 12 },
  card: { border: "1px solid #E5E7EB", background: "#FFF", borderRadius: 16, padding: 16 },
  h2: { margin: 0, marginBottom: 8, fontSize: 20, color: "#333" },
  p: { margin: 0, marginBottom: 12, color: "#555", lineHeight: 1.4 },
  fieldset: { borderTop: "1px solid #F0F2F5", paddingTop: 12, marginTop: 12 },
  fieldsetTitle: { fontSize: 14, fontWeight: 600, color: "#333", marginBottom: 8 },
  fieldsetBody: { display: "flex", flexDirection: "column", gap: 8 },
  choiceRow: { display: "flex", gap: 8, alignItems: "center", color: "#333" },
  smallMeta: { marginTop: 8, fontSize: 12, color: "#666" },
  errorBox: { margin: "12px 0", padding: 12, borderRadius: 12, background: "#FFEBEE", color: "#333" },
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
  ghostBtn: {
    height: 36,
    borderRadius: 10,
    border: "1px solid #E5E7EB",
    padding: "0 12px",
    background: "#FFF",
    color: "#333",
    fontWeight: 600,
    cursor: "pointer",
  },
};

