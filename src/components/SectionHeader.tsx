import { navLinks } from "../data";

export function SectionHeader({ id }: { id: string }) {
  const entry = navLinks.find((l) => l.id === id);
  const num = navLinks.indexOf(entry!) + 1;
  const title = entry?.title ?? entry?.label ?? id;

  return (
    <div className="sec-hdr">
      <span className="sec-num">{String(num).padStart(2, "0")}</span>
      <h2 className="sec-title">{title}</h2>
      <div className="sec-line" />
    </div>
  );
}
