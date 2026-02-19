import type { BranchId, Quiz1Answers, Segment, Strategy, ScreenId } from "./01_state_machine";
import { computeSegment, validateQuiz1Answers as validateQuiz1AnswersV2 } from "./07_quiz1_rules";

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
  NOVICE: {
    conservative: "BR_BEGINNER",
    balanced: "BR_BEGINNER",
    aggressive: "BR_BEGINNER",
  },
  LEARNER: {
    conservative: "BR_INTERMEDIATE",
    balanced: "BR_INTERMEDIATE",
    aggressive: "BR_INTERMEDIATE",
  },
  EXPERIENCED: {
    conservative: "BR_INTERMEDIATE",
    balanced: "BR_INTERMEDIATE",
    aggressive: "BR_ADVANCED",
  },
  QUALIFIED: {
    conservative: "BR_ADVANCED",
    balanced: "BR_ADVANCED",
    aggressive: "BR_ADVANCED",
  },
};

export function getBranchId(segment: Segment, strategy: Strategy): BranchId {
  return BRANCH_MAPPING[segment][strategy];
}

export function getBranchStartScreenId(branchId: BranchId): ScreenId {
  switch (branchId) {
    case "BR_BEGINNER":
      return "BR_BEGINNER_01";
    case "BR_INTERMEDIATE":
      return "BR_INTERMEDIATE_01";
    case "BR_ADVANCED":
      return "BR_ADVANCED_01";
  }
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

