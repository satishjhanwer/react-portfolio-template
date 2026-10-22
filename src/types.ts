import type { locales } from "./site.config.ts";

export type Locale = (typeof locales)[number];

export type TextSize = "100" | "115" | "130";
export type ColorVision = "none" | "protanopia" | "deuteranopia" | "tritanopia" | "achromatopsia";
type VitalName = "LCP" | "CLS" | "INP" | "FCP" | "TTFB";

export type Accent = "P" | "C" | "G";
export type CommandGroupId = "navigate" | "actions" | "projects" | "social";
export type AxeImpact = "critical" | "serious" | "moderate" | "minor";

interface Range {
  id: string;
  from: number;
  to: number;
}

export interface SiteConfig {
  site: {
    name: string;
    nameUpper: string;
    initials: string;
    logoCursor: string;
    defaultLogo: string;
    timeZone: string;
  };
  careerStart: { year: number; month: number };
  analytics: { cloudflareToken: string; hosts: string[] };
  languageNames: Record<Locale, string>;
  navLinks: { id: string }[];
  availability: { open: boolean; since?: string; target: string };
  hero: {
    nameFirst: string;
    nameLast: string;
    orbSymbol: string;
    roles: { id: string; style: Accent }[];
    ctaPrimary: { target: string };
    ctaGhost: { target: string };
    floatChips: { id: string; style: Accent }[];
  };
  recruiterEntry: { queryParam: { key: string; value: string } };
  stats: { id: string; value?: string }[];
  impact: { id: string; value: number; suffix?: string }[];
  skillCategories: {
    id: string;
    variant: Accent;
    icons: { icon: string; label: string }[];
    textSkills?: string[];
  }[];
  externalLinkGlyph: string;
  projects: {
    id: string;
    title: string;
    tags: { label: string; style: Accent }[];
    featured?: boolean;
    glowC?: boolean;
    url?: string;
    liveAudit?: boolean;
  }[];
  repos: {
    name: string;
    stars: number;
    forks: number;
    lang: string;
    url: string;
    icon: string;
    glow?: boolean;
  }[];
  experienceNodes: {
    id: string;
    org: string;
    logo?: string;
    active?: boolean;
  }[];
  resumeUrl: string | null;
  educationNodes: { id: string; year: string; logo?: string }[];
  awards: { id: string; year: string; org: string; logo?: string }[];
  email: string;
  ctaArrow: string;
  greetingSalutations: Range[];
  greetingReplies: Range[];
  socials: { label: string; href: string; icon: string }[];
  commandGroupOrder: CommandGroupId[];
  commandGlyphs: Record<string, string>;
  secretMinQuery: number;
  shortcuts: { id: string; keys: string[] }[];
  workingHours: { start: number; end: number };
  visitorHours: { start: number; end: number };
  overlapZones: string[];
  trustReviewed: string;
  konamiSequence: string[];
  easterEgg: { theme: string; toastMs: number };
  recruiter: {
    careerCount: number;
    links: {
      id: string;
      kind: "resume" | "email" | "social";
      social?: string;
      primary?: boolean;
    }[];
  };
  a11yPrefs: {
    textSizeOptions: { value: TextSize; label: string }[];
    visionOptions: ColorVision[];
  };
  a11yAuditImpactOrder: AxeImpact[];
  webVitals: { summary: VitalName[]; order: VitalName[] };
  printSiteUrl: string;
}

export interface Tag {
  label: string;
  style: Accent;
}

export interface SkillIcon {
  icon: string;
  label: string;
}

export interface ImpactMetric {
  value: number;
  suffix?: string;
  label: string;
  context: string;
}

export interface RecruiterLink {
  label: string;
  kind: "resume" | "email" | "social";
  social?: string;
  primary?: boolean;
}

export interface RuleExplanation {
  title: string;
  why: string;
  fix: string;
}
