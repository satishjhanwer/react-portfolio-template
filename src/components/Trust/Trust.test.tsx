import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { LazyMotion, domAnimation } from "framer-motion";
import { describe, expect, it, vi } from "vitest";
import en from "../../i18n/locales/en";
import es from "../../i18n/locales/es";
import fr from "../../i18n/locales/fr";
import ja from "../../i18n/locales/ja";
import { email, trustCopy as copy } from "../../i18n/content";
import { stubLocation } from "../../test/helpers";
import { Trust } from ".";
import type { TrustSection } from ".";

vi.mock("@fontsource/atkinson-hyperlegible/latin-400.css", () => ({}));
vi.mock("@fontsource/atkinson-hyperlegible/latin-700.css", () => ({}));

function renderTrust(section?: TrustSection) {
  const onClose = vi.fn();
  render(
    <LazyMotion features={domAnimation} strict>
      <Trust onClose={onClose} getLenis={() => null} section={section} />
    </LazyMotion>,
  );
  return { onClose, dialog: screen.getByRole("dialog", { name: copy.title }) };
}

describe("Trust", () => {
  it("has an accessibility section and a privacy section", () => {
    const { dialog } = renderTrust();
    expect(within(dialog).getByRole("heading", { name: copy.a11y.heading, level: 3 })).toBeTruthy();
    expect(within(dialog).getByRole("heading", { name: copy.privacy.heading, level: 3 })).toBeTruthy();
    expect(document.activeElement).toBe(screen.getByRole("button", { name: copy.close }));
  });

  it("links a pre-filled email for reporting problems", () => {
    renderTrust();
    const link = screen.getByRole("link", { name: copy.a11y.reportLink });
    expect(link.getAttribute("href")).toBe(`mailto:${email}?subject=${encodeURIComponent(copy.a11y.reportSubject)}`);
  });

  it("shows the review date in the site language", () => {
    renderTrust();
    expect(screen.getByText(copy.reviewed("October 22, 2026"))).toBeTruthy();
  });

  it("scrolls to the privacy section when asked", () => {
    renderTrust("privacy");
    expect(document.getElementById("trust-privacy")!.scrollIntoView).toHaveBeenCalled();
  });

  it("clears exactly the saved keys and the offline cache, then reloads", async () => {
    vi.useFakeTimers({ toFake: ["setTimeout"] });
    const { reload } = stubLocation("http://localhost/");
    const deleted: string[] = [];
    vi.stubGlobal("caches", {
      keys: () => Promise.resolve(["portfolio-v1"]),
      delete: (k: string) => Promise.resolve(deleted.push(k) > 0),
    });
    for (const key of ["a11y-prefs", "theme", "lang", "unrelated"]) {
      localStorage.setItem(key, "x");
    }
    renderTrust();
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: copy.privacy.clear }));
    });
    expect(Object.keys(localStorage)).toEqual(["unrelated"]);
    expect(deleted).toEqual(["portfolio-v1"]);
    expect(screen.getByRole("status").textContent).toBe(copy.privacy.cleared);
    expect(screen.getByRole("button", { name: copy.privacy.clear })).toHaveProperty("disabled", true);
    act(() => {
      vi.advanceTimersByTime(900);
    });
    expect(reload).toHaveBeenCalledOnce();
    vi.useRealTimers();
  });

  it("still reloads when storage and caches are unavailable", async () => {
    vi.useFakeTimers({ toFake: ["setTimeout"] });
    const { reload } = stubLocation("http://localhost/");
    vi.spyOn(Storage.prototype, "removeItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    vi.stubGlobal("caches", { keys: () => Promise.reject(new Error("no")) });
    renderTrust();
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: copy.privacy.clear }));
    });
    act(() => {
      vi.advanceTimersByTime(900);
    });
    expect(reload).toHaveBeenCalledOnce();
    vi.useRealTimers();
  });

  it("closes on Escape, the close button and the backdrop; traps Tab", () => {
    vi.spyOn(HTMLElement.prototype, "offsetParent", "get").mockReturnValue(document.body);
    const { onClose, dialog } = renderTrust();
    fireEvent.keyDown(dialog, { key: "Tab" });
    fireEvent.keyDown(dialog, { key: "Escape" });
    fireEvent.click(screen.getByRole("button", { name: copy.close }));
    fireEvent.mouseDown(dialog);
    fireEvent.mouseDown(dialog.parentElement!);
    expect(onClose).toHaveBeenCalledTimes(3);
  });
});

describe("the statement stays true", () => {
  it("lists every key the site saves in localStorage", async () => {
    vi.resetModules();
    const { setPrefs } = await import("../../utils/a11yPrefs");
    const { setThemeChoice } = await import("../../utils/theme");
    const { switchLocale } = await import("../../i18n/locale");
    stubLocation("http://localhost/");
    setPrefs({ highContrast: true });
    setThemeChoice("night");
    switchLocale("ja");

    renderTrust();
    const listed = [...document.querySelectorAll("#trust-privacy dt code")].map((c) => c.textContent);
    for (const key of Object.keys(localStorage)) {
      expect(listed).toContain(key);
    }
    expect(Object.keys(localStorage).sort()).toEqual(["a11y-prefs", "lang", "theme"]);
  });

  it.each([
    ["en", en],
    ["es", es],
    ["fr", fr],
    ["ja", ja],
  ])("%s quotes the real palette label for the audit", (_, messages) => {
    expect(messages.trustCopy.a11y.tested[1]).toContain(messages.commandLabels.audit);
  });
});
