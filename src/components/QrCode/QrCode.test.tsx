import { fireEvent, render, screen } from "@testing-library/react";
import { LazyMotion, domAnimation } from "framer-motion";
import { describe, expect, it, vi } from "vitest";
import { contactCardCopy as copy } from "../../i18n/content";
import { QrCode } from ".";

function renderQr() {
  const onClose = vi.fn();
  render(
    <LazyMotion features={domAnimation} strict>
      <QrCode onClose={onClose} getLenis={() => null} />
    </LazyMotion>,
  );
  return { onClose, dialog: screen.getByRole("dialog", { name: copy.qrTitle }) };
}

describe("QrCode", () => {
  it("shows the site QR with a descriptive alt and focuses close", () => {
    renderQr();
    const img = screen.getByRole("img");
    expect(img.getAttribute("src")).toBe("/qr-site.svg");
    expect(img.getAttribute("alt")).toBe(copy.qrAlt("your-domain.com"));
    expect(document.activeElement).toBe(screen.getByRole("button", { name: copy.qrClose }));
  });

  it("switches to the recruiter link", () => {
    renderQr();
    const recruiter = screen.getByRole("button", { name: copy.variants.recruiter });
    expect(recruiter.getAttribute("aria-pressed")).toBe("false");
    fireEvent.click(recruiter);
    expect(recruiter.getAttribute("aria-pressed")).toBe("true");
    expect(screen.getByRole("img").getAttribute("src")).toBe("/qr-recruiter.svg");
    expect(screen.getByText("your-domain.com/?mode=recruiter")).toBeTruthy();
  });

  it("offers the contact card download", () => {
    renderQr();
    const link = screen.getByRole("link", { name: copy.save });
    expect(link.getAttribute("href")).toBe("/contact.vcf");
    expect(link.hasAttribute("download")).toBe(true);
  });

  it("closes on Escape, the close button and the backdrop; traps Tab", () => {
    vi.spyOn(HTMLElement.prototype, "offsetParent", "get").mockReturnValue(document.body);
    const { onClose, dialog } = renderQr();
    fireEvent.keyDown(dialog, { key: "Tab" });
    fireEvent.keyDown(dialog, { key: "Escape" });
    fireEvent.click(screen.getByRole("button", { name: copy.qrClose }));
    fireEvent.mouseDown(dialog);
    fireEvent.mouseDown(dialog.parentElement!);
    expect(onClose).toHaveBeenCalledTimes(3);
  });
});
