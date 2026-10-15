# Technical Plan — Spec 001

## Module structure

- `habits/storage.ts` — Load and save local JSON data without discarding
  existing records. Supports persistence required by RF-1 and RF-2.
- `habits/core.ts` — Habit creation, exact name identity, daily completion, and
  streak calculation, independent of CLI input/output. Covers RF-1, RF-2, and
  RF-3.
- `habits/cli.ts` — Parse commands, present the specified English messages,
  and return command status codes. Covers the user-facing behavior in RF-1,
  RF-2, and RF-3.
- `habits/index.ts` — CLI entry point, compiled to `dist/habits.js`.
- `tests/` — Automated tests with Node.js's built-in test runner for every
  requirement in RF-1 through
  RF-3, including the specified edge cases.

## Data model (`habits.json`)

```json
{
  "version": 1,
  "habits": [
    {
      "name": "study typescript",
      "completions": ["2026-08-25", "2026-08-26", "2026-08-27"]
    }
  ]
}
```

- Store each habit using its exact submitted name, preserving capitalization
  and whitespace. (RF-1)
- Store completion dates in ISO format (`YYYY-MM-DD`), in ascending order,
  without duplicates for the same habit and day. (RF-2)
- Persist records locally in a human-readable format. Preserve existing data;
  if loading fails, report the error and do not overwrite the data.
- Use Node.js built-in file and JSON APIs for local persistence.

## Name identity and creation (RF-1)

- Reject empty or whitespace-only names with `Habit name is required.` and a
  nonzero status.
- Preserve each valid name exactly as submitted, including capitalization and
  whitespace.
- Compare names exactly and case-sensitively. Names such as `read` and `Read`
  are distinct; reject an exact duplicate with
  `Habit already exists: <submitted-name>.` and a nonzero status.
- Never append a suffix to a habit name.
- On success, display `Habit created: <habit-name>.` and return status 0.

## Completion and streak behavior (RF-2, RF-3)

- A completion records the current date for one existing habit. A habit can
  have no more than one completion per day.
- If the habit is already complete today, leave its records unchanged, display
  `Already completed today: <habit-name>.`, and return status 0.
- Match a habit by its exact, case-sensitive name. If the habit does not
  exist, display
  `Habit does not exist: <submitted-name>.`, return a nonzero status, and do
  not change the data.
- Calculate a current streak from the most recent completion when it is today
  or yesterday; count consecutive dates backward from there. Return zero if
  there is no completion today or yesterday. (RF-3)
- Inject the current date into the core logic so streak behavior can be tested
  deterministically. The CLI supplies the current local date.

## CLI contract (RF-1, RF-2, RF-3)

- Commands: `habits add <name>`, `habits done <name>`, and `habits list`.
- Run the compiled CLI from the project root as `node dist/habits.js`.
- Send command results to stdout and errors to stderr.
- Return status 0 for successful operations and a nonzero status for rejected
  operations.
- When the list is empty, display `No habits yet.` and return status 0.
- List habits in ascending alphabetical, case-sensitive order by exact name,
  showing each name and its current streak.
- Keep all user-facing messages in English, as required by the constitution
  and the specification.

## Test strategy

- Use Node.js's built-in test runner, with tests organized under `tests/`.
- **RF-1:** Test required-name validation; exact name preservation; distinct
  case variants; exact-duplicate rejection without suffixes; persistence;
  success and error messages and statuses.
- **RF-2:** Test recording a completion; repeated same-day completion without
  duplicate records; completions for different habits on the same day;
  nonexistent-habit message and status; persistence.
- **RF-3:** Test streaks with no completions, today, yesterday, missed days,
  one-day streaks, and longer consecutive runs; case-sensitive alphabetical
  listing by exact name; empty list message and status.
- Test storage with temporary directories for missing, valid, and corrupt
  data. Verify corrupt data is reported and never overwritten.
- Test the CLI command parsing and user-visible messages/statuses.

## Specification consistency review

- The earlier plan referred to RF-5, RF-9, RF-10, and RF-11, but the
  specification defines only RF-1 through RF-3. This plan maps every section
  to the existing requirements.
- The earlier plan specified Spanish CLI messages, conflicting with the
  constitution's English-only rule and the specification's English message
  text. The CLI contract now uses English.
- The earlier plan normalized names and assigned numeric suffixes. The
  specification now requires exact, case-sensitive name identity and rejects
  exact duplicates without suffixes; this plan follows the revised
  requirement.
- The earlier plan's completion-data uniqueness was labeled RF-5, which does
  not exist. It is now correctly associated with RF-2.
