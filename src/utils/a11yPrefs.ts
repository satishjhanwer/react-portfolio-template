import { useSyncExternalStore } from "react";
import type { ColorVision, TextSize } from "../types";

export interface A11yPrefs {
  textSize: TextSize;
  highContrast: boolean;
  readableFont: boolean;
  reduceMotion: boolean;
  systemCursor: boolean;
  underlineLinks: boolean;
  colorVision: ColorVision;
}

export const DEFAULT_PREFS: A11yPrefs = {
  textSize: "100",
  highContrast: false,
  readableFont: false,
  reduceMotion: false,
  systemCursor: false,
  underlineLinks: false,
  colorVision: "none",
};

const STORAGE_KEY = "a11y-prefs";
const TEXT_SIZES: TextSize[] = ["100", "115", "130"];
const VISIONS: ColorVision[] = ["none", "protanopia", "deuteranopia", "tritanopia", "achromatopsia"];

function read(): A11yPrefs {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
    return {
      textSize: TEXT_SIZES.includes(raw.textSize) ? raw.textSize : "100",
      highContrast: raw.highContrast === true,
      readableFont: raw.readableFont === true,
      reduceMotion: raw.reduceMotion === true,
      systemCursor: raw.systemCursor === true,
      underlineLinks: raw.underlineLinks === true,
      colorVision: VISIONS.includes(raw.colorVision) ? raw.colorVision : "none",
    };
  } catch {
    return { ...DEFAULT_PREFS };
  }
}

function save(p: A11yPrefs) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
  } catch {
    return;
  }
}

function setAttr(name: string, value: string | null) {
  const root = document.documentElement;
  if (value === null) {
    root.removeAttribute(name);
  } else {
    root.setAttribute(name, value);
  }
}

function applyPrefs(p: A11yPrefs) {
  setAttr("data-text-size", p.textSize === "100" ? null : p.textSize);
  setAttr("data-contrast", p.highContrast ? "high" : null);
  setAttr("data-font", p.readableFont ? "readable" : null);
  setAttr("data-motion", p.reduceMotion ? "reduce" : null);
  setAttr("data-cursor", p.systemCursor ? "system" : null);
  setAttr("data-links", p.underlineLinks ? "underline" : null);
  setAttr("data-vision", p.colorVision === "none" ? null : p.colorVision);
}

let fontRequested = false;
function loadReadableFont() {
  if (fontRequested) {
    return;
  }
  fontRequested = true;
  void import("@fontsource/atkinson-hyperlegible/latin-400.css");
  void import("@fontsource/atkinson-hyperlegible/latin-700.css");
}

let prefs: A11yPrefs = read();
const listeners = new Set<() => void>();

export function getPrefs() {
  return prefs;
}

export function subscribePrefs(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function setPrefs(patch: Partial<A11yPrefs>) {
  prefs = { ...prefs, ...patch };
  save(prefs);
  applyPrefs(prefs);
  if (prefs.readableFont) {
    loadReadableFont();
  }
  listeners.forEach((l) => l());
}

export function resetPrefs() {
  setPrefs({ ...DEFAULT_PREFS });
}

export function isDefaultPrefs(p: A11yPrefs) {
  return (Object.keys(DEFAULT_PREFS) as (keyof A11yPrefs)[]).every((k) => p[k] === DEFAULT_PREFS[k]);
}

export function prefersReducedMotion() {
  return prefs.reduceMotion || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function initPrefs() {
  applyPrefs(prefs);
  if (prefs.readableFont) {
    loadReadableFont();
  }
}

export function useA11yPrefs() {
  return useSyncExternalStore(subscribePrefs, getPrefs);
}
