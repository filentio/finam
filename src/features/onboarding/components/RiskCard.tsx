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
        border: `1px solid ${active ? "#466dc9" : "#d9e2ef"}`,
        background: active ? "#eef4ff" : "#fff",
        padding: 12,
      }}
    >
      <h4 style={{ margin: 0, textTransform: "capitalize", fontSize: 15 }}>
        {profile.replace("_", " ")}
      </h4>
      <p style={{ margin: "8px 0 0", color: "#55647a", fontSize: 13 }}>{description}</p>
    </article>
  );
}
