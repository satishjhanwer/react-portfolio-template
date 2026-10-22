import { beforeEach, describe, expect, it, vi } from "vitest";
import { stubLanguages, stubLocation, throwingStorage } from "../test/helpers";

async function loadLocale() {
  vi.resetModules();
  return import("./locale");
}

beforeEach(() => {
  stubLanguages(["en-US"]);
});

describe("locale resolution", () => {
  it("defaults to English", async () => {
    stubLanguages([]);
    const { locale } = await loadLocale();
    expect(locale).toBe("en");
  });

  it("uses the browser language, ignoring the region", async () => {
    stubLanguages(["fr-CA", "en"]);
    expect((await loadLocale()).locale).toBe("fr");
  });

  it("skips unsupported browser languages", async () => {
    stubLanguages(["de-DE", "ja-JP"]);
    expect((await loadLocale()).locale).toBe("ja");
  });

  it("prefers the saved language over the browser", async () => {
    stubLanguages(["fr"]);
    localStorage.setItem("lang", "es");
    expect((await loadLocale()).locale).toBe("es");
  });

  it("prefers ?lang= over everything", async () => {
    localStorage.setItem("lang", "es");
    window.history.replaceState(null, "", "/?lang=ja");
    expect((await loadLocale()).locale).toBe("ja");
  });

  it("ignores invalid query and storage values", async () => {
    localStorage.setItem("lang", "xx");
    window.history.replaceState(null, "", "/?lang=klingon");
    expect((await loadLocale()).locale).toBe("en");
  });

  it("survives blocked storage", async () => {
    throwingStorage();
    stubLanguages(["es"]);
    expect((await loadLocale()).locale).toBe("es");
  });

  it("sets <html lang>", async () => {
    window.history.replaceState(null, "", "/?lang=fr");
    await loadLocale();
    expect(document.documentElement.lang).toBe("fr");
  });
});

describe("switchLocale", () => {
  it("does nothing for the current locale", async () => {
    const { switchLocale } = await loadLocale();
    const { reload } = stubLocation("http://localhost/");
    switchLocale("en");
    expect(reload).not.toHaveBeenCalled();
    expect(localStorage.getItem("lang")).toBeNull();
  });

  it("saves the choice and reloads", async () => {
    const { switchLocale } = await loadLocale();
    const { reload } = stubLocation("http://localhost/#projects");
    switchLocale("ja");
    expect(localStorage.getItem("lang")).toBe("ja");
    expect(reload).toHaveBeenCalledOnce();
  });

  it("rewrites ?lang= so the reload doesn't switch back", async () => {
    window.history.replaceState(null, "", "/?lang=fr");
    const { switchLocale } = await loadLocale();
    const replace = vi.spyOn(window.history, "replaceState");
    const { reload } = stubLocation("http://localhost/?lang=fr");
    switchLocale("es");
    expect(String(replace.mock.calls[0][2])).toBe("http://localhost/?lang=es");
    expect(reload).toHaveBeenCalledOnce();
  });

  it("doesn't reload when the choice can't be saved", async () => {
    const { switchLocale } = await loadLocale();
    throwingStorage();
    const { reload } = stubLocation("http://localhost/");
    switchLocale("fr");
    expect(reload).not.toHaveBeenCalled();
  });
});
