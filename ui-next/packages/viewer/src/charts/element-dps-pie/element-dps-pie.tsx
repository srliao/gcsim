import type { Sim } from "@gcsim/types";
import type { PieLabelRenderProps, TooltipContentProps } from "recharts";
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { NameType, ValueType } from "recharts/types/component/DefaultTooltipContent";
import { ChartShell } from "../../chart-shell/chart-shell.js";
import { ChartTooltipShell } from "../util/chart-tooltip-shell.js";
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

function ElementDpsTooltip({ active, payload }: TooltipContentProps<ValueType, NameType>) {
  if (!active || !payload?.length) return null;

  const entry = payload[0];
  const name = String(entry?.name ?? "");
  const rawValue = entry?.value;
  const value = typeof rawValue === "number" ? rawValue.toFixed(0) : String(rawValue ?? "");

  return (
    <ChartTooltipShell>
      <div className="flex justify-between gap-4">
        <span className="text-[var(--fg-2)]">{name}</span>
        <span className="font-mono tabular-nums text-[var(--fg-1)]">{value}</span>
      </div>
    </ChartTooltipShell>
  );
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
              <Tooltip content={ElementDpsTooltip} />
              <Legend wrapperStyle={{ fontFamily: "var(--font-mono)", fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        ) : null}
      </ChartShell>
    </div>
  );
}
