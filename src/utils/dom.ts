import type { KeyboardEvent as ReactKeyboardEvent } from "react";
import { prefersReducedMotion } from "./a11yPrefs";

export const isApplePlatform = typeof navigator !== "undefined" && /Mac|iPhone|iPad|iPod/i.test(navigator.userAgent);

export const modKeyLabel = isApplePlatform ? "⌘" : "Ctrl";

export function isEditableTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return false;
  }
  return (
    target.isContentEditable ||
    target.tagName === "INPUT" ||
    target.tagName === "TEXTAREA" ||
    target.tagName === "SELECT"
  );
}

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function trapTab(e: KeyboardEvent | ReactKeyboardEvent, container: HTMLElement | null) {
  if (e.key !== "Tab" || !container) {
    return;
  }
  const items = Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
    (el) => el.offsetParent !== null || el === document.activeElement,
  );
  if (items.length === 0) {
    e.preventDefault();
    return;
  }
  const first = items[0];
  const last = items[items.length - 1];
  const current = document.activeElement as HTMLElement | null;
  const inside = current ? container.contains(current) : false;

  if (e.shiftKey && (current === first || !inside)) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && (current === last || !inside)) {
    e.preventDefault();
    first.focus();
  }
}

const MAX_SETTLE_MS = 4000;
const TOLERANCE_PX = 2;
const USER_INPUT_EVENTS = ["wheel", "touchstart", "keydown", "pointerdown"];

let cancelActive: (() => void) | null = null;

const behavior = (): ScrollBehavior => (prefersReducedMotion() ? "auto" : "smooth");

export function scrollToSection(id: string) {
  cancelActive?.();

  const target = () => document.getElementById(id);
  const first = target();
  if (!first) {
    return;
  }
  first.scrollIntoView({ behavior: behavior() });

  const offset = () => {
    const el = target();
    if (!el) {
      return 0;
    }
    const margin = parseFloat(getComputedStyle(el).scrollMarginTop) || 0;
    return el.getBoundingClientRect().top - margin;
  };
  const atPageBottom = () =>
    window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - TOLERANCE_PX;

  let lastDocTop = offset() + window.scrollY;

  const reaim = () => {
    target()?.scrollIntoView({ behavior: behavior() });
  };

  const resizeObserver = new ResizeObserver(() => {
    const docTop = offset() + window.scrollY;
    if (Math.abs(docTop - lastDocTop) > TOLERANCE_PX) {
      lastDocTop = docTop;
      reaim();
    }
  });
  resizeObserver.observe(document.body);

  const onScrollEnd = () => {
    if (Math.abs(offset()) <= TOLERANCE_PX || atPageBottom()) {
      cleanup();
    } else {
      reaim();
    }
  };
  window.addEventListener("scrollend", onScrollEnd);

  const onUserInput = () => cleanup();
  for (const type of USER_INPUT_EVENTS) {
    window.addEventListener(type, onUserInput, { passive: true });
  }

  const timer = window.setTimeout(() => cleanup(), MAX_SETTLE_MS);

  function cleanup() {
    resizeObserver.disconnect();
    window.removeEventListener("scrollend", onScrollEnd);
    for (const type of USER_INPUT_EVENTS) {
      window.removeEventListener(type, onUserInput);
    }
    window.clearTimeout(timer);
    if (cancelActive === cleanup) {
      cancelActive = null;
    }
  }

  cancelActive = cleanup;
}

export function scrollToSectionWhenReady(id: string, timeoutMs = 6000) {
  if (document.getElementById(id)) {
    scrollToSection(id);
    return () => {};
  }
  const observer = new MutationObserver(() => {
    if (!document.getElementById(id)) {
      return;
    }
    stop();
    scrollToSection(id);
  });
  const timer = window.setTimeout(() => stop(), timeoutMs);
  function stop() {
    observer.disconnect();
    window.clearTimeout(timer);
  }
  observer.observe(document.body, { childList: true, subtree: true });
  return stop;
}
