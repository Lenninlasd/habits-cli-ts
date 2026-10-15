# Habits CLI — Project Guidelines

## Project
Build a Node.js CLI in TypeScript for recording study habits and calculating
habit streaks. Keep the domain logic and streak calculations in
`habits/core.ts`, and the command-line interface in `habits/cli.ts`. Store
user data locally in JSON.

## Architecture and dependencies
- Target Node.js 24.22.0 LTS and TypeScript 7.0.2.
- Use only Node.js built-in modules at runtime; do not add third-party runtime
  dependencies.
- Use built-in Node.js APIs for local JSON persistence. Keep command-line
  input/output separate from habit and streak rules.
- Use Node.js's built-in test runner.

## Commands
- Run tests: `node --test`
- Run the CLI from the project root with `node dist/habits.js <command>`.

## SDD workflow
- Before changing code, read `docs/constitution.md` and the active specification in `specs/`.
- If either is not present, do not invent project requirements; ask for clarification when the missing guidance affects the change.
- Keep implementation aligned with the accepted specification. Update or add tests for changed behavior.
- Do not modify files within `specs/` unless expressly requested.

## Conventions
- Prefer clear, typed TypeScript APIs and small functions.
- Keep streak calculations deterministic and testable; isolate date-dependent behavior so it can be tested reliably.
- Preserve existing JSON data when changing persistence behavior; do not silently discard or rewrite user data.

## Before finishing
- Run `node --test` and report the result.
