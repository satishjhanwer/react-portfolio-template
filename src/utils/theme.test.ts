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
    [0, "arctic"],
    [7, "arctic"],
    [8, "indigo"],
    [15, "indigo"],
    [16, "sunset"],
    [23, "sunset"],
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
    expect((await loadTheme("arctic")).getThemeChoice()).toBe("arctic");
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
  it("sets an explicit theme, indigo included", async () => {
    const { applyTheme } = await loadTheme();
    applyTheme("sunset");
    expect(attr()).toBe("sunset");
    applyTheme("indigo");
    expect(attr()).toBe("indigo");
  });

  it("follows the clock on auto, using the default for indigo", async () => {
    const { applyTheme } = await loadTheme();
    applyTheme("auto", new Date(2026, 9, 22, 20, 0));
    expect(attr()).toBe("sunset");
    applyTheme("auto", new Date(2026, 9, 22, 3, 0));
    expect(attr()).toBe("arctic");
    applyTheme("auto", new Date(2026, 9, 22, 12, 0));
    expect(attr()).toBeNull();
  });
});

describe("setThemeChoice", () => {
  it("saves, applies and notifies", async () => {
    const { setThemeChoice, subscribeTheme, getThemeChoice } = await loadTheme();
    const listener = vi.fn();
    const unsubscribe = subscribeTheme(listener);
    setThemeChoice("arctic");
    expect(getThemeChoice()).toBe("arctic");
    expect(localStorage.getItem("theme")).toBe("arctic");
    expect(attr()).toBe("arctic");
    expect(listener).toHaveBeenCalled();
    unsubscribe();
  });

  it("forgets the saved theme when going back to auto", async () => {
    const { setThemeChoice } = await loadTheme("sunset");
    setThemeChoice("auto");
    expect(localStorage.getItem("theme")).toBeNull();
    expect(attr()).toBeNull();
  });

  it("drops ?theme= so the visitor's choice wins", async () => {
    window.history.replaceState(null, "", "/?theme=sunset&lang=fr#about");
    const { setThemeChoice } = await loadTheme();
    setThemeChoice("indigo");
    expect(window.location.search).toBe("?lang=fr");
    expect(window.location.hash).toBe("#about");
  });

  it("still applies when storage is blocked", async () => {
    const { setThemeChoice } = await loadTheme();
    throwingStorage();
    vi.spyOn(Storage.prototype, "removeItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    setThemeChoice("sunset");
    expect(attr()).toBe("sunset");
    setThemeChoice("auto");
    expect(attr()).toBeNull();
  });
});

describe("hooks", () => {
  it("useThemeChoice and useCurrentTheme follow changes", async () => {
    const { setThemeChoice, useCurrentTheme, useThemeChoice } = await loadTheme();
    const { result } = renderHook(() => ({ choice: useThemeChoice(), current: useCurrentTheme() }));
    expect(result.current).toEqual({ choice: "auto", current: "indigo" });
    act(() => setThemeChoice("sunset"));
    expect(result.current).toEqual({ choice: "sunset", current: "sunset" });
  });

  it("useCurrentTheme picks up a change made by the inline script", async () => {
    const { useCurrentTheme } = await loadTheme();
    const { result } = renderHook(() => useCurrentTheme());
    await act(async () => {
      document.documentElement.setAttribute("data-theme", "arctic");
      await Promise.resolve();
    });
    expect(result.current).toBe("arctic");
  });
});
