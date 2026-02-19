import type { Quiz1Answers, Segment } from "./01_state_machine";

export type SegmentRuleConfig = {
  qualifiedYesAnswerId: NonNullable<Quiz1Answers["q1QualifiedStatus"]>;
  qualifiedNoAnswerId: NonNullable<Quiz1Answers["q1QualifiedStatus"]>;
  mapExperienceToSegmentWhenNotQualified: Record<NonNullable<Quiz1Answers["q2Experience"]>, Segment>;
};

export const QUIZ1_SEGMENT_RULES: SegmentRuleConfig = {
  qualifiedYesAnswerId: "QZ1_Q1_YES",
  qualifiedNoAnswerId: "QZ1_Q1_NO",
  mapExperienceToSegmentWhenNotQualified: {
    QZ1_Q2_NO_EXPERIENCE: "NOVICE",
    QZ1_Q2_LT_1Y: "NOVICE",
    QZ1_Q2_1_3Y: "LEARNER",
    QZ1_Q2_3_5Y: "EXPERIENCED",
    QZ1_Q2_GT_5Y: "EXPERIENCED",
  },
};

export type Quiz1ValidationResult = { ok: true } | { ok: false; missingQuestionIds: string[] };

export function validateQuiz1Answers(answers: Quiz1Answers): Quiz1ValidationResult {
  const missing: string[] = [];
  if (!answers.q1QualifiedStatus) missing.push("QZ1_Q1_QUALIFIED_STATUS");
  if (!answers.q2Experience) missing.push("QZ1_Q2_EXPERIENCE");
  if (!answers.q3PlannedAmount) missing.push("QZ1_Q3_PLANNED_AMOUNT");
  if (!answers.q4MainGoal) missing.push("QZ1_Q4_MAIN_GOAL");
  if (!answers.q5PrimaryInterest) missing.push("QZ1_Q5_PRIMARY_INTEREST");
  if (missing.length) return { ok: false, missingQuestionIds: missing };
  return { ok: true };
}

export function computeSegment(answers: Quiz1Answers, rules: SegmentRuleConfig = QUIZ1_SEGMENT_RULES): Segment {
  const v = validateQuiz1Answers(answers);
  if (!v.ok) {
    throw new Error("Quiz1 answers are not valid.");
  }

  if (answers.q1QualifiedStatus === rules.qualifiedYesAnswerId) {
    return "QUALIFIED";
  }
  if (answers.q1QualifiedStatus !== rules.qualifiedNoAnswerId) {
    throw new Error("Quiz1 Q1 answers are not valid.");
  }

  const seg = rules.mapExperienceToSegmentWhenNotQualified[answers.q2Experience];
  if (!seg) {
    throw new Error("Quiz1 Q2 answers are not valid.");
  }
  return seg;
}

export function isQuiz1CompletionValid(answers: Quiz1Answers, storedSegment: Segment | null): boolean {
  const v = validateQuiz1Answers(answers);
  if (!v.ok) return false;
  if (!storedSegment) return false;
  try {
    const computed = computeSegment(answers);
    return computed === storedSegment;
  } catch {
    return false;
  }
}

