import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { overlapCopy, overlapZones } from "../../i18n/content";
import { TimezoneOverlap } from "./TimezoneOverlap";

vi.mock("../../site.config", async (importOriginal) => {
  const { siteConfig, ...rest } = await importOriginal<typeof import("../../site.config")>();
  return {
    ...rest,
    siteConfig: {
      ...siteConfig,
      site: { ...siteConfig.site, timeZone: "Asia/Kolkata" },
      workingHours: { start: 10, end: 19 },
      visitorHours: { start: 9, end: 18 },
    },
  };
});

const text = () => document.querySelector("[aria-live]")!.textContent;
const select = () => screen.getByRole("combobox", { name: overlapCopy.zoneLabel }) as HTMLSelectElement;

function renderOn(iso: string) {
  vi.setSystemTime(new Date(iso));
  return render(<TimezoneOverlap />);
}

beforeEach(() => {
  vi.useFakeTimers({ toFake: ["Date"] });
});

afterEach(() => {
  vi.useRealTimers();
});

describe("TimezoneOverlap", () => {
  it("shows the overlap in the visitor's own zone, added to the list", () => {
    renderOn("2026-07-15T08:00:00Z");
    expect(select().value).toBe("UTC");
    expect(select().options).toHaveLength(overlapZones.length + 1);
    expect(text()).toBe(overlapCopy.overlap("9:00 AM–1:30 PM", "4.5"));
  });

  it("recalculates when the visitor picks another zone", () => {
    renderOn("2026-07-15T08:00:00Z");
    fireEvent.change(select(), { target: { value: "Asia/Tokyo" } });
    expect(text()).toBe(overlapCopy.overlap("1:30 PM–6:00 PM", "4.5"));
  });

  it("says so when there's no overlap", () => {
    renderOn("2026-01-15T14:00:00Z");
    fireEvent.change(select(), { target: { value: "America/New_York" } });
    expect(text()).toBe(overlapCopy.none);
    expect(document.querySelectorAll('[class*="barShared"]')).toHaveLength(0);
  });

  it("says so in the same zone", () => {
    renderOn("2026-07-15T08:00:00Z");
    fireEvent.change(select(), { target: { value: "Asia/Kolkata" } });
    expect(text()).toBe(overlapCopy.same);
  });

  it("draws both working days and the overlap on a hidden 24-hour bar", () => {
    const { container } = renderOn("2026-07-15T08:00:00Z");
    const bar = container.querySelector('[class*="bar"][aria-hidden]')!;
    const shared = bar.querySelector<HTMLElement>('[class*="barShared"]')!;
    expect(shared.style.left).toBe(`${(540 / 1440) * 100}%`);
    expect(screen.getByText(overlapCopy.myHours("10:00 AM–7:00 PM"))).toBeTruthy();
  });

  it("doesn't duplicate the visitor's zone when it's already listed", () => {
    vi.spyOn(Intl.DateTimeFormat.prototype, "resolvedOptions").mockReturnValue({
      timeZone: "Europe/London",
    } as Intl.ResolvedDateTimeFormatOptions);
    renderOn("2026-07-15T08:00:00Z");
    expect(select().value).toBe("Europe/London");
    expect(select().options).toHaveLength(overlapZones.length);
  });
});
