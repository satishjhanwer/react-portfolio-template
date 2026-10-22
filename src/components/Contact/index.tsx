import { m } from "framer-motion";
import styles from "./Contact.module.css";
import { openTo, email, heading, note, ctaArrow } from "../../i18n/content";
import { SectionHeader } from "../SectionHeader";
import { useSectionInView } from "../../hooks/useSectionInView";

export function Contact() {
  const { ref, inView } = useSectionInView();

  return (
    <section id="contact" className="sec" ref={ref}>
      <SectionHeader id="contact" />

      <m.div
        className={styles.center}
        initial={{ opacity: 0, y: 24 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, delay: 0.1 }}>
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
          {email} {ctaArrow}
        </a>
      </m.div>
    </section>
  );
}
