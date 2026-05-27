import type { Sim } from "@gcsim/types";
import type { TooltipContentProps } from "recharts";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { NameType, ValueType } from "recharts/types/component/DefaultTooltipContent";
import { ChartShell } from "../../chart-shell/chart-shell.js";
import { ChartTooltipShell } from "../util/chart-tooltip-shell.js";
import { formatDamage } from "../util/format.js";

export interface DistributionChartProps {
  stat: Sim.SummaryStat;
  label: string;
  /**
   * Color used for the histogram bars and the mean reference line. Pass a
   * `var(--*)` token string. Defaults to `var(--accent)`.
   */
  accentColor?: string;
}

interface BucketDatum {
  bucket: string;
  count: number;
}

interface TransformResult {
  buckets: BucketDatum[];
  meanBucket: string | null;
}

export function transformHistogram(stat: Sim.SummaryStat): TransformResult {
  const { min = 0, max = 0, mean, histogram } = stat;

  if (!histogram || histogram.length === 0) {
    return { buckets: [], meanBucket: null };
  }

  const range = max - min;
  const bucketSize = range / histogram.length;

  const buckets: BucketDatum[] = histogram.map((count, i) => {
    const lo = min + i * bucketSize;
    const hi = lo + bucketSize;
    return { bucket: `${formatDamage(lo)}-${formatDamage(hi)}`, count };
  });

  let meanBucket: string | null = null;
  if (mean != null && bucketSize > 0) {
    const idx = Math.floor((mean - min) / bucketSize);
    const clampedIdx = Math.max(0, Math.min(histogram.length - 1, idx));
    meanBucket = buckets[clampedIdx].bucket;
  }

  return { buckets, meanBucket };
}

const AXIS_TICK = {
  fill: "var(--fg-2)",
  fontFamily: "var(--font-mono)",
  fontSize: 10,
} as const;

function HistogramTooltip({ active, payload }: TooltipContentProps<ValueType, NameType>) {
  if (!active || !payload?.length) return null;
  const point = payload[0]?.payload as BucketDatum | undefined;
  if (!point) return null;

  return (
    <ChartTooltipShell title={point.bucket}>
      <div className="flex justify-between gap-4">
        <span className="text-[var(--fg-2)]">count</span>
        <span className="font-mono tabular-nums text-[var(--fg-1)]">{point.count}</span>
      </div>
    </ChartTooltipShell>
  );
}

export function DistributionChart({
  stat,
  label,
  accentColor = "var(--accent)",
}: DistributionChartProps) {
  const { buckets, meanBucket } = transformHistogram(stat);

  const hasData = buckets.length > 0;

  return (
    <div data-testid="distribution-chart">
      <ChartShell title={label}>
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={buckets}>
              <CartesianGrid stroke="var(--line-1)" strokeDasharray="3 3" />
              <XAxis dataKey="bucket" angle={-45} textAnchor="end" interval={0} tick={AXIS_TICK} />
              <YAxis
                tick={AXIS_TICK}
                label={{
                  value: "Count",
                  angle: -90,
                  position: "insideLeft",
                  fill: "var(--fg-2)",
                }}
              />
              <Tooltip content={HistogramTooltip} cursor={{ fill: "var(--line-1)" }} />
              {meanBucket != null && (
                <ReferenceLine
                  x={meanBucket}
                  stroke={accentColor}
                  label={{ value: "Mean", fill: accentColor, fontSize: 12 }}
                />
              )}
              <Bar dataKey="count" fill={accentColor} />
            </BarChart>
          </ResponsiveContainer>
        ) : null}
      </ChartShell>
    </div>
  );
}
