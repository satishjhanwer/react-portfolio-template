/**
 * ═══════════════════════════════════════════════════════
 *  EDUCATION SECTION
 *  Add your education as timeline entries.
 *  The `logo` field is optional — omit it or provide a URL.
 *  Remove entries you don't need.
 * ═══════════════════════════════════════════════════════
 */

export interface EducationNode {
  year: string;
  degree: string;
  school: string;
  detail: string;
  logo?: string;
}

export const educationNodes: EducationNode[] = [
  {
    year: "2016 - 2020",
    degree: "B.S. Computer Science",
    school: "State University",
    detail:
      "Graduated with honors. Focused on software engineering, data structures, and web technologies.",
  },
  {
    year: "2014 - 2016",
    degree: "High School Diploma",
    school: "City High School",
    detail: "Science and Mathematics focus.",
  },
];
