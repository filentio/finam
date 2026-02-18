import type { Instrument } from "../types/segmentation";
import { OptionCard } from "./OptionCard";

interface InstrumentsBlockProps {
  value: Instrument[];
  onToggle: (value: Instrument) => void;
}

const INSTRUMENT_OPTIONS: Array<{ value: Instrument; label: string }> = [
  { value: "etf", label: "ETF" },
  { value: "stocks", label: "Акции" },
  { value: "bonds", label: "Облигации" },
  { value: "trust_management", label: "Доверительное управление" },
  { value: "ipo", label: "IPO" },
  { value: "currency", label: "Валюта" },
];

export function InstrumentsBlock({
  value,
  onToggle,
}: InstrumentsBlockProps) {
  return (
    <section className="form-block">
      <h2 className="form-block__title">Какие инструменты вам интересны?</h2>
      <p className="form-block__hint">Можно выбрать несколько вариантов.</p>

      <div className="options-grid">
        {INSTRUMENT_OPTIONS.map((option) => (
          <OptionCard
            key={option.value}
            label={option.label}
            selected={value.includes(option.value)}
            onClick={() => onToggle(option.value)}
            inputType="checkbox"
          />
        ))}
      </div>
    </section>
  );
}
