import { siteConfig as cfg } from "../site.config";
import type { CommandGroupId, ImpactMetric, RecruiterLink, RuleExplanation } from "../types";
import { yearsExperience } from "../utils/experience";
import { locale } from "./locale";
import en from "./locales/en";
import type { Messages } from "./messages";

const loaders: Record<string, () => Promise<{ default: Messages }>> = {
  es: () => import("./locales/es"),
  fr: () => import("./locales/fr"),
  ja: () => import("./locales/ja"),
};

async function loadMessages(): Promise<Messages> {
  const load = loaders[locale];
  if (!load) {
    return en;
  }
  try {
    return (await load()).default;
  } catch {
    return en;
  }
}

const m = await loadMessages();

function text<T>(record: Record<string, T>, id: string): T {
  const value = record[id];
  if (value === undefined) {
    throw new Error(`No "${locale}" text for "${id}" in src/i18n/locales`);
  }
  return value;
}

export const site = { ...cfg.site, ...m.site };
export const careerStart = cfg.careerStart;
export const analytics = cfg.analytics;
export const languageNames = cfg.languageNames;
export const languageCopy = m.languageCopy;
export const loader = m.loader;

export const navLinks = cfg.navLinks.map(({ id }) => ({
  id,
  ...text<{ label: string; title?: string }>(m.navLinks, id),
}));
export const navMenuLabel = m.navMenuLabel;

export const availability = { ...cfg.availability, ...m.availability };
export const availabilitySince = m.availabilitySince;
export const availabilityLinkSuffix = m.availabilityLinkSuffix;
export const availabilityFull = availability.since
  ? `${availability.full} · ${availabilitySince(availability.since)}`
  : availability.full;

export const hero = {
  eyebrow: m.hero.eyebrow,
  nameFirst: cfg.hero.nameFirst,
  nameLast: cfg.hero.nameLast,
  orbSymbol: cfg.hero.orbSymbol,
  roles: cfg.hero.roles.map(({ id, style }) => ({
    label: text(m.hero.roles, id),
    style,
  })),
  taglineHtml: m.hero.taglineHtml,
  ctaPrimary: { label: m.hero.ctaPrimary, target: cfg.hero.ctaPrimary.target },
  ctaGhost: { label: m.hero.ctaGhost, target: cfg.hero.ctaGhost.target },
  floatChips: cfg.hero.floatChips.map(({ id, style }) => ({
    label: text(m.hero.floatChips, id),
    style,
  })),
};
export const recruiterEntry = { ...cfg.recruiterEntry, ...m.recruiterEntry };

export const stats = cfg.stats.map(({ id, value }) => ({
  value: value ?? yearsExperience,
  label: text(m.stats, id),
}));
export const about = m.about;

export const impactTitle = m.impactTitle;
export const impact: ImpactMetric[] = cfg.impact.map(({ id, ...metric }) => ({
  ...metric,
  ...text(m.impact, id),
}));

export const skillCategories = cfg.skillCategories.map((category) => ({
  ...category,
  label: text(m.skillCategories, category.id),
}));

export const viewProjectLabel = m.viewProjectLabel;
export const externalLinkGlyph = cfg.externalLinkGlyph;
const anchorId = (title: string) =>
  `project-${title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")}`;

export const projects = cfg.projects.map(({ id, ...project }) => ({
  ...project,
  anchorId: anchorId(project.title),
  ...text(m.projects, id),
}));
export const repos = cfg.repos.map((repo) => ({
  ...repo,
  desc: text(m.repos, repo.name),
}));

export const experienceNodes = cfg.experienceNodes.map(({ id, ...node }) => ({
  ...node,
  ...text(m.experienceNodes, id),
}));
export const resumeUrl = cfg.resumeUrl;
export const educationNodes = cfg.educationNodes.map(({ id, ...node }) => ({
  ...node,
  ...text(m.educationNodes, id),
}));
export const awards = cfg.awards.map(({ id, ...award }) => ({
  ...award,
  title: text(m.awards, id),
}));

export const email = cfg.email;
export const ctaArrow = cfg.ctaArrow;
export const heading = m.heading;
export const note = m.note;
export const openTo = m.openTo;

export const greetingSalutations = cfg.greetingSalutations.map(({ id, ...range }) => ({
  ...range,
  text: text(m.greetingSalutations, id),
}));
export const greetingReplies = cfg.greetingReplies.map(({ id, ...range }) => ({
  ...range,
  text: text(m.greetingReplies, id),
}));
export const greetingFallback = m.greetingFallback;
export const greetingSameZone = m.greetingSameZone;
export const greetingMyTime = m.greetingMyTime;
export const greetingReplyFallback = m.greetingReplyFallback;
export const greetingJoin = m.greetingJoin;
export const greetingWithReply = m.greetingWithReply;

export const socials = cfg.socials;

export const recruiter = {
  ...m.recruiter,
  careerCount: cfg.recruiter.careerCount,
  links: cfg.recruiter.links.map(({ id, ...link }): RecruiterLink => ({
    ...link,
    label: text(m.recruiter.links, id),
  })),
};

export const commandGroups: Record<CommandGroupId, string> = m.commandGroups;
export const commandGroupOrder = cfg.commandGroupOrder;
export const commandPalette = m.commandPalette;
export const commandLabels = m.commandLabels;
export const commandHints = m.commandHints;
export const commandKeywords = m.commandKeywords;
export const commandGlyphs = cfg.commandGlyphs;
export const secretMinQuery = cfg.secretMinQuery;

export const konamiSequence = cfg.konamiSequence;
export const easterEgg = { ...cfg.easterEgg, ...m.easterEgg };

export const a11yPrefsTrigger = m.a11yPrefsTrigger;
export const a11yPrefsCopy = {
  ...m.a11yPrefsCopy,
  textSize: {
    legend: m.a11yPrefsCopy.textSize.legend,
    options: cfg.a11yPrefs.textSizeOptions,
  },
  vision: {
    legend: m.a11yPrefsCopy.vision.legend,
    hint: m.a11yPrefsCopy.vision.hint,
    options: cfg.a11yPrefs.visionOptions.map((value) => ({
      value,
      label: text(m.a11yPrefsCopy.vision.options, value),
    })),
  },
};

export const a11yAudit = {
  ...m.a11yAudit,
  impactOrder: cfg.a11yAuditImpactOrder,
};
export const ruleExplanations: Record<string, RuleExplanation> = m.ruleExplanations;

export const webVitals = {
  ...m.webVitals,
  summary: cfg.webVitals.summary,
  order: cfg.webVitals.order,
};

export const overlapCopy = m.overlapCopy;
export const workingHours = cfg.workingHours;
export const visitorHours = cfg.visitorHours;
export const overlapZones = cfg.overlapZones;
export const contactCardCopy = m.contactCardCopy;
export const trustCopy = m.trustCopy;
export const trustReviewed = cfg.trustReviewed;
export const colophonCopy = m.colophonCopy;
export const shortcutsCopy = m.shortcutsCopy;
export const shortcuts = cfg.shortcuts.map(({ id, keys }) => ({ id, keys, label: text(m.shortcutsCopy.items, id) }));
export const pwaCopy = m.pwaCopy;
export const printResume = { ...m.printResume, siteUrl: cfg.printSiteUrl };
