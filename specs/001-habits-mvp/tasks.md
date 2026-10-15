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
  - Use pytest and temporary paths to cover corrupt files and load errors.
  - **Done when:** errors are reported and a failed load does not overwrite or
    discard existing data.

## Habit and completion rules

- [x] **4. Implement name normalization and validation** (20 min) — RF-1
  - Reject empty or whitespace-only names; trim leading and trailing
    whitespace, collapse whitespace sequences, and convert letters to
    lowercase.
  - **Done when:** tests cover rejection and each specified transformation,
    with the expected normalized name.

- [x] **5. Test name normalization** (15 min) — RF-1
  - Add unit tests for leading/trailing whitespace, consecutive whitespace,
    lowercase conversion, and empty input.
  - **Done when:** all variants produce the specified result or the required
    rejection.

- [x] **6. Implement habit creation and unique name assignment** (25 min) —
  RF-1
  - Create habits with normalized names and choose the first available numeric
    suffix, starting with `-2`.
  - **Done when:** repeated normalized names generate `-2`, and collisions
    with existing suffixed names advance to the next available name.

- [x] **7. Test habit creation and persistence** (20 min) — RF-1
  - Cover assigned names, suffix collisions, and habit availability after
    loading from storage.
  - **Done when:** tests verify assigned names and that a created habit is
    unchanged after saving and reloading.

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

- [x] **13. Connect `add` to creation and messages** (20 min) — RF-1
  - Connect the command to the name rules, save the habit, and print the
    specified English messages.
  - **Done when:** a successful creation prints
    `Habit created: <assigned-name>.` with status zero, and an empty name prints
    the required message with a nonzero status.

- [x] **14. Connect `done` to completions and messages** (20 min) — RF-2
  - Connect the command to daily completion and print the messages for first
    completion, repeated completion, and a nonexistent habit.
  - **Done when:** each scenario prints exactly the specified message and
    returns the corresponding status.

- [x] **15. Connect `list` to streaks and alphabetical ordering** (20 min) —
  RF-3
  - Display each normalized habit and its streak in ascending order; handle an
    empty list.
  - **Done when:** output lists all habits in order with their streaks, and an
    empty list displays `No habits yet.` with status zero.

- [x] **16. Enable execution with `python -m habits`** (15 min) — RF-1, RF-2,
  RF-3
  - Add the entry point that delegates to the CLI.
  - **Done when:** all three commands can be invoked from the project with
    `python -m habits` and return their messages and exit statuses.

- [x] **17. Test commands end to end** (25 min) — RF-1, RF-2, RF-3
  - Test argument parsing, user-visible messages, success and error flows,
    persistence across executions, and listing.
  - **Done when:** pytest verifies the output and exit-status contracts for all
    three commands, and a habit created in one execution remains available in
    the next.
