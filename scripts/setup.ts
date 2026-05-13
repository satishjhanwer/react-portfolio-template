/**
 * ═══════════════════════════════════════════════════════
 *  Portfolio Template — Interactive Setup Script
 *
 *  Run with: npm run setup
 *
 *  This script prompts for your basic info and auto-updates
 *  all the "hidden" config files that are easy to miss:
 *  index.html, manifest.json, sitemap, robots.txt, etc.
 * ═══════════════════════════════════════════════════════
 */

import { createInterface } from "node:readline";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

// ── Readline helper ──────────────────────────────────

const rl = createInterface({ input: process.stdin, output: process.stdout });

function ask(question: string, fallback = ""): Promise<string> {
  const suffix = fallback ? ` (${fallback})` : "";
  return new Promise((res) => {
    rl.question(`  ${question}${suffix}: `, (answer: any) => {
      res(answer.trim() || fallback);
    });
  });
}

// ── File helpers ─────────────────────────────────────

function readFile(relativePath: string): string {
  return readFileSync(resolve(root, relativePath), "utf-8");
}

function writeFile(relativePath: string, content: string): void {
  writeFileSync(resolve(root, relativePath), content, "utf-8");
}

function replaceInFile(
  relativePath: string,
  replacements: [string | RegExp, string][],
): void {
  let content = readFile(relativePath);
  for (const [search, replace] of replacements) {
    content = content.replace(search, replace);
  }
  writeFile(relativePath, content);
}

// ── Main ─────────────────────────────────────────────

async function main() {
  console.log("");
  console.log("  🎨 Portfolio Template Setup");
  console.log("  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("");

  const fullName = await ask("Your full name", "Jane Doe");
  const firstName = fullName.split(" ")[0].toUpperCase();
  const lastName =
    fullName.split(" ").slice(1).join(" ").toUpperCase() || "DOE";
  const jobTitle = await ask("Your job title", "Software Engineer");
  const domain = await ask("Your domain (e.g. janedoe.dev)", "your-domain.com");
  const email = await ask("Your email", "hello@your-domain.com");
  const github = await ask("Your GitHub username", "");
  const linkedin = await ask("Your LinkedIn username", "");
  const twitter = await ask(
    "Your X/Twitter username (leave empty to skip)",
    "",
  );

  console.log("");
  console.log("  Applying changes...");
  console.log("");

  // ── index.html ───────────────────────────────────
  replaceInFile("index.html", [
    [/Jane Doe - Software Engineer/g, `${fullName} - ${jobTitle}`],
    [
      /Software Engineer with X\+ years of experience\. Building performant, accessible web applications\./g,
      `${jobTitle}. Portfolio of ${fullName}.`,
    ],
    [/https:\/\/your-domain\.com/g, `https://${domain}`],
    [/"name": "Jane Doe"/g, `"name": "${fullName}"`],
    [/"jobTitle": "Software Engineer"/g, `"jobTitle": "${jobTitle}"`],
    [
      /https:\/\/github\.com\/your-username/g,
      `https://github.com/${github || "your-username"}`,
    ],
    [
      /https:\/\/linkedin\.com\/in\/your-username/g,
      `https://linkedin.com/in/${linkedin || "your-username"}`,
    ],
  ]);
  console.log("  ✓ Updated index.html");

  // ── manifest.json ────────────────────────────────
  replaceInFile("public/manifest.json", [
    [/"Jane Doe - Portfolio"/, `"${fullName} - Portfolio"`],
    [/"Portfolio"/, `"${fullName.split(" ")[0]}"`],
    [
      /Software Engineer with X\+ years of experience\. Building performant, accessible web applications\./,
      `${jobTitle}. Portfolio of ${fullName}.`,
    ],
  ]);
  console.log("  ✓ Updated public/manifest.json");

  // ── sitemap.xml ──────────────────────────────────
  replaceInFile("public/sitemap.xml", [
    [/your-domain\.com/g, domain],
    [
      /<lastmod>.*<\/lastmod>/,
      `<lastmod>${new Date().toISOString().split("T")[0]}</lastmod>`,
    ],
  ]);
  console.log("  ✓ Updated public/sitemap.xml");

  // ── robots.txt ───────────────────────────────────
  replaceInFile("public/robots.txt", [[/your-domain\.com/g, domain]]);
  console.log("  ✓ Updated public/robots.txt");

  // ── hero.ts ──────────────────────────────────────
  replaceInFile("src/data/hero.ts", [
    [
      /eyebrow: "Your Job Title · Your Qualification"/,
      `eyebrow: "${jobTitle}"`,
    ],
    [/nameFirst: "JANE"/, `nameFirst: "${firstName}"`],
    [/nameLast: "DOE"/, `nameLast: "${lastName}"`],
  ]);
  console.log("  ✓ Updated src/data/hero.ts (name & title)");

  // ── contact.ts ───────────────────────────────────
  replaceInFile("src/data/contact.ts", [[/hello@your-domain\.com/, email]]);
  console.log("  ✓ Updated src/data/contact.ts (email)");

  // ── social.ts ────────────────────────────────────
  const socialReplacements: [string | RegExp, string][] = [];
  if (github) {
    socialReplacements.push([
      /https:\/\/github\.com\/your-username/,
      `https://github.com/${github}`,
    ]);
  }
  if (linkedin) {
    socialReplacements.push([
      /https:\/\/www\.linkedin\.com\/in\/your-username\//,
      `https://www.linkedin.com/in/${linkedin}/`,
    ]);
  }
  if (twitter) {
    socialReplacements.push([
      /https:\/\/twitter\.com\/your-username/,
      `https://twitter.com/${twitter}`,
    ]);
  }
  if (socialReplacements.length > 0) {
    replaceInFile("src/data/social.ts", socialReplacements);
    console.log("  ✓ Updated src/data/social.ts (profiles)");
  }

  // ── LICENSE ──────────────────────────────────────
  replaceInFile("LICENSE", [
    [/\[YEAR\]/, new Date().getFullYear().toString()],
    [/\[YOUR NAME\]/, fullName],
  ]);
  console.log("  ✓ Updated LICENSE");

  // ── favicon.svg (initials) ──────────────────────
  const initials =
    fullName
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "JD";

  const faviconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <defs>
    <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#6366f1"/>
      <stop offset="100%" stop-color="#34d399"/>
    </linearGradient>
  </defs>
  <rect width="32" height="32" rx="6" fill="#080818"/>
  <text
    font-family="Inter, system-ui, -apple-system, sans-serif"
    font-size="18"
    font-weight="900"
    letter-spacing="-1"
    fill="url(#g)"
    x="50%"
    y="50%"
    dominant-baseline="central"
    text-anchor="middle"
  >${initials}</text>
</svg>
`;
  writeFile("public/favicon.svg", faviconSvg);
  console.log(`  ✓ Updated public/favicon.svg (initials: ${initials})`);

  // ── Nav component (logo text + aria-label) ───────
  replaceInFile("src/components/Nav/index.tsx", [
    [/aria-label="Portfolio"/, `aria-label="${fullName}"`],
    [/&lt;\/&gt;<span/, `${initials}<span`],
  ]);
  console.log(`  ✓ Updated src/components/Nav/index.tsx (logo: ${initials}_)`);

  // ── Footer component (copyright name) ────────────
  replaceInFile("src/components/Footer/index.tsx", [
    [/\[Your Name\]/, fullName],
  ]);
  console.log(`  ✓ Updated src/components/Footer/index.tsx (copyright name)`);

  // ── Done! ────────────────────────────────────────
  console.log("");
  console.log("  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("  🚀 Setup complete! Next steps:");
  console.log("");
  console.log("     1. Edit the data files in src/data/ with your content");
  console.log(
    "     2. Replace public/og-image.png with your social card (1200×630px)",
  );
  console.log("     3. Replace public/logo.svg with your logo");
  console.log("     4. Add your resume as public/resume.pdf (optional)");
  console.log("     5. Customize colors in src/globals.css");
  console.log("     6. Run `npm run dev` to preview your portfolio");
  console.log("");

  rl.close();
}

main().catch((err) => {
  console.error("Setup failed:", err);
  rl.close();
  process.exit(1);
});
