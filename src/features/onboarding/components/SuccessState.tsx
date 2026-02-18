import type { ReactNode } from "react";

interface SuccessStateProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  className?: string;
  children?: ReactNode;
}

export function SuccessState({
  title,
  description,
  icon,
  className,
  children,
}: SuccessStateProps) {
  const classes = ["ob-success-state", className].filter(Boolean).join(" ");

  return (
    <section className={classes}>
      <div className="ob-success-state__icon" aria-hidden="true">
        {icon ?? (
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M5 12.5L10 17L19 8" />
          </svg>
        )}
      </div>
      <h2 className="ob-success-state__title">{title}</h2>
      {description ? <p className="ob-success-state__description">{description}</p> : null}
      {children}
    </section>
  );
}
