import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { LazyMotion, MotionConfig, domAnimation } from "framer-motion";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as content from "../i18n/content";
import { intersectAll } from "../test/helpers";
import { ErrorBoundary } from "./ErrorBoundary";
import { IconSprite } from "./IconSprite";
import { Image } from "./Image";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { Loader } from "./Loader";
import { PrintResume } from "./PrintResume";
import { SectionHeader } from "./SectionHeader";
import { Toast } from "./Toast";
import { TimelineList } from "./TimelineList";
import { UpdateToast } from "./UpdateToast";
import { About, Awards, Contact, Education, Experience, OpenSource, Projects, Skills } from ".";
import { DeferredSkills } from "./DeferredSkills";

vi.mock("@fontsource/atkinson-hyperlegible/latin-400.css", () => ({}));
vi.mock("@fontsource/atkinson-hyperlegible/latin-700.css", () => ({}));

const pwa = vi.hoisted(() => ({ applyUpdate: vi.fn(), dismissUpdate: vi.fn() }));
vi.mock("../utils/pwa", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../utils/pwa")>()),
  ...pwa,
}));

const locale = vi.hoisted(() => ({ switchLocale: vi.fn() }));
vi.mock("../i18n/locale", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../i18n/locale")>()),
  ...locale,
}));

function withMotion(children: ReactNode, reduced = false) {
  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion={reduced ? "always" : "never"}>{children}</MotionConfig>
    </LazyMotion>
  );
}

describe("sections", () => {
  it.each([
    ["about", About],
    ["projects", Projects],
    ["oss", OpenSource],
    ["experience", Experience],
    ["education", Education],
    ["awards", Awards],
    ["contact", Contact],
    ["skills", Skills],
  ])("#%s renders its numbered header and animates in", (id, Section) => {
    render(withMotion(<Section />));
    const section = document.getElementById(id)!;
    expect(section.tagName).toBe("SECTION");
    const index = content.navLinks.findIndex((l) => l.id === id);
    expect(section.querySelector(".sec-num")?.textContent).toBe(String(index + 1).padStart(2, "0"));
    intersectAll();
    expect(section.textContent!.length).toBeGreaterThan(20);
  });

  it("About shows every stat and impact metric", () => {
    render(withMotion(<About />));
    for (const s of content.stats) {
      expect(screen.getByText(s.label)).toBeTruthy();
    }
    for (const metric of content.impact) {
      expect(screen.getByText(metric.label)).toBeTruthy();
    }
  });

  it("About counts the impact numbers up when in view", async () => {
    render(withMotion(<About />));
    intersectAll();
    const first = content.impact[0];
    await waitFor(() => expect(screen.getAllByText(String(first.value)).length).toBeGreaterThan(0));
  });

  it("About doesn't animate the numbers under reduced motion", () => {
    render(withMotion(<About />, true));
    intersectAll();
    expect(screen.getAllByText(String(content.impact[0].value)).length).toBeGreaterThan(0);
  });

  it("Projects links each card", () => {
    render(withMotion(<Projects />));
    for (const p of content.projects) {
      expect(document.getElementById(p.anchorId)).toBeTruthy();
    }
    for (const link of screen.queryAllByRole("link", { name: content.viewProjectLabel })) {
      expect(link.getAttribute("rel")).toBe("noopener noreferrer");
    }
  });

  it("project cards tilt with the mouse and reset on leave", () => {
    render(withMotion(<Projects />));
    const card = document.getElementById(content.projects[0].anchorId)!;
    vi.spyOn(card, "getBoundingClientRect").mockReturnValue({ left: 0, top: 0, width: 100, height: 100 } as DOMRect);
    fireEvent.mouseMove(card, { clientX: 100, clientY: 0 });
    expect(card.style.transform).toContain("rotateY(4.5deg)");
    fireEvent.mouseLeave(card);
    expect(card.style.transform).toContain("rotateX(0deg)");
  });

  it("Skills lists every icon and text skill", () => {
    render(withMotion(<Skills />));
    for (const cat of content.skillCategories) {
      expect(screen.getByText(cat.label)).toBeTruthy();
      for (const t of cat.textSkills ?? []) {
        expect(screen.getAllByText(t).length).toBeGreaterThan(0);
      }
    }
  });

  it("DeferredSkills holds a placeholder until it's near the viewport", async () => {
    render(withMotion(<DeferredSkills />));
    expect(document.getElementById("skills")?.children).toHaveLength(0);
    intersectAll(false);
    expect(document.getElementById("skills")?.children).toHaveLength(0);
    intersectAll();
    await screen.findByText(content.skillCategories[0].label);
  });

  it("OpenSource links every repo", () => {
    render(withMotion(<OpenSource />));
    for (const r of content.repos) {
      expect(screen.getByRole("link", { name: new RegExp(r.name) }).getAttribute("href")).toBe(r.url);
    }
  });

  it("Contact links the email address", () => {
    render(withMotion(<Contact />));
    expect(screen.getByRole("link", { name: new RegExp(content.email) }).getAttribute("href")).toBe(
      `mailto:${content.email}`,
    );
  });

  it("Contact greets the visitor and links the email", () => {
    render(withMotion(<Contact />));
    expect(screen.getByRole("link", { name: new RegExp(content.email) }).getAttribute("href")).toBe(
      `mailto:${content.email}`,
    );
  });

  it("Experience offers the resume download", () => {
    render(withMotion(<Experience />));
    expect(screen.getByRole("link", { name: content.hero.ctaGhost.label }).hasAttribute("download")).toBe(true);
  });
});

describe("TimelineList", () => {
  const items = ["a", "b", "c"];
  const renderList = (reduced = false) =>
    render(
      withMotion(
        <TimelineList
          items={items}
          inView
          accent="cyan"
          getKey={(x) => x}
          getEntryProps={(x) => ({ year: "2020", logoAlt: x, heading: x, subtitle: x, detail: x === "a" ? "d" : "" })}
        />,
        reduced,
      ),
    );

  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["requestAnimationFrame", "cancelAnimationFrame"] });
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("marks entries above the reading line as reached", () => {
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function (this: HTMLElement) {
      const i = [...(this.parentElement?.querySelectorAll(":scope > .timeline-entry") ?? [])].indexOf(this);
      return { top: i * 300 } as DOMRect;
    });
    renderList();
    act(() => {
      vi.advanceTimersToNextFrame();
    });
    const entries = document.querySelectorAll(".timeline-entry");
    expect([...entries].map((e) => e.hasAttribute("data-reached"))).toEqual([true, true, false]);
  });

  it("marks everything reached under reduced motion", () => {
    renderList(true);
    const entries = document.querySelectorAll(".timeline-entry");
    expect([...entries].every((e) => e.hasAttribute("data-reached"))).toBe(true);
  });

  it("shows a detail only when there is one", () => {
    renderList();
    expect(document.querySelectorAll(".timeline-detail")).toHaveLength(1);
  });
});

describe("Image", () => {
  it("shows a skeleton until the image loads", () => {
    const { container } = render(<Image src="/a.png" alt="A" />);
    expect(container.querySelector('[class*="skeleton"]')).toBeTruthy();
    fireEvent.load(screen.getByAltText("A"));
    expect(container.querySelector('[class*="skeleton"]')).toBeNull();
  });

  it("swaps in the fallback on error", () => {
    render(<Image src="/broken.png" alt="A" fallback={<span>fallback</span>} />);
    fireEvent.error(screen.getByAltText("A"));
    expect(screen.getByText("fallback")).toBeTruthy();
  });

  it("hides a broken image without a fallback", () => {
    render(<Image src="/broken.png" alt="A" />);
    fireEvent.error(screen.getByAltText("A"));
    expect(screen.getByAltText("A").style.display).toBe("none");
  });
});

describe("SectionHeader", () => {
  it("uses the title and position from the nav", () => {
    const link = content.navLinks[2];
    const { container } = render(<SectionHeader id={link.id} />);
    expect(container.querySelector(".sec-num")?.textContent).toBe("03");
    expect(screen.getByRole("heading").textContent).toBe(link.title ?? link.label);
  });

  it("falls back to the id for unknown sections", () => {
    render(<SectionHeader id="mystery" />);
    expect(screen.getByRole("heading").textContent).toBe("mystery");
  });
});

describe("ErrorBoundary", () => {
  function Boom(): never {
    throw new Error("boom");
  }

  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("shows the section error message", () => {
    render(
      <ErrorBoundary>
        <Boom />
      </ErrorBoundary>,
    );
    expect(screen.getByText(content.site.sectionErrorMessage)).toBeTruthy();
  });

  it("shows a custom fallback", () => {
    render(
      <ErrorBoundary fallback={<span>custom</span>}>
        <Boom />
      </ErrorBoundary>,
    );
    expect(screen.getByText("custom")).toBeTruthy();
  });

  it("renders children when nothing throws", () => {
    render(<ErrorBoundary>ok</ErrorBoundary>);
    expect(screen.getByText("ok")).toBeTruthy();
  });
});

describe("small components", () => {
  it("IconSprite injects the sprite hidden", () => {
    const { container } = render(<IconSprite />);
    expect((container.firstChild as HTMLElement).style.display).toBe("none");
    expect(container.querySelectorAll("symbol").length).toBeGreaterThan(10);
  });

  it("Toast announces its message politely", () => {
    const { rerender } = render(withMotion(<Toast toast={null} />));
    expect(screen.getByRole("status").textContent).toBe("");
    rerender(withMotion(<Toast toast={{ id: 1, text: "Hello" }} />));
    expect(screen.getByRole("status").textContent).toBe("Hello");
  });

  it("UpdateToast refreshes or dismisses", () => {
    render(withMotion(<UpdateToast />));
    fireEvent.click(screen.getByRole("button", { name: content.pwaCopy.refresh }));
    fireEvent.click(screen.getByRole("button", { name: content.pwaCopy.dismiss }));
    expect(pwa.applyUpdate).toHaveBeenCalledOnce();
    expect(pwa.dismissUpdate).toHaveBeenCalledOnce();
  });

  it("LanguageSwitcher lists every language and switches", () => {
    render(<LanguageSwitcher />);
    const select = screen.getByRole("combobox", { name: content.languageCopy.label });
    expect(screen.getAllByRole("option")).toHaveLength(4);
    fireEvent.change(select, { target: { value: "ja" } });
    expect(locale.switchLocale).toHaveBeenCalledWith("ja");
  });

  it("PrintResume renders the whole résumé from the data", () => {
    render(<PrintResume />);
    const root = document.querySelector("[data-print-resume]")!;
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe(content.site.name);
    expect(root.textContent).toContain(content.email);
    expect(root.textContent).toContain("github.com/your-username");
    for (const job of content.experienceNodes) {
      expect(root.textContent).toContain(job.role);
    }
    for (const a of content.awards) {
      expect(root.textContent).toContain(a.title);
    }
    expect(root.textContent).toContain(content.profile.headline);
  });
});

describe("Loader", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("counts to 100, then calls back near and at completion", () => {
    const onNearComplete = vi.fn();
    const onComplete = vi.fn();
    render(withMotion(<Loader onNearComplete={onNearComplete} onComplete={onComplete} />));
    expect(screen.getByText("000")).toBeTruthy();
    act(() => {
      vi.advanceTimersByTime(1600);
    });
    expect(screen.getByText("100")).toBeTruthy();
    expect(onNearComplete).not.toHaveBeenCalled();
    act(() => {
      vi.advanceTimersByTime(470);
    });
    expect(onNearComplete).toHaveBeenCalledOnce();
    expect(onComplete).not.toHaveBeenCalled();
    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(onComplete).toHaveBeenCalledOnce();
    expect(document.body.textContent).toContain(content.loader.enterText.charAt(0));
  });

  it("stops its frame loop when unmounted early", () => {
    const cancel = vi.spyOn(window, "cancelAnimationFrame");
    const { unmount } = render(withMotion(<Loader onNearComplete={vi.fn()} onComplete={vi.fn()} />));
    unmount();
    expect(cancel).toHaveBeenCalled();
  });
});
