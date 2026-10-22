import { fireEvent, render, screen } from "@testing-library/react";
import { LazyMotion, domAnimation } from "framer-motion";
import { describe, expect, it, vi } from "vitest";
import { colophonCopy as copy } from "../../i18n/content";
import { Colophon } from ".";

const info = {
  builtAt: "2026-10-22",
  js: { initialKb: 136, initialFiles: 11, lazyKb: 316, lazyFiles: 36 },
  stack: [
    { name: "react", version: "19.3.1" },
    { name: "vite", version: "8.3.4" },
  ],
};

function renderColophon(response: Promise<Response>) {
  vi.stubGlobal(
    "fetch",
    vi.fn(() => response),
  );
  const onClose = vi.fn();
  const view = render(
    <LazyMotion features={domAnimation} strict>
      <Colophon onClose={onClose} getLenis={() => null} />
    </LazyMotion>,
  );
  return { onClose, ...view, dialog: screen.getByRole("dialog", { name: copy.title }) };
}

const ok = (body: unknown) => Promise.resolve(new Response(JSON.stringify(body), { status: 200 }));

describe("Colophon", () => {
  it("loads the build details on open", async () => {
    const { dialog } = renderColophon(ok(info));
    expect(dialog.getAttribute("aria-busy")).toBe("true");
    expect(screen.getByText(copy.loading)).toBeTruthy();
    expect(await screen.findByText(copy.initialJs("136", 11))).toBeTruthy();
    expect(fetch).toHaveBeenCalledWith("/build-info.json");
    expect(dialog.getAttribute("aria-busy")).toBe("false");
    expect(screen.getByText(new RegExp(copy.lazyJs("316", 36).slice(0, 20)))).toBeTruthy();
    expect(screen.getByText("react")).toBeTruthy();
    expect(screen.getByText(copy.built("October 22, 2026"))).toBeTruthy();
  });

  it("handles missing size and version details (dev server)", async () => {
    renderColophon(ok({ ...info, js: null, stack: [] }));
    expect(await screen.findByText(copy.built("October 22, 2026"))).toBeTruthy();
    expect(screen.queryByText(copy.sizeTitle)).toBeNull();
    expect(screen.queryByText(copy.stackTitle)).toBeNull();
  });

  it("says so when the details can't be loaded", async () => {
    renderColophon(Promise.resolve(new Response("", { status: 404 })));
    expect(await screen.findByText(copy.error)).toBeTruthy();
  });

  it("ignores a response that arrives after closing", async () => {
    let resolve: (r: Response) => void = () => {};
    const { unmount } = renderColophon(new Promise((r) => (resolve = r)));
    unmount();
    resolve(new Response(JSON.stringify(info)));
    await Promise.resolve();
  });

  it("ignores a failure that arrives after closing", async () => {
    let reject: (e: Error) => void = () => {};
    const { unmount } = renderColophon(new Promise((_, r) => (reject = r)));
    unmount();
    reject(new Error("offline"));
    await Promise.resolve();
  });

  it("closes on Escape, the close button and the backdrop; traps Tab", async () => {
    vi.spyOn(HTMLElement.prototype, "offsetParent", "get").mockReturnValue(document.body);
    const { onClose, dialog } = renderColophon(ok(info));
    await screen.findByText(copy.initialJs("136", 11));
    fireEvent.keyDown(dialog, { key: "Tab" });
    fireEvent.keyDown(dialog, { key: "Escape" });
    fireEvent.click(screen.getByRole("button", { name: copy.close }));
    fireEvent.mouseDown(dialog);
    fireEvent.mouseDown(dialog.parentElement!);
    expect(onClose).toHaveBeenCalledTimes(3);
  });
});
