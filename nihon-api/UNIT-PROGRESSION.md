# Japanese unit progression

Unit 1 is fully implemented. Its six lesson IDs come from the existing lesson catalog.
The unit is available at Level 1, using `getLevelFromXP` from the existing progression service.
Lesson-level prerequisite, level, XP, and completion rules are unchanged.

Unit 2 (Everyday Japanese) and Unit 3 (Building Conversations) are placeholders,
requiring Levels 3 and 5 respectively, plus completion of their previous unit.
Each has one display-only Coming Soon lesson in `placeholderLessons`, outside the
real lesson catalog. They have no assessment ID or questions. `isPlaceholder`
explicitly prevents completion, progress counting, and assessment access, including
when old or malformed progress rows exist. Unit 3 therefore remains locked until
real Unit 2 content and its assessment are implemented and completed.
No new migration is required for these catalog entries.

`GET /api/units` derives lesson counts and unit completion from `lesson_progress`
and `user_assessment_progress`. Unit completion requires every configured lesson
plus a persisted assessment pass. Unit access requires both the configured level
and completion of `previousUnitId`, when present. The existing lesson routes also
enforce this unit gate above the original lesson gate.

`GET /api/units/:unitId/assessment` and `POST` to the same path require authentication,
unit access, and all unit lessons completed. The GET response omits answer keys.
POST accepts `{ assessmentId, answers: number[] }`, in the returned question order.
The server validates every option and grades the answers; supplied scores/user IDs
are not trusted. Unit 1 needs 12 of 15 correct (80%). An atomic upsert retains the
first pass and best score across failed retakes and submission retries. Assessments
do not award XP or update character statistics.

Apply the additive migration using `npm run migrate` in `nihon-api`.
No existing lesson, account, XP, or game records are replaced.

## Adding a future unit

1. Add its lesson definitions (including route slugs) and lesson content to the existing catalogs.
2. Add its server assessment questions in `src/data/unit-assessments.ts`.
3. Add a definition in `src/data/units.ts` with its ID, number, title, required level,
   lesson IDs, assessment ID, and previous unit ID.
   When implementing a placeholder, remove `isPlaceholder` and `placeholderLessons`
   and supply the real lesson IDs and assessment ID.

The unit selector, assessment list, lock messages, and question page render this data
automatically. Assessment IDs identify a stable assessment; use a new ID for a new
version if its previous pass must no longer count. Do not renumber existing lesson IDs.
An unfinished assessment's answers are held in the page; refreshing starts it again.
Saved passes and best scores are persisted on the server.

## Validation

Run `node scripts/verify-unit-assessments.cjs` for authenticated HTTP tests backed by
temporary PostgreSQL tables, rolled back afterward. They cover initial availability,
5/6 and 6/6 gates, payload validation, exact pass boundary, failed retakes, user isolation,
unchanged XP/lesson gates, and a synthetic dependent-unit fixture testing AND logic.

For browser coverage, start the frontend on port 5181 and add `--browser`. The script
can use an existing Playwright installation through `PLAYWRIGHT_MODULE_PATH` and a
browser through `BROWSER_EXECUTABLE`; neither adds a project dependency. Browser API
requests are routed to the temporary test database. `TEST_BASE_URL` overrides the
frontend address.
