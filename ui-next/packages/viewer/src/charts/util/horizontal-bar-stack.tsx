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
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis type="number" tickFormatter={xTickFormatter} />
        <YAxis type="category" dataKey={nameKey} width={120} />
        <Tooltip content={tooltipContent ?? StatTooltip} />
        <Legend />
        {keys.map((key) => (
          <Bar key={key} dataKey={key} stackId="stack" fill={colorFn(key)} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
