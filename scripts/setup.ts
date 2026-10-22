import { execSync } from "node:child_process";
import { resolve } from "node:path";
import { createInterface } from "node:readline/promises";
import { fileURLToPath } from "node:url";
import { PLACEHOLDERS, cleanDomain, isTimeZone, personalize } from "./setup-lib.ts";

// npm run setup
// Replaces the template's placeholders (name, domain, email, profiles, time zone)
// everywhere they appear, then regenerates the icons and the contact card.

const root = resolve(fileURLToPath(import.meta.url), "../..");
const rl = createInterface({ input: process.stdin });
const lines = rl[Symbol.asyncIterator]();

async function ask(question: string, fallback = "", valid: (v: string) => boolean = () => true) {
  const suffix = fallback ? ` (${fallback})` : "";
  for (;;) {
    process.stdout.write(`  ${question}${suffix}: `);
    const { value, done } = await lines.next();
    const answer = String(value ?? "").trim() || fallback;
    if (done || valid(answer)) {
      return answer;
    }
    console.log("  That doesn't look right, try again.");
  }
}

console.log("\n  Portfolio setup\n  ───────────────\n");

const answers = {
  fullName: await ask("Your full name", PLACEHOLDERS.name, (v) => v.length > 1),
  jobTitle: await ask("Your job title", PLACEHOLDERS.title),
  domain: cleanDomain(await ask("Your domain, e.g. janedoe.dev", PLACEHOLDERS.domain)),
  email: await ask("Your email", PLACEHOLDERS.email, (v) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v)),
  timeZone: await ask(
    "Your time zone (IANA name)",
    Intl.DateTimeFormat().resolvedOptions().timeZone || PLACEHOLDERS.timeZone,
    isTimeZone,
  ),
  github: await ask("Your GitHub username (empty to skip)"),
  linkedin: await ask("Your LinkedIn username (empty to skip)"),
  x: await ask("Your X username (empty to skip)"),
};
rl.close();

const changed = personalize(root, answers);
console.log(`\n  ✓ Updated ${changed.length} files`);

execSync("npm run --silent icons", { cwd: root, stdio: "inherit" });
execSync("npm run --silent contact-files", { cwd: root, stdio: "inherit" });

console.log(`
  Next steps:
    1. Write your content in src/site.config.ts and src/i18n/locales/ (all four languages).
    2. Replace public/resume.pdf, or set resumeUrl: null to hide the download buttons.
    3. Optional: add public/og-photo.jpg for the social card, and logos in public/logos/.
    4. Run npm run contact-files again after changing your headline, location or socials.
    5. npm run dev to preview, then npm test.
`);
