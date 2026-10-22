import { lazy, Suspense, useCallback, useEffect, useRef, useState } from "react";
import { LazyMotion, domAnimation, MotionConfig, AnimatePresence } from "framer-motion";
import Lenis from "lenis";
import "./globals.css";
import { easterEgg, recruiterEntry, site } from "./i18n/content";
import { Nav } from "./components/Nav";
import { Hero } from "./components/Hero";
import { Loader } from "./components/Loader";
import { Cursor } from "./components/Cursor";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { DeferredSkills } from "./components/DeferredSkills";
import { Toast, type ToastMessage } from "./components/Toast";
import { isEditableTarget, scrollToSectionWhenReady } from "./utils/dom";
import { useA11yPrefs, prefersReducedMotion } from "./utils/a11yPrefs";
import { useKonami } from "./hooks/useKonami";
import { promptInstall, usePwa } from "./utils/pwa";
import type { AppCommand } from "./components/CommandPalette/commands";

const IconSprite = lazy(() => import("./components/IconSprite").then((m) => ({ default: m.IconSprite })));
const About = lazy(() => import("./components/About").then((m) => ({ default: m.About })));
const Projects = lazy(() => import("./components/Projects").then((m) => ({ default: m.Projects })));
const OpenSource = lazy(() => import("./components/OpenSource").then((m) => ({ default: m.OpenSource })));
const Experience = lazy(() => import("./components/Experience").then((m) => ({ default: m.Experience })));
const Education = lazy(() => import("./components/Education").then((m) => ({ default: m.Education })));
const Awards = lazy(() => import("./components/Awards").then((m) => ({ default: m.Awards })));
const Contact = lazy(() => import("./components/Contact").then((m) => ({ default: m.Contact })));
const Footer = lazy(() => import("./components/Footer").then((m) => ({ default: m.Footer })));

const loadRecruiterMode = () => import("./components/RecruiterMode");
const RecruiterMode = lazy(() => loadRecruiterMode().then((m) => ({ default: m.RecruiterMode })));

const { key: RECRUITER_KEY, value: RECRUITER_VALUE } = recruiterEntry.queryParam;

function hasRecruiterParam() {
  return new URLSearchParams(window.location.search).get(RECRUITER_KEY) === RECRUITER_VALUE;
}

function setRecruiterParam(on: boolean) {
  const url = new URL(window.location.href);
  if (on) {
    url.searchParams.set(RECRUITER_KEY, RECRUITER_VALUE);
  } else {
    url.searchParams.delete(RECRUITER_KEY);
  }
  window.history.replaceState(window.history.state, "", url);
}

const UpdateToast = lazy(() => import("./components/UpdateToast").then((m) => ({ default: m.UpdateToast })));

const loadA11yPrefs = () => import("./components/A11yPrefs");
const A11yPrefs = lazy(() => loadA11yPrefs().then((m) => ({ default: m.A11yPrefs })));

const A11yAudit = lazy(() => import("./components/A11yAudit").then((m) => ({ default: m.A11yAudit })));

const Colophon = lazy(() => import("./components/Colophon").then((m) => ({ default: m.Colophon })));
const Trust = lazy(() => import("./components/Trust").then((m) => ({ default: m.Trust })));
const TRUST_HASHES = ["accessibility", "privacy"] as const;
type TrustSection = (typeof TRUST_HASHES)[number];

function trustFromHash(): TrustSection | null {
  const id = window.location.hash.slice(1);
  return (TRUST_HASHES as readonly string[]).includes(id) ? (id as TrustSection) : null;
}

const QrCode = lazy(() => import("./components/QrCode").then((m) => ({ default: m.QrCode })));
const Shortcuts = lazy(() => import("./components/Shortcuts").then((m) => ({ default: m.Shortcuts })));

const loadPrintResume = () => import("./components/PrintResume");
const PrintResume = lazy(() => loadPrintResume().then((m) => ({ default: m.PrintResume })));

const loadCommandPalette = () => import("./components/CommandPalette");
const CommandPalette = lazy(() => loadCommandPalette().then((m) => ({ default: m.CommandPalette })));

export function App() {
  const [loaderDone, setLoaderDone] = useState(false);
  const [scrambleActive, setScrambleActive] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [recruiterOpen, setRecruiterOpen] = useState(hasRecruiterParam);
  const [auditOpen, setAuditOpen] = useState(false);
  const [prefsOpen, setPrefsOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);
  const [colophonOpen, setColophonOpen] = useState(false);
  const [trust, setTrust] = useState<TrustSection | null>(trustFromHash);
  const [retro, setRetro] = useState(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const prefs = useA11yPrefs();
  const { updateReady } = usePwa();
  const lenisRef = useRef<Lenis | null>(null);
  const toastTimer = useRef<number | undefined>(undefined);

  const handleLoaderNearComplete = useCallback(() => {
    setScrambleActive(true);
  }, []);

  const handleLoaderComplete = useCallback(() => {
    setLoaderDone(true);
  }, []);

  const openPalette = useCallback(() => setPaletteOpen(true), []);
  const closePalette = useCallback(() => setPaletteOpen(false), []);
  const preloadPalette = useCallback(() => {
    void loadCommandPalette();
  }, []);
  const getLenis = useCallback(() => lenisRef.current, []);

  const openRecruiter = useCallback(() => {
    setRecruiterOpen(true);
    setRecruiterParam(true);
  }, []);
  const closeRecruiter = useCallback(() => {
    setRecruiterOpen(false);
    setRecruiterParam(false);
  }, []);
  const preloadRecruiter = useCallback(() => {
    void loadRecruiterMode();
  }, []);

  const openAudit = useCallback(() => setAuditOpen(true), []);
  const closeAudit = useCallback(() => setAuditOpen(false), []);
  const openPrefs = useCallback(() => setPrefsOpen(true), []);
  const togglePrefs = useCallback(() => setPrefsOpen((o) => !o), []);
  const closePrefs = useCallback(() => setPrefsOpen(false), []);
  const openShortcuts = useCallback(() => setShortcutsOpen(true), []);
  const closeShortcuts = useCallback(() => setShortcutsOpen(false), []);
  const openQr = useCallback(() => setQrOpen(true), []);
  const closeQr = useCallback(() => setQrOpen(false), []);
  const openColophon = useCallback(() => setColophonOpen(true), []);
  const closeColophon = useCallback(() => setColophonOpen(false), []);
  const openTrust = useCallback(() => setTrust("accessibility"), []);
  const closeTrust = useCallback(() => setTrust(null), []);
  const openStatementFromPrefs = useCallback(() => {
    setPrefsOpen(false);
    setTrust("accessibility");
  }, []);
  const preloadPrefs = useCallback(() => {
    void loadA11yPrefs();
  }, []);

  const toggleRetro = useCallback(() => {
    const on = !document.documentElement.hasAttribute("data-easter");
    setRetro(on);
    setToast({
      id: Date.now(),
      text: on ? easterEgg.toastOn : easterEgg.toastOff,
    });
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), easterEgg.toastMs);
    if (on && !prefersReducedMotion()) {
      void import("./utils/confetti").then((m) => m.burst());
    }
  }, []);
  useKonami(toggleRetro);

  const handleAppCommand = useCallback(
    (command: AppCommand) => {
      if (command === "open-recruiter") {
        openRecruiter();
      } else if (command === "open-audit") {
        openAudit();
      } else if (command === "open-prefs") {
        openPrefs();
      } else if (command === "open-shortcuts") {
        openShortcuts();
      } else if (command === "open-colophon") {
        openColophon();
      } else if (command === "open-trust") {
        openTrust();
      } else if (command === "open-qr") {
        openQr();
      } else if (command === "install-app") {
        void promptInstall();
      } else if (command === "print-resume") {
        void loadPrintResume().then(() => requestAnimationFrame(() => window.print()));
      } else if (command === "toggle-retro") {
        toggleRetro();
      }
    },
    [openRecruiter, openAudit, openPrefs, openShortcuts, openQr, openTrust, openColophon, toggleRetro],
  );

  useEffect(() => {
    const root = document.documentElement;
    if (retro) {
      root.setAttribute("data-easter", easterEgg.theme);
    } else {
      root.removeAttribute("data-easter");
    }
  }, [retro]);

  useEffect(() => () => window.clearTimeout(toastTimer.current), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((o) => !o);
      } else if (e.key === "/" && !e.metaKey && !e.ctrlKey && !e.altKey && !isEditableTarget(e.target)) {
        e.preventDefault();
        setPaletteOpen(true);
      } else if (e.key === "?" && !e.metaKey && !e.ctrlKey && !e.altKey && !isEditableTarget(e.target)) {
        e.preventDefault();
        setShortcutsOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!loaderDone) {
      return;
    }
    const id = decodeURIComponent(window.location.hash.slice(1));
    if (!id || trustFromHash()) {
      return;
    }
    return scrollToSectionWhenReady(id);
  }, [loaderDone]);

  useEffect(() => {
    if (prefersReducedMotion()) {
      return;
    }
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });
    lenisRef.current = lenis;

    let rafId: number;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [prefs.reduceMotion]);

  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion={prefs.reduceMotion ? "always" : "user"}>
        <ErrorBoundary fallback={<></>}>
          <Suspense>
            <IconSprite />
          </Suspense>
        </ErrorBoundary>
        <Cursor />

        <AnimatePresence>
          {!loaderDone && (
            <Loader key="loader" onNearComplete={handleLoaderNearComplete} onComplete={handleLoaderComplete} />
          )}
        </AnimatePresence>

        <a href="#main-content" className="skip-link">
          {site.skipLinkLabel}
        </a>
        <ErrorBoundary fallback={<></>}>
          <Suspense>
            <AnimatePresence>
              {paletteOpen && (
                <CommandPalette
                  key="command-palette"
                  onClose={closePalette}
                  getLenis={getLenis}
                  onAppCommand={handleAppCommand}
                />
              )}
            </AnimatePresence>
          </Suspense>
        </ErrorBoundary>

        <ErrorBoundary fallback={<></>}>
          <Suspense>
            <AnimatePresence>{auditOpen && <A11yAudit key="a11y-audit" onClose={closeAudit} />}</AnimatePresence>
          </Suspense>
        </ErrorBoundary>

        <ErrorBoundary fallback={<></>}>
          <Suspense>
            <AnimatePresence>{updateReady && <UpdateToast key="update-toast" />}</AnimatePresence>
          </Suspense>
        </ErrorBoundary>

        <ErrorBoundary fallback={<></>}>
          <Suspense>
            <AnimatePresence>
              {prefsOpen && (
                <A11yPrefs key="a11y-prefs" onClose={closePrefs} onOpenStatement={openStatementFromPrefs} />
              )}
            </AnimatePresence>
          </Suspense>
        </ErrorBoundary>

        <ErrorBoundary fallback={<></>}>
          <Suspense>
            <AnimatePresence>
              {shortcutsOpen && <Shortcuts key="shortcuts" onClose={closeShortcuts} getLenis={getLenis} />}
            </AnimatePresence>
          </Suspense>
        </ErrorBoundary>

        <ErrorBoundary fallback={<></>}>
          <Suspense>
            <AnimatePresence>{qrOpen && <QrCode key="qr" onClose={closeQr} getLenis={getLenis} />}</AnimatePresence>
          </Suspense>
        </ErrorBoundary>

        <ErrorBoundary fallback={<></>}>
          <Suspense>
            <AnimatePresence>
              {colophonOpen && <Colophon key="colophon" onClose={closeColophon} getLenis={getLenis} />}
            </AnimatePresence>
          </Suspense>
        </ErrorBoundary>

        <ErrorBoundary fallback={<></>}>
          <Suspense>
            <AnimatePresence>
              {trust && loaderDone && <Trust key="trust" section={trust} onClose={closeTrust} getLenis={getLenis} />}
            </AnimatePresence>
          </Suspense>
        </ErrorBoundary>

        <ErrorBoundary fallback={<></>}>
          <Suspense>
            <AnimatePresence>
              {recruiterOpen && loaderDone && (
                <RecruiterMode key="recruiter-mode" onClose={closeRecruiter} getLenis={getLenis} />
              )}
            </AnimatePresence>
          </Suspense>
        </ErrorBoundary>

        <Toast toast={toast} />

        <Nav
          onOpenPalette={openPalette}
          onPreloadPalette={preloadPalette}
          onOpenRecruiter={openRecruiter}
          prefsOpen={prefsOpen}
          onTogglePrefs={togglePrefs}
          onPreloadPrefs={preloadPrefs}
        />
        <main id="main-content">
          <Hero scrambleActive={scrambleActive} onOpenRecruiter={openRecruiter} onPreloadRecruiter={preloadRecruiter} />
          <ErrorBoundary>
            <Suspense>
              <About />
              <DeferredSkills />
              <Projects onRunAudit={openAudit} />
              <OpenSource />
              <Experience />
              <Education />
              <Awards />
              <Contact onCommand={handleAppCommand} />
            </Suspense>
          </ErrorBoundary>
        </main>
        <ErrorBoundary>
          <Suspense>
            <Footer onCommand={handleAppCommand} />
          </Suspense>
        </ErrorBoundary>
        <ErrorBoundary fallback={<></>}>
          <Suspense>
            <PrintResume />
          </Suspense>
        </ErrorBoundary>
      </MotionConfig>
    </LazyMotion>
  );
}
