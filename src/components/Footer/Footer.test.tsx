import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

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

beforeEach(() => {
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
