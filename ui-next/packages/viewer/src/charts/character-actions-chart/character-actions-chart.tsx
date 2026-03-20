import type { Sim } from "@gcsim/types";
import { ChartCard } from "../util/chart-card.js";
import { actionColor } from "../util/colors.js";
import { HorizontalBarStack } from "../util/horizontal-bar-stack.js";

export interface CharacterActionsChartProps {
  data: Sim.SourceStats[] | undefined;
  characterNames: string[];
}

export interface CharacterActionsRow {
  name: string;
  [action: string]: string | number;
}

export interface CharacterActionsTransformResult {
  rows: CharacterActionsRow[];
  keys: string[];
}

export function transformCharacterActions(
  data: Sim.SourceStats[] | undefined,
  characterNames: string[],
): CharacterActionsTransformResult {
  if (!data?.length) {
    return { rows: [], keys: [] };
  }

  // Collect all unique action keys across all characters
  const keySet = new Set<string>();
  for (const stat of data) {
    for (const action of Object.keys(stat.sources ?? {})) {
      keySet.add(action);
    }
  }
  const keys = Array.from(keySet);

  // Build one row per character
  const rows: CharacterActionsRow[] = data.map((stat, i) => {
    const row: CharacterActionsRow = { name: characterNames[i] ?? `Character ${i}` };
    for (const key of keys) {
      row[key] = stat.sources?.[key]?.mean ?? 0;
    }
    return row;
  });

  return { rows, keys };
}

export function CharacterActionsChart({ data, characterNames }: CharacterActionsChartProps) {
  const { rows, keys } = transformCharacterActions(data, characterNames);
  const hasData = rows.length > 0 && keys.length > 0;

  return (
    <div data-testid="character-actions-chart">
      <ChartCard title="Character Actions">
        {hasData ? (
          <HorizontalBarStack data={rows} keys={keys} nameKey="name" colorFn={actionColor} />
        ) : null}
      </ChartCard>
    </div>
  );
}
