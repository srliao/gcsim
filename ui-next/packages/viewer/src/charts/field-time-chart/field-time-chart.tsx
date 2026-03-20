import type { Sim } from "@gcsim/types";
import type { PieLabelRenderProps } from "recharts";
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { ChartCard } from "../util/chart-card.js";
import { characterColor } from "../util/colors.js";

export interface FieldTimeChartProps {
  fieldTime: Sim.FloatStat[] | undefined;
  characterNames: string[];
}

export interface FieldTimeDataPoint {
  name: string;
  value: number;
  pct: string;
}

export function transformFieldTime(
  fieldTime: Sim.FloatStat[] | undefined,
  characterNames: string[],
): FieldTimeDataPoint[] {
  if (!fieldTime?.length) {
    return [];
  }

  const totalMean = fieldTime.reduce((sum, stat) => sum + (stat.mean ?? 0), 0);

  return fieldTime.map((stat, index) => {
    const value = stat.mean ?? 0;
    const pct = totalMean > 0 ? `${Math.round((value / totalMean) * 100)}%` : "0%";
    return {
      name: characterNames[index] ?? `Character ${index + 1}`,
      value,
      pct,
    };
  });
}

export function FieldTimeChart({ fieldTime, characterNames }: FieldTimeChartProps) {
  const data = transformFieldTime(fieldTime, characterNames);
  const hasData = data.length > 0;

  return (
    <div data-testid="field-time-chart">
      <ChartCard title="Field Time">
        {hasData ? (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                label={(props: PieLabelRenderProps) => {
                  const entry = props.payload as FieldTimeDataPoint | undefined;
                  if (!entry) return "";
                  return `${entry.name} ${entry.pct}`;
                }}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${entry.name}`} fill={characterColor(index)} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) =>
                  typeof value === "number" ? value.toFixed(1) : String(value)
                }
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        ) : null}
      </ChartCard>
    </div>
  );
}
