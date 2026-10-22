import styles from "./Skills.module.css";
import { skillCategories } from "../../i18n/content";
import { SectionHeader } from "../SectionHeader";
import { useSectionInView } from "../../hooks/useSectionInView";
import { SkillCard } from "./SkillCard";

export function Skills() {
  const { ref, inView } = useSectionInView();

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
