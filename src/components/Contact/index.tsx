import { m, useInView } from "framer-motion";
import { useRef } from "react";
import styles from "./Contact.module.css";
import { openTo, email, heading, note } from "../../data";
import { SectionHeader } from "../SectionHeader";

export function Contact() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="contact" className="sec" ref={ref}>
      <SectionHeader id="contact" />

      <m.div
        className={styles.center}
        initial={{ opacity: 0, y: 24 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <div className={styles.big}>
          <div className={styles.bigMuted}>{heading.muted}</div>
          <div className={styles.bigGrad}>{heading.grad}</div>
        </div>

        <p className={styles.note}>{note}</p>

        <div className={styles.chips}>
          {openTo.map((tag) => (
            <span key={tag} className={styles.chip}>
              {tag}
            </span>
          ))}
        </div>

        <a href={`mailto:${email}`} className={styles.cta}>
          {email} →
        </a>
      </m.div>
    </section>
  );
}
