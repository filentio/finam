import type { Quiz1Answers, Quiz2Answers, Segment, Strategy } from "./01_state_machine";

export type Quiz2ValidationResult = { ok: true } | { ok: false; missingQuestionIds: string[] };

export function validateQuiz2Answers(answers: Quiz2Answers): Quiz2ValidationResult {
  const missing: string[] = [];
  if (!answers.q1Horizon) missing.push("QZ2_Q1_HORIZON");
  if (!answers.q2DrawdownReaction) missing.push("QZ2_Q2_DRAWDOWN_REACTION");
  if (!answers.q3MonthlyShare) missing.push("QZ2_Q3_MONTHLY_SHARE");
  if (!answers.q4Preference) missing.push("QZ2_Q4_PREFERENCE");
  if (missing.length) return { ok: false, missingQuestionIds: missing };
  return { ok: true };
}

export type StrategyRuleConfig = {
  points: {
    horizon: Record<NonNullable<Quiz2Answers["q1Horizon"]>, 0 | 1 | 2>;
    drawdown: Record<NonNullable<Quiz2Answers["q2DrawdownReaction"]>, 0 | 1 | 2>;
    monthly: Record<NonNullable<Quiz2Answers["q3MonthlyShare"]>, 0 | 1 | 2>;
    preference: Record<NonNullable<Quiz2Answers["q4Preference"]>, 0 | 1 | 2>;
  };
  adjustments: {
    bySegment: Record<Segment, -1 | 0 | 1>;
    byPlannedAmount: Record<NonNullable<Quiz1Answers["q3PlannedAmount"]>, 0 | 1>;
  };
  thresholds: {
    conservativeMax: number; // inclusive
    balancedMax: number; // inclusive
  };
};

export const QUIZ2_STRATEGY_RULES: StrategyRuleConfig = {
  points: {
    horizon: {
      QZ2_Q1_LT_1Y: 0,
      QZ2_Q1_1_3Y: 1,
      QZ2_Q1_3_5Y: 2,
      QZ2_Q1_GT_5Y: 2,
    },
    drawdown: {
      QZ2_Q2_SELL: 0,
      QZ2_Q2_WAIT: 1,
      QZ2_Q2_BUY_MORE: 2,
    },
    monthly: {
      QZ2_Q3_LT_5: 0,
      QZ2_Q3_5_15: 1,
      QZ2_Q3_GT_15: 2,
    },
    preference: {
      QZ2_Q4_PRESERVE: 0,
      QZ2_Q4_BALANCE: 1,
      QZ2_Q4_GROWTH: 2,
    },
  },
  adjustments: {
    bySegment: {
      NOVICE: -1,
      LEARNER: 0,
      EXPERIENCED: 0,
      QUALIFIED: 1,
    },
    byPlannedAmount: {
      QZ1_Q3_LT_300K: 0,
      QZ1_Q3_300K_2M: 0,
      QZ1_Q3_2_5M: 1,
      QZ1_Q3_GT_5M: 1,
    },
  },
  thresholds: {
    conservativeMax: 2,
    balancedMax: 5,
  },
};

export function computeQuiz1HashForQuiz2(quiz1Answers: Quiz1Answers, segment: Segment): string {
  // Stable deterministic hash string (not cryptographic).
  // Any change to Quiz1 answers or segment must change this value.
  return JSON.stringify({ quiz1Answers, segment });
}

export function computeStrategy(input: {
  quiz1Answers: Quiz1Answers;
  quiz2Answers: Quiz2Answers;
  segment: Segment;
  rules?: StrategyRuleConfig;
}): Strategy {
  const v = validateQuiz2Answers(input.quiz2Answers);
  if (!v.ok) {
    throw new Error("Quiz2 answers are not valid.");
  }

  const rules = input.rules ?? QUIZ2_STRATEGY_RULES;

  const baseScore =
    rules.points.horizon[input.quiz2Answers.q1Horizon] +
    rules.points.drawdown[input.quiz2Answers.q2DrawdownReaction] +
    rules.points.monthly[input.quiz2Answers.q3MonthlyShare] +
    rules.points.preference[input.quiz2Answers.q4Preference];

  const adjustSeg = rules.adjustments.bySegment[input.segment];
  const adjustAmount = input.quiz1Answers.q3PlannedAmount ? rules.adjustments.byPlannedAmount[input.quiz1Answers.q3PlannedAmount] : 0;

  const adjusted = Math.max(0, Math.min(8, baseScore + adjustSeg + adjustAmount));

  if (adjusted <= rules.thresholds.conservativeMax) return "conservative";
  if (adjusted <= rules.thresholds.balancedMax) return "balanced";
  return "aggressive";
}

export function isQuiz2CompletionValid(input: {
  quiz1Answers: Quiz1Answers;
  segment: Segment | null;
  quiz2: { answers: Quiz2Answers; isCompleted: boolean; strategy: Strategy | null; quiz1Hash: string | null; segmentSnapshot: Segment | null };
}): boolean {
  if (!input.segment) return false;
  if (!input.quiz2.isCompleted) return false;
  if (!input.quiz2.strategy) return false;
  if (!input.quiz2.quiz1Hash) return false;
  if (!input.quiz2.segmentSnapshot) return false;
  if (input.quiz2.segmentSnapshot !== input.segment) return false;

  const v = validateQuiz2Answers(input.quiz2.answers);
  if (!v.ok) return false;

  const expectedHash = computeQuiz1HashForQuiz2(input.quiz1Answers, input.segment);
  if (expectedHash !== input.quiz2.quiz1Hash) return false;

  try {
    const computed = computeStrategy({ quiz1Answers: input.quiz1Answers, quiz2Answers: input.quiz2.answers, segment: input.segment });
    return computed === input.quiz2.strategy;
  } catch {
    return false;
  }
}

