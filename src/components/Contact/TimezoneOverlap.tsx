import { useId, useMemo, useState } from "react";
import styles from "./Contact.module.css";
import { overlapCopy, overlapZones, site, visitorHours, workingHours } from "../../i18n/content";
import { locale } from "../../i18n/locale";
import { visitorTimeZone, workingOverlap, zoneLabel } from "../../utils/timezone";

const clockLocale = locale === "en" ? "en-US" : locale;
const DAY = 24 * 60;
const TICKS = [0, 6, 12, 18, 24];

const hourLabel = (hour: number) =>
  new Intl.DateTimeFormat(clockLocale, { hour: "numeric", minute: "2-digit", timeZone: "UTC" }).format(
    Date.UTC(2000, 0, 1, hour),
  );

function Segment({ range, className }: { range: [number, number]; className: string }) {
  return (
    <span
      className={className}
      style={{ left: `${(range[0] / DAY) * 100}%`, width: `${((range[1] - range[0]) / DAY) * 100}%` }}
    />
  );
}

export function TimezoneOverlap() {
  const id = useId();
  const [detected] = useState(visitorTimeZone);
  const [zone, setZone] = useState(detected);
  const [now] = useState(() => new Date());

  const overlap = useMemo(() => workingOverlap(now, site.timeZone, workingHours, zone, visitorHours), [now, zone]);
  const zones = overlapZones.includes(detected) ? overlapZones : [detected, ...overlapZones];

  const time = new Intl.DateTimeFormat(clockLocale, { hour: "numeric", minute: "2-digit", timeZone: zone });
  const hours = new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(overlap.minutes / 60);
  const sentence = overlap.sameZone
    ? overlapCopy.same
    : overlap.start && overlap.end
      ? overlapCopy.overlap(`${time.format(overlap.start)}–${time.format(overlap.end)}`, hours)
      : overlapCopy.none;

  return (
    <section className={styles.overlap} aria-labelledby={`${id}-title`}>
      <h3 id={`${id}-title`} className={styles.overlapTitle}>
        {overlapCopy.title}
      </h3>
      <p className={styles.overlapText} aria-live="polite">
        {sentence}
      </p>

      <div className={styles.bar} aria-hidden="true">
        {overlap.mine.map((r, i) => (
          <Segment key={`m${i}`} range={r} className={styles.barMine} />
        ))}
        <Segment range={overlap.theirs} className={styles.barTheirs} />
        {overlap.shared.map((r, i) => (
          <Segment key={`s${i}`} range={r} className={styles.barShared} />
        ))}
      </div>
      <div className={styles.ticks} aria-hidden="true">
        {TICKS.map((t) => (
          <span key={t}>{String(t).padStart(2, "0")}</span>
        ))}
      </div>
      <ul className={styles.legend} aria-hidden="true">
        <li>
          <span className={styles.keyMine} />
          {overlapCopy.legend.mine}
        </li>
        <li>
          <span className={styles.keyTheirs} />
          {overlapCopy.legend.theirs}
        </li>
        <li>
          <span className={styles.keyShared} />
          {overlapCopy.legend.shared}
        </li>
      </ul>

      <div className={styles.zoneRow}>
        <label htmlFor={`${id}-zone`} className={styles.zoneLabel}>
          {overlapCopy.zoneLabel}
        </label>
        <select id={`${id}-zone`} className={styles.zoneSelect} value={zone} onChange={(e) => setZone(e.target.value)}>
          {zones.map((z) => (
            <option key={z} value={z}>
              {zoneLabel(z, locale, now)}
            </option>
          ))}
        </select>
      </div>
      <p className={styles.overlapNote}>
        {overlapCopy.myHours(`${hourLabel(workingHours.start)}–${hourLabel(workingHours.end)}`)}
      </p>
    </section>
  );
}
