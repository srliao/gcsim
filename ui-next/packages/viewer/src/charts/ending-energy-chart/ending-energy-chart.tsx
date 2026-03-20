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

export function EndingEnergyChart({ endStats, characterNames }: EndingEnergyChartProps) {
  const data = transformEndingEnergy(endStats, characterNames);
  const hasData = data.length > 0;
  const height = data.length * 40;

  return (
    <div data-testid="ending-energy-chart">
      <ChartCard title="Ending Energy" height={height}>
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis type="category" dataKey="name" width={120} />
              <Tooltip />
              <Bar dataKey="energy">
                {data.map((entry, index) => (
                  <Cell key={`cell-${entry.name}`} fill={characterColor(index)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : null}
      </ChartCard>
    </div>
  );
}
