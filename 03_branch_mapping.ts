import type { BranchId, Quiz1Answers, Quiz2Answers, Segment, Strategy, ScreenId } from "./01_state_machine";

export function computeSegmentFromQuiz1(answers: Quiz1Answers): Segment {
  if (answers.q1QualifiedStatus === "Да") return "qualified";
  if (answers.q1QualifiedStatus === "Нет") {
    const exp = answers.q2Experience;
    if (exp === "Еще нет опыта" || exp === "Менее 1 года") return "novice";
    if (exp === "От 1 до 3 лет") return "learner";
    if (exp === "От 3 до 5 лет" || exp === "Более 5 лет") return "experienced";
  }
  throw new Error("Quiz1 answers are not valid for segment computation.");
}

export function validateQuiz1Answers(answers: Quiz1Answers): { ok: true } | { ok: false; reason: string } {
  if (!answers.q1QualifiedStatus) return { ok: false, reason: "Q1_REQUIRED" };
  if (!answers.q2Experience) return { ok: false, reason: "Q2_REQUIRED" };
  if (!answers.q3PlannedAmount) return { ok: false, reason: "Q3_REQUIRED" };
  if (!answers.q4MainGoal) return { ok: false, reason: "Q4_REQUIRED" };
  const selectedCount = Object.values(answers.q5Interests).filter(Boolean).length;
  if (selectedCount < 1) return { ok: false, reason: "Q5_MIN_1" };
  if (selectedCount > 5) return { ok: false, reason: "Q5_MAX_5" };
  return { ok: true };
}

export function computeStrategyFromQuiz2(answers: Quiz2Answers): Strategy {
  const v = validateQuiz2Answers(answers);
  if (!v.ok) {
    throw new Error("Quiz2 answers are not valid for strategy computation.");
  }

  let score = 0;

  // Q1 horizon
  switch (answers.q1Horizon) {
    case "До 1 года":
      score += 0;
      break;
    case "1–3 года":
      score += 1;
      break;
    case "3–5 лет":
      score += 2;
      break;
    case "Более 5 лет":
      score += 2;
      break;
  }

  // Q2 drawdown reaction
  switch (answers.q2DrawdownReaction) {
    case "Продам":
      score += 0;
      break;
    case "Подожду":
      score += 1;
      break;
    case "Докуплю":
      score += 2;
      break;
  }

  // Q3 monthly share
  switch (answers.q3MonthlyShare) {
    case "До 5%":
      score += 0;
      break;
    case "5–15%":
      score += 1;
      break;
    case "Более 15%":
      score += 2;
      break;
  }

  // Q4 preference
  switch (answers.q4Preference) {
    case "Сохранение":
      score += 0;
      break;
    case "Баланс":
      score += 1;
      break;
    case "Рост":
      score += 2;
      break;
  }

  // Deterministic thresholds:
  // 0–2: conservative, 3–5: balanced, 6–8: aggressive.
  if (score <= 2) return "conservative";
  if (score <= 5) return "balanced";
  return "aggressive";
}

export function validateQuiz2Answers(answers: Quiz2Answers): { ok: true } | { ok: false; reason: string } {
  if (!answers.q1Horizon) return { ok: false, reason: "Q1_REQUIRED" };
  if (!answers.q2DrawdownReaction) return { ok: false, reason: "Q2_REQUIRED" };
  if (!answers.q3MonthlyShare) return { ok: false, reason: "Q3_REQUIRED" };
  if (!answers.q4Preference) return { ok: false, reason: "Q4_REQUIRED" };
  return { ok: true };
}

export const BRANCH_MAPPING: Record<Segment, Record<Strategy, BranchId>> = {
  novice: {
    conservative: "BR_BEGINNER",
    balanced: "BR_BEGINNER",
    aggressive: "BR_BEGINNER",
  },
  learner: {
    conservative: "BR_INTERMEDIATE",
    balanced: "BR_INTERMEDIATE",
    aggressive: "BR_INTERMEDIATE",
  },
  experienced: {
    conservative: "BR_INTERMEDIATE",
    balanced: "BR_INTERMEDIATE",
    aggressive: "BR_ADVANCED",
  },
  qualified: {
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
  const segments: Segment[] = ["novice", "learner", "experienced", "qualified"];
  const strategies: Strategy[] = ["conservative", "balanced", "aggressive"];

  for (const s of segments) {
    for (const st of strategies) {
      const v = BRANCH_MAPPING[s]?.[st];
      if (!v) throw new Error(`Missing mapping for segment=${s} strategy=${st}`);
    }
  }
}

