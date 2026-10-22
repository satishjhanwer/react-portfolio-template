# CLAUDE.md

Guidance for Claude Code in this repo. Detail lives in [docs/](docs/); read the relevant file before working in that area:

- [docs/testing.md](docs/testing.md): Vitest stubs and harnesses, App-test query rules, Playwright fixtures, ports and workers
- [docs/content.md](docs/content.md): i18n layout, adding text or a language, the icon sprite, generated files (OG image, icons, contact card and QR, build-info)
- [docs/pwa.md](docs/pwa.md): service worker updates, offline caching, the 404 page

## Commands

```bash
npm run dev | build | preview         # Vite dev server / tsc -b + build to dist/ / serve dist/
npm run lint | format | format:check  # ESLint (Prettier as a rule) / Prettier write / check
npm test | test:watch | test:coverage # Vitest; coverage fails below 80% (pre-push runs it)
npm run test:e2e | test:e2e:ui        # Playwright against the production build (manual)
npm run setup                         # one-time: replace the template's placeholders with your details
npm run icons | contact-files         # regenerate the logo/icons / the vCard and QR codes
npm run deploy [-- --dry-run|--yes|--with-e2e]  # publish dist/ to your GitHub Pages repo
```

CI ([.github/workflows/ci.yml](.github/workflows/ci.yml)) runs `npm ci`, `lint`, `format:check` and `build`. Tests deliberately run in husky hooks instead: `pre-commit` runs lint-staged (ESLint `--fix`, `vitest related`, Prettier), and `pre-push` runs `test:coverage`. E2E is never in a hook.

## Working on this repo

### Customising the template

- **Placeholders:** the template ships as "Jane Doe" with `hello@your-domain.com`, `your-domain.com` and `github.com/your-username`. `npm run setup` ([scripts/setup.ts](scripts/setup.ts), logic in `setup-lib.ts`) swaps these tokens in every tracked text file (tests and e2e included, so they stay in sync), sets `site.timeZone` and the licence, then reruns `icons` and `contact-files`. Keep the tokens exact if you edit placeholder text.
- **Content** is in `src/site.config.ts` and the four locale files; see [docs/content.md](docs/content.md). Logos (`public/logos/`), `public/og-photo.jpg` and a real `public/resume.pdf` are optional; `resumeUrl: null` hides the résumé buttons.
- **Analytics are off** (`analytics.cloudflareToken` is empty and `hosts` is `[]`). To turn Cloudflare Web Analytics on, fill both in and rewrite the analytics line in `trustCopy.privacy.points` in every language, because the statement must stay true.
- **Tests that depend on owner-specific values** (time zone, working hours, analytics) mock `site.config` with fixed values, so they keep passing after you change yours.

### Publishing

**`npm run deploy`** ([scripts/deploy.ts](scripts/deploy.ts); logic and tests in `deploy-lib.ts`) publishes `dist/` to a GitHub Pages repo (`PAGES_REPO` in `deploy-lib.ts`, set by `npm run setup` to `<user>/<user>.github.io`). It runs with your own git credentials; no tokens are stored. In order, it:

1. refuses to run unless on a clean `main` that matches `origin/main`, or while `PAGES_REPO` is still the placeholder
2. runs lint, `test:coverage` (and `test:e2e` with `--with-e2e`) and the build
3. runs the **leak guard** (`scanDist`), aborting if `dist/` contains the package name, local paths or source maps (handy when the source repo is private)
4. mirrors `dist/` into a cached clone (`node_modules/.cache/pages-repo`), removing stale files but keeping `KEEP` (`CNAME`, `.gitignore`…)
5. shows the changes and asks before committing (`--dry-run` stops before the commit; `--yes` skips the question)
6. commits with a neutral `Deploy <UTC time>` message and pushes, never force-pushing

The clone uses `core.autocrlf=false`, so files are published byte-for-byte (the vCard needs CRLF). For a custom domain, add a `CNAME` file to the Pages repo once; the deploy keeps it. `PAGES_REPO` and `PAGES_DIR` env vars override the target and the clone folder.

### Conventions

- **No backend.** Fully static: no servers, Workers, serverless functions or runtime API keys. Do heavy or secret work at build time (a Vite plugin, or a script that commits generated files) or in the browser.
- **Minimal code comments.** Put the "why" here or in commit messages. Keep a comment only if it prevents a likely regression, in one line. An empty `catch {}` trips `no-empty`; write `catch { return; }`.
- **Proportionate tooling:** a one-person portfolio, so no CI test jobs, no visual snapshots, and every new dependency has to earn its place.
- **Before committing:** `lint`, `format:check`, `build` and `test:coverage` pass. Run `test:e2e` for larger changes.
- **New features ship with tests** and keep coverage at or above 80%.

## Architecture

React 19 + TypeScript + Vite, a single page with no router; navigation is by section `id`.

- **[src/App.tsx](src/App.tsx):** `Nav` and `Hero` are eager. The other sections and all overlays are `lazy()`, inside `Suspense` + `ErrorBoundary`; overlays use `fallback={<></>}`, so a failed chunk renders nothing.
- **Lenis** drives smooth scrolling. It isn't created under reduced motion, so `getLenis()` can return `null`.
- **Code layout:**
  - components: one folder per component (`index.tsx` + `.module.css`)
  - shared hooks: [src/hooks/](src/hooks/)
  - stores, each with its own hook (`a11yPrefs`, `theme`, `pwa`, `webVitals`), and DOM helpers: [src/utils/](src/utils/)
  - helpers used by one component sit next to it
- **Content:** language-neutral facts are in [src/site.config.ts](src/site.config.ts) and text in `src/i18n/locales/<lang>.ts`; components import the joined values from [src/i18n/content.ts](src/i18n/content.ts). No hard-coded copy. Every new string goes into all four languages (en/es/fr/ja); never translate ids, URLs or icons. No logic in content files. More in [docs/content.md](docs/content.md).
- **Animation:** Framer Motion through `m.*` only, never `motion.*` (`LazyMotion strict` throws). Read motion with `useReducedMotionConfig()` (it respects the in-site override), and use `prefersReducedMotion()` for JS scrolling.
- **Overlays:** use `useModal` ([src/hooks/useModal.ts](src/hooks/useModal.ts)) for Lenis pausing, `inert`, focus restore and run-after-close, plus `trapTab` and Esc.
  - Wire each into `App.tsx` as an `AppCommand` ([commands.ts](src/components/CommandPalette/commands.ts)), give it a palette entry, and add a footer link via `LINKS` in `Footer/index.tsx` if it needs one.
  - The palette builds sections, projects and socials from the data automatically.
- **Print résumé:** `PrintResume` is print-only and built from the same data; `@media print` in `globals.css` hides everything else, portals included. Add résumé-worthy content to it too.
- **Shortcuts:** keys live in `shortcuts` in `site.config.ts`, with labels in `shortcutsCopy.items`.
- **Accessibility statement (`Trust`):** every claim in `trustCopy` must stay true. If you add a `localStorage` key, a third-party request, cookies or an analytics change:
  - update the statement, its storage list and `SAVED_KEYS` in `Trust/index.tsx` (tests check the keys and the quoted palette label)
  - bump `trustReviewed`

### Styling and themes

CSS Modules plus tokens in [src/globals.css](src/globals.css), with no Tailwind.

- **Three dark themes:** copper (default, 08–16), night (16–24) and sakura (00–08).
  - **Who sets it:** the inline script in [index.html](index.html), before first paint, with priority `?theme=` → saved choice ([src/utils/theme.ts](src/utils/theme.ts), `localStorage["theme"]`) → time of day.
  - **Parity:** keep the inline script and `applyTheme()` in sync (parity-tested).
  - **Token names:** `--purple` / `--cyan` mean the theme's primary / secondary colours (sakura's `--cyan` is ivory).
- **Colour only via tokens** (`--purple*`, `--cyan*`, `--text-*`, `--bg`, `--nav-bg`, `--drawer-bg`, `--grad-*`). Never hard-code hex or rgba in components; `--white-a*` / `--black-a*` are safe overlays, and `--swatch-*` tokens show other themes.
- **Check contrast in all three themes.**
  - Use `--text-muted`, not `--text-dim`, for small text on `--drawer-bg`.
  - Never put white text on bright accents.
  - Accent buttons: `var(--grad-btn)` or `--grad-cta` with `color: var(--on-accent)`, hovered with `filter: brightness(1.1)`, not `opacity`.
  - `--text-ghost` is decorative only.
- **Accessibility prefs** ([src/utils/a11yPrefs.ts](src/utils/a11yPrefs.ts)): saved to `localStorage` and mirrored as `data-*` on `<html>` (text size, contrast, font, motion, cursor, links, vision), and applied before first paint by an inline script. Keep that script and `applyPrefs()` in sync. New UI must work under every pref, so size text in `rem`.

### Other gotchas

- **Hooks lint:** `react-hooks/set-state-in-effect` forbids a synchronous `setState` in an effect body. Use a lazy `useState(() => …)` initialiser or set state from callbacks. Run `npm run lint` after touching an effect.
- **Analytics:**
  - Cloudflare Web Analytics, cookieless; `startAnalytics()` in [src/utils/startup.ts](src/utils/startup.ts) runs only on the hosts in `analytics.hosts` and never with GPC or Do Not Track.
  - The `index.html` CSP must allow `static.cloudflareinsights.com` (script) and `cloudflareinsights.com` (connect), or the beacon is silently blocked.
  - Don't also enable Cloudflare's "automatic setup", or visits are counted twice.
- **CSP:** any new external origin, WASM or worker needs a CSP change. Never pass axe locales to `axe.configure()`: it uses `new Function`, which the CSP blocks.
- **Years of experience** is always derived (`yearsExperience`), never hard-coded.
- **Service worker:** updates wait for the toast's Refresh; never add `skipWaiting()` on install, and never cache non-`ok` responses. See [docs/pwa.md](docs/pwa.md).
- **Build:** `react-vendor` and `motion` are manual chunks, and `chunkSizeWarningLimit` is 700 kB for the on-demand axe chunk.
  - Files imported by `vite.config.ts` need explicit `.ts` import extensions.
  - Keep initial JS under the 150 KB gzipped budget (an e2e test).
