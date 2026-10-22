import { act, fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { VitalsSnapshot } from "../../utils/webVitals";

const vitals = vi.hoisted(() => ({
  snapshot: { readings: {}, thresholds: {}, unavailable: {} } as VitalsSnapshot,
}));
vi.mock("../../utils/webVitals", () => ({ useWebVitals: () => vitals.snapshot }));

const pwa = vi.hoisted(() => ({ canInstall: false, promptInstall: vi.fn() }));
vi.mock("../../utils/pwa", () => ({
  usePwa: () => ({ canInstall: pwa.canInstall, updateReady: false }),
  promptInstall: pwa.promptInstall,
}));

async function renderFooter(lang = "en", onCommand?: (c: string) => void) {
  vi.resetModules();
  window.history.replaceState(null, "", `/?lang=${lang}`);
  const content = await import("../../i18n/content");
  const locale = await import("../../i18n/locale");
  const switchLocale = vi.spyOn(locale, "switchLocale").mockImplementation(() => {});
  const { Footer } = await import(".");
  render(<Footer onCommand={onCommand} />);
  return { ...content, switchLocale };
}

const badge = (label: string) => screen.getByRole("button", { name: new RegExp(label) });

beforeEach(() => {
  vitals.snapshot = { readings: {}, thresholds: {}, unavailable: {} };
  pwa.canInstall = false;
});

describe("Footer", () => {
  it("links every social profile in a new tab", async () => {
    const { socials } = await renderFooter();
    for (const s of socials) {
      const link = screen.getByRole("link", { name: s.label });
      expect(link.getAttribute("href")).toBe(s.href);
      expect(link.getAttribute("rel")).toBe("noopener noreferrer");
    }
  });

  it("runs app commands from its links", async () => {
    const onCommand = vi.fn();
    const { shortcutsCopy } = await renderFooter("en", onCommand);
    fireEvent.click(screen.getByRole("button", { name: shortcutsCopy.footerLink }));
    expect(onCommand).toHaveBeenCalledWith("open-shortcuts");
  });

  it("has no links without a command handler", async () => {
    const { shortcutsCopy } = await renderFooter();
    expect(screen.queryByRole("button", { name: shortcutsCopy.footerLink })).toBeNull();
  });

  it("shows no translation note in English", async () => {
    const { languageCopy } = await renderFooter();
    expect(screen.queryByText(languageCopy.readInEnglish)).toBeNull();
  });

  it("offers 'read in English' in other languages", async () => {
    const { languageCopy } = await renderFooter("fr");
    fireEvent.click(screen.getByRole("button", { name: languageCopy.readInEnglish }));
    expect(document.querySelector("[lang='fr']")?.textContent).toContain(languageCopy.disclaimer);
  });

  it("shows the install button only when installable", async () => {
    await renderFooter();
    expect(screen.queryByRole("button", { name: /install/i })).toBeNull();
    pwa.canInstall = true;
    const { pwaCopy } = await renderFooter();
    fireEvent.click(screen.getByRole("button", { name: new RegExp(pwaCopy.install) }));
    expect(pwa.promptInstall).toHaveBeenCalledOnce();
  });
});

describe("VitalsBadge", () => {
  it("shows pending values before measuring", async () => {
    const { webVitals } = await renderFooter();
    expect(badge(webVitals.badgeLabel).textContent).toContain(webVitals.pending);
  });

  it("formats milliseconds, seconds and CLS with a rating", async () => {
    vitals.snapshot = {
      readings: {
        LCP: { value: 2345, rating: "needs-improvement" },
        INP: { value: 87.6, rating: "good" },
        CLS: { value: 0.256, rating: "poor" },
      },
      thresholds: { LCP: [2500, 4000], CLS: [0.1, 0.25] },
      unavailable: {},
    };
    const { webVitals } = await renderFooter();
    const text = badge(webVitals.badgeLabel).textContent!;
    expect(text).toContain("2.3 s");
    expect(text).toContain("88 ms");
    expect(text).toContain("0.26");
    expect(text).toContain(webVitals.ratings.poor);
  });

  it("explains unavailable metrics", async () => {
    vitals.snapshot = { readings: {}, thresholds: {}, unavailable: { LCP: "hidden", INP: "unsupported" } };
    const { webVitals } = await renderFooter();
    expect(badge(webVitals.badgeLabel).textContent).toContain(webVitals.unavailableShort);
    fireEvent.click(badge(webVitals.badgeLabel));
    expect(screen.getByText(webVitals.unavailable.hidden)).toBeTruthy();
    expect(screen.getByText(webVitals.unavailable.unsupported)).toBeTruthy();
  });

  it("opens a details panel with thresholds", async () => {
    vitals.snapshot = {
      readings: { LCP: { value: 900, rating: "good" } },
      thresholds: { LCP: [2500, 4000] },
      unavailable: {},
    };
    const { webVitals } = await renderFooter();
    const button = badge(webVitals.badgeLabel);
    fireEvent.click(button);
    expect(button.getAttribute("aria-expanded")).toBe("true");
    const panel = screen.getByRole("region", { name: webVitals.panelLabel });
    expect(panel.textContent).toContain(webVitals.thresholds("2.5 s", "4.0 s"));
    expect(panel.textContent).toContain(webVitals.metrics.LCP.name);
  });

  it("closes on Escape (returning focus) and on an outside click", async () => {
    const { webVitals } = await renderFooter();
    const button = badge(webVitals.badgeLabel);
    fireEvent.click(button);
    fireEvent.keyDown(document, { key: "a" });
    expect(screen.queryByRole("region")).toBeTruthy();
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("region")).toBeNull();
    expect(document.activeElement).toBe(button);

    fireEvent.click(button);
    fireEvent.pointerDown(screen.getByRole("region"));
    expect(screen.queryByRole("region")).toBeTruthy();
    act(() => {
      fireEvent.pointerDown(document.body);
    });
    expect(screen.queryByRole("region")).toBeNull();
  });
});
