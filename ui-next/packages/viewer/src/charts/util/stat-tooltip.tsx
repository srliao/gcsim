import type { Sim } from "@gcsim/types";

export interface StatTooltipProps {
  label?: string | number;
  stats?: Record<string, Sim.FloatStat>;
}

// TODO (future): Implement box-plot hover overlay for richer stat display on bar charts.

export function StatTooltip({ label, stats }: StatTooltipProps) {
  if (!stats || Object.keys(stats).length === 0) return null;

  return (
    <div
      className="bg-popover text-popover-foreground rounded-md border p-2 text-xs shadow-md"
      data-testid="stat-tooltip"
    >
      {label && <div className="mb-1 font-medium">{label}</div>}
      {Object.entries(stats).map(([name, stat]) => (
        <div key={name} className="flex justify-between gap-4">
          <span className="capitalize">{name}</span>
          <span className="tabular-nums">
            {stat.mean?.toLocaleString(undefined, { maximumFractionDigits: 0 }) ?? "—"}
            {stat.sd != null && (
              <span className="text-muted-foreground">
                {" "}
                (±{stat.sd.toLocaleString(undefined, { maximumFractionDigits: 0 })})
              </span>
            )}
          </span>
        </div>
      ))}
    </div>
  );
}
