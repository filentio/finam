import { getInitialOnboardingState, type OnboardingState, type ScreenId } from "./01_state_machine";
import { ALL_SCREEN_IDS } from "./02_routes";
import { isCommonLessonsCompletionValid } from "./11_common_lessons_rules";

const STORAGE_KEY = "onboarding_shell_v1";
const STORAGE_VERSION = 1 as const;

type StoredPayloadV1 = {
  version: typeof STORAGE_VERSION;
  savedAtMs: number;
  state: OnboardingState;
};

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function saveProgress(state: OnboardingState): void {
  if (!isBrowser()) return;
  const payload: StoredPayloadV1 = {
    version: STORAGE_VERSION,
    savedAtMs: Date.now(),
    state: { ...state, lastSavedAtMs: Date.now() },
  };
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

export function loadProgress(): OnboardingState | null {
  if (!isBrowser()) return null;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Partial<StoredPayloadV1>;
    if (parsed.version !== STORAGE_VERSION) return null;
    if (!parsed.state) return null;

    // Migration: previous versions used CL01/CL02/CL03 placeholders.
    const anyState = parsed.state as unknown as { currentScreenId?: unknown };
    if (anyState.currentScreenId === "CL01_PLACEHOLDER" || anyState.currentScreenId === "CL02_PLACEHOLDER" || anyState.currentScreenId === "CL03_PLACEHOLDER") {
      (parsed.state as unknown as { currentScreenId: unknown }).currentScreenId = "CL_COMMON_LESSONS";
    }

    const merged = mergeWithInitial(parsed.state);
    if (!isValidScreenId(merged.currentScreenId)) return null;

    // Restore rule: if common lessons completed for the current segment, resume at Quiz2.
    if (merged.currentScreenId === "CL_COMMON_LESSONS" && isCommonLessonsCompletionValid(merged.commonLessons, merged.quiz1.segment)) {
      merged.currentScreenId = "QZ2_INVEST_PROFILE";
    }

    return merged;
  } catch {
    return null;
  }
}

export function clearProgress(): void {
  if (!isBrowser()) return;
  window.localStorage.removeItem(STORAGE_KEY);
}

export function mergeWithInitial(partial: OnboardingState): OnboardingState {
  const base = getInitialOnboardingState();

  // Deep merge with strict fallback to initial defaults.
  return {
    ...base,
    ...partial,
    processStatus: partial.processStatus ?? base.processStatus,
    currentScreenId: partial.currentScreenId ?? base.currentScreenId,
    screenStatusById: { ...base.screenStatusById, ...(partial.screenStatusById ?? {}) },
    completedScreenIds: { ...base.completedScreenIds, ...(partial.completedScreenIds ?? {}) },
    quiz1: {
      ...base.quiz1,
      ...(partial.quiz1 ?? {}),
      answers: { ...base.quiz1.answers, ...(partial.quiz1?.answers ?? {}) },
    },
    quiz2: {
      ...base.quiz2,
      ...(partial.quiz2 ?? {}),
      answers: { ...base.quiz2.answers, ...(partial.quiz2?.answers ?? {}) },
    },
    commonLessons: {
      ...base.commonLessons,
      ...(partial.commonLessons ?? {}),
    },
    branch: {
      ...base.branch,
      ...(partial.branch ?? {}),
    },
    lastSavedAtMs: partial.lastSavedAtMs ?? base.lastSavedAtMs,
  };
}

function isValidScreenId(screenId: ScreenId): boolean {
  return ALL_SCREEN_IDS.includes(screenId);
}

