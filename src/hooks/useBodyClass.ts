import { useEffect } from "react";

export function useBodyClass(className: string, active: boolean) {
  useEffect(() => {
    if (!active) {
      return;
    }
    document.body.classList.add(className);
    return () => document.body.classList.remove(className);
  }, [className, active]);
}
