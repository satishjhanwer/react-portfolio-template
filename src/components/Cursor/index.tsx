import { useEffect, useState } from "react";
import { m, useMotionValue, useSpring } from "framer-motion";
import styles from "./Cursor.module.css";
import { useBodyClass } from "../../hooks/useBodyClass";
import { useA11yPrefs } from "../../utils/a11yPrefs";

function useIsTouch() {
  const [touch] = useState(() => window.matchMedia("(hover: none)").matches);
  return touch;
}

export function Cursor() {
  const isTouch = useIsTouch();
  const { systemCursor } = useA11yPrefs();
  const disabled = isTouch || systemCursor;
  const [hovered, setHovered] = useState(false);
  const [visible, setVisible] = useState(false);

  const mx = useMotionValue(-100);
  const my = useMotionValue(-100);

  const springCfg = { damping: 26, stiffness: 160, mass: 0.3 };
  const rx = useSpring(mx, springCfg);
  const ry = useSpring(my, springCfg);

  useBodyClass("cursor-none", !disabled);

  useEffect(() => {
    if (disabled) {
      return;
    }

    const onMove = (e: MouseEvent) => {
      mx.set(e.clientX);
      my.set(e.clientY);
      if (!visible) {
        setVisible(true);
      }
    };

    const onOver = (e: MouseEvent) => {
      const el = e.target as Element | null;
      setHovered(!!el?.closest("a, button, [role='button'], input, textarea, select"));
    };

    const onLeave = () => setVisible(false);
    const onEnter = () => setVisible(true);

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseover", onOver);
    document.documentElement.addEventListener("mouseleave", onLeave);
    document.documentElement.addEventListener("mouseenter", onEnter);

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseover", onOver);
      document.documentElement.removeEventListener("mouseleave", onLeave);
      document.documentElement.removeEventListener("mouseenter", onEnter);
    };
  }, [disabled, mx, my, visible]);

  if (disabled) {
    return null;
  }

  return (
    <>
      <m.div
        className={`${styles.ring} ${hovered ? styles.ringHover : ""}`}
        style={{
          x: rx,
          y: ry,
          translateX: "-50%",
          translateY: "-50%",
          opacity: visible ? 1 : 0,
        }}
      />
      <m.div
        className={styles.dot}
        style={{
          x: mx,
          y: my,
          translateX: "-50%",
          translateY: "-50%",
          opacity: visible ? 1 : 0,
        }}
      />
    </>
  );
}
