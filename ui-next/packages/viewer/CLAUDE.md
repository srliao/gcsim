# @gcsim/viewer

## Purpose

Presentational components for displaying gcsim simulation results. Renders metadata, team composition, statistical rollups, and charts from `Sim.SimResults` data. Components are pure (no data fetching) and composable -- apps wire them together with real data in Phase 4.

## How to add a new component

1. Create a directory under `src/` (kebab-case, e.g. `src/my-component/`)
2. Add `my-component.tsx` with the component, typed with `Sim.*` props from `@gcsim/types`
3. Add `my-component.test.tsx` with `@testing-library/react` tests
4. Add `index.ts` barrel export
5. Re-export from `src/charts/index.ts` (for charts) or `src/index.ts` (for other components)
6. Run `npx biome check --write packages/viewer/`
7. Run `turbo run typecheck test --filter=@gcsim/viewer`

## How to add a new chart

Follow `src/charts/damage-timeline/` as the canonical chart example. Key patterns:

1. **Create directory** `src/charts/<chart-name>/` with 3 files
2. **Props interface** typed with `Sim.*` from `@gcsim/types`, allow `undefined` for optional data
3. **Export a transform function** (e.g. `transformBuckets`) that converts `Sim.*` types to flat Recharts-friendly arrays -- test this separately
4. **Wrap in `ChartCard`** from `../util/chart-card.js` -- handles title, empty state, height
5. **Empty state**: pass `null` as ChartCard children when data is missing
6. **Use shared utils**: `characterColor`, `elementColor`, `actionColor` for colors; `formatDamage` for axis ticks
7. **`data-testid`** on the outer wrapper div
8. **Re-export** from `src/charts/index.ts`

Chart type patterns:
- **HorizontalBarStack** (8 charts use this): `element-dps-chart` is the canonical example
- **PieChart**: `field-time-chart` is the canonical example
- **LineChart/ComposedChart**: `damage-timeline` is the canonical example
- **Histogram BarChart**: `distribution-chart` is the canonical example
- **Single horizontal bars**: `ending-energy-chart` (uses BarChart + Cell, not HorizontalBarStack)

## Canonical examples

- `src/result-cards/dps-card.tsx` -- non-chart component pattern (Card + typed props + data-testid)
- `src/charts/damage-timeline/` -- chart component pattern (ChartCard + transform function + Recharts)

## Public API

All exports go through `src/index.ts` → `src/charts/index.ts`:

**Non-chart components:**
- **Metadata:** `Iterations`, `Mode`, `Commit`, `Warnings`
- **TeamHeader** -- character card row
- **RollupCard** -- stat rollup (mean/min/max/SD)
- **DPSCard** -- per-character DPS with proportional bar
- **TargetInfoCard** -- enemy info display

**Chart components (13 total):**
- `DamageTimeline`, `CumulativeDamage`, `DistributionChart` -- time series / histogram
- `ElementDpsChart`, `CharacterDpsPie`, `ElementDpsPie`, `SourceDpsChart` -- DPS breakdowns
- `CharacterActionsChart`, `ReactionsChart` -- activity charts
- `EnergyChart`, `EndingEnergyChart`, `FieldTimeChart` -- energy / field time
- `TargetAuraUptimeChart` -- aura uptime

**Chart utilities:** `ChartCard`, `HorizontalBarStack`, `StatTooltip`, color functions, format functions

### Events (event log abstraction layer)

- `transformEvents(logs: LogDetails[]): SimEvent[]` — transforms raw logs to typed events
- `resolveStatusDurations(events): SimEvent[]` — resolves status added/expired pairs
- `trackActiveCharacter(events): Map<number, number>` — frame→characterIndex swap map
- `groupByFrame(events, activeMap, teamSize): FrameGroup[]` — groups events for grid display
- `getEventDisplay(type): EventDisplayConfig` — color/icon/label lookup
- `filterPresets` — simple/advanced/verbose/debug filter preset arrays
- `SimEvent`, `FrameGroup`, and all typed event interfaces — discriminated union types

### Sample Viewer

- `SeedSelector` — dropdown for seed mode (sample/min/max/p25/p50/p75/custom) + generate button
- `EventLog` — grid display of events grouped by frame with filter presets and text search
- `SampleViewer` — composition component wiring SeedSelector + EventLog + sample loading state

## Dependencies

- `@gcsim/primitives` -- Card, Badge, cn() utility
- `@gcsim/types` -- `Sim.*` interfaces for all props
- `@gcsim/i18n` -- internationalization (for future use)
- `recharts` -- charting library (v3.8.0)

### Recharts v3 notes

- Custom tooltips: pass as function reference (`content={MyTooltip}`), NOT JSX element
- Tooltip types: `TooltipContentProps<ValueType, NameType>` from `recharts`, with `ValueType`/`NameType` from `recharts/types/component/DefaultTooltipContent`
- Recharts doesn't render SVG in jsdom -- test transform functions separately, test component renders without crashing

## Don'ts

- Don't fetch data in components -- they are purely presentational
- Don't import from other packages' `src/` -- only from their package index
- Don't test visual appearance -- test content rendering and behavior
- Don't use `@/` path aliases in source files -- use relative imports (aliases don't work in library builds)
- Don't add app-specific logic -- apps compose these components in Phase 4
