import { act, fireEvent, render } from "@testing-library/react";
import { LazyMotion, domAnimation } from "framer-motion";
import { describe, expect, it, vi } from "vitest";
import { mockMatchMedia } from "../../test/helpers";

vi.mock("@fontsource/atkinson-hyperlegible/latin-400.css", () => ({}));
vi.mock("@fontsource/atkinson-hyperlegible/latin-700.css", () => ({}));

async function renderCursor() {
  vi.resetModules();
  const { Cursor } = await import(".");
  return render(
    <LazyMotion features={domAnimation} strict>
      <Cursor />
    </LazyMotion>,
  );
}

const ring = (container: HTMLElement) => container.firstElementChild as HTMLElement;

describe("Cursor", () => {
  it("hides the system cursor and follows the mouse", async () => {
    const { container } = await renderCursor();
    expect(document.body.classList.contains("cursor-none")).toBe(true);
    expect(ring(container).style.opacity).toBe("0");
    act(() => {
      fireEvent.mouseMove(window, { clientX: 50, clientY: 60 });
    });
    expect(ring(container).style.opacity).toBe("1");
  });

  it("grows over interactive elements", async () => {
    const { container } = await renderCursor();
    const button = document.createElement("button");
    document.body.append(button);
    act(() => {
      fireEvent.mouseOver(button);
    });
    expect(ring(container).className).toMatch(/ringHover/);
    act(() => {
      fireEvent.mouseOver(document.body);
    });
    expect(ring(container).className).not.toMatch(/ringHover/);
  });

  it("fades out when the pointer leaves the window", async () => {
    const { container } = await renderCursor();
    act(() => {
      fireEvent.mouseMove(window, { clientX: 1, clientY: 1 });
      fireEvent.mouseLeave(document.documentElement);
    });
    expect(ring(container).style.opacity).toBe("0");
    act(() => {
      fireEvent.mouseEnter(document.documentElement);
    });
    expect(ring(container).style.opacity).toBe("1");
  });

  it("is off on touch devices", async () => {
    mockMatchMedia((q) => q === "(hover: none)");
    const { container } = await renderCursor();
    expect(container.childElementCount).toBe(0);
    expect(document.body.classList.contains("cursor-none")).toBe(false);
  });

  it("is off when the visitor chose the system cursor", async () => {
    localStorage.setItem("a11y-prefs", JSON.stringify({ systemCursor: true }));
    const { container } = await renderCursor();
    expect(container.childElementCount).toBe(0);
  });
});
