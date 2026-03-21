import type { Sim } from "@gcsim/types";
import { SampleViewer } from "@gcsim/viewer";
import { useCallback } from "react";
import { useExecutor } from "../../components/executor-provider";

interface SampleTabProps {
  results: Sim.SimResults;
}

export function SampleTab({ results }: SampleTabProps) {
  const executor = useExecutor();

  const handleRequestSample = useCallback(
    (config: string, seed: string): Promise<Sim.Sample> => {
      return executor.sample(config, seed);
    },
    [executor],
  );

  return <SampleViewer result={results} onRequestSample={handleRequestSample} />;
}
