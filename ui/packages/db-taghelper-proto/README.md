# @gcsim/db-taghelper-proto — layout archive

**Archive-only.** This package is a throwaway design prototype exploring better
UI/UX layouts for **db** (Simpact) and **taghelper**, built entirely on the live
**Gauge** design-token layer (`packages/theme.css`) and the real
`@gcsim/primitives` / `@gcsim/components`. It is meant to be kept on its branch
(`design/db-taghelper-archive`) as a reference that drives the actual
implementation — it is **not shipped** and is not wired into any deployment.

> Why a prototype and not a Claude artifact: the brief asked for something based
> on the *actual* components and tokens, browsable across themes and viewports,
> so the layouts can be judged as real UI. Everything here imports the shipping
> primitives — the only new code is layout.

## Run

```
pnpm --filter @gcsim/db-taghelper-proto dev
```

`/api` is proxied to `https://gcsim.app`, so avatar/weapon/artifact art loads and
the **Live** toggle does a real fetch. With no network it still runs fully from
the baked fixture.

## What it is

A preview **shell** (never themed — always Cryo) wraps a preview surface that is
themed via `data-theme`. The toolbar switches:

- **Surface** — DB · Home / DB · Database / TagHelper
- **Alternative** — the layout candidates for that surface
- **Viewport** — Desktop / Mobile (a real 390px frame)
- **Theme** — all 15 Gauge palettes (default Cryo)
- **Data** — Archived (48-entry fixture) ⇄ Live (fetch from gcsim.app)

## Surfaces & alternatives

### DB · Database (core — 3 alternatives)

| Alt | Name | Idea |
|-----|------|------|
| **A** | Command bar | Sticky command bar (search · selected-character chips · filters · sort · count) over one column of full detail cards. Closest to today, cleaned onto Gauge; best for reading descriptions. |
| **B** | Rail + grid | Persistent filter rail (collapses to a sheet on mobile) beside a responsive card grid. Highest scan density; best for browsing many teams. |
| **C** | Dense rows | Quick tag chips over horizontal power-user rows (portraits · stats · notes · actions). Rows collapse to stacked cards on mobile. |

### TagHelper (moderator triage — 3 alternatives)

| Alt | Name | Idea |
|-----|------|------|
| **A** | Stacked | Submission under review in a highlighted card with its decision actions, then same-team sims as compact rows below. |
| **B** | Split compare | Submission pinned on the left, duplicates scroll on the right — mirrors the actual compare-and-dedup task. |
| **C** | Toolbar + table | Decision actions pinned to a sticky bottom toolbar; duplicates laid out as a comparison table with the submission as the highlighted top row. |

### DB · Home (1 proposed layout)

Compact hero with the primary **Browse database** CTA, the collections (tag)
legend as cards, and a latest-release highlight.

## Functionality recreated

Every capability of the live tools is present and wired:

- **db**: text search, tri-state character filter (include / exclude / neutral)
  with search, tri-state tag filter, sort by date / DPS / sim-time with
  direction, live sim count, Copy Config (clipboard + toast), Open in Viewer.
- **taghelper**: Copy Approve (`/approve id:…`), Copy Reject (`/reject id:…`),
  Result Viewer, per-duplicate Replace (`/replace id:… link:…`) — all copying
  the exact moderator commands to the clipboard.

## Notes for the real implementation

- **Everything is a Gauge token.** No hardcoded colors — the mess being replaced
  was the app layer slapping `bg-emerald-600` / `bg-yellow-600` / `bg-slate-700`
  onto already-migrated primitives. Author against `-g-` utilities only.
- **Team portraits.** The shared `AvatarCard` lays out 4-across but its
  `basis-1/4`+gap **wraps in any container narrower than ~408px** (the shipping
  `DBCard` avoids this by pinning it to `420px`). This prototype pins it the same
  way on desktop and drops to a 2×2 strip on mobile.
- **Preview mobile is a fixed-width frame**, so viewport media queries can't
  fire. Layout that must differ desktop↔mobile is chosen by an explicit
  `viewport` prop, not `sm:`/`md:`. In the real responsive app these become
  ordinary breakpoints/container queries — the prop split just makes the archive
  honest about both states.
- **Default theme is Cryo**; the picker proves every layout survives all 15
  palettes, dark and light.

## Layout

```
src/
  App.tsx              preview shell (toolbar + themed frame)
  index.tsx / index.css
  shell/
    registry.tsx       surface + alternative registry
    themes.ts          the 15 Gauge palettes
  lib/entry.ts         entry field formatting helpers
  fixtures/
    entries.json       48 real entries snapshotted from gcsim.app
    entries.ts         typed loader + live fetch
  surfaces/
    db/Home/Home.tsx
    db/Database/        filter.ts (logic), FilterUI.tsx, components.tsx, AltA/B/C
    taghelper/          shared.tsx, AltA/B/C
```
