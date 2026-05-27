import type { Sim } from "@gcsim/types";
import type { TooltipContentProps } from "recharts";
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
import type { NameType, ValueType } from "recharts/types/component/DefaultTooltipContent";
import { ChartShell } from "../../chart-shell/chart-shell.js";
import { ChartTooltipShell } from "../util/chart-tooltip-shell.js";
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

function EndingEnergyTooltip({ active, payload, label }: TooltipContentProps<ValueType, NameType>) {
  if (!active || !payload?.length) return null;

  const entry = payload[0];
  const name = String(entry?.name ?? "energy");
  const rawValue = entry?.value;
  const value = typeof rawValue === "number" ? rawValue.toString() : String(rawValue ?? "");

  return (
    <ChartTooltipShell title={label != null ? String(label) : undefined}>
      <div className="flex justify-between gap-4">
        <span className="text-[var(--fg-2)]">{name}</span>
        <span className="font-mono tabular-nums text-[var(--fg-1)]">{value}</span>
      </div>
    </ChartTooltipShell>
  );
}

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
              <Tooltip content={EndingEnergyTooltip} cursor={{ fill: "var(--line-1)" }} />
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
