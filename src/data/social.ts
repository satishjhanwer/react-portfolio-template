/**
 * ═══════════════════════════════════════════════════════
 *  SOCIAL LINKS
 *  Add your social media profiles. Icons use devicon classes.
 *  See https://devicon.dev for available icons.
 *  Add or remove entries as needed.
 * ═══════════════════════════════════════════════════════
 */

export interface SocialLink {
  label: string;
  href: string;
  icon: string;
}

export const socials: SocialLink[] = [
  {
    label: "GitHub",
    href: "https://github.com/your-username",
    icon: "devicon-github-original",
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/your-username/",
    icon: "devicon-linkedin-plain",
  },
  {
    label: "X",
    href: "https://twitter.com/your-username",
    icon: "devicon-twitter-original",
  },
];
