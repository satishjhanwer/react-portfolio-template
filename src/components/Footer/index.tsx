import styles from "./Footer.module.css";
import { colophonCopy, languageCopy, shortcutsCopy, socials, site, trustCopy } from "../../i18n/content";
import type { AppCommand } from "../CommandPalette/commands";
import { locale, switchLocale } from "../../i18n/locale";
import { VitalsBadge } from "./VitalsBadge";
import { InstallButton } from "./InstallButton";

interface FooterProps {
  onCommand?: (command: AppCommand) => void;
}

const LINKS: { command: AppCommand; label: string }[] = [
  { command: "open-trust", label: trustCopy.footerLink },
  { command: "open-shortcuts", label: shortcutsCopy.footerLink },
  { command: "open-colophon", label: colophonCopy.footerLink },
];

export function Footer({ onCommand }: FooterProps) {
  return (
    <footer className={styles.footer}>
      <span className={styles.left}>{site.tagline}</span>

      <div className={styles.socials}>
        {socials.map((s) => (
          <a
            key={s.label}
            href={s.href}
            className={styles.socialLink}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={s.label}>
            <svg width={20} height={20} aria-hidden="true">
              <use href={`#${s.icon}`} />
            </svg>
          </a>
        ))}
      </div>

      <div className={styles.meta}>
        <span className={styles.right}>
          {site.name} © {new Date().getFullYear()}
        </span>
        {locale !== "en" && languageCopy.disclaimer && (
          <p className={styles.translationNote} lang={locale}>
            {languageCopy.disclaimer}{" "}
            <button type="button" className={styles.translationLink} lang="en" onClick={() => switchLocale("en")}>
              {languageCopy.readInEnglish}
            </button>
          </p>
        )}
        {onCommand && (
          <ul className={styles.links}>
            {LINKS.map((l) => (
              <li key={l.command}>
                <button type="button" className={styles.link} onClick={() => onCommand(l.command)}>
                  {l.label}
                </button>
              </li>
            ))}
          </ul>
        )}
        <div className={styles.metaRow}>
          <InstallButton />
          <VitalsBadge />
        </div>
      </div>
    </footer>
  );
}
