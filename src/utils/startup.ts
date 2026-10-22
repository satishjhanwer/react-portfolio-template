import { analytics, easterEgg } from "../i18n/content";

const BEACON = "https://static.cloudflareinsights.com/beacon.min.js";

function optedOut() {
  const nav = navigator as Navigator & { globalPrivacyControl?: boolean };
  return nav.globalPrivacyControl === true || nav.doNotTrack === "1";
}

export function startAnalytics() {
  const { cloudflareToken, hosts } = analytics;
  if (!cloudflareToken || !hosts.includes(location.hostname) || optedOut()) {
    return;
  }

  const inject = () => {
    const script = document.createElement("script");
    script.defer = true;
    script.src = BEACON;
    script.dataset.cfBeacon = JSON.stringify({
      token: cloudflareToken,
      spa: false,
    });
    document.head.appendChild(script);
  };

  const whenIdle = () =>
    "requestIdleCallback" in window ? window.requestIdleCallback(inject, { timeout: 5000 }) : setTimeout(inject, 1);

  if (document.readyState === "complete") {
    whenIdle();
  } else {
    window.addEventListener("load", whenIdle, { once: true });
  }
}

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
