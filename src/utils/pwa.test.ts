import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { stubLocation } from "../test/helpers";

class FakeWorker extends EventTarget {
  state = "installing";
  postMessage = vi.fn();
  install() {
    this.state = "installed";
    this.dispatchEvent(new Event("statechange"));
  }
}

class FakeRegistration extends EventTarget {
  waiting: FakeWorker | null = null;
  installing: FakeWorker | null = null;
  update = vi.fn(() => Promise.resolve());
}

class FakeContainer extends EventTarget {
  controller: FakeWorker | null = null;
  registration = new FakeRegistration();
  register = vi.fn(() => Promise.resolve(this.registration));
}

let container: FakeContainer;
let resourceCallback: ((list: { getEntries: () => { name: string }[] }) => void) | null;

async function loadPwa() {
  vi.resetModules();
  return import("./pwa");
}

async function startAndLoad() {
  const pwa = await loadPwa();
  pwa.initPwa();
  window.dispatchEvent(new Event("load"));
  await vi.waitFor(() => expect(container.register).toHaveBeenCalledWith("/sw.js"));
  await Promise.resolve();
  return pwa;
}

beforeEach(() => {
  container = new FakeContainer();
  Object.defineProperty(navigator, "serviceWorker", { value: container, configurable: true });
  resourceCallback = null;
  vi.stubGlobal(
    "PerformanceObserver",
    class {
      constructor(cb: typeof resourceCallback) {
        resourceCallback = cb;
      }
      observe() {}
    },
  );
});

afterEach(() => {
  delete (navigator as { serviceWorker?: unknown }).serviceWorker;
});

describe("install prompt", () => {
  function installPrompt(outcome: Promise<{ outcome: string }> = Promise.resolve({ outcome: "accepted" })) {
    const event = Object.assign(new Event("beforeinstallprompt", { cancelable: true }), {
      prompt: vi.fn(() => Promise.resolve()),
      userChoice: outcome,
    });
    window.dispatchEvent(event);
    return event;
  }

  it("captures the browser prompt and offers install", async () => {
    const pwa = await loadPwa();
    pwa.initPwa();
    const event = installPrompt();
    expect(event.defaultPrevented).toBe(true);
    expect(pwa.canInstallApp()).toBe(true);
  });

  it("shows the prompt once, then hides the install entry", async () => {
    const pwa = await loadPwa();
    pwa.initPwa();
    const event = installPrompt();
    await pwa.promptInstall();
    expect(event.prompt).toHaveBeenCalledOnce();
    expect(pwa.canInstallApp()).toBe(false);
    await pwa.promptInstall();
    expect(event.prompt).toHaveBeenCalledOnce();
  });

  it("survives a rejected user choice", async () => {
    const pwa = await loadPwa();
    pwa.initPwa();
    installPrompt(Promise.reject(new Error("dismissed")));
    await expect(pwa.promptInstall()).resolves.toBeUndefined();
  });

  it("hides the entry once installed", async () => {
    const pwa = await loadPwa();
    pwa.initPwa();
    installPrompt();
    window.dispatchEvent(new Event("appinstalled"));
    expect(pwa.canInstallApp()).toBe(false);
  });
});

describe("service worker", () => {
  it("skips registration when service workers aren't supported", async () => {
    delete (navigator as { serviceWorker?: unknown }).serviceWorker;
    const pwa = await loadPwa();
    pwa.initPwa();
    window.dispatchEvent(new Event("load"));
    expect(container.register).not.toHaveBeenCalled();
  });

  it("swallows a failed registration", async () => {
    container.register.mockRejectedValueOnce(new Error("blocked"));
    const pwa = await loadPwa();
    pwa.initPwa();
    window.dispatchEvent(new Event("load"));
    await vi.waitFor(() => expect(container.register).toHaveBeenCalled());
    expect(pwa.getPwaSnapshot().updateReady).toBe(false);
  });

  it("offers an update that was already waiting", async () => {
    container.controller = new FakeWorker();
    container.registration.waiting = new FakeWorker();
    const pwa = await startAndLoad();
    expect(pwa.getPwaSnapshot().updateReady).toBe(true);
  });

  it("doesn't offer an update on the very first install", async () => {
    container.registration.waiting = new FakeWorker();
    const pwa = await startAndLoad();
    expect(pwa.getPwaSnapshot().updateReady).toBe(false);
  });

  it("offers an update found while the page is open", async () => {
    container.controller = new FakeWorker();
    const pwa = await startAndLoad();
    const incoming = new FakeWorker();
    container.registration.installing = incoming;
    container.registration.dispatchEvent(new Event("updatefound"));
    incoming.dispatchEvent(new Event("statechange"));
    expect(pwa.getPwaSnapshot().updateReady).toBe(false);
    incoming.install();
    expect(pwa.getPwaSnapshot().updateReady).toBe(true);
  });

  it("checks for updates when the tab becomes visible", async () => {
    const visibility = vi.spyOn(document, "visibilityState", "get").mockReturnValue("hidden");
    await startAndLoad();
    document.dispatchEvent(new Event("visibilitychange"));
    expect(container.registration.update).not.toHaveBeenCalled();
    visibility.mockReturnValue("visible");
    document.dispatchEvent(new Event("visibilitychange"));
    expect(container.registration.update).toHaveBeenCalledOnce();
  });

  it("applyUpdate activates the waiting worker and reloads once", async () => {
    const { reload } = stubLocation("http://localhost/");
    container.controller = new FakeWorker();
    const waiting = new FakeWorker();
    container.registration.waiting = waiting;
    const pwa = await startAndLoad();
    pwa.applyUpdate();
    expect(waiting.postMessage).toHaveBeenCalledWith("SKIP_WAITING");
    container.dispatchEvent(new Event("controllerchange"));
    container.dispatchEvent(new Event("controllerchange"));
    expect(reload).toHaveBeenCalledOnce();
  });

  it("applyUpdate does nothing without a waiting worker", async () => {
    const { reload } = stubLocation("http://localhost/");
    const pwa = await loadPwa();
    pwa.applyUpdate();
    container.dispatchEvent(new Event("controllerchange"));
    expect(reload).not.toHaveBeenCalled();
  });

  it("dismissUpdate hides the notice", async () => {
    container.controller = new FakeWorker();
    container.registration.waiting = new FakeWorker();
    const pwa = await startAndLoad();
    pwa.dismissUpdate();
    expect(pwa.getPwaSnapshot().updateReady).toBe(false);
  });
});

describe("offline caching of loaded assets", () => {
  const entries = (...names: string[]) => ({ getEntries: () => names.map((name) => ({ name })) });

  it("reports same-origin /assets/ files to the active worker", async () => {
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
    const controller = new FakeWorker();
    container.controller = controller;
    await startAndLoad();
    resourceCallback!(
      entries(
        "http://localhost/assets/index-abc.js",
        "http://localhost/assets/index-abc.js",
        "http://localhost/logo.svg",
        "https://cdn.example.com/assets/x.js",
      ),
    );
    resourceCallback!(entries("http://localhost/assets/About-1.css"));
    vi.advanceTimersByTime(500);
    expect(controller.postMessage).toHaveBeenCalledOnce();
    expect(controller.postMessage).toHaveBeenCalledWith({
      type: "CACHE_URLS",
      urls: ["/assets/index-abc.js", "/assets/About-1.css"],
    });
    vi.useRealTimers();
  });

  it("waits for the worker to take control on the first visit", async () => {
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
    await startAndLoad();
    expect(resourceCallback).toBeNull();
    const controller = new FakeWorker();
    container.controller = controller;
    container.dispatchEvent(new Event("controllerchange"));
    resourceCallback!(entries("http://localhost/assets/a.js"));
    vi.advanceTimersByTime(500);
    expect(controller.postMessage).toHaveBeenCalledOnce();
    vi.useRealTimers();
  });

  it("sends nothing when no assets were loaded", async () => {
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
    const controller = new FakeWorker();
    container.controller = controller;
    await startAndLoad();
    resourceCallback!(entries("http://localhost/favicon.svg"));
    vi.advanceTimersByTime(500);
    expect(controller.postMessage).not.toHaveBeenCalled();
    vi.useRealTimers();
  });
});

describe("usePwa", () => {
  it("re-renders when install becomes available", async () => {
    const pwa = await loadPwa();
    pwa.initPwa();
    const { result } = renderHook(() => pwa.usePwa());
    expect(result.current.canInstall).toBe(false);
    act(() => {
      window.dispatchEvent(
        Object.assign(new Event("beforeinstallprompt"), {
          prompt: () => Promise.resolve(),
          userChoice: Promise.resolve({ outcome: "dismissed" }),
        }),
      );
    });
    expect(result.current.canInstall).toBe(true);
  });

  it("stops notifying after unsubscribe", async () => {
    const pwa = await loadPwa();
    const listener = vi.fn();
    pwa.subscribePwa(listener)();
    pwa.dismissUpdate();
    expect(listener).not.toHaveBeenCalled();
  });
});
