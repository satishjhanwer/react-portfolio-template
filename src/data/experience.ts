/**
 * ═══════════════════════════════════════════════════════
 *  EXPERIENCE SECTION
 *  Add your work history as timeline entries.
 *  The `logo` field is optional — omit it or provide a URL.
 *  Set `active: true` on your current role.
 * ═══════════════════════════════════════════════════════
 */

export interface TimelineNode {
  year: string;
  role: string;
  org: string;
  detail: string;
  logo?: string;
  active?: boolean;
}

export const experienceNodes: TimelineNode[] = [
  {
    year: "2023 - present",
    role: "Senior Software Engineer",
    org: "Acme Corp",
    detail:
      "Leading frontend architecture and mentoring a team of 5 engineers. Shipping high-performance, accessible web applications used by millions.",
    active: true,
  },
  {
    year: "2020 - 2023",
    role: "Software Engineer",
    org: "TechStart Inc.",
    detail:
      "Built and maintained core product features using React and TypeScript. Reduced page load time by 40% through performance optimization.",
  },
  {
    year: "2018 - 2020",
    role: "Junior Developer",
    org: "WebWorks Agency",
    detail:
      "Developed responsive websites and web applications for clients across various industries. Gained strong foundation in HTML, CSS, and JavaScript.",
  },
];

export const resumeUrl: string | null = "/resume.pdf";
