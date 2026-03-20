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
import { ChartCard } from "../util/chart-card.js";
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

export function TargetAuraUptimeChart({ data }: TargetAuraUptimeChartProps) {
  const { rows } = transformAuraUptime(data);
  const hasData = rows.length > 0;

  return (
    <div data-testid="target-aura-uptime-chart">
      <ChartCard title="Target Aura Uptime">
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={rows}
              margin={{ top: 4, right: 16, bottom: 24, left: 8 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis
                type="number"
                domain={[0, 100]}
                tickFormatter={(v) => `${v}%`}
                label={{ value: "% of total duration", position: "insideBottom", offset: -12 }}
              />
              <YAxis type="category" dataKey="name" width={72} />
              <Tooltip
                formatter={(value) =>
                  typeof value === "number"
                    ? [`${value.toFixed(1)}%`, "Uptime"]
                    : [String(value), "Uptime"]
                }
              />
              <Bar dataKey="uptime">
                {rows.map((row) => (
                  <Cell key={row.name} fill={elementColor(row.name.toLowerCase())} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : null}
      </ChartCard>
    </div>
  );
}
