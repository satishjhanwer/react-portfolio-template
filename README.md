# React Portfolio Template

[![CI](https://github.com/satishjhanwer/react-portfolio-template/actions/workflows/ci.yml/badge.svg)](https://github.com/satishjhanwer/react-portfolio-template/actions/workflows/ci.yml)

A data-driven developer portfolio and interactive résumé built with React 19, TypeScript and Framer Motion. Fork it, run the setup wizard, fill in your content, deploy.

It doesn't just describe your skills, it demonstrates them: the site audits its own accessibility, reports its own Web Vitals, works offline, speaks four languages and can be driven entirely from the keyboard. No backend, no UI framework, no CSS library.

## Quick start

```bash
# 1. Click "Use this template" on GitHub, then clone your new repo
git clone https://github.com/<you>/<your-portfolio>.git
cd <your-portfolio>

# 2. Install (also sets up the git hooks)
npm install

# 3. Replace the placeholders with your name, domain, email, profiles and time zone
npm run setup

# 4. Preview
npm run dev
```

`npm run setup` swaps the template's placeholders ("Jane Doe", `hello@your-domain.com`, `your-domain.com`, `github.com/your-username`) everywhere they appear, including `index.html`, the manifest, sitemap, robots.txt, the offline and 404 pages, the deploy target, the tests and the licence. It then regenerates your logo, app icons, contact card and QR codes.

## Make it yours

| What                                            | Where                                                                                      |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------ |
| Links, ids, numbers, icons, hours, availability | `src/site.config.ts`                                                                       |
| All text: bio, projects, jobs, recruiter view   | `src/i18n/locales/en.ts`, then `es.ts`, `fr.ts`, `ja.ts` (the build fails until all match) |
| Colours and themes                              | `src/globals.css` (three dark themes switched by time of day)                              |
| Résumé PDF                                      | `public/resume.pdf` (a placeholder ships), or `resumeUrl: null` to hide the buttons        |
| Company and school logos                        | `public/logos/`, referenced by `logo` on each entry in `site.config.ts` (optional)         |
| Photo on the link-preview card                  | `public/og-photo.jpg` (optional; the card is generated at build time)                      |
| Contact card and QR codes                       | `npm run contact-files` after changing your name, headline, location, socials or domain    |
| Skill and social icons                          | `src/assets/icons/sprite.svg` ([how to add one](docs/content.md#icon-sprite))              |

Only want English? Remove the other codes from `locales` in `site.config.ts` and their loader lines in `src/i18n/content.ts`. Years of experience are calculated from `careerStart`, so they never go stale.

**Analytics are off by default.** To use Cloudflare Web Analytics (cookieless), set `analytics.cloudflareToken` and `analytics.hosts` in `site.config.ts`, and update the analytics line of the privacy note (`trustCopy.privacy.points`) in each language so it stays true.

## Deploy

Any static host works: `npm run build` and upload `dist/`. For GitHub Pages there's a built-in publisher:

```bash
npm run deploy -- --dry-run   # see what would change in <you>/<you>.github.io
npm run deploy                # lint, test, build, check, then publish (asks first)
```

It uses your own git credentials (no tokens), keeps your `CNAME`, removes stale files, never force-pushes, and refuses to publish if `dist/` contains your package name, local paths or source maps, which matters if you keep your source repo private. The target is `PAGES_REPO` in `scripts/deploy-lib.ts` (set by `npm run setup`).

## Features

### For visitors in a hurry

- **60-second recruiter view:** a one-screen summary with role, availability, key achievements, top skills, and resume, email and LinkedIn buttons. Open it from the hero, the mobile menu or the command palette, or link to it directly with `?mode=recruiter`.
- **"Open to work" status:** a single availability setting drives the nav pill, the hero status line and the palette's "Hire me" command. Turning it off hides all of them.
- **Impact at a glance:** headline numbers count up as they scroll into view. Screen readers get the final value, not the animation.
- **Printable resume:** press `Ctrl/⌘ + P` (or "Print / save as PDF" in the command palette) for a clean, ink-on-paper resume generated from the same data as the site, so it is never out of date.
- **Four languages:** English, Spanish, French and Japanese, switched from the nav (or with `?lang=es`, `?lang=fr`, `?lang=ja`). Your browser language is picked up automatically. Translations are AI-assisted and marked as such.
- **Working-hours overlap:** Contact shows when your working day overlaps the visitor's, in your time zone ("we overlap 9:00 AM–1:30 PM your time"), with a 24-hour bar and a zone picker. It handles daylight saving and days with no overlap.
- **Save the contact card:** one tap downloads a `.vcf` that iOS, Android and Outlook import, and "show QR code" opens a scannable code for the site or the 60-second summary (handy at meetups). The printed resume carries the QR code too.
- **Visitor-aware greeting:** the Contact section greets visitors for their time of day and tells them what time it is for you and when to expect a reply. It uses only your browser's clock: no IP lookup, no cookies.

### Keyboard and power-user tools

- **Command palette** (`Ctrl/⌘ + K` or `/`): fuzzy search across sections, projects and social links, plus actions like copy email, download resume, run the accessibility audit and open the recruiter view. The command list is generated from the content files, so new projects and sections appear in it automatically. It loads only on first use.
- **Keyboard shortcuts sheet** (`?`): lists every shortcut, with ⌘ or Ctrl to match your system. It also opens from the palette and the footer.
- **Easter egg:** try `↑ ↑ ↓ ↓ ← → ← → B A`. (A hint is waiting in the browser console.)

### Accessibility, built in

- **Live accessibility audit:** runs [axe-core](https://github.com/dequelabs/axe-core) against the live page (WCAG 2.0–2.2 A/AA) and shows a score with results grouped by impact. Each issue gets a plain-English explanation and a suggested fix, and a "Highlight" button outlines the element on the page. A "Break something" toggle injects a deliberately broken card so you can watch the audit catch it. axe-core (~188 KB gzipped) loads only when the panel opens.
- **Accessibility preferences panel:** text size (100 / 115 / 130%), high contrast, a dyslexia-friendly font (Atkinson Hyperlegible, loaded only when switched on), reduce motion, standard cursor, underlined links, and colour-vision simulation (protanopia, deuteranopia, tritanopia, achromatopsia). Choices are saved and applied before first paint, so the page never flashes the default look.
- **Accessibility statement and privacy note:** what the site aims for (WCAG 2.2 AA), how it's checked, known limitations, and a pre-filled email to report a problem. Plus, in plain words: no cookies, no analytics unless you turn them on (cookieless, and respecting Do Not Track and Global Privacy Control), no third-party requests, and exactly what's saved in your browser, with a button that clears it. Open it from the footer, the palette or the accessibility panel, or link to `#accessibility` / `#privacy`.
- **Throughout:** semantic HTML, full keyboard support with visible focus, focus-trapped modals that restore focus on close, `aria-live` announcements, and respect for `prefers-reduced-motion` (or the in-site override). The page itself passes axe with zero violations in every theme.

### Design and motion

- **Time-based themes:** the palette follows your local clock: **copper** (08:00–16:00), **night** (16:00–24:00) and **sakura** (00:00–08:00). All three are dark and contrast-checked. You can also pick one yourself (or go back to "Auto") in the accessibility panel or the palette. The choice is saved and applied before first paint, and `?theme=night` / `?theme=sakura` still override it for a link.
- **Scroll-driven timeline:** in Experience and Education, a progress line draws itself as you scroll and each entry lights up as the line reaches it.
- Smooth scrolling with [Lenis](https://github.com/darkroomengineering/lenis), a custom cursor, entrance animations and tilt cards. All motion turns off under reduced motion.

### Performance

- **Live Web Vitals badge:** the footer shows the page's real LCP, CLS and INP, measured in your browser with [web-vitals](https://github.com/GoogleChrome/web-vitals) and colour-coded against Google's thresholds. Click it for all five metrics with explanations. The library loads after the page is idle, so measuring doesn't affect the scores.
- Below-the-fold sections, overlays and heavy libraries are lazy-loaded into their own chunks; React and Framer Motion are split into vendor chunks.
- **Colophon:** "how this site is built" shows the real JavaScript cost of this build (about 138 KB gzipped to show the page, with the rest loaded only when needed), generated at build time along with the library versions. A test keeps the initial JavaScript under a 150 KB budget.
- **Generated link previews:** the 1200×630 card LinkedIn, X and Slack show is rendered at build time from the site's data, so the title and years of experience always match.
- **Installable PWA:** a service worker caches the site for offline use, waits for you to accept an update instead of swapping files under an open tab, and clears stale caches on every deploy.
- **A proper 404 page:** mistyped links get a themed page in your language, with links back to the main sections. It works without JavaScript.

## Quality

- **476 unit and component tests** (Vitest + Testing Library), at about 99% line coverage with an 80% minimum. They run in git hooks: related tests on every commit, the full suite with coverage on every push.
- **Playwright end-to-end tests** against the production build, in Chromium at desktop and phone sizes:
  - an axe accessibility scan in every theme, with animations on
  - navigation and deep links, the overlays, print, and offline support
  - SEO tags and the initial-JavaScript budget
- **Drift checks** keep hand-written copies honest:
  - the inline theme and preference scripts must match the app's own logic
  - the 404 page's labels must match the site's
  - the generated contact card must match the config
  - the privacy note must list every key the site stores
- **CI** runs lint, the format check and a type-checked build on every push and pull request.

## Tech stack

| Area      | Choice                                                                       |
| --------- | ---------------------------------------------------------------------------- |
| Framework | React 19                                                                     |
| Language  | TypeScript                                                                   |
| Build     | Vite                                                                         |
| Styling   | CSS Modules + CSS custom properties (no Tailwind or preprocessor)            |
| Animation | Framer Motion (`LazyMotion` + `m.*`), Lenis for smooth scrolling             |
| Tooling   | ESLint (incl. strict React Hooks rules), Prettier, GitHub Actions CI         |
| Testing   | Vitest + Testing Library (unit and component), Playwright + axe (end to end) |
| Libraries | axe-core and web-vitals (both loaded on demand), Fontsource fonts            |

## Project structure

```text
src/
  types.ts         Shared types
  site.config.ts   Language-neutral content: links, icons, ids, numbers, hours, the language list
  i18n/locales/    All text, one complete file per language (en.ts, es.ts, fr.ts, ja.ts)
  i18n/            Language detection, and the module that joins config + text for components
  components/      One folder per section or overlay (index.tsx + .module.css)
  hooks/           useModal, useKonami, useScramble, useBodyClass, ...
  utils/           Stores with their hooks (a11y prefs, theme, PWA, Web Vitals), DOM and time-zone helpers
  test/            Shared test setup and cross-cutting tests
  assets/icons/    Single SVG sprite for skill and social icons
  globals.css      Theme tokens, the three time themes and accessibility overrides
public/            Service worker, manifest, offline and 404 pages, resume PDF, contact card, QR codes, icons
scripts/           Build-time generators: link-preview card, logo and icons, contact files, build info
e2e/               Playwright end-to-end tests
docs/              Detailed notes on testing, content and the service worker
```

To change text, edit `src/i18n/locales/en.ts` and the matching entries in the other language files; to change links, numbers or list items, edit `src/site.config.ts`. Components contain no hard-coded copy. To add a language, copy `en.ts`, translate it and register the code in `site.config.ts` and `src/i18n/content.ts`; the build fails until every string is translated.

## Local development

Requires Node.js and npm.

```bash
npm install            # install dependencies (also sets up the git hooks)
npm run dev            # start the dev server with HMR
npm run lint           # ESLint (includes Prettier as a rule)
npm run format         # format the repo with Prettier
npm run build          # type-check and build to dist/
npm run preview        # serve the production build locally
npm test               # unit and component tests
npm run test:coverage  # the same, with the coverage report (pre-push runs this)
npm run test:e2e       # end-to-end tests against a production build
npm run contact-files  # regenerate the contact card and QR codes after editing site.config.ts
npm run icons          # regenerate the logo and app icons
npm run setup          # one-time: replace the placeholders with your details
npm run deploy         # check, build and publish to your GitHub Pages repo (asks first)
```

The first end-to-end run needs a browser: `npx playwright install chromium`. CI runs `npm ci`, `lint`, `format:check` and `build` on every push to `main` and on every pull request; the tests run locally in the git hooks. Notes on the architecture, conventions and gotchas (also used by AI coding assistants) are in [CLAUDE.md](CLAUDE.md) and [docs/](docs/).

## License

[MIT](LICENSE)
