import type { CommonLessonsState, Segment } from "./01_state_machine";
import { getCommonLessonIdsForSegment } from "./10_common_lessons_config";

export function getInitialCommonLessonsState(): CommonLessonsState {
  return { currentIndex: 0, isCompleted: false, segment: null };
}

export function resetCommonLessonsForSegment(segment: Segment): CommonLessonsState {
  return { currentIndex: 0, isCompleted: false, segment };
}

export function normalizeCommonLessonsState(input: CommonLessonsState, currentSegment: Segment | null): CommonLessonsState {
  if (!currentSegment) return getInitialCommonLessonsState();
  if (input.segment !== currentSegment) return resetCommonLessonsForSegment(currentSegment);

  if (input.isCompleted) {
    return { ...input, currentIndex: getCommonLessonIdsForSegment(currentSegment).length - 1 };
  }

  const ids = getCommonLessonIdsForSegment(currentSegment);
  const maxIndex = Math.max(0, ids.length - 1);
  const clamped = Math.min(Math.max(0, input.currentIndex), maxIndex);
  return { ...input, currentIndex: clamped, segment: currentSegment };
}

export function isCommonLessonsCompletionValid(state: CommonLessonsState, currentSegment: Segment | null): boolean {
  if (!currentSegment) return false;
  if (state.segment !== currentSegment) return false;
  if (!state.isCompleted) return false;
  return true;
}

