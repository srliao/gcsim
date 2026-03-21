import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("./config-editor", () => ({
  ConfigEditor: () => <div data-testid="config-editor" />,
}));
vi.mock("./team-builder", () => ({
  TeamBuilder: () => <div data-testid="team-builder" />,
}));
vi.mock("./action-editor", () => ({
  ActionEditor: () => <div data-testid="action-editor" />,
}));
vi.mock("./run-controls", () => ({
  RunControls: () => <div data-testid="run-controls" />,
}));
vi.mock("../../components/executor-settings", () => ({
  ExecutorSettings: () => <div data-testid="executor-settings" />,
}));

import { Simulator } from "./simulator";

afterEach(cleanup);

describe("Simulator", () => {
  it("renders Simulator heading", () => {
    render(<Simulator />);
    expect(screen.getByText("Simulator")).toBeDefined();
  });

  it("renders ConfigEditor", () => {
    render(<Simulator />);
    expect(screen.getByTestId("config-editor")).toBeDefined();
  });

  it("renders TeamBuilder", () => {
    render(<Simulator />);
    expect(screen.getByTestId("team-builder")).toBeDefined();
  });

  it("renders ActionEditor", () => {
    render(<Simulator />);
    expect(screen.getByTestId("action-editor")).toBeDefined();
  });

  it("renders RunControls", () => {
    render(<Simulator />);
    expect(screen.getByTestId("run-controls")).toBeDefined();
  });

  it("renders ExecutorSettings", () => {
    render(<Simulator />);
    expect(screen.getByTestId("executor-settings")).toBeDefined();
  });

  it("renders Configuration card title", () => {
    render(<Simulator />);
    expect(screen.getByText("Configuration")).toBeDefined();
  });

  it("renders Settings card title", () => {
    render(<Simulator />);
    expect(screen.getByText("Settings")).toBeDefined();
  });
});
