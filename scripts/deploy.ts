import { execFileSync, execSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createInterface } from "node:readline/promises";
import { fileURLToPath } from "node:url";
import { SITE_URL } from "../src/utils/contactLinks.ts";
import {
  PAGES_REPO,
  PLACEHOLDER,
  applyMirror,
  commitAndPush,
  deployMessage,
  prepareClone,
  scanDist,
} from "./deploy-lib.ts";

// npm run deploy [-- --yes] [-- --with-e2e] [-- --dry-run]
// Checks, builds, guards against leaking source details, and publishes
// dist/ to your GitHub Pages repo with your own git credentials.

const root = resolve(fileURLToPath(import.meta.url), "../..");
const args = new Set(process.argv.slice(2));
const repoUrl = process.env.PAGES_REPO ?? PAGES_REPO;
const cloneDir = process.env.PAGES_DIR ?? resolve(root, "node_modules/.cache/pages-repo");
const packageName = JSON.parse(readFileSync(resolve(root, "package.json"), "utf-8")).name as string;

const run = (cmd: string) => execSync(cmd, { cwd: root, stdio: "inherit" });
const git = (...a: string[]) => execFileSync("git", a, { cwd: root }).toString().trim();
const fail = (msg: string): never => {
  console.error(`\n✗ ${msg}\n`);
  process.exit(1);
};

if (repoUrl.includes(PLACEHOLDER)) {
  fail("Set PAGES_REPO in scripts/deploy-lib.ts (npm run setup does it) or pass it as an env var.");
}
if (git("rev-parse", "--abbrev-ref", "HEAD") !== "main") {
  fail("Deploy from main only.");
}
if (git("status", "--porcelain")) {
  fail("Your working tree has uncommitted changes.");
}
git("fetch", "--quiet", "origin", "main");
if (git("rev-parse", "HEAD") !== git("rev-parse", "origin/main")) {
  fail("main isn't in sync with origin/main. Pull or push first.");
}

run("npm run lint");
run("npm run test:coverage");
if (args.has("--with-e2e")) {
  run("npm run test:e2e");
}
run("npm run build");

const leaks = scanDist(resolve(root, "dist"), root, [packageName]);
if (leaks.length) {
  fail(`dist/ would reveal source details:\n  ${leaks.join("\n  ")}`);
}
console.log("\n✓ Leak guard: no package name, local paths or source maps in dist/.");

prepareClone(repoUrl, cloneDir);
const { remove, changes } = applyMirror(resolve(root, "dist"), cloneDir);
if (!changes) {
  console.log("\nNothing to deploy: the public repo already matches this build.\n");
  process.exit(0);
}

const lines = changes.split("\n");
console.log(`\n${lines.length} file(s) change in ${repoUrl} (${remove.length} removed):`);
console.log(lines.slice(0, 30).join("\n") + (lines.length > 30 ? `\n… and ${lines.length - 30} more` : ""));

if (args.has("--dry-run")) {
  console.log(`\nDry run: nothing committed. The changes are staged in ${cloneDir}.\n`);
  process.exit(0);
}

if (!args.has("--yes")) {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const answer = (await rl.question("\nPublish these changes? [y/N] ")).trim().toLowerCase();
  rl.close();
  if (answer !== "y" && answer !== "yes") {
    git("-C", cloneDir, "reset", "--quiet", "--hard", "HEAD");
    fail("Cancelled; nothing was published.");
  }
}

const sha = commitAndPush(cloneDir, deployMessage());
console.log(`\n✓ Published ${sha} to ${repoUrl}`);
console.log(`  Live in a minute or two at ${SITE_URL}. Open tabs will offer "update available".\n`);
