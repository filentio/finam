import { createContext, useContext, useMemo } from "react";
import type { Dispatch, ReactNode } from "react";
import { useOnboardingState } from "./hooks/useOnboardingState";
import type { DOSInput, OnboardingAction, OnboardingState, ProgressInfo } from "./types/onboarding";

interface OnboardingContextValue {
  state: OnboardingState;
  progress: ProgressInfo;
  dispatch: Dispatch<OnboardingAction>;
  startOnboarding: (userId: string, dosInput: DOSInput) => void;
  nextScreen: () => void;
  prevScreen: () => void;
  nextStep: () => void;
  pauseOnboarding: () => void;
  resumeOnboarding: () => void;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
}

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

interface OnboardingProviderProps {
  children: ReactNode;
}

export function OnboardingProvider({ children }: OnboardingProviderProps) {
  const { state, dispatch, progress } = useOnboardingState();

  const value = useMemo<OnboardingContextValue>(
    () => ({
      state,
      progress,
      dispatch,
      startOnboarding: (userId, dosInput) =>
        dispatch({ type: "START", payload: { userId, dos: dosInput } }),
      nextScreen: () => dispatch({ type: "NEXT_SCREEN" }),
      prevScreen: () => dispatch({ type: "PREV_SCREEN" }),
      nextStep: () => dispatch({ type: "NEXT_STEP" }),
      pauseOnboarding: () => dispatch({ type: "PAUSE" }),
      resumeOnboarding: () => dispatch({ type: "RESUME" }),
      completeOnboarding: () => dispatch({ type: "COMPLETE" }),
      resetOnboarding: () => dispatch({ type: "RESET" }),
    }),
    [dispatch, progress, state],
  );

  return (
    <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>
  );
}

export function useOnboardingContext(): OnboardingContextValue {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error("useOnboardingContext must be used inside OnboardingProvider");
  }
  return context;
}
