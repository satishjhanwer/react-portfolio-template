import { m } from "framer-motion";
import styles from "./Hero.module.css";
import { hero, resumeUrl } from "../../data";
import { RichText } from "../RichText";

const up = (delay: number) => ({
  initial: { opacity: 0, y: 32 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay, ease: "easeOut" as const },
});

export function Hero() {
  return (
    <section id="hero" className={styles.hero}>
      <div className={styles.meshBg}>
        <div className={`${styles.orb} ${styles.orb1}`} />
        <div className={`${styles.orb} ${styles.orb2}`} />
        <div className={`${styles.orb} ${styles.orb3}`} />
      </div>

      <div className={styles.inner}>
        <div className={styles.content}>
          <m.div className={styles.eyebrow} {...up(0)}>
            {hero.eyebrow}
          </m.div>

          <m.div className={styles.name} {...up(0.1)}>
            <span className={styles.nThin}>{hero.nameFirst}</span>
            <span className={styles.nBold}>
              {hero.nameLast}
              <span className={styles.cursor} />
            </span>
          </m.div>

          <m.div className={styles.roles} {...up(0.2)}>
            {hero.roles.map((role, i) => (
              <span key={role.label}>
                {i > 0 && <span className={styles.sep}>x</span>}
                <span
                  className={role.style === "P" ? styles.chipP : styles.chipC}
                >
                  {role.label}
                </span>
              </span>
            ))}
          </m.div>

          <m.p className={styles.tagline} {...up(0.3)}>
            <RichText html={hero.taglineHtml} />
          </m.p>

          <m.div className={styles.cta} {...up(0.4)}>
            <button
              type="button"
              className={styles.btnPrimary}
              onClick={() =>
                document
                  .getElementById(hero.ctaPrimary.target)
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            >
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
          transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
        >
          <div className={styles.glowRing} />
          <div className={styles.orbRing}>
            <div className={styles.orbRing2} />
            <div className={styles.orbCenter}>{hero.orbSymbol}</div>
            <div className={styles.od1} />
            <div className={styles.od2} />
          </div>
          {hero.floatChips.map((chip, i) => {
            const posClass =
              [styles.chip1, styles.chip2, styles.chip3][i] ?? "";
            const dotClass =
              chip.style === "P"
                ? styles.chipDot
                : chip.style === "C"
                  ? styles.chipDot2
                  : undefined;
            return (
              <div
                key={chip.label}
                className={`${styles.floatChip} ${posClass}`}
              >
                {dotClass && <span className={dotClass} />}
                {chip.label}
              </div>
            );
          })}
        </m.div>
      </div>
    </section>
  );
}
