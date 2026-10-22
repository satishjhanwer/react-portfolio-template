import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { LazyMotion, MotionConfig, domAnimation } from "framer-motion";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { availability, hero } from "../../i18n/content";
import { Hero } from ".";

const scrollToSection = vi.hoisted(() => vi.fn());
vi.mock("../../utils/dom", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../../utils/dom")>()),
  scrollToSection,
}));

function renderHero({ reduced = false, scramble = false } = {}) {
  render(
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion={reduced ? "always" : "never"}>
        <Hero scrambleActive={scramble} />
      </MotionConfig>
    </LazyMotion>,
  );
}

const statusButton = () => screen.getByRole("button", { name: new RegExp(availability.statuses[0].slice(0, 6)) });

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("Hero", () => {
  it("has the full name for screen readers", () => {
    renderHero();
    expect(screen.getByText(`${hero.nameFirst} ${hero.nameLast}`)).toBeTruthy();
  });

  it("rotates the availability status", async () => {
    vi.useRealTimers();
    vi.useFakeTimers({ toFake: ["setInterval", "clearInterval"] });
    renderHero();
    const button = statusButton();
    expect(button.textContent).toContain(availability.statuses[0]);
    act(() => {
      vi.advanceTimersByTime(2800);
    });
    await waitFor(() => expect(button.textContent).toContain(availability.statuses[1]));
  });

  it("doesn't rotate under reduced motion", () => {
    renderHero({ reduced: true });
    const button = statusButton();
    act(() => {
      vi.advanceTimersByTime(6000);
    });
    expect(button.textContent).toContain(availability.statuses[0]);
  });

  it("scrambles the name in, then settles", () => {
    renderHero({ scramble: true });
    act(() => {
      vi.advanceTimersByTime(1300);
    });
    expect(document.body.textContent).toContain(hero.nameLast);
  });

  it("scrolls to contact and projects from its buttons", () => {
    renderHero();
    fireEvent.click(statusButton());
    expect(scrollToSection).toHaveBeenCalledWith(availability.target);
    fireEvent.click(screen.getByRole("button", { name: hero.ctaPrimary.label }));
    expect(scrollToSection).toHaveBeenCalledWith(hero.ctaPrimary.target);
  });

  it("offers the resume download", () => {
    renderHero();
    expect(screen.getByRole("link", { name: hero.ctaGhost.label }).hasAttribute("download")).toBe(true);
  });
});
