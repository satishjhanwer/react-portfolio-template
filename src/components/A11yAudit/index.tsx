import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { m } from "framer-motion";
import type { NodeResult, Result } from "axe-core";
import styles from "./A11yAudit.module.css";
import { a11yAudit, ruleExplanations } from "../../i18n/content";
import type { AxeImpact } from "../../types";
import { prefersReducedMotion } from "../../utils/a11yPrefs";
import { locale } from "../../i18n/locale";

type AxeRuleStrings = Record<string, { help?: string; description?: string }>;

const axeLocales: Record<string, () => Promise<{ default: { rules: AxeRuleStrings } }>> = {
  es: () => import("axe-core/locales/es.json"),
  fr: () => import("axe-core/locales/fr.json"),
  ja: () => import("axe-core/locales/ja.json"),
};
let axeRuleStrings: AxeRuleStrings | null = null;

interface A11yAuditProps {
  onClose: () => void;
}

interface AuditSummary {
  violations: Result[];
  passes: number;
  incomplete: number;
}

type Status = "running" | "done" | "error";

const TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];
const PANEL_ATTR = "data-a11y-audit-panel";
const HIGHLIGHT_ATTR = "data-a11y-highlight";
const MAX_NODES = 5;
const DEMO_SLOT_ATTR = "data-a11y-demo-slot";

const RING_R = 38;
const RING_C = 2 * Math.PI * RING_R;

let queue: Promise<unknown> = Promise.resolve();

function runAxe(): Promise<AuditSummary> {
  const next = queue.then(async () => {
    const axe = (await import("axe-core")).default;
    if (!axeRuleStrings && axeLocales[locale]) {
      axeRuleStrings = (await axeLocales[locale]()).default.rules;
    }
    const res = await axe.run(
      { exclude: [[`[${PANEL_ATTR}]`]] },
      {
        runOnly: { type: "tag", values: TAGS },
        resultTypes: ["violations"],
      },
    );
    return {
      violations: res.violations,
      passes: res.passes.length,
      incomplete: res.incomplete.length,
    };
  });
  queue = next.catch(() => undefined);
  return next;
}

function clearHighlights() {
  document.querySelectorAll(`[${HIGHLIGHT_ATTR}]`).forEach((el) => el.removeAttribute(HIGHLIGHT_ATTR));
}

function nodeSelector(node: NodeResult) {
  const first = node.target[0];
  return typeof first === "string" ? first : null;
}

function shortHtml(html: string) {
  return html.length > 90 ? `${html.slice(0, 87)}…` : html;
}

function explain(v: Result) {
  const known = ruleExplanations[v.id];
  const translated = axeRuleStrings?.[v.id];
  return {
    title: known?.title ?? translated?.help ?? v.help,
    why: known?.why ?? translated?.description ?? v.description,
    fix:
      known?.fix ??
      (translated
        ? a11yAudit.fixFallback
        : (v.nodes[0]?.failureSummary?.split("\n").slice(1).join(" ").trim() ?? v.help)),
  };
}

function scoreClass(pct: number) {
  if (pct === 100) {
    return styles.good;
  }
  if (pct >= 90) {
    return styles.warn;
  }
  return styles.poor;
}

function DemoCard() {
  const [slot] = useState(() => document.querySelector<HTMLElement>(`[${DEMO_SLOT_ATTR}]`));
  return createPortal(
    <div className={`${styles.demoCard} ${slot ? styles.demoInFlow : ""}`}>
      <span className={styles.demoTitle}>{a11yAudit.demoCardTitle}</span>
      <p className={styles.demoFaint}>{a11yAudit.demoCardText}</p>
      <div className={styles.demoRow}>
        <img src="/favicon.svg" width={28} height={28} />
        <button type="button" className={styles.demoButton}>
          <svg viewBox="0 0 24 24" width={16} height={16}>
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </button>
        <input type="text" className={styles.demoInput} />
      </div>
    </div>,
    slot ?? document.body,
  );
}

export function A11yAudit({ onClose }: A11yAuditProps) {
  const titleId = useId();
  const [returnFocus] = useState(() => document.activeElement as HTMLElement | null);
  const [status, setStatus] = useState<Status>("running");
  const [summary, setSummary] = useState<AuditSummary | null>(null);
  const [runId, setRunId] = useState(0);
  const [demo, setDemo] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const pillRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    let cancelled = false;
    runAxe()
      .then((result) => {
        if (cancelled) {
          return;
        }
        setSummary(result);
        setStatus("done");
      })
      .catch(() => {
        if (!cancelled) {
          setStatus("error");
        }
      });
    return () => {
      cancelled = true;
    };
  }, [runId, demo]);

  useEffect(() => {
    titleRef.current?.focus();
    return () => {
      clearHighlights();
      returnFocus?.focus({ preventScroll: true });
    };
  }, [returnFocus]);

  useEffect(() => {
    if (minimized) {
      pillRef.current?.focus();
    } else {
      titleRef.current?.focus({ preventScroll: true });
    }
  }, [minimized]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") {
        return;
      }
      if (minimized) {
        setMinimized(false);
      } else {
        onClose();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [minimized, onClose]);

  const rerun = () => {
    setStatus("running");
    setRunId((n) => n + 1);
  };

  const toggleDemo = () => {
    clearHighlights();
    setStatus("running");
    setDemo((d) => !d);
  };

  const highlight = (node: NodeResult) => {
    const selector = nodeSelector(node);
    const el = selector ? document.querySelector(selector) : null;
    if (!el) {
      return;
    }
    clearHighlights();
    el.setAttribute(HIGHLIGHT_ATTR, "");
    el.scrollIntoView({
      behavior: prefersReducedMotion() ? "auto" : "smooth",
      block: "center",
    });
    setMinimized(true);
  };

  const total = summary ? summary.passes + summary.violations.length : 0;
  const pct = summary && total ? Math.round((summary.passes / total) * 100) : 0;
  const byImpact = a11yAudit.impactOrder
    .map((impact) => ({
      impact,
      rules: (summary?.violations ?? []).filter((v) => (v.impact ?? "minor") === impact),
    }))
    .filter((g) => g.rules.length > 0);

  return (
    <>
      {demo && <DemoCard />}
      {createPortal(
        minimized ? (
          <button
            ref={pillRef}
            type="button"
            className={styles.pill}
            onClick={() => setMinimized(false)}
            {...{ [PANEL_ATTR]: "" }}>
            <span aria-hidden="true">◂</span> {a11yAudit.backToResults}
            <span className={styles.srOnly}>, {a11yAudit.highlighted}</span>
          </button>
        ) : (
          <m.aside
            role="dialog"
            aria-modal="false"
            aria-labelledby={titleId}
            className={styles.panel}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.28, ease: "easeOut" }}
            data-lenis-prevent
            {...{ [PANEL_ATTR]: "" }}>
            <header className={styles.header}>
              <h2 id={titleId} ref={titleRef} tabIndex={-1} className={styles.title}>
                {a11yAudit.title}
              </h2>
              <button type="button" className={styles.close} aria-label={a11yAudit.close} onClick={onClose}>
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M6 6l12 12M18 6 6 18" />
                </svg>
              </button>
            </header>

            <p className={styles.intro}>{a11yAudit.intro}</p>
            <p className={styles.scope}>{a11yAudit.scope}</p>

            <div role="status" aria-live="polite" className={styles.status}>
              {status === "running" && (
                <span className={styles.running}>
                  <span className={styles.spinner} aria-hidden="true" />
                  {a11yAudit.running}
                </span>
              )}
              {status === "error" && <span className={styles.errorText}>{a11yAudit.loadError}</span>}
              {status === "done" && summary && (
                <span className={styles.srOnly}>
                  {a11yAudit.scoreAria(pct)}. {a11yAudit.scoreLabel(summary.passes, total)}.
                </span>
              )}
            </div>

            {summary && (
              <div className={`${styles.results} ${status === "running" ? styles.stale : ""}`}>
                <div className={styles.scoreRow}>
                  <svg className={`${styles.ring} ${scoreClass(pct)}`} viewBox="0 0 88 88" aria-hidden="true">
                    <circle className={styles.ringTrack} cx="44" cy="44" r={RING_R} />
                    <circle
                      className={styles.ringValue}
                      cx="44"
                      cy="44"
                      r={RING_R}
                      strokeDasharray={RING_C}
                      strokeDashoffset={RING_C * (1 - pct / 100)}
                    />
                    <text x="44" y="50" textAnchor="middle" className={styles.ringText}>
                      {pct}
                    </text>
                  </svg>
                  <div>
                    <p className={styles.scoreLabel}>{a11yAudit.scoreLabel(summary.passes, total)}</p>
                    {summary.incomplete > 0 && (
                      <p className={styles.manual}>{a11yAudit.manualReview(summary.incomplete)}</p>
                    )}
                  </div>
                </div>

                {summary.violations.length === 0 ? (
                  <div className={styles.clean}>
                    <p className={styles.cleanTitle}>{a11yAudit.cleanTitle}</p>
                    <p className={styles.cleanBody}>{a11yAudit.cleanBody}</p>
                  </div>
                ) : (
                  byImpact.map((group) => (
                    <section key={group.impact} className={styles.group}>
                      <h3 className={`${styles.groupTitle} ${styles[group.impact as AxeImpact]}`}>
                        {a11yAudit.impactTitles[group.impact]} · {group.rules.length}
                      </h3>
                      <ul className={styles.rules}>
                        {group.rules.map((v) => {
                          const copy = explain(v);
                          return (
                            <li key={v.id} className={styles.rule}>
                              <h4 className={styles.ruleTitle}>{copy.title}</h4>
                              <p className={styles.ruleMeta}>
                                <code>{v.id}</code> · {a11yAudit.affected(v.nodes.length)}
                              </p>
                              <p className={styles.ruleText}>
                                <b>{a11yAudit.whyLabel}:</b> {copy.why}
                              </p>
                              <p className={styles.ruleText}>
                                <b>{a11yAudit.fixLabel}:</b> {copy.fix}
                              </p>
                              <ul className={styles.nodes}>
                                {v.nodes.slice(0, MAX_NODES).map((n, i) => (
                                  <li key={i} className={styles.node}>
                                    <code className={styles.nodeHtml}>{shortHtml(n.html)}</code>
                                    {nodeSelector(n) && (
                                      <button type="button" className={styles.nodeBtn} onClick={() => highlight(n)}>
                                        {a11yAudit.highlight}
                                      </button>
                                    )}
                                  </li>
                                ))}
                              </ul>
                              <a href={v.helpUrl} target="_blank" rel="noopener noreferrer" className={styles.learn}>
                                {a11yAudit.learnMore}
                                <span aria-hidden="true"> ↗</span>
                              </a>
                            </li>
                          );
                        })}
                      </ul>
                    </section>
                  ))
                )}
              </div>
            )}

            <footer className={styles.footer}>
              <button type="button" className={styles.secondary} onClick={rerun} disabled={status === "running"}>
                {a11yAudit.rerun}
              </button>
              <button
                type="button"
                className={demo ? styles.secondary : styles.primary}
                onClick={toggleDemo}
                disabled={status === "running"}
                aria-pressed={demo}>
                {demo ? a11yAudit.demoOff : a11yAudit.demoOn}
              </button>
              <p className={styles.demoHint}>{a11yAudit.demoHint}</p>
            </footer>
          </m.aside>
        ),
        document.body,
      )}
    </>
  );
}
