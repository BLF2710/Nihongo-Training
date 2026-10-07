# AGENTS.md

## Project Overview

This is a gamified Japanese language-learning web application.

The project is an existing application. **Do not redesign, rewrite, or replace existing systems unless explicitly requested.**

The application currently includes:

* Japanese language learning
* Lessons and units
* Vocabulary
* Grammar
* Hiragana
* Katakana
* Kanji
* Games
* Quizzes
* Review
* EXP / progression
* User authentication
* Statistics / mastery tracking

The project is actively being developed, so existing functionality may be incomplete. Always inspect the current implementation before making changes.

---

## Core Rule

**Preserve existing functionality unless the task explicitly requires changing it.**

Before implementing anything:

1. Inspect the relevant existing files.
2. Understand how the current feature works.
3. Reuse existing components, APIs, types, utilities, styles, and data structures when possible.
4. Make the smallest reasonable change that fully satisfies the request.
5. Do not create duplicate systems when an existing system can be extended.

Do not assume that something is missing simply because it is not immediately visible.

---

## Tech Stack

Use the project's existing stack and conventions.

Expected frontend stack:

* React
* TypeScript
* Vite
* Tailwind CSS

Expected backend stack:

* Node.js
* Express
* PostgreSQL
* JWT authentication

Do not introduce another framework, state-management library, database, ORM, or major dependency unless explicitly requested or clearly necessary.

---

## Before Editing

Always inspect the repository before coding.

For a feature request:

* Find the relevant page/component.
* Find related components.
* Find the relevant API routes.
* Find the related database schema/models.
* Find existing types/interfaces.
* Find existing reusable utilities.
* Check how similar functionality is already implemented.

If an existing feature is similar to the requested feature, extend it instead of creating a parallel implementation.

---

## UI / Navigation

### Existing Sidebar

The existing sidebar is important.

Do **NOT** redesign, replace, duplicate, or recreate the sidebar.

Preserve the current sidebar structure and styling.

Current navigation concept:

```text
LEARNING LANGUAGE
└── Japanese

LEARN
├── Lessons
├── Vocabulary
├── Grammar
├── Kana
└── Kanji

PRACTICE
├── Games
│   ├── Hiragana Speed Quiz
│   └── Katakana Speed Quiz
├── Quizzes
└── Review
```

If a new feature needs navigation:

* Add it to the existing navigation system.
* Follow the existing visual style.
* Do not create another sidebar.
* Do not create a second navigation system.

Do not move or rename existing navigation items unless explicitly requested.

---

## Existing Course Structure

The application uses a structured Japanese course.

Do not assume that all planned units already exist.

The course currently has implemented content that may differ from the original project plan.

**Always inspect the current data before referring to available units or lessons.**

Units, lessons, assessments, prerequisites, level requirements, and unlocking rules should remain compatible with the existing implementation.

Do not create fake course content simply to fill empty states unless explicitly requested.

For future/locked units, use the existing project's intended placeholder/locked-state behavior.

---

## Lessons and Progression

Lessons can participate in the application's progression system.

Existing concepts include:

* EXP
* Levels
* Lesson completion
* Prerequisites
* Minimum level requirements
* Unit assessments
* Unit unlocking

When modifying progression:

* Reuse existing EXP/progression logic.
* Do not create a second EXP system.
* Do not bypass prerequisite checks.
* Do not automatically unlock content that should remain locked.
* Keep frontend and backend validation consistent.

If lesson content is currently frontend-defined, do not unnecessarily move it to the backend.

---

## Authentication

The application uses JWT authentication.

Existing authentication behavior may include:

* Register
* Login
* Email or username login
* JWT stored on the client
* Authenticated API requests using Bearer tokens

Do not replace the authentication architecture unless explicitly requested.

When adding authenticated functionality:

* Use the existing authentication mechanism.
* Reuse the existing API client/interceptor.
* Reuse the existing user identity information.
* Never hard-code user IDs.

---

## Backend

Follow the existing Express API structure.

Before adding an endpoint:

1. Check whether an existing endpoint can support the feature.
2. Check existing route organization.
3. Check existing middleware.
4. Check existing database access patterns.
5. Reuse existing validation patterns.

Keep business logic consistent with existing APIs.

Do not duplicate an existing endpoint under another name.

---

## Database

PostgreSQL is the application's database.

Before modifying the database:

* Inspect the existing schema.
* Check foreign keys.
* Check indexes.
* Check existing relationships.
* Check whether the required data already exists.

Do not create duplicate tables for concepts that already have tables.

When adding tables or columns:

* Use clear names.
* Preserve existing relationships.
* Add appropriate foreign keys.
* Add indexes when justified.
* Avoid destructive schema changes unless explicitly requested.

Never silently delete or reset production/user data.

---

## Japanese Learning Data

Japanese learning data should be treated as structured educational content.

Relevant concepts may include:

* Hiragana
* Katakana
* Kanji
* Vocabulary
* Readings
* Meanings
* Grammar
* Lessons
* Exercises
* Quiz questions
* Mastery
* Review

For Kanji specifically:

A Kanji learning item should generally be treated as more than a standalone character.

Prefer a structure such as:

```text
Kanji
Word
Reading
Meaning
Example
```

when the existing feature supports it.

Many Japanese kanji are difficult to understand meaningfully in isolation, so vocabulary context is preferred when appropriate.

Do not invent stroke-order data.

If reliable stroke-order data already exists, reuse it.

If stroke-order data does not exist, do not fabricate stroke paths and present them as accurate.

---

## Kana

The application supports Hiragana and Katakana.

Existing Kana functionality may include:

* Character lists
* Flashcards
* Writing canvas
* Stroke information
* Character mastery
* Speed quizzes
* Review

Do not replace existing Kana data with invented data.

Do not invent stroke paths.

If stroke-order information is unavailable, clearly represent that it is unavailable rather than generating fake stroke data.

---

## Mastery and Review

The application has mastery/progress concepts for Kana and potentially other learning content.

Existing mastery concepts may include:

```text
Untested
Learning
Mastered
```

For existing Kana mastery logic:

* Untested means the user has no recorded answers.
* Mastered requires at least 3 correct answers and at least 80% accuracy.
* Learning means the user has attempted the item but has not reached mastery.

Do not change these thresholds unless explicitly requested.

Review should reuse existing quiz/practice logic when possible.

Do not create an entirely separate review engine if the existing quiz engine can be reused.

---

## Quiz / Game Behavior

When adding a new quiz or game:

* Reuse existing question/answer infrastructure where possible.
* Preserve existing statistics behavior.
* Ensure correct and incorrect answers update the appropriate progress data.
* Avoid duplicating scoring systems.
* Keep percentages/statistics consistent with existing features.

Do not show percentage statistics in places where the existing UI intentionally avoids them.

For example, if the learning page does not show percentages but the statistics/game results page does, preserve that distinction.

---

## Components

Prefer reusable components.

Before creating a new component, check whether an existing component can be:

* Reused
* Extended
* Given additional props
* Made slightly more generic

Do not duplicate components with nearly identical behavior.

Avoid premature abstraction.

A small amount of duplication is preferable to creating a complicated abstraction that makes the existing code harder to understand.

---

## Styling

Use the existing Tailwind classes and design language.

Do not introduce a completely new visual design for a small feature.

Maintain:

* Existing spacing
* Typography
* Borders
* Cards
* Buttons
* Colors
* Responsive behavior
* Dark/light behavior if present

When adding a page, make it visually consistent with neighboring pages.

Do not redesign unrelated pages.

---

## Responsive Design

New UI should work on:

* Desktop
* Tablet
* Mobile

Do not break existing desktop layouts while making mobile changes.

Prefer responsive Tailwind utilities over JavaScript-based viewport detection unless the existing architecture already uses viewport logic.

---

## Error Handling

Do not silently swallow errors.

For API operations:

* Handle loading state.
* Handle failure state.
* Show a useful user-facing error when appropriate.
* Avoid exposing sensitive backend information.

Do not display raw stack traces or database errors to users.

---

## Data Validation

Never trust client-side validation alone for important operations.

For backend operations:

* Validate required fields.
* Validate IDs.
* Validate numeric ranges.
* Validate authorization.
* Validate ownership where appropriate.

If the frontend calculates a score but the backend currently validates the allowed score/range, preserve that behavior.

Do not blindly trust values sent from the browser.

---

## Performance

Avoid unnecessary performance work.

Do not optimize code without evidence that optimization is needed.

However:

* Avoid unnecessary API requests.
* Avoid unnecessary database queries.
* Avoid rendering large lists inefficiently.
* Reuse fetched data where appropriate.
* Avoid loading large datasets when pagination/filtering is available.

For learning content, prefer efficient loading without making the implementation unnecessarily complicated.

---

## Code Quality

Use TypeScript properly.

Prefer:

* Explicit types for important data structures
* Existing interfaces/types
* Narrow types
* Clear function names
* Small focused functions

Avoid:

* `any` unless genuinely necessary
* Huge components
* Huge functions
* Copy-pasted logic
* Unnecessary dependencies
* Dead code
* Unused imports
* Temporary debugging code

Do not refactor unrelated code merely because it could be written differently.

---

## Testing / Verification

After making changes:

1. Check TypeScript errors.
2. Run the relevant lint command if available.
3. Run relevant tests if available.
4. Check that existing functionality was not broken.
5. Verify the changed UI flow.
6. Verify API/database behavior when applicable.

If a command fails because of an unrelated pre-existing issue, do not pretend the project is clean.

Clearly distinguish:

```text
New issue introduced by this change
```

from:

```text
Pre-existing issue
```

---

## Git

Do not perform destructive Git operations unless explicitly requested.

Do not:

* Force reset the repository
* Delete branches
* Rewrite history
* Force push
* Remove user changes

Never overwrite existing uncommitted user work.

Before modifying a file, assume existing changes may be intentional.

---

## Existing User Changes

This is especially important.

**Do not overwrite, revert, or discard changes that were already present before your task.**

If the working tree contains modifications:

* Inspect them.
* Preserve them.
* Modify only what is necessary.
* Avoid broad formatting changes that touch unrelated lines.

If a requested change conflicts with existing work, explain the conflict instead of silently deleting the existing implementation.

---

## Implementation Style

Prefer incremental implementation.

For a large feature:

1. Inspect existing architecture.
2. Identify reusable systems.
3. Implement the smallest complete version.
4. Verify it.
5. Extend it only where necessary.

Do not implement speculative features that were not requested.

Do not add placeholder functionality unless the user explicitly asks for placeholders.

---

## Codex Response Expectations

When completing a task, provide a concise summary:

### Changed

List the important files/features changed.

### Behavior

Explain what the user can now do.

### Verification

Mention relevant checks performed.

If something could not be verified, say so.

Do not provide a massive explanation unless requested.

---

## Important Instruction

When the user's request is ambiguous, prefer the interpretation that:

1. Preserves existing functionality.
2. Reuses existing architecture.
3. Makes the smallest change.
4. Matches the current UI.
5. Avoids unnecessary dependencies.
6. Avoids speculative features.

If a decision could significantly affect the architecture, ask before making the change.

Otherwise, make a reasonable implementation using the existing project patterns.
