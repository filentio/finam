import type { RiskProfile } from "../types/onboarding";

interface RiskCardProps {
  profile: RiskProfile;
  active?: boolean;
  description: string;
}

export function RiskCard({ profile, active = false, description }: RiskCardProps) {
  return (
    <article
      style={{
        borderRadius: 12,
        border: `1px solid ${active ? "rgba(255,255,255,0.82)" : "rgba(255,255,255,0.22)"}`,
        background: active ? "rgba(255,255,255,0.22)" : "rgba(255,255,255,0.1)",
        padding: 10,
      }}
    >
      <h4 style={{ margin: 0, textTransform: "capitalize", fontSize: 15 }}>
        {profile.replace("_", " ")}
      </h4>
      <p style={{ margin: "6px 0 0", color: "rgba(255,255,255,0.78)", fontSize: 12 }}>
        {description}
      </p>
    </article>
  );
}
