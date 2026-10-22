import { gzipSync } from "node:zlib";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { buildInfo, measureChunks, STACK } from "./build-info.ts";

const chunk = (fileName: string, size: number, imports: string[] = [], isEntry = false) => ({
  fileName,
  code: "x".repeat(size),
  imports,
  isEntry,
});

describe("measureChunks", () => {
  it("counts the entry and its static imports as initial, the rest as lazy", () => {
    const chunks = [
      chunk("index.js", 5000, ["vendor.js", "shared.js"], true),
      chunk("vendor.js", 9000, ["shared.js"]),
      chunk("shared.js", 3000),
      chunk("About.js", 4000, ["shared.js"]),
      chunk("axe.js", 20000),
    ];
    const js = measureChunks(chunks)!;
    expect(js.initialFiles).toBe(3);
    expect(js.lazyFiles).toBe(2);
    const gz = (n: number) => gzipSync("x".repeat(n)).length;
    expect(js.initialKb).toBe(Math.round((gz(5000) + gz(9000) + gz(3000)) / 1024));
  });

  it("ignores imports of unknown files", () => {
    expect(measureChunks([chunk("index.js", 10, ["missing.js"], true)])!.initialFiles).toBe(1);
  });
});

describe("buildInfo", () => {
  const root = resolve(import.meta.dirname, "..");

  it("has the build date and library versions, and nothing from git", () => {
    const info = buildInfo(root, null, new Date("2026-10-22T10:00:00Z"));
    expect(info.builtAt).toBe("2026-10-22");
    expect(info.js).toBeNull();
    expect(info.stack.map((s) => s.name)).toEqual(STACK);
    expect(Object.keys(info).sort()).toEqual(["builtAt", "js", "stack"]);
  });

  it("measures chunks and skips libraries it can't find", () => {
    const empty = mkdtempSync(join(tmpdir(), "no-modules-"));
    const info = buildInfo(empty, [chunk("index.js", 10, [], true)]);
    expect(info.stack).toEqual([]);
    expect(info.js?.initialFiles).toBe(1);
  });
});
