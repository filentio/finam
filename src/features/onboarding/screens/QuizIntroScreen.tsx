import { ScreenShell } from "./ScreenShell";

const QUIZ_BENEFITS = [
  "Ваша готовность к риску",
  "Рекомендуемая аллокация",
  "Подходящие инструменты",
];

export function QuizIntroScreen() {
  return (
    <ScreenShell
      className="ob-quiz-intro-screen"
      title="Определим ваш риск-профиль"
      subtitle="Это займёт всего 1 минуту и поможет подобрать подходящие инструменты."
      centered
    >
      <div className="ob-quiz-intro">
        <div className="ob-quiz-intro__emoji" aria-hidden="true">
          🎯
        </div>
        <div className="ob-quiz-intro__benefits">
          <p className="ob-quiz-intro__benefits-title">Что мы узнаем:</p>
          <ul className="ob-quiz-intro__benefits-list">
            {QUIZ_BENEFITS.map((benefit, index) => (
              <li
                key={benefit}
                className="ob-quiz-intro__benefit"
                style={{ animationDelay: `${100 + index * 100}ms` }}
                data-testid="benefit"
              >
                <span aria-hidden="true">✓</span>
                <span>{benefit}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </ScreenShell>
  );
}
