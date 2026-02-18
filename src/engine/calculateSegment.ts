import type { Experience, Segment } from "../types/segmentation";

export function calculateSegment(
  qualifiedInvestor: boolean | null,
  experience: Experience | null,
): Segment | null {
  if (qualifiedInvestor === null) {
    return null;
  }

  if (qualifiedInvestor === true) {
    return "expert";
  }

  if (experience === "none" || experience === "less_1y") {
    return "novice";
  }

  if (experience === "1_3y" || experience === "3_5y") {
    return "advanced";
  }

  if (experience === "more_5y") {
    return "expert";
  }

  return null;
}
