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
import { characterColor } from "../util/colors.js";

export interface EndingEnergyChartProps {
  endStats: Sim.EndStats[] | undefined;
  characterNames: string[];
}

export interface EndingEnergyDataPoint {
  name: string;
  energy: number;
}

export function transformEndingEnergy(
  endStats: Sim.EndStats[] | undefined,
  characterNames: string[],
): EndingEnergyDataPoint[] {
  if (!endStats?.length) {
    return [];
  }

  return endStats.map((stat, index) => ({
    name: characterNames[index] ?? `Character ${index + 1}`,
    energy: stat.ending_energy?.mean ?? 0,
  }));
}

const AXIS_TICK = {
  fill: "var(--fg-2)",
  fontFamily: "var(--font-mono)",
  fontSize: 11,
} as const;

export function EndingEnergyChart({ endStats, characterNames }: EndingEnergyChartProps) {
  const data = transformEndingEnergy(endStats, characterNames);
  const hasData = data.length > 0;
  const height = data.length * 40;

  return (
    <div data-testid="ending-energy-chart">
      <ChartShell title="Ending Energy" height={height}>
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical">
              <CartesianGrid stroke="var(--line-1)" strokeDasharray="3 3" />
              <XAxis type="number" tick={AXIS_TICK} />
              <YAxis type="category" dataKey="name" width={120} tick={AXIS_TICK} />
              <Tooltip
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
              <Bar dataKey="energy">
                {data.map((entry, index) => (
                  <Cell key={`cell-${entry.name}`} fill={characterColor(index)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : null}
      </ChartShell>
    </div>
  );
}
