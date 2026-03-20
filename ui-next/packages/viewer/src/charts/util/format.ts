import type { Sim } from "@gcsim/types";

export function formatDamage(n: number): string {
  if (n >= 1_000_000) {
    return `${(n / 1_000_000).toFixed(1)}M`;
  }
  if (n >= 1_000) {
    return `${(n / 1_000).toFixed(1)}K`;
  }
  return n.toFixed(0);
}

export function formatPercent(n: number): string {
  return `${Math.round(n * 100)}%`;
}

export function formatDuration(frames: number, bucketSize: number): string {
  const seconds = (frames * bucketSize) / 60;
  return `${seconds.toFixed(1)}s`;
}

export function formatStat(stat: Sim.FloatStat): string {
  const mean = stat.mean ?? 0;
  const sd = stat.sd ?? 0;
  return `${mean.toLocaleString(undefined, { maximumFractionDigits: 0 })} (\u00b1${sd.toLocaleString(undefined, { maximumFractionDigits: 0 })})`;
}
