import styles from "./Awards.module.css";
import { awards } from "../../i18n/content";
import { SectionHeader } from "../SectionHeader";
import { TimelineList } from "../TimelineList";
import { useSectionInView } from "../../hooks/useSectionInView";

export function Awards() {
  const { ref, inView } = useSectionInView();

  return (
    <section id="awards" className="sec" ref={ref}>
      <SectionHeader id="awards" />

      <TimelineList
        items={awards}
        inView={inView}
        accent="cyan"
        getKey={(a) => `${a.title}-${a.year}`}
        getEntryProps={(a) => ({
          year: a.year,
          logo: a.logo,
          logoAlt: a.org,
          heading: a.title,
          subtitle: a.org,
          subtitleClassName: styles.org,
        })}
      />
    </section>
  );
}
