import { useEffect, useId, useRef, useState } from "react";
import styles from "./Footer.module.css";
import { webVitals } from "../../i18n/content";
import { useWebVitals } from "../../utils/webVitals";
import type { VitalName, VitalRating } from "../../utils/webVitals";

const RATING_CLASS: Record<VitalRating, string> = {
  good: styles.good,
  "needs-improvement": styles.warn,
  poor: styles.poor,
};

function formatVital(name: VitalName, value: number) {
  if (name === "CLS") {
    return value.toFixed(2);
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)} s`;
  }
  return `${Math.round(value)} ms`;
}

export function VitalsBadge() {
  const { readings, thresholds, unavailable } = useWebVitals();
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Escape") {
        return;
      }
      setOpen(false);
      buttonRef.current?.focus();
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className={styles.vitals}>
      <button
        ref={buttonRef}
        type="button"
        className={styles.vitalsBadge}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((o) => !o)}>
        <span className={styles.vitalsLabel}>{webVitals.badgeLabel}</span>
        {webVitals.summary.map((name) => {
          const r = readings[name];
          return (
            <span key={name} className={styles.vitalsItem}>
              <span className={`${styles.vitalsDot} ${r ? RATING_CLASS[r.rating] : ""}`} aria-hidden="true" />
              {name}{" "}
              {r ? formatVital(name, r.value) : unavailable[name] ? webVitals.unavailableShort : webVitals.pending}
              {r && <span className={styles.srOnly}>, {webVitals.ratings[r.rating]}</span>}
            </span>
          );
        })}
      </button>

      {open && (
        <div id={panelId} role="region" aria-label={webVitals.panelLabel} className={styles.vitalsPanel}>
          <p className={styles.vitalsIntro}>{webVitals.intro}</p>
          <dl className={styles.vitalsList}>
            {webVitals.order.map((name) => {
              const r = readings[name];
              const copy = webVitals.metrics[name];
              const t = thresholds[name];
              const reason = r ? undefined : unavailable[name];
              return (
                <div key={name} className={styles.vitalsRow}>
                  <dt>
                    <span className={styles.vitalsName}>{name}</span>
                    <span className={styles.vitalsFull}>{copy.name}</span>
                  </dt>
                  <dd>
                    <span className={styles.vitalsValue}>
                      {r ? formatVital(name, r.value) : webVitals.pending}
                      <span className={`${styles.vitalsRating} ${r ? RATING_CLASS[r.rating] : ""}`}>
                        {r
                          ? webVitals.ratings[r.rating]
                          : reason
                            ? webVitals.unavailableShort
                            : ("pendingHint" in copy && copy.pendingHint) || webVitals.pendingHint}
                      </span>
                    </span>
                    {reason && <span className={styles.vitalsReason}>{webVitals.unavailable[reason]}</span>}
                    <span className={styles.vitalsDesc}>{copy.desc}</span>
                    {t && (
                      <span className={styles.vitalsThreshold}>
                        {webVitals.thresholds(formatVital(name, t[0]), formatVital(name, t[1]))}
                      </span>
                    )}
                  </dd>
                </div>
              );
            })}
          </dl>
          <p className={styles.vitalsBuilt}>{webVitals.builtWith}</p>
        </div>
      )}
    </div>
  );
}
