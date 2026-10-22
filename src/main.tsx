import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import fontsHref from "./fonts.css?url";
import { App } from "./App";
import { initPrefs } from "./utils/a11yPrefs";
import { initPwa } from "./utils/pwa";
import { logConsoleHint } from "./utils/startup";
import { site } from "./i18n/content";
import { locale } from "./i18n/locale";

function preloadFonts() {
  const fontsLink = document.createElement("link");
  fontsLink.rel = "stylesheet";
  fontsLink.href = fontsHref;
  fontsLink.media = "print";
  fontsLink.onload = () => {
    fontsLink.media = "all";
  };
  document.head.appendChild(fontsLink);
}

function renderApp() {
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}

if (locale !== "en") {
  document.title = site.pageTitle;
}

initPrefs();
preloadFonts();
renderApp();
initPwa();
logConsoleHint();
