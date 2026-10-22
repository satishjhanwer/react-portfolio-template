import { useCallback, useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { m, useMotionValueEvent, useReducedMotionConfig, useScroll } from "framer-motion";
import { TimelineEntry } from "../TimelineEntry";
import type { TimelineEntryProps } from "../TimelineEntry";

type Accent = "cyan" | "purple";

const READ_LINE = 0.6;
const DOT_CENTER = 9;

const ACCENT_STYLE: Record<Accent, CSSProperties> = {
  cyan: {
    "--timeline-accent": "var(--cyan)",
    "--timeline-accent-glow": "var(--cyan-a20)",
  } as CSSProperties,
  purple: {
    "--timeline-accent": "var(--purple)",
    "--timeline-accent-glow": "var(--purple-a25)",
  } as CSSProperties,
};

interface TimelineListProps<T> {
  items: T[];
  inView: boolean;
  accent: Accent;
  getKey: (item: T, index: number) => string;
  getEntryProps: (item: T) => Omit<TimelineEntryProps, "index" | "inView" | "reached">;
}

export function TimelineList<T>({ items, inView, accent, getKey, getEntryProps }: TimelineListProps<T>) {
  const listRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotionConfig();
  const [reachedIndex, setReachedIndex] = useState(-1);

  const { scrollYProgress } = useScroll({
    target: listRef,
    offset: [`start ${READ_LINE * 100}%`, `end ${READ_LINE * 100}%`],
  });

  const measure = useCallback(() => {
    const list = listRef.current;
    if (!list) {
      return;
    }
    const line = window.innerHeight * READ_LINE;
    const entries = list.querySelectorAll<HTMLElement>(":scope > .timeline-entry");
    let next = -1;
    entries.forEach((el, i) => {
      if (el.getBoundingClientRect().top + DOT_CENTER <= line) {
        next = i;
      }
    });
    setReachedIndex((prev) => (prev === next ? prev : next));
  }, []);

  useMotionValueEvent(scrollYProgress, "change", measure);

  useEffect(() => {
    const id = requestAnimationFrame(measure);
    return () => cancelAnimationFrame(id);
  }, [measure]);

  const lastReached = reduceMotion ? items.length - 1 : reachedIndex;

  return (
    <div ref={listRef} className="timeline-list" style={ACCENT_STYLE[accent]}>
      <m.div className="timeline-progress" aria-hidden="true" style={{ scaleY: reduceMotion ? 1 : scrollYProgress }} />
      {items.map((item, i) => (
        <TimelineEntry
          key={getKey(item, i)}
          index={i}
          inView={inView}
          reached={i <= lastReached}
          {...getEntryProps(item)}
        />
      ))}
    </div>
  );
}
