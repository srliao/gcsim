import { Card, CardContent, cn } from "@gcsim/primitives";
import type { Sim } from "@gcsim/types";
import { useMemo, useState } from "react";
import {
  groupByFrame,
  resolveStatusDurations,
  trackActiveCharacter,
  transformEvents,
} from "../events/index.js";
import { EventLog } from "./event-log.js";
import { SeedSelector } from "./seed-selector.js";

export interface SampleViewerProps {
  result: Sim.SimResults;
  /** Called with (config, seed) to generate a sample run */
  onRequestSample: (config: string, seed: string) => Promise<Sim.Sample>;
  className?: string;
}

type SampleState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; error: string }
  | { status: "loaded"; sample: Sim.Sample };

export function SampleViewer({ result, onRequestSample, className }: SampleViewerProps) {
  const [state, setState] = useState<SampleState>({ status: "idle" });

  const characterNames = useMemo(
    () => result.character_details?.map((c) => c.name ?? "unknown") ?? [],
    [result.character_details],
  );

  const frameGroups = useMemo(() => {
    if (state.status !== "loaded" || !state.sample.logs) return [];
    const events = transformEvents(state.sample.logs);
    const resolved = resolveStatusDurations(events);
    const activeMap = trackActiveCharacter(resolved);
    return groupByFrame(resolved, activeMap, characterNames.length);
  }, [state, characterNames.length]);

  async function handleGenerate(seed: string) {
    const config = result.config_file;
    if (!config) return;
    setState({ status: "loading" });
    try {
      const sample = await onRequestSample(config, seed);
      setState({ status: "loaded", sample });
    } catch (err) {
      setState({ status: "error", error: err instanceof Error ? err.message : String(err) });
    }
  }

  return (
    <div className={cn("flex flex-col gap-4", className)} data-testid="sample-viewer">
      <SeedSelector
        result={result}
        onGenerate={handleGenerate}
        disabled={state.status === "loading"}
      />

      {state.status === "loading" && (
        <Card data-testid="sample-loading">
          <CardContent className="text-muted-foreground p-6 text-center text-sm">
            Generating sample...
          </CardContent>
        </Card>
      )}

      {state.status === "error" && (
        <Card data-testid="sample-error">
          <CardContent className="text-destructive p-6 text-center text-sm">
            Error: {state.error}
          </CardContent>
        </Card>
      )}

      {state.status === "loaded" && (
        <EventLog frameGroups={frameGroups} characterNames={characterNames} />
      )}
    </div>
  );
}
