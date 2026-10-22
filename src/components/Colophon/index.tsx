import { useEffect, useId, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import { createPortal } from "react-dom";
import { m } from "framer-motion";
import type Lenis from "lenis";
import sheet from "../Shortcuts/Shortcuts.module.css";
import trust from "../Trust/Trust.module.css";
import styles from "./Colophon.module.css";
import { colophonCopy as copy } from "../../i18n/content";
import { locale } from "../../i18n/locale";
import { useModal } from "../../hooks/useModal";
import { trapTab } from "../../utils/dom";

interface BuildInfo {
  builtAt: string;
  js: { initialKb: number; initialFiles: number; lazyKb: number; lazyFiles: number } | null;
  stack: { name: string; version: string }[];
}

type State = { status: "loading" } | { status: "error" } | { status: "ready"; info: BuildInfo };

interface ColophonProps {
  onClose: () => void;
  getLenis: () => Lenis | null;
}

const formatDate = (iso: string) =>
  new Intl.DateTimeFormat(locale, { dateStyle: "long", timeZone: "UTC" }).format(new Date(`${iso}T00:00:00Z`));

export function Colophon({ onClose, getLenis }: ColophonProps) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const [state, setState] = useState<State>({ status: "loading" });
  useModal(getLenis);

  useEffect(() => {
    closeRef.current?.focus();
    let cancelled = false;
    fetch("/build-info.json")
      .then((res) => (res.ok ? (res.json() as Promise<BuildInfo>) : Promise.reject(new Error(String(res.status)))))
      .then((info) => !cancelled && setState({ status: "ready", info }))
      .catch(() => !cancelled && setState({ status: "error" }));
    return () => {
      cancelled = true;
    };
  }, []);

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    } else {
      trapTab(e, panelRef.current);
    }
  };

  const number = new Intl.NumberFormat(locale);

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
        aria-busy={state.status === "loading"}
        className={`${sheet.panel} ${trust.panel}`}
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
        <p className={trust.text}>{copy.intro}</p>

        <div role="status">
          {state.status === "loading" && <p className={trust.status}>{copy.loading}</p>}
          {state.status === "error" && <p className={trust.status}>{copy.error}</p>}
        </div>

        {state.status === "ready" && (
          <>
            {state.info.js && (
              <>
                <h3 className={trust.subheading}>{copy.sizeTitle}</h3>
                <p className={styles.big}>
                  {copy.initialJs(number.format(state.info.js.initialKb), state.info.js.initialFiles)}
                </p>
                <p className={trust.text}>
                  {copy.lazyJs(number.format(state.info.js.lazyKb), state.info.js.lazyFiles)} {copy.vitals}
                </p>
              </>
            )}

            {state.info.stack.length > 0 && (
              <>
                <h3 className={trust.subheading}>{copy.stackTitle}</h3>
                <ul className={styles.stack}>
                  {state.info.stack.map((s) => (
                    <li key={s.name}>
                      <span>{s.name}</span> <span className={styles.version}>{s.version}</span>
                    </li>
                  ))}
                </ul>
              </>
            )}

            <h3 className={trust.subheading}>{copy.builtTitle}</h3>
            <p className={trust.text}>{copy.built(formatDate(state.info.builtAt))}</p>
          </>
        )}
      </m.div>
    </m.div>,
    document.body,
  );
}
