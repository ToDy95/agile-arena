# Agile Arena

Realtime multiplayer agile room built with Next.js App Router, TypeScript, Tailwind, and Liveblocks.

## Stack

- Next.js 16 (App Router)
- React 19 + TypeScript
- Tailwind CSS v4
- Liveblocks (presence + shared storage)
- TanStack Query (provider-ready for future API usage)
- Zod (runtime validation)
- Biome (format + lint)
- Vitest (unit tests)
- Playwright (e2e)
- shadcn/ui (UI primitives)

## Requirements

- Node.js 20+
- pnpm 10+
- Liveblocks secret key

## Setup

1. Install dependencies:

```bash
pnpm install
```

2. Configure environment variables:

```bash
cp .env.example .env.local
```

3. Set your Liveblocks secret in `.env.local`:

```bash
LIVEBLOCKS_SECRET_KEY=sk_prod_xxxxxxxxxxxxxxxxxxxxx
```

4. Start dev server:

```bash
pnpm dev
```

Open `http://localhost:3000`.

## Scripts

### App

- `pnpm dev`
- `pnpm build`
- `pnpm start`

### Quality

- `pnpm lint` (Biome check)
- `pnpm format` (Biome write)
- `pnpm typecheck`
- `pnpm check` (lint + typecheck + unit tests + build)

### Tests

- `pnpm test` / `pnpm test:unit`
- `pnpm test:watch`
- `pnpm test:e2e`
- `pnpm test:e2e:install`
- `pnpm test:e2e:ui`
- `pnpm test:e2e:headed`

### Clean / Reset

- `pnpm clean`
- `pnpm clean:next`
- `pnpm clean:modules`
- `pnpm clean:install`
- `pnpm reset`

## Git Hooks

Husky + lint-staged are configured. On pre-commit, staged files run through Biome fast checks.
