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
- **`useParsedTeam(config: string): Sim.Character[]`** — Hook signature
  for deriving a `Sim.Character[]` from a config string. Phase 3d ships
  a stub returning `[]`; Phase 5 wires it to `@gcsim/executor`'s async
  `validate()` API (which returns `Sim.ParsedResult`) and maps the
  parsed profiles to `Sim.Character`. See `src/use-parsed-team.ts` for
  the TODO.

## Dependencies

- `@gcsim/primitives` — Card, cn() utility
- `@gcsim/types` — `Sim.SimResults`, `Sim.Character` interfaces
- `@gcsim/avatar` — `TeamStrip` (compact character cards) +
  `resolveElementColor` for the per-character bar tint
- `@gcsim/viewer` — `MetadataChip` for the metadata strip

## Don'ts

- Don't fetch data in components — they are purely presentational
- Don't import from other packages' `src/` — only from their package index
- Don't use `@/` path aliases in source files — use relative imports
