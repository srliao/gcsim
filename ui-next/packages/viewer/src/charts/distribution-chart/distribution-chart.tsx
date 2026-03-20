import type { Sim } from "@gcsim/types";
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
import { ChartCard } from "../util/chart-card.js";
import { formatDamage } from "../util/format.js";

export interface DistributionChartProps {
  stat: Sim.SummaryStat;
  label: string;
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

export function DistributionChart({
  stat,
  label,
  accentColor = "#3B82F6",
}: DistributionChartProps) {
  const { buckets, meanBucket } = transformHistogram(stat);

  const hasData = buckets.length > 0;

  return (
    <ChartCard title={label}>
      {hasData ? (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={buckets}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="bucket"
              angle={-45}
              textAnchor="end"
              interval={0}
              tick={{ fontSize: 10 }}
            />
            <YAxis label={{ value: "Count", angle: -90, position: "insideLeft" }} />
            <Tooltip />
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
    </ChartCard>
  );
}
