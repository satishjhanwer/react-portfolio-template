// @vitest-environment node
import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  type Answers,
  addCopyright,
  applyReplacements,
  buildReplacements,
  cleanDomain,
  initialsOf,
  personalize,
  trackedTextFiles,
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

  it("rewrites files on disk and adds the user's copyright to the licence", () => {
    const root = mkdtempSync(join(tmpdir(), "setup-"));
    writeFileSync(join(root, "a.ts"), 'name: "Jane Doe"');
    writeFileSync(join(root, "b.ts"), "untouched");
    writeFileSync(join(root, "LICENSE"), "MIT License\n\nCopyright (c) 2026 Template Author\n");
    expect(personalize(root, answers, ["a.ts", "b.ts"])).toEqual(["a.ts", "LICENSE"]);
    expect(readFileSync(join(root, "a.ts"), "utf-8")).toBe('name: "Ada Lovelace"');
    expect(readFileSync(join(root, "LICENSE"), "utf-8")).toBe(
      `MIT License\n\nCopyright (c) ${new Date().getFullYear()} Ada Lovelace\nCopyright (c) 2026 Template Author\n`,
    );
  });
});

describe("addCopyright", () => {
  it("doesn't add the same line twice", () => {
    const once = addCopyright("Copyright (c) 2026 Template Author", "Ada Lovelace", 2027);
    expect(once).toBe("Copyright (c) 2027 Ada Lovelace\nCopyright (c) 2026 Template Author");
    expect(addCopyright(once, "Ada Lovelace", 2027)).toBe(once);
  });
});

describe("trackedTextFiles", () => {
  it("lists tracked text files except docs, community files and the setup scripts", () => {
    const root = mkdtempSync(join(tmpdir(), "setup-"));
    const files = [
      "src/site.config.ts",
      "index.html",
      "README.md",
      "CONTRIBUTING.md",
      ".github/PULL_REQUEST_TEMPLATE.md",
      "scripts/setup-lib.ts",
      "public/photo.jpg",
    ];
    mkdirSync(join(root, "src"));
    mkdirSync(join(root, ".github"));
    mkdirSync(join(root, "scripts"));
    mkdirSync(join(root, "public"));
    for (const f of files) {
      writeFileSync(join(root, f), "x");
    }
    execFileSync("git", ["init", "-q"], { cwd: root });
    execFileSync("git", ["add", "."], { cwd: root });
    expect(trackedTextFiles(root).sort()).toEqual(["index.html", "src/site.config.ts"]);
  });
});
