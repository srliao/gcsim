import { Portrait, resolveElementColor } from "@gcsim/avatar";
import { Card, cn } from "@gcsim/primitives";
import type { Sim } from "@gcsim/types";

export interface DPSCardProps {
  /** Character key (e.g. `"hutao"`) or a parsed `Sim.Character`. */
  char: string | Sim.Character;
  /** Pre-calculated mean DPS for the headline number. */
  dps: number;
  /** Share of total team DPS, in `0..1`. Drives the contribution bar fill. */
  share: number;
  /** Mean for the meta line (μ). */
  mean: number;
  /** Standard deviation for the meta line (σ). */
  std: number;
  /** Optional role line, e.g. "Main DPS". Defaults to the character's element. */
  role?: string;
  className?: string;
}

function resolveChar(char: string | Sim.Character): {
  name: string;
  element?: string;
} {
  if (typeof char === "string") return { name: char };
  return { name: char.name, element: char.element || undefined };
}

function formatNumber(n: number | undefined): string {
  if (n == null || !Number.isFinite(n)) return "—";
  return n.toLocaleString(undefined, { maximumFractionDigits: 0 });
}

function clamp01(n: number): number {
  if (!Number.isFinite(n)) return 0;
  if (n < 0) return 0;
  if (n > 1) return 1;
  return n;
}

/**
 * Per-character DPS readout: 44px portrait + name + role + headline DPS +
 * element-colored contribution bar + meta line `μ {mean} · σ {std}`.
 */
export function DPSCard({ char, dps, share, mean, std, role, className }: DPSCardProps) {
  const resolved = resolveChar(char);
  const element = resolved.element;
  const barColor = resolveElementColor(element);
  const fillPct = clamp01(share) * 100;
  const displayRole =
    role ?? (element ? `${element.charAt(0).toUpperCase()}${element.slice(1)}` : undefined);

  return (
    <Card
      className={cn("min-w-[240px] p-3", className)}
      data-testid="dps-card"
      data-element={element ?? undefined}
    >
      <div className="flex items-center gap-3">
        <Portrait char={char} size={44} />
        <div className="flex min-w-0 flex-1 flex-col">
          <span
            data-testid="dps-card-name"
            className="truncate text-sm font-medium text-[var(--fg-0)] capitalize"
          >
            {resolved.name}
          </span>
          {displayRole ? (
            <span
              data-testid="dps-card-role"
              className="font-mono text-[10px] tracking-wider text-[var(--fg-2)] uppercase"
            >
              {displayRole}
            </span>
          ) : null}
        </div>
        <span
          data-testid="dps-card-value"
          className="font-mono text-2xl font-medium tabular-nums text-[var(--fg-0)]"
          style={{ letterSpacing: "-0.02em" }}
        >
          {formatNumber(dps)}
        </span>
      </div>
      <div
        data-testid="dps-card-bar-track"
        className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-[var(--bg-2)]"
      >
        <div
          data-testid="dps-card-bar"
          className="h-full rounded-full transition-all"
          style={{ width: `${fillPct}%`, background: barColor }}
        />
      </div>
      <div
        data-testid="dps-card-meta"
        className="mt-2 flex items-center gap-2 font-mono text-[11px] tabular-nums text-[var(--fg-2)]"
      >
        <span data-testid="dps-card-mean">μ {formatNumber(mean)}</span>
        <span className="text-[var(--fg-3)]">·</span>
        <span data-testid="dps-card-std">σ {formatNumber(std)}</span>
      </div>
    </Card>
  );
}
