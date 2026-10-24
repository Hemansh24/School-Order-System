import assert from "node:assert/strict";
import { test } from "node:test";
import { parsePtCodeUsageHistory } from "./pt-code-usage-history";

const header = ["1_Post School Code_2", "Academic Year wise \nImplementation"];

test("imports usage in multiple sessions, normalizes codes and deduplicates pairs", () => {
  assert.deepEqual(parsePtCodeUsageHistory([header, [" pt0001 ", "2025-2026"],
    ["PT0001", "2025-2026"], ["PT0001", "2026-2027"], []]), [
    { ptCode: "PT0001", sessionYear: "2025-2026" },
    { ptCode: "PT0001", sessionYear: "2026-2027" }
  ]);
});

test("rejects malformed or partial rows before importing anything", () => {
  for (const row of [["PR1", "2026-2027"], ["PT1", "2026-2028"],
    ["PT1", "2026/2027"], ["PT1", ""], ["", "2026-2027"]]) {
    assert.throws(() => parsePtCodeUsageHistory([header, ["PT2", "2025-2026"], row]), /row 3/);
  }
});

test("expands multiline PT cells and excludes aggregate Group labels", () => {
  assert.deepEqual(parsePtCodeUsageHistory([header, ["Group", "2026-2027"],
    ["PT2122\nPT2123\nPT2124\nPT2477", "2026-2027"]]), [
    { ptCode: "PT2122", sessionYear: "2026-2027" },
    { ptCode: "PT2123", sessionYear: "2026-2027" },
    { ptCode: "PT2124", sessionYear: "2026-2027" },
    { ptCode: "PT2477", sessionYear: "2026-2027" }
  ]);
});

test("rejects unexpected headers, empty history and malformed input", () => {
  assert.throws(() => parsePtCodeUsageHistory([["Code", "Year"]]), /headers/);
  assert.throws(() => parsePtCodeUsageHistory([header, []]), /empty/);
  assert.throws(() => parsePtCodeUsageHistory({}), /array/);
});
