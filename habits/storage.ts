import { randomUUID } from "node:crypto";
import { readFile, rename, rm, writeFile } from "node:fs/promises";

export interface HabitRecord {
  name: string;
  completions: string[];
}

export interface StorageData {
  version: 1;
  habits: HabitRecord[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isIsoDate(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const date = new Date(value);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function isStorageData(value: unknown): value is StorageData {
  if (!isRecord(value) || value.version !== 1 || !Array.isArray(value.habits)) {
    return false;
  }

  return value.habits.every(
    (habit) =>
      isRecord(habit) &&
      typeof habit.name === "string" &&
      Array.isArray(habit.completions) &&
      habit.completions.every(isIsoDate),
  );
}

export async function loadStorage(filePath: string): Promise<StorageData> {
  let contents: string;
  try {
    contents = await readFile(filePath, "utf8");
  } catch (error) {
    if (isRecord(error) && error.code === "ENOENT") {
      return { version: 1, habits: [] };
    }
    throw error;
  }

  let data: unknown;
  try {
    data = JSON.parse(contents);
  } catch (error) {
    throw new Error(`Invalid habits data in ${filePath}.`, { cause: error });
  }

  if (!isStorageData(data)) {
    throw new Error(`Invalid habits data in ${filePath}.`);
  }

  return data;
}

export async function saveStorage(
  filePath: string,
  data: StorageData,
): Promise<void> {
  if (!isStorageData(data)) {
    throw new TypeError("Invalid habits data.");
  }

  const normalizedData: StorageData = {
    version: 1,
    habits: data.habits.map((habit) => ({
      name: habit.name,
      completions: [...new Set(habit.completions)].sort(),
    })),
  };
  const temporaryPath = `${filePath}.${randomUUID()}.tmp`;

  try {
    await writeFile(temporaryPath, `${JSON.stringify(normalizedData, null, 2)}\n`, {
      encoding: "utf8",
      flag: "wx",
    });
    await rename(temporaryPath, filePath);
  } finally {
    await rm(temporaryPath, { force: true });
  }
}
