import type { ReactNode } from "react";

type StepCardTag = "article" | "section" | "div" | "li";

interface StepCardProps {
  as?: StepCardTag;
  className?: string;
  children: ReactNode;
}

export function StepCard({ as = "article", className, children }: StepCardProps) {
  const Tag = as;
  const classes = ["ob-card", "ob-step-card", className].filter(Boolean).join(" ");

  return <Tag className={classes}>{children}</Tag>;
}
