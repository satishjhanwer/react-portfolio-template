import { render, screen } from "@testing-library/react";
import { LazyMotion, domAnimation } from "framer-motion";
import { describe, expect, it } from "vitest";
import { SkillCard } from "./SkillCard";
import type { SkillCardProps } from "./SkillCard";

const renderCard = (props: Partial<SkillCardProps>) =>
  render(
    <LazyMotion features={domAnimation} strict>
      <SkillCard
        variant="P"
        catLabel="Frontend"
        icons={[{ icon: "react-original", label: "React" }]}
        delay={0}
        inView
        {...props}
      />
    </LazyMotion>,
  );

describe("SkillCard", () => {
  it.each(["P", "C", "G"] as const)("renders variant %s with its icons and text skills", (variant) => {
    const { container } = renderCard({ variant, textSkills: ["GraphQL", "WCAG"] });
    expect(screen.getByText("Frontend")).toBeTruthy();
    expect(container.querySelector("use")?.getAttribute("href")).toBe("#react-original");
    expect(screen.getByText("GraphQL").className).toMatch(new RegExp(`textTag${variant}`));
    expect(container.firstElementChild?.className).toMatch(new RegExp(`card${variant}`));
  });

  it("omits the text-skill row when there are none", () => {
    renderCard({ textSkills: [] });
    expect(document.querySelector('[class*="textTags"]')).toBeNull();
  });

  it("waits to animate until in view", () => {
    renderCard({ inView: false });
    expect(screen.getByText("React")).toBeTruthy();
  });
});
