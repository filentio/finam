import type { BranchId, OnboardingState, Segment, Strategy } from "./01_state_machine";
import { BRANCH_BY_SEGMENT_STRATEGY, BRANCH_LESSONS, type LessonId } from "./17_branch_config";

export type BranchState = OnboardingState["branch"];

export function resolveBranchId(segment: Segment, strategy: Strategy): BranchId {
  const v = BRANCH_BY_SEGMENT_STRATEGY[segment]?.[strategy];
  if (!v) {
    throw new Error(`Missing branch routing for segment=${segment} strategy=${strategy}`);
  }
  return v;
}

export function getBranchLessonIds(branchId: BranchId): LessonId[] {
  const v = BRANCH_LESSONS[branchId];
  if (!v || v.length === 0) throw new Error(`Missing or empty BRANCH_LESSONS for branchId=${branchId}`);
  return v;
}

export function computeQuiz2HashForBranch(input: {
  segment: Segment;
  strategy: Strategy;
  quiz1Hash: string;
  quiz2Answers: OnboardingState["quiz2"]["answers"];
}): string {
  // Deterministic and stable for storage/restore; not cryptographic.
  return JSON.stringify({
    segment: input.segment,
    strategy: input.strategy,
    quiz1Hash: input.quiz1Hash,
    quiz2Answers: input.quiz2Answers,
  });
}

export function resetBranchForContext(input: {
  branchId: BranchId;
  segment: Segment;
  strategy: Strategy;
  quiz2Hash: string;
}): BranchState {
  return {
    branchId: input.branchId,
    currentIndex: 0,
    isCompleted: false,
    segmentSnapshot: input.segment,
    strategySnapshot: input.strategy,
    quiz2Hash: input.quiz2Hash,
  };
}

export function normalizeBranchState(input: BranchState, ctx: { segment: Segment; strategy: Strategy; quiz2Hash: string }): BranchState {
  const resolved = resolveBranchId(ctx.segment, ctx.strategy);

  // Completed branches are valid only if context matches.
  if (input.isCompleted) {
    if (
      input.branchId === resolved &&
      input.segmentSnapshot === ctx.segment &&
      input.strategySnapshot === ctx.strategy &&
      input.quiz2Hash === ctx.quiz2Hash
    ) {
      const total = getBranchLessonIds(resolved).length;
      return { ...input, currentIndex: Math.max(0, total - 1) };
    }
    return resetBranchForContext({ branchId: resolved, segment: ctx.segment, strategy: ctx.strategy, quiz2Hash: ctx.quiz2Hash });
  }

  // Any mismatch -> reset deterministically.
  if (
    input.branchId !== resolved ||
    input.segmentSnapshot !== ctx.segment ||
    input.strategySnapshot !== ctx.strategy ||
    input.quiz2Hash !== ctx.quiz2Hash
  ) {
    return resetBranchForContext({ branchId: resolved, segment: ctx.segment, strategy: ctx.strategy, quiz2Hash: ctx.quiz2Hash });
  }

  const total = getBranchLessonIds(resolved).length;
  const maxIndex = Math.max(0, total - 1);
  const clamped = Math.min(Math.max(0, input.currentIndex), maxIndex);
  return { ...input, currentIndex: clamped };
}

export function isBranchCompletionValid(input: BranchState, ctx: { segment: Segment | null; strategy: Strategy | null; quiz2Hash: string | null }): boolean {
  if (!ctx.segment || !ctx.strategy) return false;
  if (!ctx.quiz2Hash) return false;
  if (!input.isCompleted) return false;
  if (!input.branchId) return false;

  const resolved = resolveBranchId(ctx.segment, ctx.strategy);
  if (input.branchId !== resolved) return false;
  if (input.segmentSnapshot !== ctx.segment) return false;
  if (input.strategySnapshot !== ctx.strategy) return false;
  if (input.quiz2Hash !== ctx.quiz2Hash) return false;

  const total = getBranchLessonIds(resolved).length;
  if (input.currentIndex !== total - 1) return false;

  return true;
}

