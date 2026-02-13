import type { ReactNode } from "react";

interface ScreenShellProps {
  title: string;
  subtitle?: string;
  scrollable?: boolean;
  children: ReactNode;
}

export function ScreenShell({ title, subtitle, scrollable = false, children }: ScreenShellProps) {
  return (
    <section className={`ob-screen ${scrollable ? "ob-screen--scrollable" : ""}`}>
      <h2 className="ob-screen__title">{title}</h2>
      {subtitle ? <p className="ob-screen__subtitle">{subtitle}</p> : null}
      <div className="ob-screen__body">{children}</div>
    </section>
  );
}

