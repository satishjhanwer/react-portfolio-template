import { m, useInView } from "framer-motion";
import { useRef } from "react";
import styles from "./Skills.module.css";
import { skillCategories, type SkillIcon } from "../../data";
import { SectionHeader } from "../SectionHeader";

function SkillCard({
  variant,
  catLabel,
  icons,
  textSkills,
  delay,
  inView,
}: {
  variant: "P" | "C" | "G";
  catLabel: string;
  icons: SkillIcon[];
  textSkills?: string[];
  delay: number;
  inView: boolean;
}) {
  const cls =
    variant === "P"
      ? styles.cardP
      : variant === "C"
        ? styles.cardC
        : styles.cardG;
  return (
    <m.div
      className={`${styles.card} ${cls}`}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay }}
    >
      <div className={styles.catLabel}>{catLabel}</div>
      <div className={styles.iconGrid}>
        {icons.map((ic) => (
          <div key={ic.label} className={styles.iconItem}>
            <i
              className={`${ic.icon} ${styles.icon}`}
              style={ic.color ? { color: ic.color } : undefined}
            />
            <span className={styles.iconLabel}>{ic.label}</span>
          </div>
        ))}
      </div>
      {textSkills && textSkills.length > 0 && (
        <div className={styles.textTags}>
          {textSkills.map((t) => (
            <span
              key={t}
              className={`${styles.textTag} ${variant === "P" ? styles.textTagP : variant === "C" ? styles.textTagC : styles.textTagG}`}
            >
              {t}
            </span>
          ))}
        </div>
      )}
    </m.div>
  );
}

export function Skills() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="skills" className="sec" ref={ref}>
      <SectionHeader id="skills" />

      <div className={styles.bento}>
        {skillCategories.map((cat, i) => (
          <SkillCard
            key={cat.id}
            variant={cat.variant}
            catLabel={cat.label}
            icons={cat.icons}
            textSkills={cat.textSkills}
            delay={0.1 + i * 0.1}
            inView={inView}
          />
        ))}
      </div>
    </section>
  );
}
