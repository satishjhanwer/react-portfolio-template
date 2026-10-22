import { useState, useEffect, useRef } from "react";
import { m, AnimatePresence } from "framer-motion";
import styles from "./Nav.module.css";
import {
  availability,
  availabilityLinkSuffix,
  a11yPrefsTrigger,
  commandPalette,
  navLinks,
  navMenuLabel,
  site,
  availabilityFull,
} from "../../i18n/content";
import { scrollToSection, modKeyLabel } from "../../utils/dom";
import { useBodyClass } from "../../hooks/useBodyClass";
import { LanguageSwitcher } from "../LanguageSwitcher";

const MIN_LINKS_GAP = 24;

interface NavProps {
  onOpenPalette: () => void;
  onPreloadPalette: () => void;
  prefsOpen: boolean;
  onTogglePrefs: () => void;
  onPreloadPrefs: () => void;
}

export function Nav({ onOpenPalette, onPreloadPalette, prefsOpen, onTogglePrefs, onPreloadPrefs }: NavProps) {
  const [open, setOpen] = useState(false);
  const [compact, setCompact] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const linksRef = useRef<HTMLUListElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);

  const scrollTo = (id: string) => {
    setOpen(false);
    setTimeout(() => scrollToSection(id), 50);
  };

  useBodyClass("no-scroll", open);

  useEffect(() => {
    const nav = navRef.current;
    const logo = logoRef.current;
    const links = linksRef.current;
    const actions = actionsRef.current;
    if (!nav || !logo || !links || !actions) {
      return;
    }
    const measure = () => {
      const style = getComputedStyle(nav);
      const available =
        nav.clientWidth -
        parseFloat(style.paddingLeft) -
        parseFloat(style.paddingRight) -
        logo.offsetWidth -
        actions.offsetWidth -
        MIN_LINKS_GAP * 2;
      setCompact(links.scrollWidth > available);
    };
    const observer = new ResizeObserver(measure);
    observer.observe(nav);
    observer.observe(links);
    observer.observe(actions);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <m.nav
        ref={navRef}
        className={styles.nav}
        data-compact={compact || undefined}
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}>
        <div ref={logoRef} className={styles.logo} aria-label={site.name}>
          {site.initials}
          <span className={styles.logoCursor}>{site.logoCursor}</span>
        </div>

        <ul ref={linksRef} className={styles.links}>
          {navLinks.map((l) => (
            <li key={l.id}>
              <button className={styles.link} onClick={() => scrollTo(l.id)}>
                {l.label}
              </button>
            </li>
          ))}
        </ul>

        <div ref={actionsRef} className={styles.actions}>
          {availability.open && (
            <button type="button" className={styles.status} onClick={() => scrollTo(availability.target)}>
              <span className={styles.dot} aria-hidden="true" />
              {availability.compact}
              <span className="sr-only">{availabilityLinkSuffix}</span>
            </button>
          )}

          <LanguageSwitcher />

          <button
            type="button"
            className={styles.prefsTrigger}
            onClick={onTogglePrefs}
            onPointerEnter={onPreloadPrefs}
            onFocus={onPreloadPrefs}
            aria-label={a11yPrefsTrigger}
            aria-expanded={prefsOpen}
            aria-haspopup="dialog"
            data-a11y-prefs-trigger="">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="12" cy="4.5" r="2" />
              <path d="M5 8.5l7 1.5 7-1.5M12 10v4.5M12 14.5l-3.5 6M12 14.5l3.5 6" />
            </svg>
          </button>

          <button
            type="button"
            className={styles.paletteTrigger}
            onClick={onOpenPalette}
            onPointerEnter={onPreloadPalette}
            onFocus={onPreloadPalette}
            aria-keyshortcuts={modKeyLabel === "⌘" ? "Meta+K" : "Control+K"}>
            <svg className={styles.paletteIcon} viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
            <span className={styles.paletteText}>{commandPalette.triggerText}</span>
            <kbd className={styles.paletteKbd} aria-hidden="true">
              {modKeyLabel}
              {modKeyLabel === "⌘" ? "" : " "}K
            </kbd>
          </button>

          <button
            className={styles.hamburger}
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? navMenuLabel.close : navMenuLabel.open}
            aria-expanded={open}>
            <span className={`${styles.bar} ${open ? styles.barTopOpen : ""}`} />
            <span className={`${styles.bar} ${open ? styles.barMidOpen : ""}`} />
            <span className={`${styles.bar} ${open ? styles.barBotOpen : ""}`} />
          </button>
        </div>
      </m.nav>

      <AnimatePresence>
        {open && (
          <>
            <m.div
              className={styles.backdrop}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setOpen(false)}
            />
            <m.div
              className={styles.drawer}
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.28, ease: "easeInOut" }}>
              {availability.open && (
                <button type="button" className={styles.drawerStatus} onClick={() => scrollTo(availability.target)}>
                  <span className={styles.dot} aria-hidden="true" />
                  {availabilityFull}
                  <span className="sr-only">{availabilityLinkSuffix}</span>
                </button>
              )}
              <ul className={styles.drawerLinks}>
                {navLinks.map((l, i) => (
                  <m.li
                    key={l.id}
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.08 + i * 0.05 }}>
                    <button className={styles.drawerLink} onClick={() => scrollTo(l.id)}>
                      {l.label}
                    </button>
                  </m.li>
                ))}
              </ul>
            </m.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
