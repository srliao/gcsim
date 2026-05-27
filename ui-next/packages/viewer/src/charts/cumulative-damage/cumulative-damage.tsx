import type { Sim } from "@gcsim/types";
import type { TooltipContentProps } from "recharts";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { NameType, ValueType } from "recharts/types/component/DefaultTooltipContent";
import { ChartShell } from "../../chart-shell/chart-shell.js";
import { ChartTooltipShell } from "../util/chart-tooltip-shell.js";
import { formatDamage } from "../util/format.js";

export interface CumulativeDamageProps {
  data: Sim.TargetBucketStats | undefined;
  targetId?: string;
  characterNames?: string[];
}

export interface CumulativeDamageDataPoint {
  time: number;
  min: number;
  q1: number;
  q2: number;
  q3: number;
  max: number;
}

export function transformCumulativeDamage(
  data: Sim.TargetBucketStats | undefined,
  targetId?: string,
): CumulativeDamageDataPoint[] {
  if (!data?.targets) {
    return [];
  }

  const targets = data.targets;
  const resolvedId = targetId ?? Object.keys(targets)[0];
  if (!resolvedId) {
    return [];
  }

  const target = targets[resolvedId];
  const overall = target?.overall;
  if (!overall?.min?.length) {
    return [];
  }

  const bucketSize = data.bucket_size ?? 60;
  const length = overall.min.length;

  return Array.from({ length }, (_, index) => ({
    time: (index * bucketSize) / 60,
    min: overall.min?.[index] ?? 0,
    q1: overall.q1?.[index] ?? 0,
    q2: overall.q2?.[index] ?? 0,
    q3: overall.q3?.[index] ?? 0,
    max: overall.max?.[index] ?? 0,
  }));
}

const AXIS_TICK = {
  fill: "var(--fg-2)",
  fontFamily: "var(--font-mono)",
  fontSize: 11,
} as const;

function CumulativeTooltip({ active, payload, label }: TooltipContentProps<ValueType, NameType>) {
  if (!active || !payload?.length) return null;

  const point = payload[0]?.payload as CumulativeDamageDataPoint | undefined;
  if (!point) return null;

  const keys: Array<keyof CumulativeDamageDataPoint> = ["min", "q1", "q2", "q3", "max"];

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

export function CumulativeDamage({ data, targetId }: CumulativeDamageProps) {
  const chartData = transformCumulativeDamage(data, targetId);
  const hasData = chartData.length > 0;

  return (
    <div data-testid="cumulative-damage">
      <ChartShell title="Cumulative Damage">
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="q1q3Gradient" x1="0" y1="0" x2="0" y2="1">
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
              <Tooltip content={CumulativeTooltip} cursor={{ stroke: "var(--line-2)" }} />
              <Area
                type="monotone"
                dataKey="max"
                stroke="var(--el-pyro)"
                fill="none"
                strokeWidth={1}
                dot={false}
              />
              <Area
                type="monotone"
                dataKey="q3"
                stroke="var(--accent)"
                fill="url(#q1q3Gradient)"
                strokeWidth={1}
                dot={false}
                strokeDasharray="4 2"
              />
              <Area
                type="monotone"
                dataKey="q2"
                stroke="var(--accent)"
                fill="none"
                strokeWidth={2}
                dot={false}
              />
              <Area
                type="monotone"
                dataKey="q1"
                stroke="var(--accent)"
                fill="var(--bg-2)"
                fillOpacity={1}
                strokeWidth={1}
                dot={false}
                strokeDasharray="4 2"
              />
              <Area
                type="monotone"
                dataKey="min"
                stroke="var(--fg-2)"
                fill="none"
                strokeWidth={1}
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : null}
      </ChartShell>
    </div>
  );
}
