# React Portfolio Template

A data-driven developer portfolio and interactive résumé built with React 19, TypeScript and Framer Motion. Fork it, run the setup wizard, fill in your content, deploy anywhere static.

No backend, no UI framework, no CSS library. It speaks four languages, works offline, prints a clean résumé and can be driven entirely from the keyboard.

## Quick start

```bash
# 1. Click "Use this template" on GitHub, then clone your new repo
git clone https://github.com/<you>/<your-portfolio>.git
cd <your-portfolio>

# 2. Install
npm install

# 3. Replace the placeholders with your name, title, domain, email and profiles
npm run setup

# 4. Preview
npm run dev
```

`npm run setup` swaps the template's placeholders ("Jane Doe", `hello@your-domain.com`, `your-domain.com`, `github.com/your-username`) everywhere they appear: `index.html`, the manifest, sitemap, robots.txt, the offline and 404 pages, the tests and the licence. It then regenerates your logo and app icons from your initials.

## Make it yours

| What                                     | Where                                                                                      |
| ---------------------------------------- | ------------------------------------------------------------------------------------------ |
| Links, ids, numbers, icons, availability | `src/site.config.ts`                                                                       |
| All text: bio, projects, jobs, awards    | `src/i18n/locales/en.ts`, then `es.ts`, `fr.ts`, `ja.ts` (the build fails until all match) |
| Colours and themes                       | `src/globals.css`                                                                          |
| Résumé PDF                               | `public/resume.pdf` (a placeholder ships), or `resumeUrl: null` to hide the buttons        |
| Company and school logos                 | `public/logos/`, referenced by `logo` on each entry in `site.config.ts` (optional)         |
| Photo on the link-preview card           | `public/og-photo.jpg` (optional; the card is generated at build time)                      |
| Skill and social icons                   | `src/assets/icons/sprite.svg` (see "Icons" in [CLAUDE.md](CLAUDE.md))                      |

Only want English? Remove the other codes from `locales` in `site.config.ts` and their loader lines in `src/i18n/content.ts`. Years of experience are calculated from `careerStart`, so they never go stale.

## Features

### Content

- **Sections:** hero, about with impact numbers that count up, skills, projects, open source, experience and education timelines, awards and contact. Everything comes from `site.config.ts` and the language files.
- **"Open to work" status:** one availability setting drives the nav pill, the hero status line and the palette's "Hire me" command.
- **Printable résumé:** press `Ctrl/⌘ + P` (or "Print / save as PDF" in the command palette) for a clean, ink-on-paper résumé generated from the same data, so it's never out of date.
- **Four languages:** English, Spanish, French and Japanese, picked from the browser and switchable in the nav or with `?lang=es|fr|ja`.

### Keyboard

- **Command palette** (`Ctrl/⌘ + K` or `/`): fuzzy search across sections, projects and social links, plus actions like copy email, download résumé, switch theme or language. New projects and sections appear in it automatically.
- **Keyboard shortcuts sheet** (`?`), and an easter egg: try `↑ ↑ ↓ ↓ ← → ← → B A`.

### Accessibility

- **Accessibility preferences panel:** text size, high contrast, a dyslexia-friendly font, reduce motion, standard cursor, underlined links and a colour-vision preview. Choices are saved and applied before first paint.
- **Throughout:** semantic HTML, full keyboard support with visible focus, focus-trapped dialogs that restore focus, `aria-live` announcements, and respect for `prefers-reduced-motion`. All three themes meet WCAG AA contrast.

### Design and performance

- **Time-based themes:** **indigo** (08:00–16:00), **sunset** (16:00–24:00) and **arctic** (00:00–08:00), following the visitor's clock. Visitors can pick one themselves; `?theme=sunset` forces one for a link.
- **Motion:** smooth scrolling with [Lenis](https://github.com/darkroomengineering/lenis), a custom cursor, scroll-driven timelines, entrance animations and tilt cards. All of it turns off under reduced motion.
- **Fast by default:** below-the-fold sections and overlays are lazy-loaded; React and Framer Motion are split into vendor chunks.
- **Installable PWA:** a service worker caches the site for offline use, asks before swapping in an update, and clears stale caches on every deploy.
- **Generated link previews:** the 1200×630 card LinkedIn, X and Slack show is rendered at build time from your data.
- **A proper 404 page** in the visitor's language and theme, working without JavaScript.

## Tech stack

| Area      | Choice                                                            |
| --------- | ----------------------------------------------------------------- |
| Framework | React 19                                                          |
| Language  | TypeScript                                                        |
| Build     | Vite                                                              |
| Styling   | CSS Modules + CSS custom properties (no Tailwind or preprocessor) |
| Animation | Framer Motion (`LazyMotion` + `m.*`), Lenis for smooth scrolling  |
| Testing   | Vitest + Testing Library, about 99% line coverage                 |
| Tooling   | ESLint (incl. strict React Hooks rules), Prettier                 |

## Project structure

```text
src/
  site.config.ts   Language-neutral content: links, icons, ids, numbers, the language list
  i18n/locales/    All text, one complete file per language (en.ts, es.ts, fr.ts, ja.ts)
  i18n/            Language detection, and the module that joins config + text for components
  components/      One folder per section or overlay (index.tsx + .module.css)
  hooks/           useModal, useKonami, useScramble, ...
  utils/           Stores with their hooks (accessibility prefs, theme, PWA) and DOM helpers
  test/            Shared test setup and cross-cutting tests
  assets/icons/    Single SVG sprite for skill and social icons
  globals.css      Theme tokens, the three themes and accessibility overrides
public/            Service worker, manifest, offline and 404 pages, résumé PDF, icons
scripts/           Setup wizard, link-preview card and icon generators
```

## Scripts

```bash
npm run setup          # one-time: replace the placeholders with your details
npm run dev            # start the dev server with HMR
npm run build          # type-check and build to dist/
npm run preview        # serve the production build locally
npm test               # unit and component tests
npm run test:coverage  # the same, with the coverage report
npm run lint           # ESLint (includes Prettier as a rule)
npm run format         # format the repo with Prettier
npm run icons          # regenerate the logo and app icons
```

Deploy by uploading `dist/` to any static host (GitHub Pages, Netlify, Cloudflare Pages, Vercel…). Notes on the architecture, conventions and gotchas, also used by AI coding assistants, are in [CLAUDE.md](CLAUDE.md).

## License

[MIT](LICENSE)
