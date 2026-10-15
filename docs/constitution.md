# Project Constitution

1. **Simplicity First:** Use Python's standard library by default. Add dependencies only when a documented need justifies them.
2. **Specification as Source of Truth:** Every feature must comply with its approved specification. Code changes that affect behavior require a corresponding specification update.
3. **Separation of Concerns:** Keep habit-tracking and streak-calculation logic independent of CLI input/output and presentation.
4. **Testing Policy:** Every feature must include automated tests. Test business logic and edge cases; all tests must pass before merging.
5. **Data Persistence:** Store data locally in a documented, human-readable format. Never silently discard or overwrite existing user data.
6. **English Only:** Write all code identifiers, comments, documentation, CLI messages, and error messages in English.