# Tasks — Habits CLI MVP

Tasks are ordered by dependency. Each task is sized to take no more than
25 minutes.

## Persistence

- [x] **1. Define the JSON format and load data** (20 min) — RF-1, RF-2
  - Implement loading `habits.json` with the version, habits, and completion
    dates described in the plan.
  - **Done when:** loading a valid file returns its records, and a missing file
    is handled as empty initial storage.

- [x] **2. Implement safe data saving** (20 min) — RF-1, RF-2
  - Save data as human-readable JSON, preserving existing records and storing
    ISO dates in ascending order without duplicates per habit.
  - **Done when:** saving and reloading preserves the existing habits and
    completions exactly.

- [x] **3. Test persistence errors** (20 min) — RF-1, RF-2
  - Use Node.js's built-in test runner and temporary paths to cover corrupt
    files and load errors.
  - **Done when:** errors are reported and a failed load does not overwrite or
    discard existing data.

## Habit and completion rules

- [ ] **4. Implement exact name validation** (20 min) — RF-1
  - Reject empty or whitespace-only names and preserve every valid name
    exactly as submitted, including capitalization and whitespace.
  - **Done when:** tests verify required-name rejection and exact name
    preservation.

- [ ] **5. Test exact name identity** (15 min) — RF-1
  - Add unit tests proving that capitalization variants are distinct and that
    valid names are not normalized.
  - **Done when:** tests verify exact name preservation and case-sensitive
    identity.

- [ ] **6. Implement exact duplicate rejection** (25 min) — RF-1
  - Reject an exact, case-sensitive duplicate with the specified error
    message; never append a suffix.
  - **Done when:** exact duplicates fail without changing data, while names
    that differ only by capitalization can both be created.

- [ ] **7. Test habit creation and persistence** (20 min) — RF-1
  - Cover exact-name creation, duplicate rejection, case variants, and habit
    availability after loading from storage.
  - **Done when:** tests verify names are preserved exactly after saving and
    reloading.

- [x] **8. Implement idempotent daily completion** (20 min) — RF-2
  - Record the current date for an existing habit without adding duplicates;
    do not change data if the habit does not exist.
  - **Done when:** a second completion on the same date leaves the date list
    unchanged, and an unknown name does not change any data.

- [x] **9. Test daily completion rules** (20 min) — RF-2
  - Cover first and repeated completions, two habits on the same day, and
    completion of a nonexistent habit.
  - **Done when:** tests verify one date per habit and day, independent records
    per habit, and no changes for an unknown habit.

- [x] **10. Implement deterministic streak calculation** (25 min) — RF-3
  - Calculate the streak from today or yesterday, count consecutive days
    backward, and return zero if there is no qualifying date; accept the
    current date as an input.
  - **Done when:** the same history and reference date always produce the same
    streak, including gaps and no recent completions.

- [x] **11. Test streak cases** (20 min) — RF-3
  - Cover no completions, today, yesterday, a missed day, a single date, and a
    multi-day consecutive run.
  - **Done when:** every case returns the exact expected count, including zero
    streaks and continuity through yesterday.

## Command-line interface

- [x] **12. Implement command parsing and exit statuses** (20 min) —
  RF-1, RF-2, RF-3
  - Accept `add <name>`, `done <name>`, and `list`; send normal output to
    stdout and errors to stderr.
  - **Done when:** each command routes to its operation and rejected commands
    return a nonzero status.

- [ ] **13. Connect `add` to creation and messages** (20 min) — RF-1
  - Connect the command to exact-name validation and duplicate rejection,
    save new habits, and print the specified English messages.
  - **Done when:** a successful creation prints
    `Habit created: <habit-name>.` with status zero; an empty name or exact
    duplicate prints the corresponding error message with a nonzero status.

- [ ] **14. Connect `done` to completions and messages** (20 min) — RF-2
  - Match the exact, case-sensitive habit name and connect the command to
    daily completion and the first, repeated, and nonexistent-habit messages.
  - **Done when:** each scenario prints exactly the specified message and
    returns the corresponding status, including when the submitted name's
    capitalization does not match an existing habit.

- [ ] **15. Connect `list` to streaks and alphabetical ordering** (20 min) —
  RF-3
  - Display each exact habit name and its streak in ascending case-sensitive
    order; handle an empty list.
  - **Done when:** output lists all habits in order with their streaks, and an
    empty list displays `No habits yet.` with status zero.

- [x] **16. Enable execution with Node.js** (15 min) — RF-1, RF-2,
  RF-3
  - Add the TypeScript entry point and compile it to `dist/habits.js`.
  - **Done when:** all three commands can be invoked from the project with
    `node dist/habits.js` and return their messages and exit statuses.

- [ ] **17. Test commands end to end** (25 min) — RF-1, RF-2, RF-3
  - Use Node.js's built-in test runner to cover argument parsing, user-visible
    messages, exact duplicate rejection, case-sensitive name identification,
    success and error flows, persistence across executions, and listing.
  - **Done when:** automated tests verify the output and exit-status
    contracts for all three commands, and a habit created in one execution
    remains available in the next.
