import { m } from "framer-motion";
import styles from "./OpenSource.module.css";
import { repos } from "../../i18n/content";
import { SectionHeader } from "../SectionHeader";
import { useSectionInView } from "../../hooks/useSectionInView";

export function OpenSource() {
  const { ref, inView } = useSectionInView();

  return (
    <section id="oss" className="sec" ref={ref}>
      <SectionHeader id="oss" />

      <div className={styles.grid}>
        {repos.map((o, i) => (
          <m.a
            key={o.name}
            href={o.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`${styles.card} ${o.glow ? styles.glowP : ""}`}
            initial={{ opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1 + i * 0.1 }}>
            <div className={styles.top}>
              <div className={styles.icon}>{o.icon}</div>
              <div className={styles.name}>{o.name}</div>
            </div>
            <p className={styles.desc}>{o.desc}</p>
            <div className={styles.meta}>
              <span className={styles.stars}>{o.stars}</span>
              <span>{o.lang}</span>
            </div>
          </m.a>
        ))}
      </div>
    </section>
  );
}
