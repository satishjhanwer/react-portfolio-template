import { useSyncExternalStore } from "react";
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export interface PwaSnapshot {
  canInstall: boolean;
  updateReady: boolean;
}

let snapshot: PwaSnapshot = { canInstall: false, updateReady: false };
const listeners = new Set<() => void>();

function emit(patch: Partial<PwaSnapshot>) {
  snapshot = { ...snapshot, ...patch };
  listeners.forEach((l) => l());
}

export function subscribePwa(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getPwaSnapshot() {
  return snapshot;
}

export function canInstallApp() {
  return snapshot.canInstall;
}

let deferredPrompt: BeforeInstallPromptEvent | null = null;
let waitingWorker: ServiceWorker | null = null;

export async function promptInstall() {
  const event = deferredPrompt;
  if (!event) {
    return;
  }
  deferredPrompt = null;
  emit({ canInstall: false });
  await event.prompt();
  await event.userChoice.catch(() => undefined);
}

export function applyUpdate() {
  if (!waitingWorker) {
    return;
  }
  let reloaded = false;
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (reloaded) {
      return;
    }
    reloaded = true;
    window.location.reload();
  });
  waitingWorker.postMessage("SKIP_WAITING");
}

export function dismissUpdate() {
  emit({ updateReady: false });
}

function trackWaiting(worker: ServiceWorker | null) {
  if (!worker || !navigator.serviceWorker.controller) {
    return;
  }
  waitingWorker = worker;
  emit({ updateReady: true });
}

function reportLoadedAssets() {
  let pending = new Set<string>();
  let timer = 0;
  const flush = () => {
    const worker = navigator.serviceWorker.controller;
    if (worker && pending.size) {
      worker.postMessage({ type: "CACHE_URLS", urls: [...pending] });
    }
    pending = new Set();
  };
  new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      const u = new URL(entry.name);
      if (u.origin === location.origin && u.pathname.startsWith("/assets/")) {
        pending.add(u.pathname);
      }
    }
    window.clearTimeout(timer);
    timer = window.setTimeout(flush, 500);
  }).observe({ type: "resource", buffered: true });
}

function whenControlled() {
  const sw = navigator.serviceWorker;
  if (sw.controller) {
    reportLoadedAssets();
  } else {
    sw.addEventListener("controllerchange", reportLoadedAssets, { once: true });
  }
}

function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) {
    return;
  }
  window.addEventListener("load", async () => {
    try {
      const reg = await navigator.serviceWorker.register("/sw.js");
      trackWaiting(reg.waiting);
      whenControlled();
      reg.addEventListener("updatefound", () => {
        const incoming = reg.installing;
        incoming?.addEventListener("statechange", () => {
          if (incoming.state === "installed") {
            trackWaiting(incoming);
          }
        });
      });
      document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "visible") {
          void reg.update();
        }
      });
    } catch {
      return;
    }
  });
}

export function initPwa() {
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e as BeforeInstallPromptEvent;
    emit({ canInstall: true });
  });
  window.addEventListener("appinstalled", () => {
    deferredPrompt = null;
    emit({ canInstall: false });
  });
  registerServiceWorker();
}

export function usePwa() {
  return useSyncExternalStore(subscribePwa, getPwaSnapshot);
}
