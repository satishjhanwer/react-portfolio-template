import { useEffect, useId, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import { createPortal } from "react-dom";
import { m } from "framer-motion";
import type Lenis from "lenis";
import sheet from "../Shortcuts/Shortcuts.module.css";
import styles from "./Trust.module.css";
import { email, trustCopy as copy, trustReviewed } from "../../i18n/content";
import { locale } from "../../i18n/locale";
import { useModal } from "../../hooks/useModal";
import { trapTab } from "../../utils/dom";

export type TrustSection = "accessibility" | "privacy";

const SAVED_KEYS = ["a11y-prefs", "theme", "lang"] as const;
const RELOAD_DELAY_MS = 900;

interface TrustProps {
  onClose: () => void;
  getLenis: () => Lenis | null;
  section?: TrustSection;
}

async function clearSavedData() {
  for (const key of SAVED_KEYS) {
    try {
      localStorage.removeItem(key);
    } catch {
      break;
    }
  }
  if ("caches" in window) {
    const keys = await caches.keys();
    await Promise.all(keys.map((k) => caches.delete(k)));
  }
}

export function Trust({ onClose, getLenis, section = "accessibility" }: TrustProps) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const privacyRef = useRef<HTMLElement>(null);
  const [cleared, setCleared] = useState(false);
  useModal(getLenis);

  useEffect(() => {
    closeRef.current?.focus();
    if (section === "privacy") {
      privacyRef.current?.scrollIntoView({ block: "start" });
    }
  }, [section]);

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    } else {
      trapTab(e, panelRef.current);
    }
  };

  const clear = () => {
    void clearSavedData()
      .catch(() => undefined)
      .then(() => {
        setCleared(true);
        window.setTimeout(() => window.location.reload(), RELOAD_DELAY_MS);
      });
  };

  const reviewed = new Intl.DateTimeFormat(locale, { dateStyle: "long", timeZone: "UTC" }).format(
    new Date(`${trustReviewed}T00:00:00Z`),
  );
  const reportHref = `mailto:${email}?subject=${encodeURIComponent(copy.a11y.reportSubject)}`;
  const storage = [
    ["a11y-prefs", copy.privacy.storage.prefs],
    ["theme", copy.privacy.storage.theme],
    ["lang", copy.privacy.storage.lang],
    ["Cache Storage", copy.privacy.storage.cache],
  ] as const;

  return createPortal(
    <m.div
      className={sheet.overlay}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}>
      <m.div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`${sheet.panel} ${styles.panel}`}
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.18, ease: "easeOut" }}
        onKeyDown={onKeyDown}
        data-lenis-prevent>
        <header className={sheet.header}>
          <h2 id={titleId} className={sheet.title}>
            {copy.title}
          </h2>
          <button ref={closeRef} type="button" className={sheet.close} aria-label={copy.close} onClick={onClose}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
          </button>
        </header>

        <section id="trust-accessibility" className={styles.section} aria-labelledby={`${titleId}-a11y`}>
          <h3 id={`${titleId}-a11y`} className={styles.heading}>
            {copy.a11y.heading}
          </h3>
          <p className={styles.text}>{copy.a11y.intro}</p>
          <h4 className={styles.subheading}>{copy.a11y.testedTitle}</h4>
          <ul className={styles.list}>
            {copy.a11y.tested.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
          <h4 className={styles.subheading}>{copy.a11y.prefsTitle}</h4>
          <p className={styles.text}>{copy.a11y.prefs}</p>
          <h4 className={styles.subheading}>{copy.a11y.limitsTitle}</h4>
          <ul className={styles.list}>
            {copy.a11y.limits.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
          <h4 className={styles.subheading}>{copy.a11y.reportTitle}</h4>
          <p className={styles.text}>{copy.a11y.report}</p>
          <a className={styles.action} href={reportHref}>
            {copy.a11y.reportLink}
          </a>
        </section>

        <section ref={privacyRef} id="trust-privacy" className={styles.section} aria-labelledby={`${titleId}-privacy`}>
          <h3 id={`${titleId}-privacy`} className={styles.heading}>
            {copy.privacy.heading}
          </h3>
          <ul className={styles.list}>
            {copy.privacy.points.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
          <h4 className={styles.subheading}>{copy.privacy.storageTitle}</h4>
          <dl className={styles.storage}>
            {storage.map(([key, what]) => (
              <div key={key}>
                <dt>
                  <code>{key}</code>
                </dt>
                <dd>{what}</dd>
              </div>
            ))}
          </dl>
          <button type="button" className={styles.action} onClick={clear} disabled={cleared}>
            {copy.privacy.clear}
          </button>
          <p className={styles.status} role="status">
            {cleared ? copy.privacy.cleared : ""}
          </p>
        </section>

        <p className={styles.reviewed}>{copy.reviewed(reviewed)}</p>
      </m.div>
    </m.div>,
    document.body,
  );
}
