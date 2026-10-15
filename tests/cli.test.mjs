import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test, { before } from "node:test";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const cliPath = path.join(projectRoot, "dist", "habits.js");

before(() => {
  const build = spawnSync("npm", ["run", "build"], {
    cwd: projectRoot,
    encoding: "utf8",
  });
  assert.equal(build.status, 0, build.stderr || build.stdout);
});

async function withWorkingDirectory(run) {
  const directory = await mkdtemp(path.join(os.tmpdir(), "habits-cli-"));
  try {
    await run(directory);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
}

function runCli(directory, ...args) {
  return spawnSync(process.execPath, [cliPath, ...args], {
    cwd: directory,
    encoding: "utf8",
  });
}

async function readData(directory) {
  return JSON.parse(await readFile(path.join(directory, "habits.json"), "utf8"));
}

test("rejects unsupported commands and invalid argument counts", async () => {
  await withWorkingDirectory(async (directory) => {
    for (const args of [[], ["unknown"], ["list", "extra"], ["done"]]) {
      const result = runCli(directory, ...args);
      assert.notEqual(result.status, 0);
      assert.equal(result.stdout, "");
      assert.notEqual(result.stderr.trim(), "");
    }
  });
});

test("adds exact names, persists them across executions, and rejects duplicates", async () => {
  await withWorkingDirectory(async (directory) => {
    const created = runCli(directory, "add", "  Read Books  ");
    assert.equal(created.status, 0);
    assert.equal(created.stdout, "Habit created:   Read Books  .\n");
    assert.equal(created.stderr, "");
    assert.deepEqual(await readData(directory), {
      version: 1,
      habits: [{ name: "  Read Books  ", completions: [] }],
    });

    const duplicate = runCli(directory, "add", "  Read Books  ");
    assert.notEqual(duplicate.status, 0);
    assert.equal(duplicate.stdout, "");
    assert.equal(duplicate.stderr, "Habit already exists:   Read Books  .\n");

    const caseVariant = runCli(directory, "add", "read books");
    assert.equal(caseVariant.status, 0);
    assert.deepEqual((await readData(directory)).habits.map(({ name }) => name), [
      "  Read Books  ",
      "read books",
    ]);
  });
});

test("rejects empty and whitespace-only habit names", async () => {
  await withWorkingDirectory(async (directory) => {
    for (const name of ["", " \t "]) {
      const result = runCli(directory, "add", name);
      assert.notEqual(result.status, 0);
      assert.equal(result.stdout, "");
      assert.equal(result.stderr, "Habit name is required.\n");
    }
  });
});

test("marks a habit once per day and reports repeated completion", async () => {
  await withWorkingDirectory(async (directory) => {
    assert.equal(runCli(directory, "add", "Study").status, 0);

    const first = runCli(directory, "done", "Study");
    assert.equal(first.status, 0);
    assert.equal(first.stdout, "Marked complete for today: Study.\n");
    assert.equal(first.stderr, "");

    const repeated = runCli(directory, "done", "Study");
    assert.equal(repeated.status, 0);
    assert.equal(repeated.stdout, "Already completed today: Study.\n");
    assert.equal(repeated.stderr, "");

    const data = await readData(directory);
    assert.equal(data.habits[0].completions.length, 1);
    assert.match(data.habits[0].completions[0], /^\d{4}-\d{2}-\d{2}$/);
  });
});

test("does not complete a habit when name capitalization does not match", async () => {
  await withWorkingDirectory(async (directory) => {
    runCli(directory, "add", "Read");

    const result = runCli(directory, "done", "read");
    assert.notEqual(result.status, 0);
    assert.equal(result.stdout, "");
    assert.equal(result.stderr, "Habit does not exist: read.\n");
    assert.deepEqual((await readData(directory)).habits[0].completions, []);
  });
});

test("displays an empty list successfully", async () => {
  await withWorkingDirectory(async (directory) => {
    const result = runCli(directory, "list");

    assert.equal(result.status, 0);
    assert.equal(result.stdout, "No habits yet.\n");
    assert.equal(result.stderr, "");
  });
});

test("lists exact names in case-sensitive order with current streaks", async () => {
  await withWorkingDirectory(async (directory) => {
    const today = new Date();
    const currentDate = [
      today.getFullYear().toString().padStart(4, "0"),
      (today.getMonth() + 1).toString().padStart(2, "0"),
      today.getDate().toString().padStart(2, "0"),
    ].join("-");
    const yesterdayDate = new Date(today);
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterday = [
      yesterdayDate.getFullYear().toString().padStart(4, "0"),
      (yesterdayDate.getMonth() + 1).toString().padStart(2, "0"),
      yesterdayDate.getDate().toString().padStart(2, "0"),
    ].join("-");

    await writeFile(
      path.join(directory, "habits.json"),
      JSON.stringify({
        version: 1,
        habits: [
          { name: "read", completions: [currentDate] },
          { name: "Study", completions: [yesterday] },
          { name: "Read", completions: [] },
        ],
      }),
    );

    const result = runCli(directory, "list");
    assert.equal(result.status, 0);
    assert.equal(
      result.stdout,
      "Read: 0\nStudy: 1\nread: 1\n",
    );
    assert.equal(result.stderr, "");
  });
});

test("reports corrupt storage without overwriting it", async () => {
  await withWorkingDirectory(async (directory) => {
    const filePath = path.join(directory, "habits.json");
    const corruptData = "{bad json";
    await writeFile(filePath, corruptData);

    const result = runCli(directory, "add", "Study");

    assert.notEqual(result.status, 0);
    assert.equal(result.stdout, "");
    assert.match(result.stderr, /Invalid habits data/);
    assert.equal(await readFile(filePath, "utf8"), corruptData);
  });
});
