import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { useEffect } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as content from "./i18n/content";

vi.mock("@fontsource/atkinson-hyperlegible/latin-400.css", () => ({}));
vi.mock("@fontsource/atkinson-hyperlegible/latin-700.css", () => ({}));

vi.mock("./components/Loader", () => ({
  Loader: ({ onNearComplete, onComplete }: { onNearComplete: () => void; onComplete: () => void }) => {
    useEffect(() => {
      onNearComplete();
      onComplete();
    }, [onNearComplete, onComplete]);
    return null;
  },
}));

const lenis = vi.hoisted(() => ({
  instances: 0,
  destroy: vi.fn(),
  stop: vi.fn(),
  start: vi.fn(),
  raf: vi.fn(),
}));
vi.mock("lenis", () => ({
  default: class {
    constructor() {
      lenis.instances++;
    }
    destroy = lenis.destroy;
    stop = lenis.stop;
    start = lenis.start;
    raf = lenis.raf;
  },
}));

vi.mock("axe-core", () => ({
  default: { run: vi.fn(() => Promise.resolve({ violations: [], passes: [1], incomplete: [] })) },
}));

const burst = vi.hoisted(() => vi.fn());
vi.mock("./utils/confetti", () => ({ burst }));

const pwa = vi.hoisted(() => ({ updateReady: false, canInstall: true, promptInstall: vi.fn() }));
vi.mock("./utils/pwa", async (importOriginal) => ({
  ...(await importOriginal<typeof import("./utils/pwa")>()),
  usePwa: () => ({ updateReady: pwa.updateReady, canInstall: pwa.canInstall }),
  canInstallApp: () => pwa.canInstall,
  promptInstall: pwa.promptInstall,
}));

const scrollWhenReady = vi.hoisted(() => vi.fn(() => () => {}));
vi.mock("./utils/dom", async (importOriginal) => ({
  ...(await importOriginal<typeof import("./utils/dom")>()),
  scrollToSectionWhenReady: scrollWhenReady,
}));

async function renderApp() {
  vi.resetModules();
  const { App } = await import("./App");
  const view = render(<App />);
  await waitFor(() => expect(document.getElementById("contact")).toBeTruthy(), { timeout: 15_000 });
  return view;
}

function dialogNamed(name: string) {
  return (
    [...document.querySelectorAll<HTMLElement>('[role="dialog"]')].find((d) => {
      const labelledBy = d.getAttribute("aria-labelledby");
      const label = labelledBy ? document.getElementById(labelledBy)?.textContent : d.getAttribute("aria-label");
      return label === name;
    }) ?? null
  );
}

async function findDialog(name: string) {
  let dialog: HTMLElement | null = null;
  await waitFor(() => {
    dialog = dialogNamed(name);
    expect(dialog).toBeTruthy();
  });
  return dialog!;
}

const paletteDialog = () => dialogNamed(content.commandPalette.dialogLabel);

async function runCommand(label: string) {
  fireEvent.keyDown(window, { key: "k", ctrlKey: true });
  const input = within(await findDialog(content.commandPalette.dialogLabel)).getByRole("combobox");
  fireEvent.change(input, { target: { value: label } });
  fireEvent.keyDown(input, { key: "Enter" });
}

afterEach(() => {
  vi.useRealTimers();
});

beforeEach(() => {
  lenis.instances = 0;
  pwa.updateReady = false;
  pwa.canInstall = true;
});

describe("App", { timeout: 30_000 }, () => {
  it("renders the page with a skip link and every section", async () => {
    await renderApp();
    expect(document.querySelector(".skip-link")?.getAttribute("href")).toBe("#main-content");
    expect(document.querySelector(".skip-link")?.textContent).toBe(content.site.skipLinkLabel);
    for (const id of ["hero", "about", "projects", "oss", "experience", "education", "awards", "contact"]) {
      expect(document.getElementById(id)).toBeTruthy();
    }
    expect(document.querySelector("footer")).toBeTruthy();
    expect(document.querySelector("[data-print-resume]")).toBeTruthy();
  });

  it("toggles the palette with Ctrl+K and opens it with /", async () => {
    await renderApp();
    fireEvent.keyDown(window, { key: "k", ctrlKey: true });
    await waitFor(() => expect(paletteDialog()).toBeTruthy());
    fireEvent.keyDown(window, { key: "K", metaKey: true });
    await waitFor(() => expect(paletteDialog()).toBeNull());

    fireEvent.keyDown(window, { key: "/" });
    await waitFor(() => expect(paletteDialog()).toBeTruthy());
  });

  it("ignores / while typing", async () => {
    await renderApp();
    const input = document.createElement("input");
    document.body.append(input);
    fireEvent.keyDown(input, { key: "/" });
    fireEvent.keyDown(window, { key: "/", altKey: true });
    await act(async () => {});
    expect(paletteDialog()).toBeNull();
  });

  it("opens the palette from the nav button", async () => {
    await renderApp();
    const trigger = document.querySelector<HTMLElement>("[aria-keyshortcuts]")!;
    fireEvent.pointerEnter(trigger);
    fireEvent.click(trigger);
    expect(await findDialog(content.commandPalette.dialogLabel)).toBeTruthy();
  });

  it("opens recruiter mode from the palette and records it in the URL", async () => {
    await renderApp();
    await runCommand(content.commandLabels.recruiter);
    const dialog = await findDialog(content.site.name);
    expect(new URL(location.href).searchParams.get("mode")).toBe("recruiter");
    fireEvent.keyDown(dialog, { key: "Escape" });
    await waitFor(() => expect(dialogNamed(content.site.name)).toBeNull());
    expect(new URL(location.href).searchParams.has("mode")).toBe(false);
  });

  it("opens recruiter mode straight from ?mode=recruiter", async () => {
    window.history.replaceState(null, "", "/?mode=recruiter");
    await renderApp();
    expect(await findDialog(content.site.name)).toBeTruthy();
  });

  it("opens the audit and the prefs panel from the palette", async () => {
    await renderApp();
    await runCommand(content.commandLabels.audit);
    const audit = await findDialog(content.a11yAudit.title);
    fireEvent.click(within(audit).getByRole("button", { name: content.a11yAudit.close }));

    await runCommand(content.commandLabels.prefs);
    expect(await findDialog(content.a11yPrefsCopy.title)).toBeTruthy();
  });

  it("toggles the prefs panel from the nav", async () => {
    await renderApp();
    const trigger = document.querySelector<HTMLElement>("[data-a11y-prefs-trigger]")!;
    fireEvent.focus(trigger);
    fireEvent.click(trigger);
    expect(await findDialog(content.a11yPrefsCopy.title)).toBeTruthy();
    fireEvent.click(trigger);
    await waitFor(() => expect(dialogNamed(content.a11yPrefsCopy.title)).toBeNull());
  });

  it("installs and prints from the palette", async () => {
    const print = vi.spyOn(window, "print").mockImplementation(() => {});
    await renderApp();
    await runCommand(content.commandLabels.install);
    await waitFor(() => expect(pwa.promptInstall).toHaveBeenCalled());

    await runCommand(content.commandLabels.printResume);
    await waitFor(() => expect(print).toHaveBeenCalled());
  });

  it("toggles retro mode with the Konami code, with confetti and a toast", async () => {
    await renderApp();
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
    const press = () => content.konamiSequence.forEach((key) => fireEvent.keyDown(window, { key }));

    act(press);
    expect(document.documentElement.getAttribute("data-easter")).toBe(content.easterEgg.theme);
    expect(screen.getByText(content.easterEgg.toastOn)).toBeTruthy();
    await vi.dynamicImportSettled();
    expect(burst).toHaveBeenCalledOnce();

    act(press);
    expect(document.documentElement.hasAttribute("data-easter")).toBe(false);
    expect(screen.getByText(content.easterEgg.toastOff)).toBeTruthy();
    act(() => {
      vi.advanceTimersByTime(content.easterEgg.toastMs);
    });
    vi.useRealTimers();
    await waitFor(() => expect(screen.queryByText(content.easterEgg.toastOff)).toBeNull());
  });

  it("toggles retro mode from the secret palette command, without confetti under reduced motion", async () => {
    localStorage.setItem("a11y-prefs", JSON.stringify({ reduceMotion: true }));
    await renderApp();
    burst.mockClear();
    await runCommand("retro");
    await waitFor(() => expect(document.documentElement.getAttribute("data-easter")).toBe(content.easterEgg.theme));
    expect(burst).not.toHaveBeenCalled();
  });

  it("opens the keyboard shortcuts with ?, the palette and the footer link", async () => {
    await renderApp();
    fireEvent.keyDown(window, { key: "?" });
    const sheet = await findDialog(content.shortcutsCopy.title);
    fireEvent.keyDown(sheet, { key: "Escape" });
    await waitFor(() => expect(dialogNamed(content.shortcutsCopy.title)).toBeNull());

    await runCommand(content.commandLabels.shortcuts);
    await findDialog(content.shortcutsCopy.title);
    fireEvent.keyDown(dialogNamed(content.shortcutsCopy.title)!, { key: "Escape" });
    await waitFor(() => expect(dialogNamed(content.shortcutsCopy.title)).toBeNull());

    const link = [...document.querySelectorAll("footer button")].find(
      (b) => b.textContent === content.shortcutsCopy.footerLink,
    )!;
    fireEvent.click(link);
    await findDialog(content.shortcutsCopy.title);
  });

  it("opens the QR code from the palette and from Contact", async () => {
    await renderApp();
    await runCommand(content.commandLabels.showQr);
    const qr = await findDialog(content.contactCardCopy.qrTitle);
    fireEvent.keyDown(qr, { key: "Escape" });
    await waitFor(() => expect(dialogNamed(content.contactCardCopy.qrTitle)).toBeNull());

    const button = [...document.querySelectorAll("#contact button")].find(
      (b) => b.textContent === content.contactCardCopy.showQr,
    )!;
    fireEvent.click(button);
    await findDialog(content.contactCardCopy.qrTitle);
  });

  it("opens accessibility & privacy from #privacy, without scrolling the page", async () => {
    window.history.replaceState(null, "", "/#privacy");
    await renderApp();
    await findDialog(content.trustCopy.title);
    expect(scrollWhenReady).not.toHaveBeenCalled();
  });

  it("opens the statement from the prefs panel (closing the panel) and the footer", async () => {
    await renderApp();
    fireEvent.click(document.querySelector("[data-a11y-prefs-trigger]")!);
    const prefs = await findDialog(content.a11yPrefsCopy.title);
    fireEvent.click(within(prefs).getByRole("button", { name: content.trustCopy.prefsLink }));
    const trust = await findDialog(content.trustCopy.title);
    await waitFor(() => expect(dialogNamed(content.a11yPrefsCopy.title)).toBeNull());
    fireEvent.keyDown(trust, { key: "Escape" });
    await waitFor(() => expect(dialogNamed(content.trustCopy.title)).toBeNull());

    const link = [...document.querySelectorAll("footer button")].find(
      (b) => b.textContent === content.trustCopy.footerLink,
    )!;
    fireEvent.click(link);
    await findDialog(content.trustCopy.title);
  });

  it("opens accessibility & privacy from the palette", async () => {
    await renderApp();
    await runCommand(content.commandLabels.trust);
    await findDialog(content.trustCopy.title);
  });

  it("opens the colophon from the palette and the footer", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() => Promise.reject(new Error("offline"))),
    );
    await renderApp();
    await runCommand(content.commandLabels.colophon);
    const dialog = await findDialog(content.colophonCopy.title);
    await waitFor(() => expect(dialog.textContent).toContain(content.colophonCopy.error));
    fireEvent.keyDown(dialog, { key: "Escape" });
    await waitFor(() => expect(dialogNamed(content.colophonCopy.title)).toBeNull());

    const link = [...document.querySelectorAll("footer button")].find(
      (b) => b.textContent === content.colophonCopy.footerLink,
    )!;
    fireEvent.click(link);
    await findDialog(content.colophonCopy.title);
  });

  it("ignores ? while typing", async () => {
    await renderApp();
    const input = document.createElement("input");
    document.body.append(input);
    fireEvent.keyDown(input, { key: "?" });
    fireEvent.keyDown(window, { key: "?", ctrlKey: true });
    await act(async () => {});
    expect(dialogNamed(content.shortcutsCopy.title)).toBeNull();
  });

  it("scrolls to the #hash section once the loader is done", async () => {
    window.history.replaceState(null, "", "/#contact");
    await renderApp();
    expect(scrollWhenReady).toHaveBeenCalledWith("contact");
  });

  it("starts Lenis smooth scrolling unless motion is reduced", async () => {
    const { unmount } = await renderApp();
    expect(lenis.instances).toBe(1);
    unmount();
    expect(lenis.destroy).toHaveBeenCalled();

    localStorage.setItem("a11y-prefs", JSON.stringify({ reduceMotion: true }));
    lenis.instances = 0;
    await renderApp();
    expect(lenis.instances).toBe(0);
  });

  it("shows the update notice when a new version is waiting", async () => {
    pwa.updateReady = true;
    await renderApp();
    expect(await screen.findByText(content.pwaCopy.updateTitle)).toBeTruthy();
  });
});
