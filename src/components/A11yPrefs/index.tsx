import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { m } from "framer-motion";
import styles from "./A11yPrefs.module.css";
import { a11yPrefsCopy as copy, trustCopy } from "../../i18n/content";
import { useA11yPrefs, isDefaultPrefs, resetPrefs, setPrefs } from "../../utils/a11yPrefs";
import type { A11yPrefs as Prefs } from "../../utils/a11yPrefs";
import { THEMES, setThemeChoice, useCurrentTheme, useThemeChoice } from "../../utils/theme";
import type { ThemeChoice } from "../../utils/theme";

const THEME_CHOICES: ThemeChoice[] = ["auto", ...THEMES];

type ToggleKey = keyof typeof copy.toggles;
const TOGGLES = Object.keys(copy.toggles) as ToggleKey[];

interface A11yPrefsProps {
  onClose: () => void;
  onOpenStatement?: () => void;
}

export function A11yPrefs({ onClose, onOpenStatement }: A11yPrefsProps) {
  const id = useId();
  const prefs = useA11yPrefs();
  const themeChoice = useThemeChoice();
  const currentTheme = useCurrentTheme();
  const panelRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const [returnFocus] = useState(() => document.activeElement as HTMLElement | null);

  useEffect(() => {
    titleRef.current?.focus();
    return () => returnFocus?.focus({ preventScroll: true });
  }, [returnFocus]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Element | null;
      if (panelRef.current?.contains(target)) {
        return;
      }
      if (target?.closest("[data-a11y-prefs-trigger]")) {
        return;
      }
      onClose();
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [onClose]);

  const toggle = (key: ToggleKey) => setPrefs({ [key]: !prefs[key] } as Partial<Prefs>);

  return createPortal(
    <m.div
      ref={panelRef}
      role="dialog"
      aria-modal="false"
      aria-labelledby={`${id}-title`}
      className={styles.panel}
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      data-lenis-prevent>
      <header className={styles.header}>
        <h2 id={`${id}-title`} ref={titleRef} tabIndex={-1} className={styles.title}>
          {copy.title}
        </h2>
        <button type="button" className={styles.close} aria-label={copy.close} onClick={onClose}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M6 6l12 12M18 6 6 18" />
          </svg>
        </button>
      </header>
      <p className={styles.intro}>{copy.intro}</p>

      <fieldset className={styles.fieldset} aria-describedby={`${id}-theme-hint`}>
        <legend className={styles.legend}>{copy.theme.legend}</legend>
        <div className={styles.themes}>
          {THEME_CHOICES.map((choice) => (
            <label key={choice} className={styles.themeOption}>
              <input
                type="radio"
                name={`${id}-theme`}
                value={choice}
                checked={themeChoice === choice}
                onChange={() => setThemeChoice(choice)}
              />
              <span className={styles.themeCard}>
                <span className={styles.swatch} data-swatch={choice} aria-hidden="true" />
                {choice === "auto" ? copy.theme.auto : copy.theme.names[choice]}
              </span>
            </label>
          ))}
        </div>
        <p id={`${id}-theme-hint`} className={styles.hint}>
          {copy.theme.autoHint(copy.theme.names[currentTheme])}
        </p>
      </fieldset>

      <fieldset className={styles.fieldset}>
        <legend className={styles.legend}>{copy.textSize.legend}</legend>
        <div className={styles.segmented}>
          {copy.textSize.options.map((o) => (
            <label key={o.value} className={styles.segment}>
              <input
                type="radio"
                name={`${id}-size`}
                value={o.value}
                checked={prefs.textSize === o.value}
                onChange={() => setPrefs({ textSize: o.value })}
              />
              <span>{o.label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <ul className={styles.toggles}>
        {TOGGLES.map((key) => (
          <li key={key}>
            <label className={styles.toggle}>
              <span className={styles.toggleText}>
                <span className={styles.toggleLabel}>{copy.toggles[key].label}</span>
                <span id={`${id}-${key}-desc`} className={styles.toggleDesc}>
                  {copy.toggles[key].desc}
                </span>
              </span>
              <input
                type="checkbox"
                role="switch"
                className={styles.switch}
                checked={prefs[key]}
                onChange={() => toggle(key)}
                aria-describedby={`${id}-${key}-desc`}
              />
            </label>
          </li>
        ))}
      </ul>

      <fieldset className={styles.fieldset} aria-describedby={`${id}-cv-hint`}>
        <legend className={styles.legend}>{copy.vision.legend}</legend>
        <p id={`${id}-cv-hint`} className={styles.hint}>
          {copy.vision.hint}
        </p>
        <div className={styles.radios}>
          {copy.vision.options.map((o) => (
            <label key={o.value} className={styles.radio}>
              <input
                type="radio"
                name={`${id}-vision`}
                value={o.value}
                checked={prefs.colorVision === o.value}
                onChange={() => setPrefs({ colorVision: o.value })}
              />
              <span>{o.label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <button type="button" className={styles.reset} onClick={resetPrefs} disabled={isDefaultPrefs(prefs)}>
        {copy.reset}
      </button>
      {onOpenStatement && (
        <button type="button" className={styles.statement} onClick={onOpenStatement}>
          {trustCopy.prefsLink}
        </button>
      )}
    </m.div>,
    document.body,
  );
}
