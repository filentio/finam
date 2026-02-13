import type { GoalOverlayConfig } from "../types/onboarding";

interface GoalOverlayProps {
  overlay: GoalOverlayConfig;
}

export function GoalOverlay({ overlay }: GoalOverlayProps) {
  return (
    <aside
      style={{
        border: "1px solid rgba(255,255,255,0.24)",
        background: "rgba(255,255,255,0.12)",
        borderRadius: 12,
        padding: 10,
      }}
    >
      <h4 style={{ margin: 0, fontSize: 15 }}>{overlay.title}</h4>
      <p style={{ margin: "6px 0 0", color: "rgba(255,255,255,0.82)", fontSize: 13 }}>
        {overlay.text}
      </p>
    </aside>
  );
}
