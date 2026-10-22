// @vitest-environment node
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  type Answers,
  applyReplacements,
  buildReplacements,
  cleanDomain,
  initialsOf,
  isTimeZone,
  personalize,
} from "./setup-lib.ts";

const answers: Answers = {
  fullName: "Ada Lovelace",
  jobTitle: "Staff Engineer",
  domain: "ada.dev",
  email: "ada@ada.dev",
  timeZone: "Europe/Paris",
  github: "ada",
  linkedin: "ada-l",
  x: "",
};

const run = (text: string, a = answers) => applyReplacements(text, buildReplacements(a));

describe("setup", () => {
  it("cleans domains, checks time zones and derives initials", () => {
    expect(cleanDomain(" https://ada.dev/ ")).toBe("ada.dev");
    expect(isTimeZone("Asia/Tokyo")).toBe(true);
    expect(isTimeZone("Mars/Olympus")).toBe(false);
    expect(initialsOf("Ada King Lovelace")).toBe("AL");
    expect(initialsOf("Cher")).toBe("CH");
  });

  it("replaces the name, title, contact details and profiles", () => {
    expect(run("<title>Jane Doe - Frontend Engineer</title>")).toBe("<title>Ada Lovelace - Staff Engineer</title>");
    expect(run('nameFirst: "JANE", nameLast: "DOE", initials: "JD"')).toBe(
      'nameFirst: "ADA", nameLast: "LOVELACE", initials: "AL"',
    );
    expect(run("mailto:hello@your-domain.com https://your-domain.com/")).toBe("mailto:ada@ada.dev https://ada.dev/");
    expect(run("https://github.com/your-username/your-username.github.io.git")).toBe(
      "https://github.com/ada/ada.github.io.git",
    );
    expect(run("linkedin.com/in/your-username/")).toBe("linkedin.com/in/ada-l/");
  });

  it("leaves a skipped profile as a placeholder", () => {
    expect(run("https://x.com/your-username")).toBe("https://x.com/your-username");
  });

  it("rewrites files on disk, the config's time zone only, and fills in the licence", () => {
    const root = mkdtempSync(join(tmpdir(), "setup-"));
    mkdirSync(join(root, "src"));
    writeFileSync(join(root, "src/site.config.ts"), 'name: "Jane Doe", timeZone: "Europe/London"');
    writeFileSync(join(root, "a.test.ts"), 'timeZone: "Europe/London"');
    writeFileSync(join(root, "LICENSE"), "Copyright (c) [YEAR] [YOUR NAME]");
    expect(personalize(root, answers, ["src/site.config.ts", "a.test.ts"])).toEqual(["src/site.config.ts", "LICENSE"]);
    expect(readFileSync(join(root, "src/site.config.ts"), "utf-8")).toBe(
      'name: "Ada Lovelace", timeZone: "Europe/Paris"',
    );
    expect(readFileSync(join(root, "LICENSE"), "utf-8")).toBe(`Copyright (c) ${new Date().getFullYear()} Ada Lovelace`);
  });
});
