import { siteConfig } from "../site.config.ts";

export function fullYearsSince(start: { year: number; month: number }, now = new Date()) {
  const beforeAnniversary = now.getMonth() + 1 < start.month;
  return now.getFullYear() - start.year - (beforeAnniversary ? 1 : 0);
}

export const yearsExperience = `${fullYearsSince(siteConfig.careerStart)}+`;
