import type { Sim } from "@gcsim/types";
import type { PieLabelRenderProps, TooltipContentProps } from "recharts";
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { NameType, ValueType } from "recharts/types/component/DefaultTooltipContent";
import { ChartShell } from "../../chart-shell/chart-shell.js";
import { ChartTooltipShell } from "../util/chart-tooltip-shell.js";
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

function FieldTimeTooltip({ active, payload }: TooltipContentProps<ValueType, NameType>) {
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

export function FieldTimeChart({ fieldTime, characterNames }: FieldTimeChartProps) {
  const data = transformFieldTime(fieldTime, characterNames);
  const hasData = data.length > 0;

  return (
    <div data-testid="field-time-chart">
      <ChartShell title="Field Time">
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
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
              <Tooltip content={FieldTimeTooltip} />
              <Legend wrapperStyle={{ fontFamily: "var(--font-mono)", fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        ) : null}
      </ChartShell>
    </div>
  );
}
