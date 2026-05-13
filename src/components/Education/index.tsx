import { m, useInView } from "framer-motion";
import { useRef } from "react";
import styles from "./Education.module.css";
import { educationNodes } from "../../data";
import { SectionHeader } from "../SectionHeader";
import { Image } from "../Image";

export function Education() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="education" className="sec" ref={ref}>
      <SectionHeader id="education" />

      <div className={styles.timeline}>
        {educationNodes.map((n, i) => (
          <m.div
            key={`${n.degree}-${n.school}-${n.year}`}
            className={styles.entry}
            initial={{ opacity: 0, x: -16 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.4, delay: 0.1 + i * 0.07 }}
          >
            <div className={styles.year}>{n.year}</div>
            <div className={styles.content}>
              <div className={styles.header}>
                <Image
                  src={n.logo || "/default-logo.png"}
                  alt={n.school}
                  className={styles.logo}
                  fallback={
                    <img
                      src="/default-logo.png"
                      alt="Default"
                      className={styles.logo}
                    />
                  }
                />
                <div>
                  <div className={styles.degree}>{n.degree}</div>
                  <div className={styles.school}>{n.school}</div>
                </div>
              </div>
              <div className={styles.detail}>{n.detail}</div>
            </div>
          </m.div>
        ))}
      </div>
    </section>
  );
}
