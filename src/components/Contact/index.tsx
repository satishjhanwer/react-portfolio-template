import { useState } from "react";
import { m } from "framer-motion";
import styles from "./Contact.module.css";
import { contactCardCopy, openTo, email, heading, note, ctaArrow } from "../../i18n/content";
import { CONTACT_FILES } from "../../utils/contactLinks";
import type { AppCommand } from "../CommandPalette/commands";
import { SectionHeader } from "../SectionHeader";
import { useSectionInView } from "../../hooks/useSectionInView";
import { buildGreeting } from "./greeting";
import { TimezoneOverlap } from "./TimezoneOverlap";

interface ContactProps {
  onCommand?: (command: AppCommand) => void;
}

export function Contact({ onCommand }: ContactProps) {
  const { ref, inView } = useSectionInView();
  const [greeting] = useState(() => buildGreeting());

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
        <p className={styles.greeting}>{greeting}</p>

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

        <div className={styles.cardLinks}>
          <a className={styles.cardLink} href={`/${CONTACT_FILES.vcard}`} download>
            {contactCardCopy.save}
          </a>
          {onCommand && (
            <button type="button" className={styles.cardLink} onClick={() => onCommand("open-qr")}>
              {contactCardCopy.showQr}
            </button>
          )}
        </div>

        <TimezoneOverlap />
      </m.div>
    </section>
  );
}
