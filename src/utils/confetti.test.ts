import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { burst } from "./confetti";

const canvas = () => document.querySelector("canvas.confetti-canvas");

describe("burst", () => {
  let ctx: Record<string, ReturnType<typeof vi.fn>>;

  beforeEach(() => {
    vi.useFakeTimers();
    ctx = Object.fromEntries(
      ["scale", "clearRect", "save", "translate", "rotate", "fillRect", "restore"].map((k) => [k, vi.fn()]),
    );
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(ctx as unknown as CanvasRenderingContext2D);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("adds a decorative canvas, animates, then removes it", () => {
    burst();
    expect(canvas()?.getAttribute("aria-hidden")).toBe("true");
    vi.advanceTimersToNextFrame();
    expect(ctx.fillRect).toHaveBeenCalled();
    for (let i = 0; i < 600 && canvas(); i++) {
      vi.advanceTimersToNextFrame();
    }
    expect(canvas()).toBeNull();
  });

  it("caps the pixel ratio at 1.5", () => {
    vi.stubGlobal("devicePixelRatio", 3);
    burst();
    expect(ctx.scale).toHaveBeenCalledWith(1.5, 1.5);
  });

  it("does nothing without a 2D context", () => {
    vi.mocked(HTMLCanvasElement.prototype.getContext).mockReturnValue(null);
    burst();
    expect(canvas()).toBeNull();
  });
});
