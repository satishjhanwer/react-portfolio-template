import { useCallback, useEffect, useRef, useState } from "react";
import type Lenis from "lenis";
import { useBodyClass } from "./useBodyClass";

export function useModal(getLenis: () => Lenis | null) {
  const [returnFocus] = useState(() => document.activeElement as HTMLElement | null);
  const afterCloseRef = useRef<(() => void) | null>(null);

  useBodyClass("no-scroll", true);

  useEffect(() => {
    const lenis = getLenis();
    const root = document.getElementById("root");
    lenis?.stop();
    if (root) {
      root.inert = true;
    }

    return () => {
      lenis?.start();
      if (root) {
        root.inert = false;
      }
      returnFocus?.focus({ preventScroll: true });
      const after = afterCloseRef.current;
      afterCloseRef.current = null;
      if (after) {
        requestAnimationFrame(after);
      }
    };
  }, [getLenis, returnFocus]);

  const runAfterClose = useCallback((fn: (() => void) | null) => {
    afterCloseRef.current = fn;
  }, []);

  return { runAfterClose };
}
