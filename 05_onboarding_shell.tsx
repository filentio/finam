import React, { useEffect, useMemo, useReducer, useRef, useState } from "react";
import {
  getInitialOnboardingState,
  onboardingReducer,
  type OnboardingState,
  type ScreenId,
} from "./01_state_machine";
import { ALL_SCREEN_IDS, guardScreenAccess, getBackScreenId } from "./02_routes";
import { assertBranchConfigIntegrity } from "./17_branch_config";
import { clearProgress, loadProgress, saveProgress } from "./04_progress_storage";
import { computeSegment } from "./07_quiz1_rules";
import { Quiz1Screen } from "./08_quiz1_screen";
import { track } from "./09_analytics";
import { CommonLessonsScreen } from "./12_common_lessons_screen";
import { Quiz2Screen } from "./16_quiz2_screen";
import { prefillQuiz2AnswersFromQuiz1, getPrefilledQuiz2QuestionIds } from "./14_quiz2_prefill";
import { computeQuiz1HashForQuiz2, computeStrategy } from "./15_quiz2_rules";
import { computeQuiz2HashForBranch, resolveBranchId } from "./18_branch_rules";
import { BranchLessonsScreen } from "./19_branch_lessons_screen";

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
  if (!ALL_SCREEN_IDS.includes(raw as ScreenId)) return null;
  return raw as ScreenId;
}

export default function OnboardingShell(props: Props) {
  const storageEnabled = props.storageEnabled ?? true;

  const [state, dispatch] = useReducer(onboardingReducer, undefined, () => getInitialOnboardingState());
  const stateRef = useRef<OnboardingState>(state);
  const [quizError, setQuizError] = useState<string | null>(null);

  // One-time integrity check.
  useEffect(() => {
    assertBranchConfigIntegrity();
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

  // Apply Quiz2 prefill deterministically (non-destructive).
  useEffect(() => {
    if (state.currentScreenId !== "QZ2_INVEST_PROFILE") return;
    if (!state.quiz1.segment) return;

    const quiz1Hash = computeQuiz1HashForQuiz2(state.quiz1.answers, state.quiz1.segment);
    if (state.quiz2.prefillAppliedFromQuiz1Hash === quiz1Hash) return;

    const suggestion = prefillQuiz2AnswersFromQuiz1(state.quiz1.answers);
    const patch: Partial<typeof state.quiz2.answers> = {};
    if (!state.quiz2.answers.q1Horizon && suggestion.q1Horizon) patch.q1Horizon = suggestion.q1Horizon;
    if (!state.quiz2.answers.q4Preference && suggestion.q4Preference) patch.q4Preference = suggestion.q4Preference;

    const prefilledFields = getPrefilledQuiz2QuestionIds(patch);
    if (prefilledFields.length) {
      track("onboarding_quiz2_prefill", { prefilledFields });
    }
    dispatch({ type: "APPLY_QUIZ2_PREFILL", quiz1Hash, patch, prefilledFields });
  }, [
    state.currentScreenId,
    state.quiz1.segment,
    state.quiz1.answers,
    state.quiz2.answers.q1Horizon,
    state.quiz2.answers.q4Preference,
    state.quiz2.prefillAppliedFromQuiz1Hash,
  ]);

  // Normalize branch context on entry to branch lessons.
  useEffect(() => {
    if (state.currentScreenId !== "BR_BRANCH_LESSONS") return;
    if (!state.quiz1.segment) return;
    if (!state.quiz2.strategy) return;
    if (!state.quiz2.quiz1Hash) return;

    const segment = state.quiz1.segment;
    const strategy = state.quiz2.strategy;
    const branchId = resolveBranchId(segment, strategy);
    const quiz2Hash = computeQuiz2HashForBranch({
      segment,
      strategy,
      quiz1Hash: state.quiz2.quiz1Hash,
      quiz2Answers: state.quiz2.answers,
    });

    if (
      state.branch.branchId !== branchId ||
      state.branch.segmentSnapshot !== segment ||
      state.branch.strategySnapshot !== strategy ||
      state.branch.quiz2Hash !== quiz2Hash
    ) {
      dispatch({ type: "SET_BRANCH_CONTEXT", branchId, segmentSnapshot: segment, strategySnapshot: strategy, quiz2Hash });
    }
  }, [
    state.currentScreenId,
    state.quiz1.segment,
    state.quiz2.strategy,
    state.quiz2.quiz1Hash,
    state.quiz2.answers,
    state.branch.branchId,
    state.branch.segmentSnapshot,
    state.branch.strategySnapshot,
    state.branch.quiz2Hash,
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
            screenId="QZ1_EXPERIENCE_GOALS"
            answers={state.quiz1.answers}
            externalError={quizError}
            onInteract={() => setQuizError(null)}
            onChangeAnswers={(answers) => {
              setQuizError(null);
              dispatch({ type: "SET_QUIZ1_ANSWERS", answers });
            }}
            onSubmitValid={() => {
              try {
                const segment = computeSegment(state.quiz1.answers);
                dispatch({ type: "SET_QUIZ1_COMPLETED", segment });
                track("onboarding_quiz1_complete", { segment });
                dispatch({ type: "MARK_SCREEN_COMPLETED", screenId: "QZ1_EXPERIENCE_GOALS" });
                dispatch({ type: "SET_CURRENT_SCREEN", screenId: "CL_COMMON_LESSONS" });
                setQuizError(null);
              } catch (e) {
                track("onboarding_quiz1_error", { errorType: "SEGMENT_COMPUTE_FAILED" });
                setQuizError(FIXED_ERROR_QUIZ_INVALID);
              }
            }}
          />
        )}

        {screenId === "CL_COMMON_LESSONS" && state.quiz1.segment && (
          <CommonLessonsScreen
            screenId="CL_COMMON_LESSONS"
            segment={state.quiz1.segment}
            progress={state.commonLessons}
            onResetForSegment={(segment) => dispatch({ type: "RESET_COMMON_LESSONS_FOR_SEGMENT", segment })}
            onSetIndex={(index) => dispatch({ type: "SET_COMMON_LESSONS_INDEX", index })}
            onComplete={() => {
              dispatch({ type: "SET_COMMON_LESSONS_COMPLETED", segment: state.quiz1.segment! });
              dispatch({ type: "MARK_SCREEN_COMPLETED", screenId: "CL_COMMON_LESSONS" });
              dispatch({ type: "SET_CURRENT_SCREEN", screenId: "QZ2_INVEST_PROFILE" });
            }}
          />
        )}

        {screenId === "QZ2_INVEST_PROFILE" && (
          state.quiz1.segment && (
            <Quiz2Screen
              screenId="QZ2_INVEST_PROFILE"
              segment={state.quiz1.segment}
              quiz1Answers={state.quiz1.answers}
              answers={state.quiz2.answers}
              externalError={quizError}
              onInteract={() => setQuizError(null)}
              onChangeAnswers={(answers) => {
                setQuizError(null);
                dispatch({ type: "SET_QUIZ2_ANSWERS", answers });
              }}
              onSubmitValid={() => {
                try {
                  const strategy = computeStrategy({
                    quiz1Answers: state.quiz1.answers,
                    quiz2Answers: state.quiz2.answers,
                    segment: state.quiz1.segment!,
                  });
                  const quiz1Hash = computeQuiz1HashForQuiz2(state.quiz1.answers, state.quiz1.segment!);
                  const branchId = resolveBranchId(state.quiz1.segment!, strategy);
                  const quiz2Hash = computeQuiz2HashForBranch({
                    segment: state.quiz1.segment!,
                    strategy,
                    quiz1Hash,
                    quiz2Answers: state.quiz2.answers,
                  });

                  dispatch({
                    type: "SET_QUIZ2_COMPLETED",
                    strategy,
                    segmentSnapshot: state.quiz1.segment!,
                    quiz1Hash,
                  });
                  track("onboarding_quiz2_complete", { strategy, segment: state.quiz1.segment });
                  dispatch({
                    type: "SET_BRANCH_CONTEXT",
                    branchId,
                    segmentSnapshot: state.quiz1.segment!,
                    strategySnapshot: strategy,
                    quiz2Hash,
                  });
                  dispatch({ type: "MARK_SCREEN_COMPLETED", screenId: "QZ2_INVEST_PROFILE" });
                  dispatch({ type: "SET_CURRENT_SCREEN", screenId: "BR_BRANCH_LESSONS" });
                  setQuizError(null);
                } catch (e) {
                  track("onboarding_quiz2_error", { errorType: "STRATEGY_COMPUTE_FAILED" });
                  setQuizError(FIXED_ERROR_QUIZ_INVALID);
                }
              }}
            />
          )
        )}

        {screenId === "BR_BRANCH_LESSONS" && state.branch.branchId && state.quiz1.segment && state.quiz2.strategy && (
          <BranchLessonsScreen
            screenId="BR_BRANCH_LESSONS"
            branchId={state.branch.branchId}
            segment={state.quiz1.segment}
            strategy={state.quiz2.strategy}
            currentIndex={state.branch.currentIndex}
            isCompleted={state.branch.isCompleted}
            onSetIndex={(index) => dispatch({ type: "SET_BRANCH_INDEX", index })}
            onComplete={() => {
              dispatch({ type: "SET_BRANCH_COMPLETED" });
              dispatch({ type: "MARK_SCREEN_COMPLETED", screenId: "BR_BRANCH_LESSONS" });
              dispatch({ type: "SET_CURRENT_SCREEN", screenId: "SCR_FINAL" });
            }}
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

