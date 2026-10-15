import type { HabitRecord, StorageData } from "./storage.ts";

function isIsoDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function shiftDate(value: string, days: number): string {
  const date = new Date(`${value}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export function createHabit(data: StorageData, name: string): HabitRecord {
  if (name.trim().length === 0) {
    throw new Error("Habit name is required.");
  }

  if (data.habits.some((habit) => habit.name === name)) {
    throw new Error(`Habit already exists: ${name}.`);
  }

  const habit: HabitRecord = { name, completions: [] };
  data.habits.push(habit);
  return habit;
}

export function completeHabit(
  data: StorageData,
  name: string,
  date: string,
): boolean {
  if (!isIsoDate(date)) {
    throw new RangeError(`Invalid completion date: ${date}.`);
  }

  const habit = data.habits.find((record) => record.name === name);
  if (!habit) {
    throw new Error(`Habit does not exist: ${name}.`);
  }

  if (habit.completions.includes(date)) {
    return false;
  }

  habit.completions.push(date);
  habit.completions.sort();
  return true;
}

export function calculateStreak(
  completions: readonly string[],
  currentDate: string,
): number {
  if (!isIsoDate(currentDate)) {
    throw new RangeError(`Invalid current date: ${currentDate}.`);
  }
  if (!completions.every(isIsoDate)) {
    throw new RangeError("Completion dates must use YYYY-MM-DD format.");
  }

  const dates = new Set(completions);
  const yesterday = shiftDate(currentDate, -1);
  let cursor = dates.has(currentDate)
    ? currentDate
    : dates.has(yesterday)
      ? yesterday
      : undefined;

  if (!cursor) {
    return 0;
  }

  let streak = 0;
  while (dates.has(cursor)) {
    streak += 1;
    cursor = shiftDate(cursor, -1);
  }

  return streak;
}
