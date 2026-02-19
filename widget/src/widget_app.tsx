import React from "react";
import OnboardingShell from "../../05_onboarding_shell";
import { AnalyticsProvider } from "../../23_analytics_context";
import type { TrackFn } from "../../23_analytics_context";

export type WidgetAppProps = {
  mode: "inline" | "modal";
  storageNamespace: string;
  track: TrackFn;
  assetBaseUrl: string;
};

export function WidgetApp(props: WidgetAppProps) {
  const content = (
    <AnalyticsProvider track={props.track}>
      <OnboardingShell storageEnabled={true} storageNamespace={props.storageNamespace} assetBaseUrl={props.assetBaseUrl} />
    </AnalyticsProvider>
  );

  if (props.mode === "modal") {
    return (
      <div className="finam-onb-overlay">
        <div className="finam-onb-modal">{content}</div>
      </div>
    );
  }

  return <div className="finam-onb-root">{content}</div>;
}

