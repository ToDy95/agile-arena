<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes. Read relevant guides in `node_modules/next/dist/docs/` before changing Next.js behavior, APIs, routing, caching, or config. Heed deprecations.
<!-- END:nextjs-agent-rules -->

# AGENTS.md

## 1. Project Overview
- Agile Arena is a real-time multiplayer agile collaboration app.
- Core room modes: Planning Poker (Grooming / Refinement) and Retro board (Went Well, To Improve, Action Items).
- Product direction is lightweight, responsive, game-lobby-like collaboration with clean architecture and low tech debt.

## 2. Tech Stack
- Next.js `16.2.1` (App Router) for app shell, routing, server/client boundaries, and API routes.
- React `19.2.4` + React DOM `19.2.4` for UI rendering.
- TypeScript `5` for strict typing and maintainability.
- Tailwind CSS `4` (+ `@tailwindcss/postcss`) for styling.
- Liveblocks (`@liveblocks/client`, `@liveblocks/react`, `@liveblocks/node`) for real-time presence and shared room state.
- Biome (`@biomejs/biome`) for formatting + linting.
- Zod `4` for runtime schema validation.
- Vitest `4` + Testing Library + jsdom for unit/integration tests.
- Playwright for end-to-end tests.
- shadcn/ui workflow (`shadcn` CLI + local `components/ui`) for reusable UI primitives.
- TanStack Query (`@tanstack/react-query`) for future server/API state fetching.
- Motion (`motion`) and Auto Animate (`@formkit/auto-animate`) for UX animation.
- Husky + lint-staged for pre-commit automation.
- rimraf for cleanup scripts.

## 3. Package Manager Rules
- Use `pnpm` only.
- Do not use `npm`, `yarn`, or `bun` unless explicitly required for a one-off external constraint.
- Install: `pnpm install`
- Add dep: `pnpm add <pkg>`
- Add dev dep: `pnpm add -D <pkg>`
- Run script: `pnpm <script>`

## 4. Scripts Usage
- `pnpm dev`: run local development server.
- `pnpm build`: production build.
- `pnpm start`: run built app.
- `pnpm lint`: Biome static checks.
- `pnpm format`: Biome auto-format/fix.
- `pnpm typecheck`: TypeScript type checks (`tsc --noEmit`).
- `pnpm test`: alias for unit tests.
- `pnpm test:unit`: run Vitest once.
- `pnpm test:watch`: run Vitest in watch mode.
- `pnpm test:e2e`: run Playwright tests.
- `pnpm test:e2e:install`: install Playwright Chromium.
- `pnpm test:e2e:ui`: run Playwright in UI mode.
- `pnpm test:e2e:headed`: run Playwright headed.
- `pnpm check`: full validation (`lint + typecheck + unit + build`).
- `pnpm clean`: remove local build/test artifacts.
- `pnpm clean:next`: remove `.next`.
- `pnpm clean:modules`: remove `node_modules`.
- `pnpm clean:install`: clean artifacts/modules/legacy lockfiles then reinstall.
- `pnpm reset`: alias for `clean:install`.
- `pnpm lint-staged`: run staged-file checks manually.
- `pnpm prepare`: install Husky hooks.

## 5. Code Style & Formatting
- Biome is the single source of truth for formatting/linting.
- Do not introduce Prettier configs or parallel formatter pipelines.
- Keep TypeScript strict. Avoid `any`; when unavoidable, document why.
- Components: `PascalCase` exports, file names in kebab-case or component-convention already used by folder.
- Hooks: `use-*.ts` with `useXxx` exports.
- Utils: small, focused functions in `lib/utils/*`.
- Schemas: colocate under `lib/schemas/*` with explicit exported schema names.
- Prefer explicit domain types from `lib/types/domain.ts` and `lib/liveblocks/types.ts`.

## 6. Architecture Rules
- `app/`: routes, layout, providers, route-level loading/error, API routes.
- `components/`: feature UI (`lobby`, `room`, `planning`, `retro`) and reusable `ui`.
- `lib/`: shared domain logic (`animations`, `constants`, `liveblocks`, `query`, `schemas`, `storage`, `types`, `utils`).
- `hooks/`: reusable React hooks.
- `tests/`: unit/integration tests.
- `e2e/`: Playwright specs.
- UI components do rendering and user interactions.
- Business logic belongs in `lib/*` or focused hooks.
- API/auth logic stays in route handlers and server utilities.
- Avoid monolithic files. Split when a file handles multiple domains or exceeds clear readability.

## 7. State Management Rules
- Liveblocks is the source of truth for shared real-time room state and presence.
- React local state is for ephemeral UI-only state (open panels, local inputs, hover/select UI).
- TanStack Query is for server/API data fetching and caching (non-Liveblocks async resources).
- Do not introduce ad-hoc global state hacks (module-level mutable state, random event buses, duplicated realtime caches).

## 8. Validation Rules
- Use Zod for all form/API/external input validation.
- Form input validation (nickname, room id, join/create flows).
- API route input/output validation.
- Parsing external or user-provided content (for example Jira URL/task parsing).
- No unvalidated external input may flow into core logic.

## 9. Testing Rules
- Vitest covers unit/integration logic.
- Playwright covers real user flows and smoke checks.
- Prioritize tests for critical logic and flows.
- Utility logic (`jira`, votes, room id, validation helpers).
- Critical room behavior (join flow, mode switching, realtime interaction boundaries where testable).
- Avoid over-testing trivial presentational markup.
- Prefer deterministic tests over snapshot-heavy suites.

## 10. Animation Rules
- Use `motion` for core transitions, reveal effects, and stateful interaction animation.
- Use Auto Animate for lightweight list/layout transitions (participants, notes).
- Respect reduced-motion preferences.
- Keep animations short, purposeful, and non-blocking.
- Never add motion that reduces clarity, performance, or accessibility.

## 11. UI Rules
- Prefer existing shadcn-style primitives in `components/ui` before creating raw HTML variants.
- Reuse UI primitives and avoid one-off style duplication.
- Maintain the app’s dark multiplayer/game-lobby visual direction consistently.
- Keep responsive behavior correct on mobile and desktop.

## 12. Performance Rules
- Minimize unnecessary re-renders in realtime views.
- Avoid heavy animations on large trees or high-frequency updates.
- Keep client components scoped; use server components by default when interactivity is not required.
- Avoid large client-only wrappers around static content.

## 13. Git & Commit Rules
- Create focused commits with a single concern.
- Use meaningful commit messages that describe intent and scope.
- Do not mix refactors, formatting churn, and feature logic in one commit unless tightly coupled.
- Never include unrelated file changes.

## 14. Pre-commit Rules
- Pre-commit hook is managed by Husky and runs: `pnpm lint-staged`.
- lint-staged scope runs Biome write/check on staged files:
- `*.{ts,tsx,js,jsx,cjs,mjs,json,jsonc,css,md}`
- Keep pre-commit fast. Do not run full e2e, full build, or heavy workflows in hooks.
- Use `pnpm check` for full local/CI validation.

## 15. Environment Variables
- Never commit secrets.
- Use `.env.local` for local secrets and keep `.env.example` updated.
- Required variable: `LIVEBLOCKS_SECRET_KEY` (server-only key for Liveblocks auth route).
- Keep server secrets out of client bundles. Do not expose secret keys as `NEXT_PUBLIC_*`.

## 16. Do / Don’t
### Do
- Use `pnpm` and existing scripts.
- Validate inputs with Zod.
- Keep realtime logic in Liveblocks layers.
- Keep components small and reusable.
- Run `pnpm check` before opening PRs.

### Don’t
- Don’t add npm/yarn lockfiles or mixed package-manager workflows.
- Don’t bypass Biome with alternative formatter pipelines.
- Don’t push unvalidated external input into app state.
- Don’t create giant multipurpose components/files.
- Don’t add heavyweight logic to pre-commit hooks.
