import { Button, Card, CardContent, CardHeader, CardTitle } from "@gcsim/primitives";
import type { Sim } from "@gcsim/types";
import {
  EventLog,
  groupByFrame,
  resolveStatusDurations,
  trackActiveCharacter,
  transformEvents,
} from "@gcsim/viewer";
import { useCallback, useMemo, useRef, useState } from "react";

type UploadState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; error: string }
  | { status: "loaded"; sample: Sim.Sample };

export function UploadSample() {
  const [state, setState] = useState<UploadState>({ status: "idle" });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setState({ status: "loading" });

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result as string) as Sim.Sample;
        if (!parsed.logs || !Array.isArray(parsed.logs)) {
          setState({ status: "error", error: "Invalid sample: missing logs array" });
          return;
        }
        setState({ status: "loaded", sample: parsed });
      } catch (err) {
        setState({
          status: "error",
          error: err instanceof Error ? err.message : "Failed to parse JSON",
        });
      }
    };
    reader.onerror = () => {
      setState({ status: "error", error: "Failed to read file" });
    };
    reader.readAsText(file);
  }, []);

  const characterNames = useMemo(() => {
    if (state.status !== "loaded") return [];
    return state.sample.character_details?.map((c) => c.name ?? "unknown") ?? [];
  }, [state]);

  const frameGroups = useMemo(() => {
    if (state.status !== "loaded" || !state.sample.logs) return [];
    const events = transformEvents(state.sample.logs);
    const resolved = resolveStatusDurations(events);
    const activeMap = trackActiveCharacter(resolved);
    return groupByFrame(resolved, activeMap, characterNames.length);
  }, [state, characterNames.length]);

  return (
    <div className="flex flex-col gap-4 p-4" data-testid="upload-sample-page">
      <h1 className="text-2xl font-bold">Upload Sample</h1>

      <Card>
        <CardHeader>
          <CardTitle>Upload Sample JSON</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center gap-4">
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileChange}
            data-testid="file-input"
            className="text-sm"
          />
          {state.status !== "idle" && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setState({ status: "idle" });
                if (fileInputRef.current) {
                  fileInputRef.current.value = "";
                }
              }}
            >
              Clear
            </Button>
          )}
        </CardContent>
      </Card>

      {state.status === "loading" && (
        <Card data-testid="upload-loading">
          <CardContent className="text-muted-foreground p-6 text-center text-sm">
            Parsing file...
          </CardContent>
        </Card>
      )}

      {state.status === "error" && (
        <Card data-testid="upload-error">
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
