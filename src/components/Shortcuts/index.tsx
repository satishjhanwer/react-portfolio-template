import { useEffect, useId, useRef } from "react";
import type { KeyboardEvent } from "react";
import { createPortal } from "react-dom";
import { m } from "framer-motion";
import type Lenis from "lenis";
import styles from "./Shortcuts.module.css";
import { shortcuts, shortcutsCopy } from "../../i18n/content";
import { useModal } from "../../hooks/useModal";
import { modKeyLabel, trapTab } from "../../utils/dom";

interface ShortcutsProps {
  onClose: () => void;
  getLenis: () => Lenis | null;
}

export function Shortcuts({ onClose, getLenis }: ShortcutsProps) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
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

  return createPortal(
    <m.div
      className={styles.overlay}
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
        className={styles.panel}
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.18, ease: "easeOut" }}
        onKeyDown={onKeyDown}>
        <header className={styles.header}>
          <h2 id={titleId} className={styles.title}>
            {shortcutsCopy.title}
          </h2>
          <button
            ref={closeRef}
            type="button"
            className={styles.close}
            aria-label={shortcutsCopy.close}
            onClick={onClose}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
          </button>
        </header>
        <p className={styles.intro}>{shortcutsCopy.intro}</p>
        <dl className={styles.list}>
          {shortcuts.map((s) => (
            <div key={s.id} className={styles.row}>
              <dt className={styles.keys}>
                {s.keys.map((k, i) => (
                  <kbd key={i}>{k === "mod" ? modKeyLabel : k}</kbd>
                ))}
              </dt>
              <dd className={styles.label}>{s.label}</dd>
            </div>
          ))}
        </dl>
      </m.div>
    </m.div>,
    document.body,
  );
}
