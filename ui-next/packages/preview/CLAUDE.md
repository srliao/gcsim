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

- **`PreviewCard`** — Compact result card showing team portraits, DPS, iterations, mode, warnings, and per-character DPS breakdown. Includes `#images_loaded` signal for headless capture.

## Dependencies

- `@gcsim/primitives` — Card, Badge, cn() utility
- `@gcsim/types` — `Sim.SimResults` interface
- `@gcsim/avatar` — `TeamStrip` for character cards

## Don'ts

- Don't fetch data in components — they are purely presentational
- Don't import from other packages' `src/` — only from their package index
- Don't use `@/` path aliases in source files — use relative imports
