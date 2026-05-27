# Implementation Progress

## Spec Corrections

Wherever the spec says "Tailwind v5", read "Tailwind v4". Wherever it says "Vite 6", read "Vite 8". Wherever it says "Storybook 8", read "Storybook 10".

## Phase 0: Monorepo Scaffolding + Agent Tooling + CI

| Step | Status | Description |
|------|--------|-------------|
| 0.0 | DONE | Dependency version verification |
| 0.1 | DONE | Initialize monorepo root |
| 0.2 | DONE | Root CLAUDE.md + auxiliary docs |
| 0.3 | DONE | Basic CI pipeline |
| 0.4 | DONE | Scaffolding skills |
| 0.5 | DONE | Subagent definitions |
| 0.6 | DONE | Claude Code hooks |
| 0.7 | DONE | Git workflow protocol |

### Step 0.0 — Dependency Version Verification (DONE)

- Verified all dependency versions against npm (2026-03-19)
- Created `ui-next/DEPENDENCIES.md` with pinned versions
- Key corrections from spec:
  - **Tailwind CSS v4.2.2** (spec said v5 — v5 doesn't exist; CSS-first `@theme` is a v4 feature)
  - **Vite 8.0.1** (spec said v6)
  - **Storybook 10.3.1** (spec said v8)
- Confirmed shadcn v4.1.0 is fully compatible with Tailwind v4 `@theme`
- `tw-animate-css` replaces deprecated `tailwindcss-animate` for Tailwind v4
- `tailwind-merge` v3.x is the correct line for Tailwind v4

### Step 0.1 — Initialize Monorepo Root (DONE)

- Created `package.json` (private, `@gcsim/monorepo` scope) with build/test/typecheck/lint scripts
- Created `pnpm-workspace.yaml` with `apps/*` and `packages/*`
- Created `turbo.json` with `build`, `test`, `typecheck`, `lint` pipelines (build/test/typecheck depend on `^build`)
- Created `biome.json` with recommended linting, space indentation, double quotes, semicolons
- Installed root dev deps: `turbo@2.8.20`, `@biomejs/biome@2.4.8`, `vitest@4.1.0`, `dependency-cruiser@17.3.9`, `typescript@5.9.3`
- Created `tooling/typescript/base.json` — strict tsconfig with composite, bundler moduleResolution, react-jsx
- Created `tooling/vitest/base.ts` — shared Vitest config (jsdom, globals, v8 coverage)
- Created `.env.example` with `VITE_API_BASE_URL`, `VITE_WASM_BASE_URL`, `VITE_LOCAL_DEV_URL`
- Created `.gitignore` (node_modules, dist, .turbo, .env, *.wasm, coverage)
- Copied static assets from `ui/` to `assets/` (favicon, stat icons, logos, wasm_exec.js)
- Created `assets/wasm/` directory for local WASM dev builds
- Verified: `pnpm install` succeeds, `turbo run build` succeeds (empty)

### Step 0.3 — Basic CI Pipeline (DONE)

- Created `.github/workflows/ui-next.yml` — GitHub Actions workflow triggered on push/PR to `web-rewrite` branch (path-filtered to `ui-next/**`)
- Pipeline steps: pnpm install → biome check → typecheck → test → dependency-cruiser → build
- Uses `pnpm/action-setup@v4` (v10), `actions/setup-node@v4` (Node 22), pnpm cache
- Created `ui-next/.dependency-cruiser.cjs` with rules:
  - `no-deep-package-imports` — import from package index only, never `@gcsim/<pkg>/src/...`
  - `no-circular` — no circular dependencies
  - `no-app-to-app` — apps must not import from other apps
  - `no-package-to-app` — packages must not import from apps
- Fixed `biome.json` for Biome 2.x: replaced deprecated `files.ignore` with `files.includes` scoped to `apps/**`, `packages/**`, `tooling/**` (excludes vendored `assets/wasm/wasm_exec.js`)
- Verified: all CI steps pass locally against empty monorepo

### Step 0.4 — Scaffolding Skills (DONE)

Created 7 Claude Code skills in `.claude/skills/`:
- **`/new-package`** (0.4a) — scaffolds `ui-next/packages/<name>/` with package.json, tsconfig, vitest config, CLAUDE.md, optional Tailwind
- **`/new-component`** (0.4b) — scaffolds a React component with .tsx, .test.tsx, index.ts barrel, wires into package exports
- **`/new-page`** (0.4c) — scaffolds a page in an app with lazy-loaded route entry
- **`/new-app`** (0.4d) — scaffolds a full Vite + React app with TanStack Query, Router, Zustand, i18n, Tailwind
- **`/new-store`** (0.4e) — scaffolds a typed Zustand store, optional `--persist` for localStorage middleware
- **`/check`** (0.4f) — runs sequential pipeline: biome → typecheck → test → dependency-cruiser → build (stops on first failure)
- **`/dev`** (0.4g) — builds dependencies then starts Vite dev server for specified app

### Step 0.5 — Subagent Definitions (DONE)

Created 4 Claude Code agent definitions in `.claude/agents/`:
- **`package-reviewer`** (0.5a) — qualitative review of a single package for boundary violations, type alias misuse, data-fetching patterns, test quality, CLAUDE.md completeness, design token usage, error boundaries
- **`package-tester`** (0.5b) — runs typecheck + tests for a package, diagnoses failures with specific fix suggestions
- **`feature-implementer`** (0.5c) — TDD-based implementation of a single feature component (max 3 sub-components); reads canonical example, writes failing test first, implements, updates CLAUDE.md. Skeleton — to be refined after Phase 2 (primitives) and Phase 3 (feature components)
- **`cross-package-integrator`** (0.5d) — wires completed packages into an app with composition components, integration tests, route updates; requires a composition spec in the dispatch call

### Step 0.2 — Root CLAUDE.md + Auxiliary Docs (DONE)

- Expanded `ui-next/CLAUDE.md` with full monorepo documentation:
  - Monorepo structure overview (apps/ vs packages/ vs assets/ vs tooling/)
  - Turborepo commands (build, test, typecheck with --filter)
  - All 10 architecture rules
  - Naming conventions (kebab-case files, PascalCase components, camelCase functions)
  - pnpm commands for adding dependencies
  - Biome usage and config summary
  - Tailwind v4 CSS-first theming note
  - Testing protocol table (what to test per package type)
  - Environment variables reference
  - WASM binary strategy (local dev vs production)
  - Scaffolding skills and subagent references
  - Commit discipline and git workflow protocol
- Created `ui-next/apps/CLAUDE.md`:
  - Apps own pages, stores, and route definitions
  - Apps are composition layers wiring packages together
  - Error boundary and lazy import requirements
  - Dev server port assignments (web=5173, db=5174, embed=5175)
  - References to `/new-app`, `/new-page`, `/new-store` skills
- Created `ui-next/tooling/CLAUDE.md`:
  - How to extend base tsconfig (with example)
  - How to extend base vitest config (with example)
  - Test fixtures usage (import from `tooling/test-fixtures/`, don't duplicate)
  - Don'ts (no runtime imports from tooling, no config duplication)

### Step 0.6 — Claude Code Hooks (DONE)

- Created `.claude/settings.json` with hooks configuration:
  - **PreToolUse (Bash):** `.claude/hooks/pre-commit-biome.sh` — intercepts `git commit` commands, runs `biome check --write` on staged ui-next files, blocks commit (exit 2) if biome fails
  - **PostToolUse (Edit|Write):** `.claude/hooks/post-edit-test.sh` — async hook that detects which `@gcsim/` package owns the edited file and runs `turbo run test --filter=@gcsim/<pkg>`
- Both scripts are executable and handle edge cases (non-ui-next files, missing paths)

### Step 0.7 — Git Workflow Protocol (DONE)

- Documented git workflow in `ui-next/CLAUDE.md`:
  - Branch naming: `phase-{N}/step-{X.Y}-{package-name}`
  - Worktree naming: `worktree-phase{N}-{package-name}`
  - Merge order: foundation packages first at phase gates
- Created `ui-next/tooling/cleanup-worktrees.sh`:
  - Finds worktrees matching `worktree-phase*` naming convention
  - Prunes missing worktrees
  - Removes clean (no uncommitted changes) worktrees
  - Skips worktrees with uncommitted changes (safety)
  - Reports cleanup summary

### Phase 0 Review Notes

Post-review fixes applied:
- Added `@testing-library/react` and `@testing-library/jest-dom` to `/new-package` skill devDependencies and DEPENDENCIES.md
- Pinned `tw-animate-css` to `1.3.4` in DEPENDENCIES.md (was `latest`)
- Fixed unquoted `$STAGED_FILES` in pre-commit hook (now uses `xargs`)
- Spec says `.claude/hooks.json` but Claude Code uses `.claude/settings.json` — this is correct

**TODO for Phase 1:** Test dependency-cruiser rules with deliberate violations. The `no-deep-package-imports` rule's `via` usage and the `no-app-to-app` rule's `{FROM_APP}` placeholder may not work as intended. Create a test file that imports from `@gcsim/<pkg>/src/...` and verify the rule fires.

**Assets note:** Spec section 3 shows `assets/characters/`, `assets/elements/`, etc. but game assets (character portraits, weapon/artifact images) are served from `/api/assets/` at runtime, not stored in the repo. Current `assets/images/` contains only static UI assets (favicon, icons, logo). This is correct — the spec's asset directories are aspirational for when/if assets are bundled locally.

## Phase 1: Foundation Packages

| Step | Status | Description |
|------|--------|-------------|
| 1.1 | DONE | `@gcsim/types` + `tooling/test-fixtures` |
| 1.2 | DONE | `@gcsim/data` |
| 1.3 | DONE | `@gcsim/i18n` |
| 1.4 | DONE | `@gcsim/api` |
| 1.5 | DONE | `@gcsim/executor` |

### Step 1.1 — `@gcsim/types` + `tooling/test-fixtures` (DONE)

- Created `packages/types/` with buf/protobuf-es generation pipeline
- `buf.gen.yaml` points at `protos/` at repo root, generates into `src/generated/`
- Generated TypeScript types from all 10 `.proto` files (7 model + 3 backend)
- Ported all custom interfaces from `ui/packages/types/src/sim.ts` into `src/sim.ts`
  - Includes: SimResults, Statistics, SummaryStat, Character, Enemy, Weapon, Talent, etc.
  - Did NOT port `user.ts` (auth removed per spec)
- Public API via `src/index.ts`:
  - Model proto types exported at top level (SimulationResult, Character, etc.)
  - Backend proto types namespaced: `share`, `db`, `preview`
  - Custom interfaces namespaced: `Sim` (use as `Sim.SimResults`, `Sim.Character`, etc.)
- 16 tests passing, typecheck clean, build succeeds
- Created `tooling/test-fixtures/` with canonical mock data:
  - `sim-result.ts` — mock SimResults with 2 characters, stats, config
  - `characters.ts` — mock Character objects (hutao, xingqiu)
  - `index.ts` — re-exports
- Dependencies: `@bufbuild/protobuf@2.11.0`, `@bufbuild/buf@1.66.1`, `@bufbuild/protoc-gen-es@2.11.0`
- Branch `phase-1/step-1.1-types` merged into `web-rewrite`

### Fixes applied during Phase 1

- Fixed pre-commit biome hook: file paths weren't stripped of `ui-next/` prefix after `cd ui-next/` (caused biome to look for `ui-next/ui-next/...`)
- Added `.turbo/` to root `.gitignore` (turbo cache dir was showing as untracked)

### Phase 1 Learnings (for next session)

- **Worktree branch issue:** `isolation: "worktree"` agents create branches from the repo's default HEAD (usually `main`), not from the current branch (`web-rewrite`). The `ui-next/` directory only exists on `web-rewrite`. Agents need explicit `git reset --hard origin/web-rewrite` instructions, but this gets blocked by sandbox permissions.
- **Recommended approach:** Either (a) create branches and worktrees manually before dispatching agents, or (b) don't use worktree isolation and instead run agents sequentially on the main working tree, or (c) pre-create branches from `web-rewrite` and have agents use them.
- **Steps 1.2–1.5 are independent** of each other (all depend only on `@gcsim/types` which is done). They can be parallelized once the worktree issue is resolved.
- **Worktree approach (resolved):** Pre-create worktrees with `git worktree add -b <branch> .claude/worktrees/<name> web-rewrite`, then dispatch agents to work in them. Agents can write files but cannot run bash in worktrees (sandbox limitation). Main agent must verify/commit each worktree's work.

### Step 1.2 — `@gcsim/data` (DONE)

- Created `packages/data/` with typed exports for game data
- Ported `latest_chars.json` (version→character key mapping) and `tags.json` (tag ID→display info)
- Typed interfaces: `TagInfo`, `TagMap`, `LatestCharsMap`
- `tsconfig.json` requires `resolveJsonModule: true` and `include: ["src/**/*.ts", "src/**/*.json"]`
- 11 tests passing, typecheck clean, build succeeds

### Step 1.3 — `@gcsim/i18n` (DONE)

- Created `packages/i18n/` with i18next + react-i18next
- Ported 7 language JSON files + names.generated.json + names.traveler.json
- Uses spread operator instead of lodash-es merge for combining name resources
- `initI18n(lng)` function for app initialization, `resources` object, `specialLocales` array
- Two namespaces: `translation` (UI strings) and `game` (character/entity names)
- `tsconfig.json` requires `resolveJsonModule: true` and `include: ["src/**/*.ts", "src/**/*.json"]`
- 6 tests passing, typecheck clean, build succeeds
- Dependencies: `i18next@25.8.20`, `react-i18next@16.5.8`

### Step 1.4 — `@gcsim/api` (DONE)

- Created `packages/api/` with typed fetch functions (new package, not ported)
- `apiFetch<T>()` base wrapper with gzip decompression via pako
- `ApiError` class with HTTP status code
- Endpoints: `fetchShareResult()`, `fetchDBResult()`, `queryDB()` (with pagination/abort), `fetchLocalResult()`
- Uses native `fetch` (not axios)
- 16 tests passing (4 test files), typecheck clean, build succeeds
- Dependencies: `@gcsim/types`, `pako@2.1.0`

### Step 1.5 — `@gcsim/executor` (DONE)

- Created `packages/executor/` ported from `ui/packages/executors/`
- `Executor` interface using `Sim` namespace types (`Sim.SimResults`, `Sim.ParsedResult`, `Sim.Sample`)
- `ServerExecutor` — HTTP-based with native fetch (replaces axios), async/await polling
- `WasmExecutor` — web worker pool with aggregator, configurable 1-30 workers
- `ExecutorError` class with typed error codes (`NETWORK`/`SERVER`/`PARSE`/`UNKNOWN`)
- Native throttle utility (replaces lodash-es)
- Worker files excluded from tsconfig (standalone scripts with duplicate function names)
- `tsconfig.json` excludes worker files: `"exclude": ["src/workers/worker.ts", "src/workers/aggregator.ts", "src/workers/helper.ts"]`
- 28 tests passing (3 test files), typecheck clean, build succeeds

### Phase 1 Gate (PASSED)

- All 5 packages: biome clean, typecheck pass, tests pass, build succeeds
- Total tests: 16 (types) + 11 (data) + 6 (i18n) + 16 (api) + 28 (executor) = 77 tests
- Dependency-cruiser: no violations
- All branches merged into `web-rewrite`, worktrees cleaned up

## Phase 2: Design System + Primitives

| Step | Status | Description |
|------|--------|-------------|
| 2.1 | DONE | Design system tokens |
| 2.2-2.4 | DONE | All shadcn primitives (installed via CLI) |
| 2.5 | DONE | Storybook setup |

### Steps 2.1–2.4 — `@gcsim/primitives` (DONE)

- Created `packages/primitives/` using shadcn CLI (`shadcn@4.1.0 init` + `shadcn add`)
- **Used shadcn CLI** to install all components instead of hand-writing them
- `components.json` configured for: `style: "radix-nova"`, `rsc: false`, `baseColor: "neutral"`, `iconLibrary: "lucide"`
- Theme uses Tailwind v4 CSS-first `@theme inline` with OKLCH color system (light + `.dark` variants)
- Custom Genshin element colors added: anemo, geo, electro, hydro, pyro, cryo, dendro
- `cn()` utility from `src/lib/utils.ts` (clsx + tailwind-merge)
- 11 shadcn components installed: Button, Card, Input, Tabs, Select, Badge, Dialog, DropdownMenu, Tooltip, ScrollArea, Skeleton
- All components use unified `radix-ui` package with relative imports (no `@/` path aliases — tsc doesn't rewrite them)
- `tsconfig.json` has `baseUrl` + `paths` for `@/*` alias; `vitest.config.ts` mirrors with `resolve.alias`
- `vitest.config.ts` includes `test-setup.ts` for `@testing-library/jest-dom/vitest` matchers
- Barrel export in `src/index.ts` re-exports all components and `cn()`
- Apps import theme via `@import '@gcsim/primitives/theme.css';` (exported via `package.json` exports)
- 14 tests passing (5 cn utility + 9 component rendering), typecheck clean, build succeeds
- Dependencies: `radix-ui`, `class-variance-authority`, `clsx`, `tailwind-merge`, `shadcn`
- DevDependencies: `tailwindcss@4.2.2`, `@tailwindcss/vite@4.2.2`, `tw-animate-css@1.3.4`, `lucide-react@0.577.0`

### Step 2.5 — Storybook (DONE)

- Created `apps/storybook/` with Storybook 10.3.1 + `@storybook/react-vite`
- 30 stories covering all 11 primitives with autodocs
- Tailwind integration via `@tailwindcss/postcss` (PostCSS, not Vite plugin — Storybook's Vite pipeline doesn't reliably pick up the Vite plugin)
- `storybook.css` inlines theme.css content (can't `@import` across package boundaries for Tailwind processing)
- `@source "../../../packages/primitives/src"` tells Tailwind to scan component source files for class names
- Dev server: `pnpm --filter @gcsim/storybook dev` on port 6006

### Phase 2 Fixes

- Enabled `tailwindDirectives: true` in `biome.json` CSS parser (Biome 2.x doesn't parse `@theme`, `@custom-variant`, `@apply` without it)
- Replaced all `@/lib/utils` and `@/components/ui/*` imports in shadcn components with relative paths — TypeScript path aliases are NOT rewritten by `tsc --build`, causing runtime resolution failures
- Removed embedded `.git` directory created by `shadcn init`

### Phase 2 Learnings

- **shadcn CLI creates a `.git` in the package** — must delete before committing
- **`@/` path aliases don't work in library packages** — tsc emits them verbatim in `.js` output. Use relative imports instead. The `@/` alias in `tsconfig.json` + `vitest.config.ts` is kept only for test resolution.
- **Storybook + Tailwind v4**: Use `@tailwindcss/postcss` with a `postcss.config.mjs`, not `@tailwindcss/vite`. The Vite plugin doesn't reliably activate in Storybook's internal Vite pipeline.
- **`@source` paths are relative to the CSS file**, not the project root. Count `../` carefully.
- **`@import "@gcsim/primitives/theme.css"` doesn't work for Tailwind processing** across package boundaries — inline the theme CSS in each consuming app's stylesheet instead.

### Phase 2 Gate

- All primitives: typecheck pass, 14 tests pass, build succeeds
- Storybook: all 30 stories render with correct Tailwind styling
- Total tests: 77 (Phase 1) + 14 (primitives) = 91 tests

### Phase 2 (ui-next redesign — Primitives) — DONE

Implements `docs/design_handoff_ui_next/README.md` § Phase 2.

- **Button**: added `primary` variant (uses `--accent`/`--accent-fg`/`--accent-hover`/`--accent-line`, 600 weight) and `md` size; legacy `default` kept as alias of `primary`/`md`. Heights now match the inventory (xs 22 / sm 26 / md 32 / lg 38). New `leading` and `trailing` ReactNode props.
- **Badge**: added `tone` prop (`neutral|accent|ok|warn|error|info|anemo|geo|electro|hydro|pyro|cryo|dendro|physical`) with `soft` (default) vs outlined fills via `--<tone>-soft`/`--<tone>` tokens. New `dot` (6px circle in current color) and `leading` slots. When `tone` is set it overrides `variant`; legacy `variant`-only callers untouched.
- **StatusPill** (new, in `status-pill.tsx`): wraps Badge; maps `status="ready|running|queued|failed|idle"` to `tone` + `dot` + a sensible default label. `children` overrides the label.
- **Tabs**: added new `pill` / `underline` variants and `sm` / `md` sizes on `TabsList`. Legacy `default` → `pill`, `line` → `underline` kept as aliases. Underline indicator now uses `--accent` for the active 2px bottom border.
- **NumberStepper** (new, in `number-stepper.tsx`): `[−] [value] [+]` row using `Button` (`size="icon-sm"`, `variant="outline"`) and lucide `Minus`/`Plus`. Mono tabular value, suffix slot, clamp to min/max, `<fieldset disabled>` for group disable.
- **Kbd** (new, in `kbd.tsx`): 10px mono cap with `--bg-2` background and double-thickness `--line-2` bottom border.

Call-site updates:
- `apps/web/src/components/nav.tsx` now renders `<Badge tone="accent">web-rewrite</Badge>`, `<StatusPill status="ready">WASM ready</StatusPill>`, and `<Kbd>⌘K</Kbd>`.
- `apps/web/src/pages/viewer/viewer-shell.tsx` uses `<TabsList variant="underline">` for the Results/Config/Sample tabs (matches Phase 6 spec for page-level navigation).

Storybook: every new primitive (StatusPill, NumberStepper, Kbd) has a story; Button/Badge/Tabs stories extended with new variants/tones.

Tests: 40 primitive tests passing (was 14). Web tests: 92 passing. Storybook build: green.

## Phase 3: Feature Packages

| Step | Status | Description |
|------|--------|-------------|
| 3.1 | DONE | `@gcsim/avatar` |
| 3.2 | DONE | `@gcsim/editor` |
| 3.3 | DONE | `@gcsim/viewer` metadata + result cards |
| 3.3-sb | DONE | Storybook stories for avatar + viewer |
| 3.4 | DONE | `@gcsim/viewer` charts |
| 3.5 | DONE | `@gcsim/viewer` sample viewer |
| 3.6 | DONE | `@gcsim/preview` |

### Step 3.3 — `@gcsim/viewer` Metadata + Result Cards (DONE)

- Created `packages/viewer/` with presentational components for simulation results
- **Metadata sub-components** (3.3a): `Iterations`, `Mode`, `Commit`, `Warnings`
  - Each takes a small slice of `Sim.SimResults` — pure presentational
  - `Warnings` renders active warnings as destructive Badges
- **TeamHeader** (3.3b): row of Cards showing character name, level, constellation, weapon
  - Takes `Sim.Character[]`, renders one Card per character
- **RollupCard** (3.3c): generic stat rollup card (mean, min, max, SD)
  - Takes any `FloatStat`/`SummaryStat` and a label
  - Formats numbers with `toLocaleString()`
- **DPSCard** (3.3d): per-character DPS with proportional bar (canonical example)
  - Takes character name, `FloatStat`, and `maxDPS` for proportional bar width
- **TargetInfoCard** (3.3e): enemy info display (name, level, resistances)
  - Takes `Sim.Enemy[]`, renders Card per target with resistance percentages
- 32 tests passing (5 test files), typecheck clean, build succeeds
- Dependencies: `@gcsim/primitives`, `@gcsim/types`, `@gcsim/i18n`
- All components use `data-testid` attributes for testing
- Uses relative imports (no `@/` aliases in library source)
- Total tests: 91 (Phase 1+2) + 32 (viewer) = 123 tests

### Step 3.1 — `@gcsim/avatar` (DONE)

- Created `packages/avatar/` with character display components
- **Portrait** (3.1a): circular avatar with character initial + element color badge
  - 3 sizes (sm/md/lg), element border/text colors from theme tokens
  - Handles missing/unknown character gracefully ("?" placeholder)
- **AvatarCard** (3.1b): full character card using primitives Card
  - Shows name, element, level/max_level, constellation, weapon (name + refine), talents
  - Uses Portrait internally
- **TeamDisplay** (3.1c): horizontal row of 1-4 Portrait components
  - Handles empty array with "No characters" message
- 23 tests passing (3 test files), typecheck clean, build succeeds
- Dependencies: `@gcsim/primitives`, `@gcsim/types`, `@gcsim/data`
- `tsconfig.json` excludes test files to avoid rootDir issues with cross-package fixture imports
- Total tests: 123 (Phase 1+2+viewer) + 23 (avatar) = 146 tests

### Storybook Stories for Phase 3 (DONE)

- Added 8 story files to `apps/storybook/src/stories/`:
  - **Avatar**: portrait (all 7 elements, 3 sizes), avatar-card (Hutao, Xingqiu, side-by-side), team-display (1-4 chars, empty)
  - **Viewer**: metadata (iterations, mode, commit, warnings), team-header, rollup-card, dps-card (proportional bars), target-info-card (single + multi-target)
- Wired `@gcsim/avatar`, `@gcsim/viewer`, `@gcsim/types` as storybook dependencies
- Added `@source` directives for Tailwind class scanning
- Fixed pre-existing tooltip.stories.tsx type inference error
- Added Storybook requirement to CLAUDE.md: all new components must have stories

### Phase 3 Workflow Change

- **Small commits + PR workflow**: agents commit after each self-contained unit, each commit must typecheck/test independently, features are PR'd into `web-rewrite` before considered done
- **Storybook mandatory**: every new React component must have a Storybook story for visual review

### Step 3.2 — `@gcsim/editor` (DONE)

- Created `packages/editor/` with CodeMirror 6 editor and custom gcsim language support
- **Lezer grammar** (3.2a): minimal token-level grammar (`@top Program { expression* }`)
  - Tokenizes numbers, strings, comments (line `//`, hash `#`, block `/* */`), identifiers, operators, punctuation
  - External specializer (`tokens.ts`) classifies identifiers as CharacterName, ActionName, StatName, ElementName via Set lookups
  - Hand-crafted from `pkg/gcs/ast/keys.go` and `pkg/shortcut/characters.go` (TODO: codegen)
  - Generated parser output renamed to `parser.ts`/`parser.terms.ts` to avoid Vite resolving `.grammar` source file
- **Language support** (3.2a): `LRLanguage` with `styleTags` mapping tokens to highlight tags
- **Autocomplete** (3.2b): context-aware `CompletionSource`
  - After `add char`/`active` → character names; after `.` → actions; after `stats` → stat names; default → all
- **Fold service**: brace-matching `foldService` (independent of parser)
- **Diagnostics**: `applyDiagnostics(view, errors)` / `clearDiagnostics(view)` for WASM validation errors
- **Dark theme**: Catppuccin Mocha-inspired `EditorView.theme` + `HighlightStyle`
  - Characters=yellow, Actions=blue, Stats=teal, Elements=pink, Keywords=purple
- **React wrapper** (3.2c): controlled `Editor` component with value/onChange, readOnly (via Compartment), errors, className
- 33 tests passing (4 test files), typecheck clean, build succeeds
- Storybook stories: Default, Empty, ReadOnly, WithErrors, Controlled
- Dependencies: `@codemirror/{view,state,language,autocomplete,lint,search,commands}`, `@lezer/{lr,common,highlight}`
- DevDependencies: `@lezer/generator` for grammar compilation
- Generated files (`parser.ts`, `parser.terms.ts`) excluded from biome linting via overrides in root `biome.json`
- Total tests: 146 (Phase 1+2+3.1+3.3) + 33 (editor) = 179 tests

### Step 3.4 — `@gcsim/viewer` Charts (DONE)

Full design spec: `docs/superpowers/specs/2026-03-20-viewer-charts-design.md`

- 13 chart components using Recharts 3.8.0 (replacing legacy Visx)
- **Shared utilities** (`src/charts/util/`): colors, format, chart-card, stat-tooltip, horizontal-bar-stack
- **Test fixture extensions** — mockSimResult extended with all chart data fields
- **Chart components:**
  - `damage-timeline` — ComposedChart with Line + Area for SD band
  - `cumulative-damage` — AreaChart with 5 quartile bands
  - `distribution-chart` — BarChart histogram with mean ReferenceLine
  - `element-dps-chart` — HorizontalBarStack per-character element breakdown
  - `character-dps-pie` — PieChart character DPS proportions
  - `element-dps-pie` — PieChart element DPS proportions
  - `source-dps-chart` — HorizontalBarStack by damage source
  - `character-actions-chart` — HorizontalBarStack by action type
  - `reactions-chart` — HorizontalBarStack by reaction type
  - `energy-chart` — HorizontalBarStack by energy source
  - `ending-energy-chart` — BarChart single horizontal bars per character
  - `field-time-chart` — PieChart field time proportions
  - `target-aura-uptime-chart` — BarChart with element-colored bars
- **Barrel exports**: `src/charts/index.ts` re-exports all charts; `src/index.ts` re-exports via `export *`
- **CLAUDE.md** updated with chart patterns, canonical examples, Recharts v3 notes
- **13 Storybook stories** with Default + NoData variants each
- 221 tests passing (23 suites), typecheck clean, build clean, storybook builds
- Recharts v3 key learnings: custom tooltips as function refs, ValueType/NameType from recharts/types, SD band via dual Areas

### Step 3.5 — `@gcsim/viewer` Sample Viewer (DONE)

- Built on top of the events abstraction layer (types, transformer, post-processors, display-config, filter-presets)
- **SeedSelector** (3.5a): dropdown for seed mode (sample/min/max/p25/p50/p75/custom) + generate button
  - Resolves seed from `SimResults.statistics` or custom input
  - Disables when no seed available or when loading
- **EventLog** (3.5b): grid display of events grouped by frame
  - Header row with "Frame | Sim | char1 | char2 | ..." columns
  - Filter presets (simple/advanced/verbose/debug) via dropdown
  - Text search across event messages
  - Event items with colored type badges
  - Active character column highlighted
  - Empty state when no events match
- **SampleViewer** (3.5c): composition component
  - Wires SeedSelector + EventLog + sample loading state machine (idle/loading/error/loaded)
  - Transforms raw logs through the events pipeline (transformEvents → resolveStatusDurations → trackActiveCharacter → groupByFrame)
  - Loading spinner, error display, and event log rendering
- 20 new tests (6 seed-selector + 9 event-log + 5 sample-viewer)
- `tsconfig.json` updated to exclude test files (needed for cross-package fixture imports)
- Total viewer tests: 282 (30 test files)

### Step 3.6 — `@gcsim/preview` (DONE)

- Created `packages/preview/` with compact preview card component
- **PreviewCard**: summary card for Discord embeds and DB entries
  - Team portraits via `@gcsim/avatar` TeamDisplay
  - Metadata badges: DPS, iterations, mode, modified status, warnings
  - Per-character DPS breakdown with proportional bars
  - `#images_loaded` signal for headless capture (Puppeteer)
  - Handles missing optional data gracefully
- 11 tests passing (1 test file), typecheck clean, build succeeds
- Dependencies: `@gcsim/primitives`, `@gcsim/types`, `@gcsim/avatar`

### Phase 3 Gate (PASSED)

**Pipeline checks:** All pass — biome clean, typecheck (19/19), tests (18/18), build (11/11), dep-cruiser clean.

**Package reviews completed** (4 parallel `package-reviewer` agents):
- **avatar:** PASS after fixing deep import in `tooling/test-fixtures/characters.ts` (was importing from `@gcsim/types/src/sim.js` instead of package index)
- **editor:** PASS after fixing mount useEffect dep array (`[readOnly, value]` → `[]`), replacing vacuous onChange test, upgrading diagnostics tests to assert actual diagnostic counts, improving readOnly test
- **viewer:** PASS after fixing Recharts tooltip pattern (JSX element → function ref), replacing hardcoded colors (`bg-white dark:bg-gray-900` → `bg-popover text-popover-foreground`, `text-red-500` → `text-destructive`), removing redundant double-filter in EventLog
- **preview:** PASS after strengthening shallow test assertions (team section verifies portrait initials, DPS breakdown verifies character name + formatted value), adding onImageLoaded callback test

**Storybook typecheck fixes** (gate-time): added type annotations to chart story mock data (`SourceStats[]`, `ElementStats[]`), added missing Character fields to preview/sample-viewer stories, fixed editor meta inference issue, replaced array index keys.

- Total tests: ~440 (exact count may vary after test additions/removals from review fixes)
- All packages: biome clean, typecheck clean, tests pass, build succeeds
- All branches merged into `web-rewrite`

## Phase 4: Web App (gcsim.app)

| Step | Status | Description |
|------|--------|-------------|
| 4.1 | DONE | `@gcsim/web` app shell |
| 4.2 | DONE | Dash (home) page |
| 4.3a | DONE | Executor wiring |
| 4.3b | DONE | Config editor panel |
| 4.3c | DONE | Team builder panel |
| 4.3d | DONE | Action list editor |
| 4.3e | DONE | Run controls + simulator composition |
| 4.4a | DONE | Viewer shell + data loading |
| 4.4b | DONE | Results tab |
| 4.4c | DONE | Config tab |
| 4.4d | DONE | Sample tab |
| 4.5 | DONE | Sample upload/local pages |
| 4.6 | DONE | Legacy redirects |

### Step 4.1 — `@gcsim/web` App Shell (DONE)

- Created `apps/web/` — main web application shell
- **Build config**: Vite 8 + React plugin + Tailwind v4 Vite plugin, vitest with jsdom
- **CSS**: Inlined theme tokens from `@gcsim/primitives/theme.css` (same pattern as storybook)
  - Added `shadcn`, `tw-animate-css` as devDependencies for CSS imports
  - `@source` directives for primitives, avatar, viewer, editor, preview
- **Entry point** (`main.tsx`): React Query provider, TanStack Router provider, i18n init
- **TanStack Router** (`routes.tsx`): code-based route tree with 7 routes
  - All pages lazy-loaded via `.lazy()` + `createLazyRoute()` for code splitting
  - Routes: `/` (Dash), `/simulator`, `/web`, `/local`, `/sh/$id`, `/sample/upload`, `/sample/local`
  - Root route renders layout with Nav + Outlet + Footer wrapped in ErrorBoundary
- **Layout components**: Nav (responsive with hamburger menu), Footer, ErrorBoundary (class component)
- **Zustand stores** (3):
  - `simulator-store` — persisted (`gcsim-simulator`): config, team, validation, execution mode, workers, server URL
  - `viewer-store` — not persisted: results, active tab, error, recovery config
  - `settings-store` — persisted (`gcsim-settings`): language
- **Page stubs**: 7 minimal stub components (render page name heading only)
- 18 tests passing (3 store test files), typecheck clean, build succeeds
- Build produces 7 lazy-loaded chunks + 1 main bundle
- Dependencies: all `@gcsim/*` workspace packages, `@tanstack/react-query@5.91.2`, `@tanstack/react-router@1.167.5`, `zustand@5.0.12`

### Step 4.2 — Dash (Home) Page (DONE)

- Landing page with hero section ("gcsim" title + description)
- 3 quick action cards: Simulator (internal link), Teams DB (external), Documentation (external)
- Uses primitives Card components, TanStack Router Link for internal navigation
- 6 tests passing

### Step 4.3a — Executor Wiring (DONE)

- `ExecutorProvider` React context provides `Executor` instance to the app
- Creates `ServerExecutor` or `WasmExecutor` based on `useSimulatorStore` state
- `useExecutor()` hook for consuming the executor
- `ExecutorSettings` UI: mode selector (WASM/Server), worker count slider (1-30), server URL input
- Wired into `main.tsx` wrapping the router
- 6 tests passing

### Step 4.3b — Config Editor Panel (DONE)

- `ConfigEditor` component using `@gcsim/editor` Editor
- Wired to `simulatorStore.config` for read/write
- Displays validation errors from `simulatorStore.validationResult`
- 5 tests passing

### Step 4.3c — Team Builder Panel (DONE)

- Character picker using `@gcsim/data` latestChars + `@gcsim/primitives` Select
- Team display using `@gcsim/avatar` TeamDisplay
- Add (max 4) and remove character functionality
- Creates minimal `Sim.Character` objects for new characters
- 4 tests passing

### Step 4.3d — Action List Editor (DONE)

- `ActionEditor` using `@gcsim/editor` Editor wired to store config
- Read-only toggle button
- 6 tests passing

### Step 4.3e — Run Controls + Simulator Composition (DONE)

- `RunControls` component with Run/Cancel buttons, ready indicator, error display
- On completion: populates `viewerStore.setResults()` and navigates to `/web`
- `Simulator` page composes: ConfigEditor, ActionEditor, TeamBuilder, ExecutorSettings, RunControls
- Grid layout: left 2/3 (config + actions), right 1/3 (team + settings + run)
- 13 tests passing (5 run-controls + 8 simulator)

### Step 4.4a — Viewer Shell + Data Loading (DONE)

- `ViewerShell` shared layout with Results/Config/Sample tabs
- Loading, error, and empty states
- `WebViewer` loads from `viewerStore` (local state)
- `LocalViewer` loads from local dev server via TanStack Query
- `ShareViewer` loads from `/api/share/:id` via TanStack Query with route param
- 8 tests passing

### Step 4.4b — Results Tab (DONE)

- Composes all `@gcsim/viewer` components: metadata, team header, rollup cards, DPS cards, target info, 13 charts
- `ChartErrorBoundary` wraps each chart for resilience
- Responsive grid layout for charts (2-column on large screens)
- 6 tests passing

### Step 4.4c — Config Tab (DONE)

- Read-only CodeMirror editor showing `results.config_file`
- "Edit" toggle switches to editable mode with "Re-run" button
- 5 tests passing

### Step 4.4d — Sample Tab (DONE)

- Wraps `SampleViewer` from `@gcsim/viewer`
- Wires `executor.sample()` as `onRequestSample` callback
- 2 tests passing

### Step 4.5 — Sample Upload/Local Pages (DONE)

- Upload page: file input for JSON upload, parses as Sample, displays EventLog
- Local page: fetches from local dev server via TanStack Query, displays in SampleViewer
- 4 tests passing

### Step 4.6 — Legacy Redirects (DONE)

- 8 redirect routes using TanStack Router's `beforeLoad` + `throw redirect()`
- `/v3/viewer/share/$id`, `/viewer/share/$id`, `/s/$id` → `/sh/$id`
- `/viewer/web` → `/web`, `/viewer/local` → `/local`
- `/simple`, `/advanced` → `/simulator`, `/viewer` → `/web`
- 9 tests passing

### Build Fix — Executor Worker Resolution

- Added Vite resolve alias in `vite.config.ts` to redirect executor worker `.ts` files from `dist/workers/` to `src/workers/`
- Workers are excluded from tsc build but referenced via `new URL(..., import.meta.url)` pattern
- Added `worker: { format: "es" }` for ES module worker bundling

### Phase 4 Summary

- Total web app tests: 92 (21 test files)
- Full monorepo: 22 typecheck tasks pass, 21 test tasks pass
- Production build succeeds with lazy-loaded code splitting
- All Phase 4 steps complete

### Phase 3b-i (ui-next redesign — viewer rollup/dps/metadata/chart-shell) — DONE

Implements `docs/design_handoff_ui_next/README.md` § Phase 3b parts 1–4
and `docs/design_handoff_ui_next/docs/component-inventory.md` L207–262.

New components in `@gcsim/viewer`:

- **`DetailedMetricTile`** (`src/rollup/detailed-metric-tile.tsx`) —
  replaces `RollupCard`. 4px tone-colored left bar, large mono value
  (38px / 500 / -0.03em), 3x2 stats grid `min·max·std` / `p25·p50·p75`.
  Supports 8 tones (`accent` + 7 elements).
- **`formatSummaryStat`** (`src/rollup/format.ts`) — helper that maps
  `Sim.SummaryStat` (`mean/sd/min/max/q1/q2/q3`) to the pre-formatted
  strings the tile expects. `q1/q2/q3` → `p25/p50/p75`.
- **`DPSCard`** (`src/dps-card/dps-card.tsx`) — reworked, **breaking
  API change**. New props: `char: string | Sim.Character`, `dps`,
  `share`, `mean`, `std`, optional `role`. Renders a 44px `Portrait`,
  name + role, headline mono DPS, element-colored contribution bar
  (`share * 100%`), and a `μ {mean} · σ {std}` meta line. Moved from
  `src/result-cards/` to its own folder.
- **`MetadataChip`** (`src/metadata/metadata-chip.tsx`) — inline pill
  used by the metadata strip. Mono uppercase label + value, with
  `mono` toggle for tabular monospace values and `tone` of
  `neutral|accent|info`.
- **`ChartShell`** (`src/chart-shell/chart-shell.tsx`) — successor to
  `ChartCard`. Title + subtitle + badge slot + action slot + bordered
  footer slot. Empty state + custom height. Existing 13 charts continue
  to use `ChartCard`; migration is Phase 3b-ii (Recharts skinning).

Apps/consumers:

- `apps/web/src/pages/viewer/results-tab.tsx` migrated:
  - 6× `<RollupCard>` → `<DetailedMetricTile>` with per-stat tone
    mapping (DPS=pyro, EPS=cryo, RPS=electro, HPS=anemo, SHP=geo,
    Duration=dendro). Built `buildRollups()` helper + uses
    `formatSummaryStat()`.
  - `<DPSCard>` switched to new props: `char` (full `Sim.Character`),
    `dps`/`mean` (per-char mean), `std`, `share = mean / totalDps`.
  - Metadata strip now renders 4× `<MetadataChip>` (`iter`, `mode`,
    `ver`, `build`) instead of `<Iterations>/<Mode>/<Commit>`.
- 13 charts + `<TargetInfoCard>` left untouched (Phase 3b-ii).

Deletions:
- `packages/viewer/src/result-cards/rollup-card.tsx` (+ test)
- `apps/storybook/src/stories/rollup-card.stories.tsx`
- `packages/viewer/src/result-cards/dps-card.tsx` (+ test) — replaced
  by `src/dps-card/dps-card.tsx`.

Dependencies:
- `@gcsim/viewer` now depends on `@gcsim/avatar` (for `Portrait`).

Storybook stories added:
- `metadata-chip.stories.tsx` (4 tones + composed strip)
- `chart-shell.stories.tsx` (default, subtitle, badge+action, footer,
  empty, custom height)
- `detailed-metric-tile.stories.tsx` (8 tones + unit + grid)
- `dps-card.stories.tsx` updated for new API (TeamGrid uses real
  `Sim.Character` objects with elements).

Verification:
- `pnpm --filter @gcsim/viewer test` — 322 passing (33 files).
- `pnpm --filter @gcsim/viewer typecheck` — clean.
- `pnpm --filter @gcsim/viewer build` — clean.
- `pnpm --filter @gcsim/web typecheck` — clean.
- `pnpm --filter @gcsim/web test` — 92 passing.
- `pnpm --filter @gcsim/storybook build` — clean.
- `npx biome check --write packages/viewer/ apps/storybook/src/stories/
  apps/web/src/pages/viewer/results-tab.tsx` — clean (139 files).

TODOs left for Phase 3b-ii:
- Migrate all 13 chart components from `ChartCard` → `ChartShell` and
  apply Recharts skinning (grid/axis/tooltip tokens). `ChartCard`
  carries a TODO marker pointing at this.
- Add `FieldTimeBar` + `FrameTrack`.
- Legacy `Iterations`/`Mode`/`Commit` components remain exported for
  backwards compat; results-tab no longer uses them. Decide whether to
  keep them or remove in 3b-ii.

### Phase 3b-ii (Recharts skinning + FieldTimeBar + FrameTrack) — DONE

Implements `docs/design_handoff_ui_next/README.md` § Phase 3b parts 5–7.

**Colors (`charts/util/colors.ts`)** — replaced hex palette with CSS
custom-property references. `elementColor`, `actionColor`,
`reactionColor`, and `characterColor` all return `var(--el-*)` strings
(or `var(--el-physical)` as fallback). Action/reaction → element
mappings documented inline. Recharts forwards CSS-var strings straight
into SVG `stroke`/`fill`, so the browser resolves the tokens at render
time — no `getComputedStyle` round-trip required.

**Chart skinning (13 charts)** — every chart was migrated from
`ChartCard` to `ChartShell` from `src/chart-shell/`. CartesianGrid now
strokes `--line-1`; axis ticks use `--fg-2` + `--font-mono`; tooltips
use `--bg-2` / `--line-2` / `--fg-1`. New `ChartTooltipShell` utility
in `charts/util/` encapsulates the shared surface; both the existing
`StatTooltip` and the per-chart custom tooltips use it (or its
contentStyle equivalent for Recharts default tooltip). Chart-specific
hardcoded `#xxxxxx` series colors were replaced with `var(--accent)`,
`var(--el-pyro)`, etc.

`ChartCard` is kept exported with an `@deprecated` marker; downstream
callers can migrate at their own pace. Chart tests updated to the
`chart-shell-*` testids; the `chart-card.test.tsx` retains the legacy
testids since `ChartCard` still ships them.

**`FieldTimeBar`** (new at `charts/field-time-bar/`) — horizontal
stacked-flex bar with one segment per character; widths are integer
percentages summing to exactly 100 (drift absorbed by the largest
segment), and each segment is filled with `elementColor(element)` plus
labeled "Name N%". Exported from `@gcsim/viewer`. Supplements (does
not replace) `FieldTimeChart`. 12 tests; Storybook story w/ 5
variants.

**`FrameTrack`** (new at `sample/frame-track/`) — SVG timeline ribbon
for the sample viewer: 4 character lanes stacked vertically; events
placed at `start/frames` × `length/frames` (percentage-based); a
vertical `--accent` cursor line marks the current frame; clicks
anywhere on the surface dispatch `onCursorChange(frame)`. Event tiles
carry `data-row` and `data-element` for headless testability. 10 tests
(including ratio-math against a mocked `getBoundingClientRect`);
Storybook story w/ Default, Empty, TallTrack, and Interactive.

Verification:
- `pnpm --filter @gcsim/viewer test` — 346 tests pass across 35 files
  (up from 324 before this phase: +22 = 12 FieldTimeBar + 10
  FrameTrack).
- `pnpm --filter @gcsim/viewer typecheck` — clean.
- `pnpm --filter @gcsim/web typecheck` — clean.
- `pnpm --filter @gcsim/web test` — 92 tests pass.
- `pnpm --filter @gcsim/storybook build` — clean.
- `npx biome check packages/viewer/ apps/storybook/src/stories/` — clean.

TODOs left for downstream phases:
- Phase 6 (results-tab layout) will compose `FieldTimeBar`,
  `DetailedMetricTile`, and the skinned charts into the new grid.
- `ChartCard` can be deleted once no downstream apps consume it.
- `FrameTrack` lacks keyboard scrubbing (left/right arrow keys);
  intentionally deferred — the biome `noStaticElementInteractions`
  suppression notes this. Pick this up when the sample-viewer wiring
  lands.

### Phase 3c (ui-next redesign — @gcsim/editor gcsim-dark theme + chrome) — DONE

Implements `docs/design_handoff_ui_next/README.md` § Phase 3c and
`docs/design_handoff_ui_next/docs/component-inventory.md` L299–316.

**Theme (`packages/editor/src/theme/dark-theme.ts`)** — replaced
Catppuccin Mocha hex codes with `var(--*)` references into the
ui-next design system. JSDoc at the top of the file documents the
mapping (background → `--bg-0`, gutter → `--fg-3` / `--line-1`, caret
+ selection → `--accent` / `--accent-soft`, search match →
`--warn-soft`, tooltip → `--bg-2` / `--line-2`, fold placeholder →
`--bg-2` / `--fg-2`). HighlightStyle: comments → `--fg-3` italic,
keywords → `--accent`, strings → `--el-dendro`, numbers/booleans →
`--el-geo`, identifiers → `--el-electro`, functions → `--brand-blue-2`,
character class names → `--el-pyro`, stat attribute names →
`--el-hydro`, element atoms → `--el-anemo`, punctuation → `--fg-3`.
Content font set via `var(--font-mono)`.

**Editor component** — added `fontSize` (default 14, applied via a
CodeMirror Compartment so the theme-injected font-size rule reconfigures
live) + `onFontSizeChange` + `theme` (only `'gcsim-dark'` ships). Added
optional chrome props: `showChrome` (default `false` keeps existing
behaviour), `tabs`, `activeTab`, `onTabChange`, `onFormat`,
`parseStatus`, `optionsBadges`. When `showChrome` is true the
CodeMirror surface is wrapped in a `<Card>` with:

- header: `<Tabs variant="pill" size="sm">` + NumberStepper (12–20px,
  step 1, suffix `px`) + theme `<Select>` + Format `<Button>`
- footer: `<StatusPill>` (mapped via `ok→ready`, `parsing→running`,
  `error→failed`, `idle→idle`) + monospace line count + cursor pos
  (`Ln N, Col N`) + right-aligned `optionsBadges` slot

Line count + cursor position track the existing single `EditorView`
via the same `updateListener` (no second editor instance). Re-exported
`EditorParseStatus` and `EditorTab` from the package index.

Added `@gcsim/primitives` as a workspace dep on `@gcsim/editor` so the
chrome shell can reuse Phase 2 primitives.

**Tests** — added `theme/__tests__/dark-theme.test.ts` (5 tests
asserting extensions compose, the runtime stylesheet uses the
`var(--*)` tokens, and the source contains no hex codes outside
comments). Extended `components/__tests__/editor.test.tsx` to cover the
fontSize prop (default + custom + rerender) and chrome (no-chrome
default, shell rendering, tabs list, tab activation, Format button +
disabled state, parse-status pill, line count, cursor pos,
optionsBadges, fontSize stepper). Editor tests: 32 → 54 (+22).

**Storybook** — extended `apps/storybook/src/stories/editor.stories.tsx`
with `WithChrome` (controlled, full chrome composition) plus four
`ChromeParseStatus*` stories covering ok/parsing/error/idle.

**CLAUDE.md** — updated `packages/editor/CLAUDE.md` Public API to list
the new optional chrome props, the new `fontSize` prop, the new
exported types, and the design-system-token theme contract.

Verification:
- `pnpm --filter @gcsim/editor test` — 54 tests pass (up from 32).
- `pnpm --filter @gcsim/editor typecheck` — clean.
- `pnpm --filter @gcsim/web typecheck` — clean.
- `pnpm --filter @gcsim/web test` — 92 tests pass (no regressions).
- `pnpm --filter @gcsim/storybook build` — clean.
- `npx biome check packages/editor/ apps/storybook/src/stories/editor.stories.tsx` — clean.

### Phase 5 (ui-next redesign — Simulator rework) — DONE

Implements `docs/design_handoff_ui_next/README.md` § Phase 5.

**Step 1 — `useParsedTeam` real wiring (`@gcsim/preview`)**
- Replaced the Phase 3d stub with a `useQuery`-backed hook that accepts
  an externally supplied `validateFn: (config) => Promise<Sim.ParsedResult>`
  and a config string. Returns `{ team: Sim.Character[]; errors: string[]; isLoading }`.
- Mapper: `ParsedCharacterProfile -> Sim.Character` pulls `name/level/element/
  max_level/cons` from `profile.base`, `weapon`/`talents`/`sets`/`stats`
  directly off the profile, and emits `snapshot: []` (parser doesn't compute it).
- Added `@tanstack/react-query` as a peer dependency (consumer apps already
  provide a `QueryClientProvider`). Keeping `validateFn` as an injected
  dependency means `@gcsim/preview` stays free of any executor runtime.
- 5 tests for the hook (loading, empty config skip, success mapping,
  validate-rejection error path, parser-returned errors).
- `packages/preview/CLAUDE.md` Public API updated to match the new shape.

**Step 2 — `simulator.tsx` rebuilt**
- New page composition: team-preview section (4 `CharacterCard`s or
  `CharacterCardEmpty` slots) + editor section (`<Editor showChrome>` with
  Action list / Config / Preview tabs) + sticky bottom action bar
  (Settings · WASM status pill · `untitled.gcsl` · Tools · seed input · Run).
- Run replicates the old `run-controls.tsx` behaviour:
  `executor.run(config, setResults)` → `navigate({ to: "/web" })`.
- Settings dialog reuses `<ExecutorSettings />` (no duplicate form).
- Tools dialog ships with Enka / GOOD tab stubs (placeholder bodies).
- Editor font-size persists via local state (no store change).
- `useParsedTeam` is fed `executor.validate.bind(executor)` from the
  `useExecutor()` context.

**Step 3 — deleted obsolete sub-components**
- `apps/web/src/pages/simulator/{team-builder,config-editor,action-editor,run-controls}.tsx`
  and their `.test.tsx` siblings are gone. The barrel `index.ts` already
  only exported `Simulator`, no change needed.

**TODOs left in code**
- `TODO(phase 5 follow-up): wire Enka/GOOD import flows` — Tools dialog bodies
- `TODO(phase 5 follow-up): wire Preview tab to @gcsim/preview` — Preview tab body
- `TODO(phase 5 follow-up): real "options" badges (iter/duration/workers) from parsed config` — editor footer

**Verification**
- `pnpm --filter @gcsim/preview test` — 19 tests pass (was 3).
- `pnpm --filter @gcsim/preview typecheck` — clean.
- `pnpm --filter @gcsim/web test` — 75 tests pass (down from 95 because the
  4 deleted children removed 25 tests, the new `simulator.test.tsx` added
  8 covering the new structure).
- `pnpm --filter @gcsim/web typecheck` — clean.
- `pnpm --filter @gcsim/web build` — clean.
- `npx biome check apps/web/src/pages/simulator/ packages/preview/` — clean.
