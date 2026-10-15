import { resolve } from "node:path";
import {
  calculateStreak,
  completeHabit,
  createHabit,
} from "./core.ts";
import { loadStorage, saveStorage } from "./storage.ts";

const usage = "Usage: habits add <name> | done <name> | list";

function currentLocalDate(): string {
  const date = new Date();
  const year = date.getFullYear().toString().padStart(4, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function reportError(error: unknown): number {
  console.error(error instanceof Error ? error.message : String(error));
  return 1;
}

export async function runCli(args: readonly string[]): Promise<number> {
  const [command, ...parameters] = args;
  if (
    !command ||
    (command === "list" && parameters.length !== 0) ||
    (command !== "add" && command !== "done" && command !== "list") ||
    (command === "done" && parameters.length === 0)
  ) {
    console.error(usage);
    return 1;
  }

  const name = parameters.join(" ");
  if (command === "add" && name.trim().length === 0) {
    console.error("Habit name is required.");
    return 1;
  }

  try {
    const filePath = resolve(process.cwd(), "habits.json");
    const data = await loadStorage(filePath);

    if (command === "add") {
      createHabit(data, name);
      await saveStorage(filePath, data);
      console.log(`Habit created: ${name}.`);
      return 0;
    }

    if (command === "done") {
      const completed = completeHabit(data, name, currentLocalDate());
      if (completed) {
        await saveStorage(filePath, data);
        console.log(`Marked complete for today: ${name}.`);
      } else {
        console.log(`Already completed today: ${name}.`);
      }
      return 0;
    }

    if (data.habits.length === 0) {
      console.log("No habits yet.");
      return 0;
    }

    const today = currentLocalDate();
    const habits = [...data.habits].sort((left, right) =>
      left.name < right.name ? -1 : left.name > right.name ? 1 : 0,
    );
    for (const habit of habits) {
      console.log(`${habit.name}: ${calculateStreak(habit.completions, today)}`);
    }
    return 0;
  } catch (error) {
    return reportError(error);
  }
}
