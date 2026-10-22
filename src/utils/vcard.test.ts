import { describe, expect, it } from "vitest";
import vcardFile from "../../public/contact.vcf?raw";
import qrSiteFile from "../../public/qr-site.svg?raw";
import qrRecruiterFile from "../../public/qr-recruiter.svg?raw";
import { generateContactFiles } from "./contactFiles";
import { CONTACT_FILES, RECRUITER_URL, SITE_URL } from "./contactLinks";
import { buildVCard, qrPath } from "./vcard";

const card = {
  firstName: "Ada",
  lastName: "Lovelace",
  title: "Analyst; Engine, \\ notes",
  email: "ada@example.com",
  url: "https://example.com/",
  location: "London, United Kingdom",
  profiles: [{ label: "GitHub", href: "https://github.com/ada" }],
};

describe("buildVCard", () => {
  const vcf = buildVCard(card);
  const lines = vcf.split("\r\n");

  it("is a vCard 3.0 with CRLF line endings", () => {
    expect(lines[0]).toBe("BEGIN:VCARD");
    expect(lines[1]).toBe("VERSION:3.0");
    expect(vcf.endsWith("END:VCARD\r\n")).toBe(true);
    expect(vcf.replace(/\r\n/g, "")).not.toContain("\n");
  });

  it("writes the name, escaping special characters", () => {
    expect(lines).toContain("N:Lovelace;Ada;;;");
    expect(lines).toContain("FN:Ada Lovelace");
    expect(lines).toContain("TITLE:Analyst\\; Engine\\, \\\\ notes");
  });

  it("splits the location into city and country", () => {
    expect(lines).toContain("ADR;TYPE=WORK:;;;London;;;United Kingdom");
    expect(buildVCard({ ...card, location: "Remote" })).toContain("ADR;TYPE=WORK:;;;Remote;;;\r\n");
    expect(buildVCard({ ...card, location: undefined })).not.toContain("ADR");
  });

  it("adds social profiles", () => {
    expect(lines).toContain("X-SOCIALPROFILE;TYPE=github:https://github.com/ada");
  });

  it("folds lines longer than 75 bytes, counting multi-byte characters", () => {
    const long = buildVCard({ ...card, title: "é".repeat(60) });
    const folded = long.split("\r\n").filter((l) => l.startsWith("TITLE") || l.startsWith(" "));
    expect(folded.length).toBeGreaterThan(1);
    for (const l of long.split("\r\n")) {
      expect(new TextEncoder().encode(l).length).toBeLessThanOrEqual(75);
    }
    expect(long.replace(/\r\n /g, "")).toContain(`TITLE:${"é".repeat(60)}`);
  });
});

describe("qrPath", () => {
  it("draws dark modules inside a quiet zone on white", () => {
    const svg = qrPath((r, c) => r === c, 2, 4);
    expect(svg).toContain('viewBox="0 0 10 10"');
    expect(svg).toContain('fill="#fff"');
    expect(svg).toContain("M4 4h1v1h-1zM5 5h1v1h-1z");
  });
});

describe("committed contact files", () => {
  const generated = generateContactFiles();

  it("public/ matches what `npm run contact-files` generates (run it after editing site.config)", () => {
    expect(vcardFile).toBe(generated[CONTACT_FILES.vcard]);
    expect(qrSiteFile).toBe(generated[CONTACT_FILES.qrSite]);
    expect(qrRecruiterFile).toBe(generated[CONTACT_FILES.qrRecruiter]);
  });

  it("encode the live site and the recruiter link", () => {
    expect(SITE_URL).toBe("https://your-domain.com/");
    expect(RECRUITER_URL).toBe("https://your-domain.com/?mode=recruiter");
    expect(qrSiteFile).not.toBe(qrRecruiterFile);
  });
});
