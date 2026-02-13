import type { BaseScreenProps } from "./ScreenProps";
import { ScreenShell } from "./ScreenShell";

export function HeroScreen({ screen }: BaseScreenProps) {
  return (
    <ScreenShell title={screen.title} subtitle={screen.subtitle}>
      {screen.visual ? (
        <div className="ob-route-prep__icon" aria-hidden="true">
          {screen.visual}
        </div>
      ) : null}
    </ScreenShell>
  );
}
