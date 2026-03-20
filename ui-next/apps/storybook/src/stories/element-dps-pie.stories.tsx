import { ElementDpsPie } from "@gcsim/viewer";
import type { Meta, StoryObj } from "@storybook/react";

const meta = {
  title: "Viewer/Charts/ElementDpsPie",
  component: ElementDpsPie,
  tags: ["autodocs"],
} satisfies Meta<typeof ElementDpsPie>;

export default meta;
type Story = StoryObj<typeof meta>;

const mockElementDps = {
  pyro: { mean: 30000 },
  hydro: { mean: 14000 },
  physical: { mean: 6250 },
};

export const Default: Story = {
  args: {
    elementDps: mockElementDps,
  },
};

export const NoData: Story = {
  args: {
    elementDps: undefined,
  },
};
