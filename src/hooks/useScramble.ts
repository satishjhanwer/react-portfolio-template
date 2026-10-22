import { useState, useEffect, useRef } from "react";

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&";

export function useScramble(text: string, active: boolean, duration = 900) {
  const [display, setDisplay] = useState(text);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (!active) {
      return;
    }

    const start = performance.now();
    const len = text.length;

    const finish = () => {
      cancelAnimationFrame(rafRef.current);
      setDisplay(text);
    };
    const fallback = window.setTimeout(finish, duration + 100);

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);

      const next = text
        .split("")
        .map((char, i) => {
          if (char === " ") {
            return " ";
          }
          const resolveAt = 0.05 + (i / Math.max(len - 1, 1)) * 0.85;
          return progress > resolveAt ? char : CHARS[Math.floor(Math.random() * CHARS.length)];
        })
        .join("");

      setDisplay(next);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        window.clearTimeout(fallback);
        finish();
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.clearTimeout(fallback);
    };
  }, [active, text, duration]);

  return active ? display : text;
}
