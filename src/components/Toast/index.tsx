import { AnimatePresence, m } from "framer-motion";
import styles from "./Toast.module.css";

export interface ToastMessage {
  id: number;
  text: string;
}

export function Toast({ toast }: { toast: ToastMessage | null }) {
  return (
    <div className={styles.region} role="status" aria-live="polite">
      <AnimatePresence>
        {toast && (
          <m.div
            key={toast.id}
            className={styles.toast}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.25 }}>
            {toast.text}
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}
