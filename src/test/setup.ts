import { cleanup, configure } from "@testing-library/react";
import { MotionGlobalConfig } from "framer-motion";
import { afterEach, beforeEach, vi } from "vitest";
import { FakeIntersectionObserver, FakeResizeObserver, mockMatchMedia } from "./helpers";

type Listener = [
  EventTarget,
  string,
  EventListenerOrEventListenerObject | null,
  boolean | EventListenerOptions | undefined,
];

const hasDom = typeof window !== "undefined";
const added: Listener[] = [];

if (hasDom) {
  for (const target of [window, document] as EventTarget[]) {
    const original = target.addEventListener.bind(target);
    target.addEventListener = (type, listener, options) => {
      added.push([target, type, listener, options]);
      original(type, listener, options);
    };
  }
  MotionGlobalConfig.skipAnimations = true;
  configure({ asyncUtilTimeout: 5000 });
  mockMatchMedia();

  beforeEach(() => {
    added.length = 0;
    FakeIntersectionObserver.instances.length = 0;
    FakeResizeObserver.callbacks.clear();
    vi.stubGlobal("IntersectionObserver", FakeIntersectionObserver);
    vi.stubGlobal("ResizeObserver", FakeResizeObserver);
    Element.prototype.scrollIntoView = vi.fn();
  });

  afterEach(() => {
    cleanup();
    for (const [target, type, listener, options] of added) {
      target.removeEventListener(type, listener, options);
    }
    added.length = 0;
    localStorage.clear();
    for (const { name } of Array.from(document.documentElement.attributes)) {
      if (name.startsWith("data-")) {
        document.documentElement.removeAttribute(name);
      }
    }
    document.head.innerHTML = "";
    document.body.innerHTML = "";
    document.body.className = "";
    window.history.replaceState(null, "", "/");
    mockMatchMedia();
  });
}
