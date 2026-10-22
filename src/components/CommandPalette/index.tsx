import { useEffect, useId, useMemo, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import { createPortal } from "react-dom";
import { m } from "framer-motion";
import type Lenis from "lenis";
import styles from "./CommandPalette.module.css";
import { commandGroupOrder, commandGroups, commandHints, commandPalette, secretMinQuery } from "../../i18n/content";
import type { CommandGroupId } from "../../types";
import { availableCommands } from "./commands";
import type { AppCommand, Command, CommandAction } from "./commands";
import { fuzzyScore } from "./fuzzy";
import { useModal } from "../../hooks/useModal";
import { scrollToSection, trapTab } from "../../utils/dom";
import { switchLocale } from "../../i18n/locale";
import { setThemeChoice } from "../../utils/theme";

interface CommandPaletteProps {
  onClose: () => void;
  getLenis: () => Lenis | null;
  onAppCommand: (command: AppCommand) => void;
}

interface Group {
  id: CommandGroupId;
  items: Command[];
}

const COPY_CLOSE_DELAY = 900;

function isVisible(c: Command, query: string) {
  if (!c.secret) {
    return true;
  }
  const q = query.trim().toLowerCase();
  return q.length >= secretMinQuery && (c.keywords ?? "").split(" ").some((word) => word.startsWith(q));
}

function filterCommands(query: string): Group[] {
  const commands = availableCommands();
  if (!query.trim()) {
    return commandGroupOrder
      .map((id) => ({
        id,
        items: commands.filter((c) => c.group === id && !c.secret),
      }))
      .filter((g) => g.items.length > 0);
  }

  const scored = commands
    .filter((c) => isVisible(c, query))
    .map((c) => ({ c, score: fuzzyScore(query, c.label, c.keywords) }))
    .filter((s) => s.score >= 0)
    .sort((a, b) => b.score - a.score);

  const groups: Group[] = [];
  for (const { c } of scored) {
    let group = groups.find((g) => g.id === c.group);
    if (!group) {
      group = { id: c.group, items: [] };
      groups.push(group);
    }
    group.items.push(c);
  }
  return groups;
}

function followLink(href: string, external?: boolean, download?: boolean) {
  const a = document.createElement("a");
  a.href = href;
  if (external) {
    a.target = "_blank";
    a.rel = "noopener noreferrer";
  }
  if (download) {
    a.download = "";
  }
  a.click();
}

export function CommandPalette({ onClose, getLenis, onAppCommand }: CommandPaletteProps) {
  const baseId = useId();
  const listId = `${baseId}-list`;
  const optionId = (c: Command) => `${baseId}-${c.id}`;

  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState("");

  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const closingRef = useRef(false);
  const { runAfterClose } = useModal(getLenis);

  const groups = useMemo(() => filterCommands(query), [query]);
  const flat = useMemo(() => groups.flatMap((g) => g.items), [groups]);
  const active = flat.length ? Math.min(activeIndex, flat.length - 1) : -1;
  const activeCommand = active >= 0 ? flat[active] : null;
  const activeOptionId = activeCommand ? optionId(activeCommand) : undefined;
  const indexOf = useMemo(() => new Map(flat.map((c, i) => [c.id, i])), [flat]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!activeOptionId) {
      return;
    }
    document.getElementById(activeOptionId)?.scrollIntoView({ block: "nearest" });
  }, [activeOptionId]);

  const close = (after?: () => void) => {
    if (closingRef.current) {
      return;
    }
    closingRef.current = true;
    runAfterClose(after ?? null);
    onClose();
  };

  const run = (c: Command) => {
    const action: CommandAction = c.action;
    switch (action.type) {
      case "scroll":
        close(() => {
          const target =
            document.getElementById(action.target) ??
            (action.fallback ? document.getElementById(action.fallback) : null);
          if (target) {
            scrollToSection(target.id);
          }
        });
        break;
      case "app":
        close(() => onAppCommand(action.command));
        break;
      case "href":
        followLink(action.href, action.external, action.download);
        close();
        break;
      case "copy":
        navigator.clipboard
          .writeText(action.text)
          .then(() => {
            setCopiedId(c.id);
            setAnnouncement(commandPalette.copied);
            setTimeout(() => close(), COPY_CLOSE_DELAY);
          })
          .catch(() => {
            setAnnouncement(commandPalette.copyFailed);
            followLink(action.fallbackHref);
            close();
          });
        break;
      case "locale":
        close(() => switchLocale(action.locale));
        break;
      case "theme":
        setThemeChoice(action.choice);
        close();
        break;
    }
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    switch (e.key) {
      case "Escape":
        e.preventDefault();
        close();
        break;
      case "ArrowDown":
        if (!flat.length) {
          return;
        }
        e.preventDefault();
        setActiveIndex((active + 1) % flat.length);
        break;
      case "ArrowUp":
        if (!flat.length) {
          return;
        }
        e.preventDefault();
        setActiveIndex((active - 1 + flat.length) % flat.length);
        break;
      case "Home":
      case "End":
        if (!flat.length || query) {
          return;
        }
        e.preventDefault();
        setActiveIndex(e.key === "Home" ? 0 : flat.length - 1);
        break;
      case "Enter":
        if (!activeCommand) {
          return;
        }
        e.preventDefault();
        run(activeCommand);
        break;
      case "Tab":
        trapTab(e, panelRef.current);
        break;
    }
  };

  return createPortal(
    <m.div
      className={styles.overlay}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          close();
        }
      }}>
      <m.div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={commandPalette.dialogLabel}
        className={styles.panel}
        initial={{ opacity: 0, scale: 0.98, y: -8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.98, y: -8 }}
        transition={{ duration: 0.18, ease: "easeOut" }}
        onKeyDown={onKeyDown}>
        <div className={styles.inputRow}>
          <svg className={styles.searchIcon} viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <input
            ref={inputRef}
            className={styles.input}
            type="text"
            role="combobox"
            aria-label={commandPalette.inputLabel}
            aria-expanded="true"
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={activeOptionId}
            placeholder={commandPalette.placeholder}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActiveIndex(0);
            }}
          />
          <button type="button" className={styles.esc} onClick={() => close()}>
            esc <span className={styles.srOnly}>{commandPalette.footer.close}</span>
          </button>
        </div>

        <div
          id={listId}
          role="listbox"
          aria-label={commandPalette.dialogLabel}
          className={styles.list}
          data-lenis-prevent>
          {groups.map((g) => (
            <div key={g.id} role="group" aria-labelledby={`${baseId}-group-${g.id}`} className={styles.group}>
              <div id={`${baseId}-group-${g.id}`} className={styles.groupLabel} aria-hidden="true">
                {commandGroups[g.id]}
              </div>
              {g.items.map((c) => {
                const i = indexOf.get(c.id) ?? -1;
                const isActive = i === active;
                const copied = copiedId === c.id;
                return (
                  <div
                    key={c.id}
                    id={optionId(c)}
                    role="option"
                    aria-selected={isActive}
                    className={`${styles.option} ${isActive ? styles.active : ""}`}
                    onMouseMove={() => {
                      if (activeIndex !== i) {
                        setActiveIndex(i);
                      }
                    }}
                    onClick={() => run(c)}>
                    <span className={styles.glyph} aria-hidden="true">
                      {c.icon ? (
                        <svg className={styles.icon}>
                          <use href={`#${c.icon}`} />
                        </svg>
                      ) : (
                        c.glyph
                      )}
                    </span>
                    <span className={styles.label}>{c.label}</span>
                    {(copied || c.hint) && (
                      <span className={`${styles.hint} ${copied ? styles.hintDone : ""}`}>
                        {copied ? commandHints.copied : c.hint}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
          {flat.length === 0 && <p className={styles.empty}>{commandPalette.empty}</p>}
        </div>

        <div className={styles.footer} aria-hidden="true">
          <span>
            <kbd>↑</kbd>
            <kbd>↓</kbd> {commandPalette.footer.navigate}
          </span>
          <span>
            <kbd>↵</kbd> {commandPalette.footer.select}
          </span>
          <span>
            <kbd>esc</kbd> {commandPalette.footer.close}
          </span>
        </div>

        <div className={styles.srOnly} role="status" aria-live="polite">
          {announcement || commandPalette.resultCount(flat.length)}
        </div>
      </m.div>
    </m.div>,
    document.body,
  );
}
