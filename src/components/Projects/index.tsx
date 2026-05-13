import { m, useInView } from "framer-motion";
import { useRef } from "react";
import styles from "./Projects.module.css";
import { projects } from "../../data";
import type { Tag } from "../../data";
import { SectionHeader } from "../SectionHeader";

const tagCls = (s: "P" | "C" | "G") =>
  s === "P" ? styles.tagP : s === "C" ? styles.tagC : styles.tagG;

export function Projects() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="projects" className="sec" ref={ref}>
      <SectionHeader id="projects" />

      <div className={styles.bento}>
        {projects.map((p, i) => (
          <m.div
            key={p.title}
            className={[
              styles.card,
              p.featured ? styles.featured : "",
              p.glowC ? styles.glowC : p.featured ? styles.glowP : "",
            ].join(" ")}
            initial={{ opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1 + i * 0.08 }}
          >
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
                aria-label="View project"
                target="_blank"
                rel="noopener noreferrer"
              >
                ↗
              </a>
            )}
          </m.div>
        ))}
      </div>
    </section>
  );
}
