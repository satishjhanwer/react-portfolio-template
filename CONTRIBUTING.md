# Contributing

Thanks for helping improve the React Portfolio Template. Bug reports, fixes, translations, accessibility improvements and new features are all welcome.

> **Using the template for your own portfolio?** You don't need to contribute anything back. This guide is for changes to the template itself.

By taking part you agree to follow our [Code of Conduct](CODE_OF_CONDUCT.md).

## Before you start

- **Bugs:** search [existing issues](https://github.com/satishjhanwer/react-portfolio-template/issues) first, then open a [bug report](https://github.com/satishjhanwer/react-portfolio-template/issues/new?template=bug_report.yml).
- **Features:** open a [feature request](https://github.com/satishjhanwer/react-portfolio-template/issues/new?template=feature_request.yml) before writing a large change, so we can agree on the approach.
- **Security issues:** don't open a public issue. See [SECURITY.md](SECURITY.md).
- **Small fixes** (typos, docs, obvious bugs) can go straight to a pull request.

## Development setup

You need [Node.js](https://nodejs.org) 22.18 or newer (the scripts in `scripts/` run TypeScript directly) and npm.

```bash
git clone https://github.com/<you>/react-portfolio-template.git
cd react-portfolio-template
npm install
npm run dev
```

Don't run `npm run setup` in a branch you plan to submit: it replaces the template's placeholder name, domain and links in every file.

## Making changes

1. Fork the repo and create a branch from `main`, e.g. `fix/nav-focus` or `feat/blog-section`.
2. Make your change. [CLAUDE.md](CLAUDE.md) documents the architecture and conventions; the most important ones are:
   - **No backend.** The site is fully static. Do heavy or secret work at build time or in the browser.
   - **Content is data.** Language-independent values go in `src/site.config.ts`; all user-facing text goes in `src/i18n/locales/en.ts` **and every other language file**. No hard-coded copy in components.
   - **Colour only via tokens** from `src/globals.css`, and check WCAG AA contrast (4.5:1 for text) in all three themes.
   - **Accessibility:** new UI must work with the keyboard, under reduced motion and under every accessibility preference. Size text in `rem`.
   - **Animation:** use Framer Motion's `m.*`, never `motion.*`.
   - **Placeholders:** keep `Jane Doe`, `hello@your-domain.com`, `your-domain.com` and `github.com/your-username` exactly as they are, so `npm run setup` can find them.
   - **Comments:** keep them minimal; only where they prevent a likely regression.
3. Add or update tests. New features ship with tests, and coverage must stay at or above 80%.
4. Update `README.md` if you change setup, commands or customisation steps.

## Checks

These must pass before you open a pull request (CI runs them too):

```bash
npm run lint
npm run format:check   # npm run format to fix
npm run build
npm run test:coverage
```

## Commit messages

Use [Conventional Commits](https://www.conventionalcommits.org) where you can:

```txt
feat: add a blog section
fix(nav): restore focus after closing the drawer
docs: explain how to remove a language
chore(deps): bump vite to 8.3.5
```

## Pull requests

- Keep each pull request focused on one change.
- Fill in the pull request template, link the issue it closes, and add screenshots for visual changes (in more than one theme if colours change).
- Be ready for review feedback. Maintainers may ask for changes before merging.

## Translations

Corrections to the Spanish, French and Japanese text are very welcome. To add a language, follow "Adding a language" in [CLAUDE.md](CLAUDE.md): copy `en.ts`, translate it, and register the code in `site.config.ts` and `src/i18n/content.ts`. The build fails if any key is missing.

## License

By contributing, you agree that your contributions are licensed under the [MIT License](LICENSE).
