import { createElement, Fragment } from "react";
import type { ReactNode } from "react";

const ALLOWED_TAGS: Record<string, string> = {
  b: "b",
  em: "em",
  strong: "strong",
  i: "i",
  br: "br",
};

const TOKEN_RE = /<(\/?)(\w+)\s*(\/?)\s*>|(&(\w+);)/g;

const ENTITY_MAP: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: "\u00A0",
};

function parseRichText(html: string): ReactNode {
  const nodes: ReactNode[] = [];
  const stack: { tag: string; children: ReactNode[] }[] = [];
  let cursor = 0;
  let keyCounter = 0;

  const pushText = (text: string) => {
    if (!text) return;
    const target = stack.length > 0 ? stack[stack.length - 1].children : nodes;
    target.push(text);
  };

  const pushNode = (node: ReactNode) => {
    const target = stack.length > 0 ? stack[stack.length - 1].children : nodes;
    target.push(node);
  };

  let match: RegExpExecArray | null;
  while ((match = TOKEN_RE.exec(html)) !== null) {
    if (match.index > cursor) {
      pushText(html.slice(cursor, match.index));
    }
    cursor = match.index + match[0].length;

    if (match[4]) {
      const entityName = match[5];
      pushText(ENTITY_MAP[entityName] ?? match[4]);
      continue;
    }

    const isClosing = match[1] === "/";
    const tagName = match[2].toLowerCase();
    const isSelfClosing = match[3] === "/";

    if (!ALLOWED_TAGS[tagName]) {
      pushText(match[0]);
      continue;
    }

    if (isSelfClosing || tagName === "br") {
      pushNode(createElement(ALLOWED_TAGS[tagName], { key: keyCounter++ }));
    } else if (isClosing) {
      if (stack.length > 0 && stack[stack.length - 1].tag === tagName) {
        const frame = stack.pop()!;
        const element = createElement(
          ALLOWED_TAGS[frame.tag],
          { key: keyCounter++ },
          ...frame.children,
        );
        pushNode(element);
      } else {
        pushText(match[0]);
      }
    } else {
      stack.push({ tag: tagName, children: [] });
    }
  }

  if (cursor < html.length) {
    pushText(html.slice(cursor));
  }

  while (stack.length > 0) {
    const frame = stack.pop()!;
    pushText(`<${frame.tag}>`);
    for (const child of frame.children) {
      pushNode(child);
    }
  }

  if (nodes.length === 0) return null;
  if (nodes.length === 1) return nodes[0];
  return createElement(Fragment, null, ...nodes);
}

export function RichText({ html }: { html: string }) {
  return <>{parseRichText(html)}</>;
}
