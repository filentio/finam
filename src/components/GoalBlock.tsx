import type { InvestmentGoal } from "../types/segmentation";
import { OptionCard } from "./OptionCard";

interface GoalBlockProps {
  value: InvestmentGoal | null;
  onChange: (value: InvestmentGoal) => void;
}

const GOAL_OPTIONS: Array<{ value: InvestmentGoal; label: string }> = [
  { value: "purchase", label: "Накопление" },
  { value: "passive_income", label: "Пассивный доход" },
  { value: "growth", label: "Рост капитала" },
  { value: "preservation", label: "Сохранение" },
];

export function GoalBlock({ value, onChange }: GoalBlockProps) {
  return (
    <section className="form-block">
      <h2 className="form-block__title">Ваша главная цель инвестирования</h2>

      <div className="options-grid" role="radiogroup">
        {GOAL_OPTIONS.map((option) => (
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
