import type { Sim } from "@gcsim/types";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChartShell } from "../../chart-shell/chart-shell.js";
import { elementColor } from "../util/colors.js";

export interface TargetAuraUptimeChartProps {
  data: Sim.SourceStats[] | undefined;
}

export interface AuraUptimeRow {
  name: string;
  uptime: number;
}

export interface AuraUptimeTransformResult {
  rows: AuraUptimeRow[];
  keys: string[];
}

export function transformAuraUptime(
  data: Sim.SourceStats[] | undefined,
): AuraUptimeTransformResult {
  const keys = ["uptime"];

  if (!data || !data.length) {
    return { rows: [], keys };
  }

  const sources = data[0].sources ?? {};
  const entries = Object.entries(sources);

  if (!entries.length) {
    return { rows: [], keys };
  }

  const rows: AuraUptimeRow[] = entries.map(([name, stat]) => ({
    name,
    uptime: (stat.mean ?? 0) * 100,
  }));

  return { rows, keys };
}

const AXIS_TICK = {
  fill: "var(--fg-2)",
  fontFamily: "var(--font-mono)",
  fontSize: 11,
} as const;

export function TargetAuraUptimeChart({ data }: TargetAuraUptimeChartProps) {
  const { rows } = transformAuraUptime(data);
  const hasData = rows.length > 0;

  return (
    <div data-testid="target-aura-uptime-chart">
      <ChartShell title="Target Aura Uptime">
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={rows}
              margin={{ top: 4, right: 16, bottom: 24, left: 8 }}
            >
              <CartesianGrid stroke="var(--line-1)" strokeDasharray="3 3" horizontal={false} />
              <XAxis
                type="number"
                domain={[0, 100]}
                tick={AXIS_TICK}
                tickFormatter={(v) => `${v}%`}
                label={{
                  value: "% of total duration",
                  position: "insideBottom",
                  offset: -12,
                  fill: "var(--fg-2)",
                }}
              />
              <YAxis type="category" dataKey="name" width={72} tick={AXIS_TICK} />
              <Tooltip
                formatter={(value) =>
                  typeof value === "number"
                    ? [`${value.toFixed(1)}%`, "Uptime"]
                    : [String(value), "Uptime"]
                }
                contentStyle={{
                  background: "var(--bg-2)",
                  border: "1px solid var(--line-2)",
                  borderRadius: 6,
                  color: "var(--fg-1)",
                  fontSize: 12,
                }}
                itemStyle={{ color: "var(--fg-1)" }}
                labelStyle={{ color: "var(--fg-1)" }}
                cursor={{ fill: "var(--line-1)" }}
              />
              <Bar dataKey="uptime">
                {rows.map((row) => (
                  <Cell key={row.name} fill={elementColor(row.name.toLowerCase())} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : null}
      </ChartShell>
    </div>
  );
}
