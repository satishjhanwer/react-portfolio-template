import { describe, expect, it, vi } from "vitest";
import en from "../../i18n/locales/en";

vi.mock("../../site.config", async (importOriginal) => {
  const { siteConfig, ...rest } = await importOriginal<typeof import("../../site.config")>();
  return {
    ...rest,
    siteConfig: {
      ...siteConfig,
      site: { ...siteConfig.site, timeZone: "Asia/Kolkata" },
      greetingReplies: [
        { id: "workHours", from: 9, to: 19 },
        { id: "evening", from: 19, to: 24 },
      ],
    },
  };
});

async function loadGreeting(timeZone?: string) {
  vi.resetModules();
  const content = await import("../../i18n/content");
  if (timeZone) {
    content.site.timeZone = timeZone;
  }
  return import("./greeting");
}

const utc = (hour: number, minute = 0) => new Date(Date.UTC(2026, 9, 21, hour, minute));

describe("buildGreeting (visitor in UTC, owner in India)", () => {
  it("greets by the visitor's hour and adds the owner's local time and reply", async () => {
    const { buildGreeting } = await loadGreeting();
    const text = buildGreeting(utc(9));
    const morning = en.greetingSalutations.morning;
    expect(text.startsWith(morning)).toBe(true);
    expect(text).toContain("2:30");
    expect(text).toContain(en.greetingReplies.workHours);
  });

  it("uses the fallback outside every salutation range", async () => {
    const { buildGreeting } = await loadGreeting();
    const content = await import("../../i18n/content");
    content.greetingSalutations.length = 0;
    expect(buildGreeting(utc(9)).startsWith(en.greetingFallback)).toBe(true);
  });

  it("uses the reply fallback outside every reply range", async () => {
    const { buildGreeting } = await loadGreeting();
    const content = await import("../../i18n/content");
    content.greetingReplies.length = 0;
    expect(buildGreeting(utc(9))).toContain(en.greetingReplyFallback);
  });

  it("says 'same time zone' when the clocks match", async () => {
    const { buildGreeting } = await loadGreeting("UTC");
    expect(buildGreeting(utc(14))).toContain(en.greetingSameZone);
  });
});
