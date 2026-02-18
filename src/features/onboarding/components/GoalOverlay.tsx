import type { GoalOverlayConfig } from "../types/onboarding";

interface GoalOverlayProps {
  overlay: GoalOverlayConfig;
}

export function GoalOverlay({ overlay }: GoalOverlayProps) {
  return (
    <aside className="ob-goal-overlay ob-step-card">
      <h4 className="ob-goal-overlay__title">{overlay.title}</h4>
      <p className="ob-goal-overlay__text">{overlay.text}</p>
    </aside>
  );
}
