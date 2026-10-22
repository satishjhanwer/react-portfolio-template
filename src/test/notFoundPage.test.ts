import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import html from "../../public/404.html?raw";
import en from "../i18n/locales/en";
import es from "../i18n/locales/es";
import fr from "../i18n/locales/fr";
import ja from "../i18n/locales/ja";
import { stubLanguages } from "./helpers";

const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((m) => m[1]);
const [headScript, bodyScript] = scripts;
const body = html.match(/<body>([\s\S]*?)<script>/)![1];

function load(path = "/missing") {
  window.history.replaceState(null, "", path);
  new Function(headScript)();
  document.body.innerHTML = body;
  new Function(bodyScript)();
}

const text = (sel: string) => document.querySelector(sel)!.textContent;
const tables = () => {
  const src = bodyScript.match(/var text = (\{[\s\S]*?\n {8}\});/)![1];
  return new Function(`return ${src}`)() as Record<string, Record<string, string>>;
};

beforeEach(() => {
  stubLanguages(["en-US"]);
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date(2026, 9, 22, 12, 0));
});

afterEach(() => {
  vi.useRealTimers();
  document.documentElement.lang = "";
  document.title = "";
});

describe("404 page", () => {
  it("shows the missing path and links to the main sections and the resume", () => {
    load("/projcts/old%20page");
    expect(text("h1")).toBe("Page not found");
    expect(text("#path")).toBe("/projcts/old page");
    const hrefs = [...document.querySelectorAll("a")].map((a) => a.getAttribute("href"));
    expect(hrefs).toEqual([
      "/",
      "/#projects",
      "/#experience",
      "/#contact",
      "/resume.pdf",
      expect.stringMatching(/^mailto:/),
    ]);
  });

  it("survives a malformed path", () => {
    load("/%E0%A4%A");
    expect(text("#path")).toBe("/%E0%A4%A");
  });

  it.each([
    ["saved language wins", "ja", ["fr"], "ja"],
    ["browser language", null, ["fr-CA"], "fr"],
    ["unsupported falls back to English", null, ["de"], "en"],
    ["invalid saved value is ignored", "xx", ["es"], "es"],
  ])("%s", (_, saved, languages, expected) => {
    if (saved) {
      localStorage.setItem("lang", saved);
    }
    stubLanguages(languages as string[]);
    load();
    expect(document.documentElement.lang).toBe(expected);
    expect(text("h1")).toBe(tables()[expected as string].title);
    expect(document.querySelector("nav")!.getAttribute("aria-label")).toBe(tables()[expected as string].nav);
  });

  it("follows the saved theme, else the time of day", () => {
    localStorage.setItem("theme", "arctic");
    load();
    expect(document.documentElement.getAttribute("data-theme")).toBe("arctic");
    localStorage.removeItem("theme");
    vi.setSystemTime(new Date(2026, 9, 22, 20, 0));
    load();
    expect(document.documentElement.getAttribute("data-theme")).toBe("sunset");
  });

  it("applies text size, high contrast and underlined links", () => {
    localStorage.setItem("a11y-prefs", JSON.stringify({ textSize: "130", highContrast: true, underlineLinks: true }));
    load();
    const r = document.documentElement;
    expect(r.getAttribute("data-text-size")).toBe("130");
    expect(r.getAttribute("data-contrast")).toBe("high");
    expect(r.getAttribute("data-links")).toBe("underline");
  });

  it("ignores corrupt saved prefs", () => {
    localStorage.setItem("a11y-prefs", "{oops");
    load();
    expect(document.documentElement.hasAttribute("data-contrast")).toBe(false);
  });

  it("has the same keys in every language", () => {
    const t = tables();
    for (const lang of ["es", "fr", "ja"]) {
      expect(Object.keys(t[lang])).toEqual(Object.keys(t.en));
    }
  });

  it.each([
    ["en", en],
    ["es", es],
    ["fr", fr],
    ["ja", ja],
  ])("uses the site's own %s labels for the links", (lang, messages) => {
    const t = tables()[lang];
    expect(t.projects).toBe(messages.navLinks.projects.label);
    expect(t.experience).toBe(messages.navLinks.experience.label);
    expect(t.contact).toBe(messages.navLinks.contact.label);
    expect(t.resume).toBe(messages.hero.ctaGhost);
  });
});
