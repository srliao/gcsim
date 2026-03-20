# Phase 3.4 — Viewer Charts Design Spec

## Overview

Port all 13 chart types from the legacy UI (`ui/packages/ui/src/Pages/Viewer/Components/`) into `packages/viewer/src/charts/` using Recharts (replacing legacy Visx). All charts are pure presentational components — no data fetching, typed with `Sim.*` props from `@gcsim/types`.

**Scope note:** The main spec (Step 3.4a-g) lists 7 charts. This design adds 6 more that exist in the legacy UI and are needed for feature parity: character-dps-pie (#5), element-dps-pie (#6), source-dps-chart (#7), character-actions-chart (#8), ending-energy-chart (#11), target-aura-uptime-chart (#13).

## Key Decision: Visx → Recharts Migration

The legacy UI uses @visx (low-level SVG primitives). The rewrite uses Recharts (declarative React chart components) per the tech stack spec. This is a full reimplementation, not a port. Recharts provides `ResponsiveContainer`, built-in tooltips, legends, and axes out of the box — reducing custom SVG code significantly.

**Fallback rule:** If any chart cannot be cleanly implemented in Recharts, fall back to raw SVG. Document the fallback in CLAUDE.md.

## Shared Infrastructure (`charts/util/`)

### `colors.ts` — Color Mapping System

Replaces legacy `DataColors.tsx`. Provides consistent color assignments.

```typescript
// Fixed qualitative palette (10 colors) for character slots
export function characterColor(index: number): string;

// Genshin element colors (pyro=#EF4444, hydro=#3B82F6, electro=#A855F7, etc.)
export function elementColor(element: string): string;

// Action type colors (normal, charged, skill, burst, dash, jump, swap, walk)
export function actionColor(action: string): string;

// Reaction colors (vaporize, melt, overload, etc.)
export function reactionColor(reaction: string): string;
```

### `format.ts` — Number Formatting

```typescript
// Compact damage notation: 50250 → "50.2K", 1500000 → "1.5M"
export function formatDamage(n: number): string;

// Percentage: 0.653 → "65%"
export function formatPercent(n: number): string;

// Frame-to-seconds: (bucket_index, bucket_size) → "2.5s"
export function formatDuration(frames: number, bucketSize: number): string;

// Stat summary: FloatStat → "50,250 (±4,200)"
export function formatStat(stat: Sim.FloatStat): string;
```

### `chart-card.tsx` — Standard Chart Wrapper

Card container with:
- `CardHeader` + `CardTitle` with optional dropdown selector (for charts with modes)
- `ResponsiveContainer` wrapper with configurable height (default 300px)
- Empty state: renders "No data available" when data is missing/empty
- `className` prop for Tailwind customization

```typescript
export interface ChartCardProps {
  title: string;
  children: React.ReactNode;
  height?: number;             // default 300
  selector?: React.ReactNode;  // optional dropdown in header
  className?: string;
}
```

### `stat-tooltip.tsx` — Reusable Tooltip

Custom Recharts tooltip content showing FloatStat details: mean, min, max, SD.

```typescript
export interface StatTooltipProps {
  label?: string;
  stats?: Record<string, Sim.FloatStat>;
}
```

> **TODO (future):** Implement box-plot hover overlay for richer stat display on bar charts.

### `horizontal-bar-stack.tsx` — Generic Horizontal Stacked Bar

8 of 13 charts are horizontal stacked bars. This generic wrapper avoids repetition.

```typescript
// Row must have a string name field + numeric values for each key
export interface HorizontalBarStackProps<Row extends Record<string, string | number>> {
  data: Row[];
  keys: string[];
  nameKey: string;             // field in Row used for Y-axis labels
  colorFn: (key: string) => string;
  height?: number;             // default: data.length * 40
  xTickFormatter?: (value: number) => string;
  tooltipContent?: React.ReactNode;
}
```

Implementation pattern:
```tsx
<ResponsiveContainer width="100%" height={height}>
  <BarChart data={data} layout="vertical">
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis type="number" tickFormatter={xTickFormatter} />
    <YAxis type="category" dataKey={nameKey} width={120} />
    <Tooltip content={tooltipContent ?? <StatTooltip />} />
    <Legend />
    {keys.map(key => (
      <Bar key={key} dataKey={key} stackId="stack" fill={colorFn(key)} />
    ))}
  </BarChart>
</ResponsiveContainer>
```

## Chart Components (13 total)

### Group A: Damage Charts

#### 1. `damage-timeline` (Step 3.4a — Canonical Example)

- **Recharts type:** `LineChart` with 5 `Line` series + 1 `Area` for SD band
- **Props:** `buckets: Sim.BucketStats`
- **Visual:** X-axis = time in seconds (derived from bucket_size). 5 lines: min, max, mean, mean+sd, mean-sd. Shaded band between SD bounds using `Area` with gradient fill.
- **Tooltip:** Shows all 5 values at hovered time bucket
- **Data transform:** `buckets.buckets[]` (FloatStat per bucket) → flat array `[{ time, min, max, mean, sdUpper, sdLower }]` where `sdUpper = mean + sd` and `sdLower = mean - sd` (computed, not from source data)
- **Tests:** Renders with sample data, correct number of Line components, tooltip content

#### 2. `cumulative-damage` (Step 3.4b)

- **Recharts type:** `AreaChart` with 5 `Area` series for quartile bands
- **Props:** `data: Sim.TargetBucketStats`, `targetId?: string` (defaults to first target), `characterNames?: string[]`
- **Visual:** 5 lines: min, q1, q2 (median), q3, max. Shaded quartile bands (gradient between q1-q3). X-axis = time.
- **Data transform:** `data.targets[targetId].overall` → flat array `[{ time, min, q1, q2, q3, max }]`. Component selects target via `targetId` prop (defaults to first available key).
- **Tests:** Renders, values accumulate correctly

#### 3. `distribution-chart` (Step 3.4c)

- **Recharts type:** `BarChart` (vertical bars = histogram)
- **Props:** `stat: Sim.SummaryStat`, `label: string`, `accentColor?: string`
- **Visual:** Histogram bars from `stat.histogram`. Vertical `ReferenceLine` at mean value. Color varies by metric.
- **Data transform:** `stat.histogram` → `[{ bucket: "35K-40K", count: 50 }, ...]` with bucket ranges derived from `stat.min`/`stat.max`
- **No box-plot** — histogram only for now.
- **Tests:** Renders bars, correct bucket count from data, mean reference line present

#### 4. `element-dps-chart` (Step 3.4d) — Per-character element breakdown

- **Recharts type:** `HorizontalBarStack` wrapper
- **Props:** `data: Sim.ElementStats[]`, `characterNames: string[]`
- **Visual:** Horizontal stacked bars. Rows = characters. Stacked by element, colored by element type. (Differs from `element-dps-pie` which shows aggregate team-wide element split.)
- **Data transform:** `ElementStats[]` → `[{ name: "Hu Tao", pyro: 35100, hydro: 0, ... }]`
- **Tests:** Renders elements with correct colors per element type

#### 5. `character-dps-pie`

- **Recharts type:** `PieChart` with `Pie` + `Cell` per character
- **Props:** `characterDps: Sim.FloatStat[]`, `characterNames: string[]`
- **Visual:** Pie chart with outer labels (character name + percentage). Character colors from `characterColor(index)`.
- **Data transform:** `FloatStat[]` → `[{ name, value: mean, pct }]`
- **Tests:** Renders all characters, percentages sum to ~100%

#### 6. `element-dps-pie` — Aggregate team-wide element split

- **Recharts type:** `PieChart` with `Pie` + `Cell` per element
- **Props:** `elementDps: Sim.ElementDPS`
- **Visual:** Pie colored by element type with labels. (Differs from `element-dps-chart` which shows per-character element breakdown.)
- **Data transform:** `{ pyro: FloatStat, hydro: FloatStat }` → `[{ name: "Pyro", value: mean, color }]`
- **Tests:** Renders all elements present in data

#### 7. `source-dps-chart`

- **Recharts type:** `HorizontalBarStack` wrapper
- **Props:** `data: Sim.SourceStats[]`, `characterNames: string[]`
- **Visual:** Horizontal stacked bars. Rows = damage sources (normal, skill, burst, etc.). Stacked by character.
- **Data transform:** `SourceStats[]` → `[{ name: "Normal Attack", char0: 5000, char1: 3000 }]`
- **Tests:** Renders source rows, character colors correct

### Group B: Character Activity Charts

#### 8. `character-actions-chart`

- **Recharts type:** `HorizontalBarStack` wrapper
- **Props:** `data: Sim.SourceStats[]`, `characterNames: string[]`
- **Visual:** Rows = characters. Stacked by action type (normal, charged, skill, burst, dash, jump, swap, walk). Action colors from `actionColor()`.
- **Data transform:** `SourceStats[]` → `[{ name: "Hu Tao", normal: 150, skill: 30, burst: 10, ... }]`
- **Tests:** Renders all action types for each character

#### 9. `reactions-chart` (Step 3.4g)

- **Recharts type:** `HorizontalBarStack` wrapper
- **Props:** `data: Sim.SourceStats[]`, `characterNames: string[]`
- **Visual:** Rows = reaction names. Stacked by character contributing to that reaction.
- **Data transform:** `SourceStats[]` → `[{ name: "Vaporize", char0: 50, char1: 30 }]`
- **Tests:** Renders reaction types, counts match data

### Group C: Energy & Field Time Charts

#### 10. `energy-chart` (Step 3.4e)

- **Recharts type:** `HorizontalBarStack` wrapper
- **Props:** `data: Sim.SourceStats[]`, `characterNames: string[]`
- **Visual:** Rows = energy sources. Stacked by character.
- **Tests:** Renders one series per character

#### 11. `ending-energy-chart`

- **Recharts type:** `BarChart` (`layout="vertical"`) — single bars, not stacked
- **Props:** `endStats: Sim.EndStats[]`, `characterNames: string[]`
- **Visual:** One horizontal bar per character showing ending energy. Character colors.
- **Data transform:** `EndStats[]` → `[{ name: "Hu Tao", energy: endStats[i].ending_energy.mean }]` (ending_energy is a FloatStat; use .mean for bar value)
- **Tests:** Renders one bar per character

#### 12. `field-time-chart` (Step 3.4f)

- **Recharts type:** `PieChart`
- **Props:** `fieldTime: Sim.FloatStat[]`, `characterNames: string[]`
- **Visual:** Pie chart showing proportion of active field time per character. Labels show character name + percentage.
- **Tests:** Proportions sum to 100%, labels correct

### Group D: Aura

#### 13. `target-aura-uptime-chart`

- **Recharts type:** `HorizontalBarStack` wrapper
- **Props:** `data: Sim.SourceStats[]`
- **Visual:** Rows = aura/element names. Stacked bars showing uptime percentage. Element colors. X-axis label: "% of total duration".
- **Tests:** Renders aura types, values are percentages

## Test Fixture Extensions

The `mockSimResult` in `tooling/test-fixtures/sim-result.ts` must be extended with:

```typescript
statistics: {
  // ...existing fields...

  // New fields for charts:
  damage_buckets: {
    bucket_size: 60,  // 1 second = 60 frames
    buckets: [/* 10 FloatStat entries */],
  },
  cumu_damage: {
    bucket_size: 60,
    targets: {
      "target-1": {
        overall: { min: [...], max: [...], q1: [...], q2: [...], q3: [...] },
      },
    },
  },
  dps_by_element: [
    { elements: { pyro: { min: 20000, max: 40000, mean: 30000, sd: 2500 }, hydro: { ... } } },
    { elements: { hydro: { min: 8000, max: 20000, mean: 14000, sd: 1800 } } },
  ],
  source_dps: [
    { sources: { "Normal Attack": { ... }, "Elemental Skill": { ... }, "Elemental Burst": { ... } } },
    { sources: { "Normal Attack": { ... }, "Elemental Skill": { ... } } },
  ],
  character_actions: [
    { sources: { normal: { ... }, skill: { ... }, burst: { ... }, dash: { ... } } },
    { sources: { normal: { ... }, skill: { ... }, burst: { ... } } },
  ],
  source_reactions: [
    { sources: { Vaporize: { ... }, Overloaded: { ... } } },
    { sources: { Vaporize: { ... } } },
  ],
  total_source_energy: [
    { sources: { "Elemental Skill": { ... }, "Elemental Burst": { ... } } },
    { sources: { "Elemental Skill": { ... } } },
  ],
  target_aura_uptime: [
    { sources: { Pyro: { ... }, Hydro: { ... } } },
  ],
  end_stats: [
    { ending_energy: { min: 38, max: 43, mean: 40.5, sd: 1.2 } },
    { ending_energy: { min: 60, max: 70, mean: 65.2, sd: 2.1 } },
  ],
  rps: { min: 5, max: 15, mean: 10.2, sd: 1.5, q1: 9, q2: 10, q3: 11, histogram: [5, 20, 50, 100, 200, 150, 80, 40, 20, 5] },
  eps: { min: 100, max: 300, mean: 200, sd: 25, q1: 185, q2: 200, q3: 215, histogram: [5, 15, 40, 100, 250, 200, 100, 50, 25, 10] },
  hps: { min: 0, max: 5000, mean: 2500, sd: 800, q1: 2000, q2: 2500, q3: 3000, histogram: [20, 50, 100, 200, 250, 180, 100, 50, 30, 20] },
  shp: { min: 0, max: 10000, mean: 5000, sd: 1500, q1: 4000, q2: 5000, q3: 6000, histogram: [10, 30, 80, 150, 250, 200, 130, 80, 40, 10] },
}
```

## File Structure

```
src/charts/
├── util/
│   ├── colors.ts              # Color mapping (character, element, action, reaction)
│   ├── colors.test.ts
│   ├── format.ts              # Number formatting (damage, percent, duration, stat)
│   ├── format.test.ts
│   ├── chart-card.tsx         # Card wrapper with ResponsiveContainer
│   ├── chart-card.test.tsx
│   ├── stat-tooltip.tsx       # Custom Recharts tooltip for FloatStat
│   ├── stat-tooltip.test.tsx
│   ├── horizontal-bar-stack.tsx  # Generic horizontal stacked bar
│   ├── horizontal-bar-stack.test.tsx
│   └── index.ts
├── damage-timeline/           # Canonical chart example
│   ├── damage-timeline.tsx
│   ├── damage-timeline.test.tsx
│   └── index.ts
├── cumulative-damage/
│   ├── cumulative-damage.tsx
│   ├── cumulative-damage.test.tsx
│   └── index.ts
├── distribution-chart/
│   ├── distribution-chart.tsx
│   ├── distribution-chart.test.tsx
│   └── index.ts
├── character-dps-pie/
│   ├── character-dps-pie.tsx
│   ├── character-dps-pie.test.tsx
│   └── index.ts
├── element-dps-pie/
│   ├── element-dps-pie.tsx
│   ├── element-dps-pie.test.tsx
│   └── index.ts
├── element-dps-chart/
│   ├── element-dps-chart.tsx
│   ├── element-dps-chart.test.tsx
│   └── index.ts
├── source-dps-chart/
│   ├── source-dps-chart.tsx
│   ├── source-dps-chart.test.tsx
│   └── index.ts
├── character-actions-chart/
│   ├── character-actions-chart.tsx
│   ├── character-actions-chart.test.tsx
│   └── index.ts
├── reactions-chart/
│   ├── reactions-chart.tsx
│   ├── reactions-chart.test.tsx
│   └── index.ts
├── energy-chart/
│   ├── energy-chart.tsx
│   ├── energy-chart.test.tsx
│   └── index.ts
├── ending-energy-chart/
│   ├── ending-energy-chart.tsx
│   ├── ending-energy-chart.test.tsx
│   └── index.ts
├── field-time-chart/
│   ├── field-time-chart.tsx
│   ├── field-time-chart.test.tsx
│   └── index.ts
├── target-aura-uptime-chart/
│   ├── target-aura-uptime-chart.tsx
│   ├── target-aura-uptime-chart.test.tsx
│   └── index.ts
└── index.ts                   # Barrel re-exports all charts
```

## Implementation Order

1. **Shared utils** — colors, format, chart-card, stat-tooltip, horizontal-bar-stack
2. **Test fixture extensions** — add all missing chart data to mockSimResult
3. **damage-timeline** — canonical LineChart example (establishes pattern)
4. **distribution-chart** — histogram BarChart pattern
5. **element-dps-chart** — first HorizontalBarStack user (establishes pattern)
6. **field-time-chart** — first PieChart (establishes pattern)
7. **Remaining charts** — all follow established patterns, parallelizable:
   - cumulative-damage, character-dps-pie, element-dps-pie, source-dps-chart
   - character-actions-chart, reactions-chart, energy-chart, ending-energy-chart
   - target-aura-uptime-chart
8. **Barrel exports** — update `src/charts/index.ts` and `src/index.ts`
9. **Update CLAUDE.md** — canonical example `charts/damage-timeline/`, how to add a new chart
10. **Storybook stories** — one story per chart in `apps/storybook/src/stories/<chart-name>.stories.tsx` with mock data from test fixtures

## Deferred (Not In This Step)

- Custom box-plot hover overlay on bar charts (TODO comment left in stat-tooltip.tsx)
- Cumulative damage target switcher (the component accepts `targetId` prop; the dropdown selector lives in the app — Phase 4)
- Distribution metric switcher (component accepts `stat` + `label` props; the dropdown lives in the app)
- Position graph (enemy spatial visualization) — not a Recharts chart; separate future step
- Live data refresh during simulation (Phase 4 wiring concern)
- DPS bar chart view toggle (by character/element/target) — Phase 4 app composition

## Dependencies

- `recharts` — added to `packages/viewer/package.json` (version per `DEPENDENCIES.md`)
- `@gcsim/primitives` — Card, cn() (already a dependency)
- `@gcsim/types` — Sim.* types (already a dependency)
