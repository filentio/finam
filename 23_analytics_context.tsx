import React, { createContext, useContext } from "react";
import type { AnalyticsEventName, AnalyticsPayload } from "./09_analytics";

export type TrackFn = (eventName: AnalyticsEventName, payload?: AnalyticsPayload) => void;

const AnalyticsContext = createContext<TrackFn>(() => undefined);

export function AnalyticsProvider(props: { track: TrackFn; children: React.ReactNode }) {
  return <AnalyticsContext.Provider value={props.track}>{props.children}</AnalyticsContext.Provider>;
}

export function useTrack(): TrackFn {
  return useContext(AnalyticsContext);
}

