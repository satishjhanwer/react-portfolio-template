import { useEffect, useId, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import { createPortal } from "react-dom";
import { m } from "framer-motion";
import type Lenis from "lenis";
import sheet from "../Shortcuts/Shortcuts.module.css";
import styles from "./QrCode.module.css";
import { contactCardCopy as copy } from "../../i18n/content";
import { useModal } from "../../hooks/useModal";
import { trapTab } from "../../utils/dom";
import { CONTACT_FILES, RECRUITER_URL, SITE_URL } from "../../utils/contactLinks";

const VARIANTS = {
  site: { src: `/${CONTACT_FILES.qrSite}`, url: SITE_URL },
  recruiter: { src: `/${CONTACT_FILES.qrRecruiter}`, url: RECRUITER_URL },
} as const;

type Variant = keyof typeof VARIANTS;

interface QrCodeProps {
  onClose: () => void;
  getLenis: () => Lenis | null;
}

export function QrCode({ onClose, getLenis }: QrCodeProps) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const [variant, setVariant] = useState<Variant>("site");
  useModal(getLenis);

  useEffect(() => {
    closeRef.current?.focus();
  }, []);

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    } else {
      trapTab(e, panelRef.current);
    }
  };

  const current = VARIANTS[variant];
  const shownUrl = current.url.replace(/^https:\/\//, "").replace(/\/$/, "");

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
        onKeyDown={onKeyDown}>
        <header className={sheet.header}>
          <h2 id={titleId} className={sheet.title}>
            {copy.qrTitle}
          </h2>
          <button ref={closeRef} type="button" className={sheet.close} aria-label={copy.qrClose} onClick={onClose}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
          </button>
        </header>

        <div className={styles.variants} role="group" aria-label={copy.variantsLabel}>
          {(Object.keys(VARIANTS) as Variant[]).map((v) => (
            <button
              key={v}
              type="button"
              className={styles.variant}
              aria-pressed={variant === v}
              onClick={() => setVariant(v)}>
              {copy.variants[v]}
            </button>
          ))}
        </div>

        <img className={styles.code} src={current.src} alt={copy.qrAlt(shownUrl)} width={240} height={240} />
        <p className={styles.url}>{shownUrl}</p>

        <a className={styles.save} href={`/${CONTACT_FILES.vcard}`} download>
          {copy.save}
        </a>
      </m.div>
    </m.div>,
    document.body,
  );
}
