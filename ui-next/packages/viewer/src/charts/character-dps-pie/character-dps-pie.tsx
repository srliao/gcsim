import type { Sim } from "@gcsim/types";
import type { PieLabelRenderProps } from "recharts";
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { ChartCard } from "../util/chart-card.js";
import { characterColor } from "../util/colors.js";

export interface CharacterDpsPieProps {
  characterDps: Sim.FloatStat[] | undefined;
  characterNames: string[];
}

export interface CharacterDpsDataPoint {
  name: string;
  value: number;
  pct: string;
}

export function transformCharacterDps(
  characterDps: Sim.FloatStat[] | undefined,
  characterNames: string[],
): CharacterDpsDataPoint[] {
  if (!characterDps?.length) {
    return [];
  }

  const totalMean = characterDps.reduce((sum, stat) => sum + (stat.mean ?? 0), 0);

  return characterDps.map((stat, index) => {
    const value = stat.mean ?? 0;
    const pct = totalMean > 0 ? `${Math.round((value / totalMean) * 100)}%` : "0%";
    return {
      name: characterNames[index] ?? `Character ${index + 1}`,
      value,
      pct,
    };
  });
}

export function CharacterDpsPie({ characterDps, characterNames }: CharacterDpsPieProps) {
  const data = transformCharacterDps(characterDps, characterNames);
  const hasData = data.length > 0;

  return (
    <div data-testid="character-dps-pie">
      <ChartCard title="Character DPS">
        {hasData ? (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                label={(props: PieLabelRenderProps) => {
                  const entry = props.payload as CharacterDpsDataPoint | undefined;
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
