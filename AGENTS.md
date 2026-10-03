# AGENTS.md

QuiBee — The Buzzing Brain Game. A gamified quiz SPA built on TanStack Start, deployed on Netlify.

**Continue from [PLAN.md](./PLAN.md).** Milestone 1 (the playable UI surface) is done; pick up the next unchecked milestone.

## Architecture
- Single route (`src/routes/index.tsx`) renders `<AppProvider><AppShell/></AppProvider>`. Navigation between screens is **explicit view state**, not URL routing: `activeView: 'dashboard' | 'subject_select' | 'quiz' | 'battle' | 'events' | 'leaderboard' | 'profile' | 'admin'` in `src/lib/store.tsx`.
- `AppShell` handles boot phases (splash 2.5s → fade → app), shows `AuthModal` when there is no user, and swaps screens with a keyed `.view-in` transition. Bottom nav + footer are hidden in the quiz view.
- Starting any quiz goes through `startQuiz()` / `START_QUIZ`, which creates a `QuizSession` with a fresh `key` and sets `activeView: 'quiz'`. `QuizScreen` is keyed by `session.key`, so replay/next level fully remounts it.
- `QuizScreen` supports modes `level | timefast | googly | battle` via `buildMode()`. Answers lock through `lockAnswer()` guarded by `lockRef` (one attempt only, timer frozen on lock).

## Key directories
- `src/data/fixtures.ts` — **all stub data**: subjects, question bank, deterministic level question generator, players, events, developer credit. Swap this for database-backed loaders in later milestones.
- `src/lib/store.tsx` — reducer + context; persists user/progress to `localStorage` (`quibee:v1`) as a preview stand-in for real persistence.
- `src/components/` — one component per screen (`Dashboard`, `SubjectSelect`, `QuizScreen`, `LevelComplete`, `Battle`, `Events`, `Leaderboard`, `Profile`) plus shared UI (`Ring`, `Confetti`, `Avatar`, `Logo`, `DevCredit`, `Navbar`, `BottomNav`, `Footer`, `SplashScreen`, `AuthModal`).
- `src/styles.css` — Tailwind theme tokens (`honey`, `sky`, `ink`, `ok`, `bad`, `font-display`), `.glass`/`.glass-strong`/`.glass-dark`, `.honeycomb` mesh, `.btn-honey`/`.btn-sky`, `.pop` micro-scale, and all keyframe animations.

## Conventions
- Brand: gold `#F5A623`, sky `#2B8CBE`, ink `#1D2129`; Fredoka for display text, Plus Jakarta Sans for body.
- Animations are CSS keyframes (no animation library). Respect `prefers-reduced-motion` (handled globally).
- "Developed by aerous labs" credit must appear on splash, navbar and footer — use `<DevCredit/>`.
- Imports use the `@/` alias. Keep stubs inside `fixtures.ts`.

## Non-obvious decisions
- Level question sets are deterministic per (subject, level) via a seeded PRNG; maths questions are generated procedurally so all 100 levels differ.
- Stars: ≥90% accuracy = 3, ≥70% = 2, ≥50% = 1. A level with ≥1 star unlocks the next. Skipped questions don't count toward accuracy.
- Points = (10 + seconds left) × level multiplier (`1 + (level-1)×0.05`). Battles credit points only at the end.
- Auth is currently a client-side stub. The admin panel is intentionally not built yet: its credentials must be verified server-side (Identity role / env var), never bundled in client code.
