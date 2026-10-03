# QuiBee — The Buzzing Brain Game

QuiBee is a native-feeling, gamified quiz web app. Players pick from seven subjects (Mathematics, Physics, Chemistry, Biology, History, Religion, General Knowledge), climb 100 levels per subject with rising difficulty and point multipliers, use lifelines, play limited-time events, battle opponents head-to-head and compete on a global leaderboard.

Developed by [aerous labs](https://www.aerouslabs.netlify.com).

## What's in the app today
- Animated boot splash and a glass Log in / Sign up / Guest modal
- Explore dashboard, subject & level select (100 levels × 7 subjects)
- Quiz screen: 15s countdown ring, one-lock answers (first attempt only scores), lifelines (50/50, Audience Poll, +15s, Skip), results overlay with stars, accuracy and confetti
- Events: **Time Fast Quiz** (one 60s global clock) and **Googly Quiz** (mixed curveballs, ×2 points)
- 1v1 Battles against simulated opponents
- Leaderboard with Gold/Silver/Bronze podium, gamer profile cards with Follow

Accounts, scores and the player list currently use sample data in `src/data/fixtures.ts`, with progress saved in the browser.

## Tech
- TanStack Start + React 19 + TypeScript
- Tailwind CSS 4 with custom glassmorphism + honeycomb styling, CSS-driven animations
- lucide-react icons
- Deployed on Netlify

## Run locally
```bash
pnpm install
netlify dev    # or: pnpm dev
```

## Roadmap
See [PLAN.md](./PLAN.md). Next up: real accounts (Netlify Identity), persistent progress and question bank (Netlify Database), server-verified scoring, live battles and the `/admin` console.
