import { fireEvent, render, screen, within } from "@testing-library/react";
import { LazyMotion, domAnimation } from "framer-motion";
import { describe, expect, it, vi } from "vitest";
import { shortcuts, shortcutsCopy } from "../../i18n/content";
import { siteConfig } from "../../site.config";
import { Shortcuts } from ".";

function renderSheet() {
  const onClose = vi.fn();
  render(
    <LazyMotion features={domAnimation} strict>
      <Shortcuts onClose={onClose} getLenis={() => null} />
    </LazyMotion>,
  );
  return { onClose, dialog: screen.getByRole("dialog", { name: shortcutsCopy.title }) };
}

describe("Shortcuts", () => {
  it("is a modal dialog that focuses its close button", () => {
    const { dialog } = renderSheet();
    expect(dialog.getAttribute("aria-modal")).toBe("true");
    expect(document.activeElement).toBe(screen.getByRole("button", { name: shortcutsCopy.close }));
  });

  it("lists every shortcut with its keys", () => {
    const { dialog } = renderSheet();
    const terms = within(dialog).getAllByRole("term");
    expect(terms).toHaveLength(siteConfig.shortcuts.length);
    for (const s of shortcuts) {
      expect(within(dialog).getByText(s.label)).toBeTruthy();
    }
    expect(terms[0].textContent).toBe("CtrlK");
  });

  it("never spells out the Konami code", () => {
    const { dialog } = renderSheet();
    expect(dialog.textContent).not.toMatch(/B\s*A/);
  });

  it("closes on Escape, the close button and the backdrop", () => {
    const { onClose, dialog } = renderSheet();
    fireEvent.keyDown(dialog, { key: "Escape" });
    fireEvent.click(screen.getByRole("button", { name: shortcutsCopy.close }));
    fireEvent.mouseDown(dialog);
    expect(onClose).toHaveBeenCalledTimes(2);
    fireEvent.mouseDown(dialog.parentElement!);
    expect(onClose).toHaveBeenCalledTimes(3);
  });

  it("keeps Tab inside the dialog", () => {
    vi.spyOn(HTMLElement.prototype, "offsetParent", "get").mockReturnValue(document.body);
    const { dialog } = renderSheet();
    const close = screen.getByRole("button", { name: shortcutsCopy.close });
    fireEvent.keyDown(dialog, { key: "Tab" });
    expect(document.activeElement).toBe(close);
  });
});
