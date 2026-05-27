import type { Sim } from "@gcsim/types";
import { ChartShell } from "../../chart-shell/chart-shell.js";
import { elementColor } from "../util/colors.js";
import { formatDamage } from "../util/format.js";
import { HorizontalBarStack } from "../util/horizontal-bar-stack.js";

export interface ElementDpsChartProps {
  data: Sim.ElementStats[] | undefined;
  characterNames: string[];
}

export interface ElementDpsRow {
  name: string;
  [element: string]: string | number;
}

export interface TransformResult {
  rows: ElementDpsRow[];
  keys: string[];
}

export function transformElementDps(
  data: Sim.ElementStats[],
  characterNames: string[],
): TransformResult {
  if (!data.length) {
    return { rows: [], keys: [] };
  }

  // Collect all unique element keys across all characters
  const keySet = new Set<string>();
  for (const stat of data) {
    for (const element of Object.keys(stat.elements ?? {})) {
      keySet.add(element);
    }
  }
  const keys = Array.from(keySet);

  // Build one row per character
  const rows: ElementDpsRow[] = data.map((stat, i) => {
    const row: ElementDpsRow = { name: characterNames[i] ?? `Character ${i}` };
    for (const key of keys) {
      row[key] = stat.elements?.[key]?.mean ?? 0;
    }
    return row;
  });

  return { rows, keys };
}

export function ElementDpsChart({ data, characterNames }: ElementDpsChartProps) {
  const { rows, keys } = transformElementDps(data ?? [], characterNames);
  const hasData = rows.length > 0 && keys.length > 0;

  return (
    <div data-testid="element-dps-chart">
      <ChartShell title="Element DPS">
        {hasData ? (
          <HorizontalBarStack
            data={rows}
            keys={keys}
            nameKey="name"
            colorFn={elementColor}
            xTickFormatter={formatDamage}
          />
        ) : null}
      </ChartShell>
    </div>
  );
}
