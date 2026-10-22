import { describe, expect, it } from "vitest";
import { offsetMinutes, visitorTimeZone, workingOverlap, zoneLabel } from "./timezone";

const ME = "Asia/Kolkata";
const MY_HOURS = { start: 10, end: 19 };
const THEIR_HOURS = { start: 9, end: 18 };

const at = (iso: string) => new Date(iso);
const overlapFor = (zone: string, iso: string) => workingOverlap(at(iso), ME, MY_HOURS, zone, THEIR_HOURS);
const hhmm = (d: Date | null, zone: string) =>
  d && new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: zone }).format(d);

describe("offsetMinutes", () => {
  it("knows fixed and DST offsets", () => {
    expect(offsetMinutes("Asia/Kolkata", Date.UTC(2026, 0, 15))).toBe(330);
    expect(offsetMinutes("America/New_York", Date.UTC(2026, 0, 15))).toBe(-300);
    expect(offsetMinutes("America/New_York", Date.UTC(2026, 6, 15))).toBe(-240);
    expect(offsetMinutes("UTC", Date.UTC(2026, 6, 15))).toBe(0);
  });
});

describe("workingOverlap (owner 10:00–19:00 India, visitor 09:00–18:00)", () => {
  it("London in summer overlaps 09:00–14:30 their time", () => {
    const o = overlapFor("Europe/London", "2026-07-15T08:00:00Z");
    expect(o.minutes).toBe(330);
    expect(hhmm(o.start, "Europe/London")).toBe("09:00");
    expect(hhmm(o.end, "Europe/London")).toBe("14:30");
  });

  it("London in winter overlaps an hour less, until 13:30", () => {
    const o = overlapFor("Europe/London", "2026-01-15T08:00:00Z");
    expect(o.minutes).toBe(270);
    expect(hhmm(o.end, "Europe/London")).toBe("13:30");
  });

  it("New York overlaps 30 minutes in summer and not at all in winter", () => {
    const summer = overlapFor("America/New_York", "2026-07-15T14:00:00Z");
    expect(summer.minutes).toBe(30);
    expect(hhmm(summer.start, "America/New_York")).toBe("09:00");
    expect(hhmm(summer.end, "America/New_York")).toBe("09:30");

    const winter = overlapFor("America/New_York", "2026-01-15T14:00:00Z");
    expect(winter.minutes).toBe(0);
    expect(winter.start).toBeNull();
    expect(winter.shared).toEqual([]);
  });

  it("Tokyo, ahead of India, overlaps 13:30–18:00 their time", () => {
    const o = overlapFor("Asia/Tokyo", "2026-03-10T03:00:00Z");
    expect(o.minutes).toBe(270);
    expect(hhmm(o.start, "Asia/Tokyo")).toBe("13:30");
  });

  it("is the whole shared day in the same zone", () => {
    const o = overlapFor("Asia/Kolkata", "2026-03-10T03:00:00Z");
    expect(o.sameZone).toBe(true);
    expect(o.minutes).toBe(480);
  });

  it("treats a different zone with the same offset as the same zone", () => {
    expect(overlapFor("Asia/Colombo", "2026-03-10T03:00:00Z").sameZone).toBe(true);
  });

  it("splits the owner's hours across midnight on the visitor's bar", () => {
    const o = overlapFor("America/Los_Angeles", "2026-07-15T20:00:00Z");
    expect(o.mine).toHaveLength(2);
    expect(o.mine[0][1]).toBe(24 * 60);
    expect(o.mine[1][0]).toBe(0);
    expect(o.theirs).toEqual([540, 1080]);
  });

  it("gives the visitor's own hours on the bar", () => {
    expect(overlapFor("Europe/Berlin", "2026-05-01T10:00:00Z").theirs).toEqual([540, 1080]);
  });
});

describe("zone helpers", () => {
  it("reads the visitor's zone", () => {
    expect(visitorTimeZone()).toBe("UTC");
  });

  it("falls back to UTC if Intl throws", () => {
    const original = Intl.DateTimeFormat;
    (Intl as { DateTimeFormat: unknown }).DateTimeFormat = () => {
      throw new Error("no Intl");
    };
    try {
      expect(visitorTimeZone()).toBe("UTC");
      expect(zoneLabel("Europe/London", "en")).toBe("London");
    } finally {
      (Intl as { DateTimeFormat: unknown }).DateTimeFormat = original;
    }
  });

  it("labels a zone with its city and a localised name", () => {
    expect(zoneLabel("America/New_York", "en", at("2026-07-15T12:00:00Z"))).toMatch(/^New York · .*Eastern/);
    expect(zoneLabel("America/Los_Angeles", "en")).toMatch(/^Los Angeles/);
  });

  it("uses just the city when there's no friendlier name", () => {
    expect(zoneLabel("Etc/UTC", "en")).toMatch(/^UTC/);
  });
});
