import type { Sim } from "@gcsim/types";
import { create } from "zustand";

export interface ViewerState {
  results: Sim.SimResults | null;
  activeTab: "results" | "config" | "sample";
  error: string | null;
  recoveryConfig: string | null;
  // actions
  setResults: (results: Sim.SimResults | null) => void;
  setActiveTab: (tab: "results" | "config" | "sample") => void;
  setError: (error: string | null) => void;
  setRecoveryConfig: (config: string | null) => void;
  reset: () => void;
}

const initialState = {
  results: null as Sim.SimResults | null,
  activeTab: "results" as const,
  error: null as string | null,
  recoveryConfig: null as string | null,
};

export const useViewerStore = create<ViewerState>()((set) => ({
  ...initialState,
  setResults: (results) => set({ results }),
  setActiveTab: (activeTab) => set({ activeTab }),
  setError: (error) => set({ error }),
  setRecoveryConfig: (recoveryConfig) => set({ recoveryConfig }),
  reset: () => set(initialState),
}));
