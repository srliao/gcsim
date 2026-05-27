import type { Sim } from "@gcsim/types";
import { ChartShell } from "../../chart-shell/chart-shell.js";
import { characterColor } from "../util/colors.js";
import { formatDamage } from "../util/format.js";
import { HorizontalBarStack } from "../util/horizontal-bar-stack.js";

export interface SourceDpsChartProps {
  data: Sim.SourceStats[] | undefined;
  characterNames: string[];
}

export interface SourceDpsRow {
  name: string;
  [character: string]: string | number;
}

export interface SourceTransformResult {
  rows: SourceDpsRow[];
  keys: string[];
}

export function transformSourceDps(
  data: Sim.SourceStats[],
  characterNames: string[],
): SourceTransformResult {
  if (!data.length) {
    return { rows: [], keys: [] };
  }

  // Collect all unique source keys across all characters
  const sourceKeySet = new Set<string>();
  for (const stat of data) {
    for (const source of Object.keys(stat.sources ?? {})) {
      sourceKeySet.add(source);
    }
  }
  const sourceKeys = Array.from(sourceKeySet);

  // Build one row per source, stacked by character
  const rows: SourceDpsRow[] = sourceKeys.map((source) => {
    const row: SourceDpsRow = { name: source };
    for (let i = 0; i < data.length; i++) {
      const charName = characterNames[i] ?? `Character ${i}`;
      row[charName] = data[i].sources?.[source]?.mean ?? 0;
    }
    return row;
  });

  // keys = characterNames (stacking dimension)
  const keys = characterNames.slice(0, data.length);

  return { rows, keys };
}

export function SourceDpsChart({ data, characterNames }: SourceDpsChartProps) {
  const { rows, keys } = transformSourceDps(data ?? [], characterNames);
  const hasData = rows.length > 0 && keys.length > 0;

  const colorFn = (name: string): string => {
    const index = characterNames.indexOf(name);
    return characterColor(index >= 0 ? index : 0);
  };

  return (
    <div data-testid="source-dps-chart">
      <ChartShell title="Source DPS">
        {hasData ? (
          <HorizontalBarStack
            data={rows}
            keys={keys}
            nameKey="name"
            colorFn={colorFn}
            xTickFormatter={formatDamage}
          />
        ) : null}
      </ChartShell>
    </div>
  );
}
