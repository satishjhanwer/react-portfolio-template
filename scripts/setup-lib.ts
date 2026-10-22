import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

export interface Answers {
  fullName: string;
  jobTitle: string;
  domain: string;
  email: string;
  github: string;
  linkedin: string;
  x: string;
}

export const PLACEHOLDERS = {
  name: "Jane Doe",
  title: "Frontend Engineer",
  domain: "your-domain.com",
  email: "hello@your-domain.com",
  user: "your-username",
};

const SKIP = /^(README\.md|CLAUDE\.md|CONTRIBUTING\.md|LICENSE|package-lock\.json|docs\/|\.github\/|scripts\/setup)/;
const TEXT = /\.(ts|tsx|js|json|html|css|txt|xml|svg|md)$/;

export function cleanDomain(input: string) {
  return input
    .trim()
    .replace(/^https?:\/\//, "")
    .replace(/\/+$/, "");
}

export function initialsOf(fullName: string) {
  const words = fullName.trim().split(/\s+/).filter(Boolean);
  const letters = words.length > 1 ? words[0][0] + words[words.length - 1][0] : (words[0] ?? "").slice(0, 2);
  return letters.toUpperCase() || "JD";
}

export function buildReplacements(a: Answers): [string, string][] {
  const P = PLACEHOLDERS;
  const words = a.fullName.trim().split(/\s+/);
  const first = words[0].toUpperCase();
  const last = words.slice(1).join(" ").toUpperCase();
  const pairs: [string, string][] = [
    [`${P.name} - ${P.title}`, `${a.fullName} - ${a.jobTitle}`],
    [`"jobTitle": "${P.title}"`, `"jobTitle": "${a.jobTitle}"`],
    [`nameUpper: "JANE DOE"`, `nameUpper: "${a.fullName.toUpperCase()}"`],
    [`initials: "JD"`, `initials: "${initialsOf(a.fullName)}"`],
    [`nameFirst: "JANE"`, `nameFirst: "${first}"`],
    [`nameLast: "DOE"`, `nameLast: "${last}"`],
    [P.name, a.fullName],
    [P.email, a.email],
    [P.domain, a.domain],
  ];
  if (a.linkedin) {
    pairs.push([`linkedin.com/in/${P.user}`, `linkedin.com/in/${a.linkedin}`]);
  }
  if (a.x) {
    pairs.push([`x.com/${P.user}`, `x.com/${a.x}`]);
  }
  if (a.github) {
    pairs.push([`github.com/${P.user}`, `github.com/${a.github}`]);
  }
  return pairs;
}

export function applyReplacements(text: string, pairs: [string, string][]) {
  return pairs.reduce((out, [from, to]) => out.split(from).join(to), text);
}

export function trackedTextFiles(root: string) {
  return execFileSync("git", ["ls-files"], { cwd: root })
    .toString()
    .split("\n")
    .filter((f) => f && TEXT.test(f) && !SKIP.test(f));
}

export function personalize(root: string, a: Answers, files = trackedTextFiles(root)) {
  const pairs = buildReplacements(a);
  const changed: string[] = [];
  for (const file of files) {
    const path = resolve(root, file);
    const before = readFileSync(path, "utf-8");
    const after = applyReplacements(before, pairs);
    if (after !== before) {
      writeFileSync(path, after);
      changed.push(file);
    }
  }
  const license = resolve(root, "LICENSE");
  writeFileSync(license, addCopyright(readFileSync(license, "utf-8"), a.fullName, new Date().getFullYear()));
  return [...changed, "LICENSE"];
}

// MIT requires keeping the template's notice, so the user's line goes above it.
export function addCopyright(license: string, name: string, year: number) {
  const line = `Copyright (c) ${year} ${name}`;
  if (license.includes(line)) {
    return license;
  }
  return license.replace(/^Copyright \(c\)/m, `${line}\nCopyright (c)`);
}
