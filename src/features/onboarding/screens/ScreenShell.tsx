import type { ReactNode } from "react";

interface ScreenShellProps {
  title: string;
  subtitle?: string;
  scrollable?: boolean;
  centered?: boolean;
  className?: string;
  children: ReactNode;
}

export function ScreenShell({
  title,
  subtitle,
  scrollable = false,
  centered = false,
  className,
  children,
}: ScreenShellProps) {
  const classes = ["ob-screen"];
  if (scrollable) {
    classes.push("ob-screen--scrollable");
  }
  if (centered) {
    classes.push("ob-screen--centered");
  }
  if (className) {
    classes.push(className);
  }

  return (
    <section className={classes.join(" ")}>
      <h2 className="ob-screen__title">{title}</h2>
      {subtitle ? <p className="ob-screen__subtitle">{subtitle}</p> : null}
      <div className="ob-screen__body">{children}</div>
    </section>
  );
}

