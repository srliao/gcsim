import { FrameTrack, type FrameTrackEvent } from "@gcsim/viewer";
import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";

const meta = {
  title: "Viewer/Sample/FrameTrack",
  component: FrameTrack,
  tags: ["autodocs"],
} satisfies Meta<typeof FrameTrack>;

export default meta;
type Story = StoryObj<typeof meta>;

const sampleEvents: FrameTrackEvent[] = [
  { start: 0, length: 60, row: 0, element: "pyro", label: "Hu Tao N1" },
  { start: 70, length: 30, row: 0, element: "pyro", label: "Hu Tao N2" },
  { start: 110, length: 25, row: 0, element: "pyro", label: "Hu Tao N3" },
  { start: 140, length: 80, row: 0, element: "pyro", label: "Hu Tao E" },
  { start: 240, length: 200, row: 0, element: "pyro", label: "Hu Tao Q" },
  { start: 80, length: 90, row: 1, element: "hydro", label: "Xingqiu Q" },
  { start: 200, length: 60, row: 1, element: "hydro", label: "Xingqiu E" },
  { start: 350, length: 35, row: 1, element: "hydro", label: "Xingqiu N1" },
  { start: 300, length: 180, row: 2, element: "electro", label: "Raiden Q" },
  { start: 500, length: 40, row: 2, element: "electro", label: "Raiden E" },
  { start: 0, length: 90, row: 3, element: "geo", label: "Zhongli Hold" },
  { start: 420, length: 30, row: 3, element: "geo", label: "Zhongli N1" },
];

export const Default: Story = {
  args: {
    frames: 600,
    cursor: 200,
    events: sampleEvents,
  },
};

export const Empty: Story = {
  args: {
    frames: 600,
    cursor: 0,
    events: [],
  },
};

export const TallTrack: Story = {
  args: {
    frames: 600,
    cursor: 300,
    events: sampleEvents,
    height: 220,
  },
};

const InteractiveImpl = () => {
  const [cursor, setCursor] = useState(0);
  return (
    <div className="space-y-3">
      <FrameTrack frames={600} cursor={cursor} events={sampleEvents} onCursorChange={setCursor} />
      <p className="font-mono text-xs text-[var(--fg-2)]">
        Cursor: {cursor} / 600 — click the track to move it.
      </p>
    </div>
  );
};

export const Interactive: Story = {
  render: () => <InteractiveImpl />,
  args: {
    frames: 600,
    cursor: 0,
    events: [],
  },
};
