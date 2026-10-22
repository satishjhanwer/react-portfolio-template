// @vitest-environment node
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  KEEP,
  applyMirror,
  commitAndPush,
  deployMessage,
  findLeaks,
  forbiddenStrings,
  planMirror,
  prepareClone,
  scanDist,
} from "./deploy-lib.ts";

const git = (cwd: string, ...args: string[]) => execFileSync("git", args, { cwd }).toString().trim();

function write(dir: string, files: Record<string, string>) {
  for (const [path, content] of Object.entries(files)) {
    mkdirSync(dirname(join(dir, path)), { recursive: true });
    writeFileSync(join(dir, path), content);
  }
}

function fakePagesRepo(files: Record<string, string>) {
  const base = mkdtempSync(join(tmpdir(), "pages-"));
  const remote = join(base, "remote.git");
  execFileSync("git", ["init", "--quiet", "--bare", "--initial-branch=main", remote]);
  const seed = join(base, "seed");
  execFileSync("git", ["clone", "--quiet", remote, seed]);
  git(seed, "config", "user.email", "test@example.com");
  git(seed, "config", "user.name", "Test");
  write(seed, files);
  git(seed, "add", "--all");
  git(seed, "commit", "--quiet", "-m", "initial");
  git(seed, "push", "--quiet", "origin", "HEAD");
  return { base, remote };
}

describe("leak guard", () => {
  const forbidden = forbiddenStrings("D:\\Projects\\private-source", ["my-package"]);

  it("flags the given names, local paths and source maps", () => {
    const leaks = findLeaks(
      [
        { path: "index.html", content: "<html>ok</html>" },
        { path: "assets/a.js", content: 'name:"My-Package"' },
        { path: "assets/c.js", content: "//# sourceMappingURL=c.js.map" },
        { path: "assets/c.js.map", content: "{}" },
        { path: "build-info.json", content: '{"from":"D:/Projects/private-source/src"}' },
        { path: "assets/d.js", content: "C:\\Users\\HP\\x" },
      ],
      forbidden,
    );
    expect(leaks).toEqual([
      'assets/a.js: contains "my-package"',
      'assets/c.js: contains "sourceMappingURL"',
      "assets/c.js.map: source map",
      'build-info.json: contains "D:/Projects/private-source"',
      'assets/d.js: contains "C:\\Users"',
    ]);
  });

  it("passes a clean build", () => {
    expect(findLeaks([{ path: "index.html", content: "<title>Jane Doe</title>" }], forbidden)).toEqual([]);
  });

  it("scans real files on disk, text files only", () => {
    const dist = mkdtempSync(join(tmpdir(), "dist-"));
    write(dist, { "index.html": "fine", "assets/x.js": "my-package", "logo.png": "my-package" });
    expect(scanDist(dist, "/elsewhere", ["my-package"])).toEqual(['assets/x.js: contains "my-package"']);
  });
});

describe("planMirror", () => {
  it("copies every built file and removes stale ones, keeping the repo's own files", () => {
    const plan = planMirror(
      ["index.html", "assets/new-1.js"],
      ["index.html", "assets/old-9.js", "CNAME", ".gitignore", "notes/old.txt"],
    );
    expect(plan.copy).toEqual(["index.html", "assets/new-1.js"]);
    expect(plan.remove).toEqual(["assets/old-9.js", "notes/old.txt"]);
  });

  it("keeps CNAME so the custom domain survives", () => {
    expect(KEEP).toContain("CNAME");
  });
});

describe("deployMessage", () => {
  it("is neutral: a UTC timestamp and nothing from the source repo", () => {
    expect(deployMessage(new Date("2026-10-22T14:05:09Z"))).toBe("Deploy 2026-10-22 14:05 UTC");
  });
});

describe("publishing to the Pages repo", { timeout: 30_000 }, () => {
  it("mirrors dist/, keeps CNAME, removes stale assets and pushes one normal commit", () => {
    const { base, remote } = fakePagesRepo({
      CNAME: "your-domain.com\n",
      ".gitignore": "node_modules\n",
      "index.html": "old",
      "assets/old-1.js": "old",
    });
    const dist = join(base, "dist");
    write(dist, {
      "index.html": "new",
      "assets/new-2.js": "new",
      "assets/deep/x.css": "x",
      "card.vcf": "BEGIN:VCARD\r\nEND:VCARD\r\n",
    });
    const clone = join(base, "cache", "pages-repo");

    prepareClone(remote, clone);
    git(clone, "config", "user.email", "test@example.com");
    git(clone, "config", "user.name", "Test");
    const { remove, changes } = applyMirror(dist, clone);
    expect(remove).toEqual(["assets/old-1.js"]);
    expect(changes).toContain("assets/new-2.js");
    commitAndPush(clone, "Deploy 2026-10-22 14:05 UTC");

    const check = join(base, "check");
    execFileSync("git", ["-c", "core.autocrlf=false", "clone", "--quiet", remote, check]);
    expect(readFileSync(join(check, "CNAME"), "utf-8")).toBe("your-domain.com\n");
    expect(readFileSync(join(check, "card.vcf"), "utf-8")).toBe("BEGIN:VCARD\r\nEND:VCARD\r\n");
    expect(readFileSync(join(check, "index.html"), "utf-8")).toBe("new");
    expect(existsSync(join(check, "assets/old-1.js"))).toBe(false);
    expect(existsSync(join(check, "assets/deep/x.css"))).toBe(true);
    expect(git(check, "log", "--format=%s")).toBe("Deploy 2026-10-22 14:05 UTC\ninitial");
  });

  it("refuses to publish when the Pages repo's .gitignore would drop built files", () => {
    const { base, remote } = fakePagesRepo({ ".gitignore": "*.vcf\nassets/\n", "index.html": "old" });
    const dist = join(base, "dist");
    write(dist, { "index.html": "new", "card.vcf": "x", "assets/a.js": "x" });
    const clone = join(base, "clone");
    prepareClone(remote, clone);
    expect(() => applyMirror(dist, clone)).toThrow(/would drop built files: .*card\.vcf/);
  });

  it("reports no changes when the repo already matches the build", () => {
    const { base, remote } = fakePagesRepo({ CNAME: "x\n", "index.html": "same" });
    const dist = join(base, "dist");
    write(dist, { "index.html": "same" });
    const clone = join(base, "clone");
    prepareClone(remote, clone);
    expect(applyMirror(dist, clone).changes).toBe("");
  });

  it("resets a cache left dirty by a dry run, then updates it", () => {
    const { base, remote } = fakePagesRepo({ "index.html": "v1" });
    const clone = join(base, "clone");
    prepareClone(remote, clone);
    write(clone, { "index.html": "dry-run leftovers", "stray.txt": "x" });
    git(clone, "add", "--all");

    const other = join(base, "other");
    execFileSync("git", ["clone", "--quiet", remote, other]);
    git(other, "config", "user.email", "test@example.com");
    git(other, "config", "user.name", "Test");
    write(other, { "index.html": "v2" });
    git(other, "commit", "--quiet", "-am", "v2");
    git(other, "push", "--quiet");

    prepareClone(remote, clone);
    expect(readFileSync(join(clone, "index.html"), "utf-8")).toBe("v2");
    expect(existsSync(join(clone, "stray.txt"))).toBe(false);
  });
});
