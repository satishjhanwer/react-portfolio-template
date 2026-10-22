import { m } from "framer-motion";
import styles from "./Projects.module.css";
import { projects, viewProjectLabel, externalLinkGlyph } from "../../i18n/content";
import type { Tag } from "../../types";
import { SectionHeader } from "../SectionHeader";
import { TiltCard } from "./TiltCard";
import { useSectionInView } from "../../hooks/useSectionInView";

const tagCls = (s: "P" | "C" | "G") => (s === "P" ? styles.tagP : s === "C" ? styles.tagC : styles.tagG);

export function Projects() {
  const { ref, inView } = useSectionInView();

  return (
    <section id="projects" className="sec" ref={ref}>
      <SectionHeader id="projects" />

      <div className={styles.bento}>
        {projects.map((p, i) => (
          <TiltCard
            key={p.title}
            id={p.anchorId}
            className={[
              styles.card,
              p.featured ? styles.featured : "",
              p.glowC ? styles.glowC : p.featured ? styles.glowP : "",
            ]
              .filter(Boolean)
              .join(" ")}>
            <m.div
              className={styles.cardInner}
              initial={{ opacity: 0, y: 24 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 + i * 0.08 }}>
              <div className={styles.type}>{p.type}</div>
              <div className={styles.title}>{p.title}</div>
              <div className={styles.desc}>{p.desc}</div>
              <div className={styles.tags}>
                {p.tags.map((t: Tag) => (
                  <span key={t.label} className={tagCls(t.style)}>
                    {t.label}
                  </span>
                ))}
              </div>
              {p.url && (
                <a
                  href={p.url}
                  className={styles.arrow}
                  aria-label={viewProjectLabel}
                  target="_blank"
                  rel="noopener noreferrer">
                  {externalLinkGlyph}
                </a>
              )}
            </m.div>
          </TiltCard>
        ))}
      </div>
    </section>
  );
}
