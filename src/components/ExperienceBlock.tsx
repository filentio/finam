import type { Experience } from "../types/segmentation";
import { OptionCard } from "./OptionCard";

interface ExperienceBlockProps {
  value: Experience | null;
  visible: boolean;
  onChange: (value: Experience) => void;
}

const EXPERIENCE_OPTIONS: Array<{ value: Experience; label: string }> = [
  { value: "none", label: "Нет опыта" },
  { value: "less_1y", label: "Менее 1 года" },
  { value: "1_3y", label: "1–3 года" },
  { value: "3_5y", label: "3–5 лет" },
  { value: "more_5y", label: "Более 5 лет" },
];

export function ExperienceBlock({
  value,
  visible,
  onChange,
}: ExperienceBlockProps): JSX.Element {
  return (
    <section
      className={`form-block collapsible ${visible ? "collapsible--open" : "collapsible--closed"}`}
      aria-hidden={!visible}
    >
      <h2 className="form-block__title">Какой у вас опыт инвестирования?</h2>

      <div className="options-grid" role="radiogroup">
        {EXPERIENCE_OPTIONS.map((option) => (
          <OptionCard
            key={option.value}
            label={option.label}
            selected={value === option.value}
            onClick={() => onChange(option.value)}
            inputType="radio"
          />
        ))}
      </div>
    </section>
  );
}
