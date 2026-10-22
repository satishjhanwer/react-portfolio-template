import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { siteConfig } from "../site.config";
import { stubLocation } from "../test/helpers";

vi.mock("../site.config", async (importOriginal) => {
  const { siteConfig, ...rest } = await importOriginal<typeof import("../site.config")>();
  return {
    ...rest,
    siteConfig: {
      ...siteConfig,
      get analytics() {
        return { cloudflareToken: "test-token", hosts: ["your-domain.com"] };
      },
    },
  };
});

async function loadStartup() {
  vi.resetModules();
  return import("./startup");
}

const beacon = () => document.head.querySelector<HTMLScriptElement>('script[src*="cloudflareinsights"]');

function optOut(gpc: boolean, dnt: string | null) {
  Object.defineProperty(navigator, "globalPrivacyControl", { value: gpc, configurable: true });
  Object.defineProperty(navigator, "doNotTrack", { value: dnt, configurable: true });
}

afterEach(() => {
  delete (navigator as { globalPrivacyControl?: boolean }).globalPrivacyControl;
  delete (navigator as { doNotTrack?: string | null }).doNotTrack;
});

describe("startAnalytics", () => {
  beforeEach(() => {
    stubLocation("https://your-domain.com/");
    vi.spyOn(document, "readyState", "get").mockReturnValue("complete");
    vi.stubGlobal("requestIdleCallback", (cb: () => void) => {
      cb();
      return 1;
    });
  });

  it("injects the beacon with the token on the production host", async () => {
    const { startAnalytics } = await loadStartup();
    startAnalytics();
    const script = beacon();
    expect(script?.src).toBe("https://static.cloudflareinsights.com/beacon.min.js");
    expect(script?.defer).toBe(true);
    expect(JSON.parse(script!.dataset.cfBeacon!)).toEqual({
      token: siteConfig.analytics.cloudflareToken,
      spa: false,
    });
  });

  it.each(["localhost", "127.0.0.1", "your-username.github.io"])("never reports from %s", async (host) => {
    stubLocation(`http://${host}/`);
    const { startAnalytics } = await loadStartup();
    startAnalytics();
    expect(beacon()).toBeNull();
  });

  it("respects Global Privacy Control", async () => {
    optOut(true, null);
    const { startAnalytics } = await loadStartup();
    startAnalytics();
    expect(beacon()).toBeNull();
  });

  it("respects Do Not Track", async () => {
    optOut(false, "1");
    const { startAnalytics } = await loadStartup();
    startAnalytics();
    expect(beacon()).toBeNull();
  });

  it("does nothing without a token", async () => {
    const { startAnalytics } = await loadStartup();
    const { analytics } = await import("../i18n/content");
    analytics.cloudflareToken = "";
    startAnalytics();
    expect(beacon()).toBeNull();
  });

  it("waits for the load event when the page is still loading", async () => {
    vi.spyOn(document, "readyState", "get").mockReturnValue("loading");
    const { startAnalytics } = await loadStartup();
    startAnalytics();
    expect(beacon()).toBeNull();
    window.dispatchEvent(new Event("load"));
    expect(beacon()).not.toBeNull();
  });

  it("falls back to a timeout without requestIdleCallback", async () => {
    vi.useFakeTimers();
    vi.stubGlobal("requestIdleCallback", undefined);
    delete (window as Partial<Window>).requestIdleCallback;
    const { startAnalytics } = await loadStartup();
    startAnalytics();
    vi.runAllTimers();
    expect(beacon()).not.toBeNull();
    vi.useRealTimers();
  });
});

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
