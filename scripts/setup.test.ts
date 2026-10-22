// @vitest-environment node
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  type Answers,
  applyReplacements,
  buildReplacements,
  cleanDomain,
  initialsOf,
  personalize,
} from "./setup-lib.ts";

const answers: Answers = {
  fullName: "Ada Lovelace",
  jobTitle: "Staff Engineer",
  domain: "ada.dev",
  email: "ada@ada.dev",
  github: "ada",
  linkedin: "ada-l",
  x: "",
};

const run = (text: string, a = answers) => applyReplacements(text, buildReplacements(a));

describe("setup", () => {
  it("cleans domains and derives initials", () => {
    expect(cleanDomain(" https://ada.dev/ ")).toBe("ada.dev");
    expect(initialsOf("Ada King Lovelace")).toBe("AL");
    expect(initialsOf("Cher")).toBe("CH");
  });

  it("replaces the name, title, contact details and profiles", () => {
    expect(run("<title>Jane Doe - Frontend Engineer</title>")).toBe("<title>Ada Lovelace - Staff Engineer</title>");
    expect(run('nameFirst: "JANE", nameLast: "DOE", initials: "JD"')).toBe(
      'nameFirst: "ADA", nameLast: "LOVELACE", initials: "AL"',
    );
    expect(run("mailto:hello@your-domain.com https://your-domain.com/")).toBe("mailto:ada@ada.dev https://ada.dev/");
    expect(run("https://github.com/your-username")).toBe("https://github.com/ada");
    expect(run("linkedin.com/in/your-username/")).toBe("linkedin.com/in/ada-l/");
  });

  it("leaves a skipped profile as a placeholder", () => {
    expect(run("https://x.com/your-username")).toBe("https://x.com/your-username");
  });

  it("rewrites files on disk and fills in the licence", () => {
    const root = mkdtempSync(join(tmpdir(), "setup-"));
    writeFileSync(join(root, "a.ts"), 'name: "Jane Doe"');
    writeFileSync(join(root, "b.ts"), "untouched");
    writeFileSync(join(root, "LICENSE"), "Copyright (c) [YEAR] [YOUR NAME]");
    expect(personalize(root, answers, ["a.ts", "b.ts"])).toEqual(["a.ts", "LICENSE"]);
    expect(readFileSync(join(root, "a.ts"), "utf-8")).toBe('name: "Ada Lovelace"');
    expect(readFileSync(join(root, "LICENSE"), "utf-8")).toBe(`Copyright (c) ${new Date().getFullYear()} Ada Lovelace`);
  });
});
