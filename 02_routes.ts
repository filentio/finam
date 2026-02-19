import type { BranchId, OnboardingState, ScreenId, ScreenType } from "./01_state_machine";
import { getBranchStartScreenId } from "./03_branch_mapping";
import { isQuiz1CompletionValid } from "./07_quiz1_rules";
import { isCommonLessonsCompletionValid } from "./11_common_lessons_rules";
import { isQuiz2CompletionValid } from "./15_quiz2_rules";
import { computeQuiz2HashForBranch, isBranchCompletionValid, resolveBranchId } from "./18_branch_rules";

export const ALL_SCREEN_IDS: ScreenId[] = [
  "ENTRY_GATE",
  "QZ1_EXPERIENCE_GOALS",
  "CL_COMMON_LESSONS",
  "QZ2_INVEST_PROFILE",
  "BR_BRANCH_LESSONS",
  "SCR_FINAL",
];

export const SCREEN_TYPE_BY_ID: Record<ScreenId, ScreenType> = {
  ENTRY_GATE: "entry",
  QZ1_EXPERIENCE_GOALS: "quiz",
  CL_COMMON_LESSONS: "common_lesson",
  QZ2_INVEST_PROFILE: "quiz",
  BR_BRANCH_LESSONS: "branch_lesson",
  SCR_FINAL: "final",
};

export type RouteEdgeType = "linear" | "submit" | "branch";

export type RouteEdge = {
  from: ScreenId;
  to:
    | ScreenId
    | ((state: OnboardingState) => ScreenId); // used only for deterministic branch start selection
  condition:
    | "NEXT"
    | "BACK"
    | "SUBMIT_VALID"
    | "BRANCH_RESOLVED"
    | "PROCESS_COMPLETED_GUARD";
  type: RouteEdgeType;
};

export const ROUTE_EDGES: RouteEdge[] = [
  { from: "ENTRY_GATE", to: "QZ1_EXPERIENCE_GOALS", condition: "NEXT", type: "linear" },
  { from: "QZ1_EXPERIENCE_GOALS", to: "CL_COMMON_LESSONS", condition: "SUBMIT_VALID", type: "submit" },
  { from: "CL_COMMON_LESSONS", to: "QZ2_INVEST_PROFILE", condition: "SUBMIT_VALID", type: "submit" },
  {
    from: "QZ2_INVEST_PROFILE",
    to: (state) => getBranchStartScreenId(assertBranchIdResolved(state.branch.branchId)),
    condition: "BRANCH_RESOLVED",
    type: "branch",
  },
  { from: "BR_BRANCH_LESSONS", to: "SCR_FINAL", condition: "SUBMIT_VALID", type: "submit" },
];

export const BACK_BY_SCREEN_ID: Record<ScreenId, ScreenId | null> = {
  ENTRY_GATE: null,
  QZ1_EXPERIENCE_GOALS: "ENTRY_GATE",
  CL_COMMON_LESSONS: "QZ1_EXPERIENCE_GOALS",
  QZ2_INVEST_PROFILE: "CL_COMMON_LESSONS",
  BR_BRANCH_LESSONS: "QZ2_INVEST_PROFILE",
  SCR_FINAL: null,
};

export function getScreenType(screenId: ScreenId): ScreenType {
  return SCREEN_TYPE_BY_ID[screenId];
}

export function getNextScreenId(state: OnboardingState): ScreenId | null {
  if (state.processStatus === "COMPLETED") {
    return null;
  }
  const from = state.currentScreenId;
  const edge = ROUTE_EDGES.find((e) => e.from === from && (e.condition === "NEXT" || e.condition === "BRANCH_RESOLVED"));
  if (!edge) return null;

  if (typeof edge.to === "function") {
    return edge.to(state);
  }
  return edge.to;
}

export function getBackScreenId(state: OnboardingState): ScreenId | null {
  if (state.processStatus === "COMPLETED") return null;
  return BACK_BY_SCREEN_ID[state.currentScreenId];
}

export type ScreenGuardResult =
  | { allowed: true }
  | { allowed: false; redirectTo: ScreenId; reason: string };

export function guardScreenAccess(state: OnboardingState, targetScreenId: ScreenId): ScreenGuardResult {
  if (targetScreenId === "ENTRY_GATE") {
    return { allowed: true };
  }

  if (state.processStatus === "COMPLETED" && targetScreenId !== "SCR_FINAL") {
    return { allowed: false, redirectTo: "SCR_FINAL", reason: "PROCESS_COMPLETED_GUARD" };
  }

  // No skipping of quizzes.
  const isAfterQuiz1 =
    targetScreenId !== "ENTRY_GATE" && targetScreenId !== "QZ1_EXPERIENCE_GOALS" && targetScreenId !== "SCR_FINAL";
  if (isAfterQuiz1 && !isQuiz1CompletionValid(state.quiz1.answers, state.quiz1.segment, state.quiz1.isCompleted)) {
    return { allowed: false, redirectTo: "QZ1_EXPERIENCE_GOALS", reason: "QUIZ1_REQUIRED" };
  }

  // Common lessons are mandatory before Quiz2 and everything after.
  const isAfterCommonLessons =
    targetScreenId === "QZ2_INVEST_PROFILE" ||
    targetScreenId === "BR_BRANCH_LESSONS" ||
    targetScreenId === "SCR_FINAL";
  if (isAfterCommonLessons && !isCommonLessonsCompletionValid(state.commonLessons, state.quiz1.segment)) {
    return { allowed: false, redirectTo: "CL_COMMON_LESSONS", reason: "COMMON_LESSONS_REQUIRED" };
  }

  const isAfterQuiz2 =
    targetScreenId === "BR_BRANCH_LESSONS" ||
    targetScreenId === "SCR_FINAL";
  if (
    isAfterQuiz2 &&
    !isQuiz2CompletionValid({
      quiz1Answers: state.quiz1.answers,
      segment: state.quiz1.segment,
      quiz2: {
        answers: state.quiz2.answers,
        isCompleted: state.quiz2.isCompleted,
        strategy: state.quiz2.strategy,
        quiz1Hash: state.quiz2.quiz1Hash,
        segmentSnapshot: state.quiz2.segmentSnapshot,
      },
    })
  ) {
    return { allowed: false, redirectTo: "QZ2_INVEST_PROFILE", reason: "QUIZ2_REQUIRED" };
  }

  // Branch context must be deterministic and consistent with (segment + strategy).
  if (isAfterQuiz2) {
    const segment = state.quiz1.segment!;
    const strategy = state.quiz2.strategy!;
    const resolvedBranchId = resolveBranchId(segment, strategy);
    if (state.branch.branchId !== resolvedBranchId) {
      return { allowed: false, redirectTo: "QZ2_INVEST_PROFILE", reason: "BRANCH_ID_REQUIRED" };
    }
    if (!state.quiz2.quiz1Hash) {
      return { allowed: false, redirectTo: "QZ2_INVEST_PROFILE", reason: "BRANCH_UPSTREAM_HASH_REQUIRED" };
    }
    const quiz2Hash = computeQuiz2HashForBranch({
      segment,
      strategy,
      quiz1Hash: state.quiz2.quiz1Hash,
      quiz2Answers: state.quiz2.answers,
    });
    if (state.branch.quiz2Hash !== quiz2Hash) {
      return { allowed: false, redirectTo: "QZ2_INVEST_PROFILE", reason: "BRANCH_UPSTREAM_HASH_MISMATCH" };
    }
  }

  // Final screen requires completed branch.
  if (targetScreenId === "SCR_FINAL") {
    const segment = state.quiz1.segment!;
    const strategy = state.quiz2.strategy!;
    const quiz2Hash = state.branch.quiz2Hash;
    if (!isBranchCompletionValid(state.branch, { segment, strategy, quiz2Hash })) {
      return { allowed: false, redirectTo: "BR_BRANCH_LESSONS", reason: "FINAL_REQUIRES_BRANCH_COMPLETION" };
    }
  }

  // If branch already completed, entering branch screen redirects to final.
  if (targetScreenId === "BR_BRANCH_LESSONS") {
    const segment = state.quiz1.segment;
    const strategy = state.quiz2.strategy;
    const quiz2Hash = state.branch.quiz2Hash;
    if (isBranchCompletionValid(state.branch, { segment, strategy, quiz2Hash })) {
      return { allowed: false, redirectTo: "SCR_FINAL", reason: "BRANCH_ALREADY_COMPLETED" };
    }
  }

  return { allowed: true };
}

export function assertRouteIntegrity(): void {
  const set = new Set<string>();
  for (const id of ALL_SCREEN_IDS) {
    if (set.has(id)) throw new Error(`Duplicate ScreenId: ${id}`);
    set.add(id);
  }
}

function assertBranchIdResolved(branchId: BranchId | null): BranchId {
  if (!branchId) {
    throw new Error("BranchId is required for branch routing.");
  }
  return branchId;
}

