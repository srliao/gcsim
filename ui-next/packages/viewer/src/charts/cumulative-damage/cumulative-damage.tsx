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
import { ChartCard } from "../util/chart-card.js";
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

function CumulativeTooltip({ active, payload, label }: TooltipContentProps<ValueType, NameType>) {
  if (!active || !payload?.length) return null;

  const point = payload[0]?.payload as CumulativeDamageDataPoint | undefined;
  if (!point) return null;

  const keys: Array<keyof CumulativeDamageDataPoint> = ["min", "q1", "q2", "q3", "max"];

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

export function CumulativeDamage({ data, targetId }: CumulativeDamageProps) {
  const chartData = transformCumulativeDamage(data, targetId);
  const hasData = chartData.length > 0;

  return (
    <div data-testid="cumulative-damage">
      <ChartCard title="Cumulative Damage">
        {hasData ? (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="q1q3Gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="time"
                label={{ value: "Time (s)", position: "insideBottom", offset: -5 }}
              />
              <YAxis tickFormatter={formatDamage} />
              <Tooltip content={CumulativeTooltip} />
              <Area
                type="monotone"
                dataKey="max"
                stroke="#f97316"
                fill="none"
                strokeWidth={1}
                dot={false}
              />
              <Area
                type="monotone"
                dataKey="q3"
                stroke="#8884d8"
                fill="url(#q1q3Gradient)"
                strokeWidth={1}
                dot={false}
                strokeDasharray="4 2"
              />
              <Area
                type="monotone"
                dataKey="q2"
                stroke="#3b82f6"
                fill="none"
                strokeWidth={2}
                dot={false}
              />
              <Area
                type="monotone"
                dataKey="q1"
                stroke="#8884d8"
                fill="white"
                fillOpacity={1}
                strokeWidth={1}
                dot={false}
                strokeDasharray="4 2"
              />
              <Area
                type="monotone"
                dataKey="min"
                stroke="#94a3b8"
                fill="none"
                strokeWidth={1}
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : null}
      </ChartCard>
    </div>
  );
}
