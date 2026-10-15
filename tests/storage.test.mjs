import assert from "node:assert/strict";
import { readFile, mkdtemp, rm, writeFile } from "node:fs/promises";
import { readFileSync } from "node:fs";
import { registerHooks, stripTypeScriptTypes } from "node:module";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

registerHooks({
  load(url, context, nextLoad) {
    if (!url.endsWith(".ts")) {
      return nextLoad(url, context);
    }

    return {
      format: "module",
      source: stripTypeScriptTypes(
        readFileSync(fileURLToPath(url), "utf8"),
      ),
      shortCircuit: true,
    };
  },
});

const { loadStorage, saveStorage } = await import("../habits/storage.ts");

const validData = {
  version: 1,
  habits: [
    { name: "Study", completions: ["2026-10-14", "2026-10-15"] },
    { name: "Read", completions: [] },
  ],
};

async function withTempDirectory(run) {
  const directory = await mkdtemp(path.join(os.tmpdir(), "habits-storage-"));
  try {
    await run(directory);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
}

test("loads a valid habits file", async () => {
  await withTempDirectory(async (directory) => {
    const filePath = path.join(directory, "habits.json");
    await writeFile(filePath, JSON.stringify(validData), "utf8");

    assert.deepEqual(await loadStorage(filePath), validData);
  });
});

test("treats a missing file as empty initial storage", async () => {
  await withTempDirectory(async (directory) => {
    const filePath = path.join(directory, "habits.json");

    assert.deepEqual(await loadStorage(filePath), { version: 1, habits: [] });
  });
});

test("saves readable JSON with sorted, unique completion dates", async () => {
  await withTempDirectory(async (directory) => {
    const filePath = path.join(directory, "habits.json");
    const data = {
      version: 1,
      habits: [
        {
          name: "Study",
          completions: ["2026-10-15", "2026-10-13", "2026-10-15"],
        },
        { name: " Read ", completions: ["2026-10-14"] },
      ],
    };

    await saveStorage(filePath, data);

    const contents = await readFile(filePath, "utf8");
    assert.match(contents, /\n  "habits": \[/);
    assert.deepEqual(JSON.parse(contents), {
      version: 1,
      habits: [
        { name: "Study", completions: ["2026-10-13", "2026-10-15"] },
        { name: " Read ", completions: ["2026-10-14"] },
      ],
    });
    assert.deepEqual(await loadStorage(filePath), JSON.parse(contents));
  });
});

test("rejects corrupt JSON without changing the file", async () => {
  await withTempDirectory(async (directory) => {
    const filePath = path.join(directory, "habits.json");
    const contents = "{not valid json";
    await writeFile(filePath, contents, "utf8");

    await assert.rejects(loadStorage(filePath), /Invalid habits data/);
    assert.equal(await readFile(filePath, "utf8"), contents);
  });
});

test("rejects invalid data structures without changing the file", async () => {
  await withTempDirectory(async (directory) => {
    const filePath = path.join(directory, "habits.json");
    const contents = JSON.stringify({ version: 2, habits: [] });
    await writeFile(filePath, contents, "utf8");

    await assert.rejects(loadStorage(filePath), /Invalid habits data/);
    assert.equal(await readFile(filePath, "utf8"), contents);
  });
});

test("reports non-missing file read errors", async () => {
  await withTempDirectory(async (directory) => {
    await assert.rejects(loadStorage(directory), /EISDIR|directory/i);
  });
});
