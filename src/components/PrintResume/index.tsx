import type { ReactNode } from "react";
import {
  about,
  awards,
  contactCardCopy,
  educationNodes,
  email,
  experienceNodes,
  printResume,
  projects,
  recruiter,
  repos,
  site,
  skillCategories,
  socials,
} from "../../i18n/content";
import { RichText } from "../RichText";
import styles from "./PrintResume.module.css";
import { CONTACT_FILES } from "../../utils/contactLinks";

const bareUrl = (href: string) => href.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className={styles.section}>
      <h2 className={styles.heading}>{title}</h2>
      {children}
    </section>
  );
}

export function PrintResume() {
  const { sections } = printResume;
  const contacts = [
    recruiter.location,
    email,
    printResume.siteUrl,
    ...socials.filter((s) => s.label === "GitHub" || s.label === "LinkedIn").map((s) => bareUrl(s.href)),
  ].filter(Boolean);

  return (
    <article className={styles.root} data-print-resume>
      <header className={styles.header}>
        <div>
          <h1 className={styles.name}>{site.name}</h1>
          <p className={styles.headline}>{recruiter.headline}</p>
          <p className={styles.contacts}>{contacts.join("  ·  ")}</p>
        </div>
        <figure className={styles.qr}>
          <img
            src={`/${CONTACT_FILES.qrSite}`}
            alt={contactCardCopy.qrAlt(printResume.siteUrl)}
            width={64}
            height={64}
          />
          <figcaption>{contactCardCopy.printCaption}</figcaption>
        </figure>
      </header>

      <Section title={sections.summary}>
        <p className={styles.body}>
          <RichText html={about.bodyHtml} />
        </p>
      </Section>

      <Section title={sections.highlights}>
        <ul className={styles.bullets}>
          {recruiter.highlightsHtml.map((h) => (
            <li key={h}>
              <RichText html={h} />
            </li>
          ))}
        </ul>
      </Section>

      <Section title={sections.skills}>
        <dl className={styles.skills}>
          {skillCategories.map((cat) => (
            <div key={cat.id} className={styles.skillRow}>
              <dt>{cat.label}</dt>
              <dd>{[...cat.icons.map((i) => i.label), ...(cat.textSkills ?? [])].join(", ")}</dd>
            </div>
          ))}
        </dl>
      </Section>

      <Section title={sections.experience}>
        {experienceNodes.map((job) => (
          <div key={`${job.role}-${job.year}`} className={styles.entry}>
            <div className={styles.entryHead}>
              <h3 className={styles.entryTitle}>
                {job.role} <span className={styles.org}>· {job.org}</span>
              </h3>
              <span className={styles.date}>{job.year}</span>
            </div>
            <p className={styles.body}>{job.detail}</p>
          </div>
        ))}
      </Section>

      <Section title={sections.projects}>
        {projects.map((p) => (
          <div key={p.title} className={styles.entry}>
            <div className={styles.entryHead}>
              <h3 className={styles.entryTitle}>{p.title}</h3>
              <span className={styles.date}>{p.type}</span>
            </div>
            <p className={styles.body}>{p.desc}</p>
            <p className={styles.tags}>{p.tags.map((t) => t.label).join(" · ")}</p>
          </div>
        ))}
      </Section>

      <Section title={sections.openSource}>
        <ul className={styles.bullets}>
          {repos.map((r) => (
            <li key={r.name}>
              <b>{r.name}</b> ({bareUrl(r.url)}) - {r.desc}
            </li>
          ))}
        </ul>
      </Section>

      <Section title={sections.education}>
        {educationNodes.map((ed) => (
          <div key={ed.degree} className={styles.entry}>
            <div className={styles.entryHead}>
              <h3 className={styles.entryTitle}>
                {ed.degree} <span className={styles.org}>· {ed.school}</span>
              </h3>
              <span className={styles.date}>{ed.year}</span>
            </div>
            <p className={styles.body}>{ed.detail}</p>
          </div>
        ))}
      </Section>

      <Section title={sections.awards}>
        <ul className={styles.bullets}>
          {awards.map((a) => (
            <li key={`${a.title}-${a.year}`}>
              <b>{a.title}</b> · {a.org} · {a.year}
            </li>
          ))}
        </ul>
      </Section>

      <footer className={styles.footer}>{printResume.footer(printResume.siteUrl)}</footer>
    </article>
  );
}
