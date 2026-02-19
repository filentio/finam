export type ProcessStatus = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED" | "ABANDONED";

export type ScreenStatus = "loading" | "active" | "completed" | "error";

export type ScreenType = "entry" | "quiz" | "common_lesson" | "branch_lesson" | "final";

export type ScreenId =
  | "SCR_ENTRY"
  | "QZ1_EXPERIENCE_GOALS"
  | "CL01_PLACEHOLDER"
  | "CL02_PLACEHOLDER"
  | "CL03_PLACEHOLDER"
  | "QZ2_INVEST_PROFILE"
  | "BR_BEGINNER_01"
  | "BR_BEGINNER_02"
  | "BR_INTERMEDIATE_01"
  | "BR_INTERMEDIATE_02"
  | "BR_ADVANCED_01"
  | "BR_ADVANCED_02"
  | "SCR_FINAL";

export type Segment = "novice" | "learner" | "experienced" | "qualified";
export type Strategy = "conservative" | "balanced" | "aggressive";
export type BranchId = "BR_BEGINNER" | "BR_INTERMEDIATE" | "BR_ADVANCED";

export type Quiz1Answers = {
  q1QualifiedStatus: "Да" | "Нет" | null;
  q2Experience:
    | "Еще нет опыта"
    | "Менее 1 года"
    | "От 1 до 3 лет"
    | "От 3 до 5 лет"
    | "Более 5 лет"
    | null;
  q3PlannedAmount: "До 300 тыс" | "300 тыс - 2 млн" | "2 - 5 млн" | "Более 5 млн" | null;
  q4MainGoal:
    | "Накопление на крупную покупку"
    | "Получение пассивного дохода"
    | "Рост капитала"
    | "Сохранение и наследие"
    | null;
  q5Interests: {
    fundsEtfPif: boolean;
    stocks: boolean;
    trustManagement: boolean;
    bonds: boolean;
    ipo: boolean;
    currency: boolean;
    structuredProducts: boolean;
    derivatives: boolean;
  };
};

export type Quiz2Answers = {
  q1Horizon: "До 1 года" | "1–3 года" | "3–5 лет" | "Более 5 лет" | null;
  q2DrawdownReaction: "Продам" | "Подожду" | "Докуплю" | null;
  q3MonthlyShare: "До 5%" | "5–15%" | "Более 15%" | null;
  q4Preference: "Сохранение" | "Баланс" | "Рост" | null;
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
  | { type: "SET_QUIZ2_ANSWERS"; answers: Quiz2Answers }
  | { type: "SET_QUIZ2_COMPLETED"; strategy: Strategy }
  | { type: "SET_BRANCH_ID"; branchId: BranchId }
  | { type: "HYDRATE"; state: OnboardingState };

export const DEFAULT_QUIZ1_ANSWERS: Quiz1Answers = {
  q1QualifiedStatus: null,
  q2Experience: null,
  q3PlannedAmount: null,
  q4MainGoal: null,
  q5Interests: {
    fundsEtfPif: false,
    stocks: false,
    trustManagement: false,
    bonds: false,
    ipo: false,
    currency: false,
    structuredProducts: false,
    derivatives: false,
  },
};

export const DEFAULT_QUIZ2_ANSWERS: Quiz2Answers = {
  q1Horizon: null,
  q2DrawdownReaction: null,
  q3MonthlyShare: null,
  q4Preference: null,
};

export function getInitialOnboardingState(): OnboardingState {
  const allScreenIds: ScreenId[] = [
    "SCR_ENTRY",
    "QZ1_EXPERIENCE_GOALS",
    "CL01_PLACEHOLDER",
    "CL02_PLACEHOLDER",
    "CL03_PLACEHOLDER",
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
        quiz1: { ...state.quiz1, answers: event.answers },
      };

    case "SET_QUIZ1_COMPLETED":
      return {
        ...state,
        quiz1: { ...state.quiz1, isCompleted: true, segment: event.segment },
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

