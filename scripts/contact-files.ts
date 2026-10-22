import { writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { generateContactFiles } from "../src/utils/contactFiles.ts";

// Regenerates public/contact.vcf and the QR codes from site.config.ts.
// Run with `npm run contact-files`; a unit test fails if they're out of date.

const publicDir = resolve(dirname(fileURLToPath(import.meta.url)), "..", "public");

for (const [file, content] of Object.entries(generateContactFiles())) {
  writeFileSync(resolve(publicDir, file), content);
  console.log(`wrote public/${file}`);
}
