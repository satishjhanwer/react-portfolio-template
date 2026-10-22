import { act, fireEvent, render, screen } from "@testing-library/react";
import { LazyMotion, domAnimation } from "framer-motion";
import { afterEach, describe, expect, it, vi } from "vitest";
import { a11yPrefsCopy as copy } from "../../i18n/content";
import { getPrefs, resetPrefs } from "../../utils/a11yPrefs";
import { getThemeChoice, setThemeChoice } from "../../utils/theme";
import { A11yPrefs } from ".";

vi.mock("@fontsource/atkinson-hyperlegible/latin-400.css", () => ({}));
vi.mock("@fontsource/atkinson-hyperlegible/latin-700.css", () => ({}));

function renderPanel() {
  const onClose = vi.fn();
  const opener = document.createElement("button");
  opener.dataset.a11yPrefsTrigger = "";
  document.body.append(opener);
  opener.focus();
  const view = render(
    <LazyMotion features={domAnimation} strict>
      <A11yPrefs onClose={onClose} />
    </LazyMotion>,
  );
  return { onClose, opener, ...view };
}

const attr = (name: string) => document.documentElement.getAttribute(name);

describe("A11yPrefs", () => {
  afterEach(() => {
    act(() => {
      resetPrefs();
      setThemeChoice("auto");
    });
  });

  it("picks a theme, shows what auto resolves to, and goes back to auto", () => {
    renderPanel();
    const auto = screen.getByRole("radio", { name: copy.theme.auto });
    expect(auto).toHaveProperty("checked", true);
    expect(screen.getByText(copy.theme.autoHint(copy.theme.names.indigo))).toBeTruthy();

    fireEvent.click(screen.getByRole("radio", { name: copy.theme.names.arctic }));
    expect(getThemeChoice()).toBe("arctic");
    expect(document.documentElement.getAttribute("data-theme")).toBe("arctic");
    expect(screen.getByText(copy.theme.autoHint(copy.theme.names.arctic))).toBeTruthy();

    fireEvent.click(auto);
    expect(getThemeChoice()).toBe("auto");
    expect(localStorage.getItem("theme")).toBeNull();
  });

  it("is a labelled dialog that focuses its title and restores focus on close", () => {
    const { opener, unmount } = renderPanel();
    const title = screen.getByRole("heading", { name: copy.title });
    expect(screen.getByRole("dialog", { name: copy.title })).toBeTruthy();
    expect(document.activeElement).toBe(title);
    unmount();
    expect(document.activeElement).toBe(opener);
  });

  it("sets the text size", () => {
    renderPanel();
    const largest = copy.textSize.options.at(-1)!;
    fireEvent.click(screen.getByRole("radio", { name: largest.label }));
    expect(getPrefs().textSize).toBe(largest.value);
    expect(attr("data-text-size")).toBe(largest.value);
  });

  it("flips each switch on and off", () => {
    renderPanel();
    for (const key of Object.keys(copy.toggles) as (keyof typeof copy.toggles)[]) {
      const toggle = screen.getByRole("switch", { name: new RegExp(copy.toggles[key].label) });
      fireEvent.click(toggle);
      expect(getPrefs()[key]).toBe(true);
      fireEvent.click(toggle);
      expect(getPrefs()[key]).toBe(false);
    }
  });

  it("describes each switch", () => {
    renderPanel();
    const [first] = Object.values(copy.toggles);
    const toggle = screen.getByRole("switch", { name: new RegExp(first.label) });
    expect(document.getElementById(toggle.getAttribute("aria-describedby")!)?.textContent).toBe(first.desc);
  });

  it("picks a colour-vision filter", () => {
    renderPanel();
    const option = copy.vision.options.find((o) => o.value !== "none")!;
    fireEvent.click(screen.getByRole("radio", { name: option.label }));
    expect(attr("data-vision")).toBe(option.value);
  });

  it("enables reset only once something changed", () => {
    renderPanel();
    const reset = screen.getByRole("button", { name: copy.reset });
    expect(reset).toHaveProperty("disabled", true);
    fireEvent.click(screen.getAllByRole("switch")[0]);
    expect(reset).toHaveProperty("disabled", false);
    fireEvent.click(reset);
    expect(reset).toHaveProperty("disabled", true);
  });

  it("closes on Escape and the close button", () => {
    const { onClose } = renderPanel();
    fireEvent.keyDown(document, { key: "Escape" });
    fireEvent.keyDown(document, { key: "a" });
    fireEvent.click(screen.getByRole("button", { name: copy.close }));
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it("closes on a click outside, but not inside or on its trigger", () => {
    const { onClose, opener } = renderPanel();
    fireEvent.pointerDown(screen.getByRole("heading", { name: copy.title }));
    fireEvent.pointerDown(opener);
    expect(onClose).not.toHaveBeenCalled();
    fireEvent.pointerDown(document.body);
    expect(onClose).toHaveBeenCalledOnce();
  });
});
