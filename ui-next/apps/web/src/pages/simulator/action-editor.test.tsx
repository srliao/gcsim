import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useSimulatorStore } from "../../stores/simulator-store";

vi.mock("@gcsim/editor", () => ({
  Editor: ({
    value,
    onChange,
    readOnly,
    ...props
  }: {
    value: string;
    onChange?: (v: string) => void;
    readOnly?: boolean;
    className?: string;
  }) => (
    <textarea
      data-testid="mock-editor"
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      readOnly={readOnly}
      {...props}
    />
  ),
}));

import { ActionEditor } from "./action-editor";

afterEach(cleanup);

beforeEach(() => {
  useSimulatorStore.setState({ config: "" });
});

describe("ActionEditor", () => {
  it("renders Action List heading", () => {
    render(<ActionEditor />);
    expect(screen.getByText("Action List")).toBeDefined();
  });

  it("renders editor component", () => {
    render(<ActionEditor />);
    expect(screen.getByTestId("mock-editor")).toBeDefined();
  });

  it("passes config from store to editor", () => {
    useSimulatorStore.setState({ config: "bennett attack;" });
    render(<ActionEditor />);
    const editor = screen.getByTestId("mock-editor") as HTMLTextAreaElement;
    expect(editor.value).toBe("bennett attack;");
  });

  it("toggle button shows Read Only initially and switches to Edit", () => {
    render(<ActionEditor />);
    const button = screen.getByRole("button", { name: "Read Only" });
    expect(button).toBeDefined();

    fireEvent.click(button);
    expect(screen.getByRole("button", { name: "Edit" })).toBeDefined();

    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    expect(screen.getByRole("button", { name: "Read Only" })).toBeDefined();
  });

  it("editor is not read-only by default", () => {
    render(<ActionEditor />);
    const editor = screen.getByTestId("mock-editor") as HTMLTextAreaElement;
    expect(editor.readOnly).toBe(false);
  });

  it("editor becomes read-only when toggle is clicked", () => {
    render(<ActionEditor />);
    fireEvent.click(screen.getByRole("button", { name: "Read Only" }));
    const editor = screen.getByTestId("mock-editor") as HTMLTextAreaElement;
    expect(editor.readOnly).toBe(true);
  });
});
