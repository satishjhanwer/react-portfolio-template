import { act, fireEvent, render, screen } from "@testing-library/react";
import { LazyMotion, domAnimation } from "framer-motion";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  a11yPrefsTrigger,
  availability,
  availabilityFull,
  commandPalette,
  navLinks,
  navMenuLabel,
} from "../../i18n/content";
import { resizeAll } from "../../test/helpers";
import { Nav } from ".";

const scrollToSection = vi.hoisted(() => vi.fn());
vi.mock("../../utils/dom", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../../utils/dom")>()),
  scrollToSection,
}));

function renderNav(prefsOpen = false) {
  const props = {
    onOpenPalette: vi.fn(),
    onPreloadPalette: vi.fn(),
    prefsOpen,
    onTogglePrefs: vi.fn(),
    onPreloadPrefs: vi.fn(),
  };
  render(
    <LazyMotion features={domAnimation} strict>
      <Nav {...props} />
    </LazyMotion>,
  );
  return props;
}

const hamburger = () => screen.getByRole("button", { name: /menu/i });

beforeEach(() => {
  vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
});

afterEach(() => {
  vi.useRealTimers();
});

describe("Nav", () => {
  it("scrolls to a section from each link", () => {
    renderNav();
    for (const link of navLinks) {
      fireEvent.click(screen.getAllByRole("button", { name: link.label })[0]);
      act(() => {
        vi.advanceTimersByTime(50);
      });
      expect(scrollToSection).toHaveBeenLastCalledWith(link.id);
    }
  });

  it("jumps to contact from the availability status", () => {
    renderNav();
    fireEvent.click(screen.getByRole("button", { name: new RegExp(availability.compact) }));
    act(() => {
      vi.advanceTimersByTime(50);
    });
    expect(scrollToSection).toHaveBeenCalledWith(availability.target);
  });

  it("wires the palette and prefs triggers", () => {
    const props = renderNav(true);
    const palette = screen.getByRole("button", { name: new RegExp(commandPalette.triggerText) });
    fireEvent.pointerEnter(palette);
    fireEvent.focus(palette);
    fireEvent.click(palette);
    expect(props.onPreloadPalette).toHaveBeenCalledTimes(2);
    expect(props.onOpenPalette).toHaveBeenCalledOnce();
    expect(palette.getAttribute("aria-keyshortcuts")).toBe("Control+K");

    const prefs = screen.getByRole("button", { name: a11yPrefsTrigger });
    expect(prefs.getAttribute("aria-expanded")).toBe("true");
    fireEvent.pointerEnter(prefs);
    fireEvent.click(prefs);
    expect(props.onPreloadPrefs).toHaveBeenCalledOnce();
    expect(props.onTogglePrefs).toHaveBeenCalledOnce();
  });

  it("opens and closes the mobile drawer", () => {
    renderNav();
    fireEvent.click(hamburger());
    expect(hamburger().getAttribute("aria-label")).toBe(navMenuLabel.close);
    expect(document.body.classList.contains("no-scroll")).toBe(true);
    expect(screen.getByText(availabilityFull)).toBeTruthy();

    fireEvent.keyDown(window, { key: "a" });
    expect(hamburger().getAttribute("aria-expanded")).toBe("true");
    fireEvent.keyDown(window, { key: "Escape" });
    expect(hamburger().getAttribute("aria-label")).toBe(navMenuLabel.open);
  });

  it("closes the drawer from the backdrop and from a drawer link", () => {
    renderNav();
    fireEvent.click(hamburger());
    const backdrop = document.querySelector('[class*="backdrop"]')!;
    fireEvent.click(backdrop);
    expect(hamburger().getAttribute("aria-expanded")).toBe("false");

    fireEvent.click(hamburger());
    const drawerLinks = screen.getAllByRole("button", { name: navLinks[0].label });
    fireEvent.click(drawerLinks.at(-1)!);
    act(() => {
      vi.advanceTimersByTime(50);
    });
    expect(scrollToSection).toHaveBeenCalledWith(navLinks[0].id);
    expect(hamburger().getAttribute("aria-expanded")).toBe("false");
  });

  it("opens the status link from the drawer", () => {
    renderNav();
    fireEvent.click(hamburger());
    fireEvent.click(screen.getByRole("button", { name: new RegExp(availabilityFull) }));
    act(() => {
      vi.advanceTimersByTime(50);
    });
    expect(scrollToSection).toHaveBeenCalledWith(availability.target);
  });

  it("switches to the compact menu when the links don't fit", () => {
    renderNav();
    const nav = screen.getByRole("navigation");
    const links = nav.querySelector("ul")!;
    Object.defineProperty(nav, "clientWidth", { value: 400, configurable: true });
    Object.defineProperty(links, "scrollWidth", { value: 900, configurable: true });
    resizeAll();
    expect(nav.hasAttribute("data-compact")).toBe(true);

    Object.defineProperty(links, "scrollWidth", { value: 100, configurable: true });
    resizeAll();
    expect(nav.hasAttribute("data-compact")).toBe(false);
  });
});
