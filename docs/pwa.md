# Service worker, offline and the 404 page

Read this before touching `public/sw.js`, `src/utils/pwa.ts`, `offline.html` or `404.html`. Rules that apply everywhere are in [CLAUDE.md](../CLAUDE.md).

## Service worker

- `src/main.tsx` calls `initPwa()` ([src/utils/pwa.ts](../src/utils/pwa.ts)), which registers `/sw.js` and captures `beforeinstallprompt` for the "install app" entry in the footer and palette.
- **Versioning:** [public/sw.js](../public/sw.js) has a `{{BUILD_VERSION}}` placeholder in its cache name. A Vite plugin rewrites it (`dev` in dev, `v<timestamp>` at build), so every deploy evicts the old cache. Don't break that substitution.
- **Updates wait.** The worker never calls `skipWaiting()` on install. A new deploy shows the "update available" toast; Refresh posts `SKIP_WAITING`, then reloads on `controllerchange`. Swapping immediately would delete the cache an open tab still needs for its lazy chunks.
- **Offline:**
  - install precaches `/`, every asset `index.html` references, and `offline.html`
  - the page also reports, via a `PerformanceObserver`, every `/assets/` file it loaded before the worker took control
  - cache lookups use `ignoreVary: true`, because servers send `Vary` headers that would otherwise make every asset miss
- **Caching rules:**
  - only `ok` responses are stored, through `store()` with `waitUntil`; a 404 or 500 must never be cached
  - `/assets/` is cache-first with one network retry
  - navigations are network-first, falling back to the cache, then to `offline.html`
- **Lazy overlays** in `App.tsx` sit inside `ErrorBoundary fallback={<></>}`, so a failed chunk renders nothing instead of unmounting the app.
- **Deep links** (`/#contact`, the manifest shortcuts) scroll after the loader via `scrollToSectionWhenReady()`. `#accessibility` and `#privacy` open the statement instead.
- **Known gap:** timeline logos (`loading="lazy"`), `default-logo.png` and unused font weights are only cached once used, so offline they can show alt text.

## 404 page

[public/404.html](../public/404.html) is what GitHub Pages serves, with a 404 status, for unknown paths.

- It's standalone (no bundle, so it can't import anything) and English by default, so it works without JavaScript.
- An inline script then applies the saved theme (else the time of day), text size, high contrast, underlined links, and the language (`lang` → browser → English) from its own small table.
- A unit test keeps its link labels equal to the nav labels in every language file.
- `vite preview` serves the app for unknown paths instead, so test it at `/404.html`.
