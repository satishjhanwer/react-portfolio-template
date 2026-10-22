import {
  greetingFallback,
  greetingJoin,
  greetingMyTime,
  greetingReplies,
  greetingReplyFallback,
  greetingSalutations,
  greetingSameZone,
  greetingWithReply,
  site,
} from "../../i18n/content";
import { locale } from "../../i18n/locale";

const clockLocale = locale === "en" ? "en-US" : locale;

function hourIn(date: Date, timeZone?: string) {
  const hour = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    hourCycle: "h23",
    timeZone,
  }).format(date);
  return Number(hour);
}

function pick(ranges: { from: number; to: number; text: string }[], hour: number, fallback: string) {
  return ranges.find((r) => hour >= r.from && hour < r.to)?.text ?? fallback;
}

export function buildGreeting(now = new Date()) {
  const salutation = pick(greetingSalutations, hourIn(now), greetingFallback);

  const clock = (timeZone?: string) =>
    new Intl.DateTimeFormat(clockLocale, {
      hour: "numeric",
      minute: "2-digit",
      timeZone,
    }).format(now);
  const myTime = clock(site.timeZone);

  if (clock() === myTime) {
    return greetingJoin(salutation, greetingSameZone);
  }

  const reply = pick(greetingReplies, hourIn(now, site.timeZone), greetingReplyFallback);
  return greetingJoin(salutation, greetingWithReply(greetingMyTime(myTime), reply));
}
