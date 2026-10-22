import styles from "./Footer.module.css";
import { pwaCopy } from "../../i18n/content";
import { usePwa, promptInstall } from "../../utils/pwa";

export function InstallButton() {
  const { canInstall } = usePwa();
  if (!canInstall) {
    return null;
  }
  return (
    <button type="button" className={styles.install} onClick={() => void promptInstall()} title={pwaCopy.installHint}>
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 4v11M7 10l5 5 5-5M5 20h14" />
      </svg>
      {pwaCopy.install}
    </button>
  );
}
