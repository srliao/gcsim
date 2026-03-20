import { DamageTimeline } from "@gcsim/viewer";
import type { Meta, StoryObj } from "@storybook/react";

const meta = {
  title: "Viewer/Charts/DamageTimeline",
  component: DamageTimeline,
  tags: ["autodocs"],
} satisfies Meta<typeof DamageTimeline>;

export default meta;
type Story = StoryObj<typeof meta>;

const mockBuckets = {
  bucket_size: 60,
  buckets: [
    { min: 0, max: 5000, mean: 2500, sd: 800 },
    { min: 3000, max: 12000, mean: 7500, sd: 1500 },
    { min: 8000, max: 20000, mean: 14000, sd: 2000 },
    { min: 15000, max: 30000, mean: 22000, sd: 2500 },
    { min: 20000, max: 40000, mean: 30000, sd: 3000 },
    { min: 25000, max: 48000, mean: 36000, sd: 3200 },
    { min: 28000, max: 52000, mean: 40000, sd: 3500 },
    { min: 30000, max: 55000, mean: 42500, sd: 3800 },
    { min: 32000, max: 58000, mean: 45000, sd: 4000 },
    { min: 33000, max: 60000, mean: 47000, sd: 4200 },
  ],
};

export const Default: Story = {
  args: {
    buckets: mockBuckets,
  },
};

export const NoData: Story = {
  args: {
    buckets: undefined,
  },
};
