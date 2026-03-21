# @gcsim/web

Main web application for gcsim. Dev server runs on port 5173.

## Routes

| Path | Page | Description |
|------|------|-------------|
| `/` | Dash | Home / dashboard |
| `/simulator` | Simulator | Config editor + execution |
| `/web` | WebViewer | View results from local state |
| `/local` | LocalViewer | View results from local dev server |
| `/sh/$id` | ShareViewer | View shared results from API |
| `/sample/upload` | UploadSample | Upload sample data |
| `/sample/local` | LocalSample | Local sample viewer |

All pages are lazy-loaded via TanStack Router's `.lazy()` for code splitting.

## Stores (Zustand)

### `simulator-store.ts` (persisted as `gcsim-simulator`)
- `config: string` -- gcsl config text
- `team: Sim.Character[]` -- parsed team
- `validationResult: { errors: string[] } | null`
- `executionMode: "wasm" | "server"`
- `workerCount: number`
- `serverUrl: string`

### `viewer-store.ts` (not persisted)
- `results: Sim.SimResults | null`
- `activeTab: "results" | "config" | "sample"`
- `error: string | null`
- `recoveryConfig: string | null`

### `settings-store.ts` (persisted as `gcsim-settings`)
- `language: string`

## Consumed Packages

All `@gcsim/*` workspace packages: api, avatar, data, editor, executor, i18n, preview, primitives, types, viewer.

## Error Boundaries

- Root layout wraps entire app in `ErrorBoundary` (see `src/components/error-boundary.tsx`)
- Additional boundaries should wrap viewer, chart, and data-fetching sections as pages are implemented

## Commands

| Command | Description |
|---------|-------------|
| `pnpm --filter @gcsim/web dev` | Start dev server on port 5173 |
| `turbo run typecheck --filter=@gcsim/web` | Typecheck |
| `turbo run test --filter=@gcsim/web` | Run tests |
| `turbo run build --filter=@gcsim/web` | Build for production |
