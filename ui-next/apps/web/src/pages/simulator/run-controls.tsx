import { Button } from "@gcsim/primitives";
import { useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { useExecutor } from "../../components/executor-provider";
import { useSimulatorStore } from "../../stores/simulator-store";
import { useViewerStore } from "../../stores/viewer-store";

export function RunControls() {
  const executor = useExecutor();
  const navigate = useNavigate();
  const config = useSimulatorStore((s) => s.config);
  const setResults = useViewerStore((s) => s.setResults);

  const [isReady, setIsReady] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    executor.ready().then((ready) => {
      if (!cancelled) {
        setIsReady(ready);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [executor]);

  const handleRun = useCallback(async () => {
    setError(null);
    setIsRunning(true);
    try {
      await executor.run(config, (result) => {
        setResults(result);
      });
      navigate({ to: "/web" });
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsRunning(false);
    }
  }, [executor, config, setResults, navigate]);

  const handleCancel = useCallback(() => {
    executor.cancel();
    setIsRunning(false);
  }, [executor]);

  return (
    <div className="flex flex-col gap-3" data-testid="run-controls">
      <div className="flex items-center gap-2">
        <span
          className={`inline-block h-2.5 w-2.5 rounded-full ${isReady ? "bg-green-500" : "bg-red-500"}`}
          data-testid="ready-indicator"
        />
        <span className="text-sm">{isReady ? "Ready" : "Not Ready"}</span>
      </div>

      {isRunning ? (
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">Running...</span>
          <Button variant="destructive" onClick={handleCancel}>
            Cancel
          </Button>
        </div>
      ) : (
        <Button onClick={handleRun} disabled={!isReady || isRunning}>
          Run
        </Button>
      )}

      {error ? (
        <p className="text-sm text-red-500" data-testid="run-error">
          {error}
        </p>
      ) : null}
    </div>
  );
}
