import {
  Button,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@gcsim/primitives";
import type { Sim } from "@gcsim/types";
import { useState } from "react";

export type SeedMode = "sample" | "min" | "max" | "p25" | "p50" | "p75" | "custom";

export interface SeedSelectorProps {
  result: Sim.SimResults;
  onGenerate: (seed: string) => void;
  disabled?: boolean;
  className?: string;
}

const seedModeLabels: Record<SeedMode, string> = {
  sample: "Sample",
  min: "Min DPS",
  max: "Max DPS",
  p25: "25th Percentile",
  p50: "Median",
  p75: "75th Percentile",
  custom: "Custom Seed",
};

function resolveSeed(
  mode: SeedMode,
  result: Sim.SimResults,
  customSeed: string,
): string | undefined {
  const stats = result.statistics;
  switch (mode) {
    case "sample":
      return result.sample_seed;
    case "min":
      return stats?.min_seed;
    case "max":
      return stats?.max_seed;
    case "p25":
      return stats?.p25_seed;
    case "p50":
      return stats?.p50_seed;
    case "p75":
      return stats?.p75_seed;
    case "custom":
      return customSeed || undefined;
  }
}

export function SeedSelector({ result, onGenerate, disabled, className }: SeedSelectorProps) {
  const [mode, setMode] = useState<SeedMode>("sample");
  const [customSeed, setCustomSeed] = useState("");

  const seed = resolveSeed(mode, result, customSeed);
  const canGenerate = seed != null && seed !== "" && !disabled;

  function handleGenerate() {
    if (seed != null && seed !== "") {
      onGenerate(seed);
    }
  }

  return (
    <div className={className} data-testid="seed-selector">
      <div className="flex items-center gap-2">
        <Select value={mode} onValueChange={(v) => setMode(v as SeedMode)}>
          <SelectTrigger className="w-[180px]" data-testid="seed-mode-select">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(Object.keys(seedModeLabels) as SeedMode[]).map((m) => (
              <SelectItem key={m} value={m}>
                {seedModeLabels[m]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {mode === "custom" && (
          <Input
            type="text"
            placeholder="Enter seed..."
            value={customSeed}
            onChange={(e) => setCustomSeed(e.target.value)}
            className="w-[140px]"
            data-testid="custom-seed-input"
          />
        )}

        <Button onClick={handleGenerate} disabled={!canGenerate} data-testid="generate-button">
          Generate
        </Button>
      </div>
    </div>
  );
}
