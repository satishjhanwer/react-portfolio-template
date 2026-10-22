import { m } from "framer-motion";
import styles from "./Experience.module.css";
import { experienceNodes, resumeUrl, hero } from "../../i18n/content";
import { SectionHeader } from "../SectionHeader";
import { TimelineList } from "../TimelineList";
import { useSectionInView } from "../../hooks/useSectionInView";

export function Experience() {
  const { ref, inView } = useSectionInView();

  return (
    <section id="experience" className="sec" ref={ref}>
      <SectionHeader id="experience" />

      <TimelineList
        items={experienceNodes}
        inView={inView}
        accent="purple"
        getKey={(n) => `${n.role}-${n.org}-${n.year}`}
        getEntryProps={(n) => ({
          year: n.year,
          logo: n.logo,
          logoAlt: n.org,
          heading: n.role,
          subtitle: n.org,
          subtitleClassName: styles.org,
          detail: n.detail,
          active: n.active,
        })}
      />

      {resumeUrl && (
        <m.div
          className={styles.downloadWrap}
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.6 }}>
          <a href={resumeUrl} download className={styles.btn}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            {hero.ctaGhost.label}
          </a>
        </m.div>
      )}
    </section>
  );
}
