/**
 * ═══════════════════════════════════════════════════════
 *  HERO SECTION
 *  Edit your name, job title, tagline, and call-to-action buttons.
 *  See README.md → "Customization Guide" for details.
 * ═══════════════════════════════════════════════════════
 */

export interface HeroChip {
  label: string;
  style: "P" | "C" | "G";
}

export const hero = {
  eyebrow: "Your Job Title · Your Qualification",
  nameFirst: "JANE",
  nameLast: "DOE",
  orbSymbol: "⬡",
  roles: [
    { label: "Your Primary Skill", style: "P" as const },
    { label: "Your Secondary Skill", style: "C" as const },
  ] satisfies HeroChip[],
  taglineHtml:
    "A short, punchy <b>tagline</b> about what you do and what makes you <b>stand out</b>. Keep it to 1–2 sentences that capture your professional identity.",
  ctaPrimary: { label: "view my work →", target: "projects" },
  ctaGhost: { label: "download resume", target: "resume" },
  floatChips: [
    { label: "Skill One · Skill Two", style: "P" as const },
    { label: "Skill Three · Skill Four", style: "C" as const },
    { label: "X+ years experience", style: "G" as const },
  ] satisfies HeroChip[],
};
