import type { Segment, TrackStep } from "../types/onboarding";

export const TRACKS: Record<Segment, TrackStep[]> = {
  novice: [
    { type: "lesson", lesson_id: "lesson_1", variant: "full" },
    { type: "lesson", lesson_id: "lesson_2", variant: "full" },
    { type: "lesson", lesson_id: "lesson_3", variant: "full" },
    { type: "risk_quiz" },
    { type: "risk_result" },
    { type: "lesson", lesson_id: "lesson_4", variant: "full" },
    { type: "lesson", lesson_id: "lesson_5", variant: "full" },
    { type: "lesson", lesson_id: "lesson_6", variant: "full" },
    { type: "first_purchase" },
  ],
  advanced: [
    { type: "lesson", lesson_id: "lesson_2", variant: "full" },
    { type: "lesson", lesson_id: "lesson_3", variant: "full" },
    { type: "risk_quiz" },
    { type: "risk_result" },
    { type: "lesson", lesson_id: "lesson_4", variant: "full" },
    { type: "lesson", lesson_id: "lesson_5", variant: "full" },
    { type: "lesson", lesson_id: "lesson_6", variant: "full" },
    { type: "first_purchase" },
  ],
  expert: [
    { type: "lesson", lesson_id: "lesson_5", variant: "full" },
    { type: "lesson", lesson_id: "lesson_6", variant: "expert" },
    { type: "first_purchase" },
  ],
};

export function getTrack(segment: Segment): TrackStep[] {
  return TRACKS[segment].map((step) => ({ ...step }));
}
