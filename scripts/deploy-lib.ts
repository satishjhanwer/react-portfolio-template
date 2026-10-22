import { execFileSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync } from "node:fs";
import { dirname, join, relative, sep } from "node:path";

export const PAGES_REPO = "https://github.com/your-username/your-username.github.io.git";
export const PLACEHOLDER = "your-username";

export const KEEP = ["CNAME", ".gitignore", ".nojekyll", "README.md", "LICENSE"];

const TEXT = /\.(html|js|mjs|css|json|svg|txt|xml|vcf|webmanifest|map)$/i;

export function forbiddenStrings(root: string, names: string[] = []) {
  const forward = root.replace(/\\/g, "/");
  return [...names, "sourceMappingURL", forward, forward.replace(/\//g, "\\"), "C:\\Users", "C:/Users"];
}

export function listFiles(dir: string): string[] {
  const out: string[] = [];
  const walk = (d: string) => {
    for (const name of readdirSync(d)) {
      if (name === ".git") {
        continue;
      }
      const full = join(d, name);
      if (statSync(full).isDirectory()) {
        walk(full);
      } else {
        out.push(relative(dir, full).split(sep).join("/"));
      }
    }
  };
  walk(dir);
  return out.sort();
}

export function findLeaks(files: { path: string; content: string }[], forbidden: string[]) {
  const leaks: string[] = [];
  for (const f of files) {
    if (f.path.endsWith(".map")) {
      leaks.push(`${f.path}: source map`);
    }
    const lower = f.content.toLowerCase();
    for (const word of forbidden) {
      if (word && lower.includes(word.toLowerCase())) {
        leaks.push(`${f.path}: contains "${word}"`);
      }
    }
  }
  return leaks;
}

export function scanDist(distDir: string, root: string, names: string[] = []) {
  const files = listFiles(distDir)
    .filter((p) => TEXT.test(p))
    .map((p) => ({ path: p, content: readFileSync(join(distDir, p), "utf-8") }));
  return findLeaks(files, forbiddenStrings(root, names));
}

export function planMirror(distFiles: string[], repoFiles: string[], keep = KEEP) {
  const built = new Set(distFiles);
  return {
    copy: distFiles,
    remove: repoFiles.filter((f) => !built.has(f) && !keep.includes(f)),
  };
}

export function deployMessage(now = new Date()) {
  return `Deploy ${now.toISOString().slice(0, 16).replace("T", " ")} UTC`;
}

const git = (cwd: string, ...args: string[]) =>
  execFileSync("git", args, { cwd, stdio: ["ignore", "pipe", "pipe"] })
    .toString()
    .trim();

export function prepareClone(repoUrl: string, dir: string) {
  if (!existsSync(join(dir, ".git"))) {
    mkdirSync(dirname(dir), { recursive: true });
    execFileSync("git", ["-c", "core.autocrlf=false", "clone", "--quiet", repoUrl, dir], {
      stdio: ["ignore", "pipe", "pipe"],
    });
    git(dir, "config", "core.autocrlf", "false");
    return;
  }
  git(dir, "config", "core.autocrlf", "false");
  git(dir, "reset", "--quiet", "--hard", "HEAD");
  git(dir, "clean", "--quiet", "-fdx");
  git(dir, "pull", "--quiet", "--ff-only");
}

export function applyMirror(distDir: string, dir: string) {
  const plan = planMirror(listFiles(distDir), listFiles(dir));
  for (const f of plan.remove) {
    rmSync(join(dir, f), { force: true });
  }
  for (const f of plan.copy) {
    mkdirSync(dirname(join(dir, f)), { recursive: true });
    copyFileSync(join(distDir, f), join(dir, f));
  }
  git(dir, "add", "--all");
  const ignored = git(dir, "status", "--porcelain", "--ignored")
    .split("\n")
    .filter((l) => l.startsWith("!! "))
    .map((l) => l.slice(3))
    .filter((f) => plan.copy.some((c) => c === f || c.startsWith(f)));
  if (ignored.length) {
    throw new Error(`The Pages repo's .gitignore would drop built files: ${ignored.join(", ")}`);
  }
  return { ...plan, changes: git(dir, "status", "--short") };
}

export function commitAndPush(dir: string, message: string) {
  git(dir, "commit", "--quiet", "-m", message);
  git(dir, "push", "--quiet", "origin", "HEAD");
  return git(dir, "rev-parse", "--short", "HEAD");
}
