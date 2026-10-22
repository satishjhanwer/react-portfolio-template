import { describe, expect, it, vi } from "vitest";
import { siteConfig } from "../../site.config";

async function loadCommands(options: { lang?: string; canInstall?: boolean } = {}) {
  vi.resetModules();
  window.history.replaceState(null, "", `/?lang=${options.lang ?? "en"}`);
  vi.doMock("../../utils/pwa", () => ({ canInstallApp: () => options.canInstall ?? false }));
  const mod = await import("./commands");
  vi.doUnmock("../../utils/pwa");
  return mod;
}

describe("availableCommands", () => {
  it("has unique ids", async () => {
    const { availableCommands } = await loadCommands({ canInstall: true });
    const ids = availableCommands().map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("has a command for every nav section, project and social link", async () => {
    const { availableCommands } = await loadCommands();
    const ids = availableCommands().map((c) => c.id);
    for (const { id } of siteConfig.navLinks) {
      expect(ids).toContain(`nav-${id}`);
    }
    expect(ids.filter((id) => id.startsWith("project-"))).toHaveLength(siteConfig.projects.length);
    expect(ids.filter((id) => id.startsWith("social-"))).toHaveLength(siteConfig.socials.length);
  });

  it("only offers install when the browser allows it", async () => {
    expect((await loadCommands({ canInstall: false })).availableCommands().map((c) => c.id)).not.toContain(
      "action-install",
    );
    expect((await loadCommands({ canInstall: true })).availableCommands().map((c) => c.id)).toContain("action-install");
  });

  it("offers every language except the current one", async () => {
    const { availableCommands } = await loadCommands({ lang: "fr" });
    const languages = availableCommands()
      .filter((c) => c.action.type === "locale")
      .map((c) => (c.action.type === "locale" ? c.action.locale : null));
    expect(languages.sort()).toEqual(["en", "es", "ja"]);
  });

  it("offers every theme except the current choice", async () => {
    const { availableCommands } = await loadCommands();
    const themes = () =>
      availableCommands()
        .filter((c) => c.action.type === "theme")
        .map((c) => c.id);
    expect(themes()).toEqual(["theme-copper", "theme-night", "theme-sakura"]);
    const { setThemeChoice } = await import("../../utils/theme");
    setThemeChoice("night");
    expect(themes()).toEqual(["theme-auto", "theme-copper", "theme-sakura"]);
  });

  it("downloads the contact card", async () => {
    const { availableCommands } = await loadCommands();
    expect(availableCommands().find((c) => c.id === "action-save-contact")?.action).toEqual({
      type: "href",
      href: "/contact.vcf",
      download: true,
    });
  });

  it("marks only the retro easter egg as secret", async () => {
    const { availableCommands } = await loadCommands();
    expect(
      availableCommands()
        .filter((c) => c.secret)
        .map((c) => c.id),
    ).toEqual(["action-retro"]);
  });

  it("scrolls project commands to the card, falling back to the section", async () => {
    const { availableCommands } = await loadCommands();
    const project = availableCommands().find((c) => c.group === "projects")!;
    expect(project.action).toEqual({ type: "scroll", target: project.id, fallback: "projects" });
  });

  it("opens social links in a new tab", async () => {
    const { availableCommands } = await loadCommands();
    for (const c of availableCommands().filter((x) => x.group === "social")) {
      expect(c.action).toMatchObject({ type: "href", external: true });
      expect(c.icon).toBeTruthy();
    }
  });
});
