import { beforeEach, describe, expect, it } from "vitest";
import { useSimulatorStore } from "./simulator-store";

describe("simulator-store", () => {
  beforeEach(() => {
    useSimulatorStore.getState().reset();
  });

  it("should have correct initial state", () => {
    const state = useSimulatorStore.getState();
    expect(state.config).toBe("");
    expect(state.team).toEqual([]);
    expect(state.validationResult).toBeNull();
    expect(state.executionMode).toBe("wasm");
    expect(state.serverUrl).toBe("http://127.0.0.1:8381");
  });

  it("should set config", () => {
    useSimulatorStore.getState().setConfig("test config");
    expect(useSimulatorStore.getState().config).toBe("test config");
  });

  it("should set team", () => {
    const team = [{ name: "albedo", level: 90, element: "geo" }] as never[];
    useSimulatorStore.getState().setTeam(team);
    expect(useSimulatorStore.getState().team).toEqual(team);
  });

  it("should set validation result", () => {
    const result = { errors: ["error1", "error2"] };
    useSimulatorStore.getState().setValidationResult(result);
    expect(useSimulatorStore.getState().validationResult).toEqual(result);
  });

  it("should set execution mode", () => {
    useSimulatorStore.getState().setExecutionMode("server");
    expect(useSimulatorStore.getState().executionMode).toBe("server");
  });

  it("should set worker count", () => {
    useSimulatorStore.getState().setWorkerCount(8);
    expect(useSimulatorStore.getState().workerCount).toBe(8);
  });

  it("should set server url", () => {
    useSimulatorStore.getState().setServerUrl("http://localhost:9999");
    expect(useSimulatorStore.getState().serverUrl).toBe("http://localhost:9999");
  });

  it("should reset to initial state", () => {
    useSimulatorStore.getState().setConfig("modified");
    useSimulatorStore.getState().setExecutionMode("server");
    useSimulatorStore.getState().reset();

    const state = useSimulatorStore.getState();
    expect(state.config).toBe("");
    expect(state.executionMode).toBe("wasm");
  });

  it("should use gcsim-simulator as persistence key", () => {
    // The persist middleware uses this key for localStorage
    expect(useSimulatorStore.persist.getOptions().name).toBe("gcsim-simulator");
  });
});
