import { easterEgg } from "../i18n/content";

export function logConsoleHint() {
  const style = getComputedStyle(document.documentElement);
  const primary = style.getPropertyValue("--purple").trim();
  const secondary = style.getPropertyValue("--cyan").trim();
  console.info(
    `%c${easterEgg.consoleTitle}%c\n${easterEgg.consoleHint}`,
    `color: ${primary}; font-size: 14px; font-weight: 700;`,
    `color: ${secondary}; font-size: 12px;`,
  );
}
