import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { registerHooks, stripTypeScriptTypes } from "node:module";
import os from "node:os";
import path from "node:path";
import { mkdtemp, rm } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import test from "node:test";

registerHooks({
  load(url, context, nextLoad) {
    if (!url.endsWith(".ts")) {
      return nextLoad(url, context);
    }

    return {
      format: "module",
      source: stripTypeScriptTypes(readFileSync(fileURLToPath(url), "utf8")),
      shortCircuit: true,
    };
  },
});

const { calculateStreak, completeHabit, createHabit } = await import(
  "../habits/core.ts"
);
const { loadStorage, saveStorage } = await import("../habits/storage.ts");

async function withTempDirectory(run) {
  const directory = await mkdtemp(path.join(os.tmpdir(), "habits-core-"));
  try {
    await run(directory);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
}

test("rejects empty or whitespace-only names without changing data", () => {
  for (const name of ["", " \t\n "]) {
    const data = { version: 1, habits: [] };
    assert.throws(() => createHabit(data, name), {
      message: "Habit name is required.",
    });
    assert.deepEqual(data, { version: 1, habits: [] });
  }
});

test("preserves valid names exactly and allows capitalization variants", () => {
  const data = { version: 1, habits: [] };

  assert.equal(createHabit(data, "  Read Books  ").name, "  Read Books  ");
  assert.equal(createHabit(data, "read books").name, "read books");
  assert.deepEqual(data.habits.map(({ name }) => name), [
    "  Read Books  ",
    "read books",
  ]);
});

test("rejects an exact duplicate without modifying habits", () => {
  const data = { version: 1, habits: [] };
  createHabit(data, "Study");
  const originalData = structuredClone(data);

  assert.throws(() => createHabit(data, "Study"), {
    message: "Habit already exists: Study.",
  });
  assert.deepEqual(data, originalData);
});

test("created habits remain available after saving and loading", async () => {
  await withTempDirectory(async (directory) => {
    const filePath = path.join(directory, "habits.json");
    const data = { version: 1, habits: [] };
    createHabit(data, "  Study TypeScript  ");
    createHabit(data, "study typescript");

    await saveStorage(filePath, data);

    assert.deepEqual(await loadStorage(filePath), data);
  });
});

test("records one completion per habit and date", () => {
  const data = { version: 1, habits: [] };
  createHabit(data, "Study");
  createHabit(data, "Read");

  assert.equal(completeHabit(data, "Study", "2026-10-15"), true);
  assert.equal(completeHabit(data, "Study", "2026-10-15"), false);
  assert.equal(completeHabit(data, "Read", "2026-10-15"), true);
  assert.deepEqual(data.habits, [
    { name: "Study", completions: ["2026-10-15"] },
    { name: "Read", completions: ["2026-10-15"] },
  ]);
});

test("unknown habits do not change data when completed", () => {
  const data = { version: 1, habits: [] };
  createHabit(data, "Study");
  const originalData = structuredClone(data);

  assert.throws(() => completeHabit(data, "study", "2026-10-15"), {
    message: "Habit does not exist: study.",
  });
  assert.deepEqual(data, originalData);
});

test("calculates streaks from today or yesterday and stops at gaps", () => {
  const today = "2026-10-15";

  assert.equal(calculateStreak([], today), 0);
  assert.equal(calculateStreak(["2026-10-15"], today), 1);
  assert.equal(calculateStreak(["2026-10-14"], today), 1);
  assert.equal(
    calculateStreak(["2026-10-12", "2026-10-14", "2026-10-15"], today),
    2,
  );
  assert.equal(calculateStreak(["2026-10-13"], today), 0);
});

test("counts a multi-day consecutive run backward from today", () => {
  assert.equal(
    calculateStreak(
      ["2026-10-11", "2026-10-12", "2026-10-13", "2026-10-14", "2026-10-15"],
      "2026-10-15",
    ),
    5,
  );
});

test("counts a multi-day consecutive run backward from yesterday", () => {
  assert.equal(
    calculateStreak(["2026-10-12", "2026-10-13", "2026-10-14"], "2026-10-15"),
    3,
  );
});
