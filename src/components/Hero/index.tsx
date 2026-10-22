import { useEffect, useState } from "react";
import { m, AnimatePresence, useReducedMotionConfig, useScroll, useTransform } from "framer-motion";
import styles from "./Hero.module.css";
import { availability, availabilityLinkSuffix, availabilitySince, hero, resumeUrl } from "../../i18n/content";
import { RichText } from "../RichText";
import { useScramble } from "../../hooks/useScramble";
import { scrollToSection } from "../../utils/dom";

const up = (delay: number) => ({
  initial: { opacity: 0, y: 32 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay, ease: "easeOut" as const },
});

interface HeroProps {
  scrambleActive: boolean;
}

export function Hero({ scrambleActive }: HeroProps) {
  const [statusIdx, setStatusIdx] = useState(0);
  const reduceMotion = useReducedMotionConfig();
  const statuses = availability.statuses;

  useEffect(() => {
    if (!availability.open || reduceMotion || statuses.length < 2) {
      return;
    }
    const id = setInterval(() => setStatusIdx((i) => (i + 1) % statuses.length), 2800);
    return () => clearInterval(id);
  }, [reduceMotion, statuses.length]);

  const { scrollYProgress } = useScroll();
  const contentY = useTransform(scrollYProgress, [0, 0.28], [0, -60]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.22], [1, 0]);

  const scramble = scrambleActive && !reduceMotion;
  const displayFirst = useScramble(hero.nameFirst, scramble, 850);
  const displayLast = useScramble(hero.nameLast, scramble, 1050);

  return (
    <section id="hero" className={styles.hero}>
      <div className={styles.meshBg}>
        <div className={`${styles.orb} ${styles.orb1}`} />
        <div className={`${styles.orb} ${styles.orb2}`} />
        <div className={`${styles.orb} ${styles.orb3}`} />
      </div>

      <m.div className={styles.inner} style={{ y: contentY, opacity: contentOpacity }}>
        <div className={styles.content}>
          {availability.open && (
            <button type="button" className={styles.statusRow} onClick={() => scrollToSection(availability.target)}>
              <span className={styles.statusDot} aria-hidden="true" />
              <AnimatePresence mode="wait" initial={false}>
                <m.span
                  key={statusIdx}
                  className={styles.statusText}
                  initial={{ y: 8, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -8, opacity: 0 }}
                  transition={{ duration: 0.22 }}>
                  {statuses[statusIdx]}
                </m.span>
              </AnimatePresence>
              {availability.since && (
                <span className={styles.statusSince}>· {availabilitySince(availability.since)}</span>
              )}
              <span className="sr-only">{availabilityLinkSuffix}</span>
            </button>
          )}

          <m.div className={styles.eyebrow} {...up(0)}>
            {hero.eyebrow}
          </m.div>

          <div className={styles.name}>
            <span className="sr-only">{`${hero.nameFirst} ${hero.nameLast}`}</span>
            <span className={styles.nThin} aria-hidden="true">
              {displayFirst}
            </span>
            <span className={styles.nBold} aria-hidden="true">
              {displayLast}
              <span className={styles.cursor} />
            </span>
          </div>

          <m.div className={styles.roles} {...up(0.2)}>
            {hero.roles.map((role, i) => (
              <span key={role.label}>
                {i > 0 && <span className={styles.sep}>x</span>}
                <span className={role.style === "P" ? styles.chipP : styles.chipC}>{role.label}</span>
              </span>
            ))}
          </m.div>

          <m.p className={styles.tagline} {...up(0.3)}>
            <RichText html={hero.taglineHtml} />
          </m.p>

          <m.div className={styles.cta} {...up(0.4)}>
            <button type="button" className={styles.btnPrimary} onClick={() => scrollToSection(hero.ctaPrimary.target)}>
              {hero.ctaPrimary.label}
            </button>
            {resumeUrl && (
              <a href={resumeUrl} download className={styles.btnGhost}>
                {hero.ctaGhost.label}
              </a>
            )}
          </m.div>
        </div>

        <m.div
          className={styles.visual}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}>
          <div className={styles.glowRing} />
          <div className={styles.orbRing}>
            <div className={styles.orbRing2} />
            <div className={styles.orbCenter}>{hero.orbSymbol}</div>
            <div className={styles.od1} />
            <div className={styles.od2} />
          </div>
          {hero.floatChips.map((chip, i) => {
            const posClass = [styles.chip1, styles.chip2, styles.chip3][i] ?? "";
            const dotClass = chip.style === "P" ? styles.chipDot : chip.style === "C" ? styles.chipDot2 : undefined;
            return (
              <div key={chip.label} className={`${styles.floatChip} ${posClass}`}>
                {dotClass && <span className={dotClass} />}
                {chip.label}
              </div>
            );
          })}
        </m.div>
      </m.div>
    </section>
  );
}
