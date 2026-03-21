import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface SettingsState {
  language: string;
  // actions
  setLanguage: (language: string) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      language: "en",
      setLanguage: (language) => set({ language }),
    }),
    {
      name: "gcsim-settings",
    },
  ),
);
