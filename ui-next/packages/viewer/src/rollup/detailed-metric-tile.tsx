import { Card, cn } from "@gcsim/primitives";
import type { DetailedMetricTileStats } from "./format.js";

export type DetailedMetricTileTone =
  | "accent"
  | "pyro"
  | "hydro"
  | "electro"
  | "cryo"
  | "anemo"
  | "geo"
  | "dendro";

export interface DetailedMetricTileProps {
  /** Human label, e.g. "Damage Per Second (DPS)". */
  label: string;
  /** Tone that drives the left-bar color. */
  tone: DetailedMetricTileTone;
  /** Pre-formatted main value (mono tnum). */
  value: string;
  /** Optional unit shown after the value, e.g. "s". */
  unit?: string;
  /** Pre-formatted stat row strings. */
  stats: DetailedMetricTileStats;
  className?: string;
}

const toneBarStyles: Record<DetailedMetricTileTone, string> = {
  accent: "bg-[var(--accent)]",
  pyro: "bg-[var(--el-pyro)]",
  hydro: "bg-[var(--el-hydro)]",
  electro: "bg-[var(--el-electro)]",
  cryo: "bg-[var(--el-cryo)]",
  anemo: "bg-[var(--el-anemo)]",
  geo: "bg-[var(--el-geo)]",
  dendro: "bg-[var(--el-dendro)]",
};

interface StatProps {
  label: string;
  value: string;
}

function Stat({ label, value }: StatProps) {
  return (
    <div
      className="flex min-w-0 items-baseline gap-1"
      data-testid={`detailed-metric-stat-${label}`}
    >
      <span className="font-mono text-[10px] tracking-wider text-[var(--fg-3)] uppercase">
        {label}
      </span>
      <span className="font-mono text-[11px] tabular-nums text-[var(--fg-1)]">{value}</span>
    </div>
  );
}

/**
 * Detailed rollup tile with a tone-colored left bar, a large mono value
 * and a percentile/std stats grid. Replaces the legacy `RollupCard`.
 */
export function DetailedMetricTile({
  label,
  tone,
  value,
  unit,
  stats,
  className,
}: DetailedMetricTileProps) {
  return (
    <Card
      className={cn("relative overflow-hidden pl-4 min-w-[200px]", className)}
      data-testid="detailed-metric-tile"
      data-tone={tone}
    >
      <span
        aria-hidden="true"
        data-testid="detailed-metric-bar"
        className={cn("absolute top-0 left-0 h-full w-1", toneBarStyles[tone])}
      />
      <div className="flex flex-col gap-3 px-4 py-3">
        <div
          data-testid="detailed-metric-label"
          className="font-mono text-[11px] tracking-wider text-[var(--fg-2)] uppercase"
        >
          {label}
        </div>
        <div className="flex items-baseline gap-1">
          <span
            data-testid="detailed-metric-value"
            className="font-mono font-medium tabular-nums text-[var(--fg-0)]"
            style={{ fontSize: "38px", letterSpacing: "-0.03em", lineHeight: 1 }}
          >
            {value}
          </span>
          {unit ? (
            <span
              data-testid="detailed-metric-unit"
              className="font-mono text-sm text-[var(--fg-2)]"
            >
              {unit}
            </span>
          ) : null}
        </div>
        <div data-testid="detailed-metric-stats" className="grid grid-cols-3 gap-x-3 gap-y-1">
          <Stat label="min" value={stats.min} />
          <Stat label="max" value={stats.max} />
          <Stat label="std" value={stats.std} />
          <Stat label="p25" value={stats.p25} />
          <Stat label="p50" value={stats.p50} />
          <Stat label="p75" value={stats.p75} />
        </div>
      </div>
    </Card>
  );
}
