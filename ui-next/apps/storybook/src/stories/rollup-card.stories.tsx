import { RollupCard } from "@gcsim/viewer";
import type { Meta, StoryObj } from "@storybook/react";

const meta = {
  title: "Viewer/RollupCard",
  component: RollupCard,
  tags: ["autodocs"],
} satisfies Meta<typeof RollupCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const DPS: Story = {
  args: {
    label: "DPS",
    stat: { min: 35000, max: 65000, mean: 50250.5, sd: 4200.3 },
  },
};

export const Duration: Story = {
  args: {
    label: "Duration (frames)",
    stat: { min: 85, max: 105, mean: 95.2, sd: 3.1 },
  },
};

export const NoData: Story = {
  args: {
    label: "No Data",
    stat: undefined,
  },
};

export const ZeroValues: Story = {
  args: {
    label: "Zero Stats",
    stat: { min: 0, max: 0, mean: 0, sd: 0 },
  },
};

export const MultipleCards: Story = {
  args: { label: "DPS" },
  render: () => (
    <div className="flex flex-wrap gap-3">
      <RollupCard label="DPS" stat={{ min: 35000, max: 65000, mean: 50250, sd: 4200 }} />
      <RollupCard label="Duration" stat={{ min: 85, max: 105, mean: 95.2, sd: 3.1 }} />
      <RollupCard label="EPS" stat={{ min: 1.2, max: 3.5, mean: 2.1, sd: 0.4 }} />
    </div>
  ),
};
