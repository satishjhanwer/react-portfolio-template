/**
 * ═══════════════════════════════════════════════════════
 *  AWARDS SECTION
 *  Add your awards and recognitions.
 *  The `logo` field is optional — omit it or provide a URL.
 *  Remove this section entirely if not needed (see README).
 * ═══════════════════════════════════════════════════════
 */

export interface Award {
  title: string;
  year: string;
  org: string;
  logo?: string;
}

export const awards: Award[] = [
  {
    title: "Employee of the Year",
    year: "2023",
    org: "Acme Corp",
  },
  {
    title: "Hackathon Winner — Best Technical Implementation",
    year: "2022",
    org: "DevConf 2022",
  },
  {
    title: "Outstanding Contributor Award",
    year: "2021",
    org: "Open Source Foundation",
  },
];
