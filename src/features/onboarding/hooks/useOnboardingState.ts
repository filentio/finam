import { useMemo, useReducer } from "react";
import type { Dispatch } from "react";
import { LESSONS_BY_ID } from "../data/lessons";
import { RISK_QUIZ_QUESTIONS } from "../data/riskQuiz";
import { getTrack } from "../data/tracks";
import { determineAmountTier, determineSegment } from "./useSegmentation";
import { calculateRiskProfile, createEmptyRiskResult } from "./useRiskScoring";
import type {
  DOSInput,
  OnboardingAction,
  OnboardingState,
  ProgressInfo,
  ScreenConfig,
  StepType,
  TrackStep,
} from "../types/onboarding";

const nowIso = () => new Date().toISOString();

const EMPTY_DOS: DOSInput = {
  qualified_investor: false,
  experience: "none",
  investment_amount: "up_to_300k",
  investment_goal: "growth",
  instruments: [],
};

export const initialOnboardingState: OnboardingState = {
  user_id: "",
  started_at: "",
  dos_input: EMPTY_DOS,
  segment: "novice",
  amount_tier: "starter",
  track: [],
  status: "not_started",
  current_step_index: 0,
  current_screen_index: 0,
  completed_steps: [],
  completed_lessons: [],
  risk_quiz_result: null,
  total_time_sec: 0,
  last_active_at: "",
};

function getStepId(step: TrackStep): string {
  if (step.type === "lesson") {
    return step.lesson_id ?? "lesson_unknown";
  }
  return step.type;
}

function getSpecialScreens(stepType: StepType): ScreenConfig[] {
  if (stepType === "risk_quiz") {
    return [
      {
        screen_id: "risk_intro",
        type: "quiz_intro",
        title: "Определим ваш риск-профиль",
        subtitle: "Это займёт всего 1 минуту и поможет подобрать подходящие инструменты.",
      },
      ...RISK_QUIZ_QUESTIONS.map((question, index) => ({
        screen_id: `risk_q${index + 5}`,
        type: "quiz",
        title: question.question,
        subtitle: question.screen_config.progress_label,
      })),
    ];
  }

  if (stepType === "risk_result") {
    return [
      {
        screen_id: "risk_result_1",
        type: "result",
        title: "Ваш риск-профиль определён",
        subtitle: "Профиль рассчитан с учётом ДОС и анкеты риска.",
      },
    ];
  }

  if (stepType === "first_purchase") {
    return [
      {
        screen_id: "first_purchase_1",
        type: "cta",
        title: "Первая покупка",
        subtitle: "Перейдите к персональной рекомендации.",
        cta: [{ label: "Купить", type: "primary", action: "complete" }],
      },
    ];
  }

  return [
    {
      screen_id: "personal_recommendations_1",
      type: "content",
      title: "Персональные рекомендации",
      subtitle: "Контент адаптирован под ваш профиль.",
    },
  ];
}

export function getVisibleScreens(
  step: TrackStep,
  state: OnboardingState,
): ScreenConfig[] {
  if (step.type !== "lesson") {
    return getSpecialScreens(step.type);
  }

  const lesson = LESSONS_BY_ID[step.lesson_id ?? ""];
  if (!lesson) {
    return [];
  }

  const variant = step.variant ?? "full";
  const lessonScreens = [...lesson.screens];
  let screens = lessonScreens;

  if (
    variant !== "full" &&
    lesson.variants &&
    variant in lesson.variants &&
    lesson.variants[variant]
  ) {
    const allowed = new Set(lesson.variants[variant]?.screens ?? []);
    if (allowed.size > 0) {
      screens = lessonScreens.filter((screen) => allowed.has(screen.screen_id));
    }
  }

  const filtered = screens.filter((screen) => {
    if (!screen.show_for || screen.show_for.length === 0) {
      return true;
    }
    return screen.show_for.includes(state.segment);
  });

  const unique: ScreenConfig[] = [];
  const seen = new Set<string>();
  for (const screen of filtered) {
    if (seen.has(screen.screen_id)) {
      continue;
    }
    seen.add(screen.screen_id);
    unique.push(screen);
  }

  return unique;
}

export function getScreenCount(step: TrackStep, state: OnboardingState): number {
  return getVisibleScreens(step, state).length;
}

export function getStepLabel(step: TrackStep): string {
  if (step.type === "lesson") {
    return `Урок ${step.lesson_id?.replace("lesson_", "") ?? "?"}`;
  }
  if (step.type === "risk_quiz") {
    return "Анкета риска";
  }
  if (step.type === "risk_result") {
    return "Результат анкеты";
  }
  if (step.type === "first_purchase") {
    return "Первая покупка";
  }
  return "Рекомендации";
}

export function calculateProgress(state: OnboardingState): ProgressInfo {
  const totalSteps = state.track.length;
  if (totalSteps === 0) {
    return {
      totalSteps: 0,
      completedSteps: 0,
      currentStepIndex: 0,
      currentStepProgress: 0,
      overallProgress: 0,
      currentStepLabel: "Онбординг",
    };
  }

  const currentStep = state.track[state.current_step_index];
  if (!currentStep) {
    return {
      totalSteps,
      completedSteps: state.completed_steps.length,
      currentStepIndex: 0,
      currentStepProgress: 0,
      overallProgress: 0,
      currentStepLabel: "Онбординг",
    };
  }
  const totalScreens = getScreenCount(currentStep, state);
  const currentStepProgress =
    totalScreens > 0 ? (state.current_screen_index + 1) / totalScreens : 1;

  return {
    totalSteps,
    completedSteps: state.completed_steps.length,
    currentStepIndex: state.current_step_index,
    currentStepProgress,
    overallProgress: (state.current_step_index + currentStepProgress) / totalSteps,
    currentStepLabel: getStepLabel(currentStep),
  };
}

export function onboardingReducer(
  state: OnboardingState,
  action: OnboardingAction,
): OnboardingState {
  switch (action.type) {
    case "START": {
      const dos = action.payload.dos;
      const segment = determineSegment(dos);
      const amountTier = determineAmountTier(dos.investment_amount);
      const track = getTrack(segment);
      const startedAt = nowIso();

      return {
        ...initialOnboardingState,
        user_id: action.payload.userId,
        dos_input: dos,
        segment,
        amount_tier: amountTier,
        track,
        status: "in_progress",
        current_step_index: 0,
        current_screen_index: 0,
        started_at: startedAt,
        last_active_at: startedAt,
      };
    }

    case "NEXT_SCREEN": {
      const currentStep = state.track[state.current_step_index];
      if (!currentStep) {
        return state;
      }
      const totalScreens = getScreenCount(currentStep, state);
      if (state.current_screen_index < totalScreens - 1) {
        return {
          ...state,
          current_screen_index: state.current_screen_index + 1,
          last_active_at: nowIso(),
        };
      }
      return onboardingReducer(state, { type: "NEXT_STEP" });
    }

    case "PREV_SCREEN": {
      if (state.current_screen_index > 0) {
        return {
          ...state,
          current_screen_index: state.current_screen_index - 1,
          last_active_at: nowIso(),
        };
      }

      if (state.current_step_index > 0) {
        const prevStepIndex = state.current_step_index - 1;
        const prevStep = state.track[prevStepIndex];
        if (!prevStep) {
          return state;
        }
        const prevScreenCount = getScreenCount(prevStep, state);
        return {
          ...state,
          current_step_index: prevStepIndex,
          current_screen_index: Math.max(prevScreenCount - 1, 0),
          last_active_at: nowIso(),
        };
      }

      return state;
    }

    case "NEXT_STEP": {
      const currentStep = state.track[state.current_step_index];
      if (!currentStep) {
        return state;
      }

      const stepId = getStepId(currentStep);
      const completedSteps = [...state.completed_steps, stepId];
      const completedLessons =
        currentStep.type === "lesson" && currentStep.lesson_id
          ? [...state.completed_lessons, currentStep.lesson_id]
          : state.completed_lessons;

      if (state.current_step_index < state.track.length - 1) {
        return {
          ...state,
          current_step_index: state.current_step_index + 1,
          current_screen_index: 0,
          completed_steps: completedSteps,
          completed_lessons: completedLessons,
          last_active_at: nowIso(),
        };
      }

      return {
        ...state,
        status: "completed",
        completed_steps: completedSteps,
        completed_lessons: completedLessons,
        last_active_at: nowIso(),
      };
    }

    case "SKIP_LESSON":
      return onboardingReducer(state, { type: "NEXT_STEP" });

    case "SUBMIT_RISK_ANSWER": {
      const answer = action.payload;
      const currentAnswers = state.risk_quiz_result?.answers ?? [];
      const nextAnswers = [
        ...currentAnswers.filter((item) => item.question_id !== answer.question_id),
        answer,
      ];

      return {
        ...state,
        risk_quiz_result: {
          ...(state.risk_quiz_result ?? createEmptyRiskResult()),
          answers: nextAnswers,
        },
        last_active_at: nowIso(),
      };
    }

    case "COMPLETE_RISK_QUIZ": {
      const answers = state.risk_quiz_result?.answers ?? [];
      const result = calculateRiskProfile(state.dos_input, answers);
      return {
        ...state,
        risk_quiz_result: result,
        last_active_at: nowIso(),
      };
    }

    case "PAUSE":
      return { ...state, status: "paused", last_active_at: nowIso() };

    case "RESUME":
      return { ...state, status: "in_progress", last_active_at: nowIso() };

    case "COMPLETE":
      return { ...state, status: "completed", last_active_at: nowIso() };

    case "TICK_TIME":
      return {
        ...state,
        total_time_sec: Math.max(0, state.total_time_sec + action.payload.deltaSec),
      };

    case "RESET":
      return initialOnboardingState;

    default:
      return state;
  }
}

export function useOnboardingState(): {
  state: OnboardingState;
  dispatch: Dispatch<OnboardingAction>;
  progress: ProgressInfo;
} {
  const [state, dispatch] = useReducer(onboardingReducer, initialOnboardingState);
  const progress = useMemo(() => calculateProgress(state), [state]);
  return { state, dispatch, progress };
}
