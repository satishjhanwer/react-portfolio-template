/**
 * ═══════════════════════════════════════════════════════
 *  ABOUT SECTION
 *  Edit your bio, key stats, and professional summary.
 *  HTML is supported in `headlineHtml` and `bodyHtml`.
 * ═══════════════════════════════════════════════════════
 */

export interface Stat {
  value: string;
  label: string;
}

export const stats: Stat[] = [
  { value: "X+", label: "years of professional experience" },
  { value: "B.S.", label: "Computer Science — Your University" },
  { value: "OSS", label: "open source contributor" },
];

export const about = {
  headlineHtml:
    "X+ years building products.<br/><em>Passionate about</em> your-specialization.",
  bodyHtml:
    "Write a few paragraphs about your professional background, what you specialize in, and what drives you. Highlight your <b>key strengths</b>, notable achievements, and the kind of work you're most passionate about.<br/><br/>Mention your <b>tech stack</b>, areas of expertise, and any unique qualities that set you apart. This section should give visitors a clear picture of who you are as a professional.<br/><br/>Keep it authentic and concise — recruiters and collaborators will read this to decide if you're a good fit.",
};
