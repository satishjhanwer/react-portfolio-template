import { lazy, Suspense } from "react";
import { useInViewport } from "../../hooks/useInViewport";

const Skills = lazy(() => import("../Skills").then((m) => ({ default: m.Skills })));

export function DeferredSkills() {
  const { ref, isNearViewport } = useInViewport<HTMLDivElement>("800px 0px");

  if (isNearViewport) {
    return (
      <Suspense>
        <Skills />
      </Suspense>
    );
  }
  return <div id="skills" ref={ref} className="sec" />;
}
