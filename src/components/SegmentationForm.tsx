import { useEffect, useMemo, useRef, useState } from "react";
import { trackEvent } from "../analytics/trackEvent";
import { calculateSegment } from "../engine/calculateSegment";
import { navigateToOnboarding } from "../navigation/navigateToOnboarding";
import type {
  AmountTier,
  InvestmentGoal,
  Instrument,
  SegmentationPayload,
  SegmentationState,
} from "../types/segmentation";
import { AmountBlock } from "./AmountBlock";
import { ExperienceBlock } from "./ExperienceBlock";
import { GoalBlock } from "./GoalBlock";
import { InstrumentsBlock } from "./InstrumentsBlock";
import { QualifiedBlock } from "./QualifiedBlock";
import { ResultPreview } from "./ResultPreview";

interface SegmentationFormProps {
  onComplete?: (payload: SegmentationPayload) => void;
}

const INITIAL_STATE: SegmentationState = {
  qualifiedInvestor: null,
  experience: null,
  amountTier: null,
  goal: null,
  instruments: [],
  segment: null,
};

let segmentationStartedTracked = false;

function getCanContinue(state: SegmentationState): boolean {
  if (state.qualifiedInvestor === null) {
    return false;
  }

  if (state.amountTier === null || state.goal === null) {
    return false;
  }

  if (state.instruments.length === 0) {
    return false;
  }

  if (state.qualifiedInvestor === false && state.experience === null) {
    return false;
  }

  return state.segment !== null;
}

function buildPayload(state: SegmentationState): SegmentationPayload | null {
  if (!getCanContinue(state) || state.segment === null || state.amountTier === null || state.goal === null) {
    return null;
  }

  return {
    qualified_investor: state.qualifiedInvestor as boolean,
    // For qualified users experience is hidden; keep a normalized value in the payload.
    experience: state.experience ?? "more_5y",
    segment: state.segment,
    amount_tier: state.amountTier,
    investment_goal: state.goal,
    instruments: state.instruments,
  };
}

export function SegmentationForm({ onComplete }: SegmentationFormProps) {
  const [state, setState] = useState<SegmentationState>(INITIAL_STATE);
  const [submittedPayload, setSubmittedPayload] = useState<SegmentationPayload | null>(
    null,
  );
  const [navigationTarget, setNavigationTarget] = useState<string | null>(null);
  const startedSentRef = useRef(false);

  useEffect(() => {
    if (startedSentRef.current || segmentationStartedTracked) {
      return;
    }
    startedSentRef.current = true;
    segmentationStartedTracked = true;
    trackEvent("segmentation_started");
  }, []);

  const canContinue = useMemo(() => getCanContinue(state), [state]);
  const showExperienceBlock = state.qualifiedInvestor === false;

  const updateState = (patch: Partial<SegmentationState>) => {
    setState((previous) => {
      const next: SegmentationState = {
        ...previous,
        ...patch,
      };
      next.segment = calculateSegment(next.qualifiedInvestor, next.experience);
      return next;
    });
  };

  const handleQualifiedChange = (value: boolean) => {
    if (value) {
      updateState({ qualifiedInvestor: true, experience: null });
      return;
    }

    updateState({ qualifiedInvestor: false });
  };

  const handleAmountChange = (value: AmountTier) => {
    trackEvent("amount_selected", { amount_tier: value });
    updateState({ amountTier: value });
  };

  const handleGoalChange = (value: InvestmentGoal) => {
    trackEvent("goal_selected", { goal: value });
    updateState({ goal: value });
  };

  const handleInstrumentToggle = (instrument: Instrument) => {
    setState((previous) => {
      const exists = previous.instruments.includes(instrument);
      const nextInstruments = exists
        ? previous.instruments.filter((item) => item !== instrument)
        : [...previous.instruments, instrument];

      return { ...previous, instruments: nextInstruments };
    });
  };

  const handleSubmit = () => {
    const payload = buildPayload(state);
    if (!payload) {
      return;
    }

    trackEvent("segmentation_completed", {
      segment: payload.segment,
      amount_tier: payload.amount_tier,
    });
    trackEvent(`segment_${payload.segment}`, { amount_tier: payload.amount_tier });

    const target = navigateToOnboarding(payload.segment, payload.amount_tier);
    setSubmittedPayload(payload);
    setNavigationTarget(target);
    onComplete?.(payload);
  };

  return (
    <div className="segmentation-layout">
      <header className="segmentation-header">
        <p className="segmentation-header__eyebrow">DOC → Segment Engine</p>
        <h1>Анкета сегментации клиента</h1>
        <p className="segmentation-header__description">
          Заполните форму, чтобы определить персонализированный маршрут онбординга.
        </p>
      </header>

      <QualifiedBlock value={state.qualifiedInvestor} onChange={handleQualifiedChange} />
      <ExperienceBlock
        value={state.experience}
        visible={showExperienceBlock}
        onChange={(value) => updateState({ experience: value })}
      />
      <AmountBlock value={state.amountTier} onChange={handleAmountChange} />
      <GoalBlock value={state.goal} onChange={handleGoalChange} />
      <InstrumentsBlock value={state.instruments} onToggle={handleInstrumentToggle} />

      <section className="form-block form-block--submit">
        <div className="segment-chip-wrapper">
          <span className="segment-chip-label">Сегмент:</span>
          <strong className={`segment-chip ${state.segment ? "segment-chip--active" : ""}`}>
            {state.segment ?? "не определён"}
          </strong>
        </div>
        <button
          type="button"
          className="continue-button"
          disabled={!canContinue}
          onClick={handleSubmit}
        >
          Продолжить
        </button>
      </section>

      <ResultPreview
        state={state}
        payload={submittedPayload}
        navigationTarget={navigationTarget}
      />
    </div>
  );
}
