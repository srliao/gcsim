import { fetchLocalResult } from "@gcsim/api";
import { Card, CardContent } from "@gcsim/primitives";
import type { Sim } from "@gcsim/types";
import { SampleViewer } from "@gcsim/viewer";
import { useQuery } from "@tanstack/react-query";
import { useCallback } from "react";

const envMeta = import.meta as ImportMeta & { env?: Record<string, string> };
const LOCAL_DEV_URL = envMeta.env?.VITE_LOCAL_DEV_URL || "http://127.0.0.1:8381";

export function LocalSample() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["local-sample-result"],
    queryFn: () => fetchLocalResult(LOCAL_DEV_URL),
    retry: false,
  });

  const handleRequestSample = useCallback(
    async (_config: string, _seed: string): Promise<Sim.Sample> => {
      const resp = await fetch(`${LOCAL_DEV_URL}/sample`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ config: _config, seed: _seed }),
      });
      if (!resp.ok) {
        throw new Error(`Sample request failed: ${resp.status} ${resp.statusText}`);
      }
      return resp.json() as Promise<Sim.Sample>;
    },
    [],
  );

  return (
    <div className="flex flex-col gap-4 p-4" data-testid="local-sample-page">
      <h1 className="text-2xl font-bold">Local Sample</h1>

      {isLoading && (
        <Card data-testid="local-sample-loading">
          <CardContent className="text-muted-foreground p-6 text-center text-sm">
            Loading results from local dev server...
          </CardContent>
        </Card>
      )}

      {error && (
        <Card data-testid="local-sample-error">
          <CardContent className="text-destructive p-6 text-center text-sm">
            Error: {String(error)}
          </CardContent>
        </Card>
      )}

      {data && <SampleViewer result={data} onRequestSample={handleRequestSample} />}
    </div>
  );
}
