export interface Hours {
  start: number;
  end: number;
}

export interface Overlap {
  sameZone: boolean;
  minutes: number;
  start: Date | null;
  end: Date | null;
  mine: [number, number][];
  theirs: [number, number];
  shared: [number, number][];
}

const MINUTE = 60_000;
const DAY_MINUTES = 24 * 60;

const partsCache = new Map<string, Intl.DateTimeFormat>();

function partsFormat(timeZone: string) {
  let f = partsCache.get(timeZone);
  if (!f) {
    f = new Intl.DateTimeFormat("en-US", {
      timeZone,
      hourCycle: "h23",
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
    });
    partsCache.set(timeZone, f);
  }
  return f;
}

function wallClock(timeZone: string, instant: number) {
  const parts = Object.fromEntries(
    partsFormat(timeZone)
      .formatToParts(instant)
      .filter((p) => p.type !== "literal")
      .map((p) => [p.type, Number(p.value)]),
  );
  return { y: parts.year, mo: parts.month - 1, d: parts.day, h: parts.hour, mi: parts.minute, s: parts.second };
}

export function offsetMinutes(timeZone: string, instant: number) {
  const w = wallClock(timeZone, instant);
  const asUtc = Date.UTC(w.y, w.mo, w.d, w.h, w.mi, w.s);
  return Math.round((asUtc - Math.floor(instant / 1000) * 1000) / MINUTE);
}

function localToInstant(timeZone: string, y: number, mo: number, d: number, minutes: number) {
  const guess = Date.UTC(y, mo, d) + minutes * MINUTE;
  const first = guess - offsetMinutes(timeZone, guess) * MINUTE;
  return guess - offsetMinutes(timeZone, first) * MINUTE;
}

function windowOn(timeZone: string, y: number, mo: number, d: number, hours: Hours): [number, number] {
  return [localToInstant(timeZone, y, mo, d, hours.start * 60), localToInstant(timeZone, y, mo, d, hours.end * 60)];
}

function minuteOfDay(timeZone: string, instant: number) {
  const w = wallClock(timeZone, instant);
  return w.h * 60 + w.mi;
}

function toBar(timeZone: string, [from, to]: [number, number]): [number, number][] {
  const start = minuteOfDay(timeZone, from);
  const length = Math.round((to - from) / MINUTE);
  const end = start + length;
  return end <= DAY_MINUTES
    ? [[start, end]]
    : [
        [start, DAY_MINUTES],
        [0, end - DAY_MINUTES],
      ];
}

export function workingOverlap(
  now: Date,
  myZone: string,
  myHours: Hours,
  theirZone: string,
  theirHours: Hours,
): Overlap {
  const me = wallClock(myZone, now.getTime());
  const mine = windowOn(myZone, me.y, me.mo, me.d, myHours);
  const sameZone =
    myZone === theirZone || offsetMinutes(myZone, now.getTime()) === offsetMinutes(theirZone, now.getTime());

  let best: [number, number] | null = null;
  for (const shift of [-1, 0, 1]) {
    const t = wallClock(theirZone, Date.UTC(me.y, me.mo, me.d + shift, 12));
    const theirs = windowOn(theirZone, t.y, t.mo, t.d, theirHours);
    const from = Math.max(mine[0], theirs[0]);
    const to = Math.min(mine[1], theirs[1]);
    if (to > from && (!best || to - from > best[1] - best[0])) {
      best = [from, to];
    }
  }

  return {
    sameZone,
    minutes: best ? Math.round((best[1] - best[0]) / MINUTE) : 0,
    start: best ? new Date(best[0]) : null,
    end: best ? new Date(best[1]) : null,
    mine: toBar(theirZone, mine),
    theirs: [theirHours.start * 60, theirHours.end * 60],
    shared: best ? toBar(theirZone, best) : [],
  };
}

export function visitorTimeZone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}

export function zoneLabel(timeZone: string, locale: string, now = new Date()) {
  const city = timeZone.split("/").pop()!.replace(/_/g, " ");
  try {
    const name = new Intl.DateTimeFormat(locale, { timeZone, timeZoneName: "longGeneric" })
      .formatToParts(now)
      .find((p) => p.type === "timeZoneName")?.value;
    return name && name !== timeZone ? `${city} · ${name}` : city;
  } catch {
    return city;
  }
}
