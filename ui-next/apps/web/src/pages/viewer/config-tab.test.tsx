import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ConfigTab } from "./config-tab";

vi.mock("@gcsim/editor", () => ({
  Editor: ({ value, readOnly }: { value: string; readOnly: boolean }) => (
    <div data-testid="mock-editor" data-readonly={readOnly} data-value={value} />
  ),
}));

vi.mock("@gcsim/primitives", () => ({
  Button: ({
    children,
    ...props
  }: { children: React.ReactNode } & React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button type="button" {...props}>
      {children}
    </button>
  ),
}));

const mockResults = {
  config_file: 'bennett add weapon="aquilafavonia" refine=1;',
} as { config_file: string };

describe("ConfigTab", () => {
  it("renders editor in read-only mode initially", () => {
    render(<ConfigTab results={mockResults} />);
    const editor = screen.getByTestId("mock-editor");
    expect(editor).toHaveAttribute("data-readonly", "true");
  });

  it("shows Edit button", () => {
    render(<ConfigTab results={mockResults} />);
    expect(screen.getByRole("button", { name: "Edit" })).toBeInTheDocument();
  });

  it("clicking Edit makes editor editable and shows Re-run button", () => {
    render(<ConfigTab results={mockResults} />);

    fireEvent.click(screen.getByRole("button", { name: "Edit" }));

    const editor = screen.getByTestId("mock-editor");
    expect(editor).toHaveAttribute("data-readonly", "false");
    expect(screen.getByRole("button", { name: "Re-run" })).toBeInTheDocument();
  });

  it("passes config_file value to editor", () => {
    render(<ConfigTab results={mockResults} />);
    const editor = screen.getByTestId("mock-editor");
    expect(editor).toHaveAttribute("data-value", mockResults.config_file);
  });

  it("Re-run button logs intent", () => {
    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    render(<ConfigTab results={mockResults} />);
    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    fireEvent.click(screen.getByRole("button", { name: "Re-run" }));

    expect(consoleSpy).toHaveBeenCalledWith("Re-run with config:", mockResults.config_file);
    consoleSpy.mockRestore();
  });
});
