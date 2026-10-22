# CLAUDE.md

Guidance for Claude Code (and humans) working in this portfolio template.

## Commands

```bash
npm run dev | build | preview         # Vite dev server / tsc -b + build to dist/ / serve dist/
npm run lint | format | format:check  # ESLint (Prettier as a rule) / Prettier write / check
npm test | test:watch | test:coverage # Vitest; coverage fails below 80%
npm run setup                         # one-time: replace the template's placeholders with your details
npm run icons                         # regenerate the logo, favicon and app icons from site.initials
```

## Customising the template

- **Placeholders:** the template ships as "Jane Doe" with `hello@your-domain.com`, `your-domain.com` and `github.com/your-username`. `npm run setup` ([scripts/setup.ts](scripts/setup.ts), logic in `setup-lib.ts`) swaps these tokens in every tracked text file, tests included, so they stay in sync. It also adds the user's copyright line above the template's in `LICENSE` (MIT requires keeping the original) and reruns `icons`. Keep the tokens exact if you edit placeholder text.
- **Content** is in `src/site.config.ts` and the four locale files (see Content below). Logos (`public/logos/`), `public/og-photo.jpg` and a real `public/resume.pdf` are optional; `resumeUrl: null` hides the résumé buttons.
- **Hosting:** any static host. `npm run build` and upload `dist/`.

## Conventions

- **No backend.** Fully static: no servers, Workers, serverless functions or runtime API keys. Do heavy or secret work at build time (a Vite plugin, or a script that commits generated files) or in the browser.
- **Minimal code comments.** Keep a comment only if it prevents a likely regression, in one line. An empty `catch {}` trips `no-empty`; write `catch { return; }`.
- **Before committing:** `lint`, `format:check`, `build` and `test:coverage` pass.
- **New features ship with tests** and keep coverage at or above 80%.

## Architecture

React 19 + TypeScript + Vite, a single page with no router; navigation is by section `id`.

- **[src/App.tsx](src/App.tsx):** `Nav` and `Hero` are eager. The other sections and all overlays are `lazy()`, inside `Suspense` + `ErrorBoundary`; overlays use `fallback={<></>}`, so a failed chunk renders nothing.
- **Lenis** drives smooth scrolling. It isn't created under reduced motion, so `getLenis()` can return `null`.
- **Code layout:**
  - components: one folder per component (`index.tsx` + `.module.css`)
  - shared hooks: [src/hooks/](src/hooks/)
  - stores, each with its own hook (`a11yPrefs`, `theme`, `pwa`), and DOM helpers: [src/utils/](src/utils/)
  - helpers used by one component sit next to it
- **Animation:** Framer Motion through `m.*` only, never `motion.*` (`LazyMotion strict` throws). Read motion with `useReducedMotionConfig()` (it respects the in-site override), and use `prefersReducedMotion()` for JS scrolling.
- **Overlays:** use `useModal` ([src/hooks/useModal.ts](src/hooks/useModal.ts)) for Lenis pausing, `inert`, focus restore and run-after-close, plus `trapTab` and Esc.
  - Wire each into `App.tsx` as an `AppCommand` ([commands.ts](src/components/CommandPalette/commands.ts)), give it a palette entry, and add a footer link via `LINKS` in `Footer/index.tsx` if it needs one.
  - The palette builds sections, projects and socials from the data automatically.
- **Print résumé:** `PrintResume` is print-only and built from the same data; `@media print` in `globals.css` hides everything else, portals included. Add résumé-worthy content to it too.
- **Shortcuts:** keys live in `shortcuts` in `site.config.ts`, with labels in `shortcutsCopy.items`.

## Content

- **[src/site.config.ts](src/site.config.ts):** everything that doesn't change with language: URLs, email, icons, ids, logos, numbers, the language list (`locales`, `languageNames`), shortcuts.
- **`src/i18n/locales/<lang>.ts`:** one complete file per language with all user-facing text, keyed by section and id. The other languages are typed from `en.ts`, so a missing or misspelled key fails the build.
- **[src/i18n/content.ts](src/i18n/content.ts)** picks the locale (`?lang=` → `localStorage["lang"]` → browser languages → `en`), joins it with `siteConfig` by id and exports named values. Components import from it; no hard-coded copy.
- **New text** goes into `en.ts` and then every other language. For list items (projects, jobs, awards…), add the item with an `id` to `siteConfig` and its text under the same id in each language file. Never translate ids, URLs or icons. No logic in content files.
- **Adding a language:** copy `en.ts`, translate it, add the code to `locales` and `languageNames`, and add a loader line in `content.ts`. Removing one is the reverse.
- **Years of experience** comes from `careerStart` via `yearsExperience`; never hard-code it. A Vite plugin fills `{{YEARS_EXPERIENCE}}` in `index.html` and the manifest.
- **Icons:** skill and social icons come from [src/assets/icons/sprite.svg](src/assets/icons/sprite.svg). An `icon` in `site.config.ts` must exactly match a `<symbol id>` (a test checks this). To add one, take the SVG from [Devicon](https://devicon.dev), turn `<svg>` into `<symbol id="<name>-<variant>" viewBox="0 0 128 128">`, use `fill="currentColor"` for near-black or near-white fills, and prefix any internal ids uniquely, because all symbols share one document.
- **Generated files:** the 1200×630 `og-image.png` is rendered at build time ([scripts/og-image.ts](scripts/og-image.ts)) from the site data plus the optional `public/og-photo.jpg`; never commit a `public/og-image.png`. `npm run icons` writes the logo and icons with the letters as outlines; never use `<text>` in an SVG icon, because an SVG loaded as an image can't use web fonts.

## Styling and themes

CSS Modules plus tokens in [src/globals.css](src/globals.css), with no Tailwind.

- **Three dark themes:** indigo (default, 08–16), sunset (16–24) and arctic (00–08).
  - **Who sets it:** the inline script in [index.html](index.html), before first paint, with priority `?theme=` → saved choice ([src/utils/theme.ts](src/utils/theme.ts), `localStorage["theme"]`) → time of day. `public/404.html` has its own copy.
  - **Parity:** keep the inline scripts and `applyTheme()` in sync (parity-tested).
  - **Token names:** `--purple` / `--cyan` mean the theme's primary / secondary colours, whatever they are.
- **Colour only via tokens** (`--purple*`, `--cyan*`, `--text-*`, `--bg`, `--nav-bg`, `--drawer-bg`, `--grad-*`). Never hard-code hex or rgba in components; `--white-a*` / `--black-a*` are safe overlays, and `--swatch-*` tokens show other themes. Hard-coded copies of the default palette live in `og-image.ts`, `icons.ts`, the manifest, `index.html`'s `theme-color` and the 404 and offline pages; update them together.
- **Check contrast in all three themes** (WCAG AA, 4.5:1 for text).
  - Use `--text-muted`, not `--text-dim`, for small text on `--drawer-bg`.
  - Never put white text on bright accents.
  - Accent buttons: `var(--grad-btn)` or `--grad-cta` with `color: var(--on-accent)`, hovered with `filter: brightness(1.1)`, not `opacity`.
  - `--text-ghost` is decorative only.
- **Accessibility prefs** ([src/utils/a11yPrefs.ts](src/utils/a11yPrefs.ts)): saved to `localStorage` and mirrored as `data-*` on `<html>` (text size, contrast, font, motion, cursor, links, vision), and applied before first paint by an inline script. Keep that script and `applyPrefs()` in sync. New UI must work under every pref, so size text in `rem`.

## Other gotchas

- **Hooks lint:** `react-hooks/set-state-in-effect` forbids a synchronous `setState` in an effect body. Use a lazy `useState(() => …)` initialiser or set state from callbacks.
- **CSP:** the `index.html` Content-Security-Policy allows only this site. Any new external origin (analytics, images, fonts), WASM or worker needs a CSP change.
- **Service worker** ([public/sw.js](public/sw.js)): updates wait for the toast's Refresh; never add `skipWaiting()` on install, and never cache non-`ok` responses. Its cache name gets the build version, so each deploy clears stale caches.
- **Build:** `react-vendor` and `motion` are manual chunks. Files imported by `vite.config.ts` need explicit `.ts` import extensions.
