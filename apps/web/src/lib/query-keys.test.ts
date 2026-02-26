import { describe, expect, it } from "vitest";

import { authStatusKey } from "@/lib/hooks/use-auth-status";
import { candidateProfileKey } from "@/lib/hooks/use-candidate-profile";
import { searchProfilesKey } from "@/lib/hooks/use-search-profiles";
import { vacanciesKey } from "@/lib/hooks/use-vacancies";
import { applicationsKey } from "@/lib/hooks/use-applications";

describe("react-query keys", () => {
  it("are stable arrays", () => {
    expect(authStatusKey).toEqual(["auth", "hh", "status"]);
    expect(candidateProfileKey).toEqual(["candidate-profile"]);
    expect(searchProfilesKey).toEqual(["search-profiles"]);
    expect(applicationsKey).toEqual(["applications"]);
  });

  it("vacanciesKey includes profile/sort/includeReasons", () => {
    expect(vacanciesKey({ searchProfileId: "p1", sort: "date", includeReasons: true })).toEqual([
      "vacancies",
      "p1",
      "date",
      null,
      true,
    ]);
  });
});

