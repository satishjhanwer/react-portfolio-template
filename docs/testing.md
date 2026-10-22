# Testing

Read this before writing or changing tests. Rules that apply everywhere are in [CLAUDE.md](../CLAUDE.md).

## Vitest (unit and component)

[vitest.config.ts](../vitest.config.ts) uses jsdom and Testing Library, with `TZ=UTC` so clock-based tests are deterministic. It's separate from `vite.config.ts`, so the OG-image, build-info and service-worker plugins don't run in tests. Tests sit next to the code as `*.test.ts(x)`. Cross-cutting ones (the `index.html` inline scripts, the 404 page, sprite and config integrity) live in [src/test/](../src/test/) with the shared `setup.ts` and `helpers.ts`. Tests for `scripts/` sit next to them and are type-checked by `tsconfig.node.json`.

- **Coverage:** V8 over `src/utils`, `src/i18n`, `src/hooks`, `src/components` and `App.tsx` (locale files, types, the components barrel and CSS excluded), with an 80% threshold on lines, branches, functions and statements. The HTML report is in `coverage/`. Raise thresholds over time; never lower them.
- **Modules with import-time state** (`locale`, `content`, the stores): call `vi.resetModules()`, set up the URL, storage or navigator, then `await import()` the module fresh. Tests adapt to the code. Don't refactor production code for testability without agreeing it first.
- **`setup.ts`:**
  - mocks `matchMedia`
  - installs fake `IntersectionObserver` / `ResizeObserver` and a `scrollIntoView` spy
  - sets Framer's `MotionGlobalConfig.skipAnimations`, so enter and exit finish at once
  - raises Testing Library's async timeout to 5 s
  - removes every `window` / `document` listener a test added. jsdom's `window.addEventListener` doesn't go through `EventTarget.prototype`, so it's wrapped directly.
- **`helpers.ts`:** `intersectAll()` (brings every observed element into view), `resizeAll()`, `stubLocation` (gives `reload` a spy), `stubLanguages`, `throwingStorage`, `mockMatchMedia`.
- Mock `@fontsource/atkinson-hyperlegible/*.css` in any test that loads `a11yPrefs`.
- **Components:** render inside `<LazyMotion features={domAnimation} strict>`, and `MotionConfig` to force reduced motion on or off.
  - Overlays that use `useModal` only run their after-close action when the parent unmounts them, so test them through a small harness that removes the overlay in `onClose` (see `CommandPalette.test.tsx`).
  - Don't fake `requestAnimationFrame` around `AnimatePresence` exits. Fake only the timer you need, e.g. `setInterval`.
- **[src/App.test.tsx](../src/App.test.tsx)** renders the whole app with the Loader, Lenis, axe and confetti mocked.
  - On the full page, wait with cheap DOM queries (`getElementById`, `[role="dialog"]` + label), not `findByRole(…, { name })`. Computing accessible names for the whole page on every poll starves React under load and makes the tests flaky.
  - Use role queries `within()` a dialog.
- **Parity and drift tests.** If you change either side, change both:
  - `src/test/indexHtml.test.ts`: the inline theme and prefs scripts vs `applyTheme()` / `applyPrefs()`
  - `src/test/notFoundPage.test.ts`: the 404 page's labels vs the locale files
  - `src/utils/vcard.test.ts`: the committed contact files vs the generator
  - `Trust.test.tsx`: the listed storage keys and the quoted palette label
- A full-suite hint about jsdom being created once per file is expected. `pool: "vmThreads"` breaks the `location` stubs and `isolate: false` leaks module state, so keep the defaults.

## Playwright (e2e)

[playwright.config.ts](../playwright.config.ts) builds the site, serves it with `vite preview` on port 4173, and runs [e2e/](../e2e/) in Chromium at desktop and Pixel 7 sizes.

- **Setup:** run `npx playwright install chromium` once on a new machine. Reports go to `playwright-report/` and `test-results/`, and failures keep a trace (`npx playwright show-trace …`). There are no visual snapshots, by choice.
- **2 workers.** On an 8 GB machine, 3 Chromium workers rendering the full page run out of memory, and the browser dies with "Unexpected end of JSON input". `ERR_NETWORK_IO_SUSPENDED` means the machine slept mid-run; rerun.
- **[e2e/fixtures.ts](../e2e/fixtures.ts):**
  - every test fails on any console error, uncaught error or CSP violation
  - `gotoReady()` waits for the Loader to leave (it's the only element with an inline `scaleX(` transform)
  - `loadAllSections()` scrolls each section in, re-querying, because Skills swaps its placeholder for the real section
  - import UI text from `src/i18n/locales/*.ts` instead of hard-coding it
- **Specs:**
  - `smoke`: themes, `{{YEARS_EXPERIENCE}}` filled, analytics allowed by the CSP on the production host and absent on localhost
  - `navigation`: nav links, mobile drawer, the "hire me" regression, `#hash` links, skip link
  - `features`: palette, recruiter mode, prefs and theme applied before first paint, `?lang=`, print, Konami, contact card and QR
  - `a11y`: axe WCAG 2.0–2.2 A/AA with motion on, in each theme on desktop plus copper on mobile, rotating hero statuses, overlays, high contrast at 130%, the shortcuts sheet, the statement, the colophon
  - `seo`: meta and OG tags, the OG image, JSON-LD, robots, sitemap, manifest, and the **150 KB gzipped initial-JS budget**
  - `pwa`: offline after one visit, and the offline page
  - `notfound`: the 404 page in each theme, and without JavaScript
- **Skips on mobile** are deliberate where a phone-sized run would only repeat the desktop check (identical HTML, keyboard-only features, slow service-worker tests).
- **Offline tests** start their own `vite preview` and kill it, because Playwright's offline mode doesn't cover service-worker traffic.
  - Each worker uses its own port (`4300 + parallelIndex`), and `startServer()` fails if its server exits. With a shared or random port, two workers can end up on one server and kill it under each other.
  - They allow "Failed to load resource" (expected offline), but no other errors.
  - They wait for every section to render before cutting the network.
- **If the budget fails,** look for a dependency that slipped into the initial bundle before raising `INITIAL_JS_BUDGET_KB` in [e2e/seo.spec.ts](../e2e/seo.spec.ts).
