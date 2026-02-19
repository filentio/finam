import type { OnboardingEvent, OnboardingState, ScreenId } from "./01_state_machine";
import { guardScreenAccess } from "./02_routes";
import { isQuiz1CompletionValid } from "./07_quiz1_rules";
import { isCommonLessonsCompletionValid } from "./11_common_lessons_rules";
import { isQuiz2CompletionValid } from "./15_quiz2_rules";
import { computeQuiz2HashForBranch, isBranchCompletionValid } from "./18_branch_rules";

export type EntryGateUiState = "NEW_USER" | "IN_PROGRESS" | "COMPLETED";

export type EntryGateDerived = {
  hasProgress: boolean;
  isCompleted: boolean;
  lastScreen: ScreenId | null;
  resumeScreen: ScreenId;
  canResume: boolean;
  uiState: EntryGateUiState;
  allowResetQuiz1: boolean;
  allowResetQuiz2: boolean;
};

export function computeResumeScreen(state: OnboardingState): ScreenId {
  const completed = state.processStatus === "COMPLETED" || state.branch.isCompleted;
  if (completed) return "SCR_FINAL";

  const quiz1Ok = isQuiz1CompletionValid(state.quiz1.answers, state.quiz1.segment, state.quiz1.isCompleted);
  if (!quiz1Ok) return "QZ1_EXPERIENCE_GOALS";

  const commonOk = isCommonLessonsCompletionValid(state.commonLessons, state.quiz1.segment);
  if (!commonOk) return "CL_COMMON_LESSONS";

  const quiz2Ok = isQuiz2CompletionValid({
    quiz1Answers: state.quiz1.answers,
    segment: state.quiz1.segment,
    quiz2: {
      answers: state.quiz2.answers,
      isCompleted: state.quiz2.isCompleted,
      strategy: state.quiz2.strategy,
      quiz1Hash: state.quiz2.quiz1Hash,
      segmentSnapshot: state.quiz2.segmentSnapshot,
    },
  });
  if (!quiz2Ok) return "QZ2_INVEST_PROFILE";

  // Branch resume
  const segment = state.quiz1.segment!;
  const strategy = state.quiz2.strategy!;
  const quiz2Hash =
    state.quiz2.quiz1Hash &&
    computeQuiz2HashForBranch({ segment, strategy, quiz1Hash: state.quiz2.quiz1Hash, quiz2Answers: state.quiz2.answers });

  const branchOk = isBranchCompletionValid(state.branch, { segment, strategy, quiz2Hash: quiz2Hash ?? null });
  if (!branchOk) return "BR_BRANCH_LESSONS";

  return "SCR_FINAL";
}

export function deriveEntryGateState(state: OnboardingState): EntryGateDerived {
  const isCompleted = state.processStatus === "COMPLETED" || state.branch.isCompleted;

  // hasProgress must reflect meaningful progress (not just that storage exists),
  // because the shell persists even the initial state.
  const hasProgress =
    state.processStatus !== "NOT_STARTED" ||
    state.quiz1.isCompleted ||
    state.commonLessons.segment !== null ||
    state.commonLessons.isCompleted ||
    state.quiz2.isCompleted ||
    Object.values(state.quiz1.answers).some((v) => v !== null) ||
    Object.values(state.quiz2.answers).some((v) => v !== null) ||
    state.branch.branchId !== null ||
    state.branch.currentIndex !== 0 ||
    state.branch.isCompleted;

  const resumeScreen = computeResumeScreen(state);
  const lastScreen = state.lastNonGateScreenId ?? null;
  const canResume = lastScreen === resumeScreen && guardScreenAccess(state, resumeScreen).allowed;

  const uiState: EntryGateUiState = !hasProgress ? "NEW_USER" : isCompleted ? "COMPLETED" : "IN_PROGRESS";

  const allowResetQuiz1 = isQuiz1CompletionValid(state.quiz1.answers, state.quiz1.segment, state.quiz1.isCompleted);
  const allowResetQuiz2 = isCommonLessonsCompletionValid(state.commonLessons, state.quiz1.segment);

  return { hasProgress, isCompleted, lastScreen, resumeScreen, canResume, uiState, allowResetQuiz1, allowResetQuiz2 };
}

// Deterministic reset commands (implemented as reducer events).
export function resetAll(): OnboardingEvent {
  return { type: "RESET_ALL" };
}

export function resetFromQuiz1(): OnboardingEvent {
  return { type: "RESET_FROM_QUIZ1" };
}

export function resetFromQuiz2(): OnboardingEvent {
  return { type: "RESET_FROM_QUIZ2" };
}

