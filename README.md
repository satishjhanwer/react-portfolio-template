# 🚀 Developer Portfolio Template

A premium, data-driven developer portfolio built with **React**, **TypeScript**, **Framer Motion**, and **vanilla CSS**. Fork it, fill in your data, deploy.

## ✨ Features

- **Data-driven** - All content lives in `src/site.config.ts` and the language files. Edit data, not components.
- **4 languages** - English, Spanish, French and Japanese, picked from the browser. Switch in the nav or with `?lang=es`.
- **3 auto-switching themes** - Indigo (day), Sunset (evening), Arctic (night). Visitors can also pick one themselves.
- **Command palette** - `Ctrl/⌘ + K` to jump to any section, project or profile, copy your email or switch theme.
- **Printable résumé** - `Ctrl/⌘ + P` prints a clean résumé built from the same data, so it's never out of date.
- **Accessibility preferences** - Text size, high contrast, readable font, reduced motion, underlined links and a colour-vision preview.
- **Framer Motion animations** - Scroll-triggered entrances, tilt cards and a scroll-driven timeline, all off under `prefers-reduced-motion`.
- **Lazy-loaded sections** - Code-split for fast initial loads.
- **PWA-ready** - Service worker, manifest, offline page and an "update available" prompt out of the box.
- **SEO optimized** - Meta tags, JSON-LD structured data, sitemap, and an Open Graph card generated at build time.
- **WCAG 2.2 AA accessible** - Semantic HTML, keyboard navigation, skip links, contrast-checked in every theme.
- **Mobile-first responsive** - Looks great on all screen sizes.
- **Tested** - 351 Vitest tests at ~99% coverage.

## 🏁 Quick Start

```bash
# 1. Click "Use this template" on GitHub to create your own repo
# 2. Clone your new repo
git clone https://github.com/your-username/your-portfolio.git
cd your-portfolio

# 3. Install dependencies
npm install

# 4. Run the interactive setup wizard
npm run setup

# 5. Preview your portfolio
npm run dev
```

The setup wizard will prompt for your name, title, domain, email, and social links, then auto-update every file that uses them (`index.html`, `manifest.json`, `sitemap.xml`, the config, the tests, etc.) and regenerate your logo and icons.

## 📁 Project Structure

```txt
├── public/                 # Static assets
│   ├── favicon.svg         # Generated from your initials (npm run icons)
│   ├── logo.svg            # Generated from your initials (npm run icons)
│   ├── resume.pdf          # ← Replace with your resume (optional)
│   ├── logos/              # ← Add company & school logos (optional)
│   ├── og-photo.jpg        # ← Add a photo for the social card (optional)
│   ├── manifest.json       # PWA manifest (auto-updated by setup)
│   ├── sitemap.xml         # SEO sitemap (auto-updated by setup)
│   ├── 404.html            # Not-found page
│   ├── offline.html        # Shown when offline
│   └── sw.js               # Service worker
├── src/
│   ├── site.config.ts      # ★ YOUR DATA: links, projects, jobs, skills, numbers
│   ├── i18n/locales/       # ★ YOUR TEXT: one file per language
│   │   ├── en.ts           # English (the source of truth)
│   │   ├── es.ts           # Spanish
│   │   ├── fr.ts           # French
│   │   └── ja.ts           # Japanese
│   ├── components/         # UI components, one folder each
│   ├── assets/icons/       # Skill & social icon sprite
│   ├── globals.css         # Design tokens & themes
│   ├── App.tsx             # Main app layout
│   └── main.tsx            # Entry point
├── scripts/
│   ├── setup.ts            # Interactive setup wizard
│   ├── icons.ts            # Logo & app icon generator
│   └── og-image.ts         # Social card generator
├── index.html              # HTML entry (auto-updated by setup)
└── vite.config.ts          # Build configuration
```

## 📝 Customization Guide

### Step 1: Run Setup (Handles the Boring Stuff)

```bash
npm run setup
```

This auto-updates: `index.html` (title, meta, JSON-LD), `manifest.json`, `sitemap.xml`, `robots.txt`, the 404 and offline pages, `LICENSE`, your name, initials, email and profiles in `site.config.ts`, the page titles in every language, and the tests. Then it regenerates `logo.svg`, `favicon.svg` and the app icons.

### Step 2: Edit Your Data and Text

Facts that don't change with language live in `src/site.config.ts`. The words live in `src/i18n/locales/en.ts`, under the same ids.

| What                         | `site.config.ts`                                                  | `locales/en.ts`                       |
| ---------------------------- | ----------------------------------------------------------------- | ------------------------------------- |
| Name, initials, career start | `site`, `hero`, `careerStart`                                     | `site.pageTitle`, `hero`              |
| About & key numbers          | `stats`, `impact`                                                 | `about`, `stats`, `impact`            |
| Skills                       | `skillCategories` (icons from [devicon.dev](https://devicon.dev)) | `skillCategories`                     |
| Projects                     | `projects` (title, tags, link)                                    | `projects` (type, description)        |
| Open source                  | `repos` (name, stars, forks, URL)                                 | `repos`                               |
| Work history                 | `experienceNodes` (company, logo, current role)                   | `experienceNodes` (dates, role, text) |
| Education & awards           | `educationNodes`, `awards`                                        | `educationNodes`, `awards`            |
| Contact & socials            | `email`, `socials`, `availability`                                | `heading`, `note`, `openTo`           |
| Résumé headline & highlights | `resumeUrl`                                                       | `profile`                             |

> **Note:** Years of experience are calculated from `careerStart`, so they never go stale.

### Step 3: Translate (or Drop) Languages

After editing `en.ts`, copy your changes into `es.ts`, `fr.ts` and `ja.ts`. The build fails until every language has every key, so nothing gets missed.

Only want English? Remove the other codes from `locales` in `site.config.ts`, delete their loader lines in `src/i18n/content.ts`, and delete the files.

### Step 4: Replace Assets

| Asset        | Location              | Notes                                                                                 |
| ------------ | --------------------- | ------------------------------------------------------------------------------------- |
| Resume       | `public/resume.pdf`   | Optional. A placeholder ships. Set `resumeUrl` to `null` in `site.config.ts` to hide. |
| Logos        | `public/logos/`       | Optional. Point `logo` on any job, school or award at the file.                       |
| Social photo | `public/og-photo.jpg` | Optional. Added to the 1200×630 card shown when your link is shared.                  |
| Favicon/logo | `public/*.svg`        | Generated from `site.initials`. Rerun `npm run icons` after changing them.            |

### Step 5: Customize Colors (Optional)

The design system is driven by CSS custom properties in `src/globals.css`. The template ships with 3 themes that auto-switch by time of day:

| Theme                | Time        | Primary   | Accent    |
| -------------------- | ----------- | --------- | --------- |
| **Default (Indigo)** | 08:00–15:59 | `#686bf2` | `#34d399` |
| **Sunset**           | 16:00–23:59 | `#f59e0b` | `#fb7185` |
| **Arctic**           | 00:00–07:59 | `#14b8a6` | `#38bdf8` |

To change colors, update the `--purple` (primary) and `--cyan` (accent) variables and their alpha variants in each theme block. Preview any theme instantly with `?theme=sunset` or `?theme=arctic`. Keep text at a 4.5:1 contrast ratio or better.

### Removing Sections

Don't need Awards? Open Source? Simply:

1. Remove the `<Awards />` line from `src/App.tsx`
2. Remove the `{ id: "awards" }` entry from `navLinks` in `src/site.config.ts`

That's it the section disappears from the page, the nav and the command palette. The printed résumé has its own copy of each section in `src/components/PrintResume/index.tsx`; delete it there too.

## 🚀 Deployment

### Vercel (Recommended)

1. Push your repo to GitHub
2. Import it on [vercel.com](https://vercel.com)
3. Framework: **Vite**. Done.

### Netlify

1. Push to GitHub
2. Import on [netlify.com](https://netlify.com)
3. Build command: `npm run build` | Publish directory: `dist`

### GitHub Pages

1. Run `npm run build`
2. Push the `dist/` folder to your `<username>.github.io` repo (or add a GitHub Action that does it)

## 🛠️ Development

```bash
npm run dev            # Start dev server with HMR
npm run build          # TypeScript check + production build
npm run preview        # Preview production build locally
npm test               # Run the tests
npm run test:coverage  # Tests with a coverage report
npm run lint           # Run ESLint
npm run format         # Format with Prettier
npm run icons          # Regenerate logo & icons from your initials
```

## 📦 Tech Stack

- **Framework**: React 19
- **Language**: TypeScript
- **Styling**: Vanilla CSS with CSS Custom Properties (CSS Modules)
- **Animations**: Framer Motion, [Lenis](https://github.com/darkroomengineering/lenis) smooth scrolling
- **Build Tool**: Vite
- **Testing**: Vitest + Testing Library
- **Icons**: [Devicon](https://devicon.dev)
- **Fonts**: [Inter](https://rsms.me/inter/) and [Space Grotesk](https://fonts.google.com/specimen/Space+Grotesk)

## 📄 License

MIT - see [LICENSE](./LICENSE). Use it for anything.

---

Built with ❤️ - inspired by modern developer portfolios.
