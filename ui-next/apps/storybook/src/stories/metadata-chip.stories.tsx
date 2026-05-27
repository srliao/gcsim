import { MetadataChip } from "@gcsim/viewer";
import type { Meta, StoryObj } from "@storybook/react";

const meta = {
  title: "Viewer/MetadataChip",
  component: MetadataChip,
  tags: ["autodocs"],
} satisfies Meta<typeof MetadataChip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Neutral: Story = {
  args: {
    label: "iter",
    value: "1,000",
  },
};

export const NeutralMono: Story = {
  args: {
    label: "ver",
    value: "2.5.0",
    mono: true,
  },
};

export const Accent: Story = {
  args: {
    label: "mode",
    value: "SL",
    tone: "accent",
  },
};

export const Info: Story = {
  args: {
    label: "build",
    value: "2026-03-19",
    tone: "info",
    mono: true,
  },
};

export const MetadataStrip: Story = {
  args: { label: "iter", value: "1,000" },
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      <MetadataChip label="iter" value="1,000" mono />
      <MetadataChip label="mode" value="SL" tone="accent" />
      <MetadataChip label="ver" value="2.5.0" mono tone="info" />
      <MetadataChip label="build" value="2026-03-19" mono />
    </div>
  ),
};
