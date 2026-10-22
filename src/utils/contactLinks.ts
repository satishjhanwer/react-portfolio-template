import { siteConfig } from "../site.config.ts";

const { key, value } = siteConfig.recruiterEntry.queryParam;

export const SITE_URL = `https://${siteConfig.printSiteUrl}/`;
export const RECRUITER_URL = `${SITE_URL}?${key}=${value}`;

export const CONTACT_FILES = {
  vcard: "contact.vcf",
  qrSite: "qr-site.svg",
  qrRecruiter: "qr-recruiter.svg",
} as const;
