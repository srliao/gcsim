import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { UploadSample } from "./upload";

// Mock @gcsim/viewer to avoid deep dependency chain
vi.mock("@gcsim/viewer", () => ({
  EventLog: () => <div data-testid="event-log">mock event log</div>,
  transformEvents: vi.fn().mockReturnValue([]),
  resolveStatusDurations: vi.fn().mockReturnValue([]),
  trackActiveCharacter: vi.fn().mockReturnValue(new Map()),
  groupByFrame: vi.fn().mockReturnValue([]),
}));

describe("UploadSample", () => {
  it("renders heading", () => {
    render(<UploadSample />);
    expect(screen.getByRole("heading", { name: "Upload Sample" })).toBeInTheDocument();
  });

  it("renders file upload input", () => {
    render(<UploadSample />);
    const input = screen.getByTestId("file-input");
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute("type", "file");
    expect(input).toHaveAttribute("accept", ".json");
  });
});
