import { CumulativeDamage } from "@gcsim/viewer";
import type { Meta, StoryObj } from "@storybook/react";

const meta = {
  title: "Viewer/Charts/CumulativeDamage",
  component: CumulativeDamage,
  tags: ["autodocs"],
} satisfies Meta<typeof CumulativeDamage>;

export default meta;
type Story = StoryObj<typeof meta>;

const mockCumuData = {
  bucket_size: 60,
  targets: {
    "target-1": {
      overall: {
        min: [0, 2500, 10000, 24000, 44000, 70000, 100000, 135000, 175000, 220000],
        max: [5000, 17000, 37000, 67000, 107000, 155000, 210000, 268000, 328000, 390000],
        q1: [1000, 6000, 16000, 32000, 55000, 85000, 120000, 160000, 205000, 255000],
        q2: [2500, 10000, 24000, 46000, 76000, 112000, 155000, 200000, 250000, 305000],
        q3: [4000, 14000, 32000, 60000, 96000, 140000, 190000, 245000, 305000, 365000],
      },
    },
  },
};

export const Default: Story = {
  args: {
    data: mockCumuData,
    targetId: "target-1",
  },
};

export const NoData: Story = {
  args: {
    data: undefined,
  },
};
