// @gcsim/viewer public API

// Chart Shell (successor to ChartCard; charts migrate in Phase 3b-ii)
export type { ChartShellProps } from "./chart-shell/index.js";
export { ChartShell } from "./chart-shell/index.js";
// Charts (13 chart components + utilities)
export * from "./charts/index.js";
// DPS Card (moved to its own folder; old result-cards/dps-card removed)
export type { DPSCardProps } from "./dps-card/index.js";
export { DPSCard } from "./dps-card/index.js";
// Events (event log abstraction layer)
export * from "./events/index.js";
// Metadata
export type {
  CommitProps,
  IterationsProps,
  MetadataChipProps,
  MetadataChipTone,
  ModeProps,
  WarningsProps,
} from "./metadata/index.js";
export { Commit, Iterations, MetadataChip, Mode, Warnings } from "./metadata/index.js";
// Result Cards
export type { RollupCardProps, TargetInfoCardProps } from "./result-cards/index.js";
export { RollupCard, TargetInfoCard } from "./result-cards/index.js";
// Rollup (DetailedMetricTile + SummaryStat formatter)
export type {
  DetailedMetricTileProps,
  DetailedMetricTileStats,
  DetailedMetricTileTone,
  FormatSummaryStatOptions,
  FormattedSummaryStat,
} from "./rollup/index.js";
export { DetailedMetricTile, formatSummaryStat } from "./rollup/index.js";
// Sample Viewer
export * from "./sample/index.js";
// Team Header
export type { TeamHeaderProps } from "./team-header/index.js";
export { TeamHeader } from "./team-header/index.js";
