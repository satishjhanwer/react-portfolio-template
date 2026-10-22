import { describe, expect, it } from "vitest";
import { siteConfig } from "../site.config";
import { fullYearsSince, yearsExperience } from "./experience";

describe("fullYearsSince", () => {
  const start = { year: 2010, month: 10 };

  it("counts a full year on the anniversary month", () => {
    expect(fullYearsSince(start, new Date(2026, 9, 1))).toBe(16);
  });

  it("doesn't count the current year before the anniversary month", () => {
    expect(fullYearsSince(start, new Date(2026, 8, 30))).toBe(15);
  });

  it("counts after the anniversary month", () => {
    expect(fullYearsSince(start, new Date(2026, 11, 31))).toBe(16);
  });

  it("is zero in the first year", () => {
    expect(fullYearsSince(start, new Date(2011, 0, 1))).toBe(0);
  });

  it("handles a January start", () => {
    expect(fullYearsSince({ year: 2020, month: 1 }, new Date(2026, 0, 1))).toBe(6);
  });
});

describe("yearsExperience", () => {
  it("is the full years since careerStart with a plus", () => {
    expect(yearsExperience).toBe(`${fullYearsSince(siteConfig.careerStart)}+`);
    expect(yearsExperience).toMatch(/^\d+\+$/);
  });
});
