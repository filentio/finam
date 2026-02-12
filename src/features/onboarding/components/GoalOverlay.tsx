import type { GoalOverlayConfig } from "../types/onboarding";

interface GoalOverlayProps {
  overlay: GoalOverlayConfig;
}

export function GoalOverlay({ overlay }: GoalOverlayProps) {
  return (
    <aside
      style={{
        border: "1px solid #d8e3f1",
        background: "#f7faff",
        borderRadius: 12,
        padding: 12,
      }}
    >
      <h4 style={{ margin: 0, fontSize: 15 }}>{overlay.title}</h4>
      <p style={{ margin: "8px 0 0", color: "#57677c", fontSize: 14 }}>{overlay.text}</p>
    </aside>
  );
}
