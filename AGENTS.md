# Habits CLI — Project Guidelines

## Project
Build a Python CLI for recording study habits and calculating habit streaks. Keep the domain logic and streak calculations in `habits/core.py`, and the command-line interface in `habits/cli.py`. Store user data locally in JSON.

## Architecture and dependencies
- Support Python 3.12 and newer.
- Use only the Python standard library at runtime; do not add third-party runtime dependencies.
- Use the standard library for local JSON persistence. Keep command-line input/output separate from habit and streak rules.
- Use `pytest` as the only test framework.

## Commands
- Run tests: `python -m pytest`
- Run the CLI from the project root with `python -m habits <command>`.

## SDD workflow
- Before changing code, read `docs/constitution.md` and the active specification in `specs/`.
- If either is not present, do not invent project requirements; ask for clarification when the missing guidance affects the change.
- Keep implementation aligned with the accepted specification. Update or add tests for changed behavior.
- Do not modify files within `specs/` unless expressly requested.

## Conventions
- Prefer clear, typed Python APIs and small functions.
- Keep streak calculations deterministic and testable; isolate date-dependent behavior so it can be tested reliably.
- Preserve existing JSON data when changing persistence behavior; do not silently discard or rewrite user data.

## Before finishing
- Run `pytest -q` and report the result.
