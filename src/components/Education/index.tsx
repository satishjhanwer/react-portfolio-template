import styles from "./Education.module.css";
import { educationNodes } from "../../i18n/content";
import { SectionHeader } from "../SectionHeader";
import { TimelineList } from "../TimelineList";
import { useSectionInView } from "../../hooks/useSectionInView";

export function Education() {
  const { ref, inView } = useSectionInView();

  return (
    <section id="education" className="sec" ref={ref}>
      <SectionHeader id="education" />

      <TimelineList
        items={educationNodes}
        inView={inView}
        accent="cyan"
        getKey={(n) => `${n.degree}-${n.school}-${n.year}`}
        getEntryProps={(n) => ({
          year: n.year,
          logo: n.logo,
          logoAlt: n.school,
          heading: n.degree,
          subtitle: n.school,
          subtitleClassName: styles.school,
          detail: n.detail,
        })}
      />
    </section>
  );
}
