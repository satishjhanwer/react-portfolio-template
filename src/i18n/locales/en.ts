import { yearsExperience } from "../../utils/experience.ts";

const en = {
  site: {
    tagline: "designed with intent. built with craft.",
    pageTitle: "Jane Doe - Frontend Engineer",
    skipLinkLabel: "Skip to main content",
    sectionErrorMessage: "Sorry, there was an error loading this section.",
    defaultLogoAlt: "Default",
  },
  languageCopy: {
    label: "Language",
    disclaimer: "",
    readInEnglish: "Read in English",
  },
  loader: { enterText: "INITIALIZING", portfolioLabel: "PORTFOLIO" },
  navLinks: {
    about: { label: "about" },
    skills: { label: "skills", title: "skills & stack" },
    projects: { label: "projects" },
    oss: { label: "oss", title: "open source" },
    experience: { label: "experience", title: "work history" },
    education: { label: "education" },
    awards: { label: "awards" },
    contact: { label: "contact" },
  },
  navMenuLabel: { open: "Open menu", close: "Close menu" },
  availability: {
    compact: "available",
    full: "available for work",
    statuses: ["AVAILABLE FOR WORK", "OPEN TO FULLTIME", "FREELANCE · CONSULTING"],
  },
  availabilitySince: (since: string) => `from ${since}`,
  availabilityLinkSuffix: " - get in touch",
  hero: {
    eyebrow: "Senior Frontend Engineer · Design Systems & Accessibility",
    roles: { frontend: "Frontend Engineering", design: "Design Systems" },
    taglineHtml:
      "A short, punchy <b>tagline</b> about what you build and what makes you <b>stand out</b>. Keep it to one or two sentences.",
    ctaPrimary: "view my work →",
    ctaGhost: "download resume",
    floatChips: {
      stack: "TypeScript · React",
      a11y: "Accessibility · Performance",
      years: `${yearsExperience} years Engineering`,
    },
  },
  stats: {
    years: "years in software development",
    degree: "Computer Science - Your University",
    oss: "open source contributor",
  },
  about: {
    headlineHtml: `${yearsExperience} years building for the web.<br/><em>Replace this</em> with your own one-line story.`,
    bodyHtml:
      "A paragraph or two about you: what you build, how you work and what you care about. Use <b>bold</b> for the phrases a reader should remember.<br/><br/>Everything on this page comes from <b>src/site.config.ts</b> and the language files in <b>src/i18n/locales/</b>, so you change the content without touching the components.",
  },
  impactTitle: "impact at a glance",
  impact: {
    users: { label: "monthly users", context: "on the products I've helped ship" },
    components: { label: "reusable components", context: "in a shared design system" },
    teams: { label: "teams supported", context: "building on the same component library" },
    speed: { label: "faster page loads", context: "after a performance overhaul" },
  },
  skillCategories: {
    frontend: "frontend architecture",
    styling: "css & styling",
    tooling: "tooling & build",
    testing: "testing",
  },
  viewProjectLabel: "View project",
  projects: {
    designSystem: {
      type: "design system",
      desc: "A themeable React component library with accessibility built in: keyboard support, visible focus and colour contrast checked in CI. Replace this with your flagship project.",
    },
    dashboard: {
      type: "web app",
      desc: "A real-time analytics dashboard with server-rendered charts and filters that stay fast with large data sets.",
    },
    checkout: {
      type: "e-commerce",
      desc: "A mobile-first checkout flow rebuilt for speed, with end-to-end tests covering every payment path.",
    },
  },
  repos: {
    "awesome-ui-kit": "A small, accessible UI kit for React.",
    "dev-notes": "Notes and snippets I keep coming back to.",
    "weekend-project": "A fun side project built over a weekend.",
  },
  experienceNodes: {
    acme: {
      year: "2023 - present",
      role: "Senior Frontend Engineer",
      detail:
        "Leading frontend architecture and mentoring a team of five engineers. Shipping fast, accessible web apps used by millions.",
    },
    techstart: {
      year: "2020 - 2023",
      role: "Frontend Engineer",
      detail:
        "Built core product features with React and TypeScript, and cut page load time by 40% through performance work.",
    },
    webworks: {
      year: "2018 - 2020",
      role: "Junior Developer",
      detail:
        "Built responsive websites for clients across many industries, learning HTML, CSS and JavaScript in depth.",
    },
  },
  educationNodes: {
    degree: {
      degree: "B.Sc. - Computer Science",
      school: "Your University",
      detail: "Software engineering, algorithms and human-computer interaction.",
    },
    school: { degree: "High School", school: "Your School", detail: "Mathematics, physics and computing." },
  },
  awards: {
    excellence: "Engineering Excellence Award",
    hackathon: "Hackathon Winner",
  },
  heading: { muted: "let's build", grad: "something real." },
  note: "Open to new opportunities and interesting conversations - a full-time role, a freelance project or just a chat about the web.",
  openTo: ["full-time roles", "freelance projects", "open source collaboration", "coffee chats"],
  profile: {
    headline: "Senior Frontend Engineer · Design Systems",
    location: "London, UK",
    meta: [`${yearsExperience} years in software development`, "B.Sc. Computer Science · Your University"],
    highlightsHtml: [
      "Led a <b>design system</b> used by six product teams.",
      "Cut page load time by <b>40%</b> on a high-traffic product.",
      "Mentors engineers and sets the team's <b>code-review standards</b>.",
    ],
  },
  commandGroups: {
    navigate: "navigate",
    actions: "actions",
    projects: "projects",
    social: "elsewhere",
  },
  commandPalette: {
    dialogLabel: "Command palette",
    inputLabel: "Search commands",
    placeholder: "Type a command or search…",
    empty: "No matching commands.",
    resultCount: (n: number) => (n === 1 ? "1 command available" : `${n} commands available`),
    copied: "Email copied to clipboard",
    copyFailed: "Couldn't copy - opening your mail app instead",
    triggerText: "search",
    footer: { navigate: "navigate", select: "select", close: "close" },
  },
  commandLabels: {
    home: "Back to top",
    goTo: (title: string) => `Go to ${title}`,
    hireMe: "Hire me",
    prefs: "Accessibility preferences",
    install: "Install as an app",
    copyEmail: "Copy email address",
    emailMe: "Send me an email",
    downloadResume: "Download resume",
    printResume: "Print / save as PDF",
    openProject: (title: string) => title,
    openSocial: (label: string) => `Open ${label}`,
    retro: "Insert coin: retro mode",
    switchLanguage: (name: string) => `Switch language: ${name}`,
    theme: (name: string) => `Theme: ${name}`,
    shortcuts: "Keyboard shortcuts",
  },
  commandHints: {
    copied: "copied ✓",
    external: "↗",
    download: "pdf",
    prefs: "text, contrast, motion",
    install: "works offline",
    printResume: "always up to date",
    retro: "↑↑↓↓←→←→BA",
    themeAuto: "by time of day",
    shortcuts: "?",
  },
  commandKeywords: {
    home: "top hero start home",
    hireMe: "hire available work job role fulltime freelance consulting",
    prefs:
      "a11y accessibility preferences settings text size zoom font dyslexia contrast motion animation cursor underline links colour color blind",
    install: "install app pwa offline desktop home screen add",
    copyEmail: "mail contact clipboard hire",
    emailMe: "mail contact message hire mailto",
    downloadResume: "cv resume pdf download hire",
    printResume: "print pdf save cv resume paper",
    language: "language translate translation idioma langue 言語 english spanish french japanese español français",
    retro: "konami cheat secret easter egg retro arcade 8bit crt insert coin",
    theme: "theme colour color appearance dark palette indigo sunset arctic auto time",
    shortcuts: "keyboard shortcuts keys hotkeys help",
  },
  easterEgg: {
    toastOn: "Cheat code accepted: retro mode on. Enter it again to switch back.",
    toastOff: "Retro mode off. Back to the present.",
    consoleTitle: "👾 psst, you found the console.",
    consoleHint: "Try ↑ ↑ ↓ ↓ ← → ← → B A on the page (or search “konami” in Ctrl/⌘+K).",
  },
  a11yPrefsTrigger: "Accessibility preferences",
  a11yPrefsCopy: {
    title: "accessibility preferences",
    intro: "Adjust the site to suit you. Choices are saved in this browser and apply on every visit.",
    close: "Close accessibility preferences",
    reset: "reset to defaults",
    toggles: {
      highContrast: {
        label: "high contrast",
        desc: "Brighter text, stronger borders, pure black background.",
      },
      readableFont: {
        label: "readable font",
        desc: "Atkinson Hyperlegible, designed for low-vision readers.",
      },
      reduceMotion: {
        label: "reduce motion",
        desc: "Stops animations and smooth scrolling, even if your device allows them.",
      },
      systemCursor: {
        label: "standard cursor",
        desc: "Use your system pointer instead of the custom cursor.",
      },
      underlineLinks: {
        label: "underline links",
        desc: "Make every link identifiable without relying on colour.",
      },
    },
    textSize: { legend: "text size" },
    theme: {
      legend: "theme",
      auto: "auto",
      autoHint: (name: string) => `follows the time of day · now ${name}`,
      names: { indigo: "indigo", sunset: "sunset", arctic: "arctic" },
    },
    vision: {
      legend: "colour vision simulation",
      hint: "Not a correction - a preview of how this page looks to people with colour-vision deficiencies.",
      options: {
        none: "off",
        protanopia: "protanopia (no red cones)",
        deuteranopia: "deuteranopia (no green cones)",
        tritanopia: "tritanopia (no blue cones)",
        achromatopsia: "achromatopsia (no colour)",
      },
    },
  },
  shortcutsCopy: {
    title: "keyboard shortcuts",
    intro: "Everything on this site works with the keyboard. These save time.",
    close: "Close keyboard shortcuts",
    footerLink: "keyboard shortcuts",
    items: {
      palette: "open the command palette",
      search: "open the command palette (quick)",
      help: "show these shortcuts",
      print: "print the resume or save it as a PDF",
      close: "close any dialog or menu",
      paletteNav: "move through palette results and run one",
      secret: "there's a secret… it starts with the arrow keys",
    },
  },
  pwaCopy: {
    install: "install app",
    installHint: "Add this site to your device; it works offline after one visit",
    updateTitle: "A new version is available",
    updateBody: "Refresh to load the latest changes.",
    refresh: "refresh",
    dismiss: "Dismiss update notice",
  },
  printResume: {
    sections: {
      summary: "Summary",
      highlights: "Highlights",
      skills: "Skills",
      experience: "Experience",
      projects: "Selected projects",
      openSource: "Open source",
      education: "Education",
      awards: "Awards",
    },
    footer: (url: string) => `Printed from ${url} - the live version is always up to date.`,
  },
};

export default en;
