import { useState } from "react";
import { SegmentationForm } from "./components/SegmentationForm";
import { Onboarding } from "./features/onboarding/Onboarding";
import type { DOSInput } from "./features/onboarding/types/onboarding";
import type { SegmentationPayload } from "./types/segmentation";

type AppMode = "segmentation" | "onboarding";

interface ClientPreset {
  id: string;
  label: string;
  description: string;
  dosInput: DOSInput;
}

const CLIENT_PRESETS: ClientPreset[] = [
  {
    id: "novice_starter",
    label: "Новичок · Стартовый",
    description: "Без опыта, до 300к, цель — накопление",
    dosInput: {
      qualified_investor: false,
      experience: "none",
      investment_amount: "up_to_300k",
      investment_goal: "purchase",
      instruments: ["etf", "bonds"],
    },
  },
  {
    id: "advanced_base",
    label: "Продвинутый · Базовый",
    description: "Опыт 1–3 года, 300к–2м, рост капитала",
    dosInput: {
      qualified_investor: false,
      experience: "1_3y",
      investment_amount: "300k_2m",
      investment_goal: "growth",
      instruments: ["stocks", "etf", "bonds", "currency"],
    },
  },
  {
    id: "expert_premium",
    label: "Эксперт · Премиальный",
    description: "Квалифицированный инвестор, более 5м",
    dosInput: {
      qualified_investor: true,
      experience: "more_5y",
      investment_amount: "more_5m",
      investment_goal: "growth",
      instruments: ["stocks", "structured", "derivatives", "trust_management"],
    },
  },
];

function mapSegmentationToDosInput(payload: SegmentationPayload): DOSInput {
  return {
    qualified_investor: payload.qualified_investor,
    experience: payload.experience,
    investment_amount: payload.amount_tier,
    investment_goal: payload.investment_goal,
    instruments: payload.instruments,
  };
}

function App() {
  const [mode, setMode] = useState<AppMode>("segmentation");
  const [selectedClient, setSelectedClient] = useState<string>("custom");
  const [userId, setUserId] = useState<string>("demo-user-custom");
  const [onboardingInput, setOnboardingInput] = useState<DOSInput | null>(null);
  const [sessionKey, setSessionKey] = useState(0);
  const [completed, setCompleted] = useState(false);

  const startOnboarding = (input: DOSInput, source: string) => {
    setCompleted(false);
    setSelectedClient(source);
    setOnboardingInput(input);
    setUserId(`demo-user-${source}-${Date.now()}`);
    setSessionKey((value) => value + 1);
    setMode("onboarding");
  };

  if (mode === "onboarding" && onboardingInput) {
    return (
      <main className="app-shell app-shell--flow">
        <Onboarding
          key={sessionKey}
          userId={userId}
          dosInput={onboardingInput}
          onComplete={() => setCompleted(true)}
        />
        {completed ? (
          <button
            type="button"
            className="flow-exit"
            onClick={() => setMode("segmentation")}
          >
            Вернуться к анкете
          </button>
        ) : null}
      </main>
    );
  }

  return (
    <main className="app-shell">
      <section className="demo-panel">
        <div className="demo-panel__header">
          <div>
            <p className="demo-panel__eyebrow">Client Journey Preview</p>
            <h2>Выберите профиль клиента или заполните анкету</h2>
            <p className="demo-panel__description">
              Быстрый способ посмотреть, как выглядит флоу для разных сегментов перед интеграцией в прод.
            </p>
          </div>
        </div>

        <div className="preset-grid">
          {CLIENT_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              className="preset-card"
              onClick={() => startOnboarding(preset.dosInput, preset.id)}
            >
              <strong>{preset.label}</strong>
              <span>{preset.description}</span>
            </button>
          ))}
        </div>
      </section>

      <SegmentationForm
        onComplete={(payload) => {
          startOnboarding(mapSegmentationToDosInput(payload), "custom");
        }}
      />
    </main>
  );
}

export default App;
