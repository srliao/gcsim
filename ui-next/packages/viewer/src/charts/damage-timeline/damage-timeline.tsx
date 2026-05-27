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
import { ChartShell } from "../../chart-shell/chart-shell.js";
import { ChartTooltipShell } from "../util/chart-tooltip-shell.js";
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

const AXIS_TICK = {
  fill: "var(--fg-2)",
  fontFamily: "var(--font-mono)",
  fontSize: 11,
} as const;

function DamageTooltip({ active, payload, label }: TooltipContentProps<ValueType, NameType>) {
  if (!active || !payload?.length) return null;

  const keys: Array<keyof BucketDataPoint> = ["min", "max", "mean", "sdUpper", "sdLower"];
  const point = payload[0]?.payload as BucketDataPoint | undefined;

  if (!point) return null;

  return (
    <ChartTooltipShell title={`${label}s`}>
      {keys.map((key) => (
        <div key={key} className="flex justify-between gap-4">
          <span className="capitalize text-[var(--fg-2)]">{key}</span>
          <span className="font-mono tabular-nums text-[var(--fg-1)]">
            {formatDamage(point[key])}
          </span>
        </div>
      ))}
    </ChartTooltipShell>
  );
}

export function DamageTimeline({ buckets }: DamageTimelineProps) {
  const data = transformBuckets(buckets);
  const hasData = data.length > 0;

  return (
    <div data-testid="damage-timeline">
      <ChartShell title="DPS Timeline">
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data}>
              <defs>
                <linearGradient id="sdBandGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--accent)" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="var(--line-1)" strokeDasharray="3 3" />
              <XAxis
                dataKey="time"
                tick={AXIS_TICK}
                label={{
                  value: "Time (s)",
                  position: "insideBottom",
                  offset: -5,
                  fill: "var(--fg-2)",
                }}
              />
              <YAxis tickFormatter={formatDamage} tick={AXIS_TICK} />
              <Tooltip content={DamageTooltip} cursor={{ stroke: "var(--line-2)" }} />
              <Area
                type="monotone"
                dataKey="sdUpper"
                stroke="none"
                fill="url(#sdBandGradient)"
                fillOpacity={0.2}
              />
              <Area
                type="monotone"
                dataKey="sdLower"
                stroke="none"
                fill="var(--bg-2)"
                fillOpacity={1}
              />
              <Line
                type="monotone"
                dataKey="min"
                stroke="var(--fg-2)"
                dot={false}
                strokeWidth={1}
              />
              <Line
                type="monotone"
                dataKey="max"
                stroke="var(--el-pyro)"
                dot={false}
                strokeWidth={1}
              />
              <Line
                type="monotone"
                dataKey="mean"
                stroke="var(--accent)"
                dot={false}
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="sdUpper"
                stroke="var(--accent)"
                dot={false}
                strokeWidth={1}
                strokeDasharray="4 2"
              />
              <Line
                type="monotone"
                dataKey="sdLower"
                stroke="var(--accent)"
                dot={false}
                strokeWidth={1}
                strokeDasharray="4 2"
              />
            </ComposedChart>
          </ResponsiveContainer>
        ) : null}
      </ChartShell>
    </div>
  );
}
