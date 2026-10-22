import { useEffect, useId, useRef } from "react";
import type { KeyboardEvent } from "react";
import { createPortal } from "react-dom";
import { m } from "framer-motion";
import type Lenis from "lenis";
import styles from "./RecruiterMode.module.css";
import {
  availability,
  email,
  experienceNodes,
  recruiter,
  resumeUrl,
  site,
  socials,
  availabilityFull,
} from "../../i18n/content";
import type { RecruiterLink } from "../../types";
import { RichText } from "../RichText";
import { useModal } from "../../hooks/useModal";
import { trapTab } from "../../utils/dom";

interface RecruiterModeProps {
  onClose: () => void;
  getLenis: () => Lenis | null;
}

interface ResolvedLink {
  href: string;
  download?: boolean;
  external?: boolean;
}

function resolveLink(link: RecruiterLink): ResolvedLink | null {
  switch (link.kind) {
    case "resume":
      return resumeUrl ? { href: resumeUrl, download: true } : null;
    case "email":
      return { href: `mailto:${email}` };
    case "social": {
      const s = socials.find((x) => x.label === link.social);
      return s ? { href: s.href, external: true } : null;
    }
  }
}

const links = recruiter.links.flatMap((link) => {
  const resolved = resolveLink(link);
  return resolved ? [{ ...link, ...resolved }] : [];
});

const roles = experienceNodes.slice(0, recruiter.careerCount);

export function RecruiterMode({ onClose, getLenis }: RecruiterModeProps) {
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
      transition={{ duration: 0.18 }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      data-lenis-prevent>
      <m.div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={styles.panel}
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.98 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        onKeyDown={onKeyDown}>
        <header className={styles.header}>
          <span className={styles.eyebrow}>{recruiter.eyebrow}</span>
          <button
            ref={closeRef}
            type="button"
            className={styles.close}
            aria-label={recruiter.closeLabel}
            onClick={onClose}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
          </button>
        </header>

        <div className={styles.identity}>
          <h2 id={titleId} className={styles.name}>
            {site.name}
          </h2>
          <p className={styles.headline}>{recruiter.headline}</p>
          <ul className={styles.meta}>
            {availability.open && (
              <li className={styles.available}>
                <span className={styles.dot} aria-hidden="true" />
                {availabilityFull}
              </li>
            )}
            {recruiter.location && <li>{recruiter.location}</li>}
            {recruiter.meta.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        <section className={styles.block} aria-labelledby={`${titleId}-hl`}>
          <h3 id={`${titleId}-hl`} className={styles.blockTitle}>
            {recruiter.highlightsTitle}
          </h3>
          <ul className={styles.highlights}>
            {recruiter.highlightsHtml.map((html, i) => (
              <m.li
                key={html}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.12 + i * 0.05 }}>
                <RichText html={html} />
              </m.li>
            ))}
          </ul>
        </section>

        <div className={styles.columns}>
          <section className={styles.block} aria-labelledby={`${titleId}-st`}>
            <h3 id={`${titleId}-st`} className={styles.blockTitle}>
              {recruiter.stackTitle}
            </h3>
            <ul className={styles.stack}>
              {recruiter.stack.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </section>

          <section className={styles.block} aria-labelledby={`${titleId}-cr`}>
            <h3 id={`${titleId}-cr`} className={styles.blockTitle}>
              {recruiter.careerTitle}
            </h3>
            <ol className={styles.roles}>
              {roles.map((r) => (
                <li key={`${r.org}-${r.year}`}>
                  <span className={styles.role}>{r.role}</span>
                  <span className={styles.org}>
                    {r.org} · {r.year}
                  </span>
                </li>
              ))}
            </ol>
          </section>
        </div>

        <footer className={styles.footer}>
          <div className={styles.links}>
            {links.map((l) => (
              <a
                key={l.label}
                href={l.href}
                className={l.primary ? styles.btnPrimary : styles.btnGhost}
                download={l.download ? "" : undefined}
                target={l.external ? "_blank" : undefined}
                rel={l.external ? "noopener noreferrer" : undefined}>
                {l.label}
                {l.external && <span aria-hidden="true"> ↗</span>}
              </a>
            ))}
          </div>
          <button type="button" className={styles.full} onClick={onClose}>
            {recruiter.fullPortfolio} <span aria-hidden="true">→</span>
          </button>
        </footer>
      </m.div>
    </m.div>,
    document.body,
  );
}
