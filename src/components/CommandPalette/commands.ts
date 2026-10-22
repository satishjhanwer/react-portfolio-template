import {
  availability,
  commandGlyphs,
  commandHints,
  commandKeywords,
  commandLabels,
  email,
  navLinks,
  projects,
  resumeUrl,
  languageNames,
  socials,
  availabilityFull,
  a11yPrefsCopy,
} from "../../i18n/content";
import type { CommandGroupId, Locale } from "../../types";
import { canInstallApp } from "../../utils/pwa";
import { getThemeChoice, type ThemeChoice } from "../../utils/theme";
import { CONTACT_FILES } from "../../utils/contactLinks";
import { locale } from "../../i18n/locale";
import { locales } from "../../site.config";

export type AppCommand =
  | "open-recruiter"
  | "open-audit"
  | "open-prefs"
  | "open-shortcuts"
  | "open-qr"
  | "open-trust"
  | "open-colophon"
  | "install-app"
  | "print-resume"
  | "toggle-retro";

export type CommandAction =
  | { type: "scroll"; target: string; fallback?: string }
  | { type: "app"; command: AppCommand }
  | { type: "href"; href: string; external?: boolean; download?: boolean }
  | { type: "copy"; text: string; fallbackHref: string }
  | { type: "locale"; locale: Locale }
  | { type: "theme"; choice: ThemeChoice };

export interface Command {
  id: string;
  group: CommandGroupId;
  label: string;
  keywords?: string;
  hint?: string;
  glyph?: string;
  icon?: string;
  when?: () => boolean;
  secret?: boolean;
  action: CommandAction;
}

const mailto = `mailto:${email}`;

const allCommands: Command[] = [
  {
    id: "nav-hero",
    group: "navigate",
    label: commandLabels.home,
    keywords: commandKeywords.home,
    glyph: commandGlyphs.home,
    action: { type: "scroll", target: "hero" },
  },
  ...navLinks.map<Command>((l) => ({
    id: `nav-${l.id}`,
    group: "navigate",
    label: commandLabels.goTo(l.title ?? l.label),
    keywords: `${l.label} ${l.id}`,
    glyph: commandGlyphs.navigate,
    action: { type: "scroll", target: l.id },
  })),
  ...(availability.open
    ? [
        {
          id: "action-hire",
          group: "actions",
          label: commandLabels.hireMe,
          keywords: `${commandKeywords.hireMe} ${availability.statuses.join(" ")}`,
          hint: availabilityFull,
          glyph: commandGlyphs.hire,
          action: { type: "scroll", target: availability.target },
        } satisfies Command,
      ]
    : []),
  {
    id: "action-recruiter",
    group: "actions",
    label: commandLabels.recruiter,
    keywords: commandKeywords.recruiter,
    hint: commandHints.recruiter,
    glyph: commandGlyphs.recruiter,
    action: { type: "app", command: "open-recruiter" },
  },
  {
    id: "action-audit",
    group: "actions",
    label: commandLabels.audit,
    keywords: commandKeywords.audit,
    hint: commandHints.audit,
    glyph: commandGlyphs.audit,
    action: { type: "app", command: "open-audit" },
  },
  {
    id: "action-prefs",
    group: "actions",
    label: commandLabels.prefs,
    keywords: commandKeywords.prefs,
    hint: commandHints.prefs,
    glyph: commandGlyphs.prefs,
    action: { type: "app", command: "open-prefs" },
  },
  {
    id: "action-shortcuts",
    group: "actions",
    label: commandLabels.shortcuts,
    keywords: commandKeywords.shortcuts,
    hint: commandHints.shortcuts,
    glyph: commandGlyphs.shortcuts,
    action: { type: "app", command: "open-shortcuts" },
  },
  {
    id: "action-trust",
    group: "actions",
    label: commandLabels.trust,
    keywords: commandKeywords.trust,
    hint: commandHints.trust,
    glyph: commandGlyphs.trust,
    action: { type: "app", command: "open-trust" },
  },
  {
    id: "action-colophon",
    group: "actions",
    label: commandLabels.colophon,
    keywords: commandKeywords.colophon,
    hint: commandHints.colophon,
    glyph: commandGlyphs.colophon,
    action: { type: "app", command: "open-colophon" },
  },
  {
    id: "action-install",
    group: "actions",
    label: commandLabels.install,
    keywords: commandKeywords.install,
    hint: commandHints.install,
    glyph: commandGlyphs.install,
    when: canInstallApp,
    action: { type: "app", command: "install-app" },
  },
  {
    id: "action-retro",
    group: "actions",
    label: commandLabels.retro,
    keywords: commandKeywords.retro,
    hint: commandHints.retro,
    glyph: commandGlyphs.retro,
    secret: true,
    action: { type: "app", command: "toggle-retro" },
  },
  {
    id: "action-copy-email",
    group: "actions",
    label: commandLabels.copyEmail,
    keywords: `${commandKeywords.copyEmail} ${email}`,
    hint: email,
    glyph: commandGlyphs.copy,
    action: { type: "copy", text: email, fallbackHref: mailto },
  },
  {
    id: "action-save-contact",
    group: "actions",
    label: commandLabels.saveContact,
    keywords: commandKeywords.saveContact,
    hint: commandHints.saveContact,
    glyph: commandGlyphs.contactCard,
    action: { type: "href", href: `/${CONTACT_FILES.vcard}`, download: true },
  },
  {
    id: "action-qr",
    group: "actions",
    label: commandLabels.showQr,
    keywords: commandKeywords.showQr,
    hint: commandHints.showQr,
    glyph: commandGlyphs.qr,
    action: { type: "app", command: "open-qr" },
  },
  {
    id: "action-email",
    group: "actions",
    label: commandLabels.emailMe,
    keywords: commandKeywords.emailMe,
    glyph: commandGlyphs.email,
    action: { type: "href", href: mailto },
  },
  {
    id: "action-print",
    group: "actions",
    label: commandLabels.printResume,
    keywords: commandKeywords.printResume,
    hint: commandHints.printResume,
    glyph: commandGlyphs.print,
    action: { type: "app", command: "print-resume" },
  },
  ...(resumeUrl
    ? [
        {
          id: "action-resume",
          group: "actions",
          label: commandLabels.downloadResume,
          keywords: commandKeywords.downloadResume,
          hint: commandHints.download,
          glyph: commandGlyphs.resume,
          action: { type: "href", href: resumeUrl, download: true },
        } satisfies Command,
      ]
    : []),
  ...locales
    .filter((l) => l !== locale)
    .map<Command>((l) => ({
      id: `language-${l}`,
      group: "actions",
      label: commandLabels.switchLanguage(languageNames[l]),
      keywords: `${commandKeywords.language} ${l} ${languageNames[l]}`,
      hint: l,
      glyph: commandGlyphs.language,
      action: { type: "locale", locale: l },
    })),
  ...(["auto", "copper", "night", "sakura"] as const).map<Command>((choice) => ({
    id: `theme-${choice}`,
    group: "actions",
    label: commandLabels.theme(choice === "auto" ? a11yPrefsCopy.theme.auto : a11yPrefsCopy.theme.names[choice]),
    keywords: commandKeywords.theme,
    hint: choice === "auto" ? commandHints.themeAuto : undefined,
    glyph: commandGlyphs.theme,
    when: () => getThemeChoice() !== choice,
    action: { type: "theme", choice },
  })),
  ...projects.map<Command>((p) => ({
    id: p.anchorId,
    group: "projects",
    label: commandLabels.openProject(p.title),
    keywords: `${p.type} ${p.tags.map((t) => t.label).join(" ")}`,
    hint: p.type,
    glyph: commandGlyphs.project,
    action: {
      type: "scroll",
      target: p.anchorId,
      fallback: "projects",
    },
  })),
  ...socials.map<Command>((s) => ({
    id: `social-${s.label.toLowerCase()}`,
    group: "social",
    label: commandLabels.openSocial(s.label),
    keywords: s.href,
    hint: commandHints.external,
    icon: s.icon,
    action: { type: "href", href: s.href, external: true },
  })),
];

/** Commands available right now (conditional ones re-checked on each call). */
export function availableCommands() {
  return allCommands.filter((c) => !c.when || c.when());
}
