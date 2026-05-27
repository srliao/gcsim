# @gcsim/preview

## Purpose

Compact preview/embed card component for displaying simulation result summaries. Used by the embed app for Discord/social media embeds and by the DB app for entry cards.

## How to add a new component

1. Create `src/<component-name>/` directory
2. Add `<component-name>.tsx` with the component
3. Add `<component-name>.test.tsx` with tests
4. Add `index.ts` barrel export
5. Re-export from `src/index.ts`
6. Run `npx biome check --write packages/preview/`

## Canonical example

`src/preview-card/` — the main preview card component

## Public API

- **`PreviewCard`** — Compact result card showing team portraits
  (`TeamStrip` from `@gcsim/avatar`), a `MetadataChip` strip
  (DPS / Iter / Mode / Modified / Warnings), and a per-character DPS
  breakdown with element-colored bars (via `resolveElementColor`).
  Includes the `#images_loaded` signal for headless capture.
- **`useParsedTeam(validateFn, config): UseParsedTeamResult`** — Hook
  that derives a `Sim.Character[]` from a gcsim config string by
  delegating to an externally supplied `validateFn` (typically
  `executor.validate.bind(executor)` from `@gcsim/executor`). Wrapped
  in TanStack Query so identical configs reuse the parse result.
  Returns `{ team: Sim.Character[]; errors: string[]; isLoading: boolean }`.
  When `config` is empty, `validateFn` is not invoked. Requires a
  `QueryClientProvider` in the consumer's React tree. Keeping
  `validateFn` as an injected dependency means this package stays
  free of any executor runtime.

## Dependencies

- `@gcsim/primitives` — Card, cn() utility
- `@gcsim/types` — `Sim.SimResults`, `Sim.Character` interfaces
- `@gcsim/avatar` — `TeamStrip` (compact character cards) +
  `resolveElementColor` for the per-character bar tint
- `@gcsim/viewer` — `MetadataChip` for the metadata strip
- `@tanstack/react-query` (peer) — `useParsedTeam` runs the parse via
  `useQuery`. The consumer must provide a `QueryClientProvider`.

## Don'ts

- Don't fetch data in components — they are purely presentational
- Don't import from other packages' `src/` — only from their package index
- Don't use `@/` path aliases in source files — use relative imports
