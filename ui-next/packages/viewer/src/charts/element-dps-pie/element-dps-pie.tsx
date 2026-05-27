import type { Sim } from "@gcsim/types";
import type { PieLabelRenderProps } from "recharts";
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { ChartShell } from "../../chart-shell/chart-shell.js";
import { elementColor } from "../util/colors.js";

export interface ElementDpsPieProps {
  elementDps: Sim.ElementDPS | undefined;
}

export interface ElementDpsPieDataPoint {
  name: string;
  value: number;
  pct: string;
  color: string;
}

export function transformElementDpsPie(
  elementDps: Sim.ElementDPS | undefined,
): ElementDpsPieDataPoint[] {
  if (!elementDps) {
    return [];
  }

  const entries = Object.entries(elementDps);
  if (entries.length === 0) {
    return [];
  }

  const totalMean = entries.reduce((sum, [, stat]) => sum + (stat.mean ?? 0), 0);

  return entries.map(([element, stat]) => {
    const value = stat.mean ?? 0;
    const pct = totalMean > 0 ? `${Math.round((value / totalMean) * 100)}%` : "0%";
    const name = element.charAt(0).toUpperCase() + element.slice(1);
    return {
      name,
      value,
      pct,
      color: elementColor(element),
    };
  });
}

export function ElementDpsPie({ elementDps }: ElementDpsPieProps) {
  const data = transformElementDpsPie(elementDps);
  const hasData = data.length > 0;

  return (
    <div data-testid="element-dps-pie">
      <ChartShell title="Element DPS">
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                label={(props: PieLabelRenderProps) => {
                  const entry = props.payload as ElementDpsPieDataPoint | undefined;
                  if (!entry) return "";
                  return `${entry.name} ${entry.pct}`;
                }}
              >
                {data.map((entry) => (
                  <Cell key={`cell-${entry.name}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) =>
                  typeof value === "number" ? value.toFixed(0) : String(value)
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
