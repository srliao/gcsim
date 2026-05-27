import type { Sim } from "@gcsim/types";
import type { PieLabelRenderProps, TooltipContentProps } from "recharts";
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { NameType, ValueType } from "recharts/types/component/DefaultTooltipContent";
import { ChartShell } from "../../chart-shell/chart-shell.js";
import { ChartTooltipShell } from "../util/chart-tooltip-shell.js";
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

function CharacterDpsTooltip({ active, payload }: TooltipContentProps<ValueType, NameType>) {
  if (!active || !payload?.length) return null;

  const entry = payload[0];
  const name = String(entry?.name ?? "");
  const rawValue = entry?.value;
  const value = typeof rawValue === "number" ? rawValue.toFixed(1) : String(rawValue ?? "");

  return (
    <ChartTooltipShell>
      <div className="flex justify-between gap-4">
        <span className="text-[var(--fg-2)]">{name}</span>
        <span className="font-mono tabular-nums text-[var(--fg-1)]">{value}</span>
      </div>
    </ChartTooltipShell>
  );
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
              <Tooltip content={CharacterDpsTooltip} />
              <Legend wrapperStyle={{ fontFamily: "var(--font-mono)", fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        ) : null}
      </ChartShell>
    </div>
  );
}
