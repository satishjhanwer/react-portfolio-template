import { m, useInView } from "framer-motion";
import { useRef } from "react";
import styles from "./About.module.css";
import { stats, about } from "../../data";
import { RichText } from "../RichText";
import { SectionHeader } from "../SectionHeader";

export function About() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="about" className="sec" ref={ref}>
      <SectionHeader id="about" />

      <div className={styles.grid}>
        <m.div
          initial={{ opacity: 0, x: -24 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <p className={styles.headline}>
            <RichText html={about.headlineHtml} />
          </p>
          <p className={styles.body}>
            <RichText html={about.bodyHtml} />
          </p>
        </m.div>

        <m.div
          className={styles.statStack}
          initial={{ opacity: 0, x: 24 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {stats.map((s) => (
            <div key={s.label} className={styles.statGlass}>
              <div className={styles.statN}>{s.value}</div>
              <div className={styles.statL}>{s.label}</div>
            </div>
          ))}
        </m.div>
      </div>
    </section>
  );
}
