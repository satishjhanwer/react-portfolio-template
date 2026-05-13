import { m, useInView } from "framer-motion";
import { useRef } from "react";
import styles from "./Awards.module.css";
import { awards } from "../../data";
import { SectionHeader } from "../SectionHeader";
import { Image } from "../Image";

export function Awards() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="awards" className="sec" ref={ref}>
      <SectionHeader id="awards" />

      <div className={styles.timeline}>
        {awards.map((a, i) => (
          <m.div
            key={`${a.title}-${a.year}`}
            className={styles.entry}
            initial={{ opacity: 0, x: -16 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.4, delay: 0.1 + i * 0.07 }}
          >
            <div className={styles.year}>{a.year}</div>
            <div className={styles.content}>
              <div className={styles.header}>
                <Image
                  src={a.logo || "/default-logo.png"}
                  alt={a.org}
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
                  <div className={styles.title}>{a.title}</div>
                  <div className={styles.org}>{a.org}</div>
                </div>
              </div>
            </div>
          </m.div>
        ))}
      </div>
    </section>
  );
}
