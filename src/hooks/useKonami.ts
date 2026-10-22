import { useEffect } from "react";
import { konamiSequence } from "../i18n/content";
import { isEditableTarget } from "../utils/dom";

export function useKonami(onTrigger: () => void) {
  useEffect(() => {
    let index = 0;
    const onKey = (e: KeyboardEvent) => {
      if (isEditableTarget(e.target)) {
        return;
      }
      const key = e.key.toLowerCase();
      if (key === konamiSequence[index].toLowerCase()) {
        index++;
      } else {
        index = key === konamiSequence[0].toLowerCase() ? 1 : 0;
      }
      if (index === konamiSequence.length) {
        index = 0;
        onTrigger();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onTrigger]);
}
