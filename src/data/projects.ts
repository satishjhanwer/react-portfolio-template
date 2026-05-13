/**
 * ═══════════════════════════════════════════════════════
 *  PROJECTS SECTION
 *  Showcase your best work. Each project has:
 *  - `type`: category label (e.g., "web app", "open source")
 *  - `title`: project name
 *  - `desc`: 1–3 sentence description
 *  - `tags`: tech stack chips with style variants
 *  - `featured`: set true for your top project (gets a glow effect)
 *  - `url`: optional link to live demo or repo
 * ═══════════════════════════════════════════════════════
 */

export interface Tag {
  label: string;
  style: "P" | "C" | "G";
}

export interface Project {
  type: string;
  title: string;
  desc: string;
  tags: Tag[];
  featured?: boolean;
  glowC?: boolean;
  url?: string;
}

export const projects: Project[] = [
  {
    type: "web application",
    title: "Project Management Dashboard",
    desc: "Full-stack project management tool with real-time collaboration, Kanban boards, and team analytics. Built with React, Node.js, and WebSocket for live updates.",
    tags: [
      { label: "React", style: "P" },
      { label: "Node.js", style: "P" },
      { label: "WebSocket", style: "C" },
      { label: "MongoDB", style: "G" },
    ],
    featured: true,
    url: "https://github.com/your-username/project-dashboard",
  },
  {
    type: "open source",
    title: "Component Library",
    desc: "A headless, accessible React component library with 40+ components, full TypeScript support, and comprehensive documentation powered by Storybook.",
    tags: [
      { label: "TypeScript", style: "P" },
      { label: "React", style: "P" },
      { label: "Storybook", style: "C" },
      { label: "a11y", style: "G" },
    ],
  },
  {
    type: "mobile app",
    title: "Fitness Tracker App",
    desc: "Cross-platform fitness tracking application with workout logging, progress charts, and social features. Built with React Native and Firebase.",
    tags: [
      { label: "React Native", style: "P" },
      { label: "Firebase", style: "C" },
      { label: "Charts", style: "G" },
    ],
  },
  {
    type: "cli tool",
    title: "Static Site Generator",
    desc: "Fast, minimal static site generator built with Node.js. Supports Markdown, templates, and hot-reload for rapid content creation.",
    tags: [
      { label: "Node.js", style: "P" },
      { label: "Markdown", style: "C" },
      { label: "CLI", style: "G" },
    ],
  },
];
