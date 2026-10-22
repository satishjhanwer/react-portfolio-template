import qrcode from "qrcode-generator";
import { siteConfig } from "../site.config.ts";
import en from "../i18n/locales/en.ts";
import { buildVCard, qrPath } from "./vcard.ts";
import { CONTACT_FILES, RECRUITER_URL, SITE_URL } from "./contactLinks.ts";

const QR_MARGIN = 4;

function qrSvg(text: string) {
  const qr = qrcode(0, "M");
  qr.addData(text);
  qr.make();
  return qrPath((row, col) => qr.isDark(row, col), qr.getModuleCount(), QR_MARGIN);
}

export function generateContactFiles(): Record<string, string> {
  const [firstName, ...rest] = siteConfig.site.name.split(" ");
  const vcard = buildVCard({
    firstName,
    lastName: rest.join(" "),
    title: en.recruiter.headline,
    email: siteConfig.email,
    url: SITE_URL,
    location: en.recruiter.location,
    profiles: siteConfig.socials
      .filter((s) => s.label === "GitHub" || s.label === "LinkedIn")
      .map(({ label, href }) => ({ label, href })),
  });
  return {
    [CONTACT_FILES.vcard]: vcard,
    [CONTACT_FILES.qrSite]: qrSvg(SITE_URL),
    [CONTACT_FILES.qrRecruiter]: qrSvg(RECRUITER_URL),
  };
}
