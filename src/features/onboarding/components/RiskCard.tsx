import type { RiskProfile } from "../types/onboarding";

interface RiskCardProps {
  profile: RiskProfile;
  active?: boolean;
  description: string;
}

export function RiskCard({ profile, active = false, description }: RiskCardProps) {
  return (
    <article className={`ob-risk-card ob-step-card ${active ? "is-active" : ""}`}>
      <h4 className="ob-risk-card__title">{profile.replace("_", " ")}</h4>
      <p className="ob-risk-card__description">{description}</p>
    </article>
  );
}
