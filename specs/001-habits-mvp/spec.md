# Habits CLI MVP

## Technical baseline

- Use Node.js 24.22.0 LTS and TypeScript 7.0.2.
- Use Node.js built-in modules at runtime and its built-in test runner.

## Context and objective

People who are building study habits need a simple way to record what they
intend to practice, mark daily completions, and see whether they have maintained
each habit consistently.

The objective of this MVP is to provide a command-line interface with three
capabilities: create a habit, mark a habit as completed today, and list habits
with their consecutive-day streaks. Habit records and completions must remain
available across separate uses of the CLI.

## Users

- An individual using a command line to track personal study habits.

## User stories

- As a learner, I want to create a named habit so that I can track a study
  practice over time.
- As a learner, I want to mark a habit complete for today so that my record
  reflects the work I did.
- As a learner, I want to see my habits and their current streaks so that I can
  understand which practices I have kept up.

## Functional requirements

### RF-1 — Create a habit

- When the user submits a valid habit name, the system shall create a habit
  that can be recorded and listed in future CLI uses.
- When the submitted name is empty or contains only whitespace, the system
  shall reject it, display `Habit name is required.`, and return a nonzero
  status.
- The system shall preserve a valid submitted name exactly as entered,
  including its capitalization and whitespace, for storage and display.
- Habit-name identity shall be case-sensitive. Names that differ only by
  capitalization, such as `read` and `Read`, shall be treated as distinct
  habits.
- When the submitted name exactly matches an existing habit, the system shall
  reject it, display `Habit already exists: <submitted-name>.`, and return a
  nonzero status. It shall not create another entry or append a suffix.
- When a habit is created, the system shall display
  `Habit created: <habit-name>.` and return a zero status.

### RF-2 — Mark a habit complete today

- When the user identifies an existing habit by its exact, case-sensitive
  name, the system shall record that habit as completed for the current day.
- When the same habit is marked complete more than once on the same day, the
  system shall retain only one completion for that habit and day.
- When the user marks a habit complete for the first time that day, the system
  shall display `Marked complete for today: <habit-name>.` and return a zero
  status.
- When the user marks a habit complete again on the same day, the system shall
  display `Already completed today: <habit-name>.` and return a zero status.
- When different habits are marked complete on the same day, the system shall
  record a completion for each habit.
- When the user identifies a name that does not exist, the system shall report
  `Habit does not exist: <submitted-name>.`, return a nonzero status, and not
  record a completion.

### RF-3 — List habits and streaks

- When the user requests the habit list, the system shall show each existing
  habit and its current consecutive-day streak.
- When listing habits, the system shall order them alphabetically by their
  exact names in ascending case-sensitive order, without normalizing them.
- When no habits exist, the system shall display `No habits yet.` and return a
  zero status.
- When a habit has a completion today, the system shall calculate its streak
  starting from today.
- When a habit has no completion today but has a completion yesterday, the
  system shall calculate its streak starting from yesterday.
- When a day is missing in the consecutive sequence, the system shall end the
  current streak at the last uninterrupted sequence.
- When a habit has no qualifying consecutive completion days, the system shall
  show a streak of zero.

## Non-functional requirements

- Habit names, habit records, and completion records shall remain available
  across separate CLI uses.
- The interface shall provide understandable feedback for successful
  operations and errors.
- Successful commands shall return a zero status; rejected commands shall
  return a nonzero status.
- Streak results shall be deterministic for the same completion history and
  current date.

## Edge cases

- Creating a name that exactly matches an existing name is rejected with an
  explicit duplicate-name message and a nonzero status.
- Names that differ by capitalization are distinct and may both be created.
- Valid habit names retain their original capitalization and whitespace.
- Empty or whitespace-only habit names are rejected with an explicit required
  name message.
- Habit names in the list are ordered alphabetically by exact name, using
  case-sensitive ordering.
- Marking one habit complete repeatedly on a single day does not increase its
  completion count or streak.
- Completing multiple distinct habits on one day is allowed.
- A missed day breaks the consecutive-day streak.
- A habit completed yesterday but not today retains the streak through
  yesterday; a habit not completed today or yesterday has a zero current
  streak.
- Attempting to complete an unknown habit produces an explicit
  “the habit does not exist” message.
- Successful operations return a zero status; rejected commands return a
  nonzero status and an explanatory message.

## Out of scope

- Editing or deleting habits.
- Reminders, notifications, goals, or scheduled frequencies.
- Tracking multiple users or sharing habits between users.
- Reports or analytics beyond the current consecutive-day streak.
- Importing or exporting habit records.

## Completion criteria

- A user can create a habit and find it in a later listing.
- A habit name is stored and displayed exactly as entered.
- Names that differ only by capitalization can be created as separate habits.
- Creating an exact duplicate name is rejected with a duplicate-name message
  and a nonzero status; no numeric suffix is added.
- Empty or whitespace-only names are rejected with a required-name message.
- A user can mark an existing habit complete for the current day.
- Repeated completion of one habit on the same day does not create additional
  daily records.
- Completions for multiple habits on the same day are retained independently.
- An attempt to complete a nonexistent habit reports that it does not exist.
- The list shows the current streak for every habit, including the specified
  today, yesterday, missed-day, and zero-streak cases.
- Habits are listed alphabetically by exact name in case-sensitive order.
- The commands provide the specified feedback and status for success and
  failure.

## Open questions

None currently.
