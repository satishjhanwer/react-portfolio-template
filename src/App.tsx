import { lazy, Suspense } from "react";
import { LazyMotion, domAnimation, MotionConfig } from "framer-motion";
import "./globals.css";
import { Nav } from "./components/Nav";
import { Hero } from "./components/Hero";
import { ErrorBoundary } from "./components/ErrorBoundary";

const About = lazy(() =>
  import("./components/About").then((m) => ({ default: m.About })),
);
const Skills = lazy(() =>
  import("./components/Skills").then((m) => ({ default: m.Skills })),
);
const Projects = lazy(() =>
  import("./components/Projects").then((m) => ({ default: m.Projects })),
);
const OpenSource = lazy(() =>
  import("./components/OpenSource").then((m) => ({ default: m.OpenSource })),
);
const Experience = lazy(() =>
  import("./components/Experience").then((m) => ({ default: m.Experience })),
);
const Education = lazy(() =>
  import("./components/Education").then((m) => ({ default: m.Education })),
);
const Awards = lazy(() =>
  import("./components/Awards").then((m) => ({ default: m.Awards })),
);
const Contact = lazy(() =>
  import("./components/Contact").then((m) => ({ default: m.Contact })),
);
const Footer = lazy(() =>
  import("./components/Footer").then((m) => ({ default: m.Footer })),
);

export function App() {
  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion="user">
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <Nav />
        <main id="main-content">
          <Hero />
          <ErrorBoundary>
            <Suspense>
              <About />
              <Skills />
              <Projects />
              <OpenSource />
              <Experience />
              <Education />
              <Awards />
              <Contact />
            </Suspense>
          </ErrorBoundary>
        </main>
        <ErrorBoundary>
          <Suspense>
            <Footer />
          </Suspense>
        </ErrorBoundary>
      </MotionConfig>
    </LazyMotion>
  );
}
