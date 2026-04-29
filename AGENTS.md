# Flomingo

## Package Manager

- **bun** with `bunfig.toml` using `linker = "hoisted"` (required for Expo native modules)
- Use `bun install` at workspace root, not in individual packages

## Developer Commands

```bash
bun run lint        # biome lint (ignores .agents folder)
bun run format      # biome check --write
bun run build       # turbo run build
bun run check-types # turbo run check-types
bun run dev         # turbo run dev
```

## Package Structure

```
apps/
  api/     # Hono server (bun run dev, bun run build)
  mobile/  # Expo Router app (expo start)

packages/
  @flomingo/auth  # better-auth server + expo plugin
  @flomingo/db    # drizzle-orm (schema in db/schema/)
  @flomingo/orpc  # RPC framework
  @flomingo/typescript-config/
```

## Key Conventions

- Package names use `@flomingo/` scope (not `@repo/`)
- Packages use flat structure: `pkg/index.ts` not `pkg/src/index.ts`
- Lint/format: **Biome only** (no ESLint, no Prettier)
- Use `turbo run <task> --filter=<pkg>` for single-package operations

## Auth Package

Generate better-auth schema:
```bash
bun run generate --filter=@flomingo/auth
```
This generates `packages/db/schema/auth.ts` from `packages/auth/index.ts` config.

## Mobile

- Uses expo-router with file-based routing in `mobile/app/`
- Auth client: `mobile/src/lib/auth-client.ts` (mobile-specific, uses expo-secure-store)
- Uses heroui-native + uniwind (tailwindcss for RN)
- Run `npx expo-doctor` to verify dependencies

## Expo SDK 55

Current version. Use `npx expo install` (not npm/yarn) to update expo packages to match SDK version.

## TypeScript

- Base config: `packages/typescript-config/base.json`
- API tsconfig extends it with Hono JSX settings