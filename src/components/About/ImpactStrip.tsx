import { useEffect, useRef } from "react";
import { animate, m, useInView, useReducedMotionConfig } from "framer-motion";
import styles from "./About.module.css";
import { impact, impactTitle } from "../../i18n/content";
import type { ImpactMetric } from "../../types";

const COUNT_DURATION = 1.4;

function CountUp({ metric, delay }: { metric: ImpactMetric; delay: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const reduceMotion = useReducedMotionConfig();

  useEffect(() => {
    const el = ref.current;
    if (!el || !inView || reduceMotion) {
      return;
    }
    el.textContent = "0";
    const controls = animate(0, metric.value, {
      duration: COUNT_DURATION,
      delay,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => {
        el.textContent = String(Math.round(v));
      },
    });
    return () => controls.stop();
  }, [inView, reduceMotion, metric.value, delay]);

  return (
    <span className={styles.impactValue} aria-hidden="true">
      <span ref={ref}>{metric.value}</span>
      {metric.suffix}
    </span>
  );
}

export function ImpactStrip({ inView }: { inView: boolean }) {
  return (
    <m.div
      className={styles.impact}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: 0.3 }}>
      <h3 className={styles.impactTitle}>{impactTitle}</h3>
      <ul className={styles.impactGrid}>
        {impact.map((metric, i) => (
          <li key={metric.label} className={styles.impactCard}>
            <CountUp metric={metric} delay={0.35 + i * 0.12} />
            <span className={styles.srOnly}>
              {metric.value}
              {metric.suffix}{" "}
            </span>
            <span className={styles.impactLabel}>{metric.label}</span>
            <span className={styles.impactContext}>{metric.context}</span>
          </li>
        ))}
      </ul>
    </m.div>
  );
}
