import { describe, expect, it, vi } from "vitest";
import { locales, siteConfig } from "../site.config";
import { yearsExperience } from "../utils/experience";
import en from "./locales/en";
import es from "./locales/es";
import fr from "./locales/fr";
import ja from "./locales/ja";

async function loadContent(lang: string) {
  vi.resetModules();
  window.history.replaceState(null, "", `/?lang=${lang}`);
  return import("./content");
}

function shapeDiff(base: unknown, other: unknown, path = ""): string[] {
  if (typeof base === "function") {
    return typeof other === "function" ? [] : [`${path}: expected a function`];
  }
  if (Array.isArray(base)) {
    if (!Array.isArray(other)) {
      return [`${path}: expected an array`];
    }
    if (base.length !== other.length) {
      return [`${path}: ${other.length} items, English has ${base.length}`];
    }
    return base.flatMap((item, i) => shapeDiff(item, other[i], `${path}[${i}]`));
  }
  if (base && typeof base === "object") {
    if (!other || typeof other !== "object") {
      return [`${path}: expected an object`];
    }
    const a = Object.keys(base);
    const b = Object.keys(other);
    return [
      ...a.filter((k) => !b.includes(k)).map((k) => `${path}.${k}: missing`),
      ...b.filter((k) => !a.includes(k)).map((k) => `${path}.${k}: not in English`),
      ...a
        .filter((k) => b.includes(k))
        .flatMap((k) =>
          shapeDiff((base as Record<string, unknown>)[k], (other as Record<string, unknown>)[k], `${path}.${k}`),
        ),
    ];
  }
  return typeof base === typeof other ? [] : [`${path}: expected ${typeof base}`];
}

describe("translations", () => {
  it.each([
    ["es", es],
    ["fr", fr],
    ["ja", ja],
  ])("%s has exactly the same structure as English", (_, messages) => {
    expect(shapeDiff(en, messages)).toEqual([]);
  });
});

describe.each(locales)("content in %s", (lang) => {
  it("builds every export without missing text", async () => {
    const content = await loadContent(lang);
    expect(content.navLinks.map((l) => l.id)).toEqual(siteConfig.navLinks.map((l) => l.id));
    for (const link of content.navLinks) {
      expect(link.label).toBeTruthy();
    }
    expect(content.projects).toHaveLength(siteConfig.projects.length);
    expect(content.experienceNodes).toHaveLength(siteConfig.experienceNodes.length);
    expect(content.a11yPrefsCopy.vision.options.every((o) => o.label)).toBe(true);
  });

  it("keeps ids and URLs from the config", async () => {
    const content = await loadContent(lang);
    expect(content.email).toBe(siteConfig.email);
    expect(content.socials).toEqual(siteConfig.socials);
    expect(content.projects.map((p) => p.title)).toEqual(siteConfig.projects.map((p) => p.title));
  });
});

describe("derived content", () => {
  it("fills the years stat from careerStart", async () => {
    const { stats } = await loadContent("en");
    expect(stats[0].value).toBe(yearsExperience);
  });

  it("gives projects unique anchor ids built from the title", async () => {
    const { projects } = await loadContent("en");
    const ids = projects.map((p) => p.anchorId);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) {
      expect(id).toMatch(/^project-[a-z0-9]+(-[a-z0-9]+)*$/);
    }
  });

  it("adds the availability date when there is one", async () => {
    const { availability, availabilityFull, availabilitySince } = await loadContent("en");
    expect(availabilityFull).toBe(
      availability.since ? `${availability.full} · ${availabilitySince(availability.since)}` : availability.full,
    );
  });
});

describe("loading", () => {
  it("falls back to English when a language file fails to load", async () => {
    vi.doMock("./locales/fr", () => {
      throw new Error("offline");
    });
    const { heading } = await loadContent("fr");
    expect(heading).toEqual(en.heading);
    vi.doUnmock("./locales/fr");
  });

  it("names the missing text when a language file lacks an id", async () => {
    vi.doMock("./locales/es", () => ({
      default: { ...es, navLinks: {} },
    }));
    await expect(loadContent("es")).rejects.toThrow(/No "es" text for "about"/);
    vi.doUnmock("./locales/es");
  });
});
