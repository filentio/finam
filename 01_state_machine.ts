export type ProcessStatus = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED" | "ABANDONED";

export type ScreenStatus = "loading" | "active" | "completed" | "error";

export type ScreenType = "entry" | "quiz" | "common_lesson" | "branch_lesson" | "final";

export type ScreenId =
  | "SCR_ENTRY"
  | "QZ1_EXPERIENCE_GOALS"
  | "CL_COMMON_LESSONS"
  | "QZ2_INVEST_PROFILE"
  | "BR_BEGINNER_01"
  | "BR_BEGINNER_02"
  | "BR_INTERMEDIATE_01"
  | "BR_INTERMEDIATE_02"
  | "BR_ADVANCED_01"
  | "BR_ADVANCED_02"
  | "SCR_FINAL";

export type Segment = "NOVICE" | "LEARNER" | "EXPERIENCED" | "QUALIFIED";
export type Strategy = "conservative" | "balanced" | "aggressive";
export type BranchId = "BR_BEGINNER" | "BR_INTERMEDIATE" | "BR_ADVANCED";

export type Quiz1Answers = {
  q1QualifiedStatus: "QZ1_Q1_YES" | "QZ1_Q1_NO" | null;
  q2Experience:
    | "QZ1_Q2_NO_EXPERIENCE"
    | "QZ1_Q2_LT_1Y"
    | "QZ1_Q2_1_3Y"
    | "QZ1_Q2_3_5Y"
    | "QZ1_Q2_GT_5Y"
    | null;
  q3PlannedAmount: "QZ1_Q3_LT_300K" | "QZ1_Q3_300K_2M" | "QZ1_Q3_2_5M" | "QZ1_Q3_GT_5M" | null;
  q4MainGoal:
    | "QZ1_Q4_PURCHASE"
    | "QZ1_Q4_PASSIVE_INCOME"
    | "QZ1_Q4_GROWTH"
    | "QZ1_Q4_PRESERVE"
    | null;
  q5PrimaryInterest:
    | "QZ1_Q5_FUNDS"
    | "QZ1_Q5_STOCKS"
    | "QZ1_Q5_TRUST"
    | "QZ1_Q5_BONDS"
    | "QZ1_Q5_IPO"
    | "QZ1_Q5_CURRENCY"
    | "QZ1_Q5_STRUCTURED"
    | "QZ1_Q5_DERIVATIVES"
    | null;
};

export type Quiz2Answers = {
  q1Horizon: "До 1 года" | "1–3 года" | "3–5 лет" | "Более 5 лет" | null;
  q2DrawdownReaction: "Продам" | "Подожду" | "Докуплю" | null;
  q3MonthlyShare: "До 5%" | "5–15%" | "Более 15%" | null;
  q4Preference: "Сохранение" | "Баланс" | "Рост" | null;
};

export type CommonLessonsState = {
  currentIndex: number;
  isCompleted: boolean;
  segment: Segment | null;
};

export type OnboardingState = {
  processStatus: ProcessStatus;
  currentScreenId: ScreenId;
  screenStatusById: Record<ScreenId, ScreenStatus>;

  quiz1: {
    answers: Quiz1Answers;
    isCompleted: boolean;
    segment: Segment | null;
  };

  quiz2: {
    answers: Quiz2Answers;
    isCompleted: boolean;
    strategy: Strategy | null;
  };

  commonLessons: CommonLessonsState;

  branch: {
    branchId: BranchId | null;
  };

  completedScreenIds: Record<ScreenId, boolean>;
  lastSavedAtMs: number | null;
};

export type OnboardingEvent =
  | { type: "START_PROCESS" }
  | { type: "ABANDON_PROCESS" }
  | { type: "COMPLETE_PROCESS" }
  | { type: "SET_CURRENT_SCREEN"; screenId: ScreenId }
  | { type: "SET_SCREEN_STATUS"; screenId: ScreenId; status: ScreenStatus }
  | { type: "MARK_SCREEN_COMPLETED"; screenId: ScreenId }
  | { type: "SET_QUIZ1_ANSWERS"; answers: Quiz1Answers }
  | { type: "SET_QUIZ1_COMPLETED"; segment: Segment }
  | { type: "RESET_COMMON_LESSONS_FOR_SEGMENT"; segment: Segment }
  | { type: "SET_COMMON_LESSONS_INDEX"; index: number }
  | { type: "SET_COMMON_LESSONS_COMPLETED"; segment: Segment }
  | { type: "SET_QUIZ2_ANSWERS"; answers: Quiz2Answers }
  | { type: "SET_QUIZ2_COMPLETED"; strategy: Strategy }
  | { type: "SET_BRANCH_ID"; branchId: BranchId }
  | { type: "HYDRATE"; state: OnboardingState };

export const DEFAULT_QUIZ1_ANSWERS: Quiz1Answers = {
  q1QualifiedStatus: null,
  q2Experience: null,
  q3PlannedAmount: null,
  q4MainGoal: null,
  q5PrimaryInterest: null,
};

export const DEFAULT_QUIZ2_ANSWERS: Quiz2Answers = {
  q1Horizon: null,
  q2DrawdownReaction: null,
  q3MonthlyShare: null,
  q4Preference: null,
};

export const DEFAULT_COMMON_LESSONS_STATE: CommonLessonsState = {
  currentIndex: 0,
  isCompleted: false,
  segment: null,
};

export function getInitialOnboardingState(): OnboardingState {
  const allScreenIds: ScreenId[] = [
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

  const screenStatusById = Object.fromEntries(allScreenIds.map((id) => [id, "loading"])) as Record<
    ScreenId,
    ScreenStatus
  >;
  const completedScreenIds = Object.fromEntries(allScreenIds.map((id) => [id, false])) as Record<
    ScreenId,
    boolean
  >;

  return {
    processStatus: "NOT_STARTED",
    currentScreenId: "SCR_ENTRY",
    screenStatusById,
    quiz1: { answers: DEFAULT_QUIZ1_ANSWERS, isCompleted: false, segment: null },
    quiz2: { answers: DEFAULT_QUIZ2_ANSWERS, isCompleted: false, strategy: null },
    commonLessons: { ...DEFAULT_COMMON_LESSONS_STATE },
    branch: { branchId: null },
    completedScreenIds,
    lastSavedAtMs: null,
  };
}

export function onboardingReducer(state: OnboardingState, event: OnboardingEvent): OnboardingState {
  switch (event.type) {
    case "HYDRATE":
      return event.state;

    case "START_PROCESS":
      return {
        ...state,
        processStatus: "IN_PROGRESS",
      };

    case "ABANDON_PROCESS":
      return {
        ...state,
        processStatus: state.processStatus === "COMPLETED" ? "COMPLETED" : "ABANDONED",
      };

    case "COMPLETE_PROCESS":
      return {
        ...state,
        processStatus: "COMPLETED",
      };

    case "SET_CURRENT_SCREEN":
      return {
        ...state,
        currentScreenId: event.screenId,
      };

    case "SET_SCREEN_STATUS":
      return {
        ...state,
        screenStatusById: { ...state.screenStatusById, [event.screenId]: event.status },
      };

    case "MARK_SCREEN_COMPLETED":
      return {
        ...state,
        completedScreenIds: { ...state.completedScreenIds, [event.screenId]: true },
        screenStatusById: { ...state.screenStatusById, [event.screenId]: "completed" },
      };

    case "SET_QUIZ1_ANSWERS":
      return {
        ...state,
        // Any answer change invalidates quiz completion and requires re-submit.
        quiz1: { ...state.quiz1, answers: event.answers, isCompleted: false, segment: null },
        // Any change to Quiz1 can change segment. Common lessons progress must be reset deterministically.
        commonLessons: { ...DEFAULT_COMMON_LESSONS_STATE },
      };

    case "SET_QUIZ1_COMPLETED":
      if (state.commonLessons.segment && state.commonLessons.segment !== event.segment) {
        return {
          ...state,
          quiz1: { ...state.quiz1, isCompleted: true, segment: event.segment },
          commonLessons: { ...DEFAULT_COMMON_LESSONS_STATE, segment: event.segment },
        };
      }
      return {
        ...state,
        quiz1: { ...state.quiz1, isCompleted: true, segment: event.segment },
        commonLessons: {
          ...state.commonLessons,
          segment: state.commonLessons.segment ?? event.segment,
        },
      };

    case "RESET_COMMON_LESSONS_FOR_SEGMENT":
      return {
        ...state,
        commonLessons: { ...DEFAULT_COMMON_LESSONS_STATE, segment: event.segment },
      };

    case "SET_COMMON_LESSONS_INDEX":
      return {
        ...state,
        commonLessons: { ...state.commonLessons, currentIndex: event.index },
      };

    case "SET_COMMON_LESSONS_COMPLETED":
      return {
        ...state,
        commonLessons: {
          ...state.commonLessons,
          isCompleted: true,
          segment: event.segment,
        },
      };

    case "SET_QUIZ2_ANSWERS":
      return {
        ...state,
        quiz2: { ...state.quiz2, answers: event.answers },
      };

    case "SET_QUIZ2_COMPLETED":
      return {
        ...state,
        quiz2: { ...state.quiz2, isCompleted: true, strategy: event.strategy },
      };

    case "SET_BRANCH_ID":
      return {
        ...state,
        branch: { branchId: event.branchId },
      };

    default: {
      const _exhaustive: never = event;
      return state;
    }
  }
}

