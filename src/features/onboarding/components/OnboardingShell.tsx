import type { ReactNode } from "react";

interface OnboardingShellProps {
  children: ReactNode;
}

export function OnboardingShell({ children }: OnboardingShellProps) {
  return (
    <div className="ob-shell">
      <div className="ob-shell__background">
        <div className="ob-shell__centered-content">{children}</div>
      </div>
    </div>
  );
}

