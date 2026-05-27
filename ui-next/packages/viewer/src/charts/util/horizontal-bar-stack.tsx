import type { ReactNode } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  type TooltipContentProps,
  XAxis,
  YAxis,
} from "recharts";
import { StatTooltip } from "./stat-tooltip.js";

export interface HorizontalBarStackProps<Row extends Record<string, string | number>> {
  data: Row[];
  keys: string[];
  nameKey: string;
  colorFn: (key: string) => string;
  height?: number;
  xTickFormatter?: (value: number) => string;
  tooltipContent?: (props: TooltipContentProps) => ReactNode;
}

const TICK_STYLE = {
  fill: "var(--fg-2)",
  fontFamily: "var(--font-mono)",
  fontSize: 11,
} as const;

export function HorizontalBarStack<Row extends Record<string, string | number>>({
  data,
  keys,
  nameKey,
  colorFn,
  height,
  xTickFormatter,
  tooltipContent,
}: HorizontalBarStackProps<Row>) {
  const computedHeight = height ?? data.length * 40;

  return (
    <ResponsiveContainer width="100%" height={computedHeight}>
      <BarChart data={data} layout="vertical">
        <CartesianGrid stroke="var(--line-1)" strokeDasharray="3 3" />
        <XAxis type="number" tickFormatter={xTickFormatter} tick={TICK_STYLE} />
        <YAxis type="category" dataKey={nameKey} width={120} tick={TICK_STYLE} />
        <Tooltip content={tooltipContent ?? StatTooltip} cursor={{ fill: "var(--line-1)" }} />
        <Legend wrapperStyle={{ fontFamily: "var(--font-mono)", fontSize: 11 }} />
        {keys.map((key) => (
          <Bar key={key} dataKey={key} stackId="stack" fill={colorFn(key)} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
