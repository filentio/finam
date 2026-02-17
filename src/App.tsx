import { useState } from "react";
import { SegmentationForm } from "./components/SegmentationForm";
import { StageProgress } from "./components/StageProgress";
import { Onboarding } from "./features/onboarding/Onboarding";
import { determineSegment } from "./features/onboarding/hooks/useSegmentation";
import type { DOSInput } from "./features/onboarding/types/onboarding";
import type { SegmentationPayload } from "./types/segmentation";
import "./styles/tokens.css";
import "./styles/components.css";

type AppMode = "segmentation" | "summary" | "onboarding";
interface PendingOnboarding {
  input: DOSInput;
  source: string;
  segment: SegmentationPayload["segment"];
}

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
    label: "Продвинутый · Оптимальный",
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
    label: "Эксперт · Крупный капитал",
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
  const [userId, setUserId] = useState<string>("demo-user-custom");
  const [onboardingInput, setOnboardingInput] = useState<DOSInput | null>(null);
  const [pendingOnboarding, setPendingOnboarding] = useState<PendingOnboarding | null>(null);
  const [sessionKey, setSessionKey] = useState(0);
  const [completed, setCompleted] = useState(false);

  const prepareOnboarding = (input: DOSInput, source: string) => {
    setCompleted(false);
    setPendingOnboarding({
      input,
      source,
      segment: determineSegment(input),
    });
    setMode("summary");
  };

  const startOnboarding = () => {
    if (!pendingOnboarding) {
      return;
    }
    const { input, source, segment } = pendingOnboarding;
    setOnboardingInput(input);
    setUserId(`demo-user-${source}-${Date.now()}`);
    setSessionKey((value) => value + 1);
    localStorage.setItem(
      "finam_segment",
      JSON.stringify({
        segment,
        dos_input: input,
        timestamp: Date.now(),
      }),
    );
    setMode("onboarding");
  };

  if (mode === "onboarding" && onboardingInput) {
    return (
      <main className="app-shell app-shell--flow">
        <div className="flow-stage-progress">
          <StageProgress currentStage={3} />
        </div>
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

  if (mode === "summary" && pendingOnboarding) {
    return (
      <main className="app-shell app-shell--flow">
        <div className="flow-stage-progress">
          <StageProgress currentStage={2} />
        </div>
        <section className="summary-screen">
          <div className="summary-screen__card">
            <div className="summary-screen__icon" aria-hidden="true">
              🚀
            </div>
            <h2>Ваш план обучения</h2>
            <p>Мы подготовили персональную программу для вашего профиля.</p>

            <div className="summary-screen__steps">
              <div className="summary-screen__step">
                <span>1</span>
                <span>6 уроков по инвестированию</span>
              </div>
              <div className="summary-screen__step">
                <span>2</span>
                <span>Анкета инвест-профиля</span>
              </div>
              <div className="summary-screen__step">
                <span>3</span>
                <span>Персональные рекомендации</span>
              </div>
            </div>

            <button type="button" className="summary-screen__cta" onClick={startOnboarding}>
              Начать обучение
            </button>
            <button type="button" className="summary-screen__back" onClick={() => setMode("segmentation")}>
              Вернуться к анкете
            </button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="app-shell">
      <StageProgress currentStage={1} />
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
              onClick={() => prepareOnboarding(preset.dosInput, preset.id)}
            >
              <strong>{preset.label}</strong>
              <span>{preset.description}</span>
            </button>
          ))}
        </div>
      </section>

      <SegmentationForm
        onComplete={(payload) => {
          localStorage.setItem(
            "finam_segment",
            JSON.stringify({
              segment: payload.segment,
              profile: payload,
              timestamp: Date.now(),
            }),
          );
          prepareOnboarding(mapSegmentationToDosInput(payload), "custom");
        }}
      />
    </main>
  );
}

export default App;
