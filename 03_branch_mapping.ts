import type { BranchId, Quiz1Answers, Segment, Strategy, ScreenId } from "./01_state_machine";
import { computeSegment, validateQuiz1Answers as validateQuiz1AnswersV2 } from "./07_quiz1_rules";
import { BRANCH_BY_SEGMENT_STRATEGY } from "./17_branch_config";
import { resolveBranchId } from "./18_branch_rules";

// Back-compat exports (segment/validation moved to 07_quiz1_rules.ts).
export function computeSegmentFromQuiz1(answers: Quiz1Answers): Segment {
  return computeSegment(answers);
}

export function validateQuiz1Answers(answers: Quiz1Answers): { ok: true } | { ok: false; reason: string } {
  const v = validateQuiz1AnswersV2(answers);
  if (v.ok) return { ok: true };
  return { ok: false, reason: "MISSING_REQUIRED_ANSWERS" };
}

export const BRANCH_MAPPING: Record<Segment, Record<Strategy, BranchId>> = {
  NOVICE: BRANCH_BY_SEGMENT_STRATEGY.NOVICE,
  LEARNER: BRANCH_BY_SEGMENT_STRATEGY.LEARNER,
  EXPERIENCED: BRANCH_BY_SEGMENT_STRATEGY.EXPERIENCED,
  QUALIFIED: BRANCH_BY_SEGMENT_STRATEGY.QUALIFIED,
};

export function getBranchId(segment: Segment, strategy: Strategy): BranchId {
  return resolveBranchId(segment, strategy);
}

export function getBranchStartScreenId(branchId: BranchId): ScreenId {
  return "BR_BRANCH_LESSONS";
}

export function assertBranchMappingCoverage(): void {
  const segments: Segment[] = ["NOVICE", "LEARNER", "EXPERIENCED", "QUALIFIED"];
  const strategies: Strategy[] = ["conservative", "balanced", "aggressive"];

  for (const s of segments) {
    for (const st of strategies) {
      const v = BRANCH_MAPPING[s]?.[st];
      if (!v) throw new Error(`Missing mapping for segment=${s} strategy=${st}`);
    }
  }
}

