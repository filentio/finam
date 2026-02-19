import type { BranchId, OnboardingState, ScreenId, ScreenType } from "./01_state_machine";
import { getBranchStartScreenId } from "./03_branch_mapping";
import { isQuiz1CompletionValid } from "./07_quiz1_rules";
import { isCommonLessonsCompletionValid } from "./11_common_lessons_rules";
import { isQuiz2CompletionValid } from "./15_quiz2_rules";

export const ALL_SCREEN_IDS: ScreenId[] = [
  "SCR_ENTRY",
  "QZ1_EXPERIENCE_GOALS",
  "CL_COMMON_LESSONS",
  "QZ2_INVEST_PROFILE",
  "BR_BEGINNER_01",
  "BR_BEGINNER_02",
  "BR_INTERMEDIATE_01",
  "BR_INTERMEDIATE_02",
  "BR_ADVANCED_01",
  "BR_ADVANCED_02",
  "SCR_FINAL",
];

export const SCREEN_TYPE_BY_ID: Record<ScreenId, ScreenType> = {
  SCR_ENTRY: "entry",
  QZ1_EXPERIENCE_GOALS: "quiz",
  CL_COMMON_LESSONS: "common_lesson",
  QZ2_INVEST_PROFILE: "quiz",
  BR_BEGINNER_01: "branch_lesson",
  BR_BEGINNER_02: "branch_lesson",
  BR_INTERMEDIATE_01: "branch_lesson",
  BR_INTERMEDIATE_02: "branch_lesson",
  BR_ADVANCED_01: "branch_lesson",
  BR_ADVANCED_02: "branch_lesson",
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
  { from: "SCR_ENTRY", to: "QZ1_EXPERIENCE_GOALS", condition: "NEXT", type: "linear" },
  { from: "QZ1_EXPERIENCE_GOALS", to: "CL_COMMON_LESSONS", condition: "SUBMIT_VALID", type: "submit" },
  { from: "CL_COMMON_LESSONS", to: "QZ2_INVEST_PROFILE", condition: "SUBMIT_VALID", type: "submit" },
  {
    from: "QZ2_INVEST_PROFILE",
    to: (state) => getBranchStartScreenId(assertBranchIdResolved(state.branch.branchId)),
    condition: "BRANCH_RESOLVED",
    type: "branch",
  },
  { from: "BR_BEGINNER_01", to: "BR_BEGINNER_02", condition: "NEXT", type: "linear" },
  { from: "BR_BEGINNER_02", to: "SCR_FINAL", condition: "NEXT", type: "linear" },
  { from: "BR_INTERMEDIATE_01", to: "BR_INTERMEDIATE_02", condition: "NEXT", type: "linear" },
  { from: "BR_INTERMEDIATE_02", to: "SCR_FINAL", condition: "NEXT", type: "linear" },
  { from: "BR_ADVANCED_01", to: "BR_ADVANCED_02", condition: "NEXT", type: "linear" },
  { from: "BR_ADVANCED_02", to: "SCR_FINAL", condition: "NEXT", type: "linear" },
];

export const BACK_BY_SCREEN_ID: Record<ScreenId, ScreenId | null> = {
  SCR_ENTRY: null,
  QZ1_EXPERIENCE_GOALS: "SCR_ENTRY",
  CL_COMMON_LESSONS: "QZ1_EXPERIENCE_GOALS",
  QZ2_INVEST_PROFILE: "CL_COMMON_LESSONS",
  BR_BEGINNER_01: "QZ2_INVEST_PROFILE",
  BR_BEGINNER_02: "BR_BEGINNER_01",
  BR_INTERMEDIATE_01: "QZ2_INVEST_PROFILE",
  BR_INTERMEDIATE_02: "BR_INTERMEDIATE_01",
  BR_ADVANCED_01: "QZ2_INVEST_PROFILE",
  BR_ADVANCED_02: "BR_ADVANCED_01",
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
  if (state.processStatus === "COMPLETED" && targetScreenId !== "SCR_FINAL") {
    return { allowed: false, redirectTo: "SCR_FINAL", reason: "PROCESS_COMPLETED_GUARD" };
  }

  // No skipping of quizzes.
  const isAfterQuiz1 =
    targetScreenId !== "SCR_ENTRY" && targetScreenId !== "QZ1_EXPERIENCE_GOALS" && targetScreenId !== "SCR_FINAL";
  if (isAfterQuiz1 && !isQuiz1CompletionValid(state.quiz1.answers, state.quiz1.segment, state.quiz1.isCompleted)) {
    return { allowed: false, redirectTo: "QZ1_EXPERIENCE_GOALS", reason: "QUIZ1_REQUIRED" };
  }

  // Common lessons are mandatory before Quiz2 and everything after.
  const isAfterCommonLessons =
    targetScreenId === "QZ2_INVEST_PROFILE" ||
    targetScreenId === "BR_BEGINNER_01" ||
    targetScreenId === "BR_BEGINNER_02" ||
    targetScreenId === "BR_INTERMEDIATE_01" ||
    targetScreenId === "BR_INTERMEDIATE_02" ||
    targetScreenId === "BR_ADVANCED_01" ||
    targetScreenId === "BR_ADVANCED_02" ||
    targetScreenId === "SCR_FINAL";
  if (isAfterCommonLessons && !isCommonLessonsCompletionValid(state.commonLessons, state.quiz1.segment)) {
    return { allowed: false, redirectTo: "CL_COMMON_LESSONS", reason: "COMMON_LESSONS_REQUIRED" };
  }

  const isAfterQuiz2 =
    targetScreenId === "BR_BEGINNER_01" ||
    targetScreenId === "BR_BEGINNER_02" ||
    targetScreenId === "BR_INTERMEDIATE_01" ||
    targetScreenId === "BR_INTERMEDIATE_02" ||
    targetScreenId === "BR_ADVANCED_01" ||
    targetScreenId === "BR_ADVANCED_02" ||
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

  if (isAfterQuiz2 && !state.branch.branchId) {
    return { allowed: false, redirectTo: "QZ2_INVEST_PROFILE", reason: "BRANCH_ID_REQUIRED" };
  }

  // Final screen requires full completion of branch placeholders (both screens visited).
  if (targetScreenId === "SCR_FINAL") {
    const requiredCompleted = getBranchRequiredCompletedScreenIds(state.branch.branchId);
    for (const id of requiredCompleted) {
      if (!state.completedScreenIds[id]) {
        return { allowed: false, redirectTo: id, reason: "FINAL_REQUIRES_BRANCH_COMPLETION" };
      }
    }
  }

  return { allowed: true };
}

export function getBranchRequiredCompletedScreenIds(branchId: BranchId | null): ScreenId[] {
  if (!branchId) return [];
  switch (branchId) {
    case "BR_BEGINNER":
      return ["BR_BEGINNER_01", "BR_BEGINNER_02"];
    case "BR_INTERMEDIATE":
      return ["BR_INTERMEDIATE_01", "BR_INTERMEDIATE_02"];
    case "BR_ADVANCED":
      return ["BR_ADVANCED_01", "BR_ADVANCED_02"];
  }
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

