import { describe, expect, it, vi } from "vitest";

async function loadStartup() {
  vi.resetModules();
  return import("./startup");
}

describe("logConsoleHint", () => {
  it("prints the easter-egg hint in the theme colours", async () => {
    document.documentElement.style.setProperty("--purple", "#123456");
    const info = vi.spyOn(console, "info").mockImplementation(() => {});
    const { logConsoleHint } = await loadStartup();
    const { easterEgg } = await import("../i18n/content");
    logConsoleHint();
    const [message, primary] = info.mock.calls[0];
    expect(message).toContain(easterEgg.consoleTitle);
    expect(message).toContain(easterEgg.consoleHint);
    expect(primary).toContain("#123456");
    document.documentElement.style.removeProperty("--purple");
  });
});
