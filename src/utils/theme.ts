import { useSyncExternalStore } from "react";

export const THEMES = ["copper", "night", "sakura"] as const;
export type Theme = (typeof THEMES)[number];
export type ThemeChoice = "auto" | Theme;

const STORAGE_KEY = "theme";
const QUERY_PARAM = "theme";

const isTheme = (value: unknown): value is Theme => THEMES.includes(value as Theme);

export function themeForHour(hour: number): Theme {
  return hour < 8 ? "sakura" : hour < 16 ? "copper" : "night";
}

function readSaved(): ThemeChoice {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return isTheme(value) ? value : "auto";
  } catch {
    return "auto";
  }
}

let choice: ThemeChoice = readSaved();
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

export function applyTheme(next: ThemeChoice, now = new Date()) {
  const root = document.documentElement;
  if (next !== "auto") {
    root.setAttribute("data-theme", next);
    return;
  }
  const t = themeForHour(now.getHours());
  if (t === "copper") {
    root.removeAttribute("data-theme");
  } else {
    root.setAttribute("data-theme", t);
  }
}

export function getThemeChoice() {
  return choice;
}

export function currentTheme(): Theme {
  const attr = document.documentElement.getAttribute("data-theme");
  return isTheme(attr) ? attr : "copper";
}

function save(next: ThemeChoice) {
  try {
    if (next === "auto") {
      localStorage.removeItem(STORAGE_KEY);
    } else {
      localStorage.setItem(STORAGE_KEY, next);
    }
  } catch {
    return;
  }
}

export function setThemeChoice(next: ThemeChoice) {
  choice = next;
  save(next);
  const url = new URL(window.location.href);
  if (url.searchParams.has(QUERY_PARAM)) {
    url.searchParams.delete(QUERY_PARAM);
    window.history.replaceState(window.history.state, "", url);
  }
  applyTheme(next);
  emit();
}

export function subscribeTheme(listener: () => void) {
  listeners.add(listener);
  const observer = new MutationObserver(listener);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => {
    listeners.delete(listener);
    observer.disconnect();
  };
}

export function useThemeChoice() {
  return useSyncExternalStore(subscribeTheme, getThemeChoice);
}

export function useCurrentTheme() {
  return useSyncExternalStore(subscribeTheme, currentTheme);
}
