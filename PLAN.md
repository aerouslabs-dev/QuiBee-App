# QuiBee Roadmap

QuiBee is a gamified quiz platform with a lot of moving parts — accounts, persistent progress, social features, live battles, events and an admin console. It is being delivered in focused milestones so each one ships something playable.

## Milestone 1 — Playable product surface ✅
- Animated boot splash ("Initializing Hive Engine…"), glass auth modal with Log in / Sign up / Guest tabs.
- Explicit `activeView` state machine with bottom navigation (Explore, 1v1 Battle, Events, Leaderboard, Profile).
- Dashboard, subject select with 100 levels per subject in four difficulty tiers, scaling point multipliers.
- Quiz screen with 15s SVG countdown ring, one-lock anti-cheat answering, lifelines (50/50, Audience Poll, +15s, Skip), completion overlay with stars, accuracy ring and confetti.
- Time Fast and Googly event modes, simulated 1v1 battles, leaderboard podium, FreeFire-style profile cards with Follow.
- All data comes from `src/data/fixtures.ts`; progress is saved in the browser only.

## Milestone 2 — Real accounts
- Replace the stubbed auth modal with Netlify Identity (email sign-up/login, optional OAuth).
- Keep Guest Mode; offer "claim your progress" when a guest signs up.
- Roles: `admin` role for the admin console.

## Milestone 3 — Data model & persistence (Netlify Database)
- Tables: `players`, `subjects`, `levels`, `questions`, `attempts`, `level_progress`, `follows`, `battles`, `events`.
- Move the question bank out of fixtures into the database, seeded from the current fixture set.
- Store progress, stars, points and follow graph per player.

## Milestone 4 — Server-verified scoring (anti-cheat, server side)
- Serve questions without the correct answer; validate each answer in a server function and award points there.
- One-attempt lock enforced server-side per (player, question, session); timers checked against server timestamps.
- Leaderboard computed from verified attempts.

## Milestone 5 — Social & leaderboards
- Real global + following leaderboards, seasonal resets.
- Public profile pages at shareable URLs, follower counts, visit other players.

## Milestone 6 — Live 1v1 battles
- Matchmaking and friend challenges; shared question set per match.
- Real-time sync of opponent progress, with simulated bots as a fallback when no human is available.

## Milestone 7 — Admin panel (`/admin`)
- Admin-only route protected by the Identity `admin` role (credentials checked server-side, never shipped to the browser).
- Add/edit/verify questions and levels, create custom events, view player stats, adjust points.

## Milestone 8 — Content depth & polish
- Grow each subject's question bank so all 100 levels feel distinct (currently ~15 curated questions per subject plus procedurally generated maths).
- Sound effects/haptics, PWA install, achievements and daily streak rewards.
