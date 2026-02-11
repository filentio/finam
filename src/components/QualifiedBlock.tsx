import { OptionCard } from "./OptionCard";

interface QualifiedBlockProps {
  value: boolean | null;
  onChange: (value: boolean) => void;
}

export function QualifiedBlock({ value, onChange }: QualifiedBlockProps): JSX.Element {
  return (
    <section className="form-block">
      <h2 className="form-block__title">
        Являетесь ли вы квалифицированным инвестором?
      </h2>

      <div className="options-grid options-grid--2" role="radiogroup">
        <OptionCard
          label="Да"
          selected={value === true}
          onClick={() => onChange(true)}
          inputType="radio"
        />
        <OptionCard
          label="Нет"
          selected={value === false}
          onClick={() => onChange(false)}
          inputType="radio"
        />
      </div>
    </section>
  );
}
