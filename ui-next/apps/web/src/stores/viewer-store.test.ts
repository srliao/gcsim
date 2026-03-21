import { beforeEach, describe, expect, it } from "vitest";
import { useViewerStore } from "./viewer-store";

describe("viewer-store", () => {
  beforeEach(() => {
    useViewerStore.getState().reset();
  });

  it("should have correct initial state", () => {
    const state = useViewerStore.getState();
    expect(state.results).toBeNull();
    expect(state.activeTab).toBe("results");
    expect(state.error).toBeNull();
    expect(state.recoveryConfig).toBeNull();
  });

  it("should set results", () => {
    const results = { config_file: "test" } as never;
    useViewerStore.getState().setResults(results);
    expect(useViewerStore.getState().results).toEqual(results);
  });

  it("should set active tab", () => {
    useViewerStore.getState().setActiveTab("config");
    expect(useViewerStore.getState().activeTab).toBe("config");
  });

  it("should set error", () => {
    useViewerStore.getState().setError("something went wrong");
    expect(useViewerStore.getState().error).toBe("something went wrong");
  });

  it("should set recovery config", () => {
    useViewerStore.getState().setRecoveryConfig("recovery config text");
    expect(useViewerStore.getState().recoveryConfig).toBe("recovery config text");
  });

  it("should reset to initial state", () => {
    useViewerStore.getState().setActiveTab("sample");
    useViewerStore.getState().setError("err");
    useViewerStore.getState().reset();

    const state = useViewerStore.getState();
    expect(state.activeTab).toBe("results");
    expect(state.error).toBeNull();
  });
});
