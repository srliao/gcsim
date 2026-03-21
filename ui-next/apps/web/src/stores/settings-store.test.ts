import { describe, expect, it } from "vitest";
import { useSettingsStore } from "./settings-store";

describe("settings-store", () => {
  it("should have correct initial state", () => {
    const state = useSettingsStore.getState();
    expect(state.language).toBe("en");
  });

  it("should set language", () => {
    useSettingsStore.getState().setLanguage("ja");
    expect(useSettingsStore.getState().language).toBe("ja");
  });

  it("should use gcsim-settings as persistence key", () => {
    expect(useSettingsStore.persist.getOptions().name).toBe("gcsim-settings");
  });
});
