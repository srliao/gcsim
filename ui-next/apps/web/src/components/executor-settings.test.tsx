import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { useSimulatorStore } from "../stores/simulator-store";
import { ExecutorSettings } from "./executor-settings";

describe("executor-settings", () => {
  beforeEach(() => {
    useSimulatorStore.getState().reset();
  });

  it("renders mode selector", () => {
    render(<ExecutorSettings />);
    expect(screen.getByText("Execution Mode")).toBeInTheDocument();
  });

  it("renders worker count input when in WASM mode", () => {
    useSimulatorStore.getState().setExecutionMode("wasm");
    render(<ExecutorSettings />);
    expect(screen.getByLabelText(/Worker Count/)).toBeInTheDocument();
  });

  it("renders server URL input when in server mode", () => {
    useSimulatorStore.getState().setExecutionMode("server");
    render(<ExecutorSettings />);
    expect(screen.getByLabelText("Server URL")).toBeInTheDocument();
  });
});
