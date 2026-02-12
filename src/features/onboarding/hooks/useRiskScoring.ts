import { useCallback } from "react";
import type {
  Allocation,
  DOSInput,
  Experience,
  Instrument,
  InvestmentAmount,
  InvestmentGoal,
  RiskProfile,
  RiskQuizAnswer,
  RiskQuizResult,
  SelfAssessment,
} from "../types/onboarding";

const EXPERIENCE_RISK_MAP: Record<Experience, number> = {
  none: 1,
  less_1y: 2,
  "1_3y": 3,
  "3_5y": 3,
  more_5y: 4,
};

const AMOUNT_RISK_MAP: Record<InvestmentAmount, number> = {
  up_to_300k: 2,
  "300k_2m": 3,
  "2m_5m": 3,
  more_5m: 4,
};

const GOAL_RISK_MAP: Record<InvestmentGoal, number> = {
  preservation: 1,
  purchase: 2,
  passive_income: 2,
  growth: 3,
};

const INSTRUMENT_SCORES: Record<Instrument, number> = {
  etf: 1,
  stocks: 1,
  bonds: 1,
  trust_management: 0,
  ipo: 1,
  currency: 1,
  structured: 2,
  derivatives: 2,
};

const PROFILE_ORDER: RiskProfile[] = [
  "conservative",
  "moderate",
  "aggressive",
  "ultra_aggressive",
];

const PROFILE_ALLOCATIONS: Record<RiskProfile, Allocation> = {
  conservative: {
    stocks_pct: 20,
    bonds_pct: 65,
    alternatives_pct: 5,
    cash_pct: 10,
  },
  moderate: {
    stocks_pct: 50,
    bonds_pct: 35,
    alternatives_pct: 10,
    cash_pct: 5,
  },
  aggressive: {
    stocks_pct: 75,
    bonds_pct: 15,
    alternatives_pct: 10,
    cash_pct: 0,
  },
  ultra_aggressive: {
    stocks_pct: 90,
    bonds_pct: 0,
    alternatives_pct: 10,
    cash_pct: 0,
  },
};

function calculateInstrumentScore(instruments: Instrument[]): number {
  const sum = instruments.reduce((acc, instrument) => {
    return acc + (INSTRUMENT_SCORES[instrument] ?? 0);
  }, 0);

  return Math.min(sum, 4);
}

function scoreToProfile(score: number): RiskProfile {
  if (score <= 13) {
    return "conservative";
  }
  if (score <= 19) {
    return "moderate";
  }
  if (score <= 25) {
    return "aggressive";
  }
  return "ultra_aggressive";
}

function selfAssessmentToProfile(score: SelfAssessment): RiskProfile {
  const map: Record<SelfAssessment, RiskProfile> = {
    1: "conservative",
    2: "moderate",
    3: "aggressive",
    4: "ultra_aggressive",
  };

  return map[score];
}

function capProfile(raw: RiskProfile, cap: RiskProfile): RiskProfile {
  const rawIndex = PROFILE_ORDER.indexOf(raw);
  const capIndex = PROFILE_ORDER.indexOf(cap);
  return PROFILE_ORDER[Math.min(rawIndex, capIndex)];
}

export function calculateRiskProfile(
  dos: DOSInput,
  quizAnswers: RiskQuizAnswer[],
): RiskQuizResult {
  const quizScores = quizAnswers.reduce<Record<string, number>>((acc, answer) => {
    acc[answer.question_id] = answer.score;
    return acc;
  }, {});

  const totalScore =
    EXPERIENCE_RISK_MAP[dos.experience] +
    AMOUNT_RISK_MAP[dos.investment_amount] +
    GOAL_RISK_MAP[dos.investment_goal] +
    calculateInstrumentScore(dos.instruments) +
    (quizScores.Q5 ?? 0) +
    (quizScores.Q6 ?? 0) +
    (quizScores.Q7 ?? 0) +
    (quizScores.Q8 ?? 0);

  const rawProfile = scoreToProfile(totalScore);
  const selfAssessmentCap = selfAssessmentToProfile(
    ((quizScores.Q7 ?? 4) as SelfAssessment) || 4,
  );
  const finalProfile = capProfile(rawProfile, selfAssessmentCap);

  return {
    answers: quizAnswers,
    total_score: totalScore,
    raw_profile: rawProfile,
    self_assessment_cap: selfAssessmentCap,
    final_profile: finalProfile,
    allocation: PROFILE_ALLOCATIONS[finalProfile],
  };
}

export function createEmptyRiskResult(): RiskQuizResult {
  return {
    answers: [],
    total_score: 0,
    raw_profile: "conservative",
    self_assessment_cap: "ultra_aggressive",
    final_profile: "conservative",
    allocation: PROFILE_ALLOCATIONS.conservative,
  };
}

export function useRiskScoring(): {
  calculateRiskProfile: (
    dos: DOSInput,
    quizAnswers: RiskQuizAnswer[],
  ) => RiskQuizResult;
} {
  const runScoring = useCallback(
    (dos: DOSInput, quizAnswers: RiskQuizAnswer[]) =>
      calculateRiskProfile(dos, quizAnswers),
    [],
  );

  return { calculateRiskProfile: runScoring };
}
