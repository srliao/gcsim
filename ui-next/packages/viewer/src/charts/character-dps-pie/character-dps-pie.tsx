import type { Sim } from "@gcsim/types";
import type { PieLabelRenderProps } from "recharts";
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { ChartShell } from "../../chart-shell/chart-shell.js";
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
      <ChartShell title="Character DPS">
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
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
                contentStyle={{
                  background: "var(--bg-2)",
                  border: "1px solid var(--line-2)",
                  borderRadius: 6,
                  color: "var(--fg-1)",
                  fontSize: 12,
                }}
                itemStyle={{ color: "var(--fg-1)" }}
                labelStyle={{ color: "var(--fg-1)" }}
              />
              <Legend wrapperStyle={{ fontFamily: "var(--font-mono)", fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        ) : null}
      </ChartShell>
    </div>
  );
}
