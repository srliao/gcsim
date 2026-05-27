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
      className="rounded-md border border-[var(--line-2)] bg-[var(--bg-2)] p-2 text-xs text-[var(--fg-1)] shadow-md"
      data-testid="stat-tooltip"
    >
      {label && <div className="mb-1 font-medium text-[var(--fg-1)]">{label}</div>}
      {Object.entries(stats).map(([name, stat]) => (
        <div key={name} className="flex justify-between gap-4">
          <span className="capitalize text-[var(--fg-2)]">{name}</span>
          <span className="font-mono tabular-nums text-[var(--fg-1)]">
            {stat.mean?.toLocaleString(undefined, { maximumFractionDigits: 0 }) ?? "—"}
            {stat.sd != null && (
              <span className="text-[var(--fg-2)]">
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
