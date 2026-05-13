/**
 * ═══════════════════════════════════════════════════════
 *  OPEN SOURCE SECTION
 *  Showcase your GitHub repositories.
 *  - `glow`: set true on your top/featured repo
 *  - `icon`: emoji or symbol for the card
 *  - Update star/fork counts manually or automate via GitHub API
 * ═══════════════════════════════════════════════════════
 */

export interface Repo {
  name: string;
  desc: string;
  stars: number;
  forks: number;
  lang: string;
  url: string;
  icon: string;
  glow?: boolean;
}

export const repos: Repo[] = [
  {
    name: "awesome-project",
    desc: "A curated collection of resources and tools for modern web development.",
    stars: 12,
    forks: 3,
    lang: "TypeScript",
    url: "https://github.com/your-username/awesome-project",
    icon: "⬡",
    glow: true,
  },
  {
    name: "react-hooks-toolkit",
    desc: "Collection of reusable, well-tested React hooks for common patterns.",
    stars: 8,
    forks: 2,
    lang: "TypeScript",
    url: "https://github.com/your-username/react-hooks-toolkit",
    icon: "◈",
  },
  {
    name: "cli-starter",
    desc: "Minimal boilerplate for building Node.js CLI tools with TypeScript.",
    stars: 5,
    forks: 1,
    lang: "TypeScript",
    url: "https://github.com/your-username/cli-starter",
    icon: "⚙",
  },
];
