import { m, useInView } from "framer-motion";
import { useRef } from "react";
import styles from "./Experience.module.css";
import { experienceNodes, resumeUrl } from "../../data";
import { SectionHeader } from "../SectionHeader";
import { Image } from "../Image";

export function Experience() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="experience" className="sec" ref={ref}>
      <SectionHeader id="experience" />

      <div className={styles.timeline}>
        {experienceNodes.map((n, i) => (
          <m.div
            key={`${n.role}-${n.org}-${n.year}`}
            className={`${styles.entry} ${n.active ? styles.entryActive : ""}`}
            initial={{ opacity: 0, x: -16 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.4, delay: 0.1 + i * 0.07 }}
          >
            <div className={styles.year}>{n.year}</div>
            <div className={styles.content}>
              <div className={styles.header}>
                <Image
                  src={n.logo || "/default-logo.png"}
                  alt={n.org}
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
                  <div className={styles.role}>{n.role}</div>
                  <div className={styles.org}>{n.org}</div>
                </div>
              </div>
              <div className={styles.detail}>{n.detail}</div>
            </div>
          </m.div>
        ))}
      </div>

      {resumeUrl && (
        <m.div
          className={styles.downloadWrap}
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <a href={resumeUrl} download className={styles.btn}>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            download resume
          </a>
        </m.div>
      )}
    </section>
  );
}
