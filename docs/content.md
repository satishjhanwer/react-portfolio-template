# Content, translations and generated files

Read this before changing text, adding a language, adding icons or touching anything generated. Rules that apply everywhere are in [CLAUDE.md](../CLAUDE.md).

## Where content lives

- **[src/site.config.ts](../src/site.config.ts) (`siteConfig`):** everything that doesn't change with language. URLs, email, icons, ids, logos, numbers, styles, the language list (`locales`, `languageNames`), analytics, working hours, shortcuts, `trustReviewed`.
- **[src/i18n/locales/](../src/i18n/locales/):** one **complete** file per language (`en.ts`, `es.ts`, `fr.ts`, `ja.ts`) with all user-facing text, keyed by section and id. Other languages are typed `Messages` ([messages.ts](../src/i18n/messages.ts), derived from `en.ts`), so a missing or misspelled key fails the build.
- **[src/i18n/content.ts](../src/i18n/content.ts):**
  - picks the locale ([locale.ts](../src/i18n/locale.ts): `?lang=` → `localStorage["lang"]` → `navigator.languages` → `en`)
  - loads that language file with top-level `await` (English is bundled; the others are lazy chunks)
  - joins it with `siteConfig` by id and exports named values (`projects`, `hero`, `navLinks`…)
  - components import from `../i18n/content`

## Rules

- **New text:** add it to `en.ts`, then to every other language file (TypeScript lists what's missing). For list items (projects, jobs, awards…), add the item with an `id` to `siteConfig` and its text under the same id in each language file.
- **New export:** add it to `content.ts`.
- **Adding a language:** copy `en.ts` to `<code>.ts` and translate it, add the code to `locales` and `languageNames`, and add a loader line in `content.ts`.
- **No logic in content files.** Calculated values live in `src/utils/` (e.g. `yearsExperience`, `timezone.ts`) or in `content.ts` (`availabilityFull`, each project's `anchorId`). Message functions such as `goTo(title)` belong in the language files: they're translatable text with a slot.
- **Switching language** (`switchLocale()`) saves the choice and reloads. `<html lang>` follows the locale, and Japanese uses system CJK fonts via `:root:lang(ja)`.
- **Long translations are safe in the Nav:** it measures itself and switches to the hamburger menu (`data-compact`) whenever the links don't fit.
- **Accessibility audit text:** explanations come from `ruleExplanations` in the language files. For rules not listed there, `A11yAudit` uses the plain `help` / `description` strings from `axe-core/locales/<locale>.json` and shows `a11yAudit.fixFallback`, because axe's own templates need `new Function`, which the CSP blocks.
- Translations are AI-assisted and marked as such in the footer (`languageCopy.disclaimer`). Native review is still to do.
- **Years of experience** comes from `careerStart` via `yearsExperience` ([src/utils/experience.ts](../src/utils/experience.ts)); never hard-code it. A Vite plugin fills `{{YEARS_EXPERIENCE}}` in `index.html` and `public/manifest.json`.
- **Working-hours overlap** (Contact) comes from `workingHours`, `site.timeZone` and the assumed `visitorHours` in `site.config.ts`.

## Icon sprite

Skill and social icons come from [src/assets/icons/sprite.svg](../src/assets/icons/sprite.svg), injected by `IconSprite` and used as `<use href="#<id>" />`. The `icon` fields in `site.config.ts` must exactly match a `<symbol id>`: a wrong id renders nothing, with no error (a test checks this).

To add one:

1. Get the SVG from [Devicon](https://devicon.dev).
2. Turn it into a symbol: `<svg …>` → `<symbol id="<name>-<variant>" viewBox="0 0 128 128">`, drop `xmlns`, keep `viewBox`.
3. Paste it on its own line, roughly alphabetically.
4. Replace near-black or near-white fills with `fill="currentColor"`.
5. Prefix any internal ids (gradients, `clipPath id="a"`) uniquely, e.g. `leetcode-a`, and update their `url(#…)` references. All symbols share one document, so ids collide.

## Generated files

- **`og-image.png` (1200×630):**
  - rendered at build time by the `og-image` plugin with [scripts/og-image.ts](../scripts/og-image.ts) (satori + resvg), from site data plus the optional `public/og-photo.jpg`
  - cached in `node_modules/.cache/og-image/`
  - `npm run dev` serves a live render
  - never add `public/og-image.png` back
  - satori's `fflate` is pinned via `overrides` (security fix)
- **Logo and icons:** `npm run icons` ([scripts/icons.ts](../scripts/icons.ts)) generates `logo.svg`, `favicon.svg`, `logo192.png` and `logo512.png` with the letters as outlines. Regenerate them rather than hand-editing, and never use `<text>` in an SVG icon: an SVG loaded as an image can't use web fonts.
- **Contact card and QR codes:**
  - `npm run contact-files` generates `public/contact.vcf` (vCard 3.0, which iOS, Android and Outlook all import) and `public/qr-site.svg` / `qr-recruiter.svg`, and they're committed
  - a test fails when they drift, so rerun it after changing the name, email, headline, location, socials or site URL
  - the vCard needs CRLF line endings (`.gitattributes`)
  - the QR codes stay black on white in every theme, because scanners can't read inverted codes
  - browser code imports from `src/utils/contactLinks.ts`, never `contactFiles.ts`, which would pull the QR encoder and the English copy into the bundle
- **`build-info.json`** for the colophon comes from the `build-info` plugin ([scripts/build-info.ts](../scripts/build-info.ts)): build date, initial vs lazy gzipped JS (the entry chunk plus its static imports), and library versions. It contains **nothing from git** (see "Publishing" in CLAUDE.md).
- Any file `vite.config.ts` imports (directly or through `scripts/`) must use explicit `.ts` extensions on relative imports.
