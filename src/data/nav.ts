export interface NavLink {
  label: string;
  id: string;
  title?: string;
}

export const navLinks: NavLink[] = [
  { label: "about", id: "about" },
  { label: "skills", id: "skills", title: "skills & stack" },
  { label: "projects", id: "projects" },
  { label: "oss", id: "oss", title: "open source" },
  { label: "experience", id: "experience", title: "work history" },
  { label: "education", id: "education" },
  { label: "awards", id: "awards" },
  { label: "contact", id: "contact" },
];
