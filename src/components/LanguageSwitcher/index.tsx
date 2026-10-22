import { languageCopy, languageNames } from "../../i18n/content";
import { locale, switchLocale } from "../../i18n/locale";
import { locales } from "../../site.config";
import type { Locale } from "../../types";
import styles from "./LanguageSwitcher.module.css";

export function LanguageSwitcher() {
  return (
    <div className={styles.switcher}>
      <span className={styles.code} aria-hidden="true">
        {locale}
      </span>
      <svg className={styles.chevron} viewBox="0 0 12 12" aria-hidden="true">
        <path d="M3 4.5 6 7.5 9 4.5" />
      </svg>
      <select
        className={styles.select}
        aria-label={languageCopy.label}
        value={locale}
        onChange={(e) => switchLocale(e.target.value as Locale)}>
        {locales.map((l) => (
          <option key={l} value={l} lang={l}>
            {languageNames[l]}
          </option>
        ))}
      </select>
    </div>
  );
}
