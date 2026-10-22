import { m } from "framer-motion";
import styles from "./UpdateToast.module.css";
import { pwaCopy } from "../../i18n/content";
import { applyUpdate, dismissUpdate } from "../../utils/pwa";

export function UpdateToast() {
  return (
    <m.div
      role="status"
      aria-live="polite"
      className={styles.toast}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 16 }}
      transition={{ duration: 0.2, ease: "easeOut" }}>
      <div className={styles.text}>
        <p className={styles.title}>{pwaCopy.updateTitle}</p>
        <p className={styles.body}>{pwaCopy.updateBody}</p>
      </div>
      <button type="button" className={styles.refresh} onClick={applyUpdate}>
        {pwaCopy.refresh}
      </button>
      <button type="button" className={styles.dismiss} aria-label={pwaCopy.dismiss} onClick={dismissUpdate}>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M6 6l12 12M18 6 6 18" />
        </svg>
      </button>
    </m.div>
  );
}
