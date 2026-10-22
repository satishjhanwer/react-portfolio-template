import { fireEvent, render, screen } from "@testing-library/react";
import { LazyMotion, domAnimation } from "framer-motion";
import { describe, expect, it, vi } from "vitest";
import { email, experienceNodes, recruiter, site } from "../../i18n/content";

async function renderRecruiter(overrides?: (content: typeof import("../../i18n/content")) => void) {
  vi.resetModules();
  const content = await import("../../i18n/content");
  overrides?.(content);
  const { RecruiterMode } = await import(".");
  const onClose = vi.fn();
  render(
    <LazyMotion features={domAnimation} strict>
      <RecruiterMode onClose={onClose} getLenis={() => null} />
    </LazyMotion>,
  );
  return { onClose };
}

describe("RecruiterMode", () => {
  it("is a modal titled with the name, focusing the close button", async () => {
    await renderRecruiter();
    expect(screen.getByRole("dialog", { name: site.name })).toBeTruthy();
    expect(document.activeElement).toBe(screen.getByRole("button", { name: recruiter.closeLabel }));
  });

  it("shows the highlights, stack and latest roles", async () => {
    await renderRecruiter();
    expect(screen.getAllByRole("listitem").length).toBeGreaterThan(recruiter.stack.length);
    for (const item of recruiter.stack) {
      expect(screen.getByText(item)).toBeTruthy();
    }
    const shown = experienceNodes.slice(0, recruiter.careerCount);
    for (const role of shown) {
      expect(screen.getAllByText(role.role).length).toBeGreaterThan(0);
    }
  });

  it("resolves resume, email and social links", async () => {
    await renderRecruiter();
    const hrefs = screen.getAllByRole("link").map((a) => a.getAttribute("href"));
    expect(hrefs).toContain(`mailto:${email}`);
    const external = screen.getAllByRole("link").filter((a) => a.getAttribute("target") === "_blank");
    for (const a of external) {
      expect(a.getAttribute("rel")).toBe("noopener noreferrer");
    }
    expect(screen.getAllByRole("link").some((a) => a.hasAttribute("download"))).toBe(true);
  });

  it("drops links it can't resolve", async () => {
    await renderRecruiter((content) => {
      content.recruiter.links.push({ label: "Mastodon", kind: "social", social: "Mastodon" });
    });
    expect(screen.queryByRole("link", { name: /Mastodon/ })).toBeNull();
  });

  it("omits the resume link and location when there are none", async () => {
    vi.doMock("../../i18n/content", async (importOriginal) => {
      const actual = await importOriginal<typeof import("../../i18n/content")>();
      return { ...actual, resumeUrl: "", recruiter: { ...actual.recruiter, location: "" } };
    });
    await renderRecruiter();
    vi.doUnmock("../../i18n/content");
    expect(screen.getAllByRole("link").some((a) => a.hasAttribute("download"))).toBe(false);
  });

  it("closes on Escape, the close and full-portfolio buttons, and the backdrop", async () => {
    const { onClose } = await renderRecruiter();
    const dialog = screen.getByRole("dialog");
    fireEvent.keyDown(dialog, { key: "Escape" });
    fireEvent.click(screen.getByRole("button", { name: recruiter.closeLabel }));
    fireEvent.click(screen.getByRole("button", { name: new RegExp(recruiter.fullPortfolio) }));
    fireEvent.mouseDown(dialog);
    expect(onClose).toHaveBeenCalledTimes(3);
    fireEvent.mouseDown(dialog.parentElement!);
    expect(onClose).toHaveBeenCalledTimes(4);
  });

  it("keeps Tab inside the dialog", async () => {
    vi.spyOn(HTMLElement.prototype, "offsetParent", "get").mockReturnValue(document.body);
    await renderRecruiter();
    const last = screen.getByRole("button", { name: new RegExp(recruiter.fullPortfolio) });
    last.focus();
    fireEvent.keyDown(last, { key: "Tab" });
    expect(document.activeElement).toBe(screen.getByRole("button", { name: recruiter.closeLabel }));
  });
});
