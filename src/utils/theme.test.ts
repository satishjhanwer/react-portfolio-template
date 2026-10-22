import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { throwingStorage } from "../test/helpers";

async function loadTheme(saved?: string) {
  if (saved !== undefined) {
    localStorage.setItem("theme", saved);
  }
  vi.resetModules();
  return import("./theme");
}

const attr = () => document.documentElement.getAttribute("data-theme");

beforeEach(() => {
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date(2026, 9, 22, 10, 0));
});

afterEach(() => {
  vi.useRealTimers();
});

describe("themeForHour", () => {
  it.each([
    [0, "sakura"],
    [7, "sakura"],
    [8, "copper"],
    [15, "copper"],
    [16, "night"],
    [23, "night"],
  ])("%i:00 is %s", async (hour, theme) => {
    const { themeForHour } = await loadTheme();
    expect(themeForHour(hour)).toBe(theme);
  });
});

describe("saved choice", () => {
  it("defaults to auto", async () => {
    expect((await loadTheme()).getThemeChoice()).toBe("auto");
  });

  it("restores a saved theme", async () => {
    expect((await loadTheme("sakura")).getThemeChoice()).toBe("sakura");
  });

  it("ignores an unknown saved value", async () => {
    expect((await loadTheme("neon")).getThemeChoice()).toBe("auto");
  });

  it("falls back to auto when storage is blocked", async () => {
    throwingStorage();
    expect((await loadTheme()).getThemeChoice()).toBe("auto");
  });
});

describe("applyTheme", () => {
  it("sets an explicit theme, copper included", async () => {
    const { applyTheme } = await loadTheme();
    applyTheme("night");
    expect(attr()).toBe("night");
    applyTheme("copper");
    expect(attr()).toBe("copper");
  });

  it("follows the clock on auto, using the default for copper", async () => {
    const { applyTheme } = await loadTheme();
    applyTheme("auto", new Date(2026, 9, 22, 20, 0));
    expect(attr()).toBe("night");
    applyTheme("auto", new Date(2026, 9, 22, 3, 0));
    expect(attr()).toBe("sakura");
    applyTheme("auto", new Date(2026, 9, 22, 12, 0));
    expect(attr()).toBeNull();
  });
});

describe("setThemeChoice", () => {
  it("saves, applies and notifies", async () => {
    const { setThemeChoice, subscribeTheme, getThemeChoice } = await loadTheme();
    const listener = vi.fn();
    const unsubscribe = subscribeTheme(listener);
    setThemeChoice("sakura");
    expect(getThemeChoice()).toBe("sakura");
    expect(localStorage.getItem("theme")).toBe("sakura");
    expect(attr()).toBe("sakura");
    expect(listener).toHaveBeenCalled();
    unsubscribe();
  });

  it("forgets the saved theme when going back to auto", async () => {
    const { setThemeChoice } = await loadTheme("night");
    setThemeChoice("auto");
    expect(localStorage.getItem("theme")).toBeNull();
    expect(attr()).toBeNull();
  });

  it("drops ?theme= so the visitor's choice wins", async () => {
    window.history.replaceState(null, "", "/?theme=night&lang=fr#about");
    const { setThemeChoice } = await loadTheme();
    setThemeChoice("copper");
    expect(window.location.search).toBe("?lang=fr");
    expect(window.location.hash).toBe("#about");
  });

  it("still applies when storage is blocked", async () => {
    const { setThemeChoice } = await loadTheme();
    throwingStorage();
    vi.spyOn(Storage.prototype, "removeItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    setThemeChoice("night");
    expect(attr()).toBe("night");
    setThemeChoice("auto");
    expect(attr()).toBeNull();
  });
});

describe("hooks", () => {
  it("useThemeChoice and useCurrentTheme follow changes", async () => {
    const { setThemeChoice, useCurrentTheme, useThemeChoice } = await loadTheme();
    const { result } = renderHook(() => ({ choice: useThemeChoice(), current: useCurrentTheme() }));
    expect(result.current).toEqual({ choice: "auto", current: "copper" });
    act(() => setThemeChoice("night"));
    expect(result.current).toEqual({ choice: "night", current: "night" });
  });

  it("useCurrentTheme picks up a change made by the inline script", async () => {
    const { useCurrentTheme } = await loadTheme();
    const { result } = renderHook(() => useCurrentTheme());
    await act(async () => {
      document.documentElement.setAttribute("data-theme", "sakura");
      await Promise.resolve();
    });
    expect(result.current).toBe("sakura");
  });
});
