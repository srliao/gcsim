import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { FrameTrack, type FrameTrackEvent } from "./frame-track.js";

const events: FrameTrackEvent[] = [
  { start: 0, length: 60, row: 0, element: "pyro", label: "Hu Tao N1" },
  { start: 60, length: 30, row: 0, element: "pyro", label: "Hu Tao N2" },
  { start: 100, length: 90, row: 1, element: "hydro", label: "Xingqiu E" },
  { start: 200, length: 180, row: 2, element: "electro", label: "Raiden Q" },
  { start: 400, length: 40, row: 3, element: "geo", label: "Zhongli Hold" },
];

describe("FrameTrack", () => {
  it("renders 4 lanes regardless of which rows have events", () => {
    render(<FrameTrack frames={600} cursor={0} events={[]} />);
    const lanes = screen.getAllByTestId(/^frame-track-lane-/);
    expect(lanes).toHaveLength(4);
  });

  it("renders one rect per event with data-row and data-element", () => {
    render(<FrameTrack frames={600} cursor={0} events={events} />);
    const eventEls = screen.getAllByTestId("frame-track-event");
    expect(eventEls).toHaveLength(events.length);
    expect(eventEls[0]).toHaveAttribute("data-row", "0");
    expect(eventEls[0]).toHaveAttribute("data-element", "pyro");
    expect(eventEls[3]).toHaveAttribute("data-row", "2");
    expect(eventEls[3]).toHaveAttribute("data-element", "electro");
  });

  it("positions events as percentages of total frames", () => {
    render(<FrameTrack frames={600} cursor={0} events={events} />);
    const eventEls = screen.getAllByTestId("frame-track-event");

    // First event: start=0, length=60 of 600 frames → x="0%", width="10%"
    expect(eventEls[0]).toHaveAttribute("x", "0%");
    expect(eventEls[0]).toHaveAttribute("width", "10%");

    // Third event: start=100, length=90 of 600 → x="16.6...%", width="15%"
    expect(eventEls[2]).toHaveAttribute("x", `${(100 / 600) * 100}%`);
    expect(eventEls[2]).toHaveAttribute("width", `${(90 / 600) * 100}%`);

    // Last event: start=400, length=40 → x="66.6...%", width="6.6...%"
    expect(eventEls[4]).toHaveAttribute("x", `${(400 / 600) * 100}%`);
    expect(eventEls[4]).toHaveAttribute("width", `${(40 / 600) * 100}%`);
  });

  it("renders cursor line at the correct percentage", () => {
    render(<FrameTrack frames={600} cursor={150} events={events} />);
    const cursor = screen.getByTestId("frame-track-cursor");
    expect(cursor).toHaveAttribute("x1", `${(150 / 600) * 100}%`);
    expect(cursor).toHaveAttribute("x2", `${(150 / 600) * 100}%`);
  });

  it("clamps cursor to [0, frames]", () => {
    const { rerender } = render(<FrameTrack frames={600} cursor={-50} events={[]} />);
    expect(screen.getByTestId("frame-track-cursor")).toHaveAttribute("x1", "0%");

    rerender(<FrameTrack frames={600} cursor={1200} events={[]} />);
    expect(screen.getByTestId("frame-track-cursor")).toHaveAttribute("x1", "100%");
  });

  it("calls onCursorChange when the surface is clicked", () => {
    const onCursorChange = vi.fn();
    render(<FrameTrack frames={600} cursor={0} events={events} onCursorChange={onCursorChange} />);
    const surface = screen.getByTestId("frame-track-surface");
    // jsdom doesn't populate getBoundingClientRect with width; the
    // event handler must guard. We mock the rect's bounding-box so the
    // ratio math has a finite width to work with.
    Object.defineProperty(surface, "getBoundingClientRect", {
      configurable: true,
      value: () => ({ left: 0, width: 600, top: 0, height: 120, right: 600, bottom: 120 }),
    });
    fireEvent.click(surface, { clientX: 300, clientY: 60 });
    expect(onCursorChange).toHaveBeenCalledTimes(1);
    // Should be ~300 (half-way → frame 300)
    expect(onCursorChange.mock.calls[0][0]).toBeGreaterThanOrEqual(295);
    expect(onCursorChange.mock.calls[0][0]).toBeLessThanOrEqual(305);
  });

  it("does not call onCursorChange when handler is omitted", () => {
    render(<FrameTrack frames={600} cursor={0} events={events} />);
    const surface = screen.getByTestId("frame-track-surface");
    fireEvent.click(surface, { clientX: 100 });
    // No throw, no handler — just ensure the click is harmless.
    expect(surface).toBeInTheDocument();
  });

  it("places events in the correct lane via data-row attribute", () => {
    render(<FrameTrack frames={600} cursor={0} events={events} />);
    // Find the lane with row=1 and assert its event count
    const lane1 = screen.getByTestId("frame-track-lane-1");
    const lane1Events = within(lane1).queryAllByTestId("frame-track-event");
    expect(lane1Events).toHaveLength(1);
    expect(lane1Events[0]).toHaveAttribute("data-element", "hydro");
  });

  it("renders empty state cleanly when events is empty", () => {
    render(<FrameTrack frames={600} cursor={0} events={[]} />);
    expect(screen.getByTestId("frame-track")).toBeInTheDocument();
    expect(screen.queryAllByTestId("frame-track-event")).toHaveLength(0);
    // 4 lanes still render
    expect(screen.getAllByTestId(/^frame-track-lane-/)).toHaveLength(4);
  });

  it("uses custom height when provided", () => {
    render(<FrameTrack frames={600} cursor={0} events={events} height={200} />);
    const svg = screen.getByTestId("frame-track-svg");
    expect(svg).toHaveAttribute("height", "200");
  });
});
