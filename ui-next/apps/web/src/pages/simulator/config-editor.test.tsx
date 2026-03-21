import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useSimulatorStore } from "../../stores/simulator-store";

vi.mock("@gcsim/editor", () => ({
  Editor: ({
    value,
    onChange,
    ...props
  }: {
    value: string;
    onChange?: (v: string) => void;
    className?: string;
  }) => (
    <textarea
      data-testid="mock-editor"
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      {...props}
    />
  ),
}));

import { ConfigEditor } from "./config-editor";

afterEach(cleanup);

beforeEach(() => {
  useSimulatorStore.setState({
    config: "",
    validationResult: null,
  });
});

describe("ConfigEditor", () => {
  it("renders the editor component", () => {
    render(<ConfigEditor />);
    expect(screen.getByTestId("mock-editor")).toBeDefined();
  });

  it("passes config from store to editor", () => {
    useSimulatorStore.setState({ config: "bennett char lvl=90/90;" });
    render(<ConfigEditor />);
    const editor = screen.getByTestId("mock-editor") as HTMLTextAreaElement;
    expect(editor.value).toBe("bennett char lvl=90/90;");
  });

  it("does not show errors when validationResult is null", () => {
    render(<ConfigEditor />);
    expect(screen.queryByTestId("validation-errors")).toBeNull();
  });

  it("does not show errors when validationResult has empty errors", () => {
    useSimulatorStore.setState({ validationResult: { errors: [] } });
    render(<ConfigEditor />);
    expect(screen.queryByTestId("validation-errors")).toBeNull();
  });

  it("shows validation errors when present in store", () => {
    useSimulatorStore.setState({
      validationResult: {
        errors: ["line 1: unexpected token", "line 3: unknown character"],
      },
    });
    render(<ConfigEditor />);
    const errorList = screen.getByTestId("validation-errors");
    expect(errorList).toBeDefined();
    expect(screen.getByText("line 1: unexpected token")).toBeDefined();
    expect(screen.getByText("line 3: unknown character")).toBeDefined();
  });
});
