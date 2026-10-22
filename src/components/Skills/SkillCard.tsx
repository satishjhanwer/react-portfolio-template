import { m } from "framer-motion";
import styles from "./Skills.module.css";
import type { SkillIcon } from "../../types";

export interface SkillCardProps {
  variant: "P" | "C" | "G";
  catLabel: string;
  icons: SkillIcon[];
  textSkills?: string[];
  delay: number;
  inView: boolean;
}

export function SkillCard({ variant, catLabel, icons, textSkills, delay, inView }: SkillCardProps) {
  const cls = variant === "P" ? styles.cardP : variant === "C" ? styles.cardC : styles.cardG;
  return (
    <m.div
      className={`${styles.card} ${cls}`}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay }}>
      <div className={styles.catLabel}>{catLabel}</div>
      <div className={styles.iconGrid}>
        {icons.map((ic) => (
          <div key={ic.label} className={styles.iconItem}>
            <svg className={styles.icon} aria-hidden="true">
              <use href={`#${ic.icon}`} />
            </svg>
            <span className={styles.iconLabel}>{ic.label}</span>
          </div>
        ))}
      </div>
      {textSkills && textSkills.length > 0 && (
        <div className={styles.textTags}>
          {textSkills.map((t) => (
            <span
              key={t}
              className={`${styles.textTag} ${variant === "P" ? styles.textTagP : variant === "C" ? styles.textTagC : styles.textTagG}`}>
              {t}
            </span>
          ))}
        </div>
      )}
    </m.div>
  );
}
