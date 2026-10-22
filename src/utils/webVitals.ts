import { useSyncExternalStore } from "react";
import type { Metric, MetricRatingThresholds } from "web-vitals";

export type VitalName = Metric["name"];
export type VitalRating = Metric["rating"];

export interface VitalReading {
  value: number;
  rating: VitalRating;
}

export type VitalUnavailable = "unsupported" | "hidden";

export interface VitalsSnapshot {
  readings: Partial<Record<VitalName, VitalReading>>;
  thresholds: Partial<Record<VitalName, MetricRatingThresholds>>;
  unavailable: Partial<Record<VitalName, VitalUnavailable>>;
}

let snapshot: VitalsSnapshot = {
  readings: {},
  thresholds: {},
  unavailable: {},
};
const listeners = new Set<() => void>();

function emit(next: VitalsSnapshot) {
  snapshot = next;
  listeners.forEach((l) => l());
}

export function subscribeVitals(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getVitalsSnapshot() {
  return snapshot;
}

let started = false;

const ENTRY_TYPE: Record<VitalName, string> = {
  LCP: "largest-contentful-paint",
  CLS: "layout-shift",
  INP: "event",
  FCP: "paint",
  TTFB: "navigation",
};

function markUnavailable(name: VitalName, reason: VitalUnavailable) {
  if (snapshot.unavailable[name] === reason) {
    return;
  }
  emit({
    ...snapshot,
    unavailable: { ...snapshot.unavailable, [name]: reason },
  });
}

function watchAvailability() {
  const supported = (typeof PerformanceObserver !== "undefined" && PerformanceObserver.supportedEntryTypes) || [];
  for (const [name, type] of Object.entries(ENTRY_TYPE)) {
    if (!supported.includes(type)) {
      markUnavailable(name as VitalName, "unsupported");
    }
  }

  const onHidden = () => {
    if (document.visibilityState !== "hidden") {
      return;
    }
    document.removeEventListener("visibilitychange", onHidden);
    if (!snapshot.readings.LCP) {
      markUnavailable("LCP", "hidden");
    }
  };
  if (document.visibilityState === "hidden") {
    onHidden();
  } else {
    document.addEventListener("visibilitychange", onHidden);
  }
}

export function startWebVitals() {
  if (started) {
    return;
  }
  started = true;
  watchAvailability();

  const run = () => {
    import("web-vitals")
      .then(
        ({
          onCLS,
          onFCP,
          onINP,
          onLCP,
          onTTFB,
          CLSThresholds,
          FCPThresholds,
          INPThresholds,
          LCPThresholds,
          TTFBThresholds,
        }) => {
          emit({
            ...snapshot,
            thresholds: {
              LCP: LCPThresholds,
              CLS: CLSThresholds,
              INP: INPThresholds,
              FCP: FCPThresholds,
              TTFB: TTFBThresholds,
            },
          });

          const report = (m: Metric) =>
            emit({
              ...snapshot,
              readings: {
                ...snapshot.readings,
                [m.name]: { value: m.value, rating: m.rating },
              },
            });

          const opts = { reportAllChanges: true };
          onLCP(report, opts);
          onCLS(report, opts);
          onINP(report, opts);
          onFCP(report, opts);
          onTTFB(report, opts);
        },
      )
      .catch(() => {});
  };

  const whenIdle = () =>
    "requestIdleCallback" in window ? window.requestIdleCallback(run, { timeout: 4000 }) : setTimeout(run, 1);

  if (document.readyState === "complete") {
    whenIdle();
  } else {
    window.addEventListener("load", whenIdle, { once: true });
  }
}

export function useWebVitals() {
  return useSyncExternalStore(subscribeVitals, getVitalsSnapshot);
}
