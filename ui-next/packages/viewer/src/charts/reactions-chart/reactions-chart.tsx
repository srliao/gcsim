import type { Sim } from "@gcsim/types";
import { ChartCard } from "../util/chart-card.js";
import { characterColor } from "../util/colors.js";
import { formatDamage } from "../util/format.js";
import { HorizontalBarStack } from "../util/horizontal-bar-stack.js";

export interface ReactionsChartProps {
  data: Sim.SourceStats[] | undefined;
  characterNames: string[];
}

export interface ReactionsRow {
  name: string;
  [character: string]: string | number;
}

export interface ReactionsTransformResult {
  rows: ReactionsRow[];
  keys: string[];
}

export function transformReactions(
  data: Sim.SourceStats[],
  characterNames: string[],
): ReactionsTransformResult {
  if (!data.length) {
    return { rows: [], keys: [] };
  }

  // Collect all unique reaction (source) keys across all characters
  const reactionSet = new Set<string>();
  for (const stat of data) {
    for (const reaction of Object.keys(stat.sources ?? {})) {
      reactionSet.add(reaction);
    }
  }

  // Build one row per reaction, with each character's value as a column
  const rows: ReactionsRow[] = Array.from(reactionSet).map((reaction) => {
    const row: ReactionsRow = { name: reaction };
    for (let i = 0; i < characterNames.length; i++) {
      const charName = characterNames[i] ?? `Character ${i}`;
      row[charName] = data[i]?.sources?.[reaction]?.mean ?? 0;
    }
    return row;
  });

  return { rows, keys: characterNames };
}

export function ReactionsChart({ data, characterNames }: ReactionsChartProps) {
  const { rows, keys } = transformReactions(data ?? [], characterNames);
  const hasData = rows.length > 0 && keys.length > 0;

  // Map character name to color by index
  const colorFn = (name: string): string => {
    const index = characterNames.indexOf(name);
    return characterColor(index >= 0 ? index : 0);
  };

  return (
    <div data-testid="reactions-chart">
      <ChartCard title="Reactions">
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
