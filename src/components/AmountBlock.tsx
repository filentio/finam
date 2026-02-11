import type { AmountTier } from "../types/segmentation";
import { OptionCard } from "./OptionCard";

interface AmountBlockProps {
  value: AmountTier | null;
  onChange: (value: AmountTier) => void;
}

const AMOUNT_OPTIONS: Array<{ value: AmountTier; label: string }> = [
  { value: "up_to_300k", label: "До 300 000 ₽" },
  { value: "300k_2m", label: "300 000 – 2 млн ₽" },
  { value: "2m_5m", label: "2 – 5 млн ₽" },
  { value: "more_5m", label: "Более 5 млн ₽" },
];

export function AmountBlock({ value, onChange }: AmountBlockProps): JSX.Element {
  return (
    <section className="form-block">
      <h2 className="form-block__title">Какую сумму вы планируете инвестировать?</h2>

      <div className="options-grid" role="radiogroup">
        {AMOUNT_OPTIONS.map((option) => (
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
