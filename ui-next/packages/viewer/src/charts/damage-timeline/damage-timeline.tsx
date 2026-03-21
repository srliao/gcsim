import type { Sim } from "@gcsim/types";
import type { TooltipContentProps } from "recharts";
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { NameType, ValueType } from "recharts/types/component/DefaultTooltipContent";
import { ChartCard } from "../util/chart-card.js";
import { formatDamage } from "../util/format.js";

export interface DamageTimelineProps {
  buckets?: Sim.BucketStats;
}

export interface BucketDataPoint {
  time: number;
  min: number;
  max: number;
  mean: number;
  sdUpper: number;
  sdLower: number;
}

export function transformBuckets(buckets: Sim.BucketStats | undefined): BucketDataPoint[] {
  if (!buckets?.buckets?.length) {
    return [];
  }

  const bucketSize = buckets.bucket_size ?? 60;

  return buckets.buckets.map((stat, index) => {
    const mean = stat.mean ?? 0;
    const sd = stat.sd ?? 0;
    return {
      time: (index * bucketSize) / 60,
      min: stat.min ?? 0,
      max: stat.max ?? 0,
      mean,
      sdUpper: mean + sd,
      sdLower: mean - sd,
    };
  });
}

function DamageTooltip({ active, payload, label }: TooltipContentProps<ValueType, NameType>) {
  if (!active || !payload?.length) return null;

  const keys: Array<keyof BucketDataPoint> = ["min", "max", "mean", "sdUpper", "sdLower"];
  const point = payload[0]?.payload as BucketDataPoint | undefined;

  if (!point) return null;

  return (
    <div className="bg-popover text-popover-foreground rounded-md border p-2 text-xs shadow-md">
      <div className="mb-1 font-medium">{`${label}s`}</div>
      {keys.map((key) => (
        <div key={key} className="flex justify-between gap-4">
          <span className="capitalize">{key}</span>
          <span className="tabular-nums">{formatDamage(point[key])}</span>
        </div>
      ))}
    </div>
  );
}

export function DamageTimeline({ buckets }: DamageTimelineProps) {
  const data = transformBuckets(buckets);
  const hasData = data.length > 0;

  return (
    <div data-testid="damage-timeline">
      <ChartCard title="DPS Timeline">
        {hasData ? (
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={data}>
              <defs>
                <linearGradient id="sdBandGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8884d8" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#8884d8" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="time"
                label={{ value: "Time (s)", position: "insideBottom", offset: -5 }}
              />
              <YAxis tickFormatter={formatDamage} />
              <Tooltip content={DamageTooltip} />
              <Area
                type="monotone"
                dataKey="sdUpper"
                stroke="none"
                fill="url(#sdBandGradient)"
                fillOpacity={0.2}
              />
              <Area type="monotone" dataKey="sdLower" stroke="none" fill="white" fillOpacity={1} />
              <Line type="monotone" dataKey="min" stroke="#94a3b8" dot={false} strokeWidth={1} />
              <Line type="monotone" dataKey="max" stroke="#f97316" dot={false} strokeWidth={1} />
              <Line type="monotone" dataKey="mean" stroke="#3b82f6" dot={false} strokeWidth={2} />
              <Line
                type="monotone"
                dataKey="sdUpper"
                stroke="#8884d8"
                dot={false}
                strokeWidth={1}
                strokeDasharray="4 2"
              />
              <Line
                type="monotone"
                dataKey="sdLower"
                stroke="#8884d8"
                dot={false}
                strokeWidth={1}
                strokeDasharray="4 2"
              />
            </ComposedChart>
          </ResponsiveContainer>
        ) : null}
      </ChartCard>
    </div>
  );
}
