import { describe, expect, it } from "vitest";
import sprite from "../assets/icons/sprite.svg?raw";
import { siteConfig } from "../site.config";

const symbolIds = new Set([...sprite.matchAll(/<symbol[^>]*\sid="([^"]+)"/g)].map((m) => m[1]));

describe("sprite icons", () => {
  const used = [
    ...siteConfig.skillCategories.flatMap((c) => c.icons.map((i) => i.icon)),
    ...siteConfig.socials.map((s) => s.icon),
  ];

  it.each(used)("%s exists in sprite.svg", (id) => {
    expect(symbolIds.has(id)).toBe(true);
  });

  it("has no duplicate symbol ids", () => {
    const all = [...sprite.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
    expect(all.length - new Set(all).size).toBe(0);
  });
});

describe("site config", () => {
  it("has unique nav ids", () => {
    const ids = siteConfig.navLinks.map((l) => l.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("has unique project titles", () => {
    const titles = siteConfig.projects.map((p) => p.title);
    expect(new Set(titles).size).toBe(titles.length);
  });
});
