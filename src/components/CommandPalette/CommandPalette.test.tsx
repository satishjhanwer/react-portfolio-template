import { act, fireEvent, render, screen } from "@testing-library/react";
import { AnimatePresence, LazyMotion, domAnimation } from "framer-motion";
import { type ComponentProps, useState } from "react";
import { type Mock, afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { commandLabels, commandPalette, email } from "../../i18n/content";
import { CommandPalette } from ".";

const switchLocale = vi.hoisted(() => vi.fn());
vi.mock("../../i18n/locale", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../../i18n/locale")>()),
  switchLocale,
}));

const scrollToSection = vi.hoisted(() => vi.fn());
vi.mock("../../utils/dom", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../../utils/dom")>()),
  scrollToSection,
}));

let onClose: Mock<() => void>;
let onAppCommand: Mock<ComponentProps<typeof CommandPalette>["onAppCommand"]>;

function Harness() {
  const [open, setOpen] = useState(true);
  return (
    <LazyMotion features={domAnimation} strict>
      <AnimatePresence>
        {open && (
          <CommandPalette
            onClose={() => {
              onClose();
              setOpen(false);
            }}
            getLenis={() => null}
            onAppCommand={onAppCommand}
          />
        )}
      </AnimatePresence>
    </LazyMotion>
  );
}

function renderPalette() {
  onClose = vi.fn();
  onAppCommand = vi.fn();
  return render(<Harness />);
}

const input = () => screen.getByRole("combobox");
const options = () => screen.queryAllByRole("option");
const activeOption = () => options().find((o) => o.getAttribute("aria-selected") === "true");
const type = (value: string) => fireEvent.change(input(), { target: { value } });
const key = (k: string, init: KeyboardEventInit = {}) => fireEvent.keyDown(input(), { key: k, ...init });

beforeEach(() => {
  vi.useFakeTimers({ toFake: ["requestAnimationFrame", "cancelAnimationFrame", "setTimeout", "clearTimeout"] });
});

afterEach(() => {
  vi.useRealTimers();
});

async function afterClose() {
  for (let i = 0; i < 10; i++) {
    await act(async () => {
      vi.advanceTimersByTime(20);
    });
  }
}

describe("CommandPalette", () => {
  it("opens as a modal dialog with the search box focused", () => {
    renderPalette();
    expect(screen.getByRole("dialog", { name: commandPalette.dialogLabel })).toHaveProperty("ariaModal", "true");
    expect(document.activeElement).toBe(input());
    expect(activeOption()).toBe(options()[0]);
  });

  it("lists every group but hides secret commands", () => {
    renderPalette();
    expect(screen.getAllByRole("group").length).toBeGreaterThan(1);
    expect(screen.queryByText(commandLabels.retro)).toBeNull();
  });

  it("filters by the query and announces the count", () => {
    renderPalette();
    type("contact");
    expect(options().some((o) => o.id.endsWith("nav-contact"))).toBe(true);
    expect(options().length).toBeLessThan(10);
    expect(screen.getByRole("status").textContent).toBe(commandPalette.resultCount(options().length));
  });

  it("shows the empty state", () => {
    renderPalette();
    type("qqqqqqzzzz");
    expect(options()).toHaveLength(0);
    expect(screen.getByText(commandPalette.empty)).toBeTruthy();
    key("ArrowDown");
    key("Enter");
    expect(onClose).not.toHaveBeenCalled();
  });

  it("reveals the secret command for a long enough query", () => {
    renderPalette();
    type("re");
    expect(screen.queryByText(commandLabels.retro)).toBeNull();
    type("retro");
    expect(screen.getByText(commandLabels.retro)).toBeTruthy();
  });

  it("moves the active option with arrows, wrapping around, and Home/End", () => {
    renderPalette();
    const all = options();
    key("ArrowUp");
    expect(activeOption()).toBe(all.at(-1));
    key("ArrowDown");
    expect(activeOption()).toBe(all[0]);
    key("ArrowDown");
    expect(activeOption()).toBe(all[1]);
    key("End");
    expect(activeOption()).toBe(all.at(-1));
    key("Home");
    expect(activeOption()).toBe(all[0]);
    expect(input().getAttribute("aria-activedescendant")).toBe(all[0].id);
  });

  it("leaves Home/End to the text box while typing", () => {
    renderPalette();
    type("go");
    const first = activeOption();
    key("End");
    expect(activeOption()).toBe(first);
  });

  it("follows the mouse", () => {
    renderPalette();
    fireEvent.mouseMove(options()[2]);
    expect(activeOption()).toBe(options()[2]);
    fireEvent.mouseMove(options()[2]);
    expect(activeOption()).toBe(options()[2]);
  });

  it("closes on Escape, the esc button, or a backdrop click, only once", () => {
    renderPalette();
    key("Escape");
    fireEvent.click(screen.getByRole("button", { name: `esc ${commandPalette.footer.close}` }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("closes on a backdrop click but not a click inside", () => {
    renderPalette();
    fireEvent.mouseDown(screen.getByRole("dialog"));
    expect(onClose).not.toHaveBeenCalled();
    fireEvent.mouseDown(screen.getByRole("dialog").parentElement!);
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("scrolls to a section after closing", async () => {
    document.body.insertAdjacentHTML("beforeend", '<section id="contact"></section>');
    renderPalette();
    type("contact");
    const option = options().find((o) => o.id.endsWith("nav-contact"))!;
    fireEvent.click(option);
    expect(onClose).toHaveBeenCalledOnce();
    expect(scrollToSection).not.toHaveBeenCalled();
    await afterClose();
    expect(scrollToSection).toHaveBeenCalledWith("contact");
  });

  it("falls back to the projects section when a project card is missing", async () => {
    renderPalette();
    const project = options().find((o) => o.id.includes("project-"))!;
    document.body.insertAdjacentHTML("beforeend", '<section id="projects"></section>');
    fireEvent.click(project);
    await afterClose();
    expect(scrollToSection).toHaveBeenCalledWith("projects");
  });

  it("does nothing if neither target exists", async () => {
    renderPalette();
    fireEvent.click(options().find((o) => o.id.endsWith("nav-awards"))!);
    await afterClose();
    expect(scrollToSection).not.toHaveBeenCalled();
  });

  it("runs app commands after closing", async () => {
    renderPalette();
    type(commandLabels.prefs);
    key("Enter");
    expect(onAppCommand).not.toHaveBeenCalled();
    await afterClose();
    expect(onAppCommand).toHaveBeenCalledWith("open-prefs");
  });

  it("follows links, external ones in a new tab", () => {
    const clicks: HTMLAnchorElement[] = [];
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(function (this: HTMLAnchorElement) {
      clicks.push(this);
    });
    renderPalette();
    fireEvent.click(options().find((o) => o.id.includes("social-github"))!);
    expect(clicks[0].href).toBe("https://github.com/your-username");
    expect(clicks[0].target).toBe("_blank");
    expect(clicks[0].rel).toBe("noopener noreferrer");
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("downloads the resume", () => {
    const clicks: HTMLAnchorElement[] = [];
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(function (this: HTMLAnchorElement) {
      clicks.push(this);
    });
    renderPalette();
    fireEvent.click(options().find((o) => o.id.includes("action-resume"))!);
    expect(clicks[0].hasAttribute("download")).toBe(true);
    expect(clicks[0].target).toBe("");
  });

  it("copies the email, confirms, then closes", async () => {
    const writeText = vi.fn(() => Promise.resolve());
    Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });
    renderPalette();
    const option = options().find((o) => o.id.includes("action-copy-email"))!;
    fireEvent.click(option);
    await act(async () => {});
    expect(writeText).toHaveBeenCalledWith(email);
    expect(screen.getByRole("status").textContent).toBe(commandPalette.copied);
    expect(onClose).not.toHaveBeenCalled();
    act(() => {
      vi.advanceTimersByTime(900);
    });
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("falls back to mailto when copying fails", async () => {
    const writeText = vi.fn(() => Promise.reject(new Error("denied")));
    Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });
    const click = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
    renderPalette();
    fireEvent.click(options().find((o) => o.id.includes("action-copy-email"))!);
    await act(async () => {});
    expect(click).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("switches language after closing", async () => {
    renderPalette();
    fireEvent.click(options().find((o) => o.id.includes("language-ja"))!);
    await afterClose();
    expect(switchLocale).toHaveBeenCalledWith("ja");
  });

  it("switches theme and closes", async () => {
    renderPalette();
    fireEvent.click(options().find((o) => o.id.endsWith("theme-sunset"))!);
    expect(document.documentElement.getAttribute("data-theme")).toBe("sunset");
    expect(onClose).toHaveBeenCalledOnce();
    const { setThemeChoice } = await import("../../utils/theme");
    setThemeChoice("auto");
  });

  it("keeps Tab inside the dialog", () => {
    vi.spyOn(HTMLElement.prototype, "offsetParent", "get").mockReturnValue(document.body);
    renderPalette();
    const esc = screen.getByRole("button", { name: `esc ${commandPalette.footer.close}` });
    esc.focus();
    fireEvent.keyDown(esc, { key: "Tab" });
    expect(document.activeElement).toBe(input());
  });

  it("ignores other keys", () => {
    renderPalette();
    const before = activeOption();
    key("x");
    expect(activeOption()).toBe(before);
  });
});
