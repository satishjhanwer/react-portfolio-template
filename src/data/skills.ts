/**
 * ═══════════════════════════════════════════════════════
 *  SKILLS SECTION
 *  Organize your skills into categories. Each category has:
 *  - `id`: unique identifier
 *  - `label`: display name
 *  - `variant`: color style — "P" (primary), "C" (accent), "G" (neutral)
 *  - `icons`: array of devicon class names (see https://devicon.dev)
 *  - `textSkills`: optional array of text-only skills (no icons)
 *
 *  Add, remove, or rename categories to match your stack.
 * ═══════════════════════════════════════════════════════
 */

export interface SkillIcon {
  icon: string;
  label: string;
  color?: string;
}

export interface SkillCategory {
  id: string;
  label: string;
  variant: "P" | "C" | "G";
  icons: SkillIcon[];
  textSkills?: string[];
}

export const skillCategories: SkillCategory[] = [
  {
    id: "frontend",
    label: "frontend",
    variant: "P",
    icons: [
      { icon: "devicon-react-original colored", label: "React" },
      { icon: "devicon-typescript-plain colored", label: "TypeScript" },
      { icon: "devicon-javascript-plain colored", label: "JavaScript" },
      { icon: "devicon-html5-plain colored", label: "HTML5" },
      { icon: "devicon-css3-plain colored", label: "CSS3" },
      { icon: "devicon-nextjs-plain", label: "Next.js", color: "#888" },
    ],
  },
  {
    id: "backend",
    label: "backend",
    variant: "C",
    icons: [
      { icon: "devicon-nodejs-plain colored", label: "Node.js" },
      { icon: "devicon-python-plain colored", label: "Python" },
      {
        icon: "devicon-express-original",
        label: "Express",
        color: "#888",
      },
      { icon: "devicon-mongodb-plain colored", label: "MongoDB" },
      { icon: "devicon-postgresql-plain colored", label: "PostgreSQL" },
    ],
  },
  {
    id: "tooling",
    label: "tooling & devops",
    variant: "G",
    icons: [
      { icon: "devicon-git-plain colored", label: "Git" },
      { icon: "devicon-docker-plain colored", label: "Docker" },
      { icon: "devicon-vitejs-plain colored", label: "Vite" },
      { icon: "devicon-webpack-plain colored", label: "Webpack" },
      { icon: "devicon-github-original", label: "GitHub", color: "#888" },
    ],
  },
  {
    id: "testing",
    label: "testing",
    variant: "G",
    icons: [
      { icon: "devicon-jest-plain colored", label: "Jest" },
      { icon: "devicon-cypressio-plain colored", label: "Cypress" },
      { icon: "devicon-storybook-plain colored", label: "Storybook" },
    ],
  },
];
