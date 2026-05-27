import type { Sim } from "@gcsim/types";

export interface DetailedMetricTileStats {
  min: string;
  max: string;
  std: string;
  p25: string;
  p50: string;
  p75: string;
}

export interface FormattedSummaryStat {
  value: string;
  stats: DetailedMetricTileStats;
}

export interface FormatSummaryStatOptions {
  /** Maximum fraction digits for every formatted number. Defaults to 0. */
  fractionDigits?: number;
}

const DASH = "—";

function formatNumber(n: number | undefined, fractionDigits: number): string {
  if (n == null || !Number.isFinite(n)) return DASH;
  return n.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: fractionDigits,
  });
}

/**
 * Format a `Sim.SummaryStat` into pre-formatted strings suitable for
 * `DetailedMetricTile`. Percentile fields (`q1`/`q2`/`q3`) map to
 * `p25`/`p50`/`p75`. Missing values render as an em-dash.
 */
export function formatSummaryStat(
  stat: Sim.SummaryStat | undefined,
  opts: FormatSummaryStatOptions = {},
): FormattedSummaryStat {
  const fractionDigits = opts.fractionDigits ?? 0;
  return {
    value: formatNumber(stat?.mean, fractionDigits),
    stats: {
      min: formatNumber(stat?.min, fractionDigits),
      max: formatNumber(stat?.max, fractionDigits),
      std: formatNumber(stat?.sd, fractionDigits),
      p25: formatNumber(stat?.q1, fractionDigits),
      p50: formatNumber(stat?.q2, fractionDigits),
      p75: formatNumber(stat?.q3, fractionDigits),
    },
  };
}
