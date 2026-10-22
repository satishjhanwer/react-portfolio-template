import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { gzipSync } from "node:zlib";

// Writes build-info.json for the colophon: bundle sizes from the real chunk
// graph and library versions. Nothing from git: the source repo is private
// and the site is published from a separate public repo.

export const STACK = [
  "react",
  "framer-motion",
  "lenis",
  "web-vitals",
  "axe-core",
  "vite",
  "typescript",
  "vitest",
  "@playwright/test",
];

export interface ChunkInfo {
  fileName: string;
  code: string;
  isEntry: boolean;
  imports: string[];
}

export interface BuildInfo {
  builtAt: string;
  js: { initialKb: number; initialFiles: number; lazyKb: number; lazyFiles: number } | null;
  stack: { name: string; version: string }[];
}

const kb = (bytes: number) => Math.round(bytes / 1024);

export function measureChunks(chunks: ChunkInfo[]): BuildInfo["js"] {
  const byName = new Map(chunks.map((c) => [c.fileName, c]));
  const initial = new Set<string>();
  const visit = (name: string) => {
    if (initial.has(name) || !byName.has(name)) {
      return;
    }
    initial.add(name);
    byName.get(name)!.imports.forEach(visit);
  };
  chunks.filter((c) => c.isEntry).forEach((c) => visit(c.fileName));

  let initialBytes = 0;
  let lazyBytes = 0;
  for (const c of chunks) {
    const size = gzipSync(c.code).length;
    if (initial.has(c.fileName)) {
      initialBytes += size;
    } else {
      lazyBytes += size;
    }
  }
  return {
    initialKb: kb(initialBytes),
    initialFiles: initial.size,
    lazyKb: kb(lazyBytes),
    lazyFiles: chunks.length - initial.size,
  };
}

function version(root: string, name: string) {
  try {
    return JSON.parse(readFileSync(resolve(root, "node_modules", name, "package.json"), "utf-8")).version as string;
  } catch {
    return "";
  }
}

export function buildInfo(root: string, chunks: ChunkInfo[] | null, now = new Date()): BuildInfo {
  return {
    builtAt: now.toISOString().slice(0, 10),
    js: chunks ? measureChunks(chunks) : null,
    stack: STACK.map((name) => ({ name, version: version(root, name) })).filter((s) => s.version),
  };
}
