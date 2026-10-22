import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { LazyMotion, domAnimation } from "framer-motion";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Result } from "axe-core";

const axeRun = vi.hoisted(() => vi.fn());
vi.mock("axe-core", () => ({ default: { run: axeRun } }));
vi.mock("axe-core/locales/es.json", () => ({
  default: { rules: { "no-explanation-rule": { help: "Ayuda traducida", description: "Descripción traducida" } } },
}));
vi.mock("@fontsource/atkinson-hyperlegible/latin-400.css", () => ({}));
vi.mock("@fontsource/atkinson-hyperlegible/latin-700.css", () => ({}));

function violation(overrides: Partial<Result> = {}): Result {
  return {
    id: "image-alt",
    impact: "critical",
    help: "Images must have alternate text",
    description: "Ensures images have alt text",
    helpUrl: "https://dequeuniversity.com/rules/axe/image-alt",
    tags: [],
    nodes: [
      {
        html: "<img src=x>",
        target: ["#bad"],
        failureSummary: "Fix any of the following:\n  Element has no alt attribute",
        any: [],
        all: [],
        none: [],
        impact: "critical",
      },
    ],
    ...overrides,
  } as Result;
}

function axeResult(violations: Result[], passes = 9, incomplete = 0) {
  return {
    violations,
    passes: Array.from({ length: passes }),
    incomplete: Array.from({ length: incomplete }),
  };
}

async function renderAudit(lang = "en") {
  vi.resetModules();
  window.history.replaceState(null, "", `/?lang=${lang}`);
  const content = await import("../../i18n/content");
  const { A11yAudit } = await import(".");
  const onClose = vi.fn();
  const opener = document.createElement("button");
  document.body.append(opener);
  opener.focus();
  const view = render(
    <LazyMotion features={domAnimation} strict>
      <A11yAudit onClose={onClose} />
    </LazyMotion>,
  );
  return { ...view, onClose, opener, copy: content.a11yAudit, ruleExplanations: content.ruleExplanations };
}

beforeEach(() => {
  axeRun.mockReset();
});

describe("A11yAudit", () => {
  it("shows a running state, then a perfect score", async () => {
    axeRun.mockResolvedValue(axeResult([], 20));
    const { copy } = await renderAudit();
    expect(screen.getByText(copy.running)).toBeTruthy();
    await screen.findByText(copy.cleanTitle);
    expect(screen.getByText(copy.scoreLabel(20, 20))).toBeTruthy();
    expect(screen.getByRole("status").textContent).toContain(copy.scoreAria(100));
  });

  it("excludes its own panel and runs only WCAG A/AA rules", async () => {
    axeRun.mockResolvedValue(axeResult([]));
    await renderAudit();
    await waitFor(() => expect(axeRun).toHaveBeenCalled());
    const [context, options] = axeRun.mock.calls[0];
    expect(context).toEqual({ exclude: [["[data-a11y-audit-panel]"]] });
    expect(options.runOnly.values).toContain("wcag22aa");
  });

  it("groups violations by impact with explanations and node snippets", async () => {
    const long = `<div class="${"x".repeat(120)}"></div>`;
    axeRun.mockResolvedValue(
      axeResult(
        [
          violation(),
          violation({
            id: "made-up-rule",
            impact: undefined,
            help: "Custom help",
            description: "Custom description",
            nodes: [{ html: long, target: [["iframe", "#x"]], any: [], all: [], none: [], impact: null } as never],
          }),
        ],
        8,
        2,
      ),
    );
    const { copy, ruleExplanations } = await renderAudit();
    await screen.findByText(copy.manualReview(2));

    expect(screen.getByText(`${copy.impactTitles.critical} · 1`)).toBeTruthy();
    expect(screen.getByText(`${copy.impactTitles.minor} · 1`)).toBeTruthy();
    expect(screen.getByText(ruleExplanations["image-alt"].title)).toBeTruthy();

    expect(screen.getAllByText("Custom help")).toHaveLength(2);
    expect(screen.getByText(/Custom description/)).toBeTruthy();
    expect(screen.getByText(`${long.slice(0, 87)}…`)).toBeTruthy();
    expect(screen.getAllByRole("button", { name: copy.highlight })).toHaveLength(1);
  });

  it("falls back to axe's own failure summary for unexplained rules", async () => {
    axeRun.mockResolvedValue(axeResult([violation({ id: "unknown-rule" })]));
    await renderAudit();
    expect(await screen.findByText(/Element has no alt attribute/)).toBeTruthy();
  });

  it("uses axe's translated rule text for rules without a hand-written explanation", async () => {
    axeRun.mockResolvedValue(axeResult([violation({ id: "no-explanation-rule", impact: "serious" })]));
    const { copy, ruleExplanations } = await renderAudit("es");
    expect(ruleExplanations["no-explanation-rule"]).toBeUndefined();
    expect(await screen.findByText("Ayuda traducida")).toBeTruthy();
    expect(screen.getByText(/Descripción traducida/)).toBeTruthy();
    expect(screen.getByText(new RegExp(copy.fixFallback.slice(0, 20)))).toBeTruthy();
  });

  it("prefers the hand-written explanation in other languages too", async () => {
    axeRun.mockResolvedValue(axeResult([violation({ id: "color-contrast", impact: "serious" })]));
    const { ruleExplanations } = await renderAudit("es");
    expect(await screen.findByText(ruleExplanations["color-contrast"].title)).toBeTruthy();
  });

  it("colours the score ring by result", async () => {
    axeRun.mockResolvedValue(axeResult([violation()], 9));
    const { copy } = await renderAudit();
    await screen.findByText(copy.scoreLabel(9, 10));
    axeRun.mockResolvedValue(axeResult([violation()], 1));
    fireEvent.click(screen.getByRole("button", { name: copy.rerun }));
    await screen.findByText(copy.scoreLabel(1, 2));
  });

  it("shows an error if axe fails to load", async () => {
    axeRun.mockRejectedValue(new Error("chunk failed"));
    const { copy } = await renderAudit();
    expect(await screen.findByText(copy.loadError)).toBeTruthy();
  });

  it("highlights a node, minimises to a pill, and Escape returns to the results", async () => {
    document.body.insertAdjacentHTML("beforeend", '<img id="bad" src="x">');
    axeRun.mockResolvedValue(axeResult([violation()]));
    const { copy, onClose } = await renderAudit();
    fireEvent.click(await screen.findByRole("button", { name: copy.highlight }));

    const bad = document.getElementById("bad")!;
    expect(bad.hasAttribute("data-a11y-highlight")).toBe(true);
    expect(bad.scrollIntoView).toHaveBeenCalledWith({ behavior: "smooth", block: "center" });
    const pill = screen.getByRole("button", { name: new RegExp(copy.backToResults) });
    expect(document.activeElement).toBe(pill);

    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).not.toHaveBeenCalled();
    expect(screen.getByRole("dialog")).toBeTruthy();

    fireEvent.click(await screen.findByRole("button", { name: copy.highlight }));
    fireEvent.click(screen.getByRole("button", { name: new RegExp(copy.backToResults) }));
    expect(screen.getByRole("dialog")).toBeTruthy();
  });

  it("ignores a node that's no longer on the page", async () => {
    axeRun.mockResolvedValue(axeResult([violation()]));
    const { copy } = await renderAudit();
    fireEvent.click(await screen.findByRole("button", { name: copy.highlight }));
    expect(screen.getByRole("dialog")).toBeTruthy();
  });

  it("scrolls instantly under reduced motion", async () => {
    localStorage.setItem("a11y-prefs", JSON.stringify({ reduceMotion: true }));
    document.body.insertAdjacentHTML("beforeend", '<img id="bad" src="x">');
    axeRun.mockResolvedValue(axeResult([violation()]));
    const { copy } = await renderAudit();
    fireEvent.click(await screen.findByRole("button", { name: copy.highlight }));
    expect(document.getElementById("bad")!.scrollIntoView).toHaveBeenCalledWith({ behavior: "auto", block: "center" });
  });

  it("closes on Escape and the close button, clearing highlights and restoring focus", async () => {
    document.body.insertAdjacentHTML("beforeend", '<img id="bad" src="x">');
    axeRun.mockResolvedValue(axeResult([violation()]));
    const { copy, onClose, unmount, opener } = await renderAudit();
    fireEvent.click(await screen.findByRole("button", { name: copy.highlight }));
    fireEvent.click(screen.getByRole("button", { name: new RegExp(copy.backToResults) }));
    fireEvent.keyDown(document, { key: "Tab" });
    fireEvent.keyDown(document, { key: "Escape" });
    fireEvent.click(screen.getByRole("button", { name: copy.close }));
    expect(onClose).toHaveBeenCalledTimes(2);
    unmount();
    expect(document.querySelector("[data-a11y-highlight]")).toBeNull();
    expect(document.activeElement).toBe(opener);
  });

  it("adds a broken demo card into the projects slot and re-runs", async () => {
    document.body.insertAdjacentHTML("beforeend", "<div data-a11y-demo-slot></div>");
    axeRun.mockResolvedValue(axeResult([]));
    const { copy } = await renderAudit();
    await screen.findByText(copy.cleanTitle);

    const demo = screen.getByRole("button", { name: copy.demoOn });
    fireEvent.click(demo);
    const slot = document.querySelector("[data-a11y-demo-slot]")!;
    expect(slot.textContent).toContain(copy.demoCardTitle);
    await waitFor(() => expect(axeRun).toHaveBeenCalledTimes(2));

    await act(async () => {});
    fireEvent.click(await screen.findByRole("button", { name: copy.demoOff }));
    await waitFor(() => expect(slot.textContent).toBe(""));
  });

  it("puts the demo card in the body when there's no slot", async () => {
    axeRun.mockResolvedValue(axeResult([]));
    const { copy } = await renderAudit();
    fireEvent.click(await screen.findByRole("button", { name: copy.demoOn }));
    expect(document.body.textContent).toContain(copy.demoCardTitle);
  });

  it("ignores a result that arrives after closing", async () => {
    let resolve: (v: unknown) => void = () => {};
    axeRun.mockReturnValue(new Promise((r) => (resolve = r)));
    const { unmount } = await renderAudit();
    await waitFor(() => expect(axeRun).toHaveBeenCalled());
    unmount();
    await act(async () => resolve(axeResult([])));
  });

  it("ignores a failure that arrives after closing", async () => {
    let reject: (e: Error) => void = () => {};
    axeRun.mockReturnValue(new Promise((_, r) => (reject = r)));
    const { unmount } = await renderAudit();
    await waitFor(() => expect(axeRun).toHaveBeenCalled());
    unmount();
    await act(async () => reject(new Error("late")));
  });
});
