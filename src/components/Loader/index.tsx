import { useEffect, useRef, useState } from "react";
import { m } from "framer-motion";
import styles from "./Loader.module.css";
import { loader, site } from "../../i18n/content";

interface LoaderProps {
  onNearComplete: () => void;
  onComplete: () => void;
}

export function Loader({ onNearComplete, onComplete }: LoaderProps) {
  const [count, setCount] = useState(0);
  const [showText, setShowText] = useState(false);
  const onNearCompleteRef = useRef(onNearComplete);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onNearCompleteRef.current = onNearComplete;
  }, [onNearComplete]);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    const totalDuration = 1500;
    const start = performance.now();
    let rafId: number;

    const tick = (now: number) => {
      const elapsed = Math.min(now - start, totalDuration);
      const eased = 1 - Math.pow(1 - elapsed / totalDuration, 3);
      setCount(Math.round(eased * 100));

      if (elapsed < totalDuration) {
        rafId = requestAnimationFrame(tick);
      } else {
        setCount(100);
        setTimeout(() => setShowText(true), 150);
        setTimeout(() => onNearCompleteRef.current(), 550);
        setTimeout(() => onCompleteRef.current(), 650);
      }
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, []);

  return (
    <m.div
      className={styles.overlay}
      exit={{
        y: "-100%",
        transition: { duration: 0.75, ease: [0.76, 0, 0.24, 1] },
      }}>
      <div className={styles.brand}>
        {site.initials}
        {site.logoCursor}
      </div>

      <div className={styles.center}>
        <div className={styles.count}>{String(count).padStart(3, "0")}</div>
        <div className={styles.progressTrack}>
          <div className={styles.progressFill} style={{ transform: `scaleX(${count / 100})` }} />
        </div>

        {showText && (
          <div className={styles.enterText}>
            {loader.enterText.split("").map((char, i) => (
              <m.span
                key={i}
                initial={{ y: 14, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{
                  delay: i * 0.035,
                  duration: 0.3,
                  ease: "easeOut",
                }}>
                {char}
              </m.span>
            ))}
          </div>
        )}
      </div>

      <div className={styles.meta}>
        <span className={styles.metaLeft}>
          {loader.portfolioLabel} · {new Date().getFullYear()}
        </span>
        <span className={styles.metaRight}>{site.nameUpper}</span>
      </div>
    </m.div>
  );
}
