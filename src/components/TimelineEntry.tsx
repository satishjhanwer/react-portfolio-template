import { m } from "framer-motion";
import { site } from "../i18n/content";
import { Image } from "./Image";

export interface TimelineEntryProps {
  index: number;
  inView: boolean;
  year: string;
  logo?: string;
  logoAlt: string;
  heading: string;
  subtitle: string;
  subtitleClassName?: string;
  detail?: string;
  active?: boolean;
  reached?: boolean;
}

export function TimelineEntry({
  index,
  inView,
  year,
  logo,
  logoAlt,
  heading,
  subtitle,
  subtitleClassName,
  detail,
  active,
  reached,
}: TimelineEntryProps) {
  return (
    <m.div
      className="timeline-entry"
      data-reached={reached || undefined}
      initial={{ opacity: 0, x: -16 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.4, delay: 0.1 + index * 0.07 }}>
      <div className="timeline-year">{year}</div>
      <div className="timeline-content" data-active={active || undefined}>
        <div className="timeline-header">
          <Image
            src={logo || site.defaultLogo}
            alt={logoAlt}
            className="timeline-logo"
            fallback={<img src={site.defaultLogo} alt={site.defaultLogoAlt} className="timeline-logo" />}
          />
          <div>
            <div className="timeline-heading">{heading}</div>
            <div className={subtitleClassName}>{subtitle}</div>
          </div>
        </div>
        {detail && <div className="timeline-detail">{detail}</div>}
      </div>
    </m.div>
  );
}
