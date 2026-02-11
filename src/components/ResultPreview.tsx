import type { SegmentationPayload, SegmentationState } from "../types/segmentation";

interface ResultPreviewProps {
  state: SegmentationState;
  payload: SegmentationPayload | null;
  navigationTarget: string | null;
}

export function ResultPreview({
  state,
  payload,
  navigationTarget,
}: ResultPreviewProps): JSX.Element {
  const draft = {
    qualified_investor: state.qualifiedInvestor,
    experience: state.experience,
    segment: state.segment,
    amount_tier: state.amountTier,
    investment_goal: state.goal,
    instruments: state.instruments,
  };

  return (
    <section className="form-block preview-block">
      <h2 className="form-block__title">ResultPreview</h2>
      <p className="form-block__hint">
        {payload
          ? "Сформированный JSON для запуска персонализированного онбординга:"
          : "Черновик текущего состояния формы:"}
      </p>

      <pre className="json-preview">
        {JSON.stringify(payload ?? draft, null, 2)}
      </pre>

      {navigationTarget ? (
        <p className="navigation-preview">
          navigateToOnboarding → <code>{navigationTarget}</code>
        </p>
      ) : null}
    </section>
  );
}
