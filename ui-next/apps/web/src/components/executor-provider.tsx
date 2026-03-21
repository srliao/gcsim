import type { Executor } from "@gcsim/executor";
import { ServerExecutor, WasmExecutor } from "@gcsim/executor";
import { createContext, useContext, useMemo } from "react";
import { useSimulatorStore } from "../stores/simulator-store";

const ExecutorContext = createContext<Executor | null>(null);

const envMeta = import.meta as ImportMeta & { env?: Record<string, string> };

export function ExecutorProvider({ children }: { children: React.ReactNode }) {
  const executionMode = useSimulatorStore((s) => s.executionMode);
  const workerCount = useSimulatorStore((s) => s.workerCount);
  const serverUrl = useSimulatorStore((s) => s.serverUrl);

  const executor = useMemo(() => {
    if (executionMode === "server") {
      return new ServerExecutor(serverUrl);
    }
    const wasmUrl = envMeta.env?.VITE_WASM_BASE_URL || "/api/wasm";
    const wasm = new WasmExecutor(wasmUrl);
    wasm.setWorkerCount(workerCount);
    return wasm;
  }, [executionMode, workerCount, serverUrl]);

  return <ExecutorContext value={executor}>{children}</ExecutorContext>;
}

export function useExecutor(): Executor {
  const executor = useContext(ExecutorContext);
  if (!executor) {
    throw new Error("useExecutor must be used within an ExecutorProvider");
  }
  return executor;
}
