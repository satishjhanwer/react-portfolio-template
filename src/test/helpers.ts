import { act } from "@testing-library/react";
import { vi } from "vitest";

export class FakeIntersectionObserver {
  static instances: FakeIntersectionObserver[] = [];
  readonly elements = new Set<Element>();
  readonly root = null;
  readonly rootMargin: string;
  readonly thresholds = [0];
  private readonly callback: IntersectionObserverCallback;

  constructor(callback: IntersectionObserverCallback, options: IntersectionObserverInit = {}) {
    this.callback = callback;
    this.rootMargin = options.rootMargin ?? "0px";
    FakeIntersectionObserver.instances.push(this);
  }

  observe(el: Element) {
    this.elements.add(el);
  }
  unobserve(el: Element) {
    this.elements.delete(el);
  }
  disconnect() {
    this.elements.clear();
  }
  takeRecords() {
    return [];
  }

  trigger(isIntersecting = true) {
    const entries = [...this.elements].map(
      (target) =>
        ({
          target,
          isIntersecting,
          intersectionRatio: isIntersecting ? 1 : 0,
          boundingClientRect: target.getBoundingClientRect(),
          intersectionRect: target.getBoundingClientRect(),
          rootBounds: null,
          time: 0,
        }) as IntersectionObserverEntry,
    );
    if (entries.length) {
      this.callback(entries, this as unknown as IntersectionObserver);
    }
  }
}

export function intersectAll(isIntersecting = true) {
  act(() => {
    for (const observer of [...FakeIntersectionObserver.instances]) {
      observer.trigger(isIntersecting);
    }
  });
}

export class FakeResizeObserver {
  static callbacks = new Set<() => void>();
  private readonly callback: () => void;
  constructor(callback: () => void) {
    this.callback = callback;
  }
  observe() {
    FakeResizeObserver.callbacks.add(this.callback);
  }
  unobserve() {}
  disconnect() {
    FakeResizeObserver.callbacks.delete(this.callback);
  }
}

export function resizeAll() {
  act(() => {
    for (const cb of FakeResizeObserver.callbacks) {
      cb();
    }
  });
}

export function mockMatchMedia(matches: (query: string) => boolean = () => false) {
  window.matchMedia = vi.fn((query: string) => ({
    matches: matches(query),
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(() => false),
  }));
}

export function stubLocation(href: string) {
  const url = new URL(href);
  const reload = vi.fn();
  vi.stubGlobal("location", {
    href: url.href,
    origin: url.origin,
    protocol: url.protocol,
    host: url.host,
    hostname: url.hostname,
    pathname: url.pathname,
    search: url.search,
    hash: url.hash,
    reload,
  });
  return { reload };
}

export function stubLanguages(languages: string[]) {
  vi.spyOn(navigator, "languages", "get").mockReturnValue(languages);
  vi.spyOn(navigator, "language", "get").mockReturnValue(languages[0] ?? "");
}

export function throwingStorage() {
  vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
    throw new Error("blocked");
  });
  vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
    throw new Error("blocked");
  });
}
