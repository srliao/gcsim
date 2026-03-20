import type { Sim } from "@gcsim/types";
import { ChartCard } from "../util/chart-card.js";
import { characterColor } from "../util/colors.js";
import { formatDamage } from "../util/format.js";
import { HorizontalBarStack } from "../util/horizontal-bar-stack.js";

export interface EnergyChartProps {
  data: Sim.SourceStats[] | undefined;
  characterNames: string[];
}

export interface EnergyRow {
  name: string;
  [character: string]: string | number;
}

export interface EnergyTransformResult {
  rows: EnergyRow[];
  keys: string[];
}

export function transformEnergy(
  data: Sim.SourceStats[],
  characterNames: string[],
): EnergyTransformResult {
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

  // Build one row per energy source; columns = character names
  const rows: EnergyRow[] = sourceKeys.map((source) => {
    const row: EnergyRow = { name: source };
    for (let i = 0; i < characterNames.length; i++) {
      const charName = characterNames[i] ?? `Character ${i}`;
      row[charName] = data[i]?.sources?.[source]?.mean ?? 0;
    }
    return row;
  });

  return { rows, keys: characterNames };
}

export function EnergyChart({ data, characterNames }: EnergyChartProps) {
  const { rows, keys } = transformEnergy(data ?? [], characterNames);
  const hasData = rows.length > 0 && keys.length > 0;

  const colorFn = (key: string) => {
    const index = characterNames.indexOf(key);
    return characterColor(index >= 0 ? index : 0);
  };

  return (
    <div data-testid="energy-chart">
      <ChartCard title="Energy Sources">
        {hasData ? (
          <HorizontalBarStack
            data={rows}
            keys={keys}
            nameKey="name"
            colorFn={colorFn}
            xTickFormatter={formatDamage}
          />
        ) : null}
      </ChartCard>
    </div>
  );
}
