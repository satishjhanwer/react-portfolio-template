import { locales } from "../site.config";
import type { Locale } from "../types";

export const defaultLocale: Locale = "en";

const STORAGE_KEY = "lang";
const QUERY_PARAM = "lang";

function isLocale(value: string | null | undefined): value is Locale {
  return locales.includes(value as Locale);
}

function fromQuery() {
  const value = new URLSearchParams(window.location.search).get(QUERY_PARAM);
  return isLocale(value) ? value : null;
}

function fromStorage() {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return isLocale(value) ? value : null;
  } catch {
    return null;
  }
}

function fromBrowser() {
  const tags = navigator.languages?.length ? navigator.languages : [navigator.language];
  for (const tag of tags) {
    const base = tag?.toLowerCase().split("-")[0];
    if (isLocale(base)) {
      return base;
    }
  }
  return null;
}

export const locale: Locale = fromQuery() ?? fromStorage() ?? fromBrowser() ?? defaultLocale;

document.documentElement.lang = locale;

export function switchLocale(next: Locale) {
  if (next === locale) {
    return;
  }
  try {
    localStorage.setItem(STORAGE_KEY, next);
  } catch {
    return;
  }
  const url = new URL(window.location.href);
  if (url.searchParams.has(QUERY_PARAM)) {
    url.searchParams.set(QUERY_PARAM, next);
    window.history.replaceState(window.history.state, "", url);
  }
  window.location.reload();
}
