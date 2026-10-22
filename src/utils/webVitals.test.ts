import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Metric } from "web-vitals";

const callbacks: Record<string, (m: Partial<Metric>) => void> = {};

vi.mock("web-vitals", () => {
  const on = (name: string) => (cb: (m: Partial<Metric>) => void) => {
    callbacks[name] = cb;
  };
  return {
    onLCP: on("LCP"),
    onCLS: on("CLS"),
    onINP: on("INP"),
    onFCP: on("FCP"),
    onTTFB: on("TTFB"),
    LCPThresholds: [2500, 4000],
    CLSThresholds: [0.1, 0.25],
    INPThresholds: [200, 500],
    FCPThresholds: [1800, 3000],
    TTFBThresholds: [800, 1800],
  };
});

async function loadVitals() {
  vi.resetModules();
  return import("./webVitals");
}

function supportEntryTypes(types: string[]) {
  vi.stubGlobal("PerformanceObserver", { supportedEntryTypes: types });
}

const ALL = ["largest-contentful-paint", "layout-shift", "event", "paint", "navigation"];

beforeEach(() => {
  for (const key of Object.keys(callbacks)) {
    delete callbacks[key];
  }
  vi.spyOn(document, "readyState", "get").mockReturnValue("complete");
  vi.spyOn(document, "visibilityState", "get").mockReturnValue("visible");
  vi.stubGlobal("requestIdleCallback", (cb: () => void) => {
    cb();
    return 1;
  });
  supportEntryTypes(ALL);
});

describe("startWebVitals", () => {
  it("loads the thresholds and records each reading", async () => {
    const { startWebVitals, getVitalsSnapshot } = await loadVitals();
    startWebVitals();
    await vi.waitFor(() => expect(callbacks.LCP).toBeDefined());

    callbacks.LCP({ name: "LCP", value: 1200, rating: "good" });
    callbacks.CLS({ name: "CLS", value: 0.3, rating: "poor" });

    const snap = getVitalsSnapshot();
    expect(snap.thresholds.LCP).toEqual([2500, 4000]);
    expect(snap.readings.LCP).toEqual({ value: 1200, rating: "good" });
    expect(snap.readings.CLS).toEqual({ value: 0.3, rating: "poor" });
  });

  it("only starts once", async () => {
    const { startWebVitals, subscribeVitals } = await loadVitals();
    const listener = vi.fn();
    subscribeVitals(listener);
    startWebVitals();
    startWebVitals();
    await vi.waitFor(() => expect(listener).toHaveBeenCalledOnce());
  });

  it("marks metrics the browser can't measure as unsupported", async () => {
    supportEntryTypes(["paint", "navigation"]);
    const { startWebVitals, getVitalsSnapshot } = await loadVitals();
    startWebVitals();
    expect(getVitalsSnapshot().unavailable).toEqual({
      LCP: "unsupported",
      CLS: "unsupported",
      INP: "unsupported",
    });
  });

  it("treats a missing PerformanceObserver as nothing supported", async () => {
    vi.stubGlobal("PerformanceObserver", undefined);
    const { startWebVitals, getVitalsSnapshot } = await loadVitals();
    startWebVitals();
    expect(Object.keys(getVitalsSnapshot().unavailable)).toHaveLength(5);
  });

  it("marks LCP as hidden when the tab starts in the background", async () => {
    vi.spyOn(document, "visibilityState", "get").mockReturnValue("hidden");
    const { startWebVitals, getVitalsSnapshot } = await loadVitals();
    startWebVitals();
    expect(getVitalsSnapshot().unavailable.LCP).toBe("hidden");
  });

  it("marks LCP as hidden if the tab is hidden before LCP is reported", async () => {
    const visibility = vi.spyOn(document, "visibilityState", "get");
    const { startWebVitals, getVitalsSnapshot } = await loadVitals();
    startWebVitals();
    visibility.mockReturnValue("hidden");
    document.dispatchEvent(new Event("visibilitychange"));
    expect(getVitalsSnapshot().unavailable.LCP).toBe("hidden");
  });

  it("keeps LCP if it was already reported when the tab is hidden", async () => {
    const visibility = vi.spyOn(document, "visibilityState", "get");
    const { startWebVitals, getVitalsSnapshot } = await loadVitals();
    startWebVitals();
    await vi.waitFor(() => expect(callbacks.LCP).toBeDefined());
    callbacks.LCP({ name: "LCP", value: 900, rating: "good" });

    document.dispatchEvent(new Event("visibilitychange"));
    visibility.mockReturnValue("hidden");
    document.dispatchEvent(new Event("visibilitychange"));
    expect(getVitalsSnapshot().unavailable.LCP).toBeUndefined();
  });

  it("doesn't re-emit an unchanged unavailable reason", async () => {
    vi.spyOn(document, "visibilityState", "get").mockReturnValue("hidden");
    supportEntryTypes(ALL.filter((t) => t !== "largest-contentful-paint"));
    const { startWebVitals, getVitalsSnapshot } = await loadVitals();
    startWebVitals();
    expect(getVitalsSnapshot().unavailable.LCP).toBe("hidden");
  });

  it("waits for load, and uses a timeout without requestIdleCallback", async () => {
    vi.useFakeTimers();
    vi.spyOn(document, "readyState", "get").mockReturnValue("loading");
    vi.stubGlobal("requestIdleCallback", undefined);
    delete (window as Partial<Window>).requestIdleCallback;
    const { startWebVitals, getVitalsSnapshot } = await loadVitals();
    startWebVitals();
    window.dispatchEvent(new Event("load"));
    vi.runAllTimers();
    vi.useRealTimers();
    await vi.waitFor(() => expect(getVitalsSnapshot().thresholds.LCP).toBeDefined());
  });

  it("useWebVitals re-renders on new readings", async () => {
    const { startWebVitals, useWebVitals } = await loadVitals();
    const { result } = renderHook(() => useWebVitals());
    startWebVitals();
    await vi.waitFor(() => expect(result.current.thresholds.LCP).toBeDefined());
    act(() => callbacks.INP({ name: "INP", value: 80, rating: "good" }));
    expect(result.current.readings.INP?.value).toBe(80);
  });

  it("stops notifying after unsubscribe", async () => {
    const { startWebVitals, subscribeVitals } = await loadVitals();
    const listener = vi.fn();
    subscribeVitals(listener)();
    startWebVitals();
    await new Promise((r) => setTimeout(r, 0));
    expect(listener).not.toHaveBeenCalled();
  });
});
