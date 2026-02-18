import type { ReactNode } from "react";

interface OptionCardProps {
  label: ReactNode;
  selected: boolean;
  onClick: () => void;
  inputType: "radio" | "checkbox";
}

export function OptionCard({
  label,
  selected,
  onClick,
  inputType,
}: OptionCardProps) {
  const ariaRole = inputType === "radio" ? "radio" : "checkbox";
  const controlSymbol = selected
    ? inputType === "checkbox"
      ? "✓"
      : "●"
    : inputType === "checkbox"
      ? "□"
      : "○";

  return (
    <button
      type="button"
      className={`option-card ${selected ? "option-card--selected" : ""}`}
      onClick={onClick}
      role={ariaRole}
      aria-checked={selected}
    >
      <span>{label}</span>
      <span className="option-card__control" aria-hidden="true">
        {controlSymbol}
      </span>
    </button>
  );
}
