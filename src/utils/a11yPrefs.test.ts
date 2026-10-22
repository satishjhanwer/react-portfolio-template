import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { mockMatchMedia, throwingStorage } from "../test/helpers";

vi.mock("@fontsource/atkinson-hyperlegible/latin-400.css", () => ({}));
vi.mock("@fontsource/atkinson-hyperlegible/latin-700.css", () => ({}));

async function loadPrefs(saved?: unknown) {
  if (saved !== undefined) {
    localStorage.setItem("a11y-prefs", typeof saved === "string" ? saved : JSON.stringify(saved));
  }
  vi.resetModules();
  return import("./a11yPrefs");
}

const attr = (name: string) => document.documentElement.getAttribute(name);

describe("reading saved prefs", () => {
  it("uses the defaults when nothing is saved", async () => {
    const { getPrefs, DEFAULT_PREFS } = await loadPrefs();
    expect(getPrefs()).toEqual(DEFAULT_PREFS);
  });

  it("restores valid saved values", async () => {
    const saved = {
      textSize: "130",
      highContrast: true,
      readableFont: true,
      reduceMotion: true,
      systemCursor: true,
      underlineLinks: true,
      colorVision: "tritanopia",
    };
    const { getPrefs } = await loadPrefs(saved);
    expect(getPrefs()).toEqual(saved);
  });

  it("drops invalid values field by field", async () => {
    const { getPrefs, DEFAULT_PREFS } = await loadPrefs({
      textSize: "500",
      highContrast: "yes",
      colorVision: "infrared",
      underlineLinks: true,
    });
    expect(getPrefs()).toEqual({ ...DEFAULT_PREFS, underlineLinks: true });
  });

  it("falls back to the defaults on corrupt JSON", async () => {
    const { getPrefs, DEFAULT_PREFS } = await loadPrefs("{not json");
    expect(getPrefs()).toEqual(DEFAULT_PREFS);
  });

  it("falls back to the defaults when storage is blocked", async () => {
    throwingStorage();
    const { getPrefs, DEFAULT_PREFS } = await loadPrefs();
    expect(getPrefs()).toEqual(DEFAULT_PREFS);
  });
});

describe("setPrefs", () => {
  it("mirrors every pref as a data attribute on <html>", async () => {
    const { setPrefs } = await loadPrefs();
    setPrefs({
      textSize: "115",
      highContrast: true,
      readableFont: true,
      reduceMotion: true,
      systemCursor: true,
      underlineLinks: true,
      colorVision: "protanopia",
    });
    expect(attr("data-text-size")).toBe("115");
    expect(attr("data-contrast")).toBe("high");
    expect(attr("data-font")).toBe("readable");
    expect(attr("data-motion")).toBe("reduce");
    expect(attr("data-cursor")).toBe("system");
    expect(attr("data-links")).toBe("underline");
    expect(attr("data-vision")).toBe("protanopia");
  });

  it("removes the attributes again for default values", async () => {
    const { setPrefs, resetPrefs } = await loadPrefs();
    setPrefs({ textSize: "130", highContrast: true, colorVision: "achromatopsia" });
    resetPrefs();
    expect(attr("data-text-size")).toBeNull();
    expect(attr("data-contrast")).toBeNull();
    expect(attr("data-vision")).toBeNull();
  });

  it("saves to localStorage", async () => {
    const { setPrefs } = await loadPrefs();
    setPrefs({ underlineLinks: true });
    expect(JSON.parse(localStorage.getItem("a11y-prefs")!)).toMatchObject({ underlineLinks: true });
  });

  it("still applies when storage is blocked", async () => {
    const { setPrefs } = await loadPrefs();
    throwingStorage();
    setPrefs({ highContrast: true });
    expect(attr("data-contrast")).toBe("high");
  });

  it("notifies subscribers until they unsubscribe", async () => {
    const { setPrefs, subscribePrefs } = await loadPrefs();
    const listener = vi.fn();
    const unsubscribe = subscribePrefs(listener);
    setPrefs({ reduceMotion: true });
    unsubscribe();
    setPrefs({ reduceMotion: false });
    expect(listener).toHaveBeenCalledOnce();
  });
});

describe("helpers", () => {
  it("isDefaultPrefs spots any change", async () => {
    const { isDefaultPrefs, DEFAULT_PREFS } = await loadPrefs();
    expect(isDefaultPrefs(DEFAULT_PREFS)).toBe(true);
    expect(isDefaultPrefs({ ...DEFAULT_PREFS, systemCursor: true })).toBe(false);
  });

  it("prefersReducedMotion follows the site pref or the OS setting", async () => {
    const { prefersReducedMotion, setPrefs } = await loadPrefs();
    expect(prefersReducedMotion()).toBe(false);
    setPrefs({ reduceMotion: true });
    expect(prefersReducedMotion()).toBe(true);
    setPrefs({ reduceMotion: false });
    mockMatchMedia((q) => q === "(prefers-reduced-motion: reduce)");
    expect(prefersReducedMotion()).toBe(true);
  });

  it("initPrefs applies the saved prefs", async () => {
    const { initPrefs } = await loadPrefs({ readableFont: true, textSize: "130" });
    initPrefs();
    expect(attr("data-font")).toBe("readable");
    expect(attr("data-text-size")).toBe("130");
  });

  it("initPrefs leaves <html> alone with the defaults", async () => {
    const { initPrefs } = await loadPrefs();
    initPrefs();
    expect(document.documentElement.getAttributeNames().filter((n) => n.startsWith("data-"))).toEqual([]);
  });

  it("useA11yPrefs re-renders on change", async () => {
    const { useA11yPrefs, setPrefs } = await loadPrefs();
    const { result } = renderHook(() => useA11yPrefs());
    expect(result.current.highContrast).toBe(false);
    act(() => setPrefs({ highContrast: true }));
    expect(result.current.highContrast).toBe(true);
  });
});
