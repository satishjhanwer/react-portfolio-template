import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@fontsource/atkinson-hyperlegible/latin-400.css", () => ({}));
vi.mock("@fontsource/atkinson-hyperlegible/latin-700.css", () => ({}));

async function loadDom() {
  vi.resetModules();
  return import("./dom");
}

describe("platform", () => {
  it("labels the modifier key ⌘ on Apple devices", async () => {
    vi.spyOn(navigator, "userAgent", "get").mockReturnValue("Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0)");
    const { isApplePlatform, modKeyLabel } = await loadDom();
    expect(isApplePlatform).toBe(true);
    expect(modKeyLabel).toBe("⌘");
  });

  it("labels it Ctrl elsewhere", async () => {
    vi.spyOn(navigator, "userAgent", "get").mockReturnValue("Mozilla/5.0 (Windows NT 10.0; Win64; x64)");
    const { modKeyLabel } = await loadDom();
    expect(modKeyLabel).toBe("Ctrl");
  });
});

describe("isEditableTarget", () => {
  it.each(["input", "textarea", "select"])("is true for <%s>", async (tag) => {
    const { isEditableTarget } = await loadDom();
    expect(isEditableTarget(document.createElement(tag))).toBe(true);
  });

  it("is true for contenteditable", async () => {
    const { isEditableTarget } = await loadDom();
    const div = document.createElement("div");
    Object.defineProperty(div, "isContentEditable", { value: true });
    expect(isEditableTarget(div)).toBe(true);
  });

  it("is false for other elements and non-elements", async () => {
    const { isEditableTarget } = await loadDom();
    expect(isEditableTarget(document.createElement("button"))).toBe(false);
    expect(isEditableTarget(window)).toBe(false);
    expect(isEditableTarget(null)).toBe(false);
  });
});

describe("trapTab", () => {
  let container: HTMLElement;
  let first: HTMLButtonElement;
  let last: HTMLButtonElement;

  beforeEach(() => {
    vi.spyOn(HTMLElement.prototype, "offsetParent", "get").mockReturnValue(document.body);
    container = document.createElement("div");
    container.innerHTML = `<button id="a">a</button><input /><button disabled>x</button><button id="b">b</button>`;
    document.body.append(container);
    first = container.querySelector("#a")!;
    last = container.querySelector("#b")!;
  });

  const tab = (shiftKey = false) => new KeyboardEvent("keydown", { key: "Tab", shiftKey, cancelable: true });

  it("wraps from the last item to the first", async () => {
    const { trapTab } = await loadDom();
    last.focus();
    const e = tab();
    trapTab(e, container);
    expect(document.activeElement).toBe(first);
    expect(e.defaultPrevented).toBe(true);
  });

  it("wraps backwards from the first item to the last", async () => {
    const { trapTab } = await loadDom();
    first.focus();
    trapTab(tab(true), container);
    expect(document.activeElement).toBe(last);
  });

  it("lets Tab move normally inside the container", async () => {
    const { trapTab } = await loadDom();
    first.focus();
    const e = tab();
    trapTab(e, container);
    expect(e.defaultPrevented).toBe(false);
  });

  it("pulls focus back in from outside", async () => {
    const { trapTab } = await loadDom();
    const outside = document.createElement("button");
    document.body.append(outside);
    outside.focus();
    trapTab(tab(), container);
    expect(document.activeElement).toBe(first);
  });

  it("swallows Tab when nothing is focusable", async () => {
    const { trapTab } = await loadDom();
    const empty = document.createElement("div");
    const e = tab();
    trapTab(e, empty);
    expect(e.defaultPrevented).toBe(true);
  });

  it("ignores other keys and a missing container", async () => {
    const { trapTab } = await loadDom();
    const enter = new KeyboardEvent("keydown", { key: "Enter", cancelable: true });
    trapTab(enter, container);
    trapTab(tab(), null);
    expect(enter.defaultPrevented).toBe(false);
  });
});

describe("scrollToSection", () => {
  let resizeCallback: () => void;
  let disconnect: ReturnType<typeof vi.fn>;
  let section: HTMLElement;
  let top: number;

  beforeEach(() => {
    vi.useFakeTimers();
    disconnect = vi.fn();
    vi.stubGlobal(
      "ResizeObserver",
      class {
        constructor(cb: () => void) {
          resizeCallback = cb;
        }
        observe() {}
        disconnect = disconnect;
      },
    );
    section = document.createElement("section");
    section.id = "contact";
    document.body.append(section);
    section.scrollIntoView = vi.fn();
    top = 500;
    vi.spyOn(document.documentElement, "scrollHeight", "get").mockReturnValue(10_000);
    vi.spyOn(section, "getBoundingClientRect").mockImplementation(() => ({ top }) as DOMRect);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("does nothing for a missing section", async () => {
    const { scrollToSection } = await loadDom();
    scrollToSection("nope");
    expect(section.scrollIntoView).not.toHaveBeenCalled();
  });

  it("scrolls smoothly, or instantly under reduced motion", async () => {
    const { scrollToSection } = await loadDom();
    scrollToSection("contact");
    expect(section.scrollIntoView).toHaveBeenLastCalledWith({ behavior: "smooth" });

    localStorage.setItem("a11y-prefs", JSON.stringify({ reduceMotion: true }));
    const fresh = await loadDom();
    fresh.scrollToSection("contact");
    expect(section.scrollIntoView).toHaveBeenLastCalledWith({ behavior: "auto" });
  });

  it("re-aims when content above the section changes height", async () => {
    const { scrollToSection } = await loadDom();
    scrollToSection("contact");
    top = 900;
    resizeCallback();
    expect(section.scrollIntoView).toHaveBeenCalledTimes(2);
  });

  it("ignores layout changes of a pixel or two", async () => {
    const { scrollToSection } = await loadDom();
    scrollToSection("contact");
    top = 501;
    resizeCallback();
    expect(section.scrollIntoView).toHaveBeenCalledTimes(1);
  });

  it("re-aims on scrollend if it stopped short, then stops once there", async () => {
    const { scrollToSection } = await loadDom();
    scrollToSection("contact");
    window.dispatchEvent(new Event("scrollend"));
    expect(section.scrollIntoView).toHaveBeenCalledTimes(2);

    top = 0;
    window.dispatchEvent(new Event("scrollend"));
    expect(disconnect).toHaveBeenCalled();
  });

  it("stops at the bottom of the page even if the section can't reach the top", async () => {
    const { scrollToSection } = await loadDom();
    scrollToSection("contact");
    vi.spyOn(document.documentElement, "scrollHeight", "get").mockReturnValue(window.innerHeight);
    window.dispatchEvent(new Event("scrollend"));
    expect(disconnect).toHaveBeenCalled();
    expect(section.scrollIntoView).toHaveBeenCalledTimes(1);
  });

  it("gives up as soon as the user scrolls", async () => {
    const { scrollToSection } = await loadDom();
    scrollToSection("contact");
    window.dispatchEvent(new Event("wheel"));
    expect(disconnect).toHaveBeenCalled();
    top = 900;
    window.dispatchEvent(new Event("scrollend"));
    expect(section.scrollIntoView).toHaveBeenCalledTimes(1);
  });

  it("gives up after a few seconds", async () => {
    const { scrollToSection } = await loadDom();
    scrollToSection("contact");
    vi.advanceTimersByTime(4000);
    expect(disconnect).toHaveBeenCalled();
  });

  it("cancels the previous scroll when a new one starts", async () => {
    const { scrollToSection } = await loadDom();
    scrollToSection("contact");
    scrollToSection("contact");
    expect(disconnect).toHaveBeenCalledOnce();
  });

  it("scrollToSectionWhenReady scrolls at once if the section exists", async () => {
    const { scrollToSectionWhenReady } = await loadDom();
    const stop = scrollToSectionWhenReady("contact");
    expect(section.scrollIntoView).toHaveBeenCalledOnce();
    stop();
  });
});

describe("scrollToSectionWhenReady", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "ResizeObserver",
      class {
        observe() {}
        disconnect() {}
      },
    );
  });

  it("waits for a lazy section to mount", async () => {
    const { scrollToSectionWhenReady } = await loadDom();
    scrollToSectionWhenReady("awards");
    const late = document.createElement("section");
    late.id = "awards";
    late.scrollIntoView = vi.fn();
    document.body.append(document.createElement("div"));
    await Promise.resolve();
    document.body.append(late);
    await vi.waitFor(() => expect(late.scrollIntoView).toHaveBeenCalledOnce());
  });

  it("stops waiting after the timeout", async () => {
    vi.useFakeTimers();
    const { scrollToSectionWhenReady } = await loadDom();
    scrollToSectionWhenReady("awards", 1000);
    vi.advanceTimersByTime(1000);
    vi.useRealTimers();
    const late = document.createElement("section");
    late.id = "awards";
    late.scrollIntoView = vi.fn();
    document.body.append(late);
    await new Promise((r) => setTimeout(r, 10));
    expect(late.scrollIntoView).not.toHaveBeenCalled();
  });
});
