import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import html from "../../index.html?raw";
import type { A11yPrefs } from "../utils/a11yPrefs";

vi.mock("@fontsource/atkinson-hyperlegible/latin-400.css", () => ({}));
vi.mock("@fontsource/atkinson-hyperlegible/latin-700.css", () => ({}));

const inlineScripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((m) => m[1]);
const themeScript = inlineScripts.find((s) => s.includes("data-theme"))!;
const prefsScript = inlineScripts.find((s) => s.includes("a11y-prefs"))!;

const run = (code: string) => new Function(code)();
const theme = () => document.documentElement.getAttribute("data-theme");

function dataAttributes() {
  return Object.fromEntries(
    document.documentElement
      .getAttributeNames()
      .filter((n) => n.startsWith("data-"))
      .map((n) => [n, document.documentElement.getAttribute(n)]),
  );
}

describe("inline theme script", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it.each([
    [0, "sakura"],
    [7, "sakura"],
    [8, null],
    [15, null],
    [16, "night"],
    [23, "night"],
  ])("at %i:00 the theme is %s", (hour, expected) => {
    vi.setSystemTime(new Date(2026, 9, 21, hour, 30));
    run(themeScript);
    expect(theme()).toBe(expected);
  });

  it("lets ?theme= override the time", () => {
    vi.setSystemTime(new Date(2026, 9, 21, 10, 0));
    window.history.replaceState(null, "", "/?theme=sakura");
    run(themeScript);
    expect(theme()).toBe("sakura");
  });

  it("switches at the next boundary without a reload", () => {
    vi.setSystemTime(new Date(2026, 9, 21, 15, 59, 0));
    run(themeScript);
    expect(theme()).toBeNull();
    vi.advanceTimersByTime(61_000);
    expect(theme()).toBe("night");
  });

  it("wraps past midnight into sakura", () => {
    vi.setSystemTime(new Date(2026, 9, 21, 23, 59, 30));
    run(themeScript);
    expect(theme()).toBe("night");
    vi.advanceTimersByTime(31_000);
    expect(theme()).toBe("sakura");
  });

  it("ignores an unknown ?theme=", () => {
    vi.setSystemTime(new Date(2026, 9, 21, 20, 0));
    window.history.replaceState(null, "", "/?theme=neon");
    run(themeScript);
    expect(theme()).toBe("night");
  });

  it("lets ?theme= win over the saved choice", () => {
    localStorage.setItem("theme", "night");
    window.history.replaceState(null, "", "/?theme=sakura");
    run(themeScript);
    expect(theme()).toBe("sakura");
  });

  it("keeps a saved theme across a time boundary", () => {
    localStorage.setItem("theme", "sakura");
    vi.setSystemTime(new Date(2026, 9, 21, 15, 59, 0));
    run(themeScript);
    expect(theme()).toBe("sakura");
    vi.advanceTimersByTime(61_000);
    expect(theme()).toBe("sakura");
  });

  it("picks up a choice made in the app at the next boundary", () => {
    vi.setSystemTime(new Date(2026, 9, 21, 15, 59, 0));
    run(themeScript);
    localStorage.setItem("theme", "copper");
    vi.advanceTimersByTime(61_000);
    expect(theme()).toBe("copper");
  });

  it("survives blocked storage", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    vi.setSystemTime(new Date(2026, 9, 21, 3, 0));
    run(themeScript);
    expect(theme()).toBe("sakura");
  });
});

describe("inline theme script matches applyTheme()", () => {
  it.each([
    ["auto at 03:00", null, 3],
    ["auto at 12:00", null, 12],
    ["auto at 20:00", null, 20],
    ["saved copper at 20:00", "copper", 20],
    ["saved night at 03:00", "night", 3],
    ["saved sakura at 12:00", "sakura", 12],
    ["invalid saved value", "neon", 20],
  ])("%s", async (_, saved, hour) => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 9, 21, hour as number, 30));
    if (saved) {
      localStorage.setItem("theme", saved);
    }
    run(themeScript);
    const fromInline = theme();
    document.documentElement.removeAttribute("data-theme");

    vi.resetModules();
    const { applyTheme, getThemeChoice } = await import("../utils/theme");
    applyTheme(getThemeChoice());
    expect(fromInline).toBe(theme());
    vi.useRealTimers();
  });
});

describe("inline prefs script matches applyPrefs()", () => {
  const cases: [string, Partial<A11yPrefs> | string][] = [
    ["nothing saved", {}],
    ["text 115", { textSize: "115" }],
    ["text 130 + contrast", { textSize: "130", highContrast: true }],
    [
      "everything on",
      {
        textSize: "130",
        highContrast: true,
        readableFont: true,
        reduceMotion: true,
        systemCursor: true,
        underlineLinks: true,
        colorVision: "deuteranopia",
      },
    ],
    ["each vision filter: protanopia", { colorVision: "protanopia" }],
    ["each vision filter: tritanopia", { colorVision: "tritanopia" }],
    ["each vision filter: achromatopsia", { colorVision: "achromatopsia" }],
    ["invalid values", { textSize: "999" as never, colorVision: "xray" as never, highContrast: "no" as never }],
    ["corrupt JSON", "{oops"],
  ];

  it.each(cases)("%s", async (_, saved) => {
    const raw = typeof saved === "string" ? saved : JSON.stringify(saved);

    localStorage.setItem("a11y-prefs", raw);
    run(prefsScript);
    const fromInline = dataAttributes();

    for (const name of Object.keys(fromInline)) {
      document.documentElement.removeAttribute(name);
    }
    vi.resetModules();
    const { initPrefs } = await import("../utils/a11yPrefs");
    initPrefs();

    expect(fromInline).toEqual(dataAttributes());
  });
});
