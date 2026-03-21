import type { Sim } from "@gcsim/types";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface SimulatorState {
  config: string;
  team: Sim.Character[];
  validationResult: { errors: string[] } | null;
  executionMode: "wasm" | "server";
  workerCount: number;
  serverUrl: string;
  // actions
  setConfig: (config: string) => void;
  setTeam: (team: Sim.Character[]) => void;
  setValidationResult: (result: { errors: string[] } | null) => void;
  setExecutionMode: (mode: "wasm" | "server") => void;
  setWorkerCount: (count: number) => void;
  setServerUrl: (url: string) => void;
  reset: () => void;
}

const initialState = {
  config: "",
  team: [] as Sim.Character[],
  validationResult: null as { errors: string[] } | null,
  executionMode: "wasm" as const,
  workerCount: navigator.hardwareConcurrency ?? 4,
  serverUrl: "http://127.0.0.1:8381",
};

export const useSimulatorStore = create<SimulatorState>()(
  persist(
    (set) => ({
      ...initialState,
      setConfig: (config) => set({ config }),
      setTeam: (team) => set({ team }),
      setValidationResult: (validationResult) => set({ validationResult }),
      setExecutionMode: (executionMode) => set({ executionMode }),
      setWorkerCount: (workerCount) => set({ workerCount }),
      setServerUrl: (serverUrl) => set({ serverUrl }),
      reset: () => set(initialState),
    }),
    {
      name: "gcsim-simulator",
      partialize: (state) => ({
        config: state.config,
        executionMode: state.executionMode,
        workerCount: state.workerCount,
        serverUrl: state.serverUrl,
      }),
    },
  ),
);
