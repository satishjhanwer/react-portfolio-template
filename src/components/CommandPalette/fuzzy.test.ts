import { describe, expect, it } from "vitest";
import { fuzzyScore } from "./fuzzy";

describe("fuzzyScore", () => {
  it("is 0 for an empty query", () => {
    expect(fuzzyScore("  ", "Projects")).toBe(0);
  });

  it("is -1 when a term matches nowhere", () => {
    expect(fuzzyScore("zzz", "Projects", "work")).toBe(-1);
  });

  it("ranks a word-start match above a mid-word match", () => {
    expect(fuzzyScore("pro", "Projects")).toBeGreaterThan(fuzzyScore("jec", "Projects"));
  });

  it("ranks an earlier match higher", () => {
    expect(fuzzyScore("a", "a b")).toBeGreaterThan(fuzzyScore("a", "bbbbbbbbbbbba"));
  });

  it("weights label matches above keyword matches", () => {
    expect(fuzzyScore("react", "React", "")).toBeGreaterThan(fuzzyScore("react", "Skills", "react"));
  });

  it("matches keywords when the label doesn't", () => {
    expect(fuzzyScore("hire", "Go to Contact", "hire email")).toBeGreaterThan(0);
  });

  it("matches letters in order with gaps", () => {
    expect(fuzzyScore("gtc", "go to contact")).toBeGreaterThan(0);
  });

  it("prefers consecutive letters", () => {
    expect(fuzzyScore("con", "x contact")).toBeGreaterThan(fuzzyScore("cnt", "x contact"));
  });

  it("rejects letters spread too far apart", () => {
    expect(fuzzyScore("ab", `a${"x".repeat(40)}b`)).toBe(-1);
  });

  it("requires every term to match", () => {
    expect(fuzzyScore("go contact", "Go to Contact")).toBeGreaterThan(0);
    expect(fuzzyScore("go zebra", "Go to Contact")).toBe(-1);
  });

  it("is case-insensitive", () => {
    expect(fuzzyScore("PROJ", "projects")).toBe(fuzzyScore("proj", "Projects"));
  });
});
