import { act, render, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type Lenis from "lenis";
import { konamiSequence } from "../i18n/content";
import { useBodyClass } from "./useBodyClass";
import { useInViewport } from "./useInViewport";
import { useKonami } from "./useKonami";
import { useModal } from "./useModal";
import { useScramble } from "./useScramble";
import { useSectionInView } from "./useSectionInView";

describe("useBodyClass", () => {
  it("adds the class while active and removes it on unmount", () => {
    const { rerender, unmount } = renderHook(({ active }) => useBodyClass("no-scroll", active), {
      initialProps: { active: false },
    });
    expect(document.body.classList.contains("no-scroll")).toBe(false);
    rerender({ active: true });
    expect(document.body.classList.contains("no-scroll")).toBe(true);
    unmount();
    expect(document.body.classList.contains("no-scroll")).toBe(false);
  });
});

describe("useInViewport", () => {
  let trigger: (isIntersecting: boolean) => void;
  let disconnect: ReturnType<typeof vi.fn>;
  let rootMargin: string | undefined;

  beforeEach(() => {
    disconnect = vi.fn();
    vi.stubGlobal(
      "IntersectionObserver",
      class {
        constructor(cb: (entries: { isIntersecting: boolean }[]) => void, options: IntersectionObserverInit) {
          trigger = (isIntersecting) => cb([{ isIntersecting }]);
          rootMargin = options.rootMargin;
        }
        observe() {}
        disconnect = disconnect;
      },
    );
  });

  function Probe({ onChange }: { onChange: (near: boolean) => void }) {
    const { ref, isNearViewport } = useInViewport<HTMLDivElement>("200px");
    onChange(isNearViewport);
    return <div ref={ref} />;
  }

  it("flips to true once near the viewport, then stops observing", () => {
    const seen: boolean[] = [];
    render(<Probe onChange={(v) => seen.push(v)} />);
    expect(rootMargin).toBe("200px");
    act(() => trigger(false));
    expect(seen.at(-1)).toBe(false);
    act(() => trigger(true));
    expect(seen.at(-1)).toBe(true);
    expect(disconnect).toHaveBeenCalled();
  });

  it("does nothing without an element", () => {
    const { result } = renderHook(() => useInViewport("0px"));
    expect(result.current.isNearViewport).toBe(false);
  });
});

describe("useKonami", () => {
  const press = (key: string, target: EventTarget = window) =>
    target.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true }));

  it("fires after the full sequence", () => {
    const onTrigger = vi.fn();
    renderHook(() => useKonami(onTrigger));
    konamiSequence.forEach((key) => press(key));
    expect(onTrigger).toHaveBeenCalledOnce();
  });

  it("is case-insensitive and can fire again", () => {
    const onTrigger = vi.fn();
    renderHook(() => useKonami(onTrigger));
    konamiSequence.forEach((key) => press(key.toUpperCase()));
    konamiSequence.forEach((key) => press(key));
    expect(onTrigger).toHaveBeenCalledTimes(2);
  });

  it("restarts after a wrong key", () => {
    const onTrigger = vi.fn();
    renderHook(() => useKonami(onTrigger));
    konamiSequence.slice(0, 3).forEach((key) => press(key));
    press("x");
    konamiSequence.slice(3).forEach((key) => press(key));
    expect(onTrigger).not.toHaveBeenCalled();
  });

  it("treats a wrong key that starts the sequence as step one", () => {
    const onTrigger = vi.fn();
    renderHook(() => useKonami(onTrigger));
    press(konamiSequence[0]);
    press("x");
    press(konamiSequence[0]);
    konamiSequence.slice(1).forEach((key) => press(key));
    expect(onTrigger).toHaveBeenCalledOnce();
  });

  it("ignores typing in form fields", () => {
    const onTrigger = vi.fn();
    renderHook(() => useKonami(onTrigger));
    const input = document.createElement("input");
    document.body.append(input);
    konamiSequence.forEach((key) => press(key, input));
    expect(onTrigger).not.toHaveBeenCalled();
  });

  it("stops listening on unmount", () => {
    const onTrigger = vi.fn();
    const { unmount } = renderHook(() => useKonami(onTrigger));
    unmount();
    konamiSequence.forEach((key) => press(key));
    expect(onTrigger).not.toHaveBeenCalled();
  });
});

describe("useModal", () => {
  let root: HTMLDivElement;
  let opener: HTMLButtonElement;
  let lenis: { stop: ReturnType<typeof vi.fn>; start: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    root = document.createElement("div");
    root.id = "root";
    opener = document.createElement("button");
    root.append(opener);
    document.body.append(root);
    opener.focus();
    lenis = { stop: vi.fn(), start: vi.fn() };
  });

  const getLenis = () => lenis as unknown as Lenis;

  it("locks the page behind the modal and restores it on close", () => {
    const { unmount } = renderHook(() => useModal(getLenis));
    expect(root.inert).toBe(true);
    expect(lenis.stop).toHaveBeenCalled();
    expect(document.body.classList.contains("no-scroll")).toBe(true);

    document.body.append(document.createElement("button"));
    unmount();
    expect(root.inert).toBe(false);
    expect(lenis.start).toHaveBeenCalled();
    expect(document.body.classList.contains("no-scroll")).toBe(false);
    expect(document.activeElement).toBe(opener);
  });

  it("runs the after-close action on the next frame", () => {
    vi.useFakeTimers();
    const after = vi.fn();
    const { result, unmount } = renderHook(() => useModal(getLenis));
    act(() => result.current.runAfterClose(after));
    unmount();
    expect(after).not.toHaveBeenCalled();
    vi.advanceTimersToNextFrame();
    expect(after).toHaveBeenCalledOnce();
    vi.useRealTimers();
  });

  it("can cancel the after-close action", () => {
    vi.useFakeTimers();
    const after = vi.fn();
    const { result, unmount } = renderHook(() => useModal(getLenis));
    act(() => result.current.runAfterClose(after));
    act(() => result.current.runAfterClose(null));
    unmount();
    vi.advanceTimersToNextFrame();
    expect(after).not.toHaveBeenCalled();
    vi.useRealTimers();
  });

  it("works without Lenis or #root", () => {
    root.remove();
    const { unmount } = renderHook(() => useModal(() => null));
    expect(() => unmount()).not.toThrow();
  });
});

describe("useScramble", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns the text untouched when inactive", () => {
    const { result } = renderHook(() => useScramble("HELLO", false));
    expect(result.current).toBe("HELLO");
  });

  it("scrambles, keeps spaces, and settles on the real text", () => {
    const { result } = renderHook(() => useScramble("AB CD", true, 300));
    act(() => {
      vi.advanceTimersToNextFrame();
    });
    expect(result.current).toHaveLength(5);
    expect(result.current[2]).toBe(" ");
    act(() => {
      vi.advanceTimersByTime(400);
    });
    expect(result.current).toBe("AB CD");
  });

  it("falls back to the real text if frames stop (background tab)", () => {
    const { result } = renderHook(() => useScramble("WXYZ", true, 300));
    vi.spyOn(window, "requestAnimationFrame").mockImplementation(() => 0);
    act(() => {
      vi.advanceTimersByTime(450);
    });
    expect(result.current).toBe("WXYZ");
  });

  it("handles single-character text", () => {
    const { result } = renderHook(() => useScramble("A", true, 100));
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(result.current).toBe("A");
  });

  it("cleans up on unmount", () => {
    const cancel = vi.spyOn(window, "cancelAnimationFrame");
    const { unmount } = renderHook(() => useScramble("HI", true));
    unmount();
    expect(cancel).toHaveBeenCalled();
  });
});

describe("useSectionInView", () => {
  it("returns a ref and starts out of view", () => {
    vi.stubGlobal(
      "IntersectionObserver",
      class {
        observe() {}
        unobserve() {}
        disconnect() {}
      },
    );
    function Probe({ onInView }: { onInView: (v: boolean) => void }) {
      const { ref, inView } = useSectionInView();
      onInView(inView);
      return <section ref={ref} />;
    }
    const seen: boolean[] = [];
    render(<Probe onInView={(v) => seen.push(v)} />);
    expect(seen.at(-1)).toBe(false);
  });
});
